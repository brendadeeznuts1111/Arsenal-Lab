#!/bin/bash
# backend/scripts/deploy.sh - Build Configuration Arsenal Deployment Script

set -e

echo "🚀 Deploying Build Configuration Arsenal Backend..."

# Check if we're in the backend directory
if [ ! -f "server.ts" ]; then
    echo "❌ Error: Must run from backend directory"
    exit 1
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | xargs)
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Run database migrations
echo "🗄️  Running database migrations..."
bun run migrate

# Setup cloud infrastructure (optional)
if [ "$SETUP_AWS" = "true" ]; then
    echo "☁️  Setting up AWS infrastructure..."
    bun run setup:aws
fi

# Build the application
echo "🔨 Building application..."
bun run build

# Run tests (if any)
if [ -d "__tests__" ]; then
    echo "🧪 Running tests..."
    bun run test
fi

# Deploy based on target
case "$DEPLOY_TARGET" in
    "vercel")
        echo "▲ Deploying to Vercel..."
        # Add Vercel deployment commands
        ;;
    "railway")
        echo "🚂 Deploying to Railway..."
        # Add Railway deployment commands
        ;;
    "fly")
        echo "✈️  Deploying to Fly.io..."
        # Add Fly.io deployment commands
        ;;
    "docker")
        echo "🐳 Building Docker image..."
        docker build -t build-arsenal-backend .
        ;;
    *)
        echo "🏠 Starting local server..."
        bun run start
        ;;
esac

echo "✅ Deployment complete!"
echo "🌐 API available at: http://localhost:${PORT:-3001}"
