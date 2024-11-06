import { CacheService } from './cache.service'
import { Global, Module, Provider } from '@nestjs/common'
import { REDIS_PUBSUB } from './redis.constant'
import Config from '@config/config'
import { RedisSubPub } from './redis-subpub'
import { CacheModule, CacheStore } from '@nestjs/cache-manager'
import { ConfigModule } from '@nestjs/config'
import { redisStore } from 'cache-manager-ioredis-yet'
import { RedisModule as NestRedisModule } from '@liaoliaots/nestjs-redis'
const config = Config()
const providers: Provider[] = [
  CacheService,
  {
    provide: REDIS_PUBSUB,
    useFactory: () => {
      return new RedisSubPub({
        port: config.redis.port,
        host: config.redis.host,
        password: config.redis.password
      })
    }
  }
]

@Global()
@Module({
  imports: [
    // cache-manager
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory() {
        return {
          isGlobal: true,
          store: redisStore() as unknown as CacheStore,
          isCacheableValue: () => true,
          port: config.redis.port,
          host: config.redis.host,
          password: config.redis.password,
          db: config.redis.db
        }
      }
    }),
    NestRedisModule.forRootAsync({
      useFactory() {
        return {
          readyLog: true,
          closeClient: true,
          port: config.redis.port,
          host: config.redis.host,
          password: config.redis.password,
          db: config.redis.db
        }
      }
    })
  ],
  providers,
  exports: [...providers, CacheModule]
})
export class RedisModule {}
