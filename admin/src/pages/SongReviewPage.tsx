import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { adminApi } from '../services/api';

export default function SongReviewPage() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-song', songId],
    queryFn: async () => {
      const response = await adminApi.content.songs.get(songId!);
      return response.data.data;
    },
    enabled: !!songId,
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
          <div className="text-white">Song not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold font-['Space_Grotesk']">Song Review</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-[#00CCCC] text-sm font-normal hover:underline"
          >
            Back to Queue
          </button>
        </div>

        {/* Song Info */}
        <div className="bg-[#111114] rounded-xl p-5 flex gap-6">
          {/* Cover Art */}
          <div className="flex-shrink-0">
            {data.coverArtUrl ? (
              <img
                src={data.coverArtUrl}
                alt={data.title}
                className="w-[200px] h-[200px] rounded-lg object-cover"
              />
            ) : (
              <div className="w-[200px] h-[200px] rounded-lg bg-[#BF5AF2] flex items-center justify-center text-white text-4xl">
                ♫
              </div>
            )}
          </div>

          {/* Song Metadata */}
          <div className="flex-1 flex flex-col gap-2.5">
            <div>
              <div className="text-[#A0A0AB] text-xs font-semibold mb-1">TITLE</div>
              <div className="text-white text-lg font-semibold">{data.title}</div>
            </div>

            <div>
              <div className="text-[#A0A0AB] text-xs font-semibold mb-1">ARTIST</div>
              <div className="text-white">{data.artist?.user?.displayName}</div>
            </div>

            <div className="flex gap-6">
              <div>
                <div className="text-[#A0A0AB] text-xs font-semibold mb-1">GENRE</div>
                <div className="text-white">{data.genre?.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[#A0A0AB] text-xs font-semibold mb-1">PRICE</div>
                <div className="text-white">${(data.price / 100).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[#A0A0AB] text-xs font-semibold mb-1">STATUS</div>
                <StatusBadge
                  status={data.isActive ? 'Active' : 'Inactive'}
                  variant={data.isActive ? 'success' : 'default'}
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div>
                <div className="text-[#A0A0AB] text-xs font-semibold mb-1">PURCHASES</div>
                <div className="text-white">{data.stats?.purchaseCount || 0}</div>
              </div>
              <div>
                <div className="text-[#A0A0AB] text-xs font-semibold mb-1">REPORTS</div>
                <div className="text-white">{data.stats?.reportCount || 0}</div>
              </div>
            </div>

            <div>
              <div className="text-[#A0A0AB] text-xs font-semibold mb-1">UPLOADED</div>
              <div className="text-white text-sm">
                {new Date(data.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Audio Preview */}
        <div className="bg-[#111114] rounded-xl p-5 flex flex-col gap-3">
          <h2 className="text-white text-base font-semibold font-['Space_Grotesk']">
            Audio Preview
          </h2>

          {/* Waveform placeholder */}
          <div className="bg-[#1A1A1E] rounded-lg h-12 flex items-center justify-center">
            <div className="text-[#6E6E78] text-sm">🎵 Audio waveform visualization</div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-4">
            {data.audioUrl && (
              <audio controls className="w-full" src={data.audioUrl}>
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        </div>

        {/* Report History */}
        <div className="bg-[#111114] rounded-xl p-5 flex flex-col gap-3">
          <h2 className="text-white text-base font-semibold font-['Space_Grotesk']">
            Report History
          </h2>

          {data.reports && data.reports.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.reports.map((report: any) => (
                <div
                  key={report.id}
                  className="border border-[#1A1A1E] rounded-lg p-4 flex items-start gap-3"
                >
                  {report.reporter?.avatarUrl && (
                    <img
                      src={report.reporter.avatarUrl}
                      alt={report.reporter.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-white font-medium">{report.reporter?.displayName}</div>
                      <div className="text-[#6E6E78] text-xs">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-[#A0A0AB] text-sm mb-2">{report.reason}</div>
                    {report.description && (
                      <div className="text-[#8E8E93] text-sm">{report.description}</div>
                    )}
                    <div className="mt-2">
                      <StatusBadge
                        status={report.status}
                        variant={
                          report.status === 'pending'
                            ? 'warning'
                            : report.status === 'resolved'
                              ? 'success'
                              : 'default'
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[#8E8E93] text-sm">No reports have been filed for this song.</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
