/*
 * @Author: sxjkl1009
 * @Date: 2024-11-25 18:20:24
 * @LastEditTime: 2024-12-13 16:28:28
 * @Description: userEntity
 */
import { Column, Entity, ManyToMany, OneToMany, Relation, JoinTable } from 'typeorm'
import { CommonEntity } from './base.entity'
import { Exclude } from 'class-transformer'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { AccessTokenEntity } from '@entities/access-token.entity'
import { RoleEntity } from '@entities/role.entity'

@Entity('sys_user')
export class UserEntity extends CommonEntity {
  @Column({ name: 'username', comment: '用户名', unique: true })
  @ApiProperty({ description: '用户名' })
  username: string

  @Column({ name: 'password', comment: '密码' })
  @Exclude()
  @ApiHideProperty()
  password: string

  @Column({ name: 'nickname', comment: '昵称' })
  @ApiProperty({ description: '昵称' })
  nickname: string

  @Column({ name: 'avatar', comment: '头像' })
  @ApiProperty({ description: '头像' })
  avatar: string

  @Column({ name: 'email', comment: '邮箱', unique: true })
  @ApiProperty({ description: '邮箱' })
  email: string

  @Column({ name: 'phone', comment: '手机号', unique: true })
  @ApiProperty({ description: '手机号' })
  phone: string

  @Column({ name: 'status', comment: '状态', type: 'tinyint' })
  @ApiProperty({ description: '状态' })
  status: number

  @Column({ name: 'qq', comment: 'qq' })
  @ApiProperty({ description: 'qq' })
  qq: string

  @Column({ name: 'p_salt', comment: '加密盐' })
  pSalt: string

  @Column({ nullable: true })
  remark: string

  @OneToMany(() => AccessTokenEntity, accessToken => accessToken.user, { cascade: true })
  accessTokens: Relation<AccessTokenEntity[]>

  @ManyToMany(() => RoleEntity, role => role.users)
  @JoinTable({
    name: 'sys_user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Relation<RoleEntity[]>
}
