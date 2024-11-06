import { Injectable } from '@nestjs/common'
import { ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator'
import { isNil, merge } from 'lodash'
import { DataSource, ObjectType } from 'typeorm'

interface Condition {
  entity: ObjectType<any>
  field?: string
}

/**
 * 验证某个字段的唯一性
 */

@ValidatorConstraint({ name: 'NestJsUnique', async: true })
@Injectable()
export class UniqueConstraint implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const config: Omit<Condition, 'entity'> = {
      field: args.property
    }
    const condition = ('entity' in args.constraints[0] ? merge(config, args.constraints[0]) : { ...config, entity: args.constraints[0] }) as unknown as Required<Condition>
    if (!condition.entity) return false
    try {
      const repo = this.dataSource.getRepository(condition.entity)
      return isNil(await repo.findOne({ where: { [condition.field]: value } }))
    } catch (error) {
      return false
    }
  }

  defaultMessage(args?: ValidationArguments): string {
    const { entity, property } = args.constraints[0]
    const queryProperty = property ?? args.property
    if (!(args.object as any).getManager()) return 'getManager function not been found!'
    if (!entity) return `Model not been specified!`
    return `${queryProperty} of ${entity.name} must been unique!`
  }
}

/**
 * 数据唯一性验证
 * @param entity Entity类或验证条件对象
 * @param opts
 */
function IsUnique(entity: ObjectType<any>, opts?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void
function IsUnique(condition: Condition, opts?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void
function IsUnique(params: ObjectType<any> | Condition, opts?: ValidationOptions) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: opts,
      constraints: [params],
      validator: UniqueConstraint
    })
  }
}

export { IsUnique }
