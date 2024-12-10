import { FastifyRequest } from 'fastify'
import { ALLOW_ANON_KEY, PERMISSION_KEY, PUBLIC_KEY, Roles } from '@auth/auth.constant'
import { AuthService } from '@auth/auth.service'
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SysException } from '@global/exceptions/sys.exception'
import { ErrorEnum } from '@common/constants/error-code.constant'

@Injectable()
export class RbacGuard implements CanActivate {
  constructor() {}

  @Inject()
  private readonly reflector: Reflector
  @Inject()
  private readonly authService: AuthService

  async canActivate(context: ExecutionContext): Promise<any> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [context.getHandler(), context.getClass()])
    if (isPublic) return true
    const req = context.switchToHttp().getRequest<FastifyRequest>()
    const { user } = req
    if (!user) throw new SysException(ErrorEnum.USER_NO_LOGIN)
    // allowAnon 是需要登录后可访问(无需权限), Public 则是无需登录也可访问.
    const allowAnon = this.reflector.get<boolean>(ALLOW_ANON_KEY, context.getHandler())
    if (allowAnon) return true
    // 控制器权限
    const payloadPermission = await this.reflector.getAllAndOverride<string | string[]>(PERMISSION_KEY, [context.getHandler(), context.getClass()])
    // 若没设置权限，不拦截
    if (!payloadPermission) return true
    // 管理员放开所有权限
    if (user.roles.includes(Roles.ADMIN)) return true
  }
}
