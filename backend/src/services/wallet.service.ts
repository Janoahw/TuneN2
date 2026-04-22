import { prisma } from '../config/database.js';
import { stripe } from '../config/stripe.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, AppError, ForbiddenError } from '../utils/errors.js';

const FEE_PERCENT = 0.0023; // 0.23% processing fee
const MIN_WITHDRAWAL_DOLLARS = 10;

export class WalletService {
  // ─── S8.2: Get wallet balance ─────────────────────────────────────────

  static async getWallet(userId: string) {
    const artist = await prisma.artistProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!artist) throw new NotFoundError('Artist profile not found');

    const wallet = await prisma.wallet.findUnique({
      where: { artistId: artist.id },
    });
    if (!wallet) throw new NotFoundError('Wallet not found');

    return wallet;
  }

  // ─── S8.3: Get paginated transactions ────────────────────────────────

  static async getTransactions(
    userId: string,
    params: { page?: number; limit?: number; type?: string },
  ) {
    const { page = 1, limit = 20, type } = params;
    const skip = (page - 1) * limit;

    const artist = await prisma.artistProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!artist) throw new NotFoundError('Artist profile not found');

    const wallet = await prisma.wallet.findUnique({
      where: { artistId: artist.id },
      select: { id: true },
    });
    if (!wallet) throw new NotFoundError('Wallet not found');

    const where = {
      walletId: wallet.id,
      ...(type ? { type } : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── S8.5 + S8.10: Request a withdrawal ──────────────────────────────

  static async requestWithdrawal(userId: string, amountDollars: number) {
    if (amountDollars < MIN_WITHDRAWAL_DOLLARS) {
      throw new AppError(
        `Minimum withdrawal is $${MIN_WITHDRAWAL_DOLLARS}`,
        400,
        'BELOW_MINIMUM_WITHDRAWAL',
      );
    }

    // S8.10: Verify artist has an active Connect account
    const artist = await prisma.artistProfile.findUnique({
      where: { userId },
      select: { id: true, stripeAccountId: true },
    });
    if (!artist) throw new NotFoundError('Artist profile not found');

    if (!artist.stripeAccountId) {
      throw new AppError(
        'You must connect a bank account before withdrawing',
        400,
        'STRIPE_CONNECT_REQUIRED',
      );
    }

    // Verify Connect account is active (charges_enabled)
    const account = await stripe.accounts.retrieve(artist.stripeAccountId);
    if (!account.charges_enabled) {
      throw new AppError(
        'Your payout account is not fully verified. Please complete Stripe onboarding.',
        400,
        'STRIPE_ACCOUNT_NOT_VERIFIED',
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: { artistId: artist.id },
    });
    if (!wallet) throw new NotFoundError('Wallet not found');

    // Calculate amounts in cents
    const amountCents = Math.round(amountDollars * 100);
    const feeCents = Math.round(amountCents * FEE_PERCENT);
    const netAmountCents = amountCents - feeCents;

    if (Number(wallet.balance) < amountDollars) {
      throw new AppError('Insufficient wallet balance', 400, 'INSUFFICIENT_BALANCE');
    }

    // Create Stripe transfer to the Connect account
    const transfer = await stripe.transfers.create({
      amount: netAmountCents,
      currency: 'usd',
      destination: artist.stripeAccountId,
      metadata: {
        walletId: wallet.id,
        userId,
      },
    });

    // Atomic DB operation: debit wallet + create withdrawal + create transaction
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Debit balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: amountDollars },
          totalWithdrawn: { increment: amountDollars },
        },
      });

      // Create withdrawal record
      const w = await tx.withdrawal.create({
        data: {
          walletId: wallet.id,
          amountCents,
          feeCents,
          netAmountCents,
          stripeTransferId: transfer.id,
          status: 'processing',
        },
      });

      // Create wallet transaction log
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'withdrawal',
          amount: amountDollars,
          fee: feeCents / 100,
          netAmount: netAmountCents / 100,
          referenceId: w.id,
          referenceType: 'withdrawal',
          stripeTransferId: transfer.id,
          status: 'processing',
        },
      });

      return w;
    });

    logger.info(
      { withdrawalId: withdrawal.id, transferId: transfer.id, amountDollars },
      'Withdrawal initiated',
    );

    return {
      withdrawal,
      amountDollars,
      feeDollars: feeCents / 100,
      netAmountDollars: netAmountCents / 100,
      stripeTransferId: transfer.id,
    };
  }

  // ─── S8.9: Get withdrawal history ────────────────────────────────────

  static async getWithdrawals(userId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const artist = await prisma.artistProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!artist) throw new NotFoundError('Artist profile not found');

    const wallet = await prisma.wallet.findUnique({
      where: { artistId: artist.id },
      select: { id: true },
    });
    if (!wallet) throw new NotFoundError('Wallet not found');

    const where = { walletId: wallet.id };

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return {
      withdrawals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── S8.6: Handle transfer.paid webhook ──────────────────────────────

  static async handleTransferPaid(stripeTransferId: string) {
    const withdrawal = await prisma.withdrawal.findFirst({
      where: { stripeTransferId },
    });
    if (!withdrawal) {
      logger.warn({ stripeTransferId }, 'No withdrawal found for transfer.paid');
      return;
    }

    await prisma.$transaction([
      prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: 'completed', completedAt: new Date() },
      }),
      prisma.walletTransaction.updateMany({
        where: { stripeTransferId, referenceType: 'withdrawal' },
        data: { status: 'completed' },
      }),
    ]);

    logger.info({ withdrawalId: withdrawal.id, stripeTransferId }, 'Withdrawal completed');
  }

  // ─── S8.6: Handle transfer.failed webhook ────────────────────────────

  static async handleTransferFailed(stripeTransferId: string) {
    const withdrawal = await prisma.withdrawal.findFirst({
      where: { stripeTransferId },
    });
    if (!withdrawal) {
      logger.warn({ stripeTransferId }, 'No withdrawal found for transfer.failed');
      return;
    }

    const amountDollars = withdrawal.amountCents / 100;

    await prisma.$transaction(async (tx) => {
      // Mark withdrawal as failed
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: 'failed', completedAt: new Date() },
      });

      // Restore balance to wallet
      await tx.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          balance: { increment: amountDollars },
          totalWithdrawn: { decrement: amountDollars },
        },
      });

      // Update transaction status
      await tx.walletTransaction.updateMany({
        where: { stripeTransferId, referenceType: 'withdrawal' },
        data: { status: 'failed' },
      });
    });

    logger.info({ withdrawalId: withdrawal.id, stripeTransferId }, 'Withdrawal failed — balance restored');
  }
}
