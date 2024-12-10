import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserEntity } from '@entities/user.entity'
import { RefreshTokenEntity } from '@entities/refresh-token.entity'

@Entity('user_access_tokens')
export class AccessTokenEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 500 })
  value!: string

  @Column({ comment: '令牌过期时间' })
  expire_at!: Date

  @CreateDateColumn({ comment: '令牌创建时间' })
  create_at!: Date

  @ManyToOne(() => UserEntity, user => user.accessTokens)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity

  @OneToOne(() => RefreshTokenEntity, refreshToken => refreshToken.accessToken, { cascade: true })
  refreshToken: RefreshTokenEntity
}
