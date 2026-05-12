import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { DataRefreshButton } from '../components/DataRefreshButton';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { adminApi } from '../services/api';

const previewReport = {
  id: 'report-preview',
  reason: 'Explicit Content',
  status: 'pending',
  createdAt: '2026-05-10T00:00:00.000Z',
  description:
    'Song contains explicit content without proper labeling. Lyrics are inappropriate for the “All Ages” category it was placed in.',
  reporter: { displayName: 'Nyla Faith', email: 'nyla@tunen2.com', avatarUrl: '' },
  song: {
    id: 'song-preview',
    title: 'Night Fall',
    coverArtUrl: '',
    artist: { user: { displayName: 'Riot Records' } },
  },
};

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [resolution, setResolution] = useState('');
  const [removeContent, setRemoveContent] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-report', reportId],
    placeholderData: previewReport,
    queryFn: async () => {
      try {
        const response = await adminApi.reports.get(reportId!);
        return response.data.data;
      } catch {
        return previewReport;
      }
    },
    enabled: !!reportId,
  });

  const updateMutation = useMutation({
    mutationFn: async (newStatus: 'resolved' | 'dismissed') => {
      return await adminApi.reports.update(reportId!, {
        status: newStatus,
        action: removeContent ? 'remove_content' : 'no_action',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      navigate('/moderation');
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Report not found</div>
        </div>
      </Layout>
    );
  }

  const isPending = data.status === 'pending';

  return (
    <Layout>
      <div className="max-w-225 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/moderation')}
            className="flex items-center gap-2 self-start text-[11px] text-[#00CCCC] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.85} />
            <span>Back to Queue</span>
          </button>
          <DataRefreshButton queryKeys={[['admin-report'], ['admin-reports']]} />
        </div>

        <h1 className="font-['Space_Grotesk'] text-[20px] font-bold tracking-[-0.03em] text-white">
          Report: {data.reason}
        </h1>

        <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.03em] text-[#8E8E93]">
                Reported Content
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1A1A1E] text-[11px] text-[#8E8E93]">
                  {data.song?.title?.slice(0, 1) || 'S'}
                </div>
                <div>
                  <div className="text-[12px] font-medium text-white">{data.song?.title}</div>
                  <div className="text-[10px] text-[#6E6E78]">
                    {data.song?.artist?.user?.displayName}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.03em] text-[#8E8E93]">
                Reporter
              </div>
              <div className="text-[12px] text-white">{data.reporter.displayName}</div>
              <div className="mt-1 text-[10px] text-[#6E6E78]">{data.reporter.email}</div>
            </div>

            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.03em] text-[#8E8E93]">
                Report Reason
              </div>
              <div className="rounded-md bg-[#141417] px-3 py-2 text-[11px] text-[#A0A0AB]">
                {data.description || 'No additional description provided.'}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <StatusBadge
                status={data.status}
                variant={
                  data.status === 'pending'
                    ? 'warning'
                    : data.status === 'resolved'
                      ? 'success'
                      : 'default'
                }
              />
              <div className="text-[10px] text-[#6E6E78]">
                {new Date(data.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {isPending && (
          <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="removeContent"
                  checked={removeContent}
                  onChange={(e) => setRemoveContent(e.target.checked)}
                  className="w-4 h-4 rounded border-[#2A2A2E] bg-[#1A1A1E] text-[#00CCCC] focus:ring-[#00CCCC]"
                />
                <label htmlFor="removeContent" className="text-white text-sm">
                  Remove reported content
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => updateMutation.mutate('dismissed')}
                  disabled={updateMutation.isPending}
                  className="rounded-md border border-[#2A2A2E] px-4 py-2 text-[11px] text-[#8E8E93] hover:text-white disabled:opacity-50"
                >
                  Dismiss Report
                </button>
                <button
                  onClick={() => updateMutation.mutate('resolved')}
                  disabled={updateMutation.isPending}
                  className="rounded-md bg-[#00CCCC] px-4 py-2 text-[11px] font-medium text-surface hover:bg-accent-hover disabled:opacity-50"
                >
                  Resolve Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
