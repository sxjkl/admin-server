/*
 * @Author: sxjkl1009
 * @Date: 2024-12-13 16:26:22
 * @LastEditTime: 2024-12-13 16:26:30
 * @Description: allow anon decorator
 */

import { ALLOW_ANON_KEY } from '@auth/auth.constant'
import { SetMetadata } from '@nestjs/common'

/**
 * 当接口不需要检测用户是否具有操作权限时添加该装饰器
 */
export const AllowAnon = () => SetMetadata(ALLOW_ANON_KEY, true)
