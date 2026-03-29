#!/bin/bash
# Simple Endless Swarm QA

AGENT_COUNT=10
LOOP_DELAY=15

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"; }
log_ok() { echo -e "${GREEN}[$(date +'%H:%M:%S')]✅${NC} $*"; }
log_err() { echo -e "${RED}[$(date +'%H:%M:%S')]❌${NC} $*"; }
log_work() { echo -e "${MAGENTA}[$(date +'%H:%M:%S')]📦${NC} $*"; }

test_suite="e2e/tests.spec.ts"

WORK_TASKS=(
    "devprep-question-expert:Generate 5 new system design interview questions"
    "devprep-flashcard-expert:Create 10 flashcards for algorithms"
    "devprep-coding-expert:Generate a coding challenge with test cases"
    "devprep-blog-generator:Write a blog post about interview prep tips"
)

spawn_work() {
    local task="${WORK_TASKS[$((RANDOM % ${#WORK_TASKS[@]}))]}"
    local agent_type="${task%%:*}"
    local task_desc="${task#*:}"
    log_work "Spawning $agent_type..."
    nohup opencode run --agent "$agent_type" "$task_desc" > /tmp/work-${agent_type}-$(date +%s).log 2>&1 &
}

run_tests() {
    local iteration=$1
    
    echo ""
    log "═══════════════════════════════════════════════════════════"
    log "  🚀 ITERATION $iteration - $AGENT_COUNT parallel agents"
    log "═══════════════════════════════════════════════════════════"
    
    for i in $(seq 1 $AGENT_COUNT); do
        (
            if npx playwright test "$test_suite" --project=chromium-desktop --reporter=line --timeout=30000 2>&1 | grep -q "passed"; then
                echo "passed"
            else
                echo "failed"
            fi
        ) > /tmp/result-$i.txt 2>&1 &
    done
    
    local passed=0
    local failed=0
    
    for i in $(seq 1 $AGENT_COUNT); do
        wait %$i 2>/dev/null || true
        local result=$(cat /tmp/result-$i.txt | tr -d '\n')
        
        if [[ "$result" == *"passed"* ]]; then
            ((passed++))
            log_ok "Agent-$i: PASSED"
        else
            ((failed++))
            log_err "Agent-$i: FAILED"
        fi
        
        # Random chance to spawn work agent
        if [[ $((RANDOM % 2)) -eq 0 ]]; then
            spawn_work
        fi
    done
    
    log "📊 Iteration $iteration: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
}

main() {
    log "🐝 ENDLESS SWARM QA - $AGENT_COUNT agents"
    echo ""
    
    local iteration=0
    while true; do
        iteration=$((iteration + 1))
        run_tests "$iteration"
        log "Sleeping ${LOOP_DELAY}s..."
        sleep $LOOP_DELAY
    done
}

main 2>&1 | tee -a /tmp/swarm.log
