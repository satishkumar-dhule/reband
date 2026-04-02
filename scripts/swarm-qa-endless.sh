#!/bin/bash
# Endless Swarm QA - 10 parallel agents running tests continuously

AGENT_COUNT=10
LOOP_DELAY=20

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"; }
log_ok() { echo -e "${GREEN}[$(date +'%H:%M:%S')]✅${NC} $*"; }
log_err() { echo -e "${RED}[$(date +'%H:%M:%S')]❌${NC} $*"; }
log_work() { echo -e "${MAGENTA}[$(date +'%H:%M:%S')]📦${NC} $*"; }

test_suites=(
    "e2e/tests.spec.ts"
    "e2e/unified/test-session.spec.ts"
)

WORK_TASKS=(
    "devprep-question-expert:Generate 5 new system design interview questions"
    "devprep-flashcard-expert:Create 10 flashcards for algorithms and data structures"
    "devprep-coding-expert:Generate a coding challenge with test cases"
    "devprep-blog-generator:Write a blog post about technical interview tips"
    "devprep-ui-ux-expert:Review the homepage UI and suggest improvements"
)

run_parallel_tests() {
    local iteration=$1
    
    echo ""
    log "═══════════════════════════════════════════════════════════"
    log "  🚀 ITERATION $iteration - $AGENT_COUNT QA Agents (parallel)"
    log "═══════════════════════════════════════════════════════════"
    
    local pids=()
    local results=()
    
    for i in $(seq 1 $AGENT_COUNT); do
        local suite="${test_suites[$((i % 2))]}"
        
        (
            local result
            if npx playwright test "$suite" --project=chromium-desktop --reporter=line --timeout=30000 2>&1 | grep -q "passed"; then
                echo "passed"
            else
                echo "failed"
            fi
        ) > /tmp/agent-result-$i.txt 2>&1 &
        pids+=($!)
    done
    
    local passed=0
    local failed=0
    
    for i in "${!pids[@]}"; do
        wait "${pids[$i]}" || true
        local result=$(cat /tmp/agent-result-$((i+1)).txt 2>/dev/null | tr -d '\n')
        
        if [[ "$result" == "passed" ]]; then
            ((passed++))
            log_ok "Agent-$((i+1)): PASSED"
        else
            ((failed++))
            log_err "Agent-$((i+1)): FAILED"
        fi
        
        # Generate work based on result
        if [[ "$result" == "passed" ]]; then
            local task="${WORK_TASKS[$((RANDOM % ${#WORK_TASKS[@]}))]}"
            local agent_type="${task%%:*}"
            local task_desc="${task#*:}"
            log_work "Spawning $agent_type..."
            nohup opencode run --agent "$agent_type" "$task_desc" > /tmp/work-${agent_type}-$(date +%s).log 2>&1 &
        else
            log_work "Spawning devprep-code-reviewer..."
            nohup opencode run --agent "devprep-code-reviewer" "Review code and fix test failures" > /tmp/work-review-$(date +%s).log 2>&1 &
        fi
    done
    
    log "📊 Results: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
    
    # Count background work agents
    local work_count=$(jobs -p 2>/dev/null | wc -l)
    if [[ "$work_count" -gt 0 ]]; then
        log "📦 $work_count work agents running in background"
    fi
}

main() {
    log "🐝 ENDLESS SWARM QA SYSTEM"
    log "• $AGENT_COUNT parallel test agents"
    log "• Work agents spawned based on results"
    echo ""
    
    local iteration=0
    while true; do
        iteration=$((iteration + 1))
        run_parallel_tests "$iteration"
        log "Sleeping ${LOOP_DELAY}s..."
        sleep $LOOP_DELAY
    done
}

main 2>&1 | tee -a /tmp/swarm-endless.log
