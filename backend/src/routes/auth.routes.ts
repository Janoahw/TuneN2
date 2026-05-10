import { Router } from 'express';
import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { AuthService } from '../services/auth.service.js';
import { SocialAuthService } from '../services/social-auth.service.js';
import { sendOtpEmail } from '../services/email.service.js';
import { generateOtp, calculateOtpExpiry } from '../utils/otp.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../config/database.js';
import {
  signupSchema,
  loginSchema,
  refreshSchema,
  verifyOtpSchema,
  resendOtpSchema,
  socialAuthSchema,
} from '../schemas/auth.js';

const router = Router();

// Rate limiter for resend OTP: 1 per minute
const resendOtpLimiter = rateLimit({
  windowMs: 60_000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Please wait before requesting another OTP',
      details: null,
    },
  },
});

// ── Routes ──────────────────────────────────

router.post('/signup', validate({ body: signupSchema }), async (req: Request, res: Response) => {
  const { user, tokens } = await AuthService.signup(req.body);

  // Generate and send OTP (fire-and-forget in signup flow)
  AuthService.sendOtp(user.id).catch((err) => {
    logger.error({ err, userId: user.id }, 'Failed to send OTP email after signup');
  });

  res.status(201).json({
    success: true,
    data: { user, tokens },
  });
});

router.post('/login', validate({ body: loginSchema }), async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  res.json({
    success: true,
    data: { user: result.user, tokens: result.tokens },
  });
});

router.post('/refresh', validate({ body: refreshSchema }), async (req: Request, res: Response) => {
  const tokens = await AuthService.refreshToken(req.body.refreshToken);

  res.json({
    success: true,
    data: { tokens },
  });
});

router.post(
  '/logout',
  authenticate,
  validate({ body: refreshSchema }),
  async (req: Request, res: Response) => {
    await AuthService.logout(req.body.refreshToken);

    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  },
);

router.post(
  '/verify-otp',
  authenticate,
  validate({ body: verifyOtpSchema }),
  async (req: Request, res: Response) => {
    const user = await AuthService.verifyOtp(req.user!.id, req.body.code);

    res.json({
      success: true,
      data: { message: 'Email verified', user },
    });
  },
);

router.post('/resend-otp', authenticate, resendOtpLimiter, async (req: Request, res: Response) => {
  await AuthService.resendOtp(req.user!.id);

  res.json({
    success: true,
    data: { message: 'Verification OTP sent' },
  });
});

router.post(
  '/social',
  validate({ body: socialAuthSchema }),
  async (req: Request, res: Response) => {
    const { provider, idToken } = req.body;

    const result =
      provider === 'google'
        ? await SocialAuthService.authenticateWithGoogle(idToken)
        : await SocialAuthService.authenticateWithApple(idToken);

    res.json({
      success: true,
      data: { user: result.user, tokens: result.tokens },
    });
  },
);

export { router as authRouter };
