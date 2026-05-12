import { Router } from 'express';
import { AdminService } from '../services/admin.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import {
  adminUsersQuerySchema,
  adminUserIdParamSchema,
  adminBanUserSchema,
  adminUnbanUserSchema,
  adminFinancialsQuerySchema,
  adminTransactionsQuerySchema,
  adminWithdrawalsQuerySchema,
  adminArtistIdParamSchema,
  adminUpdateSettingsSchema,
  adminCreateGenreSchema,
  adminUpdateGenreSchema,
  adminGenreIdParamSchema,
} from '../schemas/admin.js';

const router = Router();
const adminService = new AdminService();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

/**
 * USER MANAGEMENT
 */

// GET /api/v1/admin/users
// List all users with search and filters
router.get('/users', validate({ query: adminUsersQuerySchema }), async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/admin/users/:userId
// Get user detail with stats
router.get(
  '/users/:userId',
  validate({ params: adminUserIdParamSchema }),
  async (req, res, next) => {
    try {
      const result = await adminService.getUserDetail(req.params.userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/v1/admin/users/:userId/ban
// Ban a user
router.patch(
  '/users/:userId/ban',
  validate({
    params: adminUserIdParamSchema,
    body: adminBanUserSchema,
  }),
  async (req, res, next) => {
    try {
      const result = await adminService.banUser(req.params.userId, req.body, req.user!.id);
      res.json({
        success: true,
        data: result,
        message: 'User banned successfully',
      });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/v1/admin/users/:userId/unban
// Unban a user
router.patch(
  '/users/:userId/unban',
  validate({
    params: adminUserIdParamSchema,
    body: adminUnbanUserSchema,
  }),
  async (req, res, next) => {
    try {
      const result = await adminService.unbanUser(req.params.userId, req.body, req.user!.id);
      res.json({
        success: true,
        data: result,
        message: 'User unbanned successfully',
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * FINANCIAL MANAGEMENT
 */

// GET /api/v1/admin/financials/overview
// Platform financial overview
router.get(
  '/financials/overview',
  validate({ query: adminFinancialsQuerySchema }),
  async (req, res, next) => {
    try {
      const result = await adminService.getFinancialOverview(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/v1/admin/financials/transactions
// All platform transactions
router.get(
  '/financials/transactions',
  validate({ query: adminTransactionsQuerySchema }),
  async (req, res, next) => {
    try {
      const result = await adminService.getTransactions(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/v1/admin/financials/withdrawals
// All withdrawal requests
router.get(
  '/financials/withdrawals',
  validate({ query: adminWithdrawalsQuerySchema }),
  async (req, res, next) => {
    try {
      const result = await adminService.getWithdrawals(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/v1/admin/financials/artists/:artistId
// Artist financial details
router.get(
  '/financials/artists/:artistId',
  validate({ params: adminArtistIdParamSchema }),
  async (req, res, next) => {
    try {
      const result = await adminService.getArtistFinancials(req.params.artistId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PLATFORM SETTINGS
 */

// GET /api/v1/admin/settings
// Get platform settings
router.get('/settings', async (req, res, next) => {
  try {
    const result = await adminService.getPlatformSettings();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/admin/settings
// Update platform settings
router.patch('/settings', validate({ body: adminUpdateSettingsSchema }), async (req, res, next) => {
  try {
    const result = await adminService.updatePlatformSettings(req.body);
    res.json({
      success: true,
      data: result,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GENRE MANAGEMENT
 */

// POST /api/v1/admin/genres
// Create new genre
router.post('/genres', validate({ body: adminCreateGenreSchema }), async (req, res, next) => {
  try {
    const result = await adminService.createGenre(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Genre created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/admin/genres/:genreId
// Update genre
router.patch(
  '/genres/:genreId',
  validate({
    params: adminGenreIdParamSchema,
    body: adminUpdateGenreSchema,
  }),
  async (req, res, next) => {
    try {
      const result = await adminService.updateGenre(req.params.genreId, req.body);
      res.json({
        success: true,
        data: result,
        message: 'Genre updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/v1/admin/genres/:genreId
// Delete genre
router.delete(
  '/genres/:genreId',
  validate({ params: adminGenreIdParamSchema }),
  async (req, res, next) => {
    try {
      const result = await adminService.deleteGenre(req.params.genreId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

export const adminRouter = router;
