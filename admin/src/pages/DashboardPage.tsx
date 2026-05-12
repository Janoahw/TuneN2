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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to the TuneN2 Admin Panel
          </p>
        </div>

        {/* Key Metrics */}
        {overview && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Platform Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Revenue"
                value={`$${(overview.revenue.total / 100).toFixed(2)}`}
              />
              <StatsCard
                title="Active Artists"
                value={overview.platform.activeArtists}
              />
              <StatsCard
                title="Total Fans"
                value={overview.platform.totalFans}
              />
              <StatsCard
                title="Total Songs"
                value={overview.platform.totalSongs}
              />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Financial Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Platform Fees"
                value={`$${(overview.revenue.platformFees / 100).toFixed(2)}`}
              />
              <StatsCard
                title="Pending Withdrawals"
                value={`$${(overview.pending.amount / 100).toFixed(2)}`}
              />
              <StatsCard
                title="Transactions"
                value={overview.revenue.transactionCount}
              />
            </div>
          </>
        )}

        {/* Pending Reports */}
        {pendingReports && pendingReports.reports.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Pending Reports ({pendingReports.pagination.total})
              </h2>
              <a
                href="/moderation"
                className="text-[#00CCCC] hover:underline text-sm"
              >
                View All →
              </a>
            </div>
            <div className="space-y-3">
              {pendingReports.reports.map((report: any) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {report.reportType} - {report.targetType}
                    </p>
                    <p className="text-sm text-gray-600 truncate max-w-md">
                      {report.reason}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
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
