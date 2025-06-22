
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  error(message: string, data?: any): void {
    if (this.isDevelopment || LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  log(level: keyof LogLevel, message: string, data?: any): void {
    switch (level) {
      case 'ERROR':
        this.error(message, data);
        break;
      case 'WARN':
        this.warn(message, data);
        break;
      case 'INFO':
        this.info(message, data);
        break;
      case 'DEBUG':
        this.debug(message, data);
        break;
      default:
        this.info(message, data);
    }
  }
}

const logger = new Logger();
export default logger;
