import { api } from './api';
import { ENDPOINTS } from './endpoints';
import type { Song, SongDetail } from './song.service';

export interface ArtistSummary {
  id: string;
  artistName: string;
  bio: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  isVerified: boolean;
  genres: string[];
  createdAt: string;
  user: { id: string; displayName: string; avatarUrl: string | null };
  _count: { songs: number; follows: number };
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  _count: { songs: number };
}

export interface GenreDetail {
  genre: Genre & { songCount: number; artistCount: number };
  popularSongs: (Song & { _count: { purchases: number } })[];
  topArtists: ArtistSummary[];
}

export interface DiscoverFeed {
  newArtists: ArtistSummary[];
  topPerformingSongs: (Song & { _count: { purchases: number } })[];
  fastestGrowingArtists: ArtistSummary[];
}

export interface SearchResult {
  artists: ArtistSummary[];
  songs: SongDetail[];
  query: string;
}

export interface ArtistsPage {
  items: ArtistSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const discoverService = {
  async getFeed(limit = 10): Promise<DiscoverFeed> {
    const { data } = await api.get(ENDPOINTS.discover.feed, { params: { limit } });
    return data.data;
  },

  async search(
    q: string,
    type: 'all' | 'artists' | 'songs' = 'all',
    page = 1,
    limit = 20,
  ): Promise<SearchResult> {
    const { data } = await api.get(ENDPOINTS.discover.search, {
      params: { q, type, page, limit },
    });
    return data.data;
  },

  async getGenres(): Promise<Genre[]> {
    const { data } = await api.get(ENDPOINTS.discover.genres);
    return data.data.genres;
  },

  async getGenreDetail(slug: string): Promise<GenreDetail> {
    const { data } = await api.get(ENDPOINTS.discover.genreDetail(slug));
    return data.data;
  },

  async getArtists(page = 1, limit = 20, genre?: string): Promise<ArtistsPage> {
    const { data } = await api.get(ENDPOINTS.discover.artists, {
      params: { page, limit, ...(genre ? { genre } : {}) },
    });
    return data.data;
  },

  async getRecommended(): Promise<SongDetail[]> {
    const { data } = await api.get(ENDPOINTS.discover.recommended);
    return data.data.songs;
  },
};
