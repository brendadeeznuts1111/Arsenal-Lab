# 🚀 Build Configuration Arsenal - Backend

Cloud-native backend API for the Build Configuration Arsenal, providing persistent storage, remote build execution, and analytics for Bun bundler configurations.

## 🏗️ **Architecture**

- **Runtime**: Bun 1.3+ with Hono web framework
- **Database**: SQLite with optimized schema
- **Storage**: NuFire Storage (metadata) + AWS S3 (artifacts)
- **API**: RESTful endpoints with TypeScript types
- **Deployment**: Container-ready with environment configuration

## 🚀 **Quick Start**

### Prerequisites
- **Bun 1.3+** - Required for all features
- **SQLite3** - Included with Bun
- **AWS Account** (optional) - For S3 storage

### Installation
```bash
cd backend
bun install
```

### Setup
```bash
# Copy environment configuration
cp .env.example .env

# Run database migrations
bun run migrate

# Start development server
bun run dev
```

## 📊 **API Endpoints**

### Configurations
```http
GET    /api/configurations       # List configurations
POST   /api/configurations       # Create configuration
GET    /api/configurations/:id   # Get configuration
PUT    /api/configurations/:id   # Update configuration
DELETE /api/configurations/:id   # Delete configuration
```

### Builds
```http
POST   /api/builds               # Execute build
GET    /api/builds               # List build history
GET    /api/builds/:id           # Get build details
```

### Analytics
```http
GET    /api/analytics            # Get build analytics
```

### Presets
```http
GET    /api/presets              # List build presets
```

## 🗄️ **Database Schema**

### build_configs
- Configuration storage with metadata
- User/team ownership and sharing
- Template support for common setups

### build_history
- Build execution tracking
- Performance metrics and logs
- Cloud storage artifact references

### build_analytics
- Aggregated build statistics
- Performance trends and insights

## ☁️ **Cloud Integration**

### NuFire Storage
- **Purpose**: Fast metadata and build artifact storage
- **Features**: Automatic compression, CDN delivery, API access
- **Use Cases**: Build outputs, logs, performance data

### AWS S3
- **Purpose**: Long-term artifact storage and distribution
- **Features**: Global CDN, versioning, access controls
- **Use Cases**: Production build artifacts, backup storage

## 🔧 **Environment Variables**

```bash
# Database
DATABASE_URL=file:./build-arsenal.db

# NuFire Storage
NUFIRE_STORAGE_URL=https://storage.nufire.com/api/v1
NUFIRE_STORAGE_API_KEY=your_nufire_api_key

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=build-arsenal

# Server
PORT=3001
NODE_ENV=development
```

## 📦 **Deployment**

### Local Development
```bash
bun run dev        # Hot-reload development
bun run migrate    # Database migrations
bun run test       # Run tests
```

### Production Deployment
```bash
# Build for production
bun run build

# Deploy with environment setup
SETUP_AWS=true bun run deploy

# Or use specific deployment targets
DEPLOY_TARGET=vercel bun run deploy
```

### Docker Deployment
```bash
# Build container
docker build -t build-arsenal-backend .

# Run with environment
docker run -p 3001:3001 --env-file .env build-arsenal-backend
```

## 🔍 **Monitoring & Analytics**

### Build Metrics
- **Execution Time**: Real-time build duration tracking
- **Bundle Size**: Compressed vs uncompressed analysis
- **Success Rate**: Build reliability statistics
- **Performance Trends**: Historical improvement tracking

### Health Checks
```http
GET / # API health and version info
```

## 🛡️ **Security Features**

- **Input Validation**: Type-safe API endpoints
- **CORS Configuration**: Configurable origin restrictions
- **Rate Limiting**: Configurable request throttling
- **Secure Headers**: HSTS, CSP, and security headers

## 📈 **Scaling Considerations**

### Database Optimization
- **Indexes**: Optimized for common query patterns
- **Connection Pooling**: Efficient SQLite usage
- **Migration System**: Version-controlled schema updates

### Cloud Storage
- **CDN Integration**: Global content delivery
- **Compression**: Automatic artifact optimization
- **Retention Policies**: Configurable cleanup rules

## 🤝 **Integration**

### Frontend Integration
```typescript
import { useBackendIntegration } from './hooks/useBackendIntegration';

const backend = useBackendIntegration();

// Save configuration
await backend.saveConfiguration(config, metadata);

// Execute remote build
const buildId = await backend.executeBuild(configId, options);
```

### CI/CD Integration
```yaml
# .github/workflows/deploy.yml
- name: Deploy Backend
  run: |
    cd backend
    bun run migrate
    bun run deploy
```

## 📚 **API Documentation**

Complete API documentation available at `/api/docs` when running in development mode.

## 🐛 **Troubleshooting**

### Common Issues

**Database Connection Failed**
```bash
# Ensure SQLite file permissions
chmod 644 build-arsenal.db
```

**S3 Upload Failed**
```bash
# Verify AWS credentials
aws configure list
```

**Build Timeout**
```bash
# Increase timeout in environment
BUILD_TIMEOUT=300000
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details.
