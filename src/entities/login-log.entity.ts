/*
 * @Author: sxjkl1009
 * @Date: 2024-11-25 18:32:45
 * @LastEditTime: 2024-12-13 14:59:10
 * @Description: loginLogEntity
 */
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm'
import { CommonEntity } from './base.entity'
import { ApiProperty } from '@nestjs/swagger'
import { UserEntity } from './user.entity'

@Entity('sys_login_log')
export class LoginLogEntity extends CommonEntity {
  @Column({ nullable: true, comment: '登录IP' })
  @ApiProperty({ description: '登录IP' })
  ip: string

  @Column({ nullable: true, comment: '登录地点' })
  @ApiProperty({ description: '登录地点' })
  location: string

  @Column({ nullable: true, comment: '浏览器ua' })
  @ApiProperty({ description: '浏览器ua' })
  browser: string

  @Column({ nullable: true })
  @ApiProperty({ description: '登录方式' })
  provider: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>
}
