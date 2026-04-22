import { useQuery } from '@tanstack/react-query';
import {
  discoverService,
  type Genre,
  type GenreDetail,
  type ArtistsPage,
  type DiscoverFeed,
} from '@/services/discover.service';

export function useDiscoverFeed(limit = 10) {
  return useQuery<DiscoverFeed>({
    queryKey: ['discover', 'feed', limit],
    queryFn: () => discoverService.getFeed(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGenres() {
  return useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: () => discoverService.getGenres(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useGenreDetail(slug: string) {
  return useQuery<GenreDetail>({
    queryKey: ['genres', slug],
    queryFn: () => discoverService.getGenreDetail(slug),
    enabled: !!slug,
  });
}

export function useArtists(page = 1, limit = 20, genre?: string) {
  return useQuery<ArtistsPage>({
    queryKey: ['artists', 'list', page, limit, genre],
    queryFn: () => discoverService.getArtists(page, limit, genre),
  });
}

export function useRecommended() {
  return useQuery({
    queryKey: ['songs', 'recommended'],
    queryFn: () => discoverService.getRecommended(),
    staleTime: 5 * 60 * 1000,
  });
}
