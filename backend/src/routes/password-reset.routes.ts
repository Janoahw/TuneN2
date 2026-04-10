import { Router } from "express";
import type { Request, Response } from "express";
import { validate } from "../middleware/validate.js";
import { PasswordResetService } from "../services/password-reset.service.js";
import { forgotPasswordSchema, resetPasswordSchema } from "../schemas/password-reset.js";

const router = Router();

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
