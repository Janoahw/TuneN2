import { api } from './api';

export interface UpgradeToArtistParams {
  artistName: string;
  bio?: string;
  genreIds: number[];
  profileImageUrl?: string;
}

export interface ArtistProfile {
  id: string;
  userId: string;
  artistName: string;
  bio: string | null;
  genreIds: number[];
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  subscriptionStatus: 'trialing' | 'active' | 'lapsed' | 'cancelled';
  isVerified: boolean;
  followerCount: number;
  songCount: number;
  releaseCount: number;
  wallet?: { balance: number; totalEarned: number; totalWithdrawn: number } | null;
  createdAt: string;
}

export interface ConnectResult {
  url: string;
  accountId: string;
}

export interface ConnectStatus {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  accountId: string;
}

export interface SubscriptionStatus {
  subscriptionStatus: string;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  stripe: {
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export const artistService = {
  async upgrade(params: UpgradeToArtistParams) {
    const { data } = await api.post('/artists/upgrade', params);
    return data.data;
  },

  async createConnectAccount(): Promise<ConnectResult> {
    const { data } = await api.post('/artists/connect');
    return data.data;
  },

  async getConnectStatus(): Promise<ConnectStatus> {
    const { data } = await api.get('/artists/connect/status');
    return data.data;
  },

  async getMyProfile(): Promise<ArtistProfile> {
    const { data } = await api.get('/artists/me/profile');
    return data.data.artist;
  },

  async getArtistProfile(artistId: string): Promise<ArtistProfile> {
    const { data } = await api.get(`/artists/${artistId}`);
    return data.data.artist;
  },

  async getArtistSongs(artistId: string, limit = 10): Promise<any[]> {
    const { data } = await api.get(`/artists/${artistId}/songs`, { params: { limit } });
    return data.data.songs;
  },

  async updateProfile(
    updates: Partial<
      UpgradeToArtistParams & {
        bannerImageUrl?: string | null;
        collaborationPrice?: number;
        fanSubscriptionPrice?: number;
      }
    >,
  ): Promise<ArtistProfile> {
    const { data } = await api.patch('/artists/me/profile', updates);
    return data.data.artist;
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const { data } = await api.get('/artists/me/subscription');
    return data.data;
  },
};
