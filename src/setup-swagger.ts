import { API_SECURITY_AUTH } from '@common/decorators/swagger.decorator'
import { ResOp, TreeResult } from '@common/model/resp.model'
import config from '@config/config'
import { INestApplication, Logger } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const setupSwagger = (app: INestApplication) => {
  const cfg = config()
  const port = cfg.port,
    name = cfg.name,
    enable = cfg.swagger.enable,
    path = cfg.swagger.path

  if (!enable) return

  const docBuilder = new DocumentBuilder().setTitle(name).setDescription(`${name} API Documentation`).setVersion('1.0')

  docBuilder.addSecurity(API_SECURITY_AUTH, { description: 'API 认证', type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })

  const doc = SwaggerModule.createDocument(app, docBuilder.build(), { ignoreGlobalPrefix: false, extraModels: [ResOp, TreeResult] })

  SwaggerModule.setup(path, app, doc, {
    swaggerOptions: {
      persistAuthorization: true
    }
  })

  const logger = new Logger('SwaggerModule')
  logger.log(`Swagger run on http://127.0.0.1:${port}${path}`)
}
