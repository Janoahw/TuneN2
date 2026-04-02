import jwt from "jsonwebtoken";
import { createPublicKey, type JsonWebKeyInput } from "node:crypto";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { generateTokenPair, type TokenPayload } from "../utils/tokens.js";
import { UnauthorizedError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

type SanitizedUser = {
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

function sanitizeUser(
  user: SanitizedUser & { passwordHash?: string | null },
): SanitizedUser {
  const { passwordHash: _, ...sanitized } = user as SanitizedUser & {
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

async function findOrCreateSocialUser(
  provider: string,
  providerId: string,
  email: string,
  displayName: string,
) {
  // Look up by provider + provider ID first
  let user = await prisma.user.findFirst({
    where: { authProvider: provider, authProviderId: providerId },
  });

  if (user) {
    return user;
  }

  // Look up by email and link if unlinked
  user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (user.authProvider === "email" && !user.authProviderId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          authProvider: provider,
          authProviderId: providerId,
          emailVerified: true,
        },
      });
    }
    return user;
  }

  // Create new user
  user = await prisma.user.create({
    data: {
      email,
      displayName,
      authProvider: provider,
      authProviderId: providerId,
      emailVerified: true,
    },
  });

  return user;
}

interface GoogleTokenInfo {
  sub: string;
  email: string;
  name?: string;
  email_verified?: string;
  aud?: string;
}

export class SocialAuthService {
  static async authenticateWithGoogle(idToken: string) {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );

    if (!res.ok) {
      throw new UnauthorizedError("Invalid Google ID token");
    }

    const payload = (await res.json()) as GoogleTokenInfo;

    if (env.GOOGLE_CLIENT_ID && payload.aud !== env.GOOGLE_CLIENT_ID) {
      throw new UnauthorizedError("Google token audience mismatch");
    }

    const { sub, email, name } = payload;

    if (!email || !sub) {
      throw new UnauthorizedError("Invalid Google token payload");
    }

    const user = await findOrCreateSocialUser(
      "google",
      sub,
      email,
      name || email.split("@")[0],
    );

    if (user.isBanned) {
      throw new UnauthorizedError("Account suspended");
    }

    const tokens = generateTokenPair(buildTokenPayload(user));

    return { user: sanitizeUser(user), tokens };
  }

  static async authenticateWithApple(idToken: string) {
    // Fetch Apple's public JWKS
    const jwksRes = await fetch("https://appleid.apple.com/auth/keys");

    if (!jwksRes.ok) {
      logger.error("Failed to fetch Apple JWKS");
      throw new UnauthorizedError("Unable to verify Apple ID token");
    }

    const jwks = (await jwksRes.json()) as { keys: Array<Record<string, unknown>> };

    // Decode the token header to find the key ID
    const decoded = jwt.decode(idToken, { complete: true });

    if (!decoded || typeof decoded === "string") {
      throw new UnauthorizedError("Invalid Apple ID token");
    }

    const kid = decoded.header.kid;
    const appleKey = jwks.keys.find(
      (k: Record<string, unknown>) => k.kid === kid,
    );

    if (!appleKey) {
      throw new UnauthorizedError("Apple signing key not found");
    }

    // Convert JWK to PEM for verification
    const publicKey = createPublicKey({ key: appleKey as JsonWebKeyInput["key"], format: "jwk" });

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(idToken, publicKey, {
        algorithms: ["RS256"],
        issuer: "https://appleid.apple.com",
      }) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired Apple ID token");
    }

    const { sub, email } = payload;

    if (!email || !sub) {
      throw new UnauthorizedError("Invalid Apple token payload");
    }

    const user = await findOrCreateSocialUser(
      "apple",
      sub,
      email,
      email.split("@")[0],
    );

    if (user.isBanned) {
      throw new UnauthorizedError("Account suspended");
    }

    const tokens = generateTokenPair(buildTokenPayload(user));

    return { user: sanitizeUser(user), tokens };
  }
}
