#!/usr/bin/env npx tsx
/**
 * DevPrep Voice Session Generation Pipeline
 *
 * Uses opencode run --agent content-voice-expert to generate
 * pre-built voice interview sessions grouped by channel.
 * Sessions reference existing question IDs from the database.
 *
 * Usage:
 *   npx tsx scripts/generate-voice-sessions-pipeline.ts
 *   npx tsx scripts/generate-voice-sessions-pipeline.ts --channel=algorithms
 *   npx tsx scripts/generate-voice-sessions-pipeline.ts --min=5
 */

import { execSync, spawnSync } from "child_process";
import * as fs from "fs";

const OPENCODE =
  "/home/runner/workspace/.config/npm/node_global/bin/opencode";
const API_BASE = "http://localhost:5000";
const MIN_SESSIONS = parseInt(
  process.argv.find((a) => a.startsWith("--min="))?.split("=")[1] ?? "5"
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
const log  = (msg: string) => console.log(`${C.blue}[${ts()}]${C.reset} ${msg}`);
const ok   = (msg: string) => console.log(`${C.green}[${ts()}] ✓${C.reset} ${msg}`);
const warn = (msg: string) => console.log(`${C.yellow}[${ts()}] ⚠${C.reset} ${msg}`);
const err  = (msg: string) => console.log(`${C.red}[${ts()}] ✗${C.reset} ${msg}`);
const info = (msg: string) => console.log(`${C.cyan}[${ts()}] →${C.reset} ${msg}`);

interface ChannelConfig {
  id: string;
  target: number;
  questionsPerSession: [number, number]; // [min, max]
  topics: string[];
}

const CHANNELS: ChannelConfig[] = [
  {
    id: "algorithms",
    target: 20,
    questionsPerSession: [5, 10],
    topics: ["sorting-algorithms", "graph-traversal", "dynamic-programming", "binary-search", "greedy-algorithms"],
  },
  {
    id: "system-design",
    target: 15,
    questionsPerSession: [5, 8],
    topics: ["url-shortener", "distributed-cache", "message-queue", "api-gateway", "rate-limiter"],
  },
  {
    id: "frontend",
    target: 15,
    questionsPerSession: [5, 8],
    topics: ["react-hooks", "javascript-closures", "browser-rendering", "web-performance", "typescript"],
  },
  {
    id: "backend",
    target: 15,
    questionsPerSession: [5, 8],
    topics: ["rest-api-design", "authentication", "caching-strategies", "microservices", "database-design"],
  },
  {
    id: "behavioral",
    target: 30,
    questionsPerSession: [3, 5],
    topics: ["leadership", "conflict-resolution", "failure-handling", "teamwork", "decision-making"],
  },
  {
    id: "devops",
    target: 10,
    questionsPerSession: [5, 8],
    topics: ["ci-cd-pipeline", "docker-kubernetes", "infrastructure-as-code", "monitoring", "incident-response"],
  },
];

function getSessionCount(channel: string): number {
  try {
    const result = execSync(
      `curl -s "${API_BASE}/api/voice-sessions/${channel}"`,
      { encoding: "utf8", timeout: 10_000 }
    );
    const data = JSON.parse(result);
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

function getExistingQuestionIds(channel: string): string[] {
  try {
    const result = execSync(
      `curl -s "${API_BASE}/api/questions/${channel}?limit=200"`,
      { encoding: "utf8", timeout: 10_000 }
    );
    const data = JSON.parse(result);
    return Array.isArray(data) ? data.map((q: { id: string }) => q.id) : [];
  } catch {
    return [];
  }
}

function buildPrompt(ch: ChannelConfig, needed: number, existingIds: string[]): string {
  const seedFile = `scripts/temp-seed-voice-${ch.id}.ts`;
  const idsJson = JSON.stringify(existingIds.slice(0, 100));
  const [minQ, maxQ] = ch.questionsPerSession;

  return `You are a senior engineering interviewer building voice interview sessions for DevPrep, a technical interview prep platform.

TASK: Generate exactly ${needed} voice interview sessions for the "${ch.id}" channel and INSERT them into the local SQLite database.

━━━ IMPORTANT: Script must live in the WORKSPACE directory (not /tmp) ━━━
Working directory: /home/runner/workspace
Seed script path: ${seedFile}

━━━ STEP 1: Create ${seedFile} with this EXACT structure ━━━

\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";

const client = createClient({ url: "file:local.db" });

// Existing question IDs to reference (pick ${minQ}-${maxQ} per session)
const existingQuestionIds: string[] = ${idsJson};

const sessions = [
  // ${needed} session objects here — see shape below
];

async function main() {
  console.log("Seeding ${needed} voice sessions for ${ch.id}...");
  for (const s of sessions) {
    await client.execute({
      sql: \`INSERT OR IGNORE INTO voice_sessions (id, topic, description, channel, difficulty, question_ids, total_questions, estimated_minutes, created_at) VALUES (?,?,?,?,?,?,?,?,?)\`,
      args: [s.id, s.topic, s.description, s.channel, s.difficulty, s.questionIds, s.totalQuestions, s.estimatedMinutes, s.createdAt],
    });
    console.log("Inserted:", s.topic);
  }
  client.close();
  console.log("Done!");
}
main().catch(e => { console.error(e.message); process.exit(1); });
\`\`\`

━━━ SESSION OBJECT SHAPE ━━━
{
  id: crypto.randomUUID(),
  topic: "...",              // Session title, e.g. "Sorting Algorithms Deep Dive"
  description: "...",        // 1-2 sentences describing what this session covers
  channel: "${ch.id}",
  difficulty: "beginner" | "intermediate" | "advanced",
  questionIds: JSON.stringify([/* pick ${minQ}-${maxQ} IDs from existingQuestionIds, or use empty array if none exist */]),
  totalQuestions: ${minQ + 2},    // actual count of questionIds selected
  estimatedMinutes: 15,    // ${minQ * 3}-${maxQ * 4} minutes
  createdAt: new Date().toISOString(),
}

━━━ SESSION TOPICS for "${ch.id}" ━━━
Cover these different topics (one per session, vary difficulty):
${ch.topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}
Generate ${needed} sessions total, cycling through these topics with beginner/intermediate/advanced variations.

━━━ QUALITY REQUIREMENTS ━━━
- Each session must cover a FOCUSED sub-topic (not generic)
- topic: 3-6 words, descriptive
- description: explain what interviewer will assess in this session
- Distribute difficulty: ~20% beginner, 60% intermediate, 20% advanced
- Use real IDs from existingQuestionIds — if empty, use an empty array for questionIds

━━━ STEP 2: Run the script ━━━
npx tsx ${seedFile}

━━━ STEP 3: Verify it worked ━━━
curl -s "http://localhost:5000/api/voice-sessions/${ch.id}" | python3 -c "import json,sys; d=json.load(sys.stdin); print('${ch.id}:', len(d) if isinstance(d,list) else d, 'sessions now in DB')"

━━━ STEP 4: Clean up ━━━
rm -f ${seedFile}`;
}

function generateForChannel(ch: ChannelConfig, needed: number, existingIds: string[]): boolean {
  const prompt = buildPrompt(ch, needed, existingIds);
  const promptFile = `/tmp/prompt-voice-${ch.id}.txt`;
  fs.writeFileSync(promptFile, prompt, "utf8");

  info(`Running opencode for: ${ch.id} (${needed} sessions needed)`);

  const result = spawnSync(
    OPENCODE,
    ["run", "--agent", "content-voice-expert", prompt],
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
  console.log("  DevPrep Voice Session Generation Pipeline");
  console.log(`  Target: ≥${MIN_SESSIONS} sessions per channel`);
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
    const current = getSessionCount(ch.id);
    log(`${ch.id}: ${current} voice sessions in DB (target: ${ch.target})`);

    if (current >= MIN_SESSIONS) {
      warn(`${ch.id} — already has ${current} ≥ ${MIN_SESSIONS}, skipping`);
      results.push({ channel: ch.id, status: "skip" });
      continue;
    }

    const existingIds = getExistingQuestionIds(ch.id);
    log(`${ch.id}: found ${existingIds.length} existing question IDs to reference`);

    const needed = Math.min(ch.target - current, 20); // max 20 per run
    const success = generateForChannel(ch, needed, existingIds);
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
