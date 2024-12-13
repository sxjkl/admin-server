/*
 * @Author: sxjkl1009
 * @Date: 2024-11-26 10:47:49
 * @LastEditTime: 2024-12-13 16:16:56
 * @Description: auth service
 */
import { ErrorEnum } from '@common/constants/error-code.constant'
import { SysException } from '@global/exceptions/sys.exception'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'
import { LoginLogService } from '@system/logs/services/login-log.service'
import { RoleService } from '@system/role/role.service'
import { UserService } from '@system/user/user.service'
import { md5 } from '@utils/crypto.util'
import Redis from 'ioredis'
import { isEmpty } from 'lodash'
import { TokenService } from './service/token.service'
import { TokenInfo } from './model/auth.model'
import { genAuthPermKey, genAuthPVKey, genAuthTokenKey } from '@global/helper/genRedisKey'
import { MenuService } from '@system/menu/menu.service'

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

  @Inject()
  private readonly menuService: MenuService

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
    // todo 设置版本密码 当密码修改是，版本号 + 1
    await this.redis.set(genAuthPVKey(user.id), 1)

    // 设置菜单权限
    const permissions = await this.menuService.getPermissions(user.id)
    await this.setPermissionsCache(user.id, permissions)
    // 登录日志
    await this.loginLog(user.id, ip, ua)
    // 返回token refreshToken
    return (await this.tokenService.generateAccessToken(user.id, roles)) as TokenInfo
  }

  /**
   * 效验账号密码
   */
  async checkPassword(username: string, password: string) {
    const user = await this.userService.getUserByUsername(username)

    const comparePassword = md5(`${password}${user.pSalt}`)
    if (user.password !== comparePassword) throw new SysException(ErrorEnum.USER_INVALID_USERNAME_PASSWORD)
  }

  async loginLog(uid: number, ip: string, ua: string) {
    await this.loginLogService.create(uid, ip, ua)
  }
  /**
   * 获取菜单列表
   */
  async getMenus(uid: number) {
    return this.menuService.getMenus(uid)
  }
  /**
   * 获取权限列表
   */
  async getPermissions(uid: number): Promise<string[]> {
    return this.menuService.getPermissions(uid)
  }

  async getPermissionsCache(uid: number): Promise<string[]> {
    const permissionString = await this.redis.get(genAuthPermKey(uid))
    return permissionString ? JSON.parse(permissionString) : []
  }

  async setPermissionsCache(uid: number, permissions: string[]): Promise<void> {
    await this.redis.set(genAuthPermKey(uid), JSON.stringify(permissions))
  }

  async getPasswordVersionByUid(uid: number): Promise<string> {
    return this.redis.get(genAuthPVKey(uid))
  }

  async getTokenByUid(uid: number): Promise<string> {
    return this.redis.get(genAuthTokenKey(uid))
  }
}
