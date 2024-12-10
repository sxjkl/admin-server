import { FastifyRequest } from 'fastify'
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger(LoggingInterceptor.name, { timestamp: false })

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const call$ = next.handle()
    const req = context.switchToHttp().getRequest<FastifyRequest>()
    const content = `${req.method} --> ${req.url}`
    const isSse = req.headers['accept'] === 'text/event-stream'
    this.logger.log(`--> 请求: ${content}`)
    const now = Date.now()

    return call$.pipe(
      tap(() => {
        if (isSse) return
        this.logger.log(`--> 响应: ${content}, 耗时: ${Date.now() - now}ms`)
      })
    )
  }
}
