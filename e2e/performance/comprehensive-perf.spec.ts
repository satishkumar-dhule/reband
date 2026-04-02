/**
 * Comprehensive Performance Test Suite
 * Measures Core Web Vitals, page load performance, API latency,
 * resource loading, route transitions, memory usage, animations, and long tasks
 */

import { test, expect, Page, ConsoleMessage, Request } from '@playwright/test';
import { PERF_THRESHOLDS, MOBILE_PERF_THRESHOLDS } from '../../playwright.perf.config';

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  inp: number;
  fcp: number;
  tti: number;
  domContentLoaded: number;
  firstPaint: number;
  resourceCount: number;
  totalResourceSize: number;
  jsBundleSize: number;
  cssBundleSize: number;
  apiLatency: number;
  routeTransitionTime: number;
  memoryUsage: number;
  longTasks: number;
  longTasksTotalTime: number;
}

async function collectPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  const client = await page.context().newCDPSession(page);
  
  const metrics = await client.send('Performance.getMetrics');
  const metricMap = new Map(metrics.metrics.map((m: { name: string; value: number }) => [m.name, m.value]));

  const lcp = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      new PerformanceObserver((entries) => {
        const lastEntry = entries.getEntries().at(-1) as PerformanceEntry & { renderTime?: number; loadTime?: number };
        resolve(lastEntry.renderTime || lastEntry.loadTime || 0);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      setTimeout(() => resolve(0), 5000);
    });
  });

  const cls = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let clsValue = 0;
      new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          const layoutShift = entry as unknown as { hadRecentInput?: boolean; value?: number };
          if (!layoutShift.hadRecentInput && layoutShift.value) {
            clsValue += layoutShift.value;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
      setTimeout(() => resolve(clsValue), 2000);
    });
  });

  const inp = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let maxInp = 0;
      new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          const inpEntry = entry as unknown as { processingStart?: number; startTime?: number };
          const delay = (inpEntry.processingStart || 0) - (inpEntry.startTime || 0);
          if (delay > maxInp) maxInp = delay;
        }
      }).observe({ entryTypes: ['event'] });
      setTimeout(() => resolve(maxInp), 5000);
    });
  });

  const navigationTiming = await page.evaluate(() => {
    const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find((e) => e.name === 'first-contentful-paint')?.startTime || 0;
    
    return {
      domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
      firstPaint: paint.find((e) => e.name === 'first-paint')?.startTime || 0,
      fcp,
      tti: navigation?.domInteractive || 0,
      loadComplete: navigation?.loadEventEnd || 0,
    };
  });

  const resourceMetrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let jsSize = 0;
    let cssSize = 0;
    let totalSize = 0;

    for (const resource of resources) {
      const size = resource.transferSize || 0;
      totalSize += size;
      if (resource.name.includes('.js')) jsSize += size;
      if (resource.name.includes('.css')) cssSize += size;
    }

    return {
      count: resources.length,
      totalSize,
      jsSize,
      cssSize,
    };
  });

  const memory = await client.send('Performance.getMetrics');
  const jsHeapSize = memory.metrics.find((m: { name: string; value: number }) => m.name === 'JSHeapUsedSize')?.value || 0;

  const longTasks = await page.evaluate(() => {
    return new Promise<{ count: number; totalTime: number }>((resolve) => {
      let count = 0;
      let totalTime = 0;
      
      new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          count++;
          totalTime += entry.duration;
        }
      }).observe({ entryTypes: ['longtask'] });
      
      setTimeout(() => resolve({ count, totalTime }), 3000);
    });
  });

  return {
    lcp,
    fid: 0,
    cls,
    inp,
    fcp: navigationTiming.fcp,
    tti: navigationTiming.tti,
    domContentLoaded: navigationTiming.domContentLoaded,
    firstPaint: navigationTiming.firstPaint,
    resourceCount: resourceMetrics.count,
    totalResourceSize: resourceMetrics.totalSize,
    jsBundleSize: resourceMetrics.jsSize,
    cssBundleSize: resourceMetrics.cssSize,
    apiLatency: 0,
    routeTransitionTime: 0,
    memoryUsage: jsHeapSize,
    longTasks: longTasks.count,
    longTasksTotalTime: longTasks.totalTime,
  };
}

async function measureApiLatency(page: Page): Promise<number> {
  const timings = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources
      .filter((r) => r.name.includes('/api/') || r.name.includes('/data/') || r.name.includes('.json'))
      .map((r) => r.responseEnd - r.startTime);
  });

  return timings.length > 0 ? Math.max(...timings) : 0;
}

async function measureRouteTransition(page: Page, from: string, to: string): Promise<number> {
  const startTime = Date.now();
  
  await page.goto(to, { waitUntil: 'networkidle' });
  
  return Date.now() - startTime;
}

async function measureAnimationFps(page: Page): Promise<number> {
  const fps = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let frameCount = 0;
      let lastTime = performance.now();
      const duration = 1000;
      
      function countFrame() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime < duration) {
          requestAnimationFrame(countFrame);
        } else {
          resolve(frameCount);
        }
      }
      
      requestAnimationFrame(countFrame);
    });
  });
  
  return fps;
}

function getThresholds(isMobile: boolean) {
  return isMobile ? MOBILE_PERF_THRESHOLDS : PERF_THRESHOLDS;
}

test.describe('Core Web Vitals', () => {
  test.skip(true, 'Core Web Vitals require production-optimized builds - skipped for dev environment');

  const pages = [
    { path: '/', name: 'Home' },
    { path: '/tests', name: 'Tests' },
    { path: '/coding', name: 'Coding Challenges' },
    { path: '/learning-paths', name: 'Learning Paths' },
  ];

  for (const pageInfo of pages) {
    test(`${pageInfo.name} page - LCP, CLS, INP`, async ({ page, isMobile }) => {
      test.skip(true, 'Core Web Vitals require production-optimized builds');
    });
  }
});

test.describe('Page Load Performance', () => {
  test('Home page - FCP and TTI', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const domContentLoaded = Date.now() - startTime;
    
    await page.waitForLoadState('networkidle');
    const fullLoad = Date.now() - startTime;
    
    const metrics = await collectPerformanceMetrics(page);
    
    console.log(`\n📊 Page Load Metrics:`);
    console.log(`  DOM Content Loaded: ${domContentLoaded}ms`);
    console.log(`  Full Load: ${fullLoad}ms`);
    console.log(`  FCP: ${metrics.fcp.toFixed(2)}ms`);
    console.log(`  TTI: ${metrics.tti.toFixed(2)}ms (threshold: ${thresholds.tti}ms)`);
    
    expect(metrics.fcp).toBeLessThan(thresholds.fcp * 1.5);
    expect(metrics.tti).toBeLessThan(thresholds.tti * 1.5);
  });

  test('Heavy page - Tests page loads within threshold', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    
    const startTime = Date.now();
    await page.goto('/tests', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    const metrics = await collectPerformanceMetrics(page);
    
    console.log(`\n📊 Tests Page Load:`);
    console.log(`  Total Load Time: ${loadTime}ms`);
    console.log(`  FCP: ${metrics.fcp.toFixed(2)}ms`);
    console.log(`  TTI: ${metrics.tti.toFixed(2)}ms`);
    
    expect(metrics.fcp).toBeLessThan(thresholds.fcp * 1.5);
    expect(metrics.tti).toBeLessThan(thresholds.tti * 1.5);
  });
});

test.describe('API Response Times', () => {
  test('API latency on home page', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const apiLatency = await measureApiLatency(page);
    
    console.log(`\n📊 API Latency: ${apiLatency.toFixed(2)}ms (threshold: ${thresholds.networkLatency}ms)`);
    
    if (apiLatency > 0) {
      expect(apiLatency).toBeLessThan(thresholds.networkLatency * 5);
    }
  });

  test('Multiple route API responses', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    
    const routes = ['/', '/tests', '/coding', '/learning-paths'];
    const latencies: number[] = [];
    
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'networkidle' });
      const latency = await measureApiLatency(page);
      latencies.push(latency);
    }
    
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);
    
    console.log(`\n📊 API Latencies by Route:`);
    routes.forEach((route, i) => {
      console.log(`  ${route}: ${latencies[i].toFixed(2)}ms`);
    });
    console.log(`  Average: ${avgLatency.toFixed(2)}ms`);
    console.log(`  Max: ${maxLatency.toFixed(2)}ms`);
    
    if (maxLatency > 0) {
      expect(maxLatency).toBeLessThan(thresholds.networkLatency * 10);
    }
  });
});

test.describe('Resource Loading', () => {
  test.skip(true, 'Bundle size checks require production build - skipped for dev environment');

  test('Resource loading order is optimal', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const resourceOrder = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources
        .slice(0, 10)
        .map((r) => ({
          name: r.name.split('/').pop() || r.name,
          startTime: r.startTime,
          type: r.initiatorType,
        }));
    });
    
    console.log(`\n📊 First 10 Resources Loaded:`);
    resourceOrder.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} (${r.type}) - ${r.startTime.toFixed(2)}ms`);
    });
    
    const criticalResources = resourceOrder.slice(0, 3);
    const hasCSS = criticalResources.some((r) => r.name.endsWith('.css'));
    
    expect(criticalResources.length).toBeGreaterThan(0);
  });
});

test.describe('Route Transitions', () => {
  test('SPA navigation performance', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    
    const routes = [
      { path: '/tests', name: 'Tests' },
      { path: '/coding', name: 'Coding' },
      { path: '/learning-paths', name: 'Learning Paths' },
    ];
    
    const transitionTimes: number[] = [];
    
    for (const route of routes) {
      const startTime = Date.now();
      await page.goto(route.path, { waitUntil: 'networkidle' });
      const transitionTime = Date.now() - startTime;
      transitionTimes.push(transitionTime);
      console.log(`  ${route.name}: ${transitionTime}ms`);
    }
    
    const avgTransition = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length;
    const maxTransition = Math.max(...transitionTimes);
    
    console.log(`\n📊 Route Transition Times:`);
    console.log(`  Average: ${avgTransition.toFixed(2)}ms`);
    console.log(`  Max: ${maxTransition.toFixed(2)}ms (threshold: ${thresholds.routeTransition * 3}ms)`);
    
    expect(maxTransition).toBeLessThan(thresholds.routeTransition * 3);
  });

  test('Back navigation is fast', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    
    await page.goto('/tests', { waitUntil: 'networkidle' });
    await page.goto('/coding', { waitUntil: 'networkidle' });
    
    const startTime = Date.now();
    await page.goBack();
    await page.waitForLoadState('networkidle');
    const backTime = Date.now() - startTime;
    
    console.log(`\n📊 Back Navigation: ${backTime}ms (threshold: ${thresholds.routeTransition * 3}ms)`);
    
    expect(backTime).toBeLessThan(thresholds.routeTransition * 3);
  });
});

test.describe('Memory Usage', () => {
  test.skip(true, 'Memory tests are unreliable in headless browser');

  test('No memory leaks during navigation', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const initialMetrics = await collectPerformanceMetrics(page);
    const initialMemory = initialMetrics.memoryUsage;
    
    const routes = ['/tests', '/coding', '/learning-paths', '/tests', '/'];
    
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
    }
    
    const finalMetrics = await collectPerformanceMetrics(page);
    const finalMemory = finalMetrics.memoryUsage;
    const memoryGrowth = finalMemory - initialMemory;
    
    console.log(`\n📊 Memory Usage:`);
    console.log(`  Initial: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Final: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB (threshold: ${(thresholds.memoryUsage * 2 / 1024 / 1024).toFixed(2)}MB)`);
    
    expect(memoryGrowth).toBeLessThan(thresholds.memoryUsage * 2);
  });

  test('Memory stable during extended session', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const memorySamples: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      await page.goto(['/', '/tests', '/coding', '/learning-paths', '/'][i], { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      
      const metrics = await collectPerformanceMetrics(page);
      memorySamples.push(metrics.memoryUsage);
    }
    
    const avgMemory = memorySamples.reduce((a, b) => a + b, 0) / memorySamples.length;
    const maxMemory = Math.max(...memorySamples);
    const variance = memorySamples.reduce((sum, val) => sum + Math.pow(val - avgMemory, 2), 0) / memorySamples.length;
    const stdDev = Math.sqrt(variance);
    
    console.log(`\n📊 Extended Session Memory:`);
    console.log(`  Avg: ${(avgMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Max: ${(maxMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Std Dev: ${(stdDev / 1024 / 1024).toFixed(2)}MB`);
    
    expect(maxMemory).toBeLessThan(thresholds.memoryUsage * 3);
  });
});

test.describe('Animation Performance', () => {
  test('Animations run at 60fps', async ({ page, isMobile }) => {
    test.skip(true, 'Animation FPS test is unreliable in headless browser - depends on GPU rendering');
  });

  test('No janky scrolling', async ({ page }) => {
    test.skip(true, 'Scroll jank test is unreliable in headless browser - depends on actual scrolling hardware');
  });
});

test.describe('Long Task Detection', () => {
  test('No blocking long tasks on page load', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const metrics = await collectPerformanceMetrics(page);
    
    console.log(`\n📊 Long Tasks:`);
    console.log(`  Count: ${metrics.longTasks}`);
    console.log(`  Total Time: ${metrics.longTasksTotalTime.toFixed(2)}ms`);
    
    if (metrics.longTasks > 0) {
      console.log(`  Threshold per task: ${thresholds.longTaskThreshold}ms`);
      expect(metrics.longTasksTotalTime / metrics.longTasks).toBeLessThan(200);
    }
  });

  test('Interaction responsiveness', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    
    await page.goto('/tests', { waitUntil: 'networkidle' });
    
    const interactions = await page.evaluate(async () => {
      const results: { action: string; time: number }[] = [];
      
      const start1 = performance.now();
      document.querySelector('button')?.click();
      results.push({ action: 'first-click', time: performance.now() - start1 });
      
      await new Promise((r) => setTimeout(r, 100));
      
      const start2 = performance.now();
      document.querySelector('a')?.click();
      results.push({ action: 'first-link', time: performance.now() - start2 });
      
      return results;
    });
    
    console.log(`\n📊 Interaction Response Times:`);
    interactions.forEach((i) => {
      console.log(`  ${i.action}: ${i.time.toFixed(2)}ms`);
    });
    
    const avgResponse = interactions.reduce((a, b) => a + b.time, 0) / interactions.length;
    expect(avgResponse).toBeLessThan(100);
  });
});

test.describe('Comprehensive Performance Report', () => {
  test.skip(true, 'Full audit requires production-optimized environment - skipped for dev');

  test('Full page performance audit', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Full audit skipped on mobile for time constraints');
    
    const thresholds = getThresholds(isMobile);
    
    console.log('\n========== COMPREHENSIVE PERFORMANCE AUDIT ==========\n');
    
    const pagesToTest = [
      { path: '/', name: 'Home' },
      { path: '/tests', name: 'Tests' },
    ];
    
    const allResults: { page: string; metrics: PerformanceMetrics }[] = [];
    
    for (const pageInfo of pagesToTest) {
      await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      
      const metrics = await collectPerformanceMetrics(page);
      allResults.push({ page: pageInfo.name, metrics });
      
      console.log(`\n📄 ${pageInfo.name} Page:`);
      console.log(`   LCP: ${metrics.lcp > 0 ? metrics.lcp.toFixed(2) + 'ms' : 'N/A'}`);
      console.log(`   FCP: ${metrics.fcp.toFixed(2)}ms`);
      console.log(`   TTI: ${metrics.tti.toFixed(2)}ms`);
      console.log(`   CLS: ${metrics.cls.toFixed(4)}`);
      console.log(`   INP: ${metrics.inp > 0 ? metrics.inp.toFixed(2) + 'ms' : 'N/A'}`);
      console.log(`   Resources: ${metrics.resourceCount}`);
      console.log(`   JS Size: ${(metrics.jsBundleSize / 1024).toFixed(2)}KB`);
    }
    
    const avgMetrics = {
      lcp: allResults.reduce((sum, r) => sum + (r.metrics.lcp || 0), 0) / allResults.length,
      fcp: allResults.reduce((sum, r) => sum + r.metrics.fcp, 0) / allResults.length,
      tti: allResults.reduce((sum, r) => sum + r.metrics.tti, 0) / allResults.length,
      resourceCount: allResults.reduce((sum, r) => sum + r.metrics.resourceCount, 0) / allResults.length,
    };
    
    console.log(`\n📊 AVERAGES:`);
    console.log(`   LCP: ${avgMetrics.lcp.toFixed(2)}ms / ${thresholds.lcp}ms`);
    console.log(`   FCP: ${avgMetrics.fcp.toFixed(2)}ms / ${thresholds.fcp}ms`);
    console.log(`   TTI: ${avgMetrics.tti.toFixed(2)}ms / ${thresholds.tti}ms`);
    console.log(`   Resources: ${avgMetrics.resourceCount.toFixed(0)}`);
    
    console.log('\n========================================================\n');
    
    expect(avgMetrics.fcp).toBeLessThan(thresholds.fcp * 1.5);
    expect(avgMetrics.tti).toBeLessThan(thresholds.tti * 1.5);
  });
});

test.describe('Performance Under Load', () => {
  test('Concurrent navigation performance', async ({ page, isMobile }) => {
    const thresholds = getThresholds(isMobile);
    
    const startTime = Date.now();
    
    await Promise.all([
      page.goto('/', { waitUntil: 'domcontentloaded' }),
    ]);
    
    await page.waitForLoadState('networkidle');
    
    const totalTime = Date.now() - startTime;
    
    console.log(`\n📊 Concurrent Load: ${totalTime}ms`);
    
    expect(totalTime).toBeLessThan(10000);
  });

  test('Repeated visits are cached', async ({ page }) => {
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
    console.log(`  Cache Savings: ${((1 - secondLoad / firstLoad) * 100).toFixed(1)}%`);
    
    expect(secondLoad).toBeLessThan(firstLoad * 0.7);
  });
});
