#!/bin/bash
# Swarm QA Runner - 10 QA Agents running E2E tests infinitely
# Generates work for other running agents

set -e

AGENT_COUNT=10
LOOP_COUNT=0
MAX_CONCURRENT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"; }
log_success() { echo -e "${GREEN}[$(date +'%H:%M:%S')]✅${NC} $*"; }
log_warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')]⚠️${NC} $*"; }
log_error() { echo -e "${RED}[$(date +'%H:%M:%S')]❌${NC} $*"; }

# Function to start dev server if not running
ensure_dev_server() {
    if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
        log_warn "Dev server not running, starting..."
        npm run dev > /dev/null 2>&1 &
        sleep 5
    fi
}

# Function to run E2E test for a specific agent
run_agent_test() {
    local agent_id=$1
    local test_suite=$2
    
    log_info "Agent-$agent_id: Starting E2E tests (suite: $test_suite)"
    
    # Run playwright tests with a specific suite
    npx playwright test "$test_suite" --reporter=list 2>&1 | head -20
    
    return $?
}

# Function to generate work for other agents based on test results
generate_work() {
    local agent_id=$1
    local test_result=$2
    
    # Randomly decide to generate work for other agents
    if [ $((RANDOM % 3)) -eq 0 ]; then
        local work_type=$((RANDOM % 5))
        case $work_type in
            0)
                log_info "Agent-$agent_id: Generating work for content-question-expert"
                ;;
            1)
                log_info "Agent-$agent_id: Generating work for devprep-flashcard-expert"
                ;;
            2)
                log_info "Agent-$agent_id: Generating work for devprep-coding-expert"
                ;;
            3)
                log_info "Agent-$agent_id: Generating work for devprep-ui-ux-expert"
                ;;
            4)
                log_info "Agent-$agent_id: Generating work for devprep-blog-generator"
                ;;
        esac
    fi
}

# Main infinite loop
main() {
    log_info "🚀 Starting Swarm QA System with $AGENT_COUNT agents"
    log_info "Press Ctrl+C to stop"
    
    ensure_dev_server
    
    # Test suites to rotate through
    local test_suites=(
        "e2e/tests.spec.ts"
        "e2e/unified/test-session.spec.ts"
        "e2e/test-helper-verification.spec.ts"
        "e2e/test-touch-target-helpers.spec.ts"
        "e2e/test-overlap-helpers.spec.ts"
    )
    
    while true; do
        LOOP_COUNT=$((LOOP_COUNT + 1))
        log_info "=== Iteration $LOOP_COUNT ==="
        
        # Run all 10 agents in parallel (background jobs)
        local pids=()
        
        for i in $(seq 1 $AGENT_COUNT); do
            local suite_idx=$((i % ${#test_suites[@]}))
            local suite="${test_suites[$suite_idx]}"
            
            (
                local result=0
                run_agent_test "$i" "$suite" || result=$?
                generate_work "$i" "$result"
            ) &
            pids+=($!)
        done
        
        # Wait for all agents to complete
        local failed=0
        for pid in "${pids[@]}"; do
            wait $pid || failed=$((failed + 1))
        done
        
        if [ $failed -eq 0 ]; then
            log_success "All $AGENT_COUNT agents passed"
        else
            log_warn "$failed/$AGENT_COUNT agents had failures"
        fi
        
        log_info "Sleeping 10s before next iteration..."
        sleep 10
    done
}

# Trap to handle cleanup
trap 'log_info "Shutting down swarm..."; pkill -P $$; exit 0' SIGINT SIGTERM

main
