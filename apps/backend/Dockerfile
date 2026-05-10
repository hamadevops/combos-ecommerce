# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

# Copy deps & install
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# Copy source
COPY tsconfig*.json nest-cli.json webpack.config.js ./
COPY src ./src

# Build NestJS
RUN pnpm build
RUN pnpm prune --prod

# ================================
# Stage 2: Production image
# ================================
FROM node:${NODE_VERSION}-alpine AS prod

WORKDIR /app

# Copy built files + package.json + node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Tạo logs folder trước khi chuyển user
RUN mkdir -p /app/logs && addgroup appgroup && adduser -D -G appgroup appuser \
    && chown -R appuser:appgroup /app/logs /app

# Chuyển sang non-root user
USER appuser

# Runtime env
ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3333/api/v1 || exit 1

# Start NestJS
CMD ["node", "dist/main.js"]
