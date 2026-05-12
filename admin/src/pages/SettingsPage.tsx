import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataRefreshButton } from '../components/DataRefreshButton';
import { Layout } from '../components/Layout';
import { Pagination } from '../components/Pagination';
import { adminApi } from '../services/api';

const previewSettings = {
  platformName: 'TuneN2',
  supportEmail: 'support@tunen2.com',
  maxUploadSizeMb: 50,
  commissionRate: 0.2,
  minSongPrice: 99,
  maxSongPrice: 99999,
  artistSubscriptionPrice: 999,
  withdrawalFeeRate: 0.0023,
  minWithdrawalAmount: 1000,
  autoModeration: true,
  allowDownloads: true,
  analyticsSync: true,
  maintenanceMode: false,
  signupsPerHour: 100,
  songUploadsPerMinute: 5,
  webhookTimeout: 30,
};

const previewGenres = [
  { id: 1, name: 'Afrobeats', slug: 'afrobeats', _count: { songs: 25 } },
  { id: 2, name: 'R&B', slug: 'r-b', _count: { songs: 18 } },
];

const feeFieldMap = {
  'Song Sale Platform Fee': 'commissionRate',
  'Subscription Platform Fee': 'withdrawalFeeRate',
  'Artist Monthly Fee': 'artistSubscriptionPrice',
  'Min Withdrawal Amount': 'minWithdrawalAmount',
} as const;

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'platform' | 'genres'>('platform');
  const [editingSettings, setEditingSettings] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [newGenre, setNewGenre] = useState({ name: '', slug: '' });
  const [genreSearch, setGenreSearch] = useState('');
  const [genrePage, setGenrePage] = useState(1);
  const [editingGenreId, setEditingGenreId] = useState<number | null>(null);
  const [editingGenre, setEditingGenre] = useState({ name: '', slug: '' });

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    placeholderData: previewSettings,
    queryFn: async () => {
      try {
        const response = await adminApi.settings.get();
        return response.data.data;
      } catch {
        return previewSettings;
      }
    },
    enabled: view === 'platform',
  });

  const { data: genresData, isLoading: genresLoading } = useQuery({
    queryKey: ['admin-genres', genrePage, genreSearch],
    placeholderData: {
      items: previewGenres,
      pagination: { page: 1, limit: 10, total: previewGenres.length, totalPages: 1 },
    },
    queryFn: async () => {
      try {
        const response = await adminApi.genres.list({
          page: genrePage,
          limit: 10,
          search: genreSearch.trim() || undefined,
        });
        return response.data.data;
      } catch {
        return {
          items: previewGenres,
          pagination: { page: 1, limit: 10, total: previewGenres.length, totalPages: 1 },
        };
      }
    },
    enabled: view === 'genres',
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
      queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
    },
  });

  const updateGenreMutation = useMutation({
    mutationFn: async (data: { genreId: number; name: string; slug: string }) => {
      return adminApi.genres.update(String(data.genreId), { name: data.name, slug: data.slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
      setEditingGenreId(null);
      setEditingGenre({ name: '', slug: '' });
    },
  });

  const deleteGenreMutation = useMutation({
    mutationFn: async (genreId: number) => adminApi.genres.delete(String(genreId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      platformName: formData.platformName.trim(),
      supportEmail: formData.supportEmail.trim(),
      maxUploadSizeMb: Math.round(Number(formData.maxUploadSizeMb)),
      commissionRate: Number(formData.commissionRate) / 100,
      minSongPrice: Math.round(Number(formData.minSongPrice) * 100),
      maxSongPrice: Math.round(Number(formData.maxSongPrice) * 100),
      artistSubscriptionPrice: Math.round(Number(formData.artistSubscriptionPrice) * 100),
      withdrawalFeeRate: Number(formData.withdrawalFeeRate) / 100,
      minWithdrawalAmount: Math.round(Number(formData.minWithdrawalAmount) * 100),
      autoModeration: Boolean(formData.autoModeration),
      allowDownloads: Boolean(formData.allowDownloads),
      analyticsSync: Boolean(formData.analyticsSync),
      maintenanceMode: Boolean(formData.maintenanceMode),
      signupsPerHour: Math.round(Number(formData.signupsPerHour)),
      songUploadsPerMinute: Math.round(Number(formData.songUploadsPerMinute)),
      webhookTimeout: Math.round(Number(formData.webhookTimeout)),
    });
  };

  const handleGenreSlugGenerate = () => {
    const slug = newGenre.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setNewGenre({ ...newGenre, slug });
  };

  const activeSettings = settings || previewSettings;
  const genreItems = genresData?.items || previewGenres;

  const handleStartEditing = () => {
    setFormData({
      platformName: activeSettings.platformName,
      supportEmail: activeSettings.supportEmail,
      maxUploadSizeMb: String(activeSettings.maxUploadSizeMb),
      commissionRate: String((activeSettings.commissionRate * 100).toFixed(2)),
      minSongPrice: String((activeSettings.minSongPrice / 100).toFixed(2)),
      maxSongPrice: String((activeSettings.maxSongPrice / 100).toFixed(2)),
      artistSubscriptionPrice: String((activeSettings.artistSubscriptionPrice / 100).toFixed(2)),
      withdrawalFeeRate: String((activeSettings.withdrawalFeeRate * 100).toFixed(2)),
      minWithdrawalAmount: String((activeSettings.minWithdrawalAmount / 100).toFixed(2)),
      autoModeration: activeSettings.autoModeration,
      allowDownloads: activeSettings.allowDownloads,
      analyticsSync: activeSettings.analyticsSync,
      maintenanceMode: activeSettings.maintenanceMode,
      signupsPerHour: String(activeSettings.signupsPerHour),
      songUploadsPerMinute: String(activeSettings.songUploadsPerMinute),
      webhookTimeout: String(activeSettings.webhookTimeout),
    });
    setEditingSettings(true);
  };

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData((current: Record<string, unknown>) => ({ ...current, [field]: value }));
  };

  const startEditingGenre = (genre: (typeof previewGenres)[number]) => {
    setEditingGenreId(genre.id);
    setEditingGenre({ name: genre.name, slug: genre.slug });
  };

  const saveGenreEdit = () => {
    if (!editingGenreId) return;
    updateGenreMutation.mutate({
      genreId: editingGenreId,
      name: editingGenre.name.trim(),
      slug: editingGenre.slug.trim(),
    });
  };

  return (
    <Layout>
      <div className="max-w-280">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-['Space_Grotesk'] text-[20px] font-bold tracking-[-0.03em] text-white">
              Platform Settings
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DataRefreshButton queryKeys={[['admin-settings'], ['admin-genres']]} />
            {view === 'platform' && (
              <button
                onClick={editingSettings ? handleSaveSettings : handleStartEditing}
                disabled={updateSettingsMutation.isPending}
                className="h-8 rounded-lg bg-[#00CCCC] px-4 text-[11px] font-medium text-surface transition hover:bg-accent-hover disabled:opacity-60"
              >
                {updateSettingsMutation.isPending
                  ? 'Saving...'
                  : editingSettings
                    ? 'Save Changes'
                    : 'Edit Settings'}
              </button>
            )}
          </div>
        </div>

        <div className="mb-5 inline-flex w-fit overflow-hidden rounded-md border border-[#2A2A2E] bg-[#121216] p-1">
          <div className="flex gap-1">
            <button
              onClick={() => setView('platform')}
              className={`min-w-37 rounded-sm border px-4 py-2 text-[11px] font-medium transition-colors ${
                view === 'platform'
                  ? 'border-[#3A3A40] bg-surface-alt text-white shadow-[inset_0_0_0_1px_rgba(0,204,204,0.12)]'
                  : 'border-transparent bg-transparent text-[#8E8E93] hover:border-[#2A2A2E] hover:text-white'
              }`}
            >
              Platform Settings
            </button>
            <button
              onClick={() => setView('genres')}
              className={`min-w-37 rounded-sm border px-4 py-2 text-[11px] font-medium transition-colors ${
                view === 'genres'
                  ? 'border-[#3A3A40] bg-surface-alt text-white shadow-[inset_0_0_0_1px_rgba(0,204,204,0.12)]'
                  : 'border-transparent bg-transparent text-[#8E8E93] hover:border-[#2A2A2E] hover:text-white'
              }`}
            >
              Genre Management
            </button>
          </div>
        </div>

        {/* Platform Settings */}
        {view === 'platform' && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
                <h2 className="mb-4 text-[12px] font-medium text-white">General Configuration</h2>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-[0.03em] text-[#8E8E93]">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={
                        editingSettings ? formData.platformName || '' : activeSettings.platformName
                      }
                      disabled={!editingSettings}
                      onChange={(e) => handleFieldChange('platformName', e.target.value)}
                      className="h-9 w-full rounded-lg border border-[#1A1A1E] bg-[#16161A] px-3 text-[12px] text-white/80"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-[0.03em] text-[#8E8E93]">
                      Support Email
                    </label>
                    <input
                      type="text"
                      value={
                        editingSettings ? formData.supportEmail || '' : activeSettings.supportEmail
                      }
                      disabled={!editingSettings}
                      onChange={(e) => handleFieldChange('supportEmail', e.target.value)}
                      className="h-9 w-full rounded-lg border border-[#1A1A1E] bg-[#16161A] px-3 text-[12px] text-white/80"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-[0.03em] text-[#8E8E93]">
                      Max Upload Size (MB)
                    </label>
                    <input
                      type="text"
                      value={
                        editingSettings
                          ? formData.maxUploadSizeMb || ''
                          : activeSettings.maxUploadSizeMb
                      }
                      disabled={!editingSettings}
                      onChange={(e) => handleFieldChange('maxUploadSizeMb', e.target.value)}
                      className="h-9 w-full rounded-lg border border-[#1A1A1E] bg-[#16161A] px-3 text-[12px] text-white/80"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
                <h2 className="mb-4 text-[12px] font-medium text-white">Fee Configuration</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    {
                      label: 'Song Sale Platform Fee',
                      value: `${(activeSettings.commissionRate * 100).toFixed(2)}`,
                      suffix: '%',
                    },
                    {
                      label: 'Subscription Platform Fee',
                      value: `${(activeSettings.withdrawalFeeRate * 100).toFixed(2)}`,
                      suffix: '%',
                    },
                    {
                      label: 'Artist Monthly Fee',
                      value: `${(activeSettings.artistSubscriptionPrice / 100).toFixed(2)}`,
                      suffix: '$',
                    },
                    {
                      label: 'Min Withdrawal Amount',
                      value: `${(activeSettings.minWithdrawalAmount / 100).toFixed(2)}`,
                      suffix: '$',
                    },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.03em] text-[#8E8E93]">
                        {field.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={
                            editingSettings
                              ? formData[feeFieldMap[field.label as keyof typeof feeFieldMap]] || ''
                              : field.value
                          }
                          disabled={!editingSettings}
                          onChange={(e) =>
                            handleFieldChange(
                              feeFieldMap[field.label as keyof typeof feeFieldMap],
                              e.target.value,
                            )
                          }
                          className="h-9 w-full rounded-lg border border-[#1A1A1E] bg-[#16161A] px-3 text-[12px] text-white disabled:opacity-100"
                        />
                        <div className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-[#1A1A1E] bg-[#16161A] px-2 text-[11px] text-[#8E8E93]">
                          {field.suffix}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
                <h2 className="mb-4 text-[12px] font-medium text-white">Feature Flags</h2>
                <div className="space-y-3">
                  {[
                    ['Auto-Moderation', 'autoModeration'],
                    ['Allow Downloads', 'allowDownloads'],
                    ['Sync Analytics', 'analyticsSync'],
                    ['Maintenance Mode', 'maintenanceMode'],
                  ].map(([label, key]) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] text-white">{label}</div>
                        <div className="text-[10px] text-[#6E6E78]">System-level behavior</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          editingSettings && handleFieldChange(key, !Boolean(formData[key]))
                        }
                        disabled={!editingSettings}
                        className={`relative h-5 w-10 rounded-full transition ${
                          (
                            editingSettings
                              ? formData[key]
                              : activeSettings[key as keyof typeof activeSettings]
                          )
                            ? 'bg-[#30D158]'
                            : 'bg-[#3A3A42]'
                        } ${!editingSettings ? 'cursor-default' : ''}`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                            (
                              editingSettings
                                ? formData[key]
                                : activeSettings[key as keyof typeof activeSettings]
                            )
                              ? 'left-5'
                              : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
                <h2 className="mb-4 text-[12px] font-medium text-white">Rate Limits & Security</h2>
                <div className="space-y-3">
                  {[
                    ['Sign Ups / Hour', 'signupsPerHour'],
                    ['Song Uploads / Minute', 'songUploadsPerMinute'],
                    ['Webhook Timeout', 'webhookTimeout'],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.03em] text-[#8E8E93]">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={
                          editingSettings
                            ? formData[value as string] || ''
                            : activeSettings[value as keyof typeof activeSettings]
                        }
                        disabled={!editingSettings}
                        onChange={(e) => handleFieldChange(value as string, e.target.value)}
                        className="h-9 w-full rounded-lg border border-[#1A1A1E] bg-[#16161A] px-3 text-[12px] text-white/80"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {editingSettings && (
                <button
                  onClick={() => setEditingSettings(false)}
                  className="w-full rounded-lg border border-[#1A1A1E] px-4 py-2 text-[11px] text-[#8E8E93] transition hover:bg-surface-alt hover:text-white"
                >
                  Cancel Editing
                </button>
              )}
            </div>
          </div>
        )}

        {/* Genre Management */}
        {view === 'genres' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-surface-alt p-6 shadow">
              <h2 className="mb-6 text-xl font-bold text-white">Create New Genre</h2>

              <div className="mb-4 grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm text-[#8E8E93]">Genre Name</label>
                  <input
                    type="text"
                    value={newGenre.name}
                    onChange={(e) => setNewGenre({ ...newGenre, name: e.target.value })}
                    onBlur={handleGenreSlugGenerate}
                    className="w-full rounded-lg border border-[#1A1A1E] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                    placeholder="e.g., Hip Hop"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-[#8E8E93]">Slug (URL-friendly)</label>
                  <input
                    type="text"
                    value={newGenre.slug}
                    onChange={(e) => setNewGenre({ ...newGenre, slug: e.target.value })}
                    className="w-full rounded-lg border border-[#1A1A1E] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00CCCC]"
                    placeholder="e.g., hip-hop"
                  />
                </div>
              </div>

              <button
                onClick={() => createGenreMutation.mutate(newGenre)}
                disabled={!newGenre.name || !newGenre.slug || createGenreMutation.isPending}
                className="rounded-lg bg-[#00CCCC] px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {createGenreMutation.isPending ? 'Creating...' : 'Create Genre'}
              </button>
            </div>

            <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white">Existing Genres</h2>
                <input
                  type="text"
                  value={genreSearch}
                  onChange={(e) => {
                    setGenreSearch(e.target.value);
                    setGenrePage(1);
                  }}
                  placeholder="Search genres"
                  className="h-9 w-full max-w-56 rounded-lg border border-[#1A1A1E] bg-[#16161A] px-3 text-[12px] text-white"
                />
              </div>

              <div className="space-y-3">
                {genresLoading ? (
                  <div className="text-sm text-[#8E8E93]">Loading genres...</div>
                ) : (
                  genreItems.map((genre: (typeof previewGenres)[number]) => {
                    const isEditing = editingGenreId === genre.id;

                    return (
                      <div
                        key={genre.id}
                        className="grid grid-cols-[minmax(0,1fr)_140px_140px_190px] items-center gap-3 rounded-lg border border-[#1A1A1E] bg-[#16161A] px-4 py-3"
                      >
                        {isEditing ? (
                          <input
                            value={editingGenre.name}
                            onChange={(e) =>
                              setEditingGenre((current) => ({ ...current, name: e.target.value }))
                            }
                            className="rounded-md border border-[#2A2A2E] bg-surface px-3 py-2 text-[12px] text-white"
                          />
                        ) : (
                          <div>
                            <div className="text-[12px] font-medium text-white">{genre.name}</div>
                            <div className="text-[10px] text-[#6E6E78]">#{genre.id}</div>
                          </div>
                        )}

                        {isEditing ? (
                          <input
                            value={editingGenre.slug}
                            onChange={(e) =>
                              setEditingGenre((current) => ({ ...current, slug: e.target.value }))
                            }
                            className="rounded-md border border-[#2A2A2E] bg-surface px-3 py-2 text-[12px] text-white"
                          />
                        ) : (
                          <div className="text-[11px] text-[#8E8E93]">{genre.slug}</div>
                        )}

                        <div className="text-[11px] text-[#8E8E93]">
                          {genre._count?.songs || 0} songs
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveGenreEdit}
                                disabled={updateGenreMutation.isPending}
                                className="rounded-md bg-[#00CCCC] px-3 py-2 text-[11px] font-medium text-surface disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingGenreId(null);
                                  setEditingGenre({ name: '', slug: '' });
                                }}
                                className="rounded-md border border-[#2A2A2E] px-3 py-2 text-[11px] text-[#8E8E93]"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditingGenre(genre)}
                                className="rounded-md border border-[#2A2A2E] px-3 py-2 text-[11px] text-[#8E8E93] hover:text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteGenreMutation.mutate(genre.id)}
                                disabled={deleteGenreMutation.isPending}
                                className="rounded-md bg-[#3A1E22] px-3 py-2 text-[11px] text-[#FF6B6B] disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {genresData?.pagination ? (
                <Pagination
                  currentPage={genresData.pagination.page}
                  totalPages={genresData.pagination.totalPages}
                  onPageChange={setGenrePage}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
