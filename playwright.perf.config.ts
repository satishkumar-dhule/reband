import { defineConfig, devices } from '@playwright/test';

interface PerfThresholds {
  lcp: number;
  fid: number;
  cls: number;
  inp: number;
  fcp: number;
  tti: number;
  networkLatency: number;
  bundleSize: number;
  routeTransition: number;
  memoryUsage: number;
  animationFps: number;
  longTaskThreshold: number;
}

export const PERF_THRESHOLDS: PerfThresholds = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  inp: 200,
  fcp: 1800,
  tti: 3800,
  networkLatency: 300,
  bundleSize: 500000,
  routeTransition: 1000,
  memoryUsage: 100 * 1024 * 1024,
  animationFps: 50,
  longTaskThreshold: 50,
};

export const MOBILE_PERF_THRESHOLDS: PerfThresholds = {
  lcp: 3000,
  fid: 100,
  cls: 0.1,
  inp: 300,
  fcp: 2000,
  tti: 4500,
  networkLatency: 400,
  bundleSize: 600000,
  routeTransition: 1500,
  memoryUsage: 150 * 1024 * 1024,
  animationFps: 45,
  longTaskThreshold: 50,
};

export default defineConfig({
  testDir: './e2e/performance',
  fullyParallel: false,
  retries: 2,
  workers: 1,
  timeout: 120000,

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-perf-report' }],
    ['json', { outputFile: 'test-results/performance-results.json' }],
    ['line'],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,

    launchOptions: {
      args: [
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--enable-precise-memory-info',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-first-run',
      ],
    },
  },

  outputDir: 'test-results/perf',

  projects: [
    {
      name: 'chromium-perf',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        permissions: ['performance'],
      },
    },
    {
      name: 'mobile-perf',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        permissions: ['performance'],
      },
    },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
