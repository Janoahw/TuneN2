import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { adminApi } from '../services/api';

export default function UsersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'fan' | 'artist' | 'admin' | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'active' | 'banned' | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter],
    queryFn: async () => {
      const response = await adminApi.users.list({
        page,
        limit: 20,
        search: search || undefined,
        role: roleFilter,
        status: statusFilter,
      });
      return response.data.data;
    },
  });

  const columns = [
    {
      header: 'User',
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          {row.avatarUrl && (
            <img src={row.avatarUrl} alt={row.displayName} className="w-10 h-10 rounded-full" />
          )}
          <div>
            <div className="font-medium">{row.displayName}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (row: any) => {
        if (row.isAdmin) return 'Admin';
        if (row.isArtist) return 'Artist';
        return 'Fan';
      },
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <StatusBadge
          status={row.isBanned ? 'Banned' : 'Active'}
          variant={row.isBanned ? 'error' : 'success'}
        />
      ),
    },
    {
      header: 'Joined',
      accessor: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">View and manage all platform users</p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar placeholder="Search by email or name..." onSearch={setSearch} />

          <select
            value={roleFilter || ''}
            onChange={(e) => setRoleFilter(e.target.value ? (e.target.value as any) : undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
          >
            <option value="">All Roles</option>
            <option value="fan">Fans</option>
            <option value="artist">Artists</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value ? (e.target.value as any) : undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        {/* Users table */}
        <DataTable
          data={data?.users || []}
          columns={columns}
          isLoading={isLoading}
          onRowClick={(user) => navigate(`/users/${user.id}`)}
          emptyMessage="No users found"
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
