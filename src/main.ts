import { NestFactory } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { FastifyApp } from '@global/adapter/fastify.adapter'
import config from '@config/config'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, FastifyApp, {
    bufferLogs: true,
    snapshot: true
  })
  const { port } = config()
  await app.listen(port, '0.0.0.0')
}

bootstrap()
