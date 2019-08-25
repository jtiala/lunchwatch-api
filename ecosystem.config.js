module.exports = {
  apps: [
    {
      name: 'LunchWatch API',
      script: 'bundle.js',
      instances: 1,
      autorestart: true,
      watch: true,
      watch_options: {
        usePolling: true,
        interval: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
