import { applyDecorators } from '@nestjs/common'
import { ApiSecurity } from '@nestjs/swagger'

export const API_SECURITY_AUTH = 'auth'

export const ApiSecurityAuth = (): ClassDecorator & MethodDecorator => applyDecorators(ApiSecurity(API_SECURITY_AUTH))
