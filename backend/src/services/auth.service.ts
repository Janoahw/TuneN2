import jwt, { type SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateOtp, calculateOtpExpiry } from '../utils/otp.js';
import { generateTokenPair, verifyRefreshToken, type TokenPayload } from '../utils/tokens.js';
import { ConflictError, ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

import { sendOtpEmail } from './email.service.js';

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

function sanitizeUser(user: User & { passwordHash?: string | null }): Omit<User, 'passwordHash'> {
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
  static async signup(data: { email: string; password: string; displayName: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError('Email already registered');
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
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.isBanned) {
      throw new ForbiddenError('Account suspended');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await comparePassword(data.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = generateTokenPair(buildTokenPayload(user));

    return { user: sanitizeUser(user), tokens };
  }

  static async refreshToken(refreshToken: string) {
    const blacklisted = await redis.get(`bl:${refreshToken}`);

    if (blacklisted) {
      throw new UnauthorizedError('Token revoked');
    }

    const payload = verifyRefreshToken(refreshToken);

    // Re-read from DB so role changes (e.g. isArtist upgrade) are reflected in
    // the new token pair immediately, without requiring a full re-login.
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, isArtist: true, isAdmin: true, isBanned: true },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.isBanned) {
      throw new ForbiddenError('Account suspended');
    }

    const newTokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      isArtist: user.isArtist,
      isAdmin: user.isAdmin,
    });

    // Blacklist the old refresh token
    await redis.set(`bl:${refreshToken}`, '1', 'EX', REFRESH_TOKEN_TTL);

    return newTokens;
  }

  static async logout(refreshToken: string) {
    await redis.set(`bl:${refreshToken}`, '1', 'EX', REFRESH_TOKEN_TTL);
  }

  /**
   * Send OTP to user email
   * Generates a new 6-digit code, saves it, and sends via email
   */
  static async sendOtp(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.emailVerified) {
      throw new ConflictError('Email already verified');
    }

    // Generate 6-digit OTP
    const otp = generateOtp();
    const expiresAt = calculateOtpExpiry(10); // 10 minutes

    // Save OTP to database
    await prisma.emailOTP.create({
      data: {
        userId,
        code: otp,
        expiresAt,
      },
    });

    // Send OTP email (fire-and-forget)
    sendOtpEmail(user.email, otp).catch((err) => {
      logger.error({ err, userId }, 'Failed to send OTP email');
    });
  }

  /**
   * Verify OTP code submitted by user
   * Validates code, checks expiry, and marks email as verified
   */
  static async verifyOtp(userId: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.emailVerified) {
      return sanitizeUser(user); // Already verified, return user
    }

    // Find the most recent OTP for this user
    const otp = await prisma.emailOTP.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new UnauthorizedError('No OTP found. Request a new one.');
    }

    // Check if OTP is expired
    if (new Date() > otp.expiresAt) {
      throw new UnauthorizedError('OTP expired. Request a new one.');
    }

    // Check if OTP was already used
    if (otp.usedAt) {
      throw new UnauthorizedError('OTP already used. Request a new one.');
    }

    // Check if OTP code matches
    if (otp.code !== code) {
      // Increment attempts
      await prisma.emailOTP.update({
        where: { id: otp.id },
        data: { attempts: otp.attempts + 1 },
      });

      // Lock after 5 failed attempts
      if (otp.attempts >= 4) {
        throw new UnauthorizedError('Too many failed attempts. Request a new OTP.');
      }

      throw new UnauthorizedError('Invalid OTP. Please try again.');
    }

    // Mark OTP as used
    await prisma.emailOTP.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    // Mark user email as verified
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    return sanitizeUser(updated);
  }

  /**
   * Resend OTP to user email
   * Creates a new OTP and sends it (old OTP becomes invalidated by age)
   */
  static async resendOtp(userId: string) {
    await this.sendOtp(userId); // Reuse sendOtp logic
  }
}
