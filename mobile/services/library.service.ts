import { api } from './api';

// ─── Types ──────────────────────────────────

export interface LibraryItem {
  id: string;
  title: string;
  coverArtUrl: string | null;
  durationSeconds: number | null;
  price: string;
  isFree: boolean;
  status: string;
  genre: { id: number; name: string } | null;
  artist: {
    id: string;
    artistName: string;
    profileImageUrl: string | null;
    user: { displayName: string; avatarUrl: string | null };
  };
  purchasedAt: string;
  purchaseAmount: string;
}

export interface LibraryResult {
  items: LibraryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SongWithStats {
  id: string;
  title: string;
  coverArtUrl: string | null;
  durationSeconds: number | null;
  price: string;
  isFree: boolean;
  status: string;
  genre: { id: number; name: string; slug: string } | null;
  createdAt: string;
  totalDownloads: number;
  totalPurchases: number;
  totalRevenue: number;
}

export interface SongStatsResult {
  items: SongWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Service ────────────────────────────────

export const libraryService = {
  async getLibrary(page = 1, limit = 20): Promise<LibraryResult> {
    const { data } = await api.get('/library', { params: { page, limit } });
    return data.data;
  },

  async checkOwnership(songId: string): Promise<boolean> {
    const { data } = await api.get(`/library/check/${songId}`);
    return data.data.owned;
  },

  async getMySongsWithStats(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<SongStatsResult> {
    const { data } = await api.get('/songs/me/catalog/stats', { params });
    return data.data;
  },
};
