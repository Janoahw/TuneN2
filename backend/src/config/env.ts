import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),

  PORT: z.coerce.number().default(3001),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  REDIS_URL: z.string().default("redis://localhost:6379"),

  // JWT — required in production, optional in dev for convenience
  JWT_ACCESS_SECRET: z.string().optional(), // Required in production
  JWT_REFRESH_SECRET: z.string().optional(), // Required in production
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("30d"),

  // Stripe — required in production
  STRIPE_SECRET_KEY: z.string().optional(), // Required in production
  STRIPE_WEBHOOK_SECRET: z.string().optional(), // Required in production
  STRIPE_PRICE_ID: z.string().optional(), // Artist plan monthly price ID

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),

  // AWS / S3 / CloudFront
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_S3_AUDIO_BUCKET: z.string().optional(), // Required in production
  AWS_S3_IMAGE_BUCKET: z.string().optional(), // Required in production
  AWS_CLOUDFRONT_DOMAIN: z.string().optional(), // Required in production
  AWS_CLOUDFRONT_KEY_PAIR_ID: z.string().optional(), // Required in production

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("TuneN2 <noreply@tunen2.com>"),

  // Frontend URLs (CORS origins)
  FRONTEND_URL: z.string().default("http://localhost:8081"),
  ADMIN_URL: z.string().default("http://localhost:5173"),

  // App URL (for deep links / verification)
  APP_URL: z.string().default("http://localhost:8081"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    const message = Object.entries(formatted)
      .map(([key, errors]) => `  ${key}: ${errors?.join(", ")}`)
      .join("\n");

    throw new Error(`❌ Invalid environment variables:\n${message}`);
  }

  return parsed.data;
}

export const env = validateEnv();
