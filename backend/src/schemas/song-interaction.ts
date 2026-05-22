import { z } from 'zod';

// ─── Shared param ──────────────────────────────────────────

export const songIdParamSchema = z.object({
  songId: z.string().uuid('Invalid song ID'),
});

// ─── Comment params ────────────────────────────────────────

export const commentIdParamSchema = z.object({
  songId: z.string().uuid('Invalid song ID'),
  commentId: z.string().uuid('Invalid comment ID'),
});

// ─── Comment body ──────────────────────────────────────────

export const commentCreateSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment cannot exceed 500 characters'),
});

// ─── Comment list query ────────────────────────────────────

export const commentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});
