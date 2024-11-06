import { Logger } from '@nestjs/common'
import type { Redis, RedisOptions } from 'ioredis'
import IORedis from 'ioredis'

export class RedisSubPub {
  pubClient: Redis
  subClient: Redis
  private ctc = new WeakMap<(...args: any[]) => void, (channel: string, msg: string) => void>()
  constructor(
    private redisConfig: RedisOptions,
    private channelPrefix: string = 'nest-shop-channel#'
  ) {
    this.init()
  }
  init() {
    const redisOpts: RedisOptions = {
      host: this.redisConfig.host,
      port: this.redisConfig.port
    }
    if (this.redisConfig.password) redisOpts.password = this.redisConfig.password
    const pubClient = new IORedis(redisOpts)
    this.pubClient = pubClient
    this.subClient = pubClient.duplicate()
  }

  async publish(e: string, data: any) {
    const channel = this.channelPrefix + e
    const _data = JSON.stringify(data)
    if (e !== 'log') {
      Logger.debug(`发布事件：${channel} ->->-> ${_data}`, RedisSubPub.name)
    }
    await this.pubClient.publish(channel, _data)
  }
  async subscribe(e: string, cb: (data: any) => void) {
    const myChannel = this.channelPrefix + e
    this.subClient.subscribe(myChannel)
    const _cb = (_channel, _msg) => {
      if (myChannel === _channel) {
        e !== 'log' && Logger.debug(`订阅事件：${_channel} <-<-<- ${_msg}`, RedisSubPub.name)
        cb(JSON.parse(_msg))
      }
    }
    this.ctc.set(cb, _cb)
    this.subClient.on('message', _cb)
  }
  async unsubscribe(e: string, cb: (data: any) => void) {
    const channel = this.channelPrefix + e
    this.subClient.unsubscribe(channel)
    const _cb = this.ctc.get(cb)
    if (_cb) {
      this.subClient.off('message', _cb)
      this.ctc.delete(cb)
    }
  }
}
