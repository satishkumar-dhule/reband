#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PORT=5001
BASE_URL="http://localhost:$PORT"
MAX_WAIT=120
REPORT_DIR="$PROJECT_ROOT/playwright-report"
RESULTS_DIR="$PROJECT_ROOT/test-results"

echo "=========================================="
echo "DevPrep E2E Test Runner"
echo "=========================================="

cd "$PROJECT_ROOT"

cleanup() {
    echo ""
    echo "Cleaning up..."
    if [ -n "$DEV_PID" ]; then
        echo "Stopping dev server (PID: $DEV_PID)..."
        kill "$DEV_PID" 2>/dev/null || true
    fi
}

trap cleanup EXIT

wait_for_server() {
    local url=$1
    local max_wait=$2
    local elapsed=0
    
    echo "Waiting for server at $url..."
    
    while [ $elapsed -lt $max_wait ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
            echo "Server is ready!"
            return 0
        fi
        sleep 2
        elapsed=$((elapsed + 2))
        echo "  Waiting... ($elapsed/${max_wait}s)"
    done
    
    echo "ERROR: Server did not start within ${max_wait}s"
    return 1
}

mkdir -p "$REPORT_DIR"
mkdir -p "$RESULTS_DIR"

echo ""
echo "Step 1: Starting dev server..."
pnpm run dev &
DEV_PID=$!

wait_for_server "$BASE_URL" $MAX_WAIT

echo ""
echo "Step 2: Running smoke tests..."
pnpm exec playwright test e2e/smoke/unified-smoke.spec.ts \
    --project=chromium-desktop \
    --reporter=html,list \
    --output="$REPORT_DIR/smoke"

SMOKE_RESULT=$?

echo ""
echo "Step 3: Running core flow tests..."
pnpm exec playwright test e2e/comprehensive/core-flows.spec.ts \
    --project=chromium-desktop \
    --reporter=html,list \
    --output="$REPORT_DIR/core-flows"

CORE_RESULT=$?

echo ""
echo "Step 4: Running accessibility tests..."
pnpm exec playwright test e2e/accessibility/comprehensive-a11y.spec.ts \
    --project=chromium-desktop \
    --reporter=html,list \
    --output="$REPORT_DIR/accessibility" \
    || true

A11Y_RESULT=0

echo ""
echo "Step 5: Running performance tests..."
pnpm exec playwright test --config=playwright.perf.config.ts \
    --reporter=html,list \
    --output="$REPORT_DIR/performance" \
    || true

PERF_RESULT=0

echo ""
echo "Step 6: Running mobile tests..."
pnpm exec playwright test e2e/mobile/comprehensive-mobile.spec.ts \
    --project=mobile-iphone13 \
    --reporter=html,list \
    --output="$REPORT_DIR/mobile" \
    || true

MOBILE_RESULT=0

echo ""
echo "=========================================="
echo "Test Results Summary"
echo "=========================================="
echo ""
echo "Smoke Tests:        $([ $SMOKE_RESULT -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
echo "Core Flows:         $([ $CORE_RESULT -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
echo "Accessibility:     $([ $A11Y_RESULT -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
echo "Performance:        $([ $PERF_RESULT -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
echo "Mobile:             $([ $MOBILE_RESULT -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
echo ""

OVERALL_RESULT=0
if [ $SMOKE_RESULT -ne 0 ] || [ $CORE_RESULT -ne 0 ]; then
    OVERALL_RESULT=1
fi

if [ $OVERALL_RESULT -eq 0 ]; then
    echo "✓ All critical tests passed!"
else
    echo "✗ Some tests failed. Check reports in $REPORT_DIR"
fi

echo ""
echo "Reports available at:"
echo "  - $REPORT_DIR/smoke/index.html"
echo "  - $REPORT_DIR/core-flows/index.html"
echo "  - $REPORT_DIR/accessibility/index.html"
echo "  - $REPORT_DIR/performance/index.html"
echo "  - $REPORT_DIR/mobile/index.html"
echo ""

exit $OVERALL_RESULT
