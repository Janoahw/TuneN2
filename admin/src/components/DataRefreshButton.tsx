import { useState } from 'react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

interface DataRefreshButtonProps {
  queryKeys: ReadonlyArray<readonly unknown[]>;
  className?: string;
}

export function DataRefreshButton({ queryKeys, className = '' }: DataRefreshButtonProps) {
  const queryClient = useQueryClient();
  const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);

  const isRefreshing = useIsFetching({
    predicate: (query) =>
      queryKeys.some((key) => key.every((segment, index) => query.queryKey[index] === segment)),
  });

  const handleRefresh = async () => {
    if (!queryKeys.length || isManuallyRefreshing) return;

    setIsManuallyRefreshing(true);

    try {
      await Promise.all(
        queryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey, refetchType: 'active' }),
        ),
      );
    } finally {
      setIsManuallyRefreshing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isManuallyRefreshing}
      className={`inline-flex h-8 items-center gap-2 rounded-md border border-[#1A1A1E] bg-surface-alt px-3 text-[11px] font-medium text-[#8E8E93] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <RefreshCw
        className={`h-3.5 w-3.5 ${isManuallyRefreshing || isRefreshing ? 'animate-spin' : ''}`}
        strokeWidth={1.85}
      />
      <span>{isManuallyRefreshing || isRefreshing ? 'Refreshing...' : 'Refresh data'}</span>
    </button>
  );
}
