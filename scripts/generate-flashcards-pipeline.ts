#!/usr/bin/env npx tsx
/**
 * DevPrep Flashcard Generation Pipeline
 *
 * Uses opencode run --agent content-flashcard-expert to generate
 * spaced-repetition flashcards for every channel that has fewer
 * than MIN_CARDS flashcards in the database.
 *
 * Usage:
 *   npx tsx scripts/generate-flashcards-pipeline.ts
 *   npx tsx scripts/generate-flashcards-pipeline.ts --channel=algorithms
 *   npx tsx scripts/generate-flashcards-pipeline.ts --min=20
 */

import { execSync, spawnSync } from "child_process";
import * as fs from "fs";

const OPENCODE =
  "/home/runner/workspace/.config/npm/node_global/bin/opencode";
const API_BASE = "http://localhost:5000";
const MIN_CARDS = parseInt(
  process.argv.find((a) => a.startsWith("--min="))?.split("=")[1] ?? "100"
);
const SINGLE_CHANNEL = process.argv
  .find((a) => a.startsWith("--channel="))
  ?.split("=")[1];
const TIMEOUT_SECS = 240;

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
const ok  = (msg: string) => console.log(`${C.green}[${ts()}] ✓${C.reset} ${msg}`);
const warn = (msg: string) => console.log(`${C.yellow}[${ts()}] ⚠${C.reset} ${msg}`);
const err  = (msg: string) => console.log(`${C.red}[${ts()}] ✗${C.reset} ${msg}`);
const info = (msg: string) => console.log(`${C.cyan}[${ts()}] →${C.reset} ${msg}`);

interface ChannelConfig {
  id: string;
  target: number;
  context: string;
  categories: string[];
}

const CHANNELS: ChannelConfig[] = [
  {
    id: "algorithms",
    target: 200,
    context: "Sorting, searching, graph traversal, dynamic programming, greedy algorithms. Include Big-O complexity in answers.",
    categories: ["sorting", "searching", "graph-algorithms", "dynamic-programming", "greedy"],
  },
  {
    id: "system-design",
    target: 100,
    context: "Distributed systems, caching, load balancing, databases, API design, scalability patterns.",
    categories: ["distributed-systems", "caching", "databases", "api-design", "scalability"],
  },
  {
    id: "frontend",
    target: 100,
    context: "React hooks, virtual DOM, browser event loop, JavaScript closures, CSS, web performance, TypeScript.",
    categories: ["react", "javascript", "css", "browser-internals", "performance"],
  },
  {
    id: "backend",
    target: 100,
    context: "REST API design, authentication, caching, message queues, microservices, error handling.",
    categories: ["api-design", "authentication", "caching", "microservices", "databases"],
  },
  {
    id: "database",
    target: 80,
    context: "SQL joins, indexing, transactions, ACID, query optimization, normalization, NoSQL vs SQL.",
    categories: ["sql", "indexing", "transactions", "nosql", "query-optimization"],
  },
  {
    id: "devops",
    target: 80,
    context: "CI/CD pipelines, Docker, Kubernetes, Infrastructure as Code, monitoring, deployment strategies.",
    categories: ["ci-cd", "docker", "kubernetes", "iac", "monitoring"],
  },
  {
    id: "security",
    target: 60,
    context: "OWASP Top 10, SQL injection, XSS, CSRF, authentication, authorization, HTTPS/TLS.",
    categories: ["web-security", "authentication", "cryptography", "owasp"],
  },
  {
    id: "machine-learning",
    target: 60,
    context: "Supervised vs unsupervised learning, bias-variance tradeoff, gradient descent, evaluation metrics, neural networks.",
    categories: ["supervised-learning", "model-evaluation", "neural-networks", "feature-engineering"],
  },
  {
    id: "generative-ai",
    target: 60,
    context: "LLMs, transformers architecture, RAG, fine-tuning, embeddings, vector databases, prompt engineering.",
    categories: ["llms", "rag", "fine-tuning", "embeddings", "transformer-architecture"],
  },
];

function getFlashcardCount(channel: string): number {
  try {
    const result = execSync(
      `curl -s "${API_BASE}/api/flashcards/${channel}?limit=500"`,
      { encoding: "utf8", timeout: 10_000 }
    );
    const data = JSON.parse(result);
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

function buildPrompt(ch: ChannelConfig, needed: number): string {
  const seedFile = `scripts/temp-seed-flashcards-${ch.id}.ts`;
  return `You are a senior engineering educator building spaced-repetition flashcards for DevPrep, a technical interview prep platform.

TASK: Generate exactly ${needed} high-quality SRS flashcards for the "${ch.id}" channel and INSERT them into the local SQLite database.

━━━ IMPORTANT: Script must live in the WORKSPACE directory (not /tmp) ━━━
Working directory: /home/runner/workspace
Seed script path: ${seedFile}

━━━ STEP 1: Create ${seedFile} with this EXACT structure ━━━

\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";

const client = createClient({ url: "file:local.db" });

const flashcards = [
  // ${needed} flashcard objects here — see shape below
];

async function main() {
  console.log("Seeding ${needed} flashcards for ${ch.id}...");
  for (const f of flashcards) {
    await client.execute({
      sql: \`INSERT OR IGNORE INTO flashcards (id, channel, front, back, hint, code_example, mnemonic, difficulty, tags, category, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [f.id, f.channel, f.front, f.back, f.hint ?? null, f.codeExample ?? null, f.mnemonic ?? null, f.difficulty, f.tags, f.category, "active", f.createdAt],
    });
    console.log("Inserted:", f.front.slice(0, 60));
  }
  client.close();
  console.log("Done!");
}
main().catch(e => { console.error(e.message); process.exit(1); });
\`\`\`

━━━ FLASHCARD OBJECT SHAPE ━━━
{
  id: crypto.randomUUID(),
  channel: "${ch.id}",
  front: "...",          // Question/concept, ≤15 words, must end with "?"
  back: "...",           // Answer: 40-120 words, direct answer first then elaboration
  hint: "...",           // Optional: 1-sentence memory aid
  codeExample: "...",    // Optional: short code snippet (backtick-fenced)
  mnemonic: "...",       // Optional: memory trick
  difficulty: "beginner" | "intermediate" | "advanced",
  tags: JSON.stringify(["${ch.id}", "subtopic"]),
  category: "<one of: ${ch.categories.join(", ")}>",
  createdAt: new Date().toISOString(),
}

━━━ CHANNEL CONTEXT for "${ch.id}" ━━━
${ch.context}

━━━ QUALITY REQUIREMENTS ━━━
- Front: Specific concept or question (not generic like "What is X?")
- Back: Direct answer at start, then 2-3 elaborating sentences
- Cover DIFFERENT topics within: ${ch.categories.join(", ")}
- Difficulty distribution: 30% beginner, 50% intermediate, 20% advanced
- Add codeExample for any card that involves syntax or implementation

━━━ STEP 2: Run the script ━━━
npx tsx ${seedFile}

━━━ STEP 3: Verify it worked ━━━
curl -s "http://localhost:5000/api/flashcards/${ch.id}?limit=500" | python3 -c "import json,sys; d=json.load(sys.stdin); print('${ch.id}:', len(d) if isinstance(d,list) else d, 'flashcards now in DB')"

━━━ STEP 4: Clean up ━━━
rm -f ${seedFile}`;
}

function generateForChannel(ch: ChannelConfig, needed: number): boolean {
  const prompt = buildPrompt(ch, needed);
  const promptFile = `/tmp/prompt-flashcards-${ch.id}.txt`;
  fs.writeFileSync(promptFile, prompt, "utf8");

  info(`Running opencode for: ${ch.id} (${needed} flashcards needed)`);

  const result = spawnSync(
    OPENCODE,
    ["run", "--agent", "content-flashcard-expert", prompt],
    {
      timeout: TIMEOUT_SECS * 1000,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  fs.rmSync(promptFile, { force: true });

  if (result.status === 0) {
    ok(`${ch.id} — opencode completed`);
    return true;
  } else if (result.signal === "SIGTERM") {
    warn(`${ch.id} — timed out after ${TIMEOUT_SECS}s`);
    return false;
  } else {
    err(`${ch.id} — failed (exit ${result.status})`);
    const output = ((result.stdout || "") + (result.stderr || "")).trim().split("\n");
    output.slice(-5).forEach((l) => console.log(`    ${l}`));
    return false;
  }
}

async function main() {
  console.log("\n" + "═".repeat(62));
  console.log("  DevPrep Flashcard Generation Pipeline");
  console.log(`  Target: ≥${MIN_CARDS} flashcards per channel`);
  if (SINGLE_CHANNEL) {
    console.log(`  Mode: single channel → ${SINGLE_CHANNEL}`);
  } else {
    console.log(`  Channels: ${CHANNELS.length} channels`);
  }
  console.log("═".repeat(62) + "\n");

  if (!fs.existsSync(OPENCODE)) {
    err(`opencode not found at ${OPENCODE}`);
    process.exit(1);
  }

  try {
    execSync(`curl -s "${API_BASE}/api/channels" > /dev/null`, { timeout: 5000 });
  } catch {
    err(`API not reachable at ${API_BASE} — is the dev server running?`);
    process.exit(1);
  }

  const channelsToProcess = SINGLE_CHANNEL
    ? CHANNELS.filter((c) => c.id === SINGLE_CHANNEL)
    : CHANNELS;

  if (SINGLE_CHANNEL && channelsToProcess.length === 0) {
    err(`Unknown channel: ${SINGLE_CHANNEL}`);
    err(`Available: ${CHANNELS.map((c) => c.id).join(", ")}`);
    process.exit(1);
  }

  const results: { channel: string; status: "ok" | "skip" | "fail" }[] = [];

  for (const ch of channelsToProcess) {
    const current = getFlashcardCount(ch.id);
    log(`${ch.id}: ${current} flashcards in DB (target: ${ch.target})`);

    if (current >= MIN_CARDS) {
      warn(`${ch.id} — already has ${current} ≥ ${MIN_CARDS}, skipping`);
      results.push({ channel: ch.id, status: "skip" });
      continue;
    }

    const needed = Math.min(ch.target - current, 50); // max 50 per run
    const success = generateForChannel(ch, needed);
    results.push({ channel: ch.id, status: success ? "ok" : "fail" });
  }

  console.log("\n" + "═".repeat(62));
  console.log("  Summary");
  console.log("═".repeat(62));
  for (const r of results) {
    const icon = r.status === "ok" ? "✓" : r.status === "skip" ? "–" : "✗";
    const color = r.status === "ok" ? C.green : r.status === "skip" ? C.yellow : C.red;
    console.log(`  ${color}${icon}${C.reset} ${r.channel} → ${r.status}`);
  }
  console.log("═".repeat(62) + "\n");
}

main();
