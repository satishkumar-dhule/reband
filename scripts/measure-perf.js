// Perf measurement tool using Playwright
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

async function measureForUrl(url, dir) {
  const timestamp = new Date().toISOString();
  const sanitized = url.replace(/^https?:\/\//, '').replace(/[/?#=&.]/g, '_');
  const screenshotDir = path.join(dir, 'screenshots');
  ensureDir(screenshotDir);
  const screenshotPath = path.join(screenshotDir, sanitized + '.png');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  let timing = null;
  let loadMs = null;
  try {
    await page.goto(url, { waitUntil: 'load' });
    timing = await page.evaluate(() => {
      const t = window.performance?.timing;
      if (!t) return null;
      return {
        navigationStart: t.navigationStart,
        domContentLoadedEventEnd: t.domContentLoadedEventEnd,
        loadEventEnd: t.loadEventEnd
      };
    });
    if (timing) {
      loadMs = timing.loadEventEnd - timing.navigationStart;
    }
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } catch (err) {
    console.warn(`Perf measure failed for ${url}:`, err);
  } finally {
    await browser.close();
  }
  return { url, loadMs, timing, screenshot: screenshotPath, timestamp };
}

async function main() {
  // Simple CLI args: --urls=url1,url2 --out=perf
  const urlsArg = process.argv.find(a => a.startsWith('--urls=')) || '--urls=';
  const urls = urlsArg.split('=')[1] ? urlsArg.split('=')[1].split(',') : [
    'https://stage-open-interview.github.io/',
    'https://stage-open-interview.github.io/channel-browser',
    'https://stage-open-interview.github.io/login',
    'https://stage-open-interview.github.io/channel/algorithms',
    'https://stage-open-interview.github.io/interview'
  ];
  const outDir = process.argv.find(a => a.startsWith('--out=')) ? process.argv.find(a => a.startsWith('--out=')).split('=')[1] : 'perf';

  ensureDir(outDir);
  const results = [];
  for (const u of urls) {
    const res = await measureForUrl(u, outDir);
    results.push(res);
  }
  const outPath = path.join(outDir, 'perf-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log('Perf results written to', outPath);
}
main().catch(err => {
  console.error('Perf tool encountered an error:', err);
  process.exit(1);
});
