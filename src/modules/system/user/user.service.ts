import { RegisterDto } from '@auth/dto/token.model'
import { ErrorEnum } from '@common/constants/error-code.constant'
import { UserEntity } from '@entities/index'
import { SysException } from '@global/exceptions/sys.exception'
import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { md5 } from '@utils/crypto.util'
import { randomValue } from '@utils/tool.util'
import { isEmpty } from 'lodash'
import { EntityManager, Repository } from 'typeorm'

@Injectable()
export class UserService {
  constructor() {}
  @InjectRepository(UserEntity)
  userRepository: Repository<UserEntity>

  @InjectEntityManager()
  private entityManager: EntityManager

  /**
   * 根据 username 获取用户信息
   */
  async getUserByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } })
    if (isEmpty(user)) throw new SysException(ErrorEnum.USER_NOT_FOUND)
    return user
  }
  // 注册
  async register({ username, password, ...data }: RegisterDto): Promise<void> {
    const exists = await this.userRepository.findOneBy({ username })

    if (!isEmpty(exists)) throw new SysException(ErrorEnum.USER_EXISTS)

    this.entityManager.transaction(async manager => {
      const salt = randomValue(32)

      const pwd = md5(`${password ?? 'jkl1009.'}${salt}`)

      const u = manager.create(UserEntity, {
        username,
        password: pwd,
        status: 1,
        pSalt: salt,
        ...data
      })

      const user = await manager.save(u)

      return user
    })
  }
}
