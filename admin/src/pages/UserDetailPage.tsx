import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { DataTable } from '../components/DataTable';
import { adminApi } from '../services/api';

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [banReason, setBanReason] = useState('');
  const [unbanNote, setUnbanNote] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await adminApi.users.get(userId);
      return response.data.data;
    },
    enabled: !!userId,
  });

  const banMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return adminApi.users.ban(userId, banReason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      setShowBanModal(false);
      setBanReason('');
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return adminApi.users.unban(userId, unbanNote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      setShowUnbanModal(false);
      setUnbanNote('');
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00CCCC] border-r-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">User not found</p>
          <button
            onClick={() => navigate('/users')}
            className="mt-4 text-[#00CCCC] hover:underline"
          >
            Back to Users
          </button>
        </div>
      </Layout>
    );
  }

  const { user, stats } = data;

  const purchaseColumns = [
    {
      header: 'Song',
      accessor: (row: any) => row.song.title,
    },
    {
      header: 'Amount',
      accessor: (row: any) => `$${(row.amountCents / 100).toFixed(2)}`,
    },
    {
      header: 'Date',
      accessor: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <Layout>
      <div className="max-w-5xl">
        <button
          onClick={() => navigate('/users')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to Users
        </button>

        {/* User Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-20 h-20 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.displayName}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge
                    status={user.isBanned ? 'Banned' : 'Active'}
                    variant={user.isBanned ? 'error' : 'success'}
                  />
                  <span className="text-sm text-gray-600">
                    {user.isAdmin
                      ? 'Admin'
                      : user.isArtist
                        ? 'Artist'
                        : 'Fan'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {!user.isAdmin && (
                <>
                  {user.isBanned ? (
                    <button
                      onClick={() => setShowUnbanModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Unban User
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowBanModal(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Ban User
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 font-medium">
              Total Purchases
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalPurchases}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 font-medium">Total Spent</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${(stats.totalSpent / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Artist Profile */}
        {user.artistProfile && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Artist Profile
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Artist Name</p>
                <p className="font-medium">{user.artistProfile.artistName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Subscription Status</p>
                <StatusBadge
                  status={user.artistProfile.subscriptionStatus}
                  variant={
                    user.artistProfile.subscriptionStatus === 'active'
                      ? 'success'
                      : 'warning'
                  }
                />
              </div>
              {user.artistProfile.wallet && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Balance</p>
                    <p className="font-medium">
                      $
                      {(
                        user.artistProfile.wallet.balanceCents / 100
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Earned</p>
                    <p className="font-medium">
                      $
                      {(
                        user.artistProfile.wallet.totalEarnedCents / 100
                      ).toFixed(2)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Recent Purchases */}
        {user.purchases && user.purchases.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Purchases
            </h2>
            <DataTable
              data={user.purchases}
              columns={purchaseColumns}
              emptyMessage="No purchases yet"
            />
          </div>
        )}

        {/* Ban Modal */}
        {showBanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Ban User</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for banning this user:
              </p>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC] mb-4"
                rows={4}
                placeholder="Reason for ban..."
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => banMutation.mutate()}
                  disabled={!banReason || banMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {banMutation.isPending ? 'Banning...' : 'Ban User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unban Modal */}
        {showUnbanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Unban User</h3>
              <p className="text-gray-600 mb-4">
                Optional note for unbanning this user:
              </p>
              <textarea
                value={unbanNote}
                onChange={(e) => setUnbanNote(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC] mb-4"
                rows={4}
                placeholder="Unban note (optional)..."
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowUnbanModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => unbanMutation.mutate()}
                  disabled={unbanMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {unbanMutation.isPending ? 'Unbanning...' : 'Unban User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
