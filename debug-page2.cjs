const { chromium } = require('@playwright/test');

async function debug() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }
  });
  
  const page = await context.newPage();
  
  // Listen to console
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  await page.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait more for hydration
  await page.waitForTimeout(5000);
  
  // Check page content
  const bodyText = await page.locator('body').innerText();
  console.log('\n=== Body text (first 500 chars) ===');
  console.log(bodyText.substring(0, 500));
  
  // Check for any error boundaries
  const hasError = await page.locator('text=Error').count();
  console.log(`\n"Error" text count: ${hasError}`);
  
  // Try getting the actual content
  const html = await page.content();
  const hasRoot = html.includes('id="root"');
  const hasApp = html.includes('DevPrep');
  console.log(`Has root div: ${hasRoot}`);
  console.log(`Has DevPrep: ${hasApp}`);
  
  await page.screenshot({ path: '/tmp/debug-full.png', fullPage: true });
  
  await browser.close();
}

debug();
