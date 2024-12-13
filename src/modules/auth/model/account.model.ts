import { MenuEntity } from '@entities/menu.entity'
import { OmitType, PartialType, PickType } from '@nestjs/swagger'

/*
 * @Author: sxjkl1009
 * @Date: 2024-12-13 16:29:52
 * @LastEditTime: 2024-12-13 16:29:58
 * @Description: account model
 */
export class MenuMeta extends PartialType(OmitType(MenuEntity, ['parentId', 'createdAt', 'updatedAt', 'id', 'roles', 'path', 'name'] as const)) {
  title: string
}
export class AccountMenus extends PickType(MenuEntity, ['id', 'path', 'name', 'component'] as const) {
  meta: MenuMeta
}
