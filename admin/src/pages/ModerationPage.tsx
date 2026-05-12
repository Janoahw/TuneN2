import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { adminApi } from '../services/api';

export default function ModerationPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    'pending' | 'resolved' | 'dismissed' | undefined
  >(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', page, statusFilter],
    queryFn: async () => {
      const response = await adminApi.reports.list({
        page,
        limit: 20,
        status: statusFilter,
      });
      return response.data.data;
    },
  });

  const columns = [
    {
      header: 'Type',
      accessor: (row: any) => (
        <StatusBadge
          status={row.reportType}
          variant={
            row.reportType === 'spam'
              ? 'warning'
              : row.reportType === 'inappropriate'
                ? 'error'
                : 'default'
          }
        />
      ),
    },
    {
      header: 'Content',
      accessor: (row: any) => (row.targetType === 'song' ? 'Song' : 'Artist Profile'),
    },
    {
      header: 'Reason',
      accessor: (row: any) => <div className="max-w-xs truncate">{row.reason}</div>,
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <StatusBadge
          status={row.status}
          variant={
            row.status === 'pending' ? 'warning' : row.status === 'resolved' ? 'success' : 'default'
          }
        />
      ),
    },
    {
      header: 'Reported',
      accessor: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Content Moderation</h1>
          <p className="text-[#8E8E93] mt-2">Review and manage reported content</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value ? (e.target.value as any) : undefined)}
            className="px-4 py-2 border border-[#1A1A1E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
          >
            <option value="">All Reports</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* Reports table */}
        <DataTable
          data={data?.reports || []}
          columns={columns}
          isLoading={isLoading}
          onRowClick={(report) => navigate(`/reports/${report.id}`)}
          emptyMessage="No reports found"
        />

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
