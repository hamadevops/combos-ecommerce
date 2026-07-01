const path = require("path");

module.exports = {
  apps: [
    {
      name: "ecommerce-backend",
      script: path.resolve(__dirname, "./dist/apps/backend/main.js"),
      cwd: path.resolve(__dirname, "./apps/backend"),
      instances: 2,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      kill_timeout: 10000, // Chờ tối đa 10s để đóng kết nối cũ trước khi tắt hẳn
      env: {
        NODE_ENV: "production",
        PORT: 3333,
      },
    },
    {
      name: "ecommerce-client",
      script: path.resolve(__dirname, "./apps/client/node_modules/next/dist/bin/next"),
      args: "start",
      cwd: path.resolve(__dirname, "./apps/client"),
      instances: 1,
      exec_mode: "cluster", // Dùng cluster mode với 1 instance để hỗ trợ Zero-Downtime reload
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      kill_timeout: 10000, // Chờ tối đa 10s để đóng các kết nối cũ
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "ecommerce-admin",
      script: "serve",
      env: {
        PM2_SERVE_PATH: path.resolve(__dirname, "./dist/apps/admin"),
        PM2_SERVE_PORT: 3002,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html",
      },
    },
  ],
};
