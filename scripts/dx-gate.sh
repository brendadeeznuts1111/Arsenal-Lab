#!/bin/bash
# 🚀 Bun 1.3 + System Gate - Developer Experience Setup Script
# Combines latest Bun runtime + governance in one command

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ARSENAL_URL="${ARSENAL_URL:-http://localhost:3655}"

echo -e "${BLUE}🚀 Bun 1.3 + System Gate - DX Setup${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Function to print status messages
status() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    warning "Running as root is not recommended for development setup"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install latest Bun if not present
install_bun() {
    if ! command -v bun &> /dev/null; then
        info "Installing latest Bun runtime..."

        # Install Bun using official installer
        curl -fsSL https://bun.sh/install | bash

        # Add Bun to current session PATH
        export PATH="$HOME/.bun/bin:$PATH"

        if ! command -v bun &> /dev/null; then
            error "Failed to install Bun. Please install manually: https://bun.sh"
        fi

        status "Latest Bun installed"
    else
        # Check if we need to update Bun
        current_version=$(bun --version)
        info "Bun is installed (version: $current_version)"

        # Optional: Check for updates (commented out to keep setup fast)
        # info "Checking for Bun updates..."
        # bun upgrade
    fi
}

# Install cosign for patch signing
install_cosign() {
    if ! command -v cosign &> /dev/null; then
        info "Installing cosign for cryptographic signing..."

        # Install cosign (macOS with Homebrew)
        if command -v brew &> /dev/null; then
            brew install cosign
        else
            # Manual installation for other platforms
            warning "Homebrew not found. Installing cosign manually..."

            # Detect platform
            if [[ "$OSTYPE" == "linux-gnu"* ]]; then
                COSIGN_URL="https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64"
            elif [[ "$OSTYPE" == "darwin"* ]]; then
                COSIGN_URL="https://github.com/sigstore/cosign/releases/latest/download/cosign-darwin-amd64"
            else
                error "Unsupported platform for automatic cosign installation"
            fi

            curl -L "$COSIGN_URL" -o /tmp/cosign
            chmod +x /tmp/cosign
            sudo mv /tmp/cosign /usr/local/bin/
        fi

        if ! command -v cosign &> /dev/null; then
            warning "Failed to install cosign. Patch signing will be unavailable."
        else
            status "cosign installed for cryptographic signing"
        fi
    else
        status "cosign is already installed"
    fi
}

# Configure Bun System Gate
configure_gate() {
    info "Configuring Bun System Gate..."

    # Create organization bunfig.toml
    mkdir -p ~/.bun
    cat > ~/.bun/bunfig.toml << EOF
# Bun 1.3 + System Gate - Developer Configuration
# Configured: $(date)
# Arsenal Lab: ${ARSENAL_URL}

[install.security]
scanner = "@bun/arsenal-security-scanner"

[arsenal.scanner]
api_url = "${ARSENAL_URL}"
cache_ttl = 3600
fail_open = true
block_level = "high"
verbose = false

# Bun 1.3 DX Enhancements
[console]
depth = 5

[run]
preload = ["./gate-setup.ts"]

# Developer settings
[developer]
dx_enabled = true
gate_enabled = true
bun_version = "$(bun --version 2>/dev/null || echo 'latest')"
setup_date = "$(date +%Y-%m-%d)"
EOF

    status "Bun System Gate configured"
}

# Configure environment variables
configure_environment() {
    info "Setting up Bun 1.3 + Gate environment variables..."

    # Add to shell profile
    shell_profile=""
    if [[ -n "$ZSH_VERSION" ]]; then
        shell_profile="$HOME/.zshrc"
    elif [[ -n "$BASH_VERSION" ]]; then
        shell_profile="$HOME/.bashrc"
    else
        shell_profile="$HOME/.profile"
    fi

    # Check if already configured
    if ! grep -q "BUN_OPTIONS.*--watch.*--hot" "$shell_profile" 2>/dev/null; then
        cat >> "$shell_profile" << 'EOF'

# Bun 1.3 + System Gate - Developer Environment
export BUN_OPTIONS="--watch --hot --console-depth=5 --user-agent=Arsenal-Lab/1.0"
export BUN_INSPECT_PRELOAD="./gate-setup.ts"
export ARSENAL_URL="http://localhost:3655"

# Developer aliases
alias b='bun --watch --hot --console-depth=5'
alias bx='bunx --package=@yourcompany/gate'
alias gate='bun run gate:validate'
alias gate-override='bun run gate:override --reason'

# Load Bun environment if available
[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"
EOF

        status "Environment variables added to $shell_profile"
        info "Run 'source $shell_profile' to load the new environment"
    else
        status "Environment variables already configured"
    fi
}

# Configure IDE settings
configure_ide() {
    info "Configuring IDE settings..."

    # Cursor (preferred)
    if [[ -d "$HOME/.config/cursor" ]]; then
        info "Configuring Cursor..."

        mkdir -p "$HOME/.config/cursor/User"
        cat > "$HOME/.config/cursor/User/settings.json" << EOF
{
  "bun.systemGate.enabled": true,
  "bun.systemGate.apiUrl": "${ARSENAL_URL}",
  "bun.systemGate.strictMode": true,
  "bun.systemGate.performanceHints": true,
  "bun.systemGate.dxMode": true,
  "terminal.integrated.env.linux": {
    "BUN_OPTIONS": "--watch --hot --console-depth=5",
    "BUN_INSPECT_PRELOAD": "./gate-setup.ts"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
EOF
        status "Cursor configured for Bun 1.3 + Gate"
    fi

    # VS Code (fallback)
    if [[ -d "$HOME/.vscode" ]] || command -v code &> /dev/null; then
        info "Configuring VS Code..."

        mkdir -p "$HOME/.vscode"
        cat > "$HOME/.vscode/settings.json" << EOF
{
  "bun.systemGate.enabled": true,
  "bun.systemGate.apiUrl": "${ARSENAL_URL}",
  "bun.systemGate.dxMode": true,
  "terminal.integrated.env.linux": {
    "BUN_OPTIONS": "--watch --hot --console-depth=5",
    "BUN_INSPECT_PRELOAD": "./gate-setup.ts"
  },
  "eslint.options": {
    "configFile": ".eslintrc.bun-gate.js"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
EOF
        status "VS Code configured for Bun 1.3 + Gate"
    fi
}

# Test the configuration
test_configuration() {
    info "Testing Bun 1.3 + Gate configuration..."

    # Test Bun
    if bun --version > /dev/null 2>&1; then
        status "Bun $(bun --version) is working correctly"
    else
        error "Bun is not working correctly"
    fi

    # Test cosign
    if command -v cosign &> /dev/null; then
        if cosign version > /dev/null 2>&1; then
            status "cosign is working correctly"
        else
            warning "cosign is installed but not working correctly"
        fi
    else
        info "cosign not available - patch signing will be unavailable"
    fi

    # Test Arsenal Lab connectivity (if running locally)
    if curl -s "${ARSENAL_URL}/api/health" > /dev/null 2>&1; then
        status "Arsenal Lab server is accessible"
    else
        info "Arsenal Lab server not detected (this is normal if not running locally)"
    fi
}

# Display success message
show_success() {
    echo ""
    echo -e "${GREEN}🎉 Bun 1.3 + System Gate Setup Complete!${NC}"
    echo ""
    echo -e "${BLUE}You now have:${NC}"
    echo "  🚀 Latest Bun runtime with 1.3 features"
    echo "  🛡️ FAANG-grade governance (invisible)"
    echo "  ⚡ Hot reload + deep console logging"
    echo "  🔐 Cryptographic patch signing"
    echo "  📊 Real-time security scanning"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. source ~/.bashrc  # Load new environment"
    echo "  2. Restart your IDE"
    echo "  3. Try: bun add lodash  # Should work perfectly"
    echo ""
    echo -e "${BLUE}Test it:${NC}"
    echo "  b --version          # Bun 1.3 + governance"
    echo "  gate                 # 2-second safety check"
    echo "  b add some-package   # Governed installation"
    echo ""
    echo -e "${GREEN}🚀 Happy coding with Bun 1.3 + Enterprise Security!${NC}"
    echo ""
    echo -e "${BLUE}📖 Documentation:${NC}"
    echo "  DX Cheat Sheet: https://github.com/brendadeeznuts1111/Arsenal-Lab/blob/main/DX-GATE-CHEAT-SHEET.md"
    echo "  Governance Guide: https://github.com/brendadeeznuts1111/Arsenal-Lab/blob/main/DEVELOPER-CHEAT-SHEET.md"
}

# Main setup function
main() {
    echo "Setting up Bun 1.3 + System Gate for $(whoami)..."
    echo ""

    install_bun
    install_cosign
    configure_gate
    configure_environment
    configure_ide
    test_configuration
    show_success
}

# Run main function
main "$@"
