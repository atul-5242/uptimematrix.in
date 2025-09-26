module.exports = {
  apps: [
    {
      name: 'uptimematrix-api',
      script: './api/index.js',
      cwd: '/opt/uptimematrix/current',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/uptimematrix/api-error.log',
      out_file: '/var/log/uptimematrix/api-out.log',
      log_file: '/var/log/uptimematrix/api.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },
    {
      name: 'uptimematrix-pusher',
      script: './pusher/index.js',
      cwd: '/opt/uptimematrix/current',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/uptimematrix/pusher-error.log',
      out_file: '/var/log/uptimematrix/pusher-out.log',
      log_file: '/var/log/uptimematrix/pusher.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '300M'
    },
    {
      name: 'uptimematrix-worker',
      script: './worker/index.js',
      cwd: '/opt/uptimematrix/current',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/uptimematrix/worker-error.log',
      out_file: '/var/log/uptimematrix/worker-out.log',
      log_file: '/var/log/uptimematrix/worker.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '400M'
    }
  ]
};
