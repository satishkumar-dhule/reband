/**
 * Performance Regression Testing
 * 
 * Compares current performance measurements against stored baselines
 * to detect performance regressions. Stores results in perf/regression/
 * and fails CI if metrics exceed allowed degradation thresholds.
 * 
 * Usage:
 *   node scripts/perf-regression.js                    # Compare against baseline
 *   node scripts/perf-regression.js --baseline          # Save new baseline
 *   node scripts/perf-regression.js --report            # Generate HTML report
 *   node scripts/perf-regression.js --url=http://...    # Custom URL
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// ============================================================
// Configuration
// ============================================================

const REGRESSION_DIR = path.join(__dirname, '..', 'perf', 'regression');
const BASELINE_FILE = path.join(REGRESSION_DIR, 'baseline.json');
const RESULTS_DIR = path.join(REGRESSION_DIR, 'results');
const REPORT_FILE = path.join(REGRESSION_DIR, 'report.html');

const DEFAULT_URLS = [
  'http://localhost:5173/',
  'http://localhost:5173/tests',
  'http://localhost:5173/coding',
  'http://localhost:5173/learning-paths',
];

// Allowed degradation percentages before flagging as regression
const DEGRADATION_THRESHOLDS = {
  loadTime: 0.20,       // 20% slower allowed
  fcp: 0.25,            // 25% slower allowed
  resourceCount: 0.10,  // 10% more resources allowed
  totalSize: 0.15,      // 15% larger allowed
  lcp: 0.25,
  cls: 0.50,            // CLS can vary more
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// ============================================================
// Measurement
// ============================================================

async function measurePage(page, url) {
  const sanitized = url.replace(/^https?:\/\//, '').replace(/[/?#=&.]/g, '_');
  const screenshotPath = path.join(REGRESSION_DIR, 'screenshots', `${sanitized}.png`);
  ensureDir(path.dirname(screenshotPath));

  const startTime = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;

  const metrics = await page.evaluate(() => {
    // Navigation timing
    const [nav] = performance.getEntriesByType('navigation') || [];
    
    // Paint timing
    const paint = performance.getEntriesByType('paint') || [];
    const fcp = (paint.find(e => e.name === 'first-contentful-paint') || {}).startTime || 0;

    // LCP
    let lcp = 0;
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        const last = lcpEntries[lcpEntries.length - 1];
        lcp = last.renderTime || last.loadTime || 0;
      }
    } catch {}

    // CLS
    let cls = 0;
    try {
      const clsEntries = performance.getEntriesByType('layout-shift');
      for (const entry of clsEntries) {
        if (!entry.hadRecentInput && entry.value) cls += entry.value;
      }
    } catch {}

    // Resources
    const resources = performance.getEntriesByType('resource') || [];
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    for (const r of resources) {
      const s = r.transferSize || 0;
      totalSize += s;
      if (r.name.endsWith('.js')) jsSize += s;
      else if (r.name.endsWith('.css')) cssSize += s;
    }

    // Memory
    let memory = null;
    try {
      const perf = performance;
      if (perf.memory) memory = perf.memory.usedJSHeapSize;
    } catch {}

    return {
      fcp,
      lcp,
      cls,
      domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
      totalLoad: nav ? nav.loadEventEnd - nav.startTime : 0,
      resourceCount: resources.length,
      totalSize,
      jsSize,
      cssSize,
      memory,
    };
  });

  await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});

  return {
    url,
    loadTime,
    ...metrics,
    screenshot: screenshotPath,
    timestamp: new Date().toISOString(),
  };
}

async function measureAll(urls) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const results = [];
  for (const url of urls) {
    try {
      const result = await measurePage(page, url);
      results.push(result);
      console.log(`  ✓ ${url}: ${result.loadTime}ms, FCP=${result.fcp.toFixed(0)}ms, ${result.resourceCount} resources`);
    } catch (err) {
      console.error(`  ✗ ${url}: ${err.message}`);
      results.push({ url, error: err.message, timestamp: new Date().toISOString() });
    }
  }

  await browser.close();
  return results;
}

// ============================================================
// Baseline Management
// ============================================================

function loadBaseline() {
  if (!fs.existsSync(BASELINE_FILE)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
}

function saveBaseline(results) {
  ensureDir(REGRESSION_DIR);
  const baseline = {
    version: 1,
    createdAt: new Date().toISOString(),
    userAgent: results[0]?.userAgent || 'unknown',
    pages: results.map(r => ({
      url: r.url,
      loadTime: r.loadTime,
      fcp: r.fcp,
      lcp: r.lcp,
      cls: r.cls,
      resourceCount: r.resourceCount,
      totalSize: r.totalSize,
      jsSize: r.jsSize,
      cssSize: r.cssSize,
    })),
  };
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2));
  console.log(`\n📊 Baseline saved to ${BASELINE_FILE}`);
  return baseline;
}

// ============================================================
// Regression Analysis
// ============================================================

function analyzeRegression(current, baseline) {
  if (!baseline || !baseline.pages) {
    return { hasBaseline: false, regressions: [], comparisons: [] };
  }

  const comparisons = [];
  const regressions = [];

  for (const currentResult of current) {
    if (currentResult.error) continue;

    const baselinePage = baseline.pages.find(b => b.url === currentResult.url);
    if (!baselinePage) {
      comparisons.push({
        url: currentResult.url,
        status: 'new',
        message: 'No baseline for this page',
      });
      continue;
    }

    const pageComparisons = {};
    let hasRegression = false;

    const metrics = ['loadTime', 'fcp', 'lcp', 'cls', 'resourceCount', 'totalSize'];
    for (const metric of metrics) {
      const baselineVal = baselinePage[metric];
      const currentVal = currentResult[metric];
      
      if (baselineVal === 0 || baselineVal === null || baselineVal === undefined) {
        pageComparisons[metric] = { baseline: baselineVal, current: currentVal, change: 0, pctChange: 0, status: 'ok' };
        continue;
      }

      const change = currentVal - baselineVal;
      const pctChange = (change / baselineVal) * 100;
      const threshold = DEGRADATION_THRESHOLDS[metric] || 0.20;
      const isRegression = pctChange > (threshold * 100);

      if (isRegression) {
        hasRegression = true;
        regressions.push({
          url: currentResult.url,
          metric,
          baseline: baselineVal,
          current: currentVal,
          change,
          pctChange: pctChange.toFixed(1),
          threshold: (threshold * 100).toFixed(0),
        });
      }

      pageComparisons[metric] = {
        baseline: baselineVal,
        current: currentVal,
        change,
        pctChange: pctChange.toFixed(1),
        status: isRegression ? 'regression' : pctChange < -5 ? 'improvement' : 'ok',
      };
    }

    comparisons.push({
      url: currentResult.url,
      status: hasRegression ? 'regression' : 'ok',
      metrics: pageComparisons,
    });
  }

  return {
    hasBaseline: true,
    regressions,
    comparisons,
  };
}

// ============================================================
// Report Generation
// ============================================================

function generateReport(current, analysis) {
  ensureDir(REGRESSION_DIR);

  const rows = analysis.comparisons.map(c => {
    const metrics = c.metrics || {};
    const statusClass = c.status === 'regression' ? 'regression' : c.status === 'new' ? 'new' : 'ok';
    
    const metricCells = Object.entries(metrics).map(([key, val]) => {
      const cellClass = val.status === 'regression' ? 'regression' : val.status === 'improvement' ? 'improvement' : '';
      const baselineStr = typeof val.baseline === 'number' ? val.baseline.toFixed(key === 'cls' ? 4 : key === 'totalSize' || key === 'jsSize' || key === 'cssSize' ? 0 : 1) : 'N/A';
      const currentStr = typeof val.current === 'number' ? val.current.toFixed(key === 'cls' ? 4 : key === 'totalSize' || key === 'jsSize' || key === 'cssSize' ? 0 : 1) : 'N/A';
      const pctStr = val.pctChange !== undefined ? `${val.pctChange > 0 ? '+' : ''}${val.pctChange}%` : '-';
      return `<td class="${cellClass}">${key}<br/><small>${baselineStr} → ${currentStr}<br/>${pctStr}</small></td>`;
    }).join('');

    return `<tr class="${statusClass}">
      <td>${c.url.split('/').pop() || c.url}</td>
      <td class="${statusClass}">${c.status.toUpperCase()}</td>
      ${metricCells}
    </tr>`;
  }).join('');

  const regressionRows = analysis.regressions.map(r => 
    `<tr><td>${r.url.split('/').pop()}</td><td>${r.metric}</td>
     <td>${r.baseline.toFixed(2)}</td><td>${r.current.toFixed(2)}</td>
     <td class="regression">+${r.pctChange}%</td><td>≤${r.threshold}%</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevPrep Performance Regression Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; background: #f6f8fa; color: #1f2328; padding: 24px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 18px; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #d0d7de; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; }
    .card { background: #fff; border: 1px solid #d0d7de; border-radius: 6px; padding: 16px 24px; min-width: 160px; }
    .card h3 { font-size: 12px; color: #656d76; text-transform: uppercase; margin-bottom: 4px; }
    .card .value { font-size: 28px; font-weight: 600; }
    .card .value.ok { color: #1a7f37; }
    .card .value.regression { color: #cf222e; }
    table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #d0d7de; border-radius: 6px; overflow: hidden; }
    th { background: #f6f8fa; padding: 8px 12px; text-align: left; font-size: 12px; color: #656d76; border-bottom: 1px solid #d0d7de; }
    td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    tr.regression { background: #ffebe9; }
    tr.ok { background: #dafbe1; }
    tr.new { background: #ddf4ff; }
    td.regression { color: #cf222e; font-weight: 600; }
    td.improvement { color: #1a7f37; font-weight: 600; }
    small { color: #656d76; }
    .timestamp { color: #656d76; font-size: 12px; margin-bottom: 16px; }
    code { background: #e8e8e8; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
  </style>
</head>
<body>
  <h1>📊 DevPrep Performance Regression Report</h1>
  <p class="timestamp">Generated: ${new Date().toISOString()}</p>
  
  <div class="summary">
    <div class="card">
      <h3>Status</h3>
      <div class="value ${analysis.regressions.length > 0 ? 'regression' : 'ok'}">
        ${analysis.regressions.length > 0 ? '⚠ REGRESSION' : '✓ PASS'}
      </div>
    </div>
    <div class="card">
      <h3>Pages Tested</h3>
      <div class="value">${analysis.comparisons.length}</div>
    </div>
    <div class="card">
      <h3>Regressions</h3>
      <div class="value ${analysis.regressions.length > 0 ? 'regression' : 'ok'}">${analysis.regressions.length}</div>
    </div>
    <div class="card">
      <h3>Has Baseline</h3>
      <div class="value ${analysis.hasBaseline ? 'ok' : 'regression'}">${analysis.hasBaseline ? 'Yes' : 'No'}</div>
    </div>
  </div>

  ${analysis.regressions.length > 0 ? `
  <h2>⚠️ Regressions Detected</h2>
  <table>
    <thead><tr><th>Page</th><th>Metric</th><th>Baseline</th><th>Current</th><th>Change</th><th>Threshold</th></tr></thead>
    <tbody>${regressionRows || '<tr><td colspan="6">No regressions</td></tr>'}</tbody>
  </table>
  ` : ''}

  <h2>Page Results</h2>
  <table>
    <thead>
      <tr>
        <th>Page</th><th>Status</th>
        <th>Load Time</th><th>FCP</th><th>LCP</th><th>CLS</th><th>Resources</th><th>Total Size</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <h2>Current Measurements</h2>
  <pre style="background:#fff;border:1px solid #d0d7de;border-radius:6px;padding:16px;overflow-x:auto;font-size:12px;">${JSON.stringify(current, null, 2)}</pre>
</body>
</html>`;

  fs.writeFileSync(REPORT_FILE, html);
  console.log(`\n📋 Report saved to ${REPORT_FILE}`);
}

// ============================================================
// CLI
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const isBaseline = args.includes('--baseline');
  const isReport = args.includes('--report');
  const urlArg = args.find(a => a.startsWith('--url='));
  const urls = urlArg ? urlArg.split('=')[1].split(',') : DEFAULT_URLS;

  console.log('\n🚀 DevPrep Performance Regression Testing\n');

  if (isBaseline) {
    console.log('📊 Saving new baseline...\n');
    const results = await measureAll(urls);
    saveBaseline(results);
    return;
  }

  console.log('📏 Measuring current performance...\n');
  const results = await measureAll(urls);

  console.log('\n🔍 Analyzing regressions...\n');
  const baseline = loadBaseline();
  const analysis = analyzeRegression(results, baseline);

  if (analysis.hasBaseline) {
    if (analysis.regressions.length > 0) {
      console.log('⚠️  REGRESSIONS DETECTED:');
      for (const r of analysis.regressions) {
        console.log(`  - ${r.url}: ${r.metric} increased by ${r.pctChange}% (threshold: ${r.threshold}%)`);
      }
    } else {
      console.log('✅ No regressions detected');
    }

    console.log('\n📊 Comparison Summary:');
    for (const c of analysis.comparisons) {
      console.log(`  ${c.status === 'regression' ? '⚠' : '✓'} ${c.url}: ${c.status}`);
    }
  } else {
    console.log('⚠️  No baseline found. Run with --baseline to create one.');
  }

  // Generate report
  generateReport(results, analysis);

  // Exit with error code if regressions found
  if (analysis.regressions.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Performance regression testing failed:', err);
  process.exit(1);
});
