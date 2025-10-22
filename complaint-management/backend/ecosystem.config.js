module.exports = {
  apps: [
    {
      name: "complaint-backend",
      script: "./server.js",
      cwd: "/home/ubuntu/CoRe_Test/complaint-management/backend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      },
      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
      log_file: "./logs/combined.log",
      time: true,
      merge_logs: true
    }
  ]
};
