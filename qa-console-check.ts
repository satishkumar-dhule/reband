import { chromium } from 'playwright';

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/channels', name: 'Channels' },
  { path: '/stats', name: 'Stats' },
  { path: '/profile', name: 'Profile' },
  { path: '/voice-interview', name: 'Voice Practice' },
  { path: '/coding', name: 'Coding' },
  { path: '/bookmarks', name: 'Bookmarks' },
];

const BASE_URL = 'http://localhost:5002';

async function checkPageForErrors(pagePath: string, pageName: string) {
  const errors: string[] = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  // Capture page errors
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });

  try {
    // Set up user state (like in fixtures)
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['system-design', 'algorithms', 'frontend', 'backend', 'devops'],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      }));
      localStorage.setItem('user-credits', JSON.stringify({
        balance: 500,
        totalEarned: 500,
        totalSpent: 0,
        usedCoupons: [],
        initialized: true,
      }));
    });

    // Navigate to page
    await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

    // Check if page loaded successfully
    const content = await page.locator('body').textContent();
    const hasContent = content && content.length > 50;

    await browser.close();

    return {
      pageName,
      pagePath,
      hasContent,
      errors,
      status: hasContent ? 'OK' : 'NO CONTENT'
    };
  } catch (err: any) {
    await browser.close();
    return {
      pageName,
      pagePath,
      hasContent: false,
      errors: [`Navigation Error: ${err.message}`],
      status: 'ERROR'
    };
  }
}

async function main() {
  console.log('=== QA Console Error Check ===\n');
  console.log(`Target: ${BASE_URL}\n`);

  const results = [];

  for (const page of PAGES) {
    console.log(`Checking ${page.name} (${page.path})...`);
    const result = await checkPageForErrors(page.path, page.name);
    results.push(result);
  }

  // Print summary
  console.log('\n=== RESULTS ===\n');

  let totalErrors = 0;
  for (const result of results) {
    console.log(`📄 ${result.pageName} (${result.pagePath})`);
    console.log(`   Status: ${result.status}`);
    
    if (result.errors.length > 0) {
      totalErrors += result.errors.length;
      console.log(`   Errors found: ${result.errors.length}`);
      for (const err of result.errors) {
        console.log(`   - ${err}`);
      }
    } else {
      console.log(`   ✅ No errors`);
    }
    console.log('');
  }

  console.log('=== SUMMARY ===');
  console.log(`Total pages checked: ${PAGES.length}`);
  console.log(`Total errors found: ${totalErrors}`);

  if (totalErrors === 0) {
    console.log('\n✅ All pages passed!');
  } else {
    console.log('\n⚠️  Errors detected - see details above');
  }
}

main().catch(console.error);
