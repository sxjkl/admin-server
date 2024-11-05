import { Global, Module } from '@nestjs/common'
import { LoggerModule } from './logger/logger.module'
import { HttpModule } from '@nestjs/axios'
import { ScheduleModule } from '@nestjs/schedule'

@Global()
@Module({
  imports: [
    // logger
    LoggerModule.forRoot(),
    HttpModule,
    ScheduleModule.forRoot()
  ],
  exports: []
})
export class ShareModule {}
