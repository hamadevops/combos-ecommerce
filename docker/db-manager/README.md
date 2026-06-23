# Database Manager (CloudBeaver)

This directory contains the central web-based database management console (CloudBeaver). It allows you to manage multiple databases (MariaDB/MySQL, ClickHouse, PostgreSQL, etc.) from a single unified UI.

## Port Configuration

- **Web GUI Port**: `8978` (Access via `http://localhost:8978`)

## How to use

1. Start the database manager:
   ```bash
   docker compose up -d
   ```

2. Open your browser and navigate to `http://localhost:8978`.

3. Register/login (on first run, CloudBeaver will guide you through setting up an administrator username/password).

4. Add database connections:
   - **ClickHouse**:
     - Host: `clickhouse-server` (or if you are running it outside this network, use the host IP `192.168.1.90`)
     - Port: `8123`
     - Username: `clickhouse_admin`
     - Password: (configured in your ClickHouse `.env`)
   - **MariaDB**:
     - Host: `192.168.1.90` (since MariaDB runs in `network_mode: host` directly on the host)
     - Port: `3306`
     - Username: `ecommerce_user`
     - Password: (configured in your database `.env`)
