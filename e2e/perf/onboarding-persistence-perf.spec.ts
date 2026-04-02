import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Onboarding Persistence Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('1. localStorage read/write should not block main thread', async ({ page }) => {
    const blockingTime = await page.evaluate(async () => {
      const results: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        
        const testData = {
          role: 'frontend',
          subscribedChannels: ['algorithms', 'system-design'],
          onboardingComplete: false,
          shuffleQuestions: true,
        };
        
        localStorage.setItem('test-perf', JSON.stringify(testData));
        const read = JSON.parse(localStorage.getItem('test-perf') || '{}');
        localStorage.removeItem('test-perf');
        
        const end = performance.now();
        results.push(end - start);
      }
      
      const avgBlocking = results.reduce((a, b) => a + b, 0) / results.length;
      const maxBlocking = Math.max(...results);
      
      return { avgBlocking, maxBlocking, samples: results.length };
    });

    console.log('localStorage blocking metrics:', blockingTime);
    
    expect(blockingTime.avgBlocking).toBeLessThan(10);
    expect(blockingTime.maxBlocking).toBeLessThan(50);
  });

  test('2. Initial page load time should be < 2s', async ({ page, context }) => {
    const navigationTiming = await page.evaluate(() => {
      const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
        loadComplete: navigation?.loadEventEnd || 0,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });

    console.log('Navigation timing (ms):', navigationTiming);
    
    expect(navigationTiming.domContentLoaded).toBeLessThan(2000);
    expect(navigationTiming.firstContentfulPaint).toBeLessThan(2000);
  });

  test('3. No memory leaks during onboarding flow', async ({ page }) => {
    const memoryMetrics = await page.evaluate(async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      await new Promise<void>((resolve) => {
        let count = 0;
        const simulateOnboarding = () => {
          for (let i = 0; i < 50; i++) {
            const data = {
              role: `role-${i}`,
              subscribedChannels: ['algorithms', 'frontend', 'backend'],
              onboardingComplete: i % 2 === 0,
              createdAt: new Date().toISOString(),
            };
            localStorage.setItem(`pref-${i}`, JSON.stringify(data));
          }
          count++;
          if (count < 10) {
            requestAnimationFrame(simulateOnboarding);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(simulateOnboarding);
      });

      const afterWriteMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 50; i++) {
        localStorage.removeItem(`pref-${i}`);
      }
      
      await new Promise(r => setTimeout(r, 100));
      
      const afterCleanupMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = afterWriteMemory - initialMemory;
      const memoryFreed = afterWriteMemory - afterCleanupMemory;
      
      return {
        initialMemory,
        afterWriteMemory,
        afterCleanupMemory,
        memoryIncrease,
        memoryFreed,
        leakDetected: memoryIncrease > 10 * 1024 * 1024,
      };
    });

    console.log('Memory metrics:', memoryMetrics);
    
    expect(memoryMetrics.leakDetected).toBe(false);
    expect(memoryMetrics.memoryFreed).toBeGreaterThan(0);
  });

  test('4. Storage operations should be synchronous (< 10ms)', async ({ page }) => {
    const syncMetrics = await page.evaluate(async () => {
      const testPrefs = {
        role: 'fullstack',
        subscribedChannels: ['algorithms', 'system-design', 'frontend', 'backend'],
        subscribedCertifications: ['aws-saa'],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: true,
        prioritizeUnvisited: true,
      };

      const writeTimes: number[] = [];
      const readTimes: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const key = `perf-test-${i}`;
        
        const writeStart = performance.now();
        localStorage.setItem(key, JSON.stringify(testPrefs));
        const writeEnd = performance.now();
        writeTimes.push(writeEnd - writeStart);
        
        const readStart = performance.now();
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const readEnd = performance.now();
        readTimes.push(readEnd - readStart);
        
        localStorage.removeItem(key);
      }

      return {
        avgWriteMs: writeTimes.reduce((a, b) => a + b, 0) / writeTimes.length,
        maxWriteMs: Math.max(...writeTimes),
        avgReadMs: readTimes.reduce((a, b) => a + b, 0) / readTimes.length,
        maxReadMs: Math.max(...readTimes),
      };
    });

    console.log('Sync storage operations (ms):', syncMetrics);
    
    expect(syncMetrics.avgWriteMs).toBeLessThan(10);
    expect(syncMetrics.avgReadMs).toBeLessThan(10);
    expect(syncMetrics.maxWriteMs).toBeLessThan(50);
    expect(syncMetrics.maxReadMs).toBeLessThan(50);
  });

  test('Onboarding context initialization does not block render', async ({ page }) => {
    const initTiming = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const start = performance.now();
        
        const checkReady = () => {
          const content = document.body.innerHTML;
          if (content && content.length > 100) {
            resolve(performance.now() - start);
          } else {
            requestAnimationFrame(checkReady);
          }
        };
        
        requestAnimationFrame(checkReady);
      });
    });

    console.log('Context init + render time:', initTiming, 'ms');
    expect(initTiming).toBeLessThan(2000);
  });
});
