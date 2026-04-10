import { api } from './api';

export interface Song {
  id: string;
  artistId: string;
  title: string;
  description: string | null;
  durationSeconds: number | null;
  genreId: number | null;
  genre: { id: number; name: string; slug: string } | null;
  price: string; // Decimal comes as string
  isFree: boolean;
  audioUrl: string;
  streamUrl: string | null;
  coverArtUrl: string | null;
  streamCount: string; // BigInt comes as string
  status: 'processing' | 'active' | 'rejected' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface SongDetail extends Song {
  artist: {
    id: string;
    artistName: string;
    profileImageUrl: string | null;
    isVerified: boolean;
    user: { displayName: string; avatarUrl: string | null };
    _count: { songs: number; follows: number };
  };
}

export interface UploadUrlParams {
  fileType: 'audio' | 'cover-art';
  mimeType: string;
  fileSize: number;
}

export interface UploadUrlResult {
  uploadUrl: string;
  fileKey: string;
}

export interface CreateSongParams {
  title: string;
  description?: string;
  genreId: number;
  price: number;
  isFree: boolean;
  audioFileKey: string;
  coverArtKey?: string;
}

export interface UpdateSongParams {
  title?: string;
  description?: string | null;
  genreId?: number;
  price?: number;
  isFree?: boolean;
  coverArtKey?: string | null;
}

export interface SongListResult {
  items: Song[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const songService = {
  async getUploadUrl(params: UploadUrlParams): Promise<UploadUrlResult> {
    const { data } = await api.post('/songs/upload-url', params);
    return data.data;
  },

  async createSong(params: CreateSongParams): Promise<Song> {
    const { data } = await api.post('/songs', params);
    return data.data.song;
  },

  async getMySongs(params?: { status?: string; page?: number; limit?: number }): Promise<SongListResult> {
    const { data } = await api.get('/songs/me/catalog', { params });
    return data.data;
  },

  async getSong(songId: string): Promise<SongDetail> {
    const { data } = await api.get(`/songs/${songId}`);
    return data.data.song;
  },

  async updateSong(songId: string, params: UpdateSongParams): Promise<Song> {
    const { data } = await api.patch(`/songs/${songId}`, params);
    return data.data.song;
  },

  async deleteSong(songId: string): Promise<void> {
    await api.delete(`/songs/${songId}`);
  },

  async uploadFile(uploadUrl: string, file: { uri: string; mimeType: string }): Promise<void> {
    const response = await fetch(file.uri);
    const blob = await response.blob();

    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.mimeType },
      body: blob,
    });
  },
};
