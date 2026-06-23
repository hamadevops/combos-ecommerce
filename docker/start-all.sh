#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Curated colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}          Combos E-Commerce - Start Services Orchestrator          ${NC}"
echo -e "${BLUE}===================================================================${NC}"

# Get directory path of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Helper function to check if sudo is needed and run commands with sudo if required
run_with_sudo() {
    if [ "$EUID" -ne 0 ]; then
        sudo "$@"
    else
        "$@"
    fi
}

# 1. Start Database Stack
echo -e "\n${YELLOW}[1/5] Starting Database Stack (MariaDB, Redis)...${NC}"
cd database
docker compose up -d
cd ..

# 2. Start Storage Stack
echo -e "\n${YELLOW}[2/5] Starting Storage Stack (MinIO)...${NC}"
cd storage
docker compose up -d
cd ..

# 3. Start ClickHouse Stack
echo -e "\n${YELLOW}[3/5] Starting ClickHouse Stack (ClickHouse Server)...${NC}"
cd clickhouse
docker compose up -d
cd ..

# 4. Start DB Manager Stack
echo -e "\n${YELLOW}[4/5] Starting DB Manager Stack (CloudBeaver)...${NC}"
cd db-manager
docker compose up -d
cd ..

# 5. Start Harbor Stack
echo -e "\n${YELLOW}[5/5] Starting Harbor Registry Stack (Log-driver safe sequence)...${NC}"
cd harbor

# Clean up old configuration to prevent stale permission locks
if [ -d "common/config" ]; then
    echo -e "${YELLOW}Cleaning old Harbor configurations...${NC}"
    run_with_sudo rm -rf common/config
fi

# Run Harbor prepare config
echo -e "${YELLOW}Running Harbor prepare script...${NC}"
./prepare

# Fix permissions on generated config files so container non-root users can read them
echo -e "${YELLOW}Fixing file permissions for Harbor configurations...${NC}"
CURRENT_USER=$(logname 2>/dev/null || echo $USER)
run_with_sudo chown -R "$CURRENT_USER":"$CURRENT_USER" common
run_with_sudo chmod -R 777 common

# Start Harbor Log service first to bind syslog port (avoids docker-compose log driver collision)
echo -e "${YELLOW}Starting Harbor syslog service...${NC}"
docker compose up -d log

echo -e "${YELLOW}Waiting for log service to be ready...${NC}"
sleep 3

# Start the rest of Harbor services
echo -e "${YELLOW}Starting all other Harbor services...${NC}"
docker compose up -d

cd ..

echo -e "\n${GREEN}===================================================================${NC}"
echo -e "${GREEN}        All Services Started successfully! Current status:         ${NC}"
echo -e "${GREEN}===================================================================${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
