import { Injectable } from '@nestjs/common'
import { RedisService } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'
import dayjs from 'dayjs'
import { MailerService as NestMailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailerService {
  private readonly redis: Redis | null
  constructor(
    private readonly redisService: RedisService,
    private mailerService: NestMailerService
  ) {
    this.redis = this.redisService.getOrThrow()
  }
  async log(to: string, code: string, ip: string) {
    const getRemainTime = () => {
      const now = dayjs()
      return now.endOf('day').diff(now, 'second')
    }
    await this.redis.set(`captcha:${to}`, code, 'EX', 60 * 5)

    const limitCountOfDay = await this.redis.get(`captcha:${to}:limit-day`)
    const ipLimitCountOfDay = await this.redis.get(`ip:${ip}:send:limit-day`)

    await this.redis.set(`ip:${ip}:send:limit`, 1, 'EX', 60)
    await this.redis.set(`captcha:${to}:limit`, 1, 'EX', 60)
    await this.redis.set(`captcha:${to}:send:limit-count-day`, limitCountOfDay, 'EX', getRemainTime())
    await this.redis.set(`ip:${ip}:send:limit-count-day`, ipLimitCountOfDay, 'EX', getRemainTime())
  }
  async checkCode(to, code) {
    const res = await this.redis.get(`captcha:${to}`)
    // if (res !== code) throw new
  }
}
