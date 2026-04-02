import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { redis } from "../config/redis.js";
import { env } from "../config/env.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import {
  generateTokenPair,
  verifyRefreshToken,
  type TokenPayload,
} from "../utils/tokens.js";
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from "../utils/errors.js";
import { logger } from "../utils/logger.js";

import { sendVerificationEmail } from "./email.service.js";

type User = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  authProvider: string;
  emailVerified: boolean;
  isArtist: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// 30 days in seconds
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60;

function sanitizeUser(
  user: User & { passwordHash?: string | null },
): Omit<User, "passwordHash"> {
  const { passwordHash: _, ...sanitized } = user as User & {
    passwordHash?: string | null;
  };
  return sanitized;
}

function buildTokenPayload(user: {
  id: string;
  email: string;
  isArtist: boolean;
  isAdmin: boolean;
}): TokenPayload {
  return {
    userId: user.id,
    email: user.email,
    isArtist: user.isArtist,
    isAdmin: user.isAdmin,
  };
}

export class AuthService {
  static async signup(data: {
    email: string;
    password: string;
    displayName: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        displayName: data.displayName,
      },
    });

    const tokens = generateTokenPair(buildTokenPayload(user));

    return { user: sanitizeUser(user), tokens };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (user.isBanned) {
      throw new ForbiddenError("Account suspended");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await comparePassword(data.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const tokens = generateTokenPair(buildTokenPayload(user));

    return { user: sanitizeUser(user), tokens };
  }

  static async refreshToken(refreshToken: string) {
    const blacklisted = await redis.get(`bl:${refreshToken}`);

    if (blacklisted) {
      throw new UnauthorizedError("Token revoked");
    }

    const payload = verifyRefreshToken(refreshToken);

    const newTokens = generateTokenPair({
      userId: payload.userId,
      email: payload.email,
      isArtist: payload.isArtist,
      isAdmin: payload.isAdmin,
    });

    // Blacklist the old refresh token
    await redis.set(`bl:${refreshToken}`, "1", "EX", REFRESH_TOKEN_TTL);

    return newTokens;
  }

  static async logout(refreshToken: string) {
    await redis.set(`bl:${refreshToken}`, "1", "EX", REFRESH_TOKEN_TTL);
  }

  static async verifyEmail(token: string) {
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET!) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired verification token");
    }

    if (decoded.purpose !== "email-verify") {
      throw new UnauthorizedError("Invalid verification token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid verification token");
    }

    if (user.emailVerified) {
      return sanitizeUser(user);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    return sanitizeUser(updated);
  }

  static async resendVerification(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (user.emailVerified) {
      throw new ConflictError("Email already verified");
    }

    const verificationToken = jwt.sign(
      { userId: user.id, purpose: "email-verify" },
      env.JWT_ACCESS_SECRET!,
      { expiresIn: "24h" } as SignOptions,
    );

    // Send verification email (fire-and-forget)
    sendVerificationEmail(user.email, verificationToken).catch((err) => {
      logger.error({ err, userId: user.id }, "Failed to resend verification email");
    });
  }
}
