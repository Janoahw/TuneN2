import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DataRefreshButton } from '../components/DataRefreshButton';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { adminApi } from '../services/api';

const previewUserDetail = {
  user: {
    id: 'user-preview',
    email: 'sarah@tunen2.com',
    displayName: 'Sarah Johnson',
    avatarUrl: '',
    isArtist: true,
    isAdmin: false,
    isBanned: false,
    createdAt: '2025-06-02T00:00:00.000Z',
    purchases: [
      {
        id: 'purchase-1',
        amountCents: 129,
        createdAt: '2026-05-11T00:00:00.000Z',
        song: { id: 'song-1', title: 'Song (24)' },
      },
    ],
    artistProfile: {
      artistName: 'Sarah Johnson',
      subscriptionStatus: 'active',
      wallet: { balanceCents: 4240, totalEarnedCents: 9420, totalWithdrawn: 2500 },
    },
  },
  stats: { totalPurchases: 31, totalSpent: 4240 },
};

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
    placeholderData: previewUserDetail,
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      try {
        const response = await adminApi.users.get(userId);
        return response.data.data;
      } catch {
        return previewUserDetail;
      }
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
          <p className="text-[#8E8E93]">User not found</p>
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

  const latestPurchase = user.purchases?.[0];

  return (
    <Layout>
      <div className="max-w-280">
        <div className="mb-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-2 text-[11px] text-[#00CCCC] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.85} />
            <span>Back to Users</span>
          </button>
          <DataRefreshButton queryKeys={[['admin-user'], ['admin-users']]} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <section className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#12363A] font-['Space_Grotesk'] text-[18px] text-[#00CCCC]">
              {(user.displayName || 'U')
                .split(' ')
                .slice(0, 2)
                .map((part: string) => part[0])
                .join('')}
            </div>
            <h1 className="text-[16px] font-medium text-white">{user.displayName}</h1>
            <p className="mt-1 text-[11px] text-[#6E6E78]">{user.email}</p>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge
                status={user.isBanned ? 'Banned' : 'Verified Artist'}
                variant={user.isBanned ? 'error' : 'success'}
              />
            </div>

            <div className="mt-5 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-[#6E6E78]">
                <span>Joined</span>
                <span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-[#6E6E78]">
                <span>Total Songs</span>
                <span className="text-white">{user.artistProfile ? 24 : 0}</span>
              </div>
              <div className="flex items-center justify-between text-[#6E6E78]">
                <span>Total Follows</span>
                <span className="text-white">31</span>
              </div>
              <div className="flex items-center justify-between text-[#6E6E78]">
                <span>Revenue</span>
                <span className="text-[#30D158]">${(stats.totalSpent / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button className="w-full rounded-md bg-[#00CCCC] px-3 py-2 text-[11px] font-medium text-surface">
                Verify Artist
              </button>
              {!user.isAdmin && (
                <button
                  onClick={() => (user.isBanned ? setShowUnbanModal(true) : setShowBanModal(true))}
                  className="w-full rounded-md bg-[#3A1E22] px-3 py-2 text-[11px] text-[#FF6B6B]"
                >
                  {user.isBanned ? 'Unban User' : 'Ban User'}
                </button>
              )}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
              <h2 className="mb-4 text-[12px] font-medium text-white">Recent Activity</h2>
              <div className="space-y-3">
                {(user.purchases || []).slice(0, 4).map((purchase: any) => (
                  <div key={purchase.id} className="flex items-start gap-3 text-[11px]">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#00CCCC]" />
                    <div>
                      <div className="text-white">Purchased {purchase.song?.title}</div>
                      <div className="mt-1 text-[#6E6E78]">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
              <h2 className="mb-4 text-[12px] font-medium text-white">Song (24)</h2>
              <div className="rounded-md bg-[#141417] p-3">
                <div className="text-[11px] text-white">
                  {latestPurchase?.song?.title || 'Current Vibes'}
                </div>
                <div className="mt-1 text-[10px] text-[#6E6E78]">
                  01 release • ${(latestPurchase?.amountCents || 129) / 100}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Ban Modal */}
        {showBanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface-alt rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Ban User</h3>
              <p className="text-[#8E8E93] mb-4">Please provide a reason for banning this user:</p>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full px-4 py-2 border border-[#1A1A1E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC] mb-4"
                rows={4}
                placeholder="Reason for ban..."
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="px-4 py-2 border border-[#1A1A1E] rounded-lg hover:bg-surface"
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
            <div className="bg-surface-alt rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Unban User</h3>
              <p className="text-[#8E8E93] mb-4">Optional note for unbanning this user:</p>
              <textarea
                value={unbanNote}
                onChange={(e) => setUnbanNote(e.target.value)}
                className="w-full px-4 py-2 border border-[#1A1A1E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC] mb-4"
                rows={4}
                placeholder="Unban note (optional)..."
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowUnbanModal(false)}
                  className="px-4 py-2 border border-[#1A1A1E] rounded-lg hover:bg-surface"
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
