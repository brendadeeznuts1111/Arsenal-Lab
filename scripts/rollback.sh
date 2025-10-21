#!/bin/bash
# scripts/rollback.sh
set -e

TARGET_VERSION=${1:-"HEAD~1"}
PATCH_FILE=${2:-"arsenal-rollback.patch"}

echo "🔄 Rolling back to ${TARGET_VERSION}..."

# Create a patch that reverts changes
git diff ${TARGET_VERSION}..HEAD > "${PATCH_FILE}"

echo "📋 Rollback patch created: ${PATCH_FILE}"
echo "To apply rollback: git apply ${PATCH_FILE}"
echo "Or one-liner: curl -fsSL https://example.com/${PATCH_FILE} | git apply -R"

# Optional: Apply the rollback immediately if --apply flag is used
if [ "$2" = "--apply" ]; then
    echo "🔧 Applying rollback..."
    git apply "${PATCH_FILE}"
    echo "✅ Rollback applied!"
fi
