import { AuthStrategy } from '@auth/auth.constant'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

@Injectable()
export class LocalGuard extends AuthGuard(AuthStrategy.LOCAL) {
  async canActivate(context: ExecutionContext) {
    return true
  }
}
