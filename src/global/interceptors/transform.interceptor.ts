import { BYPASS_KEY } from '@common/decorators/bypass.decorator'
import { ResOp } from '@common/model/resp.model'
import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { map, Observable } from 'rxjs'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const bypass = this.reflector.get<boolean>(BYPASS_KEY, context.getHandler())

    if (bypass) return next.handle()

    return next.handle().pipe(map(data => new ResOp(HttpStatus.OK, data ?? null)))
  }
}
