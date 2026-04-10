import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

export class LibraryService {
  /**
   * Get user's library — all purchased + free claimed songs, sorted by purchase date.
   */
  static async getUserLibrary(
    userId: string,
    params: { page: number; limit: number },
  ) {
    const skip = (params.page - 1) * params.limit;

    const [items, total] = await Promise.all([
      prisma.purchase.findMany({
        where: { buyerId: userId, status: 'completed' },
        include: {
          song: {
            select: {
              id: true,
              title: true,
              coverArtUrl: true,
              durationSeconds: true,
              price: true,
              isFree: true,
              status: true,
              genre: { select: { id: true, name: true } },
              artist: {
                select: {
                  id: true,
                  artistName: true,
                  profileImageUrl: true,
                  user: { select: { displayName: true, avatarUrl: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit,
      }),
      prisma.purchase.count({
        where: { buyerId: userId, status: 'completed' },
      }),
    ]);

    // Flatten: return songs with purchase metadata
    const songs = items.map((p) => ({
      ...p.song,
      purchasedAt: p.createdAt,
      purchaseAmount: p.amount,
    }));

    const totalPages = Math.ceil(total / params.limit);
    return {
      items: songs,
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    };
  }

  /**
   * Quick ownership check for a specific song.
   */
  static async checkOwnership(userId: string, songId: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { buyerId_songId: { buyerId: userId, songId } },
    });
    return purchase?.status === 'completed';
  }
}
