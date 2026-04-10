import { Router } from 'express';
import type { Request, Response } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { UserService } from '../services/user.service.js';
import { UploadService } from '../services/upload.service.js';
import { updateProfileSchema, changePasswordSchema, uploadUrlSchema } from '../schemas/user.js';

const router = Router();

// ── Routes ──────────────────────────────────

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await UserService.getProfile(req.user!.id);

  res.json({
    success: true,
    data: { user },
  });
});

router.patch(
  '/me',
  authenticate,
  validate({ body: updateProfileSchema }),
  async (req: Request, res: Response) => {
    const user = await UserService.updateProfile(req.user!.id, req.body);

    res.json({
      success: true,
      data: { user },
    });
  },
);

router.post(
  '/me/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  async (req: Request, res: Response) => {
    await UserService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);

    res.json({
      success: true,
      data: { message: 'Password changed successfully' },
    });
  },
);

router.post(
  '/me/upload-url',
  authenticate,
  validate({ body: uploadUrlSchema }),
  async (req: Request, res: Response) => {
    const result = await UploadService.generateUploadUrl(
      req.user!.id,
      req.body.type,
      req.body.mimeType,
    );

    res.json({
      success: true,
      data: result,
    });
  },
);

export { router as userRouter };
