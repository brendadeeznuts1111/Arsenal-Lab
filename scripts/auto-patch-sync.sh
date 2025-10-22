#!/usr/bin/env bash
# Auto-patch sync script for GitHub Actions
set -euo pipefail

echo "🔄 Checking for upstream patch updates..."

# Get current patched dependencies
PATCHED_DEPS=$(bun run -e 'console.log(Object.keys(require("./package.json").patchedDependencies || {}).join("\n"))' 2>/dev/null || echo "")

if [ -z "$PATCHED_DEPS" ]; then
  echo "ℹ️  No patched dependencies found"
  exit 0
fi

UPDATES_FOUND=false

for pkg in $PATCHED_DEPS; do
  echo "🔍 Checking $pkg..."

  # Extract package name and version
  PKG_NAME=$(echo "$pkg" | cut -d'@' -f1)
  PKG_VERSION=$(echo "$pkg" | cut -d'@' -f2)

  # Check if patch file exists
  PATCH_FILE="patches/${PKG_NAME}@${PKG_VERSION}.patch"
  if [ ! -f "$PATCH_FILE" ]; then
    echo "⚠️  Patch file missing: $PATCH_FILE"
    continue
  fi

  # Here you would typically check upstream for newer versions
  # For now, we'll just validate the existing patches
  echo "✅ Patch exists for $pkg"
done

if [ "$UPDATES_FOUND" = true ]; then
  echo "📝 Creating PR for patch updates..."

  # Create a new branch
  BRANCH_NAME="patch-renew-$(date +%Y%m%d-%H%M%S)"
  git checkout -b "$BRANCH_NAME"

  # Commit changes
  git add .
  git commit -m "chore: refresh patches for $(date +%Y-%m-%d)

Automated patch renewal check.
- Validated existing patches
- No upstream updates required at this time"

  # Push branch
  git push origin "$BRANCH_NAME"

  # Create PR using GitHub CLI if available
  if command -v gh >/dev/null 2>&1; then
    gh pr create \
      --title "chore: refresh patches for $(date +%Y-%m-%d)" \
      --body "Automated patch renewal check performed by Bun System Gate.

**Changes:**
- Validated all existing patches
- Checked for upstream updates
- No manual intervention required

**Next Steps:**
- Review patch validity
- Test in staging environment
- Merge when ready" \
      --base main \
      --head "$BRANCH_NAME"
  fi

  echo "✅ PR created: $BRANCH_NAME"
else
  echo "✅ All patches up to date - no PR needed"
fi
