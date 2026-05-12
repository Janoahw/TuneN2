import { prisma } from '../config/database.js';
import type {
  AdminUsersQuery,
  AdminBanUser,
  AdminUnbanUser,
  AdminFinancialsQuery,
  AdminTransactionsQuery,
  AdminWithdrawalsQuery,
  AdminUpdateSettings,
  AdminCreateGenre,
  AdminUpdateGenre,
} from '../schemas/admin.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

function decimalToCents(value: unknown): number {
  return Math.round(Number(value ?? 0) * 100);
}

export class AdminService {
  /**
   * USER MANAGEMENT
   */

  async getUsers(query: AdminUsersQuery) {
    const { page, limit, search, role, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (role === 'admin') {
      where.isAdmin = true;
    } else if (role === 'artist') {
      where.isArtist = true;
    } else if (role === 'fan') {
      where.isArtist = false;
      where.isAdmin = false;
    }

    // Status filter
    if (status === 'banned') {
      where.isBanned = true;
    } else if (status === 'active') {
      where.isBanned = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          isArtist: true,
          isAdmin: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        isArtist: true,
        isAdmin: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
        purchases: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            song: {
              select: {
                id: true,
                title: true,
                artistId: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        artistProfile: {
          select: {
            id: true,
            artistName: true,
            bio: true,
            profileImageUrl: true,
            bannerImageUrl: true,
            subscriptionStatus: true,
            createdAt: true,
            wallet: {
              select: {
                balance: true,
                totalEarned: true,
                totalWithdrawn: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get purchase stats
    const purchaseStats = await prisma.purchase.aggregate({
      where: { buyerId: userId },
      _sum: { amount: true },
      _count: true,
    });

    const normalizedUser = {
      ...user,
      purchases: user.purchases.map((purchase) => ({
        ...purchase,
        amountCents: decimalToCents(purchase.amount),
      })),
      artistProfile: user.artistProfile
        ? {
            ...user.artistProfile,
            wallet: user.artistProfile.wallet
              ? {
                  ...user.artistProfile.wallet,
                  balanceCents: decimalToCents(user.artistProfile.wallet.balance),
                  totalEarnedCents: decimalToCents(user.artistProfile.wallet.totalEarned),
                  totalWithdrawn: decimalToCents(user.artistProfile.wallet.totalWithdrawn),
                }
              : null,
          }
        : null,
    };

    return {
      user: normalizedUser,
      stats: {
        totalPurchases: purchaseStats._count || 0,
        totalSpent: decimalToCents(purchaseStats._sum?.amount),
      },
    };
  }

  async banUser(userId: string, data: AdminBanUser, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isBanned) {
      throw new BadRequestError('User is already banned');
    }

    if (user.isAdmin) {
      throw new BadRequestError('Cannot ban admin users');
    }

    // Ban user and log the action
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        isBanned: true,
      },
    });

    // TODO: Create audit log entry
    // TODO: Revoke all active sessions (implement session table in future)

    return updatedUser;
  }

  async unbanUser(userId: string, data: AdminUnbanUser, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isBanned) {
      throw new BadRequestError('User is not banned');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        isBanned: true,
      },
    });

    // TODO: Create audit log entry

    return updatedUser;
  }

  /**
   * FINANCIAL MANAGEMENT
   */

  async getFinancialOverview(query: AdminFinancialsQuery) {
    const { startDate, endDate } = query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Total revenue from purchases
    const purchaseStats = await prisma.purchase.aggregate({
      where,
      _sum: {
        amount: true,
        platformFee: true,
        artistEarnings: true,
      },
      _count: true,
    });

    // Total withdrawals
    const withdrawalStats = await prisma.withdrawal.aggregate({
      where: {
        ...where,
        status: 'completed',
      },
      _sum: {
        amountCents: true,
        feeCents: true,
      },
      _count: true,
    });

    // Pending withdrawals
    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      where: {
        status: 'pending',
      },
      _sum: { amountCents: true },
      _count: true,
    });

    // Active artists and fans
    const [activeArtists, totalFans] = await Promise.all([
      prisma.artistProfile.count({
        where: {
          subscriptionStatus: {
            in: ['active', 'trialing'],
          },
        },
      }),
      prisma.user.count({
        where: {
          isArtist: false,
        },
      }),
    ]);

    // Total songs
    const totalSongs = await prisma.song.count({
      where: { status: 'active' },
    });

    return {
      revenue: {
        total: decimalToCents(purchaseStats._sum?.amount),
        platformFees: decimalToCents(purchaseStats._sum?.platformFee),
        artistEarnings: decimalToCents(purchaseStats._sum?.artistEarnings),
        transactionCount: purchaseStats._count || 0,
      },
      withdrawals: {
        completed: withdrawalStats._sum.amountCents || 0,
        fees: withdrawalStats._sum.feeCents || 0,
        count: withdrawalStats._count || 0,
      },
      pending: {
        amount: pendingWithdrawals._sum.amountCents || 0,
        count: pendingWithdrawals._count || 0,
      },
      platform: {
        activeArtists,
        totalFans,
        totalSongs,
      },
    };
  }

  async getTransactions(query: AdminTransactionsQuery) {
    const { page, limit, type, startDate, endDate, userId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (userId) {
      // Find wallet for user
      const wallet = await prisma.wallet.findFirst({
        where: {
          artist: { userId },
        },
      });
      if (wallet) {
        where.walletId = wallet.id;
      }
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          netAmount: true,
          referenceId: true,
          createdAt: true,
          wallet: {
            select: {
              artist: {
                select: {
                  artistName: true,
                  userId: true,
                  user: {
                    select: {
                      email: true,
                      displayName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return {
      transactions: transactions.map((transaction) => ({
        ...transaction,
        amountCents: decimalToCents(transaction.amount),
        balanceAfterCents: decimalToCents(transaction.netAmount),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWithdrawals(query: AdminWithdrawalsQuery) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          amountCents: true,
          feeCents: true,
          status: true,
          requestedAt: true,
          completedAt: true,
          wallet: {
            select: {
              artist: {
                select: {
                  artistName: true,
                  userId: true,
                  stripeAccountId: true,
                  user: {
                    select: {
                      email: true,
                      displayName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { requestedAt: 'desc' },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return {
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getArtistFinancials(artistId: string) {
    const artist = await prisma.artistProfile.findUnique({
      where: { id: artistId },
      include: {
        wallet: true,
        user: {
          select: {
            email: true,
            displayName: true,
          },
        },
      },
    });

    if (!artist) {
      throw new NotFoundError('Artist not found');
    }

    // Get earnings breakdown
    const earnings = await prisma.walletTransaction.groupBy({
      by: ['type'],
      where: {
        walletId: artist.wallet?.id,
        type: 'song_sale',
      },
      _sum: {
        amount: true,
      },
    });

    // Get payout history
    const payouts = await prisma.withdrawal.findMany({
      where: {
        walletId: artist.wallet?.id,
      },
      select: {
        id: true,
        amountCents: true,
        feeCents: true,
        status: true,
        requestedAt: true,
        completedAt: true,
      },
      orderBy: { requestedAt: 'desc' },
      take: 20,
    });

    // Get transaction breakdown
    const transactions = await prisma.walletTransaction.findMany({
      where: {
        walletId: artist.wallet?.id,
      },
      select: {
        id: true,
        type: true,
        amount: true,
        netAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      artist: {
        id: artist.id,
        artistName: artist.artistName,
        email: artist.user.email,
        displayName: artist.user.displayName,
        subscriptionStatus: artist.subscriptionStatus,
        stripeConnectId: artist.stripeAccountId,
      },
      wallet: {
        balanceCents: decimalToCents(artist.wallet?.balance),
        totalEarnedCents: decimalToCents(artist.wallet?.totalEarned),
        totalWithdrawn: decimalToCents(artist.wallet?.totalWithdrawn),
      },
      earnings: earnings.map((e) => ({
        type: e.type,
        total: decimalToCents(e._sum?.amount),
      })),
      payouts,
      transactions: transactions.map((transaction) => ({
        ...transaction,
        amountCents: decimalToCents(transaction.amount),
        balanceAfterCents: decimalToCents(transaction.netAmount),
      })),
    };
  }

  /**
   * PLATFORM SETTINGS
   */

  async getPlatformSettings() {
    // For MVP, return hardcoded settings
    // In production, these would come from a settings table
    return {
      commissionRate: 0.2, // 20%
      minSongPrice: 99, // $0.99
      maxSongPrice: 99999, // $999.99
      artistSubscriptionPrice: 999, // $9.99/mo
      withdrawalFeeRate: 0.0023, // 0.23%
      minWithdrawalAmount: 1000, // $10
    };
  }

  async updatePlatformSettings(data: AdminUpdateSettings) {
    // For MVP, return the updated settings without persisting
    // In production, this would update a settings table
    const currentSettings = await this.getPlatformSettings();

    const updatedSettings = {
      ...currentSettings,
      ...data,
    };

    // Validate that maxSongPrice > minSongPrice
    if (
      updatedSettings.maxSongPrice &&
      updatedSettings.minSongPrice &&
      updatedSettings.maxSongPrice < updatedSettings.minSongPrice
    ) {
      throw new BadRequestError('Max song price must be greater than min song price');
    }

    return updatedSettings;
  }

  /**
   * GENRE MANAGEMENT
   */

  async createGenre(data: AdminCreateGenre) {
    // Check if genre with same slug already exists
    const existing = await prisma.genre.findFirst({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new BadRequestError('Genre with this slug already exists');
    }

    const genre = await prisma.genre.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });

    return genre;
  }

  async updateGenre(genreId: number, data: AdminUpdateGenre) {
    const genre = await prisma.genre.findUnique({
      where: { id: genreId },
    });

    if (!genre) {
      throw new NotFoundError('Genre not found');
    }

    // If updating slug, check it's not taken
    if (data.slug && data.slug !== genre.slug) {
      const existing = await prisma.genre.findFirst({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new BadRequestError('Genre with this slug already exists');
      }
    }

    const updatedGenre = await prisma.genre.update({
      where: { id: genreId },
      data,
    });

    return updatedGenre;
  }

  async deleteGenre(genreId: number) {
    const genre = await prisma.genre.findUnique({
      where: { id: genreId },
    });

    if (!genre) {
      throw new NotFoundError('Genre not found');
    }

    // Check if any songs use this genre
    const songCount = await prisma.song.count({
      where: {
        genreId,
      },
    });

    if (songCount > 0) {
      throw new BadRequestError(`Cannot delete genre: ${songCount} songs are using it`);
    }

    // Check if any artist profiles use this genre
    const artistCount = await prisma.artistProfile.count({
      where: {
        genreIds: {
          has: genreId,
        },
      },
    });

    if (artistCount > 0) {
      throw new BadRequestError(`Cannot delete genre: ${artistCount} artist profiles are using it`);
    }

    await prisma.genre.delete({
      where: { id: genreId },
    });

    return { message: 'Genre deleted successfully' };
  }

  /**
   * MODERATION - Report Detail
   */

  async getReportDetail(reportId: string) {
    const report = await prisma.contentReport.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatarUrl: true,
          },
        },
        song: {
          select: {
            id: true,
            title: true,
            artist: {
              select: {
                id: true,
                user: {
                  select: {
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            coverArtUrl: true,
            audioUrl: true,
            price: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundError('Report not found');
    }

    return report;
  }

  /**
   * CONTENT MANAGEMENT - Song Review
   */

  async getSongDetail(songId: string) {
    const song = await prisma.song.findUnique({
      where: { id: songId },
      include: {
        artist: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                avatarUrl: true,
              },
            },
            bio: true,
          },
        },
        genre: {
          select: {
            id: true,
            name: true,
          },
        },
        contentReports: {
          include: {
            reporter: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!song) {
      throw new NotFoundError('Song not found');
    }

    // Get song stats
    const [purchaseCount, reportCount] = await Promise.all([
      prisma.purchase.count({
        where: { songId },
      }),
      prisma.contentReport.count({
        where: { songId, status: 'pending' },
      }),
    ]);

    return {
      ...song,
      stats: {
        purchaseCount,
        reportCount,
      },
    };
  }

  /**
   * FINANCIAL MANAGEMENT - Withdrawal Detail
   */

  async getWithdrawalDetail(withdrawalId: string) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        wallet: {
          include: {
            artist: {
              include: {
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!withdrawal) {
      throw new NotFoundError('Withdrawal not found');
    }

    return withdrawal;
  }

  /**
   * CONTENT MANAGEMENT - Stats
   */

  async getContentStats() {
    const [totalSongs, activeSongs, totalArtists, activeArtists, totalGenres, pendingReports] =
      await Promise.all([
        prisma.song.count(),
        prisma.song.count({ where: { status: 'active' } }),
        prisma.artistProfile.count(),
        prisma.artistProfile.count({
          where: {
            user: {
              isBanned: false,
            },
          },
        }),
        prisma.genre.count(),
        prisma.contentReport.count({ where: { status: 'pending' } }),
      ]);

    return {
      songs: {
        total: totalSongs,
        active: activeSongs,
        inactive: totalSongs - activeSongs,
      },
      artists: {
        total: totalArtists,
        active: activeArtists,
        inactive: totalArtists - activeArtists,
      },
      genres: {
        total: totalGenres,
      },
      reports: {
        pending: pendingReports,
      },
    };
  }
}
