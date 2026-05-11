import { z } from 'zod';

export const registerDeviceSchema = z.object({
  token: z.string().min(1, 'Expo push token is required'),
  platform: z.enum(['ios', 'android'], {
    errorMap: () => ({ message: 'Platform must be ios or android' }),
  }),
});

export const deleteDeviceSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
export type DeleteDeviceInput = z.infer<typeof deleteDeviceSchema>;
