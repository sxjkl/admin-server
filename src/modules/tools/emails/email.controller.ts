import { ApiSecurityAuth } from '@common/decorators/swagger.decorator'
import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('System - 邮箱模块')
@ApiSecurityAuth()
@Controller('email')
export class EmailController {
  constructor() {}
}
