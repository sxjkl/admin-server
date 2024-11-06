import { ErrorEnum } from '@common/constants/error-code.constant'
import { RESPONSE_SUCCESS_CODE } from '@common/constants/response.constant'
import { HttpException, HttpStatus } from '@nestjs/common'

export class SysException extends HttpException {
  private errorCode: number
  private errorMsg: string
  constructor(err: ErrorEnum | string) {
    // 如果不是自定义异常
    if (!err.includes(':')) {
      super(
        HttpException.createBody({
          code: RESPONSE_SUCCESS_CODE,
          message: err
        }),
        HttpStatus.OK
      )
      this.errorCode = RESPONSE_SUCCESS_CODE
      this.errorMsg = err
      return
    }
    const [code, field] = err.split(':')
    super(
      HttpException.createBody({
        code,
        message: field
      }),
      HttpStatus.OK
    )
    this.errorCode = Number(code)
    this.errorMsg = field
  }

  get ErrorCode() {
    return this.errorCode
  }
  get ErrorMsg() {
    return this.errorMsg
  }
}
