import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class EmailSendDto {
  @ApiProperty({ description: '收件人邮箱' })
  @IsEmail()
  to: string

  @ApiProperty({ description: '标题' })
  @IsString()
  subject: string

  @ApiProperty({ description: '内容' })
  @IsString()
  content: string
}
