#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0;5m' # No Color
CLEAR='\033[0;39m'

echo -e "${BLUE}=========================================${CLEAR}"
echo -e "${BLUE}    STARTING MONOREPO PRODUCTION BUILD   ${CLEAR}"
echo -e "${BLUE}=========================================${CLEAR}"

# 1. Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}Error: PM2 is not installed. Please install it using 'npm install -g pm2'${CLEAR}"
    exit 1
fi

# 2. Build Backend
echo -e "\n${YELLOW}[1/4] Building Backend...${CLEAR}"
pnpm --filter @projects/backend build

# 3. Start/Restart Backend in PM2
echo -e "\n${YELLOW}[2/4] Starting/Restarting Backend with PM2...${CLEAR}"
pm2 startOrReload ecosystem.config.js --only ecommerce-backend

# 4. Wait for Backend to be online
echo -e "\n${YELLOW}[3/4] Waiting for Backend to be online on port 3333...${CLEAR}"
max_attempts=30
attempt=1
backend_url="http://localhost:3333"

while [ $attempt -le $max_attempts ]; do
    # Perform a simple HTTP request, ignoring status code but checking connectivity
    if curl -s --connect-timeout 2 "$backend_url" > /dev/null; then
        echo -e "${GREEN}Backend is online and responsive!${CLEAR}"
        break
    fi
    echo -e "Attempt $attempt/$max_attempts: Backend is not ready yet, retrying in 2 seconds..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}Error: Backend failed to start after $((max_attempts * 2)) seconds.${CLEAR}"
    exit 1
fi

# 5. Build Client (requires running backend for static page generation / SSR)
echo -e "\n${YELLOW}[4/5] Building Client (Next.js)...${CLEAR}"
pnpm --filter @projects/client build

# 6. Start/Restart Client in PM2
echo -e "\n${YELLOW}Starting/Restarting Client with PM2...${CLEAR}"
pm2 startOrReload ecosystem.config.js --only ecommerce-client

# 7. Build Admin (Vite SPA)
echo -e "\n${YELLOW}[5/5] Building Admin (Vite SPA)...${CLEAR}"
pnpm --filter @projects/admin build

# 8. Start/Restart Admin in PM2
echo -e "\n${YELLOW}Starting/Restarting Admin with PM2...${CLEAR}"
pm2 startOrReload ecosystem.config.js --only ecommerce-admin

echo -e "\n${GREEN}=========================================${CLEAR}"
echo -e "${GREEN}      DEPLOYMENT COMPLETED SUCCESSFULLY  ${CLEAR}"
echo -e "${GREEN}=========================================${CLEAR}"

# Show PM2 status
pm2 status
