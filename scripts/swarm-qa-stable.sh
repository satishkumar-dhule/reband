#!/bin/bash
# Stable Endless Swarm QA - Sequential but continuous

LOOP_DELAY=20

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
    log "🐝 ENDLESS SWARM QA - Running continuously"
    echo ""
    
    local iteration=0
    while true; do
        iteration=$((iteration + 1))
        
        echo ""
        log "═══════════════════════════════════════════════════════════"
        log "  🚀 ITERATION $iteration"
        log "═══════════════════════════════════════════════════════════"
        
        # Run 10 test "agents" sequentially
        local passed=0
        for i in $(seq 1 10); do
            if run_test "$i"; then
                ((passed++))
            fi
            
            # 50% chance to spawn work agent after each test
            if [[ $((RANDOM % 2)) -eq 0 ]]; then
                spawn_work
            fi
        done
        
        log "📊 Iteration $iteration: $passed/10 passed"
        
        # Spawn additional work based on results
        if [[ $passed -eq 10 ]]; then
            spawn_work
            spawn_work
        else
            log_work "Spawning code reviewer..."
            opencode run --agent "devprep-code-reviewer" "Review recent test failures" > /tmp/work-review.log 2>&1 &
        fi
        
        log "Sleeping ${LOOP_DELAY}s..."
        sleep $LOOP_DELAY
    done
}

main 2>&1 | tee -a /tmp/swarm-stable.log
