#!/usr/bin/env npx tsx
/**
 * DevPrep Content Generation Swarm
 *
 * Runs up to 30 opencode agents in parallel across ALL content pipelines.
 * Reads/writes directly to local.db — NO running server required.
 *
 *   - Interview Questions  (40 channels)
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
 *   npx tsx scripts/parallel-content-swarm.ts --channel=algorithms
 */

import { createClient } from "@libsql/client";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

// ─── Config ───────────────────────────────────────────────────────────────────
const OPENCODE   = "/home/runner/workspace/.config/npm/node_global/bin/opencode";
const DB_PATH    = path.resolve(process.cwd(), "local.db");
const DB_URL     = `file:${DB_PATH}`;
const MAX_WORKERS = parseInt(process.argv.find(a => a.startsWith("--workers="))?.split("=")[1] ?? "30");
const FILTER_TYPE = process.argv.find(a => a.startsWith("--type="))?.split("=")[1];
const FILTER_CH   = process.argv.find(a => a.startsWith("--channel="))?.split("=")[1];
const TIMEOUT_MS  = 5 * 60 * 1000;  // 5 min per agent
const POLL_MS     = 6_000;           // re-query DB every 6 s
const RENDER_MS   = 400;             // redraw dashboard every 400 ms

// ─── ANSI ─────────────────────────────────────────────────────────────────────
const C = {
  reset:   "\x1b[0m",   bold:    "\x1b[1m",   dim:  "\x1b[2m",
  green:   "\x1b[32m",  red:     "\x1b[31m",  yellow: "\x1b[33m",
  blue:    "\x1b[34m",  cyan:    "\x1b[36m",  magenta: "\x1b[35m",
};

// ─── DB helper ────────────────────────────────────────────────────────────────
const db = createClient({ url: DB_URL });

async function dbCount(sql: string, args: any[] = []): Promise<number> {
  try {
    const r = await db.execute({ sql, args });
    const val = r.rows[0]?.[0];
    return typeof val === "number" ? val : parseInt(String(val ?? "0"), 10);
  } catch {
    return 0;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ContentType = "questions" | "certifications" | "flashcards" | "voice" | "paths";
type AgentStatus = "pending" | "running" | "done" | "failed" | "skipped";

interface WorkItem {
  id:           string;
  type:         ContentType;
  label:        string;
  agent:        string;
  buildPrompt:  () => string;
  countSql:     string;
  countArgs:    any[];
  minNeeded:    number;
}

interface AgentState {
  item:          WorkItem;
  status:        AgentStatus;
  startTime?:    number;
  endTime?:      number;
  baseline:      number;
  current:       number;
  generated:     number;
  workerSlot:    number;
}

// ─── Global state ─────────────────────────────────────────────────────────────
const agents: AgentState[] = [];
let dashLines = 0;
let swarmStart = Date.now();

// ─── Channel / content definitions ───────────────────────────────────────────

const QUESTION_CHANNELS = [
  { id:"algorithms",         context:"Sorting, searching, graph traversal, DP, greedy. Always include Big-O complexity.", sub:["sorting","searching","graph-algorithms","divide-conquer"] },
  { id:"data-structures",    context:"Arrays, linked lists, stacks, queues, trees, heaps, hash tables, graphs, tries.", sub:["trees","hash-tables","graphs","linked-lists","heaps"] },
  { id:"complexity-analysis",context:"Big O/Theta/Omega, time/space complexity, amortized analysis, Master theorem.", sub:["big-o-notation","amortized-analysis","recurrence-relations"] },
  { id:"dynamic-programming",context:"Memoization vs tabulation. Classic: Fibonacci, Knapsack, LCS, Coin Change, Edit Distance.", sub:["memoization","tabulation","classic-problems","optimization"] },
  { id:"bit-manipulation",   context:"AND/OR/XOR/shift. Tricks: power of 2, count bits, bit masking, swap without temp.", sub:["bitwise-operators","bit-tricks","bit-masking"] },
  { id:"design-patterns",    context:"Creational, Structural, Behavioral patterns with real-world use cases.", sub:["creational","structural","behavioral"] },
  { id:"concurrency",        context:"Threads, race conditions, deadlocks, mutexes, semaphores, async/await, event loops.", sub:["threads","deadlocks","synchronization","async-patterns"] },
  { id:"math-logic",         context:"Probability, combinatorics, number theory, discrete math, logic puzzles.", sub:["probability","combinatorics","number-theory","logic-puzzles"] },
  { id:"low-level",          context:"Stack vs heap, pointers, CPU cache, virtual memory, paging, system calls, endianness.", sub:["memory-management","cpu-cache","virtual-memory","system-calls"] },
  { id:"system-design",      context:"Design scalable distributed systems: requirements, capacity, architecture, caching, load balancing, queues.", sub:["distributed-systems","caching","databases","api-design","scalability"] },
  { id:"frontend",           context:"React hooks, virtual DOM, event loop, closures, CSS specificity, Core Web Vitals, TypeScript, Vite.", sub:["react","javascript","css","browser-internals","performance"] },
  { id:"backend",            context:"REST API design, JWT/OAuth2, caching, message queues, microservices, error handling, logging.", sub:["api-design","authentication","caching","microservices","databases"] },
  { id:"database",           context:"SQL joins, indexing (B-tree/hash), ACID, isolation levels, query optimization, NoSQL vs SQL.", sub:["sql","indexing","transactions","query-optimization","nosql"] },
  { id:"devops",             context:"CI/CD, Docker, Kubernetes, IaC (Terraform), monitoring, blue-green/canary deployments.", sub:["ci-cd","docker","kubernetes","iac","monitoring"] },
  { id:"sre",                context:"SLIs, SLOs, error budgets, toil, incident response, postmortems, chaos engineering, observability.", sub:["slos-slas","incident-response","observability","chaos-engineering"] },
  { id:"kubernetes",         context:"Pods, ReplicaSets, Deployments, Services, Ingress, ConfigMaps, Secrets, RBAC, HPA, PVs.", sub:["pods","services","config","scaling","storage"] },
  { id:"aws",                context:"EC2, S3, RDS, DynamoDB, Lambda, VPC, IAM, CloudFormation, ECS/EKS, Route53, CloudWatch.", sub:["compute","storage","networking","serverless","databases"] },
  { id:"terraform",          context:"HCL, providers, resources, modules, remote state, workspaces, plan/apply/destroy.", sub:["hcl-basics","modules","state-management","providers"] },
  { id:"data-engineering",   context:"ETL/ELT, Spark, Kafka, data warehouses, Airflow DAGs, star/snowflake schema, streaming vs batch.", sub:["etl-pipelines","apache-spark","kafka","data-warehousing","airflow"] },
  { id:"machine-learning",   context:"Supervised/unsupervised, bias-variance, gradient descent, precision/recall/F1, neural networks.", sub:["supervised-learning","model-evaluation","neural-networks","feature-engineering"] },
  { id:"generative-ai",      context:"LLMs, transformers, RAG, fine-tuning, embeddings, vector DBs, RLHF, hallucination mitigation.", sub:["llms","rag","fine-tuning","embeddings","transformer-architecture"] },
  { id:"prompt-engineering", context:"Zero-shot, few-shot, chain-of-thought, role prompting, structured output, context management.", sub:["prompting-techniques","structured-output","context-management"] },
  { id:"llm-ops",            context:"LLM deployment, inference, quantization, caching, cost optimization, evaluation, A/B testing.", sub:["inference","model-serving","evaluation","cost-optimization"] },
  { id:"computer-vision",    context:"CNNs, image classification, object detection (YOLO), segmentation, OpenCV, transfer learning.", sub:["cnn-architecture","object-detection","transfer-learning","opencv"] },
  { id:"nlp",                context:"Tokenization, Word2Vec, BERT, text classification, NER, sentiment, seq2seq, attention.", sub:["tokenization","embeddings","text-classification","transformers"] },
  { id:"python",             context:"Data structures, comprehensions, generators, decorators, async/await, type hints, GIL.", sub:["python-basics","oop","functional-programming","async","decorators"] },
  { id:"security",           context:"OWASP Top 10, SQL injection, XSS, CSRF, JWT, TLS, secrets management, pen testing.", sub:["web-security","authentication","cryptography","owasp","secure-coding"] },
  { id:"networking",         context:"OSI model, TCP/UDP, DNS, HTTP/2/3, load balancing, NAT, VPN, CDN, WebSockets, TLS.", sub:["tcp-ip","http","dns","load-balancing","protocols"] },
  { id:"operating-systems",  context:"Process vs thread, scheduling algorithms, memory management, file systems, IPC, deadlock.", sub:["processes-threads","scheduling","memory-management","file-systems"] },
  { id:"linux",              context:"grep/awk/sed, permissions, bash scripting, cron, systemd, package managers, log management.", sub:["shell-commands","shell-scripting","system-administration","networking-tools"] },
  { id:"unix",               context:"POSIX, pipes/redirection, signals, file descriptors, IPC (pipes, sockets, shared memory).", sub:["posix","signals","ipc","file-descriptors","shell-scripting"] },
  { id:"ios",                context:"Swift, UIKit vs SwiftUI, ARC, GCD, Core Data, URLSession, MVVM, App Store submission.", sub:["swift","swiftui","uikit","concurrency","data-persistence"] },
  { id:"android",            context:"Kotlin, Activity/Fragment lifecycle, Compose, ViewModel, Room, Coroutines, WorkManager.", sub:["kotlin","jetpack","lifecycle","coroutines","architecture"] },
  { id:"react-native",       context:"RN architecture (Bridge vs JSI), React Navigation, Redux/Zustand, native modules, Expo.", sub:["rn-architecture","navigation","performance","native-modules"] },
  { id:"testing",            context:"Unit, integration, E2E tests, TDD, BDD, mocking/stubbing, coverage, test pyramids.", sub:["unit-testing","tdd","mocking","test-strategy"] },
  { id:"e2e-testing",        context:"Playwright/Cypress/Selenium, POM, flaky tests, visual regression, accessibility testing.", sub:["playwright","cypress","page-object-model","ci-integration"] },
  { id:"api-testing",        context:"REST/GraphQL testing, Postman, contract testing (Pact), load testing (k6), schema validation.", sub:["rest-testing","contract-testing","load-testing","mocking"] },
  { id:"performance-testing",context:"Load/stress/soak testing, profiling, k6, JMeter, Lighthouse, Core Web Vitals, DB performance.", sub:["load-testing","profiling","web-performance","database-performance"] },
  { id:"engineering-management",context:"1:1s, perf reviews, roadmaps, estimation, stakeholder comms, hiring, technical debt, OKRs.", sub:["leadership","project-management","hiring","technical-strategy"] },
  { id:"behavioral",         context:"STAR method: leadership, conflict, failure, tight deadlines, teamwork, ambiguity, decisions.", sub:["leadership","conflict-resolution","failure-handling","teamwork"] },
];

const CERTIFICATIONS = [
  { id:"aws-saa",           name:"AWS Solutions Architect Associate", provider:"Amazon",    code:"SAA-C03", cat:"cloud",    diff:"intermediate", tq:200, domains:[{n:"Design Resilient Architectures",w:30},{n:"High-Performing Architectures",w:28},{n:"Secure Applications",w:24},{n:"Cost-Optimized Architectures",w:18}], maps:["aws","system-design","database"] },
  { id:"aws-developer",     name:"AWS Developer Associate",          provider:"Amazon",    code:"DVA-C02", cat:"cloud",    diff:"intermediate", tq:150, domains:[{n:"Development with AWS",w:32},{n:"Security",w:26},{n:"Deployment",w:24},{n:"Troubleshooting",w:18}], maps:["aws","backend","devops"] },
  { id:"cka",               name:"Certified Kubernetes Administrator",provider:"CNCF",     code:"CKA",     cat:"devops",   diff:"advanced",     tq:150, domains:[{n:"Cluster Architecture",w:25},{n:"Workloads & Scheduling",w:15},{n:"Services & Networking",w:20},{n:"Storage",w:10},{n:"Troubleshooting",w:30}], maps:["kubernetes","devops","linux"] },
  { id:"ckad",              name:"Certified Kubernetes App Developer",provider:"CNCF",     code:"CKAD",    cat:"devops",   diff:"intermediate", tq:100, domains:[{n:"App Design & Build",w:20},{n:"App Deployment",w:20},{n:"Observability",w:15},{n:"Security",w:25},{n:"Networking",w:20}], maps:["kubernetes","devops","backend"] },
  { id:"terraform-associate",name:"Terraform Associate",             provider:"HashiCorp", code:"003",     cat:"devops",   diff:"intermediate", tq:100, domains:[{n:"IaC Concepts",w:17},{n:"Terraform Basics",w:24},{n:"CLI Usage",w:22},{n:"Modules",w:12},{n:"Core Workflow",w:16}], maps:["terraform","devops"] },
  { id:"security-plus",     name:"CompTIA Security+",                provider:"CompTIA",   code:"SY0-701", cat:"security", diff:"intermediate", tq:150, domains:[{n:"General Security",w:12},{n:"Threats & Vulnerabilities",w:22},{n:"Security Architecture",w:18},{n:"Operations",w:28},{n:"Program Management",w:20}], maps:["security","networking"] },
  { id:"azure-fundamentals",name:"Microsoft Azure Fundamentals",     provider:"Microsoft", code:"AZ-900",  cat:"cloud",    diff:"beginner",     tq:100, domains:[{n:"Cloud Concepts",w:25},{n:"Azure Architecture",w:35},{n:"Management & Governance",w:30},{n:"Pricing & Support",w:10}], maps:["devops","system-design"] },
  { id:"kubernetes-kcna",   name:"Kubernetes and Cloud Native Associate",provider:"CNCF",  code:"KCNA",    cat:"devops",   diff:"beginner",     tq:150, domains:[{n:"Kubernetes Fundamentals",w:46},{n:"Container Orchestration",w:22},{n:"Cloud Native Architecture",w:16},{n:"Observability",w:8},{n:"App Delivery",w:8}], maps:["kubernetes","devops"] },
];

const FLASHCARD_CHANNELS = [
  { id:"algorithms",     target:200, context:"Sorting, searching, DP, graph algorithms. Include Big-O.", cats:["sorting","searching","graph-algorithms","dynamic-programming","greedy"] },
  { id:"system-design",  target:100, context:"Distributed systems, caching, load balancing, databases, API design.", cats:["distributed-systems","caching","databases","api-design","scalability"] },
  { id:"frontend",       target:100, context:"React hooks, virtual DOM, event loop, closures, CSS, TypeScript.", cats:["react","javascript","css","browser-internals","performance"] },
  { id:"backend",        target:100, context:"REST API, authentication, caching, message queues, microservices.", cats:["api-design","authentication","caching","microservices","databases"] },
  { id:"database",       target:80,  context:"SQL joins, indexing, ACID, query optimization, normalization, NoSQL.", cats:["sql","indexing","transactions","nosql","query-optimization"] },
  { id:"devops",         target:80,  context:"CI/CD, Docker, Kubernetes, IaC, monitoring, deployment strategies.", cats:["ci-cd","docker","kubernetes","iac","monitoring"] },
  { id:"security",       target:60,  context:"OWASP Top 10, SQL injection, XSS, CSRF, authentication, TLS.", cats:["web-security","authentication","cryptography","owasp"] },
  { id:"machine-learning",target:60, context:"Supervised/unsupervised, bias-variance, gradient descent, metrics.", cats:["supervised-learning","model-evaluation","neural-networks","feature-engineering"] },
  { id:"generative-ai",  target:60,  context:"LLMs, transformers, RAG, fine-tuning, embeddings, vector DBs.", cats:["llms","rag","fine-tuning","embeddings","transformer-architecture"] },
];

const VOICE_CHANNELS = [
  { id:"algorithms",   target:20, minQ:5, maxQ:10, topics:["sorting-algorithms","graph-traversal","dynamic-programming","binary-search","greedy-algorithms"] },
  { id:"system-design",target:15, minQ:5, maxQ:8,  topics:["url-shortener","distributed-cache","message-queue","api-gateway","rate-limiter"] },
  { id:"frontend",     target:15, minQ:5, maxQ:8,  topics:["react-hooks","javascript-closures","browser-rendering","web-performance","typescript"] },
  { id:"backend",      target:15, minQ:5, maxQ:8,  topics:["rest-api-design","authentication","caching-strategies","microservices","database-design"] },
  { id:"behavioral",   target:30, minQ:3, maxQ:5,  topics:["leadership","conflict-resolution","failure-handling","teamwork","decision-making"] },
  { id:"devops",       target:10, minQ:5, maxQ:8,  topics:["ci-cd-pipeline","docker-kubernetes","infrastructure-as-code","monitoring","incident-response"] },
];

const PATH_BATCHES = [
  { type:"company", target:10, items:[
    {title:"Google SWE Interview Prep",      company:"Google",    ch:["algorithms","system-design","behavioral"], diff:"advanced",     h:80},
    {title:"Amazon SWE Interview Prep",      company:"Amazon",    ch:["algorithms","system-design","behavioral"], diff:"advanced",     h:80},
    {title:"Meta SWE Interview Prep",        company:"Meta",      ch:["algorithms","system-design","behavioral"], diff:"advanced",     h:80},
    {title:"Apple SWE Interview Prep",       company:"Apple",     ch:["algorithms","system-design","behavioral"], diff:"advanced",     h:60},
    {title:"Netflix SWE Interview Prep",     company:"Netflix",   ch:["system-design","behavioral"],             diff:"advanced",     h:60},
    {title:"Microsoft SWE Interview Prep",   company:"Microsoft", ch:["algorithms","system-design","behavioral"], diff:"intermediate", h:60},
    {title:"Stripe Engineering Interview",   company:"Stripe",    ch:["backend","system-design","database"],     diff:"advanced",     h:60},
    {title:"Airbnb Engineering Interview",   company:"Airbnb",    ch:["frontend","backend","system-design"],     diff:"intermediate", h:50},
    {title:"Uber Engineering Interview",     company:"Uber",      ch:["system-design","backend","algorithms"],   diff:"advanced",     h:60},
    {title:"LinkedIn Engineering Interview", company:"LinkedIn",  ch:["algorithms","system-design","behavioral"],diff:"intermediate", h:50},
  ]},
  { type:"job-title", target:10, items:[
    {title:"Frontend Engineer Path",         jt:"frontend-engineer",   ch:["frontend","algorithms"],               diff:"intermediate",h:60},
    {title:"Backend Engineer Path",          jt:"backend-engineer",    ch:["backend","database","system-design"],  diff:"intermediate",h:60},
    {title:"Full-Stack Engineer Path",       jt:"fullstack-engineer",  ch:["frontend","backend","database"],       diff:"intermediate",h:80},
    {title:"Site Reliability Engineer Path", jt:"sre",                 ch:["sre","devops","system-design"],        diff:"advanced",    h:80},
    {title:"DevOps Engineer Path",           jt:"devops-engineer",     ch:["devops","kubernetes","terraform"],     diff:"intermediate",h:70},
    {title:"Data Engineer Path",             jt:"data-engineer",       ch:["data-engineering","database","python"],diff:"intermediate",h:60},
    {title:"ML Engineer Path",               jt:"ml-engineer",         ch:["machine-learning","python"],           diff:"advanced",    h:80},
    {title:"Engineering Manager Path",       jt:"engineering-manager", ch:["engineering-management","behavioral"],  diff:"advanced",    h:50},
    {title:"Mobile Engineer Path",           jt:"mobile-engineer",     ch:["ios","android","react-native"],        diff:"intermediate",h:60},
    {title:"Security Engineer Path",         jt:"security-engineer",   ch:["security","networking","backend"],     diff:"advanced",    h:60},
  ]},
  { type:"skill", target:10, items:[
    {title:"Algorithms Mastery",              ch:["algorithms","data-structures","complexity-analysis"],diff:"intermediate",h:60},
    {title:"System Design Pro",               ch:["system-design","database","devops"],                diff:"advanced",    h:80},
    {title:"Dynamic Programming Deep Dive",   ch:["dynamic-programming","algorithms"],                 diff:"advanced",    h:40},
    {title:"Database Design & Optimization",  ch:["database","backend"],                               diff:"intermediate",h:40},
    {title:"Distributed Systems Fundamentals",ch:["system-design","backend","devops"],                 diff:"advanced",    h:60},
    {title:"JavaScript & TypeScript Mastery", ch:["frontend","backend"],                               diff:"intermediate",h:40},
    {title:"Python for Interviews",           ch:["python","algorithms"],                              diff:"beginner",    h:30},
    {title:"Behavioral Interview Excellence", ch:["behavioral","engineering-management"],              diff:"intermediate",h:20},
    {title:"Web Security Fundamentals",       ch:["security","backend"],                              diff:"intermediate",h:30},
    {title:"Cloud Architecture Patterns",     ch:["aws","system-design","devops"],                    diff:"intermediate",h:50},
  ]},
  { type:"certification", target:5, items:[
    {title:"AWS Solutions Architect Prep", ch:["aws","system-design"],         diff:"intermediate",h:80 },
    {title:"CKA Exam Preparation",         ch:["kubernetes","devops","linux"],  diff:"advanced",    h:100},
    {title:"Terraform Associate Prep",     ch:["terraform","devops"],           diff:"intermediate",h:40 },
    {title:"CKAD Preparation Path",        ch:["kubernetes","devops","backend"],diff:"intermediate",h:60 },
    {title:"CompTIA Security+ Prep",       ch:["security","networking"],        diff:"intermediate",h:60 },
  ]},
] as const;

// ─── Prompt builders — agents write directly to local.db ─────────────────────

function qPrompt(ch: typeof QUESTION_CHANNELS[0], n: number): string {
  const seed = `scripts/temp-q-${ch.id}-${Date.now()}.ts`;
  return `You are a senior engineering interviewer generating content for DevPrep.

TASK: Generate exactly ${n} high-quality interview questions for the "${ch.id}" channel and INSERT them directly into the SQLite database at file:local.db.

Working directory: /home/runner/workspace
Seed script: ${seed}

━━━ STEP 1 — Create ${seed} ━━━
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const questions = [
  // ${n} objects — see shape below
];
async function main() {
  for (const q of questions) {
    await db.execute({
      sql: \`INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [q.id,q.question,q.answer,q.explanation,q.eli5,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt],
    });
    console.log("Inserted:", q.question.slice(0,70));
  }
  db.close();
  console.log("Done —", questions.length, "questions for ${ch.id}");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

QUESTION SHAPE:
{
  id: crypto.randomUUID(),
  question: "specific, realistic question ending with ?",
  answer: "2-4 sentence TL;DR",
  explanation: "250-400 word markdown — ## headings + code block",
  eli5: "1-2 sentences, zero jargon",
  difficulty: "beginner"|"intermediate"|"advanced",
  tags: JSON.stringify(["${ch.id}","subtopic"]),
  channel: "${ch.id}",
  subChannel: "<one of: ${ch.sub.join(", ")}>",
  createdAt: new Date().toISOString(),
}

CHANNEL CONTEXT: ${ch.context}
REQUIREMENTS: ${n} different questions, cover varied sub-topics, include code blocks for code-related topics.
Difficulty: ~30% beginner, 50% intermediate, 20% advanced.

━━━ STEP 2 — Run ━━━
npx tsx ${seed}

━━━ STEP 3 — Verify (direct DB query) ━━━
node -e "const {createClient}=require('@libsql/client');const c=createClient({url:'file:local.db'});c.execute({sql:'SELECT COUNT(*) FROM questions WHERE channel=?',args:['${ch.id}']}).then(r=>console.log('${ch.id} count:',r.rows[0][0])).finally(()=>c.close())"

━━━ STEP 4 — Clean up ━━━
rm -f ${seed}`;
}

function certPrompt(cert: typeof CERTIFICATIONS[0], n: number): string {
  const seed = `scripts/temp-cert-${cert.id}-${Date.now()}.ts`;
  return `You are a certification exam expert generating content for DevPrep.

TASK: Generate exactly ${n} MCQ questions for "${cert.name}" (${cert.code}) and INSERT them directly into the SQLite database at file:local.db.

Working directory: /home/runner/workspace
Seed script: ${seed}

━━━ STEP 1 — Create ${seed} ━━━
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
async function main() {
  await db.execute({
    sql: \`INSERT OR REPLACE INTO certifications (id,name,provider,description,exam_code,category,difficulty,estimated_hours,passing_score,exam_duration,domains,channel_mappings,tags,official_url,status,question_count,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`,
    args: ["${cert.id}","${cert.name}","${cert.provider}","${cert.name} exam prep","${cert.code}","${cert.cat}","${cert.diff}",80,72,120,JSON.stringify(${JSON.stringify(cert.domains)}),JSON.stringify(${JSON.stringify(cert.maps)}),JSON.stringify(["${cert.id}","${cert.cat}"]),"https://example.com","active",${n},new Date().toISOString(),new Date().toISOString()],
  });
  const questions = [
    // ${n} MCQ objects — see shape
  ];
  for (const q of questions) {
    await db.execute({
      sql: \`INSERT OR IGNORE INTO questions (id,question,answer,explanation,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [q.id,q.question,q.answer,q.explanation,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt],
    });
    console.log("Inserted:", q.question.slice(0,70));
  }
  db.close();
  console.log("Done —", questions.length, "MCQs for ${cert.id}");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

MCQ SHAPE:
{
  id: crypto.randomUUID(),
  question: "scenario + A) B) C) D) options in question text",
  answer: "The correct answer is X) ... because ...",
  explanation: "200-300 word markdown: why correct, why others wrong",
  difficulty: "beginner"|"intermediate"|"advanced",
  tags: JSON.stringify(["${cert.id}","${cert.cat}"]),
  channel: "<one of: ${cert.maps.join(", ")}>",
  subChannel: "<relevant domain>",
  createdAt: new Date().toISOString(),
}

DOMAINS: ${cert.domains.map(d=>`${d.n} (${d.w}%)`).join(", ")}
REQUIREMENTS: scenario-based, all 4 options plausible, no "all/none of the above".

━━━ STEP 2 — Run ━━━
npx tsx ${seed}
━━━ STEP 3 — Clean up ━━━
rm -f ${seed}`;
}

function flashPrompt(ch: typeof FLASHCARD_CHANNELS[0], n: number): string {
  const seed = `scripts/temp-flash-${ch.id}-${Date.now()}.ts`;
  return `You are a senior engineering educator generating spaced-repetition flashcards for DevPrep.

TASK: Generate exactly ${n} SRS flashcards for channel "${ch.id}" and INSERT them directly into the SQLite database at file:local.db.

Working directory: /home/runner/workspace
Seed script: ${seed}

━━━ STEP 1 — Create ${seed} ━━━
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const flashcards = [
  // ${n} flashcard objects — see shape
];
async function main() {
  for (const f of flashcards) {
    await db.execute({
      sql: \`INSERT OR IGNORE INTO flashcards (id,channel,front,back,hint,code_example,mnemonic,difficulty,tags,category,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [f.id,f.channel,f.front,f.back,f.hint??null,f.codeExample??null,f.mnemonic??null,f.difficulty,f.tags,f.category,"active",f.createdAt],
    });
    console.log("Inserted:", f.front.slice(0,60));
  }
  db.close();
  console.log("Done —", flashcards.length, "flashcards for ${ch.id}");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

FLASHCARD SHAPE:
{
  id: crypto.randomUUID(),
  channel: "${ch.id}",
  front: "≤15 words, ends with ?",
  back: "40-120 words, direct answer first",
  hint: "optional 1-sentence memory aid or null",
  codeExample: "optional code snippet or null",
  mnemonic: "optional memory trick or null",
  difficulty: "beginner"|"intermediate"|"advanced",
  tags: JSON.stringify(["${ch.id}","subtopic"]),
  category: "<one of: ${ch.cats.join(", ")}>",
  createdAt: new Date().toISOString(),
}

CONTEXT: ${ch.context}
REQUIREMENTS: ${n} different cards, add codeExample for syntax/implementation cards.
Difficulty: 30% beginner, 50% intermediate, 20% advanced.

━━━ STEP 2 — Run ━━━
npx tsx ${seed}
━━━ STEP 3 — Clean up ━━━
rm -f ${seed}`;
}

function voicePrompt(ch: typeof VOICE_CHANNELS[0], n: number): string {
  const seed = `scripts/temp-voice-${ch.id}-${Date.now()}.ts`;
  return `You are a senior engineering interviewer generating voice practice sessions for DevPrep.

TASK: Generate exactly ${n} voice interview sessions for channel "${ch.id}" and INSERT them directly into the SQLite database at file:local.db.

Working directory: /home/runner/workspace
Seed script: ${seed}

━━━ STEP 1 — Create ${seed} ━━━
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const sessions = [
  // ${n} session objects — see shape
];
async function main() {
  for (const s of sessions) {
    await db.execute({
      sql: \`INSERT OR IGNORE INTO voice_sessions (id,topic,description,channel,difficulty,question_ids,total_questions,estimated_minutes,created_at) VALUES (?,?,?,?,?,?,?,?,?)\`,
      args: [s.id,s.topic,s.description,s.channel,s.difficulty,s.questionIds,s.totalQuestions,s.estimatedMinutes,s.createdAt],
    });
    console.log("Inserted:", s.topic);
  }
  db.close();
  console.log("Done —", sessions.length, "voice sessions for ${ch.id}");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

SESSION SHAPE:
{
  id: crypto.randomUUID(),
  topic: "3-6 word descriptive title",
  description: "1-2 sentences: what this session assesses",
  channel: "${ch.id}",
  difficulty: "beginner"|"intermediate"|"advanced",
  questionIds: JSON.stringify([]),
  totalQuestions: ${ch.minQ + 2},
  estimatedMinutes: ${ch.minQ * 3},
  createdAt: new Date().toISOString(),
}

TOPICS (one per session, vary difficulty): ${ch.topics.join(", ")}
REQUIREMENTS: 20% beginner, 60% intermediate, 20% advanced.

━━━ STEP 2 — Run ━━━
npx tsx ${seed}
━━━ STEP 3 — Clean up ━━━
rm -f ${seed}`;
}

function pathPrompt(batch: typeof PATH_BATCHES[number], n: number): string {
  const seed = `scripts/temp-paths-${batch.type}-${Date.now()}.ts`;
  const items = [...batch.items].slice(0, n);
  return `You are a senior engineering career coach generating learning paths for DevPrep.

TASK: Generate exactly ${n} learning paths of type "${batch.type}" and INSERT them directly into the SQLite database at file:local.db.

Working directory: /home/runner/workspace
Seed script: ${seed}

━━━ STEP 1 — Create ${seed} ━━━
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const learningPaths = [
  // ${n} path objects — see shape
];
async function main() {
  for (const p of learningPaths) {
    await db.execute({
      sql: \`INSERT OR IGNORE INTO learning_paths (id,title,description,path_type,target_company,target_job_title,difficulty,estimated_hours,question_ids,channels,tags,prerequisites,learning_objectives,milestones,metadata,status,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [p.id,p.title,p.description,p.pathType,p.targetCompany??null,p.targetJobTitle??null,p.difficulty,p.estimatedHours,p.questionIds,p.channels,p.tags,p.prerequisites,p.learningObjectives,p.milestones,p.metadata,"active",p.createdAt,p.createdAt],
    });
    console.log("Inserted:", p.title);
  }
  db.close();
  console.log("Done —", learningPaths.length, "learning paths");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

PATH SHAPE:
{
  id: crypto.randomUUID(),
  title: "...",
  description: "2-3 sentences: who it's for + what they'll achieve",
  pathType: "${batch.type}",
  targetCompany: null,      // string for 'company' type, else null
  targetJobTitle: null,     // string for 'job-title' type, else null
  difficulty: "beginner"|"intermediate"|"advanced",
  estimatedHours: 60,
  questionIds: JSON.stringify([]),
  channels: JSON.stringify([...]),
  tags: JSON.stringify(["interview-prep","..."]),
  prerequisites: JSON.stringify([]),
  learningObjectives: JSON.stringify(["Can implement ...", "Understands ...", "Able to ..."]),
  milestones: JSON.stringify([
    {title:"Foundation",description:"...",completionPercent:20,questionCount:10},
    {title:"Core Skills",description:"...",completionPercent:40,questionCount:10},
    {title:"Advanced Topics",description:"...",completionPercent:60,questionCount:10},
    {title:"Practice",description:"...",completionPercent:80,questionCount:10},
    {title:"Interview Ready",description:"...",completionPercent:100,questionCount:10},
  ]),
  metadata: JSON.stringify({focusAreas:[],companiesTargeted:[],interviewRounds:[]}),
  createdAt: new Date().toISOString(),
}

PATHS TO GENERATE:
${items.map((item: any, i: number) => `${i+1}. ${item.title}`).join("\n")}

━━━ STEP 2 — Run ━━━
npx tsx ${seed}
━━━ STEP 3 — Clean up ━━━
rm -f ${seed}`;
}

// ─── Build work queue ─────────────────────────────────────────────────────────
function buildQueue(): WorkItem[] {
  const items: WorkItem[] = [];

  if (!FILTER_TYPE || FILTER_TYPE === "questions") {
    for (const ch of QUESTION_CHANNELS) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      items.push({
        id: `q-${ch.id}`, type: "questions", label: `questions/${ch.id}`,
        agent: "content-question-expert",
        buildPrompt: () => qPrompt(ch, 5),
        countSql: "SELECT COUNT(*) FROM questions WHERE channel = ?",
        countArgs: [ch.id],
        minNeeded: 5,
      });
    }
  }

  if (!FILTER_TYPE || FILTER_TYPE === "certifications") {
    for (const cert of CERTIFICATIONS) {
      items.push({
        id: `cert-${cert.id}`, type: "certifications", label: `certs/${cert.id}`,
        agent: "content-certification-expert",
        buildPrompt: () => certPrompt(cert, 15),
        countSql: "SELECT COUNT(*) FROM questions WHERE channel = ?",
        countArgs: [cert.maps[0]],
        minNeeded: 15,
      });
    }
  }

  if (!FILTER_TYPE || FILTER_TYPE === "flashcards") {
    for (const ch of FLASHCARD_CHANNELS) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      items.push({
        id: `flash-${ch.id}`, type: "flashcards", label: `flashcards/${ch.id}`,
        agent: "content-flashcard-expert",
        buildPrompt: () => flashPrompt(ch, 20),
        countSql: "SELECT COUNT(*) FROM flashcards WHERE channel = ?",
        countArgs: [ch.id],
        minNeeded: 20,
      });
    }
  }

  if (!FILTER_TYPE || FILTER_TYPE === "voice") {
    for (const ch of VOICE_CHANNELS) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      items.push({
        id: `voice-${ch.id}`, type: "voice", label: `voice/${ch.id}`,
        agent: "content-voice-expert",
        buildPrompt: () => voicePrompt(ch, 5),
        countSql: "SELECT COUNT(*) FROM voice_sessions WHERE channel = ?",
        countArgs: [ch.id],
        minNeeded: 5,
      });
    }
  }

  if (!FILTER_TYPE || FILTER_TYPE === "paths") {
    for (const batch of PATH_BATCHES) {
      items.push({
        id: `path-${batch.type}`, type: "paths", label: `paths/${batch.type}`,
        agent: "content-learning-path-expert",
        buildPrompt: () => pathPrompt(batch, Math.min(batch.items.length, 5)),
        countSql: "SELECT COUNT(*) FROM learning_paths WHERE path_type = ?",
        countArgs: [batch.type],
        minNeeded: 5,
      });
    }
  }

  return items;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function pad(s: string, n: number) { return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length); }
function elapsed(ms: number) { const s = Math.floor(ms/1000), m = Math.floor(s/60); return m > 0 ? `${m}m${s%60}s` : `${s}s`; }
function bar(pct: number, w = 36) { const f = Math.round(pct*w); return "█".repeat(f) + "░".repeat(w-f); }
function tCol(t: ContentType) {
  return t==="questions"?"questions":t==="certifications"?"certs":t==="flashcards"?"flashcards":t==="voice"?"voice":"paths";
}

function renderDashboard() {
  const totalGen = agents.reduce((s, a) => s + a.generated, 0);
  const running  = agents.filter(a => a.status === "running").length;
  const done     = agents.filter(a => a.status === "done").length;
  const failed   = agents.filter(a => a.status === "failed").length;
  const pending  = agents.filter(a => a.status === "pending").length;
  const skipped  = agents.filter(a => a.status === "skipped").length;
  const total    = agents.length;
  const pct      = total > 0 ? (done + skipped) / total : 0;
  const rt       = elapsed(Date.now() - swarmStart);

  const lines: string[] = [];
  const W = 72;

  lines.push(`${C.bold}${"═".repeat(W)}${C.reset}`);
  lines.push(
    `${C.bold}  DevPrep Content Swarm${C.reset}  ` +
    `${C.green}${C.bold}+${totalGen} generated${C.reset}   ` +
    `${C.cyan}${running} running${C.reset}  ` +
    `${C.dim}${pending} pending${C.reset}  ` +
    `${C.green}${done} done${C.reset}  ` +
    `${C.yellow}${skipped} skip${C.reset}  ` +
    `${C.red}${failed} fail${C.reset}  ` +
    `${C.dim}${rt}${C.reset}`
  );
  lines.push(
    `  [${C.green}${bar(pct)}${C.reset}]` +
    ` ${Math.round(pct*100)}%  ${done+skipped}/${total} tasks · ${MAX_WORKERS} workers`
  );
  lines.push(`${"─".repeat(W)}`);

  const sorted = [...agents].sort((a,b) => {
    const o: Record<AgentStatus,number> = {running:0,pending:1,done:2,skipped:3,failed:4};
    return o[a.status] - o[b.status];
  });

  for (const a of sorted) {
    const dur = a.startTime ? elapsed(Date.now() - a.startTime) : "";
    let icon: string;
    let slotStr: string;
    if (a.status === "running") {
      icon    = `${C.cyan}⟳${C.reset}`;
      slotStr = `${C.cyan}[${String(a.workerSlot).padStart(2,"0")}]${C.reset}`;
    } else if (a.status === "done")    { icon = `${C.green}✓${C.reset}`; slotStr = "    "; }
    else if (a.status === "failed")    { icon = `${C.red}✗${C.reset}`;   slotStr = "    "; }
    else if (a.status === "skipped")   { icon = `${C.yellow}–${C.reset}`;slotStr = "    "; }
    else                               { icon = `${C.dim}·${C.reset}`;   slotStr = "    "; }

    const genStr = a.generated > 0
      ? `${C.green}+${a.generated}${C.reset}`
      : (a.status === "running" ? `${C.dim}...${C.reset}` : `${C.dim}  0${C.reset}`);

    lines.push(
      `  ${icon} ${slotStr} ${pad(a.item.label, 30)} ${genStr.padEnd(a.generated>0?3:3)}  ${C.dim}${dur}${C.reset}`
    );
  }

  lines.push(`${"═".repeat(W)}`);

  if (dashLines > 0) process.stdout.write(`\x1b[${dashLines}A`);
  for (const line of lines) process.stdout.write(`\x1b[2K\r${line}\n`);
  dashLines = lines.length;
}

// ─── Worker pool ──────────────────────────────────────────────────────────────
const activeSlots = new Set<number>();

function acquireSlot(): number {
  for (let i = 1; i <= MAX_WORKERS; i++) {
    if (!activeSlots.has(i)) { activeSlots.add(i); return i; }
  }
  return MAX_WORKERS + 1;
}

async function runAgent(state: AgentState): Promise<void> {
  const slot    = acquireSlot();
  state.workerSlot = slot;
  state.status     = "running";
  state.startTime  = Date.now();

  state.baseline = await dbCount(state.item.countSql, state.item.countArgs);
  state.current  = state.baseline;

  const prompt   = state.item.buildPrompt();
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  pollTimer = setInterval(async () => {
    const n = await dbCount(state.item.countSql, state.item.countArgs);
    state.current   = n;
    state.generated = Math.max(0, n - state.baseline);
  }, POLL_MS);

  await new Promise<void>((resolve) => {
    const child = spawn(OPENCODE, ["run", "--agent", state.item.agent, prompt], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timer = setTimeout(() => child.kill("SIGTERM"), TIMEOUT_MS);

    child.on("close", async () => {
      clearTimeout(timer);
      if (pollTimer) clearInterval(pollTimer);
      const final = await dbCount(state.item.countSql, state.item.countArgs);
      state.current   = final;
      state.generated = Math.max(0, final - state.baseline);
      state.status    = (state.generated > 0) ? "done" : "failed";
      state.endTime   = Date.now();
      activeSlots.delete(slot);
      resolve();
    });

    child.on("error", () => {
      clearTimeout(timer);
      if (pollTimer) clearInterval(pollTimer);
      state.status  = "failed";
      state.endTime = Date.now();
      activeSlots.delete(slot);
      resolve();
    });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(OPENCODE)) {
    console.error(`${C.red}✗ opencode not found: ${OPENCODE}${C.reset}`);
    console.error(`  Run: npm install -g opencode-ai`);
    process.exit(1);
  }

  if (!fs.existsSync(DB_PATH)) {
    console.error(`${C.red}✗ Database not found: ${DB_PATH}${C.reset}`);
    console.error(`  Run the app once first to initialise the DB: npm run dev`);
    process.exit(1);
  }

  // Quick DB connectivity check
  try { await dbCount("SELECT 1"); } catch (e: any) {
    console.error(`${C.red}✗ Cannot open DB: ${e.message}${C.reset}`); process.exit(1);
  }

  const queue = buildQueue();
  if (queue.length === 0) {
    console.log(`${C.yellow}No work items match the current filters.${C.reset}`);
    process.exit(0);
  }

  // Skip tasks that already meet the minimum
  for (const item of queue) {
    const current = await dbCount(item.countSql, item.countArgs);
    agents.push({
      item, workerSlot: 0, baseline: current, current, generated: 0,
      status: current >= item.minNeeded ? "skipped" : "pending",
    });
  }

  const toDo = agents.filter(a => a.status === "pending");
  console.log(`\n${C.bold}${C.cyan}DevPrep Content Swarm${C.reset}`);
  console.log(`  DB: ${DB_PATH}`);
  console.log(`  Tasks: ${toDo.length} active, ${agents.length - toDo.length} already satisfied`);
  console.log(`  Workers: ${MAX_WORKERS} parallel agents\n`);

  if (toDo.length === 0) {
    console.log(`${C.green}✓ All content already meets minimum thresholds. Nothing to do.${C.reset}\n`);
    db.close();
    process.exit(0);
  }

  swarmStart = Date.now();
  dashLines  = 0;

  const renderTimer = setInterval(renderDashboard, RENDER_MS);
  renderDashboard();

  // Concurrency-limited worker pool
  let idx = 0;
  const inFlight: Promise<void>[] = [];

  async function pump() {
    while (idx < agents.length) {
      const state = agents[idx++];
      if (state.status === "skipped") continue;

      // Wait if at capacity
      while (activeSlots.size >= MAX_WORKERS) {
        await Promise.race(inFlight.length ? inFlight : [new Promise(r => setTimeout(r, 200))]);
      }

      const p: Promise<void> = runAgent(state).finally(() => {
        const i = inFlight.indexOf(p);
        if (i !== -1) inFlight.splice(i, 1);
      });
      inFlight.push(p);
    }
    await Promise.all(inFlight);
  }

  await pump();
  clearInterval(renderTimer);
  renderDashboard();
  db.close();

  // Summary
  const totalGen  = agents.reduce((s, a) => s + a.generated, 0);
  const doneCount = agents.filter(a => a.status === "done").length;
  const failCount = agents.filter(a => a.status === "failed").length;
  const skipCount = agents.filter(a => a.status === "skipped").length;

  console.log(`\n${C.bold}${C.green}  ✓ Swarm complete!${C.reset}`);
  console.log(`  Generated : ${C.green}${C.bold}+${totalGen} items${C.reset}`);
  console.log(`  Done      : ${C.green}${doneCount}${C.reset}`);
  console.log(`  Skipped   : ${C.yellow}${skipCount}${C.reset}`);
  console.log(`  Failed    : ${failCount > 0 ? C.red : C.dim}${failCount}${C.reset}`);
  console.log(`  Runtime   : ${elapsed(Date.now() - swarmStart)}\n`);

  if (failCount > 0) {
    console.log(`${C.red}Failed tasks:${C.reset}`);
    agents.filter(a => a.status === "failed").forEach(a => console.log(`  ✗ ${a.item.label}`));
    console.log();
    process.exit(1);
  }
}

main();
