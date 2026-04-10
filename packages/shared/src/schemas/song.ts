import { z } from 'zod';

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

export type CreateSongInput = z.infer<typeof createSongSchema>;
export type UpdateSongInput = z.infer<typeof updateSongSchema>;
