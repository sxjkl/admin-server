import { RoleEntity } from '@entities/role.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RoleService } from './role.service'

const providers = [RoleService]

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  controllers: [],
  providers,
  exports: [TypeOrmModule, ...providers]
})
export class RoleModule {}
