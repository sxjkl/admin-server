import { ErrorEnum } from '@common/constants/error-code.constant'
import { SysException } from '@global/exceptions/sys.exception'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'
import { LoginLogService } from '@system/logs/services/login-log.service'
import { RoleService } from '@system/role/role.service'
import { UserService } from '@system/user/user.service'
import { md5 } from '@utils/crypto.util'
import Redis from 'ioredis'
import { isEmpty, result } from 'lodash'
import { TokenService } from './service/token.service'
import { TokenInfo } from './model/auth.model'

@Injectable()
export class AuthService {
  private readonly redis: Redis
  constructor(private readonly redisService: RedisService) {
    this.redis = redisService.getOrThrow()
  }
  @Inject()
  private readonly userService: UserService

  @Inject()
  private readonly loginLogService: LoginLogService

  @Inject()
  private readonly roleService: RoleService

  @Inject()
  private readonly tokenService: TokenService

  async validateUser(username: string, password: string) {
    const user = await this.userService.getUserByUsername(username)

    if (isEmpty(user)) throw new SysException(ErrorEnum.USER_NOT_FOUND)
    const cmpPwd = md5(`${password}${user.pSalt}`)

    if (cmpPwd !== user.password) throw new SysException(ErrorEnum.USER_INVALID_USERNAME_PASSWORD)
    if (user) {
      delete user.password
      delete user.pSalt
      return user
    }
    return null
  }

  async login(username: string, password: string, ip: string, ua: string) {
    const user = await this.validateUser(username, password)
    const roleIds = await this.roleService.getRoleIdsByUser(user.id)
    const roles = await this.roleService.getRoleValues(roleIds)
    // 登录日志
    await this.loginLogService.create(user.id, ip, ua)
    // 返回token refreshToken
    return (await this.tokenService.generateAccessToken(user.id, roles)) as TokenInfo
  }
}
