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

# Copy built files, public folder, and node_modules
COPY --from=builder /app/dist/apps/tiktok-client/.next ./dist/apps/tiktok-client/.next
COPY --from=builder /app/apps/storefront/public ./apps/storefront/public
COPY --from=builder /app/apps/storefront/package.json ./apps/storefront/package.json
COPY --from=builder /app/apps/storefront/next.config.mjs ./apps/storefront/next.config.mjs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000 || exit 1

# Start Next.js server
WORKDIR /app/apps/storefront
CMD ["node", "../../node_modules/next/dist/bin/next", "start"]
