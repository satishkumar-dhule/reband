#!/bin/bash
# Fast Swarm QA - Optimized for speed
# 10 QA Agents running E2E tests infinitely with work generation

set -e

AGENT_COUNT=10
LOOP_DELAY=30

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
log_work() { echo -e "${MAGENTA}[$(date +'%H:%M:%S')]📦${NC} $*"; }

test_suites=(
    "e2e/tests.spec.ts"
    "e2e/unified/test-session.spec.ts"
)

WORK_TASKS=(
    "devprep-question-expert:Generate 5 new system design interview questions"
    "devprep-flashcard-expert:Create 10 flashcards for algorithms"
    "devprep-coding-expert:Generate a coding challenge with test cases"
    "devprep-blog-generator:Write a blog post about interview prep tips"
)

ensure_dev_server() {
    if ! curl -s http://localhost:5001 > /dev/null 2>&1; then
        log_warn "Starting dev server..."
        npm run dev > /tmp/dev.log 2>&1 &
        sleep 10
    fi
}

run_e2e_test() {
    local agent_id=$1
    local suite=$2
    
    if npx playwright test "$suite" --project=chromium --reporter=line --timeout=30000 2>&1 | grep -q "passed"; then
        echo "passed"
    else
        echo "failed"
    fi
}

spawn_work_agent() {
    local agent_type=$1
    local task=$2
    
    log_work "Spawning $agent_type: $task"
    
    nohup opencode run --agent "$agent_type" "$task" > /tmp/work-${agent_type}-$(date +%s).log 2>&1 &
}

generate_work() {
    local test_result=$1
    
    if [[ "$test_result" == "failed" ]]; then
        log_err "Tests failed - spawning review agents..."
        spawn_work_agent "devprep-code-reviewer" "Review recent code for best practices"
    else
        local task_entry="${WORK_TASKS[$((RANDOM % ${#WORK_TASKS[@]}))]}"
        local agent_type="${task_entry%%:*}"
        local task="${task_entry#*:}"
        spawn_work_agent "$agent_type" "$task"
    fi
}

run_iteration() {
    local iteration=$1
    
    echo ""
    log "═══════════════════════════════════════════════════════════"
    log "  🚀 ITERATION $iteration - $AGENT_COUNT QA Agents"
    log "═══════════════════════════════════════════════════════════"
    
    local passed=0
    local failed=0
    
    for i in $(seq 1 $AGENT_COUNT); do
        local suite_idx=$((i % ${#test_suites[@]}))
        local suite="${test_suites[$suite_idx]}"
        
        log "Agent-$i: Testing $suite"
        
        if run_e2e_test "$i" "$suite" | grep -q "passed\|✓"; then
            ((passed++))
            log_ok "Agent-$i: PASSED"
        else
            ((failed++))
            log_err "Agent-$i: FAILED"
        fi
        
        generate_work "$test_result"
    done
    
    log "📊 Results: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
}

main() {
    log "🐝 FAST SWARM QA SYSTEM"
    ensure_dev_server
    
    local iteration=0
    while true; do
        iteration=$((iteration + 1))
        run_iteration "$iteration"
        log "Sleeping ${LOOP_DELAY}s..."
        sleep $LOOP_DELAY
    done
}

trap 'log "Stopping swarm..."; pkill -f swarm-qa; exit 0' SIGINT SIGTERM

main
