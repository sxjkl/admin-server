import { Global, Module } from '@nestjs/common'
import { LoggerModule } from './logger/logger.module'
import { HttpModule } from '@nestjs/axios'
import { ScheduleModule } from '@nestjs/schedule'
import { RedisModule } from './redis/redis.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { isDev } from '@utils/env.util'
import { AcceptLanguageResolver, CookieResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import path from 'path'

@Global()
@Module({
  imports: [
    // logger
    LoggerModule.forRoot(),
    HttpModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ limit: 3, ttl: 60000 }]),
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.', newListener: false, removeListener: false, maxListeners: 20, verboseMemoryLeak: isDev, ignoreErrors: false }),
    RedisModule,
    I18nModule.forRoot({
      fallbackLanguage: 'zh',
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'),
        watch: true
      },
      resolvers: [
        // 解析 URL 查询参数中的语言设置，支持 "lang" 和 "l" 参数
        new QueryResolver(['lang', 'l']),
        // 解析 HTTP 头部中的自定义语言设置，支持 "x-custom-lang" 头部
        new HeaderResolver(['x-custom-lang']),
        // 解析 Cookie 中的语言设置，支持 "lang" Cookie
        new CookieResolver(['lang']),
        // 解析请求头中的 Accept-Language 设置
        AcceptLanguageResolver
      ],
      typesOutputPath: path.join(__dirname, '../generated/i18n.generated.ts')
    })
  ],
  exports: [RedisModule, HttpModule]
})
export class ShareModule {}
