import { api } from './api';
import { ENDPOINTS } from './endpoints';

// ── Types ─────────────────────────────────────────────────

export interface LikeStatus {
  liked: boolean;
  likeCount: number;
}

export interface CommentAuthor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface SongComment {
  id: string;
  songId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  user: CommentAuthor;
}

export interface CommentPage {
  items: SongComment[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

// ── Service ───────────────────────────────────────────────

export const songInteractionService = {
  async getLikeStatus(songId: string): Promise<LikeStatus> {
    const res = await api.get<{ success: boolean; data: LikeStatus }>(ENDPOINTS.songs.like(songId));
    return res.data.data;
  },

  async toggleLike(songId: string): Promise<LikeStatus> {
    const res = await api.post<{ success: boolean; data: LikeStatus }>(
      ENDPOINTS.songs.like(songId),
    );
    return res.data.data;
  },

  async getComments(songId: string, page = 1, limit = 20): Promise<CommentPage> {
    const res = await api.get<{ success: boolean; data: CommentPage }>(
      ENDPOINTS.songs.comments(songId),
      { params: { page, limit } },
    );
    return res.data.data;
  },

  async createComment(songId: string, body: string): Promise<SongComment> {
    const res = await api.post<{ success: boolean; data: SongComment }>(
      ENDPOINTS.songs.comments(songId),
      { body },
    );
    return res.data.data;
  },

  async deleteComment(songId: string, commentId: string): Promise<void> {
    await api.delete(ENDPOINTS.songs.comment(songId, commentId));
  },
};
