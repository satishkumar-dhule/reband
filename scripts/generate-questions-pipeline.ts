#!/usr/bin/env npx tsx
/**
 * DevPrep Question Generation Pipeline
 *
 * Uses opencode run --agent content-question-expert to generate
 * interview questions for every non-certification channel that has
 * fewer than MIN_QUESTIONS questions.
 *
 * Usage:
 *   npx tsx scripts/generate-questions-pipeline.ts
 *   npx tsx scripts/generate-questions-pipeline.ts --channel database
 *   npx tsx scripts/generate-questions-pipeline.ts --min 10
 */

import { execSync, spawnSync } from "child_process";
import * as fs from "fs";

const OPENCODE =
  "/home/runner/workspace/.config/npm/node_global/bin/opencode";
const API_BASE = "http://localhost:5000";
const MIN_QUESTIONS = parseInt(
  process.argv.find((a) => a.startsWith("--min="))?.split("=")[1] ?? "5"
);
const SINGLE_CHANNEL = process.argv
  .find((a) => a.startsWith("--channel="))
  ?.split("=")[1];
const TIMEOUT_SECS = 240; // 4 min per channel

// ─── Colour helpers ───────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};
const ts = () => new Date().toTimeString().slice(0, 8);
const log = (msg: string) => console.log(`${C.blue}[${ts()}]${C.reset} ${msg}`);
const ok = (msg: string) =>
  console.log(`${C.green}[${ts()}] ✓${C.reset} ${msg}`);
const warn = (msg: string) =>
  console.log(`${C.yellow}[${ts()}] ⚠${C.reset} ${msg}`);
const err = (msg: string) =>
  console.log(`${C.red}[${ts()}] ✗${C.reset} ${msg}`);
const info = (msg: string) =>
  console.log(`${C.cyan}[${ts()}] →${C.reset} ${msg}`);

// ─── Channel registry (source of truth: channels-config.ts) ──────────────────
interface ChannelInfo {
  id: string;
  context: string;
  subChannels: string[];
}

const CHANNELS: ChannelInfo[] = [
  {
    id: "algorithms",
    context:
      "Sorting (quicksort, mergesort), searching (binary search), graph traversal (BFS/DFS), dynamic programming, greedy algorithms, divide & conquer. Every answer MUST include Big-O complexity.",
    subChannels: ["sorting", "searching", "graph-algorithms", "divide-conquer"],
  },
  {
    id: "data-structures",
    context:
      "Arrays, linked lists, stacks, queues, trees, heaps, hash tables, graphs, tries. Focus on trade-offs, when to use which structure, and implementation details.",
    subChannels: ["trees", "hash-tables", "graphs", "linked-lists", "heaps"],
  },
  {
    id: "complexity-analysis",
    context:
      "Big O, Big Theta, Big Omega notation. Time and space complexity analysis. Amortized analysis. Best/worst/average case. Recurrence relations. Master theorem.",
    subChannels: [
      "big-o-notation",
      "amortized-analysis",
      "recurrence-relations",
    ],
  },
  {
    id: "dynamic-programming",
    context:
      "Memoization vs tabulation. Overlapping subproblems. Optimal substructure. Classic problems: Fibonacci, 0/1 Knapsack, LCS, Coin Change, Edit Distance, Matrix Chain Multiplication.",
    subChannels: [
      "memoization",
      "tabulation",
      "classic-problems",
      "optimization",
    ],
  },
  {
    id: "bit-manipulation",
    context:
      "AND, OR, XOR, NOT, left/right shift operators. Common bit tricks: check if power of 2, count set bits, find single number using XOR, bit masking, swap without temp variable.",
    subChannels: ["bitwise-operators", "bit-tricks", "bit-masking"],
  },
  {
    id: "design-patterns",
    context:
      "Creational (Singleton, Factory, Builder, Abstract Factory), Structural (Adapter, Decorator, Proxy, Composite, Facade), Behavioral (Observer, Strategy, Command, Iterator). Real-world use cases.",
    subChannels: ["creational", "structural", "behavioral"],
  },
  {
    id: "concurrency",
    context:
      "Threads vs processes, race conditions, deadlocks, mutexes, semaphores, condition variables, thread-safe data structures, lock-free programming, async/await, event loops.",
    subChannels: [
      "threads",
      "deadlocks",
      "synchronization",
      "async-patterns",
    ],
  },
  {
    id: "math-logic",
    context:
      "Probability, combinatorics (permutations/combinations), number theory (GCD, prime numbers, modular arithmetic), discrete math, logic puzzles, graph theory basics.",
    subChannels: [
      "probability",
      "combinatorics",
      "number-theory",
      "logic-puzzles",
    ],
  },
  {
    id: "low-level",
    context:
      "Stack vs heap memory, pointers, memory alignment, CPU cache (L1/L2/L3), virtual memory, paging, segfaults, buffer overflows, assembly basics, system calls, endianness.",
    subChannels: [
      "memory-management",
      "cpu-cache",
      "virtual-memory",
      "system-calls",
    ],
  },
  {
    id: "system-design",
    context:
      "Design scalable distributed systems. Cover: requirements clarification, capacity estimation, high-level architecture, database choice, caching, load balancing, message queues, API design, failure handling.",
    subChannels: [
      "distributed-systems",
      "caching",
      "databases",
      "api-design",
      "scalability",
    ],
  },
  {
    id: "frontend",
    context:
      "React hooks, virtual DOM, browser event loop, JavaScript closures, CSS specificity, web performance (Core Web Vitals), accessibility (WCAG), TypeScript, bundlers (Webpack/Vite), Web APIs.",
    subChannels: [
      "react",
      "javascript",
      "css",
      "browser-internals",
      "performance",
    ],
  },
  {
    id: "backend",
    context:
      "REST API design, authentication (JWT, OAuth2), database design, caching strategies (Redis), message queues (RabbitMQ/Kafka), microservices, error handling, logging, API versioning.",
    subChannels: [
      "api-design",
      "authentication",
      "caching",
      "microservices",
      "databases",
    ],
  },
  {
    id: "database",
    context:
      "SQL joins, indexing strategies (B-tree, hash), transactions (ACID), isolation levels, query optimization (EXPLAIN), normalization (1NF-3NF/BCNF), NoSQL vs SQL trade-offs, PostgreSQL, MongoDB, Redis.",
    subChannels: [
      "sql",
      "indexing",
      "transactions",
      "query-optimization",
      "nosql",
    ],
  },
  {
    id: "devops",
    context:
      "CI/CD pipelines, Docker containerization, Kubernetes orchestration, Infrastructure as Code (Terraform/Ansible), monitoring (Prometheus/Grafana), deployment strategies (blue-green, canary), Git workflows.",
    subChannels: ["ci-cd", "docker", "kubernetes", "iac", "monitoring"],
  },
  {
    id: "sre",
    context:
      "SLIs, SLOs, SLAs, error budgets, toil reduction, incident response, postmortems (blameless), chaos engineering, observability (metrics/logs/traces), capacity planning, on-call practices.",
    subChannels: [
      "slos-slas",
      "incident-response",
      "observability",
      "chaos-engineering",
    ],
  },
  {
    id: "kubernetes",
    context:
      "Pods, ReplicaSets, Deployments, Services (ClusterIP/NodePort/LoadBalancer), Ingress, Namespaces, ConfigMaps, Secrets, RBAC, Horizontal Pod Autoscaler, liveness/readiness probes, PersistentVolumes.",
    subChannels: ["pods", "services", "config", "scaling", "storage"],
  },
  {
    id: "aws",
    context:
      "EC2 (instance types, AMIs), S3 (storage classes, lifecycle), RDS vs DynamoDB, Lambda (serverless), VPC (subnets, security groups, NACLs), IAM (roles, policies), CloudFormation, ECS/EKS, Route53, CloudWatch.",
    subChannels: ["compute", "storage", "networking", "serverless", "databases"],
  },
  {
    id: "terraform",
    context:
      "HCL syntax, providers, resources, data sources, variables, outputs, modules, state management (remote state, state locking), workspaces, plan/apply/destroy workflow, Terragrunt, Terraform Cloud.",
    subChannels: ["hcl-basics", "modules", "state-management", "providers"],
  },
  {
    id: "data-engineering",
    context:
      "ETL vs ELT pipelines, Apache Spark (RDDs, DataFrames), Kafka (producers/consumers/topics), data warehouses (Snowflake/BigQuery/Redshift), Airflow DAGs, data modeling (star/snowflake schema), streaming vs batch.",
    subChannels: [
      "etl-pipelines",
      "apache-spark",
      "kafka",
      "data-warehousing",
      "airflow",
    ],
  },
  {
    id: "machine-learning",
    context:
      "Supervised vs unsupervised learning, bias-variance tradeoff, overfitting/regularization, gradient descent, evaluation metrics (precision/recall/F1/AUC), neural networks, feature engineering, cross-validation.",
    subChannels: [
      "supervised-learning",
      "model-evaluation",
      "neural-networks",
      "feature-engineering",
    ],
  },
  {
    id: "generative-ai",
    context:
      "LLMs (GPT, Claude, Gemini), transformers architecture (attention mechanism), Retrieval Augmented Generation (RAG), fine-tuning vs prompt engineering, embeddings, vector databases, RLHF, hallucination mitigation.",
    subChannels: [
      "llms",
      "rag",
      "fine-tuning",
      "embeddings",
      "transformer-architecture",
    ],
  },
  {
    id: "prompt-engineering",
    context:
      "Zero-shot, few-shot, chain-of-thought prompting. Role prompting, structured output formatting, prompt injection attacks, context window management, temperature/top-p parameters, ReAct pattern.",
    subChannels: [
      "prompting-techniques",
      "structured-output",
      "context-management",
    ],
  },
  {
    id: "llm-ops",
    context:
      "LLM deployment and inference (vLLM, TensorRT-LLM), model serving, quantization (INT8/INT4), caching strategies, cost optimization, evaluation frameworks, A/B testing, monitoring for hallucinations.",
    subChannels: ["inference", "model-serving", "evaluation", "cost-optimization"],
  },
  {
    id: "computer-vision",
    context:
      "CNNs (convolution, pooling, activation), image classification, object detection (YOLO, R-CNN), image segmentation, OpenCV, data augmentation, transfer learning (ResNet, EfficientNet), GANs.",
    subChannels: [
      "cnn-architecture",
      "object-detection",
      "transfer-learning",
      "opencv",
    ],
  },
  {
    id: "nlp",
    context:
      "Tokenization, embeddings (Word2Vec, GloVe, BERT), text classification, NER, sentiment analysis, seq2seq models, attention mechanism, transformer architecture, multilingual NLP, text preprocessing.",
    subChannels: [
      "tokenization",
      "embeddings",
      "text-classification",
      "transformers",
    ],
  },
  {
    id: "python",
    context:
      "Python data structures, list comprehensions, generators, decorators, context managers, *args/**kwargs, OOP (MRO, metaclasses), async/await, type hints, GIL, common libraries (collections, itertools, functools).",
    subChannels: [
      "python-basics",
      "oop",
      "functional-programming",
      "async",
      "decorators",
    ],
  },
  {
    id: "security",
    context:
      "OWASP Top 10, SQL injection prevention, XSS (stored/reflected/DOM), CSRF protection, authentication (sessions vs JWT), authorization, HTTPS/TLS, secrets management, pen testing, input validation.",
    subChannels: [
      "web-security",
      "authentication",
      "cryptography",
      "owasp",
      "secure-coding",
    ],
  },
  {
    id: "networking",
    context:
      "OSI model layers, TCP vs UDP, DNS resolution, HTTP/2 vs HTTP/3, load balancing algorithms, NAT, firewalls, VPN, CDN, WebSockets, gRPC, subnetting, BGP routing, TLS handshake.",
    subChannels: ["tcp-ip", "http", "dns", "load-balancing", "protocols"],
  },
  {
    id: "operating-systems",
    context:
      "Process vs thread, scheduling algorithms (FCFS, SJF, Round Robin), memory management (paging, segmentation, virtual memory), file systems (inodes, journaling), inter-process communication, deadlock prevention.",
    subChannels: [
      "processes-threads",
      "scheduling",
      "memory-management",
      "file-systems",
    ],
  },
  {
    id: "linux",
    context:
      "Common commands (grep, awk, sed, find, ps, top, netstat), file permissions (chmod/chown), shell scripting (bash), cron jobs, systemd services, package managers (apt/yum), log management, process management.",
    subChannels: [
      "shell-commands",
      "shell-scripting",
      "system-administration",
      "networking-tools",
    ],
  },
  {
    id: "unix",
    context:
      "POSIX standards, pipes and redirection, signals (SIGTERM, SIGKILL, SIGHUP), file descriptors, environment variables, make/cmake, POSIX threads, IPC (pipes, sockets, shared memory).",
    subChannels: [
      "posix",
      "signals",
      "ipc",
      "file-descriptors",
      "shell-scripting",
    ],
  },
  {
    id: "ios",
    context:
      "Swift fundamentals, UIKit vs SwiftUI, iOS app lifecycle (UIApplicationDelegate/SceneDelegate), memory management (ARC), Grand Central Dispatch, Core Data, URLSession networking, App Store submission, MVVM pattern.",
    subChannels: [
      "swift",
      "swiftui",
      "uikit",
      "concurrency",
      "data-persistence",
    ],
  },
  {
    id: "android",
    context:
      "Kotlin fundamentals, Android Activity/Fragment lifecycle, Jetpack Compose, ViewModel, LiveData/StateFlow, Room database, Coroutines, Retrofit networking, RecyclerView, background tasks (WorkManager), permissions.",
    subChannels: [
      "kotlin",
      "jetpack",
      "lifecycle",
      "coroutines",
      "architecture",
    ],
  },
  {
    id: "react-native",
    context:
      "React Native architecture (Bridge vs JSI/Fabric), React Navigation, state management (Redux/Zustand), native modules, performance optimization (FlatList, memo), Expo vs bare workflow, platform-specific code.",
    subChannels: ["rn-architecture", "navigation", "performance", "native-modules"],
  },
  {
    id: "testing",
    context:
      "Unit tests, integration tests, end-to-end tests, TDD (red-green-refactor), BDD (Given-When-Then), mocking and stubbing, test coverage, test pyramids, Jest, pytest, testing anti-patterns.",
    subChannels: ["unit-testing", "tdd", "mocking", "test-strategy"],
  },
  {
    id: "e2e-testing",
    context:
      "Playwright vs Cypress vs Selenium, page object model (POM), test data management, CI integration, flaky test handling, visual regression testing, accessibility testing, parallel test execution.",
    subChannels: [
      "playwright",
      "cypress",
      "page-object-model",
      "ci-integration",
    ],
  },
  {
    id: "api-testing",
    context:
      "REST API testing strategies, GraphQL testing, Postman/Newman, contract testing (Pact), load testing (k6), authentication testing, schema validation, test doubles (mocks/stubs/fakes).",
    subChannels: [
      "rest-testing",
      "contract-testing",
      "load-testing",
      "mocking",
    ],
  },
  {
    id: "performance-testing",
    context:
      "Load testing vs stress testing vs soak testing, performance profiling, bottleneck identification, k6, JMeter, Lighthouse, Core Web Vitals (LCP/CLS/FID/INP), database query performance, memory profiling.",
    subChannels: [
      "load-testing",
      "profiling",
      "web-performance",
      "database-performance",
    ],
  },
  {
    id: "engineering-management",
    context:
      "Team leadership styles, 1:1 meetings, performance reviews, technical roadmaps, project estimation, stakeholder communication, hiring and onboarding, managing technical debt, incident leadership, OKRs.",
    subChannels: [
      "leadership",
      "project-management",
      "hiring",
      "technical-strategy",
    ],
  },
  {
    id: "behavioral",
    context:
      "STAR method (Situation, Task, Action, Result). Common themes: handling conflict, leadership, failure, tight deadlines, feedback, teamwork, ambiguity, influencing without authority, technical decisions under pressure.",
    subChannels: [
      "leadership",
      "conflict-resolution",
      "failure-handling",
      "teamwork",
    ],
  },
];

// ─── API helpers ──────────────────────────────────────────────────────────────
function getChannelCounts(): Record<string, number> {
  try {
    const result = execSync(`curl -s "${API_BASE}/api/channels"`, {
      encoding: "utf8",
      timeout: 10_000,
    });
    const data = JSON.parse(result) as { id: string; questionCount: number }[];
    return Object.fromEntries(data.map((c) => [c.id, c.questionCount]));
  } catch {
    return {};
  }
}

function getQuestionCount(channel: string): number {
  try {
    const result = execSync(
      `curl -s "${API_BASE}/api/questions/${channel}?limit=100"`,
      { encoding: "utf8", timeout: 10_000 }
    );
    const data = JSON.parse(result);
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

// ─── Prompt builder ───────────────────────────────────────────────────────────
function buildPrompt(ch: ChannelInfo, needed: number): string {
  const seedFile = `scripts/temp-seed-${ch.id}.ts`;
  return `You are a senior engineering interviewer building content for DevPrep, a technical interview prep platform.

TASK: Generate exactly ${needed} high-quality interview questions for the "${ch.id}" channel and INSERT them into the local SQLite database.

━━━ IMPORTANT: Script must live in the WORKSPACE directory (not /tmp) ━━━
Working directory: /home/runner/workspace
Seed script path: ${seedFile}

━━━ STEP 1: Create ${seedFile} with this EXACT structure ━━━

\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";

const client = createClient({ url: "file:local.db" });

const questions = [
  // ${needed} question objects here — see shape below
];

async function main() {
  console.log("Seeding ${needed} questions for ${ch.id}...");
  for (const q of questions) {
    await client.execute({
      sql: \`INSERT OR IGNORE INTO questions (id, question, answer, explanation, eli5, difficulty, tags, channel, sub_channel, status, is_new, created_at, last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [q.id, q.question, q.answer, q.explanation, q.eli5, q.difficulty, q.tags, q.channel, q.subChannel, "active", 1, q.createdAt, q.createdAt],
    });
    console.log("Inserted:", q.question.slice(0, 65));
  }
  client.close();
  console.log("Done!");
}
main().catch(e => { console.error(e.message); process.exit(1); });
\`\`\`

━━━ QUESTION OBJECT SHAPE ━━━
{
  id: crypto.randomUUID(),
  question: "...",            // Specific realistic question ending with ?
  answer: "...",              // 2-4 sentences TL;DR — what a top candidate says immediately
  explanation: "...",         // Full markdown: 250-400 words, ## headings, bullet lists, code block
  eli5: "...",                // 1-2 sentences, explain to a 10-year-old, zero jargon
  difficulty: "beginner" | "intermediate" | "advanced",
  tags: JSON.stringify(["${ch.id}", "subtopic1", "subtopic2"]),
  channel: "${ch.id}",
  subChannel: "<one of: ${ch.subChannels.join(", ")}>",
  createdAt: new Date().toISOString(),
}

━━━ CHANNEL CONTEXT for "${ch.id}" ━━━
${ch.context}

━━━ QUALITY REQUIREMENTS ━━━
- Questions must be SPECIFIC (exact technologies, algorithms, patterns — not generic)
- Real questions asked at Google, Meta, Amazon, Stripe, Netflix
- Each question covers a DIFFERENT sub-topic from: ${ch.subChannels.join(", ")}
- explanation MUST include at least one code block if the topic involves code
- Distribute difficulty: beginner, intermediate(s), advanced

━━━ STEP 2: Run the script ━━━
npx tsx ${seedFile}

━━━ STEP 3: Verify it worked ━━━
curl -s "http://localhost:5000/api/questions/${ch.id}?limit=100" | python3 -c "import json,sys; d=json.load(sys.stdin); print('${ch.id}:', len(d), 'questions now in DB')"

━━━ STEP 4: Clean up ━━━
rm -f ${seedFile}`;
}
}

// ─── Core pipeline ────────────────────────────────────────────────────────────
function generateForChannel(ch: ChannelInfo, needed: number): boolean {
  const prompt = buildPrompt(ch, needed);
  const promptFile = `/tmp/prompt-${ch.id}.txt`;
  fs.writeFileSync(promptFile, prompt, "utf8");

  info(`Running opencode for: ${ch.id} (${needed} questions needed)`);

  const result = spawnSync(
    OPENCODE,
    ["run", "--agent", "content-question-expert", prompt],
    {
      timeout: TIMEOUT_SECS * 1000,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  fs.rmSync(promptFile, { force: true });

  const output = (result.stdout || "") + (result.stderr || "");

  if (result.status === 0) {
    ok(`${ch.id} — opencode completed`);
    return true;
  } else if (result.signal === "SIGTERM") {
    warn(`${ch.id} — timed out after ${TIMEOUT_SECS}s`);
    return false;
  } else {
    err(`${ch.id} — failed (exit ${result.status})`);
    // Show last few lines of output for debugging
    const lines = output.trim().split("\n");
    lines.slice(-5).forEach((l) => console.log(`    ${l}`));
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n" + "═".repeat(62));
  console.log("  DevPrep Question Generation Pipeline");
  console.log(`  Target: ≥${MIN_QUESTIONS} questions per channel`);
  if (SINGLE_CHANNEL) {
    console.log(`  Mode: single channel → ${SINGLE_CHANNEL}`);
  } else {
    console.log(`  Channels: ${CHANNELS.length} non-certification channels`);
  }
  console.log("═".repeat(62) + "\n");

  if (!fs.existsSync(OPENCODE)) {
    err(`opencode not found at ${OPENCODE}`);
    process.exit(1);
  }

  try {
    execSync(`curl -s "${API_BASE}/api/channels" > /dev/null`, {
      timeout: 5000,
    });
  } catch {
    err(`API not reachable at ${API_BASE} — is the dev server running?`);
    process.exit(1);
  }

  const channelsToProcess = SINGLE_CHANNEL
    ? CHANNELS.filter((c) => c.id === SINGLE_CHANNEL)
    : CHANNELS;

  if (channelsToProcess.length === 0) {
    err(`Channel "${SINGLE_CHANNEL}" not found in registry`);
    process.exit(1);
  }

  let totalAdded = 0;
  let skipped = 0;
  let failures = 0;

  for (const ch of channelsToProcess) {
    const before = getQuestionCount(ch.id);
    const needed = MIN_QUESTIONS - before;

    if (needed <= 0) {
      ok(`Skip ${ch.id} (${before} questions — already ≥${MIN_QUESTIONS})`);
      skipped++;
      continue;
    }

    console.log(`\n${"─".repeat(62)}`);
    log(`${ch.id}: has ${before} → needs ${needed} more`);

    const success = generateForChannel(ch, needed);

    // Wait a moment then recount
    await new Promise((r) => setTimeout(r, 2000));
    const after = getQuestionCount(ch.id);
    const added = after - before;

    if (added > 0) {
      ok(`${ch.id}: ${before} → ${after} (+${added} added)`);
      totalAdded += added;
    } else if (success) {
      warn(`${ch.id}: count unchanged at ${after} (opencode ran but may have skipped inserts)`);
      failures++;
    } else {
      err(`${ch.id}: no questions added`);
      failures++;
    }
  }

  console.log("\n" + "═".repeat(62));
  console.log("  Pipeline Complete");
  console.log(`  Questions added this run : ${totalAdded}`);
  console.log(`  Channels already done    : ${skipped}`);
  console.log(`  Channels with issues     : ${failures}`);
  console.log("═".repeat(62) + "\n");

  console.log("Final channel question counts:");
  const finalCounts = getChannelCounts();
  const allIds = [...new Set([...CHANNELS.map((c) => c.id), ...Object.keys(finalCounts)])];
  for (const id of allIds.sort()) {
    const count = finalCounts[id] ?? 0;
    const status = count >= MIN_QUESTIONS ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
    console.log(`  ${status} ${id}: ${count}`);
  }
}

main().catch((e) => {
  err(String(e));
  process.exit(1);
});
