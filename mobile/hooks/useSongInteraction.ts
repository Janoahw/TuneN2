import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  songInteractionService,
  type LikeStatus,
  type SongComment,
  type CommentPage,
} from '@/services/song-interaction.service';

// ── Like ──────────────────────────────────────────────────

export function useLike(songId: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const query = useQuery<LikeStatus>({
    queryKey: ['songs', songId, 'like'],
    queryFn: () => songInteractionService.getLikeStatus(songId!),
    enabled: !!songId,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: () => songInteractionService.toggleLike(songId!),
    onMutate: async () => {
      // Optimistic update
      const key = ['songs', songId, 'like'];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<LikeStatus>(key);
      queryClient.setQueryData<LikeStatus>(key, {
        liked: prev ? !prev.liked : true,
        likeCount: prev ? Math.max(0, prev.liked ? prev.likeCount - 1 : prev.likeCount + 1) : 1,
      });
      return { prev };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context: { prev: LikeStatus | undefined } | undefined,
    ) => {
      // Roll back on error
      if (context?.prev) {
        queryClient.setQueryData(['songs', songId, 'like'], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', songId, 'like'] });
    },
  });

  return {
    isLiked: query.data?.liked ?? false,
    likeCount: query.data?.likeCount ?? 0,
    toggleLike: () => {
      if (!isAuthenticated) return; // caller can redirect to login if needed
      mutation.mutate();
    },
    isToggling: mutation.isPending,
  };
}

// ── Comments ──────────────────────────────────────────────

export function useComments(songId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useInfiniteQuery<CommentPage, Error, InfiniteData<CommentPage>>({
    queryKey: ['songs', songId, 'comments'],
    queryFn: ({ pageParam }: { pageParam: unknown }) =>
      songInteractionService.getComments(songId!, (pageParam as number) ?? 1),
    initialPageParam: 1,
    getNextPageParam: (last: CommentPage) => (last.hasNext ? last.page + 1 : undefined),
    enabled: !!songId,
    staleTime: 15_000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

export function useCommentCount(songId: string | null): number {
  const { data } = useComments(songId);
  return data?.pages[0]?.total ?? 0;
}

export function useCreateComment(songId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => songInteractionService.createComment(songId!, body),
    onSuccess: (newComment: SongComment) => {
      queryClient.setQueryData(
        ['songs', songId, 'comments'],
        (
          old:
            | {
                pages: {
                  items: SongComment[];
                  total: number;
                  page: number;
                  limit: number;
                  hasNext: boolean;
                }[];
                pageParams: unknown[];
              }
            | undefined,
        ) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                items: [newComment, ...firstPage.items],
                total: firstPage.total + 1,
              },
              ...old.pages.slice(1),
            ],
          };
        },
      );
    },
  });
}

export function useDeleteComment(songId: string | null) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (commentId: string) => songInteractionService.deleteComment(songId!, commentId),
    onSuccess: (_data: void, commentId: string) => {
      queryClient.setQueryData(
        ['songs', songId, 'comments'],
        (
          old:
            | {
                pages: {
                  items: SongComment[];
                  total: number;
                  page: number;
                  limit: number;
                  hasNext: boolean;
                }[];
                pageParams: unknown[];
              }
            | undefined,
        ) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((c) => c.id !== commentId),
              total: Math.max(0, page.total - 1),
            })),
          };
        },
      );
    },
  });
}
