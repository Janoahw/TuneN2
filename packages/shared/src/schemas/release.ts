import { z } from 'zod';

export const createReleaseSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['single', 'album', 'ep']),
  releaseDate: z.string().nullable().optional(),
});

export type CreateReleaseInput = z.infer<typeof createReleaseSchema>;
