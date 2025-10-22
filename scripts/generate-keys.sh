#!/bin/bash

# Generate Secure Random Keys for Arsenal Lab
# Usage: ./scripts/generate-keys.sh [environment]
# Environments: development, staging, production, all

set -e

ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔑 Generating secure keys for $ENVIRONMENT environment"

generate_key() {
    openssl rand -hex 32
}

update_env_file() {
    local env_file="$1"
    local session_key=$(generate_key)
    local api_key=$(generate_key)

    if [ -f "$env_file" ]; then
        # Update existing keys
        sed -i '' "s/SESSION_SECRET=.*/SESSION_SECRET=$session_key/" "$env_file"
        sed -i '' "s/API_SECRET_KEY=.*/API_SECRET_KEY=$api_key/" "$env_file"
        echo "✅ Updated keys in $env_file"
    else
        echo "❌ File not found: $env_file"
        return 1
    fi
}

case $ENVIRONMENT in
    development)
        update_env_file "$PROJECT_DIR/.env"
        ;;
    staging)
        update_env_file "$PROJECT_DIR/.env.staging"
        ;;
    production)
        update_env_file "$PROJECT_DIR/.env.production"
        ;;
    all)
        echo "🔄 Generating keys for all environments..."
        update_env_file "$PROJECT_DIR/.env"
        update_env_file "$PROJECT_DIR/.env.staging"
        update_env_file "$PROJECT_DIR/.env.production"
        ;;
    *)
        echo "❌ Invalid environment: $ENVIRONMENT"
        echo "📋 Valid options: development, staging, production, all"
        exit 1
        ;;
esac

echo "🎉 Key generation complete!"
echo "💡 Remember to restart your server after updating keys"
echo "🔒 Keys are 256-bit (32-byte) hex strings for maximum security"
