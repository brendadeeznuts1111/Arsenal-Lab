# Bun v1.3.1 Email Authentication in .npmrc

## Overview

Bun v1.3.1 introduces support for the `:email` field in `.npmrc` files, enabling seamless authentication with private registries that require email addresses alongside username/password or token credentials.

## Supported Registries

This feature works with enterprise registries that require email authentication:

- **Sonatype Nexus Repository** - Enterprise artifact repository
- **JFrog Artifactory** - Universal artifact repository
- **GitHub Packages** - GitHub's package registry
- **Azure DevOps Artifacts** - Microsoft's package management
- **GitLab Package Registry** - GitLab's package management

## Basic Configuration

### Sonatype Nexus Example

```bash
# .npmrc
registry=https://nexus.company.com/repository/npm-all/
//nexus.company.com/:email=developer@company.com
//nexus.company.com/:username=myuser
//nexus.company.com/:_password=bXlwYXNzd29yZA==
```

### JFrog Artifactory Example

```bash
# .npmrc
registry=https://artifactory.company.com/artifactory/api/npm/npm/
//artifactory.company.com/:email=team@company.com
//artifactory.company.com/:username=service-account
//artifactory.company.com/:_authToken=dG9rZW4xMjM=
```

### GitHub Packages Example

```bash
# .npmrc
registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:email=github-user@example.com
//npm.pkg.github.com/:username=github-user
//npm.pkg.github.com/:_authToken=github_pat_token
```

## Scoped Registries (Monorepo Support)

For monorepos with multiple registries, use scoped configurations:

```bash
# .npmrc
registry=https://registry.npmjs.org/

# Company internal packages
@mycompany:registry=https://nexus.company.com/repository/npm-private/
//nexus.company.com/:email=employee@company.com
//nexus.company.com/:username=employee
//nexus.company.com/:_authToken=internal_token

# Public packages from npm
//registry.npmjs.org/:email=developer@example.com
//registry.npmjs.org/:username=developer
//registry.npmjs.org/:_authToken=npm_token
```

## Authentication Methods

### Username/Password (Base64 Encoded)

```bash
//registry.company.com/:email=user@company.com
//registry.company.com/:username=username
//registry.company.com/:_password=$(echo -n "password" | base64)
```

### Personal Access Tokens

```bash
//registry.company.com/:email=user@company.com
//registry.company.com/:username=username
//registry.company.com/:_authToken=your_personal_access_token
```

### API Tokens

```bash
//registry.company.com/:email=user@company.com
//registry.company.com/:username=username
//registry.company.com/:_authToken=api_token_here
```

## Setup Commands

### Encoding Credentials

```bash
# Encode password to base64
echo -n "your-password" | base64

# Or use Bun's built-in utilities
bun -e "console.log(btoa('your-password'))"
```

### Testing Configuration

```bash
# Dry run to test authentication
bun install --dry-run

# Test specific package installation
bun add @company/internal-package

# List available packages
bun pm ls
```

## Migration from npm/yarn

### Existing .npmrc files work unchanged!

If you already have working `.npmrc` configurations, simply add the `:email` field:

```bash
# Before (might not work with some registries)
registry=https://nexus.company.com/repository/npm-all/
//nexus.company.com/:username=myuser
//nexus.company.com/:_password=bXlwYXNzd29yZA==

# After (Bun v1.3.1 compatible)
registry=https://nexus.company.com/repository/npm-all/
//nexus.company.com/:email=developer@company.com  # ← Add this line
//nexus.company.com/:username=myuser
//nexus.company.com/:_password=bXlwYXNzd29yZA==
```

## Environment Variables

For CI/CD pipelines, use environment variables:

```bash
# .npmrc
registry=https://nexus.company.com/repository/npm-all/
//nexus.company.com/:email=${NPM_EMAIL}
//nexus.company.com/:username=${NPM_USERNAME}
//nexus.company.com/:_authToken=${NPM_TOKEN}
```

## Troubleshooting

### Authentication Failures

```bash
# Check .npmrc syntax
cat ~/.npmrc

# Test with verbose output
bun install --verbose

# Clear cache and retry
bun pm cache rm
bun install
```

### Email Field Issues

```bash
# Verify email format
# Must be valid email address
//registry.com/:email=valid.email@domain.com

# Check for typos in registry URL
//correct-registry.com/:email=user@domain.com
```

### Scoped Registry Issues

```bash
# Ensure scope matches package name
@company:registry=https://nexus.company.com/npm-private/

# Install scoped package
bun add @company/package-name
```

## Enterprise Integration

### CI/CD Pipeline Example

```yaml
# GitHub Actions
- name: Setup Bun
  uses: oven-sh/setup-bun@v1

- name: Configure Private Registry
  run: |
    echo "registry=https://nexus.company.com/repository/npm-all/" >> ~/.npmrc
    echo "//nexus.company.com/:email=$NPM_EMAIL" >> ~/.npmrc
    echo "//nexus.company.com/:username=$NPM_USERNAME" >> ~/.npmrc
    echo "//nexus.company.com/:_authToken=$NPM_TOKEN" >> ~/.npmrc

- name: Install Dependencies
  run: bun install
```

### Docker Integration

```dockerfile
FROM oven/bun:latest

# Copy .npmrc for authentication
COPY .npmrc ~/.npmrc

# Install dependencies
RUN bun install

# Clean up sensitive files
RUN rm ~/.npmrc
```

## Benefits

- **🔐 Enhanced Security**: Email-based authentication for enterprise registries
- **🏢 Enterprise Ready**: Compatible with major artifact repositories
- **🔄 Seamless Migration**: Existing configurations work unchanged
- **📦 Monorepo Support**: Different authentication per scoped registry
- **🚀 Developer Experience**: Automatic authentication without manual setup

## Reference

- [Bun v1.3.1 Release Notes](https://bun.com/blog/bun-v1.3.1#email-in-npmrc)
- [npm Registry Configuration](https://docs.npmjs.com/cli/v9/configuring-npm/npmrc)
- [Bun Package Manager](https://bun.com/docs/cli/bun-install)
