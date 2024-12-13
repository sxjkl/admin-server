import { AuthService } from '@auth/auth.service'
import { AllowAnon } from '@auth/decorators/allow-anon.decorator'
import { AuthUser } from '@auth/decorators/auth-user.decorator'
import { AccountMenus } from '@auth/model/account.model'
import { ApiResult } from '@common/decorators/api-result.decorator'
import { ApiSecurityAuth } from '@common/decorators/swagger.decorator'
import { JwtAuthGuard } from '@global/guard/jwt-auth.guard'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AccountInfo } from '@system/user/user.model'
import { UserService } from '@system/user/user.service'

@ApiTags('Account - 账户模块')
@ApiSecurityAuth()
@ApiExtraModels(AccountInfo)
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  @Get('profile')
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResult({ type: AccountInfo })
  @AllowAnon()
  async profile(@AuthUser() user: IAuthUser): Promise<AccountInfo> {
    return this.userService.getAccountInfo(user.uid)
  }
  @Get('menus')
  @ApiOperation({ summary: '获取菜单列表' })
  @ApiResult({ type: [AccountMenus] })
  @AllowAnon()
  async menu(@AuthUser() user: IAuthUser) {
    return this.authService.getPermissions(user.uid)
  }

  @Get('permissions')
  @ApiOperation({ summary: '获取权限列表' })
  @ApiResult({ type: [String] })
  @AllowAnon()
  async permissions(@AuthUser() user: IAuthUser): Promise<string[]> {
    return this.authService.getPermissions(user.uid)
  }
}
