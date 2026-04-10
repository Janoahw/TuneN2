import { z } from 'zod';

export const reportContentSchema = z.object({
  reason: z.enum(['copyright', 'inappropriate', 'spam', 'other']),
  description: z.string().max(1000).optional(),
});

export type ReportContentInput = z.infer<typeof reportContentSchema>;
