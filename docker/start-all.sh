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

# Helper function to generate a random alphanumeric password of length 16
generate_random_password() {
    openssl rand -base64 16 | tr -dc 'A-Za-z0-9' | head -c 16
}

# Helper function to auto-create .env from .env.example if missing and generate secure credentials
init_env_file() {
    local file=$1
    if [ ! -f "$file" ]; then
        if [ -f "${file}.example" ]; then
            echo -e "${GREEN}Creating $file from template and generating secure credentials...${NC}"
            cp "${file}.example" "$file"
            
            # Generate random passwords
            local rand_pass1=$(generate_random_password)
            local rand_pass2=$(generate_random_password)
            local rand_pass3=$(generate_random_password)
            local rand_pass4=$(generate_random_password)
            
            # Replace placeholder passwords in the generated .env file
            sed -i "s/change_this_to_a_very_strong_root_password_123456/$rand_pass1/g" "$file"
            sed -i "s/change_this_to_a_very_strong_user_password_123456/$rand_pass2/g" "$file"
            sed -i "s/change_this_to_a_very_strong_redis_password_123456/$rand_pass3/g" "$file"
            sed -i "s/change_this_to_admin_user/minioadmin/g" "$file"
            sed -i "s/change_this_to_a_very_strong_password_123456/$rand_pass4/g" "$file"
        fi
    fi
}

# Helper function to extract config values for printing
get_env_val() {
    local file=$1
    local var=$2
    if [ -f "$file" ]; then
        grep "^${var}=" "$file" | cut -d'=' -f2-
    else
        echo "N/A"
    fi
}

# 0. Pre-create directories and fix permissions to prevent container permission-denied errors
echo -e "\n${YELLOW}[0/5] Pre-creating volume directories, environment files, and fixing permissions...${NC}"
init_env_file "database/.env"
init_env_file "storage/.env"
init_env_file "clickhouse/.env"
init_env_file "db-manager/.env"

mkdir -p \
  database/mariadb/data \
  database/mariadb/logs \
  database/redis/data \
  database/redis/logs \
  storage/data \
  clickhouse/data \
  clickhouse/logs \
  db-manager/data \
  harbor/data

run_with_sudo chmod -R 777 \
  database/mariadb/data \
  database/mariadb/logs \
  database/redis/data \
  database/redis/logs \
  storage/data \
  clickhouse/data \
  clickhouse/logs \
  db-manager/data \
  harbor/data

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

# Stop any running harbor containers to prevent DB locks/corruption during clean runs
echo -e "${YELLOW}Stopping any existing Harbor containers...${NC}"
docker stop harbor-jobservice nginx harbor-core registryctl redis harbor-db registry harbor-portal harbor-log 2>/dev/null || true
docker rm harbor-jobservice nginx harbor-core registryctl redis harbor-db registry harbor-portal harbor-log 2>/dev/null || true

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

# Print the generated credentials dashboard
echo -e "\n${BLUE}===================================================================${NC}"
echo -e "${BLUE}               Auto-Generated Local Credentials Summary            ${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo -e "${YELLOW}MariaDB Database:${NC}"
echo -e "  Host User:     ${GREEN}$(get_env_val "database/.env" "DB_USER")${NC}"
echo -e "  User Password: ${GREEN}$(get_env_val "database/.env" "DB_PASSWORD")${NC}"
echo -e "  Root Password: ${GREEN}$(get_env_val "database/.env" "DB_ROOT_PASSWORD")${NC}"
echo -e "  DB Name:       ${GREEN}$(get_env_val "database/.env" "DB_NAME")${NC}"
echo -e "${YELLOW}Redis Cache:${NC}"
echo -e "  Password:      ${GREEN}$(get_env_val "database/.env" "REDIS_PASSWORD")${NC}"
echo -e "${YELLOW}MinIO Object Storage:${NC}"
echo -e "  Root User:     ${GREEN}$(get_env_val "storage/.env" "MINIO_ROOT_USER")${NC}"
echo -e "  Root Password: ${GREEN}$(get_env_val "storage/.env" "MINIO_ROOT_PASSWORD")${NC}"
echo -e "${YELLOW}ClickHouse Analytics:${NC}"
echo -e "  Admin User:    ${GREEN}$(get_env_val "clickhouse/.env" "CLICKHOUSE_USER")${NC}"
echo -e "  Admin Password:${GREEN}$(get_env_val "clickhouse/.env" "CLICKHOUSE_PASSWORD")${NC}"
echo -e "${BLUE}===================================================================${NC}"
