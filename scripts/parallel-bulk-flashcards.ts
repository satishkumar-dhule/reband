#!/usr/bin/env npx tsx
/**
 * Parallel Bulk Flashcard Generator
 * 
 * Generates flashcards for all channels in parallel
 * 
 * Usage:
 *   npx tsx scripts/parallel-bulk-flashcards.ts --count=5
 *   npx tsx scripts/parallel-bulk-flashcards.ts --count=5 --parallel=5
 */

import * as fs from "fs";
import crypto from "crypto";
import { createClient } from "@libsql/client";
import { spawn } from "child_process";

const DEFAULT_COUNT = 5;
const DEFAULT_PARALLEL = 5;

// Parse arguments
const args = process.argv.slice(2);
let count = DEFAULT_COUNT;
let minQuestions = 0;
let maxParallel = DEFAULT_PARALLEL;

for (const arg of args) {
  if (arg.startsWith("--count=")) {
    count = parseInt(arg.split("=")[1], 10) || DEFAULT_COUNT;
  } else if (arg.startsWith("--min=")) {
    minQuestions = parseInt(arg.split("=")[1], 10) || 0;
  } else if (arg.startsWith("--parallel=")) {
    maxParallel = parseInt(arg.split("=")[1], 10) || DEFAULT_PARALLEL;
  }
}

// All supported channels for flashcards
const ALL_CHANNELS = [
  "javascript", "typescript", "python", "react", "nodejs",
  "aws", "aws-sap", "aws-saa", "kubernetes", "docker",
  "algorithms", "system-design", "database", "devops", "networking",
  "security", "frontend", "backend", "data-structures"
];

// Channel contexts for flashcards
const CHANNEL_CONTEXTS: Record<string, { context: string; subChannels: string[] }> = {
  "javascript": { context: "JavaScript fundamentals, ES6+, async/await, closures, DOM, events", subChannels: ["es6", "async", "dom", "closures", "arrays"] },
  "typescript": { context: "TypeScript types, interfaces, generics, utility types, strict mode", subChannels: ["types", "generics", "utility-types", "decorators"] },
  "python": { context: "Python data structures, comprehensions, decorators, async, OOP", subChannels: ["basics", "oop", "functional", "async"] },
  "react": { context: "React hooks, components, state management, lifecycle, performance", subChannels: ["hooks", "state", "components", "lifecycle", "performance"] },
  "nodejs": { context: "Node.js runtime, Express, streams, buffers, event loop", subChannels: ["express", "streams", "buffers", "modules"] },
  "aws": { context: "AWS core services: EC2, S3, Lambda, VPC, IAM, RDS", subChannels: ["compute", "storage", "serverless", "networking"] },
  "aws-sap": { context: "AWS SAP: multi-region, hybrid cloud, migration, organizations", subChannels: ["multi-region", "hybrid", "migration", "organizations"] },
  "aws-saa": { context: "AWS SAA: design principles, compute, storage, networking", subChannels: ["architecture", "compute", "storage"] },
  "kubernetes": { context: "K8s: Pods, Deployments, Services, ConfigMaps, scaling", subChannels: ["pods", "services", "config", "scaling"] },
  "docker": { context: "Docker: containers, images, volumes, networking, Dockerfile", subChannels: ["containers", "images", "volumes", "networking"] },
  "algorithms": { context: "Algorithms: sorting, searching, graphs, DP, complexity", subChannels: ["sorting", "searching", "graphs", "dp"] },
  "system-design": { context: "System design: scalability, databases, caching, APIs", subChannels: ["scalability", "databases", "caching", "apis"] },
  "database": { context: "Database: SQL, indexing, transactions, normalization, NoSQL", subChannels: ["sql", "indexing", "transactions", "nosql"] },
  "devops": { context: "DevOps: CI/CD, monitoring, IaC, deployment strategies", subChannels: ["ci-cd", "monitoring", "iac", "deployment"] },
  "networking": { context: "Networking: TCP/IP, DNS, HTTP, load balancing, security", subChannels: ["tcp-ip", "http", "dns", "load-balancing"] },
  "security": { context: "Security: OWASP, authentication, encryption, vulnerabilities", subChannels: ["owasp", "auth", "encryption", "vulnerabilities"] },
  "frontend": { context: "Frontend: CSS, browser, performance, accessibility", subChannels: ["css", "browser", "performance", "a11y"] },
  "backend": { context: "Backend: REST, authentication, caching, error handling", subChannels: ["rest", "auth", "caching", "errors"] },
  "data-structures": { context: "Data structures: arrays, linked lists, trees, hashes, graphs", subChannels: ["arrays", "linked-lists", "trees", "hashes"] }
};

function getChannelContext(ch: string) {
  return CHANNEL_CONTEXTS[ch] || { context: `Flashcards about ${ch}`, subChannels: ["general"] };
}

const C = { reset: "\x1b[0m", green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m", blue: "\x1b[34m" };
const ts = () => new Date().toTimeString().slice(0, 8);
const log = (msg: string) => console.log(`${C.blue}[${ts()}]${C.reset} ${msg}`);
const ok = (msg: string) => console.log(`${C.green}[${ts()}] ✓${C.reset} ${msg}`);
const err = (msg: string) => console.log(`${C.red}[${ts()}] ✗${C.reset} ${msg}`);

async function getChannelCount(channelId: string): Promise<number> {
  const client = createClient({ url: "file:local.db" });
  try {
    const result = await client.execute({
      sql: `SELECT COUNT(*) as cnt FROM flashcards WHERE channel = ?`,
      args: [channelId]
    });
    client.close();
    return result.rows[0]?.cnt ? Number(result.rows[0].cnt) : 0;
  } catch { client.close(); return 0; }
}

function generateForChannel(channelId: string, questionCount: number): Promise<any[]> {
  return new Promise((resolve) => {
    const channelInfo = getChannelContext(channelId);
    
    const prompt = `Generate ${questionCount} flashcards about ${channelId}.

Return ONLY a JSON array with objects containing:
- id: flashcard-${Date.now()}-random
- front: The question or term (1-2 sentences)
- back: The answer or definition (2-4 sentences)
- hint: Optional hint (1 sentence)
- code_example: Optional code snippet if applicable
- difficulty: beginner, intermediate, or advanced
- tags: array of tags (channel first)
- category: relevant sub-topic from: ${channelInfo.subChannels.join(", ")}

Channel context: ${channelInfo.context}

Requirements:
- Mix difficulties ~30% beginner, ~40% intermediate, ~30% advanced
- Each flashcard covers different concept
- Front should be question/term, back should be answer/definition`;

    const opencode = "/home/runner/workspace/.config/npm/node_global/bin/opencode";
    
    const child = spawn(opencode, ["run", "--agent", "content-flashcard-expert", prompt], {
      stdio: ["ignore", "pipe", "pipe"]
    });

    let output = "";
    child.stdout?.on("data", (d) => output += d.toString());
    child.stderr?.on("data", (d) => output += d.toString());
    
    const timeout = setTimeout(() => { child.kill(); resolve([]); }, 240000);
    
    child.on("close", () => {
      clearTimeout(timeout);
      const lines = output.split('\n');
      let jsonStart = -1, braceCount = 0, inJson = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '[') { jsonStart = i; inJson = true; braceCount = 1; }
        else if (inJson) {
          for (const char of line) {
            if (char === '[') braceCount++;
            if (char === ']') braceCount--;
            if (braceCount === 0 && jsonStart !== -1) {
              try { resolve(JSON.parse(lines.slice(jsonStart, i + 1).join('\n'))); return; } catch {}
            }
          }
        }
      }
      resolve([]);
    });
    
    child.on("error", () => resolve([]));
  });
}

async function saveFlashcards(flashcards: any[], channelId: string): Promise<number> {
  const client = createClient({ url: "file:local.db" });
  let saved = 0;
  for (const fc of flashcards) {
    try {
      const id = `fc-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
      await client.execute({
        sql: `INSERT OR IGNORE INTO flashcards (id, channel, front, back, hint, code_example, difficulty, tags, category, status) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        args: [id, channelId, fc.front, fc.back, fc.hint || "", fc.code_example || "", fc.difficulty, JSON.stringify(fc.tags || [channelId]), fc.category || "general", "active"]
      });
      saved++;
    } catch {}
  }
  client.close();
  return saved;
}

async function processChannel(channelId: string, flashcardCount: number): Promise<{channel: string, generated: number, saved: number}> {
  log(`Starting ${channelId}...`);
  const flashcards = await generateForChannel(channelId, flashcardCount);
  if (flashcards.length > 0) {
    const saved = await saveFlashcards(flashcards, channelId);
    ok(`${channelId}: ${saved} saved`);
    return { channel: channelId, generated: flashcards.length, saved };
  }
  err(`${channelId}: failed`);
  return { channel: channelId, generated: 0, saved: 0 };
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  Parallel Bulk Flashcard Generator");
  console.log(`  Target: ${count} flashcards per channel`);
  console.log(`  Parallel workers: ${maxParallel}`);
  console.log("=".repeat(60) + "\n");

  const channelCounts: Record<string, number> = {};
  for (const ch of ALL_CHANNELS) channelCounts[ch] = await getChannelCount(ch);

  const channelsNeedingQuestions = ALL_CHANNELS.filter(ch => (channelCounts[ch] || 0) < (minQuestions || count));

  console.log(`Total channels: ${ALL_CHANNELS.length}`);
  console.log(`Need generation: ${channelsNeedingQuestions.length}`);
  console.log(`Skipped (have enough): ${ALL_CHANNELS.length - channelsNeedingQuestions.length}\n`);

  if (channelsNeedingQuestions.length === 0) {
    ok("All channels have enough flashcards!");
    return;
  }

  const results: {channel: string, generated: number, saved: number}[] = [];
  for (let i = 0; i < channelsNeedingQuestions.length; i += maxParallel) {
    const batch = channelsNeedingQuestions.slice(i, i + maxParallel);
    console.log(`\n=== Batch ${Math.floor(i/maxParallel) + 1}: ${batch.join(", ")} ===\n`);
    const batchResults = await Promise.all(batch.map(ch => processChannel(ch, count)));
    results.push(...batchResults);
  }

  console.log("\n" + "=".repeat(60));
  const totalSaved = results.reduce((sum, r) => sum + r.saved, 0);
  console.log(`Total flashcards saved: ${totalSaved}`);
  console.log("=".repeat(60) + "\n");
}

main().catch(e => { err(String(e)); process.exit(1); });