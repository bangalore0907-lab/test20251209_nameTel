module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'tsx src/index-dev.ts',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
