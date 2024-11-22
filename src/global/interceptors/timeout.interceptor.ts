import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from '@nestjs/common'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { Observable, TimeoutError, throwError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'
import { I18nTranslations } from 'src/generated/i18n.generated'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly time: number = 10000) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const i18n = I18nContext.current<I18nTranslations>(context)

    return next.handle().pipe(
      timeout(this.time),
      catchError(err => {
        if (err instanceof TimeoutError) return throwError(new RequestTimeoutException(i18n.t('errorMsg.reqTimeoutError')))

        return throwError(err)
      })
    )
  }
}
