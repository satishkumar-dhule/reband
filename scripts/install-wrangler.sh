#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

detect_os() {
    log_info "Detecting operating system..."
    
    OS_TYPE=""
    OS_DISTRO=""
    
    case "$(uname -s)" in
        Linux*)
            OS_TYPE="linux"
            if [ -f /etc/os-release ]; then
                . /etc/os-release
                OS_DISTRO="${ID:-unknown}"
            fi
            ;;
        Darwin*)
            OS_TYPE="macos"
            ;;
        MINGW*|MSYS*|CYGWIN*)
            OS_TYPE="windows"
            ;;
        *)
            OS_TYPE="unknown"
            ;;
    esac
    
    export OS_TYPE OS_DISTRO
    log_success "OS detected: ${OS_TYPE} ${OS_DISTRO:+"($OS_DISTRO)"}"
}

detect_package_managers() {
    log_info "Detecting available package managers..."
    
    local managers=()
    
    if command -v npm &> /dev/null; then
        managers+=("npm:$(npm --version)")
        NPM_AVAILABLE=true
    else
        NPM_AVAILABLE=false
    fi
    
    if command -v yarn &> /dev/null; then
        managers+=("yarn:$(yarn --version)")
    fi
    
    if command -v pnpm &> /dev/null; then
        managers+=("pnpm:$(pnpm --version)")
    fi
    
    if command -v brew &> /dev/null; then
        managers+=("brew:$(brew --version 2>/dev/null | head -1)")
        BREW_AVAILABLE=true
    else
        BREW_AVAILABLE=false
    fi
    
    if command -v cargo &> /dev/null; then
        managers+=("cargo:$(cargo --version 2>/dev/null | cut -d' ' -f2)")
    fi
    
    if [ ${#managers[@]} -eq 0 ]; then
        log_error "No package managers detected!"
        return 1
    fi
    
    log_success "Available package managers:"
    for mgr in "${managers[@]}"; do
        IFS=':' read -r name version <<< "$mgr"
        echo "  - $name: $version"
    done
}

check_node_version() {
    if command -v node &> /dev/null; then
        local node_version=$(node --version | sed 's/v//')
        local major=$(echo "$node_version" | cut -d. -f1)
        
        if [ "$major" -lt 18 ]; then
            log_warn "Node.js version $node_version detected. Wrangler requires Node.js 18+."
            return 1
        fi
        log_info "Node.js version: $node_version"
        return 0
    else
        log_warn "Node.js not detected. Installing Wrangler via npm requires Node.js."
        return 1
    fi
}

install_nodejs_if_needed() {
    if [ -n "${FORCE_SKIP_NODE:-}" ]; then
        return 0
    fi
    
    if ! command -v node &> /dev/null; then
        log_warn "Node.js is not installed. Installing Node.js..."
        
        case "$OS_TYPE" in
            linux)
                if [ "$OS_DISTRO" = "debian" ] || [ "$OS_DISTRO" = "ubuntu" ] || [ -f /etc/debian_version ]; then
                    log_info "Installing Node.js via apt..."
                    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
                    sudo apt-get install -y nodejs
                elif [ "$OS_DISTRO" = "fedora" ] || command -v dnf &> /dev/null; then
                    log_info "Installing Node.js via dnf..."
                    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash - > /dev/null 2>&1
                    sudo dnf install -y nodejs
                elif [ "$OS_DISTRO" = "arch" ] || command -v pacman &> /dev/null; then
                    log_info "Installing Node.js via pacman..."
                    sudo pacman -Sy --noconfirm nodejs npm
                else
                    log_info "Installing Node.js via package manager..."
                    if $NPM_AVAILABLE; then
                        sudo apt-get update && sudo apt-get install -y nodejs npm 2>/dev/null || \
                        sudo dnf install -y nodejs npm 2>/dev/null || \
                        sudo apk add nodejs npm 2>/dev/null || \
                        sudo yum install -y nodejs npm 2>/dev/null
                    fi
                fi
                ;;
            macos)
                if $BREW_AVAILABLE; then
                    log_info "Installing Node.js via Homebrew..."
                    brew install node
                else
                    log_error "Homebrew not found. Please install Node.js manually from nodejs.org"
                    return 1
                fi
                ;;
            windows)
                log_error "Please install Node.js from https://nodejs.org on Windows"
                return 1
                ;;
        esac
        
        if command -v node &> /dev/null; then
            log_success "Node.js installed: $(node --version)"
        else
            log_error "Failed to install Node.js"
            return 1
        fi
    fi
}

install_wrangler() {
    log_info "Installing Cloudflare Wrangler CLI..."
    
    local install_method=""
    local success=false
    
    if $NPM_AVAILABLE && check_node_version 2>/dev/null; then
        install_method="npm"
        log_info "Installing via npm (recommended method)..."
        
        if npm install -g wrangler 2>&1; then
            success=true
        fi
    fi
    
    if [ "$success" = false ] && $BREW_AVAILABLE; then
        install_method="brew"
        log_info "Installing via Homebrew..."
        
        if command -v wrangler &> /dev/null; then
            log_info "Updating existing installation via Homebrew..."
            brew upgrade wrangler 2>/dev/null || brew install wrangler
        else
            brew install wrangler
        fi
        
        if command -v wrangler &> /dev/null; then
            success=true
        fi
    fi
    
    if [ "$success" = false ]; then
        log_error "Failed to install Wrangler"
        log_info "Try manual installation:"
        echo "  npm install -g wrangler"
        echo "  or"
        echo "  npx wrangler login"
        return 1
    fi
    
    log_success "Wrangler installed successfully via $install_method"
}

verify_installation() {
    log_info "Verifying Wrangler installation..."
    
    if command -v wrangler &> /dev/null; then
        local version=$(wrangler --version 2>/dev/null || echo "unknown")
        log_success "Wrangler version: $version"
        return 0
    else
        log_error "Wrangler command not found in PATH"
        log_info "You may need to:"
        echo "  - Restart your terminal"
        echo "  - Add npm global bin to PATH:"
        echo "    Linux/macOS: export PATH=\"\$(npm config get prefix)/bin:\$PATH\""
        echo "    Add this to ~/.bashrc or ~/.zshrc to persist"
        return 1
    fi
}

show_login_command() {
    echo ""
    log_info "=========================================="
    log_info "Next Steps:"
    echo ""
    echo "To authenticate with Cloudflare:"
    echo ""
    echo -e "  ${GREEN}wrangler login${NC}"
    echo ""
    echo "This will open your browser to authenticate."
    echo ""
    echo "Or use Wrangler directly:"
    echo ""
    echo "  wrangler whoami    # Check authentication status"
    echo "  wrangler deploy   # Deploy your Workers"
    echo "  wrangler dev      # Start local dev server"
    echo ""
    log_info "=========================================="
}

main() {
    echo ""
    echo "============================================"
    echo "  Cloudflare Wrangler CLI Installer"
    echo "============================================"
    echo ""
    
    detect_os
    detect_package_managers
    
    echo ""
    install_nodejs_if_needed || true
    echo ""
    
    install_wrangler
    echo ""
    
    verify_installation || true
    show_login_command
}

main "$@"
