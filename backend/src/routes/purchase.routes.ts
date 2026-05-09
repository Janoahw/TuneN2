import { Router } from 'express';
import type { Request, Response } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { PurchaseService } from '../services/purchase.service.js';
import { purchaseSongParamSchema, purchaseListQuerySchema } from '../schemas/purchase.js';

const router = Router();

// ── Purchase a song ─────────────────────────

router.post(
  '/:songId/purchase',
  authenticate,
  validate({ params: purchaseSongParamSchema }),
  async (req: Request, res: Response) => {
    const result = await PurchaseService.createPaymentIntent(
      req.user!.id,
      req.params.songId as string,
    );
    res.json({ success: true, data: result });
  },
);

// ── Check ownership ─────────────────────────

router.get(
  '/:songId/ownership',
  authenticate,
  validate({ params: purchaseSongParamSchema }),
  async (req: Request, res: Response) => {
    const owned = await PurchaseService.checkOwnership(req.user!.id, req.params.songId as string);
    res.json({ success: true, data: { owned } });
  },
);

// ── Download a purchased song ───────────────

router.get(
  '/:songId/download',
  authenticate,
  validate({ params: purchaseSongParamSchema }),
  async (req: Request, res: Response) => {
    const result = await PurchaseService.getDownloadUrl(req.user!.id, req.params.songId as string);
    res.json({ success: true, data: result });
  },
);

// ── My Purchases ────────────────────────────

router.get(
  '/me/purchases',
  authenticate,
  validate({ query: purchaseListQuerySchema }),
  async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as {
      page: number;
      limit: number;
    };
    const result = await PurchaseService.getUserPurchases(req.user!.id, page, limit);
    res.json({ success: true, data: result });
  },
);

// ── My Downloads ────────────────────────────

router.get(
  '/me/downloads',
  authenticate,
  validate({ query: purchaseListQuerySchema }),
  async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as {
      page: number;
      limit: number;
    };
    const result = await PurchaseService.getUserDownloads(req.user!.id, page, limit);
    res.json({ success: true, data: result });
  },
);

export { router as purchaseRouter };
