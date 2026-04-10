import { api } from './api';
import type { SongDetail } from './song.service';

// ─── Types ──────────────────────────────────

export interface PurchaseIntentResult {
  clientSecret: string | null;
  paymentIntentId: string | null;
  amount: number;
  songTitle: string;
  purchased?: boolean;
  purchaseId?: string;
}

export interface PurchaseItem {
  id: string;
  buyerId: string;
  songId: string;
  artistId: string;
  amount: string;
  platformFee: string;
  artistEarnings: string;
  status: string;
  createdAt: string;
  song: {
    id: string;
    title: string;
    coverArtUrl: string | null;
    durationSeconds: number | null;
    price: string;
    isFree: boolean;
    artist: {
      artistName: string;
      user: { displayName: string };
    };
  };
}

export interface DownloadItem {
  id: string;
  userId: string;
  songId: string;
  createdAt: string;
  song: {
    id: string;
    title: string;
    coverArtUrl: string | null;
    durationSeconds: number | null;
    artist: {
      artistName: string;
      user: { displayName: string };
    };
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Service ────────────────────────────────

export const purchaseService = {
  async purchaseSong(songId: string): Promise<PurchaseIntentResult> {
    const { data } = await api.post(`/songs/${songId}/purchase`);
    return data.data;
  },

  async checkOwnership(songId: string): Promise<boolean> {
    const { data } = await api.get(`/songs/${songId}/ownership`);
    return data.data.owned;
  },

  async getDownloadUrl(songId: string): Promise<{ downloadUrl: string; songTitle: string }> {
    const { data } = await api.get(`/songs/${songId}/download`);
    return data.data;
  },

  async getMyPurchases(page = 1, limit = 20): Promise<PaginatedResult<PurchaseItem>> {
    const { data } = await api.get('/songs/me/purchases', { params: { page, limit } });
    return data.data;
  },

  async getMyDownloads(page = 1, limit = 20): Promise<PaginatedResult<DownloadItem>> {
    const { data } = await api.get('/songs/me/downloads', { params: { page, limit } });
    return data.data;
  },
};
