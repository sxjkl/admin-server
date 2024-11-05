import type { RedisKeys } from '@common/constants/cache.constant'

type Prefix = 'nest-shop'
const prefix = 'nest-shop'

export function getRedisKey<T extends string = RedisKeys | '*'>(key: T, ...concatKeys: string[]): `${Prefix}:${T}${string | ''}` {
  return `${prefix}:${key}${concatKeys && concatKeys.length ? `:${concatKeys.join('_')}` : ''}`
}
