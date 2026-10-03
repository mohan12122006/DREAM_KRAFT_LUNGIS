// PM2 process file for non-Docker deployments: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'dream-kraft-lungis-api',
      script: 'server.js',
      cwd: __dirname,
      instances: 'max',
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production' }
    }
  ]
};
