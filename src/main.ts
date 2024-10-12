import { NestFactory } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { FastifyApp } from '@/global/adapter/fastify.adapter'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, FastifyApp, {
    bufferLogs: true,
    snapshot: true
  })
  await app.listen(3000)
}

bootstrap()
