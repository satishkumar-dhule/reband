#!/usr/bin/env npx tsx
/**
 * Swarm E2E Orchestrator - 100 Iterations with Auto-Fix
 * 
 * Spawns 10 parallel QA agents per iteration running E2E tests.
 * Automatically spawns fix agents when tests fail.
 * Runs for 100 iterations with comprehensive reporting.
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  AGENT_COUNT: 10,
  MAX_ITERATIONS: 100,
  ITERATION_DELAY_MS: 15000, // 15s between iterations
  TEST_TIMEOUT_MS: 120000, // 2 min per test
  FIX_TIMEOUT_MS: 60000, // 1 min per fix
  RESULTS_DIR: '/tmp/swarm-e2e-results',
  LOG_DIR: '/tmp/swarm-e2e-logs',
};

// Test suites to rotate through
const TEST_SUITES = [
  'e2e/smoke/unified-smoke.spec.ts',
  'e2e/comprehensive/core-flows.spec.ts',
  'e2e/unified/test-session.spec.ts',
  'e2e/channels.spec.ts',
  'e2e/core.spec.ts',
  'e2e/home.spec.ts',
  'e2e/coding.spec.ts',
  'e2e/voice-session.spec.ts',
];

// Fix agents that can be spawned
const FIX_AGENTS = [
  { name: 'devprep-code-reviewer', task: 'Review failed E2E tests and identify root cause' },
  { name: 'devprep-frontend-designer', task: 'Fix UI/UX issues causing test failures' },
  { name: 'devprep-bug-css', task: 'Fix CSS/styling bugs causing visual test failures' },
  { name: 'devprep-bug-events', task: 'Fix event handling bugs' },
  { name: 'devprep-bug-logic', task: 'Fix business logic bugs' },
  { name: 'devprep-web-reviewer', task: 'Review and fix web interface issues' },
];

interface AgentReport {
  agentId: number;
  iteration: number;
  suite: string;
  status: 'passed' | 'failed' | 'error';
  duration: number;
  errorOutput?: string;
  timestamp: Date;
}

interface IterationReport {
  iteration: number;
  startTime: Date;
  endTime?: Date;
  agents: AgentReport[];
  totalPassed: number;
  totalFailed: number;
  totalErrors: number;
  fixAgentsSpawned: number;
  cumulativePassRate: number;
}

interface SwarmSummary {
  startTime: Date;
  endTime?: Date;
  totalIterations: number;
  completedIterations: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalErrors: number;
  totalFixAgents: number;
  iterations: IterationReport[];
}

// Ensure directories exist
function ensureDirectories(): void {
  if (!existsSync(CONFIG.RESULTS_DIR)) {
    mkdirSync(CONFIG.RESULTS_DIR, { recursive: true });
  }
  if (!existsSync(CONFIG.LOG_DIR)) {
    mkdirSync(CONFIG.LOG_DIR, { recursive: true });
  }
}

// Console colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

function log(message: string, color: string = colors.blue): void {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`${color}[${timestamp}]${colors.reset} ${message}`);
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string): void {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message: string): void {
  log(`⚠️ ${message}`, colors.yellow);
}

function logAgent(message: string): void {
  log(`🤖 ${message}`, colors.cyan);
}

// Get test suite for agent (rotate based on agent ID and iteration)
function getTestSuite(agentId: number, iteration: number): string {
  const index = (agentId + iteration) % TEST_SUITES.length;
  return TEST_SUITES[index];
}

// Run a single E2E test
async function runTest(
  agentId: number,
  suite: string,
  iteration: number
): Promise<AgentReport> {
  const startTime = Date.now();
  const logFile = join(CONFIG.LOG_DIR, `agent-${agentId}-iter${iteration}.log`);

  logAgent(`Agent-${agentId}: Starting ${suite}`);

  try {
    const { stdout, stderr } = await execAsync(
      `cd /home/runner/workspace && npx playwright test "${suite}" --reporter=list --timeout=${CONFIG.TEST_TIMEOUT_MS / 1000} 2>&1`,
      { timeout: CONFIG.TEST_TIMEOUT_MS + 30000 }
    );

    const output = stdout + stderr;
    writeFileSync(logFile, output);

    const duration = Date.now() - startTime;
    const passed = output.includes('passed') && !output.includes('failed');
    const failed = output.includes('failed') || output.includes('Error');

    const status = passed ? 'passed' : failed ? 'failed' : 'passed';

    if (status === 'passed') {
      logSuccess(`Agent-${agentId}: PASSED ${suite} (${duration}ms)`);
    } else {
      logError(`Agent-${agentId}: FAILED ${suite} (${duration}ms)`);
    }

    return {
      agentId,
      iteration,
      suite,
      status,
      duration,
      errorOutput: status === 'failed' ? output.slice(-500) : undefined,
      timestamp: new Date(),
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error.message || 'Unknown error';
    writeFileSync(logFile, errorMessage);

    logError(`Agent-${agentId}: ERROR ${suite} - ${errorMessage.slice(0, 100)}`);

    return {
      agentId,
      iteration,
      suite,
      status: 'error',
      duration,
      errorOutput: errorMessage.slice(-500),
      timestamp: new Date(),
    };
  }
}

// Spawn a fix agent based on failed tests
async function spawnFixAgent(
  iteration: number,
  failedReports: AgentReport[]
): Promise<void> {
  const fixAgent = FIX_AGENTS[Math.floor(Math.random() * FIX_AGENTS.length)];

  // Build context from failed tests
  const errorContext = failedReports
    .map((r) => `- ${r.suite}: ${r.errorOutput?.slice(0, 200) || 'No error details'}`)
    .join('\n');

  const prompt = `${fixAgent.task}. 

Context - Failed tests in iteration ${iteration}:
${errorContext}

Analyze the failures and suggest fixes. Look for:
1. UI selector changes
2. Timing issues
3. State management problems
4. CSS/styling regressions
5. API/data issues

Provide specific file paths and code changes needed.`;

  log(`📦 Spawning ${fixAgent.name}...`, colors.magenta);

  // Spawn in background
  spawn('opencode', ['run', '--agent', fixAgent.name, prompt], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
  }).unref();
}

// Run a single iteration with 10 parallel agents
async function runIteration(
  iteration: number,
  previousReports: AgentReport[]
): Promise<IterationReport> {
  const startTime = new Date();

  console.log('\n' + '═'.repeat(70));
  console.log(
    `${colors.cyan}🚀 ITERATION ${iteration}/${CONFIG.MAX_ITERATIONS} - ${CONFIG.AGENT_COUNT} QA Agents${colors.reset}`
  );
  console.log('═'.repeat(70) + '\n');

  const promises = Array.from({ length: CONFIG.AGENT_COUNT }, (_, i) => {
    const agentId = i + 1;
    const suite = getTestSuite(agentId, iteration);
    return runTest(agentId, suite, iteration);
  });

  const results = await Promise.allSettled(promises);

  const agents: AgentReport[] = [];
  const failedReports: AgentReport[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      agents.push(result.value);
      if (result.value.status !== 'passed') {
        failedReports.push(result.value);
      }
    }
  }

  const totalPassed = agents.filter((a) => a.status === 'passed').length;
  const totalFailed = agents.filter((a) => a.status === 'failed').length;
  const totalErrors = agents.filter((a) => a.status === 'error').length;

  // Spawn fix agents if there are failures
  let fixAgentsSpawned = 0;
  if (failedReports.length > 0) {
    logWarning(
      `${failedReports.length} tests failed, spawning fix agents...`
    );
    // Spawn 1-2 fix agents based on number of failures
    const numFixes = Math.min(2, Math.ceil(failedReports.length / 3));
    for (let i = 0; i < numFixes; i++) {
      await spawnFixAgent(iteration, failedReports);
      fixAgentsSpawned++;
    }
  }

  // Calculate cumulative pass rate
  const allReports = [...previousReports, ...agents];
  const cumulativePassed = allReports.filter((a) => a.status === 'passed').length;
  const cumulativePassRate = (cumulativePassed / allReports.length) * 100;

  const endTime = new Date();

  // Print iteration summary
  console.log('\n' + '─'.repeat(50));
  console.log(`📊 Iteration ${iteration} Summary:`);
  console.log(
    `   ${colors.green}✅ Passed: ${totalPassed}/${CONFIG.AGENT_COUNT}${colors.reset}`
  );
  console.log(
    `   ${colors.red}❌ Failed: ${totalFailed}${colors.reset}`
  );
  console.log(
    `   ${colors.yellow}⚠️  Errors: ${totalErrors}${colors.reset}`
  );
  if (fixAgentsSpawned > 0) {
    console.log(
      `   ${colors.magenta}📦 Fix agents spawned: ${fixAgentsSpawned}${colors.reset}`
    );
  }
  console.log(
    `   ${colors.cyan}📈 Cumulative pass rate: ${cumulativePassRate.toFixed(1)}%${colors.reset}`
  );
  console.log('─'.repeat(50) + '\n');

  return {
    iteration,
    startTime,
    endTime,
    agents,
    totalPassed,
    totalFailed,
    totalErrors,
    fixAgentsSpawned,
    cumulativePassRate,
  };
}

// Generate final summary report
function generateSummary(summary: SwarmSummary): void {
  const endTime = new Date();
  summary.endTime = endTime;

  const duration = (endTime.getTime() - summary.startTime.getTime()) / 1000;
  const passRate = (summary.totalPassed / summary.totalTests) * 100;

  console.log('\n');
  console.log(colors.bgGreen + colors.white + ' ' + colors.reset);
  console.log(
    `${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.cyan}║     🐝 SWARM E2E TEST - FINAL SUMMARY REPORT 🐝         ║${colors.reset}`
  );
  console.log(
    `${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`
  );
  console.log('');

  console.log(`${colors.cyan}📊 EXECUTION SUMMARY${colors.reset}`);
  console.log('─'.repeat(50));
  console.log(`   Total Duration: ${duration.toFixed(1)}s (${(duration / 60).toFixed(1)}min)`);
  console.log(`   Iterations: ${summary.completedIterations}/${CONFIG.MAX_ITERATIONS}`);
  console.log(`   Total Tests: ${summary.totalTests}`);
  console.log(
    `   ${colors.green}✅ Passed: ${summary.totalPassed}${colors.reset}`
  );
  console.log(
    `   ${colors.red}❌ Failed: ${summary.totalFailed}${colors.reset}`
  );
  console.log(
    `   ${colors.yellow}⚠️  Errors: ${summary.totalErrors}${colors.reset}`
  );
  console.log(`   Overall Pass Rate: ${passRate.toFixed(1)}%`);
  console.log(`   ${colors.magenta}📦 Total Fix Agents: ${summary.totalFixAgents}${colors.reset}`);
  console.log('─'.repeat(50));

  // Iteration-by-iteration breakdown
  console.log(`\n${colors.cyan}📈 ITERATION PROGRESS${colors.reset}`);
  console.log('─'.repeat(50));

  for (const iter of summary.iterations.slice(-10)) {
    const iterPassRate =
      iter.totalPassed / CONFIG.AGENT_COUNT;
    const bar = '█'.repeat(Math.round(iterPassRate * 20));
    const color =
      iterPassRate === 1
        ? colors.green
        : iterPassRate >= 0.7
        ? colors.yellow
        : colors.red;
    console.log(
      `   Iter ${iter.iteration.toString().padStart(3)}: ${color}${bar.padEnd(20)}${colors.reset} ${iterPassRate.toFixed(0)}% (${iter.totalPassed}/${CONFIG.AGENT_COUNT})`
    );
  }

  if (summary.iterations.length > 10) {
    console.log(`   ... (showing last 10 of ${summary.iterations.length} iterations)`);
  }

  // Identify persistent issues
  console.log(`\n${colors.cyan}🔍 PERSISTENT FAILURE ANALYSIS${colors.reset}`);
  console.log('─'.repeat(50));

  const failedSuites: Record<string, number> = {};
  for (const iter of summary.iterations) {
    for (const agent of iter.agents) {
      if (agent.status !== 'passed') {
        failedSuites[agent.suite] = (failedSuites[agent.suite] || 0) + 1;
      }
    }
  }

  const sortedSuites = Object.entries(failedSuites)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sortedSuites.length > 0) {
    for (const [suite, count] of sortedSuites) {
      const failureRate = ((count / summary.completedIterations) * 100).toFixed(0);
      console.log(`   ${colors.red}●${colors.reset} ${suite}: Failed ${count} times (${failureRate}% of iterations)`);
    }
  } else {
    console.log(`   ${colors.green}✓ No persistent failures detected!${colors.reset}`);
  }

  // Save detailed report
  const reportPath = join(CONFIG.RESULTS_DIR, 'swarm-e2e-report.json');
  writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Save summary markdown
  const markdownReport = `# Swarm E2E Test Report

## Summary
- **Duration**: ${(duration / 60).toFixed(1)} minutes
- **Iterations**: ${summary.completedIterations}/${CONFIG.MAX_ITERATIONS}
- **Total Tests**: ${summary.totalTests}
- **Pass Rate**: ${passRate.toFixed(1)}%
- **Passed**: ${summary.totalPassed}
- **Failed**: ${summary.totalFailed}
- **Errors**: ${summary.totalErrors}
- **Fix Agents**: ${summary.totalFixAgents}

## Persistent Issues
${sortedSuites
  .map(([suite, count]) => `- ${suite}: Failed ${count} times`)
  .join('\n') || 'None detected'}

## Last 10 Iterations
| Iter | Passed | Failed | Errors | Pass Rate |
|------|--------|--------|--------|-----------|
${summary.iterations
  .slice(-10)
  .map(
    (i) =>
      `| ${i.iteration} | ${i.totalPassed} | ${i.totalFailed} | ${i.totalErrors} | ${((i.totalPassed / CONFIG.AGENT_COUNT) * 100).toFixed(0)}% |`
  )
  .join('\n')}
`;

  const markdownPath = join(CONFIG.RESULTS_DIR, 'swarm-e2e-report.md');
  writeFileSync(markdownPath, markdownReport);
  console.log(`📝 Markdown report saved to: ${markdownPath}`);
}

// Main orchestrator
async function main(): Promise<void> {
  ensureDirectories();

  console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🐝 SWARM E2E ORCHESTRATOR - 100 ITERATIONS 🐝          ║
║                                                            ║
║   • ${CONFIG.AGENT_COUNT} QA Agents running E2E tests in parallel            ║
║   • Auto-fix agents spawned on failures                    ║
║   • Comprehensive reporting after each iteration           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  const summary: SwarmSummary = {
    startTime: new Date(),
    totalIterations: CONFIG.MAX_ITERATIONS,
    completedIterations: 0,
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    totalErrors: 0,
    totalFixAgents: 0,
    iterations: [],
  };

  const allAgentReports: AgentReport[] = [];

  // Check if dev server is running
  try {
    await execAsync('curl -s http://localhost:5001 > /dev/null 2>&1');
    logSuccess('Dev server is running on port 5001');
  } catch {
    logWarning('Dev server not detected. Starting...');
    spawn('npm', ['run', 'dev:vite'], {
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore'],
    }).unref();
    await new Promise((resolve) => setTimeout(resolve, 10000));
    logSuccess('Dev server started');
  }

  // Run iterations
  for (let iteration = 1; iteration <= CONFIG.MAX_ITERATIONS; iteration++) {
    try {
      const iterationReport = await runIteration(iteration, allAgentReports);

      summary.iterations.push(iterationReport);
      summary.completedIterations++;
      summary.totalTests += iterationReport.agents.length;
      summary.totalPassed += iterationReport.totalPassed;
      summary.totalFailed += iterationReport.totalFailed;
      summary.totalErrors += iterationReport.totalErrors;
      summary.totalFixAgents += iterationReport.fixAgentsSpawned;

      allAgentReports.push(...iterationReport.agents);

      // Save progress after each iteration
      const progressPath = join(CONFIG.RESULTS_DIR, 'progress.json');
      writeFileSync(
        progressPath,
        JSON.stringify(
          {
            currentIteration: iteration,
            totalPassed: summary.totalPassed,
            totalTests: summary.totalTests,
            passRate: ((summary.totalPassed / summary.totalTests) * 100).toFixed(1),
          },
          null,
          2
        )
      );

      // Check for early termination (all tests passing consistently)
      if (
        iteration >= 10 &&
        iterationReport.totalPassed === CONFIG.AGENT_COUNT
      ) {
        const last10 = summary.iterations.slice(-10);
        const allPassed = last10.every(
          (i) => i.totalPassed === CONFIG.AGENT_COUNT
        );
        if (allPassed) {
          logSuccess('All tests passing consistently for 10 iterations!');
          logSuccess('Early termination - swarm succeeded!');
          break;
        }
      }

      // Delay before next iteration
      if (iteration < CONFIG.MAX_ITERATIONS) {
        log(
          `⏳ Next iteration in ${CONFIG.ITERATION_DELAY_MS / 1000}s...`,
          colors.yellow
        );
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.ITERATION_DELAY_MS)
        );
      }
    } catch (error: any) {
      logError(`Iteration ${iteration} error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Generate final summary
  generateSummary(summary);

  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Swarm interrupted. Generating partial report...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Swarm terminated. Generating partial report...');
  process.exit(0);
});

// Start the swarm
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
