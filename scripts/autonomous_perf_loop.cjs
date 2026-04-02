// Autonomous perf loop: runs perf-measure 100 times, analyzes for latency, and emits CORRECTION REQUESTs for fixes
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ITERATIONS = parseInt(process.env.ITERATIONS || '100', 10);
const THRESHOLD_MS = 5; // latency threshold for action (5ms - extreme limit)
// timestamped run root for artifacts
const RUN_ID = new Date().toISOString().replace(/[:.]/g, '-');
const RUN_ROOT = path.join('perf', 'run-' + RUN_ID);
fs.mkdirSync(RUN_ROOT, { recursive: true });
const PERF_OUT_BASE = 'perf/run';
const URLS = [
  'https://open-interview.github.io/',
  'https://open-interview.github.io/channel-browser',
  'https://open-interview.github.io/channel/frontend',
  'https://open-interview.github.io/channel/backend',
  'https://open-interview.github.io/channel/devops',
  'https://open-interview.github.io/channel/kubernetes',
  'https://open-interview.github.io/channel/aws',
  'https://open-interview.github.io/channel/data-structures',
  'https://open-interview.github.io/channel/system-design',
  'https://open-interview.github.io/practice',
  'https://open-interview.github.io/practice/frontend',
  'https://open-interview.github.io/practice/backend',
  'https://open-interview.github.io/practice/algorithms',
  'https://open-interview.github.io/paths',
  'https://open-interview.github.io/learning-paths',
  'https://open-interview.github.io/flashcards',
  'https://open-interview.github.io/settings',
  'https://open-interview.github.io/profile',
  'https://open-interview.github.io/search',
  'https://open-interview.github.io/interview'
];

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function readJson(filePath){
  if(!fs.existsSync(filePath)) return null;
  try { const s = fs.readFileSync(filePath, 'utf8'); return JSON.parse(s); } catch(e){ return null; }
}

async function measureOnce(iter) {
  const outDir = path.join(RUN_ROOT, `iter-${iter}`);
  // ensure dir exists
  fs.mkdirSync(outDir, { recursive: true });
  // invoke perf tool with explicit out dir and URLs
  // Use the CommonJS-compatible perf tool to avoid ESM issues in this context
  const cmd = `node scripts/measure-perf.cjs --urls ${URLS.join(',')} --out ${outDir}`;
  console.log(`[autop] Iteration ${iter}: running perf measure...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.warn('[autop] Perf measure failed on iteration', iter, e);
  }
  const resultsPath = path.join(outDir, 'perf-results.json');
  const results = readJson(resultsPath) || [];
  return { iter, resultsPath, results };
}

function describeSlowest(results){
  if(!Array.isArray(results) || results.length === 0) return null;
  let max = -Infinity;
  let slow = null;
  for (const r of results) {
    const v = typeof r.loadMs === 'number' ? r.loadMs : null;
    if (v != null && v > max) {
      max = v;
      slow = r;
    }
  }
  return slow && max >= 0 ? { slow, max } : null;
}

function correctionRequestFor(slow) {
  const route = slow?.url || 'unknown';
  const loadMs = slow?.max ?? slow?.loadMs ?? 'N/A';
  // Basic heuristic mapping based on route
  let agentName = 'devprep-frontend-designer';
  let issue = '';
  if (route.includes('landing') || route === 'https://stage-open-interview.github.io/') {
    agentName = 'devprep-frontend-designer';
    issue = 'Landing page initial load is heavy; opportunities: code-splitting the hero, inline critical CSS, prefetch, and reduce initial bundle size.';
  } else if (route.includes('channel-browser')) {
    agentName = 'devprep-frontend-designer';
    issue = 'Channel browser slow to render; opportunities: lazy-load channel cards, optimize search, and prefetch channel data.';
  } else if (route.includes('/login') ) {
    agentName = 'devprep-bug-auth'; // fallback, there is a login path
    issue = 'Login path latency; consider splitting auth flows and deferring non-critical scripts.';
  } else {
    agentName = 'devprep-frontend-designer';
    issue = 'General page latency observed; propose route-specific code-splitting and resource hints.';
  }
  const context = `Route: ${route} | loadMs=${loadMs}`;
  const corr = [
    'CORRECTION REQUEST → ' + agentName,
    'Issue: ' + issue,
    'Expected: Implement a targeted incremental fix for this route (e.g., code-splitting, lazy-loading, critical CSS, preloads).',
    'Context: ' + context,
    'Action: Create/patch code changes to address this latency (provide patch in next message).'
  ].join('\n');
  return corr;
}

async function main() {
  // Ensure perf/history directory exists for logs
  const historyDir = path.join('perf', 'history');
  fs.mkdirSync(historyDir, { recursive: true });
  for (let i = 1; i <= ITERATIONS; i++) {
    const { results } = await measureOnce(i);
    const slowInfo = describeSlowest(results);
    if (slowInfo && slowInfo.max >= THRESHOLD_MS) {
      // produce a correction request
      const corr = correctionRequestFor(slowInfo.slow);
      const logPath = path.join(historyDir, `corr-iter-${i}.txt`);
      fs.writeFileSync(logPath, corr);
      console.log('[autop] Correction Request generated for iteration', i);
      console.log(corr);
    } else {
      console.log(`[autop] Iteration ${i}: all routes under threshold (${THRESHOLD_MS} ms). No correction needed.`);
    }
    // small delay to avoid overwhelming the CI runner
    await sleep(200);
  }
  console.log('Autonomous perf loop completed  iterations:', ITERATIONS);
}

main().catch(err => {
  console.error('Autonomous perf loop failed', err);
  process.exit(1);
});
