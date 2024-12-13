/*
 * @Author: sxjkl1009
 * @Date: 2024-12-13 15:01:31
 * @LastEditTime: 2024-12-13 16:34:33
 * @Description: menu mod
 */
import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RoleModule } from '@system/role/role.module'
import { MenuService } from './menu.service'
import { MenuEntity } from '@entities/menu.entity'
const providers = [MenuService]
@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity]), forwardRef(() => RoleModule)],
  controllers: [],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers]
})
export class MenuModule {}
