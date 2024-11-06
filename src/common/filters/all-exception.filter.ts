import { SysException } from '@common/exceptions/sys.exception'
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { I18nContext } from 'nestjs-i18n'

interface myError {
  readonly status: number
  readonly statusCode?: number

  readonly message?: string
}
@Catch()
export class AllExceptionFilter implements ExceptionFilter<Error> {
  private readonly logger = new Logger(AllExceptionFilter.name)

  constructor() {
    this.registerCatchAllExceptionsHook()
  }

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const req = ctx.getRequest<FastifyRequest>()
    const res = ctx.getResponse<FastifyReply>()
    const i18n = I18nContext.current(host)
    const url = req.raw.url!

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    if (exception instanceof SysException) {
      const filed = exception.ErrorMsg
    }
  }

  registerCatchAllExceptionsHook() {
    process.on('unhandledRejection', reason => {
      console.error('unhandledRejection: ', reason)
    })

    process.on('uncaughtException', err => {
      console.error('uncaughtException: ', err)
    })
  }
}
