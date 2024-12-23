export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogConfig {
  minLevel: LogLevel;
  maxLogs?: number;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  category?: string;
  timestamp: number;
}

export class LogService {
  private logs: LogEntry[] = [];
  private minLevel: LogLevel;
  private maxLogs: number;

  constructor(config: LogConfig) {
    this.minLevel = config.minLevel;
    this.maxLogs = config.maxLogs || 1000;
  }

  private log(
    level: LogLevel,
    message: string,
    data?: any,
    category?: string
  ): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      data,
      category,
      timestamp: Date.now(),
    };

    this.logs.push(entry);

    // Trim logs if they exceed maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    const logMethod = this.getConsoleMethod(level);
    const prefix = category ? `[${category}] ` : '';

    if (data) {
      console[logMethod](prefix + message, data);
    } else {
      console[logMethod](prefix + message);
    }
  }

  private getConsoleMethod(
    level: LogLevel
  ): 'debug' | 'info' | 'warn' | 'error' {
    switch (level) {
      case LogLevel.DEBUG:
        return 'debug';
      case LogLevel.INFO:
        return 'info';
      case LogLevel.WARN:
        return 'warn';
      case LogLevel.ERROR:
        return 'error';
    }
  }

  debug(message: string, data?: any, category?: string): void {
    this.log(LogLevel.DEBUG, message, data, category);
  }

  info(message: string, data?: any, category?: string): void {
    this.log(LogLevel.INFO, message, data, category);
  }

  warn(message: string, data?: any, category?: string): void {
    this.log(LogLevel.WARN, message, data, category);
  }

  error(message: string, data?: any, category?: string): void {
    this.log(LogLevel.ERROR, message, data, category);
  }

  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filtered = this.logs;

    if (level !== undefined) {
      filtered = filtered.filter((log) => log.level >= level);
    }

    if (category) {
      filtered = filtered.filter((log) => log.category === category);
    }

    return filtered;
  }

  clearLogs(): void {
    this.logs = [];
  }
}
