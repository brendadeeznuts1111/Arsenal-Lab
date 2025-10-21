# 📋 Migration Guide - From Node.js to Bun

Complete guide for migrating applications from Node.js to Bun runtime using Arsenal-Lab.

## 🚀 Quick Migration Overview

### Why Migrate to Bun?

- **Performance**: 3-5x faster than Node.js for most workloads
- **Compatibility**: Drop-in replacement for Node.js APIs
- **Modern Features**: Built-in TypeScript, JSX, and more
- **Simplified Tooling**: Single runtime for development and production

### Migration Checklist

- [ ] Update package.json scripts
- [ ] Replace Node.js APIs with Bun equivalents
- [ ] Update build configuration
- [ ] Test performance improvements
- [ ] Update deployment process

## 🛠️ Package.json Updates

### Before (Node.js)
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "build": "webpack --mode production",
    "start": "node dist/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "webpack": "^5.0.0",
    "babel": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0",
    "jest": "^29.0.0"
  }
}
```

### After (Bun)
```json
{
  "scripts": {
    "dev": "bun --hot server.ts",
    "build": "bun build src/index.tsx --outdir ./dist",
    "start": "bun run dist/index.js",
    "test": "bun test"
  }
}
```

## 🔄 API Replacements

### File System Operations

```javascript
// Node.js
const fs = require('fs');
const content = fs.readFileSync('file.txt', 'utf8');

// Bun (same API, better performance)
import { readFileSync } from 'fs';
const content = readFileSync('file.txt', 'utf8');

// Or use Bun's enhanced API
const content = await Bun.file('file.txt').text();
```

### HTTP Server

```javascript
// Node.js + Express
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000);

// Bun (built-in, no dependencies)
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    return new Response('Hello World!');
  }
});
```

### Environment Variables

```javascript
// Node.js
const port = process.env.PORT || 3000;

// Bun (same API)
const port = process.env.PORT || 3000;

// Or use Bun.env for better performance
const port = Bun.env.PORT || 3000;
```

## 🏗️ Build Configuration Migration

### Webpack to Bun.build()

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
      },
    ],
  },
};

// package.json (Bun)
{
  "scripts": {
    "build": "bun build ./src/index.tsx --outdir ./dist"
  }
}
```

### Advanced Bun.build() Configuration

```javascript
// build.js
await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  target: 'browser',
  minify: true,
  sourcemap: 'linked',
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
```

## 🧪 Testing Migration

### Jest to Bun.test()

```javascript
// Node.js + Jest
describe('Calculator', () => {
  test('adds numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});

// Bun (same API, faster execution)
describe('Calculator', () => {
  test('adds numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

### Performance Comparison

```bash
# Node.js + Jest
npm test  # ~2-3 seconds

# Bun
bun test  # ~0.5-1 second (2-4x faster)
```

## 📊 Performance Improvements

### Real-World Benchmarks

| Operation | Node.js 18 | Bun v1.3 | Improvement |
|-----------|------------|----------|-------------|
| HTTP Requests | 1,200 req/s | 3,800 req/s | **3.2× faster** |
| File I/O | 45 MB/s | 180 MB/s | **4× faster** |
| Crypto Operations | 15 MB/s | 600 MB/s | **40× faster** |
| Package Install | 12s | 4.5s | **2.7× faster** |
| Cold Start | 120ms | 35ms | **3.4× faster** |

### Memory Usage

- **Next.js Applications**: 28% less memory usage
- **Elysia Applications**: 11% less memory usage
- **General Apps**: 15-25% reduction typical

## 🔧 Arsenal-Lab Migration Tools

Use Arsenal-Lab to benchmark your migration:

```bash
# Clone Arsenal-Lab
git clone https://github.com/brendadeeznuts1111/Arsenal-Lab.git
cd Arsenal-Lab

# Install and run
bun install
bun run dev

# Open http://localhost:3655
# Use Performance Arsenal to compare Node.js vs Bun
```

### Benchmarking Your Migration

1. **Performance Arsenal**: Compare operation speeds
2. **Process & Shell Arsenal**: Monitor memory usage
3. **Build Configuration Arsenal**: Optimize build process
4. **Testing Arsenal**: Validate test performance

## 🚀 Deployment Migration

### Docker Deployment

```dockerfile
# Node.js Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Bun Dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package*.json ./
RUN bun install --production
COPY . .
EXPOSE 3000
CMD ["bun", "run", "start"]
```

### Serverless Deployment

```javascript
// Node.js (serverless function)
exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World' }),
  };
};

// Bun (same API, faster cold starts)
export default async (req) => {
  return Response.json({ message: 'Hello World' });
};
```

## 🐛 Common Issues & Solutions

### Module Resolution

```javascript
// Problem: __dirname not available in ESM
// Solution: Use import.meta.url
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

### TypeScript Configuration

```json
// tsconfig.json for Bun
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "types": ["@types/bun"]
  }
}
```

### Environment Variables

```javascript
// Use Bun.env for better performance
const config = {
  port: Bun.env.PORT || 3000,
  databaseUrl: Bun.env.DATABASE_URL,
  redisUrl: Bun.env.REDIS_URL,
};
```

## 📋 Migration Checklist

### Phase 1: Setup
- [ ] Install Bun (`curl -fsSL https://bun.sh/install | bash`)
- [ ] Update package.json scripts
- [ ] Configure TypeScript for Bun
- [ ] Update Docker configuration

### Phase 2: Code Migration
- [ ] Replace Node.js APIs with Bun equivalents
- [ ] Update import statements
- [ ] Configure Bun.build() for bundling
- [ ] Update environment variable usage

### Phase 3: Testing
- [ ] Run test suite with `bun test`
- [ ] Compare performance using Arsenal-Lab
- [ ] Test production builds
- [ ] Validate deployment process

### Phase 4: Optimization
- [ ] Implement Bun-specific optimizations
- [ ] Use Bun APIs for better performance
- [ ] Configure advanced build options
- [ ] Monitor memory usage improvements

## 🎯 Success Metrics

### Performance Targets
- **Startup Time**: < 50ms (from 120ms)
- **Memory Usage**: 20-30% reduction
- **Request Throughput**: 3-5x improvement
- **Build Time**: 50-70% faster

### Compatibility Targets
- **Test Pass Rate**: 100% (same as Node.js)
- **API Compatibility**: 95%+ drop-in replacement
- **Bundle Size**: Same or smaller
- **Runtime Errors**: Zero new errors

## 🆘 Getting Help

### Resources
- **[Bun Documentation](https://bun.sh/docs)** - Official guides
- **[Arsenal-Lab](https://github.com/brendadeeznuts1111/Arsenal-Lab)** - Performance testing
- **[Bun Discord](https://bun.sh/discord)** - Community support
- **[GitHub Issues](https://github.com/brendadeeznuts1111/Arsenal-Lab/issues)** - Report migration issues

### Common Migration Issues

1. **ESM vs CommonJS**: Bun prefers ESM, update imports
2. **__dirname**: Use `import.meta.url` in ESM
3. **process.env**: Works the same, but Bun.env is faster
4. **File URLs**: Use `Bun.file()` for better performance

## 📊 Post-Migration Validation

Use Arsenal-Lab to validate your migration:

```bash
# Performance comparison
bun run arsenal:benchmark

# Memory usage analysis
bun run arsenal:memory

# Build optimization
bun run arsenal:build
```

### Success Criteria

- ✅ All tests pass
- ✅ Performance improved by 2-5x
- ✅ Memory usage reduced by 15-30%
- ✅ Build times faster by 50-70%
- ✅ Deployment process simplified

## 🎉 Migration Complete!

Congratulations! You've successfully migrated from Node.js to Bun. Your application should now be:

- **Faster**: 3-5x performance improvement
- **Lighter**: 20-30% less memory usage
- **Simpler**: Fewer dependencies and configuration
- **Modern**: Built-in TypeScript and modern JavaScript support

**Enjoy the speed of Bun! 🚀**

---

**Built with ❤️ using [Bun](https://bun.sh) - The fast JavaScript runtime**
