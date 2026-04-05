#!/usr/bin/env npx tsx
/**
 * DevPrep Content Generation Swarm — v2
 *
 * Improvements over v1 (parallel-content-swarm.ts):
 *   ✦ Channels loaded from DB (single source of truth, not hardcoded)
 *   ✦ Strategy Agent mode — AI plans what to generate based on actual gaps
 *   ✦ Priority queue — lowest-count channels go first automatically
 *   ✦ Quality scoring per task (validates row count + field completeness)
 *   ✦ Generation logs table — full audit trail in local.db
 *   ✦ Retry logic — up to --retry=N attempts before marking failed
 *   ✦ Resume state — .swarm-state.json skips tasks completed in prior runs
 *   ✦ --force flag — re-runs even when minNeeded threshold is already met
 *   ✦ JSON report — writes scripts/.swarm-report-<ts>.json after completion
 *   ✦ stderr capture — failed agent output written to scripts/.logs/
 *   ✦ Batch count — how many items to ask each agent to generate (--batch=N)
 *
 * Usage:
 *   npx tsx scripts/content-gen-v2.ts
 *   npx tsx scripts/content-gen-v2.ts --workers=8 --batch=10
 *   npx tsx scripts/content-gen-v2.ts --type=questions --channel=algorithms
 *   npx tsx scripts/content-gen-v2.ts --type=flashcards --force
 *   npx tsx scripts/content-gen-v2.ts --strategy          # AI-driven planning
 *   npx tsx scripts/content-gen-v2.ts --dry-run
 *   npx tsx scripts/content-gen-v2.ts --retry=3
 *   npx tsx scripts/content-gen-v2.ts --report            # print prior JSON reports
 */

import { createClient }  from "@libsql/client";
import { spawn }         from "child_process";
import * as fs           from "fs";
import * as os           from "os";
import * as path         from "path";
import * as crypto       from "crypto";

// ─── CLI ──────────────────────────────────────────────────────────────────────
const arg  = (f: string) => process.argv.find(a => a.startsWith(`${f}=`))?.split("=")[1];
const flag = (f: string) => process.argv.includes(f);

const MAX_WORKERS   = Math.min(30, Math.max(1, parseInt(arg("--workers") ?? "5")));
const BATCH_SIZE    = Math.max(1, parseInt(arg("--batch")   ?? "5"));
const FILTER_TYPE   = arg("--type");
const FILTER_CH     = arg("--channel");
const MAX_RETRIES   = Math.max(0, parseInt(arg("--retry")   ?? "1"));
const LOAD_LIMIT    = parseFloat(arg("--max-load")  ?? "3.0");
const DRY_RUN       = flag("--dry-run");
const FORCE         = flag("--force");
const STRATEGY_MODE = flag("--strategy");
const SHOW_REPORT   = flag("--report");

const OPENCODE    = "/home/runner/workspace/.config/npm/node_global/bin/opencode";
const DB_PATH     = path.resolve(process.cwd(), "local.db");
const STATE_FILE  = path.resolve(process.cwd(), "scripts/.swarm-state.json");
const LOG_DIR     = path.resolve(process.cwd(), "scripts/.logs");
const TIMEOUT_MS  = 7 * 60 * 1000;
const POLL_MS     = 4_000;
const RENDER_MS   = 500;
const STAGGER_MS  = 1_800;

// ─── ANSI ─────────────────────────────────────────────────────────────────────
const C = {
  r:"\x1b[0m", b:"\x1b[1m", d:"\x1b[2m",
  g:"\x1b[32m", rd:"\x1b[31m", y:"\x1b[33m",
  bl:"\x1b[34m", c:"\x1b[36m", m:"\x1b[35m",
};
const SPIN = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
let spinIdx = 0;

// ─── DB client ────────────────────────────────────────────────────────────────
const db = createClient({ url: `file:${DB_PATH}` });

async function dbCount(sql: string, args: any[] = []): Promise<number> {
  try {
    const r = await db.execute({ sql, args });
    const v = r.rows[0]?.[0];
    return typeof v === "number" ? v : parseInt(String(v ?? "0"), 10);
  } catch { return 0; }
}

async function dbRows<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  try {
    const r = await db.execute({ sql, args });
    return r.rows as unknown as T[];
  } catch { return []; }
}

// ─── Generation logs table (created on first run) ─────────────────────────────
async function ensureLogsTable() {
  await db.execute({ sql: `
    CREATE TABLE IF NOT EXISTS generation_logs (
      id          TEXT PRIMARY KEY,
      task_id     TEXT NOT NULL,
      type        TEXT NOT NULL,
      channel     TEXT NOT NULL,
      success     INTEGER NOT NULL DEFAULT 0,
      generated   INTEGER NOT NULL DEFAULT 0,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      attempt     INTEGER NOT NULL DEFAULT 1,
      error_msg   TEXT,
      created_at  TEXT NOT NULL
    )
  `, args: [] });
}

async function logGeneration(
  taskId: string, type: string, channel: string,
  success: boolean, generated: number, durationMs: number,
  attempt: number, errorMsg?: string
) {
  try {
    await db.execute({ sql: `
      INSERT INTO generation_logs
        (id, task_id, type, channel, success, generated, duration_ms, attempt, error_msg, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `, args: [
      crypto.randomUUID(), taskId, type, channel,
      success ? 1 : 0, generated, durationMs, attempt,
      errorMsg ?? null, new Date().toISOString()
    ]});
  } catch {}
}

// ─── Quality scoring ──────────────────────────────────────────────────────────
// After an agent run, score the content it inserted by checking
// field completeness for newly added rows.
interface QualityResult { score: number; details: string }

async function scoreQuality(type: ContentType, channel: string, since: string): Promise<QualityResult> {
  try {
    if (type === "questions") {
      const total = await dbCount(
        "SELECT COUNT(*) FROM questions WHERE channel=? AND created_at>=?", [channel, since]);
      if (total === 0) return { score: 0, details: "no rows" };
      const withExpl = await dbCount(
        "SELECT COUNT(*) FROM questions WHERE channel=? AND created_at>=? AND explanation IS NOT NULL AND length(explanation)>100",
        [channel, since]);
      const withEli5 = await dbCount(
        "SELECT COUNT(*) FROM questions WHERE channel=? AND created_at>=? AND eli5 IS NOT NULL",
        [channel, since]);
      const score = (withExpl + withEli5) / (total * 2);
      return { score, details: `${withExpl}/${total} with explanation, ${withEli5}/${total} with eli5` };
    }
    if (type === "flashcards") {
      const total = await dbCount(
        "SELECT COUNT(*) FROM flashcards WHERE channel=? AND created_at>=?", [channel, since]);
      if (total === 0) return { score: 0, details: "no rows" };
      const withCode = await dbCount(
        "SELECT COUNT(*) FROM flashcards WHERE channel=? AND created_at>=? AND code_example IS NOT NULL",
        [channel, since]);
      const withHint = await dbCount(
        "SELECT COUNT(*) FROM flashcards WHERE channel=? AND created_at>=? AND hint IS NOT NULL",
        [channel, since]);
      const score = 0.5 + (withCode + withHint) / (total * 4);
      return { score, details: `${withCode}/${total} with code, ${withHint}/${total} with hint` };
    }
    if (type === "voice") {
      const total = await dbCount(
        "SELECT COUNT(*) FROM voice_sessions WHERE channel=? AND created_at>=?", [channel, since]);
      const score = total > 0 ? 0.8 : 0;
      return { score, details: `${total} sessions` };
    }
    if (type === "certifications") {
      const total = await dbCount(
        "SELECT COUNT(*) FROM certifications WHERE id=?", [channel]);
      const score = total > 0 ? 1 : 0;
      return { score, details: total > 0 ? "cert row exists" : "cert missing" };
    }
    if (type === "paths") {
      const total = await dbCount(
        "SELECT COUNT(*) FROM learning_paths WHERE path_type=?", [channel]);
      const score = total > 0 ? 0.8 : 0;
      return { score, details: `${total} paths` };
    }
    return { score: 0.5, details: "unknown type" };
  } catch { return { score: 0, details: "error" }; }
}

// ─── Resume state ─────────────────────────────────────────────────────────────
interface RunState { completed: string[]; lastRun: string }

function loadState(): RunState {
  try {
    if (fs.existsSync(STATE_FILE))
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {}
  return { completed: [], lastRun: "" };
}

function saveState(state: RunState) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); } catch {}
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ContentType = "questions"|"certifications"|"flashcards"|"voice"|"paths";
type Status      = "pending"|"running"|"done"|"failed"|"skipped"|"retry";

interface DbChannel { id: string; name: string; description: string; type: string; difficulty: string }

interface Task {
  id:          string;
  type:        ContentType;
  label:       string;
  agent:       string;
  priority:    number;         // lower = higher priority (0 = fewest items in DB)
  buildPrompt: () => string;
  countSql:    string;
  countArgs:   any[];
  minNeeded:   number;
}

interface Agent {
  task:        Task;
  status:      Status;
  slot:        number;
  attempt:     number;
  startedAt?:  number;
  endedAt?:    number;
  baseline:    number;
  current:     number;
  generated:   number;
  quality?:    QualityResult;
  errorSnip?:  string;
}

// ─── Channel definitions ──────────────────────────────────────────────────────
// Try DB first; fall back to hardcoded if the channels table doesn't exist.

async function loadQChannelsFromDb(): Promise<typeof Q_CHANNELS_FALLBACK> {
  const rows = await dbRows<{ id: string; description: string; sub_channels: string }>(
    "SELECT id, description, sub_channels FROM channels WHERE type='tech' OR type IS NULL ORDER BY id"
  );
  if (rows.length === 0) return Q_CHANNELS_FALLBACK;
  return rows.map(r => {
    const subs: string[] = (() => {
      try { return JSON.parse(r.sub_channels ?? "[]"); } catch { return []; }
    })();
    const fallback = Q_CHANNELS_FALLBACK.find(f => f.id === r.id);
    return {
      id: r.id,
      ctx: r.description || fallback?.ctx || r.id,
      sub: subs.length > 0 ? subs : (fallback?.sub ?? [r.id]),
    };
  });
}

const Q_CHANNELS_FALLBACK = [
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
  { type:"company"      as const, items:[
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
  { type:"job-title"    as const, items:[
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
  { type:"skill"        as const, items:[
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
  { type:"certification" as const, items:[
    {title:"AWS Solutions Architect Prep",   ch:["aws","system-design"],         diff:"intermediate",h:80 },
    {title:"CKA Exam Preparation",           ch:["kubernetes","devops","linux"],  diff:"advanced",    h:100},
    {title:"Terraform Associate Prep",       ch:["terraform","devops"],           diff:"intermediate",h:40 },
    {title:"CKAD Preparation Path",          ch:["kubernetes","devops","backend"],diff:"intermediate",h:60 },
    {title:"CompTIA Security+ Prep",         ch:["security","networking"],        diff:"intermediate",h:60 },
  ]},
];

// ─── Prompt builders ──────────────────────────────────────────────────────────
function buildQPrompt(ch: typeof Q_CHANNELS_FALLBACK[0], n: number): string {
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
  /* ${n} objects — fill every field, no placeholders */
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
  answer: "2-4 sentence TL;DR — concrete, no filler",
  explanation: "300-500 word markdown with ## headings and at least one code block",
  eli5: "1-2 sentences, zero jargon, child-friendly analogy",
  difficulty: "beginner"|"intermediate"|"advanced",
  tags: JSON.stringify(["${ch.id}","subtopic"]),
  channel: "${ch.id}",
  subChannel: "<one of: ${ch.sub.join(", ")}>",
  createdAt: new Date().toISOString(),
}

CONTEXT: ${ch.ctx}
QUALITY RULES:
- Each explanation MUST include a code block (\`\`\`language ... \`\`\`)
- Use different sub-channels across the ${n} questions
- Mix difficulty: ~30% beginner, ~50% intermediate, ~20% advanced
- No duplicate questions; do not repeat questions already common online

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
  const questions = [ /* ${n} fully-written MCQ objects, no placeholders */ ];
  for (const q of questions) {
    await db.execute({ sql: \`INSERT OR IGNORE INTO questions (id,question,answer,explanation,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)\`, args: [q.id,q.question,q.answer,q.explanation,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt] });
  }
  db.close();
  console.log("Inserted", questions.length, "MCQs for ${cert.id}");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

MCQ SHAPE: { id: crypto.randomUUID(), question: "scenario + A) B) C) D) in question text", answer: "The correct answer is X) ... because ...", explanation: "200-300 word markdown: why correct, why others wrong — include service name, AWS/CNCF specifics", difficulty: "beginner"|"intermediate"|"advanced", tags: JSON.stringify(["${cert.id}","${cert.cat}"]), channel: "<one of: ${cert.maps.join(", ")}>", subChannel: "<domain>", createdAt: new Date().toISOString() }

DOMAINS (weight): ${cert.domains.map(d=>`${d.n}(${d.w}%)`).join(", ")}
QUALITY RULES: scenario-based, all 4 options plausible, NO "all/none of the above", correct service names.

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
const flashcards = [ /* ${n} fully-written objects, no placeholders */ ];
async function main() {
  for (const f of flashcards) {
    await db.execute({ sql: \`INSERT OR IGNORE INTO flashcards (id,channel,front,back,hint,code_example,mnemonic,difficulty,tags,category,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)\`, args: [f.id,f.channel,f.front,f.back,f.hint??null,f.codeExample??null,f.mnemonic??null,f.difficulty,f.tags,f.category,"active",f.createdAt] });
  }
  db.close();
  console.log("Inserted", flashcards.length, "flashcards for ${ch.id}");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

SHAPE: { id: crypto.randomUUID(), channel: "${ch.id}", front: "≤15 words, ends with ?", back: "60-150 words — direct answer first, elaboration second", hint: "1-sentence memory aid or null", codeExample: "short runnable snippet or null", mnemonic: "catchy trick phrase or null", difficulty: "beginner"|"intermediate"|"advanced", tags: JSON.stringify(["${ch.id}","subtopic"]), category: "<one of: ${ch.cats.join(", ")}>", createdAt: new Date().toISOString() }

CONTEXT: ${ch.ctx}
QUALITY RULES: ${n} unique cards, add codeExample for ≥50% of cards, 30/50/20 difficulty split, mnemonic for advanced cards.

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
const sessions = [ /* ${n} fully-written objects */ ];
async function main() {
  for (const s of sessions) {
    await db.execute({ sql: \`INSERT OR IGNORE INTO voice_sessions (id,topic,description,channel,difficulty,question_ids,total_questions,estimated_minutes,created_at) VALUES (?,?,?,?,?,?,?,?,?)\`, args: [s.id,s.topic,s.description,s.channel,s.difficulty,s.questionIds,s.totalQuestions,s.estimatedMinutes,s.createdAt] });
  }
  db.close();
  console.log("Inserted", sessions.length, "voice sessions for ${ch.id}");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

SHAPE: { id: crypto.randomUUID(), topic: "3-6 word title", description: "2-3 sentences describing what to practise", channel: "${ch.id}", difficulty: "beginner"|"intermediate"|"advanced", questionIds: JSON.stringify([]), totalQuestions: ${ch.minQ+2}, estimatedMinutes: ${ch.minQ*3}, createdAt: new Date().toISOString() }

TOPICS (one per session): ${ch.topics.join(", ")}
QUALITY RULES: one distinct topic each, 20/60/20 difficulty split, descriptions must mention the topic concretely.

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
const paths = [ /* ${n} fully-written objects */ ];
async function main() {
  for (const p of paths) {
    await db.execute({ sql: \`INSERT OR IGNORE INTO learning_paths (id,title,description,path_type,target_company,target_job_title,difficulty,estimated_hours,question_ids,channels,tags,prerequisites,learning_objectives,milestones,metadata,status,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`, args: [p.id,p.title,p.description,p.pathType,p.targetCompany??null,p.targetJobTitle??null,p.difficulty,p.estimatedHours,p.questionIds,p.channels,p.tags,p.prerequisites,p.learningObjectives,p.milestones,p.metadata,"active",p.createdAt,p.createdAt] });
  }
  db.close();
  console.log("Inserted", paths.length, "learning paths");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
\`\`\`

SHAPE: { id: crypto.randomUUID(), title, description: "2-3 sentences motivating the path", pathType: "${batch.type}", targetCompany: null|"string", targetJobTitle: null|"string", difficulty, estimatedHours, questionIds: JSON.stringify([]), channels: JSON.stringify([...relevant channels...]), tags: JSON.stringify([...]), prerequisites: JSON.stringify([]), learningObjectives: JSON.stringify(["Can implement...","Understands...","Able to design...",...5 items]), milestones: JSON.stringify([{title,description,completionPercent:20,questionCount:10},...5 milestones total]), metadata: JSON.stringify({focusAreas:[],companiesTargeted:[],interviewRounds:[]}), createdAt: new Date().toISOString() }

PATHS: ${items.map((it: any, i: number) => `${i+1}. ${it.title}`).join(", ")}
QUALITY RULES: 5 milestones per path with completionPercent 20/40/60/80/100, objectives must be measurable.

Run: npx tsx ${seed}
Cleanup: rm -f ${seed}`;
}

// ─── Strategy Agent prompt ────────────────────────────────────────────────────
async function buildStrategyPlan(queue: Task[]): Promise<Task[]> {
  // Gather DB counts for all tasks
  const rows = await dbRows<{ type: string; channel: string; cnt: number }>(`
    SELECT 'questions' AS type, channel, COUNT(*) AS cnt FROM questions GROUP BY channel
    UNION ALL
    SELECT 'flashcards', channel, COUNT(*) FROM flashcards GROUP BY channel
    UNION ALL
    SELECT 'voice', channel, COUNT(*) FROM voice_sessions GROUP BY channel
    UNION ALL
    SELECT 'certifications', id, 1 FROM certifications
    UNION ALL
    SELECT 'paths', path_type, COUNT(*) FROM learning_paths GROUP BY path_type
  `);

  const countMap: Record<string, number> = {};
  for (const r of rows) {
    countMap[`${r.type}:${r.channel}`] = Number(r.cnt) || 0;
  }

  const state = queue.map(t => ({
    id: t.id, type: t.type, label: t.label,
    current: countMap[`${t.type}:${t.label}`] ?? 0,
    minNeeded: t.minNeeded,
  }));

  const stateJson = JSON.stringify(state, null, 2);
  const seed = `scripts/.tmp-strategy-${Date.now()}.ts`;

  const prompt = `You are the Strategy Agent for DevPrep.

Analyze the content database state below and produce a prioritised list of task IDs to run.

Current state (id, type, label, current count, minNeeded):
${stateJson}

Rules:
1. Prioritise tasks where current < minNeeded (gaps first)
2. Among those, order by: lowest current count → highest priority
3. Tasks where current >= minNeeded are still valid but lower priority
4. Include ALL pending task IDs — just reorder them

Return ONLY a JSON array of task IDs in priority order, wrapped in a json code fence:
\`\`\`json
["task-id-1","task-id-2",...]
\`\`\``;

  console.log(`\n${C.m}${C.b}Strategy Agent${C.r} analysing ${queue.length} tasks…`);

  let raw = "";
  try {
    raw = await runOpencode(prompt, seed);
  } catch (e: any) {
    console.warn(`${C.y}  Strategy agent failed (${e.message}), using default priority order${C.r}`);
    return queue;
  }

  const match = raw.match(/```json\s*([\s\S]*?)```/);
  if (!match) {
    console.warn(`${C.y}  Strategy agent returned no valid JSON, using default order${C.r}`);
    return queue;
  }

  let ids: string[] = [];
  try { ids = JSON.parse(match[1].trim()); } catch {
    console.warn(`${C.y}  Strategy JSON parse failed, using default order${C.r}`);
    return queue;
  }

  const idIndex = new Map(ids.map((id, i) => [id, i]));
  const reordered = [...queue].sort((a, b) =>
    (idIndex.get(a.id) ?? 999) - (idIndex.get(b.id) ?? 999)
  );

  console.log(`${C.g}  Strategy: ${reordered.slice(0,5).map(t=>t.id).join(", ")}… (${reordered.length} total)${C.r}\n`);
  return reordered;
}

// Run opencode agent and return stdout
function runOpencode(prompt: string, seedPath?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(OPENCODE, ["run", "--agent", "content-question-expert", prompt], {
      stdio: ["ignore","pipe","pipe"],
    });
    const timer = setTimeout(() => { child.kill("SIGTERM"); reject(new Error("timeout")); }, TIMEOUT_MS);
    let out = "";
    child.stdout?.on("data", (d: Buffer) => { out += d.toString(); });
    child.on("close", () => { clearTimeout(timer); resolve(out); });
    child.on("error", (e) => { clearTimeout(timer); reject(e); });
  });
}

// ─── Work queue (priority-sorted) ────────────────────────────────────────────
async function buildQueue(qChannels: typeof Q_CHANNELS_FALLBACK): Promise<Task[]> {
  const tasks: Task[] = [];

  // Pre-fetch current counts to compute priorities
  const countMap: Record<string, number> = {};
  const countResults = await dbRows<{type: string; ch: string; n: number}>(`
    SELECT 'questions' AS type, channel AS ch, COUNT(*) AS n FROM questions GROUP BY channel
    UNION ALL
    SELECT 'flashcards', channel, COUNT(*) FROM flashcards GROUP BY channel
    UNION ALL
    SELECT 'voice', channel, COUNT(*) FROM voice_sessions GROUP BY channel
  `);
  for (const r of countResults) countMap[`${r.type}:${r.ch}`] = Number(r.n) || 0;

  if (!FILTER_TYPE || FILTER_TYPE === "questions") {
    for (const ch of qChannels) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      const current = countMap[`questions:${ch.id}`] ?? 0;
      tasks.push({
        id: `q-${ch.id}`, type: "questions", label: ch.id,
        agent: "content-question-expert", priority: current,
        buildPrompt: () => buildQPrompt(ch, BATCH_SIZE),
        countSql: "SELECT COUNT(*) FROM questions WHERE channel=?",
        countArgs: [ch.id], minNeeded: BATCH_SIZE,
      });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "certifications") {
    for (const c of CERTIFICATIONS) {
      const current = countMap[`certifications:${c.id}`] ?? 0;
      tasks.push({
        id: `cert-${c.id}`, type: "certifications", label: c.id,
        agent: "content-certification-expert", priority: current,
        buildPrompt: () => buildCertPrompt(c, BATCH_SIZE * 3),
        countSql: "SELECT COUNT(*) FROM questions WHERE channel=?",
        countArgs: [c.maps[0]], minNeeded: BATCH_SIZE * 3,
      });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "flashcards") {
    for (const ch of F_CHANNELS) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      const current = countMap[`flashcards:${ch.id}`] ?? 0;
      tasks.push({
        id: `flash-${ch.id}`, type: "flashcards", label: ch.id,
        agent: "content-flashcard-expert", priority: current,
        buildPrompt: () => buildFlashPrompt(ch, BATCH_SIZE * 4),
        countSql: "SELECT COUNT(*) FROM flashcards WHERE channel=?",
        countArgs: [ch.id], minNeeded: BATCH_SIZE * 4,
      });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "voice") {
    for (const ch of V_CHANNELS) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      const current = countMap[`voice:${ch.id}`] ?? 0;
      tasks.push({
        id: `voice-${ch.id}`, type: "voice", label: ch.id,
        agent: "content-voice-expert", priority: current,
        buildPrompt: () => buildVoicePrompt(ch, BATCH_SIZE),
        countSql: "SELECT COUNT(*) FROM voice_sessions WHERE channel=?",
        countArgs: [ch.id], minNeeded: BATCH_SIZE,
      });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "paths") {
    for (const b of P_BATCHES) {
      tasks.push({
        id: `path-${b.type}`, type: "paths", label: b.type,
        agent: "content-learning-path-expert", priority: 0,
        buildPrompt: () => buildPathPrompt(b, Math.min(b.items.length, BATCH_SIZE)),
        countSql: "SELECT COUNT(*) FROM learning_paths WHERE path_type=?",
        countArgs: [b.type], minNeeded: BATCH_SIZE,
      });
    }
  }

  // Sort by priority ascending (lowest count = highest urgency)
  tasks.sort((a, b) => a.priority - b.priority);
  return tasks;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const TYPE_LABEL: Record<ContentType,string> = {
  questions:"Questions", certifications:"Certifications",
  flashcards:"Flashcards", voice:"Voice", paths:"Paths",
};
const TYPE_COLOR: Record<ContentType,string> = {
  questions:C.bl, certifications:C.m, flashcards:C.c, voice:C.y, paths:C.g,
};

function fmt(n: number, w: number) { const s = String(n); return " ".repeat(Math.max(0,w-s.length))+s; }
function pad(s: string, w: number) { return s.length>=w ? s.slice(0,w) : s+" ".repeat(w-s.length); }
function bar(pct: number, w=28) {
  const f = Math.round(Math.max(0,Math.min(1,pct))*w);
  return `${C.g}${"█".repeat(f)}${C.d}${"░".repeat(w-f)}${C.r}`;
}
function elapsed(ms: number) {
  const s=Math.floor(ms/1000), m=Math.floor(s/60), h=Math.floor(m/60);
  return h>0?`${h}h${m%60}m`:m>0?`${m}m${s%60}s`:`${s}s`;
}
function qualityBar(score: number) {
  const pct = Math.max(0,Math.min(1,score));
  const col = pct >= 0.7 ? C.g : pct >= 0.4 ? C.y : C.rd;
  return `${col}${Math.round(pct*100)}%${C.r}`;
}

let dashLines  = 0;
let swarmStart = Date.now();
const agents: Agent[] = [];

function loadStr(): string {
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
  const pending   = agents.filter(a=>a.status==="pending"||a.status==="retry");
  const total     = agents.length;
  const complete  = done.length + skipped.length;
  const pct       = total > 0 ? complete/total : 0;
  const rt        = Date.now() - swarmStart;
  const ipm       = rt > 10_000 ? (totalGen/(rt/60_000)).toFixed(1) : "…";
  let eta = "…";
  if (complete > 0 && pending.length > 0) {
    const msPerTask = rt/complete;
    eta = elapsed(Math.ceil(pending.length/MAX_WORKERS)*msPerTask);
  }

  const W = 74;
  const lines: string[] = [];

  lines.push(`${C.d}${"─".repeat(W)}${C.r}`);
  lines.push(
    ` ${C.b}DevPrep Swarm v2${C.r}  workers:${C.b}${MAX_WORKERS}${C.r}  `+
    `batch:${C.b}${BATCH_SIZE}${C.r}  runtime:${C.c}${elapsed(rt)}${C.r}  `+
    `load:${loadStr()}`
  );
  lines.push(
    ` ${C.g}${C.b}+${totalGen}${C.r} items  rate:${C.c}${ipm}/min${C.r}  ETA:${C.c}${eta}${C.r}  `+
    `${C.g}${done.length}✓${C.r} ${C.y}${skipped.length}–${C.r} ${C.rd}${failed.length}✗${C.r} ${C.d}${pending.length}·${C.r}`
  );
  lines.push(` [${bar(pct,W-14)}] ${C.b}${Math.round(pct*100)}%${C.r}  ${complete}/${total}`);
  lines.push(`${C.d}${"─".repeat(W)}${C.r}`);

  if (running.length > 0) {
    lines.push(` ${C.b}${C.c}RUNNING (${running.length})${C.r}`);
    for (const a of running) {
      const dur  = a.startedAt ? elapsed(Date.now()-a.startedAt) : "";
      const gen  = a.generated > 0 ? `${C.g}+${a.generated}${C.r}` : `${C.d}…${C.r}`;
      const att  = a.attempt > 1 ? ` ${C.y}#${a.attempt}${C.r}` : "";
      lines.push(
        ` ${C.c}${sp}${C.r} ${C.d}[${String(a.slot).padStart(2,"0")}]${C.r} `+
        `${TYPE_COLOR[a.task.type]}${pad(a.task.type,15)}${C.r} `+
        `${pad(a.task.label,22)} ${gen}${att}  ${C.d}${dur}${C.r}`
      );
    }
    lines.push(`${C.d}${"─".repeat(W)}${C.r}`);
  }

  const types: ContentType[] = ["questions","certifications","flashcards","voice","paths"];
  for (const t of types) {
    const ta = agents.filter(a=>a.task.type===t);
    if (ta.length === 0) continue;
    const tDone    = ta.filter(a=>a.status==="done").length;
    const tRunning = ta.filter(a=>a.status==="running").length;
    const tSkipped = ta.filter(a=>a.status==="skipped").length;
    const tFailed  = ta.filter(a=>a.status==="failed").length;
    const tPending = ta.filter(a=>a.status==="pending"||a.status==="retry").length;
    const tGen     = ta.reduce((s,a)=>s+a.generated,0);
    const avgQ     = ta.filter(a=>a.quality).reduce((s,a,_,arr)=>s+(a.quality?.score??0)/arr.length,0);
    const col      = TYPE_COLOR[t];

    lines.push(
      ` ${col}${C.b}${pad(TYPE_LABEL[t],16)}${C.r} `+
      `${C.g}✓${tDone}${C.r} ${C.d}·${tPending}${C.r} `+
      (tSkipped>0?`${C.y}–${tSkipped}${C.r} `:"")+
      (tFailed>0?`${C.rd}✗${tFailed}${C.r} `:"")+
      (tGen>0?`  ${C.g}+${tGen}${C.r}`:"")+
      (tDone>0?`  qual:${qualityBar(avgQ)}`:"")
    );

    const recent = ta.filter(a=>a.status==="done"||a.status==="failed")
      .sort((a,b)=>(b.endedAt??0)-(a.endedAt??0)).slice(0,6);
    if (recent.length > 0) {
      const chips = recent.map(a=>{
        const ic = a.status==="done" ? `${C.g}✓${C.r}` : `${C.rd}✗${C.r}`;
        const q  = a.quality ? ` ${qualityBar(a.quality.score)}` : "";
        return `${ic}${C.d}${a.task.label}${C.r}${q}`;
      }).join("  ");
      lines.push(`   ${chips}`);
    }
  }

  lines.push(`${C.d}${"─".repeat(W)}${C.r}`);

  if (dashLines > 0) process.stdout.write(`\x1b[${dashLines}A`);
  for (const line of lines) process.stdout.write(`\x1b[2K\r${line}\n`);
  dashLines = lines.length;
}

// ─── Worker pool ──────────────────────────────────────────────────────────────
const activeSlots = new Set<number>();

function nextSlot(): number {
  for (let i = 1; i <= MAX_WORKERS; i++) {
    if (!activeSlots.has(i)) { activeSlots.add(i); return i; }
  }
  return MAX_WORKERS + 1;
}

function isOverloaded(): boolean {
  return activeSlots.size >= MAX_WORKERS || os.loadavg()[0] > LOAD_LIMIT;
}

async function waitForSlot() {
  while (isOverloaded()) await new Promise(r => setTimeout(r, 400));
}

async function runAgent(agent: Agent): Promise<void> {
  const slot = nextSlot();
  agent.slot      = slot;
  agent.status    = "running";
  agent.startedAt = Date.now();
  const since     = new Date().toISOString();

  agent.baseline = await dbCount(agent.task.countSql, agent.task.countArgs);
  agent.current  = agent.baseline;

  const prompt = agent.task.buildPrompt();
  const errLog  = path.join(LOG_DIR, `${agent.task.id}-${Date.now()}.err`);
  fs.mkdirSync(LOG_DIR, { recursive: true });

  let pollTimer: ReturnType<typeof setInterval>|null = null;
  pollTimer = setInterval(async () => {
    const n = await dbCount(agent.task.countSql, agent.task.countArgs);
    agent.current   = n;
    agent.generated = Math.max(0, n - agent.baseline);
  }, POLL_MS);

  let errBuf = "";

  await new Promise<void>(resolve => {
    const child = spawn(OPENCODE, ["run", "--agent", agent.task.agent, prompt], {
      stdio: ["ignore","pipe","pipe"],
    });

    const timer = setTimeout(() => child.kill("SIGTERM"), TIMEOUT_MS);

    child.stderr?.on("data", (d: Buffer) => { errBuf += d.toString(); });

    child.on("close", async () => {
      clearTimeout(timer);
      if (pollTimer) clearInterval(pollTimer);

      const final = await dbCount(agent.task.countSql, agent.task.countArgs);
      agent.current   = final;
      agent.generated = Math.max(0, final - agent.baseline);

      if (agent.generated > 0) {
        agent.status  = "done";
        agent.quality = await scoreQuality(agent.task.type, agent.task.label, since);
      } else {
        agent.status   = "failed";
        agent.errorSnip = errBuf.slice(-300);
        if (errBuf.length > 0) {
          fs.writeFileSync(errLog, errBuf, "utf8");
        }
      }

      agent.endedAt = Date.now();
      activeSlots.delete(slot);

      await logGeneration(
        agent.task.id, agent.task.type, agent.task.label,
        agent.status === "done", agent.generated,
        agent.endedAt - (agent.startedAt ?? agent.endedAt),
        agent.attempt, agent.status === "failed" ? errBuf.slice(0,200) : undefined
      );

      resolve();
    });

    child.on("error", async () => {
      clearTimeout(timer);
      if (pollTimer) clearInterval(pollTimer);
      agent.status  = "failed";
      agent.endedAt = Date.now();
      activeSlots.delete(slot);
      await logGeneration(
        agent.task.id, agent.task.type, agent.task.label,
        false, 0, agent.endedAt - (agent.startedAt ?? agent.endedAt),
        agent.attempt, "spawn error"
      );
      resolve();
    });
  });
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanupTempFiles() {
  try {
    const files = fs.readdirSync("scripts").filter(f=>f.startsWith(".tmp-"));
    files.forEach(f => fs.rmSync(path.join("scripts",f), {force:true}));
    if (files.length) console.log(`${C.d}Cleaned ${files.length} temp file(s).${C.r}`);
  } catch {}
}

// ─── JSON Report ──────────────────────────────────────────────────────────────
function writeReport(startMs: number) {
  const ts = new Date().toISOString().replace(/[:.]/g,"-");
  const file = path.join("scripts", `.swarm-report-${ts}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startMs,
    workers: MAX_WORKERS, batchSize: BATCH_SIZE,
    tasks: agents.map(a => ({
      id: a.task.id, type: a.task.type, label: a.task.label,
      status: a.status, attempt: a.attempt,
      generated: a.generated, quality: a.quality,
      durationMs: a.startedAt && a.endedAt ? a.endedAt - a.startedAt : null,
    })),
  };
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
  console.log(`${C.d}Report saved: ${file}${C.r}`);
  return file;
}

// Print prior reports
function showReports() {
  try {
    const files = fs.readdirSync("scripts")
      .filter(f=>f.startsWith(".swarm-report-")&&f.endsWith(".json"))
      .sort().reverse().slice(0,3);
    if (files.length === 0) { console.log("No reports found."); return; }
    for (const f of files) {
      const r = JSON.parse(fs.readFileSync(path.join("scripts",f),"utf8"));
      const done   = r.tasks.filter((t:any)=>t.status==="done").length;
      const failed = r.tasks.filter((t:any)=>t.status==="failed").length;
      const gen    = r.tasks.reduce((s:number,t:any)=>s+t.generated,0);
      console.log(`\n${C.b}${r.timestamp}${C.r}  (${elapsed(r.durationMs)})`);
      console.log(`  ${C.g}+${gen} items${C.r}  ${C.g}${done}✓${C.r}  ${C.rd}${failed}✗${C.r}`);
    }
    console.log();
  } catch (e: any) { console.error(e.message); }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (SHOW_REPORT) { showReports(); process.exit(0); }

  // Checks
  if (!fs.existsSync(OPENCODE)) {
    console.error(`${C.rd}✗ opencode not found: ${OPENCODE}${C.r}\n  npm install -g opencode-ai`);
    process.exit(1);
  }
  if (!fs.existsSync(DB_PATH)) {
    console.error(`${C.rd}✗ Database not found: ${DB_PATH}${C.r}\n  Run the app once to initialise the DB.`);
    process.exit(1);
  }
  try { await dbCount("SELECT 1"); }
  catch (e: any) { console.error(`${C.rd}✗ Cannot open DB: ${e.message}${C.r}`); process.exit(1); }

  await ensureLogsTable();

  // Load channels from DB (with hardcoded fallback)
  process.stdout.write("  Loading channels from DB…");
  const qChannels = await loadQChannelsFromDb();
  process.stdout.write(` ${C.g}${qChannels.length} channels${C.r}\n`);

  // Build priority-sorted queue
  const queue = await buildQueue(qChannels);
  if (queue.length === 0) {
    console.log(`${C.y}No tasks match filters.${C.r}`); process.exit(0);
  }

  // Load resume state
  const state = loadState();
  const resumedSkip = FORCE ? 0 : state.completed.length;

  // Check DB counts and build agent list
  process.stdout.write(`  Checking ${queue.length} tasks against DB…`);
  for (const task of queue) {
    const n = await dbCount(task.countSql, task.countArgs);
    const resumeSkipped = !FORCE && state.completed.includes(task.id);
    const alreadySatisfied = !FORCE && n >= task.minNeeded;
    agents.push({
      task, status: (resumeSkipped || alreadySatisfied) ? "skipped" : "pending",
      slot: 0, attempt: 1, baseline: n, current: n, generated: 0,
    });
  }

  const active = agents.filter(a => a.status === "pending");
  process.stdout.write(
    `\r  ${C.g}✓${C.r} ${agents.filter(a=>a.status==="skipped").length} skipped  `+
    `${C.b}${active.length} to run${C.r} with ${C.b}${MAX_WORKERS} workers${C.r} `+
    `(batch=${BATCH_SIZE}${resumedSkip>0?`, +${resumedSkip} resumed`:""})  \n\n`
  );

  if (active.length === 0) {
    console.log(`${C.g}All content meets thresholds. Use --force to re-run.${C.r}\n`);
    db.close(); process.exit(0);
  }

  if (DRY_RUN) {
    console.log(`${C.y}DRY RUN — tasks that would execute (priority order):${C.r}`);
    active.forEach((a,i) => console.log(`  ${String(i+1).padStart(2)}. ${a.task.type}/${a.task.label}  (current: ${a.current})`));
    console.log(); db.close(); process.exit(0);
  }

  // Optional strategy reorder
  let orderedAgents = [...agents];
  if (STRATEGY_MODE) {
    const reorderedQueue = await buildStrategyPlan(active.map(a => a.task));
    const idxMap = new Map(reorderedQueue.map((t,i) => [t.id, i]));
    orderedAgents = agents.sort((a,b) => {
      if (a.status==="skipped") return 1;
      if (b.status==="skipped") return -1;
      return (idxMap.get(a.task.id) ?? 999) - (idxMap.get(b.task.id) ?? 999);
    });
  }

  if (MAX_WORKERS > 10) {
    console.log(`${C.y}⚠ ${MAX_WORKERS} workers — watch system load.${C.r}\n`);
    await new Promise(r => setTimeout(r, 2000));
  }

  process.on("SIGINT",  () => { cleanupTempFiles(); db.close(); process.exit(0); });
  process.on("SIGTERM", () => { cleanupTempFiles(); db.close(); process.exit(0); });

  swarmStart = Date.now();
  dashLines  = 0;
  const renderTimer = setInterval(renderDashboard, RENDER_MS);
  renderDashboard();

  // Pump with retry support
  async function pump() {
    const pending = orderedAgents.filter(a => a.status === "pending" || a.status === "retry");
    const inFlight: Promise<void>[] = [];

    for (const agent of pending) {
      await waitForSlot();
      if (inFlight.length > 0) await new Promise(r => setTimeout(r, STAGGER_MS));

      const p: Promise<void> = (async () => {
        await runAgent(agent);

        // Retry logic
        if (agent.status === "failed" && agent.attempt < MAX_RETRIES + 1) {
          agent.attempt++;
          agent.status = "retry";
          await waitForSlot();
          await new Promise(r => setTimeout(r, STAGGER_MS));
          await runAgent(agent);
        }
      })().finally(() => {
        inFlight.splice(inFlight.indexOf(p), 1);
        // Update resume state on success
        if (agent.status === "done") {
          state.completed.push(agent.task.id);
          saveState({ ...state, lastRun: new Date().toISOString() });
        }
      });
      inFlight.push(p);
    }

    await Promise.all(inFlight);
  }

  await pump();
  clearInterval(renderTimer);
  renderDashboard();
  cleanupTempFiles();

  const reportFile = writeReport(swarmStart);
  db.close();

  // Final summary
  const totalGen  = agents.reduce((s,a)=>s+a.generated, 0);
  const doneCount = agents.filter(a=>a.status==="done").length;
  const failCount = agents.filter(a=>a.status==="failed").length;
  const skipCount = agents.filter(a=>a.status==="skipped").length;
  const avgQual   = agents.filter(a=>a.quality).reduce((s,a,_,arr)=>s+(a.quality?.score??0)/arr.length,0);

  console.log(
    `\n ${C.g}${C.b}✓ Swarm complete${C.r}  `+
    `${C.g}${C.b}+${totalGen}${C.r} items  `+
    `${C.g}${doneCount}✓${C.r} ${C.y}${skipCount}–${C.r} `+
    `${failCount>0?C.rd:C.d}${failCount}✗${C.r}  `+
    `qual:${qualityBar(avgQual)}  `+
    `${elapsed(Date.now()-swarmStart)}\n`
  );

  if (failCount > 0) {
    console.log(`${C.rd}Failed tasks:${C.r}`);
    agents.filter(a=>a.status==="failed").forEach(a => {
      console.log(`  ✗ ${a.task.type}/${a.task.label}`);
      if (a.errorSnip) console.log(`    ${C.d}${a.errorSnip.trim().slice(0,120)}${C.r}`);
    });
    console.log(`\n  ${C.d}Full logs in scripts/.logs/  Report: ${reportFile}${C.r}\n`);
    process.exit(1);
  }
}

main();
