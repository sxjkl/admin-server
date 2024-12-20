/*
 * @Author: sxjkl1009
 * @Date: 2024-12-13 14:45:01
 * @LastEditTime: 2024-12-13 16:37:49
 * @Description: menuEntity
 */
import { Column, Entity, ManyToMany, Relation } from 'typeorm'
import { CommonEntity } from './base.entity'
import { RoleEntity } from './role.entity'

@Entity({ name: 'sys_menu' })
export class MenuEntity extends CommonEntity {
  @Column({ name: 'parent_id', nullable: true })
  parentId: number

  @Column({ nullable: true })
  path: string

  @Column()
  name: string

  @Column({ nullable: true })
  permission: string

  @Column({ type: 'tinyint', default: 0 })
  type: number

  @Column({ nullable: true, default: '' })
  icon: string

  @Column({ name: 'order_no', type: 'int', nullable: true, default: 0 })
  orderNo: number

  @Column({ name: 'component', nullable: true })
  component: string

  @Column({ name: 'is_ext', type: 'boolean', default: false })
  isExt: boolean

  @Column({ name: 'ext_open_mode', type: 'tinyint', default: 1 })
  extOpenMode: number

  @Column({ name: 'keep_alive', type: 'tinyint', default: 1 })
  keepAlive: number

  @Column({ type: 'tinyint', default: 1 })
  show: number

  @Column({ name: 'active_menu', nullable: true })
  activeMenu: string

  @Column({ type: 'tinyint', default: 1 })
  status: number

  @ManyToMany(() => RoleEntity, role => role.menus, {
    onDelete: 'CASCADE'
  })
  roles: Relation<RoleEntity[]>
}
