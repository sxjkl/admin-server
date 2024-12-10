import { FastifyRequest } from 'fastify'
import { AuthStrategy, PUBLIC_KEY } from '@auth/auth.constant'
import { AuthService } from '@auth/auth.service'
import { TokenService } from '@auth/service/token.service'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import Redis from 'ioredis'
import { ExtractJwt } from 'passport-jwt'
import { Observable } from 'rxjs'
import { genTokenBlacklistKey } from '@global/helper/genRedisKey'
import { SysException } from '@global/exceptions/sys.exception'
import { ErrorEnum } from '@common/constants/error-code.constant'
import { isEmpty, isNil } from 'lodash'

@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthStrategy.JWT) {
  private jwtFromReqFn = ExtractJwt.fromAuthHeaderAsBearerToken()
  private readonly redis: Redis
  constructor(private redisService: RedisService) {
    super()
    this.redis = redisService.getOrThrow()
  }

  @Inject()
  private readonly reflector: Reflector
  @Inject()
  private readonly authService: AuthService
  @Inject()
  private readonly tokenService: TokenService

  async canActivate(context: ExecutionContext): Promise<any> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [context.getHandler(), context.getClass()])
    const req = context.switchToHttp().getRequest<FastifyRequest>()

    const isSse = req.headers.accept === 'text/event-stream'
    if (isSse && !req.headers.authorization?.startsWith('Bearer ')) {
      const { token } = req.query as Record<string, string>
      if (token) req.headers.authorization = `Bearer ${token}`
    }
    const token = this.jwtFromReqFn(req)

    if (await this.redis.get(genTokenBlacklistKey(token))) throw new SysException(ErrorEnum.USER_INVALID_LOGIN)
    req.accessToken = token

    let result: any = false
    try {
      result = await super.canActivate(context)
    } catch (err) {
      if (isPublic) return true
      if (isEmpty(token)) throw new SysException(ErrorEnum.USER_NO_LOGIN)
      if (err instanceof UnauthorizedException) throw new SysException(ErrorEnum.USER_INVALID_LOGIN)
      const valid = isNil(token) ? undefined : await this.tokenService.checkAccessToken(token!)
      let error: ErrorEnum
      const validFnc = [
        () => {
          error = ErrorEnum.USER_INVALID_LOGIN
        },
        () => {
          error = ErrorEnum.USER_INVALID_LOGIN_TOKEN_EXPIRE
        }
      ]
      if (valid) {
        validFnc[valid]
        throw new SysException(error)
      } else {
        throw new SysException(ErrorEnum.USER_NO_LOGIN)
      }
    }
    // todo sse 请求
    // todo 版本密码不一致
    // todo 不允许多端登录
    return result
  }
}
