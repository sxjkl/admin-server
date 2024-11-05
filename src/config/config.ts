export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE
  },
  initAdmin: {
    username: process.env.INIT_ADMIN_USERNAME,
    password: process.env.INIT_ADMIN_PASSWORD
  },
  tencent: {},
  database: {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0
  },
  logger: {
    level: process.env.LOGGER_LEVEL || 'debug',
    maxFiles: parseInt(process.env.LOGGER_MAX_FILES, 10) || 30
  }
})
