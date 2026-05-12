import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowUpRight, CircleDollarSign, Music4, Users } from 'lucide-react';
import { DataRefreshButton } from '../components/DataRefreshButton';
import { Layout } from '../components/Layout';
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
      <div className="max-w-280">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-['Space_Grotesk'] text-[24px] font-bold tracking-[-0.03em] text-white">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-[11px] text-[#8E8E93]">Last 30 days</p>
          </div>
          <div className="flex items-center gap-2">
            <DataRefreshButton queryKeys={[['admin-dashboard'], ['admin-pending-reports']]} />
            <div className="flex h-7 items-center gap-2 rounded-full border border-[#1A1A1E] bg-surface-alt px-3 text-[10px] text-[#8E8E93]">
              <span>Last 30 days</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#00CCCC]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Users',
                  value: (overview?.platform?.totalFans ?? 0).toLocaleString(),
                  change: '+12.4% last month',
                  icon: Users,
                },
                {
                  label: 'Revenue',
                  value: `$${((overview?.revenue?.total ?? 0) / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}`,
                  change: '+8.7% this month',
                  icon: CircleDollarSign,
                },
                {
                  label: 'Top Songs',
                  value: `${(overview?.platform?.totalSongs ?? 0).toLocaleString()}`,
                  change: `${(overview?.revenue?.transactionCount ?? 0).toLocaleString()} total sales`,
                  icon: Music4,
                },
                {
                  label: 'Active Alerts',
                  value: `${pendingReports?.pagination?.total ?? 0}`,
                  change: `${pendingReports?.reports?.length ?? 0} open this view`,
                  icon: AlertCircle,
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-lg border border-[#1A1A1E] bg-surface-alt px-4 py-3.5"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#8E8E93]">{card.label}</span>
                    <card.icon className="h-4 w-4 text-[#00CCCC]" strokeWidth={1.85} />
                  </div>
                  <div className="font-['Space_Grotesk'] text-[24px] font-bold leading-none tracking-[-0.03em] text-white">
                    {card.value}
                  </div>
                  <div className="mt-2 text-[10px] text-[#30D158]">{card.change}</div>
                </div>
              ))}
            </div>

            <section className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-['Space_Grotesk'] text-[14px] font-bold tracking-[-0.02em] text-white">
                  Revenue Trend
                </h2>
                <span className="text-[10px] text-[#8E8E93]">Monthly performance</span>
              </div>

              <div className="relative flex h-70 items-end gap-1.5 overflow-hidden rounded-lg bg-surface px-4 pb-4 pt-10">
                <div className="pointer-events-none absolute inset-x-4 top-8 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]" />
                {[24, 32, 28, 40, 36, 52, 47, 42].map((height, index) => (
                  <div
                    key={index}
                    className="relative flex-1 rounded-t-[3px] bg-[linear-gradient(180deg,rgba(134,244,255,0.98)_0%,rgba(0,204,204,0.82)_45%,rgba(0,118,123,0.92)_100%)] shadow-[0_0_18px_rgba(0,204,204,0.12)]"
                    style={{ height: `${height}%` }}
                  >
                    <span className="absolute inset-x-[22%] top-1 h-1.5 rounded-full bg-white/35 blur-[1px]" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-['Space_Grotesk'] text-[14px] font-bold tracking-[-0.02em] text-white">
                Recent Activity
              </h2>
              <a
                href="/moderation"
                className="text-[10px] text-[#8E8E93] transition hover:text-white"
              >
                View all
              </a>
            </div>
            <div className="space-y-4">
              {(pendingReports?.reports?.slice(0, 4) ?? []).map((report: any) => (
                <div key={report.id} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#00CCCC]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] text-white">
                      New {report.reason} report submitted
                    </p>
                    <p className="mt-1 text-[10px] text-[#8E8E93]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

              {(!pendingReports || pendingReports.reports.length === 0) && (
                <>
                  {[
                    'New artist sign up completed',
                    'Payout processed successfully',
                    'New report flagged for review',
                    'User verified successfully',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#00CCCC]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-white">{item}</p>
                        <p className="mt-1 text-[10px] text-[#8E8E93]">
                          System activity placeholder
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mt-6 rounded-lg border border-[#1A1A1E] bg-surface p-3">
              <div className="flex items-center justify-between text-[10px] text-[#8E8E93]">
                <span>Platform fees</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#30D158]" strokeWidth={1.85} />
              </div>
              <div className="mt-2 font-['Space_Grotesk'] text-[20px] font-bold tracking-[-0.03em] text-white">
                $
                {((overview?.revenue?.platformFees ?? 0) / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="mt-1 text-[10px] text-[#30D158]">+5.2% from previous period</div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
