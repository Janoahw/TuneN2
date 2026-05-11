import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../config/database.js';
import { getNotificationsSchema, markReadSchema } from '../schemas/notification.js';

const router = Router();

/**
 * GET /api/v1/notifications
 * Get user's notifications (paginated)
 */
router.get(
  '/',
  authenticate,
  validate({ query: getNotificationsSchema }),
  async (req: Request, res: Response) => {
    const { page, limit } = req.query as { page: number; limit: number };
    const userId = req.user!.id;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      },
      error: null,
    });
  },
);

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a notification as read
 */
router.patch(
  '/:id/read',
  authenticate,
  validate({ params: markReadSchema }),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Ensure notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found',
          details: null,
        },
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json({
      success: true,
      data: updated,
      error: null,
    });
  },
);

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return res.json({
    success: true,
    data: {
      message: `Marked ${result.count} notifications as read`,
      count: result.count,
    },
    error: null,
  });
});

export const notificationRouter = router;
