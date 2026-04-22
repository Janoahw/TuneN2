import { useQuery } from '@tanstack/react-query';
import { discoverService, type SearchResult } from '@/services/discover.service';

export function useSearch(q: string, type: 'all' | 'artists' | 'songs' = 'all', enabled = true) {
  return useQuery<SearchResult>({
    queryKey: ['search', q, type],
    queryFn: () => discoverService.search(q, type),
    enabled: enabled && q.trim().length > 0,
    staleTime: 60 * 1000, // 1 minute
  });
}
