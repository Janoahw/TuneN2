import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  songService,
  type Song,
  type SongDetail,
  type CreateSongParams,
  type UpdateSongParams,
  type SongListResult,
} from '@/services/song.service';

export function useMySongs(status?: string) {
  const isArtist = useAuthStore((s) => s.user?.isArtist);

  return useQuery<SongListResult>({
    queryKey: ['songs', 'me', status],
    queryFn: () => songService.getMySongs({ status, limit: 50 }),
    enabled: !!isArtist,
  });
}

export function useSong(songId: string) {
  return useQuery<SongDetail>({
    queryKey: ['songs', songId],
    queryFn: () => songService.getSong(songId),
    enabled: !!songId,
  });
}

export function useCreateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateSongParams) => songService.createSong(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', 'me'] });
    },
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, ...params }: UpdateSongParams & { songId: string }) =>
      songService.updateSong(songId, params),
    onSuccess: (_data: Song, variables: UpdateSongParams & { songId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['songs', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['songs', variables.songId] });
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => songService.deleteSong(songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', 'me'] });
    },
  });
}

export function useUploadUrl() {
  return useMutation({
    mutationFn: songService.getUploadUrl,
  });
}
