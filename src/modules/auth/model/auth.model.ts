import { ApiProperty } from '@nestjs/swagger'

export class ImageCaptcha {
  @ApiProperty({ description: 'base64格式的svg图片' })
  img: string

  @ApiProperty({ description: '验证码对应的唯一ID' })
  id: string
}

export class TokenInfo {
  @ApiProperty({ description: 'token' })
  accessToken: string
  @ApiProperty({ description: '刷新token' })
  refreshToken: string
}
