import { RoleEntity } from '@entities/role.entity'
import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class RoleService {
  constructor() {}

  @InjectRepository(RoleEntity)
  private readonly roleRepository: Repository<RoleEntity>
}
