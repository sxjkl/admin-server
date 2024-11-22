import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { RefreshTokenEntity } from './refresh-token.entity'
import { UserEntity } from './user.entity'

@Entity('user_access_tokens')
export class AccessTokenEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 500 })
  value!: string

  @Column({ comment: '令牌过期时间' })
  expired_at!: Date

  @CreateDateColumn({ comment: '创建时间' })
  created_at!: Date

  @OneToOne(() => RefreshTokenEntity, refreshToken => refreshToken.accessToken, { cascade: true })
  refreshToken!: RefreshTokenEntity

  @ManyToOne(() => UserEntity, user => user.accessTokens, {
    onDelete: 'CASCADE'
  })
  user!: UserEntity
}
