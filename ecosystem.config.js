module.exports = {
  apps: [
    {
      name: "ecommerce-backend",
      script: "dist/main.js",
      cwd: "./apps/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3333,
      },
    },
    {
      name: "ecommerce-client",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "./apps/client",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
