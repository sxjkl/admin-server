import { HTTP_IDEMPOTENCE_KEY } from '@common/decorators/idempotence.decorator'
import { CallHandler, ConflictException, ExecutionContext, Injectable, NestInterceptor, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CacheService } from '@shared/redis/cache.service'
import { getIp } from '@utils/ip.util'
import { getRedisKey } from '@utils/redis.util'
import { hashString } from '@utils/tool.util'
import { FastifyRequest } from 'fastify'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { catchError, tap } from 'rxjs'
import { I18nTranslations } from 'src/generated/i18n.generated'

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
  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<FastifyRequest>()
    const i18n = I18nContext.current<I18nTranslations>(context)
    // skip Get 请求
    if (req.method.toUpperCase() === 'GET') return next.handle()

    const handler = context.getHandler()
    const options: IdempotenceOption | undefined = this.reflector.get(HTTP_IDEMPOTENCE_KEY, handler)

    if (!options) return next.handle()
    const { errorMessage = i18n.t('errorMsg.timeOutError'), pendingMessage = i18n.t('errorMsg.sameRequest'), handler: errorHandler, expired = 60, disableGenerateKey = false } = options

    const redis = this.cacheService.getClient()

    const idempotence = req.headers[IdempotenceHeaderKey] as string

    const key = disableGenerateKey ? undefined : options.generateKey ? options.generateKey(req) : this.generateKey(req)

    const idempotenceKey = !!(idempotence || key) && getRedisKey(`idempotence:${idempotence || key}`)

    SetMetadata(HTTP_IDEMPOTENCE_KEY, idempotenceKey)(handler)

    if (idempotenceKey) {
      const resVal: '0' | '1' | null = (await redis.get(idempotenceKey)) as any

      if (resVal !== null) {
        if (errorHandler) return await errorHandler(req)
        const msg = { 1: errorMessage, 0: pendingMessage }[resVal]
        throw new ConflictException(msg)
      } else {
        await redis.set(idempotenceKey, '0', 'EX', expired)
      }
    }
    return next.handle().pipe(
      tap(async () => {
        idempotenceKey && (await redis.set(idempotenceKey, '1', 'KEEPTTL'))
      }),
      catchError(async err => {
        if (idempotenceKey) await redis.del(idempotenceKey)

        throw err
      })
    )
  }
  private generateKey(req: FastifyRequest) {
    const { body, params, query = {}, headers, url } = req

    const obj = { body, url, params, query } as any

    const uuid = headers['x-uuid']
    if (uuid) {
      obj.uuid = uuid
    } else {
      const ua = headers['user-agent']
      const ip = getIp(req)

      if (!ua && !ip) return undefined

      Object.assign(obj, { ua, ip })
    }

    return hashString(JSON.stringify(obj))
  }
}
