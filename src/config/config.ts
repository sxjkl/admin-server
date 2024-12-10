export default () => ({
  port: 3001,
  name: 'Nest-Admin',
  globalPrefix: 'api',
  jwt: {
    secret: 'jklklj1010',
    expiresIn: 86400,
    refreshSecret: 'sxjkl1-0-1',
    refreshExpiresIn: 2592000
  },
  swagger: {
    enable: true,
    path: '/api-docs'
  },
  initAdmin: {
    username: 'admin',
    password: 'admin'
  },
  tencent: {},
  database: {
    host: '154.201.71.246',
    port: 3306,
    username: 'root',
    password: 'ljk1009.',
    database: 'admin-server',
    synchronize: true
  },
  redis: {
    host: '154.201.71.246',
    port: 6379,
    password: 'ljk1009.',
    db: 0
  },
  logger: {
    level: 'verbose',
    maxFiles: 30
  }
})
