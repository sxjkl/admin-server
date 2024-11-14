import { NestFactory } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { FastifyApp } from '@global/adapter/fastify.adapter'
import config from '@config/config'
import { LoggerService } from '@shared/logger/logger.service'
import cluster from 'cluster'
import { isDev, isMainProcess } from '@utils/env.util'
import { Logger } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, FastifyApp, {
    bufferLogs: true,
    snapshot: true
  })
  const { port } = config()
  app.useLogger(app.get(LoggerService))
  await app.listen(port, '0.0.0.0', async () => {
    const url = await app.getUrl()
    const { pid } = process
    const env = cluster.isPrimary
    const prefix = env ? 'P' : 'W'

    if (!isMainProcess) return

    const logger = new Logger('NestApplication')
    logger.log(`[${prefix + pid}] Server running on ${url}`)

    if (isDev) logger.log(`[${prefix + pid}] OpenAPI: ${url}/api-docs`)
  })
}

bootstrap()
