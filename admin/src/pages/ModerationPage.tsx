import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { adminApi } from '../services/api';

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    'pending' | 'resolved' | 'dismissed' | undefined
  >(undefined);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [removeContent, setRemoveContent] = useState(false);

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

  const updateMutation = useMutation({
    mutationFn: async ({
      reportId,
      status,
    }: {
      reportId: string;
      status: 'pending' | 'resolved' | 'dismissed';
    }) => {
      return adminApi.reports.update(reportId, {
        status,
        resolution: resolution || undefined,
        removeContent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      setSelectedReport(null);
      setResolution('');
      setRemoveContent(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600 mt-2">Review and manage reported content</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value ? (e.target.value as any) : undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
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
          onRowClick={(report) => setSelectedReport(report)}
          emptyMessage="No reports found"
        />

        {data?.pagination && (
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        )}

        {/* Review Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Review Report</h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Report Type</p>
                <StatusBadge status={selectedReport.reportType} variant="warning" />
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Target</p>
                <p className="font-medium">
                  {selectedReport.targetType} (ID: {selectedReport.targetId})
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Reason</p>
                <p className="text-gray-900">{selectedReport.reason}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Reported by</p>
                <p className="font-medium">User ID: {selectedReport.reporterId}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Current Status</p>
                <StatusBadge status={selectedReport.status} />
              </div>

              {selectedReport.status === 'pending' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">
                      Resolution Notes (optional)
                    </label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                      rows={3}
                      placeholder="Add notes about your decision..."
                    />
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={removeContent}
                        onChange={(e) => setRemoveContent(e.target.checked)}
                        className="w-4 h-4 text-[#00CCCC] focus:ring-[#00CCCC]"
                      />
                      <span className="text-sm text-gray-700">Remove content from platform</span>
                    </label>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          reportId: selectedReport.id,
                          status: 'dismissed',
                        })
                      }
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          reportId: selectedReport.id,
                          status: 'resolved',
                        })
                      }
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 bg-[#00CCCC] text-white rounded-lg hover:bg-[#00BBBB] disabled:opacity-50"
                    >
                      {updateMutation.isPending ? 'Processing...' : 'Resolve'}
                    </button>
                  </div>
                </>
              )}

              {selectedReport.status !== 'pending' && (
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
