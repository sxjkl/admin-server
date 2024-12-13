/*
 * @Author: sxjkl1009
 * @Date: 2024-11-26 10:50:31
 * @LastEditTime: 2024-12-13 18:07:45
 * @Description: auth module
 */
import Config from '@config/config'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@system/user/user.module'
import { AccessTokenEntity } from '@entities/access-token.entity'
import { RefreshTokenEntity } from '@entities/refresh-token.entity'
import { LogModule } from '@system/logs/log.module'
import { RoleModule } from '@system/role/role.module'
import { AuthService } from './auth.service'
import { TokenService } from './service/token.service'
import { CaptchaService } from './service/captcha.service'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { CaptchaController } from './controller/captcha.controller'
import { PassportModule } from '@nestjs/passport'
import { isDev } from '@utils/env.util'
import { MenuModule } from '@system/menu/menu.module'
import { AccountController } from './controller/account.controller'

const providers = [AuthService, TokenService, CaptchaService]
const strategies = [LocalStrategy, JwtStrategy]
const controllers = [AuthController, CaptchaController, AccountController]
const config = Config()
@Module({
  imports: [
    TypeOrmModule.forFeature([AccessTokenEntity, RefreshTokenEntity]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: config.jwt.secret,
          signOptions: {
            expiresIn: `${config.jwt.expiresIn}s`
          },
          ignoreExpiration: isDev
        }
      }
    }),
    UserModule,
    RoleModule,
    LogModule,
    MenuModule
  ],
  controllers,
  providers: [...providers, ...strategies],
  exports: [TypeOrmModule, JwtModule, ...providers, ...strategies]
})
export class AuthModule {}
