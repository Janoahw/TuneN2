import { z } from 'zod';

export const purchaseSongParamSchema = z.object({
  songId: z.string().uuid('Invalid song ID'),
});

export const purchaseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
