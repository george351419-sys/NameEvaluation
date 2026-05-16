module.exports = {
  apps: [
    {
      name: "name-website",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "./app",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
