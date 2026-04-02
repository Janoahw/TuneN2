import { prisma } from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { NotFoundError, UnauthorizedError } from "../utils/errors.js";

function sanitizeUser(user: Record<string, unknown>) {
  const { passwordHash: _, ...sanitized } = user;
  return sanitized;
}

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return sanitizeUser(user);
  }

  static async updateProfile(
    userId: string,
    data: { displayName?: string; avatarUrl?: string },
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return sanitizeUser(updated);
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError(
        "Cannot change password for social auth accounts",
      );
    }

    const valid = await comparePassword(currentPassword, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
