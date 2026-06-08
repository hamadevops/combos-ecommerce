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
COPY apps/admin-cms/package.json ./apps/admin-cms/
COPY libs/shared/package.json ./libs/shared/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# Copy source code for libs & admin-cms
COPY libs/shared ./libs/shared
COPY apps/admin-cms ./apps/admin-cms

# Build the admin-cms app
RUN pnpm nx build @vibe/admin-cms

# ================================
# Stage 2: Production image
# ================================
FROM nginx:alpine AS runner

COPY --from=builder /app/dist/apps/admin-cms /usr/share/nginx/html
COPY apps/admin-cms/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
