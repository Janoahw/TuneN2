import { Router } from 'express';
import type { Request, Response } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/auth.js';
import { requireArtist } from '../middleware/requireArtist.js';
import { SongService } from '../services/song.service.js';
import {
  uploadUrlSchema,
  createSongSchema,
  updateSongSchema,
  songIdParamSchema,
  songListQuerySchema,
} from '../schemas/song.js';

const router = Router();

// ── Public Routes ───────────────────────────

// Get song details (public, with ownership flag if authenticated)
router.get(
  '/:songId',
  optionalAuth,
  validate({ params: songIdParamSchema }),
  async (req: Request, res: Response) => {
    const { songId } = (req as any).validatedParams as { songId: string };
    const song = await SongService.getSongById(songId);
    let owned = false;
    if (req.user) {
      const { prisma } = await import('../config/database.js');
      const purchase = await prisma.purchase.findUnique({
        where: { buyerId_songId: { buyerId: req.user.id, songId: songId } },
      });
      owned = purchase?.status === 'completed';
    }
    res.json({ success: true, data: { song, owned } });
  },
);

// ── Artist Routes ───────────────────────────

// Generate presigned upload URL
router.post(
  '/upload-url',
  authenticate,
  requireArtist,
  validate({ body: uploadUrlSchema }),
  async (req: Request, res: Response) => {
    const artist = await (
      await import('../config/database.js')
    ).prisma.artistProfile.findUnique({
      where: { userId: req.user!.id },
    });
    const result = await SongService.generateUploadUrl(
      artist!.id,
      req.body.fileType,
      req.body.mimeType,
    );
    res.json({ success: true, data: result });
  },
);

// Create song
router.post(
  '/',
  authenticate,
  requireArtist,
  validate({ body: createSongSchema }),
  async (req: Request, res: Response) => {
    const song = await SongService.createSong(req.user!.id, req.body);
    res.status(201).json({ success: true, data: { song } });
  },
);

// Get artist's own songs
router.get(
  '/me/catalog',
  authenticate,
  requireArtist,
  validate({ query: songListQuerySchema }),
  async (req: Request, res: Response) => {
    const { status, page, limit } = (req as any).validatedQuery as {
      status?: string;
      page: number;
      limit: number;
    };
    const result = await SongService.getArtistSongs(req.user!.id, { status, page, limit });
    res.json({ success: true, data: result });
  },
);

// Get artist's songs with revenue + download stats
router.get(
  '/me/catalog/stats',
  authenticate,
  requireArtist,
  validate({ query: songListQuerySchema }),
  async (req: Request, res: Response) => {
    const { status, page, limit } = (req as any).validatedQuery as {
      status?: string;
      page: number;
      limit: number;
    };
    const result = await SongService.getArtistSongsWithStats(req.user!.id, { status, page, limit });
    res.json({ success: true, data: result });
  },
);

// Update song
router.patch(
  '/:songId',
  authenticate,
  requireArtist,
  validate({ params: songIdParamSchema, body: updateSongSchema }),
  async (req: Request, res: Response) => {
    const { songId } = (req as any).validatedParams as { songId: string };
    const song = await SongService.updateSong(req.user!.id, songId, req.body);
    res.json({ success: true, data: { song } });
  },
);

// Delete song (soft-delete)
router.delete(
  '/:songId',
  authenticate,
  requireArtist,
  validate({ params: songIdParamSchema }),
  async (req: Request, res: Response) => {
    const { songId } = (req as any).validatedParams as { songId: string };
    await SongService.deleteSong(req.user!.id, songId);
    res.json({ success: true, message: 'Song deleted' });
  },
);

export { router as songRouter };
