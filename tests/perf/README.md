Performance test skeleton for Playwright

Overview
- Lightweight Playwright-based test that throttles network to simulate typical user conditions and captures key web performance metrics (TTFB, LCP, CLS).
- Writes a JSON result to /tmp/perf-result.json for CI dashboards.

What it covers
- Throttled network (latency, bandwidth)
- TTFB via Navigation Timing API
- LCP and CLS via PerformanceObserver

How to run locally
- Ensure dependencies are installed: npm ci
- Run: npx playwright test tests/perf/perf-e2e.spec.ts --config=playwright.config.ts
- Optional: set PERF_TEST_URL env var to override the target URL

CI considerations
- The test prints a JSON file to /tmp/perf-result.json which CI runners can archive as an artifact.
- To run in CI, you can invoke: npx playwright test tests/perf --config=playwright.config.ts

Configuration
- PERF_TEST_URL: Target URL for performance tests. Default: https://stage-open-interview.github.io
