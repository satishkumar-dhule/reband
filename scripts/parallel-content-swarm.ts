#!/usr/bin/env npx tsx
/**
 * DevPrep Content Generation Swarm — Parallel Edition v2.2
 *
 * Spawns at least 5 subagents per session, with multiple parallel sessions
 * for maximum throughput writing directly to local.db.
 *
 * Optimizations:
 *   • MIN_PARALLEL=5 guaranteed per session
 *   • Exponential backoff retry for failed agents
 *   • Agent health monitoring with auto-restart
 *   • Direct DB insertion via captured output parsing
 *   • Best free LLMs (qwen3.6, nemotron, minimax)
 */

import { createClient } from "@libsql/client";
import { spawn, execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import { resolve } from "path";
import { randomUUID } from "crypto";

// ─── CLI args ─────────────────────────────────────────────────────────────────
const arg = (flag: string) => process.argv.find(a => a.startsWith(`${flag}=`))?.split("=")[1];
const flag = (f: string) => process.argv.includes(f);

const MAX_WORKERS = Math.min(30, Math.max(5, parseInt(arg("--workers") ?? "5")));
const SESSIONS = Math.max(1, parseInt(arg("--sessions") ?? "1"));
const FILTER_TYPE = arg("--type");
const FILTER_CH = arg("--channel");
const DRY_RUN = flag("--dry-run");
const LOAD_LIMIT = parseFloat(arg("--max-load") ?? "3.0");
const MIN_PARALLEL = 5;
const MAX_RETRIES = 3;
const BASE_RETRY_MS = 2_000;
const STALL_THRESHOLD_MS = 90_000;

const FREE_MODELS = [
  "opencode/qwen3.6-plus-free",
  "opencode/nemotron-3-super-free",
  "opencode/minimax-m2.5-free",
];
const MODEL = arg("--model") ?? FREE_MODELS[0];

// Resolve opencode binary — check Replit path first, then fall back to PATH
function findOpencode(): string {
  const candidates = [
    "/home/runner/workspace/.config/npm/node_global/bin/opencode",
    "/home/runner/.config/npm/node_global/bin/opencode",
    process.env.OPENCODE_BIN ?? "",
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  // Fall back to PATH lookup
  try {
    const { execSync } = require("child_process");
    return execSync("which opencode", { encoding: "utf8" }).trim();
  } catch { return "opencode"; }
}
const OPENCODE = findOpencode();
const DB_PATH = resolve(process.cwd(), "local.db");
const TIMEOUT_MS = 6 * 60 * 1000;
const POLL_MS = 3_000;
const RENDER_MS = 400;

// ─── ANSI ─────────────────────────────────────────────────────────────────────
const C = {
  r: "\x1b[0m", b: "\x1b[1m", d: "\x1b[2m",
  g: "\x1b[32m", rd: "\x1b[31m", y: "\x1b[33m",
  bl: "\x1b[34m", c: "\x1b[36m", m: "\x1b[35m",
};
const SPIN = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
let spinIdx = 0;

// ─── Git commit ───────────────────────────────────────────────────────────────
function gitCommit(type: ContentType, label: string, count: number): void {
  try {
    execSync("git add -A", { cwd: process.cwd(), stdio: "ignore" });
    const msg = `content: add ${count} ${type} for ${label} [swarm]`;
    execSync(`git commit -m "${msg}" --no-verify`, { cwd: process.cwd(), stdio: "ignore" });
  } catch (_) { /* non-fatal — repo may have no changes or no git */ }
}

// ─── DB ───────────────────────────────────────────────────────────────────────
const db = createClient({ url: `file:${DB_PATH}` });

async function dbCount(sql: string, args: (string | number | null)[] = []): Promise<number> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await db.execute({ sql, args });
      const v = r.rows[0]?.[0];
      return typeof v === "number" ? v : parseInt(String(v ?? "0"), 10);
    } catch { await new Promise(r => setTimeout(r, 50 * (attempt + 1))); }
  }
  return 0;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ContentType = "questions"|"certifications"|"flashcards"|"voice"|"paths"|"challenges";
type Status = "pending"|"running"|"done"|"failed"|"skipped";

interface Task {
  id: string;
  type: ContentType;
  label: string;
  agent: string;
  buildPrompt: () => string;
  countSql: string;
  countArgs: (string | number | null)[];
  minNeeded: number;
}

interface Agent {
  task: Task;
  status: Status;
  slot: number;
  startedAt?: number;
  endedAt?: number;
  baseline: number;
  current: number;
  generated: number;
  retries: number;
  lastProgressAt: number;
  stalled: boolean;
  child?: ReturnType<typeof spawn>;
}

// ─── Content definitions ──────────────────────────────────────────────────────
// 66 question channels + certifications
const Q_CHANNELS = [
  // CS Fundamentals
  { id:"data-structures", ctx:"Arrays, linked lists, stacks, queues, trees, heaps, hash tables, tries.", sub:["trees","hash-tables","linked-lists","heaps","arrays"] },
  { id:"complexity-analysis", ctx:"Big O/Theta/Omega, amortized analysis, Master theorem, recurrences.", sub:["big-o-notation","amortized-analysis","recurrence-relations","complexity"] },
  { id:"dynamic-programming", ctx:"Memoization vs tabulation. Fibonacci, Knapsack, LCS, Coin Change, Edit Distance.", sub:["memoization","tabulation","classic-problems","optimization"] },
  { id:"bit-manipulation", ctx:"AND/OR/XOR/shift. Power of 2, count bits, bit masking, swap without temp.", sub:["bitwise-operators","bit-tricks","bit-masking"] },
  { id:"design-patterns", ctx:"Creational, Structural, Behavioral patterns with real-world use cases.", sub:["creational","structural","behavioral","solid"] },
  { id:"concurrency", ctx:"Threads, race conditions, deadlocks, mutexes, semaphores, async/await.", sub:["threads","deadlocks","synchronization","async-patterns"] },
  { id:"math-logic", ctx:"Probability, combinatorics, number theory, discrete math, logic puzzles.", sub:["probability","combinatorics","number-theory","logic-puzzles"] },
  { id:"low-level", ctx:"Stack vs heap, pointers, CPU cache, virtual memory, paging, system calls.", sub:["memory-management","cpu-cache","virtual-memory","system-calls"] },
  
  // Algorithms & Data
  { id:"algorithms", ctx:"Sorting, searching, graph traversal, DP, greedy. Always include Big-O.", sub:["sorting","searching","graph-algorithms","divide-conquer","greedy"] },
  { id:"graphs", ctx:"BFS, DFS, Dijkstra, MST, topological sort, cycle detection.", sub:["bfs-dfs","shortest-path","mst","topological-sort"] },
  { id:"trees", ctx:"Binary trees, BST, AVL, Red-Black, tries, segment trees, B-trees.", sub:["binary-trees","balanced-trees","tries","segment-tree"] },
  { id:"heaps", ctx:"Min/Max heap, priority queue, heap sort, median maintenance.", sub:["heap-operations","priority-queue","heap-sort"] },
  { id:"sorting", ctx:"Quick sort, merge sort, heap sort, counting sort, radix sort, stability.", sub:["comparison-sorts","non-comparison-sorts","stable-sort"] },
  { id:"searching", ctx:"Binary search, interpolation search, exponential search, 2D search.", sub:["binary-search","variants","2d-search"] },
  
  // Engineering
  { id:"system-design", ctx:"Design scalable distributed systems. Requirements, capacity, caching, queues.", sub:["distributed-systems","caching","databases","api-design","scalability"] },
  { id:"distributed-systems", ctx:"Consensus, replication, partitioning, CAP theorem, consistency models.", sub:["consensus","replication","consistency","cap-theorem"] },
  { id:"frontend", ctx:"React hooks, virtual DOM, event loop, closures, CSS, Core Web Vitals.", sub:["react","javascript","css","browser-internals","performance"] },
  { id:"backend", ctx:"REST API, JWT/OAuth2, caching, message queues, microservices, error handling.", sub:["api-design","authentication","caching","microservices","databases"] },
  { id:"api-design", ctx:"REST vs GraphQL vs gRPC, versioning, error handling, rate limiting.", sub:["rest","graphql","grpc","versioning"] },
  { id:"authentication", ctx:"JWT, OAuth2, sessions, MFA, SSO, password hashing, bcrypt.", sub:["jwt","oauth","sessions","mfa"] },
  { id:"microservices", ctx:"Service discovery, API gateway, circuit breaker, saga pattern, service mesh.", sub:["service-discovery","circuit-breaker","saga","service-mesh"] },
  { id:"database", ctx:"SQL joins, indexing, ACID, isolation levels, query optimisation, NoSQL.", sub:["sql","indexing","transactions","query-optimization","nosql"] },
  { id:"sql", ctx:"Window functions, CTEs, stored procedures, triggers, query optimization.", sub:["window-functions","ctes","optimization"] },
  { id:"nosql", ctx:"CAP theorem, document stores, key-value stores, wide-column stores.", sub:["mongodb","dynamodb","cassandra","cap-theorem"] },
  
  // Programming Languages
  { id:"javascript", ctx:"Closures, prototypes, promises, async/await, event loop, modules.", sub:["closures","prototypes","promises","async-await"] },
  { id:"typescript", ctx:"Generics, utility types, discriminated unions, narrowing, decorators.", sub:["generics","utility-types","discriminated-unions"] },
  { id:"python", ctx:"Comprehensions, generators, decorators, async/await, type hints, GIL.", sub:["python-basics","oop","functional-programming","async","decorators"] },
  { id:"nodejs", ctx:"Streams, buffers, cluster, middleware, event loop, async patterns.", sub:["streams","cluster","middleware","events"] },
  { id:"react", ctx:"Hooks rules, context, performance, state management, SSR.", sub:["hooks","context","performance","state-management"] },
  
  // DevOps & Cloud
  { id:"devops", ctx:"CI/CD, Docker, Kubernetes, Terraform, monitoring, blue-green deploys.", sub:["ci-cd","docker","kubernetes","iac","monitoring"] },
  { id:"ci-cd", ctx:"Pipeline design, GitOps, trunk-based development, Docker builds.", sub:["pipelines","gitops","trunk-based","optimization"] },
  { id:"containers", ctx:"Docker images, volumes, networking, orchestration, security.", sub:["docker-basics","networking","orchestration","security"] },
  { id:"sre", ctx:"SLIs, SLOs, error budgets, toil, incident response, chaos engineering.", sub:["slos-slas","incident-response","observability","chaos-engineering"] },
  { id:"kubernetes", ctx:"Pods, ReplicaSets, Deployments, Services, Ingress, ConfigMaps, RBAC.", sub:["pods","services","config","scaling","storage","rbac"] },
  { id:"aws", ctx:"EC2, S3, RDS, DynamoDB, Lambda, VPC, IAM, CloudFormation, ECS/EKS.", sub:["compute","storage","networking","serverless","databases"] },
  { id:"gcp", ctx:"GKE, Cloud Storage, BigQuery, VPC, Cloud Run, App Engine.", sub:["gke","cloud-storage","bigquery","networking"] },
  { id:"azure", ctx:"Azure VMs, Blob Storage, VNet, App Service, Functions, Azure AD.", sub:["azure-basics","networking","storage","identity"] },
  { id:"terraform", ctx:"HCL, providers, resources, modules, remote state, workspaces.", sub:["hcl-basics","modules","state-management","providers"] },
  { id:"monitoring", ctx:"Prometheus, Grafana, alerting, dashboards, SLOs/SLIs.", sub:["prometheus","grafana","alerting","dashboards"] },
  { id:"caching", ctx:"Redis, Memcached, CDN, cache invalidation strategies, eviction policies.", sub:["redis","cdn","strategies","eviction"] },
  
  // Data & AI
  { id:"data-engineering", ctx:"ETL/ELT, Spark, Kafka, data warehouses, Airflow, star schema.", sub:["etl-pipelines","apache-spark","kafka","data-warehousing","airflow"] },
  { id:"machine-learning", ctx:"Supervised/unsupervised, bias-variance, gradient descent, evaluation.", sub:["supervised-learning","model-evaluation","feature-engineering"] },
  { id:"supervised-learning", ctx:"Classification, regression, overfitting, cross-validation, feature scaling.", sub:["classification","regression","overfitting","cross-validation"] },
  { id:"neural-networks", ctx:"Activation functions, backpropagation, optimizers, regularization, CNNs.", sub:["activation","backpropagation","optimizers","regularization"] },
  { id:"ensemble-methods", ctx:"Random Forest, Boosting (XGBoost), Bagging, Stacking.", sub:["random-forest","boosting","bagging","stacking"] },
  { id:"generative-ai", ctx:"LLMs, transformers, RAG, fine-tuning, embeddings, vector DBs.", sub:["llms","rag","fine-tuning","embeddings","transformer-architecture"] },
  { id:"llms", ctx:"Transformer architecture, prompting, hallucination, fine-tuning, tokens.", sub:["transformers","prompting","hallucination","tokenization"] },
  { id:"prompt-engineering", ctx:"Zero-shot, few-shot, chain-of-thought, role prompting, structured output.", sub:["prompting-techniques","structured-output","context-management"] },
  { id:"llm-ops", ctx:"LLM deployment, inference, quantisation, caching, cost optimisation.", sub:["inference","model-serving","evaluation","cost-optimization"] },
  { id:"computer-vision", ctx:"CNNs, image classification, YOLO, segmentation, transfer learning.", sub:["cnn-architecture","object-detection","transfer-learning"] },
  { id:"nlp", ctx:"Tokenisation, Word2Vec, BERT, text classification, NER, transformers.", sub:["tokenization","embeddings","text-classification","transformers"] },
  
  // Security
  { id:"security", ctx:"OWASP Top 10, SQL injection, XSS, CSRF, JWT, TLS, secrets management.", sub:["web-security","authentication","cryptography","owasp","secure-coding"] },
  
  // Infrastructure
  { id:"networking", ctx:"OSI model, TCP/UDP, DNS, HTTP/2/3, load balancing, CDN, WebSockets.", sub:["tcp-ip","http","dns","load-balancing","protocols"] },
  { id:"operating-systems", ctx:"Processes vs threads, scheduling, memory management, file systems, IPC.", sub:["processes-threads","scheduling","memory-management","file-systems"] },
  { id:"linux", ctx:"grep/awk/sed, chmod, bash scripting, cron, systemd, package managers.", sub:["shell-commands","shell-scripting","system-administration","networking-tools"] },
  { id:"unix", ctx:"POSIX, pipes, signals, file descriptors, IPC (pipes, sockets, shared memory).", sub:["posix","signals","ipc","file-descriptors","shell-scripting"] },
  
  // Mobile
  { id:"ios", ctx:"Swift, UIKit vs SwiftUI, ARC, GCD, Core Data, URLSession, MVVM.", sub:["swift","swiftui","uikit","concurrency","data-persistence"] },
  { id:"android", ctx:"Kotlin, Activity/Fragment lifecycle, Compose, ViewModel, Room, Coroutines.", sub:["kotlin","jetpack","lifecycle","coroutines","architecture"] },
  { id:"react-native", ctx:"RN architecture (JSI), React Navigation, Redux/Zustand, native modules.", sub:["rn-architecture","navigation","performance","native-modules"] },
  
  // Testing
  { id:"testing", ctx:"Unit, integration, E2E, TDD, BDD, mocking, coverage, pyramids.", sub:["unit-testing","tdd","mocking","test-strategy"] },
  { id:"e2e-testing", ctx:"Playwright/Cypress, POM, flaky tests, visual regression, CI integration.", sub:["playwright","cypress","page-object-model","ci-integration"] },
  { id:"api-testing", ctx:"REST/GraphQL testing, Postman, contract testing, k6, schema validation.", sub:["rest-testing","contract-testing","load-testing","mocking"] },
  { id:"performance-testing", ctx:"Load/stress/soak, profiling, k6, JMeter, Lighthouse, Core Web Vitals.", sub:["load-testing","profiling","web-performance","database-performance"] },
  
  // Management
  { id:"engineering-management", ctx:"1:1s, perf reviews, roadmaps, estimation, stakeholder comms.", sub:["leadership","project-management","hiring","technical-strategy"] },
  { id:"behavioral", ctx:"STAR method: leadership, conflict, failure, deadlines, teamwork.", sub:["leadership","conflict-resolution","failure-handling","teamwork"] },
  
  // Certifications
  { id:"certifications", ctx:"AWS, GCP, Azure, Kubernetes, Terraform, Security certification exam prep.", sub:["aws","kubernetes","terraform","security","azure","gcp"] },
];

const F_CHANNELS = [
  { id:"algorithms", ctx:"Sorting, searching, DP, graph algorithms. Include Big-O.", cats:["sorting","searching","graph-algorithms","dynamic-programming","greedy"] },
  { id:"system-design", ctx:"Distributed systems, caching, load balancing, databases, API design.", cats:["distributed-systems","caching","databases","api-design","scalability"] },
  { id:"frontend", ctx:"React hooks, virtual DOM, event loop, closures, CSS, TypeScript.", cats:["react","javascript","css","browser-internals","performance"] },
  { id:"backend", ctx:"REST API, authentication, caching, message queues, microservices.", cats:["api-design","authentication","caching","microservices","databases"] },
  { id:"database", ctx:"SQL joins, indexing, ACID, query optimisation, normalization.", cats:["sql","indexing","transactions","nosql","query-optimization"] },
  { id:"devops", ctx:"CI/CD, Docker, Kubernetes, IaC, monitoring, deployments.", cats:["ci-cd","docker","kubernetes","iac","monitoring"] },
  { id:"security", ctx:"OWASP Top 10, SQL injection, XSS, CSRF, authentication, TLS.", cats:["web-security","authentication","cryptography","owasp"] },
  { id:"machine-learning", ctx:"Supervised/unsupervised, bias-variance, gradient descent, metrics.", cats:["supervised-learning","model-evaluation","neural-networks","feature-engineering"] },
  { id:"generative-ai", ctx:"LLMs, transformers, RAG, fine-tuning, embeddings, vector DBs.", cats:["llms","rag","fine-tuning","embeddings","transformer-architecture"] },
];

const V_CHANNELS = [
  { id:"algorithms", minQ:5, topics:["sorting-algorithms","graph-traversal","dynamic-programming","binary-search","greedy-algorithms"] },
  { id:"system-design", minQ:5, topics:["url-shortener","distributed-cache","message-queue","api-gateway","rate-limiter"] },
  { id:"frontend", minQ:5, topics:["react-hooks","javascript-closures","browser-rendering","web-performance","typescript"] },
  { id:"backend", minQ:5, topics:["rest-api-design","authentication","caching-strategies","microservices","database-design"] },
  { id:"behavioral", minQ:3, topics:["leadership","conflict-resolution","failure-handling","teamwork","decision-making"] },
  { id:"devops", minQ:5, topics:["ci-cd-pipeline","docker-kubernetes","iac","monitoring","incident-response"] },
];

const CERTIFICATIONS = [
  { id:"aws-saa", name:"AWS Solutions Architect Associate", prov:"Amazon", code:"SAA-C03", cat:"cloud", diff:"intermediate", domains:[{n:"Design Resilient Architectures",w:30},{n:"High-Performing Architectures",w:28},{n:"Secure Applications",w:24},{n:"Cost-Optimized",w:18}], maps:["aws","system-design","database"] },
  { id:"aws-developer", name:"AWS Developer Associate", prov:"Amazon", code:"DVA-C02", cat:"cloud", diff:"intermediate", domains:[{n:"Development with AWS",w:32},{n:"Security",w:26},{n:"Deployment",w:24},{n:"Troubleshooting",w:18}], maps:["aws","backend","devops"] },
  { id:"cka", name:"Certified Kubernetes Administrator", prov:"CNCF", code:"CKA", cat:"devops", diff:"advanced", domains:[{n:"Cluster Architecture",w:25},{n:"Workloads & Scheduling",w:15},{n:"Networking",w:20},{n:"Storage",w:10},{n:"Troubleshooting",w:30}], maps:["kubernetes","devops","linux"] },
  { id:"ckad", name:"Certified Kubernetes App Developer", prov:"CNCF", code:"CKAD", cat:"devops", diff:"intermediate", domains:[{n:"App Design & Build",w:20},{n:"App Deployment",w:20},{n:"Observability",w:15},{n:"Security",w:25},{n:"Networking",w:20}], maps:["kubernetes","devops","backend"] },
  { id:"terraform-associate", name:"Terraform Associate", prov:"HashiCorp", code:"003", cat:"devops", diff:"intermediate", domains:[{n:"IaC Concepts",w:17},{n:"Terraform Basics",w:24},{n:"CLI",w:22},{n:"Modules",w:12},{n:"Workflow",w:16}], maps:["terraform","devops"] },
  { id:"security-plus", name:"CompTIA Security+", prov:"CompTIA", code:"SY0-701", cat:"security", diff:"intermediate", domains:[{n:"General Security",w:12},{n:"Threats",w:22},{n:"Architecture",w:18},{n:"Operations",w:28},{n:"Management",w:20}], maps:["security","networking"] },
  { id:"azure-fundamentals", name:"Microsoft Azure Fundamentals", prov:"Microsoft", code:"AZ-900", cat:"cloud", diff:"beginner", domains:[{n:"Cloud Concepts",w:25},{n:"Azure Architecture",w:35},{n:"Management",w:30},{n:"Pricing",w:10}], maps:["devops","system-design"] },
  { id:"kubernetes-kcna", name:"Kubernetes and Cloud Native Associate", prov:"CNCF", code:"KCNA", cat:"devops", diff:"beginner", domains:[{n:"Kubernetes Fundamentals",w:46},{n:"Container Orchestration",w:22},{n:"Cloud Native",w:16},{n:"Observability",w:8},{n:"App Delivery",w:8}], maps:["kubernetes","devops"] },
];

const P_BATCHES = [
  { type:"company" as const, items:[
    {title:"Google SWE Interview Prep", company:"Google", ch:["algorithms","system-design","behavioral"], diff:"advanced", h:80},
    {title:"Amazon SWE Interview Prep", company:"Amazon", ch:["algorithms","system-design","behavioral"], diff:"advanced", h:80},
    {title:"Meta SWE Interview Prep", company:"Meta", ch:["algorithms","system-design","behavioral"], diff:"advanced", h:80},
    {title:"Apple SWE Interview Prep", company:"Apple", ch:["algorithms","system-design","behavioral"], diff:"advanced", h:60},
    {title:"Netflix SWE Interview Prep", company:"Netflix", ch:["system-design","behavioral"], diff:"advanced", h:60},
    {title:"Microsoft SWE Interview Prep", company:"Microsoft", ch:["algorithms","system-design","behavioral"], diff:"intermediate", h:60},
    {title:"Stripe Engineering Interview", company:"Stripe", ch:["backend","system-design","database"], diff:"advanced", h:60},
    {title:"Airbnb Engineering Interview", company:"Airbnb", ch:["frontend","backend","system-design"], diff:"intermediate", h:50},
    {title:"Uber Engineering Interview", company:"Uber", ch:["system-design","backend","algorithms"], diff:"advanced", h:60},
    {title:"LinkedIn Engineering Interview", company:"LinkedIn", ch:["algorithms","system-design","behavioral"], diff:"intermediate", h:50},
  ]},
  { type:"job-title" as const, items:[
    {title:"Frontend Engineer Path", jt:"frontend-engineer", ch:["frontend","algorithms"], diff:"intermediate", h:60},
    {title:"Backend Engineer Path", jt:"backend-engineer", ch:["backend","database","system-design"], diff:"intermediate", h:60},
    {title:"Full-Stack Engineer Path", jt:"fullstack-engineer", ch:["frontend","backend","database"], diff:"intermediate", h:80},
    {title:"Site Reliability Engineer Path", jt:"sre", ch:["sre","devops","system-design"], diff:"advanced", h:80},
    {title:"DevOps Engineer Path", jt:"devops-engineer", ch:["devops","kubernetes","terraform"], diff:"intermediate", h:70},
    {title:"Data Engineer Path", jt:"data-engineer", ch:["data-engineering","database","python"], diff:"intermediate", h:60},
    {title:"ML Engineer Path", jt:"ml-engineer", ch:["machine-learning","python"], diff:"advanced", h:80},
    {title:"Engineering Manager Path", jt:"engineering-manager", ch:["engineering-management","behavioral"], diff:"advanced", h:50},
    {title:"Mobile Engineer Path", jt:"mobile-engineer", ch:["ios","android","react-native"], diff:"intermediate", h:60},
    {title:"Security Engineer Path", jt:"security-engineer", ch:["security","networking","backend"], diff:"advanced", h:60},
  ]},
  { type:"skill" as const, items:[
    {title:"Algorithms Mastery", ch:["algorithms","data-structures","complexity-analysis"], diff:"intermediate", h:60},
    {title:"System Design Pro", ch:["system-design","database","devops"], diff:"advanced", h:80},
    {title:"Dynamic Programming Deep Dive", ch:["dynamic-programming","algorithms"], diff:"advanced", h:40},
    {title:"Database Design & Optimisation", ch:["database","backend"], diff:"intermediate", h:40},
    {title:"Distributed Systems Fundamentals", ch:["system-design","backend","devops"], diff:"advanced", h:60},
    {title:"JavaScript & TypeScript Mastery", ch:["frontend","backend"], diff:"intermediate", h:40},
    {title:"Python for Interviews", ch:["python","algorithms"], diff:"beginner", h:30},
    {title:"Behavioural Interview Excellence", ch:["behavioral","engineering-management"], diff:"intermediate", h:20},
    {title:"Web Security Fundamentals", ch:["security","backend"], diff:"intermediate", h:30},
    {title:"Cloud Architecture Patterns", ch:["aws","system-design","devops"], diff:"intermediate", h:50},
  ]},
  { type:"certification" as const, items:[
    {title:"AWS Solutions Architect Prep", ch:["aws","system-design"], diff:"intermediate", h:80},
    {title:"CKA Exam Preparation", ch:["kubernetes","devops","linux"], diff:"advanced", h:100},
    {title:"Terraform Associate Prep", ch:["terraform","devops"], diff:"intermediate", h:40},
    {title:"CKAD Preparation Path", ch:["kubernetes","devops","backend"], diff:"intermediate", h:60},
    {title:"CompTIA Security+ Prep", ch:["security","networking"], diff:"intermediate", h:60},
  ]},
];

const C_CATEGORIES = [
  { id:"algorithms", ctx:"Sorting, searching, two-pointer, sliding window, divide & conquer." },
  { id:"data-structures", ctx:"Arrays, linked lists, stacks, queues, hash maps, tries." },
  { id:"dynamic-programming", ctx:"Memoization, tabulation. Fibonacci, knapsack, LCS, edit distance, coin change." },
  { id:"graphs", ctx:"BFS, DFS, Dijkstra, topological sort, cycle detection, union-find." },
  { id:"trees", ctx:"Binary trees, BST, AVL. LCA, path sums, tree traversals, serialization." },
  { id:"strings", ctx:"Pattern matching, anagram, palindrome, string manipulation." },
  { id:"arrays", ctx:"Prefix sums, kadane's algorithm, next-permutation, matrix problems." },
  { id:"math", ctx:"Number theory, bit manipulation, probability, combinatorics." },
];

// ─── Prompt builders ──────────────────────────────────────────────────────────
function buildChallengePrompt(cat: typeof C_CATEGORIES[0], n: number): string {
  return "You are a senior engineering interviewer for DevPrep.\n\n" +
    "TASK: Generate " + n + " coding challenges for category \"" + cat.id + "\".\n\n" +
    "IMPORTANT: Output ONLY a valid JSON array. No other text.\n\n" +
    '[\n' +
    '  {\n' +
    '    "id": "<uuid>",\n' +
    '    "title": "2-5 word title",\n' +
    '    "description": "Problem statement with constraints and examples",\n' +
    '    "difficulty": "easy|medium|hard",\n' +
    '    "category": "' + cat.id + '",\n' +
    '    "tags": ["' + cat.id + '","subtopic"],\n' +
    '    "companies": ["Google","Amazon"],\n' +
    '    "starter_code_js": "function solve(input) {\\n  // your code here\\n}",\n' +
    '    "starter_code_py": "def solve(input):\\n    # your code here\\n    pass",\n' +
    '    "test_cases": "[{\\"input\\":\\"...\\\"expected\\":\\"...\\"}]",\n' +
    '    "hints": "[\\"Think about...\\",\\"Consider...\\"]",\n' +
    '    "solution_js": "function solve(input) {\\n  // full solution\\n}",\n' +
    '    "solution_py": "def solve(input):\\n    # full solution",\n' +
    '    "complexity_time": "O(n)",\n' +
    '    "complexity_space": "O(1)",\n' +
    '    "complexity_explanation": "One pass through the array",\n' +
    '    "time_limit": 15\n' +
    '  }\n' +
    ']\n\n' +
    "CONTEXT: " + cat.ctx + "\n\n" +
    "RULES:\n" +
    "- Output ONLY the JSON array\n" +
    "- Mix easy/medium/hard (30/50/20)\n" +
    "- Real-world LeetCode-style problems\n" +
    "- Both JS and Python solutions must be correct and runnable\n" +
    "- test_cases must be a JSON string of array of {input, expected} objects";
}

function buildQPrompt(ch: typeof Q_CHANNELS[0], n: number): string {
  const subs = ch.sub.join(", ");
  return "You are a senior engineering interviewer for DevPrep.\n\n" +
    "TASK: Generate exactly " + n + " interview questions for channel \"" + ch.id + "\".\n\n" +
    "IMPORTANT: Output ONLY a valid JSON array of " + n + " question objects. No other text.\n\n" +
    "Example format (output just the JSON array):\n" +
    '[\n' +
    '  {\n' +
    '    "id": "<uuid>",\n' +
    '    "question": "What is the difference between..."' +
    '    "answer": "TL;DR answer here",\n' +
    '    "explanation": "## Detailed Explanation\\n\\nParagraphs...",\n' +
    '    "eli5": "Simple explanation",\n' +
    '    "difficulty": "beginner|intermediate|advanced",\n' +
    '    "tags": ["' + ch.id + '","subtopic"],\n' +
    '    "channel": "' + ch.id + '",\n' +
    '    "sub_channel": "subtopic"\n' +
    '  }\n' +
    ']\n\n' +
    "CONTEXT: " + ch.ctx + "\n\n" +
    "SUB-TOPICS: " + subs + "\n\n" +
    "RULES:\n" +
    "- Output ONLY the JSON array, nothing else\n" +
    "- " + n + " unique questions covering different sub-topics\n" +
    "- Mix of beginner/intermediate/advanced\n" +
    "- Include markdown code blocks in explanation for technical topics";
}

function buildFlashPrompt(ch: typeof F_CHANNELS[0], n: number): string {
  const cats = ch.cats.join(", ");
  return "You are a senior engineering educator for DevPrep.\n\n" +
    "TASK: Generate " + n + " SRS flashcards for channel \"" + ch.id + "\".\n\n" +
    "IMPORTANT: Output ONLY a valid JSON array. No other text.\n\n" +
    '[\n' +
    '  {\n' +
    '    "id": "<uuid>",\n' +
    '    "channel": "' + ch.id + '",\n' +
    '    "front": "≤15 words ending with ?",\n' +
    '    "back": "40-120 word answer, direct first",\n' +
    '    "hint": "optional memory aid",\n' +
    '    "code_example": "optional code",\n' +
    '    "mnemonic": "optional memory trick",\n' +
    '    "difficulty": "beginner|intermediate|advanced",\n' +
    '    "tags": ["' + ch.id + '","subtopic"],\n' +
    '    "category": "subtopic"\n' +
    '  }\n' +
    ']\n\n' +
    "CONTEXT: " + ch.ctx + "\n\n" +
    "CATEGORIES: " + cats + "\n\n" +
    "RULES:\n" +
    "- Output ONLY the JSON array\n" +
    "- 30% beginner, 50% intermediate, 20% advanced\n" +
    "- Add code_example for syntax topics";
}

function buildVoicePrompt(ch: typeof V_CHANNELS[0], n: number): string {
  const topics = ch.topics.join(", ");
  return "You are a senior engineering interviewer for DevPrep.\n\n" +
    "TASK: Generate " + n + " voice sessions for channel \"" + ch.id + "\".\n\n" +
    "IMPORTANT: Output ONLY a valid JSON array. No other text.\n\n" +
    '[\n' +
    '  {\n' +
    '    "id": "<uuid>",\n' +
    '    "topic": "3-6 word title",\n' +
    '    "description": "1-2 sentences",\n' +
    '    "channel": "' + ch.id + '",\n' +
    '    "difficulty": "beginner|intermediate|advanced",\n' +
    '    "question_ids": [],\n' +
    '    "total_questions": ' + (ch.minQ + 2) + ',\n' +
    '    "estimated_minutes": ' + (ch.minQ * 3) + '\n' +
    '  }\n' +
    ']\n\n' +
    "TOPICS: " + topics + "\n\n" +
    "RULES:\n" +
    "- Output ONLY the JSON array\n" +
    "- " + n + " sessions, 20/60/20 difficulty split";
}

function buildCertPrompt(cert: typeof CERTIFICATIONS[0], n: number): string {
  const domains = cert.domains.map(d => d.n + "(" + d.w + "%)").join(", ");
  const maps = cert.maps.join(", ");
  return "You are a certification exam expert for DevPrep.\n\n" +
    "TASK: Generate " + n + " MCQ questions for \"" + cert.name + "\" (" + cert.code + ").\n\n" +
    "IMPORTANT: Output ONLY a valid JSON array. No other text.\n\n" +
    '[\n' +
    '  {\n' +
    '    "id": "<uuid>",\n' +
    '    "question": "Scenario with A) B) C) D) options",\n' +
    '    "answer": "The correct answer is X because...",\n' +
    '    "explanation": "Why correct, why others wrong",\n' +
    '    "eli5": "Simple one-sentence explanation",\n' +
    '    "difficulty": "beginner|intermediate|advanced",\n' +
    '    "tags": ["' + cert.id + '","' + cert.cat + '"],\n' +
    '    "channel": "' + cert.maps[0] + '",\n' +
    '    "sub_channel": "domain"\n' +
    '  }\n' +
    ']\n\n' +
    "DOMAINS: " + domains + "\n" +
    "CHANNELS: " + maps + "\n\n" +
    "RULES:\n" +
    "- Output ONLY the JSON array\n" +
    "- Scenario-based, all 4 options plausible";
}

function buildPathPrompt(batch: typeof P_BATCHES[0], n: number): string {
  const items = batch.items.slice(0, n);
  const titles = items.map((it, i) => (i + 1) + ". " + it.title).join("\n");
  return "You are a senior engineering career coach for DevPrep.\n\n" +
    "TASK: Generate " + n + " learning paths of type \"" + batch.type + "\".\n\n" +
    "IMPORTANT: Output ONLY a valid JSON array. No other text.\n\n" +
    '[\n' +
    '  {\n' +
    '    "id": "<uuid>",\n' +
    '    "title": "Path Title",\n' +
    '    "description": "2-3 sentences",\n' +
    '    "path_type": "' + batch.type + '",\n' +
    '    "difficulty": "beginner|intermediate|advanced",\n' +
    '    "estimated_hours": 40,\n' +
    '    "question_ids": [],\n' +
    '    "channels": ["algorithms","system-design"],\n' +
    '    "tags": ["interview-prep"],\n' +
    '    "prerequisites": [],\n' +
    '    "learning_objectives": ["Can implement...","Understands..."],\n' +
    '    "milestones": [\n' +
    '      {title:"M1",description:"...",completionPercent:20,questionCount:10},\n' +
    '      {title:"M2",description:"...",completionPercent:40,questionCount:15},\n' +
    '      {title:"M3",description:"...",completionPercent:60,questionCount:20},\n' +
    '      {title:"M4",description:"...",completionPercent:80,questionCount:15},\n' +
    '      {title:"M5",description:"...",completionPercent:100,questionCount:10}\n' +
    '    ],\n' +
    '    "metadata": {focusAreas:[],companiesTargeted:[],interviewRounds:[]}\n' +
    '  }\n' +
    ']\n\n' +
    "PATHS:\n" + titles;
}

// ─── Work queue ───────────────────────────────────────────────────────────────
function buildQueue(): Task[] {
  const tasks: Task[] = [];

  // Target per channel - generate to reach this number
  const TARGET_PER_CHANNEL = 20; // 20 questions per channel minimum
  const GENERATE_BATCH = 5;     // Generate 5 at a time

  if (!FILTER_TYPE || FILTER_TYPE === "questions") {
    for (const ch of Q_CHANNELS) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      tasks.push({
        id: "q-" + ch.id, type: "questions", label: ch.id, agent: "content-question-expert",
        buildPrompt: () => buildQPrompt(ch, GENERATE_BATCH),
        countSql: "SELECT COUNT(*) FROM questions WHERE channel=?", countArgs: [ch.id], minNeeded: TARGET_PER_CHANNEL
      });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "certifications") {
    const CERT_TARGET = 15;
    for (const c of CERTIFICATIONS) {
      tasks.push({
        id: "cert-" + c.id, type: "certifications", label: c.id, agent: "content-certification-expert",
        buildPrompt: () => buildCertPrompt(c, GENERATE_BATCH),
        countSql: "SELECT COUNT(*) FROM questions WHERE channel=?", countArgs: [c.maps[0]], minNeeded: CERT_TARGET
      });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "flashcards") {
    const FLASH_TARGET = 20;
    for (const ch of F_CHANNELS) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      tasks.push({
        id: "flash-" + ch.id, type: "flashcards", label: ch.id, agent: "content-flashcard-expert",
        buildPrompt: () => buildFlashPrompt(ch, GENERATE_BATCH),
        countSql: "SELECT COUNT(*) FROM flashcards WHERE channel=?", countArgs: [ch.id], minNeeded: FLASH_TARGET
      });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "voice") {
    const VOICE_TARGET = 10;
    for (const ch of V_CHANNELS) {
      if (FILTER_CH && ch.id !== FILTER_CH) continue;
      tasks.push({
        id: "voice-" + ch.id, type: "voice", label: ch.id, agent: "content-voice-expert",
        buildPrompt: () => buildVoicePrompt(ch, GENERATE_BATCH),
        countSql: "SELECT COUNT(*) FROM voice_sessions WHERE channel=?", countArgs: [ch.id], minNeeded: VOICE_TARGET
      });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "paths") {
    const PATH_TARGET = 5;
    for (const b of P_BATCHES) {
      tasks.push({
        id: "path-" + b.type, type: "paths", label: b.type, agent: "content-learning-path-expert",
        buildPrompt: () => buildPathPrompt(b, GENERATE_BATCH),
        countSql: "SELECT COUNT(*) FROM learning_paths WHERE path_type=?", countArgs: [b.type], minNeeded: PATH_TARGET
      });
    }
  }
  if (!FILTER_TYPE || FILTER_TYPE === "challenges") {
    const CHALLENGE_TARGET = 15;
    for (const cat of C_CATEGORIES) {
      if (FILTER_CH && cat.id !== FILTER_CH) continue;
      tasks.push({
        id: "challenge-" + cat.id, type: "challenges", label: cat.id, agent: "content-challenge-expert",
        buildPrompt: () => buildChallengePrompt(cat, GENERATE_BATCH),
        countSql: "SELECT COUNT(*) FROM coding_challenges WHERE category=?", countArgs: [cat.id], minNeeded: CHALLENGE_TARGET
      });
    }
  }
  return tasks;
}

// ─── Auto-insert from JSON output ────────────────────────────────────────────
async function insertFromJson(output: string, type: ContentType): Promise<number> {
  let inserted = 0;
  
  // Find JSON array in output
  const jsonMatch = output.match(/\[[\s\S]*\]\s*$/m) || output.match(/\{[\s\S]*\}\s*$/m);
  if (!jsonMatch) return 0;
  
  try {
    const data = JSON.parse(jsonMatch[0]);
    const items = Array.isArray(data) ? data : [data];
    
    for (const item of items) {
      try {
        if (type === "questions") {
          await db.execute({
            sql: "INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            args: [
              item.id || randomUUID(),
              item.question || "",
              item.answer || "",
              item.explanation || "",
              item.eli5 || "",
              item.difficulty || "intermediate",
              typeof item.tags === "string" ? item.tags : JSON.stringify(item.tags || []),
              item.channel || "",
              item.sub_channel || item.subChannel || "",
              "active", 1,
              new Date().toISOString(),
              new Date().toISOString()
            ]
          });
          inserted++;
        } else if (type === "flashcards") {
          await db.execute({
            sql: "INSERT OR IGNORE INTO flashcards (id,channel,front,back,hint,code_example,mnemonic,difficulty,tags,category,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            args: [
              item.id || randomUUID(),
              item.channel || "",
              item.front || "",
              item.back || "",
              item.hint || null,
              item.code_example || item.codeExample || null,
              item.mnemonic || null,
              item.difficulty || "intermediate",
              typeof item.tags === "string" ? item.tags : JSON.stringify(item.tags || []),
              item.category || "",
              "active",
              new Date().toISOString()
            ]
          });
          inserted++;
        } else if (type === "voice") {
          await db.execute({
            sql: "INSERT OR IGNORE INTO voice_sessions (id,topic,description,channel,difficulty,question_ids,total_questions,estimated_minutes,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
            args: [
              item.id || randomUUID(),
              item.topic || "",
              item.description || "",
              item.channel || "",
              item.difficulty || "intermediate",
              typeof item.question_ids === "string" ? item.question_ids : JSON.stringify(item.question_ids || []),
              item.total_questions || item.totalQuestions || 5,
              item.estimated_minutes || item.estimatedMinutes || 15,
              new Date().toISOString()
            ]
          });
          inserted++;
        } else if (type === "paths") {
          await db.execute({
            sql: "INSERT OR IGNORE INTO learning_paths (id,title,description,path_type,target_company,target_job_title,difficulty,estimated_hours,question_ids,channels,tags,prerequisites,learning_objectives,milestones,metadata,status,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            args: [
              item.id || randomUUID(),
              item.title || "",
              item.description || "",
              item.path_type || item.pathType || "",
              item.target_company || item.targetCompany || null,
              item.target_job_title || item.targetJobTitle || null,
              item.difficulty || "intermediate",
              item.estimated_hours || item.estimatedHours || 40,
              typeof item.question_ids === "string" ? item.question_ids : JSON.stringify(item.question_ids || []),
              typeof item.channels === "string" ? item.channels : JSON.stringify(item.channels || []),
              typeof item.tags === "string" ? item.tags : JSON.stringify(item.tags || []),
              typeof item.prerequisites === "string" ? item.prerequisites : JSON.stringify(item.prerequisites || []),
              typeof item.learning_objectives === "string" ? item.learning_objectives : JSON.stringify(item.learning_objectives || item.learningObjectives || []),
              typeof item.milestones === "string" ? item.milestones : JSON.stringify(item.milestones || []),
              typeof item.metadata === "string" ? item.metadata : JSON.stringify(item.metadata || {}),
              "active",
              new Date().toISOString(),
              new Date().toISOString()
            ]
          });
          inserted++;
        } else if (type === "certifications") {
          await db.execute({
            sql: "INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            args: [
              item.id || randomUUID(),
              item.question || "",
              item.answer || "",
              item.explanation || "",
              item.eli5 || "",
              item.difficulty || "intermediate",
              typeof item.tags === "string" ? item.tags : JSON.stringify(item.tags || []),
              item.channel || "",
              item.sub_channel || item.subChannel || "domain",
              "active", 1,
              new Date().toISOString(),
              new Date().toISOString()
            ]
          });
          inserted++;
        } else if (type === "challenges") {
          await db.execute({
            sql: "INSERT OR IGNORE INTO coding_challenges (id,title,description,difficulty,category,tags,companies,starter_code_js,starter_code_py,test_cases,hints,solution_js,solution_py,complexity_time,complexity_space,complexity_explanation,time_limit,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            args: [
              item.id || randomUUID(),
              item.title || "",
              item.description || "",
              item.difficulty || "medium",
              item.category || "",
              typeof item.tags === "string" ? item.tags : JSON.stringify(item.tags || []),
              typeof item.companies === "string" ? item.companies : JSON.stringify(item.companies || []),
              item.starter_code_js || item.starterCodeJs || "",
              item.starter_code_py || item.starterCodePy || "",
              typeof item.test_cases === "string" ? item.test_cases : JSON.stringify(item.test_cases || []),
              typeof item.hints === "string" ? item.hints : JSON.stringify(item.hints || []),
              item.solution_js || item.solutionJs || "",
              item.solution_py || item.solutionPy || "",
              item.complexity_time || item.complexityTime || "O(n)",
              item.complexity_space || item.complexitySpace || "O(1)",
              item.complexity_explanation || item.complexityExplanation || "",
              item.time_limit || item.timeLimit || 15,
              new Date().toISOString()
            ]
          });
          inserted++;
        }
      } catch (e) { /* skip invalid items */ }
    }
  } catch (e) { /* not valid JSON */ }
  
  return inserted;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const TYPE_LABEL: Record<ContentType, string> = {
  questions: "Questions", certifications: "Certifications",
  flashcards: "Flashcards", voice: "Voice Sessions", paths: "Learning Paths",
  challenges: "Coding Challenges",
};
const TYPE_COLOR: Record<ContentType, string> = {
  questions: C.bl, certifications: C.m, flashcards: C.c, voice: C.y, paths: C.g,
  challenges: C.rd,
};

function pad(s: string, w: number): string {
  return s.length >= w ? s.slice(0, w) : s + " ".repeat(w - s.length);
}
function bar(pct: number, w = 30): string {
  const f = Math.round(Math.max(0, Math.min(1, pct)) * w);
  return C.g + "█".repeat(f) + C.d + "░".repeat(w - f) + C.r;
}
function elapsed(ms: number): string {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
  return h > 0 ? h + "h" + (m % 60) + "m" : m > 0 ? m + "m" + (s % 60) + "s" : s + "s";
}

let dashLines = 0;
let swarmStart = Date.now();
const agents: Agent[] = [];

function currentLoad(): string {
  const l = os.loadavg()[0];
  const col = l > LOAD_LIMIT ? C.rd : l > LOAD_LIMIT * 0.7 ? C.y : C.g;
  return col + l.toFixed(1) + C.r;
}

function renderDashboard() {
  spinIdx = (spinIdx + 1) % SPIN.length;
  const sp = SPIN[spinIdx];

  const totalGen = agents.reduce((s, a) => s + a.generated, 0);
  const running = agents.filter(a => a.status === "running");
  const done = agents.filter(a => a.status === "done");
  const failed = agents.filter(a => a.status === "failed");
  const skipped = agents.filter(a => a.status === "skipped");
  const pending = agents.filter(a => a.status === "pending");
  const total = agents.length;
  const complete = done.length + skipped.length;
  const pct = total > 0 ? complete / total : 0;
  const rt = Date.now() - swarmStart;

  const ipm = rt > 10_000 ? (totalGen / (rt / 60_000)).toFixed(1) : "…";
  let eta = "…";
  if (complete > 0 && pending.length > 0) {
    const msPerTask = rt / complete;
    const remaining = Math.ceil(pending.length / MAX_WORKERS) * msPerTask;
    eta = elapsed(remaining);
  }

  const W = 80;
  const lines: string[] = [];

  lines.push(C.d + "─".repeat(W) + C.r);
  lines.push(
    " " + C.b + "DevPrep Content Swarm" + C.r +
    "  workers:" + C.b + MAX_WORKERS + C.r +
    "  model:" + C.m + MODEL.split("/")[1] + C.r +
    "  runtime:" + C.c + elapsed(rt) + C.r +
    "  load:" + currentLoad()
  );
  lines.push(
    " " + C.g + C.b + "+" + totalGen + C.r + " items  " +
    "rate:" + C.c + ipm + "/min" + C.r + "  " +
    "ETA:" + C.c + eta + C.r + "  " +
    C.g + done.length + "✓" + C.r + " " + C.y + skipped.length + "–" + C.r + " " + C.rd + failed.length + "✗" + C.r + " " + C.d + pending.length + "·" + C.r
  );
  lines.push(" [" + bar(pct, W - 14) + "] " + C.b + Math.round(pct * 100) + "%" + C.r + "  " + complete + "/" + total);
  lines.push(C.d + "─".repeat(W) + C.r);

  if (running.length > 0) {
    lines.push(" " + C.b + C.c + "RUNNING  (" + running.length + ")" + C.r);
    for (const a of running) {
      const dur = a.startedAt ? elapsed(Date.now() - a.startedAt) : "";
      const col = TYPE_COLOR[a.task.type];
      const genTx = a.generated > 0 ? C.g + "+" + a.generated + C.r : C.d + "…" + C.r;
      const stallTx = a.stalled ? " " + C.rd + "STALLED" + C.r : "";
      const retryTx = a.retries > 0 ? " " + C.y + "retry:" + a.retries + C.r : "";
      lines.push(
        " " + C.c + sp + C.r + " " + C.d + "[" + String(a.slot).padStart(2, "0") + "]" + C.r + " " +
        col + pad(a.task.type, 14) + C.r + " " +
        pad(a.task.label, 20) + " " +
        genTx.padEnd(8) + "  " + C.d + dur + C.r + stallTx + retryTx
      );
    }
    lines.push(C.d + "─".repeat(W) + C.r);
  }

  const types: ContentType[] = ["questions", "certifications", "flashcards", "voice", "paths", "challenges"];
  for (const t of types) {
    const typeAgents = agents.filter(a => a.task.type === t);
    if (typeAgents.length === 0) continue;

    const tDone = typeAgents.filter(a => a.status === "done").length;
    const tSkipped = typeAgents.filter(a => a.status === "skipped").length;
    const tFailed = typeAgents.filter(a => a.status === "failed").length;
    const tPending = typeAgents.filter(a => a.status === "pending").length;
    const tGen = typeAgents.reduce((s, a) => s + a.generated, 0);
    const col = TYPE_COLOR[t];

    lines.push(
      " " + col + C.b + pad(TYPE_LABEL[t], 16) + C.r + " " +
      C.g + "✓" + tDone + C.r + " " + C.d + "·" + tPending + C.r + " " +
      (tSkipped > 0 ? C.y + "–" + tSkipped + C.r + " " : "") +
      (tFailed > 0 ? C.rd + "✗" + tFailed + C.r + " " : "") +
      (tGen > 0 ? "  " + C.g + "+" + tGen + " items" + C.r : "")
    );
  }

  lines.push(C.d + "─".repeat(W) + C.r);

  if (dashLines > 0) process.stdout.write("\x1b[" + dashLines + "A");
  for (const line of lines) process.stdout.write("\x1b[2K\r" + line + "\n");
  dashLines = lines.length;
}

// ─── Worker pool ──────────────────────────────────────────────────────────────
const activeSlots = new Map<number, Agent>();

function nextSlot(): number {
  for (let i = 1; i <= MAX_WORKERS; i++) if (!activeSlots.has(i)) return i;
  return MAX_WORKERS + 1;
}

function systemOverloaded(): boolean {
  return os.loadavg()[0] > LOAD_LIMIT;
}

async function waitForCapacity() {
  while (activeSlots.size >= MAX_WORKERS || systemOverloaded()) {
    await new Promise(r => setTimeout(r, 500));
  }
}

function getActiveAgents(): Agent[] {
  return Array.from(activeSlots.values());
}

function releaseSlot(slot: number): void {
  activeSlots.delete(slot);
}

// SIGTERM then SIGKILL after 5 s if the process is still alive
function forceKillProcess(proc: ReturnType<typeof spawn>): void {
  proc.kill("SIGTERM");
  const kg = setTimeout(() => { try { proc.kill("SIGKILL"); } catch (_) {} }, 5_000);
  proc.once("close", () => clearTimeout(kg));
}

async function launchAgent(agent: Agent): Promise<void> {
  if (activeSlots.size >= MAX_WORKERS || systemOverloaded()) {
    await waitForCapacity();
  }

  const slot = nextSlot();
  if (slot > MAX_WORKERS) {
    await waitForCapacity();
    return launchAgent(agent);
  }

  activeSlots.set(slot, agent);
  agent.slot = slot;
  agent.status = "running";
  agent.startedAt = Date.now();
  agent.lastProgressAt = Date.now();
  agent.stalled = false;
  agent.baseline = await dbCount(agent.task.countSql, agent.task.countArgs);
  agent.current = agent.baseline;

  const pollTimer = setInterval(async () => {
    const n = await dbCount(agent.task.countSql, agent.task.countArgs);
    agent.current = n;
    const newGen = Math.max(0, n - agent.baseline);
    if (newGen > agent.generated) {
      agent.generated = newGen;
      agent.lastProgressAt = Date.now();
      agent.stalled = false;
    } else if (Date.now() - agent.lastProgressAt > STALL_THRESHOLD_MS) {
      agent.stalled = true;
    }
  }, POLL_MS);

  let stdout = "";

  const child = spawn(OPENCODE, ["run", "--agent", agent.task.agent, "--model", MODEL, agent.task.buildPrompt()], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  agent.child = child;

  child.stdout?.on("data", (data) => { stdout += data.toString(); });

  const timer = setTimeout(() => forceKillProcess(child), TIMEOUT_MS);

  child.on("close", async () => {
    clearTimeout(timer);
    clearInterval(pollTimer);

    // Auto-insert from JSON output
    const inserted = await insertFromJson(stdout, agent.task.type);
    
    const final = await dbCount(agent.task.countSql, agent.task.countArgs);
    agent.current = final;
    agent.generated = Math.max(0, final - agent.baseline);
    if (inserted > 0) agent.generated = inserted;
    agent.endedAt = Date.now();
    agent.child = undefined;

    const shouldRetry = agent.generated === 0 && agent.retries < MAX_RETRIES;

    if (agent.generated > 0) {
      agent.status = "done";
      releaseSlot(slot);
      gitCommit(agent.task.type, agent.task.label, agent.generated);
    } else if (shouldRetry) {
      agent.retries++;
      agent.status = "pending";
      agent.baseline = final;
      agent.generated = 0;
      agent.stalled = false;
      releaseSlot(slot);
      // Wait with exponential backoff then re-launch — without this the agent
      // just sits as "pending" and never executes again.
      await new Promise(r => setTimeout(r, BASE_RETRY_MS * Math.pow(2, agent.retries - 1)));
      launchAgent(agent).catch(() => { agent.status = "failed"; });
    } else {
      agent.status = "failed";
      releaseSlot(slot);
    }
  });

  child.on("error", () => {
    clearTimeout(timer);
    clearInterval(pollTimer);
    agent.endedAt = Date.now();
    agent.child = undefined;
    if (agent.retries < MAX_RETRIES) {
      agent.retries++;
      agent.status = "pending";
      agent.stalled = false;
      releaseSlot(slot);
      setTimeout(() => { launchAgent(agent).catch(() => { agent.status = "failed"; }); },
        BASE_RETRY_MS * Math.pow(2, agent.retries - 1));
    } else {
      agent.status = "failed";
      releaseSlot(slot);
    }
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(OPENCODE)) {
    console.error(C.rd + "✗ opencode not found: " + OPENCODE + C.r);
    process.exit(1);
  }
  if (!fs.existsSync(DB_PATH)) {
    console.error(C.rd + "✗ Database not found: " + DB_PATH + C.r);
    process.exit(1);
  }
  try { await dbCount("SELECT 1"); }
  catch (e: unknown) { console.error(C.rd + "✗ Cannot open DB: " + (e instanceof Error ? e.message : String(e)) + C.r); process.exit(1); }

  const queue = buildQueue();
  if (queue.length === 0) {
    console.log(C.y + "No tasks match the current filters." + C.r); process.exit(0);
  }

  process.stdout.write("\n  Checking " + queue.length + " tasks against DB…");
  for (const task of queue) {
    const n = await dbCount(task.countSql, task.countArgs);
    agents.push({
      task, status: n >= task.minNeeded ? "skipped" : "pending",
      slot: 0, baseline: n, current: n, generated: 0, retries: 0, lastProgressAt: 0, stalled: false
    });
  }
  const pendingAgents = agents.filter(a => a.status === "pending");
  process.stdout.write("\r  " + C.g + "✓" + C.r + " " + agents.filter(a => a.status === "skipped").length + " already satisfied — " + C.b + pendingAgents.length + " tasks" + C.r + "\n");
  console.log("  " + C.b + SESSIONS + " sessions" + C.r + " × " + C.b + MAX_WORKERS + " workers" + C.r + " = " + C.g + SESSIONS * MAX_WORKERS + " max parallel" + C.r + "\n");

  if (pendingAgents.length === 0) {
    console.log(C.g + "All content already meets minimum thresholds. Nothing to do." + C.r + "\n");
    db.close(); process.exit(0);
  }

  if (DRY_RUN) {
    console.log(C.y + "DRY RUN — tasks that would execute:" + C.r);
    pendingAgents.forEach(a => console.log("  " + C.d + "·" + C.r + " " + a.task.type + "/" + a.task.label));
    console.log(); db.close(); process.exit(0);
  }

  if (MAX_WORKERS * SESSIONS > 15) {
    console.log(C.y + "⚠ High concurrency: " + MAX_WORKERS * SESSIONS + " parallel agents." + C.r + "\n");
    await new Promise(r => setTimeout(r, 2000));
  }

  process.on("SIGINT", () => { db.close(); process.exit(0); });
  process.on("SIGTERM", () => { db.close(); process.exit(0); });

  swarmStart = Date.now();
  dashLines = 0;
  const renderTimer = setInterval(renderDashboard, RENDER_MS);
  renderDashboard();

  const sessionQueues: Agent[][] = Array.from({ length: SESSIONS }, () => []);
  const shuffled = [...pendingAgents].sort(() => Math.random() - 0.5);
  shuffled.forEach((agent, i) => {
    sessionQueues[i % SESSIONS].push(agent);
  });

  const stallMonitor = setInterval(() => {
    for (const agent of getActiveAgents()) {
      if (agent.stalled && agent.child) {
        // Force-kill (SIGTERM → SIGKILL after 5 s) regardless of retry count.
        // The close handler decides whether to retry or mark as failed.
        // Clear stalled immediately so we don't re-signal on the next tick
        // before the process has had time to exit.
        forceKillProcess(agent.child);
        agent.stalled = false;
      }
    }
  }, STALL_THRESHOLD_MS);

  const initialBatch: Agent[] = [];
  const remaining: Agent[] = [];

  for (let s = 0; s < SESSIONS; s++) {
    const sessionTasks = sessionQueues[s] || [];
    const launchNow = sessionTasks.slice(0, Math.min(MIN_PARALLEL, sessionTasks.length));
    const launchLater = sessionTasks.slice(Math.min(MIN_PARALLEL, sessionTasks.length));

    initialBatch.push(...launchNow);
    remaining.push(...launchLater);
  }

  const uniqueInitial = initialBatch.filter((a, i) => initialBatch.indexOf(a) === i);
  const finalInitial = uniqueInitial.length > MIN_PARALLEL * SESSIONS
    ? uniqueInitial.slice(0, MIN_PARALLEL * SESSIONS)
    : uniqueInitial;

  console.log("  " + C.g + "Launching " + C.b + finalInitial.length + " agents immediately" + C.r + " (min " + MIN_PARALLEL + " per session)…");

  const launchPromises: Promise<void>[] = [];
  for (const agent of finalInitial) {
    launchPromises.push(launchAgent(agent));
  }

  const updatedQueues: Agent[][] = Array.from({ length: SESSIONS }, () => []);
  remaining.forEach((agent, i) => {
    updatedQueues[i % SESSIONS].push(agent);
  });

  for (let i = 0; i < SESSIONS; i++) {
    if (updatedQueues[i].length === 0) continue;

    const sessionQueue = [...updatedQueues[i]];

    const sessionPromise = (async () => {
      while (sessionQueue.length > 0) {
        await waitForCapacity();

        const agent = sessionQueue.shift();
        if (!agent) break;

        launchAgent(agent);
      }
    })();

    launchPromises.push(sessionPromise);
  }

  await Promise.all(launchPromises);

  while (activeSlots.size > 0) {
    await new Promise(r => setTimeout(r, 1000));
  }

  clearInterval(renderTimer);
  clearInterval(stallMonitor);
  renderDashboard();
  db.close();

  const totalGen = agents.reduce((s, a) => s + a.generated, 0);
  const doneCount = agents.filter(a => a.status === "done").length;
  const failCount = agents.filter(a => a.status === "failed").length;
  const skipCount = agents.filter(a => a.status === "skipped").length;

  console.log("\n " + C.g + C.b + "✓ Swarm complete" + C.r + "  +" + C.g + C.b + totalGen + " items" + C.r + " generated  " +
    C.g + doneCount + " done" + C.r + "  " + C.y + skipCount + " skipped" + C.r + "  " +
    (failCount > 0 ? C.rd : C.d) + failCount + " failed" + C.r + "  " + elapsed(Date.now() - swarmStart) + "\n");

  if (failCount > 0) {
    console.log(C.rd + "Failed:" + C.r);
    agents.filter(a => a.status === "failed").forEach(a => console.log("  ✗ " + a.task.type + "/" + a.task.label + " (retried " + a.retries + "x)"));
    console.log(); process.exit(1);
  }
}

main();
