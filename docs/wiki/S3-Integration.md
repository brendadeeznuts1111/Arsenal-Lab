# 🗄️ Database Infrastructure & Cloud Integration

> Arsenal Lab provides comprehensive database testing and cloud integration capabilities, focusing on high-performance data storage and retrieval patterns.

[![SQLite](https://img.shields.io/badge/SQLite-✅-blue?style=flat)]()
[![Redis](https://img.shields.io/badge/Redis-✅-red?style=flat)]()
[![Cloud Storage](https://img.shields.io/badge/Cloud-Storage-✅-orange?style=flat)]()

## 📋 Table of Contents

- [SQLite Integration](#sqlite-integration)
  - [Connection Management](#connection-management)
  - [Performance Benchmarking](#performance-benchmarking)
  - [Query Optimization](#query-optimization)
- [Redis Integration](#redis-integration)
- [Cloud Storage Integration](#cloud-storage-integration)
- [Database Testing Patterns](#database-testing-patterns)
- [Performance Monitoring](#performance-monitoring)
- [Configuration & Setup](#configuration--setup)
- [Best Practices](#best-practices)

## 🗄️ SQLite Integration

### Connection Management
Native SQLite database testing with Bun's built-in SQLite support.

```typescript
import { Database } from 'bun:sqlite';

// Create in-memory database for testing
const db = new Database(':memory:');

// Create tables
db.run(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert test data
const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
insert.run('John Doe', 'john@example.com');
insert.run('Jane Smith', 'jane@example.com');
```

### Performance Benchmarking
Test SQLite operations under various loads:

```typescript
// Bulk insert performance test
function benchmarkBulkInsert(count: number) {
  const start = performance.now();

  const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  db.transaction(() => {
    for (let i = 0; i < count; i++) {
      insert.run(`User ${i}`, `user${i}@example.com`);
    }
  })();

  const duration = performance.now() - start;
  return {
    operations: count,
    duration,
    opsPerSecond: count / (duration / 1000)
  };
}

// Test different batch sizes
const results = [100, 1000, 10000].map(size =>
  benchmarkBulkInsert(size)
);
```

### Query Optimization
Test various query patterns and optimization techniques:

```typescript
// Test indexed vs non-indexed queries
db.run('CREATE INDEX idx_users_email ON users(email)');

// Benchmark queries
const queries = {
  indexed: db.prepare('SELECT * FROM users WHERE email = ?'),
  nonIndexed: db.prepare('SELECT * FROM users WHERE name LIKE ?'),
  count: db.prepare('SELECT COUNT(*) FROM users'),
  aggregate: db.prepare(`
    SELECT
      COUNT(*) as total,
      AVG(LENGTH(name)) as avg_name_length,
      MAX(created_at) as latest_user
    FROM users
  `)
};
```

## 🔴 Redis Integration

### Connection & Operations
High-performance Redis testing with connection pooling:

```typescript
import { Redis } from '@redis/client';

// Connect to Redis (would use a mock in testing)
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  // In Arsenal Lab, we use mocked connections
});

// Basic operations
await redis.set('key', 'value');
const value = await redis.get('key');

// Hash operations
await redis.hset('user:123', {
  name: 'John Doe',
  email: 'john@example.com',
  age: '30'
});

const user = await redis.hgetall('user:123');
```

### Advanced Redis Patterns
Test complex Redis data structures and patterns:

```typescript
// Sorted sets for leaderboards
await redis.zadd('leaderboard', [
  { score: 100, member: 'user1' },
  { score: 95, member: 'user2' },
  { score: 85, member: 'user3' }
]);

// Get top 10 players
const topPlayers = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');

// Pub/Sub testing
const subscriber = redis.duplicate();
await subscriber.subscribe('events');

subscriber.on('message', (channel, message) => {
  console.log(`Received ${message} on ${channel}`);
});

// Publish messages
await redis.publish('events', 'user_logged_in');
```

## ☁️ Cloud Storage Integration

### S3-Compatible Storage
Test cloud storage operations with S3-compatible APIs:

```typescript
// Mock S3 client for testing
class MockS3Client {
  private storage = new Map<string, Buffer>();

  async putObject(bucket: string, key: string, data: Buffer) {
    const objectKey = `${bucket}/${key}`;
    this.storage.set(objectKey, data);
    return { etag: generateETag(data) };
  }

  async getObject(bucket: string, key: string) {
    const objectKey = `${bucket}/${key}`;
    const data = this.storage.get(objectKey);
    if (!data) throw new Error('Object not found');
    return data;
  }

  async deleteObject(bucket: string, key: string) {
    const objectKey = `${bucket}/${key}`;
    this.storage.delete(objectKey);
  }

  async listObjects(bucket: string, prefix?: string) {
    const objects: string[] = [];
    for (const key of this.storage.keys()) {
      if (key.startsWith(`${bucket}/`)) {
        const objectKey = key.replace(`${bucket}/`, '');
        if (!prefix || objectKey.startsWith(prefix)) {
          objects.push(objectKey);
        }
      }
    }
    return objects;
  }
}
```

### Performance Testing
Benchmark cloud storage operations:

```typescript
const s3 = new MockS3Client();
const bucket = 'test-bucket';

// Test upload performance
async function benchmarkUpload(fileSizes: number[]) {
  const results = [];

  for (const size of fileSizes) {
    const data = generateRandomData(size);
    const key = `test-${size}bytes`;

    const start = performance.now();
    await s3.putObject(bucket, key, data);
    const duration = performance.now() - start;

    results.push({
      size,
      duration,
      throughput: size / (duration / 1000) / (1024 * 1024) // MB/s
    });
  }

  return results;
}

// Test with different file sizes
const uploadResults = await benchmarkUpload([
  1024,      // 1KB
  1024 * 1024,      // 1MB
  10 * 1024 * 1024  // 10MB
]);
```

## 🧪 Database Testing Patterns

### Connection Pooling
Test database connection pool behavior:

```typescript
class ConnectionPool {
  private pool: Database[] = [];
  private maxConnections: number;

  constructor(maxConnections = 10) {
    this.maxConnections = maxConnections;
  }

  async getConnection(): Promise<Database> {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }

    if (this.pool.length < this.maxConnections) {
      return new Database(':memory:');
    }

    // Wait for connection to be returned
    return new Promise((resolve) => {
      const checkPool = () => {
        if (this.pool.length > 0) {
          resolve(this.pool.pop()!);
        } else {
          setTimeout(checkPool, 10);
        }
      };
      checkPool();
    });
  }

  returnConnection(db: Database) {
    if (this.pool.length < this.maxConnections) {
      this.pool.push(db);
    } else {
      db.close();
    }
  }
}
```

### Migration Testing
Test database schema migrations:

```typescript
interface Migration {
  version: number;
  name: string;
  up: (db: Database) => void;
  down: (db: Database) => void;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'create_users_table',
    up: (db) => db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE
      )
    `),
    down: (db) => db.run('DROP TABLE users')
  },
  {
    version: 2,
    name: 'add_timestamps',
    up: (db) => db.run(`
      ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;
    `),
    down: (db) => db.run(`
      ALTER TABLE users DROP COLUMN created_at;
      ALTER TABLE users DROP COLUMN updated_at;
    `)
  }
];

function runMigrations(db: Database, targetVersion: number) {
  const currentVersion = getCurrentVersion(db);

  if (targetVersion > currentVersion) {
    // Run up migrations
    for (let v = currentVersion + 1; v <= targetVersion; v++) {
      const migration = migrations.find(m => m.version === v);
      if (migration) {
        migration.up(db);
        setCurrentVersion(db, v);
      }
    }
  } else if (targetVersion < currentVersion) {
    // Run down migrations
    for (let v = currentVersion; v > targetVersion; v--) {
      const migration = migrations.find(m => m.version === v);
      if (migration) {
        migration.down(db);
        setCurrentVersion(db, v - 1);
      }
    }
  }
}
```

## 📊 Performance Monitoring

### Database Metrics
Track database performance metrics:

```typescript
interface DatabaseMetrics {
  connections: {
    active: number;
    idle: number;
    total: number;
  };
  queries: {
    total: number;
    slow: number; // > 100ms
    failed: number;
    avgDuration: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

class DatabaseMonitor {
  private metrics: DatabaseMetrics = {
    connections: { active: 0, idle: 0, total: 0 },
    queries: { total: 0, slow: 0, failed: 0, avgDuration: 0 },
    cache: { hits: 0, misses: 0, hitRate: 0 }
  };

  recordQuery(duration: number, success: boolean) {
    this.metrics.queries.total++;
    this.metrics.queries.avgDuration =
      (this.metrics.queries.avgDuration + duration) / 2;

    if (!success) {
      this.metrics.queries.failed++;
    }

    if (duration > 100) {
      this.metrics.queries.slow++;
    }
  }

  recordCacheAccess(hit: boolean) {
    if (hit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }

    this.metrics.cache.hitRate =
      this.metrics.cache.hits /
      (this.metrics.cache.hits + this.metrics.cache.misses);
  }

  getMetrics(): DatabaseMetrics {
    return { ...this.metrics };
  }
}
```

### Query Profiling
Profile and analyze query performance:

```typescript
class QueryProfiler {
  private queries: Array<{
    sql: string;
    duration: number;
    timestamp: Date;
    parameters?: any[];
  }> = [];

  profile<T>(sql: string, params: any[] | undefined, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;

      this.queries.push({
        sql,
        duration,
        timestamp: new Date(),
        parameters: params
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.queries.push({
        sql,
        duration,
        timestamp: new Date(),
        parameters: params
      });
      throw error;
    }
  }

  getSlowQueries(threshold = 100): typeof this.queries {
    return this.queries.filter(q => q.duration > threshold);
  }

  getQueryStats() {
    const stats = {
      totalQueries: this.queries.length,
      avgDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
      slowQueries: 0
    };

    if (this.queries.length > 0) {
      stats.avgDuration = this.queries.reduce((sum, q) => sum + q.duration, 0) / this.queries.length;
      stats.maxDuration = Math.max(...this.queries.map(q => q.duration));
      stats.minDuration = Math.min(...this.queries.map(q => q.duration));
      stats.slowQueries = this.queries.filter(q => q.duration > 100).length;
    }

    return stats;
  }
}
```

## 🔧 Configuration & Setup

### Database Configuration
Configure database connections for testing:

```typescript
interface DatabaseConfig {
  type: 'sqlite' | 'redis' | 'postgres';
  connection: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    path?: string; // for SQLite
  };
  pool: {
    min: number;
    max: number;
    idle: number;
  };
  ssl?: boolean;
}

// Example configurations
const configs: Record<string, DatabaseConfig> = {
  sqlite: {
    type: 'sqlite',
    connection: { path: ':memory:' },
    pool: { min: 1, max: 1, idle: 30000 }
  },
  redis: {
    type: 'redis',
    connection: { host: 'localhost', port: 6379 },
    pool: { min: 2, max: 10, idle: 30000 }
  }
};
```

### Environment Setup
Set up test environments with proper isolation:

```typescript
class TestEnvironment {
  private databases: Map<string, Database> = new Map();
  private redisClients: Map<string, any> = new Map();

  async setup() {
    // Create isolated databases for each test
    this.databases.set('users', new Database(':memory:'));
    this.databases.set('products', new Database(':memory:'));

    // Initialize schema
    for (const [name, db] of this.databases) {
      await this.initializeSchema(name, db);
    }
  }

  async teardown() {
    // Clean up all connections
    for (const db of this.databases.values()) {
      db.close();
    }
    this.databases.clear();

    for (const client of this.redisClients.values()) {
      await client.quit();
    }
    this.redisClients.clear();
  }

  private async initializeSchema(name: string, db: Database) {
    // Load and run schema files
    const schema = await Bun.file(`schemas/${name}.sql`).text();
    db.run(schema);
  }
}
```

## 📚 Best Practices

### Testing Strategies
- Use in-memory databases for fast tests
- Isolate tests with unique schemas
- Mock external services
- Clean up after each test

### Performance Optimization
- Use connection pooling
- Implement proper indexing
- Cache frequently accessed data
- Monitor query performance

### Security Considerations
- Never use production credentials in tests
- Sanitize input data
- Use parameterized queries
- Implement proper access controls

## 📚 Related Documentation

| Document | Description |
|----------|-------------|
| **[🏠 Wiki Home](Home.md)** | Overview and getting started |
| **[📊 Analytics Guide](Analytics.md)** | Performance monitoring and metrics |
| **[🔧 API Reference](API-Documentation.md)** | Technical component documentation |
| **[📝 SQL Examples](SQL-Examples.md)** | Query patterns and examples |

## 📞 Support & Community

- **[💬 Discussions](https://github.com/brendadeeznuts1111/Arsenal-Lab/discussions)** - Community conversations
- **[🐛 Issues](https://github.com/brendadeeznuts1111/Arsenal-Lab/issues)** - Bug reports and feature requests
- **[📖 Full Documentation](../README.md)** - Complete documentation hub

---

**Built with ❤️ for the Bun ecosystem** • **Last updated:** October 21, 2025
