import { Router } from 'express';
import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ReportService } from '../services/report.service.js';
import { createReportSchema, getReportsSchema, updateReportSchema } from '../schemas/report.js';

const router = Router();

// Rate limiter: 5 reports per hour per user
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many reports. Please try again later.',
      details: null,
    },
  },
});

/**
 * POST /api/v1/reports
 * Create a content report
 */
router.post(
  '/',
  authenticate,
  reportLimiter,
  validate({ body: createReportSchema }),
  async (req: Request, res: Response) => {
    const { songId, reason, description } = req.body;
    const reporterId = req.user!.id;

    const report = await ReportService.createReport({
      reporterId,
      songId,
      reason,
      description,
    });

    return res.status(201).json({
      success: true,
      data: report,
      error: null,
    });
  },
);

/**
 * GET /api/v1/reports/my
 * Get current user's reports
 */
router.get(
  '/my',
  authenticate,
  validate({ query: getReportsSchema }),
  async (req: Request, res: Response) => {
    const { page, limit } = req.query as { page: number; limit: number };
    const userId = req.user!.id;

    const result = await ReportService.getUserReports(userId, { page, limit });

    return res.json({
      success: true,
      data: result,
      error: null,
    });
  },
);

/**
 * GET /api/v1/admin/reports
 * Get all reports (admin only)
 */
router.get(
  '/admin',
  authenticate,
  validate({ query: getReportsSchema }),
  async (req: Request, res: Response) => {
    // Check if user is admin
    if (!req.user!.isAdmin) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
          details: null,
        },
      });
    }

    const { status, page, limit } = req.query as {
      status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
      page: number;
      limit: number;
    };

    const result = await ReportService.getReports({ status, page, limit });

    return res.json({
      success: true,
      data: result,
      error: null,
    });
  },
);

/**
 * PATCH /api/v1/admin/reports/:id
 * Update report status (admin only)
 */
router.patch(
  '/admin/:id',
  authenticate,
  validate({ body: updateReportSchema }),
  async (req: Request, res: Response) => {
    // Check if user is admin
    if (!req.user!.isAdmin) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
          details: null,
        },
      });
    }

    const { id } = req.params;
    const { status, action } = req.body;
    const reviewerId = req.user!.id;

    const report = await ReportService.updateReport({
      reportId: id,
      reviewerId,
      status,
      action,
    });

    return res.json({
      success: true,
      data: report,
      error: null,
    });
  },
);

export const reportRouter = router;
