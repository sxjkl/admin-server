import Config from '@config/config'
import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { RoleService } from '@system/role/role.service'
import { RedisService } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'
import { RefreshTokenEntity } from '@entities/refresh-token.entity'
import { Repository } from 'typeorm'
import { AccessTokenEntity } from '@entities/access-token.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from '@entities/user.entity'
import dayjs from 'dayjs'
import { TokenInfo } from '../model/auth.model'
import { generateUUID } from '@utils/tool.util'
import { genAuthTokenKey, genOnlineUserKey, genRefreshTokenKey } from '@global/helper/genRedisKey'
import { SysException } from '@global/exceptions/sys.exception'
import { ErrorEnum } from '@common/constants/error-code.constant'

const config = Config()
/**
 * 令牌服务
 */
@Injectable()
export class TokenService {
  private readonly redis: Redis

  constructor(private readonly redisService: RedisService) {
    this.redis = redisService.getOrThrow()
  }
  @Inject()
  private readonly jwtService: JwtService
  @Inject()
  private readonly roleService: RoleService
  @InjectRepository(AccessTokenEntity)
  private readonly accessTokenRepository: Repository<AccessTokenEntity>
  @InjectRepository(RefreshTokenEntity)
  private readonly refreshTokenRepository: Repository<RefreshTokenEntity>
  /**
   * 根据refreshToken刷新accessToken
   */
  async refreshToken(refreshToken: string): Promise<TokenInfo> {
    // 根据refreshToken 查找accessToken
    const uid = this.redis.get(genRefreshTokenKey(refreshToken))
    if (!uid) {
      await this.removeAccessToken(refreshToken)
      throw new SysException(ErrorEnum.USER_INVALID_LOGIN_TOKEN)
    }

    const roleIds = await this.roleService.getRoleIdsByUser(+uid)
    const roleVals = await this.roleService.getRoleValues(roleIds)
    // 重新生成accessToken，不生成refreshToken
    const token = await this.generateAccessToken(+uid, roleVals, true)
    return {
      accessToken: token as string,
      refreshToken
    }
  }

  async generateJwtSign(payload) {
    return this.jwtService.sign(payload)
  }

  async generateAccessToken(uid: number, roles: string[] = [], isRefresh = false): Promise<TokenInfo | string> {
    const payload: IAuthUser = {
      uid,
      pv: 1,
      roles
    }
    const jwtSign = await this.jwtService.signAsync(payload)

    // 生产accessToken
    const accessToken = new AccessTokenEntity()
    accessToken.value = jwtSign
    accessToken.user = { id: uid } as UserEntity
    accessToken.expire_at = dayjs().add(config.jwt.expiresIn, 'second').toDate()
    await accessToken.save()
    // 生产 refreshToken
    await this.redis.set(genAuthTokenKey(uid), jwtSign, 'EX', config.jwt.expiresIn)
    if (isRefresh) {
      return jwtSign
    }
    const refreshToken = await this.generateRefreshToken(accessToken, dayjs())
    return {
      accessToken: jwtSign,
      refreshToken
    }
  }

  async generateRefreshToken(accessToken: AccessTokenEntity, now: dayjs.Dayjs): Promise<string> {
    const refreshTokenPayload = {
      uuid: generateUUID()
    }
    const refreshTokenSign = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: config.jwt.refreshSecret
    })
    const refreshToken = new RefreshTokenEntity()
    refreshToken.value = refreshTokenSign
    refreshToken.expired_at = now.add(config.jwt.refreshExpiresIn, 'second').toDate()
    refreshToken.accessToken = accessToken
    await refreshToken.save()
    await this.redis.set(genRefreshTokenKey(refreshTokenSign), accessToken.user.id, 'EX', config.jwt.refreshExpiresIn)
    return refreshTokenSign
  }

  async removeAccessToken(value: string) {
    const accessToken = await this.accessTokenRepository.findOne({ where: { value } })
    if (accessToken) {
      this.redis.del(genAuthTokenKey(accessToken.user.id))
      this.redis.del(genOnlineUserKey(accessToken.id))
      this.redis.del(genRefreshTokenKey(accessToken.refreshToken.value))
      await accessToken.remove()
    }
  }

  async removeRefreshToken(val: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({ where: { value: val }, relations: ['accessToken'] })
    if (refreshToken) {
      if (refreshToken.accessToken) this.redis.del(genOnlineUserKey(refreshToken.accessToken.id))
      await refreshToken.accessToken.remove()
      await refreshToken.remove()
    }
  }

  /**
   * 检查accessToken是否存在，并且是否在有效期内
   */
  async checkAccessToken(value: string) {
    let valid = 0
    try {
      await this.verifyAccessToken(value)
      const accessToken = await this.accessTokenRepository.findOne({ where: { value } })
      const token = await this.redis.get(genAuthTokenKey(accessToken.user.id))
      valid = Boolean(token) ? 2 : 1 // 1 正常 2 失效了
    } catch (e) {
      return valid // 验证错误了
    }
    return valid
  }
  async verifyAccessToken(token: string): Promise<IAuthUser> {
    return this.jwtService.verifyAsync(token)
  }
}
