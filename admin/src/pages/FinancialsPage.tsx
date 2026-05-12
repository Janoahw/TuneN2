import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { StatsCard } from '../components/StatsCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { adminApi } from '../services/api';

export default function FinancialsPage() {
  const [view, setView] = useState<'overview' | 'transactions' | 'withdrawals'>(
    'overview',
  );
  const [transactionPage, setTransactionPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);

  const { data: overview } = useQuery({
    queryKey: ['admin-financials-overview'],
    queryFn: async () => {
      const response = await adminApi.financials.overview();
      return response.data.data;
    },
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['admin-transactions', transactionPage],
    queryFn: async () => {
      const response = await adminApi.financials.transactions({
        page: transactionPage,
        limit: 20,
      });
      return response.data.data;
    },
    enabled: view === 'transactions',
  });

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['admin-withdrawals', withdrawalPage],
    queryFn: async () => {
      const response = await adminApi.financials.withdrawals({
        page: withdrawalPage,
        limit: 20,
      });
      return response.data.data;
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
      accessor: (row: any) =>
        row.wallet?.artist?.artistName || 'N/A',
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
            row.status === 'completed'
              ? 'success'
              : row.status === 'failed'
                ? 'error'
                : 'warning'
          }
        />
      ),
    },
    {
      header: 'Date',
      accessor: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor platform revenue, payouts, and transactions
          </p>
        </div>

        {/* View Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setView('overview')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                view === 'overview'
                  ? 'border-[#00CCCC] text-[#00CCCC]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setView('transactions')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                view === 'transactions'
                  ? 'border-[#00CCCC] text-[#00CCCC]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setView('withdrawals')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                view === 'withdrawals'
                  ? 'border-[#00CCCC] text-[#00CCCC]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Withdrawals
            </button>
          </div>
        </div>

        {/* Overview */}
        {view === 'overview' && overview && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Revenue"
                value={`$${(overview.revenue.total / 100).toFixed(2)}`}
              />
              <StatsCard
                title="Platform Fees"
                value={`$${(overview.revenue.platformFees / 100).toFixed(2)}`}
              />
              <StatsCard
                title="Artist Earnings"
                value={`$${(overview.revenue.artistEarnings / 100).toFixed(2)}`}
              />
              <StatsCard
                title="Transactions"
                value={overview.revenue.transactionCount}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total Withdrawals"
                value={`$${(overview.withdrawals.completed / 100).toFixed(2)}`}
              />
              <StatsCard
                title="Withdrawal Fees"
                value={`$${(overview.withdrawals.fees / 100).toFixed(2)}`}
              />
              <StatsCard
                title="Pending Withdrawals"
                value={`$${(overview.pending.amount / 100).toFixed(2)}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Active Artists"
                value={overview.platform.activeArtists}
              />
              <StatsCard title="Total Fans" value={overview.platform.totalFans} />
              <StatsCard
                title="Total Songs"
                value={overview.platform.totalSongs}
              />
            </div>
          </>
        )}

        {/* Transactions */}
        {view === 'transactions' && (
          <>
            <DataTable
              data={transactions?.transactions || []}
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
              data={withdrawals?.withdrawals || []}
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
