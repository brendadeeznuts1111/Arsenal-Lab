// backend/src/utils/production-logger.ts
// Production logging system for Arsenal Lab Backend

interface LogContext {
  [key: string]: any;
}

class ProductionLogger {
  private level: string;
  private isDevelopment: boolean;

  constructor() {
    this.level = process.env.LOG_LEVEL || 'info';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const baseMessage = {
      timestamp,
      level: level.toUpperCase(),
      service: 'build-arsenal',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      message,
      ...context
    };

    if (this.isDevelopment) {
      const colors = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[36m',  // Cyan
        debug: '\x1b[35m', // Magenta
        reset: '\x1b[0m'
      };

      return `${colors[level as keyof typeof colors]}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}${context ? ' ' + JSON.stringify(context, null, 2) : ''}`;
    }

    return JSON.stringify(baseMessage);
  }

  private redactSensitiveData(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    const sensitive = ['password', 'token', 'apikey', 'secret', 'key', 'auth'];
    const result = { ...obj };

    for (const [key, value] of Object.entries(result)) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        result[key] = this.redactSensitiveData(value);
      }
    }

    return result;
  }

  error(message: string, context?: LogContext) {
    if (this.shouldLog('error')) {
      const redactedContext = this.redactSensitiveData(context);
      console.error(this.formatMessage('error', message, redactedContext));
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      const redactedContext = this.redactSensitiveData(context);
      console.warn(this.formatMessage('warn', message, redactedContext));
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      const redactedContext = this.redactSensitiveData(context);
      console.info(this.formatMessage('info', message, redactedContext));
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      const redactedContext = this.redactSensitiveData(context);
      console.debug(this.formatMessage('debug', message, redactedContext));
    }
  }

  // Specialized logging methods
  request(method: string, path: string, status: number, duration: number, userId?: string) {
    const context = {
      method,
      path,
      status,
      duration: `${duration.toFixed(2)}ms`,
      userId
    };

    if (status >= 400) {
      this.warn(`API Request: ${method} ${path} ${status}`, context);
    } else {
      this.info(`API Request: ${method} ${path} ${status}`, context);
    }
  }

  build(buildId: string, action: string, context?: LogContext) {
    this.info(`Build ${action}: ${buildId}`, {
      buildId,
      action,
      ...context
    });
  }

  security(event: string, context?: LogContext) {
    this.warn(`Security Event: ${event}`, {
      event,
      ...context
    });
  }

  performance(metric: string, value: number, unit: string, context?: LogContext) {
    this.info(`Performance: ${metric} = ${value}${unit}`, {
      metric,
      value,
      unit,
      ...context
    });
  }

  database(operation: string, table: string, duration: number, context?: LogContext) {
    this.debug(`Database: ${operation} on ${table}`, {
      operation,
      table,
      duration: `${duration.toFixed(2)}ms`,
      ...context
    });
  }

  // Structured logging for business events
  business(event: string, context?: LogContext) {
    this.info(`Business Event: ${event}`, {
      event,
      category: 'business',
      ...context
    });
  }

  // Error logging with stack traces
  exception(error: Error, context?: LogContext) {
    this.error(`Exception: ${error.message}`, {
      error: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    });
  }

  // Startup and shutdown events
  lifecycle(event: string, context?: LogContext) {
    this.info(`Lifecycle: ${event}`, {
      event,
      category: 'lifecycle',
      ...context
    });
  }
}

export const logger = new ProductionLogger();

// Production logging patterns
export const logPatterns = {
  buildStart: (buildId: string, userId?: string) =>
    logger.build(buildId, 'started', { userId }),

  buildComplete: (buildId: string, duration: number, status: string, userId?: string) =>
    logger.build(buildId, `completed (${status})`, { duration, status, userId }),

  buildFailed: (buildId: string, error: string, userId?: string) =>
    logger.build(buildId, 'failed', { error, userId }),

  apiRequest: (method: string, path: string, duration: number, status: number, userId?: string) =>
    logger.request(method, path, status, duration, userId),

  databaseQuery: (operation: string, table: string, duration: number) =>
    logger.database(operation, table, duration),

  securityEvent: (event: string, context?: LogContext) =>
    logger.security(event, context),

  performanceMetric: (metric: string, value: number, unit: string) =>
    logger.performance(metric, value, unit),

  businessEvent: (event: string, context?: LogContext) =>
    logger.business(event, context),

  error: (error: Error, context?: LogContext) =>
    logger.exception(error, context),

  startup: (context?: LogContext) =>
    logger.lifecycle('application_started', context),

  shutdown: (signal?: string) =>
    logger.lifecycle('application_shutdown', { signal }),

  healthCheck: (service: string, status: string, duration?: number) =>
    logger.info(`Health Check: ${service} = ${status}`, {
      service,
      status,
      duration,
      category: 'health'
    })
};

// Export logger instance for direct use
export { logPatterns };
export default logger;
