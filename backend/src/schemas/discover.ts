import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query is required').max(200),
  type: z.enum(['all', 'artists', 'songs']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const discoverQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export const genreSlugParamSchema = z.object({
  slug: z.string().min(1).max(100),
});

export const artistsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  genre: z.string().optional(),
});
