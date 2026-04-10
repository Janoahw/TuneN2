import { z } from 'zod';

export const createSongSchema = z.object({
  title: z.string().min(1).max(200),
  genreId: z.number().int().positive(),
  price: z.number().min(0).max(9.99),
  isFree: z.boolean(),
});

export const updateSongSchema = createSongSchema.partial();

export type CreateSongInput = z.infer<typeof createSongSchema>;
export type UpdateSongInput = z.infer<typeof updateSongSchema>;
