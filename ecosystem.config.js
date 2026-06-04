module.exports = {
  apps: [
    {
      name: "nexplan-backend",
      cwd: "./backend",
      script: "dist/index.js",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      env: { NODE_ENV: "production" },
    },
    {
      name: "nexplan-tunnel",
      script: "C:\\Users\\ACER\\AppData\\Local\\cloudflared.exe",
      args: "tunnel --url http://localhost:4000 --no-autoupdate",
      watch: false,
      autorestart: true,
      max_restarts: 5,
    },
  ],
};
