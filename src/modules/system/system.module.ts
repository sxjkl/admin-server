import { Module } from '@nestjs/common'
import { LogModule } from './logs/log.module'
import { RoleModule } from './role/role.module'
import { UserModule } from './user/user.module'
import { RouterModule } from '@nestjs/core'
import { MenuModule } from './menu/menu.module'

const modules = [UserModule, LogModule, RoleModule, MenuModule]

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
