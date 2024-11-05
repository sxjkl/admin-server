import { Injectable } from '@nestjs/common'
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DataSource, ObjectType, Repository } from 'typeorm'

interface Condition {
  entity: ObjectType<any>
  // 如果没有指定字段则使用当前验证的属性作为查询依据
  alias?: string
}

/**
 * 查询某个字段的值是否在数据表中存在
 */
@ValidatorConstraint({ name: 'entityExist', async: true })
@Injectable()
export class EntityExistConstraint implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  async validate(value: string, args?: ValidationArguments): Promise<boolean> {
    let repo: Repository<any>

    if (!value) return true
    let field = 'id'
    if ('entity' in args.constraints[0]) {
      field = args.constraints[0].alias ?? 'id'
      repo = this.dataSource.getRepository(args.constraints[0].entity)
    } else {
      repo = this.dataSource.getRepository(args.constraints[0])
    }
    const res = await repo.findOne({ where: { [field]: value } })
    return !!res
  }

  defaultMessage(args: ValidationArguments) {
    if (!args.constraints[0]) return 'Model not been specified!'

    return `All instance of ${args.constraints[0].name} must been exists in database!`
  }
}
/**
 * 数据存在性验证
 * @param entity Entity类或验证条件对象
 * @param validationOptions
 */
function IsEntityExist(entity: ObjectType<any>, validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void

function IsEntityExist(condition: { entity: ObjectType<any>; field?: string }, validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void

function IsEntityExist(condition: ObjectType<any> | { entity: ObjectType<any>; field?: string }, validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [condition],
      validator: EntityExistConstraint
    })
  }
}

export { IsEntityExist }
