#!/bin/bash
# Swarm QA - 10 Iterations

LOOP_DELAY=20
MAX_ITERATIONS=10

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"; }
log_ok() { echo -e "${GREEN}[$(date +'%H:%M:%S')]✅${NC} $*"; }
log_err() { echo -e "${RED}[$(date +'%H:%M:%S')]❌${NC} $*"; }
log_work() { echo -e "${MAGENTA}[$(date +'%H:%M:%S')]📦${NC} $*"; }

WORK_TASKS=(
    "devprep-question-expert:Generate 5 new system design interview questions"
    "devprep-flashcard-expert:Create 10 flashcards for algorithms"
    "devprep-coding-expert:Generate a coding challenge with test cases"
    "devprep-blog-generator:Write a blog post about interview tips"
    "devprep-ui-ux-expert:Review homepage UI"
)

spawn_work() {
    local task="${WORK_TASKS[$((RANDOM % ${#WORK_TASKS[@]}))]}"
    local agent_type="${task%%:*}"
    local task_desc="${task#*:}"
    log_work "Spawning $agent_type..."
    opencode run --agent "$agent_type" "$task_desc" > /tmp/work-${agent_type}-$(date +%s).log 2>&1 &
}

run_test() {
    local agent_num=$1
    log "Agent-$agent_num: Running E2E tests..."
    
    if npx playwright test e2e/tests.spec.ts --project=chromium-desktop --reporter=line --timeout=30000 2>&1; then
        log_ok "Agent-$agent_num: PASSED"
        return 0
    else
        log_err "Agent-$agent_num: FAILED"
        return 1
    fi
}

main() {
    log "🐝 SWARM QA - $MAX_ITERATIONS iterations"
    echo ""
    
    local total_passed=0
    local total_failed=0
    
    for iteration in $(seq 1 $MAX_ITERATIONS); do
        echo ""
        log "═══════════════════════════════════════════════════════════"
        log "  🚀 ITERATION $iteration / $MAX_ITERATIONS"
        log "═══════════════════════════════════════════════════════════"
        
        local passed=0
        for i in $(seq 1 10); do
            if run_test "$i"; then
                ((passed++))
                ((total_passed++))
            else
                ((total_failed++))
            fi
            
            if [[ $((RANDOM % 2)) -eq 0 ]]; then
                spawn_work
            fi
        done
        
        log "📊 Iteration $iteration: $passed/10 passed"
        
        if [[ $passed -eq 10 ]]; then
            spawn_work
            spawn_work
        else
            log_work "Spawning code reviewer..."
            opencode run --agent "devprep-code-reviewer" "Review test failures" > /tmp/work-review.log 2>&1 &
        fi
        
        if [[ $iteration -lt $MAX_ITERATIONS ]]; then
            log "Sleeping ${LOOP_DELAY}s..."
            sleep $LOOP_DELAY
        fi
    done
    
    echo ""
    log "═══════════════════════════════════════════════════════════"
    log "  🎉 COMPLETED $MAX_ITERATIONS ITERATIONS"
    log "═══════════════════════════════════════════════════════════"
    log "📈 Total: $total_passed passed, $total_failed failed"
}

main 2>&1 | tee /tmp/swarm-10.log
