import { z } from 'zod';

export const getNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const markReadSchema = z.object({
  id: z.string().uuid('Invalid notification ID'),
});

export type GetNotificationsQuery = z.infer<typeof getNotificationsSchema>;
export type MarkReadParams = z.infer<typeof markReadSchema>;
