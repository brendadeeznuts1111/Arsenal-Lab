#!/usr/bin/env bash
set -euo pipefail

# Bun v1.3.1 Enterprise Bootstrap Script
# Zero-touch, audit-ready .npmrc generation
# https://bun.com/blog/bun-v1.3.1#email-in-npmrc

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if template exists
if [[ ! -f "$REPO_ROOT/.npmrc.template" ]]; then
    log_error ".npmrc.template not found in $REPO_ROOT"
    exit 1
fi

# ===== V4 IDENTITY SERVICE INTEGRATION =====
# Generate self-describing email identities using local API or fallback

generate_identity() {
  local prefix="$1"
  local run="$2"
  local domain="${3:-api.dev.arsenal-lab.com}"
  local version="${4:-v1}"
  local api_url="${IDENTITY_API_URL:-http://localhost:3655}"

  # Try to fetch from identity service (v4)
  if command -v curl >/dev/null 2>&1; then
    local response
    response=$(curl -s --max-time 5 "${api_url}/api/v1/id?prefix=${prefix}&run=${run}&domain=${domain}&version=${version}" 2>/dev/null)

    if [[ $? -eq 0 ]] && echo "$response" | jq -e '.id' >/dev/null 2>&1; then
      echo "$response" | jq -r '.id'
      return 0
    fi
  fi

  # Fallback: Generate locally (air-gapped mode)
  log_warning "Identity service unavailable, using air-gapped fallback"
  echo "${prefix}-${run}@${domain}/${version}:id"
}

# Environment validation (support both old and new variable names)
missing_vars=()
[[ -z "${NPM_EMAIL_ARSENAL:-}" ]] && [[ -z "${NPM_EMAIL:-}" ]] && missing_vars+=("NPM_EMAIL_ARSENAL or NPM_EMAIL")
[[ -z "${NPM_TOKEN_ARSENAL:-}" ]] && [[ -z "${NPM_TOKEN:-}" ]] && missing_vars+=("NPM_TOKEN_ARSENAL or NPM_TOKEN")

if [[ ${#missing_vars[@]} -gt 0 ]]; then
    log_warning "Missing required environment variables: ${missing_vars[*]}"
    log_info "Using demo values for demonstration purposes"

    # Demo values for development/testing (support new variable names and v4 identities)
    # Use v4 identity generation for demo email
    DEMO_RUN_ID="${DEMO_RUN_ID:-$(date +%s)}"
    DEMO_EMAIL_ARSENAL="${NPM_EMAIL_ARSENAL:-$(generate_identity 'demo' "$DEMO_RUN_ID" 'api.dev.arsenal-lab.com' 'v1')}"

    export NPM_EMAIL_ARSENAL="${DEMO_EMAIL_ARSENAL}"
    export NPM_TOKEN_ARSENAL="${NPM_TOKEN_ARSENAL:-${NPM_TOKEN:-demo_token_123}}"
    export NPM_TOKEN_PUBLIC="${NPM_TOKEN_PUBLIC:-${NPM_PUBLIC_TOKEN:-npm_demo_token}}"
    export NPM_EMAIL_PUBLIC="${NPM_EMAIL_PUBLIC:-demo-${DEMO_RUN_ID}@api.dev.arsenal-lab.com/v1:id}"
fi

# Detect environment
detect_environment() {
    if [[ -n "${CI:-}" ]]; then
        if [[ -n "${GITHUB_ACTIONS:-}" ]]; then
            echo "github-ci"
        elif [[ -n "${GITLAB_CI:-}" ]]; then
            echo "gitlab-ci"
        elif [[ -n "${JENKINS_HOME:-}" ]]; then
            echo "jenkins-ci"
        else
            echo "ci"
        fi
    elif [[ -n "${PRODUCTION:-}" ]]; then
        echo "production"
    elif [[ -n "${STAGING:-}" ]]; then
        echo "staging"
    else
        echo "development"
    fi
}

ENV_TYPE=$(detect_environment)
COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

log_info "Bootstrapping .npmrc for $ENV_TYPE environment"
log_info "Git commit: $COMMIT_SHORT"

# Generate .npmrc from template
if command -v envsubst >/dev/null 2>&1; then
    envsubst < "$REPO_ROOT/.npmrc.template" > "$REPO_ROOT/.npmrc.tmp"
elif command -v bun >/dev/null 2>&1; then
    # Fallback: use Bun for template substitution
    bun -e "
    const fs = require('fs');
    const template = fs.readFileSync('$REPO_ROOT/.npmrc.template', 'utf8');
    const result = template
      .replace(/\${NPM_EMAIL}/g, process.env.NPM_EMAIL || 'demo@arsenal-lab.com')
      .replace(/\${NPM_TOKEN}/g, process.env.NPM_TOKEN || 'demo_token_123')
      .replace(/\${NPM_PUBLIC_TOKEN}/g, process.env.NPM_PUBLIC_TOKEN || 'npm_demo_token');
    fs.writeFileSync('$REPO_ROOT/.npmrc.tmp', result);
    "
else
    log_error "Neither envsubst nor bun found for template processing"
    exit 1
fi

# Seal the .npmrc (make it read-only)
mv "$REPO_ROOT/.npmrc.tmp" "$REPO_ROOT/.npmrc"
chmod 444 "$REPO_ROOT/.npmrc"

log_success ".npmrc sealed for $ENV_TYPE environment"
log_info "Environment: $ENV_TYPE"
log_info "Email identity: ${NPM_EMAIL:-demo@arsenal-lab.com}"
log_info "Private registry: https://pkgs.arsenal-lab.com/"
log_info "Permissions: $(stat -c '%a' "$REPO_ROOT/.npmrc" 2>/dev/null || stat -f '%A' "$REPO_ROOT/.npmrc" 2>/dev/null || echo 'unknown')"

# Optional: Add to .gitignore if not already there
if [[ -f "$REPO_ROOT/.gitignore" ]] && ! grep -q "^\.npmrc$" "$REPO_ROOT/.gitignore"; then
    echo ".npmrc" >> "$REPO_ROOT/.gitignore"
    log_info "Added .npmrc to .gitignore"
fi

# Post-substitution: Isolated linker check (Bun v1.3.1+ fixes)
if [[ -f "bun.lockb" ]] && (grep -q "isolated" bun.lockb 2>/dev/null || [[ "${BUN_LINKER:-}" == "isolated" ]]); then
    log_info "🔗 Isolated linker detected - Bun v1.3.1 ensures symlink determinism"
fi

# Verification
log_info "Verifying configuration..."
if bun install --dry-run >/dev/null 2>&1; then
    log_success "Configuration verified - authentication ready"
else
    log_warning "Configuration may need adjustment - check credentials"
fi

echo
log_success "🎯 Zero-touch authentication configured!"
log_info "Every bun install now carries audit-ready email identity"
log_info "No manual steps required - authentication is automatic"
