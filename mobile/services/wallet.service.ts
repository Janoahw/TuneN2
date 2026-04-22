import { api } from './api';
import { ENDPOINTS } from './endpoints';

// ─── Types ──────────────────────────────────

export interface Wallet {
  id: string;
  artistId: string;
  balance: string;
  totalEarned: string;
  totalWithdrawn: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'song_sale' | 'subscription_earning' | 'collaboration' | 'withdrawal';
  amount: string;
  fee: string;
  netAmount: string;
  referenceId: string | null;
  referenceType: string | null;
  stripeTransferId: string | null;
  status: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  walletId: string;
  amountCents: number;
  feeCents: number;
  netAmountCents: number;
  stripeTransferId: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WithdrawalResult {
  withdrawal: Withdrawal;
  amountDollars: number;
  feeDollars: number;
  netAmountDollars: number;
  stripeTransferId: string;
}

// ─── Service ─────────────────────────────────

export const walletService = {
  async getWallet(): Promise<Wallet> {
    const res = await api.get(ENDPOINTS.wallet.balance);
    return res.data.wallet;
  },

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{ transactions: WalletTransaction[]; total: number; page: number; totalPages: number }> {
    const res = await api.get(ENDPOINTS.wallet.transactions, { params });
    return res.data;
  },

  async requestWithdrawal(amount: number): Promise<WithdrawalResult> {
    const res = await api.post(ENDPOINTS.wallet.withdraw, { amount });
    return res.data;
  },

  async getWithdrawals(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ withdrawals: Withdrawal[]; total: number; page: number; totalPages: number }> {
    const res = await api.get(ENDPOINTS.wallet.withdrawals, { params });
    return res.data;
  },
};
