import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/api',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  
  reporter: process.env.CI 
    ? [
        ['line'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
      ]
    : [
        ['line'],
      ],
  
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  
  outputDir: 'test-results/api',
  
  projects: [
    {
      name: 'api-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  
  webServer: {
    command: 'pnpm run dev:server',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
