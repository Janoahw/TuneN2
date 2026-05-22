import { prisma } from '../config/database.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';

export interface LikeStatus {
  liked: boolean;
  likeCount: number;
}

export interface CommentAuthor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface SongCommentData {
  id: string;
  songId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  user: CommentAuthor;
}

export interface CommentPage {
  items: SongCommentData[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

const USER_SELECT = {
  id: true,
  displayName: true,
  avatarUrl: true,
} as const;

export class SongInteractionService {
  // ── Likes ────────────────────────────────────────────────

  /**
   * Toggle like on a song. Returns the new liked state and the updated count.
   */
  static async toggleLike(userId: string, songId: string): Promise<LikeStatus> {
    const existing = await prisma.songLike.findUnique({
      where: { userId_songId: { userId, songId } },
    });

    if (existing) {
      await prisma.songLike.delete({ where: { id: existing.id } });
    } else {
      // Verify song exists before creating the like
      const song = await prisma.song.findUnique({ where: { id: songId }, select: { id: true } });
      if (!song) throw new NotFoundError('Song not found');
      await prisma.songLike.create({ data: { userId, songId } });
    }

    const likeCount = await prisma.songLike.count({ where: { songId } });
    return { liked: !existing, likeCount };
  }

  /**
   * Get current like status for a user (null = unauthenticated) + total count.
   */
  static async getLikeStatus(userId: string | null, songId: string): Promise<LikeStatus> {
    const [likedRecord, likeCount] = await Promise.all([
      userId
        ? prisma.songLike.findUnique({
            where: { userId_songId: { userId, songId } },
            select: { id: true },
          })
        : Promise.resolve(null),
      prisma.songLike.count({ where: { songId } }),
    ]);

    return { liked: !!likedRecord, likeCount };
  }

  // ── Comments ─────────────────────────────────────────────

  /**
   * Paginated comments for a song, newest first.
   */
  static async getComments(songId: string, page: number, limit: number): Promise<CommentPage> {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.songComment.findMany({
        where: { songId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: USER_SELECT } },
      }),
      prisma.songComment.count({ where: { songId } }),
    ]);

    return {
      items: comments as SongCommentData[],
      total,
      page,
      limit,
      hasNext: page * limit < total,
    };
  }

  /**
   * Get comment count for a song.
   */
  static async getCommentCount(songId: string): Promise<number> {
    return prisma.songComment.count({ where: { songId } });
  }

  /**
   * Create a comment on a song.
   */
  static async createComment(
    userId: string,
    songId: string,
    body: string,
  ): Promise<SongCommentData> {
    const song = await prisma.song.findUnique({ where: { id: songId }, select: { id: true } });
    if (!song) throw new NotFoundError('Song not found');

    const comment = await prisma.songComment.create({
      data: { userId, songId, body },
      include: { user: { select: USER_SELECT } },
    });

    return comment as SongCommentData;
  }

  /**
   * Delete a comment. Only the comment owner may delete.
   */
  static async deleteComment(userId: string, commentId: string): Promise<void> {
    const comment = await prisma.songComment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });

    if (!comment) throw new NotFoundError('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenError("Cannot delete another user's comment");

    await prisma.songComment.delete({ where: { id: commentId } });
  }
}
