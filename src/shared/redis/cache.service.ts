import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'

import Redis from 'ioredis'

export type TCacheKey = string
export type TCacheValue<T> = Promise<T | undefined>

@Injectable()
export class CacheService {
  private cache!: Cache
  private ioRedis!: Redis
  constructor(@Inject(CACHE_MANAGER) cache: Cache) {
    this.cache = cache
  }
}
