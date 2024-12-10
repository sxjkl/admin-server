import { AuthService } from '../auth.service'
import { AuthStrategy } from '../auth.constant'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

export class LocalStrategy extends PassportStrategy(Strategy, AuthStrategy.LOCAL) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password'
    })
  }
  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password)
    return user
  }
}
