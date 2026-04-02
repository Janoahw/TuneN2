FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared/ ./packages/shared/
COPY backend/ ./backend/

# Build shared package
RUN pnpm --filter @tunen2/shared build

# Generate Prisma client
RUN pnpm --filter backend db:generate

# Build backend
RUN pnpm --filter backend build

# ─── Production ──────────────────────────────────────────

FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/shared/dist ./packages/shared/dist
COPY --from=base /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=base /app/backend/dist ./backend/dist
COPY --from=base /app/backend/package.json ./backend/package.json
COPY --from=base /app/backend/node_modules ./backend/node_modules
COPY --from=base /app/backend/prisma ./backend/prisma

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "backend/dist/index.js"]
