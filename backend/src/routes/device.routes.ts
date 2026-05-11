import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { DeviceService } from '../services/device.service.js';
import { registerDeviceSchema, deleteDeviceSchema } from '../schemas/device.js';

const router = Router();

/**
 * POST /api/v1/devices
 * Register device token for push notifications
 */
router.post(
  '/',
  authenticate,
  validate({ body: registerDeviceSchema }),
  async (req: Request, res: Response) => {
    const { token, platform } = req.body;
    const userId = req.user!.id;

    const device = await DeviceService.registerToken({ userId, token, platform });

    return res.status(201).json({
      success: true,
      data: {
        id: device.id,
        platform: device.platform,
        createdAt: device.createdAt,
      },
      error: null,
    });
  }
);

/**
 * DELETE /api/v1/devices
 * Remove device token (logout from this device)
 */
router.delete(
  '/',
  authenticate,
  validate({ body: deleteDeviceSchema }),
  async (req: Request, res: Response) => {
    const { token } = req.body;
    const userId = req.user!.id;

    await DeviceService.removeToken({ userId, token });

    return res.json({
      success: true,
      data: { message: 'Device token removed successfully' },
      error: null,
    });
  }
);

export const deviceRouter = router;
