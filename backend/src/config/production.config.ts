// backend/src/config/production.config.ts
// Production configuration for Arsenal Lab Backend

export const productionConfig = {
  // Production-critical settings
  server: {
    port: parseInt(process.env.PORT || '3001'),
    host: process.env.HOST || '0.0.0.0',
    maxConnections: parseInt(process.env.MAX_CONNECTIONS || '1000'),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
    keepAliveTimeout: parseInt(process.env.KEEP_ALIVE_TIMEOUT || '5000'),
    maxRequestSize: parseInt(process.env.MAX_REQUEST_SIZE || '10485760'), // 10MB
  },

  // Database production settings
  database: {
    url: process.env.DATABASE_URL!,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      min: parseInt(process.env.DB_POOL_MIN || '5'),
      acquire: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
      idle: parseInt(process.env.DB_IDLE_TIMEOUT || '10000'),
      evict: parseInt(process.env.DB_EVICT_INTERVAL || '60000'),
    },
    connection: {
      timeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
      retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
    },
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      ca: process.env.DB_SSL_CA,
      cert: process.env.DB_SSL_CERT,
      key: process.env.DB_SSL_KEY
    } : false
  },

  // Production security settings
  security: {
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || '1000'), // 1000 requests per window
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL === 'true',
      skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'false',
      headers: true,
      draft_polli_ratelimit_headers: true
    },

    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
      exposedHeaders: ['Content-Length', 'X-Response-Time', 'X-Request-ID']
    },

    helmet: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:", "wss:"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      permittedCrossDomainPolicies: false,
      expectCt: {
        maxAge: 86400,
        enforce: true
      }
    },

    jwt: {
      secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: process.env.JWT_ISSUER || 'arsenal-lab-backend',
      audience: process.env.JWT_AUDIENCE || 'arsenal-lab-frontend'
    }
  },

  // Production monitoring
  monitoring: {
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      port: parseInt(process.env.METRICS_PORT || '9090'),
      path: process.env.METRICS_PATH || '/metrics'
    },

    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
      path: process.env.HEALTH_CHECK_PATH || '/health',
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000')
    },

    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json',
      redact: ['*.password', '*.token', '*.apiKey', '*.secret', '*.key'],
      enableColors: process.env.LOG_COLORS === 'true',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || '5'
    }
  },

  // Production storage settings
  storage: {
    retention: {
      artifacts: parseInt(process.env.ARTIFACT_RETENTION_DAYS || '30'),
      logs: parseInt(process.env.LOG_RETENTION_DAYS || '7'),
      analytics: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90')
    },

    compression: {
      enabled: process.env.STORAGE_COMPRESSION !== 'false',
      level: parseInt(process.env.STORAGE_COMPRESSION_LEVEL || '6'),
      threshold: parseInt(process.env.STORAGE_COMPRESSION_THRESHOLD || '1024') // 1KB
    },

    encryption: {
      enabled: process.env.STORAGE_ENCRYPTION === 'true',
      algorithm: process.env.STORAGE_ENCRYPTION_ALGORITHM || 'AES256',
      keyId: process.env.STORAGE_ENCRYPTION_KEY_ID
    },

    s3: {
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      bucket: process.env.S3_BUCKET || 'build-arsenal',
      maxRetries: parseInt(process.env.S3_MAX_RETRIES || '3'),
      timeout: parseInt(process.env.S3_TIMEOUT || '30000')
    },

    nuFire: {
      baseUrl: process.env.NUFIRE_STORAGE_URL || 'https://storage.nufire.com/api/v1',
      apiKey: process.env.NUFIRE_STORAGE_API_KEY!,
      timeout: parseInt(process.env.NUFIRE_TIMEOUT || '30000'),
      retries: parseInt(process.env.NUFIRE_RETRIES || '3')
    }
  },

  // Production caching
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    redis: {
      url: process.env.REDIS_URL,
      ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour
      maxMemory: process.env.REDIS_MAX_MEMORY || '512mb',
      evictionPolicy: process.env.REDIS_EVICTION_POLICY || 'allkeys-lru'
    },
    memory: {
      max: parseInt(process.env.MEMORY_CACHE_MAX || '100'), // 100 items
      ttl: parseInt(process.env.MEMORY_CACHE_TTL || '300') // 5 minutes
    }
  },

  // Production queue settings
  queue: {
    enabled: process.env.QUEUE_ENABLED === 'true',
    redis: process.env.QUEUE_REDIS_URL,
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5'),
    maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY || '5000')
  },

  // Production CDN settings
  cdn: {
    enabled: process.env.CDN_ENABLED === 'true',
    provider: process.env.CDN_PROVIDER || 'cloudflare',
    zoneId: process.env.CDN_ZONE_ID,
    apiToken: process.env.CDN_API_TOKEN,
    purgeOnDeploy: process.env.CDN_PURGE_ON_DEPLOY === 'true'
  },

  // Production backup settings
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    retention: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    s3: {
      bucket: process.env.BACKUP_S3_BUCKET || 'arsenal-lab-backups',
      region: process.env.BACKUP_S3_REGION || 'us-east-1'
    }
  },

  // Production feature flags
  features: {
    securityScanning: process.env.FEATURE_SECURITY_SCANNING !== 'false',
    analytics: process.env.FEATURE_ANALYTICS !== 'false',
    teamCollaboration: process.env.FEATURE_TEAM_COLLABORATION !== 'false',
    realTimeUpdates: process.env.FEATURE_REAL_TIME_UPDATES !== 'false',
    advancedCaching: process.env.FEATURE_ADVANCED_CACHING !== 'false',
    auditLogging: process.env.FEATURE_AUDIT_LOGGING !== 'false'
  },

  // Production alerting
  alerting: {
    enabled: process.env.ALERTING_ENABLED === 'true',
    slack: {
      webhook: process.env.SLACK_WEBHOOK,
      channel: process.env.SLACK_CHANNEL || '#alerts'
    },
    email: {
      smtp: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      to: process.env.ALERT_EMAIL_TO?.split(',') || []
    },
    thresholds: {
      errorRate: parseFloat(process.env.ALERT_ERROR_RATE || '0.05'), // 5%
      responseTime: parseInt(process.env.ALERT_RESPONSE_TIME || '5000'), // 5 seconds
      memoryUsage: parseFloat(process.env.ALERT_MEMORY_USAGE || '0.9') // 90%
    }
  }
} as const;

// Environment validation
export function validateProductionConfig() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'S3_ACCESS_KEY_ID',
    'S3_SECRET_ACCESS_KEY',
    'NUFIRE_STORAGE_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate URLs
  const urlFields = ['DATABASE_URL', 'NUFIRE_STORAGE_URL', 'S3_ENDPOINT'];
  for (const field of urlFields) {
    if (process.env[field] && !process.env[field]?.startsWith('http')) {
      console.warn(`Warning: ${field} does not appear to be a valid URL`);
    }
  }

  console.log('✅ Production configuration validated');
  return true;
}

// Configuration summary
export function getConfigSummary() {
  return {
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    server: {
      port: productionConfig.server.port,
      host: productionConfig.server.host
    },
    features: Object.entries(productionConfig.features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
    monitoring: {
      metrics: productionConfig.monitoring.metrics.enabled,
      healthChecks: productionConfig.monitoring.healthCheck.enabled
    },
    security: {
      rateLimit: productionConfig.security.rateLimit.max,
      jwt: !!productionConfig.security.jwt.secret
    }
  };
}

export default productionConfig;
