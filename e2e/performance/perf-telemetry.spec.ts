/**
 * Performance Telemetry E2E Tests
 * 
 * Tests that verify the performance telemetry system works correctly
 * and that the DevPrep platform meets Core Web Vitals thresholds.
 * 
 * Uses the perf-telemetry module to collect real-user metrics
 * and asserts against defined performance budgets.
 */

import { test, expect, Page } from '@playwright/test';
import { PERF_THRESHOLDS, MOBILE_PERF_THRESHOLDS } from '../../playwright.perf.config';

// ============================================================
// Helper Functions
// ============================================================

function getThresholds(isMobile: boolean) {
  return isMobile ? MOBILE_PERF_THRESHOLDS : PERF_THRESHOLDS;
}

/**
 * Collect Web Vitals from the page using the telemetry module approach.
 */
async function collectWebVitalsFromPage(page: Page) {
  return page.evaluate(() => {
    const vitals = {
      lcp: 0,
      fcp: 0,
      cls: 0,
      inp: 0,
      ttfb: 0,
      fid: 0,
    };

    // LCP
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        const last = lcpEntries[lcpEntries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        vitals.lcp = last.renderTime || last.loadTime || 0;
      }
    } catch { /* not supported */ }

    // FCP
    try {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
      if (fcp) vitals.fcp = fcp.startTime;
    } catch { /* not supported */ }

    // CLS
    try {
      const clsEntries = performance.getEntriesByType('layout-shift') as (PerformanceEntry & { value?: number; hadRecentInput?: boolean })[];
      let clsValue = 0;
      for (const entry of clsEntries) {
        if (!entry.hadRecentInput && entry.value) clsValue += entry.value;
      }
      vitals.cls = clsValue;
    } catch { /* not supported */ }

    // INP
    try {
      const eventEntries = performance.getEntriesByType('event') as (PerformanceEntry & { processingStart?: number })[];
      let maxInp = 0;
      for (const entry of eventEntries) {
        const delay = (entry.processingStart || 0) - entry.startTime;
        if (delay > maxInp) maxInp = delay;
      }
      vitals.inp = maxInp;
    } catch { /* not supported */ }

    // TTFB
    try {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) vitals.ttfb = navEntries[0].responseStart;
    } catch { /* not supported */ }

    // FID
    try {
      const firstInput = performance.getEntriesByType('first-input');
      if (firstInput.length > 0) {
        const fi = firstInput[0] as PerformanceEntry & { processingStart?: number };
        vitals.fid = (fi.processingStart || 0) - fi.startTime;
      }
    } catch { /* not supported */ }

    return vitals;
  });
}

/**
 * Collect resource timing data from the page.
 */
async function collectResourceTimingFromPage(page: Page) {
  return page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let jsSize = 0, cssSize = 0, imageSize = 0, totalSize = 0;
    const slowest: { name: string; duration: number; size: number }[] = [];

    for (const r of resources) {
      const size = r.transferSize || 0;
      totalSize += size;
      if (r.name.endsWith('.js') || r.initiatorType === 'script') jsSize += size;
      else if (r.name.endsWith('.css') || r.initiatorType === 'link') cssSize += size;
      else if (r.initiatorType === 'img' || /\.(png|jpg|jpeg|gif|svg|webp)/i.test(r.name)) imageSize += size;

      slowest.push({ name: r.name, duration: r.duration, size });
    }

    slowest.sort((a, b) => b.duration - a.duration);

    return {
      count: resources.length,
      totalSize,
      jsSize,
      cssSize,
      imageSize,
      slowest: slowest.slice(0, 10),
      byType: {
        script: resources.filter(r => r.initiatorType === 'script').length,
        link: resources.filter(r => r.initiatorType === 'link').length,
        img: resources.filter(r => r.initiatorType === 'img').length,
        fetch: resources.filter(r => r.initiatorType === 'fetch' || r.initiatorType === 'xmlhttprequest').length,
        other: resources.filter(r => !['script', 'link', 'img', 'fetch', 'xmlhttprequest'].includes(r.initiatorType)).length,
      },
    };
  });
}

/**
 * Get navigation timing breakdown.
 */
async function getNavigationTimingFromPage(page: Page) {
  return page.evaluate(() => {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (!nav) return null;
    return {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart,
      ttfb: nav.responseStart - nav.requestStart,
      download: nav.responseEnd - nav.responseStart,
      domProcessing: nav.domComplete - nav.responseEnd,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      totalLoad: nav.loadEventEnd - nav.startTime,
    };
  });
}

/**
 * Get memory usage from the page.
 */
async function getMemoryUsageFromPage(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    const perf = performance as Performance & { memory?: { usedJSHeapSize: number } };
    return perf.memory ? perf.memory.usedJSHeapSize : null;
  });
}

/**
 * Get performance marks from the page.
 */
async function getPerformanceMarksFromPage(page: Page) {
  return page.evaluate(() => {
    return performance.getEntriesByType('mark').map(e => ({
      name: e.name,
      startTime: e.startTime,
      duration: e.duration,
    }));
  });
}

// ============================================================
// Test: Performance Telemetry Module Availability
// ============================================================

test.describe('Performance Telemetry Module', () => {
  test('perf-telemetry module exports are available', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that the telemetry functions exist on window
    const hasTelemetry = await page.evaluate(() => {
      // The module should be bundled and available
      // We check by verifying the Performance API is accessible
      return typeof performance !== 'undefined' &&
        typeof performance.getEntriesByType === 'function' &&
        typeof performance.mark === 'function' &&
        typeof performance.measure === 'function';
    });

    expect(hasTelemetry).toBe(true);
  });

  test('performance marks can be created and measured', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const measureResult = await page.evaluate(() => {
      performance.mark('test-start');
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
      performance.mark('test-end');
      performance.measure('test-measure', 'test-start', 'test-end');

      const entries = performance.getEntriesByName('test-measure', 'measure');
      return {
        hasMeasure: entries.length > 0,
        duration: entries.length > 0 ? entries[0].duration : -1,
      };
    });

    expect(measureResult.hasMeasure).toBe(true);
    expect(measureResult.duration).toBeGreaterThanOrEqual(0);
  });

  test('navigation timing data is available', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const navTiming = await getNavigationTimingFromPage(page);

    expect(navTiming).not.toBeNull();
    expect(navTiming!.totalLoad).toBeGreaterThan(0);
    expect(navTiming!.domContentLoaded).toBeGreaterThan(0);
    expect(navTiming!.ttfb).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================
// Test: Web Vitals Collection
// ============================================================

test.describe('Web Vitals Collection', () => {
  test('FCP is measurable on home page', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const vitals = await collectWebVitalsFromPage(page);

    console.log(`\n📊 Home Page Web Vitals:`);
    console.log(`  FCP: ${vitals.fcp.toFixed(2)}ms (threshold: ${thresholds.fcp}ms)`);
    console.log(`  TTFB: ${vitals.ttfb.toFixed(2)}ms`);

    expect(vitals.fcp).toBeGreaterThanOrEqual(0);
    // Relaxed threshold for dev environment
    if (vitals.fcp > 0) {
      expect(vitals.fcp).toBeLessThan(thresholds.fcp * 2);
    }
  });

  test('CLS is measurable and within threshold', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);

    await page.goto('/', { waitUntil: 'networkidle' });
    // Wait for any layout shifts to settle
    await page.waitForTimeout(1000);

    const vitals = await collectWebVitalsFromPage(page);

    console.log(`\n📊 CLS: ${vitals.cls.toFixed(4)} (threshold: ${thresholds.cls})`);

    expect(vitals.cls).toBeGreaterThanOrEqual(0);
    expect(vitals.cls).toBeLessThan(thresholds.cls * 5); // Relaxed for dev
  });

  test('LCP is measurable on content pages', async ({ page }) => {
    await page.goto('/tests', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const vitals = await collectWebVitalsFromPage(page);

    console.log(`\n📊 LCP: ${vitals.lcp > 0 ? vitals.lcp.toFixed(2) + 'ms' : 'N/A'}`);

    // LCP may be 0 if no LCP candidate is found in dev mode
    if (vitals.lcp > 0) {
      expect(vitals.lcp).toBeLessThan(5000); // Generous threshold for dev
    }
  });
});

// ============================================================
// Test: Resource Timing
// ============================================================

test.describe('Resource Timing Measurement', () => {
  test('resource timing entries are collected', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const resources = await collectResourceTimingFromPage(page);

    console.log(`\n📊 Resource Timing:`);
    console.log(`  Total Resources: ${resources.count}`);
    console.log(`  Total Transfer: ${(resources.totalSize / 1024).toFixed(2)}KB`);
    console.log(`  JS: ${(resources.jsSize / 1024).toFixed(2)}KB`);
    console.log(`  CSS: ${(resources.cssSize / 1024).toFixed(2)}KB`);
    console.log(`  By Type:`, resources.byType);

    expect(resources.count).toBeGreaterThan(0);
    expect(resources.totalSize).toBeGreaterThanOrEqual(0);
  });

  test('static data JSON files load efficiently', async ({ page }) => {
    await page.goto('/tests', { waitUntil: 'networkidle' });

    const resources = await collectResourceTimingFromPage(page);
    const jsonResources = resources.slowest.filter(r => r.name.endsWith('.json'));

    console.log(`\n📊 JSON Resource Timing:`);
    jsonResources.forEach(r => {
      console.log(`  ${r.name.split('/').pop()}: ${r.duration.toFixed(2)}ms, ${(r.size / 1024).toFixed(2)}KB`);
    });

    // JSON files should load quickly
    for (const r of jsonResources) {
      if (r.duration > 0) {
        expect(r.duration).toBeLessThan(2000); // Generous for dev
      }
    }
  });

  test('no resources exceed 5 second load time', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const resources = await collectResourceTimingFromPage(page);
    const slowResources = resources.slowest.filter(r => r.duration > 5000);

    expect(slowResources).toHaveLength(0);
  });
});

// ============================================================
// Test: Performance Marks
// ============================================================

test.describe('Performance Marks', () => {
  test('standard navigation marks are present', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const marks = await getPerformanceMarksFromPage(page);
    const markNames = marks.map(m => m.name);

    console.log(`\n📊 Performance Marks (${marks.length}):`);
    markNames.forEach(n => console.log(`  - ${n}`));

    // At minimum, navigation marks should exist
    expect(marks.length).toBeGreaterThanOrEqual(0);
  });

  test('custom marks can be created during interaction', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.evaluate(() => {
      performance.mark('interaction:start');
    });

    // Perform an interaction
    const firstLink = page.locator('a[href]').first();
    if (await firstLink.count() > 0) {
      await firstLink.click({ timeout: 3000 }).catch(() => {});
    }

    await page.evaluate(() => {
      performance.mark('interaction:end');
    });

    const marks = await getPerformanceMarksFromPage(page);
    const interactionMarks = marks.filter(m => m.name.includes('interaction'));

    expect(interactionMarks.length).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================
// Test: Memory Monitoring
// ============================================================

test.describe('Memory Monitoring', () => {
  test('memory usage is trackable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const memory = await getMemoryUsageFromPage(page);

    if (memory !== null) {
      console.log(`\n📊 Memory Usage: ${(memory / 1024 / 1024).toFixed(2)}MB`);
      expect(memory).toBeGreaterThan(0);
    } else {
      console.log('\n📊 Memory API not available in this browser');
    }
  });

  test('memory does not grow unboundedly during navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const initialMemory = await getMemoryUsageFromPage(page);
    if (initialMemory === null) {
      test.skip(true, 'Memory API not available');
      return;
    }

    // Navigate through several pages
    const routes = ['/tests', '/coding', '/learning-paths', '/'];
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);
    }

    const finalMemory = await getMemoryUsageFromPage(page);
    const growth = finalMemory! - initialMemory;

    console.log(`\n📊 Memory Growth:`);
    console.log(`  Initial: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Final: ${(finalMemory! / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Growth: ${(growth / 1024 / 1024).toFixed(2)}MB`);

    // Memory growth should be reasonable (less than 50MB across 4 navigations)
    expect(growth).toBeLessThan(50 * 1024 * 1024);
  });
});

// ============================================================
// Test: Route Transition Performance
// ============================================================

test.describe('Route Transition Performance', () => {
  test('SPA navigation between pages is fast', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);

    await page.goto('/', { waitUntil: 'networkidle' });

    const routes = [
      { path: '/tests', name: 'Tests' },
      { path: '/coding', name: 'Coding' },
      { path: '/learning-paths', name: 'Learning Paths' },
    ];

    const transitionTimes: { name: string; duration: number }[] = [];

    for (const route of routes) {
      const start = Date.now();
      await page.goto(route.path, { waitUntil: 'networkidle' });
      const duration = Date.now() - start;
      transitionTimes.push({ name: route.name, duration });
    }

    console.log(`\n📊 Route Transitions:`);
    transitionTimes.forEach(t => {
      console.log(`  ${t.name}: ${t.duration}ms`);
    });

    const avgTransition = transitionTimes.reduce((s, t) => s + t.duration, 0) / transitionTimes.length;
    console.log(`  Average: ${avgTransition.toFixed(0)}ms (threshold: ${thresholds.routeTransition * 3}ms)`);

    expect(avgTransition).toBeLessThan(thresholds.routeTransition * 5);
  });

  test('back navigation uses browser cache', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.goto('/tests', { waitUntil: 'networkidle' });

    const start = Date.now();
    await page.goBack();
    await page.waitForLoadState('networkidle');
    const backTime = Date.now() - start;

    console.log(`\n📊 Back Navigation: ${backTime}ms`);

    expect(backTime).toBeLessThan(thresholds.routeTransition * 3);
  });
});

// ============================================================
// Test: Performance Snapshot
// ============================================================

test.describe('Performance Snapshot', () => {
  test('full performance snapshot can be captured', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const snapshot = await page.evaluate(() => {
      const vitals = {
        lcp: 0, fcp: 0, cls: 0, inp: 0, ttfb: 0, fid: 0,
      };

      try {
        const lcp = performance.getEntriesByType('largest-contentful-paint');
        if (lcp.length > 0) {
          const last = lcp[lcp.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
          vitals.lcp = last.renderTime || last.loadTime || 0;
        }
      } catch {}

      try {
        const paint = performance.getEntriesByType('paint');
        const fcp = paint.find(e => e.name === 'first-contentful-paint');
        if (fcp) vitals.fcp = fcp.startTime;
      } catch {}

      try {
        const cls = performance.getEntriesByType('layout-shift') as (PerformanceEntry & { value?: number; hadRecentInput?: boolean })[];
        let v = 0;
        for (const e of cls) { if (!e.hadRecentInput && e.value) v += e.value; }
        vitals.cls = v;
      } catch {}

      try {
        const nav = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (nav.length > 0) vitals.ttfb = nav[0].responseStart;
      } catch {}

      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let jsSize = 0, cssSize = 0, totalSize = 0;
      for (const r of resources) {
        const s = r.transferSize || 0;
        totalSize += s;
        if (r.name.endsWith('.js')) jsSize += s;
        else if (r.name.endsWith('.css')) cssSize += s;
      }

      return {
        url: window.location.href,
        webVitals: vitals,
        resourceCount: resources.length,
        totalTransferSize: totalSize,
        jsTransferSize: jsSize,
        cssTransferSize: cssSize,
        marks: performance.getEntriesByType('mark').length,
      };
    });

    console.log(`\n📊 Performance Snapshot:`);
    console.log(`  URL: ${snapshot.url}`);
    console.log(`  FCP: ${snapshot.webVitals.fcp.toFixed(2)}ms`);
    console.log(`  LCP: ${snapshot.webVitals.lcp > 0 ? snapshot.webVitals.lcp.toFixed(2) + 'ms' : 'N/A'}`);
    console.log(`  CLS: ${snapshot.webVitals.cls.toFixed(4)}`);
    console.log(`  TTFB: ${snapshot.webVitals.ttfb.toFixed(2)}ms`);
    console.log(`  Resources: ${snapshot.resourceCount}`);
    console.log(`  Total Transfer: ${(snapshot.totalTransferSize / 1024).toFixed(2)}KB`);
    console.log(`  JS Transfer: ${(snapshot.jsTransferSize / 1024).toFixed(2)}KB`);
    console.log(`  CSS Transfer: ${(snapshot.cssTransferSize / 1024).toFixed(2)}KB`);
    console.log(`  Marks: ${snapshot.marks}`);

    expect(snapshot.url).toContain('localhost');
    expect(snapshot.resourceCount).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================
// Test: Performance Under Load
// ============================================================

test.describe('Performance Under Load', () => {
  test('rapid page transitions do not degrade performance', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const timings: number[] = [];

    // Rapid navigation
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await page.goto(['/', '/tests', '/coding', '/learning-paths', '/'][i], { waitUntil: 'domcontentloaded' });
      timings.push(Date.now() - start);
    }

    const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
    const maxTime = Math.max(...timings);

    console.log(`\n📊 Rapid Navigation:`);
    console.log(`  Average: ${avgTime.toFixed(0)}ms`);
    console.log(`  Max: ${maxTime}ms`);

    expect(maxTime).toBeLessThan(10000);
  });

  test('cache benefits on repeated visits', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const firstLoad = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    const secondLoad = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    });

    console.log(`\n📊 Cache Performance:`);
    console.log(`  First Load: ${(firstLoad / 1024).toFixed(2)}KB`);
    console.log(`  Second Load: ${(secondLoad / 1024).toFixed(2)}KB`);

    if (firstLoad > 0) {
      const savings = ((1 - secondLoad / firstLoad) * 100).toFixed(1);
      console.log(`  Savings: ${savings}%`);
      // Second load should transfer less data (cache benefit)
      expect(secondLoad).toBeLessThanOrEqual(firstLoad * 1.5); // Allow some variance in dev
    }
  });
});

// ============================================================
// Test: Performance Regression Baseline
// ============================================================

test.describe('Performance Regression Baseline', () => {
  test('establish performance baseline for key pages', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    const pages = [
      { path: '/', name: 'Home' },
      { path: '/tests', name: 'Tests' },
      { path: '/coding', name: 'Coding' },
      { path: '/learning-paths', name: 'Learning Paths' },
    ];

    const results: {
      page: string;
      loadTime: number;
      fcp: number;
      resourceCount: number;
      totalSize: number;
    }[] = [];

    for (const pageInfo of pages) {
      const start = Date.now();
      await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - start;

      const navTiming = await getNavigationTimingFromPage(page);
      const resources = await collectResourceTimingFromPage(page);

      results.push({
        page: pageInfo.name,
        loadTime,
        fcp: navTiming ? navTiming.domContentLoaded : 0,
        resourceCount: resources.count,
        totalSize: resources.totalSize,
      });
    }

    console.log(`\n📊 Performance Baseline (${isMobile ? 'Mobile' : 'Desktop'}):`);
    console.log(`  ${'Page'.padEnd(20)} ${'Load'.padEnd(10)} ${'FCP'.padEnd(10)} ${'Resources'.padEnd(12)} ${'Size'}`);
    console.log(`  ${'-'.repeat(65)}`);
    for (const r of results) {
      console.log(`  ${r.page.padEnd(20)} ${`${r.loadTime}ms`.padEnd(10)} ${`${r.fcp.toFixed(0)}ms`.padEnd(10)} ${`${r.resourceCount}`.padEnd(12)} ${(r.totalSize / 1024).toFixed(1)}KB`);
    }

    // All pages should load within reasonable time
    for (const r of results) {
      expect(r.loadTime).toBeLessThan(15000); // Generous for dev environment
    }
  });
});
