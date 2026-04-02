import crypto from "node:crypto";
import { prisma } from "../config/database.js";
import { hashPassword } from "../utils/password.js";
import { sendPasswordResetEmail } from "./email.service.js";
import { UnauthorizedError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export class PasswordResetService {
  static async requestReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't leak whether the email exists
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    sendPasswordResetEmail(user.email, token).catch((err) => {
      logger.error({ err, userId: user.id }, "Failed to send password reset email");
    });
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      throw new UnauthorizedError("Invalid or expired reset token");
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }
}
