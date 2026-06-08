# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

# Copy monorepo configurations & dependency lockfiles
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json ./

# Copy packages package.json files
COPY apps/storefront/package.json ./apps/storefront/
COPY libs/shared/package.json ./libs/shared/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# Copy source code for libs & storefront
COPY libs/shared ./libs/shared
COPY apps/storefront ./apps/storefront

# Build the storefront
RUN pnpm nx build @vibe/storefront

# Prune non-production dependencies
RUN pnpm prune --prod

# ================================
# Stage 2: Production image
# ================================
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

# Copy built standalone folder, static assets, and public files
COPY --from=builder /app/dist/apps/tiktok-client/.next/standalone ./
COPY --from=builder /app/dist/apps/tiktok-client/.next/static ./dist/apps/tiktok-client/.next/static
COPY --from=builder /app/apps/storefront/public ./apps/storefront/public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000 || exit 1

# Start Next.js standalone server
CMD ["node", "apps/storefront/server.js"]
