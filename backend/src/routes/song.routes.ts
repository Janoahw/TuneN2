import { Router } from 'express';
import type { Request, Response } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
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

// Get song details (public)
router.get(
  '/:songId',
  validate({ params: songIdParamSchema }),
  async (req: Request, res: Response) => {
    const song = await SongService.getSongById(req.params.songId);
    res.json({ success: true, data: { song } });
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
    const artist = await (await import('../config/database.js')).prisma.artistProfile.findUnique({
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
    const { status, page, limit } = req.query as unknown as {
      status?: string;
      page: number;
      limit: number;
    };
    const result = await SongService.getArtistSongs(req.user!.id, { status, page, limit });
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
    const song = await SongService.updateSong(req.user!.id, req.params.songId, req.body);
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
    await SongService.deleteSong(req.user!.id, req.params.songId);
    res.json({ success: true, message: 'Song deleted' });
  },
);

export { router as songRouter };
