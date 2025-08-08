/**
 * Production-safe logging utility
 * Logs to console only in development, can be extended for production logging services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!this.isDevelopment && level === 'debug') {
      return; // Suppress debug logs in production
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(prefix, message, ...args);
        }
        break;
      case 'info':
        if (this.isDevelopment) {
          console.info(prefix, message, ...args);
        }
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        // In production, you might want to send this to a logging service
        // Example: LoggingService.warn(message, args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        // In production, you might want to send this to an error reporting service
        // Example: ErrorReporting.captureException(new Error(message));
        break;
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();
