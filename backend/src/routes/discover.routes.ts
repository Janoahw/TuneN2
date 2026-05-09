import { Router } from 'express';
import type { Request, Response } from 'express';
import { validate } from '../middleware/validate.js';
import { optionalAuth } from '../middleware/auth.js';
import { DiscoverService } from '../services/discover.service.js';
import {
  searchQuerySchema,
  discoverQuerySchema,
  genreSlugParamSchema,
  artistsListQuerySchema,
} from '../schemas/discover.js';

const router = Router();

// ── Discover feed ───────────────────────────

router.get(
  '/discover',
  validate({ query: discoverQuerySchema }),
  async (req: Request, res: Response) => {
    const { limit } = req.query as unknown as { limit: number };
    const data = await DiscoverService.getDiscoverFeed(limit);
    res.json({ success: true, data });
  },
);

// ── Search ───────────────────────────────────

router.get(
  '/search',
  validate({ query: searchQuerySchema }),
  async (req: Request, res: Response) => {
    const { q, type, page, limit } = req.query as unknown as {
      q: string;
      type: 'all' | 'artists' | 'songs';
      page: number;
      limit: number;
    };
    const data = await DiscoverService.search(q, type, page, limit);
    res.json({ success: true, data });
  },
);

// ── Genres ───────────────────────────────────

router.get('/genres', async (_req: Request, res: Response) => {
  const genres = await DiscoverService.getGenres();
  res.json({ success: true, data: { genres } });
});

router.get(
  '/genres/:slug',
  validate({ params: genreSlugParamSchema }),
  async (req: Request, res: Response) => {
    const data = await DiscoverService.getGenreDetail(req.params.slug as string);
    res.json({ success: true, data });
  },
);

// ── Artists list ─────────────────────────────

router.get(
  '/artists',
  validate({ query: artistsListQuerySchema }),
  async (req: Request, res: Response) => {
    const { page, limit, genre } = req.query as unknown as {
      page: number;
      limit: number;
      genre?: string;
    };
    const data = await DiscoverService.getArtists({ page, limit, genre });
    res.json({ success: true, data });
  },
);

// ── Recommended songs ────────────────────────

router.get('/songs/recommended', optionalAuth, async (req: Request, res: Response) => {
  const userId = req.user?.id ?? null;
  const songs = await DiscoverService.getRecommendedSongs(userId);
  res.json({ success: true, data: { songs } });
});

export { router as discoverRouter };
