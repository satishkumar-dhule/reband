#!/bin/bash
# Swarm QA with Opencode Agent Spawning
# 10 QA Agents running E2E tests infinitely
# Generates real work for other opencode agents

set -e

AGENT_COUNT=10
LOOP_DELAY=15

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"; }
log_ok() { echo -e "${GREEN}[$(date +'%H:%M:%S')]✅${NC} $*"; }
log_warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')]⚠️${NC} $*"; }
log_err() { echo -e "${RED}[$(date +'%H:%M:%S')]❌${NC} $*"; }
log_agent() { echo -e "${CYAN}[$(date +'%H:%M:%S')]🤖${NC} $*"; }
log_work() { echo -e "${MAGENTA}[$(date +'%H:%M:%S')]📦${NC} $*"; }

test_suites=(
    "e2e/tests.spec.ts"
    "e2e/unified/test-session.spec.ts"
    "e2e/test-helper-verification.spec.ts"
    "e2e/test-touch-target-helpers.spec.ts"
    "e2e/test-overlap-helpers.spec.ts"
)

WORK_TASKS=(
    "devprep-question-expert:Generate 5 new system design interview questions"
    "devprep-flashcard-expert:Create 10 flashcards for algorithms"
    "devprep-coding-expert:Generate a coding challenge with test cases"
    "devprep-blog-generator:Write a blog post about interview prep tips"
    "devprep-ui-ux-expert:Review the homepage UI for improvements"
    "devprep-seo-audit:Run a quick SEO audit of the homepage"
)

ensure_dev_server() {
    if ! curl -s http://localhost:5001 > /dev/null 2>&1; then
        log_warn "Dev server not running, starting..."
        npm run dev > /dev/null 2>&1 &
        sleep 8
    fi
}

run_e2e_test() {
    local agent_id=$1
    local suite=$2
    
    log "Agent-$agent_id: Running $suite"
    
    if npx playwright test "$suite" --reporter=list --timeout=60000 > /tmp/agent-${agent_id}.log 2>&1; then
        echo "passed"
    else
        echo "failed"
    fi
}

spawn_work_agent() {
    local agent_type=$1
    local task=$2
    
    log_work "Spawning $agent_type: $task"
    
    # Run in background to not block the main loop
    (
        opencode run --agent "$agent_type" "$task" > /tmp/work-${agent_type}-$(date +%s).log 2>&1 || true
        log_ok "Completed: $agent_type"
    ) &
}

generate_work() {
    local test_result=$1
    
    if [[ "$test_result" == "failed" ]]; then
        log_err "Tests failed - spawning review agents..."
        spawn_work_agent "devprep-code-reviewer" "Review the latest E2E test failures and suggest fixes"
        spawn_work_agent "devprep-web-reviewer" "Check for UI regressions in the test output"
    else
        log_ok "Tests passed - spawning content agents..."
        
        # Randomly spawn 1-2 work agents
        local num_work=$((RANDOM % 2 + 1))
        
        for i in $(seq 1 $num_work); do
            local task_entry="${WORK_TASKS[$((RANDOM % ${#WORK_TASKS[@]}))]}"
            local agent_type="${task_entry%%:*}"
            local task="${task_entry#*:}"
            
            spawn_work_agent "$agent_type" "$task"
        done
    fi
}

run_iteration() {
    local iteration=$1
    local pids=()
    local results=()
    
    echo ""
    log "═══════════════════════════════════════════════════════════"
    log "  🚀 ITERATION $iteration - $AGENT_COUNT QA Agents Running"
    log "═══════════════════════════════════════════════════════════"
    
    for i in $(seq 1 $AGENT_COUNT); do
        local suite_idx=$(( (i + iteration) % ${#test_suites[@]} ))
        local suite="${test_suites[$suite_idx]}"
        
        (
            result=$(run_e2e_test "$i" "$suite")
            echo "$result" > /tmp/result-$i.txt
        ) &
        pids+=($!)
    done
    
    local passed=0
    local failed=0
    
    for i in "${!pids[@]}"; do
        wait "${pids[$i]}" || true
        local result=$(cat /tmp/result-$((i+1)).txt 2>/dev/null || echo "unknown")
        
        if [[ "$result" == "passed" ]]; then
            ((passed++))
        else
            ((failed++))
        fi
        
        generate_work "$result"
    done
    
    echo ""
    log "📊 Results: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
    
    # Summary of spawned work
    local work_count=$(jobs -p 2>/dev/null | wc -l)
    if [[ "$work_count" -gt 0 ]]; then
        log "📦 $work_count work agents spawned in background"
    fi
}

main() {
    log "🐝 SWARM QA SYSTEM WITH OPENCODE AGENTS"
    log "• $AGENT_COUNT QA Agents running E2E tests in parallel"
    log "• Work agents spawned based on test results"
    log "Press Ctrl+C to stop"
    echo ""
    
    ensure_dev_server
    
    local iteration=0
    while true; do
        iteration=$((iteration + 1))
        run_iteration "$iteration"
        log "Sleeping ${LOOP_DELAY}s before next iteration..."
        sleep $LOOP_DELAY
    done
}

trap 'log "Shutting down swarm..."; pkill -P $$ 2>/dev/null; exit 0' SIGINT SIGTERM

main
