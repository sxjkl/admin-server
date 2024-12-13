/*
 * @Author: sxjkl1009
 * @Date: 2024-11-26 15:03:41
 * @LastEditTime: 2024-12-13 14:59:57
 * @Description: RoleEntity
 */

import { CommonEntity } from '@entities/base.entity'
import { Column, Entity, JoinTable, ManyToMany, Relation } from 'typeorm'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { UserEntity } from '@entities/user.entity'
import { MenuEntity } from './menu.entity'

@Entity({ name: 'sys_role' })
export class RoleEntity extends CommonEntity {
  @Column({ length: 50, unique: true })
  @ApiProperty({ description: '角色名' })
  name: string

  @Column({ unique: true })
  @ApiProperty({ description: '角色标识' })
  value: string

  @Column({ nullable: true })
  @ApiProperty({ description: '角色描述' })
  remark: string

  @Column({ nullable: true })
  @ApiProperty({ description: '状态：1启用，0禁用' })
  status: number

  @Column({ nullable: true })
  @ApiProperty({ description: '是否默认用户' })
  default: boolean

  @ApiHideProperty()
  @ManyToMany(() => UserEntity, user => user.roles)
  users: Relation<UserEntity[]>

  @ApiHideProperty()
  @ManyToMany(() => MenuEntity, menu => menu.roles, {})
  @JoinTable({
    name: 'sys_role_menus',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'menu_id', referencedColumnName: 'id' }
  })
  menus: Relation<MenuEntity[]>
}
