import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, Relation } from 'typeorm'
import { CommonEntity } from './base.entity'
import { Exclude } from 'class-transformer'
import { DeptEntity } from './dept.entity'
import { RoleEntity } from './role.entity'
import { AccessTokenEntity } from './access-token.entity'

@Entity({ name: 'sys_user' })
export class UserEntity extends CommonEntity {
  @Column({ unique: true, comment: '用户名' })
  username: string

  @Exclude()
  @Column()
  password: string

  @Column({ length: 32 })
  pSalt: string

  @Column({ nullable: true })
  nickname: string

  @Column({ nullable: true })
  avatar: string

  @Column({ nullable: true })
  qq: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  remark: string

  @Column({ nullable: true })
  email: string

  @Column({ type: 'tinyint', nullable: true, default: 1 })
  status: number

  @ManyToOne(() => DeptEntity, dept => dept.users)
  @JoinColumn({ name: 'dept_id' })
  dept: Relation<DeptEntity>

  @ManyToMany(() => RoleEntity, role => role.users)
  @JoinTable({
    name: 'sys_user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Relation<RoleEntity[]>

  @OneToMany(() => AccessTokenEntity, accessToken => accessToken.user, {
    cascade: true
  })
  accessTokens: Relation<AccessTokenEntity[]>
}
