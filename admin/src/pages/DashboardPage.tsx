import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { StatsCard } from '../components/StatsCard';
import { adminApi } from '../services/api';

export default function DashboardPage() {
  const { data: overview } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await adminApi.financials.overview();
      return response.data.data;
    },
  });

  const { data: pendingReports } = useQuery({
    queryKey: ['admin-pending-reports'],
    queryFn: async () => {
      const response = await adminApi.reports.list({
        status: 'pending',
        limit: 5,
      });
      return response.data.data;
    },
  });

  return (
    <Layout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-white">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-sm text-[#8E8E93]">Last 30 days</p>
        </div>

        {/* Key Metrics */}
        {overview && (
          <>
            <h2 className="mb-4 font-['Space_Grotesk'] text-lg font-bold text-white">
              Platform Metrics
            </h2>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Revenue"
                value={`$${(overview.revenue.total / 100).toFixed(2)}`}
              />
              <StatsCard title="Active Artists" value={overview.platform.activeArtists} />
              <StatsCard title="Total Fans" value={overview.platform.totalFans} />
              <StatsCard title="Total Songs" value={overview.platform.totalSongs} />
            </div>

            <h2 className="mb-4 font-['Space_Grotesk'] text-lg font-bold text-white">
              Financial Overview
            </h2>
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatsCard
                title="Platform Fees"
                value={`$${(overview.revenue.platformFees / 100).toFixed(2)}`}
              />
              <StatsCard
                title="Pending Withdrawals"
                value={`$${(overview.pending.amount / 100).toFixed(2)}`}
              />
              <StatsCard title="Transactions" value={overview.revenue.transactionCount} />
            </div>
          </>
        )}

        {/* Pending Reports */}
        {pendingReports && pendingReports.reports.length > 0 && (
          <div className="rounded-lg border border-[#1A1A1E] bg-[#111114] p-5 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-['Space_Grotesk'] text-lg font-bold text-white">
                Pending Reports ({pendingReports.pagination.total})
              </h2>
              <a href="/moderation" className="text-[#00CCCC] hover:underline text-sm">
                View All
              </a>
            </div>
            <div className="space-y-3">
              {pendingReports.reports.map((report: any) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border border-[#1A1A1E] bg-[#0D0D0F] p-3"
                >
                  <div>
                    <p className="font-medium capitalize text-white">{report.reason}</p>
                    <p className="text-sm text-[#8E8E93] truncate max-w-md">{report.reason}</p>
                  </div>
                  <span className="text-sm text-[#8E8E93]">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
