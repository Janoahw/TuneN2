import { z } from 'zod';

export const createReportSchema = z.object({
  songId: z.string().uuid('Invalid song ID'),
  reason: z.enum(['copyright', 'inappropriate', 'spam', 'other'], {
    errorMap: () => ({ message: 'Invalid reason. Must be copyright, inappropriate, spam, or other' }),
  }),
  description: z.string().max(1000).optional(),
});

export const getReportsSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const updateReportSchema = z.object({
  id: z.string().uuid('Invalid report ID'),
  status: z.enum(['dismissed', 'resolved'], {
    errorMap: () => ({ message: 'Status must be dismissed or resolved' }),
  }),
  action: z.enum(['remove_content', 'no_action']).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type GetReportsQuery = z.infer<typeof getReportsSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
