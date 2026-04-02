# TuneN2 Monorepo

TuneN2 is a TypeScript-first monorepo for a music marketplace platform where artists publish music and fans discover, buy, and stream tracks.

The repository currently contains:

- A backend API (`Express + Prisma + PostgreSQL + Redis`)
- A web admin client (`React + Vite`)
- A mobile app (`Expo + React Native + Expo Router`)
- Shared package(s) for cross-app contracts and types
- Product and system documentation for planning and roadmap execution

## Table of Contents

1. [Monorepo Overview](#monorepo-overview)
2. [Architecture](#architecture)
3. [Repository Structure](#repository-structure)
4. [Prerequisites](#prerequisites)
5. [Quick Start (Local Development)](#quick-start-local-development)
6. [Environment Variables](#environment-variables)
7. [Running Apps](#running-apps)
8. [Database and Prisma](#database-and-prisma)
9. [Background Jobs and Queues](#background-jobs-and-queues)
10. [API Surface (Current)](#api-surface-current)
11. [Scripts Reference](#scripts-reference)
12. [Quality, Testing, and Validation](#quality-testing-and-validation)
13. [Troubleshooting](#troubleshooting)
14. [Project Documentation](#project-documentation)
15. [Roadmap Notes](#roadmap-notes)

## Monorepo Overview

This repo is managed with `pnpm` workspaces and `turbo`.

- Root package manager: `pnpm@10.33.0`
- Node engine: `>=22.0.0`
- Workspace packages:
  - `backend`
  - `admin`
  - `mobile`
  - `packages/*`

High-level goal of the product: complete the loop of:

1. Artist signs up and uploads music.
2. Fan discovers and purchases tracks.
3. Fan streams tracks.
4. Artist receives earnings and can withdraw.

## Architecture

At a high level:

- `mobile`: consumer-facing app (fan + artist flows)
- `admin`: internal dashboard and moderation/operations UI
- `backend`: API, auth, business logic, persistence, and job orchestration
- `postgres`: primary relational datastore
- `redis`: cache + queue broker for asynchronous jobs

Technology choices in active code:

- Backend: Node.js, Express 5, TypeScript, Prisma, Zod, JWT, BullMQ
- Data: PostgreSQL 16, Redis 7
- Admin: React 19, Vite 6, Tailwind 4, React Query
- Mobile: Expo SDK 52, React Native 0.76, Expo Router, Zustand, React Query

## Repository Structure

```text
.
├── admin/                  # Web admin (React + Vite)
├── backend/                # API server + Prisma + jobs
├── mobile/                 # Expo React Native app
├── packages/
│   └── shared/             # Shared types/schemas/constants
├── docs/                   # Product/system documentation
├── scripts/                # Helper SQL/scripts for local infra
├── docker-compose.yml      # Local Postgres + Redis
├── turbo.json              # Turbo pipeline config
└── pnpm-workspace.yaml     # Workspace package mapping
```

## Prerequisites

Install the following before running locally:

1. Node.js `>=22`
2. `pnpm >=9` (repo uses pnpm 10)
3. Docker Desktop (for local Postgres + Redis)
4. Git

Optional but recommended:

- PostgreSQL client tools (`psql`) for local inspection
- Prisma VS Code extension
- Expo Go app on device or iOS/Android emulator

## Quick Start (Local Development)

### 1) Install dependencies

```bash
pnpm install
```

### 2) Start infrastructure services

```bash
docker compose up -d
```

This starts:

- Postgres on `localhost:5432`
- Redis on `localhost:6379`

### 3) Configure environment files

Create env files from examples:

```bash
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env
```

Then update secrets in `backend/.env` (at minimum JWT and database values).

### 4) Run Prisma generate/migrations

From repo root:

```bash
pnpm db:generate
pnpm db:migrate
```

### 5) Start apps (recommended in separate terminals)

```bash
pnpm dev:api
pnpm dev:admin
pnpm dev:mobile
```

### 6) Access local apps

- Backend health: `http://localhost:3001/health`
- Admin app: `http://localhost:5173`
- Mobile app: Expo dev server output in terminal (QR + simulator links)

## Environment Variables

### Backend (`backend/.env`)

Important variables currently validated by backend runtime:

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development`, `staging`, or `production` |
| `PORT` | No | `3001` | API port |
| `DATABASE_URL` | Yes | - | Postgres connection string |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection |
| `JWT_ACCESS_SECRET` | Required in prod | - | Access token signing secret |
| `JWT_REFRESH_SECRET` | Required in prod | - | Refresh token signing secret |
| `JWT_ACCESS_EXPIRY` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRY` | No | `30d` | Refresh token TTL |
| `STRIPE_SECRET_KEY` | Required in prod | - | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Required in prod | - | Stripe webhook signature key |
| `GOOGLE_CLIENT_ID` | Optional | - | For Google social auth |
| `AWS_ACCESS_KEY_ID` | Optional | - | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | Optional | - | AWS credentials |
| `AWS_REGION` | No | `us-east-1` | AWS region |
| `AWS_S3_AUDIO_BUCKET` | Required in prod | - | Audio uploads bucket |
| `AWS_S3_IMAGE_BUCKET` | Required in prod | - | Image uploads bucket |
| `AWS_CLOUDFRONT_DOMAIN` | Required in prod | - | Streaming/image CDN domain |
| `AWS_CLOUDFRONT_KEY_PAIR_ID` | Required in prod | - | Signed URL key pair id |
| `RESEND_API_KEY` | Optional in dev | - | Email provider API key |
| `EMAIL_FROM` | No | `TuneN2 <noreply@tunen2.com>` | Outbound sender |
| `FRONTEND_URL` | No | `http://localhost:8081` | CORS allowed origin |
| `ADMIN_URL` | No | `http://localhost:5173` | CORS allowed origin |
| `APP_URL` | No | `http://localhost:8081` | Deep links and email links |

### Mobile (`mobile/.env`)

| Variable | Required | Default | Notes |
|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | Recommended | `http://localhost:3001/api/v1` | Public API base URL used by axios client |

## Running Apps

### Backend (`backend`)

- Dev: `pnpm --filter backend dev`
- Build: `pnpm --filter backend build`
- Start built app: `pnpm --filter backend start`

Defaults:

- API base prefix: `/api/v1`
- Health endpoint: `/health`

### Admin (`admin`)

- Dev: `pnpm --filter admin dev`
- Build: `pnpm --filter admin build`
- Preview build: `pnpm --filter admin preview`

Dev proxy:

- Requests to `/api` are proxied to `http://localhost:3001`

### Mobile (`mobile`)

- Start: `pnpm --filter mobile start`
- iOS simulator: `pnpm --filter mobile ios`
- Android emulator: `pnpm --filter mobile android`

The mobile app reads API URL from `EXPO_PUBLIC_API_URL`.

## Database and Prisma

Backend uses Prisma with PostgreSQL.

Common commands:

```bash
# Generate Prisma client
pnpm db:generate

# Run/create local migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio
```

Genre seeding exists in `backend/prisma/seed.ts`.

Manual seed run (if needed):

```bash
pnpm --filter backend exec tsx prisma/seed.ts
```

## Background Jobs and Queues

BullMQ queue names currently initialized in backend:

- `transcode`
- `notification`
- `payout`
- `aggregation`
- `subscription`
- `cleanup`

Workers are defined under `backend/src/jobs/` and include active workers for:

- Audio transcode processing
- Notification dispatch

Redis is required for queue health and worker execution.

## API Surface (Current)

Current registered routes in backend:

### Health

- `GET /health`

### Auth

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/resend-verification`
- `POST /api/v1/auth/social`

### Password Reset

- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

### Users

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `POST /api/v1/users/me/change-password`
- `POST /api/v1/users/me/upload-url`

Response format pattern (current convention):

```json
{
  "success": true,
  "data": {}
}
```

Errors are handled by global middleware and return structured payloads.

## Scripts Reference

### Root scripts

| Script | Command | Purpose |
|---|---|---|
| `dev:api` | `pnpm --filter backend dev` | Run backend in watch mode |
| `dev:admin` | `pnpm --filter admin dev` | Run admin Vite dev server |
| `dev:mobile` | `pnpm --filter mobile start` | Start Expo dev server |
| `build` | `turbo run build` | Build all packages |
| `lint` | `turbo run lint` | Lint all packages |
| `typecheck` | `turbo run typecheck` | Typecheck all packages |
| `test` | `turbo run test` | Run tests across packages |
| `db:generate` | `pnpm --filter backend db:generate` | Prisma client generation |
| `db:migrate` | `pnpm --filter backend db:migrate` | Prisma migrations |
| `db:studio` | `pnpm --filter backend db:studio` | Prisma Studio |
| `clean` | `turbo run clean && rm -rf node_modules` | Clean outputs and node_modules |

### Package-level scripts

Each package has its own `dev`, `build` (where applicable), `lint`, `typecheck`, and `clean` scripts.

## Quality, Testing, and Validation

### Current state

- Test script scaffolding exists (`vitest` in backend, `jest` in mobile).
- Test directories exist in backend (`tests/integration`, `tests/unit`, `tests/fixtures`).
- At the time of writing, there are no committed test files in those directories.

### Recommended pre-commit checks

From repo root:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

If you are only changing one package, you can run filtered checks, for example:

```bash
pnpm --filter backend lint
pnpm --filter backend typecheck
pnpm --filter backend test
```

## Troubleshooting

### Port conflicts

- Backend default: `3001`
- Admin default: `5173`
- Postgres: `5432`
- Redis: `6379`

Change `.env` values or stop local services using those ports.

### Prisma migration errors

1. Ensure Docker services are running.
2. Verify `DATABASE_URL` points to the expected DB.
3. Re-run:

```bash
pnpm db:generate
pnpm db:migrate
```

### CORS issues in local development

Ensure backend `FRONTEND_URL` and `ADMIN_URL` match your running clients.

### Mobile app cannot reach backend

- Confirm `EXPO_PUBLIC_API_URL` in `mobile/.env`.
- For physical devices, `localhost` may not resolve to your laptop. Use your machine LAN IP.

## Project Documentation

Deep planning and architecture docs are under `docs/`:

- `plan.md`
- `system_design.md`
- `mvp_scope.md`
- `feature_breakdown.md`
- `monetization.md`
- `tech_stack.md`
- `build_plan.md`
- `risks.md`
- `design_system.md`
- `screens.md`
- `sprint_progress.md`

Use these docs for product context, implementation phases, and feature prioritization.

## Roadmap Notes

The docs define a broad target surface (discovery, commerce, streaming, moderation, payouts, etc.). The current implementation includes foundational auth, profile, upload URL generation, queue infrastructure, and app shells.

Suggested next repository milestones:

1. Expand API domains (songs, purchases, discovery, wallets, admin operations).
2. Add seed + migration automation for local onboarding.
3. Add integration tests for current auth/user endpoints.
4. Add CI gates for lint/typecheck/test with required status checks.
5. Add deployment runbooks for staging and production environments.

---

If you are committing this README as part of initial documentation hardening, a good commit message is:

`docs(readme): add comprehensive monorepo setup and architecture guide`