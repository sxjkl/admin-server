import { ErrorEnum } from '@common/constants/error-code.constant'
import { SysException } from '@global/exceptions/sys.exception'
import { genCaptchaImgKey } from '@global/helper/genRedisKey'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { isEmpty } from 'lodash'

@Injectable()
export class CaptchaService {
  private readonly redis: Redis
  constructor(private redisService: RedisService) {
    this.redis = redisService.getOrThrow()
  }

  async checkImgCaptcha(id: string, code: string): Promise<void> {
    const result = await this.redis.get(genCaptchaImgKey(id))

    if (isEmpty(result) || code.toLocaleLowerCase() != result.toLocaleLowerCase()) throw new SysException(ErrorEnum.INVALID_VERIFICATION_CODE)

    await this.redis.del(genCaptchaImgKey(id))
  }
}
