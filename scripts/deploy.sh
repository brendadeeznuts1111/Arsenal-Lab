#!/bin/bash

# Arsenal Lab Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: development, staging, production

set -e

ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying Arsenal Lab to $ENVIRONMENT environment"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "📋 Valid environments: development, staging, production"
    exit 1
fi

# Switch to environment-specific configuration
ENV_FILE="$PROJECT_DIR/.env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file not found: $ENV_FILE"
    echo "💡 Run: cp .env.example .env.$ENVIRONMENT"
    exit 1
fi

echo "📋 Copying $ENVIRONMENT configuration..."
cp "$ENV_FILE" "$PROJECT_DIR/.env"

# Load environment variables
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

# Build the application
echo "🔨 Building application..."
cd "$PROJECT_DIR"
bun run build

# Set deployment-specific variables
case $ENVIRONMENT in
    development)
        PORT=${PORT:-3001}
        echo "🏠 Starting development server on port $PORT"
        bun --hot src/server.ts
        ;;
    staging)
        PORT=${PORT:-3002}
        echo "🧪 Starting staging server on port $PORT"
        bun --hot src/server.ts
        ;;
    production)
        PORT=${PORT:-3000}
        echo "🎯 Starting production server on port $PORT"

        # Additional production checks
        if [ "$NODE_ENV" != "production" ]; then
            echo "⚠️  Warning: NODE_ENV is not set to 'production'"
        fi

        # Check for required production secrets
        if [ -z "$GOOGLE_ANALYTICS_ID" ] || [ "$GOOGLE_ANALYTICS_ID" = "G-XXXXXXXXXX" ]; then
            echo "⚠️  Warning: GOOGLE_ANALYTICS_ID not properly configured"
        fi

        bun src/server.ts
        ;;
esac

echo "✅ Arsenal Lab deployed successfully to $ENVIRONMENT"
