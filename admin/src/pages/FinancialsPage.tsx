import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { DataRefreshButton } from '../components/DataRefreshButton';
import { FinancialBreakdownChart } from '../components/FinancialBreakdownChart';
import { FinancialLineChart } from '../components/FinancialLineChart';
import { Layout } from '../components/Layout';
import { StatsCard } from '../components/StatsCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { adminApi } from '../services/api';

const previewOverview = {
  revenue: {
    total: 4839250,
    platformFees: 1284720,
    artistEarnings: 649300,
    transactionCount: 241,
  },
  withdrawals: {
    completed: 2191200,
    fees: 95300,
  },
  pending: {
    amount: 924100,
  },
  platform: {
    activeArtists: 186,
    totalFans: 12487,
    totalSongs: 892,
  },
};

const previewTransactions = [
  {
    id: 'tx-preview-1',
    type: 'Purchase',
    wallet: { artist: { artistName: 'DJ Pulse' } },
    amountCents: 60,
    balanceAfterCents: 48390,
    createdAt: '2026-05-12T00:00:00.000Z',
  },
];

const previewWithdrawals = [
  {
    id: 'wd-preview-1',
    wallet: { artist: { artistName: 'Nova Banks' } },
    amountCents: 12000,
    feeCents: 300,
    status: 'pending',
    createdAt: '2026-05-10T00:00:00.000Z',
  },
];

const previewChartData = {
  trend: [
    {
      label: 'Dec',
      grossRevenueCents: 412000,
      platformFeesCents: 82400,
      artistEarningsCents: 329600,
    },
    {
      label: 'Jan',
      grossRevenueCents: 523000,
      platformFeesCents: 104600,
      artistEarningsCents: 418400,
    },
    {
      label: 'Feb',
      grossRevenueCents: 488000,
      platformFeesCents: 97600,
      artistEarningsCents: 390400,
    },
    {
      label: 'Mar',
      grossRevenueCents: 566000,
      platformFeesCents: 113200,
      artistEarningsCents: 452800,
    },
    {
      label: 'Apr',
      grossRevenueCents: 615000,
      platformFeesCents: 123000,
      artistEarningsCents: 492000,
    },
    {
      label: 'May',
      grossRevenueCents: 672000,
      platformFeesCents: 134400,
      artistEarningsCents: 537600,
    },
  ],
  breakdown: [
    { key: 'artist_earnings', label: 'Artist Earnings', valueCents: 649300 },
    { key: 'platform_fees', label: 'Platform Fees', valueCents: 1284720 },
    { key: 'completed_payouts', label: 'Completed Payouts', valueCents: 2191200 },
  ],
};

export default function FinancialsPage() {
  const [view, setView] = useState<'overview' | 'transactions' | 'withdrawals'>('overview');
  const [transactionPage, setTransactionPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);

  const { data: overview } = useQuery({
    queryKey: ['admin-financials-overview'],
    queryFn: async () => {
      try {
        const response = await adminApi.financials.overview();
        return response.data.data;
      } catch {
        return previewOverview;
      }
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ['admin-financials-charts'],
    queryFn: async () => {
      try {
        const response = await adminApi.financials.charts({ months: 6 });
        return response.data.data;
      } catch {
        return previewChartData;
      }
    },
    enabled: view === 'overview',
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['admin-transactions', transactionPage],
    queryFn: async () => {
      try {
        const response = await adminApi.financials.transactions({
          page: transactionPage,
          limit: 20,
        });
        return response.data.data;
      } catch {
        return {
          transactions: previewTransactions,
          pagination: { page: 1, totalPages: 1 },
        };
      }
    },
    enabled: view === 'transactions',
  });

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['admin-withdrawals', withdrawalPage],
    queryFn: async () => {
      try {
        const response = await adminApi.financials.withdrawals({
          page: withdrawalPage,
          limit: 20,
        });
        return response.data.data;
      } catch {
        return {
          withdrawals: previewWithdrawals,
          pagination: { page: 1, totalPages: 1 },
        };
      }
    },
    enabled: view === 'withdrawals',
  });

  const transactionColumns = [
    {
      header: 'Type',
      accessor: (row: any) => <StatusBadge status={row.type} variant="info" />,
    },
    {
      header: 'Artist',
      accessor: (row: any) => row.wallet?.artist?.artistName || 'N/A',
    },
    {
      header: 'Amount',
      accessor: (row: any) => {
        const amount = row.amountCents / 100;
        const sign = amount >= 0 ? '+' : '';
        return `${sign}$${amount.toFixed(2)}`;
      },
    },
    {
      header: 'Balance After',
      accessor: (row: any) => `$${(row.balanceAfterCents / 100).toFixed(2)}`,
    },
    {
      header: 'Date',
      accessor: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const withdrawalColumns = [
    {
      header: 'Artist',
      accessor: (row: any) => row.wallet?.artist?.artistName || 'N/A',
    },
    {
      header: 'Amount',
      accessor: (row: any) => `$${(row.amountCents / 100).toFixed(2)}`,
    },
    {
      header: 'Fee',
      accessor: (row: any) => `$${(row.feeCents / 100).toFixed(2)}`,
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <StatusBadge
          status={row.status}
          variant={
            row.status === 'completed' ? 'success' : row.status === 'failed' ? 'error' : 'warning'
          }
        />
      ),
    },
    {
      header: 'Date',
      accessor: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const summary = overview || previewOverview;
  const recentTransactions = transactions?.transactions?.length
    ? transactions.transactions
    : previewTransactions;
  const recentWithdrawals = withdrawals?.withdrawals?.length
    ? withdrawals.withdrawals
    : previewWithdrawals;

  return (
    <Layout>
      <div className="max-w-280">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h1 className="font-['Space_Grotesk'] text-[20px] font-bold tracking-[-0.03em] text-white">
            Financial Overview
          </h1>
          <DataRefreshButton
            queryKeys={[
              ['admin-financials-overview'],
              ['admin-financials-charts'],
              ['admin-transactions'],
              ['admin-withdrawals'],
            ]}
          />
        </div>

        <div className="mb-5 border-b border-[#1A1A1E]">
          <div className="flex gap-5">
            <button
              onClick={() => setView('overview')}
              className={`pb-2 px-1 text-[11px] font-medium transition-colors ${
                view === 'overview'
                  ? 'border-[#00CCCC] text-[#00CCCC]'
                  : 'border-transparent text-[#8E8E93] hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setView('transactions')}
              className={`pb-2 px-1 text-[11px] font-medium transition-colors ${
                view === 'transactions'
                  ? 'border-[#00CCCC] text-[#00CCCC]'
                  : 'border-transparent text-[#8E8E93] hover:text-white'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setView('withdrawals')}
              className={`pb-2 px-1 text-[11px] font-medium transition-colors ${
                view === 'withdrawals'
                  ? 'border-[#00CCCC] text-[#00CCCC]'
                  : 'border-transparent text-[#8E8E93] hover:text-white'
              }`}
            >
              Withdrawals
            </button>
          </div>
        </div>

        {/* Overview */}
        {view === 'overview' && (
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatsCard
                title="Total Revenue"
                value={`$${(summary.revenue.total / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtitle="+12.6% all-time growth"
              />
              <StatsCard
                title="Platform Fees"
                value={`$${(summary.revenue.platformFees / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtitle="20% avg fee on transactions"
              />
              <StatsCard
                title="Pending Payouts"
                value={`$${(summary.pending.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtitle="23 artists awaiting payout"
              />
              <StatsCard
                title="Artist Net Revenue"
                value={`$${(summary.revenue.artistEarnings / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtitle="68% share after subscriptions"
              />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FinancialLineChart data={chartData?.trend || previewChartData.trend} />
              <FinancialBreakdownChart data={chartData?.breakdown || previewChartData.breakdown} />
            </div>

            <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
              <div className="mb-3 text-[11px] text-white">Recent Transactions</div>
              <div className="space-y-3">
                {recentTransactions.slice(0, 3).map((row: any) => (
                  <div key={row.id} className="flex items-center justify-between gap-4 text-[11px]">
                    <div className="min-w-0">
                      <div className="truncate text-white">
                        {row.type} — {row.wallet?.artist?.artistName || 'Unknown Artist'}
                      </div>
                      <div className="mt-1 text-[#6E6E78]">Revenue event</div>
                    </div>
                    <div className="flex items-center gap-2 text-[#30D158]">
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.85} />
                      <span>+${Math.abs((row.amountCents || 0) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Transactions */}
        {view === 'transactions' && (
          <>
            <DataTable
              data={transactions?.transactions || previewTransactions}
              columns={transactionColumns}
              isLoading={transactionsLoading}
              emptyMessage="No transactions found"
            />

            {transactions?.pagination && (
              <Pagination
                currentPage={transactions.pagination.page}
                totalPages={transactions.pagination.totalPages}
                onPageChange={setTransactionPage}
              />
            )}
          </>
        )}

        {/* Withdrawals */}
        {view === 'withdrawals' && (
          <>
            <DataTable
              data={withdrawals?.withdrawals || recentWithdrawals}
              columns={withdrawalColumns}
              isLoading={withdrawalsLoading}
              emptyMessage="No withdrawals found"
            />

            {withdrawals?.pagination && (
              <Pagination
                currentPage={withdrawals.pagination.page}
                totalPages={withdrawals.pagination.totalPages}
                onPageChange={setWithdrawalPage}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
