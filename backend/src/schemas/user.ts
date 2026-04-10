import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name must be at least 1 character')
    .max(100, 'Display name must be 100 characters or less')
    .optional(),
  avatarUrl: z.string().url('Must be a valid URL').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number'),
});

export const uploadUrlSchema = z.object({
  type: z.enum(['avatar', 'profile-banner']),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});
