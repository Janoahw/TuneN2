import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { NotificationService } from './notification.service.js';

export class ReportService {
  /**
   * Create a content report
   */
  static async createReport(params: {
    reporterId: string;
    songId: string;
    reason: 'copyright' | 'inappropriate' | 'spam' | 'other';
    description?: string;
  }) {
    // Check if user already reported this song
    const existingReport = await prisma.contentReport.findFirst({
      where: {
        reporterId: params.reporterId,
        songId: params.songId,
      },
    });

    if (existingReport) {
      throw new Error('You have already reported this content');
    }

    const song = await prisma.song.findUnique({
      where: { id: params.songId },
      select: { artistId: true },
    });

    if (!song) {
      throw new Error('Song not found');
    }

    const report = await prisma.contentReport.create({
      data: {
        reporterId: params.reporterId,
        songId: params.songId,
        artistId: song.artistId,
        reason: params.reason,
        description: params.description,
        status: 'pending',
      },
      include: {
        song: {
          select: {
            title: true,
            artist: {
              select: { artistName: true },
            },
          },
        },
      },
    });

    logger.info({ reportId: report.id, songId: params.songId }, 'Content report created');
    return report;
  }

  /**
   * Get user's reports
   */
  static async getUserReports(userId: string, params: { page: number; limit: number }) {
    const skip = (params.page - 1) * params.limit;

    const [reports, total] = await Promise.all([
      prisma.contentReport.findMany({
        where: { reporterId: userId },
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          song: {
            select: {
              title: true,
              artist: {
                select: { artistName: true },
              },
            },
          },
        },
      }),
      prisma.contentReport.count({
        where: { reporterId: userId },
      }),
    ]);

    return {
      reports,
      total,
      page: params.page,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  /**
   * Get all reports (admin only)
   */
  static async getReports(params: {
    status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;

    const [reports, total] = await Promise.all([
      prisma.contentReport.findMany({
        where: params.status ? { status: params.status } : undefined,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          song: {
            select: {
              id: true,
              title: true,
              artist: {
                select: {
                  id: true,
                  artistName: true,
                },
              },
            },
          },
        },
      }),
      prisma.contentReport.count({
        where: params.status ? { status: params.status } : undefined,
      }),
    ]);

    return {
      reports,
      total,
      page: params.page,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  /**
   * Update report status (admin only)
   */
  static async updateReport(params: {
    reportId: string;
    reviewerId: string;
    status: 'dismissed' | 'resolved';
    action?: 'remove_content' | 'no_action';
  }) {
    const report = await prisma.contentReport.findUnique({
      where: { id: params.reportId },
      include: {
        song: {
          select: { title: true },
        },
      },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    // Update report status
    const updatedReport = await prisma.contentReport.update({
      where: { id: params.reportId },
      data: {
        status: params.status,
        reviewedBy: params.reviewerId,
        resolvedAt: new Date(),
      },
    });

    // If action is to remove content, update song status
    if (params.action === 'remove_content' && report.songId) {
      await prisma.song.update({
        where: { id: report.songId },
        data: { status: 'deleted' },
      });
    }

    // Notify reporter
    if (report.song) {
      await NotificationService.notifyReportAction({
        reporterId: report.reporterId,
        songTitle: report.song.title,
        action: params.action === 'remove_content' ? 'removed' : 'dismissed',
      });
    }

    logger.info(
      { reportId: params.reportId, status: params.status, action: params.action },
      'Report status updated',
    );

    return updatedReport;
  }
}
