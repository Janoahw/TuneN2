import { z } from 'zod';

// ─── Upload URL Request ─────────────────────

export const uploadUrlSchema = z.object({
  fileType: z.enum(['audio', 'cover-art']),
  mimeType: z.string().refine(
    (v) =>
      [
        'audio/mpeg',
        'audio/wav',
        'audio/x-wav',
        'audio/flac',
        'audio/x-flac',
        'image/jpeg',
        'image/png',
      ].includes(v),
    { message: 'Unsupported file type. Allowed: MP3, WAV, FLAC, JPEG, PNG' },
  ),
  fileSize: z.number().int().positive().max(50 * 1024 * 1024, 'Max file size is 50MB'),
});

// ─── Create Song ────────────────────────────

export const createSongSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  genreId: z.number().int().positive(),
  price: z
    .number()
    .refine((v) => v === 0 || (v >= 0.49 && v <= 9.99), {
      message: 'Price must be free ($0) or between $0.49 and $9.99',
    }),
  isFree: z.boolean(),
  audioFileKey: z.string().min(1, 'Audio file key is required'),
  coverArtKey: z.string().min(1).optional(),
});

// ─── Update Song ────────────────────────────

export const updateSongSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  genreId: z.number().int().positive().optional(),
  price: z
    .number()
    .refine((v) => v === 0 || (v >= 0.49 && v <= 9.99), {
      message: 'Price must be free ($0) or between $0.49 and $9.99',
    })
    .optional(),
  isFree: z.boolean().optional(),
  coverArtKey: z.string().min(1).nullable().optional(),
});

// ─── Song ID Param ──────────────────────────

export const songIdParamSchema = z.object({
  songId: z.string().uuid('Invalid song ID'),
});

// ─── Song List Query ────────────────────────

export const songListQuerySchema = z.object({
  status: z.enum(['processing', 'active', 'rejected', 'deleted']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
