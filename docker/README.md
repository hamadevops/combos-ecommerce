# E-Commerce Infrastructure Services Guide

This directory contains the production-ready Docker Compose configurations for the core backing services of the Combos E-Commerce application. 

---

## 🗺️ Infrastructure Overview

The services are split into independent stacks to run them as isolated services across one or multiple servers.

| Service Stack | Core Container Name | Internal Ports | Exposed Ports | Data Volume Path (Host) |
| :--- | :--- | :--- | :--- | :--- |
| **Database** (MariaDB) | `mariadb-container` | `3306` | `3306` (Host mode) | `./database/mysql/data` |
| **Database** (Redis) | `redis-container` | `6379` | `6379` (Host mode) | `./database/redis/data` |
| **Storage** (MinIO S3) | `minio` | `9000` (API) / `9001` (Console) | `9000` / `9001` | `./storage/data` |
| **ClickHouse** (Analytics) | `clickhouse-server` | `8123` (HTTP) / `9000` (TCP) | `8125` (HTTP) / `9005` (TCP) | `./clickhouse/data` |
| **DB Manager** (CloudBeaver) | `cloudbeaver-gui` | `8978` | `8978` | `./db-manager/data` |
| **Harbor** (Docker Registry) | `nginx` (Proxy entry) | `8080` (HTTP) / `443` (HTTPS) | `8888` (HTTP) | `./harbor/data` |

---

## 🚀 Operations & Orchestration

### Run All Services Simultaneously
We have created a master startup orchestrator script that safely boots all stacks in order, handles Harbor's configuration compilation, and sets file ownership correctly:
```bash
# Navigate to the docker directory
cd docker/

# Start all database, storage, clickhouse, cloudbeaver, and harbor registry stacks
./start-all.sh
```

### Managing Individual Services
Each service stack resides in its own sub-folder with a dedicated `docker-compose.yml` and `.env` configuration file. You can start/stop individual services directly:

#### 1. Databases (MariaDB & Redis)
* **Start**: `cd database && docker compose up -d`
* **Stop**: `cd database && docker compose down`

#### 2. MinIO S3 Object Storage
* **Start**: `cd storage && docker compose up -d`
* **Stop**: `cd storage && docker compose down`

#### 3. ClickHouse Analytics Server
* **Start**: `cd clickhouse && docker compose up -d`
* **Stop**: `cd clickhouse && docker compose down`

#### 4. CloudBeaver Database Manager GUI
* **Start**: `cd db-manager && docker compose up -d`
* **Stop**: `cd db-manager && docker compose down`

#### 5. Harbor Container Registry
* **Note**: Harbor requires config generation and syslog service boot order.
* **Start (Safe Sequence)**:
  ```bash
  cd harbor
  ./prepare
  sudo chown -R $USER:$USER common && sudo chmod -R 777 common
  docker compose up -d log
  sleep 3
  docker compose up -d
  ```
* **Stop**: `cd harbor && docker compose down`

---

## 🔑 Connections & Credentials

### 🗄️ Database Access
* **MariaDB**:
  - **Host**: `192.168.1.90` (or `localhost`)
  - **Port**: `3306`
  - **User**: `ecommerce_user`
  - **Password**: `b3ed2d1a25853714498d4c035af057c9`
  - **Database**: `ecommerce_db`
* **Redis**:
  - **Host**: `192.168.1.90` (or `localhost`)
  - **Port**: `6379`
  - **Password**: `0408ccade2d7e474863df16b7ee7f59e`

### 📦 S3 Storage Console (MinIO)
* **Access URL**: `http://localhost:9001`
* **API Endpoints**: `http://localhost:9000` (or `http://192.168.1.90:9000`)
* **Access Key / Username**: `minio_admin`
* **Secret Key / Password**: `9be669eaa23e7ac0fd55c3b4f447f350`

### 📊 ClickHouse OLAP Database
* **HTTP Endpoint**: `http://localhost:8125`
* **TCP Port**: `9005` (Native Protocol Client)
* **Default Database**: `analytics_db`
* **Admin Username**: `clickhouse_admin`
* **Admin Password**: `346ad246d18eb5ea35ac430770a39d1c`

### 🖥️ CloudBeaver Database Manager
* **Access URL**: `http://localhost:8978`
* **Purpose**: Access and manage MariaDB and ClickHouse via a single web browser console.
* **Setup**: Connect to your database using the parameters above.

### ⚓ Harbor Registry
* **Access URL**: `http://192.168.1.90:8888`
* **Docker CLI Login**:
  ```bash
  docker login 192.168.1.90:8888
  ```
  *(Default Credentials: Username `admin`, Password `Harbor12345`)*
* **Pushing Images**:
  ```bash
  docker tag <image_name> 192.168.1.90:8888/library/<image_name>:latest
  docker push 192.168.1.90:8888/library/<image_name>:latest
  ```

---

## 🛠️ Troubleshooting

### 1. Harbor Logging Driver Connection Failures
* **Symptom**: During launch, Docker reports: `failed to initialize logging driver: dial tcp 127.0.0.1:1514: connect: connection refused`.
* **Fix**: The syslog service (`harbor-log`) must bind to port `1514` before the other services try to connect. Always use the orchestrator script `./start-all.sh` or start the log container first:
  ```bash
  docker compose down
  docker compose up -d log
  sleep 3
  docker compose up -d
  ```

### 2. File Permission Denied inside Harbor
* **Symptom**: Nginx or registry logs show `open /etc/nginx/nginx.conf: permission denied`.
* **Fix**: The Harbor prepare script creates config files owned by `root` with `600` permissions. Run the following command inside `harbor/` to allow container users to read configs:
  ```bash
  sudo chown -R $USER:$USER common
  sudo chmod -R 777 common
  docker compose restart
  ```

### 3. ClickHouse Health check Resolves IPv6 Loopback
* **Symptom**: ClickHouse server starts successfully but Docker shows status `unhealthy`.
* **Explanation**: Local healthcheck resolves `localhost` to IPv6 `[::1]`. We have patched the config to query IPv4 `127.0.0.1` inside `docker-compose.yml` to prevent connection refusal.
