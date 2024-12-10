import { RedisService } from '@liaoliaots/nestjs-redis'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CaptchaDto } from '../dto/captcha.dto'
import { ImageCaptcha } from '../model/auth.model'
import Redis from 'ioredis'
import * as svgCaptcha from 'svg-captcha'
import { isEmpty } from 'lodash'
import { generateUUID } from '@utils/tool.util'
import { genCaptchaImgKey } from '@global/helper/genRedisKey'
import { ApiResult } from '@common/decorators/api-result.decorator'
import { Public } from '@common/decorators/public.decorator'

@ApiTags('Captcha - 验证码模块')
@Controller('auth/captcha')
export class CaptchaController {
  private readonly redis: Redis
  constructor(private readonly redisService: RedisService) {
    this.redis = redisService.getOrThrow()
  }

  @Get('img')
  @ApiOperation({ summary: '图形验证码' })
  @ApiResult({ type: ImageCaptcha })
  @Public()
  async captchaImg(@Query() dto: CaptchaDto): Promise<ImageCaptcha> {
    const { width, height } = dto

    const svg = svgCaptcha.create({
      size: 4,
      color: true,
      noise: 4,
      width: isEmpty(width) ? 100 : width,
      height: isEmpty(height) ? 50 : height,
      charPreset: '0123456789QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'
    })

    const result = {
      img: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString('base64')}`,
      id: generateUUID()
    }
    await this.redis.set(genCaptchaImgKey(result.id), svg.text, 'EX', 60 * 5)
    return result
  }
}
