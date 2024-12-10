import { Module } from '@nestjs/common'
import { LogModule } from './logs/log.module'
import { RoleModule } from './role/role.module'
import { UserModule } from './user/user.module'
import { RouterModule } from '@nestjs/core'

const modules = [UserModule, LogModule, RoleModule]

@Module({
  imports: [
    ...modules,
    RouterModule.register([
      {
        path: 'system',
        module: SystemModule,
        children: [...modules]
      }
    ])
  ],
  exports: [...modules]
})
export class SystemModule {}
