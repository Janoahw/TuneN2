import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  purchaseService,
  type PurchaseIntentResult,
  type PurchaseItem,
  type DownloadItem,
  type PaginatedResult,
} from '@/services/purchase.service';

export function usePurchaseSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => purchaseService.purchaseSong(songId),
    onSuccess: (_data: PurchaseIntentResult, songId: string) => {
      queryClient.invalidateQueries({ queryKey: ['ownership', songId] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
}

export function useOwnership(songId: string) {
  return useQuery<boolean>({
    queryKey: ['ownership', songId],
    queryFn: () => purchaseService.checkOwnership(songId),
    enabled: !!songId,
  });
}

export function useDownloadUrl() {
  return useMutation({
    mutationFn: (songId: string) => purchaseService.getDownloadUrl(songId),
    onSuccess: (_data: { downloadUrl: string; songTitle: string }, songId: string) => {
      // Refetch downloads list after a new download
    },
  });
}

export function useMyPurchases(page = 1) {
  return useQuery<PaginatedResult<PurchaseItem>>({
    queryKey: ['purchases', page],
    queryFn: () => purchaseService.getMyPurchases(page),
  });
}

export function useMyDownloads(page = 1) {
  return useQuery<PaginatedResult<DownloadItem>>({
    queryKey: ['downloads', page],
    queryFn: () => purchaseService.getMyDownloads(page),
  });
}
