import { Module } from '@nestjs/common'
import { EntityExistConstraint } from './constraints/entity-exist.constraint'
import { UniqueConstraint } from './constraints/unique.constraint'
import { TypeOrmModule } from '@nestjs/typeorm'
import config from '@config/config'
import { TypeORMLogger } from './typeorm-logger'
import { DataSource } from 'typeorm'

const providers = [EntityExistConstraint, UniqueConstraint]

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const opts = config().database
        return {
          type: 'mysql',
          host: opts.host,
          port: opts.port,
          username: opts.username,
          password: opts.password,
          database: opts.database,
          synchronize: opts.synchronize,
          entities: ['dist/modules/**/*.entity{.ts,.js}'],
          migrations: ['dist/migrations/*{.ts,.js}'],
          subscribers: ['dist/modules/**/*.subscriber{.ts,.js}'],
          autoLoadEntities: true,
          logging: ['error'],
          logger: new TypeORMLogger(['error', 'info', 'log', 'query', 'warn'])
        }
      },
      dataSourceFactory: async opts => {
        return await new DataSource(opts).initialize()
      }
    })
  ],
  providers,
  exports: providers
})
export class DatabaseModule {}
