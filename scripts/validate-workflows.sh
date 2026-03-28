#!/bin/bash
# Workflow validation script for GitHub Actions
# Usage: ./scripts/validate-workflows.sh [--fix]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_DIR=".github/workflows"
ACT_BIN="${HOME}/.local/bin/act"
ACTIONLINT_BIN="${HOME}/.local/bin/actionlint"

echo "🔍 DevPrep Workflow Validator"
echo "=============================="

# Install act if needed
install_act() {
    if [ ! -f "$ACT_BIN" ]; then
        echo "📦 Installing act..."
        curl -sL https://github.com/nektos/act/releases/download/v0.2.86/act_Linux_x86_64.tar.gz | tar xz -C /tmp
        mkdir -p "${HOME}/.local/bin"
        mv /tmp/act "${ACT_BIN}"
        chmod +x "$ACT_BIN"
    fi
}

# Install actionlint if needed
install_actionlint() {
    if [ ! -f "$ACTIONLINT_BIN" ]; then
        echo "📦 Installing actionlint..."
        cd /tmp
        curl -sSfL https://github.com/rhysd/actionlint/releases/download/v1.7.4/actionlint_1.7.4_linux_amd64.tar.gz -o actionlint.tar.gz
        tar -xzf actionlint.tar.gz
        mkdir -p "${HOME}/.local/bin"
        mv actionlint "${ACTIONLINT_BIN}"
        chmod +x "$ACTIONLINT_BIN"
        cd - > /dev/null
    fi
}

# Install dependencies
install_act
install_actionlint

echo ""
echo "1️⃣ Running act --dryrun (workflow structure validation)..."
echo "--------------------------------------------------------"
if "$ACT_BIN" --dryrun --list 2>&1; then
    echo "✅ act validation passed"
else
    echo "❌ act validation failed"
fi

echo ""
echo "2️⃣ Running actionlint (static analysis)..."
echo "----------------------------------------"
if "$ACTIONLINT_BIN" "${WORKFLOW_DIR}"/*.yml 2>&1; then
    echo "✅ actionlint passed"
else
    echo "❌ actionlint found issues"
    if [ "$1" == "--fix" ]; then
        echo "💡 Run 'actionlint -w' to auto-fix some issues"
    fi
fi

echo ""
echo "=============================="
echo "✅ Validation complete"
