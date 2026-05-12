import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataRefreshButton } from '../components/DataRefreshButton';
import { Layout } from '../components/Layout';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { adminApi } from '../services/api';

const previewUsers = [
  {
    id: 'preview-1',
    displayName: 'Busola Johnson',
    email: 'busola@tunen2.com',
    isAdmin: false,
    isArtist: true,
    isBanned: false,
    createdAt: '2026-04-14T00:00:00.000Z',
  },
  {
    id: 'preview-2',
    displayName: 'Miley Grant',
    email: 'miley@tunen2.com',
    isAdmin: false,
    isArtist: false,
    isBanned: false,
    createdAt: '2026-03-02T00:00:00.000Z',
  },
  {
    id: 'preview-3',
    displayName: 'Rick Rivers',
    email: 'rick@tunen2.com',
    isAdmin: false,
    isArtist: true,
    isBanned: true,
    createdAt: '2025-12-20T00:00:00.000Z',
  },
];

export default function UsersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'fan' | 'artist' | 'admin' | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'active' | 'banned' | undefined>(undefined);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const clearAllFilters = () => {
    setSearch('');
    setRoleFilter(undefined);
    setStatusFilter(undefined);
    setPage(1);
    setShowFilterMenu(false);
  };

  const handleRoleFilter = (value: 'fan' | 'artist' | 'admin') => {
    setRoleFilter(roleFilter === value ? undefined : value);
    setPage(1);
  };

  const handleStatusFilter = (value: 'active' | 'banned') => {
    setStatusFilter(statusFilter === value ? undefined : value);
    setPage(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter],
    placeholderData: {
      users: previewUsers,
      pagination: {
        page: 1,
        totalPages: 1,
      },
    },
    queryFn: async () => {
      try {
        const response = await adminApi.users.list({
          page,
          limit: 20,
          search: search || undefined,
          role: roleFilter,
          status: statusFilter,
        });
        return response.data.data;
      } catch {
        return {
          users: previewUsers,
          pagination: {
            page: 1,
            totalPages: 1,
          },
        };
      }
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
            <div className="text-sm text-[#8E8E93]">{row.email}</div>
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

  const visibleUsers = data?.users?.length ? data.users : previewUsers;
  const totalUsers = Number(data?.pagination?.total || visibleUsers.length || 0);

  return (
    <Layout>
      <div className="max-w-280">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-['Space_Grotesk'] text-[20px] font-bold tracking-[-0.03em] text-white">
              Users Management
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DataRefreshButton queryKeys={[['admin-users']]} />
            <div className="inline-flex h-7 items-center rounded-md border border-[#2A2A2E] bg-[#121216] px-3 text-[10px] font-medium text-[#8E8E93]">
              {totalUsers.toLocaleString()} Users
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-70 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8E93]"
              strokeWidth={1.8}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search users by name..."
              className="h-9 w-full rounded-lg border border-[#1A1A1E] bg-surface-alt pl-11 pr-4 text-[13px] text-white placeholder-[#6E6E78] outline-none transition focus:border-[#00CCCC]"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterMenu((current) => !current)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                showFilterMenu || statusFilter
                  ? 'bg-[#00CCCC] text-surface'
                  : 'bg-surface-alt text-[#8E8E93] hover:text-white'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-11 z-20 w-56 rounded-lg border border-[#1A1A1E] bg-surface-alt p-3 shadow-xl">
                <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.03em] text-[#8E8E93]">
                  Advanced Filters
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleStatusFilter('active')}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-[11px] transition ${
                      statusFilter === 'active'
                        ? 'bg-[#1A1A1E] text-white'
                        : 'text-[#8E8E93] hover:bg-[#1A1A1E] hover:text-white'
                    }`}
                  >
                    <span>Active users</span>
                    <span>{statusFilter === 'active' ? 'On' : 'Off'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusFilter('banned')}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-[11px] transition ${
                      statusFilter === 'banned'
                        ? 'bg-[#1A1A1E] text-white'
                        : 'text-[#8E8E93] hover:bg-[#1A1A1E] hover:text-white'
                    }`}
                  >
                    <span>Banned users</span>
                    <span>{statusFilter === 'banned' ? 'On' : 'Off'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-3 w-full rounded-md border border-[#2A2A2E] px-3 py-2 text-[11px] text-[#8E8E93] transition hover:bg-[#1A1A1E] hover:text-white"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={clearAllFilters}
            className={`h-9 rounded-lg px-4 text-[11px] font-medium transition ${
              !search && !roleFilter && !statusFilter
                ? 'bg-[#1A1A1E] text-white'
                : 'bg-surface-alt text-[#8E8E93] hover:text-white'
            }`}
          >
            All
          </button>

          {[
            { label: 'Fans', value: 'fan' },
            { label: 'Artists', value: 'artist' },
            { label: 'Admins', value: 'admin' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleRoleFilter(item.value as 'fan' | 'artist' | 'admin')}
              className={`h-9 rounded-lg px-4 text-[11px] font-medium transition ${
                roleFilter === item.value
                  ? 'bg-[#1A1A1E] text-white'
                  : 'bg-surface-alt text-[#8E8E93] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => handleStatusFilter('banned')}
            className={`h-9 rounded-lg px-4 text-[11px] font-medium transition ${
              statusFilter === 'banned'
                ? 'bg-[#1A1A1E] text-white'
                : 'bg-surface-alt text-[#8E8E93] hover:text-white'
            }`}
          >
            Banned
          </button>
        </div>

        <DataTable
          data={visibleUsers}
          columns={columns}
          isLoading={isLoading && !data}
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
