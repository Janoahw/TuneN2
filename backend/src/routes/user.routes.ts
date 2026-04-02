import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { UserService } from "../services/user.service.js";
import { UploadService } from "../services/upload.service.js";

const router = Router();

// ── Schemas ─────────────────────────────────

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name must be at least 1 character")
    .max(100, "Display name must be 100 characters or less")
    .optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number"),
});

const uploadUrlSchema = z.object({
  type: z.enum(["avatar", "profile-banner"]),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

// ── Routes ──────────────────────────────────

router.get("/me", authenticate, async (req: Request, res: Response) => {
  const user = await UserService.getProfile(req.user!.id);

  res.json({
    success: true,
    data: { user },
  });
});

router.patch(
  "/me",
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
  "/me/change-password",
  authenticate,
  validate({ body: changePasswordSchema }),
  async (req: Request, res: Response) => {
    await UserService.changePassword(
      req.user!.id,
      req.body.currentPassword,
      req.body.newPassword,
    );

    res.json({
      success: true,
      data: { message: "Password changed successfully" },
    });
  },
);

router.post(
  "/me/upload-url",
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
