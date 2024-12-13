/*
 * @Author: sxjkl1009
 * @Date: 2024-12-13 15:01:17
 * @LastEditTime: 2024-12-13 15:02:11
 * @Description: menuItemInfo
 */
import { ApiProperty } from '@nestjs/swagger'

import { MenuEntity } from '@entities/menu.entity'

export class MenuItemInfo extends MenuEntity {
  @ApiProperty({ type: [MenuItemInfo] })
  children: MenuItemInfo[]
}
