import { z } from 'zod';

// User management schemas
export const adminUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['fan', 'artist', 'admin']).optional(),
  status: z.enum(['active', 'banned']).optional(),
});

export const adminUserIdParamSchema = z.object({
  userId: z.string().uuid(),
});

export const adminBanUserSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const adminUnbanUserSchema = z.object({
  note: z.string().min(1).max(500).optional(),
});

// Financial overview schemas
export const adminFinancialsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const adminTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  type: z
    .enum(['song_sale', 'withdrawal', 'withdrawal_fee', 'platform_fee', 'withdrawal_reversal'])
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  userId: z.string().uuid().optional(),
});

export const adminWithdrawalsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
});

export const adminContentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const adminGenresQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const adminArtistIdParamSchema = z.object({
  artistId: z.string().uuid(),
});

// Platform settings schemas
export const adminUpdateSettingsSchema = z.object({
  platformName: z.string().min(1).max(100).optional(),
  supportEmail: z.string().email().max(255).optional(),
  maxUploadSizeMb: z.number().int().min(1).max(1024).optional(),
  commissionRate: z.number().min(0).max(1).optional(), // 0.20 = 20%
  minSongPrice: z.number().int().min(0).optional(), // cents
  maxSongPrice: z.number().int().min(0).optional(), // cents
  artistSubscriptionPrice: z.number().int().min(0).optional(), // cents
  withdrawalFeeRate: z.number().min(0).max(1).optional(), // 0.0023 = 0.23%
  minWithdrawalAmount: z.number().int().min(0).optional(), // cents
  autoModeration: z.boolean().optional(),
  allowDownloads: z.boolean().optional(),
  analyticsSync: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  signupsPerHour: z.number().int().min(1).max(100000).optional(),
  songUploadsPerMinute: z.number().int().min(1).max(1000).optional(),
  webhookTimeout: z.number().int().min(1).max(600).optional(),
});

// Genre management schemas
export const adminCreateGenreSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
});

export const adminUpdateGenreSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
});

export const adminGenreIdParamSchema = z.object({
  genreId: z.coerce.number().int().min(1),
});

// Report detail schema
export const adminReportIdParamSchema = z.object({
  reportId: z.string().uuid(),
});

// Song detail schema
export const adminSongIdParamSchema = z.object({
  songId: z.string().uuid(),
});

// Withdrawal detail schema
export const adminWithdrawalIdParamSchema = z.object({
  withdrawalId: z.string().uuid(),
});

// Type exports
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;
export type AdminUserIdParam = z.infer<typeof adminUserIdParamSchema>;
export type AdminBanUser = z.infer<typeof adminBanUserSchema>;
export type AdminUnbanUser = z.infer<typeof adminUnbanUserSchema>;
export type AdminFinancialsQuery = z.infer<typeof adminFinancialsQuerySchema>;
export type AdminTransactionsQuery = z.infer<typeof adminTransactionsQuerySchema>;
export type AdminWithdrawalsQuery = z.infer<typeof adminWithdrawalsQuerySchema>;
export type AdminContentListQuery = z.infer<typeof adminContentListQuerySchema>;
export type AdminGenresQuery = z.infer<typeof adminGenresQuerySchema>;
export type AdminArtistIdParam = z.infer<typeof adminArtistIdParamSchema>;
export type AdminUpdateSettings = z.infer<typeof adminUpdateSettingsSchema>;
export type AdminCreateGenre = z.infer<typeof adminCreateGenreSchema>;
export type AdminUpdateGenre = z.infer<typeof adminUpdateGenreSchema>;
export type AdminGenreIdParam = z.infer<typeof adminGenreIdParamSchema>;
export type AdminReportIdParam = z.infer<typeof adminReportIdParamSchema>;
export type AdminSongIdParam = z.infer<typeof adminSongIdParamSchema>;
export type AdminWithdrawalIdParam = z.infer<typeof adminWithdrawalIdParamSchema>;
