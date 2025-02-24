import GLib from 'gi://GLib';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

const envLevel = GLib.getenv('LOG_LEVEL')?.toLowerCase() || 'info';

function mapLogLevel(level: string): LogLevel {
    switch (level) {
        case 'debug':
            return LogLevel.DEBUG;
        case 'warn':
            return LogLevel.WARN;
        case 'error':
            return LogLevel.ERROR;
        case 'info':
        default:
            return LogLevel.INFO;
    }
}

export class Logger {
    prefix: string;
    level: LogLevel;

    constructor(prefix: string, level?: LogLevel) {
        this.prefix = prefix;
        this.level = level !== undefined ? level : mapLogLevel(envLevel);
    }

    private timestamp(): string {
        return new Date().toISOString();
    }

    debug(...args: unknown[]): void {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(`[${this.timestamp()}] [${this.prefix}] [DEBUG]`, ...args);
        }
    }

    info(...args: unknown[]): void {
        if (this.level <= LogLevel.INFO) {
            console.info(`[${this.timestamp()}] [${this.prefix}] [INFO]`, ...args);
        }
    }

    warn(...args: unknown[]): void {
        if (this.level <= LogLevel.WARN) {
            console.warn(`[${this.timestamp()}] [${this.prefix}] [WARN]`, ...args);
        }
    }

    error(...args: unknown[]): void {
        if (this.level <= LogLevel.ERROR) {
            console.error(`[${this.timestamp()}] [${this.prefix}] [ERROR]`, ...args);
        }
    }
}

// Factory function example:
export const createLogger = (prefix: string, level?: LogLevel): Logger => new Logger(prefix, level);
