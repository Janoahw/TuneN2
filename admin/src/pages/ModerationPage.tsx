import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DataRefreshButton } from '../components/DataRefreshButton';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { adminApi } from '../services/api';

const previewReports = [
  {
    id: 'report-1',
    reason: 'copyright',
    status: 'pending',
    createdAt: '2026-05-10T00:00:00.000Z',
    song: { id: 'song-1', title: 'Explicit Content Report' },
    reporter: { displayName: 'Nyla Faith' },
  },
  {
    id: 'report-2',
    reason: 'copyright',
    status: 'pending',
    createdAt: '2026-05-09T00:00:00.000Z',
    song: { id: 'song-2', title: 'Copyright Claim' },
    reporter: { displayName: 'Crown Beats' },
  },
  {
    id: 'report-3',
    reason: 'inappropriate',
    status: 'pending',
    createdAt: '2026-05-07T00:00:00.000Z',
    song: { id: 'song-3', title: 'Inappropriate Artwork' },
    reporter: { displayName: 'Lyricals' },
  },
];

export default function ModerationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [reasonFilter, setReasonFilter] = useState<'all' | 'spam' | 'copyright' | 'inappropriate'>(
    'all',
  );

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', page],
    placeholderData: {
      reports: previewReports,
      pagination: { page: 1, totalPages: 1, total: previewReports.length },
    },
    queryFn: async () => {
      try {
        const response = await adminApi.reports.list({
          page,
          limit: 20,
          status: 'pending',
        });
        return response.data.data;
      } catch {
        return {
          reports: previewReports,
          pagination: { page: 1, totalPages: 1, total: previewReports.length },
        };
      }
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (reportId: string) =>
      adminApi.reports.update(reportId, { status: 'dismissed', action: 'no_action' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });

  const reports = (data?.reports || []).filter((report: any) =>
    reasonFilter === 'all' ? true : report.reason === reasonFilter,
  );

  return (
    <Layout>
      <div className="max-w-[1120px]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-['Space_Grotesk'] text-[20px] font-bold tracking-[-0.03em] text-white">
              Moderation Queue
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DataRefreshButton queryKeys={[['admin-reports']]} />
            <StatusBadge
              status={`${data?.pagination?.total || reports.length} Pending`}
              variant="error"
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {[
            ['all', 'All Reports'],
            ['spam', 'Spam'],
            ['copyright', 'Copyright'],
            ['inappropriate', 'Explicit'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setReasonFilter(key as any)}
              className={`h-7 rounded-md px-3 text-[10px] font-medium transition ${
                reasonFilter === key ? 'bg-[#00CCCC] text-surface' : 'bg-[#141417] text-[#8E8E93]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-[#1A1A1E] bg-surface-alt">
          {isLoading && !data ? (
            <div className="p-8 text-center text-[#8E8E93]">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-[#8E8E93]">No reports found</div>
          ) : (
            <div className="divide-y divide-[#1A1A1E]">
              {reports.map((report: any) => (
                <div key={report.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="h-5 w-5 rounded border border-[#2A2A2E] bg-[#141417]" />
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    <div className="truncate text-[12px] font-medium text-white">
                      {report.song?.title || report.reason}
                    </div>
                    <div className="mt-1 text-[10px] text-[#6E6E78]">
                      {report.reason} • {report.reporter?.displayName || 'Unknown'} •{' '}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/reports/${report.id}`)}
                    className="rounded-md bg-[#00CCCC] px-3 py-1.5 text-[10px] font-medium text-surface"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => dismissMutation.mutate(report.id)}
                    disabled={dismissMutation.isPending}
                    className="rounded-md border border-[#2A2A2E] px-3 py-1.5 text-[10px] text-[#8E8E93] hover:text-white disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {data?.pagination && (
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </Layout>
  );
}
