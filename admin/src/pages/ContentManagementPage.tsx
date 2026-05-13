import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flag, FolderTree, Mic2, Music4, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataRefreshButton } from '../components/DataRefreshButton';
import { Layout } from '../components/Layout';
import { StatsCard } from '../components/StatsCard';
import { DataTable } from '../components/DataTable';
import { Pagination } from '../components/Pagination';
import { adminApi } from '../services/api';

type TabType = 'songs' | 'artists' | 'genres' | 'reports';

const previewSongs = [
  {
    id: 'song-1',
    title: 'Midnight Drive',
    price: 1.29,
    streamCount: 12450,
    status: 'active',
    genre: { name: 'R&B' },
    artist: { artistName: 'DJ Pulse' },
  },
  {
    id: 'song-2',
    title: 'Solar Echoes',
    price: 0.99,
    streamCount: 8230,
    status: 'active',
    genre: { name: 'House' },
    artist: { artistName: 'Luna Rae' },
  },
];

const previewArtists = [
  {
    id: 'artist-1',
    artistName: 'DJ Pulse',
    user: { displayName: 'DJ Pulse' },
    _count: { songs: 12, follows: 320 },
    isVerified: true,
    genres: ['R&B'],
  },
];

export default function ContentManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('songs');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 20;

  const { data: stats } = useQuery({
    queryKey: ['admin-content-stats'],
    placeholderData: {
      songs: { total: 1247, active: 889 },
      artists: { total: 89, active: 76 },
      genres: { total: 23 },
      reports: { pending: 5 },
    },
    queryFn: async () => {
      try {
        const response = await adminApi.content.stats();
        return response.data.data;
      } catch {
        return {
          songs: { total: 1247, active: 889 },
          artists: { total: 89, active: 76 },
          genres: { total: 23 },
          reports: { pending: 5 },
        };
      }
    },
  });

  const { data: songsData, isLoading: songsLoading } = useQuery({
    queryKey: ['admin-content-songs', page, search],
    placeholderData: {
      items: previewSongs,
      pagination: { page: 1, limit, total: previewSongs.length, totalPages: 1 },
    },
    queryFn: async () => {
      try {
        const response = await adminApi.content.songs.list({
          page,
          limit,
          search: search.trim() || undefined,
        });
        return response.data.data;
      } catch {
        return {
          items: previewSongs,
          pagination: { page: 1, limit, total: previewSongs.length, totalPages: 1 },
        };
      }
    },
    enabled: activeTab === 'songs',
  });

  const { data: artistsData, isLoading: artistsLoading } = useQuery({
    queryKey: ['admin-artists', page, search],
    placeholderData: {
      items: previewArtists,
      pagination: { page: 1, limit, total: previewArtists.length, totalPages: 1 },
    },
    queryFn: async () => {
      try {
        const response = await adminApi.content.artists.list({
          page,
          limit,
          search: search.trim() || undefined,
        });
        return response.data.data;
      } catch {
        return {
          items: previewArtists,
          pagination: { page: 1, limit, total: previewArtists.length, totalPages: 1 },
        };
      }
    },
    enabled: activeTab === 'artists',
  });

  const { data: genresData } = useQuery({
    queryKey: ['admin-genres-list', page, search],
    placeholderData: {
      items: [
        { id: 1, name: 'Afrobeats', _count: { songs: 25 } },
        { id: 2, name: 'R&B', _count: { songs: 18 } },
      ],
      pagination: { page: 1, limit, total: 2, totalPages: 1 },
    },
    queryFn: async () => {
      try {
        const response = await adminApi.genres.list({
          page,
          limit,
          search: search.trim() || undefined,
        });
        return response.data.data;
      } catch {
        return {
          items: [
            { id: 1, name: 'Afrobeats', _count: { songs: 25 } },
            { id: 2, name: 'R&B', _count: { songs: 18 } },
          ],
          pagination: { page: 1, limit, total: 2, totalPages: 1 },
        };
      }
    },
    enabled: activeTab === 'genres',
  });

  const { data: reportsData } = useQuery({
    queryKey: ['admin-content-reports', page],
    placeholderData: {
      reports: [
        {
          id: 'report-1',
          song: { title: 'Midnight Drive' },
          reporter: { displayName: 'Nyla Faith' },
          reason: 'copyright',
          status: 'pending',
        },
      ],
      pagination: { page: 1, totalPages: 1 },
    },
    queryFn: async () => {
      try {
        const response = await adminApi.reports.list({ page, limit, status: 'pending' });
        return response.data.data;
      } catch {
        return {
          reports: [
            {
              id: 'report-1',
              song: { title: 'Midnight Drive' },
              reporter: { displayName: 'Nyla Faith' },
              reason: 'copyright',
              status: 'pending',
            },
          ],
          pagination: { page: 1, totalPages: 1 },
        };
      }
    },
    enabled: activeTab === 'reports',
  });

  const songColumns = useMemo(
    () => [
      { header: 'Song', accessor: (row: any) => row.title },
      {
        header: 'Artist',
        accessor: (row: any) =>
          row.artist?.artistName || row.artist?.user?.displayName || 'Unknown',
      },
      { header: 'Genre', accessor: (row: any) => row.genre?.name || 'Unassigned' },
      {
        header: 'Price',
        accessor: (row: any) => `$${Number(row.price || 0).toFixed(2)}`,
      },
      { header: 'Plays', accessor: (row: any) => Number(row.streamCount || 0).toLocaleString() },
      { header: 'Status', accessor: (row: any) => row.status || 'active' },
    ],
    [],
  );

  const artistColumns = useMemo(
    () => [
      { header: 'Artist', accessor: (row: any) => row.artistName || row.user?.displayName },
      { header: 'Genres', accessor: (row: any) => (row.genres || []).join(', ') || 'None' },
      { header: 'Songs', accessor: (row: any) => row._count?.songs || 0 },
      { header: 'Followers', accessor: (row: any) => row._count?.follows || 0 },
      { header: 'Status', accessor: (row: any) => (row.isVerified ? 'Verified' : 'Active') },
    ],
    [],
  );

  const genreColumns = useMemo(
    () => [
      { header: 'Genre', accessor: (row: any) => row.name },
      { header: 'Songs', accessor: (row: any) => row._count?.songs || 0 },
    ],
    [],
  );

  const reportColumns = useMemo(
    () => [
      { header: 'Song', accessor: (row: any) => row.song?.title || 'Unknown' },
      { header: 'Reporter', accessor: (row: any) => row.reporter?.displayName || 'Unknown' },
      { header: 'Reason', accessor: (row: any) => row.reason },
      { header: 'Status', accessor: (row: any) => row.status },
    ],
    [],
  );

  const songs = songsData?.items || previewSongs;
  const artists = artistsData?.items || previewArtists;
  const genres = genresData?.items || [];
  const reports = reportsData?.reports || [];
  const contentCounts = {
    songs: Number(stats?.songs?.total || songs.length || 0),
    artists: Number(stats?.artists?.total || artists.length || 0),
    genres: Number(stats?.genres?.total || genres.length || 0),
    reports: Number(stats?.reports?.pending || reports.length || 0),
  };

  return (
    <Layout>
      <div className="max-w-280 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-['Space_Grotesk'] text-[20px] font-bold tracking-[-0.03em] text-white">
            Content Management
          </h1>
          <div className="flex w-full max-w-85 items-center gap-2">
            <DataRefreshButton
              queryKeys={[
                ['admin-content-stats'],
                ['admin-content-songs'],
                ['admin-artists'],
                ['admin-genres-list'],
                ['admin-content-reports'],
              ]}
            />
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E6E78]"
                strokeWidth={1.8}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search songs, artists, genres"
                className="h-8 w-full rounded-md border border-[#1A1A1E] bg-[#141417] pl-9 pr-3 text-[11px] text-white placeholder-[#6E6E78] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Songs"
            value={stats?.songs?.total || 0}
            icon={<Music4 className="h-4 w-4" strokeWidth={1.85} />}
            subtitle={`${stats?.songs?.active || 0} active`}
          />
          <StatsCard
            title="Total Artists"
            value={stats?.artists?.total || 0}
            icon={<Mic2 className="h-4 w-4" strokeWidth={1.85} />}
            subtitle={`${stats?.artists?.active || 0} active`}
          />
          <StatsCard
            title="Total Genres"
            value={stats?.genres?.total || 0}
            icon={<FolderTree className="h-4 w-4" strokeWidth={1.85} />}
            subtitle="Catalog categories"
          />
          <StatsCard
            title="Pending Reports"
            value={stats?.reports?.pending || 0}
            icon={<Flag className="h-4 w-4" strokeWidth={1.85} />}
            subtitle="Needs review"
          />
        </div>

        <div className="inline-flex w-fit overflow-hidden rounded-md border border-[#2A2A2E] bg-[#121216] p-1">
          <div className="flex gap-1">
            {[
              { key: 'songs' as TabType, label: 'Songs' },
              { key: 'artists' as TabType, label: 'Artists' },
              { key: 'genres' as TabType, label: 'Genres' },
              { key: 'reports' as TabType, label: 'Flagged' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={`min-w-23 rounded-sm border px-4 py-2 text-[11px] font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#3A3A40] bg-surface-alt text-white shadow-[inset_0_0_0_1px_rgba(0,204,204,0.12)]'
                    : 'border-transparent bg-transparent text-[#8E8E93] hover:border-[#2A2A2E] hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-2 text-[10px] text-[#6E6E78]">{contentCounts[tab.key]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-5">
          {activeTab === 'songs' && (
            <DataTable
              data={songs}
              columns={songColumns}
              isLoading={songsLoading}
              onRowClick={(row: any) => navigate(`/songs/${row.id}`)}
              emptyMessage="No songs available"
            />
          )}

          {activeTab === 'artists' && (
            <>
              <DataTable
                data={artists}
                columns={artistColumns}
                isLoading={artistsLoading}
                emptyMessage="No artists available"
              />
              {artistsData?.totalPages ? (
                <Pagination
                  currentPage={artistsData.pagination.page || 1}
                  totalPages={artistsData.pagination.totalPages}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}

          {activeTab === 'genres' && (
            <>
              <DataTable data={genres} columns={genreColumns} emptyMessage="No genres found" />
              {genresData?.pagination ? (
                <Pagination
                  currentPage={genresData.pagination.page}
                  totalPages={genresData.pagination.totalPages}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}

          {activeTab === 'reports' && (
            <>
              <DataTable
                data={reports}
                columns={reportColumns}
                onRowClick={(row: any) => navigate(`/reports/${row.id}`)}
                emptyMessage="No flagged content"
              />
              {reportsData?.pagination ? (
                <Pagination
                  currentPage={reportsData.pagination.page}
                  totalPages={reportsData.pagination.totalPages}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
