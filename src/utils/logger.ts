/**
 * Log levels definition
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
} as const

export type LogLevel = typeof LogLevel[keyof typeof LogLevel]

/**
 * Configuration interface for Logger
 */
interface LoggerConfig {
  level: LogLevel
  enabled: boolean
}

class Logger {
  private config: LoggerConfig

  constructor() {
    // В режиме разработки показываем все, в продакшене - только ошибки и предупреждения
    const isDev = import.meta.env.DEV
    
    this.config = {
      level: isDev ? LogLevel.DEBUG : LogLevel.WARN,
      enabled: true,
    }
  }

  public debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug('[DEBUG]', message, ...args)
    }
  }

  public info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info('[INFO]', message, ...args)
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn('[WARN]', message, ...args)
    }
  }

  public error(message: string, error?: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error('[ERROR]', message, error, ...args)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && level >= this.config.level
  }
}

export const logger = new Logger()
export default logger
