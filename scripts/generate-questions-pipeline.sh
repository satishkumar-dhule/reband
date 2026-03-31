#!/bin/bash
# =============================================================================
# DevPrep Question Generation Pipeline
# Uses opencode run --agent content-question-expert to generate questions
# for each channel that has fewer than MIN_QUESTIONS questions.
# =============================================================================

set -euo pipefail

OPENCODE="/home/runner/workspace/.config/npm/node_global/bin/opencode"
API_BASE="http://localhost:5000"
MIN_QUESTIONS=5
TIMEOUT_SECS=180  # 3 min per channel

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log()      { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"; }
log_ok()   { echo -e "${GREEN}[$(date +'%H:%M:%S')] ✓${NC} $*"; }
log_warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $*"; }
log_err()  { echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $*"; }
log_info() { echo -e "${CYAN}[$(date +'%H:%M:%S')] →${NC} $*"; }

# All non-certification channels (source of truth: channels-config.ts)
ALL_CHANNELS=(
  "algorithms"
  "data-structures"
  "complexity-analysis"
  "dynamic-programming"
  "bit-manipulation"
  "design-patterns"
  "concurrency"
  "math-logic"
  "low-level"
  "system-design"
  "frontend"
  "backend"
  "database"
  "devops"
  "sre"
  "kubernetes"
  "aws"
  "terraform"
  "data-engineering"
  "machine-learning"
  "generative-ai"
  "prompt-engineering"
  "llm-ops"
  "computer-vision"
  "nlp"
  "python"
  "security"
  "networking"
  "operating-systems"
  "linux"
  "unix"
  "ios"
  "android"
  "react-native"
  "testing"
  "e2e-testing"
  "api-testing"
  "performance-testing"
  "engineering-management"
  "behavioral"
)

get_channel_counts() {
  curl -s "$API_BASE/api/channels" 2>/dev/null || echo "[]"
}

get_count_for_channel() {
  local channel=$1
  local data=$2
  echo "$data" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for item in data:
    if item.get('id') == '$channel':
        print(item.get('questionCount', 0))
        exit()
print('0')
" 2>/dev/null || echo "0"
}

build_prompt() {
  local channel=$1
  local needed=$2

  cat <<PROMPT
You are a senior engineering interviewer for DevPrep, a technical interview prep platform.

TASK: Generate exactly $needed high-quality interview questions for the "$channel" channel and INSERT them into the local SQLite database.

STEP 1 — Read these files to understand the schema and DB client:
  - shared/schema.ts  (questions table — note exact SQL column names)
  - server/db.ts      (uses @libsql/client with url "file:local.db")

STEP 2 — Write a TypeScript script at /tmp/seed-${channel}.ts:

```typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";

const client = createClient({ url: "file:local.db" });

const questions = [
  // $needed objects — see format below
];

async function main() {
  for (const q of questions) {
    try {
      await client.execute({
        sql: \`INSERT OR IGNORE INTO questions
          (id, question, answer, explanation, eli5, difficulty, tags, channel, sub_channel, status, is_new, created_at, last_updated)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)\`,
        args: [
          q.id, q.question, q.answer, q.explanation, q.eli5,
          q.difficulty, q.tags, q.channel, q.subChannel,
          "active", 1, q.createdAt, q.createdAt
        ],
      });
      console.log("Inserted:", q.question.slice(0, 60));
    } catch (e: any) {
      console.error("Failed:", q.question.slice(0, 40), e.message);
    }
  }
  client.close();
}

main();
\`\`\`

Each question object must have:
  - id: crypto.randomUUID()
  - question: string (a specific, realistic interview question ending with "?")
  - answer: string (2-4 sentence TL;DR — what a top candidate says immediately)
  - explanation: string (full markdown explanation, 200-400 words, with ## headings, bullet lists, and at least one code block if relevant)
  - eli5: string (1-2 simple sentences, no jargon, explain to a 10-year-old)
  - difficulty: one of "beginner" | "intermediate" | "advanced" — distribute evenly
  - tags: JSON.stringify(["${channel}", "subtopic1", "subtopic2"])
  - channel: "${channel}"
  - subChannel: the specific sub-topic area (e.g. "sorting", "trees", "react-hooks")
  - createdAt: new Date().toISOString()

CHANNEL CONTEXT for "${channel}":
$(get_channel_context "$channel")

STEP 3 — Run: npx tsx /tmp/seed-${channel}.ts

STEP 4 — Verify by running:
  curl -s "http://localhost:5000/api/questions/${channel}?limit=50" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'${channel} now has {len(d)} questions')"

STEP 5 — Remove the temp file: rm -f /tmp/seed-${channel}.ts

Generate REAL, SPECIFIC questions — not generic placeholders. Each question should be something a real interviewer at Google, Meta, or Amazon would ask.
PROMPT
}

get_channel_context() {
  local channel=$1
  case "$channel" in
    algorithms)           echo "Sorting, searching, graph traversal, dynamic programming, greedy algorithms, divide & conquer. Focus on time/space complexity analysis." ;;
    data-structures)      echo "Arrays, linked lists, stacks, queues, trees, heaps, hash tables, graphs, tries. Focus on trade-offs and real-world use cases." ;;
    complexity-analysis)  echo "Big O notation, time/space complexity, amortized analysis, best/worst/average case, P vs NP. Focus on analyzing code complexity." ;;
    dynamic-programming)  echo "Memoization, tabulation, overlapping subproblems, optimal substructure. Classic problems: Fibonacci, knapsack, LCS, coin change, edit distance." ;;
    bit-manipulation)     echo "Bitwise operators, bit tricks, XOR, masks, counting bits, power of 2 checks. Common interview bit tricks." ;;
    design-patterns)      echo "Creational (Singleton, Factory, Builder), Structural (Adapter, Decorator, Proxy), Behavioral (Observer, Strategy, Command). Real-world usage." ;;
    concurrency)          echo "Threads, processes, locks, mutexes, semaphores, deadlocks, race conditions, thread-safe data structures, async/await." ;;
    math-logic)           echo "Probability, combinatorics, number theory, matrix operations, logic puzzles, bit math. Common in FAANG brain teasers." ;;
    low-level)            echo "Memory management, pointers, stack vs heap, CPU cache, virtual memory, assembly basics, system calls." ;;
    system-design)        echo "Distributed systems, scalability, load balancing, caching, databases, message queues, CAP theorem, consistency models." ;;
    frontend)             echo "React, JavaScript, CSS, browser internals, performance, accessibility, Web APIs, TypeScript, bundling." ;;
    backend)              echo "REST APIs, databases, authentication, caching, message queues, microservices, error handling, logging." ;;
    database)             echo "SQL, NoSQL, indexing, transactions, ACID, normalization, query optimization, PostgreSQL, MongoDB, Redis." ;;
    devops)               echo "CI/CD, Docker, containers, infrastructure as code, monitoring, logging, deployment strategies, Git workflows." ;;
    sre)                  echo "Reliability, SLIs/SLOs/SLAs, error budgets, incident response, postmortems, observability, capacity planning." ;;
    kubernetes)           echo "Pods, deployments, services, ingress, namespaces, ConfigMaps, secrets, RBAC, scaling, health probes." ;;
    aws)                  echo "EC2, S3, RDS, Lambda, VPC, IAM, CloudFormation, ECS/EKS, CloudWatch, Route53, load balancers." ;;
    terraform)            echo "HCL syntax, providers, resources, state management, modules, workspaces, plan/apply/destroy, remote state." ;;
    data-engineering)     echo "ETL/ELT pipelines, Apache Spark, Kafka, data warehouses, Airflow, data modeling, streaming vs batch processing." ;;
    machine-learning)     echo "Supervised/unsupervised learning, model evaluation, overfitting, gradient descent, feature engineering, neural networks." ;;
    generative-ai)        echo "LLMs, transformers, prompt engineering, RAG, fine-tuning, embeddings, vector databases, RLHF." ;;
    prompt-engineering)   echo "Zero-shot, few-shot, chain-of-thought, role prompting, output formatting, prompt injection, context management." ;;
    llm-ops)              echo "LLM deployment, inference optimization, model versioning, monitoring, evaluation, cost management, caching." ;;
    computer-vision)      echo "CNNs, image classification, object detection, segmentation, OpenCV, data augmentation, transfer learning." ;;
    nlp)                  echo "Text classification, named entity recognition, sentiment analysis, transformers, BERT, tokenization, embeddings." ;;
    python)               echo "Data structures, OOP, decorators, generators, context managers, async/await, type hints, common libraries." ;;
    security)             echo "OWASP Top 10, authentication, authorization, SQL injection, XSS, CSRF, HTTPS/TLS, secrets management, pen testing." ;;
    networking)           echo "TCP/IP, DNS, HTTP/HTTPS, load balancing, firewalls, VPNs, subnets, routing, CDNs, WebSockets." ;;
    operating-systems)    echo "Processes, threads, scheduling, memory management, file systems, I/O, system calls, deadlocks, virtual memory." ;;
    linux)                echo "Shell commands, file permissions, processes, cron jobs, networking tools, package managers, shell scripting, systemd." ;;
    unix)                 echo "POSIX standards, pipes, signals, file descriptors, environment variables, shell scripting, standard tools." ;;
    ios)                  echo "Swift, UIKit, SwiftUI, lifecycle, memory management, concurrency, Core Data, networking, App Store submission." ;;
    android)              echo "Kotlin, Android lifecycle, Jetpack Compose, Room, Coroutines, RecyclerView, background tasks, permissions." ;;
    react-native)         echo "React Native architecture, Bridge vs JSI, navigation, state management, native modules, performance optimization." ;;
    testing)              echo "Unit tests, integration tests, TDD, BDD, mocking, test coverage, test pyramids, Jest, pytest." ;;
    e2e-testing)          echo "Playwright, Cypress, Selenium, test automation, page object model, CI integration, flaky tests, test data." ;;
    api-testing)          echo "REST API testing, GraphQL testing, Postman, contract testing, load testing, authentication testing, mocking." ;;
    performance-testing)  echo "Load testing, stress testing, profiling, bottleneck identification, k6, JMeter, browser performance, Core Web Vitals." ;;
    engineering-management) echo "Team leadership, project planning, technical roadmaps, 1:1s, performance reviews, hiring, stakeholder communication." ;;
    behavioral)           echo "STAR method, leadership, conflict resolution, failure handling, teamwork, decision-making, growth mindset." ;;
    *)                    echo "General technical interview questions for this topic area." ;;
  esac
}

generate_for_channel() {
  local channel=$1
  local needed=$2

  log_info "Generating $needed questions for: $channel"

  local prompt
  prompt=$(build_prompt "$channel" "$needed")

  local logfile="/tmp/opencode-gen-${channel}.log"

  if timeout "$TIMEOUT_SECS" "$OPENCODE" run --agent "content-question-expert" "$prompt" > "$logfile" 2>&1; then
    log_ok "$channel — done"
  else
    local exit_code=$?
    if [ $exit_code -eq 124 ]; then
      log_warn "$channel — timed out after ${TIMEOUT_SECS}s (partial results may be saved)"
    else
      log_err "$channel — failed (exit $exit_code)"
      tail -10 "$logfile" | sed 's/^/    /'
    fi
  fi
}

main() {
  echo ""
  echo "============================================================"
  echo "  DevPrep Question Generation Pipeline"
  echo "  Target: at least $MIN_QUESTIONS questions per channel"
  echo "  Channels: ${#ALL_CHANNELS[@]} non-certification channels"
  echo "============================================================"
  echo ""

  # Verify opencode exists
  if [ ! -f "$OPENCODE" ]; then
    log_err "opencode not found at $OPENCODE"
    exit 1
  fi

  # Verify API is running
  if ! curl -s "$API_BASE/api/channels" > /dev/null 2>&1; then
    log_err "API not reachable at $API_BASE — is the dev server running?"
    exit 1
  fi

  # Get current channel counts
  log "Fetching current question counts..."
  local counts_json
  counts_json=$(get_channel_counts)

  local total_generated=0
  local skipped=0
  local failed=0

  for channel in "${ALL_CHANNELS[@]}"; do
    local current_count
    current_count=$(get_count_for_channel "$channel" "$counts_json")
    local needed=$(( MIN_QUESTIONS - current_count ))

    if [ "$needed" -le 0 ]; then
      log_ok "Skipping $channel ($current_count questions — already at $MIN_QUESTIONS+)"
      (( skipped++ )) || true
      continue
    fi

    echo ""
    log "$channel: has $current_count, needs $needed more"
    generate_for_channel "$channel" "$needed"

    # Brief pause to avoid overwhelming the DB
    sleep 3

    # Refresh count
    local new_counts
    new_counts=$(get_channel_counts)
    local new_count
    new_count=$(get_count_for_channel "$channel" "$new_counts")
    local added=$(( new_count - current_count ))

    if [ "$added" -gt 0 ]; then
      log_ok "$channel: $current_count → $new_count (+$added)"
      (( total_generated += added )) || true
    else
      log_warn "$channel: count unchanged at $new_count"
      (( failed++ )) || true
    fi
  done

  echo ""
  echo "============================================================"
  echo "  Pipeline Complete"
  echo "  Total questions added: $total_generated"
  echo "  Channels skipped (already had $MIN_QUESTIONS+): $skipped"
  echo "  Channels with no new questions: $failed"
  echo "============================================================"
  echo ""
  echo "Final counts:"
  curl -s "$API_BASE/api/channels" 2>/dev/null | python3 -c "
import json, sys
data = json.load(sys.stdin)
for item in sorted(data, key=lambda x: x['id']):
    count = item.get('questionCount', 0)
    status = '✓' if count >= $MIN_QUESTIONS else '✗'
    print(f'  {status} {item[\"id\"]}: {count}')
" 2>/dev/null || echo "  (could not fetch final counts)"
}

main
