import { FastifyReply, FastifyRequest } from 'fastify'
import { Public } from '@common/decorators/public.decorator'
import { LocalGuard } from '@global/guard/local.guard'
import { Body, Controller, Ip, UseGuards, Headers, Response, Post, Request } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { UserService } from '@system/user/user.service'
import { LoginDto, RegisterDto } from './dto/token.model'
import { CaptchaService } from './service/captcha.service'
import { TokenInfo } from './model/auth.model'
import { ApiResult } from '@common/decorators/api-result.decorator'
import { TokenService } from './service/token.service'

@ApiTags('Auth - 登录模块')
@Public()
@UseGuards(LocalGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly captchaService: CaptchaService,
    private readonly userService: UserService
  ) {}

  @Post('login')
  @ApiOperation({ summary: '登录' })
  @ApiResult({ type: TokenInfo })
  async login(@Body() dto: LoginDto, @Ip() ip: string, @Headers('user-agent') ua: string): Promise<TokenInfo> {
    await this.captchaService.checkImgCaptcha(dto.captchaId, dto.verifyCode)
    const token = await this.authService.login(dto.username, dto.password, ip, ua)
    // 把 token 和 refreshToken 种入cookie中
    // resp.setCookie('refreshToken', token.accessToken, {
    //   httpOnly: true,
    //   secure: true
    // })
    return token
  }

  @Post('refresh/token')
  @ApiOperation({ summary: '刷新token' })
  @ApiResult({ type: TokenInfo })
  async refreshToken(@Request() req: FastifyRequest): Promise<TokenInfo> {
    const refreshToken = req.cookies['refreshToken']
    return this.tokenService.refreshToken(refreshToken)
  }

  @Post('register')
  @ApiOperation({ summary: '注册' })
  async register(@Body() dto: RegisterDto): Promise<void> {
    await this.userService.register(dto)
  }
}
