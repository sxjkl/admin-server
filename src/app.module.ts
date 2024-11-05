import { Module } from '@nestjs/common'
import { DatabaseModule } from './shared/database/database.module'
import { ShareModule } from './shared/shared.module'

@Module({
  imports: [ShareModule, DatabaseModule]
})
export class AppModule {}
