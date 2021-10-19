module.exports = {
  server: {
    port: process.env.PORT || 8884
  },
  environment: process.env.NODE_ENV || 'development',
  smtp: {
    host: process.env.SMTP_HOST || 'localhost'
  }
}