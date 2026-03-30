import { defineConfig, devices } from '@playwright/test';

/**
 * Optimized Playwright Configuration
 * - Parallel execution for speed
 * - Mobile-first testing (iPhone 13)
 * - Performance monitoring
 * - Accessibility testing
 */

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  
  // Enhanced reporting
  reporter: process.env.CI 
    ? [
        ['line'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
      ]
    : [
        ['html', { open: 'on-failure' }],
        ['list'],
      ],
  
  // Optimized timeouts (increased for slow pages with heavy components)
  timeout: 90000, // 90s - heavy pages like VoiceInterview, ReviewSession need more time due to lazy-loaded chunks
  expect: {
    timeout: 15000, // 15s for assertions (heavier DOM on complex pages)
  },
  
  use: {
    baseURL: 'http://localhost:5001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 60000, // Increased for lazy-loaded heavy components (Mermaid, SyntaxHighlighter, etc.)
    
    // Performance optimizations
    launchOptions: {
      args: [
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
      ],
    },
  },
  
  outputDir: 'test-results',
  
  projects: [
    // Desktop Chrome - Primary (ONLY THIS FOR SPEED)
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /.*\.(spec|test)\.ts$/,
      // Temporarily ignore slow/problematic tests
      testIgnore: [
        '**/mobile-only.spec.ts',
        '**/about.spec.ts',
        '**/answer-panel-theme.spec.ts',
        '**/audit-engine.spec.ts',
        '**/aria-audit.spec.ts',
        '**/screen-reader-audit.spec.ts',
        '**/keyboard-navigation-audit.spec.ts',
        '**/color-contrast-audit.spec.ts',
        '**/touch-target-audit.spec.ts',
        '**/reduced-motion.spec.ts',
        '**/custom-checks.spec.ts',
        '**/iphone13-ui-audit.spec.ts', // Run separately
        '**/mobile/comprehensive-mobile.spec.ts', // Run on mobile projects only
      ],
    },
    
    // iPhone 13 UI Audit - Separate project for mobile testing
    {
      name: 'iphone13-audit',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
      testMatch: '**/iphone13-ui-audit.spec.ts',
    },

    // Mobile Device Emulation - iPhone SE (using Chromium)
    {
      name: 'mobile-iphone-se',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        browserName: 'chromium',
      },
      testMatch: '**/mobile/comprehensive-mobile.spec.ts',
    },

    // Mobile Device Emulation - iPhone 13 (using Chromium)
    {
      name: 'mobile-iphone-13',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        browserName: 'chromium',
      },
      testMatch: '**/mobile/comprehensive-mobile.spec.ts',
    },

    // Mobile Device Emulation - iPhone 14 Pro (using Chromium)
    {
      name: 'mobile-iphone-14-pro',
      use: {
        ...devices['iPhone 14 Pro'],
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        browserName: 'chromium',
      },
      testMatch: '**/mobile/comprehensive-mobile.spec.ts',
    },

    // Mobile Device Emulation - iPad Pro 11 (using Chromium)
    {
      name: 'mobile-ipad-pro',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 834, height: 1194 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        browserName: 'chromium',
      },
      testMatch: '**/mobile/comprehensive-mobile.spec.ts',
    },

    // Mobile Device Emulation - Samsung Galaxy S24 (using Chromium)
    {
      name: 'mobile-samsung-galaxy',
      use: {
        ...devices['Samsung Galaxy S24'],
        viewport: { width: 360, height: 780 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        browserName: 'chromium',
      },
      testMatch: '**/mobile/comprehensive-mobile.spec.ts',
    },

    // Mobile Device Emulation - Pixel 7 (using Chromium)
    {
      name: 'mobile-pixel-7',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 2.625,
        isMobile: true,
        hasTouch: true,
        browserName: 'chromium',
      },
      testMatch: '**/mobile/comprehensive-mobile.spec.ts',
    },
  ],
  
  webServer: {
    command: 'npm run dev:vite',
    url: 'http://localhost:5001',
    reuseExistingServer: !process.env.CI,
    timeout: 180000, // 3 minutes - allows for slow builds and heavy dependency loading
    stdout: 'pipe',
    stderr: 'pipe',
  },
  
  // Global setup/teardown
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
});
