# ClickHouse & CloudBeaver Docker Stack

This directory contains the production-tuned ClickHouse (24.8 LTS) and CloudBeaver Web UI database manager stack.

## Configuration & Ports

The settings are managed via the `.env` file:

| Service | Host Port | Container Port | Purpose |
|---------|-----------|----------------|---------|
| ClickHouse HTTP | `8125` | `8123` | HTTP Query API / Clients |
| ClickHouse TCP | `9005` | `9000` | Native Client Protocol |
| CloudBeaver Web | `8979` | `8978` | Database Manager GUI Console |

## Production Optimizations Included

1. **Memory Safeguards (`config/custom-config.xml`)**:
   - Set maximum memory constraints to prevent queries from exceeding system limits and triggering host-level Out-of-Memory (OOM) killer crashes.
2. **Disk Spilling (`config/custom-users.xml`)**:
   - Configured ClickHouse to automatically spill temporary data to disk for massive queries (using `GROUP BY` or `JOIN`) if memory exceeds `2GB` per query. This keeps heavy analytical jobs from failing.
3. **Auditing Logs**:
   - Enforce server log rotation limits (`100MB` max file size, 10 rotated log generations).
   - Enabled standard `query_log` system tables.
4. **SQL-Driven Access Control**:
   - Enforce SQL Access Management (`<access_management>1</access_management>`) so you can manage database users, roles, and privileges using standard SQL query commands.

## Getting Started

1. Start the stack:
   ```bash
   docker compose up -d
   ```

2. Check service status:
   ```bash
   docker compose ps
   ```

3. Connect via CloudBeaver Web Console:
   - Navigate to `http://localhost:8979` in your web browser.
   - Configure a new connection using:
     - **Database type**: ClickHouse
     - **Host**: `clickhouse` (since both are in the same `ecommerce-app-network` network)
     - **Port**: `8123`
     - **Username**: `clickhouse_admin` (or as configured in `.env`)
     - **Password**: (Your secure password configured in `.env`)
