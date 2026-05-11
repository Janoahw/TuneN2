import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

export class DeviceService {
  /**
   * Register a device token for push notifications
   */
  static async registerToken(params: {
    userId: string;
    token: string;
    platform: 'ios' | 'android';
  }) {
    try {
      const device = await prisma.deviceToken.upsert({
        where: {
          userId_token: {
            userId: params.userId,
            token: params.token,
          },
        },
        update: {
          platform: params.platform,
          updatedAt: new Date(),
        },
        create: {
          userId: params.userId,
          token: params.token,
          platform: params.platform,
        },
      });

      logger.info({ userId: params.userId, platform: params.platform }, 'Device token registered');
      return device;
    } catch (error) {
      logger.error({ error, params }, 'Failed to register device token');
      throw error;
    }
  }

  /**
   * Remove a device token (logout)
   */
  static async removeToken(params: { userId: string; token: string }) {
    try {
      await prisma.deviceToken.deleteMany({
        where: {
          userId: params.userId,
          token: params.token,
        },
      });

      logger.info({ userId: params.userId }, 'Device token removed');
    } catch (error) {
      logger.error({ error, params }, 'Failed to remove device token');
      throw error;
    }
  }

  /**
   * Remove all device tokens for a user (logout from all devices)
   */
  static async removeAllTokens(userId: string) {
    try {
      await prisma.deviceToken.deleteMany({
        where: { userId },
      });

      logger.info({ userId }, 'All device tokens removed');
    } catch (error) {
      logger.error({ error, userId }, 'Failed to remove all device tokens');
      throw error;
    }
  }
}
