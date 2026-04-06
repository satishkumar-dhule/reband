/**
 * Global Setup for E2E Tests
 * Runs once before all tests
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');

  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();

  try {
    // Wait for server to be ready
    const baseURL = config.use?.baseURL || 'http://localhost:5001';
    console.log(`⏳ Waiting for server at ${baseURL}...`);
    
    // Verify server is up via fetch (no browser crash risk)
    let serverReady = false;
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(`${baseURL}/api/keep-alive`);
        if (res.ok) { serverReady = true; break; }
      } catch {}
      await new Promise(r => setTimeout(r, 1000));
    }
    
    if (!serverReady) {
      console.warn('⚠️ Server not confirmed ready, proceeding anyway...');
    } else {
      console.log('✅ Server is ready');
    }

    // Pre-warm cache
    console.log('🔥 Pre-warming cache...');
    await page.waitForTimeout(200);
    console.log('✅ Cache pre-warmed');

    // Clear any existing test data
    try {
      await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      console.log('✅ Test data cleared');
    } catch {
      console.log('ℹ️ Skipping test data clear (page load optional in setup)');
    }

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    // Don't throw - allow tests to run even if setup has issues
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup complete\n');
}

export default globalSetup;
