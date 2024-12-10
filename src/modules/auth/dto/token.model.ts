import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, isEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator'

export class LoginDto {
  @ApiProperty({ description: '手机号/邮箱' })
  @IsString()
  @MinLength(4)
  username: string

  @ApiProperty({ description: '密码', example: 'a123456' })
  @IsString()
  @Matches(/^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Za-z])\S*$/)
  @MinLength(6)
  password: string

  @ApiProperty({ description: '验证码标识' })
  @IsString()
  captchaId: string

  @ApiProperty({ description: '用户输入的验证码' })
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  verifyCode: string
}

export class RegisterDto {
  @ApiProperty({ description: '账号' })
  @IsString()
  username: string

  @ApiProperty({ description: '密码' })
  @IsString()
  @Matches(/^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Za-z])\S*$/)
  @MinLength(6)
  @MaxLength(16)
  password: string

  @ApiProperty({ description: '呢称', example: 'admin' })
  @IsOptional()
  @IsString()
  nickname: string

  @ApiProperty({ description: '邮箱', example: 'bqy.dev@qq.com' })
  @IsEmail()
  @ValidateIf(o => !isEmpty(o.email))
  email: string

  @ApiProperty({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ description: 'QQ' })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9][0-9]{4,10}$/)
  @MinLength(5)
  @MaxLength(11)
  qq?: string

  @ApiProperty({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string

  @ApiProperty({ description: '头像' })
  @IsOptional()
  @IsString()
  avatar?: string
}
