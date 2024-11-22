import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { DatabaseModule } from './shared/database/database.module'
import { ShareModule } from './shared/shared.module'
import { seconds, ThrottlerModule } from '@nestjs/throttler'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AllExceptionFilter } from '@global/filters/all-exception.filter'
import { TransformInterceptor } from '@global/interceptors/transform.interceptor'
import { TimeoutInterceptor } from '@global/interceptors/timeout.interceptor'

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        errorMessage: '当前操作过于繁忙，请稍后再试',
        throttlers: [{ ttl: seconds(10), limit: 7 }]
      })
    }),
    ShareModule,
    DatabaseModule
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useFactory: () => new TimeoutInterceptor(15 * 1000) },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }
  ]
})
export class AppModule {}
