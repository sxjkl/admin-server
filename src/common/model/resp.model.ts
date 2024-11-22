import { RESPONSE_SUCCESS_CODE, RESPONSE_SUCCESS_MSG } from '@common/constants/response.constant'
import { ApiProperty } from '@nestjs/swagger'

export class ResOp<T = any> {
  @ApiProperty({ type: 'object', properties: {} })
  data?: T

  @ApiProperty({ type: 'number', default: RESPONSE_SUCCESS_CODE })
  code: number

  @ApiProperty({ type: 'string', default: RESPONSE_SUCCESS_MSG })
  message: string

  constructor(code: number, data: T, message = RESPONSE_SUCCESS_MSG) {
    this.code = code
    this.data = data
    this.message = message
  }

  static success<T = any>(data: T, message = RESPONSE_SUCCESS_MSG) {
    return new ResOp(RESPONSE_SUCCESS_CODE, data, message)
  }

  static fail<T = any>(code: number, data: T, message = '') {
    return new ResOp(code, data, message)
  }
}

export class TreeResult<T> {
  @ApiProperty()
  id: number

  @ApiProperty()
  parentId: number

  @ApiProperty()
  children?: TreeResult<T>[]
}
