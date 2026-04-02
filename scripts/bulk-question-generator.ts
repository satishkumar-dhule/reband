#!/usr/bin/env npx tsx
/**
 * Bulk Question Generator
 * 
 * Generates multiple interview questions for any channel/subject.
 * Can generate questions in bulk (default 5 per run).
 * 
 * Usage:
 *   npx tsx scripts/bulk-question-generator.ts
 *   npx tsx scripts/bulk-question-generator.ts --channel=aws-sap --count=5
 *   npx tsx scripts/bulk-question-generator.ts --channel=aws --count=10
 *   npx tsx scripts/bulk-question-generator.ts --channel=algorithms --count=5
 */

import * as fs from "fs";
import crypto from "crypto";
import { createClient } from "@libsql/client";

const DEFAULT_COUNT = 5;

// Parse arguments
const args = process.argv.slice(2);
let channel = "general";
let count = DEFAULT_COUNT;

for (const arg of args) {
  if (arg.startsWith("--channel=")) {
    channel = arg.split("=")[1];
  } else if (arg.startsWith("--count=")) {
    count = parseInt(arg.split("=")[1], 10) || DEFAULT_COUNT;
  }
}

// Channel contexts for different topics
const CHANNEL_CONTEXTS: Record<string, { context: string; subChannels: string[] }> = {
  "aws-sap": {
    context: "AWS Solutions Architect Professional - Multi-region architectures, hybrid cloud, migration strategies, organizational complexity, cost optimization, security, advanced networking. Key topics: Active-Active designs, DR strategies, Migration patterns, Organizations, Control Tower, Direct Connect, VPN, VPC design, IAM roles/policies, S3 security, RDS/Aurora, Lambda, ECS/EKS, Route53, CloudFront, WAF, Shield.",
    subChannels: ["multi-region", "hybrid-cloud", "migration", "organizations", "disaster-recovery", "security", "cost-optimization", "networking", "container-orchestration"]
  },
  "aws-saa": {
    context: "AWS Solutions Architect Associate - Core AWS services: EC2, S3, RDS, DynamoDB, Lambda, VPC, IAM, CloudFront, Route53, ELB, ASG, EFS, EBS. Focus on design principles (design for failure, elasticity, loose coupling), security best practices, cost optimization, and operational excellence.",
    subChannels: ["compute", "storage", "networking", "serverless", "databases", "security", "architecture"]
  },
  "aws": {
    context: "General AWS - EC2 (instance types, AMIs), S3 (storage classes, lifecycle), RDS vs DynamoDB, Lambda (serverless), VPC (subnets, security groups, NACLs), IAM (roles, policies), CloudFormation, ECS/EKS, Route53, CloudWatch, CloudFront, ELB.",
    subChannels: ["compute", "storage", "networking", "serverless", "databases", "security", "monitoring"]
  },
  "algorithms": {
    context: "Algorithms - Sorting (quicksort, mergesort), searching (binary search), graph traversal (BFS/DFS), dynamic programming, greedy algorithms, divide & conquer. Must include Big-O complexity analysis in answers.",
    subChannels: ["sorting", "searching", "graph-algorithms", "dynamic-programming", "greedy", "divide-conquer"]
  },
  "system-design": {
    context: "System Design - Design scalable distributed systems. Requirements clarification, capacity estimation, high-level architecture, database selection, caching strategies, load balancing, message queues, API design, failure handling, microservices patterns.",
    subChannels: ["distributed-systems", "caching", "databases", "api-design", "scalability", "microservices"]
  },
  "frontend": {
    context: "Frontend - React hooks, virtual DOM, browser event loop, JavaScript closures, CSS specificity, web performance, accessibility, TypeScript, bundlers, Web APIs.",
    subChannels: ["react", "javascript", "css", "browser-internals", "performance", "typescript"]
  },
  "backend": {
    context: "Backend - REST API design, authentication (JWT, OAuth2), database design, caching strategies, message queues, microservices, error handling, logging, API versioning.",
    subChannels: ["api-design", "authentication", "caching", "microservices", "databases"]
  },
  "devops": {
    context: "DevOps - CI/CD pipelines, Docker, Kubernetes, Infrastructure as Code (Terraform), monitoring, deployment strategies, Git workflows.",
    subChannels: ["ci-cd", "docker", "kubernetes", "iac", "monitoring", "deployment"]
  },
  "kubernetes": {
    context: "Kubernetes - Pods, ReplicaSets, Deployments, Services, Ingress, Namespaces, ConfigMaps, Secrets, RBAC, HPA, storage, networking.",
    subChannels: ["pods", "services", "config", "scaling", "storage", "networking", "security"]
  },
  "database": {
    context: "Database - SQL joins, indexing strategies, transactions, isolation levels, query optimization, normalization, NoSQL vs SQL trade-offs.",
    subChannels: ["sql", "indexing", "transactions", "query-optimization", "nosql", "normalization"]
  },
  "networking": {
    context: "Networking - OSI model, TCP vs UDP, DNS, HTTP/2 vs HTTP/3, load balancing, NAT, firewalls, VPN, CDN, WebSockets, gRPC, subnetting.",
    subChannels: ["tcp-ip", "http", "dns", "load-balancing", "protocols", "security"]
  },
  "security": {
    context: "Security - OWASP Top 10, SQL injection, XSS, CSRF, authentication, authorization, HTTPS/TLS, secrets management, secure coding.",
    subChannels: ["web-security", "authentication", "cryptography", "owasp", "secure-coding"]
  },
  "terraform": {
    context: "Terraform - HCL syntax, providers, resources, data sources, variables, outputs, modules, state management, workspaces, workflow.",
    subChannels: ["hcl-basics", "modules", "state-management", "providers", "best-practices"]
  },
  "data-engineering": {
    context: "Data Engineering - ETL/ELT, Apache Spark, Kafka, data warehouses, Airflow, data modeling, streaming vs batch.",
    subChannels: ["etl-pipelines", "apache-spark", "kafka", "data-warehousing", "airflow"]
  },
  "machine-learning": {
    context: "Machine Learning - Supervised/unsupervised, bias-variance, overfitting, gradient descent, evaluation metrics, neural networks, feature engineering.",
    subChannels: ["supervised-learning", "model-evaluation", "neural-networks", "feature-engineering"]
  },
  "generative-ai": {
    context: "Generative AI - LLMs, transformers, RAG, fine-tuning, embeddings, vector databases, RLHF, hallucination mitigation.",
    subChannels: ["llms", "rag", "fine-tuning", "embeddings", "transformer-architecture"]
  },
  "python": {
    context: "Python - Data structures, list comprehensions, generators, decorators, async/await, OOP, type hints, GIL.",
    subChannels: ["python-basics", "oop", "functional-programming", "async", "decorators"]
  },
  "typescript": {
    context: "TypeScript - Types, interfaces, generics, utility types, strict mode, decorators, module resolution, performance patterns.",
    subChannels: ["types", "generics", "utility-types", "decorators", "advanced-patterns"]
  }
};

function getChannelContext(ch: string): { context: string; subChannels: string[] } {
  if (CHANNEL_CONTEXTS[ch]) {
    return CHANNEL_CONTEXTS[ch];
  }
  return {
    context: `Technical interview questions about ${ch}`,
    subChannels: ["general", "concepts", "best-practices"]
  };
}

// Colors
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
const ok = (msg: string) => console.log(`${C.green}[${ts()}] ✓${C.reset} ${msg}`);
const err = (msg: string) => console.log(`${C.red}[${ts()}] ✗${C.reset} ${msg}`);

// Generate questions using opencode
async function generateQuestionsWithOpencode(channelId: string, count: number): Promise<any[]> {
  const channelInfo = getChannelContext(channelId);
  
  const prompt = `Generate ${count} interview questions about ${channelId}.

Return ONLY a JSON array (no markdown, no explanations) with objects containing:
- question: The interview question
- answer: The answer (50-200 words)
- explanation: Detailed explanation (100-300 words)
- difficulty: beginner, intermediate, or advanced
- subChannel: relevant sub-topic from: ${channelInfo.subChannels.join(", ")}
- tags: array of tags (include channel as first tag)
- companies: array of company names

Channel context: ${channelInfo.context}

Requirements:
- Mix of difficulties: ~30% beginner, ~40% intermediate, ~30% advanced
- Questions should be specific to real AWS/services/technologies (not generic)
- Real questions asked at companies like Amazon, Google, Meta, Netflix, Stripe
- Each question should cover a different sub-topic
- Answers should be practical and demonstrate deep understanding`;

  const promptFile = `/tmp/prompt-${channelId}-${Date.now()}.txt`;
  fs.writeFileSync(promptFile, prompt, "utf8");

  log(`Generating ${count} questions for ${channelId}...`);

  const opencode = "/home/runner/workspace/.config/npm/node_global/bin/opencode";
  
  const { spawnSync } = await import("child_process");
  
  const result = spawnSync(
    opencode,
    ["run", "--agent", "content-question-expert", prompt],
    {
      timeout: 300000, // 5 min
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  fs.rmSync(promptFile, { force: true });

  const output = (result.stdout || "") + (result.stderr || "");
  
  // Parse JSON from output
  const jsonMatch = output.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      const questions = JSON.parse(jsonMatch[0]);
      ok(`Parsed ${questions.length} questions from output`);
      return questions;
    } catch (e) {
      err(`Failed to parse JSON from output`);
      console.log("Raw output:", output.slice(-3000));
      return [];
    }
  }
  
  err("No JSON found in output");
  console.log("Output:", output.slice(-2000));
  return [];
}

// Save questions to database
async function saveQuestionsToDatabase(questions: any[], channelId: string): Promise<number> {
  const client = createClient({ url: "file:local.db" });
  
  let saved = 0;
  
  for (const q of questions) {
    try {
      const id = `que-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
      const now = new Date().toISOString();
      
      await client.execute({
        sql: `INSERT OR IGNORE INTO questions (id, question, answer, explanation, eli5, difficulty, tags, channel, sub_channel, status, is_new, created_at, last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          id,
          q.question,
          q.answer,
          q.explanation,
          "",
          q.difficulty,
          JSON.stringify(q.tags || [channelId]),
          channelId,
          q.subChannel || "general",
          "active",
          1,
          now,
          now
        ]
      });
      saved++;
    } catch (e: any) {
      console.log(`  Failed to save: ${e.message}`);
    }
  }
  
  client.close();
  return saved;
}

// Main
async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  Bulk Question Generator");
  console.log(`  Channel: ${channel}`);
  console.log(`  Count: ${count}`);
  console.log("=".repeat(60) + "\n");

  // Check if channel exists in DB
  const client = createClient({ url: "file:local.db" });
  try {
    const result = await client.execute({
      sql: `SELECT COUNT(*) as cnt FROM questions WHERE channel = ?`,
      args: [channel]
    });
    const currentCount = result.rows[0]?.cnt || 0;
    console.log(`Current questions in DB for ${channel}: ${currentCount}`);
  } catch (e) {
    console.log("Note: Channel may not exist yet");
  }
  client.close();

  // Generate questions
  const questions = await generateQuestionsWithOpencode(channel, count);
  
  if (questions.length > 0) {
    // Save to database
    const saved = await saveQuestionsToDatabase(questions, channel);
    ok(`Saved ${saved} questions to database for ${channel}`);
    
    // Display summary
    console.log("\nGenerated Questions:");
    for (const q of questions) {
      console.log(`  - [${q.difficulty}] ${q.question.slice(0, 70)}...`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Done!");
  console.log("=".repeat(60) + "\n");
}

main().catch(e => {
  err(String(e));
  process.exit(1);
});