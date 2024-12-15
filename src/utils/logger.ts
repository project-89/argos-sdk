/* eslint-disable @typescript-eslint/no-explicit-any */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogConfig {
  minLevel: LogLevel;
}

export class Logger {
  private logConfig: LogConfig;

  constructor(config?: boolean | LogConfig) {
    if (typeof config === 'boolean') {
      // Backward compatibility
      this.logConfig = {
        minLevel: config ? LogLevel.DEBUG : LogLevel.ERROR,
      };
    } else {
      this.logConfig = config || { minLevel: LogLevel.ERROR };
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logConfig.minLevel;
  }

  public debug(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[Argos] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[Argos] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[Argos] ${message}`, ...args);
    }
  }

  public error(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[Argos] ${message}`, ...args);
    }
  }
}
