import { Router } from 'express';
import type { Request, Response } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { requireArtist } from '../middleware/requireArtist.js';
import { ArtistService } from '../services/artist.service.js';
import {
  upgradeToArtistSchema,
  updateArtistProfileSchema,
  artistIdParamSchema,
} from '../schemas/artist.js';

const router = Router();

// ── Public Routes ───────────────────────────

// Get public artist profile
router.get(
  '/:artistId',
  validate({ params: artistIdParamSchema }),
  async (req: Request, res: Response) => {
    const artist = await ArtistService.getArtistProfile(req.params.artistId);
    res.json({ success: true, data: { artist } });
  },
);

// ── Authenticated Routes ────────────────────

// Upgrade fan to artist (create subscription + profile)
router.post(
  '/upgrade',
  authenticate,
  validate({ body: upgradeToArtistSchema }),
  async (req: Request, res: Response) => {
    const result = await ArtistService.upgradeToArtist(req.user!.id, req.body);
    res.status(201).json({ success: true, data: result });
  },
);

// Create/get Stripe Connect account onboarding link
router.post('/connect', authenticate, requireArtist, async (req: Request, res: Response) => {
  const result = await ArtistService.createConnectAccount(req.user!.id);
  res.json({ success: true, data: result });
});

// Verify Connect account status after onboarding
router.get('/connect/status', authenticate, requireArtist, async (req: Request, res: Response) => {
  const result = await ArtistService.verifyConnectAccount(req.user!.id);
  res.json({ success: true, data: result });
});

// Get own artist profile
router.get('/me/profile', authenticate, requireArtist, async (req: Request, res: Response) => {
  const artist = await ArtistService.getMyArtistProfile(req.user!.id);
  res.json({ success: true, data: { artist } });
});

// Update own artist profile
router.patch(
  '/me/profile',
  authenticate,
  requireArtist,
  validate({ body: updateArtistProfileSchema }),
  async (req: Request, res: Response) => {
    const artist = await ArtistService.updateArtistProfile(req.user!.id, req.body);
    res.json({ success: true, data: { artist } });
  },
);

// Get subscription status
router.get('/me/subscription', authenticate, requireArtist, async (req: Request, res: Response) => {
  const status = await ArtistService.getSubscriptionStatus(req.user!.id);
  res.json({ success: true, data: status });
});

export { router as artistRouter };
