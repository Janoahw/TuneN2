# TuneN2 — Preview Build Setup Guide

> **Goal:** Get the full TuneN2 stack (backend API, database, queues, admin panel, and mobile app) deployed to a publicly accessible environment so your client can test from anywhere — today.

---

## System Architecture

| Layer | Technology | Where it runs |
|---|---|---|
| Mobile App | React Native (Expo) | Client device (via EAS build link) |
| Admin Panel | React + Vite | Vercel (static deploy) |
| Backend API | Node.js + Express | Railway |
| Database | PostgreSQL 16 | Neon (managed) |
| Job Queue | BullMQ + Redis 7 | Upstash |
| File Storage | AWS S3 | AWS |
| CDN (Audio/Images) | AWS CloudFront | AWS |
| Email | Resend | Resend |
| Payments | Stripe Connect | Stripe |
| Mobile Builds | EAS (Expo Application Services) | Expo |

---

## Accounts You Need to Create

Before starting, have these tabs open and create accounts on each:

| Service | URL | Free Tier? |
|---|---|---|
| Railway | https://railway.app | Yes ($5 credit) |
| Neon (PostgreSQL) | https://neon.tech | Yes |
| Upstash (Redis) | https://upstash.com | Yes |
| Resend (Email) | https://resend.com | Yes |
| Stripe | https://stripe.com | Yes (test mode) |
| AWS | https://aws.amazon.com | Yes (12-month free tier) |
| Expo / EAS | https://expo.dev | Yes |
| Vercel (Admin) | https://vercel.com | Yes |
| GitHub | https://github.com | Yes (if not already) |
| Apple Developer (iOS only) | https://developer.apple.com | $99/year |

---

## Step 1 — Push Code to GitHub

Railway, Vercel, and Expo all connect to GitHub for deployments.

1. Go to https://github.com/new and create a new **private** repository named `tunen2`.
2. In your terminal at the project root:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tunen2.git
git push -u origin main
```

> **Time:** ~5 minutes

---

## Step 2 — PostgreSQL: Neon

Neon provides a serverless PostgreSQL database with a generous free tier.

1. Go to https://neon.tech and sign up.
2. Click **New Project** → Name it `tunen2-preview`.
3. Select region closest to your Railway deployment (recommend **US East**).
4. Once created, go to **Dashboard → Connection Details**.
5. Select **Connection string** and copy the `DATABASE_URL`. It looks like:
   ```
   postgresql://username:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. **Save this value** — you will need it in Step 8.

> **Time:** ~5 minutes

---

## Step 3 — Redis: Upstash

Upstash provides serverless Redis, used for BullMQ job queues and caching.

1. Go to https://upstash.com and sign up.
2. Click **Create Database** → Select **Redis**.
3. Name it `tunen2-preview`, select **Regional**, choose **US East 1**.
4. Once created, click on the database → **Details** tab.
5. Copy the **Redis URL** (starts with `rediss://`). It looks like:
   ```
   rediss://default:PASSWORD@relevant-endpoint.upstash.io:6379
   ```
6. **Save this value** — you will need it in Step 8.

> **Time:** ~5 minutes

---

## Step 4 — Email: Resend

Resend handles transactional emails (email verification, password reset, etc.). If Resend is not configured, emails are logged to the console — email verification will still work in preview since you can read them from Railway logs. However, for a proper client demo, set this up.

1. Go to https://resend.com and sign up.
2. Go to **API Keys** → **Create API Key** → Name it `tunen2-preview` → Copy the key (`re_...`).
3. **Domain setup (optional for preview):** Resend lets you send from `onboarding@resend.dev` on the free tier without domain verification. For branded emails, go to **Domains → Add Domain** and follow the DNS steps for your domain.
4. **Save the API key** — you will need it in Step 8.

> **Time:** ~5 minutes (10 more if doing domain verification)

---

## Step 5 — Stripe: Test Mode

Stripe handles song purchases, artist subscriptions, and payouts. You need a Stripe account and **three specific values** from the dashboard.

### 5a. Create Your Stripe Account

1. Go to https://stripe.com and sign up.
2. Make sure you are in **Test Mode** (toggle in the top-right of the dashboard).

### 5b. Get the Secret Key

1. Go to **Developers → API Keys**.
2. Copy **Secret key** — it starts with `sk_test_...`
3. **Save this value**.

### 5c. Create the Artist Subscription Product

The app has an artist plan (monthly subscription). You need to create a product and price in Stripe.

1. Go to **Product Catalog → Add Product**.
2. Name it `TuneN2 Artist Plan`.
3. Set **Pricing model** → **Recurring**.
4. Set **Price** → (e.g. `$9.99/month`) — choose what makes sense for the preview.
5. Click **Save product**.
6. On the product page, click on the price → copy the **Price ID** (`price_...`).
7. **Save this value**.

### 5d. Set Up the Webhook

The backend needs a Stripe webhook to confirm payments. You need the backend URL first (Step 6), so **come back to this sub-step after Step 6**.

1. Go to **Developers → Webhooks → Add endpoint**.
2. Set **Endpoint URL** to: `https://YOUR_RAILWAY_URL/api/v1/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `customer.subscription.created`, `customer.subscription.deleted`, `account.updated`, `transfer.created`.
4. Click **Add endpoint**.
5. On the webhook details page, click **Reveal** next to **Signing secret** → copy the value (`whsec_...`).
6. **Save this value**.

> **Time:** ~15 minutes

---

## Step 6 — AWS S3 + CloudFront (Audio & Image Storage)

This is required for song uploads, audio playback, and cover art/avatar images to work. Without it, uploads return mock URLs and audio playback will not work.

### 6a. Create an AWS Account

1. Go to https://aws.amazon.com and create an account. A credit card is required but charges are minimal for a preview (< $2/month).

### 6b. Create Two S3 Buckets

1. Go to **S3 → Create bucket**.
2. **Audio bucket:**
   - Name: `tunen2-audio-preview`
   - Region: `us-east-1`
   - **Block all public access: ON** (we use signed CloudFront URLs)
   - Click **Create bucket**
3. **Images bucket:**
   - Name: `tunen2-images-preview`
   - Region: `us-east-1`
   - **Block all public access: ON**
   - Click **Create bucket**
4. **Save both bucket names**.

### 6c. Create a CloudFront Distribution

CloudFront serves your audio files with signed URLs (DRM protection).

1. Go to **CloudFront → Create distribution**.
2. **Origin domain:** Select `tunen2-audio-preview.s3.us-east-1.amazonaws.com`.
3. **Origin access:** Select **Origin access control settings** → Create new OAC → name it `tunen2-audio-oac`.
4. **Viewer protocol policy:** Redirect HTTP to HTTPS.
5. **Cache policy:** CachingOptimized.
6. Click **Create distribution**.
7. AWS will prompt you to update the S3 bucket policy — copy the policy and apply it in the S3 bucket **Permissions → Bucket Policy**.
8. Once deployed (5-10 mins), copy the **Distribution domain name** (e.g. `d1abc.cloudfront.net`).
9. **Save this value**.

### 6d. Create CloudFront Key Pair (for Signed URLs)

1. Go to **AWS Account → Security credentials** (top-right menu, click your account name).
2. Scroll to **CloudFront key pairs** → **Create new key pair**.
3. Download the **private key** (`.pem` file) and note the **Key Pair ID**.
4. Open the `.pem` file in a text editor — you will paste the entire contents (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) as the `AWS_CLOUDFRONT_PRIVATE_KEY` environment variable.
5. **Save the Key Pair ID and private key contents**.

### 6e. Create an IAM User

1. Go to **IAM → Users → Create user**.
2. Name: `tunen2-backend`
3. **Attach policies directly:** `AmazonS3FullAccess`, `CloudFrontFullAccess`
4. Click **Create user** → open the user → **Security credentials** → **Create access key**.
5. Select **Application running outside AWS**.
6. Copy **Access Key ID** and **Secret Access Key**.
7. **Save both values**.

> **Time:** ~30 minutes

---

## Step 7 — Google OAuth (Optional)

Skip this if email/password login is sufficient for the preview demo.

1. Go to https://console.cloud.google.com and create a new project named `tunen2`.
2. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
3. Application type: **Web application**.
4. Add **Authorized redirect URI:** `https://auth.expo.io/@tunen2/tunen2` (for Expo Go / preview).
5. Copy the **Client ID** (`xxxxxxxx.apps.googleusercontent.com`).
6. **Save this value**.

> **Time:** ~15 minutes

---

## Step 8 — Deploy the Backend: Railway

Railway will pull your code from GitHub, build the Docker image, and host the backend.

### 8a. Create Railway Project

1. Go to https://railway.app and sign up with GitHub.
2. Click **New Project → Deploy from GitHub repo**.
3. Select your `tunen2` repository.
4. Railway will detect the Dockerfile in `backend/`. If it doesn't auto-configure, click **Settings → Build** and set:
   - **Root Directory:** `/`
   - **Dockerfile Path:** `backend/Dockerfile`
5. Go to **Settings → Networking → Generate Domain** — this gives you a public URL like `tunen2-backend.railway.app`.
6. **Copy this URL** — you need it for the Stripe webhook (Step 5d) and mobile app config.

### 8b. Add Environment Variables

In Railway → your service → **Variables**, add all of the following:

```
NODE_ENV=staging
PORT=3001

# Database (from Step 2)
DATABASE_URL=postgresql://...

# Redis (from Step 3)
REDIS_URL=rediss://...

# JWT (generate two random 64-char strings)
JWT_ACCESS_SECRET=<run: openssl rand -hex 32>
JWT_REFRESH_SECRET=<run: openssl rand -hex 32>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Stripe (from Step 5)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# AWS (from Step 6)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_AUDIO_BUCKET=tunen2-audio-preview
AWS_S3_IMAGE_BUCKET=tunen2-images-preview
AWS_CLOUDFRONT_DOMAIN=dxxxxxxx.cloudfront.net
AWS_CLOUDFRONT_KEY_PAIR_ID=...
AWS_CLOUDFRONT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----

# Email (from Step 4)
RESEND_API_KEY=re_...
EMAIL_FROM=TuneN2 <noreply@yourdomain.com>

# CORS (your Railway URL)
FRONTEND_URL=https://tunen2-backend.railway.app
ADMIN_URL=https://tunen2-admin.vercel.app
APP_URL=https://tunen2-backend.railway.app

# Google OAuth (from Step 7 - optional)
GOOGLE_CLIENT_ID=...
```

> **Generate JWT secrets in your terminal:**
> ```bash
> openssl rand -hex 32
> ```
> Run twice — once for `JWT_ACCESS_SECRET`, once for `JWT_REFRESH_SECRET`.

### 8c. Run Database Migrations

Once the backend is deployed and running, open **Railway → your service → Shell** (or use the Railway CLI):

```bash
# In the Railway shell or via Railway CLI:
cd backend
npx prisma migrate deploy
npx prisma db seed
```

Or using Railway CLI locally:
```bash
npm install -g @railway/cli
railway login
railway link   # select your project
railway run -- pnpm --filter backend exec prisma migrate deploy
railway run -- pnpm --filter backend exec prisma db seed
```

> **Now go back and complete Step 5d** (Stripe Webhook URL) using your Railway public URL.

> **Time:** ~20 minutes

---

## Step 9 — Deploy the Admin Panel: Vercel

The admin panel is a React/Vite app that needs to point to the live backend.

### 9a. Update the Admin API URL

The admin currently proxies to localhost. For a production deploy you need to update it:

In `admin/src/services/api.ts`, check if there's a hardcoded `localhost` URL. If so, update it to use an environment variable:

```ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
```

### 9b. Deploy to Vercel

1. Go to https://vercel.com and sign up with GitHub.
2. Click **New Project → Import** your `tunen2` repo.
3. **Configure project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `admin`
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
4. **Add Environment Variable:**
   - `VITE_API_BASE_URL` = `https://tunen2-backend.railway.app/api/v1`
5. Click **Deploy**.
6. Vercel will give you a URL like `tunen2-admin.vercel.app`.
7. Go back to Railway and update `ADMIN_URL` to this Vercel URL.

> **Time:** ~10 minutes

---

## Step 10 — Mobile Preview Build: EAS

EAS (Expo Application Services) builds the native app and distributes it internally via a link — no App Store submission needed for iOS preview (uses TestFlight / ad-hoc distribution).

### 10a. Install EAS CLI and Log In

```bash
npm install -g eas-cli
eas login
# Enter your Expo account credentials
```

### 10b. Set the Backend URL

In `mobile/`, create a `.env` file (or set via EAS secrets):

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=https://tunen2-backend.railway.app/api/v1
```

Or, set it as an EAS secret (recommended — keeps credentials out of git):

```bash
cd mobile
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://tunen2-backend.railway.app/api/v1"
```

### 10c. Configure app.json

Make sure `mobile/app.json` has your EAS project ID and correct bundle identifiers. It should already contain:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "483c0d36-76de-4db0-92c8-510cf7fa324d"
      }
    }
  }
}
```

### 10d. Apple Developer Setup (iOS Only)

1. Enroll in Apple Developer Program: https://developer.apple.com/programs/enroll/
2. Cost: **$99/year**
3. Wait for approval (usually same day but can take 24–48 hours).
4. Once approved, EAS handles provisioning profiles and certificates automatically.

### 10e. Trigger the Preview Build

```bash
cd mobile

# Build both iOS and Android at once:
eas build --profile preview --platform all

# Or build just Android first (no Apple account needed):
eas build --profile preview --platform android
```

EAS will:
- Build the iOS `.ipa` (ad-hoc / TestFlight) and Android `.apk` in the cloud.
- Email you when done.
- Provide a shareable link from https://expo.dev/accounts/tunen2/projects/tunen2/builds

### 10f. Distribute to Client

**Android:**
- From the EAS build page, share the direct APK download link.
- Client taps the link, downloads, installs (needs to allow "Install from unknown sources" on Android).

**iOS:**
- Add client's device UDID to your Apple Developer account (client sends UDID from Settings → General → About → scroll to bottom, or via https://udid.io).
- Rebuild with their UDID registered, or use TestFlight:
  - Upload `.ipa` to App Store Connect (Xcode or `eas submit`).
  - Invite client's Apple ID as an External Tester in TestFlight.
  - Client installs TestFlight app and accepts your invite.

> **Time:** ~20 minutes setup + 15–30 minutes build time

---

## Step 11 — Verify Everything Is Working

Run through this checklist after all steps are done:

### Backend Health Check
```bash
curl https://tunen2-backend.railway.app/health
# Should return: {"status":"ok"}
```

### End-to-End Checklist
- [ ] Register a new user account in the mobile app
- [ ] Verify email (check Railway logs if Resend not configured)
- [ ] Browse songs (if seed data loaded)
- [ ] Upload a test song (requires AWS S3)
- [ ] Purchase a song using Stripe test card: `4242 4242 4242 4242` (any future date, any CVV)
- [ ] Log in to admin panel and verify user appears
- [ ] Check artist dashboard

---

## Full Environment Variable Reference

For quick reference, here are all backend environment variables in one place:

```env
# App
NODE_ENV=staging
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Redis
REDIS_URL=rediss://default:pass@host:6379

# JWT
JWT_ACCESS_SECRET=<64 char hex string>
JWT_REFRESH_SECRET=<64 char hex string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# AWS
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_AUDIO_BUCKET=tunen2-audio-preview
AWS_S3_IMAGE_BUCKET=tunen2-images-preview
AWS_CLOUDFRONT_DOMAIN=dxxxxxxxx.cloudfront.net
AWS_CLOUDFRONT_KEY_PAIR_ID=APKAXXXXXXXXXX
AWS_CLOUDFRONT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=TuneN2 <noreply@yourdomain.com>

# CORS
FRONTEND_URL=https://tunen2-backend.railway.app
ADMIN_URL=https://tunen2-admin.vercel.app
APP_URL=https://tunen2-backend.railway.app

# Google OAuth (optional)
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
```

---

## Total Cost Summary

### Monthly Recurring Costs

| Service | Plan | Monthly Cost | Notes |
|---|---|---|---|
| **Railway** (Backend hosting) | Hobby | **$5.00/mo** | Includes $5 credit on signup |
| **Neon** (PostgreSQL) | Free | **$0.00/mo** | 0.5 GB storage, 1 compute — enough for preview |
| **Upstash** (Redis) | Free | **$0.00/mo** | 10,000 commands/day — enough for preview |
| **Resend** (Email) | Free | **$0.00/mo** | 3,000 emails/month |
| **AWS S3** (Storage) | Pay-as-you-go | **~$1.00/mo** | Minimal uploads during preview |
| **AWS CloudFront** (CDN) | Pay-as-you-go | **~$0.50/mo** | First 1 TB/month free |
| **Vercel** (Admin panel) | Hobby | **$0.00/mo** | Free for hobby projects |
| **EAS Build** (Mobile builds) | Free | **$0.00/mo** | 30 builds/month included |
| **Stripe** | Pay-as-you-go | **$0.00/mo** | Test mode is free; 2.9% + 30¢ per live transaction |
| | | | |
| **Monthly Total** | | **~$6.50/mo** | |

### One-Time Costs

| Item | Cost | Notes |
|---|---|---|
| **Apple Developer Program** | **$99/year** | Required for iOS TestFlight / ad-hoc distribution |
| | | |
| **One-Time Total** | **$99/year** | Only needed if distributing to iOS |

### Grand Total

| | Cost |
|---|---|
| **Monthly (ongoing)** | ~$6.50/month |
| **Year 1 (incl. Apple Developer)** | ~$177/year |
| **Year 1 without iOS** | ~$78/year |

> **Note:** All costs above are for a preview/staging environment. Production pricing will differ based on user volume, storage, and bandwidth. Stripe charges are pass-through transaction fees (not included above) that apply only to real purchases.

---

## Quick Reference: Time Estimates

| Step | Estimated Time |
|---|---|
| Step 1 – Push to GitHub | 5 min |
| Step 2 – Neon PostgreSQL | 5 min |
| Step 3 – Upstash Redis | 5 min |
| Step 4 – Resend Email | 5 min |
| Step 5 – Stripe Setup | 15 min |
| Step 6 – AWS S3 + CloudFront | 30 min |
| Step 7 – Google OAuth | 15 min (optional) |
| Step 8 – Railway Backend | 20 min |
| Step 9 – Vercel Admin | 10 min |
| Step 10 – EAS Mobile Build | 20 min + 30 min build |
| Step 11 – Verification | 10 min |
| **Total** | **~2.5 – 3 hours** |
