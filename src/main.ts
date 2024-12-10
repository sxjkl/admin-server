import { NestFactory } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { FastifyApp } from '@global/adapter/fastify.adapter'
import config from '@config/config'
import { LoggerService } from '@shared/logger/logger.service'
import cluster from 'cluster'
import { isDev, isMainProcess } from '@utils/env.util'
import { HttpStatus, Logger, UnprocessableEntityException, ValidationPipe } from '@nestjs/common'
import { setupSwagger } from './setup-swagger'
import { LoggingInterceptor } from '@global/interceptors/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, FastifyApp, {
    bufferLogs: true,
    snapshot: true
  })
  const { port, globalPrefix } = config()
  app.useLogger(app.get(LoggerService))
  app.setGlobalPrefix(globalPrefix)
  !isDev && app.enableShutdownHooks()

  if (isDev) app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      stopAtFirstError: true,
      exceptionFactory(errors) {
        return new UnprocessableEntityException(
          errors.map(e => {
            const rule = Object.keys(e.constraints!)[0]
            const msg = e.constraints![rule]
            return msg
          })
        )[0]
      }
    })
  )
  setupSwagger(app)
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
