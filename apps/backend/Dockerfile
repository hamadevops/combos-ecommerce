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
COPY apps/backend/package.json ./apps/backend/
COPY libs/shared/package.json ./libs/shared/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# Copy source code for libs & backend
COPY libs/shared ./libs/shared
COPY apps/backend ./apps/backend

# Build NestJS in production mode (compiles, bundles, and obfuscates)
RUN pnpm --filter=@projects/backend build:prod

# ================================
# Stage 2: Production dependencies installer
# ================================
FROM node:${NODE_VERSION}-alpine AS installer

WORKDIR /app

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

# Copy package.json and remove workspace reference, touch pnpm-workspace.yaml to isolate
COPY apps/backend/package.json ./package.json
RUN sed -i '/"@projects\/shared"/d' ./package.json && touch pnpm-workspace.yaml

# Install only production dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --no-frozen-lockfile

# ================================
# Stage 3: Production image
# ================================
FROM node:${NODE_VERSION}-alpine AS prod

WORKDIR /app

# Create appgroup and appuser first
RUN addgroup -S appgroup && adduser -S -D -G appgroup appuser \
    && mkdir -p /app/logs && chown -R appuser:appgroup /app/logs

# Copy built files + package.json + node_modules with chown
COPY --from=builder --chown=appuser:appgroup /app/dist/apps/backend ./dist
COPY --from=installer --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=installer --chown=appuser:appgroup /app/package.json ./package.json

# Chuyển sang non-root user
USER appuser

# Runtime env
ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3333/api/v1 || exit 1

# Start NestJS
CMD ["node", "dist/main.js"]

