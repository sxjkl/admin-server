import { RedisIoAdapterKey } from '@common/adapters/socket.adapter'
import { API_CACHE_PREFIX } from '@common/constants/cache.constant'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Emitter } from '@socket.io/redis-emitter'
import { getRedisKey } from '@utils/redis.util'
import { Cache } from 'cache-manager'
import Redis from 'ioredis'

export type TCacheKey = string
export type TCacheValue<T> = Promise<T | undefined>

@Injectable()
export class CacheService {
  private cache!: Cache
  private redis!: Redis
  private _emitter: Emitter
  constructor(@Inject(CACHE_MANAGER) cache: Cache) {
    this.cache = cache
  }

  private get redisClient() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.cache.store.getClient()
  }

  get<T>(key: TCacheKey): TCacheValue<T> {
    return this.cache.get<T>(key)
  }

  set<T>(key: TCacheKey, value: any, ttl: number) {
    return this.cache.set(key, value, ttl)
  }
  getClient() {
    return this.redisClient
  }
  get emitter(): Emitter {
    if (this._emitter) return this._emitter
    this._emitter = new Emitter(this.redisClient, {
      key: RedisIoAdapterKey
    })
    return this._emitter
  }
  async cleanCache() {
    const redis = this.getClient()
    const keys: string[] = await redis.keys(`${API_CACHE_PREFIX}*`)
    await Promise.all(keys.map(key => redis.del(key)))
  }

  async cleanAllRedisKey() {
    const redis = this.getClient()
    const keys: string[] = await redis.keys(getRedisKey('*'))
    await Promise.all(keys.map(key => redis.del(key)))
  }
}
