import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5002',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    browserName: 'chromium',
    launchOptions: {
      channel: 'chromium',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        browserName: 'chromium',
      },
    },
  ],
  webServer: {
    command: 'npm run dev:vite',
    url: 'http://localhost:5002',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
