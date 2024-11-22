import { ErrorEnum } from '@common/constants/error-code.constant'
import { SysException } from '@global/exceptions/sys.exception'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'
import { UserService } from '@system/user/user.service'
import { md5 } from '@utils/crypto.util'
import Redis from 'ioredis'
import { isEmpty } from 'lodash'

@Injectable()
export class AuthService {
  private readonly redis: Redis | null
  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow()
  }

  @Inject()
  private readonly userService: UserService

  async validateUser(credentials: string, password: string): Promise<any> {
    const user = await this.userService.findUserByUserName(credentials)
    if (isEmpty(user)) throw new SysException(ErrorEnum.USER_NOT_FOUND)

    const comparePassword = md5(`${password}${user.pSalt}`)
    if (comparePassword !== user.password) throw new SysException(ErrorEnum.USER_INVALID_USERNAME_PASSWORD)
    if (user) {
      delete user.password
      delete user.pSalt

      return user
    }
    return null
  }

  /**
   * 获取登录JWT
   * 返回null则账号密码有误，不存在该用户
   */
  async login(username: string, password: string, ip: string, ua: string): Promise<any> {
    const user = await this.validateUser(username, password)
    if (isEmpty(user)) return null
  }
}
