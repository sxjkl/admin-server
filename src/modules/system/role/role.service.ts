import { Injectable } from '@nestjs/common'
import { EntityManager, In, Repository } from 'typeorm'
import { RoleEntity } from '@entities/role.entity'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { isEmpty } from 'lodash'

@Injectable()
export class RoleService {
  constructor() {}

  @InjectRepository(RoleEntity)
  private readonly roleRepository: Repository<RoleEntity>
  @InjectEntityManager()
  private readonly entityManager: EntityManager

  async getRoleIdsByUser(id: number): Promise<number[]> {
    const roles = await this.roleRepository.find({
      where: {
        users: { id }
      }
    })
    if (!isEmpty(roles)) return roles.map(r => r.id)
    return []
  }
  async getRoleValues(ids: number[]): Promise<string[]> {
    return (await this.roleRepository.findBy({ id: In(ids) })).map(r => r.value)
  }
}
