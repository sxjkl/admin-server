import { SysException } from '@global/exceptions/sys.exception'
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { I18nContext } from 'nestjs-i18n'
import { I18nTranslations } from '../../generated/i18n.generated'

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
    const i18n = I18nContext.current<I18nTranslations>(host)
    const url = req.raw.url!

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    let msg = ''
    if (exception instanceof SysException) {
      const filed = exception.ErrorMsg
      msg = i18n.t(filed as keyof I18nTranslations)
    } else {
      msg = i18n.t('errorMsg.systemError')
    }
    res.status(200).send({ code: exception instanceof SysException ? exception.ErrorCode : 500, msg, ret: -1 })
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
