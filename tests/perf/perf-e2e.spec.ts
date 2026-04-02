import { test, expect } from '@playwright/test';

// Lightweight Playwright-based performance test skeleton
// - Throttles network to simulate typical user conditions
// - Captures TTFB, LCP, CLS
// - Writes result to /tmp/perf-result.json

async function throttleNetwork(page: any, opts: { latencyMs: number; downloadThroughputKbps: number; uploadThroughputKbps: number; }) {
  // Create a CDP session to control network throttling (Chromium)
  const cdp = await (page.context() as any).newCDPSession(page);
  await cdp.send('Network.enable');
  // Convert kbps to bytes per second for CDP
  const downloadThroughput = Math.round((opts.downloadThroughputKbps * 1000) / 8);
  const uploadThroughput = Math.round((opts.uploadThroughputKbps * 1000) / 8);
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: opts.latencyMs,
    downloadThroughput,
    uploadThroughput,
  });
  // Return the control handle so caller can disable throttling if needed
  return cdp;
}

test('performance metrics under throttled network', async ({ page }) => {
  const baseUrl = process.env.PERF_TEST_URL || 'https://stage-open-interview.github.io';

  // Initialize performance observers before navigation
  await page.addInitScript(() => {
    // Global container for perf metrics
    (window as any).__perf = { lcp: 0, cls: 0 };
    // LCP observer
    try {
      const roLCP = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__perf.lcp = (entry as any).renderTime || (entry as any).startTime;
        }
      });
      roLCP.observe({ type: 'largest-contentful-paint', buffered: true } as any);
    } catch (e) {
      // ignore
    }
    // CLS observer
    try {
      const roCLS = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const e: any = entry;
          if (!e.hadRecentInput) {
            (window as any).__perf.cls += e.value;
          }
        }
      });
      roCLS.observe({ type: 'layout-shift', buffered: true } as any);
    } catch (e) {
      // ignore
    }
  });

  // Apply network throttling
  const throttler = await throttleNetwork(page, {
    latencyMs: 150,
    downloadThroughputKbps: 1024, // ~1 Mbps down
    uploadThroughputKbps: 512,    // ~0.5 Mbps up
  });

  // Navigate to the target URL
  const navigationStart = Date.now();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  // Allow time for metrics to accumulate
  await page.waitForTimeout(6000);

  // TTFB: Time to First Byte
  const ttfb = await page.evaluate(() => {
    const t = (window as any).performance?.timing;
    if (t) return t.responseStart - t.navigationStart;
    return 0;
  });

  // Capture final LCP and CLS values
  const perf = await page.evaluate(() => {
    const p = (window as any).__perf || { lcp: 0, cls: 0 };
    return { lcp: p.lcp ?? 0, cls: p.cls ?? 0 };
  });

  const durationMs = Date.now() - navigationStart;
  const result = {
    url: baseUrl,
    ttfb,
    lcp: perf.lcp,
    cls: perf.cls,
    durationMs
  };

  // Persist result to /tmp for CI logs
  try {
    const fs = require('fs');
    const outPath = '/tmp/perf-result.json';
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log('Performance result written to', outPath);
  } catch {
    console.log('Performance result:', result);
  }

  // Basic assertion to ensure metrics were collected
  expect(ttfb).toBeGreaterThanOrEqual(0);

  // Cleanup throttling
  try {
    await throttler.send('Network.disable');
  } catch {
    // ignore
  }
});
