import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { adminApi } from '../services/api';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'platform' | 'genres'>('platform');
  const [editingSettings, setEditingSettings] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [newGenre, setNewGenre] = useState({ name: '', slug: '' });

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await adminApi.settings.get();
      return response.data.data;
    },
    enabled: view === 'platform',
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return adminApi.settings.update(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setEditingSettings(false);
    },
  });

  const createGenreMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      return adminApi.genres.create(data);
    },
    onSuccess: () => {
      setNewGenre({ name: '', slug: '' });
      alert('Genre created successfully!');
    },
  });

  const handleEditSettings = () => {
    setFormData(settings);
    setEditingSettings(true);
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      commissionRate: parseFloat(formData.commissionRate),
      minSongPrice: Math.round(parseFloat(formData.minSongPrice) * 100),
      maxSongPrice: Math.round(parseFloat(formData.maxSongPrice) * 100),
      artistSubscriptionPrice: Math.round(parseFloat(formData.artistSubscriptionPrice) * 100),
      withdrawalFeeRate: parseFloat(formData.withdrawalFeeRate),
      minWithdrawalAmount: Math.round(parseFloat(formData.minWithdrawalAmount) * 100),
    });
  };

  const handleGenreSlugGenerate = () => {
    const slug = newGenre.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setNewGenre({ ...newGenre, slug });
  };

  return (
    <Layout>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-[#8E8E93] mt-2">Manage platform configuration and genres</p>
        </div>

        {/* View Tabs */}
        <div className="mb-6 border-b border-[#1A1A1E]">
          <div className="flex gap-8">
            <button
              onClick={() => setView('platform')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                view === 'platform'
                  ? 'border-[#00CCCC] text-[#00CCCC]'
                  : 'border-transparent text-[#8E8E93] hover:text-white'
              }`}
            >
              Platform Settings
            </button>
            <button
              onClick={() => setView('genres')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                view === 'genres'
                  ? 'border-[#00CCCC] text-[#00CCCC]'
                  : 'border-transparent text-[#8E8E93] hover:text-white'
              }`}
            >
              Genre Management
            </button>
          </div>
        </div>

        {/* Platform Settings */}
        {view === 'platform' && settings && (
          <div className="bg-[#111114] rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Platform Configuration</h2>
              {!editingSettings && (
                <button
                  onClick={handleEditSettings}
                  className="px-4 py-2 bg-[#00CCCC] text-white rounded-lg hover:bg-[#00BBBB]"
                >
                  Edit Settings
                </button>
              )}
            </div>

            {!editingSettings ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-[#8E8E93]">Commission Rate</p>
                  <p className="text-lg font-medium">
                    {(settings.commissionRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#8E8E93]">Min Song Price</p>
                  <p className="text-lg font-medium">${(settings.minSongPrice / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#8E8E93]">Max Song Price</p>
                  <p className="text-lg font-medium">${(settings.maxSongPrice / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#8E8E93]">Artist Subscription Price</p>
                  <p className="text-lg font-medium">
                    ${(settings.artistSubscriptionPrice / 100).toFixed(2)}/month
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#8E8E93]">Withdrawal Fee Rate</p>
                  <p className="text-lg font-medium">
                    {(settings.withdrawalFeeRate * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#8E8E93]">Min Withdrawal Amount</p>
                  <p className="text-lg font-medium">
                    ${(settings.minWithdrawalAmount / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm text-[#8E8E93] mb-2">Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={(formData.commissionRate * 100).toFixed(1)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commissionRate: parseFloat(e.target.value) / 100,
                        })
                      }
                      className="w-full px-4 py-2 border border-[#1A1A1E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8E8E93] mb-2">Min Song Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={(formData.minSongPrice / 100).toFixed(2)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minSongPrice: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-[#1A1A1E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8E8E93] mb-2">Max Song Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={(formData.maxSongPrice / 100).toFixed(2)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxSongPrice: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-[#1A1A1E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8E8E93] mb-2">
                      Artist Subscription ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={(formData.artistSubscriptionPrice / 100).toFixed(2)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          artistSubscriptionPrice: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-[#1A1A1E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8E8E93] mb-2">Withdrawal Fee (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={(formData.withdrawalFeeRate * 100).toFixed(2)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          withdrawalFeeRate: parseFloat(e.target.value) / 100,
                        })
                      }
                      className="w-full px-4 py-2 border border-[#1A1A1E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8E8E93] mb-2">Min Withdrawal ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={(formData.minWithdrawalAmount / 100).toFixed(2)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minWithdrawalAmount: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-[#1A1A1E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingSettings(false)}
                    className="px-4 py-2 border border-[#1A1A1E] rounded-lg hover:bg-[#0D0D0F]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={updateSettingsMutation.isPending}
                    className="px-4 py-2 bg-[#00CCCC] text-white rounded-lg hover:bg-[#00BBBB] disabled:opacity-50"
                  >
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Genre Management */}
        {view === 'genres' && (
          <div className="bg-[#111114] rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-white mb-6">Create New Genre</h2>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm text-[#8E8E93] mb-2">Genre Name</label>
                <input
                  type="text"
                  value={newGenre.name}
                  onChange={(e) => setNewGenre({ ...newGenre, name: e.target.value })}
                  onBlur={handleGenreSlugGenerate}
                  className="w-full px-4 py-2 border border-[#1A1A1E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                  placeholder="e.g., Hip Hop"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8E8E93] mb-2">Slug (URL-friendly)</label>
                <input
                  type="text"
                  value={newGenre.slug}
                  onChange={(e) => setNewGenre({ ...newGenre, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-[#1A1A1E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                  placeholder="e.g., hip-hop"
                />
              </div>
            </div>

            <button
              onClick={() => createGenreMutation.mutate(newGenre)}
              disabled={!newGenre.name || !newGenre.slug || createGenreMutation.isPending}
              className="px-4 py-2 bg-[#00CCCC] text-white rounded-lg hover:bg-[#00BBBB] disabled:opacity-50"
            >
              {createGenreMutation.isPending ? 'Creating...' : 'Create Genre'}
            </button>

            <p className="text-sm text-gray-500 mt-6">
              Note: To view, edit, or delete existing genres, use the database admin panel or API
              directly. Full genre CRUD UI coming in future updates.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
