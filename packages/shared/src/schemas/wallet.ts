import { z } from 'zod';

export const withdrawalSchema = z.object({
  amount: z.number().min(10),
});

export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
