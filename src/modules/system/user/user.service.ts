import { RoleEntity } from '@entities/role.entity'
import { UserEntity } from '@entities/user.entity'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { QQService } from '@shared/helper/qq.service'
import Redis from 'ioredis'
import { EntityManager, Repository } from 'typeorm'
import { UserStatus } from './constant'
import { AccountInfo } from './user.model'
import { isEmpty } from 'lodash'
import { SysException } from '@global/exceptions/sys.exception'
import { ErrorEnum } from '@common/constants/error-code.constant'
@Injectable()
export class UserService {
  private readonly redis: Redis | null
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly qqService: QQService
  ) {
    this.redis = this.redisService.getOrThrow()
  }
  async findUserByUserName(username: string): Promise<UserEntity | undefined> {
    return this.userRepository
      .createQueryBuilder('user')
      .where({
        username,
        status: UserStatus.Enabled
      })
      .getOne()
  }
}
