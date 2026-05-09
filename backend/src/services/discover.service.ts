import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

const SONG_SELECT = {
  id: true,
  title: true,
  price: true,
  isFree: true,
  coverArtUrl: true,
  durationSeconds: true,
  streamCount: true,
  status: true,
  createdAt: true,
  genre: { select: { id: true, name: true, slug: true } },
  artist: {
    select: {
      id: true,
      artistName: true,
      profileImageUrl: true,
      isVerified: true,
      user: { select: { displayName: true, avatarUrl: true } },
    },
  },
};

const ARTIST_SELECT = {
  id: true,
  artistName: true,
  bio: true,
  profileImageUrl: true,
  coverImageUrl: true,
  isVerified: true,
  genres: true,
  createdAt: true,
  user: { select: { id: true, displayName: true, avatarUrl: true } },
  _count: {
    select: {
      songs: { where: { status: 'active' as const } },
      follows: true,
    },
  },
};

export class DiscoverService {
  /**
   * Main discover feed — new artists, top performing songs, fastest growing artists.
   */
  static async getDiscoverFeed(limit = 10) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [newArtists, topPerformingSongs, fastestGrowingArtists] = await Promise.all([
      // New artists — most recently created
      prisma.artistProfile.findMany({
        where: { user: { isBanned: false } },
        select: ARTIST_SELECT,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),

      // Top performing songs — most purchases
      prisma.song.findMany({
        where: { status: 'active' },
        select: {
          ...SONG_SELECT,
          _count: { select: { purchases: { where: { status: 'completed' } } } },
        },
        orderBy: { purchases: { _count: 'desc' } },
        take: limit,
      }),

      // Fastest growing — most follows in last 30 days
      prisma.artistProfile.findMany({
        where: {
          user: { isBanned: false },
          follows: {
            some: { createdAt: { gte: thirtyDaysAgo } },
          },
        },
        select: {
          ...ARTIST_SELECT,
          follows: {
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { id: true },
          },
        },
        take: limit * 2, // fetch extra and sort in memory
      }),
    ]);

    // Sort fastest growing by recent follow count
    const sortedFastest = fastestGrowingArtists
      .sort((a, b) => b.follows.length - a.follows.length)
      .slice(0, limit)
      // Strip internal follow array from response
      .map(({ follows: _follows, ...rest }) => rest);

    return {
      newArtists,
      topPerformingSongs,
      fastestGrowingArtists: sortedFastest,
    };
  }

  /**
   * Full-text search on artists and songs.
   */
  static async search(q: string, type: 'all' | 'artists' | 'songs', page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [artists, songs] = await Promise.all([
      type !== 'songs'
        ? prisma.artistProfile.findMany({
            where: {
              user: { isBanned: false },
              OR: [
                { artistName: { contains: q, mode: 'insensitive' } },
                { bio: { contains: q, mode: 'insensitive' } },
              ],
            },
            select: ARTIST_SELECT,
            skip: type === 'artists' ? skip : 0,
            take: type === 'artists' ? limit : 5,
          })
        : Promise.resolve([]),

      type !== 'artists'
        ? prisma.song.findMany({
            where: {
              status: 'active',
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { artist: { artistName: { contains: q, mode: 'insensitive' } } },
              ],
            },
            select: SONG_SELECT,
            skip: type === 'songs' ? skip : 0,
            take: type === 'songs' ? limit : 10,
          })
        : Promise.resolve([]),
    ]);

    return { artists, songs, query: q };
  }

  /**
   * Get all genres with active song count.
   */
  static async getGenres() {
    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { songs: { where: { status: 'active' } } } },
      },
    });

    return genres;
  }

  /**
   * Get genre detail — top artists and popular songs in the genre.
   */
  static async getGenreDetail(slug: string, limit = 10) {
    const genre = await prisma.genre.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { songs: { where: { status: 'active' } } } },
      },
    });

    if (!genre) throw new NotFoundError('Genre not found');

    const [popularSongs, artistsInGenre] = await Promise.all([
      // Popular songs in genre by purchase count
      prisma.song.findMany({
        where: { status: 'active', genreId: genre.id },
        select: {
          ...SONG_SELECT,
          _count: { select: { purchases: { where: { status: 'completed' } } } },
        },
        orderBy: { purchases: { _count: 'desc' } },
        take: limit,
      }),

      // Artists with most songs in this genre
      prisma.artistProfile.findMany({
        where: {
          user: { isBanned: false },
          songs: { some: { status: 'active', genreId: genre.id } },
        },
        select: {
          ...ARTIST_SELECT,
          _count: {
            select: {
              songs: { where: { status: 'active', genreId: genre.id } },
              follows: true,
            },
          },
        },
        orderBy: { follows: { _count: 'desc' } },
        take: limit,
      }),
    ]);

    // Derive song + artist counts for the header card
    const songCount = genre._count.songs;
    const artistCount = artistsInGenre.length;

    return {
      genre: { ...genre, songCount, artistCount },
      popularSongs,
      topArtists: artistsInGenre,
    };
  }

  /**
   * Get paginated list of all public artists.
   */
  static async getArtists(params: { page: number; limit: number; genre?: string }) {
    const { page, limit, genre } = params;
    const skip = (page - 1) * limit;

    const where = {
      user: { isBanned: false },
      ...(genre ? { songs: { some: { status: 'active' as const, genre: { slug: genre } } } } : {}),
    };

    const [artists, total] = await Promise.all([
      prisma.artistProfile.findMany({
        where,
        select: ARTIST_SELECT,
        orderBy: { follows: { _count: 'desc' } },
        skip,
        take: limit,
      }),
      prisma.artistProfile.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      items: artists,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Get recommended songs for a user based on genres they've purchased.
   * Falls back to top performing songs if no purchase history.
   */
  static async getRecommendedSongs(userId: string | null, limit = 10) {
    if (userId) {
      // Find genres the user has purchased
      const purchases = await prisma.purchase.findMany({
        where: { buyerId: userId, status: 'completed' },
        select: { song: { select: { genreId: true } } },
        take: 20,
      });

      const genreIds = [
        ...new Set(purchases.map((p) => p.song.genreId).filter(Boolean) as number[]),
      ];

      if (genreIds.length > 0) {
        // Find songs in those genres the user hasn't purchased yet
        const purchasedSongIds = await prisma.purchase.findMany({
          where: { buyerId: userId },
          select: { songId: true },
        });
        const excludeIds = purchasedSongIds.map((p) => p.songId);

        const songs = await prisma.song.findMany({
          where: {
            status: 'active',
            genreId: { in: genreIds },
            id: { notIn: excludeIds },
          },
          select: SONG_SELECT,
          orderBy: { purchases: { _count: 'desc' } },
          take: limit,
        });

        if (songs.length > 0) return songs;
      }
    }

    // Fallback: top performing songs
    return prisma.song.findMany({
      where: { status: 'active' },
      select: SONG_SELECT,
      orderBy: { purchases: { _count: 'desc' } },
      take: limit,
    });
  }
}
