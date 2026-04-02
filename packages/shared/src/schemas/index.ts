import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
  displayName: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export const createSongSchema = z.object({
  title: z.string().min(1).max(200),
  genreId: z.number().int().positive(),
  price: z.number().min(0).max(9.99),
  isFree: z.boolean(),
});

export const updateSongSchema = createSongSchema.partial();

export const createReleaseSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['single', 'album', 'ep']),
  releaseDate: z.string().nullable().optional(),
});

export const reportContentSchema = z.object({
  reason: z.enum(['copyright', 'inappropriate', 'spam', 'other']),
  description: z.string().max(1000).optional(),
});

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const withdrawalSchema = z.object({
  amount: z.number().min(10),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateSongInput = z.infer<typeof createSongSchema>;
export type UpdateSongInput = z.infer<typeof updateSongSchema>;
export type CreateReleaseInput = z.infer<typeof createReleaseSchema>;
export type ReportContentInput = z.infer<typeof reportContentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
