import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { adminApi } from '../services/api';

type TabType = 'songs' | 'artists' | 'genres' | 'reports';

export default function ContentManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('songs');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: stats } = useQuery({
    queryKey: ['admin-content-stats'],
    queryFn: async () => {
      const response = await adminApi.content.stats();
      return response.data.data;
    },
  });

  const { data: songsData, isLoading: songsLoading } = useQuery({
    queryKey: ['admin-songs', page],
    queryFn: async () => {
      // This is a placeholder - you would need to add a songs list endpoint
      return { items: [], total: 0, pages: 1 };
    },
    enabled: activeTab === 'songs',
  });

  const { data: artistsData, isLoading: artistsLoading } = useQuery({
    queryKey: ['admin-artists', page],
    queryFn: async () => {
      // This is a placeholder - you would need to add an artists list endpoint
      return { items: [], total: 0, pages: 1 };
    },
    enabled: activeTab === 'artists',
  });

  const songColumns = [
    { key: 'title', label: 'Title' },
    { key: 'artist', label: 'Artist' },
    { key: 'genre', label: 'Genre' },
    { key: 'status', label: 'Status' },
    { key: 'purchases', label: 'Purchases' },
    { key: 'actions', label: 'Actions' },
  ];

  const artistColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'songs', label: 'Songs' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <h1 className="text-white text-2xl font-bold font-['Space_Grotesk']">Content Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <StatsCard
            title="Total Songs"
            value={stats?.songs?.total || 0}
            icon="🎵"
            subtitle={`${stats?.songs?.active || 0} active`}
          />
          <StatsCard
            title="Total Artists"
            value={stats?.artists?.total || 0}
            icon="🎤"
            subtitle={`${stats?.artists?.active || 0} active`}
          />
          <StatsCard
            title="Total Genres"
            value={stats?.genres?.total || 0}
            icon="📁"
            subtitle="Catalog categories"
          />
          <StatsCard
            title="Pending Reports"
            value={stats?.reports?.pending || 0}
            icon="🚩"
            subtitle="Needs review"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-[#1A1A1E]">
          <div className="flex gap-6">
            {[
              { key: 'songs' as TabType, label: 'Songs' },
              { key: 'artists' as TabType, label: 'Artists' },
              { key: 'genres' as TabType, label: 'Genres' },
              { key: 'reports' as TabType, label: 'Reports' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key ? 'text-white' : 'text-[#A0A0AB] hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00CCCC]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-[#111114] rounded-xl p-6 border border-[#1A1A1E]">
          {activeTab === 'songs' && (
            <div className="flex flex-col gap-4">
              <div className="text-[#A0A0AB] text-sm">
                {songsLoading ? (
                  'Loading songs...'
                ) : (
                  <div className="text-center py-12">
                    <div className="text-[#6E6E78] mb-2">No songs found</div>
                    <div className="text-xs text-[#8E8E93]">
                      Songs will appear here as they are uploaded
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'artists' && (
            <div className="flex flex-col gap-4">
              <div className="text-[#A0A0AB] text-sm">
                {artistsLoading ? (
                  'Loading artists...'
                ) : (
                  <div className="text-center py-12">
                    <div className="text-[#6E6E78] mb-2">No artists found</div>
                    <div className="text-xs text-[#8E8E93]">
                      Artists will appear here as they register
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'genres' && (
            <div className="flex flex-col gap-4">
              <div className="text-center py-12">
                <div className="text-[#6E6E78] mb-2">Genre Management</div>
                <div className="text-xs text-[#8E8E93]">Manage genres from the Settings page</div>
                <button
                  onClick={() => navigate('/settings')}
                  className="mt-4 px-4 py-2 bg-[#00CCCC] text-white rounded-lg hover:bg-[#00BBBB]"
                >
                  Go to Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="flex flex-col gap-4">
              <div className="text-center py-12">
                <div className="text-[#6E6E78] mb-2">Content Reports</div>
                <div className="text-xs text-[#8E8E93]">
                  View and manage reports from the Moderation page
                </div>
                <button
                  onClick={() => navigate('/moderation')}
                  className="mt-4 px-4 py-2 bg-[#00CCCC] text-white rounded-lg hover:bg-[#00BBBB]"
                >
                  Go to Moderation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
