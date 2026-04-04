#!/usr/bin/env npx tsx
/**
 * DevPrep Learning Path Generation Pipeline
 *
 * Uses opencode run --agent content-learning-path-expert to generate
 * structured interview prep learning paths (company, job-title, skill,
 * certification) and insert them into the local SQLite database.
 *
 * Usage:
 *   npx tsx scripts/generate-learning-paths-pipeline.ts
 *   npx tsx scripts/generate-learning-paths-pipeline.ts --type=company
 *   npx tsx scripts/generate-learning-paths-pipeline.ts --type=job-title
 *   npx tsx scripts/generate-learning-paths-pipeline.ts --min=5
 */

import { execSync, spawnSync } from "child_process";
import * as fs from "fs";

const OPENCODE =
  "/home/runner/workspace/.config/npm/node_global/bin/opencode";
const API_BASE = "http://localhost:5000";
const MIN_PATHS = parseInt(
  process.argv.find((a) => a.startsWith("--min="))?.split("=")[1] ?? "5"
);
const SINGLE_TYPE = process.argv
  .find((a) => a.startsWith("--type="))
  ?.split("=")[1] as PathType | undefined;
const TIMEOUT_SECS = 300;

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

type PathType = "company" | "job-title" | "skill" | "certification";

interface PathBatch {
  type: PathType;
  target: number;
  items: PathItem[];
}

interface PathItem {
  title: string;
  targetCompany?: string;
  targetJobTitle?: string;
  channels: string[];
  difficulty: string;
  estimatedHours: number;
}

const PATH_BATCHES: PathBatch[] = [
  {
    type: "company",
    target: 20,
    items: [
      { title: "Google SWE Interview Prep", targetCompany: "Google", channels: ["algorithms", "system-design", "behavioral"], difficulty: "advanced", estimatedHours: 80 },
      { title: "Amazon SWE Interview Prep", targetCompany: "Amazon", channels: ["algorithms", "system-design", "behavioral"], difficulty: "advanced", estimatedHours: 80 },
      { title: "Meta SWE Interview Prep", targetCompany: "Meta", channels: ["algorithms", "system-design", "behavioral"], difficulty: "advanced", estimatedHours: 80 },
      { title: "Apple SWE Interview Prep", targetCompany: "Apple", channels: ["algorithms", "system-design", "behavioral"], difficulty: "advanced", estimatedHours: 60 },
      { title: "Netflix SWE Interview Prep", targetCompany: "Netflix", channels: ["system-design", "behavioral"], difficulty: "advanced", estimatedHours: 60 },
      { title: "Microsoft SWE Interview Prep", targetCompany: "Microsoft", channels: ["algorithms", "system-design", "behavioral"], difficulty: "intermediate", estimatedHours: 60 },
      { title: "Stripe Engineering Interview", targetCompany: "Stripe", channels: ["backend", "system-design", "database"], difficulty: "advanced", estimatedHours: 60 },
      { title: "Airbnb Engineering Interview", targetCompany: "Airbnb", channels: ["frontend", "backend", "system-design"], difficulty: "intermediate", estimatedHours: 50 },
      { title: "Uber Engineering Interview", targetCompany: "Uber", channels: ["system-design", "backend", "algorithms"], difficulty: "advanced", estimatedHours: 60 },
      { title: "LinkedIn Engineering Interview", targetCompany: "LinkedIn", channels: ["algorithms", "system-design", "behavioral"], difficulty: "intermediate", estimatedHours: 50 },
    ],
  },
  {
    type: "job-title",
    target: 15,
    items: [
      { title: "Frontend Engineer Path", targetJobTitle: "frontend-engineer", channels: ["frontend", "javascript", "algorithms"], difficulty: "intermediate", estimatedHours: 60 },
      { title: "Backend Engineer Path", targetJobTitle: "backend-engineer", channels: ["backend", "database", "system-design"], difficulty: "intermediate", estimatedHours: 60 },
      { title: "Full-Stack Engineer Path", targetJobTitle: "fullstack-engineer", channels: ["frontend", "backend", "database"], difficulty: "intermediate", estimatedHours: 80 },
      { title: "Site Reliability Engineer Path", targetJobTitle: "sre", channels: ["sre", "devops", "system-design"], difficulty: "advanced", estimatedHours: 80 },
      { title: "DevOps Engineer Path", targetJobTitle: "devops-engineer", channels: ["devops", "kubernetes", "terraform"], difficulty: "intermediate", estimatedHours: 70 },
      { title: "Data Engineer Path", targetJobTitle: "data-engineer", channels: ["data-engineering", "database", "python"], difficulty: "intermediate", estimatedHours: 60 },
      { title: "ML Engineer Path", targetJobTitle: "ml-engineer", channels: ["machine-learning", "python", "data-engineering"], difficulty: "advanced", estimatedHours: 80 },
      { title: "Engineering Manager Path", targetJobTitle: "engineering-manager", channels: ["engineering-management", "behavioral", "system-design"], difficulty: "advanced", estimatedHours: 50 },
      { title: "Mobile Engineer Path", targetJobTitle: "mobile-engineer", channels: ["ios", "android", "react-native"], difficulty: "intermediate", estimatedHours: 60 },
      { title: "Security Engineer Path", targetJobTitle: "security-engineer", channels: ["security", "networking", "backend"], difficulty: "advanced", estimatedHours: 60 },
    ],
  },
  {
    type: "skill",
    target: 25,
    items: [
      { title: "Algorithms Mastery", channels: ["algorithms", "data-structures", "complexity-analysis"], difficulty: "intermediate", estimatedHours: 60 },
      { title: "System Design Pro", channels: ["system-design", "database", "devops"], difficulty: "advanced", estimatedHours: 80 },
      { title: "Dynamic Programming Deep Dive", channels: ["dynamic-programming", "algorithms"], difficulty: "advanced", estimatedHours: 40 },
      { title: "Database Design & Optimization", channels: ["database", "backend"], difficulty: "intermediate", estimatedHours: 40 },
      { title: "Distributed Systems Fundamentals", channels: ["system-design", "backend", "devops"], difficulty: "advanced", estimatedHours: 60 },
      { title: "JavaScript & TypeScript Mastery", channels: ["frontend", "backend"], difficulty: "intermediate", estimatedHours: 40 },
      { title: "Python for Interviews", channels: ["python", "algorithms"], difficulty: "beginner", estimatedHours: 30 },
      { title: "Behavioral Interview Excellence", channels: ["behavioral", "engineering-management"], difficulty: "intermediate", estimatedHours: 20 },
      { title: "Web Security Fundamentals", channels: ["security", "backend"], difficulty: "intermediate", estimatedHours: 30 },
      { title: "Cloud Architecture Patterns", channels: ["aws", "system-design", "devops"], difficulty: "intermediate", estimatedHours: 50 },
    ],
  },
  {
    type: "certification",
    target: 10,
    items: [
      { title: "AWS Solutions Architect Prep", channels: ["aws", "system-design"], difficulty: "intermediate", estimatedHours: 80 },
      { title: "CKA Exam Preparation", channels: ["kubernetes", "devops", "linux"], difficulty: "advanced", estimatedHours: 100 },
      { title: "Terraform Associate Prep", channels: ["terraform", "devops"], difficulty: "intermediate", estimatedHours: 40 },
      { title: "CKAD Preparation Path", channels: ["kubernetes", "devops", "backend"], difficulty: "intermediate", estimatedHours: 60 },
      { title: "CompTIA Security+ Prep", channels: ["security", "networking"], difficulty: "intermediate", estimatedHours: 60 },
    ],
  },
];

function getPathCount(type: PathType): number {
  try {
    const result = execSync(
      `curl -s "${API_BASE}/api/learning-paths?type=${type}&limit=200"`,
      { encoding: "utf8", timeout: 10_000 }
    );
    const data = JSON.parse(result);
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

function getExistingQuestionIds(channels: string[]): string[] {
  const ids: string[] = [];
  for (const channel of channels.slice(0, 3)) {
    try {
      const result = execSync(
        `curl -s "${API_BASE}/api/questions/${channel}?limit=50"`,
        { encoding: "utf8", timeout: 10_000 }
      );
      const data = JSON.parse(result);
      if (Array.isArray(data)) {
        ids.push(...data.map((q: { id: string }) => q.id));
      }
    } catch {
      // ignore
    }
  }
  return [...new Set(ids)].slice(0, 150);
}

function buildPrompt(batch: PathBatch, needed: number, existingIds: string[]): string {
  const seedFile = `scripts/temp-seed-paths-${batch.type}.ts`;
  const idsJson = JSON.stringify(existingIds.slice(0, 100));
  const itemsToGenerate = batch.items.slice(0, needed);

  return `You are a senior engineering career coach building structured learning paths for DevPrep, a technical interview prep platform.

TASK: Generate exactly ${needed} learning paths of type "${batch.type}" and INSERT them into the local SQLite database.

━━━ IMPORTANT: Script must live in the WORKSPACE directory (not /tmp) ━━━
Working directory: /home/runner/workspace
Seed script path: ${seedFile}

━━━ STEP 1: Create ${seedFile} with this EXACT structure ━━━

\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";

const client = createClient({ url: "file:local.db" });

// Existing question IDs to reference in paths
const existingQuestionIds: string[] = ${idsJson};

const learningPaths = [
  // ${needed} path objects here — see shape below
];

async function main() {
  console.log("Seeding ${needed} learning paths (type: ${batch.type})...");
  for (const p of learningPaths) {
    await client.execute({
      sql: \`INSERT OR IGNORE INTO learning_paths (id, title, description, path_type, target_company, target_job_title, difficulty, estimated_hours, question_ids, channels, tags, prerequisites, learning_objectives, milestones, metadata, status, created_at, last_updated)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [p.id, p.title, p.description, p.pathType, p.targetCompany ?? null, p.targetJobTitle ?? null, p.difficulty, p.estimatedHours, p.questionIds, p.channels, p.tags, p.prerequisites, p.learningObjectives, p.milestones, p.metadata, "active", p.createdAt, p.createdAt],
    });
    console.log("Inserted:", p.title);
  }
  client.close();
  console.log("Done!");
}
main().catch(e => { console.error(e.message); process.exit(1); });
\`\`\`

━━━ LEARNING PATH OBJECT SHAPE ━━━
{
  id: crypto.randomUUID(),
  title: "...",               // e.g. "Google SWE Interview Prep"
  description: "...",         // 2-3 sentences: who it's for + what they'll achieve
  pathType: "${batch.type}",
  targetCompany: "...",       // Only for 'company' type (or null)
  targetJobTitle: "...",      // Only for 'job-title' type (or null)
  difficulty: "beginner" | "intermediate" | "advanced",
  estimatedHours: 60,
  questionIds: JSON.stringify([/* 20-50 IDs from existingQuestionIds, ordered by topic */]),
  channels: JSON.stringify(["algorithms", "system-design"]),
  tags: JSON.stringify(["interview-prep", "google", "swe"]),
  prerequisites: JSON.stringify([]),
  learningObjectives: JSON.stringify([
    "Can solve medium LeetCode problems in 20 minutes",
    "Can design a URL shortener end-to-end",
    // 4-6 concrete, measurable objectives
  ]),
  milestones: JSON.stringify([
    { title: "Foundation", description: "Core CS concepts", completionPercent: 20, questionCount: 10 },
    { title: "...", description: "...", completionPercent: 40, questionCount: 10 },
    { title: "...", description: "...", completionPercent: 60, questionCount: 10 },
    { title: "...", description: "...", completionPercent: 80, questionCount: 10 },
    { title: "Interview Ready", description: "Mock interview practice", completionPercent: 100, questionCount: 10 },
  ]),
  metadata: JSON.stringify({
    focusAreas: ["algorithms", "behavioral"],
    companiesTargeted: ["Google"],
    interviewRounds: ["phone-screen", "onsite"],
  }),
  createdAt: new Date().toISOString(),
}

━━━ PATHS TO GENERATE ━━━
Generate ${needed} paths for these specific items:
${itemsToGenerate.map((item, i) => `${i + 1}. ${item.title}
   - Channels: ${item.channels.join(", ")}
   - Difficulty: ${item.difficulty}
   - Estimated hours: ${item.estimatedHours}
   ${item.targetCompany ? `- Target company: ${item.targetCompany}` : ""}
   ${item.targetJobTitle ? `- Target job title: ${item.targetJobTitle}` : ""}`).join("\n\n")}

━━━ QUALITY REQUIREMENTS ━━━
- Each path must have 4-6 milestones with increasing completionPercent (20, 40, 60, 80, 100)
- learningObjectives: 4-6 items, start with action verbs ("Can implement", "Understands", "Able to")
- questionIds: pick from existingQuestionIds that match the path's channels (keep same order)
- If existingQuestionIds is empty for a channel, use an empty array for questionIds
- description: mention who the path is for (experience level) and what they'll achieve

━━━ STEP 2: Run the script ━━━
npx tsx ${seedFile}

━━━ STEP 3: Verify it worked ━━━
curl -s "http://localhost:5000/api/learning-paths?type=${batch.type}&limit=200" | python3 -c "import json,sys; d=json.load(sys.stdin); print('${batch.type}:', len(d) if isinstance(d,list) else d, 'learning paths in DB')"

━━━ STEP 4: Clean up ━━━
rm -f ${seedFile}`;
}

function generateForBatch(batch: PathBatch, needed: number, existingIds: string[]): boolean {
  const prompt = buildPrompt(batch, needed, existingIds);
  const promptFile = `/tmp/prompt-paths-${batch.type}.txt`;
  fs.writeFileSync(promptFile, prompt, "utf8");

  info(`Running opencode for: ${batch.type} paths (${needed} needed)`);

  const result = spawnSync(
    OPENCODE,
    ["run", "--agent", "content-learning-path-expert", prompt],
    {
      timeout: TIMEOUT_SECS * 1000,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  fs.rmSync(promptFile, { force: true });

  if (result.status === 0) {
    ok(`${batch.type} — opencode completed`);
    return true;
  } else if (result.signal === "SIGTERM") {
    warn(`${batch.type} — timed out after ${TIMEOUT_SECS}s`);
    return false;
  } else {
    err(`${batch.type} — failed (exit ${result.status})`);
    const output = ((result.stdout || "") + (result.stderr || "")).trim().split("\n");
    output.slice(-5).forEach((l) => console.log(`    ${l}`));
    return false;
  }
}

async function main() {
  console.log("\n" + "═".repeat(62));
  console.log("  DevPrep Learning Path Generation Pipeline");
  console.log(`  Target: ≥${MIN_PATHS} paths per type`);
  if (SINGLE_TYPE) {
    console.log(`  Mode: single type → ${SINGLE_TYPE}`);
  } else {
    console.log(`  Types: company, job-title, skill, certification`);
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

  const validTypes: PathType[] = ["company", "job-title", "skill", "certification"];
  if (SINGLE_TYPE && !validTypes.includes(SINGLE_TYPE)) {
    err(`Unknown type: ${SINGLE_TYPE}`);
    err(`Available: ${validTypes.join(", ")}`);
    process.exit(1);
  }

  const batchesToProcess = SINGLE_TYPE
    ? PATH_BATCHES.filter((b) => b.type === SINGLE_TYPE)
    : PATH_BATCHES;

  const results: { type: PathType; status: "ok" | "skip" | "fail" }[] = [];

  for (const batch of batchesToProcess) {
    const current = getPathCount(batch.type);
    log(`${batch.type}: ${current} paths in DB (target: ${batch.target})`);

    if (current >= MIN_PATHS) {
      warn(`${batch.type} — already has ${current} ≥ ${MIN_PATHS}, skipping`);
      results.push({ type: batch.type, status: "skip" });
      continue;
    }

    const needed = Math.min(batch.target - current, batch.items.length);
    const channels = [...new Set(batch.items.flatMap((i) => i.channels))];
    const existingIds = getExistingQuestionIds(channels);
    log(`${batch.type}: found ${existingIds.length} existing question IDs to reference`);

    const success = generateForBatch(batch, needed, existingIds);
    results.push({ type: batch.type, status: success ? "ok" : "fail" });
  }

  console.log("\n" + "═".repeat(62));
  console.log("  Summary");
  console.log("═".repeat(62));
  for (const r of results) {
    const icon = r.status === "ok" ? "✓" : r.status === "skip" ? "–" : "✗";
    const color = r.status === "ok" ? C.green : r.status === "skip" ? C.yellow : C.red;
    console.log(`  ${color}${icon}${C.reset} ${r.type} → ${r.status}`);
  }
  console.log("═".repeat(62) + "\n");
}

main();
