// backend/src/middleware/production.middleware.ts
// Production middleware for Arsenal Lab Backend

import { metrics, logPatterns } from '../monitoring/production-monitor.js';

export class ProductionMiddleware {
  static requestLogger() {
    return async (c: any, next: any) => {
      const start = performance.now();
      const requestId = crypto.randomUUID();

      // Add request ID to context
      c.set('requestId', requestId);
      c.set('startTime', start);

      // Extract request details
      const method = c.req.method;
      const path = c.req.path;
      const userAgent = c.req.header('User-Agent') || '';
      const ip = c.req.header('CF-Connecting-IP') ||
                 c.req.header('X-Forwarded-For') ||
                 c.req.header('X-Real-IP') ||
                 'unknown';

      // Log incoming request
      logPatterns.businessEvent('api_request_started', {
        method,
        path,
        requestId,
        ip,
        userAgent: userAgent.substring(0, 100) // Truncate long user agents
      });

      await next();

      // Calculate response time
      const duration = performance.now() - start;
      const status = c.res.status;

      // Record metrics
      metrics.apiLatency.observe(duration / 1000);

      if (status >= 400) {
        metrics.errorRate.inc();
      }

      // Log response
      logPatterns.apiRequest(method, path, duration, status);

      // Add performance headers
      c.header('X-Response-Time', `${duration.toFixed(2)}ms`);
      c.header('X-Request-ID', requestId);
      c.header('X-API-Version', '2.0.0');
      c.header('X-Powered-By', 'Arsenal Lab Backend');
    };
  }

  static securityHeaders() {
    return async (c: any, next: any) => {
      // Enhanced security headers for production
      c.header('X-Content-Type-Options', 'nosniff');
      c.header('X-Frame-Options', 'DENY');
      c.header('X-XSS-Protection', '1; mode=block');
      c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
      c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

      // Strict CSP for API
      c.header('Content-Security-Policy',
        "default-src 'none'; " +
        "frame-ancestors 'none';"
      );

      // HSTS for HTTPS enforcement
      if (process.env.NODE_ENV === 'production') {
        c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }

      await next();
    };
  }

  static rateLimit() {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return async (c: any, next: any) => {
      const ip = c.req.header('CF-Connecting-IP') ||
                 c.req.header('X-Forwarded-For') ||
                 c.req.header('X-Real-IP') ||
                 'unknown';

      const now = Date.now();
      const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
      const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '1000');

      // Get or create request record for this IP
      let record = requests.get(ip);
      if (!record || now > record.resetTime) {
        record = { count: 0, resetTime: now + windowMs };
        requests.set(ip, record);
      }

      record.count++;

      // Check if limit exceeded
      if (record.count > maxRequests) {
        logPatterns.securityEvent('rate_limit_exceeded', { ip, count: record.count });
        return c.json({ error: 'Rate limit exceeded' }, 429, {
          'Retry-After': Math.ceil((record.resetTime - now) / 1000)
        });
      }

      // Add rate limit headers
      const remaining = Math.max(0, maxRequests - record.count);
      const reset = Math.ceil((record.resetTime - now) / 1000);

      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', remaining.toString());
      c.header('X-RateLimit-Reset', reset.toString());

      await next();
    };
  }

  static cors() {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    return async (c: any, next: any) => {
      const origin = c.req.header('Origin');

      // Check if origin is allowed
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        c.header('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
      }

      c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Request-ID');
      c.header('Access-Control-Allow-Credentials', 'true');
      c.header('Access-Control-Max-Age', '86400'); // 24 hours

      // Handle preflight requests
      if (c.req.method === 'OPTIONS') {
        return c.text('', 200);
      }

      await next();
    };
  }

  static compression() {
    return async (c: any, next: any) => {
      const acceptEncoding = c.req.header('Accept-Encoding') || '';

      // Check if client supports gzip
      if (acceptEncoding.includes('gzip')) {
        c.header('Content-Encoding', 'gzip');
        // Note: In a real implementation, you'd compress the response here
        // For now, we'll just set the header
      }

      await next();
    };
  }

  static errorHandler() {
    return async (c: any, next: any) => {
      try {
        await next();
      } catch (error) {
        const requestId = c.get('requestId') || 'unknown';

        // Log the error
        logPatterns.error(error as Error, {
          requestId,
          method: c.req.method,
          path: c.req.path,
          userAgent: c.req.header('User-Agent'),
          ip: c.req.header('CF-Connecting-IP') ||
              c.req.header('X-Forwarded-For') ||
              c.req.header('X-Real-IP')
        });

        // Return appropriate error response
        if (process.env.NODE_ENV === 'development') {
          return c.json({
            error: 'Internal Server Error',
            message: error.message,
            requestId,
            stack: error.stack
          }, 500);
        } else {
          return c.json({
            error: 'Internal Server Error',
            requestId
          }, 500);
        }
      }
    };
  }

  static healthCheck() {
    return async (c: any, next: any) => {
      if (c.req.path === '/health') {
        try {
          // Run health checks
          const { healthCheckRunner } = await import('../monitoring/production-monitor.js');
          const results = await healthCheckRunner.runAll();

          const isHealthy = Object.values(results).every((result: any) =>
            result.status === 'healthy'
          );

          const response = {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            environment: process.env.NODE_ENV || 'development',
            checks: results
          };

          return c.json(response, isHealthy ? 200 : 503);
        } catch (error) {
          return c.json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
          }, 503);
        }
      }

      await next();
    };
  }

  static gracefulShutdown() {
    let isShuttingDown = false;

    return (server: any) => {
      const shutdown = async (signal: string) => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        logPatterns.shutdown(signal);

        try {
          // Stop accepting new connections
          if (server.stop) {
            server.stop();
          }

          // Close database connections
          // Note: In a real implementation, close your database connections here

          // Close any open connections
          // Note: Close websockets, cache connections, etc.

          logPatterns.businessEvent('graceful_shutdown_completed');
          process.exit(0);
        } catch (error) {
          logPatterns.error(error as Error, { context: 'graceful_shutdown' });
          process.exit(1);
        }
      };

      // Register shutdown handlers
      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('uncaughtException', (error) => {
        logPatterns.error(error, { context: 'uncaught_exception' });
        shutdown('uncaughtException');
      });
      process.on('unhandledRejection', (reason, promise) => {
        logPatterns.error(new Error(String(reason)), { context: 'unhandled_rejection', promise: String(promise) });
        shutdown('unhandledRejection');
      });
    };
  }

  static maintenanceMode() {
    const isMaintenance = process.env.MAINTENANCE_MODE === 'true';

    return async (c: any, next: any) => {
      if (isMaintenance && c.req.path !== '/health') {
        return c.json({
          error: 'Service Under Maintenance',
          message: 'The service is currently under maintenance. Please try again later.',
          estimatedDowntime: process.env.MAINTENANCE_DURATION || 'Unknown'
        }, 503, {
          'Retry-After': '3600' // 1 hour
        });
      }

      await next();
    };
  }

  static apiVersioning() {
    return async (c: any, next: any) => {
      const acceptHeader = c.req.header('Accept') || '';
      const apiVersion = acceptHeader.match(/application\/vnd\.arsenal\.v(\d+)\+json/)?.[1] || '2';

      c.set('apiVersion', apiVersion);
      c.header('X-API-Version', apiVersion);

      await next();
    };
  }

  static requestId() {
    return async (c: any, next: any) => {
      const requestId = c.req.header('X-Request-ID') || crypto.randomUUID();
      c.set('requestId', requestId);
      c.header('X-Request-ID', requestId);

      await next();
    };
  }
}

// Export middleware factory functions
export const productionMiddleware = {
  requestLogger: ProductionMiddleware.requestLogger,
  securityHeaders: ProductionMiddleware.securityHeaders,
  rateLimit: ProductionMiddleware.rateLimit,
  cors: ProductionMiddleware.cors,
  compression: ProductionMiddleware.compression,
  errorHandler: ProductionMiddleware.errorHandler,
  healthCheck: ProductionMiddleware.healthCheck,
  gracefulShutdown: ProductionMiddleware.gracefulShutdown,
  maintenanceMode: ProductionMiddleware.maintenanceMode,
  apiVersioning: ProductionMiddleware.apiVersioning,
  requestId: ProductionMiddleware.requestId
};

export default productionMiddleware;
