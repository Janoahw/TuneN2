import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  libraryService,
  type LibraryResult,
  type SongStatsResult,
} from '@/services/library.service';

export function useLibrary(page = 1) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<LibraryResult>({
    queryKey: ['library', page],
    queryFn: () => libraryService.getLibrary(page),
    enabled: isAuthenticated,
  });
}

export function useLibraryOwnership(songId: string) {
  return useQuery<boolean>({
    queryKey: ['library', 'ownership', songId],
    queryFn: () => libraryService.checkOwnership(songId),
    enabled: !!songId,
  });
}

export function useMySongsWithStats(status?: string) {
  const isArtist = useAuthStore((s) => s.user?.isArtist);

  return useQuery<SongStatsResult>({
    queryKey: ['songs', 'me', 'stats', status],
    queryFn: () => libraryService.getMySongsWithStats({ status, limit: 50 }),
    enabled: !!isArtist,
  });
}
