#!/usr/bin/env npx tsx
/**
 * Swarm QA with Real Opencode Agents
 * 
 * Spawns 10 QA agents that run E2E tests and generate work
 * for other opencode agents using the Task tool.
 */

import { task as opencodeTask } from './lib/task-orchestrator';

const AGENT_COUNT = 10;
const ITERATION_DELAY_MS = 15000;

interface TestResult {
  agentId: number;
  suite: string;
  passed: boolean;
  duration: number;
  errors?: string[];
}

const testSuites = [
  'e2e/tests.spec.ts',
  'e2e/unified/test-session.spec.ts',
  'e2e/test-helper-verification.spec.ts',
  'e2e/test-touch-target-helpers.spec.ts',
  'e2e/test-overlap-helpers.spec.ts'
];

const workGenerators = [
  { type: 'devprep-question-expert', task: 'Generate 5 new interview questions for system design' },
  { type: 'devprep-flashcard-expert', task: 'Create 10 flashcards for algorithms' },
  { type: 'devprep-coding-expert', task: 'Generate a coding challenge with test cases' },
  { type: 'devprep-blog-generator', task: 'Write a blog post about interview preparation' },
  { type: 'devprep-ui-ux-expert', task: 'Review the homepage UI and suggest improvements' },
  { type: 'devprep-code-reviewer', task: 'Review recent code changes for best practices' },
  { type: 'devprep-seo-audit', task: 'Audit the website for SEO issues' }
];

async function runPlaywrightTest(suite: string): Promise<TestResult> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  const startTime = Date.now();
  const agentId = Math.floor(Math.random() * 1000);
  
  try {
    const { stdout } = await execAsync(
      `npx playwright test "${suite}" --reporter=list --timeout=30000 2>&1 | tail -10`,
      { timeout: 45000 }
    );
    
    const passed = stdout.includes('passed') || !stdout.includes('failed');
    
    return {
      agentId,
      suite,
      passed,
      duration: Date.now() - startTime
    };
  } catch (error: any) {
    return {
      agentId,
      suite,
      passed: false,
      duration: Date.now() - startTime,
      errors: [error.message]
    };
  }
}

async function spawnWorkAgent(agentType: string, taskDescription: string): Promise<void> {
  console.log(`   → 🤖 Spawning ${agentType}: ${taskDescription}`);
  
  try {
    await opencodeTask({
      description: `${agentType} task`,
      prompt: taskDescription,
      subagent_type: agentType as any
    });
    console.log(`   ✅ ${agentType} completed`);
  } catch (error) {
    console.log(`   ⚠️ ${agentType} failed:`, error);
  }
}

async function runQAAgent(agentId: number): Promise<TestResult> {
  const suite = testSuites[agentId % testSuites.length];
  console.log(`[QA-Agent-${agentId}] Testing: ${suite}`);
  return runPlaywrightTest(suite);
}

async function generateWorkForAgents(testResults: TestResult[]): Promise<void> {
  const failedTests = testResults.filter(r => !r.passed);
  
  if (failedTests.length > 0) {
    console.log(`\n⚠️ ${failedTests.length} tests failed - generating review work...`);
    await spawnWorkAgent('devprep-code-reviewer', 'Review E2E test failures and suggest fixes');
    await spawnWorkAgent('devprep-web-reviewer', 'Check for UI regression issues');
  }
  
  const passedTests = testResults.filter(r => r.passed);
  if (passedTests.length > 0 && Math.random() > 0.5) {
    console.log(`\n✅ Tests passed - generating content work...`);
    const randomGenerator = workGenerators[Math.floor(Math.random() * workGenerators.length)];
    await spawnWorkAgent(randomGenerator.type, randomGenerator.task);
  }
}

async function runIteration(iteration: number): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 ITERATION ${iteration} - 10 QA Agents Running`);
  console.log('='.repeat(60));
  
  const promises = Array.from({ length: AGENT_COUNT }, (_, i) => runQAAgent(i + 1));
  const results = await Promise.all(promises);
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\n📊 Results: ${passed}/${AGENT_COUNT} passed, ${failed} failed`);
  
  await generateWorkForAgents(results);
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║     🐝 SWARM QA - 10 AGENTS WITH WORK GENERATION 🐝       ║
║                                                              ║
║  • 10 QA Agents run E2E tests in parallel                  ║
║  • Failed tests → spawn code reviewers                       ║
║  • Passed tests → spawn content generators                   ║
║  • Continuous infinite loop                                  ║
╚══════════════════════════════════════════════════════════════╝
  `);
  
  let iteration = 0;
  
  while (true) {
    iteration++;
    try {
      await runIteration(iteration);
      console.log(`\n⏳ Next iteration in ${ITERATION_DELAY_MS / 1000}s...`);
      await new Promise(r => setTimeout(r, ITERATION_DELAY_MS));
    } catch (error) {
      console.error('Iteration error:', error);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

main().catch(console.error);
