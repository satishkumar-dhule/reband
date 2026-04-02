// Perf measurement tool using Playwright with Web Vitals tracking
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

/**
 * Collect Web Vitals and detailed performance metrics from a page.
 */
async function collectMetrics(page) {
  return page.evaluate(() => {
    const vitals = { lcp: 0, fcp: 0, cls: 0, inp: 0, ttfb: 0, fid: 0 };

    // LCP
    try {
      const entries = performance.getEntriesByType('largest-contentful-paint');
      if (entries.length > 0) {
        const last = entries[entries.length - 1];
        vitals.lcp = last.renderTime || last.loadTime || 0;
      }
    } catch {}

    // FCP
    try {
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(e => e.name === 'first-contentful-paint');
      if (fcp) vitals.fcp = fcp.startTime;
    } catch {}

    // CLS
    try {
      const clsEntries = performance.getEntriesByType('layout-shift');
      let clsValue = 0;
      for (const entry of clsEntries) {
        if (!entry.hadRecentInput && entry.value) clsValue += entry.value;
      }
      vitals.cls = clsValue;
    } catch {}

    // INP
    try {
      const eventEntries = performance.getEntriesByType('event');
      let maxInp = 0;
      for (const entry of eventEntries) {
        const delay = (entry.processingStart || 0) - entry.startTime;
        if (delay > maxInp) maxInp = delay;
      }
      vitals.inp = maxInp;
    } catch {}

    // TTFB
    try {
      const nav = performance.getEntriesByType('navigation');
      if (nav.length > 0) vitals.ttfb = nav[0].responseStart;
    } catch {}

    // FID
    try {
      const firstInput = performance.getEntriesByType('first-input');
      if (firstInput.length > 0) {
        const fi = firstInput[0];
        vitals.fid = (fi.processingStart || 0) - fi.startTime;
      }
    } catch {}

    // Navigation timing breakdown
    let navigation = null;
    try {
      const nav = performance.getEntriesByType('navigation');
      if (nav.length > 0) {
        const n = nav[0];
        navigation = {
          dns: n.domainLookupEnd - n.domainLookupStart,
          tcp: n.connectEnd - n.connectStart,
          ttfb: n.responseStart - n.requestStart,
          download: n.responseEnd - n.responseStart,
          domProcessing: n.domComplete - n.responseEnd,
          domContentLoaded: n.domContentLoadedEventEnd - n.startTime,
          totalLoad: n.loadEventEnd - n.startTime,
        };
      }
    } catch {}

    // Resource timing
    const resources = performance.getEntriesByType('resource');
    let jsSize = 0, cssSize = 0, imageSize = 0, totalSize = 0;
    let resourceCount = resources.length;
    for (const r of resources) {
      const s = r.transferSize || 0;
      totalSize += s;
      if (r.name.endsWith('.js')) jsSize += s;
      else if (r.name.endsWith('.css')) cssSize += s;
      else if (r.initiatorType === 'img' || /\.(png|jpg|jpeg|gif|svg|webp)/i.test(r.name)) imageSize += s;
    }

    // Performance marks
    const marks = performance.getEntriesByType('mark').map(e => ({
      name: e.name,
      startTime: e.startTime,
    }));

    // Memory
    let memory = null;
    try {
      const perf = performance;
      if (perf.memory) memory = perf.memory.usedJSHeapSize;
    } catch {}

    return {
      vitals,
      navigation,
      resources: {
        count: resourceCount,
        totalSize,
        jsSize,
        cssSize,
        imageSize,
      },
      marks,
      memory,
    };
  });
}

/**
 * Rate a metric against Core Web Vitals thresholds.
 */
function rateMetric(metric, value) {
  const thresholds = {
    lcp: { good: 2500, poor: 4000 },
    fcp: { good: 1800, poor: 3000 },
    cls: { good: 0.1, poor: 0.25 },
    inp: { good: 200, poor: 500 },
    ttfb: { good: 800, poor: 1800 },
  };

  const t = thresholds[metric];
  if (!t) return 'unknown';
  if (metric === 'cls') {
    return value <= t.good ? 'good' : value <= t.poor ? 'needs-improvement' : 'poor';
  }
  return value <= t.good ? 'good' : value <= t.poor ? 'needs-improvement' : 'poor';
}

async function measureForUrl(url, dir) {
  const timestamp = new Date().toISOString();
  const sanitized = url.replace(/^https?:\/\//, '').replace(/[/?#=&.]/g, '_');
  const screenshotDir = path.join(dir, 'screenshots');
  ensureDir(screenshotDir);
  const screenshotPath = path.join(screenshotDir, sanitized + '.png');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  let result = null;
  try {
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    // Wait a bit for LCP and other metrics to settle
    await page.waitForTimeout(1000);

    const metrics = await collectMetrics(page);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Rate the vitals
    const ratings = {
      lcp: rateMetric('lcp', metrics.vitals.lcp),
      fcp: rateMetric('fcp', metrics.vitals.fcp),
      cls: rateMetric('cls', metrics.vitals.cls),
      inp: rateMetric('inp', metrics.vitals.inp || 0),
      ttfb: rateMetric('ttfb', metrics.vitals.ttfb),
    };

    // Overall rating (worst individual)
    const scoreOrder = ['good', 'needs-improvement', 'poor', 'unknown'];
    let worstIndex = 0;
    for (const r of Object.values(ratings)) {
      const idx = scoreOrder.indexOf(r);
      if (idx > worstIndex) worstIndex = idx;
    }

    result = {
      url,
      loadTime,
      webVitals: metrics.vitals,
      ratings,
      overallRating: scoreOrder[worstIndex],
      navigation: metrics.navigation,
      resources: metrics.resources,
      marks: metrics.marks,
      memory: metrics.memory,
      screenshot: screenshotPath,
      timestamp,
    };
  } catch (err) {
    console.warn(`Perf measure failed for ${url}:`, err.message);
    result = { url, error: err.message, timestamp, screenshot: screenshotPath };
  } finally {
    await browser.close();
  }
  return result;
}

async function main() {
  const urlsArg = process.argv.find(a => a.startsWith('--urls=')) || '--urls=';
  const urls = urlsArg.split('=')[1] ? urlsArg.split('=')[1].split(',') : [
    'https://stage-open-interview.github.io/',
    'https://stage-open-interview.github.io/channel-browser',
    'https://stage-open-interview.github.io/login',
    'https://stage-open-interview.github.io/channel/algorithms',
    'https://stage-open-interview.github.io/interview',
  ];
  const outDir = process.argv.find(a => a.startsWith('--out='))
    ? process.argv.find(a => a.startsWith('--out=')).split('=')[1]
    : 'perf';

  ensureDir(outDir);
  const results = [];

  console.log('\n🚀 DevPrep Performance Measurement\n');

  for (const u of urls) {
    console.log(`📏 Measuring: ${u}`);
    const res = await measureForUrl(u, outDir);
    results.push(res);

    if (!res.error) {
      const v = res.webVitals;
      console.log(`   Load: ${res.loadTime}ms | FCP: ${v.fcp.toFixed(0)}ms | LCP: ${v.lcp > 0 ? v.lcp.toFixed(0) + 'ms' : 'N/A'} | CLS: ${v.cls.toFixed(4)} | Rating: ${res.overallRating}`);
    } else {
      console.log(`   ❌ Error: ${res.error}`);
    }
  }

  // Summary table
  console.log('\n📊 Performance Summary:');
  console.log(`  ${'Page'.padEnd(30)} ${'Load'.padEnd(10)} ${'FCP'.padEnd(10)} ${'LCP'.padEnd(10)} ${'CLS'.padEnd(10)} ${'Rating'}`);
  console.log(`  ${'-'.repeat(85)}`);
  for (const r of results) {
    if (r.error) {
      console.log(`  ${r.url.split('/').pop().padEnd(30)} ERROR`.padEnd(85));
    } else {
      const v = r.webVitals;
      const pageName = r.url.split('/').pop() || 'home';
      console.log(`  ${pageName.padEnd(30)} ${`${r.loadTime}ms`.padEnd(10)} ${`${v.fcp.toFixed(0)}ms`.padEnd(10)} ${v.lcp > 0 ? `${v.lcp.toFixed(0)}ms`.padEnd(10) : 'N/A'.padEnd(10)} ${v.cls.toFixed(4).padEnd(10)} ${r.overallRating}`);
    }
  }

  const outPath = path.join(outDir, 'perf-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\n📋 Results written to ${outPath}`);
}

main().catch(err => {
  console.error('Perf tool encountered an error:', err);
  process.exit(1);
});
