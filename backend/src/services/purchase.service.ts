import { prisma } from '../config/database.js';
import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, ConflictError, ForbiddenError, AppError } from '../utils/errors.js';

const PLATFORM_FEE_PERCENT = 20; // 20% platform fee

export class PurchaseService {
  /**
   * Create a Stripe PaymentIntent for a song purchase.
   * Uses destination charges to split payment: 80% to artist, 20% platform.
   */
  static async createPaymentIntent(buyerId: string, songId: string) {
    // 1. Fetch song + artist
    const song = await prisma.song.findUnique({
      where: { id: songId },
      include: {
        artist: { select: { id: true, stripeAccountId: true, userId: true } },
      },
    });

    if (!song || song.status !== 'active') {
      throw new NotFoundError('Song not found or not available for purchase');
    }

    // Can't buy your own song
    if (song.artist.userId === buyerId) {
      throw new ForbiddenError('You cannot purchase your own song');
    }

    // Free songs don't need payment
    if (song.isFree) {
      return this.handleFreeSong(buyerId, song);
    }

    // Check if already purchased
    const existing = await prisma.purchase.findUnique({
      where: { buyerId_songId: { buyerId, songId } },
    });
    if (existing && existing.status === 'completed') {
      throw new ConflictError('You already own this song');
    }

    // Artist must have Stripe Connect account
    if (!song.artist.stripeAccountId) {
      throw new AppError(
        'This artist has not set up payments yet',
        400,
        'ARTIST_PAYMENTS_NOT_SETUP',
      );
    }

    // 2. Get or create Stripe customer
    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) throw new NotFoundError('User not found');

    let customerId = buyer.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: buyer.email,
        metadata: { userId: buyerId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: buyerId },
        data: { stripeCustomerId: customerId },
      });
    }

    // 3. Calculate amounts (in cents)
    const amountCents = Math.round(Number(song.price) * 100);
    const platformFeeCents = Math.round((amountCents * PLATFORM_FEE_PERCENT) / 100);

    // 4. Create PaymentIntent with destination charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      customer: customerId,
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: song.artist.stripeAccountId,
      },
      metadata: {
        buyerId,
        songId,
        artistId: song.artistId,
        type: 'song_purchase',
      },
    });

    // 5. Create pending purchase record
    if (existing) {
      await prisma.purchase.update({
        where: { id: existing.id },
        data: {
          stripePaymentId: paymentIntent.id,
          status: 'pending',
          amount: Number(song.price),
          platformFee: Number(song.price) * (PLATFORM_FEE_PERCENT / 100),
          artistEarnings: Number(song.price) * (1 - PLATFORM_FEE_PERCENT / 100),
        },
      });
    } else {
      await prisma.purchase.create({
        data: {
          buyerId,
          songId,
          artistId: song.artistId,
          amount: Number(song.price),
          platformFee: Number(song.price) * (PLATFORM_FEE_PERCENT / 100),
          artistEarnings: Number(song.price) * (1 - PLATFORM_FEE_PERCENT / 100),
          stripePaymentId: paymentIntent.id,
          status: 'pending',
        },
      });
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: Number(song.price),
      songTitle: song.title,
    };
  }

  /**
   * Handle free song "purchase" — create completed purchase immediately.
   */
  private static async handleFreeSong(
    buyerId: string,
    song: {
      id: string;
      artistId: string;
      title: string;
      price: any;
    },
  ) {
    const existing = await prisma.purchase.findUnique({
      where: { buyerId_songId: { buyerId, songId: song.id } },
    });
    if (existing && existing.status === 'completed') {
      throw new ConflictError('You already own this song');
    }

    const purchase = await prisma.purchase.upsert({
      where: { buyerId_songId: { buyerId, songId: song.id } },
      create: {
        buyerId,
        songId: song.id,
        artistId: song.artistId,
        amount: 0,
        platformFee: 0,
        artistEarnings: 0,
        stripePaymentId: `free_${Date.now()}`,
        status: 'completed',
      },
      update: { status: 'completed' },
    });

    return {
      clientSecret: null,
      paymentIntentId: null,
      amount: 0,
      songTitle: song.title,
      purchased: true,
      purchaseId: purchase.id,
    };
  }

  /**
   * Handle successful payment webhook.
   * Atomic: create purchase record + credit artist wallet.
   */
  static async handlePaymentSuccess(paymentIntentId: string) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const { buyerId, songId, artistId } = paymentIntent.metadata;

    if (!buyerId || !songId || !artistId) {
      logger.warn({ paymentIntentId }, 'Missing metadata on PaymentIntent');
      return;
    }

    const amountDecimal = paymentIntent.amount / 100;
    const platformFee = amountDecimal * (PLATFORM_FEE_PERCENT / 100);
    const artistEarnings = amountDecimal - platformFee;

    let purchaseData: { buyerId: string; songId: string; songTitle: string; amount: number } | null = null;

    await prisma.$transaction(async (tx) => {
      // Get song details for notification
      const song = await tx.song.findUnique({
        where: { id: songId },
        select: { title: true },
      });

      if (song) {
        purchaseData = { buyerId, songId, songTitle: song.title, amount: amountDecimal };
      }

      // 1. Update/create purchase as completed
      await tx.purchase.upsert({
        where: { buyerId_songId: { buyerId, songId } },
        create: {
          buyerId,
          songId,
          artistId,
          amount: amountDecimal,
          platformFee,
          artistEarnings,
          stripePaymentId: paymentIntentId,
          status: 'completed',
        },
        update: {
          status: 'completed',
          amount: amountDecimal,
          platformFee,
          artistEarnings,
          stripePaymentId: paymentIntentId,
        },
      });

      // 2. Upsert wallet + credit balance
      const wallet = await tx.wallet.upsert({
        where: { artistId },
        create: {
          artistId,
          balance: artistEarnings,
          totalEarned: artistEarnings,
        },
        update: {
          balance: { increment: artistEarnings },
          totalEarned: { increment: artistEarnings },
        },
      });

      // 3. Log wallet transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'song_sale',
          amount: amountDecimal,
          fee: platformFee,
          netAmount: artistEarnings,
          referenceId: songId,
          referenceType: 'purchase',
          stripeTransferId: paymentIntent.latest_charge as string | null,
          status: 'completed',
        },
      });
    });

    logger.info(
      { paymentIntentId, buyerId, songId, artistEarnings },
      'Purchase completed and wallet credited',
    );

    // Send purchase confirmation notification to buyer
    if (purchaseData) {
      const { NotificationService } = await import('./notification.service.js');
      NotificationService.notifyPurchase({
        buyerId: purchaseData.buyerId,
        artistId,
        songId: purchaseData.songId,
        songTitle: purchaseData.songTitle,
        amount: purchaseData.amount,
      }).catch((err) => {
        logger.error({ err, buyerId }, 'Failed to send purchase notification');
      });
    }
  }

  /**
   * Handle failed payment webhook.
   */
  static async handlePaymentFailed(paymentIntentId: string) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const { buyerId, songId } = paymentIntent.metadata;

    if (!buyerId || !songId) return;

    await prisma.purchase.updateMany({
      where: {
        buyerId,
        songId,
        stripePaymentId: paymentIntentId,
        status: 'pending',
      },
      data: { status: 'failed' },
    });

    logger.info({ paymentIntentId, buyerId, songId }, 'Purchase payment failed');
  }

  /**
   * Check if a user owns a song (completed purchase or free).
   */
  static async checkOwnership(userId: string, songId: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { buyerId_songId: { buyerId: userId, songId } },
    });
    return purchase?.status === 'completed';
  }

  /**
   * Get download URL for a purchased song.
   * Returns a signed CloudFront URL (or S3 presigned URL in dev).
   */
  static async getDownloadUrl(userId: string, songId: string) {
    // Verify ownership
    const owns = await this.checkOwnership(userId, songId);
    if (!owns) {
      throw new ForbiddenError('You must purchase this song before downloading');
    }

    const song = await prisma.song.findUnique({
      where: { id: songId },
      select: { id: true, title: true, audioUrl: true, streamUrl: true },
    });
    if (!song) throw new NotFoundError('Song not found');

    // Prefer original audio for download, fall back to stream
    const fileKey = song.audioUrl;

    let downloadUrl: string;

    if (
      env.AWS_CLOUDFRONT_DOMAIN &&
      env.AWS_CLOUDFRONT_KEY_PAIR_ID &&
      env.AWS_CLOUDFRONT_PRIVATE_KEY
    ) {
      // Production: CloudFront signed URL
      const { getSignedUrl } = await import('@aws-sdk/cloudfront-signer');
      const cfUrl = `https://${env.AWS_CLOUDFRONT_DOMAIN}/${fileKey}`;
      downloadUrl = getSignedUrl({
        url: cfUrl,
        keyPairId: env.AWS_CLOUDFRONT_KEY_PAIR_ID,
        privateKey: env.AWS_CLOUDFRONT_PRIVATE_KEY,
        dateLessThan: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1hr
      });
    } else {
      // Dev: S3 presigned URL
      const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
      const { getSignedUrl: getS3SignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const s3 = new S3Client({ region: env.AWS_REGION });
      const command = new GetObjectCommand({
        Bucket: env.AWS_S3_AUDIO_BUCKET!,
        Key: fileKey,
      });
      downloadUrl = await getS3SignedUrl(s3, command, { expiresIn: 3600 });
    }

    // Log the download
    await prisma.download.create({
      data: { userId, songId },
    });

    return { downloadUrl, songTitle: song.title };
  }

  /**
   * Get user's purchase history.
   */
  static async getUserPurchases(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.purchase.findMany({
        where: { buyerId: userId, status: 'completed' },
        include: {
          song: {
            select: {
              id: true,
              title: true,
              coverArtUrl: true,
              durationSeconds: true,
              price: true,
              isFree: true,
              artist: {
                select: {
                  artistName: true,
                  user: { select: { displayName: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.purchase.count({
        where: { buyerId: userId, status: 'completed' },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: skip + limit < total,
      hasPrev: page > 1,
    };
  }

  /**
   * Get user's download history.
   */
  static async getUserDownloads(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.download.findMany({
        where: { userId },
        include: {
          song: {
            select: {
              id: true,
              title: true,
              coverArtUrl: true,
              durationSeconds: true,
              artist: {
                select: {
                  artistName: true,
                  user: { select: { displayName: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.download.count({ where: { userId } }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: skip + limit < total,
      hasPrev: page > 1,
    };
  }
}
