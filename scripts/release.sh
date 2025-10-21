#!/bin/bash
# scripts/release.sh
set -e

VERSION=${1:-"$(date +%Y%m%d_%H%M%S)"}
OUTPUT_DIR="dist"
BUNDLE_NAME="bun-arsenal-lab-${VERSION}"

echo "🚀 Building Arsenal Lab v${VERSION}..."

# Clean previous build
rm -rf dist/
mkdir -p dist/

# Build the application
echo "📦 Building application..."
bun run build

# Create bundle
echo "📦 Creating bundle..."
tar -czf "dist/${BUNDLE_NAME}.tar.gz" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    .

# Sign the bundle (requires cosign)
if command -v cosign >/dev/null 2>&1; then
    echo "🔐 Signing bundle..."
    cosign sign-blob --yes "dist/${BUNDLE_NAME}.tar.gz" > "dist/${BUNDLE_NAME}.sig"
    echo "✅ Bundle signed: ${BUNDLE_NAME}.sig"
else
    echo "⚠️ cosign not found, skipping signature"
fi

# Generate SBOM (Software Bill of Materials)
echo "📋 Generating SBOM..."
bun install --dry-run --json | jq -r '.[] | select(.dev != true) | "\(.name)@\(.version)"' > "dist/${BUNDLE_NAME}.sbom"

# Create release notes
cat > "dist/${BUNDLE_NAME}.notes" << EOF
Arsenal Lab v${VERSION}
========================

Performance testing suite for Bun runtime with FAANG-grade features:

✅ Micro-benchmark harness with statistical rigor
✅ Real-time flame-graph visualization
✅ Prometheus metrics integration
✅ JUnit CI/CD support
✅ Offline PWA capabilities
✅ Signed bundle distribution

Installation:
  curl -fsSL https://github.com/your-org/bun-gate/releases/download/${VERSION}/${BUNDLE_NAME}.tar.gz | tar -xz
  cd ${BUNDLE_NAME}
  bun install
  bun run arsenal:lab

For CI/CD:
  bun run arsenal:ci --output-dir ./metrics

Checksums:
$(sha256sum "dist/${BUNDLE_NAME}.tar.gz")
EOF

echo "📊 Bundle created: dist/${BUNDLE_NAME}.tar.gz"
echo "📋 Release notes: dist/${BUNDLE_NAME}.notes"
echo "🔐 Signature: dist/${BUNDLE_NAME}.sig (if cosign available)"
echo "📦 SBOM: dist/${BUNDLE_NAME}.sbom"

# GitHub release (if GITHUB_TOKEN is set)
if [ -n "$GITHUB_TOKEN" ]; then
    echo "🐙 Creating GitHub release..."
    gh release create "${VERSION}" \
        --title "Arsenal Lab ${VERSION}" \
        --notes-file "dist/${BUNDLE_NAME}.notes" \
        "dist/${BUNDLE_NAME}.tar.gz" \
        "dist/${BUNDLE_NAME}.sig" \
        "dist/${BUNDLE_NAME}.sbom"

    echo "🎉 Release ${VERSION} published!"
else
    echo "💡 Set GITHUB_TOKEN to automatically create GitHub releases"
fi
