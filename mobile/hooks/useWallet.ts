import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  walletService,
  type Wallet,
  type WalletTransaction,
  type Withdrawal,
  type WithdrawalResult,
} from '@/services/wallet.service';

export function useWallet() {
  return useQuery<Wallet>({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
  });
}

export function useWalletTransactions(page = 1, type?: string) {
  return useQuery<{
    transactions: WalletTransaction[];
    total: number;
    page: number;
    totalPages: number;
  }>({
    queryKey: ['wallet-transactions', page, type],
    queryFn: () => walletService.getTransactions({ page, limit: 20, type }),
  });
}

export function useWithdrawals(page = 1) {
  return useQuery<{
    withdrawals: Withdrawal[];
    total: number;
    page: number;
    totalPages: number;
  }>({
    queryKey: ['withdrawals', page],
    queryFn: () => walletService.getWithdrawals({ page, limit: 20 }),
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation<WithdrawalResult, Error, number>({
    mutationFn: (amount: number) => walletService.requestWithdrawal(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
  });
}
