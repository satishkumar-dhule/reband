#!/usr/bin/env npx tsx
/**
 * Parallel Bulk Question Generator - True Parallel Execution
 * 
 * Generates questions for multiple channels truly in parallel using Promise.all
 * 
 * Usage:
 *   npx tsx scripts/parallel-bulk-generator.ts --count=5
 *   npx tsx scripts/parallel-bulk-generator.ts --count=5 --parallel=5
 */

import * as fs from "fs";
import crypto from "crypto";
import { createClient } from "@libsql/client";
import { spawn, ChildProcess } from "child_process";

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

// All supported channels
const ALL_CHANNELS = [
  "algorithms", "data-structures", "complexity-analysis", "dynamic-programming",
  "bit-manipulation", "design-patterns", "concurrency", "math-logic", "low-level",
  "system-design", "frontend", "backend", "database", "devops", "sre",
  "aws", "aws-sap", "aws-saa", "aws-dva", "aws-sysops", "kubernetes", "terraform",
  "data-engineering", "machine-learning", "generative-ai", "prompt-engineering", "llm-ops",
  "computer-vision", "nlp",
  "python", "typescript", "javascript",
  "security", "networking",
  "operating-systems", "linux", "unix",
  "ios", "android", "react-native",
  "testing", "e2e-testing", "api-testing", "performance-testing",
  "engineering-management", "behavioral"
];

// Channel contexts
const CHANNEL_CONTEXTS: Record<string, { context: string; subChannels: string[] }> = {
  "algorithms": { context: "Algorithms - Sorting, searching, graph traversal, DP, greedy. Include Big-O.", subChannels: ["sorting", "searching", "graph", "dp", "greedy"] },
  "system-design": { context: "System Design - Scalable systems, capacity planning, databases, caching, load balancing.", subChannels: ["distributed", "caching", "databases", "api", "scalability"] },
  "frontend": { context: "Frontend - React, JavaScript, CSS, browser internals, performance, TypeScript.", subChannels: ["react", "javascript", "css", "browser", "performance"] },
  "backend": { context: "Backend - REST APIs, auth, databases, caching, message queues, microservices.", subChannels: ["api", "auth", "caching", "microservices"] },
  "database": { context: "Database - SQL, indexing, transactions, query optimization, NoSQL.", subChannels: ["sql", "indexing", "transactions", "query-optimization", "nosql"] },
  "devops": { context: "DevOps - CI/CD, Docker, Kubernetes, Terraform, monitoring, deployment.", subChannels: ["ci-cd", "docker", "kubernetes", "iac", "monitoring"] },
  "kubernetes": { context: "Kubernetes - Pods, Deployments, Services, Ingress, ConfigMaps, RBAC, HPA.", subChannels: ["pods", "services", "config", "scaling", "storage"] },
  "aws": { context: "AWS - EC2, S3, RDS, Lambda, VPC, IAM, CloudFront, Route53, ECS/EKS.", subChannels: ["compute", "storage", "networking", "serverless", "databases"] },
  "aws-sap": { context: "AWS SAP - Multi-region, hybrid cloud, migration, organizations, DR, security.", subChannels: ["multi-region", "hybrid-cloud", "migration", "organizations", "disaster-recovery"] },
  "aws-saa": { context: "AWS SAA - EC2, S3, RDS, Lambda, VPC, IAM, design principles.", subChannels: ["compute", "storage", "networking", "serverless", "databases"] },
  "aws-dva": { context: "AWS DVA - Lambda, API Gateway, DynamoDB, SQS, SNS, CI/CD, security.", subChannels: ["development", "security", "deployment", "troubleshooting"] },
  "aws-sysops": { context: "AWS SysOps - Monitoring, logging, automation, security, networking, cost.", subChannels: ["monitoring", "automation", "security", "networking"] },
  "terraform": { context: "Terraform - HCL, providers, resources, variables, modules, state.", subChannels: ["hcl", "modules", "state", "providers"] },
  "data-engineering": { context: "Data Engineering - ETL, Spark, Kafka, data warehouses, Airflow.", subChannels: ["etl", "spark", "kafka", "warehousing", "airflow"] },
  "machine-learning": { context: "ML - Supervised/unsupervised, bias-variance, gradient descent, evaluation.", subChannels: ["supervised", "evaluation", "neural-networks", "features"] },
  "generative-ai": { context: "GenAI - LLMs, transformers, RAG, fine-tuning, embeddings, vector DB.", subChannels: ["llms", "rag", "fine-tuning", "embeddings"] },
  "security": { context: "Security - OWASP, SQL injection, XSS, CSRF, auth, TLS, secure coding.", subChannels: ["owasp", "authentication", "cryptography", "secure-coding"] },
  "networking": { context: "Networking - OSI, TCP/UDP, DNS, HTTP, load balancing, VPN, CDN.", subChannels: ["tcp-ip", "http", "dns", "load-balancing"] },
  "python": { context: "Python - Data structures, comprehensions, generators, decorators, async, OOP.", subChannels: ["basics", "oop", "functional", "async", "decorators"] },
  "typescript": { context: "TypeScript - Types, interfaces, generics, utility types, strict mode.", subChannels: ["types", "generics", "utility-types"] },
  "javascript": { context: "JavaScript - ES6+, closures, async/await, event loop, DOM, modules.", subChannels: ["es6", "async", "dom", "modules"] }
};

function getChannelContext(ch: string) {
  return CHANNEL_CONTEXTS[ch] || { context: `Questions about ${ch}`, subChannels: ["general"] };
}

const C = { reset: "\x1b[0m", green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m", blue: "\x1b[34m", cyan: "\x1b[36m" };
const ts = () => new Date().toTimeString().slice(0, 8);
const log = (msg: string) => console.log(`${C.blue}[${ts()}]${C.reset} ${msg}`);
const ok = (msg: string) => console.log(`${C.green}[${ts()}] ✓${C.reset} ${msg}`);
const err = (msg: string) => console.log(`${C.red}[${ts()}] ✗${C.reset} ${msg}`);

async function getChannelCount(channelId: string): Promise<number> {
  const client = createClient({ url: "file:local.db" });
  try {
    const result = await client.execute({
      sql: `SELECT COUNT(*) as cnt FROM questions WHERE channel = ? AND status != 'deleted'`,
      args: [channelId]
    });
    client.close();
    return result.rows[0]?.cnt ? Number(result.rows[0].cnt) : 0;
  } catch { client.close(); return 0; }
}

function generateForChannel(channelId: string, questionCount: number): Promise<any[]> {
  return new Promise((resolve) => {
    const channelInfo = getChannelContext(channelId);
    
    const prompt = `Generate ${questionCount} interview questions about ${channelId}.

Return ONLY a JSON array with objects containing:
- question: The interview question
- answer: The answer (50-200 words)
- explanation: Detailed explanation (100-300 words)
- difficulty: beginner, intermediate, or advanced
- subChannel: relevant sub-topic from: ${channelInfo.subChannels.join(", ")}
- tags: array of tags (channel first)
- companies: array of company names

Channel context: ${channelInfo.context}

Requirements:
- Mix difficulties ~30% beginner, ~40% intermediate, ~30% advanced
- Specific to real technologies
- Each question different sub-topic`;

    const opencode = "/home/runner/workspace/.config/npm/node_global/bin/opencode";
    
    const child = spawn(opencode, ["run", "--agent", "content-question-expert", prompt], {
      stdio: ["ignore", "pipe", "pipe"]
    });

    let output = "";
    child.stdout?.on("data", (d) => output += d.toString());
    child.stderr?.on("data", (d) => output += d.toString());
    
    // Set timeout
    const timeout = setTimeout(() => {
      child.kill();
      resolve([]);
    }, 240000);
    
    child.on("close", () => {
      clearTimeout(timeout);
      // Extract JSON from output
      const lines = output.split('\n');
      let jsonStart = -1;
      let braceCount = 0;
      let inJson = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '[') {
          jsonStart = i;
          inJson = true;
          braceCount = 1;
        } else if (inJson) {
          for (const char of line) {
            if (char === '[') braceCount++;
            if (char === ']') braceCount--;
            if (braceCount === 0 && jsonStart !== -1) {
              const jsonStr = lines.slice(jsonStart, i + 1).join('\n');
              try {
                const parsed = JSON.parse(jsonStr);
                resolve(parsed);
                return;
              } catch {}
            }
          }
        }
      }
      resolve([]);
    });
    
    child.on("error", () => resolve([]));
  });
}

async function saveQuestions(questions: any[], channelId: string): Promise<number> {
  const client = createClient({ url: "file:local.db" });
  let saved = 0;
  for (const q of questions) {
    try {
      const id = `que-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT OR IGNORE INTO questions (id, question, answer, explanation, eli5, difficulty, tags, channel, sub_channel, status, is_new, created_at, last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [id, q.question, q.answer, q.explanation, "", q.difficulty, JSON.stringify(q.tags || [channelId]), channelId, q.subChannel || "general", "active", 1, now, now]
      });
      saved++;
    } catch {}
  }
  client.close();
  return saved;
}

async function processChannel(channelId: string, questionCount: number): Promise<{channel: string, generated: number, saved: number}> {
  log(`Starting ${channelId}...`);
  const questions = await generateForChannel(channelId, questionCount);
  if (questions.length > 0) {
    const saved = await saveQuestions(questions, channelId);
    ok(`${channelId}: ${saved} saved`);
    return { channel: channelId, generated: questions.length, saved };
  }
  err(`${channelId}: failed`);
  return { channel: channelId, generated: 0, saved: 0 };
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  Parallel Bulk Question Generator");
  console.log(`  Target: ${count} questions per channel`);
  console.log(`  Parallel workers: ${maxParallel}`);
  console.log("=".repeat(60) + "\n");

  // Get current counts
  const channelCounts: Record<string, number> = {};
  for (const ch of ALL_CHANNELS) channelCounts[ch] = await getChannelCount(ch);

  const channelsNeedingQuestions = ALL_CHANNELS.filter(ch => (channelCounts[ch] || 0) < (minQuestions || count));

  console.log(`Total channels: ${ALL_CHANNELS.length}`);
  console.log(`Need generation: ${channelsNeedingQuestions.length}`);
  console.log(`Skipped (have enough): ${ALL_CHANNELS.length - channelsNeedingQuestions.length}\n`);

  if (channelsNeedingQuestions.length === 0) {
    ok("All channels have enough questions!");
    return;
  }

  // Process in parallel batches
  const results: {channel: string, generated: number, saved: number}[] = [];
  for (let i = 0; i < channelsNeedingQuestions.length; i += maxParallel) {
    const batch = channelsNeedingQuestions.slice(i, i + maxParallel);
    console.log(`\n=== Batch ${Math.floor(i/maxParallel) + 1}: ${batch.join(", ")} ===\n`);
    const batchResults = await Promise.all(batch.map(ch => processChannel(ch, count)));
    results.push(...batchResults);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  const totalSaved = results.reduce((sum, r) => sum + r.saved, 0);
  console.log(`Total questions saved: ${totalSaved}`);
  console.log("=".repeat(60) + "\n");
}

main().catch(e => { err(String(e)); process.exit(1); });