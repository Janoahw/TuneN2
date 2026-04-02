import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { PasswordResetService } from "../services/password-reset.service.js";

const router = Router();

// ── Schemas ─────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number"),
});

// ── Routes ──────────────────────────────────

router.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  async (req: Request, res: Response) => {
    await PasswordResetService.requestReset(req.body.email);

    res.json({
      success: true,
      data: { message: "If an account exists, a reset email has been sent" },
    });
  },
);

router.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  async (req: Request, res: Response) => {
    await PasswordResetService.resetPassword(req.body.token, req.body.password);

    res.json({
      success: true,
      data: { message: "Password has been reset successfully" },
    });
  },
);

export { router as passwordResetRouter };
