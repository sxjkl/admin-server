import { Inject, Injectable } from '@nestjs/common'
import { RedisSubPub } from './redis-subpub'
import { REDIS_PUBSUB } from './redis.constant'

@Injectable()
export class RedisPubSubService {
  constructor(
    @Inject(REDIS_PUBSUB)
    private readonly redisSubPub: RedisSubPub
  ) {}

  async publish(event: string, data: any) {
    await this.redisSubPub.publish(event, data)
  }
  async subscribe(event: string, cb: (data: any) => void) {
    await this.redisSubPub.subscribe(event, cb)
  }
  async unsubscribe(event: string, cb: (data: any) => void) {
    await this.redisSubPub.unsubscribe(event, cb)
  }
}
