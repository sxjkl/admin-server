import { HTTP_IDEMPOTENCE_KEY } from '@common/decorators/idempotence.decorator'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CacheService } from '@shared/redis/cache.service'
import { FastifyRequest } from 'fastify'
import { Observable } from 'rxjs'

const IdempotenceHeaderKey = 'X-Idempotence-Key'

export class IdempotenceOption {
  errorMessage?: string
  pendingMessage?: string

  /**
   *如果重复请求的话，手动处理异常
   */
  handler?: (req: FastifyRequest) => any

  /**
   * 记录重复请求的时间
   * @default 60
   */
  expired?: number

  /**
   * 如果 header 没有幂等 key，根据 request 生成 key，如何生成这个 key 的方法
   */
  generateKey?: (req: FastifyRequest) => string

  /**
   * 仅读取 header 的 key，不自动生成
   * @default false
   */
  disableGenerateKey?: boolean
}

@Injectable()
export class IdempotenceInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService
  ) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<FastifyRequest>()

    // skip Get 请求
    if (req.method.toUpperCase() === 'GET') return next.handle()

    const handler = context.getHandler()
    const options: IdempotenceOption | undefined = this.reflector.get(HTTP_IDEMPOTENCE_KEY, handler)
  }
}
