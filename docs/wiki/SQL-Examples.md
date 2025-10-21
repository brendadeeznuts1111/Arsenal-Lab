# 📝 SQL Examples & Database Patterns

> Comprehensive collection of SQL examples and database operation patterns tested in Arsenal Lab.

[![CRUD](https://img.shields.io/badge/CRUD-✅-green?style=flat)]()
[![Advanced Queries](https://img.shields.io/badge/Advanced-Queries-✅-blue?style=flat)]()
[![Performance](https://img.shields.io/badge/Performance-✅-orange?style=flat)]()

## 📋 Table of Contents

- [Basic CRUD Operations](#basic-crud-operations)
  - [Create Tables](#create-tables)
  - [Insert Operations](#insert-operations)
  - [Read Operations](#read-operations)
  - [Update Operations](#update-operations)
  - [Delete Operations](#delete-operations)
- [Advanced Queries](#advanced-queries)
  - [Window Functions](#window-functions)
  - [Common Table Expressions](#common-table-expressions)
  - [JSON Operations](#json-operations)
- [Indexing Strategies](#indexing-strategies)
- [Transactions](#transactions)
- [Performance Optimization](#performance-optimization)
- [Migration Patterns](#migration-patterns)
- [Query Analysis & Debugging](#query-analysis--debugging)
- [Security Best Practices](#security-best-practices)
- [Advanced Patterns](#advanced-patterns)

## 🏗️ Basic CRUD Operations

### Create Tables
```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER,
  stock_quantity INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Insert Operations
```sql
-- Single insert
INSERT INTO users (username, email, password_hash)
VALUES ('johndoe', 'john@example.com', '$2b$10$...');

-- Bulk insert
INSERT INTO products (name, price, category_id, stock_quantity) VALUES
  ('Laptop', 999.99, 1, 50),
  ('Mouse', 29.99, 2, 200),
  ('Keyboard', 79.99, 2, 150);

-- Insert with subquery
INSERT INTO orders (user_id, total_amount)
SELECT
  u.id,
  SUM(p.price * oi.quantity)
FROM users u
JOIN order_items oi ON oi.order_id = ?
JOIN products p ON p.id = oi.product_id
WHERE u.id = ?
GROUP BY u.id;
```

### Read Operations
```sql
-- Simple select
SELECT * FROM users WHERE is_active = TRUE;

-- With conditions
SELECT username, email, created_at
FROM users
WHERE created_at >= date('now', '-30 days')
ORDER BY created_at DESC;

-- Join operations
SELECT
  u.username,
  COUNT(o.id) as order_count,
  SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username
HAVING total_spent > 100
ORDER BY total_spent DESC;
```

### Update Operations
```sql
-- Simple update
UPDATE users
SET updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Bulk update with conditions
UPDATE products
SET stock_quantity = stock_quantity - 1
WHERE id IN (
  SELECT product_id FROM order_items WHERE order_id = ?
);

-- Update with subquery
UPDATE users
SET is_active = FALSE
WHERE id NOT IN (
  SELECT DISTINCT user_id FROM orders
  WHERE created_at >= date('now', '-1 year')
);
```

### Delete Operations
```sql
-- Soft delete
UPDATE users SET is_active = FALSE WHERE id = ?;

-- Hard delete
DELETE FROM order_items WHERE order_id = ?;

-- Cascade delete (if foreign keys are set up)
DELETE FROM orders WHERE id = ?;
```

## 🔍 Advanced Queries

### Window Functions
```sql
-- Ranking users by total spent
SELECT
  username,
  total_spent,
  RANK() OVER (ORDER BY total_spent DESC) as rank,
  PERCENT_RANK() OVER (ORDER BY total_spent DESC) as percentile
FROM (
  SELECT
    u.username,
    COALESCE(SUM(o.total_amount), 0) as total_spent
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  GROUP BY u.id, u.username
) user_totals;

-- Moving averages
SELECT
  DATE(created_at) as date,
  COUNT(*) as daily_orders,
  AVG(COUNT(*)) OVER (
    ORDER BY DATE(created_at)
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as weekly_avg
FROM orders
GROUP BY DATE(created_at)
ORDER BY date;
```

### Common Table Expressions (CTEs)
```sql
-- Recursive CTE for category hierarchy
WITH RECURSIVE category_tree AS (
  -- Base case: root categories
  SELECT id, name, parent_id, 0 as level, name as path
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case: child categories
  SELECT
    c.id,
    c.name,
    c.parent_id,
    ct.level + 1,
    ct.path || ' > ' || c.name
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY path;

-- User purchase patterns
WITH user_stats AS (
  SELECT
    u.id,
    u.username,
    COUNT(o.id) as order_count,
    SUM(o.total_amount) as total_spent,
    AVG(o.total_amount) as avg_order_value,
    MAX(o.created_at) as last_order_date
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  GROUP BY u.id, u.username
),
user_segments AS (
  SELECT
    *,
    CASE
      WHEN total_spent > 1000 THEN 'High Value'
      WHEN total_spent > 100 THEN 'Medium Value'
      WHEN order_count > 0 THEN 'Low Value'
      ELSE 'New User'
    END as segment
  FROM user_stats
)
SELECT
  segment,
  COUNT(*) as user_count,
  AVG(total_spent) as avg_total_spent,
  AVG(avg_order_value) as avg_order_value
FROM user_segments
GROUP BY segment
ORDER BY avg_total_spent DESC;
```

### JSON Operations
```sql
-- Store JSON data
CREATE TABLE user_preferences (
  user_id INTEGER PRIMARY KEY,
  preferences TEXT, -- JSON string
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert JSON data
INSERT INTO user_preferences (user_id, preferences)
VALUES (1, '{
  "theme": "dark",
  "notifications": {
    "email": true,
    "sms": false,
    "push": true
  },
  "language": "en"
}');

-- Query JSON data
SELECT
  user_id,
  json_extract(preferences, '$.theme') as theme,
  json_extract(preferences, '$.notifications.email') as email_notifications
FROM user_preferences
WHERE json_extract(preferences, '$.theme') = 'dark';

-- Update JSON fields
UPDATE user_preferences
SET preferences = json_set(preferences, '$.theme', 'light')
WHERE user_id = 1;
```

## 📊 Indexing Strategies

### Basic Indexes
```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Composite index
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Unique index
CREATE UNIQUE INDEX idx_products_sku ON products(sku);
```

### Partial Indexes
```sql
-- Index only active users
CREATE INDEX idx_active_users ON users(email)
WHERE is_active = TRUE;

-- Index recent orders
CREATE INDEX idx_recent_orders ON orders(created_at)
WHERE created_at >= date('now', '-90 days');
```

### Index Usage Analysis
```sql
-- Check index usage (SQLite specific)
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'john@example.com';

-- Analyze index effectiveness
ANALYZE;
SELECT * FROM sqlite_stat1 WHERE tbl = 'users';
```

## 🔄 Transactions

### Basic Transactions
```sql
-- Transfer money between accounts
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- Check if both updates succeeded
SELECT balance FROM accounts WHERE id IN (1, 2);

COMMIT;
```

### Savepoints
```sql
BEGIN TRANSACTION;

-- Initial operations
INSERT INTO orders (user_id, total_amount) VALUES (1, 99.99);
SET @order_id = last_insert_rowid();

SAVEPOINT order_created;

-- Add order items
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (@order_id, 1, 2, 49.99);

-- If something goes wrong, rollback to savepoint
ROLLBACK TO SAVEPOINT order_created;

COMMIT;
```

### Deadlock Prevention
```sql
-- Always access tables in the same order
BEGIN TRANSACTION;

-- Lock accounts in order (lowest ID first)
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
SELECT * FROM accounts WHERE id = 2 FOR UPDATE;

-- Perform transfer
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;
```

## ⚡ Performance Optimization

### Query Optimization
```sql
-- Avoid SELECT *
SELECT id, username, email FROM users WHERE is_active = TRUE;

-- Use EXISTS instead of COUNT
-- Bad: SELECT COUNT(*) > 0 FROM users WHERE email = ?
-- Good: SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)

-- Use UNION ALL instead of UNION when possible
SELECT id, 'user' as type FROM users
UNION ALL
SELECT id, 'product' as type FROM products;

-- Optimize subqueries
-- Bad: SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE active = 1)
-- Good: SELECT o.* FROM orders o JOIN users u ON o.user_id = u.id WHERE u.active = 1
```

### Efficient Pagination
```sql
-- Seek method (more efficient for large datasets)
SELECT * FROM products
WHERE id > ? -- last_id from previous page
ORDER BY id
LIMIT 50;

-- Traditional OFFSET (less efficient for large offsets)
SELECT * FROM products
ORDER BY created_at DESC
LIMIT 50 OFFSET 1000; -- Inefficient for large offsets
```

### Batch Operations
```sql
-- Bulk insert
INSERT INTO users (username, email, password_hash)
SELECT
  'user_' || value,
  'user_' || value || '@example.com',
  '$2b$10$...'
FROM generate_series(1, 1000) as value;

-- Bulk update
UPDATE products
SET stock_quantity = CASE
  WHEN id = 1 THEN 50
  WHEN id = 2 THEN 30
  WHEN id = 3 THEN 20
END
WHERE id IN (1, 2, 3);
```

## 📈 Migration Patterns

### Version-Based Migrations
```sql
-- Migration tracking table
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migration 001: Create users table
-- Up
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_migrations (version, name) VALUES (1, 'create_users_table');

-- Down
DROP TABLE users;
DELETE FROM schema_migrations WHERE version = 1;
```

### Data Migrations
```sql
-- Migration 002: Add password field and hash existing passwords
-- Up
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Update existing users with default hashed password
UPDATE users
SET password_hash = '$2b$10$default.hash.here'
WHERE password_hash IS NULL;

-- Make password_hash NOT NULL after data migration
-- (SQLite doesn't support ALTER COLUMN, so we'd need to recreate table)

-- Down
-- Remove password_hash column
-- (Would require recreating table in SQLite)
```

### Safe Migration Patterns
```sql
-- Always wrap migrations in transactions
BEGIN TRANSACTION;

-- Create new table with desired schema
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data with transformations
INSERT INTO users_new (id, username, email, password_hash, created_at)
SELECT
  id,
  username,
  LOWER(email), -- Normalize email to lowercase
  COALESCE(password_hash, '$2b$10$default.hash'),
  created_at
FROM users;

-- Rename tables
ALTER TABLE users RENAME TO users_old;
ALTER TABLE users_new RENAME TO users;

-- Drop old table
DROP TABLE users_old;

COMMIT;
```

## 🔍 Query Analysis & Debugging

### EXPLAIN QUERY PLAN
```sql
-- Analyze query execution plan
EXPLAIN QUERY PLAN
SELECT u.username, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- Check if indexes are being used
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'test@example.com';
```

### Performance Monitoring
```sql
-- Query execution time
.timer ON

-- Get table statistics
ANALYZE;
SELECT * FROM sqlite_stat1;

-- Monitor database file size
SELECT
  page_count * page_size as total_size_bytes,
  freelist_count * page_size as free_bytes,
  (page_count - freelist_count) * page_size as used_bytes
FROM pragma_page_count(), pragma_page_size(), pragma_freelist_count();
```

## 🛡️ Security Best Practices

### Parameterized Queries
```sql
-- Always use parameterized queries to prevent SQL injection
-- Bad: "SELECT * FROM users WHERE email = '" + email + "'"
-- Good: Use prepared statements
const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
const user = stmt.get(email);
```

### Input Validation
```sql
-- Validate and sanitize inputs
CREATE TABLE safe_users (
  id INTEGER PRIMARY KEY,
  username TEXT CHECK(LENGTH(username) BETWEEN 3 AND 50),
  email TEXT CHECK(email LIKE '%@%.%'),
  age INTEGER CHECK(age >= 13 AND age <= 120)
);
```

### Access Control
```sql
-- Row Level Security (RLS) simulation
CREATE VIEW user_orders AS
SELECT o.* FROM orders o
WHERE o.user_id = get_current_user_id();

-- Function to get current user (in application logic)
-- Application code would set this context
```

## 📚 Advanced Patterns

### Materialized Views Simulation
```sql
-- Create summary table (materialized view alternative)
CREATE TABLE user_order_summary (
  user_id INTEGER PRIMARY KEY,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_order_date DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Function to refresh summary
CREATE TRIGGER refresh_user_summary AFTER INSERT ON orders
BEGIN
  INSERT OR REPLACE INTO user_order_summary
  SELECT
    o.user_id,
    COUNT(o.id),
    SUM(o.total_amount),
    MAX(o.created_at)
  FROM orders o
  WHERE o.user_id = NEW.user_id
  GROUP BY o.user_id;
END;
```

### Full-Text Search
```sql
-- Enable FTS5 extension
CREATE VIRTUAL TABLE products_fts USING fts5(
  name, description,
  content=products,
  content_rowid=id
);

-- Populate search index
INSERT INTO products_fts(rowid, name, description)
SELECT id, name, description FROM products;

-- Search products
SELECT p.*, highlight(products_fts, 0, '<mark>', '</mark>') as highlighted_name
FROM products_fts ft
JOIN products p ON ft.rowid = p.id
WHERE products_fts MATCH 'laptop OR computer'
ORDER BY rank;
```

### Audit Logging
```sql
-- Audit table
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_values TEXT, -- JSON of old values
  new_values TEXT, -- JSON of new values
  user_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit trigger
CREATE TRIGGER audit_users_changes
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id)
  VALUES (
    'users',
    NEW.id,
    'UPDATE',
    json_object('username', OLD.username, 'email', OLD.email),
    json_object('username', NEW.username, 'email', NEW.email),
    get_current_user_id()
  );
END;

## 📚 Related Documentation

| Document | Description |
|----------|-------------|
| **[🏠 Wiki Home](Home.md)** | Overview and getting started |
| **[📊 Analytics Guide](Analytics.md)** | Performance monitoring and metrics |
| **[🔧 API Reference](API-Documentation.md)** | Technical component documentation |
| **[🗄️ Database Guide](S3-Integration.md)** | Database integration patterns |

## 📞 Support & Community

- **[💬 Discussions](https://github.com/brendadeeznuts1111/Arsenal-Lab/discussions)** - Community conversations
- **[🐛 Issues](https://github.com/brendadeeznuts1111/Arsenal-Lab/issues)** - Bug reports and feature requests
- **[📖 Full Documentation](../README.md)** - Complete documentation hub

---

**Built with ❤️ for the Bun ecosystem** • **Last updated:** October 21, 2025
