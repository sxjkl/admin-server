import { PUBLIC_KEY } from '@auth/auth.constant'
import { SetMetadata } from '@nestjs/common'

export const Public = () => SetMetadata(PUBLIC_KEY, true)
