#!/usr/bin/env npx tsx
/**
 * DevPrep Certification Content Generation Pipeline
 *
 * Uses opencode run --agent content-certification-expert to generate
 * certification exam content (MCQ questions + certification track records)
 * and insert them into the local SQLite database.
 *
 * Usage:
 *   npx tsx scripts/generate-certifications-pipeline.ts
 *   npx tsx scripts/generate-certifications-pipeline.ts --cert=aws-saa
 *   npx tsx scripts/generate-certifications-pipeline.ts --min=20
 */

import { execSync, spawnSync } from "child_process";
import * as fs from "fs";

const OPENCODE =
  "/home/runner/workspace/.config/npm/node_global/bin/opencode";
const API_BASE = "http://localhost:5000";
const MIN_QUESTIONS = parseInt(
  process.argv.find((a) => a.startsWith("--min="))?.split("=")[1] ?? "10"
);
const SINGLE_CERT = process.argv
  .find((a) => a.startsWith("--cert="))
  ?.split("=")[1];
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

interface CertConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  examCode: string;
  category: string;
  difficulty: string;
  targetQuestions: number;
  estimatedHours: number;
  passingScore: number;
  examDuration: number;
  domains: { name: string; weight: number }[];
  channelMappings: string[];
  officialUrl: string;
}

const CERTIFICATIONS: CertConfig[] = [
  {
    id: "aws-saa",
    name: "AWS Solutions Architect Associate",
    provider: "Amazon",
    description: "Validates ability to design and deploy scalable, highly available, and fault-tolerant systems on AWS.",
    examCode: "SAA-C03",
    category: "cloud",
    difficulty: "intermediate",
    targetQuestions: 200,
    estimatedHours: 80,
    passingScore: 72,
    examDuration: 130,
    domains: [
      { name: "Design Resilient Architectures", weight: 30 },
      { name: "Design High-Performing Architectures", weight: 28 },
      { name: "Design Secure Applications and Architectures", weight: 24 },
      { name: "Design Cost-Optimized Architectures", weight: 18 },
    ],
    channelMappings: ["aws", "system-design", "database"],
    officialUrl: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
  },
  {
    id: "aws-developer",
    name: "AWS Developer Associate",
    provider: "Amazon",
    description: "Validates skills in developing, deploying, and debugging cloud-based applications using AWS.",
    examCode: "DVA-C02",
    category: "cloud",
    difficulty: "intermediate",
    targetQuestions: 150,
    estimatedHours: 60,
    passingScore: 72,
    examDuration: 130,
    domains: [
      { name: "Development with AWS Services", weight: 32 },
      { name: "Security", weight: 26 },
      { name: "Deployment", weight: 24 },
      { name: "Troubleshooting and Optimization", weight: 18 },
    ],
    channelMappings: ["aws", "backend", "devops"],
    officialUrl: "https://aws.amazon.com/certification/certified-developer-associate/",
  },
  {
    id: "cka",
    name: "Certified Kubernetes Administrator",
    provider: "CNCF",
    description: "Validates skills in Kubernetes cluster administration, configuration, and troubleshooting.",
    examCode: "CKA",
    category: "devops",
    difficulty: "advanced",
    targetQuestions: 150,
    estimatedHours: 100,
    passingScore: 66,
    examDuration: 120,
    domains: [
      { name: "Cluster Architecture, Installation & Configuration", weight: 25 },
      { name: "Workloads & Scheduling", weight: 15 },
      { name: "Services & Networking", weight: 20 },
      { name: "Storage", weight: 10 },
      { name: "Troubleshooting", weight: 30 },
    ],
    channelMappings: ["kubernetes", "devops", "linux"],
    officialUrl: "https://www.cncf.io/certification/cka/",
  },
  {
    id: "ckad",
    name: "Certified Kubernetes Application Developer",
    provider: "CNCF",
    description: "Validates skills in designing, building, and deploying cloud-native applications for Kubernetes.",
    examCode: "CKAD",
    category: "devops",
    difficulty: "intermediate",
    targetQuestions: 100,
    estimatedHours: 60,
    passingScore: 66,
    examDuration: 120,
    domains: [
      { name: "Application Design and Build", weight: 20 },
      { name: "Application Deployment", weight: 20 },
      { name: "Application Observability and Maintenance", weight: 15 },
      { name: "Application Environment, Configuration and Security", weight: 25 },
      { name: "Services and Networking", weight: 20 },
    ],
    channelMappings: ["kubernetes", "devops", "backend"],
    officialUrl: "https://www.cncf.io/certification/ckad/",
  },
  {
    id: "terraform-associate",
    name: "Terraform Associate",
    provider: "HashiCorp",
    description: "Validates understanding of basic concepts, skills, and use cases associated with Terraform.",
    examCode: "003",
    category: "devops",
    difficulty: "intermediate",
    targetQuestions: 100,
    estimatedHours: 40,
    passingScore: 70,
    examDuration: 60,
    domains: [
      { name: "Understand Infrastructure as Code (IaC) concepts", weight: 17 },
      { name: "Understand the purpose of Terraform", weight: 9 },
      { name: "Understand Terraform basics", weight: 24 },
      { name: "Use the Terraform CLI", weight: 22 },
      { name: "Interact with Terraform modules", weight: 12 },
      { name: "Use the core Terraform workflow", weight: 16 },
    ],
    channelMappings: ["terraform", "devops"],
    officialUrl: "https://www.hashicorp.com/certification/terraform-associate",
  },
  {
    id: "security-plus",
    name: "CompTIA Security+",
    provider: "CompTIA",
    description: "Validates baseline cybersecurity skills for IT roles. Industry-standard entry-level security certification.",
    examCode: "SY0-701",
    category: "security",
    difficulty: "intermediate",
    targetQuestions: 150,
    estimatedHours: 60,
    passingScore: 75,
    examDuration: 90,
    domains: [
      { name: "General Security Concepts", weight: 12 },
      { name: "Threats, Vulnerabilities, and Mitigations", weight: 22 },
      { name: "Security Architecture", weight: 18 },
      { name: "Security Operations", weight: 28 },
      { name: "Security Program Management and Oversight", weight: 20 },
    ],
    channelMappings: ["security", "networking"],
    officialUrl: "https://www.comptia.org/certifications/security",
  },
  {
    id: "azure-fundamentals",
    name: "Microsoft Azure Fundamentals",
    provider: "Microsoft",
    description: "Validates foundational knowledge of cloud concepts and Azure services, workloads, security, privacy, pricing, and support.",
    examCode: "AZ-900",
    category: "cloud",
    difficulty: "beginner",
    targetQuestions: 100,
    estimatedHours: 30,
    passingScore: 70,
    examDuration: 60,
    domains: [
      { name: "Cloud Concepts", weight: 25 },
      { name: "Azure Architecture and Services", weight: 35 },
      { name: "Azure Management and Governance", weight: 30 },
      { name: "Azure Pricing and Support", weight: 10 },
    ],
    channelMappings: ["devops", "system-design"],
    officialUrl: "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/",
  },
  {
    id: "kubernetes-kcna",
    name: "Kubernetes and Cloud Native Associate",
    provider: "CNCF",
    description: "Entry-level certification for Kubernetes and cloud native technologies.",
    examCode: "KCNA",
    category: "devops",
    difficulty: "beginner",
    targetQuestions: 150,
    estimatedHours: 40,
    passingScore: 75,
    examDuration: 90,
    domains: [
      { name: "Kubernetes Fundamentals", weight: 46 },
      { name: "Container Orchestration", weight: 22 },
      { name: "Cloud Native Architecture", weight: 16 },
      { name: "Cloud Native Observability", weight: 8 },
      { name: "Cloud Native Application Delivery", weight: 8 },
    ],
    channelMappings: ["kubernetes", "devops"],
    officialUrl: "https://www.cncf.io/certification/kcna/",
  },
];

function getCertQuestionCount(certId: string): number {
  try {
    const result = execSync(
      `curl -s "${API_BASE}/api/certifications/${certId}/questions?limit=500"`,
      { encoding: "utf8", timeout: 10_000 }
    );
    const data = JSON.parse(result);
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

function buildPrompt(cert: CertConfig, needed: number): string {
  const seedFile = `scripts/temp-seed-cert-${cert.id}.ts`;
  const domainsJson = JSON.stringify(cert.domains);
  const channelMappingsJson = JSON.stringify(cert.channelMappings);
  const tagsJson = JSON.stringify([cert.id, cert.category, cert.provider.toLowerCase()]);

  return `You are a certification exam expert building content for DevPrep, a technical interview prep platform.

TASK: Generate exactly ${needed} high-quality MCQ questions for the "${cert.name}" (${cert.examCode}) certification and INSERT them into the local SQLite database.

━━━ IMPORTANT: Script must live in the WORKSPACE directory (not /tmp) ━━━
Working directory: /home/runner/workspace
Seed script path: ${seedFile}

━━━ STEP 1a: Insert the certification track record (if not exists) ━━━

\`\`\`typescript
import { createClient } from "@libsql/client";
import crypto from "crypto";

const client = createClient({ url: "file:local.db" });

const certId = "${cert.id}";
const certRecord = {
  id: certId,
  name: "${cert.name}",
  provider: "${cert.provider}",
  description: "${cert.description}",
  examCode: "${cert.examCode}",
  category: "${cert.category}",
  difficulty: "${cert.difficulty}",
  estimatedHours: ${cert.estimatedHours},
  passingScore: ${cert.passingScore},
  examDuration: ${cert.examDuration},
  domains: JSON.stringify(${domainsJson}),
  channelMappings: JSON.stringify(${channelMappingsJson}),
  tags: JSON.stringify(${tagsJson}),
  officialUrl: "${cert.officialUrl}",
  status: "active",
  questionCount: ${needed},
};

// MCQ questions — ${needed} items
const questions = [
  // see shape below
];

async function main() {
  // Upsert certification track
  await client.execute({
    sql: \`INSERT OR REPLACE INTO certifications (id, name, provider, description, exam_code, category, difficulty, estimated_hours, passing_score, exam_duration, domains, channel_mappings, tags, official_url, status, question_count, created_at, last_updated)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)\`,
    args: [certRecord.id, certRecord.name, certRecord.provider, certRecord.description, certRecord.examCode, certRecord.category, certRecord.difficulty, certRecord.estimatedHours, certRecord.passingScore, certRecord.examDuration, certRecord.domains, certRecord.channelMappings, certRecord.tags, certRecord.officialUrl, certRecord.status, certRecord.questionCount, new Date().toISOString(), new Date().toISOString()],
  });
  console.log("Upserted certification:", certRecord.name);

  // Insert MCQ questions as regular questions with certificationId metadata
  for (const q of questions) {
    await client.execute({
      sql: \`INSERT OR IGNORE INTO questions (id, question, answer, explanation, difficulty, tags, channel, sub_channel, status, is_new, created_at, last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)\`,
      args: [q.id, q.question, q.answer, q.explanation, q.difficulty, q.tags, q.channel, q.subChannel, "active", 1, q.createdAt, q.createdAt],
    });
    console.log("Inserted MCQ:", q.question.slice(0, 65));
  }
  client.close();
  console.log("Done!");
}
main().catch(e => { console.error(e.message); process.exit(1); });
\`\`\`

━━━ MCQ QUESTION OBJECT SHAPE ━━━
{
  id: crypto.randomUUID(),
  question: "...",         // Scenario-based MCQ. Include 4 options labeled A) B) C) D) in the question text
  answer: "...",           // "The correct answer is X) ... because ..."
  explanation: "...",      // 200-300 words markdown. Why correct is correct, why others are wrong.
  difficulty: "beginner" | "intermediate" | "advanced",
  tags: JSON.stringify(["${cert.id}", "<domain>", "${cert.provider.toLowerCase()}"]),
  channel: "<one of: ${cert.channelMappings.join(", ")}>",
  subChannel: "<relevant sub-topic>",
  createdAt: new Date().toISOString(),
}

━━━ CERTIFICATION CONTEXT ━━━
Name: ${cert.name}
Exam Code: ${cert.examCode}
Provider: ${cert.provider}
Domains (with weights):
${cert.domains.map((d) => `  - ${d.name} (${d.weight}%)`).join("\n")}

━━━ QUALITY REQUIREMENTS ━━━
- Questions MUST be scenario-based (not pure trivia)
- All 4 options must be plausible (no obviously wrong distractors)
- No "all of the above" or "none of the above"
- Distribute across all domains proportional to their weights
- Difficulty: 30% beginner, 50% intermediate, 20% advanced
- explanation MUST explain why each wrong option is incorrect

━━━ STEP 2: Run the script ━━━
npx tsx ${seedFile}

━━━ STEP 3: Verify it worked ━━━
curl -s "http://localhost:5000/api/certifications" | python3 -c "import json,sys; d=json.load(sys.stdin); certs=[c for c in (d if isinstance(d,list) else []) if c.get('id')=='${cert.id}']; print('${cert.id}:', certs[0].get('questionCount',0) if certs else 0, 'questions')"

━━━ STEP 4: Clean up ━━━
rm -f ${seedFile}`;
}

function generateForCert(cert: CertConfig, needed: number): boolean {
  const prompt = buildPrompt(cert, needed);
  const promptFile = `/tmp/prompt-cert-${cert.id}.txt`;
  fs.writeFileSync(promptFile, prompt, "utf8");

  info(`Running opencode for: ${cert.id} — ${cert.name} (${needed} questions needed)`);

  const result = spawnSync(
    OPENCODE,
    ["run", "--agent", "content-certification-expert", prompt],
    {
      timeout: TIMEOUT_SECS * 1000,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  fs.rmSync(promptFile, { force: true });

  if (result.status === 0) {
    ok(`${cert.id} — opencode completed`);
    return true;
  } else if (result.signal === "SIGTERM") {
    warn(`${cert.id} — timed out after ${TIMEOUT_SECS}s`);
    return false;
  } else {
    err(`${cert.id} — failed (exit ${result.status})`);
    const output = ((result.stdout || "") + (result.stderr || "")).trim().split("\n");
    output.slice(-5).forEach((l) => console.log(`    ${l}`));
    return false;
  }
}

async function main() {
  console.log("\n" + "═".repeat(62));
  console.log("  DevPrep Certification Content Generation Pipeline");
  console.log(`  Target: ≥${MIN_QUESTIONS} questions per certification`);
  if (SINGLE_CERT) {
    console.log(`  Mode: single cert → ${SINGLE_CERT}`);
  } else {
    console.log(`  Certifications: ${CERTIFICATIONS.length} tracks`);
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

  const certsToProcess = SINGLE_CERT
    ? CERTIFICATIONS.filter((c) => c.id === SINGLE_CERT)
    : CERTIFICATIONS;

  if (SINGLE_CERT && certsToProcess.length === 0) {
    err(`Unknown cert: ${SINGLE_CERT}`);
    err(`Available: ${CERTIFICATIONS.map((c) => c.id).join(", ")}`);
    process.exit(1);
  }

  const results: { cert: string; status: "ok" | "skip" | "fail" }[] = [];

  for (const cert of certsToProcess) {
    const current = getCertQuestionCount(cert.id);
    log(`${cert.id}: ${current} questions in DB (target: ${cert.targetQuestions})`);

    if (current >= MIN_QUESTIONS) {
      warn(`${cert.id} — already has ${current} ≥ ${MIN_QUESTIONS}, skipping`);
      results.push({ cert: cert.id, status: "skip" });
      continue;
    }

    const needed = Math.min(cert.targetQuestions - current, 40); // max 40 per run
    const success = generateForCert(cert, needed);
    results.push({ cert: cert.id, status: success ? "ok" : "fail" });
  }

  console.log("\n" + "═".repeat(62));
  console.log("  Summary");
  console.log("═".repeat(62));
  for (const r of results) {
    const icon = r.status === "ok" ? "✓" : r.status === "skip" ? "–" : "✗";
    const color = r.status === "ok" ? C.green : r.status === "skip" ? C.yellow : C.red;
    console.log(`  ${color}${icon}${C.reset} ${r.cert} → ${r.status}`);
  }
  console.log("═".repeat(62) + "\n");
}

main();
