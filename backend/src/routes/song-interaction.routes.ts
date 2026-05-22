import { Router } from 'express';
import type { Request, Response } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/auth.js';
import { SongInteractionService } from '../services/song-interaction.service.js';
import {
  songIdParamSchema,
  commentIdParamSchema,
  commentCreateSchema,
  commentListQuerySchema,
} from '../schemas/song-interaction.js';

const router = Router();

// ── Like Routes ──────────────────────────────────────────

/**
 * GET /api/v1/songs/:songId/like
 * Returns the like status for the current user (or unauthenticated).
 */
router.get(
  '/:songId/like',
  optionalAuth,
  validate({ params: songIdParamSchema }),
  async (req: Request, res: Response) => {
    const { songId } = (req as any).validatedParams as { songId: string };
    const userId = req.user?.id ?? null;
    const status = await SongInteractionService.getLikeStatus(userId, songId);
    res.json({ success: true, data: status });
  },
);

/**
 * POST /api/v1/songs/:songId/like
 * Toggle like on a song (authenticate required).
 */
router.post(
  '/:songId/like',
  authenticate,
  validate({ params: songIdParamSchema }),
  async (req: Request, res: Response) => {
    const { songId } = (req as any).validatedParams as { songId: string };
    const status = await SongInteractionService.toggleLike(req.user!.id, songId);
    res.json({ success: true, data: status });
  },
);

// ── Comment Routes ───────────────────────────────────────

/**
 * GET /api/v1/songs/:songId/comments
 * Paginated comment list (public).
 */
router.get(
  '/:songId/comments',
  optionalAuth,
  validate({ params: songIdParamSchema, query: commentListQuerySchema }),
  async (req: Request, res: Response) => {
    const { songId } = (req as any).validatedParams as { songId: string };
    const { page, limit } = (req as any).validatedQuery as { page: number; limit: number };
    const result = await SongInteractionService.getComments(songId, page, limit);
    res.json({ success: true, data: result });
  },
);

/**
 * POST /api/v1/songs/:songId/comments
 * Create a comment (authenticate required).
 */
router.post(
  '/:songId/comments',
  authenticate,
  validate({ params: songIdParamSchema, body: commentCreateSchema }),
  async (req: Request, res: Response) => {
    const { songId } = (req as any).validatedParams as { songId: string };
    const comment = await SongInteractionService.createComment(req.user!.id, songId, req.body.body);
    res.status(201).json({ success: true, data: comment });
  },
);

/**
 * DELETE /api/v1/songs/:songId/comments/:commentId
 * Delete own comment (authenticate required).
 */
router.delete(
  '/:songId/comments/:commentId',
  authenticate,
  validate({ params: commentIdParamSchema }),
  async (req: Request, res: Response) => {
    const { commentId } = (req as any).validatedParams as {
      songId: string;
      commentId: string;
    };
    await SongInteractionService.deleteComment(req.user!.id, commentId);
    res.json({ success: true });
  },
);

export { router as songInteractionRouter };
