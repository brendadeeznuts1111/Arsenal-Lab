# Enterprise Authentication Setup - Zero-Touch Supply Chain

## Overview

This document describes the zero-touch, audit-ready authentication system implemented for Bun v1.3.1+'s `:email` feature. Every `bun install` across your entire fleet now carries a non-repudiable, audit-logged, environment-scoped email identity with zero daily maintenance.

## Requirements

- **Bun v1.3.1+** - Required for native `:email` forwarding to registries
- **Bash shell** - For the bootstrap script
- **Private registry** - Supporting email-based authentication (Nexus, Artifactory, etc.)

**Upgrade Note**: If you're on an older Bun version, run `bun upgrade` first. The native `:email` forwarding eliminates the need for workarounds and ensures registry compliance.

## Architecture

### Core Components

1. **`.npmrc.template`** - Committed template with environment variable placeholders
2. **`scripts/bootstrap.sh`** - Zero-touch generation script with environment detection
3. **Environment Variables** - Context-aware authentication credentials
4. **Post-install Hook** - Automatic configuration on `bun install`

### Security Properties

- **Non-repudiable**: Every package operation is tied to an email identity
- **Audit-ready**: Registry logs show email claims for compliance
- **Environment-scoped**: Different identities per environment
- **Zero-touch**: No manual configuration required

## Environment Configuration

### Environment Variable Matrix (Bun v1.3.1+ Enhanced)

| Variable | Local (Laptop) | CI Pipeline | Production Deploy | Description |
|---|---|---|---|---|
| `NPM_EMAIL_ARSENAL` | `dev@arsenal-lab.com` | `ci-pipeline@arsenal-lab.com` | `prod-deploy@arsenal-lab.com` | **Primary**: Email identity for private registry |
| `NPM_TOKEN_ARSENAL` | Short-lived PAT | Vault-stored CI token | Vault-stored prod token | **Primary**: Private registry authentication |
| `NPM_EMAIL_PUBLIC` | `dev@arsenal-lab.com` | `ci-pipeline@arsenal-lab.com` | `prod-deploy@arsenal-lab.com` | Public registry email |
| `NPM_TOKEN_PUBLIC` | NPM token | NPM token | NPM token | Public registry access |
| `NPM_CONFIG_CACHE` | `~/.bun` | `$CI_PROJECT_DIR/.cache` | `/tmp/bun` | Cache location |
| `BUN_LINKER` | `isolated` (monorepo) | `isolated` | `hoisted` (prod perf) | **New**: Linker mode for Bun v1.3.1+ |

**Note**: Legacy variables (`NPM_EMAIL`, `NPM_TOKEN`) are still supported for backward compatibility.

### Environment Detection

The bootstrap script automatically detects the environment:

```bash
# Local development
# CI=true (GitHub Actions, GitLab CI, Jenkins)
PRODUCTION=true  # Production deployments
STAGING=true     # Staging deployments
```

## Setup Instructions

### 1. Repository Configuration

The template and bootstrap script are already committed to the repository:

```bash
.npmrc.template      # Template with placeholders
scripts/bootstrap.sh # Zero-touch generation script
```

### 2. Local Development Setup

```bash
# Set environment variables (add to ~/.bashrc or ~/.zshrc)
export NPM_EMAIL="your-dev-email@arsenal-lab.com"
export NPM_TOKEN="your-development-token"
export NPM_PUBLIC_TOKEN="your-npm-token"

# Install dependencies (triggers automatic bootstrap)
bun install
```

### 3. CI/CD Pipeline Setup

#### GitHub Actions Example (Bun v1.3.1+)

```yaml
name: CI
on: [push]

env:
  NPM_EMAIL_ARSENAL: ci-pipeline@arsenal-lab.com
  NPM_TOKEN_ARSENAL: ${{ secrets.NPM_PRIVATE_TOKEN }}
  NPM_EMAIL_PUBLIC: ci-pipeline@arsenal-lab.com
  NPM_TOKEN_PUBLIC: ${{ secrets.NPM_PUBLIC_TOKEN }}
  BUN_LINKER: isolated  # Optional: Test monorepo hoist

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install  # Bootstrap happens automatically (Bun v1.3.1+ native :email forwarding)
      - run: bun test
      - name: Verify Auth Forwarding (Bun v1.3.1+)
        run: |
          npm run verify:auth || (echo "❌ Auth/email not forwarded" && exit 1)
```

#### GitLab CI Example

```yaml
stages:
  - test

variables:
  NPM_EMAIL: "ci-pipeline@arsenal-lab.com"

test:
  script:
    - bun install  # Bootstrap happens automatically
    - bun test
  environment:
    name: npm-token
    url: https://gitlab.com/-/profile/personal_access_tokens
```

### 4. Production Deployment

```bash
# Environment variables set by your orchestrator
export PRODUCTION=true
export NPM_EMAIL="prod-deploy@arsenal-lab.com"
export NPM_TOKEN="$(vault read secret/npm/prod-token)"
export NPM_PUBLIC_TOKEN="$(vault read secret/npm/public-token)"

# Deploy
bun install
bun run build
```

## Verification

### Automated Verification (Bun v1.3.1+ Enhanced)

```bash
# Bootstrap script runs automatically on bun install
# Verify the generated .npmrc
cat .npmrc

# Test authentication (now with native :email forwarding)
bun install --verbose --dry-run 2>&1 | tee install.log | grep -E "npm-auth-email|pkgs.arsenal-lab.com" && echo "✓ Auth forwarded: $(grep 'npm-auth-email' install.log | head -1)"

# Or use the convenience script
npm run verify:auth
```

**Expected Output (Bun v1.3.1+ native forwarding):**
```
npm-auth-email: ci-pipeline@arsenal-lab.com
✓ Auth forwarded: npm-auth-email: ci-pipeline@arsenal-lab.com
```

### Manual Verification

```bash
# Check generated .npmrc
ls -la .npmrc  # Should be read-only (444)

# Verify environment detection
bun run bootstrap  # Shows detected environment

# Test package installation
bun add @arsenal/internal-package
bun add lodash  # Public package
```

### Registry Audit Logs

Every authenticated request includes the email identity:

```
2024-01-15 10:30:15 [INFO] Authentication successful
  User: ci-pipeline@arsenal-lab.com
  Registry: https://pkgs.arsenal-lab.com/
  Package: @arsenal/internal-package
  Action: install
```

## Token Rotation

### Zero-Downtime Rotation Process

1. **Create new token** in registry UI (Nexus/Artifactory)
2. **Update secrets** in vault/1Password/GitHub Secrets
3. **Deploy changes** (no code changes required)
4. **Revoke old token** immediately

### Example: GitHub Secrets Rotation

```bash
# 1. Generate new token in GitHub Settings
# 2. Update GitHub Secret
gh secret set NPM_PRIVATE_TOKEN --body "new_token_here"
# 3. Next CI run uses new token automatically
# 4. Revoke old token in GitHub
```

## Advanced Features

### Monorepo Child Packages (Bun v1.3.1+ Enhanced)

Each workspace can have its own authentication identity. The new hoisting patterns automatically lift TypeScript/ESLint dependencies for better DX:

```
monorepo/
├── .npmrc.template          # Root template with hoist patterns
├── packages/
│   ├── frontend/
│   │   └── .npmrc.template  # Different identity for frontend
│   └── backend/
│       └── .npmrc.template  # Different identity for backend
└── scripts/bootstrap.sh     # Merges all templates + isolated linker checks
```

**Benefits with Bun v1.3.1+:**
- Automatic hoisting of `@types/*` and `eslint*` packages
- Symlink determinism in isolated linker mode
- No "phantom" dependencies across workspaces
- Faster installs with peer dependency optimizations

### Offline/Air-Gapped Builds

Pre-build container with sealed authentication:

```dockerfile
FROM oven/bun:latest

# Copy template and generate .npmrc during build
COPY .npmrc.template .
RUN export NPM_EMAIL_ARSENAL="prod-deploy@arsenal-lab.com" \
    && export NPM_TOKEN_ARSENAL="baked-prod-token" \
    && bash scripts/bootstrap.sh

# Bake populated cache into image (Bun v1.3.1+ faster with --frozen-lockfile)
RUN bun install --frozen-lockfile

# Label for auditors
LABEL maintainer="prod-deploy@arsenal-lab.com"
LABEL build-date="2024-01-15"
LABEL bun-version="1.3.1+"
```

### Multi-Registry Setups

```bash
# .npmrc.template supports multiple registries
@company-a:registry=https://pkgs.company-a.com/
//pkgs.company-a.com/:email=${COMPANY_A_EMAIL}
//pkgs.company-a.com/:_authToken=${COMPANY_A_TOKEN}

@company-b:registry=https://pkgs.company-b.com/
//pkgs.company-b.com/:email=${COMPANY_B_EMAIL}
//pkgs.company-b.com/:_authToken=${COMPANY_B_TOKEN}
```

## Infrastructure as Code

### Terraform: Nexus User Management

```hcl
resource "nexus_security_user" "ci_pipeline" {
  user_id = "ci-pipeline"
  email   = "ci-pipeline@arsenal-lab.com"
  roles   = ["nx-repository-view-npm-*-read"]
  password = random_password.ci.result
}

resource "nexus_security_user" "prod_deploy" {
  user_id = "prod-deploy"
  email   = "prod-deploy@arsenal-lab.com"
  roles   = ["nx-repository-view-npm-*-read", "nx-repository-view-npm-*-write"]
  password = random_password.prod.result
}
```

### Kubernetes: Secret Management

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: npm-registry-auth
type: Opaque
data:
  email: Y2ktcGlwZWxpbmVARXhhbXBsZS5jb20=  # ci-pipeline@arsenal-lab.com
  token: <base64-encoded-token>
```

## Compliance & Audit

### Audit Trail

Every package operation creates an audit trail:

1. **Email Identity**: Non-repudiable user identification
2. **Timestamp**: When the operation occurred
3. **Registry**: Which registry was accessed
4. **Package**: Which package was requested
5. **Environment**: Detected environment context

### Compliance Benefits

- **SOX Compliance**: Email-based identity tracking
- **GDPR Compliance**: Clear data subject identification
- **Security Audits**: Complete visibility into package operations
- **Incident Response**: Quick identification of compromised credentials

## Troubleshooting

### Common Issues

```bash
# Bootstrap script fails
bun run bootstrap  # Run manually to see error details

# Environment variables not set
echo $NPM_EMAIL $NPM_TOKEN  # Check variables

# Authentication fails
bun install --verbose  # See detailed error messages

# .npmrc not generated
ls -la .npmrc  # Check if file exists
```

### Debug Commands

```bash
# See what environment was detected
ENV_TYPE=$(bash scripts/bootstrap.sh 2>&1 | grep "Bootstrapping" | cut -d' ' -f3)

# Test template substitution
envsubst < .npmrc.template

# Validate generated .npmrc
bun install --dry-run
```

## Migration Guide

### From Manual .npmrc Files

1. **Backup existing `.npmrc`**
2. **Create `.npmrc.template`** with placeholders
3. **Update CI/CD** to set environment variables
4. **Test authentication** in each environment
5. **Remove old `.npmrc`** from version control

### From Other Package Managers

```bash
# npm/yarn .npmrc migration
# Replace hardcoded values with variables
//registry.company.com/:_authToken=token_here
# Becomes:
//registry.company.com/:_authToken=${NPM_TOKEN}
```

## Security Considerations

### Token Lifecycle Management

- **Short-lived tokens** for development
- **Vault-stored tokens** for CI/production
- **Automatic rotation** via infrastructure
- **Immediate revocation** on compromise

### Environment Isolation

- **Separate tokens** per environment
- **Different email identities** for audit trails
- **Scoped permissions** based on environment needs

## Performance Impact

- **Zero performance cost**: Authentication happens once per `bun install`
- **Cached results**: Subsequent operations use cached authentication
- **Parallel processing**: Bun's parallel installation unaffected

## Conclusion

This zero-touch authentication system transforms Bun v1.3.1's `:email` feature into a complete enterprise supply chain solution. Every `bun install` now provides:

- ✅ **Non-repudiable identity** via email claims
- ✅ **Complete audit trails** in registry logs
- ✅ **Environment-scoped access** control
- ✅ **Zero-touch operation** for developers
- ✅ **Enterprise compliance** ready
- ✅ **Security-first design** with token rotation

The system scales from local development to enterprise production with zero configuration drift and complete audit visibility.
