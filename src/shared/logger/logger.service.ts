import Config from '@config/config'
import { ConsoleLogger, ConsoleLoggerOptions, Injectable } from '@nestjs/common'
import { createLogger, format, transports, type Logger as WinstonLogger } from 'winston'
import { config } from 'winston'
import 'winston-daily-rotate-file'
import { ElasticsearchTransport } from 'winston-elasticsearch'
import { v4 as uuidV4 } from 'uuid'

export enum LogLevel {
  error = 'error',
  warn = 'warn',
  info = 'info',
  debug = 'debug',
  verbose = 'verbose'
}

@Injectable()
export class LoggerService extends ConsoleLogger {
  private winstonLogger: WinstonLogger

  constructor(context: string, opts: ConsoleLoggerOptions) {
    super(context, opts)
    this.initWinston()
  }

  protected get level(): LogLevel {
    return Config().logger.level as LogLevel
  }

  protected get maxFiles(): number {
    return Config().logger.maxFiles
  }
  protected initWinston(): void {
    const spanTracerId = uuidV4()
    const indexPrefix = 'nest-admin-' + process.env.NODE_ENV
    const elasticTransport = (spanTracerId, indexPrefix) => {
      const esTransport = {
        level: this.level,
        indexPrefix,
        indexSuffixPattern: 'YYYY-MM-DD',
        transformer: log => {
          const spanId = spanTracerId
          return {
            '@timestamp': new Date().toLocaleDateString(),
            severity: log.level,
            stack: log.meta.stack,
            service_name: 'nest-admin',
            service_version: '1.0.0',
            message: `${log.message}`,
            data: JSON.stringify(log.meta.data),
            span_id: spanId,
            utcTimestamp: log.timestamp
          }
        },
        clientOpts: {
          node: 'http://154.201.71.246:9200',
          maxRetries: 5,
          requestTimeout: 10000,
          sniffOnStart: false
        }
      }
      return esTransport
    }
    this.winstonLogger = createLogger({
      levels: config.npm.levels,
      format: format.combine(format.errors({ stack: true }), format.timestamp(), format.json()),
      transports: [
        new transports.DailyRotateFile({
          level: this.level,
          filename: 'logs/app.%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: this.maxFiles,
          format: format.combine(format.timestamp(), format.json()),
          auditFile: 'logs/.audit/app.json'
        }),
        new transports.DailyRotateFile({
          level: LogLevel.error,
          filename: 'logs/app-error.%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: this.maxFiles,
          format: format.combine(format.timestamp(), format.json()),
          auditFile: 'logs/.audit/app-error.json'
        }),
        new ElasticsearchTransport({
          ...elasticTransport(spanTracerId, indexPrefix)
        })
      ]
    })
  }

  verbose(message: any, context?: string): void {
    super.verbose.apply(this, [message, context])

    this.winstonLogger.log(LogLevel.verbose, message, { context })
  }

  debug(message: any, context?: string): void {
    super.debug.apply(this, [message, context])

    this.winstonLogger.log(LogLevel.debug, message, { context })
  }

  log(message: any, context?: string): void {
    super.log.apply(this, [message, context])

    this.winstonLogger.log(LogLevel.info, message, { context })
  }

  warn(message: any, context?: string): void {
    super.warn.apply(this, [message, context])

    this.winstonLogger.log(LogLevel.warn, message)
  }

  error(message: any, stack?: string, context?: string): void {
    super.error.apply(this, [message, stack, context])

    const hasStack = !!context
    this.winstonLogger.log(LogLevel.error, {
      context: hasStack ? context : stack,
      message: hasStack ? new Error(message) : message
    })
  }
}
