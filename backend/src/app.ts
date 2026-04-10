import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';
import healthRouter from './routes/health.js';
import { authRouter } from './routes/auth.routes.js';
import { passwordResetRouter } from './routes/password-reset.routes.js';
import { userRouter } from './routes/user.routes.js';
import { artistRouter } from './routes/artist.routes.js';
import { webhookRouter } from './routes/webhook.routes.js';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: [env.FRONTEND_URL, env.ADMIN_URL],
    credentials: true,
  }),
);

// Compression
app.use(compression());

// Request logging
app.use(pinoHttp({ logger }));

// Stripe webhooks need raw body
app.use('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Rate limiting
app.use(generalLimiter);

// ── Routes ──────────────────────────────────
app.use(healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/auth', passwordResetRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/artists', artistRouter);
app.use('/api/v1/webhooks', webhookRouter);

// ── 404 handler ─────────────────────────────
app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found'));
});

// ── Global error handler ────────────────────
app.use(errorHandler);

export default app;
