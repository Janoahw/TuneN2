import { z } from 'zod';

export const upgradeToArtistSchema = z.object({
  artistName: z
    .string()
    .min(1, 'Artist name is required')
    .max(100, 'Artist name must be 100 characters or less'),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  genreIds: z
    .array(z.number().int().positive())
    .min(1, 'Select at least one genre')
    .max(5, 'Maximum 5 genres'),
  profileImageUrl: z.string().url('Must be a valid URL').optional(),
});

export const updateArtistProfileSchema = z.object({
  artistName: z
    .string()
    .min(1, 'Artist name is required')
    .max(100, 'Artist name must be 100 characters or less')
    .optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  genreIds: z
    .array(z.number().int().positive())
    .min(1, 'Select at least one genre')
    .max(5, 'Maximum 5 genres')
    .optional(),
  profileImageUrl: z.string().url('Must be a valid URL').nullable().optional(),
  bannerImageUrl: z.string().url('Must be a valid URL').nullable().optional(),
  collaborationPrice: z.number().min(0).optional(),
  fanSubscriptionPrice: z.number().min(0).optional(),
});

export const artistIdParamSchema = z.object({
  artistId: z.string().uuid('Invalid artist ID'),
});
