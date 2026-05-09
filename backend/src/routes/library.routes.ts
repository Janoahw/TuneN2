import { Router } from 'express';
import type { Request, Response } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { LibraryService } from '../services/library.service.js';
import { libraryQuerySchema, libraryCheckParamSchema } from '../schemas/library.js';

const router = Router();

// ── Get user's library ──────────────────────

router.get(
  '/',
  authenticate,
  validate({ query: libraryQuerySchema }),
  async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await LibraryService.getUserLibrary(req.user!.id, { page, limit });
    res.json({ success: true, data: result });
  },
);

// ── Quick ownership check ───────────────────

router.get(
  '/check/:songId',
  authenticate,
  validate({ params: libraryCheckParamSchema }),
  async (req: Request, res: Response) => {
    const owned = await LibraryService.checkOwnership(req.user!.id, req.params.songId as string);
    res.json({ success: true, data: { owned } });
  },
);

export { router as libraryRouter };
