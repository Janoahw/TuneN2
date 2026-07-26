import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { LegalService } from '../services/legal.service.js';
import {
  legalTypeParamSchema,
  legalAcceptSchema,
  type LegalDocumentType,
} from '../schemas/legal.js';

const router = Router();
const legalService = new LegalService();

/**
 * GET /api/v1/legal/acceptance-status
 * Whether the caller has accepted the live Terms.
 *
 * Declared before `/:type` — otherwise the literal path is swallowed by the
 * parameterised route and rejected by its enum validation.
 */
router.get('/acceptance-status', authenticate, async (req: Request, res: Response) => {
  const status = await legalService.getAcceptanceStatus(req.user!.id);
  res.json({ success: true, data: status });
});

/**
 * POST /api/v1/legal/accept
 * Record acceptance of a version the client has actually been shown.
 */
router.post(
  '/accept',
  authenticate,
  validate({ body: legalAcceptSchema }),
  async (req: Request, res: Response) => {
    const status = await legalService.recordAcceptance(req.user!.id, req.body.version);
    res.json({ success: true, data: status });
  },
);

/**
 * GET /api/v1/legal/:type
 * The live document. Public — returns published content only.
 */
router.get(
  '/:type',
  validate({ params: legalTypeParamSchema }),
  async (req: Request, res: Response) => {
    const { type } = (req as any).validatedParams as { type: LegalDocumentType };
    const doc = await legalService.getPublished(type);
    res.json({ success: true, data: doc });
  },
);

export const legalRouter = router;
