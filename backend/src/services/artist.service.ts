import { prisma } from '../config/database.js';
import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import { NotFoundError, ConflictError, ForbiddenError, ValidationError } from '../utils/errors.js';

export class ArtistService {
  /**
   * Upgrade a fan to an artist: create Stripe subscription (30-day trial),
   * create ArtistProfile, set User.isArtist = true.
   */
  static async upgradeToArtist(
    userId: string,
    data: {
      artistName: string;
      bio?: string;
      genreIds: number[];
      profileImageUrl?: string;
    },
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true },
    });

    if (!user) throw new NotFoundError('User not found');
    if (user.isArtist || user.artistProfile) {
      throw new ConflictError('User is already an artist');
    }

    let stripeCustomerId = user.stripeCustomerId;
    let stripeSubscriptionId: string | null = null;
    let trialEndsAt: Date | null = null;

    // Create Stripe customer if not exists
    if (!stripeCustomerId && env.STRIPE_SECRET_KEY) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
    }

    // Create subscription with 30-day trial
    if (stripeCustomerId && env.STRIPE_PRICE_ID) {
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: env.STRIPE_PRICE_ID }],
        trial_period_days: 30,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      stripeSubscriptionId = subscription.id;
      trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
    } else {
      // Dev mode: simulate trial
      trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Create artist profile + update user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const artistProfile = await tx.artistProfile.create({
        data: {
          userId,
          artistName: data.artistName,
          bio: data.bio ?? null,
          genreIds: data.genreIds,
          profileImageUrl: data.profileImageUrl ?? null,
          stripeSubscriptionId,
          subscriptionStatus: 'trialing',
          trialEndsAt,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          isArtist: true,
          stripeCustomerId,
        },
      });

      // Create wallet for the artist
      await tx.wallet.create({
        data: { artistId: artistProfile.id },
      });

      return { artistProfile, user: updatedUser };
    });

    const { passwordHash: _, ...sanitizedUser } = result.user;
    return { artist: result.artistProfile, user: sanitizedUser };
  }

  /**
   * Create a Stripe Connect Express account and return the onboarding URL.
   */
  static async createConnectAccount(userId: string) {
    const artist = await prisma.artistProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!artist) throw new ForbiddenError('Artist profile not found');

    if (artist.stripeAccountId) {
      // Account already created — return a fresh onboarding link
      const link = await stripe.accountLinks.create({
        account: artist.stripeAccountId,
        refresh_url: `${env.APP_URL}/stripe-connect?refresh=true`,
        return_url: `${env.APP_URL}/onboarding-complete`,
        type: 'account_onboarding',
      });
      return { url: link.url, accountId: artist.stripeAccountId };
    }

    // Create new Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: artist.user.email,
      metadata: { userId, artistProfileId: artist.id },
      capabilities: {
        transfers: { requested: true },
      },
    });

    await prisma.artistProfile.update({
      where: { id: artist.id },
      data: { stripeAccountId: account.id },
    });

    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${env.APP_URL}/stripe-connect?refresh=true`,
      return_url: `${env.APP_URL}/onboarding-complete`,
      type: 'account_onboarding',
    });

    return { url: link.url, accountId: account.id };
  }

  /**
   * Verify a Connect account's status after onboarding callback.
   */
  static async verifyConnectAccount(userId: string) {
    const artist = await prisma.artistProfile.findUnique({
      where: { userId },
    });

    if (!artist) throw new NotFoundError('Artist profile not found');
    if (!artist.stripeAccountId) {
      throw new ValidationError('No Stripe Connect account found');
    }

    const account = await stripe.accounts.retrieve(artist.stripeAccountId);

    return {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      accountId: account.id,
    };
  }

  /**
   * Get public artist profile by artist ID.
   */
  static async getArtistProfile(artistId: string) {
    const artist = await prisma.artistProfile.findUnique({
      where: { id: artistId },
      include: {
        user: { select: { displayName: true, avatarUrl: true } },
        _count: { select: { followers: true, songs: true, releases: true } },
      },
    });

    if (!artist) throw new NotFoundError('Artist not found');

    return {
      ...artist,
      followerCount: artist._count.followers,
      songCount: artist._count.songs,
      releaseCount: artist._count.releases,
    };
  }

  /**
   * Get the current user's own artist profile.
   */
  static async getMyArtistProfile(userId: string) {
    const artist = await prisma.artistProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { displayName: true, avatarUrl: true, email: true } },
        wallet: true,
        _count: { select: { followers: true, songs: true, releases: true } },
      },
    });

    if (!artist) throw new NotFoundError('Artist profile not found');

    return {
      ...artist,
      followerCount: artist._count.followers,
      songCount: artist._count.songs,
      releaseCount: artist._count.releases,
    };
  }

  /**
   * Update the current user's artist profile.
   */
  static async updateArtistProfile(
    userId: string,
    data: {
      artistName?: string;
      bio?: string;
      genreIds?: number[];
      profileImageUrl?: string | null;
      bannerImageUrl?: string | null;
      collaborationPrice?: number;
      fanSubscriptionPrice?: number;
    },
  ) {
    const artist = await prisma.artistProfile.findUnique({
      where: { userId },
    });

    if (!artist) throw new NotFoundError('Artist profile not found');

    const updated = await prisma.artistProfile.update({
      where: { id: artist.id },
      data,
    });

    return updated;
  }

  /**
   * Get subscription status for the current artist.
   */
  static async getSubscriptionStatus(userId: string) {
    const artist = await prisma.artistProfile.findUnique({
      where: { userId },
    });

    if (!artist) throw new NotFoundError('Artist profile not found');

    let stripeStatus = null;
    if (artist.stripeSubscriptionId && env.STRIPE_SECRET_KEY) {
      const sub = await stripe.subscriptions.retrieve(artist.stripeSubscriptionId);
      stripeStatus = {
        status: sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      };
    }

    return {
      subscriptionStatus: artist.subscriptionStatus,
      trialEndsAt: artist.trialEndsAt,
      subscriptionEndsAt: artist.subscriptionEndsAt,
      stripe: stripeStatus,
    };
  }

  /**
   * Handle Stripe billing webhooks.
   */
  static async handleSubscriptionEvent(
    eventType: string,
    subscription: {
      id: string;
      customer: string;
      status: string;
      current_period_end?: number;
    },
  ) {
    const artist = await prisma.artistProfile.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!artist) return; // Not our subscription

    switch (eventType) {
      case 'invoice.paid': {
        await prisma.artistProfile.update({
          where: { id: artist.id },
          data: {
            subscriptionStatus: 'active',
            subscriptionEndsAt: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null,
          },
        });
        break;
      }
      case 'invoice.payment_failed': {
        await prisma.artistProfile.update({
          where: { id: artist.id },
          data: { subscriptionStatus: 'lapsed' },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        await prisma.artistProfile.update({
          where: { id: artist.id },
          data: { subscriptionStatus: 'cancelled' },
        });
        break;
      }
    }
  }
}
