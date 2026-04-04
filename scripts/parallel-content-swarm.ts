#!/usr/bin/env npx tsx
/**
 * DevPrep Content Generation Swarm
 *
 * Runs up to 30 opencode agents in parallel across ALL content pipelines:
 *   - Interview Questions  (37 channels)
 *   - Certification MCQs   (8 certs)
 *   - Flashcards           (9 channels)
 *   - Voice Sessions       (6 channels)
 *   - Learning Paths       (4 types)
 *
 * Usage:
 *   npx tsx scripts/parallel-content-swarm.ts
 *   npx tsx scripts/parallel-content-swarm.ts --workers=20
 *   npx tsx scripts/parallel-content-swarm.ts --type=questions
 *   npx tsx scripts/parallel-content-swarm.ts --type=flashcards --workers=10
 */

import { spawn } from "child_process";
import * as fs from "fs";
import * as readline from "readline";

// ─── Config ───────────────────────────────────────────────────────────────────
const OPENCODE = "/home/runner/workspace/.config/npm/node_global/bin/opencode";
const API_BASE = "http://localhost:5000";
const MAX_WORKERS = parseInt(
  process.argv.find((a) => a.startsWith("--workers="))?.split("=")[1] ?? "30"
);
const FILTER_TYPE = process.argv.find((a) => a.startsWith("--type="))?.split("=")[1];
const TIMEOUT_MS = 5 * 60 * 1000; // 5 min per agent
const POLL_INTERVAL_MS = 8000;    // re-poll DB count every 8s
const RENDER_INTERVAL_MS = 500;   // redraw dashboard every 500ms

// ─── ANSI helpers ─────────────────────────────────────────────────────────────
const C = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  green:   "\x1b[32m",
  red:     "\x1b[31m",
  yellow:  "\x1b[33m",
  blue:    "\x1b[34m",
  cyan:    "\x1b[36m",
  magenta: "\x1b[35m",
  white:   "\x1b[37m",
  bgBlue:  "\x1b[44m",
  up:      (n: number) => `\x1b[${n}A`,
  clearLine: "\x1b[2K\r",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type ContentType = "questions" | "certifications" | "flashcards" | "voice" | "paths";
type AgentStatus = "pending" | "running" | "done" | "failed" | "skipped";

interface WorkItem {
  id: string;
  type: ContentType;
  label: string;
  agent: string;
  buildPrompt: () => string;
  apiCheckUrl: string;
  extractCount: (body: string) => number;
  minNeeded: number;
}

interface AgentState {
  item: WorkItem;
  status: AgentStatus;
  startTime?: number;
  endTime?: number;
  baselineCount: number;
  currentCount: number;
  generated: number;
  error?: string;
  workerSlot: number;
}

// ─── Global state ─────────────────────────────────────────────────────────────
const agents: AgentState[] = [];
let dashboardLines = 0;
let startTime = Date.now();

// ─── Fetch helpers ────────────────────────────────────────────────────────────
async function fetchCount(url: string, extract: (b: string) => number): Promise<number> {
  return new Promise((resolve) => {
    const { execSync } = require("child_process") as typeof import("child_process");
    try {
      const body = execSync(`curl -s --max-time 8 "${url}"`, { encoding: "utf8", timeout: 10_000 });
      resolve(extract(body));
    } catch {
      resolve(0);
    }
  });
}

function extractArrayLength(body: string): number {
  try {
    const d = JSON.parse(body);
    return Array.isArray(d) ? d.length : 0;
  } catch {
    return 0;
  }
}

// ─── Work queue builder ───────────────────────────────────────────────────────

// Questions
const QUESTION_CHANNELS = [
  { id: "algorithms",        context: "Sorting, searching, graph traversal, dynamic programming, greedy algorithms. Always include Big-O complexity.", subChannels: ["sorting","searching","graph-algorithms","divide-conquer"] },
  { id: "data-structures",   context: "Arrays, linked lists, stacks, queues, trees, heaps, hash tables, graphs, tries.", subChannels: ["trees","hash-tables","graphs","linked-lists","heaps"] },
  { id: "complexity-analysis",context:"Big O, Theta, Omega. Time/space complexity, amortized analysis, recurrence relations, Master theorem.", subChannels: ["big-o-notation","amortized-analysis","recurrence-relations"] },
  { id: "dynamic-programming",context:"Memoization vs tabulation. Classic problems: Fibonacci, Knapsack, LCS, Coin Change, Edit Distance.", subChannels: ["memoization","tabulation","classic-problems","optimization"] },
  { id: "bit-manipulation",  context: "AND, OR, XOR, shifts. Bit tricks: power of 2, count bits, XOR single number, bit masking.", subChannels: ["bitwise-operators","bit-tricks","bit-masking"] },
  { id: "design-patterns",   context: "Creational, Structural, Behavioral patterns with real-world use cases.", subChannels: ["creational","structural","behavioral"] },
  { id: "concurrency",       context: "Threads, race conditions, deadlocks, mutexes, semaphores, async/await, event loops.", subChannels: ["threads","deadlocks","synchronization","async-patterns"] },
  { id: "math-logic",        context: "Probability, combinatorics, number theory, discrete math, logic puzzles.", subChannels: ["probability","combinatorics","number-theory","logic-puzzles"] },
  { id: "low-level",         context: "Stack vs heap, pointers, CPU cache, virtual memory, paging, system calls, endianness.", subChannels: ["memory-management","cpu-cache","virtual-memory","system-calls"] },
  { id: "system-design",     context: "Design scalable distributed systems: requirements, capacity, architecture, caching, load balancing, queues.", subChannels: ["distributed-systems","caching","databases","api-design","scalability"] },
  { id: "frontend",          context: "React hooks, virtual DOM, event loop, closures, CSS specificity, Core Web Vitals, TypeScript, Vite.", subChannels: ["react","javascript","css","browser-internals","performance"] },
  { id: "backend",           context: "REST API design, JWT/OAuth2, caching, message queues, microservices, error handling, logging.", subChannels: ["api-design","authentication","caching","microservices","databases"] },
  { id: "database",          context: "SQL joins, indexing (B-tree, hash), ACID, isolation levels, query optimization, NoSQL vs SQL.", subChannels: ["sql","indexing","transactions","query-optimization","nosql"] },
  { id: "devops",            context: "CI/CD, Docker, Kubernetes, IaC (Terraform), monitoring, blue-green/canary deployments.", subChannels: ["ci-cd","docker","kubernetes","iac","monitoring"] },
  { id: "sre",               context: "SLIs, SLOs, error budgets, toil, incident response, postmortems, chaos engineering, observability.", subChannels: ["slos-slas","incident-response","observability","chaos-engineering"] },
  { id: "kubernetes",        context: "Pods, ReplicaSets, Deployments, Services, Ingress, ConfigMaps, Secrets, RBAC, HPA, PVs.", subChannels: ["pods","services","config","scaling","storage"] },
  { id: "aws",               context: "EC2, S3, RDS, DynamoDB, Lambda, VPC, IAM, CloudFormation, ECS/EKS, Route53, CloudWatch.", subChannels: ["compute","storage","networking","serverless","databases"] },
  { id: "terraform",         context: "HCL, providers, resources, modules, remote state, workspaces, plan/apply/destroy.", subChannels: ["hcl-basics","modules","state-management","providers"] },
  { id: "data-engineering",  context: "ETL/ELT, Spark, Kafka, data warehouses, Airflow DAGs, star/snowflake schema, streaming vs batch.", subChannels: ["etl-pipelines","apache-spark","kafka","data-warehousing","airflow"] },
  { id: "machine-learning",  context: "Supervised/unsupervised, bias-variance, gradient descent, precision/recall/F1, neural networks.", subChannels: ["supervised-learning","model-evaluation","neural-networks","feature-engineering"] },
  { id: "generative-ai",     context: "LLMs, transformers, RAG, fine-tuning, embeddings, vector DBs, RLHF, hallucination mitigation.", subChannels: ["llms","rag","fine-tuning","embeddings","transformer-architecture"] },
  { id: "prompt-engineering",context: "Zero-shot, few-shot, chain-of-thought, role prompting, structured output, context management.", subChannels: ["prompting-techniques","structured-output","context-management"] },
  { id: "llm-ops",           context: "LLM deployment, inference, quantization, caching, cost optimization, evaluation, A/B testing.", subChannels: ["inference","model-serving","evaluation","cost-optimization"] },
  { id: "computer-vision",   context: "CNNs, image classification, object detection (YOLO), segmentation, OpenCV, transfer learning.", subChannels: ["cnn-architecture","object-detection","transfer-learning","opencv"] },
  { id: "nlp",               context: "Tokenization, Word2Vec, BERT, text classification, NER, sentiment, seq2seq, attention.", subChannels: ["tokenization","embeddings","text-classification","transformers"] },
  { id: "python",            context: "Data structures, comprehensions, generators, decorators, async/await, type hints, GIL.", subChannels: ["python-basics","oop","functional-programming","async","decorators"] },
  { id: "security",          context: "OWASP Top 10, SQL injection, XSS, CSRF, JWT, TLS, secrets management, pen testing.", subChannels: ["web-security","authentication","cryptography","owasp","secure-coding"] },
  { id: "networking",        context: "OSI model, TCP/UDP, DNS, HTTP/2/3, load balancing, NAT, VPN, CDN, WebSockets, TLS.", subChannels: ["tcp-ip","http","dns","load-balancing","protocols"] },
  { id: "operating-systems", context: "Process vs thread, scheduling algorithms, memory management, file systems, IPC, deadlock.", subChannels: ["processes-threads","scheduling","memory-management","file-systems"] },
  { id: "linux",             context: "grep/awk/sed, permissions, bash scripting, cron, systemd, package managers, log management.", subChannels: ["shell-commands","shell-scripting","system-administration","networking-tools"] },
  { id: "unix",              context: "POSIX, pipes/redirection, signals, file descriptors, IPC (pipes, sockets, shared memory).", subChannels: ["posix","signals","ipc","file-descriptors","shell-scripting"] },
  { id: "ios",               context: "Swift, UIKit vs SwiftUI, ARC, GCD, Core Data, URLSession, MVVM, App Store submission.", subChannels: ["swift","swiftui","uikit","concurrency","data-persistence"] },
  { id: "android",           context: "Kotlin, Activity/Fragment lifecycle, Compose, ViewModel, Room, Coroutines, WorkManager.", subChannels: ["kotlin","jetpack","lifecycle","coroutines","architecture"] },
  { id: "react-native",      context: "RN architecture (Bridge vs JSI), React Navigation, Redux/Zustand, native modules, Expo.", subChannels: ["rn-architecture","navigation","performance","native-modules"] },
  { id: "testing",           context: "Unit, integration, E2E tests, TDD, BDD, mocking/stubbing, coverage, test pyramids.", subChannels: ["unit-testing","tdd","mocking","test-strategy"] },
  { id: "e2e-testing",       context: "Playwright/Cypress/Selenium, POM, flaky tests, visual regression, accessibility testing.", subChannels: ["playwright","cypress","page-object-model","ci-integration"] },
  { id: "api-testing",       context: "REST/GraphQL testing, Postman, contract testing (Pact), load testing (k6), schema validation.", subChannels: ["rest-testing","contract-testing","load-testing","mocking"] },
  { id: "performance-testing",context:"Load/stress/soak testing, profiling, k6, JMeter, Lighthouse, Core Web Vitals, DB performance.", subChannels: ["load-testing","profiling","web-performance","database-performance"] },
  { id: "engineering-management",context:"1:1s, perf reviews, roadmaps, estimation, stakeholder comms, hiring, technical debt, OKRs.", subChannels: ["leadership","project-management","hiring","technical-strategy"] },
  { id: "behavioral",        context: "STAR method: leadership, conflict, failure, tight deadlines, teamwork, ambiguity, decisions.", subChannels: ["leadership","conflict-resolution","failure-handling","teamwork"] },
];

function buildQuestionPrompt(ch: { id: string; context: string; subChannels: string[] }, needed: number): string {
  const seedFile = `scripts/temp-seed-${ch.id}-${Date.now()}.ts`;
  return `You are a senior engineering interviewer building content for DevPrep.

TASK: Generate exactly ${needed} high-quality interview questions for channel "${ch.id}" and INSERT them into the local SQLite database.

Working directory: /home/runner/workspace
Seed script path: ${seedFile}

STEP 1 — Create ${seedFile}:
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const client = createClient({ url: "file:local.db" });
const questions = [
  // ${needed} question objects — see shape below
];
async function main() {
  for (const q of questions) {
    await client.execute({
      sql: \`INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [q.id,q.question,q.answer,q.explanation,q.eli5,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt],
    });
  }
  client.close();
  console.log("Done! Inserted", questions.length, "questions");
}
main().catch(e => { console.error(e); process.exit(1); });
\`\`\`

QUESTION SHAPE:
{
  id: crypto.randomUUID(),
  question: "...",   // specific, realistic, ends with ?
  answer: "...",     // 2-4 sentence TL;DR
  explanation: "...",// 250-400 word markdown with ## headings + code block
  eli5: "...",       // 1-2 sentences for a 10-year-old
  difficulty: "beginner"|"intermediate"|"advanced",
  tags: JSON.stringify(["${ch.id}","subtopic"]),
  channel: "${ch.id}",
  subChannel: "<one of: ${ch.subChannels.join(", ")}>",
  createdAt: new Date().toISOString(),
}

CHANNEL CONTEXT for "${ch.id}":
${ch.context}

REQUIREMENTS:
- ${needed} DIFFERENT questions covering varied sub-topics from: ${ch.subChannels.join(", ")}
- Each answer has a code block if topic involves code
- Difficulty mix: ~30% beginner, 50% intermediate, 20% advanced
- Real questions from FAANG/top-tech companies

STEP 2: npx tsx ${seedFile}
STEP 3: rm -f ${seedFile}`;
}

// Certifications
const CERTIFICATIONS = [
  { id:"aws-saa",    name:"AWS Solutions Architect Associate", provider:"Amazon",    examCode:"SAA-C03", category:"cloud",    difficulty:"intermediate", targetQ:200, estimatedHours:80, passingScore:72, examDuration:130, domains:[{n:"Design Resilient Architectures",w:30},{n:"Design High-Performing Architectures",w:28},{n:"Design Secure Apps & Architectures",w:24},{n:"Design Cost-Optimized Architectures",w:18}], mappings:["aws","system-design","database"] },
  { id:"aws-developer",name:"AWS Developer Associate",        provider:"Amazon",    examCode:"DVA-C02", category:"cloud",    difficulty:"intermediate", targetQ:150, estimatedHours:60, passingScore:72, examDuration:130, domains:[{n:"Development with AWS Services",w:32},{n:"Security",w:26},{n:"Deployment",w:24},{n:"Troubleshooting and Optimization",w:18}], mappings:["aws","backend","devops"] },
  { id:"cka",         name:"Certified Kubernetes Administrator",provider:"CNCF",    examCode:"CKA",     category:"devops",   difficulty:"advanced",     targetQ:150, estimatedHours:100,passingScore:66, examDuration:120, domains:[{n:"Cluster Architecture",w:25},{n:"Workloads & Scheduling",w:15},{n:"Services & Networking",w:20},{n:"Storage",w:10},{n:"Troubleshooting",w:30}], mappings:["kubernetes","devops","linux"] },
  { id:"ckad",        name:"Certified Kubernetes App Developer",provider:"CNCF",   examCode:"CKAD",    category:"devops",   difficulty:"intermediate", targetQ:100, estimatedHours:60, passingScore:66, examDuration:120, domains:[{n:"App Design & Build",w:20},{n:"App Deployment",w:20},{n:"App Observability",w:15},{n:"App Environment & Security",w:25},{n:"Services & Networking",w:20}], mappings:["kubernetes","devops","backend"] },
  { id:"terraform-associate",name:"Terraform Associate",      provider:"HashiCorp",examCode:"003",     category:"devops",   difficulty:"intermediate", targetQ:100, estimatedHours:40, passingScore:70, examDuration:60,  domains:[{n:"IaC Concepts",w:17},{n:"Terraform Purpose",w:9},{n:"Terraform Basics",w:24},{n:"CLI Usage",w:22},{n:"Modules",w:12},{n:"Core Workflow",w:16}], mappings:["terraform","devops"] },
  { id:"security-plus",name:"CompTIA Security+",              provider:"CompTIA",  examCode:"SY0-701", category:"security", difficulty:"intermediate", targetQ:150, estimatedHours:60, passingScore:75, examDuration:90,  domains:[{n:"General Security",w:12},{n:"Threats & Vulnerabilities",w:22},{n:"Security Architecture",w:18},{n:"Security Operations",w:28},{n:"Program Management",w:20}], mappings:["security","networking"] },
  { id:"azure-fundamentals",name:"Microsoft Azure Fundamentals",provider:"Microsoft",examCode:"AZ-900",category:"cloud",   difficulty:"beginner",     targetQ:100, estimatedHours:30, passingScore:70, examDuration:60,  domains:[{n:"Cloud Concepts",w:25},{n:"Azure Architecture & Services",w:35},{n:"Azure Management & Governance",w:30},{n:"Pricing & Support",w:10}], mappings:["devops","system-design"] },
  { id:"kubernetes-kcna",name:"Kubernetes and Cloud Native Associate",provider:"CNCF",examCode:"KCNA",category:"devops",   difficulty:"beginner",     targetQ:150, estimatedHours:40, passingScore:75, examDuration:90,  domains:[{n:"Kubernetes Fundamentals",w:46},{n:"Container Orchestration",w:22},{n:"Cloud Native Architecture",w:16},{n:"Cloud Native Observability",w:8},{n:"App Delivery",w:8}], mappings:["kubernetes","devops"] },
];

function buildCertPrompt(cert: typeof CERTIFICATIONS[0], needed: number): string {
  const seedFile = `scripts/temp-seed-cert-${cert.id}-${Date.now()}.ts`;
  return `You are a certification exam expert building content for DevPrep.

TASK: Generate exactly ${needed} MCQ questions for "${cert.name}" (${cert.examCode}) and INSERT them into the local SQLite database.

Working directory: /home/runner/workspace
Seed script path: ${seedFile}

STEP 1 — Create ${seedFile}:
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const client = createClient({ url: "file:local.db" });

async function main() {
  // Upsert cert track
  await client.execute({
    sql: \`INSERT OR REPLACE INTO certifications (id,name,provider,description,exam_code,category,difficulty,estimated_hours,passing_score,exam_duration,domains,channel_mappings,tags,official_url,status,question_count,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`,
    args: ["${cert.id}","${cert.name}","${cert.provider}","${cert.name} certification exam prep","${cert.examCode}","${cert.category}","${cert.difficulty}",${cert.estimatedHours},${cert.passingScore},${cert.examDuration},JSON.stringify(${JSON.stringify(cert.domains)}),JSON.stringify(${JSON.stringify(cert.mappings)}),JSON.stringify(["${cert.id}","${cert.category}"]),"https://example.com","active",${needed},new Date().toISOString(),new Date().toISOString()],
  });

  const questions = [
    // ${needed} MCQ objects — see shape
  ];
  for (const q of questions) {
    await client.execute({
      sql: \`INSERT OR IGNORE INTO questions (id,question,answer,explanation,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [q.id,q.question,q.answer,q.explanation,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt],
    });
  }
  client.close();
  console.log("Done! Inserted", questions.length, "cert questions");
}
main().catch(e => { console.error(e); process.exit(1); });
\`\`\`

MCQ SHAPE:
{
  id: crypto.randomUUID(),
  question: "Scenario + 4 options labeled A) B) C) D)",
  answer: "The correct answer is X) ... because ...",
  explanation: "200-300 word markdown: why correct, why others wrong",
  difficulty: "beginner"|"intermediate"|"advanced",
  tags: JSON.stringify(["${cert.id}","${cert.category}"]),
  channel: "<one of: ${cert.mappings.join(", ")}>",
  subChannel: "<relevant domain>",
  createdAt: new Date().toISOString(),
}

DOMAINS (use weighted distribution):
${cert.domains.map(d => `  ${d.n}: ${d.w}%`).join("\n")}

REQUIREMENTS: scenario-based questions, all 4 options plausible, no "all/none of the above"

STEP 2: npx tsx ${seedFile}
STEP 3: rm -f ${seedFile}`;
}

// Flashcards
const FLASHCARD_CHANNELS = [
  { id:"algorithms",    target:200, context:"Sorting, searching, graph traversal, DP, greedy. Include Big-O in answers.", categories:["sorting","searching","graph-algorithms","dynamic-programming","greedy"] },
  { id:"system-design", target:100, context:"Distributed systems, caching, load balancing, databases, API design, scalability.", categories:["distributed-systems","caching","databases","api-design","scalability"] },
  { id:"frontend",      target:100, context:"React hooks, virtual DOM, event loop, closures, CSS, web performance, TypeScript.", categories:["react","javascript","css","browser-internals","performance"] },
  { id:"backend",       target:100, context:"REST API, authentication, caching, message queues, microservices, error handling.", categories:["api-design","authentication","caching","microservices","databases"] },
  { id:"database",      target:80,  context:"SQL joins, indexing, ACID, query optimization, normalization, NoSQL vs SQL.", categories:["sql","indexing","transactions","nosql","query-optimization"] },
  { id:"devops",        target:80,  context:"CI/CD, Docker, Kubernetes, IaC, monitoring, deployment strategies.", categories:["ci-cd","docker","kubernetes","iac","monitoring"] },
  { id:"security",      target:60,  context:"OWASP Top 10, SQL injection, XSS, CSRF, authentication, HTTPS/TLS.", categories:["web-security","authentication","cryptography","owasp"] },
  { id:"machine-learning",target:60,context:"Supervised/unsupervised, bias-variance, gradient descent, metrics, neural nets.", categories:["supervised-learning","model-evaluation","neural-networks","feature-engineering"] },
  { id:"generative-ai", target:60,  context:"LLMs, transformers, RAG, fine-tuning, embeddings, vector DBs.", categories:["llms","rag","fine-tuning","embeddings","transformer-architecture"] },
];

function buildFlashcardPrompt(ch: typeof FLASHCARD_CHANNELS[0], needed: number): string {
  const seedFile = `scripts/temp-seed-flash-${ch.id}-${Date.now()}.ts`;
  return `You are a senior engineering educator building spaced-repetition flashcards for DevPrep.

TASK: Generate exactly ${needed} SRS flashcards for channel "${ch.id}" and INSERT them into the local SQLite database.

Working directory: /home/runner/workspace
Seed script path: ${seedFile}

STEP 1 — Create ${seedFile}:
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const client = createClient({ url: "file:local.db" });
const flashcards = [
  // ${needed} flashcard objects — see shape
];
async function main() {
  for (const f of flashcards) {
    await client.execute({
      sql: \`INSERT OR IGNORE INTO flashcards (id,channel,front,back,hint,code_example,mnemonic,difficulty,tags,category,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [f.id,f.channel,f.front,f.back,f.hint??null,f.codeExample??null,f.mnemonic??null,f.difficulty,f.tags,f.category,"active",f.createdAt],
    });
  }
  client.close();
  console.log("Done! Inserted", flashcards.length, "flashcards");
}
main().catch(e => { console.error(e); process.exit(1); });
\`\`\`

FLASHCARD SHAPE:
{
  id: crypto.randomUUID(),
  channel: "${ch.id}",
  front: "...",        // ≤15 words, ends with ?
  back: "...",         // 40-120 words, direct answer first
  hint: "...",         // optional 1-sentence memory aid
  codeExample: "...",  // optional code snippet
  mnemonic: "...",     // optional memory trick
  difficulty: "beginner"|"intermediate"|"advanced",
  tags: JSON.stringify(["${ch.id}","subtopic"]),
  category: "<one of: ${ch.categories.join(", ")}>",
  createdAt: new Date().toISOString(),
}

CONTEXT: ${ch.context}
REQUIREMENTS: ${needed} different cards, add codeExample for syntax/implementation cards
Difficulty: 30% beginner, 50% intermediate, 20% advanced

STEP 2: npx tsx ${seedFile}
STEP 3: rm -f ${seedFile}`;
}

// Voice Sessions
const VOICE_CHANNELS = [
  { id:"algorithms",  target:20, minQ:5, maxQ:10, topics:["sorting-algorithms","graph-traversal","dynamic-programming","binary-search","greedy-algorithms"] },
  { id:"system-design",target:15,minQ:5, maxQ:8,  topics:["url-shortener","distributed-cache","message-queue","api-gateway","rate-limiter"] },
  { id:"frontend",    target:15, minQ:5, maxQ:8,  topics:["react-hooks","javascript-closures","browser-rendering","web-performance","typescript"] },
  { id:"backend",     target:15, minQ:5, maxQ:8,  topics:["rest-api-design","authentication","caching-strategies","microservices","database-design"] },
  { id:"behavioral",  target:30, minQ:3, maxQ:5,  topics:["leadership","conflict-resolution","failure-handling","teamwork","decision-making"] },
  { id:"devops",      target:10, minQ:5, maxQ:8,  topics:["ci-cd-pipeline","docker-kubernetes","infrastructure-as-code","monitoring","incident-response"] },
];

function buildVoicePrompt(ch: typeof VOICE_CHANNELS[0], needed: number): string {
  const seedFile = `scripts/temp-seed-voice-${ch.id}-${Date.now()}.ts`;
  return `You are a senior engineering interviewer building voice interview sessions for DevPrep.

TASK: Generate exactly ${needed} voice interview sessions for channel "${ch.id}" and INSERT them into the local SQLite database.

Working directory: /home/runner/workspace
Seed script path: ${seedFile}

STEP 1 — Create ${seedFile}:
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const client = createClient({ url: "file:local.db" });
const sessions = [
  // ${needed} session objects — see shape
];
async function main() {
  for (const s of sessions) {
    await client.execute({
      sql: \`INSERT OR IGNORE INTO voice_sessions (id,topic,description,channel,difficulty,question_ids,total_questions,estimated_minutes,created_at) VALUES (?,?,?,?,?,?,?,?,?)\`,
      args: [s.id,s.topic,s.description,s.channel,s.difficulty,s.questionIds,s.totalQuestions,s.estimatedMinutes,s.createdAt],
    });
  }
  client.close();
  console.log("Done! Inserted", sessions.length, "voice sessions");
}
main().catch(e => { console.error(e); process.exit(1); });
\`\`\`

SESSION SHAPE:
{
  id: crypto.randomUUID(),
  topic: "3-6 word descriptive title",
  description: "1-2 sentences: what interviewer assesses",
  channel: "${ch.id}",
  difficulty: "beginner"|"intermediate"|"advanced",
  questionIds: JSON.stringify([]),  // use empty array, IDs will be linked later
  totalQuestions: ${ch.minQ + 2},
  estimatedMinutes: ${ch.minQ * 3},
  createdAt: new Date().toISOString(),
}

TOPICS to cover (one per session, cycle through with difficulty variations):
${ch.topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}
Difficulty distribution: 20% beginner, 60% intermediate, 20% advanced

STEP 2: npx tsx ${seedFile}
STEP 3: rm -f ${seedFile}`;
}

// Learning Paths
const PATH_BATCHES = [
  { type:"company",     target:10, items:[
    { title:"Google SWE Interview Prep",     company:"Google",    channels:["algorithms","system-design","behavioral"], difficulty:"advanced",     hours:80 },
    { title:"Amazon SWE Interview Prep",     company:"Amazon",    channels:["algorithms","system-design","behavioral"], difficulty:"advanced",     hours:80 },
    { title:"Meta SWE Interview Prep",       company:"Meta",      channels:["algorithms","system-design","behavioral"], difficulty:"advanced",     hours:80 },
    { title:"Apple SWE Interview Prep",      company:"Apple",     channels:["algorithms","system-design","behavioral"], difficulty:"advanced",     hours:60 },
    { title:"Netflix SWE Interview Prep",    company:"Netflix",   channels:["system-design","behavioral"],             difficulty:"advanced",     hours:60 },
    { title:"Microsoft SWE Interview Prep",  company:"Microsoft", channels:["algorithms","system-design","behavioral"], difficulty:"intermediate", hours:60 },
    { title:"Stripe Engineering Interview",  company:"Stripe",    channels:["backend","system-design","database"],     difficulty:"advanced",     hours:60 },
    { title:"Airbnb Engineering Interview",  company:"Airbnb",    channels:["frontend","backend","system-design"],     difficulty:"intermediate", hours:50 },
    { title:"Uber Engineering Interview",    company:"Uber",      channels:["system-design","backend","algorithms"],   difficulty:"advanced",     hours:60 },
    { title:"LinkedIn Engineering Interview",company:"LinkedIn",  channels:["algorithms","system-design","behavioral"],difficulty:"intermediate", hours:50 },
  ]},
  { type:"job-title",   target:10, items:[
    { title:"Frontend Engineer Path",        jobTitle:"frontend-engineer",  channels:["frontend","algorithms"],          difficulty:"intermediate", hours:60 },
    { title:"Backend Engineer Path",         jobTitle:"backend-engineer",   channels:["backend","database","system-design"],difficulty:"intermediate",hours:60},
    { title:"Full-Stack Engineer Path",      jobTitle:"fullstack-engineer", channels:["frontend","backend","database"],  difficulty:"intermediate", hours:80 },
    { title:"Site Reliability Engineer Path",jobTitle:"sre",                channels:["sre","devops","system-design"],   difficulty:"advanced",     hours:80 },
    { title:"DevOps Engineer Path",          jobTitle:"devops-engineer",    channels:["devops","kubernetes","terraform"], difficulty:"intermediate", hours:70 },
    { title:"Data Engineer Path",            jobTitle:"data-engineer",      channels:["data-engineering","database","python"],difficulty:"intermediate",hours:60},
    { title:"ML Engineer Path",              jobTitle:"ml-engineer",        channels:["machine-learning","python"],      difficulty:"advanced",     hours:80 },
    { title:"Engineering Manager Path",      jobTitle:"engineering-manager",channels:["engineering-management","behavioral"],difficulty:"advanced", hours:50},
    { title:"Mobile Engineer Path",          jobTitle:"mobile-engineer",    channels:["ios","android","react-native"],   difficulty:"intermediate", hours:60 },
    { title:"Security Engineer Path",        jobTitle:"security-engineer",  channels:["security","networking","backend"],difficulty:"advanced",     hours:60 },
  ]},
  { type:"skill",       target:10, items:[
    { title:"Algorithms Mastery",            channels:["algorithms","data-structures","complexity-analysis"], difficulty:"intermediate",hours:60 },
    { title:"System Design Pro",             channels:["system-design","database","devops"],                  difficulty:"advanced",    hours:80 },
    { title:"Dynamic Programming Deep Dive", channels:["dynamic-programming","algorithms"],                   difficulty:"advanced",    hours:40 },
    { title:"Database Design & Optimization",channels:["database","backend"],                                 difficulty:"intermediate",hours:40 },
    { title:"Distributed Systems Fundamentals",channels:["system-design","backend","devops"],                 difficulty:"advanced",    hours:60 },
    { title:"JavaScript & TypeScript Mastery",channels:["frontend","backend"],                                difficulty:"intermediate",hours:40 },
    { title:"Python for Interviews",         channels:["python","algorithms"],                                difficulty:"beginner",    hours:30 },
    { title:"Behavioral Interview Excellence",channels:["behavioral","engineering-management"],               difficulty:"intermediate",hours:20 },
    { title:"Web Security Fundamentals",     channels:["security","backend"],                                 difficulty:"intermediate",hours:30 },
    { title:"Cloud Architecture Patterns",   channels:["aws","system-design","devops"],                       difficulty:"intermediate",hours:50 },
  ]},
  { type:"certification",target:5,items:[
    { title:"AWS Solutions Architect Prep",  channels:["aws","system-design"],        difficulty:"intermediate",hours:80  },
    { title:"CKA Exam Preparation",          channels:["kubernetes","devops","linux"], difficulty:"advanced",    hours:100 },
    { title:"Terraform Associate Prep",      channels:["terraform","devops"],          difficulty:"intermediate",hours:40  },
    { title:"CKAD Preparation Path",         channels:["kubernetes","devops","backend"],difficulty:"intermediate",hours:60},
    { title:"CompTIA Security+ Prep",        channels:["security","networking"],       difficulty:"intermediate",hours:60  },
  ]},
] as const;

function buildPathPrompt(batch: typeof PATH_BATCHES[number], needed: number): string {
  const seedFile = `scripts/temp-seed-paths-${batch.type}-${Date.now()}.ts`;
  const items = [...batch.items].slice(0, needed);
  return `You are a senior engineering career coach building structured learning paths for DevPrep.

TASK: Generate exactly ${needed} learning paths of type "${batch.type}" and INSERT them into the local SQLite database.

Working directory: /home/runner/workspace
Seed script path: ${seedFile}

STEP 1 — Create ${seedFile}:
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const client = createClient({ url: "file:local.db" });
const learningPaths = [
  // ${needed} learning path objects — see shape
];
async function main() {
  for (const p of learningPaths) {
    await client.execute({
      sql: \`INSERT OR IGNORE INTO learning_paths (id,title,description,path_type,target_company,target_job_title,difficulty,estimated_hours,question_ids,channels,tags,prerequisites,learning_objectives,milestones,metadata,status,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [p.id,p.title,p.description,p.pathType,p.targetCompany??null,p.targetJobTitle??null,p.difficulty,p.estimatedHours,p.questionIds,p.channels,p.tags,p.prerequisites,p.learningObjectives,p.milestones,p.metadata,"active",p.createdAt,p.createdAt],
    });
  }
  client.close();
  console.log("Done! Inserted", learningPaths.length, "learning paths");
}
main().catch(e => { console.error(e); process.exit(1); });
\`\`\`

PATH SHAPE:
{
  id: crypto.randomUUID(),
  title: "...",
  description: "2-3 sentences: who it's for + what they'll achieve",
  pathType: "${batch.type}",
  targetCompany: null,    // string for 'company' type
  targetJobTitle: null,   // string for 'job-title' type
  difficulty: "beginner"|"intermediate"|"advanced",
  estimatedHours: 60,
  questionIds: JSON.stringify([]),
  channels: JSON.stringify(["algorithms","system-design"]),
  tags: JSON.stringify(["interview-prep","..."]),
  prerequisites: JSON.stringify([]),
  learningObjectives: JSON.stringify(["Can implement ...", "Understands ...", "Able to ..."]),
  milestones: JSON.stringify([{title:"Foundation",description:"...",completionPercent:20,questionCount:10},...]),
  metadata: JSON.stringify({ focusAreas:[], companiesTargeted:[], interviewRounds:[] }),
  createdAt: new Date().toISOString(),
}

PATHS TO GENERATE:
${items.map((item, i) => `${i+1}. ${item.title} | channels: ${item.channels.join(", ")} | ${item.difficulty} | ${item.hours}h`).join("\n")}

STEP 2: npx tsx ${seedFile}
STEP 3: rm -f ${seedFile}`;
}

// ─── Build the full work queue ─────────────────────────────────────────────────
function buildWorkQueue(): WorkItem[] {
  const items: WorkItem[] = [];

  if (!FILTER_TYPE || FILTER_TYPE === "questions") {
    for (const ch of QUESTION_CHANNELS) {
      items.push({
        id:          `q-${ch.id}`,
        type:        "questions",
        label:       `questions/${ch.id}`,
        agent:       "content-question-expert",
        buildPrompt: () => buildQuestionPrompt(ch, 5),
        apiCheckUrl: `${API_BASE}/api/questions/${ch.id}?limit=200`,
        extractCount: extractArrayLength,
        minNeeded:   5,
      });
    }
  }

  if (!FILTER_TYPE || FILTER_TYPE === "certifications") {
    for (const cert of CERTIFICATIONS) {
      items.push({
        id:          `cert-${cert.id}`,
        type:        "certifications",
        label:       `certs/${cert.id}`,
        agent:       "content-certification-expert",
        buildPrompt: () => buildCertPrompt(cert, 15),
        apiCheckUrl: `${API_BASE}/api/certifications/${cert.id}/questions?limit=500`,
        extractCount: extractArrayLength,
        minNeeded:   15,
      });
    }
  }

  if (!FILTER_TYPE || FILTER_TYPE === "flashcards") {
    for (const ch of FLASHCARD_CHANNELS) {
      items.push({
        id:          `flash-${ch.id}`,
        type:        "flashcards",
        label:       `flashcards/${ch.id}`,
        agent:       "content-flashcard-expert",
        buildPrompt: () => buildFlashcardPrompt(ch, 20),
        apiCheckUrl: `${API_BASE}/api/flashcards/${ch.id}?limit=500`,
        extractCount: extractArrayLength,
        minNeeded:   20,
      });
    }
  }

  if (!FILTER_TYPE || FILTER_TYPE === "voice") {
    for (const ch of VOICE_CHANNELS) {
      items.push({
        id:          `voice-${ch.id}`,
        type:        "voice",
        label:       `voice/${ch.id}`,
        agent:       "content-voice-expert",
        buildPrompt: () => buildVoicePrompt(ch, 5),
        apiCheckUrl: `${API_BASE}/api/voice-sessions/${ch.id}`,
        extractCount: extractArrayLength,
        minNeeded:   5,
      });
    }
  }

  if (!FILTER_TYPE || FILTER_TYPE === "paths") {
    for (const batch of PATH_BATCHES) {
      items.push({
        id:          `path-${batch.type}`,
        type:        "paths",
        label:       `paths/${batch.type}`,
        agent:       "content-learning-path-expert",
        buildPrompt: () => buildPathPrompt(batch, Math.min(batch.items.length, 5)),
        apiCheckUrl: `${API_BASE}/api/learning-paths?type=${batch.type}&limit=200`,
        extractCount: extractArrayLength,
        minNeeded:   5,
      });
    }
  }

  return items;
}

// ─── Dashboard renderer ────────────────────────────────────────────────────────
function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

function elapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m${s % 60}s` : `${s}s`;
}

function bar(pct: number, width = 12): string {
  const filled = Math.round(pct * width);
  const empty  = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

function statusIcon(s: AgentStatus): string {
  switch (s) {
    case "running": return `${C.cyan}⟳${C.reset}`;
    case "done":    return `${C.green}✓${C.reset}`;
    case "failed":  return `${C.red}✗${C.reset}`;
    case "skipped": return `${C.yellow}–${C.reset}`;
    default:        return `${C.dim}·${C.reset}`;
  }
}

function typeColor(t: ContentType): string {
  switch (t) {
    case "questions":     return C.blue;
    case "certifications":return C.magenta;
    case "flashcards":    return C.cyan;
    case "voice":         return C.yellow;
    case "paths":         return C.green;
  }
}

function renderDashboard() {
  const totalGenerated = agents.reduce((s, a) => s + a.generated, 0);
  const running  = agents.filter(a => a.status === "running").length;
  const done     = agents.filter(a => a.status === "done").length;
  const failed   = agents.filter(a => a.status === "failed").length;
  const pending  = agents.filter(a => a.status === "pending").length;
  const skipped  = agents.filter(a => a.status === "skipped").length;
  const total    = agents.length;
  const runTime  = elapsed(Date.now() - startTime);

  const lines: string[] = [];
  const W = 76;

  lines.push(`${C.bold}${"═".repeat(W)}${C.reset}`);
  lines.push(
    `${C.bold}  DevPrep Content Swarm${C.reset}  ` +
    `${C.green}+${totalGenerated} generated${C.reset}  ` +
    `${C.cyan}${running} running${C.reset}  ` +
    `${C.dim}${pending} pending${C.reset}  ` +
    `${C.green}${done} done${C.reset}  ` +
    `${C.red}${failed} failed${C.reset}  ` +
    `${C.yellow}${skipped} skipped${C.reset}  ` +
    `${C.dim}${runTime}${C.reset}`
  );

  const overall = total > 0 ? (done + skipped) / total : 0;
  lines.push(
    `  Overall [${bar(overall, 40)}] ${Math.round(overall * 100)}%  ` +
    `Workers: ${MAX_WORKERS}  Total tasks: ${total}`
  );
  lines.push(`${"─".repeat(W)}`);

  // Header
  lines.push(
    `  ${pad("SLOT", 4)} ${pad("TYPE", 14)} ${pad("TASK", 26)} ${pad("STATUS", 9)} ${pad("GENERATED", 9)} TIME`
  );
  lines.push(`${"─".repeat(W)}`);

  // Show running first, then pending, then done/failed/skipped
  const sorted = [...agents].sort((a, b) => {
    const order = { running:0, pending:1, done:2, skipped:3, failed:4 };
    return order[a.status] - order[b.status];
  });

  for (const a of sorted) {
    const dur   = a.startTime ? elapsed(Date.now() - a.startTime) : "";
    const slot  = a.status === "running" ? `[${String(a.workerSlot).padStart(2, "0")}]` : "    ";
    const tColor = typeColor(a.item.type);
    const statusStr = a.status === "running" ? `${C.cyan}running${C.reset}` :
                      a.status === "done"    ? `${C.green}done   ${C.reset}` :
                      a.status === "failed"  ? `${C.red}FAILED ${C.reset}` :
                      a.status === "skipped" ? `${C.yellow}skip   ${C.reset}` :
                                               `${C.dim}pending${C.reset}`;
    const genStr = a.generated > 0 ? `${C.green}+${a.generated}${C.reset}` : `${C.dim}0${C.reset}`;

    lines.push(
      `  ${statusIcon(a.status)} ${C.dim}${slot}${C.reset} ` +
      `${tColor}${pad(a.item.type, 14)}${C.reset} ` +
      `${pad(a.item.label, 26)} ` +
      `${statusStr} ` +
      `${pad(genStr.replace(/\x1b\[[0-9;]*m/g,""), 9)}${a.generated > 0 ? `${C.green}+${a.generated}${C.reset}` : `${C.dim}0${C.reset}`}`.slice(genStr.length-a.generated.toString().length-1) +
      // simpler approach:
      `    ` +
      `${C.dim}${dur}${C.reset}`
    );
  }

  lines.push(`${"═".repeat(W)}`);

  // Move cursor up to overwrite previous render
  if (dashboardLines > 0) {
    process.stdout.write(C.up(dashboardLines));
  }
  for (const line of lines) {
    process.stdout.write(C.clearLine + line + "\n");
  }
  dashboardLines = lines.length;
}

// Simpler render without ANSI length issues
function renderDashboardClean() {
  const totalGenerated = agents.reduce((s, a) => s + a.generated, 0);
  const running  = agents.filter(a => a.status === "running").length;
  const done     = agents.filter(a => a.status === "done").length;
  const failed   = agents.filter(a => a.status === "failed").length;
  const pending  = agents.filter(a => a.status === "pending").length;
  const skipped  = agents.filter(a => a.status === "skipped").length;
  const total    = agents.length;
  const runTime  = elapsed(Date.now() - startTime);
  const overall  = total > 0 ? (done + skipped) / total : 0;

  const lines: string[] = [];
  const W = 74;

  lines.push(C.bold + "═".repeat(W) + C.reset);
  lines.push(
    `${C.bold}  🚀 DevPrep Content Swarm${C.reset}   ` +
    `runtime: ${C.cyan}${runTime}${C.reset}   ` +
    `workers: ${C.bold}${MAX_WORKERS}${C.reset}`
  );
  lines.push(
    `  Items generated: ${C.green}${C.bold}+${totalGenerated}${C.reset}   ` +
    `Running: ${C.cyan}${running}${C.reset}  ` +
    `Pending: ${C.dim}${pending}${C.reset}  ` +
    `Done: ${C.green}${done}${C.reset}  ` +
    `Skipped: ${C.yellow}${skipped}${C.reset}  ` +
    `Failed: ${C.red}${failed}${C.reset}`
  );
  lines.push(
    `  Progress: [${C.green}${bar(overall, 38)}${C.reset}] ${Math.round(overall * 100)}% (${done + skipped}/${total} tasks)`
  );
  lines.push("─".repeat(W));

  // Sort: running first
  const sorted = [...agents].sort((a, b) => {
    const o = { running:0, pending:1, done:2, skipped:3, failed:4 };
    return o[a.status] - o[b.status];
  });

  for (const a of sorted) {
    const dur    = a.startTime ? `${elapsed(Date.now() - a.startTime)}` : "";
    const genTxt = a.generated > 0 ? `${C.green}+${a.generated} items${C.reset}` : `${C.dim}waiting${C.reset}`;
    const tCol   = typeColor(a.item.type);
    const label  = pad(a.item.label, 28);

    let prefix = "";
    if (a.status === "running") prefix = `${C.cyan}⟳ [${String(a.workerSlot).padStart(2,"0")}]${C.reset}`;
    else if (a.status === "done")    prefix = `${C.green}✓     ${C.reset}`;
    else if (a.status === "failed")  prefix = `${C.red}✗     ${C.reset}`;
    else if (a.status === "skipped") prefix = `${C.yellow}–     ${C.reset}`;
    else                              prefix = `${C.dim}·     ${C.reset}`;

    lines.push(`  ${prefix} ${tCol}${label}${C.reset} ${genTxt}  ${C.dim}${dur}${C.reset}`);
  }

  lines.push("═".repeat(W));

  if (dashboardLines > 0) {
    process.stdout.write(`\x1b[${dashboardLines}A`);
  }
  for (const line of lines) {
    process.stdout.write("\x1b[2K\r" + line + "\n");
  }
  dashboardLines = lines.length;
}

// ─── Worker pool ───────────────────────────────────────────────────────────────
let workerSlotCounter = 0;
const activeSlots = new Set<number>();

function acquireSlot(): number {
  for (let i = 1; i <= MAX_WORKERS; i++) {
    if (!activeSlots.has(i)) {
      activeSlots.add(i);
      return i;
    }
  }
  return ++workerSlotCounter;
}

function releaseSlot(slot: number) {
  activeSlots.delete(slot);
}

async function runAgent(state: AgentState): Promise<void> {
  const slot = acquireSlot();
  state.workerSlot = slot;
  state.status = "running";
  state.startTime = Date.now();

  // Get baseline count
  state.baselineCount = await fetchCount(state.item.apiCheckUrl, state.item.extractCount);
  state.currentCount  = state.baselineCount;

  const prompt = state.item.buildPrompt();

  // Poll count while agent is running
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  pollTimer = setInterval(async () => {
    const cnt = await fetchCount(state.item.apiCheckUrl, state.item.extractCount);
    state.currentCount = cnt;
    state.generated    = Math.max(0, cnt - state.baselineCount);
  }, POLL_INTERVAL_MS);

  await new Promise<void>((resolve) => {
    const child = spawn(
      OPENCODE,
      ["run", "--agent", state.item.agent, prompt],
      {
        stdio: ["ignore", "pipe", "pipe"],
        timeout: TIMEOUT_MS,
      }
    );

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
    }, TIMEOUT_MS);

    child.on("close", async (code, signal) => {
      clearTimeout(timer);
      if (pollTimer) clearInterval(pollTimer);

      // Final count
      const final = await fetchCount(state.item.apiCheckUrl, state.item.extractCount);
      state.currentCount = final;
      state.generated    = Math.max(0, final - state.baselineCount);

      state.status  = (code === 0 || state.generated > 0) ? "done" : "failed";
      state.endTime = Date.now();
      releaseSlot(slot);
      resolve();
    });

    child.on("error", () => {
      clearTimeout(timer);
      if (pollTimer) clearInterval(pollTimer);
      state.status  = "failed";
      state.endTime = Date.now();
      releaseSlot(slot);
      resolve();
    });
  });
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n");

  if (!fs.existsSync(OPENCODE)) {
    console.error(`${C.red}✗ opencode not found at: ${OPENCODE}${C.reset}`);
    console.error(`  Install it first: npm install -g opencode-ai`);
    process.exit(1);
  }

  // Check API
  try {
    const { execSync } = require("child_process") as typeof import("child_process");
    execSync(`curl -s --max-time 5 "${API_BASE}/api/channels" > /dev/null`, { timeout: 7000 });
  } catch {
    console.error(`${C.red}✗ API not reachable at ${API_BASE}${C.reset}`);
    console.error(`  Start the dev server first: npm run dev`);
    process.exit(1);
  }

  const workItems = buildWorkQueue();

  if (workItems.length === 0) {
    console.log(`${C.yellow}No work items match filter: ${FILTER_TYPE}${C.reset}`);
    process.exit(0);
  }

  // Initialize agent states
  for (const item of workItems) {
    agents.push({
      item,
      status:        "pending",
      baselineCount: 0,
      currentCount:  0,
      generated:     0,
      workerSlot:    0,
    });
  }

  startTime = Date.now();
  console.clear();

  // Start dashboard render loop
  renderDashboardClean();
  const renderTimer = setInterval(renderDashboardClean, RENDER_INTERVAL_MS);

  // Worker pool — process up to MAX_WORKERS items concurrently
  let idx = 0;
  const inFlight: Promise<void>[] = [];

  async function pump() {
    while (idx < agents.length) {
      if (activeSlots.size >= MAX_WORKERS) {
        await Promise.race(inFlight);
      }
      const state = agents[idx++];
      const p = runAgent(state).then(() => {
        const i = inFlight.indexOf(p);
        if (i !== -1) inFlight.splice(i, 1);
      });
      inFlight.push(p);
    }
    await Promise.all(inFlight);
  }

  await pump();

  clearInterval(renderTimer);
  renderDashboardClean();

  // Final summary
  const totalGen  = agents.reduce((s, a) => s + a.generated, 0);
  const doneCount = agents.filter(a => a.status === "done").length;
  const failCount = agents.filter(a => a.status === "failed").length;
  const skipCount = agents.filter(a => a.status === "skipped").length;
  const runtime   = elapsed(Date.now() - startTime);

  console.log(`\n${C.bold}${C.green}  ✓ Swarm complete!${C.reset}`);
  console.log(`  Total items generated : ${C.green}${C.bold}+${totalGen}${C.reset}`);
  console.log(`  Tasks done            : ${C.green}${doneCount}${C.reset}`);
  console.log(`  Tasks skipped         : ${C.yellow}${skipCount}${C.reset}`);
  console.log(`  Tasks failed          : ${failCount > 0 ? C.red : C.dim}${failCount}${C.reset}`);
  console.log(`  Total runtime         : ${runtime}\n`);

  if (failCount > 0) {
    console.log(`${C.red}Failed tasks:${C.reset}`);
    agents.filter(a => a.status === "failed").forEach(a => {
      console.log(`  ${C.red}✗${C.reset} ${a.item.label}`);
    });
    console.log();
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main();
