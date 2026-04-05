#!/usr/bin/env npx tsx
/**
 * DevPrep Content Generation Swarm — Parallel Edition
 *
 * Spawns at least 5 subagents per session, with multiple parallel sessions
 * for maximum throughput writing directly to local.db.
 *
 * Features:
 *   • Minimum 5 parallel agents launched immediately per batch
 *   • Multiple concurrent sessions (configurable --sessions)
 *   • Session-based work distribution with automatic scaling
 *   • Real-time dashboard with progress tracking
 *
 * Pipelines:
 *   questions (40 channels) · certifications (8) · flashcards (9)
 *   voice sessions (6)      · learning paths (4)
 *
 * Usage:
 *   npx tsx scripts/parallel-content-swarm.ts           # 5 workers, 1 session
 *   npx tsx scripts/parallel-content-swarm.ts --workers=10 --sessions=3
 *   npx tsx scripts/parallel-content-swarm.ts --type=questions
 *   npx tsx scripts/parallel-content-swarm.ts --type=flashcards --channel=algorithms
 *   npx tsx scripts/parallel-content-swarm.ts --dry-run
 */

import { createClient }  from "@libsql/client";
import { spawn }         from "child_process";
import * as fs           from "fs";
import * as os           from "os";
import * as path         from "path";

// ─── CLI args ─────────────────────────────────────────────────────────────────
const arg  = (flag: string) => process.argv.find(a => a.startsWith(`${flag}=`))?.split("=")[1];
const flag = (f: string)    => process.argv.includes(f);

const MAX_WORKERS   = Math.min(30, Math.max(5, parseInt(arg("--workers") ?? "5"))); // min 5
const SESSIONS      = Math.max(1, parseInt(arg("--sessions") ?? "1")); // parallel sessions
const FILTER_TYPE   = arg("--type");
const FILTER_CH     = arg("--channel");
const DRY_RUN       = flag("--dry-run");
const LOAD_LIMIT    = parseFloat(arg("--max-load") ?? "3.0");
const MIN_PARALLEL  = 5; // guaranteed minimum parallel agents per batch
const BATCH_DELAY_MS = 500; // micro-delay between batch spawns

const OPENCODE     = "/home/runner/workspace/.config/npm/node_global/bin/opencode";
const DB_PATH      = path.resolve(process.cwd(), "local.db");
const TIMEOUT_MS   = 6 * 60 * 1000;
const POLL_MS      = 5_000;
const RENDER_MS    = 600;

// ─── ANSI ─────────────────────────────────────────────────────────────────────
const C = {
  r: "\x1b[0m",  b: "\x1b[1m",  d: "\x1b[2m",
  g: "\x1b[32m", rd: "\x1b[31m", y: "\x1b[33m",
  bl: "\x1b[34m", c: "\x1b[36m", m: "\x1b[35m",
  bg: "\x1b[42m",
};
const SPIN = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
let spinIdx = 0;

// ─── DB ───────────────────────────────────────────────────────────────────────
const db = createClient({ url: `file:${DB_PATH}` });

async function dbCount(sql: string, args: any[] = []): Promise<number> {
  try {
    const r = await db.execute({ sql, args });
    const v = r.rows[0]?.[0];
    return typeof v === "number" ? v : parseInt(String(v ?? "0"), 10);
  } catch { return 0; }
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ContentType = "questions"|"certifications"|"flashcards"|"voice"|"paths";
type Status      = "pending"|"running"|"done"|"failed"|"skipped";

interface Task {
  id:          string;
  type:        ContentType;
  label:       string;
  agent:       string;
  buildPrompt: () => string;
  countSql:    string;
  countArgs:   any[];
  minNeeded:   number;
}

interface Agent {
  task:        Task;
  status:      Status;
  slot:        number;
  startedAt?:  number;
  endedAt?:    number;
  baseline:    number;
  current:     number;
  generated:   number;
}

// ─── Content definitions ──────────────────────────────────────────────────────

const Q_CHANNELS = [
  { id:"algorithms",          ctx:"Sorting, searching, graph traversal, DP, greedy. Always include Big-O.", sub:["sorting","searching","graph-algorithms","divide-conquer"] },
  { id:"data-structures",     ctx:"Arrays, linked lists, stacks, queues, trees, heaps, hash tables, tries.", sub:["trees","hash-tables","graphs","linked-lists","heaps"] },
  { id:"complexity-analysis", ctx:"Big O/Theta/Omega, amortized analysis, Master theorem, recurrences.", sub:["big-o-notation","amortized-analysis","recurrence-relations"] },
  { id:"dynamic-programming", ctx:"Memoization vs tabulation. Fibonacci, Knapsack, LCS, Coin Change, Edit Distance.", sub:["memoization","tabulation","classic-problems","optimization"] },
  { id:"bit-manipulation",    ctx:"AND/OR/XOR/shift. Power of 2, count bits, bit masking, swap without temp.", sub:["bitwise-operators","bit-tricks","bit-masking"] },
  { id:"design-patterns",     ctx:"Creational, Structural, Behavioral patterns with real-world use cases.", sub:["creational","structural","behavioral"] },
  { id:"concurrency",         ctx:"Threads, race conditions, deadlocks, mutexes, semaphores, async/await.", sub:["threads","deadlocks","synchronization","async-patterns"] },
  { id:"math-logic",          ctx:"Probability, combinatorics, number theory, discrete math, logic puzzles.", sub:["probability","combinatorics","number-theory","logic-puzzles"] },
  { id:"low-level",           ctx:"Stack vs heap, pointers, CPU cache, virtual memory, paging, system calls.", sub:["memory-management","cpu-cache","virtual-memory","system-calls"] },
  { id:"system-design",       ctx:"Design scalable distributed systems. Requirements, capacity, caching, queues.", sub:["distributed-systems","caching","databases","api-design","scalability"] },
  { id:"frontend",            ctx:"React hooks, virtual DOM, event loop, closures, CSS, Core Web Vitals, TypeScript.", sub:["react","javascript","css","browser-internals","performance"] },
  { id:"backend",             ctx:"REST API, JWT/OAuth2, caching, message queues, microservices, error handling.", sub:["api-design","authentication","caching","microservices","databases"] },
  { id:"database",            ctx:"SQL joins, indexing, ACID, isolation levels, query optimisation, NoSQL vs SQL.", sub:["sql","indexing","transactions","query-optimization","nosql"] },
  { id:"devops",              ctx:"CI/CD, Docker, Kubernetes, Terraform, monitoring, blue-green/canary deploys.", sub:["ci-cd","docker","kubernetes","iac","monitoring"] },
  { id:"sre",                 ctx:"SLIs, SLOs, error budgets, toil, incident response, chaos engineering.", sub:["slos-slas","incident-response","observability","chaos-engineering"] },
  { id:"kubernetes",          ctx:"Pods, ReplicaSets, Deployments, Services, Ingress, ConfigMaps, RBAC, HPA.", sub:["pods","services","config","scaling","storage"] },
  { id:"aws",                 ctx:"EC2, S3, RDS, DynamoDB, Lambda, VPC, IAM, CloudFormation, ECS/EKS, CloudWatch.", sub:["compute","storage","networking","serverless","databases"] },
  { id:"terraform",           ctx:"HCL, providers, resources, modules, remote state, workspaces, plan/apply.", sub:["hcl-basics","modules","state-management","providers"] },
  { id:"data-engineering",    ctx:"ETL/ELT, Spark, Kafka, data warehouses, Airflow, star/snowflake schema.", sub:["etl-pipelines","apache-spark","kafka","data-warehousing","airflow"] },
  { id:"machine-learning",    ctx:"Supervised/unsupervised, bias-variance, gradient descent, neural networks.", sub:["supervised-learning","model-evaluation","neural-networks","feature-engineering"] },
  { id:"generative-ai",       ctx:"LLMs, transformers, RAG, fine-tuning, embeddings, vector DBs, hallucination.", sub:["llms","rag","fine-tuning","embeddings","transformer-architecture"] },
  { id:"prompt-engineering",  ctx:"Zero-shot, few-shot, chain-of-thought, role prompting, structured output.", sub:["prompting-techniques","structured-output","context-management"] },
  { id:"llm-ops",             ctx:"LLM deployment, inference, quantisation, caching, cost optimisation, evaluation.", sub:["inference","model-serving","evaluation","cost-optimization"] },
  { id:"computer-vision",     ctx:"CNNs, image classification, YOLO, segmentation, OpenCV, transfer learning.", sub:["cnn-architecture","object-detection","transfer-learning","opencv"] },
  { id:"nlp",                 ctx:"Tokenisation, Word2Vec, BERT, text classification, NER, seq2seq, attention.", sub:["tokenization","embeddings","text-classification","transformers"] },
  { id:"python",              ctx:"Comprehensions, generators, decorators, async/await, type hints, GIL.", sub:["python-basics","oop","functional-programming","async","decorators"] },
  { id:"security",            ctx:"OWASP Top 10, SQL injection, XSS, CSRF, JWT, TLS, secrets management.", sub:["web-security","authentication","cryptography","owasp","secure-coding"] },
  { id:"networking",          ctx:"OSI model, TCP/UDP, DNS, HTTP/2/3, load balancing, CDN, WebSockets, TLS.", sub:["tcp-ip","http","dns","load-balancing","protocols"] },
  { id:"operating-systems",   ctx:"Processes vs threads, scheduling, memory management, file systems, IPC.", sub:["processes-threads","scheduling","memory-management","file-systems"] },
  { id:"linux",               ctx:"grep/awk/sed, chmod, bash scripting, cron, systemd, package managers.", sub:["shell-commands","shell-scripting","system-administration","networking-tools"] },
  { id:"unix",                ctx:"POSIX, pipes, signals, file descriptors, IPC (pipes, sockets, shared memory).", sub:["posix","signals","ipc","file-descriptors","shell-scripting"] },
  { id:"ios",                 ctx:"Swift, UIKit vs SwiftUI, ARC, GCD, Core Data, URLSession, MVVM.", sub:["swift","swiftui","uikit","concurrency","data-persistence"] },
  { id:"android",             ctx:"Kotlin, Activity/Fragment lifecycle, Compose, ViewModel, Room, Coroutines.", sub:["kotlin","jetpack","lifecycle","coroutines","architecture"] },
  { id:"react-native",        ctx:"RN architecture (JSI), React Navigation, Redux/Zustand, native modules, Expo.", sub:["rn-architecture","navigation","performance","native-modules"] },
  { id:"testing",             ctx:"Unit, integration, E2E, TDD, BDD, mocking/stubbing, coverage, pyramids.", sub:["unit-testing","tdd","mocking","test-strategy"] },
  { id:"e2e-testing",         ctx:"Playwright/Cypress/Selenium, POM, flaky tests, visual regression.", sub:["playwright","cypress","page-object-model","ci-integration"] },
  { id:"api-testing",         ctx:"REST/GraphQL testing, Postman, contract testing (Pact), k6, schema validation.", sub:["rest-testing","contract-testing","load-testing","mocking"] },
  { id:"performance-testing", ctx:"Load/stress/soak, profiling, k6, JMeter, Lighthouse, Core Web Vitals.", sub:["load-testing","profiling","web-performance","database-performance"] },
  { id:"engineering-management",ctx:"1:1s, perf reviews, roadmaps, estimation, stakeholder comms, hiring.", sub:["leadership","project-management","hiring","technical-strategy"] },
  { id:"behavioral",          ctx:"STAR method: leadership, conflict, failure, deadlines, teamwork, ambiguity.", sub:["leadership","conflict-resolution","failure-handling","teamwork"] },
];

const CERTIFICATIONS = [
  { id:"aws-saa",            name:"AWS Solutions Architect Associate", prov:"Amazon",    code:"SAA-C03", cat:"cloud",    diff:"intermediate", domains:[{n:"Design Resilient Architectures",w:30},{n:"High-Performing Architectures",w:28},{n:"Secure Applications",w:24},{n:"Cost-Optimized",w:18}],           maps:["aws","system-design","database"] },
  { id:"aws-developer",      name:"AWS Developer Associate",          prov:"Amazon",    code:"DVA-C02", cat:"cloud",    diff:"intermediate", domains:[{n:"Development with AWS",w:32},{n:"Security",w:26},{n:"Deployment",w:24},{n:"Troubleshooting",w:18}],             maps:["aws","backend","devops"] },
  { id:"cka",                name:"Certified Kubernetes Administrator",prov:"CNCF",     code:"CKA",     cat:"devops",   diff:"advanced",     domains:[{n:"Cluster Architecture",w:25},{n:"Workloads & Scheduling",w:15},{n:"Networking",w:20},{n:"Storage",w:10},{n:"Troubleshooting",w:30}], maps:["kubernetes","devops","linux"] },
  { id:"ckad",               name:"Certified Kubernetes App Developer",prov:"CNCF",    code:"CKAD",    cat:"devops",   diff:"intermediate", domains:[{n:"App Design & Build",w:20},{n:"App Deployment",w:20},{n:"Observability",w:15},{n:"Security",w:25},{n:"Networking",w:20}],    maps:["kubernetes","devops","backend"] },
  { id:"terraform-associate",name:"Terraform Associate",              prov:"HashiCorp", code:"003",     cat:"devops",   diff:"intermediate", domains:[{n:"IaC Concepts",w:17},{n:"Terraform Basics",w:24},{n:"CLI",w:22},{n:"Modules",w:12},{n:"Workflow",w:16}],               maps:["terraform","devops"] },
  { id:"security-plus",      name:"CompTIA Security+",                prov:"CompTIA",   code:"SY0-701", cat:"security", diff:"intermediate", domains:[{n:"General Security",w:12},{n:"Threats",w:22},{n:"Architecture",w:18},{n:"Operations",w:28},{n:"Management",w:20}],        maps:["security","networking"] },
  { id:"azure-fundamentals", name:"Microsoft Azure Fundamentals",     prov:"Microsoft", code:"AZ-900",  cat:"cloud",    diff:"beginner",     domains:[{n:"Cloud Concepts",w:25},{n:"Azure Architecture",w:35},{n:"Management",w:30},{n:"Pricing",w:10}],                         maps:["devops","system-design"] },
  { id:"kubernetes-kcna",    name:"Kubernetes and Cloud Native Associate",prov:"CNCF", code:"KCNA",    cat:"devops",   diff:"beginner",     domains:[{n:"Kubernetes Fundamentals",w:46},{n:"Container Orchestration",w:22},{n:"Cloud Native",w:16},{n:"Observability",w:8},{n:"App Delivery",w:8}], maps:["kubernetes","devops"] },
];

const F_CHANNELS = [
  { id:"algorithms",     target:200, ctx:"Sorting, searching, DP, graph algorithms. Include Big-O.", cats:["sorting","searching","graph-algorithms","dynamic-programming","greedy"] },
  { id:"system-design",  target:100, ctx:"Distributed systems, caching, load balancing, databases, API design.", cats:["distributed-systems","caching","databases","api-design","scalability"] },
  { id:"frontend",       target:100, ctx:"React hooks, virtual DOM, event loop, closures, CSS, TypeScript.", cats:["react","javascript","css","browser-internals","performance"] },
  { id:"backend",        target:100, ctx:"REST API, authentication, caching, message queues, microservices.", cats:["api-design","authentication","caching","microservices","databases"] },
  { id:"database",       target:80,  ctx:"SQL joins, indexing, ACID, query optimisation, normalization.", cats:["sql","indexing","transactions","nosql","query-optimization"] },
  { id:"devops",         target:80,  ctx:"CI/CD, Docker, Kubernetes, IaC, monitoring, deployments.", cats:["ci-cd","docker","kubernetes","iac","monitoring"] },
  { id:"security",       target:60,  ctx:"OWASP Top 10, SQL injection, XSS, CSRF, authentication, TLS.", cats:["web-security","authentication","cryptography","owasp"] },
  { id:"machine-learning",target:60, ctx:"Supervised/unsupervised, bias-variance, gradient descent, metrics.", cats:["supervised-learning","model-evaluation","neural-networks","feature-engineering"] },
  { id:"generative-ai",  target:60,  ctx:"LLMs, transformers, RAG, fine-tuning, embeddings, vector DBs.", cats:["llms","rag","fine-tuning","embeddings","transformer-architecture"] },
];

const V_CHANNELS = [
  { id:"algorithms",    target:20, minQ:5, maxQ:10, topics:["sorting-algorithms","graph-traversal","dynamic-programming","binary-search","greedy-algorithms"] },
  { id:"system-design", target:15, minQ:5, maxQ:8,  topics:["url-shortener","distributed-cache","message-queue","api-gateway","rate-limiter"] },
  { id:"frontend",      target:15, minQ:5, maxQ:8,  topics:["react-hooks","javascript-closures","browser-rendering","web-performance","typescript"] },
  { id:"backend",       target:15, minQ:5, maxQ:8,  topics:["rest-api-design","authentication","caching-strategies","microservices","database-design"] },
  { id:"behavioral",    target:30, minQ:3, maxQ:5,  topics:["leadership","conflict-resolution","failure-handling","teamwork","decision-making"] },
  { id:"devops",        target:10, minQ:5, maxQ:8,  topics:["ci-cd-pipeline","docker-kubernetes","iac","monitoring","incident-response"] },
];

const P_BATCHES = [
  { type:"company" as const, target:10, items:[
    {title:"Google SWE Interview Prep",      company:"Google",    ch:["algorithms","system-design","behavioral"],diff:"advanced",    h:80},
    {title:"Amazon SWE Interview Prep",      company:"Amazon",    ch:["algorithms","system-design","behavioral"],diff:"advanced",    h:80},
    {title:"Meta SWE Interview Prep",        company:"Meta",      ch:["algorithms","system-design","behavioral"],diff:"advanced",    h:80},
    {title:"Apple SWE Interview Prep",       company:"Apple",     ch:["algorithms","system-design","behavioral"],diff:"advanced",    h:60},
    {title:"Netflix SWE Interview Prep",     company:"Netflix",   ch:["system-design","behavioral"],            diff:"advanced",    h:60},
    {title:"Microsoft SWE Interview Prep",   company:"Microsoft", ch:["algorithms","system-design","behavioral"],diff:"intermediate",h:60},
    {title:"Stripe Engineering Interview",   company:"Stripe",    ch:["backend","system-design","database"],    diff:"advanced",    h:60},
    {title:"Airbnb Engineering Interview",   company:"Airbnb",    ch:["frontend","backend","system-design"],    diff:"intermediate",h:50},
    {title:"Uber Engineering Interview",     company:"Uber",      ch:["system-design","backend","algorithms"],  diff:"advanced",    h:60},
    {title:"LinkedIn Engineering Interview", company:"LinkedIn",  ch:["algorithms","system-design","behavioral"],diff:"intermediate",h:50},
  ]},
  { type:"job-title" as const, target:10, items:[
    {title:"Frontend Engineer Path",          jt:"frontend-engineer",   ch:["frontend","algorithms"],              diff:"intermediate",h:60},
    {title:"Backend Engineer Path",           jt:"backend-engineer",    ch:["backend","database","system-design"], diff:"intermediate",h:60},
    {title:"Full-Stack Engineer Path",        jt:"fullstack-engineer",  ch:["frontend","backend","database"],      diff:"intermediate",h:80},
    {title:"Site Reliability Engineer Path",  jt:"sre",                 ch:["sre","devops","system-design"],       diff:"advanced",    h:80},
    {title:"DevOps Engineer Path",            jt:"devops-engineer",     ch:["devops","kubernetes","terraform"],    diff:"intermediate",h:70},
    {title:"Data Engineer Path",              jt:"data-engineer",       ch:["data-engineering","database","python"],diff:"intermediate",h:60},
    {title:"ML Engineer Path",               jt:"ml-engineer",          ch:["machine-learning","python"],          diff:"advanced",    h:80},
    {title:"Engineering Manager Path",        jt:"engineering-manager", ch:["engineering-management","behavioral"], diff:"advanced",    h:50},
    {title:"Mobile Engineer Path",            jt:"mobile-engineer",     ch:["ios","android","react-native"],       diff:"intermediate",h:60},
    {title:"Security Engineer Path",          jt:"security-engineer",   ch:["security","networking","backend"],    diff:"advanced",    h:60},
  ]},
  { type:"skill" as const, target:10, items:[
    {title:"Algorithms Mastery",              ch:["algorithms","data-structures","complexity-analysis"],diff:"intermediate",h:60},
    {title:"System Design Pro",              ch:["system-design","database","devops"],                 diff:"advanced",    h:80},
    {title:"Dynamic Programming Deep Dive",  ch:["dynamic-programming","algorithms"],                  diff:"advanced",    h:40},
    {title:"Database Design & Optimisation", ch:["database","backend"],                                diff:"intermediate",h:40},
    {title:"Distributed Systems Fundamentals",ch:["system-design","backend","devops"],                 diff:"advanced",    h:60},
    {title:"JavaScript & TypeScript Mastery",ch:["frontend","backend"],                                diff:"intermediate",h:40},
    {title:"Python for Interviews",          ch:["python","algorithms"],                               diff:"beginner",    h:30},
    {title:"Behavioural Interview Excellence",ch:["behavioral","engineering-management"],              diff:"intermediate",h:20},
    {title:"Web Security Fundamentals",      ch:["security","backend"],                               diff:"intermediate",h:30},
    {title:"Cloud Architecture Patterns",    ch:["aws","system-design","devops"],                      diff:"intermediate",h:50},
  ]},
  { type:"certification" as const, target:5, items:[
    {title:"AWS Solutions Architect Prep",   ch:["aws","system-design"],         diff:"intermediate",h:80 },
    {title:"CKA Exam Preparation",           ch:["kubernetes","devops","linux"],  diff:"advanced",    h:100},
    {title:"Terraform Associate Prep",       ch:["terraform","devops"],           diff:"intermediate",h:40 },
    {title:"CKAD Preparation Path",          ch:["kubernetes","devops","backend"],diff:"intermediate",h:60 },
    {title:"CompTIA Security+ Prep",         ch:["security","networking"],        diff:"intermediate",h:60 },
  ]},
];

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildQPrompt(ch: typeof Q_CHANNELS[0], n: number): string {
  const seed = `scripts/.tmp-q-${ch.id}-${Date.now()}.ts`;
  return `You are a senior engineering interviewer generating content for DevPrep.

TASK: Generate exactly ${n} interview questions for channel "${ch.id}" and INSERT them into file:local.db.

Seed script path: ${seed}

Create ${seed}:
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const questions = [
  /* ${n} objects */
];
async function main() {
  for (const q of questions) {
    await db.execute({ sql: \`INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)\`, args: [q.id,q.question,q.answer,q.explanation,q.eli5,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt] });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for ${ch.id}");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

SHAPE per item:
{
  id: crypto.randomUUID(),
  question: "specific realistic question ending with ?",
  answer: "2-4 sentence TL;DR",
  explanation: "250-400 word markdown with ## headings and a code block",
  eli5: "1-2 sentences, zero jargon",
  difficulty: "beginner"|"intermediate"|"advanced",
  tags: JSON.stringify(["${ch.id}","subtopic"]),
  channel: "${ch.id}",
  subChannel: "<one of: ${ch.sub.join(", ")}>",
  createdAt: new Date().toISOString(),
}

CONTEXT: ${ch.ctx}
RULES: ${n} unique questions across different sub-topics, code blocks for code-related topics, mix of difficulties.

Run: npx tsx ${seed}
Cleanup: rm -f ${seed}`;
}

function buildCertPrompt(cert: typeof CERTIFICATIONS[0], n: number): string {
  const seed = `scripts/.tmp-cert-${cert.id}-${Date.now()}.ts`;
  return `You are a certification exam expert generating MCQ content for DevPrep.

TASK: Generate exactly ${n} MCQ questions for "${cert.name}" (${cert.code}) and INSERT them into file:local.db.

Seed script path: ${seed}

Create ${seed}:
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
async function main() {
  await db.execute({ sql: \`INSERT OR REPLACE INTO certifications (id,name,provider,description,exam_code,category,difficulty,estimated_hours,passing_score,exam_duration,domains,channel_mappings,tags,official_url,status,question_count,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`, args: ["${cert.id}","${cert.name}","${cert.prov}","${cert.name} exam prep","${cert.code}","${cert.cat}","${cert.diff}",80,72,120,JSON.stringify(${JSON.stringify(cert.domains)}),JSON.stringify(${JSON.stringify(cert.maps)}),JSON.stringify(["${cert.id}","${cert.cat}"]),"https://example.com","active",${n},new Date().toISOString(),new Date().toISOString()] });
  const questions = [ /* ${n} MCQ objects */ ];
  for (const q of questions) {
    await db.execute({ sql: \`INSERT OR IGNORE INTO questions (id,question,answer,explanation,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)\`, args: [q.id,q.question,q.answer,q.explanation,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt] });
  }
  db.close();
  console.log("Inserted", questions.length, "MCQs for ${cert.id}");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

MCQ SHAPE: { id: crypto.randomUUID(), question: "scenario + A) B) C) D) in question text", answer: "The correct answer is X) ... because ...", explanation: "200-300 word markdown: why correct, why others wrong", difficulty: "beginner"|"intermediate"|"advanced", tags: JSON.stringify(["${cert.id}","${cert.cat}"]), channel: "<one of: ${cert.maps.join(", ")}>", subChannel: "<domain>", createdAt: new Date().toISOString() }

DOMAINS: ${cert.domains.map(d=>`${d.n}(${d.w}%)`).join(", ")}
RULES: scenario-based, all 4 options plausible, no "all/none of the above".

Run: npx tsx ${seed}
Cleanup: rm -f ${seed}`;
}

function buildFlashPrompt(ch: typeof F_CHANNELS[0], n: number): string {
  const seed = `scripts/.tmp-flash-${ch.id}-${Date.now()}.ts`;
  return `You are a senior engineering educator generating SRS flashcards for DevPrep.

TASK: Generate exactly ${n} flashcards for channel "${ch.id}" and INSERT them into file:local.db.

Seed script path: ${seed}

Create ${seed}:
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const flashcards = [ /* ${n} objects */ ];
async function main() {
  for (const f of flashcards) {
    await db.execute({ sql: \`INSERT OR IGNORE INTO flashcards (id,channel,front,back,hint,code_example,mnemonic,difficulty,tags,category,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)\`, args: [f.id,f.channel,f.front,f.back,f.hint??null,f.codeExample??null,f.mnemonic??null,f.difficulty,f.tags,f.category,"active",f.createdAt] });
  }
  db.close();
  console.log("Inserted", flashcards.length, "flashcards for ${ch.id}");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

SHAPE: { id: crypto.randomUUID(), channel: "${ch.id}", front: "≤15 words, ends with ?", back: "40-120 words direct answer first", hint: "1-sentence aid or null", codeExample: "code snippet or null", mnemonic: "trick or null", difficulty: "beginner"|"intermediate"|"advanced", tags: JSON.stringify(["${ch.id}","subtopic"]), category: "<one of: ${ch.cats.join(", ")}>", createdAt: new Date().toISOString() }

CONTEXT: ${ch.ctx}
RULES: ${n} unique cards, add codeExample for syntax/implementation topics, 30/50/20 difficulty split.

Run: npx tsx ${seed}
Cleanup: rm -f ${seed}`;
}

function buildVoicePrompt(ch: typeof V_CHANNELS[0], n: number): string {
  const seed = `scripts/.tmp-voice-${ch.id}-${Date.now()}.ts`;
  return `You are a senior engineering interviewer generating voice practice sessions for DevPrep.

TASK: Generate exactly ${n} voice sessions for channel "${ch.id}" and INSERT them into file:local.db.

Seed script path: ${seed}

Create ${seed}:
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const sessions = [ /* ${n} objects */ ];
async function main() {
  for (const s of sessions) {
    await db.execute({ sql: \`INSERT OR IGNORE INTO voice_sessions (id,topic,description,channel,difficulty,question_ids,total_questions,estimated_minutes,created_at) VALUES (?,?,?,?,?,?,?,?,?)\`, args: [s.id,s.topic,s.description,s.channel,s.difficulty,s.questionIds,s.totalQuestions,s.estimatedMinutes,s.createdAt] });
  }
  db.close();
  console.log("Inserted", sessions.length, "voice sessions for ${ch.id}");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

SHAPE: { id: crypto.randomUUID(), topic: "3-6 word title", description: "1-2 sentences", channel: "${ch.id}", difficulty: "beginner"|"intermediate"|"advanced", questionIds: JSON.stringify([]), totalQuestions: ${ch.minQ+2}, estimatedMinutes: ${ch.minQ*3}, createdAt: new Date().toISOString() }

TOPICS: ${ch.topics.join(", ")}
RULES: ${n} sessions, one topic each, 20/60/20 difficulty split.

Run: npx tsx ${seed}
Cleanup: rm -f ${seed}`;
}

function buildPathPrompt(batch: typeof P_BATCHES[number], n: number): string {
  const seed = `scripts/.tmp-paths-${batch.type}-${Date.now()}.ts`;
  const items = [...batch.items].slice(0, n);
  return `You are a senior engineering career coach generating learning paths for DevPrep.

TASK: Generate exactly ${n} learning paths of type "${batch.type}" and INSERT them into file:local.db.

Seed script path: ${seed}

Create ${seed}:
\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const paths = [ /* ${n} objects */ ];
async function main() {
  for (const p of paths) {
    await db.execute({ sql: \`INSERT OR IGNORE INTO learning_paths (id,title,description,path_type,target_company,target_job_title,difficulty,estimated_hours,question_ids,channels,tags,prerequisites,learning_objectives,milestones,metadata,status,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`, args: [p.id,p.title,p.description,p.pathType,p.targetCompany??null,p.targetJobTitle??null,p.difficulty,p.estimatedHours,p.questionIds,p.channels,p.tags,p.prerequisites,p.learningObjectives,p.milestones,p.metadata,"active",p.createdAt,p.createdAt] });
  }
  db.close();
  console.log("Inserted", paths.length, "learning paths");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

SHAPE: { id: crypto.randomUUID(), title, description: "2-3 sentences", pathType: "${batch.type}", targetCompany: null|"string", targetJobTitle: null|"string", difficulty, estimatedHours, questionIds: JSON.stringify([]), channels: JSON.stringify([...]), tags: JSON.stringify([...]), prerequisites: JSON.stringify([]), learningObjectives: JSON.stringify(["Can implement...","Understands...","Able to..."]), milestones: JSON.stringify([{title,description,completionPercent:20,questionCount:10},...5 total]), metadata: JSON.stringify({focusAreas:[],companiesTargeted:[],interviewRounds:[]}), createdAt: new Date().toISOString() }

PATHS: ${items.map((it: any, i: number) => `${i+1}. ${it.title}`).join(", ")}

Run: npx tsx ${seed}
Cleanup: rm -f ${seed}`;
}

// ─── Work queue ───────────────────────────────────────────────────────────────
function buildQueue(): Task[] {
  const tasks: Task[] = [];

  if (!FILTER_TYPE || FILTER_TYPE === "questions") {
    for (const ch of Q_CHANNELS) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      tasks.push({ id:`q-${ch.id}`, type:"questions", label:ch.id, agent:"content-question-expert",
        buildPrompt:() => buildQPrompt(ch, 5),
        countSql:"SELECT COUNT(*) FROM questions WHERE channel=?", countArgs:[ch.id], minNeeded:5 });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "certifications") {
    for (const c of CERTIFICATIONS) {
      tasks.push({ id:`cert-${c.id}`, type:"certifications", label:c.id, agent:"content-certification-expert",
        buildPrompt:() => buildCertPrompt(c, 15),
        countSql:"SELECT COUNT(*) FROM questions WHERE channel=?", countArgs:[c.maps[0]], minNeeded:15 });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "flashcards") {
    for (const ch of F_CHANNELS) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      tasks.push({ id:`flash-${ch.id}`, type:"flashcards", label:ch.id, agent:"content-flashcard-expert",
        buildPrompt:() => buildFlashPrompt(ch, 20),
        countSql:"SELECT COUNT(*) FROM flashcards WHERE channel=?", countArgs:[ch.id], minNeeded:20 });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "voice") {
    for (const ch of V_CHANNELS) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      tasks.push({ id:`voice-${ch.id}`, type:"voice", label:ch.id, agent:"content-voice-expert",
        buildPrompt:() => buildVoicePrompt(ch, 5),
        countSql:"SELECT COUNT(*) FROM voice_sessions WHERE channel=?", countArgs:[ch.id], minNeeded:5 });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "paths") {
    for (const b of P_BATCHES) {
      tasks.push({ id:`path-${b.type}`, type:"paths", label:b.type, agent:"content-learning-path-expert",
        buildPrompt:() => buildPathPrompt(b, Math.min(b.items.length, 5)),
        countSql:"SELECT COUNT(*) FROM learning_paths WHERE path_type=?", countArgs:[b.type], minNeeded:5 });
    }
  }
  return tasks;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const TYPE_LABEL: Record<ContentType,string> = {
  questions:"Questions", certifications:"Certifications",
  flashcards:"Flashcards", voice:"Voice Sessions", paths:"Learning Paths",
};
const TYPE_COLOR: Record<ContentType,string> = {
  questions:C.bl, certifications:C.m, flashcards:C.c, voice:C.y, paths:C.g,
};

function fmt(n: number, w: number) { const s = String(n); return " ".repeat(Math.max(0,w-s.length))+s; }
function pad(s: string, w: number) { return s.length>=w ? s.slice(0,w) : s+" ".repeat(w-s.length); }
function bar(pct: number, w=30) { const f=Math.round(Math.max(0,Math.min(1,pct))*w); return `${C.g}${"█".repeat(f)}${C.d}${"░".repeat(w-f)}${C.r}`; }
function elapsed(ms: number) {
  const s=Math.floor(ms/1000), m=Math.floor(s/60), h=Math.floor(m/60);
  return h>0 ? `${h}h${m%60}m` : m>0 ? `${m}m${s%60}s` : `${s}s`;
}

let dashLines   = 0;
let swarmStart  = Date.now();
const agents: Agent[] = [];

function currentLoad(): string {
  const l = os.loadavg()[0];
  const col = l > LOAD_LIMIT ? C.rd : l > LOAD_LIMIT*0.7 ? C.y : C.g;
  return `${col}${l.toFixed(1)}${C.r}`;
}

function renderDashboard() {
  spinIdx = (spinIdx + 1) % SPIN.length;
  const sp = SPIN[spinIdx];

  const totalGen  = agents.reduce((s,a)=>s+a.generated, 0);
  const running   = agents.filter(a=>a.status==="running");
  const done      = agents.filter(a=>a.status==="done");
  const failed    = agents.filter(a=>a.status==="failed");
  const skipped   = agents.filter(a=>a.status==="skipped");
  const pending   = agents.filter(a=>a.status==="pending");
  const total     = agents.length;
  const complete  = done.length + skipped.length;
  const pct       = total > 0 ? complete/total : 0;
  const rt        = Date.now() - swarmStart;

  // Items per minute
  const ipm = rt > 10_000 ? (totalGen / (rt/60_000)).toFixed(1) : "…";
  // ETA
  let eta = "…";
  if (complete > 0 && pending.length > 0) {
    const msPerTask = rt / complete;
    const remaining = Math.ceil(pending.length / MAX_WORKERS) * msPerTask;
    eta = elapsed(remaining);
  }

  const W = 72;
  const lines: string[] = [];

  // ── Header ──
  lines.push(`${C.d}${"─".repeat(W)}${C.r}`);
  lines.push(
    ` ${C.b}DevPrep Content Swarm${C.r}  `+
    `workers:${C.b}${MAX_WORKERS}${C.r}  `+
    `runtime:${C.c}${elapsed(rt)}${C.r}  `+
    `load:${currentLoad()}`
  );
  lines.push(
    ` ${C.g}${C.b}+${totalGen}${C.r} items  `+
    `rate:${C.c}${ipm}/min${C.r}  `+
    `ETA:${C.c}${eta}${C.r}  `+
    `${C.g}${done.length}✓${C.r} ${C.y}${skipped.length}–${C.r} ${C.rd}${failed.length}✗${C.r} ${C.d}${pending.length}·${C.r}`
  );
  lines.push(` [${bar(pct, W-14)}] ${C.b}${Math.round(pct*100)}%${C.r}  ${complete}/${total}`);
  lines.push(`${C.d}${"─".repeat(W)}${C.r}`);

  // ── Running agents (detailed) ──
  if (running.length > 0) {
    lines.push(` ${C.b}${C.c}RUNNING  (${running.length})${C.r}`);
    for (const a of running) {
      const dur   = a.startedAt ? elapsed(Date.now()-a.startedAt) : "";
      const col   = TYPE_COLOR[a.task.type];
      const genTx = a.generated > 0 ? `${C.g}+${a.generated}${C.r}` : `${C.d}…${C.r}`;
      lines.push(
        ` ${C.c}${sp}${C.r} ${C.d}[${String(a.slot).padStart(2,"0")}]${C.r} `+
        `${col}${pad(a.task.type,14)}${C.r} `+
        `${pad(a.task.label,20)} `+
        `${genTx.padEnd(8)}  ${C.d}${dur}${C.r}`
      );
    }
    lines.push(`${C.d}${"─".repeat(W)}${C.r}`);
  }

  // ── Per-type summary ──
  const types: ContentType[] = ["questions","certifications","flashcards","voice","paths"];
  for (const t of types) {
    const typeAgents = agents.filter(a=>a.task.type===t);
    if (typeAgents.length === 0) continue;

    const tDone    = typeAgents.filter(a=>a.status==="done").length;
    const tRunning = typeAgents.filter(a=>a.status==="running").length;
    const tSkipped = typeAgents.filter(a=>a.status==="skipped").length;
    const tFailed  = typeAgents.filter(a=>a.status==="failed").length;
    const tPending = typeAgents.filter(a=>a.status==="pending").length;
    const tGen     = typeAgents.reduce((s,a)=>s+a.generated,0);
    const col      = TYPE_COLOR[t];

    lines.push(
      ` ${col}${C.b}${pad(TYPE_LABEL[t],16)}${C.r} `+
      `${C.g}✓${tDone}${C.r} ${C.d}·${tPending}${C.r} `+
      (tSkipped>0?`${C.y}–${tSkipped}${C.r} `:"")+
      (tFailed>0?`${C.rd}✗${tFailed}${C.r} `:"")+
      (tGen>0?`  ${C.g}+${tGen} items${C.r}`:"")
    );

    // Show recently completed tasks inline (up to 5)
    const recent = typeAgents
      .filter(a=>a.status==="done"||a.status==="failed")
      .sort((a,b)=>(b.endedAt??0)-(a.endedAt??0))
      .slice(0,5);
    if (recent.length > 0) {
      const chips = recent.map(a=>{
        const ic = a.status==="done" ? `${C.g}✓${C.r}` : `${C.rd}✗${C.r}`;
        return `${ic}${C.d}${a.task.label}${C.r}`;
      }).join("  ");
      lines.push(`   ${chips}`);
    }
  }

  lines.push(`${C.d}${"─".repeat(W)}${C.r}`);

  // ── Draw ──
  if (dashLines > 0) process.stdout.write(`\x1b[${dashLines}A`);
  for (const line of lines) process.stdout.write(`\x1b[2K\r${line}\n`);
  dashLines = lines.length;
}

// ─── Worker pool ──────────────────────────────────────────────────────────────
const activeSlots = new Set<number>();

function nextSlot(): number {
  for (let i=1; i<=MAX_WORKERS; i++) if (!activeSlots.has(i)) { activeSlots.add(i); return i; }
  return MAX_WORKERS+1;
}

function systemOverloaded(): boolean {
  return os.loadavg()[0] > LOAD_LIMIT;
}

async function waitForCapacity() {
  while (activeSlots.size >= MAX_WORKERS || systemOverloaded()) {
    await new Promise(r => setTimeout(r, 500));
  }
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanupTempFiles() {
  try {
    const files = fs.readdirSync("scripts").filter(f=>f.startsWith(".tmp-"));
    files.forEach(f => fs.rmSync(path.join("scripts",f), {force:true}));
    if (files.length) console.log(`\n${C.d}Cleaned up ${files.length} temp file(s).${C.r}`);
  } catch {}
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Checks
  if (!fs.existsSync(OPENCODE)) {
    console.error(`${C.rd}✗ opencode not found: ${OPENCODE}${C.r}\n  Install with: npm install -g opencode-ai`);
    process.exit(1);
  }
  if (!fs.existsSync(DB_PATH)) {
    console.error(`${C.rd}✗ Database not found: ${DB_PATH}${C.r}\n  Run the app once first to initialise the DB.`);
    process.exit(1);
  }
  try { await dbCount("SELECT 1"); }
  catch (e: any) { console.error(`${C.rd}✗ Cannot open DB: ${e.message}${C.r}`); process.exit(1); }

  // Build queue
  const queue = buildQueue();
  if (queue.length === 0) {
    console.log(`${C.y}No tasks match the current filters.${C.r}`); process.exit(0);
  }

  // Check existing counts and skip satisfied tasks
  process.stdout.write(`\n  Checking ${queue.length} tasks against DB…`);
  for (const task of queue) {
    const n = await dbCount(task.countSql, task.countArgs);
    agents.push({ task, status: n >= task.minNeeded ? "skipped" : "pending",
      slot:0, baseline:n, current:n, generated:0 });
  }
  const pendingAgents = agents.filter(a=>a.status==="pending");
  process.stdout.write(`\r  ${C.g}✓${C.r} ${agents.filter(a=>a.status==="skipped").length} already satisfied — ${C.b}${pendingAgents.length} tasks${C.r}\n`);
  console.log(`  ${C.b}${SESSIONS} sessions${C.r} × ${C.b}${MAX_WORKERS} workers${C.r} = ${C.g}${SESSIONS * MAX_WORKERS} max parallel${C.r}\n`);

  if (pendingAgents.length === 0) {
    console.log(`${C.g}All content already meets minimum thresholds. Nothing to do.${C.r}\n`);
    db.close(); process.exit(0);
  }

  // Dry run
  if (DRY_RUN) {
    console.log(`${C.y}DRY RUN — tasks that would execute:${C.r}`);
    pendingAgents.forEach(a => console.log(`  ${C.d}·${C.r} ${a.task.type}/${a.task.label}`));
    console.log(); db.close(); process.exit(0);
  }

  // Warn if high concurrency
  if (MAX_WORKERS * SESSIONS > 15) {
    console.log(`${C.y}⚠ High concurrency: ${MAX_WORKERS * SESSIONS} parallel agents. Monitor system load.${C.r}\n`);
    await new Promise(r => setTimeout(r, 2000));
  }

  // Shutdown handler
  process.on("SIGINT",  () => { cleanupTempFiles(); db.close(); process.exit(0); });
  process.on("SIGTERM", () => { cleanupTempFiles(); db.close(); process.exit(0); });

  swarmStart = Date.now();
  dashLines  = 0;
  const renderTimer = setInterval(renderDashboard, RENDER_MS);
  renderDashboard();

  // ── Launch parallel sessions ────────────────────────────────────────────────
  // Distribute pending agents across sessions
  const sessionQueues: Agent[][] = Array.from({ length: SESSIONS }, () => []);
  
  // Shuffle for even distribution across sessions
  const shuffled = [...pendingAgents].sort(() => Math.random() - 0.5);
  shuffled.forEach((agent, i) => {
    sessionQueues[i % SESSIONS].push(agent);
  });

  const sessionPromises: Promise<void>[] = [];

  // ── Phase 1: Launch minimum 5 agents immediately (or all if < 5) ────────────
  const initialBatch: Agent[] = [];
  const remaining: Agent[] = [];

  if (pendingAgents.length <= MIN_PARALLEL) {
    // Less than MIN_PARALLEL tasks - launch all immediately
    initialBatch.push(...pendingAgents);
  } else {
    // Take MIN_PARALLEL agents for immediate launch, rest go to queue
    for (let i = 0; i < pendingAgents.length; i++) {
      if (i < MIN_PARALLEL) {
        initialBatch.push(pendingAgents[i]);
      } else {
        remaining.push(pendingAgents[i]);
      }
    }
  }

  console.log(`  ${C.g}Launching ${C.b}${initialBatch.length} agents immediately${C.r}…`);

  // Launch initial batch in parallel
  const initialPromises: Promise<void>[] = [];
  for (const agent of initialBatch) {
    const slot = nextSlot();
    agent.slot = slot;
    agent.status = "running";
    agent.startedAt = Date.now();
    agent.baseline = await dbCount(agent.task.countSql, agent.task.countArgs);
    agent.current = agent.baseline;

    const pollTimer = setInterval(async () => {
      const n = await dbCount(agent.task.countSql, agent.task.countArgs);
      agent.current = n;
      agent.generated = Math.max(0, n - agent.baseline);
    }, POLL_MS);

    const p = new Promise<void>((resolve) => {
      runAgentAsyncWithResolve(agent, slot, pollTimer, resolve);
    });
    initialPromises.push(p);
  }

  // ── Phase 2: While initial batch runs, queue remaining agents ───────────────
  // Re-distribute remaining agents to session queues
  const updatedQueues: Agent[][] = Array.from({ length: SESSIONS }, () => []);
  remaining.forEach((agent, i) => {
    updatedQueues[i % SESSIONS].push(agent);
  });

  // Launch session handlers for remaining work
  for (let i = 0; i < SESSIONS; i++) {
    if (updatedQueues[i].length === 0) continue;

    const activeSet = new Set<Agent>();
    const sessionQueue = updatedQueues[i];

    const sessionPromise = (async () => {
      while (sessionQueue.length > 0) {
        // Wait for capacity
        while (activeSlots.size >= MAX_WORKERS || systemOverloaded()) {
          await new Promise(r => setTimeout(r, 500));
        }

        const agent = sessionQueue.shift();
        if (!agent) break;

        activeSet.add(agent);
        const slot = nextSlot();
        agent.slot = slot;
        agent.status = "running";
        agent.startedAt = Date.now();
        agent.baseline = await dbCount(agent.task.countSql, agent.task.countArgs);
        agent.current = agent.baseline;

        const pollTimer = setInterval(async () => {
          const n = await dbCount(agent.task.countSql, agent.task.countArgs);
          agent.current = n;
          agent.generated = Math.max(0, n - agent.baseline);
        }, POLL_MS);

        await new Promise<void>((resolve) => {
          runAgentAsyncWithResolve(agent, slot, pollTimer, resolve);
          // Don't await - let it run concurrently
          setTimeout(() => {
            activeSet.delete(agent);
          }, 100);
        });
      }

      // Wait for remaining in this session
      while (activeSet.size > 0) {
        await new Promise(r => setTimeout(r, 500));
      }
    })();

    sessionPromises.push(sessionPromise);
  }

  // Wait for all initial + session work to complete
  await Promise.all([...initialPromises, ...sessionPromises]);

  clearInterval(renderTimer);
  renderDashboard();
  cleanupTempFiles();
  db.close();

  // Final summary
  const totalGen  = agents.reduce((s,a)=>s+a.generated, 0);
  const doneCount = agents.filter(a=>a.status==="done").length;
  const failCount = agents.filter(a=>a.status==="failed").length;
  const skipCount = agents.filter(a=>a.status==="skipped").length;

  console.log(`\n ${C.g}${C.b}✓ Swarm complete${C.r}  +${C.g}${C.b}${totalGen} items${C.r} generated  ` +
    `${C.g}${doneCount} done${C.r}  ${C.y}${skipCount} skipped${C.r}  ` +
    `${failCount>0?C.rd:C.d}${failCount} failed${C.r}  ${elapsed(Date.now()-swarmStart)}\n`);

  if (failCount > 0) {
    console.log(`${C.rd}Failed:${C.r}`);
    agents.filter(a=>a.status==="failed").forEach(a => console.log(`  ✗ ${a.task.type}/${a.task.label}`));
    console.log(); process.exit(1);
  }
}

function runAgentAsyncWithResolve(
  agent: Agent,
  slot: number,
  pollTimer: ReturnType<typeof setInterval> | null,
  resolve: () => void
): void {
  const child = spawn(OPENCODE, ["run", "--agent", agent.task.agent, agent.task.buildPrompt()], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  const timer = setTimeout(() => child.kill("SIGTERM"), TIMEOUT_MS);

  child.on("close", async () => {
    clearTimeout(timer);
    if (pollTimer) clearInterval(pollTimer);
    const final = await dbCount(agent.task.countSql, agent.task.countArgs);
    agent.current = final;
    agent.generated = Math.max(0, final - agent.baseline);
    agent.status = agent.generated > 0 ? "done" : "failed";
    agent.endedAt = Date.now();
    activeSlots.delete(slot);
    resolve();
  });

  child.on("error", () => {
    clearTimeout(timer);
    if (pollTimer) clearInterval(pollTimer);
    agent.status = "failed";
    agent.endedAt = Date.now();
    activeSlots.delete(slot);
    resolve();
  });
}

main();
