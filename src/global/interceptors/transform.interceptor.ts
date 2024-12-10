import { BYPASS_KEY } from '@common/decorators/bypass.decorator'
import { ResOp } from '@common/model/resp.model'
import { CallHandler, ExecutionContext, HttpStatus, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { FastifyRequest } from 'fastify'
import { map } from 'rxjs/operators'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  private logger = new Logger(TransformInterceptor.name, { timestamp: false })
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const bypass = this.reflector.get<boolean>(BYPASS_KEY, context.getHandler())

    const req = context.switchToHttp().getRequest<FastifyRequest>()
    const content = `${req.method} --> ${req.url}`
    if (bypass) return next.handle()

    return next.handle().pipe(
      map(data => {
        this.logger.log(`--> 请求: ${content} --> 响应数据： ${JSON.stringify(data)}`)
        return new ResOp(HttpStatus.OK, data ?? null)
      })
    )
  }
}
