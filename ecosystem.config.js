module.exports = {
  apps: [
    {
      name: "nexplan-backend",
      cwd: "./backend",
      script: "dist/index.js",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
