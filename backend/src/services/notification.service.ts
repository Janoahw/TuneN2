import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

export class NotificationService {
  private static expo = new Expo();

  /**
   * Create notification record and send push notification
   */
  static async send(params: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    data?: Record<string, any>;
  }): Promise<void> {
    try {
      // Create notification record
      await prisma.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          title: params.title,
          body: params.body,
          data: params.data,
          isRead: false,
        },
      });

      // Get user's device tokens
      const deviceTokens = await prisma.deviceToken.findMany({
        where: { userId: params.userId },
        select: { token: true },
      });

      if (deviceTokens.length === 0) {
        logger.debug({ userId: params.userId }, 'No device tokens found for user');
        return;
      }

      // Build push messages
      const messages: ExpoPushMessage[] = [];
      for (const device of deviceTokens) {
        if (!Expo.isExpoPushToken(device.token)) {
          logger.warn({ token: device.token }, 'Invalid Expo push token');
          continue;
        }

        messages.push({
          to: device.token,
          sound: 'default',
          title: params.title,
          body: params.body || '',
          data: params.data || {},
        });
      }

      if (messages.length === 0) {
        logger.warn({ userId: params.userId }, 'No valid push tokens found');
        return;
      }

      // Send push notifications in chunks
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          logger.error({ error, chunk }, 'Failed to send push notification chunk');
        }
      }

      // Log any errors from Expo
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          logger.error({ ticket }, 'Push notification error from Expo');
        }
      }
    } catch (error) {
      logger.error({ error, params }, 'Failed to send notification');
    }
  }

  /**
   * Trigger: New song from followed artist
   */
  static async notifyNewSong(params: { artistId: string; songId: string; songTitle: string }) {
    const followers = await prisma.follow.findMany({
      where: { artistId: params.artistId },
      select: { followerId: true },
    });

    const artist = await prisma.artistProfile.findUnique({
      where: { id: params.artistId },
      select: { artistName: true },
    });

    if (!artist) return;

    for (const follower of followers) {
      await this.send({
        userId: follower.followerId,
        type: 'new_release',
        title: `New music from ${artist.artistName}`,
        body: `${artist.artistName} just released "${params.songTitle}"`,
        data: { songId: params.songId, artistId: params.artistId },
      });
    }
  }

  /**
   * Trigger: Purchase confirmation
   */
  static async notifyPurchase(params: {
    buyerId: string;
    artistId: string;
    songId: string;
    songTitle: string;
    amount: number;
  }) {
    const artist = await prisma.artistProfile.findUnique({
      where: { id: params.artistId },
      select: { artistName: true },
    });

    if (!artist) return;

    await this.send({
      userId: params.buyerId,
      type: 'purchase_success',
      title: 'Purchase successful',
      body: `You purchased "${params.songTitle}" by ${artist.artistName} for $${params.amount.toFixed(2)}`,
      data: { songId: params.songId, artistId: params.artistId },
    });
  }

  /**
   * Trigger: Payout processed
   */
  static async notifyPayout(params: { artistId: string; amount: number }) {
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { id: params.artistId },
      select: { userId: true },
    });

    if (!artistProfile) return;

    await this.send({
      userId: artistProfile.userId,
      type: 'payout_processed',
      title: 'Withdrawal processed',
      body: `$${params.amount.toFixed(2)} has been transferred to your bank account`,
      data: { amount: params.amount },
    });
  }

  /**
   * Trigger: Content report action taken
   */
  static async notifyReportAction(params: {
    reporterId: string;
    songTitle: string;
    action: 'removed' | 'dismissed';
  }) {
    const title = params.action === 'removed' ? 'Report upheld' : 'Report reviewed';
    const body =
      params.action === 'removed'
        ? `Content "${params.songTitle}" has been removed following your report`
        : `Your report for "${params.songTitle}" has been reviewed`;

    await this.send({
      userId: params.reporterId,
      type: 'report_action',
      title,
      body,
      data: { action: params.action },
    });
  }

  /**
   * Trigger: Collaboration request (future feature)
   */
  static async notifyCollaboration(params: {
    artistId: string;
    requesterName: string;
    message: string;
  }) {
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { id: params.artistId },
      select: { userId: true },
    });

    if (!artistProfile) return;

    await this.send({
      userId: artistProfile.userId,
      type: 'collaboration_request',
      title: 'New collaboration request',
      body: `${params.requesterName} wants to collaborate with you`,
      data: { message: params.message },
    });
  }
}
