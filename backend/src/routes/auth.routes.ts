import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import jwt, { type SignOptions } from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { AuthService } from "../services/auth.service.js";
import { SocialAuthService } from "../services/social-auth.service.js";
import { sendVerificationEmail } from "../services/email.service.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const router = Router();

// ── Schemas ─────────────────────────────────

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be 100 characters or less"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

const verifyEmailSchema = z.object({
  token: z.string(),
});

const socialAuthSchema = z.object({
  provider: z.enum(["google", "apple"]),
  idToken: z.string().min(1, "ID token is required"),
});

// Rate limiter for resend verification: 1 per minute
const resendVerificationLimiter = rateLimit({
  windowMs: 60_000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Please wait before requesting another verification email",
      details: null,
    },
  },
});

// ── Routes ──────────────────────────────────

router.post(
  "/signup",
  validate({ body: signupSchema }),
  async (req: Request, res: Response) => {
    const { user, tokens } = await AuthService.signup(req.body);

    // Generate email verification token
    const verificationToken = jwt.sign(
      { userId: user.id, purpose: "email-verify" },
      env.JWT_ACCESS_SECRET!,
      { expiresIn: "24h" } as SignOptions,
    );

    // Send verification email (fire-and-forget in signup flow)
    sendVerificationEmail(user.email, verificationToken).catch((err) => {
      logger.error({ err, userId: user.id }, "Failed to send verification email");
    });

    res.status(201).json({
      success: true,
      data: { user, tokens },
    });
  },
);

router.post(
  "/login",
  validate({ body: loginSchema }),
  async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    res.json({
      success: true,
      data: { user: result.user, tokens: result.tokens },
    });
  },
);

router.post(
  "/refresh",
  validate({ body: refreshSchema }),
  async (req: Request, res: Response) => {
    const tokens = await AuthService.refreshToken(req.body.refreshToken);

    res.json({
      success: true,
      data: { tokens },
    });
  },
);

router.post(
  "/logout",
  authenticate,
  validate({ body: refreshSchema }),
  async (req: Request, res: Response) => {
    await AuthService.logout(req.body.refreshToken);

    res.json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  },
);

router.post(
  "/verify-email",
  validate({ body: verifyEmailSchema }),
  async (req: Request, res: Response) => {
    const user = await AuthService.verifyEmail(req.body.token);

    res.json({
      success: true,
      data: { message: "Email verified", user },
    });
  },
);

router.post(
  "/resend-verification",
  authenticate,
  resendVerificationLimiter,
  async (req: Request, res: Response) => {
    await AuthService.resendVerification(req.user!.id);

    res.json({
      success: true,
      data: { message: "Verification email sent" },
    });
  },
);

router.post(
  "/social",
  validate({ body: socialAuthSchema }),
  async (req: Request, res: Response) => {
    const { provider, idToken } = req.body;

    const result =
      provider === "google"
        ? await SocialAuthService.authenticateWithGoogle(idToken)
        : await SocialAuthService.authenticateWithApple(idToken);

    res.json({
      success: true,
      data: { user: result.user, tokens: result.tokens },
    });
  },
);

export { router as authRouter };
