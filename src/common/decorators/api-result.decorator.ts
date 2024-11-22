import { ResOp } from '@common/model/resp.model'
import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger'

const baseTypeNames = ['String', 'Number', 'Boolean']

const genBaseProp = (type: Type<any>) => {
  if (baseTypeNames.includes(type.name)) return { type: type.name.toLocaleLowerCase() }
  else return { $ref: getSchemaPath(type) }
}

/**
 * @description API 返回数据装饰器
 */
export const ApiResult = <TModel extends Type<any>>({ type, isPage, status }: { type?: TModel | TModel[]; isPage?: boolean; status?: number }) => {
  let prop = null
  if (Array.isArray(type)) {
    if (isPage) {
      prop = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $refs: getSchemaPath(type[0]) }
          },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'number', default: 0 },
              pageSize: { type: 'number', default: 0 },
              total: { type: 'number', default: 0 },
              perPage: { type: 'number', default: 0 },
              currentPage: { type: 'number', default: 0 }
            }
          }
        }
      }
    } else {
      prop = {
        type: 'array',
        items: genBaseProp(type[0])
      }
    }
  } else if (type) prop = genBaseProp(type)
  else prop = { type: 'null', default: null }
  const model = Array.isArray(type) ? type[0] : type

  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      schema: {
        allOf: [{ $ref: getSchemaPath(ResOp) }, { properties: { data: prop } }]
      }
    })
  )
}
