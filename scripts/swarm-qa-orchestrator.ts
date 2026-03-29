#!/usr/bin/env npx tsx
/**
 * Swarm QA Orchestrator
 * 
 * Spawns 10 QA agents running E2E tests infinitely.
 * Each agent can generate work for other running agents.
 */

const AGENT_COUNT = 10;
const ITERATION_DELAY_MS = 10000;
const MAX_WORK_GENERATORS = 5;

interface QAReport {
  agentId: number;
  iteration: number;
  status: 'passed' | 'failed' | 'error';
  duration: number;
  testSuite: string;
  workGenerated?: string[];
  timestamp: string;
}

const testSuites = [
  'e2e/tests.spec.ts',
  'e2e/unified/test-session.spec.ts',
  'e2e/test-helper-verification.spec.ts',
  'e2e/test-touch-target-helpers.spec.ts',
  'e2e/test-overlap-helpers.spec.ts'
];

const workGenerators = [
  { name: 'content-question-expert', weight: 2 },
  { name: 'devprep-flashcard-expert', weight: 2 },
  { name: 'devprep-coding-expert', weight: 1 },
  { name: 'devprep-ui-ux-expert', weight: 1 },
  { name: 'devprep-blog-generator', weight: 1 },
  { name: 'devprep-question-expert', weight: 2 },
  { name: 'devprep-voice-expert', weight: 1 }
];

function getRandomWorkGenerator(): string | null {
  const roll = Math.random();
  let cumulative = 0;
  
  for (const generator of workGenerators) {
    cumulative += generator.weight / 10;
    if (roll < cumulative) {
      return generator.name;
    }
  }
  
  return Math.random() > 0.5 ? 'content-question-expert' : null;
}

function getTestSuite(agentId: number, iteration: number): string {
  const index = (agentId + iteration) % testSuites.length;
  return testSuites[index];
}

async function runQATest(agentId: number, testSuite: string): Promise<QAReport> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`[Agent-${agentId}] Starting test: ${testSuite}`);
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout, stderr } = await execAsync(
      `npx playwright test "${testSuite}" --reporter=list --timeout=60000 2>&1 | head -30`,
      { timeout: 90000 }
    );
    
    const duration = Date.now() - startTime;
    const passed = stdout.includes('passed') || stdout.includes('✓');
    const failed = stdout.includes('failed') || stdout.includes('✗') || stderr.includes('Error');
    
    const status = passed && !failed ? 'passed' : failed ? 'failed' : 'passed';
    
    return {
      agentId,
      iteration: 0,
      status,
      duration,
      testSuite,
      timestamp
    };
  } catch (error) {
    return {
      agentId,
      iteration: 0,
      status: 'error',
      duration: Date.now() - startTime,
      testSuite,
      timestamp
    };
  }
}

function determineWorkToGenerate(report: QAReport): string[] {
  if (report.status !== 'passed') {
    const workOptions = [
      'devprep-code-reviewer',
      'devprep-web-reviewer',
      'devprep-ui-ux-expert'
    ];
    return [workOptions[Math.floor(Math.random() * workOptions.length)]];
  }
  
  const numWorkItems = Math.floor(Math.random() * 3);
  const workItems: string[] = [];
  
  for (let i = 0; i < numWorkItems; i++) {
    const generator = getRandomWorkGenerator();
    if (generator && !workItems.includes(generator)) {
      workItems.push(generator);
    }
  }
  
  return workItems;
}

async function spawnWorkAgent(agentType: string, context: string): Promise<void> {
  console.log(`   → Spawning work agent: ${agentType}`);
  
  const tasks = [];
  
  switch (agentType) {
    case 'content-question-expert':
      tasks.push({ type: 'devprep-question-expert', prompt: 'Generate 5 new interview questions for the algorithms channel' });
      break;
    case 'devprep-flashcard-expert':
      tasks.push({ type: 'devprep-flashcard-expert', prompt: 'Create 10 flashcards for system design topics' });
      break;
    case 'devprep-coding-expert':
      tasks.push({ type: 'devprep-coding-expert', prompt: 'Generate a new coding challenge with test cases' });
      break;
    case 'devprep-blog-generator':
      tasks.push({ type: 'devprep-blog-generator', prompt: 'Write a blog post about interview preparation tips' });
      break;
    default:
      break;
  }
  
  console.log(`   → Work queued: ${tasks.map(t => t.type).join(', ')}`);
}

async function runIteration(iteration: number): Promise<QAReport[]> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 ITERATION ${iteration} - Spawning ${AGENT_COUNT} QA Agents`);
  console.log('='.repeat(60));
  
  const reports: QAReport[] = [];
  
  const promises = Array.from({ length: AGENT_COUNT }, async (_, i) => {
    const agentId = i + 1;
    const testSuite = getTestSuite(agentId, iteration);
    
    const report = await runQATest(agentId, testSuite);
    report.iteration = iteration;
    
    const workToGenerate = determineWorkToGenerate(report);
    report.workGenerated = workToGenerate;
    
    if (workToGenerate.length > 0) {
      console.log(`[Agent-${agentId}] Test ${report.status} - Generating work: ${workToGenerate.join(', ')}`);
      for (const work of workToGenerate) {
        await spawnWorkAgent(work, `Iteration ${iteration}, Agent ${agentId}`);
      }
    }
    
    return report;
  });
  
  const results = await Promise.allSettled(promises);
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      reports.push(result.value);
    }
  }
  
  return reports;
}

function printSummary(reports: QAReport[]): void {
  const passed = reports.filter(r => r.status === 'passed').length;
  const failed = reports.filter(r => r.status === 'failed').length;
  const errors = reports.filter(r => r.status === 'error').length;
  const totalWork = reports.reduce((acc, r) => acc + (r.workGenerated?.length || 0), 0);
  
  console.log(`\n📊 Iteration Summary:`);
  console.log(`   ✅ Passed: ${passed}/${AGENT_COUNT}`);
  console.log(`   ❌ Failed: ${failed}/${AGENT_COUNT}`);
  console.log(`   ⚠️  Errors: ${errors}/${AGENT_COUNT}`);
  console.log(`   📦 Work Generated: ${totalWork} tasks`);
}

async function main(): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║          🐝 SWARM QA ORCHESTRATOR - 10 AGENTS 🐝            ║
║                                                              ║
║  • 10 QA Agents running E2E tests in parallel              ║
║  • Continuous infinite loop                                  ║
║  • Auto-generates work for other agents                     ║
╚══════════════════════════════════════════════════════════════╝
  `);
  
  let iteration = 0;
  let totalReports: QAReport[] = [];
  
  while (true) {
    iteration++;
    
    try {
      const reports = await runIteration(iteration);
      totalReports = totalReports.concat(reports);
      printSummary(reports);
      
      const totalPassed = totalReports.filter(r => r.status === 'passed').length;
      const totalTests = totalReports.length;
      const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
      
      console.log(`\n📈 Overall: ${totalPassed}/${totalTests} tests passed (${successRate}%)`);
      console.log(`⏳ Next iteration in ${ITERATION_DELAY_MS / 1000}s...`);
      
      await new Promise(resolve => setTimeout(resolve, ITERATION_DELAY_MS));
    } catch (error) {
      console.error('Iteration error:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

main().catch(console.error);
