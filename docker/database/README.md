# Database & Cache Stack (Host Network Mode)

This is a standalone, production-optimized database stack containing:
- **MariaDB** (optimized configuration, data & error/slow log rotation ready)
- **Redis** (authenticated cache, AOF persistence enabled, memory capped)
- **phpMyAdmin** (web administration tool)

All services utilize **Docker Host Networking Mode** (`network_mode: host`) for maximum performance and lower overhead.

---

## Directory Structure

```text
docker/database/
├── docker-compose.yml       # Docker Compose setup
├── .env                     # Local environment settings (passwords, paths, ports)
├── .env.example             # Template env file
├── mariadb/
│   ├── conf/my.cnf          # Production MariaDB configuration
│   ├── data/                # Persistent database files
│   └── logs/                # Error and slow query logs
└── redis/
    ├── conf/redis.conf      # Production Redis configuration
    ├── data/                # Persistent Redis DB files
    └── logs/                # Redis logs
```

---

## Setup & Run Instructions

### 1. Configure Credentials & Paths
We have initialized a `.env` file for you in this directory. Review the file and update passwords for production deployment:
```bash
# In docker/database/.env
DB_ROOT_PASSWORD=your_strong_root_password
DB_PASSWORD=your_strong_app_user_password
REDIS_PASSWORD=your_strong_redis_password
```

### 2. Start the Stack
Navigate to this directory and run:
```bash
docker compose up -d
```

### 3. Verify Status
Ensure all containers are up and running:
```bash
docker compose ps
```

To view logs for specific services:
```bash
docker compose logs -f mariadb
docker compose logs -f redis
```

---

## Critical Networking Details (`network_mode: host`)

Because this stack uses Host Network mode:
1. **Ports are bound directly to the host**: 
   - MariaDB listens on the port defined by `DB_PORT` (default `3306`).
   - Redis listens on the port defined by `REDIS_PORT` (default `6379`).
   - phpMyAdmin web interface listens on `PMA_PORT` (default `8082`).
2. **Accessing the Database**:
   - **From phpMyAdmin**: In host network mode, phpMyAdmin cannot resolve the DB container via its name. Instead, it connects to `127.0.0.1`. This is already configured in `docker-compose.yml`.
   - **From your Backend Application**: If your backend app is running on the same host machine, set its `DB_HOST=127.0.0.1` and `REDIS_HOST=127.0.0.1` with the respective ports.
3. **Security (Firewall)**:
   - Ensure your server's firewall blocks external incoming traffic on `DB_PORT` (`3306`) and `REDIS_PORT` (`6379`) unless external connections are explicitly required.
