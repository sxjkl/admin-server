import { MenuEntity } from '@entities/menu.entity'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RoleService } from '@system/role/role.service'
import Redis from 'ioredis'
import { In, IsNull, Like, Not, Repository } from 'typeorm'
import { MenuDto, MenuQueryDto, MenuUpdateDto } from './menu.dto'
import { generatorMenu, generatorRouters } from '@utils/permission.util'
import { concat, isEmpty, uniq } from 'lodash'
import { deleteEmptyChildren } from '@utils/list2tree.util'
import { SysException } from '@global/exceptions/sys.exception'
import { ErrorEnum } from '@common/constants/error-code.constant'

@Injectable()
export class MenuService {
  private readonly redis: Redis
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
    private roleService: RoleService
    // sse
  ) {
    this.redis = redisService.getOrThrow()
  }

  /**
   * 获取所有菜单及权限
   */
  async list({ name, path, permission, component, status }: MenuQueryDto): Promise<MenuEntity[]> {
    const menus = await this.menuRepository.find({
      where: {
        ...(name && { name: Like(`%${name}%`) }),
        ...(path && { path: Like(`%${path}%`) }),
        ...(permission && { permission: Like(`%${permission}%`) }),
        ...(component && { component: Like(`%${component}%`) }),
        ...(status && { status })
      },
      order: { orderNo: 'ASC' }
    })
    const menuList = generatorMenu(menus)
    if (!isEmpty(menuList)) {
      deleteEmptyChildren(menuList)
      return menuList
    }
    // 如果生产的树形结构为空，则返回原始菜单列表
    return menus
  }
  async create(menu: MenuDto): Promise<void> {
    const res = await this.menuRepository.save(menu)
    // sse发布更新
  }
  async update(id: number, menu: MenuUpdateDto): Promise<void> {
    await this.menuRepository.update({ id }, menu)
    // sse发布更新
  }

  /**
   * 根据角色获取所有菜单
   */
  async getMenus(uid: number) {
    const roleIds = await this.roleService.getRoleIdsByUser(uid)
    let menus: MenuEntity[] = []
    if (isEmpty(roleIds)) return generatorRouters([])
    if (this.roleService.hasAdminRole(roleIds)) {
      menus = await this.menuRepository.find({ order: { orderNo: 'ASC' } })
    } else {
      menus = await this.menuRepository.createQueryBuilder('menu').innerJoinAndSelect('menu.roles', 'role').andWhere('role.id IN (:...roleIds)', { roleIds }).orderBy('menu.orderNo', 'ASC').getMany()
    }
    return generatorRouters(menus)
  }

  /**
   * 检查菜单创建规则是否符合
   */
  async check(dto: Partial<MenuDto>): Promise<void | never> {
    // 无法直接创建权限，必须要有parent
    if (dto.type === 2 && !dto.parentId) throw new SysException(ErrorEnum.PERMISSION_REQUIRES_PARENT)
    if (dto.type == 1 && dto.parentId) {
      const parent = await this.getMenuItemInfo(dto.parentId)
      if (isEmpty(parent)) throw new SysException(ErrorEnum.PARENT_MENU_NOT_FOUND)
      // 当前新增为菜单但父节点也为菜单时为非法操作
      if (parent && parent.type === 1) throw new SysException(ErrorEnum.ILLEGAL_OPERATION_DIRECTORY_PARENT)
    }
  }

  /**
   * 查找当前菜单下的子菜单，目录以及菜单
   *
   * @param mid
   */
  async findChildMenus(mid: number) {
    const allMenus = []
    const menus = await this.menuRepository.findBy({ parentId: mid })

    for (const menu of menus) {
      if (menu.type !== 2) {
        const c = await this.findChildMenus(menu.id)
        allMenus.push(c)
      }
      allMenus.push(menu.id)
    }
    return allMenus
  }

  /**
   * 获取某个菜单的信息
   * @param mid menu id
   */
  async getMenuItemInfo(mid: number): Promise<MenuEntity> {
    const menu = await this.menuRepository.findOneBy({ id: mid })
    return menu
  }
  /**
   * 获取某个菜单以及关联的父菜单的信息
   */
  async getMenuItemAndParentInfo(mid: number) {
    const menus = await this.menuRepository.findOneBy({ id: mid })
    let parent: MenuEntity | undefined
    if (menus && menus.parentId) parent = await this.menuRepository.findOneBy({ id: menus.parentId })
    return { menus, parent }
  }
  /**
   * 查找节点路由是否存在
   */
  async findRouterExist(path: string): Promise<boolean> {
    return !isEmpty(await this.menuRepository.findOneBy({ path }))
  }

  /**
   * 获取当前用户的所有权限
   */
  async getPermissions(uid: number): Promise<string[]> {
    const roleIds = await this.roleService.getRoleIdsByUser(uid)
    let permissions = []
    let res = null
    if (this.roleService.hasAdminRole(roleIds)) res = await this.menuRepository.findBy({ permission: Not(IsNull()), type: In([1, 2]) })
    else {
      if (isEmpty(roleIds)) return permissions
      res = await this.menuRepository
        .createQueryBuilder('menu')
        .innerJoinAndSelect('menu.roles', 'role')
        .andWhere('role.id IN (:...roleIds)', { roleIds })
        .andWhere('menu.permission IS NOT NULL')
        .andWhere('menu.type IN (:...types)', { types: [1, 2] })
        .andWhere('menu.permission IS NOT NULL')
        .getMany()
    }
    if (!isEmpty(res)) {
      res.forEach(item => {
        if (item.permission) permissions = concat(permissions, item.permission.split(','))
      })
      permissions = uniq(permissions)
    }
    return permissions
  }

  // 删除多项菜单
  async deleteMenuItem(mids: number[]): Promise<void> {
    await this.menuRepository.delete(mids)
  }
}
