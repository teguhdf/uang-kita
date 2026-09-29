module.exports = {
  apps: [
    {
      name: "uang-kita",
      script: "./build/server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      kill_timeout: 10000,
      listen_timeout: 10000,
      time: true,
      env: {
        NODE_ENV: "production",
        DB_CONNECTION: "production",
        APP_TIMEZONE: "Asia/Jakarta",
        TZ: "Asia/Jakarta",
      },
    },
  ],
};
