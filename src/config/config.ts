export default () => ({
  port: 3001,
  jwt: {
    secret: 'jklklj1010',
    expiresIn: '24h'
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
