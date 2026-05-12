import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { adminApi } from '../services/api';

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [resolution, setResolution] = useState('');
  const [removeContent, setRemoveContent] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-report', reportId],
    queryFn: async () => {
      const response = await adminApi.reports.get(reportId!);
      return response.data.data;
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
      <div className="flex flex-col gap-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/moderation')}
          className="text-[#00CCCC] text-sm font-normal hover:underline self-start"
        >
          ← Back to Queue
        </button>

        {/* Title */}
        <h1 className="text-white text-2xl font-bold font-['Space_Grotesk']">
          Report: {data.reason}
        </h1>

        {/* Report Details */}
        <div className="bg-[#111114] rounded-xl p-6 border border-[#1A1A1E]">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Reporter</div>
              <div className="flex items-center gap-3">
                {data.reporter.avatarUrl && (
                  <img
                    src={data.reporter.avatarUrl}
                    alt={data.reporter.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <div className="text-white font-medium">{data.reporter.displayName}</div>
                  <div className="text-[#6E6E78] text-sm">{data.reporter.email}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Reported Content</div>
              <div className="flex items-center gap-3">
                {data.song?.coverArtUrl && (
                  <img
                    src={data.song.coverArtUrl}
                    alt={data.song.title}
                    className="w-12 h-12 rounded"
                  />
                )}
                <div>
                  <div className="text-white font-medium">{data.song?.title}</div>
                  <div className="text-[#6E6E78] text-sm">
                    by {data.song?.artist?.user?.displayName}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Reason</div>
              <div className="text-white">{data.reason}</div>
            </div>

            {data.description && (
              <div>
                <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Description</div>
                <div className="text-white">{data.description}</div>
              </div>
            )}

            <div>
              <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Status</div>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  data.status === 'pending'
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : data.status === 'resolved'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-[#0D0D0F]0/10 text-gray-400'
                }`}
              >
                {data.status}
              </span>
            </div>

            <div>
              <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Reported On</div>
              <div className="text-white">{new Date(data.createdAt).toLocaleString()}</div>
            </div>

            {data.reviewer && (
              <div>
                <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Reviewed By</div>
                <div className="text-white">{data.reviewer.displayName}</div>
              </div>
            )}
          </div>
        </div>

        {/* Resolution Section */}
        {isPending && (
          <div className="bg-[#111114] rounded-xl p-6 border border-[#1A1A1E]">
            <h2 className="text-white text-lg font-semibold font-['Space_Grotesk'] mb-4">
              Resolution
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[#A0A0AB] text-sm font-semibold mb-2">
                  Resolution Notes
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                  rows={4}
                  placeholder="Explain the resolution..."
                />
              </div>

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

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => updateMutation.mutate('dismissed')}
                  disabled={updateMutation.isPending}
                  className="px-6 py-2 bg-[#2A2A2E] text-white rounded-lg hover:bg-[#3A3A3E] disabled:opacity-50"
                >
                  Dismiss Report
                </button>
                <button
                  onClick={() => updateMutation.mutate('resolved')}
                  disabled={updateMutation.isPending || !resolution}
                  className="px-6 py-2 bg-[#00CCCC] text-white rounded-lg hover:bg-[#00BBBB] disabled:opacity-50"
                >
                  Resolve Report
                </button>
              </div>
            </div>
          </div>
        )}

        {!isPending && data.resolution && (
          <div className="bg-[#111114] rounded-xl p-6 border border-[#1A1A1E]">
            <h2 className="text-white text-lg font-semibold font-['Space_Grotesk'] mb-4">
              Resolution
            </h2>
            <div className="text-white">{data.resolution}</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
