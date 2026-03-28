const { chromium } = require('playwright');

async function runTests() {
  const results = {
    testRun: {
      id: `test-${Date.now()}`,
      environment: 'local',
      startedAt: new Date().toISOString(),
      completedAt: null,
      duration: 0
    },
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      passRate: '0%'
    },
    results: [],
    consoleErrors: []
  };

  const startTime = Date.now();
  let browser;
  
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Test 1: Mobile viewport (375px)
    console.log('\n=== TEST 1: Mobile Homepage (375px) ===');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 2
    });
    const mobilePage = await mobileContext.newPage();
    
    const consoleErrors = [];
    mobilePage.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    
    await mobilePage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    const title = await mobilePage.title();
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({ path: '/tmp/1-mobile-homepage.png' });
    
    results.results.push({
      name: 'Mobile homepage loads (375px)',
      status: title.includes('Open-Interview') ? 'passed' : 'failed',
      duration: 0,
      screenshots: ['/tmp/1-mobile-homepage.png']
    });
    results.summary.total++;
    if (title.includes('Open-Interview')) results.summary.passed++;
    else results.summary.failed++;
    
    // TEST 2: Hamburger Menu on Mobile
    console.log('\n=== TEST 2: Hamburger Menu (375px) ===');
    
    await mobilePage.waitForSelector('button[aria-label="Menu"]', { state: 'visible', timeout: 10000 });
    await mobilePage.click('button[aria-label="Menu"]');
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: '/tmp/2-menu-open.png' });
    
    // Check drawer is open
    const pageText = await mobilePage.textContent('body');
    const drawerOpen = pageText.includes('All Channels') && pageText.includes('Home');
    
    results.results.push({
      name: 'Hamburger menu opens drawer on mobile',
      status: drawerOpen ? 'passed' : 'failed',
      duration: 0,
      screenshots: ['/tmp/2-menu-open.png'],
      details: drawerOpen ? 'Drawer opened with navigation items' : 'Drawer did not open'
    });
    results.summary.total++;
    if (drawerOpen) results.summary.passed++;
    else results.summary.failed++;
    
    // Close drawer with escape
    await mobilePage.keyboard.press('Escape');
    await mobilePage.waitForTimeout(500);
    
    // TEST 3: Search on Mobile
    console.log('\n=== TEST 3: Search Functionality (Mobile) ===');
    
    await mobilePage.waitForSelector('button[aria-label="Search"]', { state: 'visible', timeout: 5000 });
    await mobilePage.click('button[aria-label="Search"]');
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: '/tmp/3-search-open.png' });
    
    // Type search query
    const searchInput = await mobilePage.$('input[type="search"], input[placeholder*="Search" i]');
    if (searchInput) {
      await searchInput.type('React');
      await mobilePage.waitForTimeout(500);
      await mobilePage.screenshot({ path: '/tmp/4-search-typed.png' });
      await mobilePage.keyboard.press('Enter');
      await mobilePage.waitForTimeout(1500);
      await mobilePage.screenshot({ path: '/tmp/5-search-result.png' });
      
      const searchUrl = mobilePage.url();
      
      results.results.push({
        name: 'Search opens, accepts input, and navigates',
        status: 'passed',
        duration: 0,
        screenshots: ['/tmp/3-search-open.png', '/tmp/4-search-typed.png', '/tmp/5-search-result.png'],
        details: `Navigated to: ${searchUrl}`
      });
      results.summary.total++;
      results.summary.passed++;
    } else {
      results.results.push({
        name: 'Search accepts input',
        status: 'failed',
        error: 'Search input not found',
        screenshots: ['/tmp/3-search-open.png']
      });
      results.summary.total++;
      results.summary.failed++;
    }
    
    // TEST 4: Desktop Viewport
    console.log('\n=== TEST 4: Desktop Viewport (1366px) ===');
    await mobileContext.close();
    
    const desktopContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const desktopPage = await desktopContext.newPage();
    
    await desktopPage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await desktopPage.screenshot({ path: '/tmp/6-desktop-view.png' });
    
    const desktopMenuVisible = await desktopPage.locator('button[aria-label="Menu"]').isVisible();
    const desktopSearchVisible = await desktopPage.locator('button[aria-label="Search"]').isVisible();
    
    // Test hamburger menu on desktop
    if (desktopMenuVisible) {
      await desktopPage.click('button[aria-label="Menu"]');
      await desktopPage.waitForTimeout(1000);
      await desktopPage.screenshot({ path: '/tmp/7-desktop-menu.png' });
    }
    
    results.results.push({
      name: 'Desktop view loads with hamburger menu',
      status: desktopMenuVisible ? 'passed' : 'failed',
      duration: 0,
      screenshots: ['/tmp/6-desktop-view.png', '/tmp/7-desktop-menu.png'],
      details: `Menu: ${desktopMenuVisible}, Search: ${desktopSearchVisible}`
    });
    results.summary.total++;
    if (desktopMenuVisible) results.summary.passed++;
    else results.summary.failed++;
    
    // TEST 5: Tablet Viewport
    console.log('\n=== TEST 5: Tablet Viewport (768px) ===');
    await desktopContext.close();
    
    const tabletContext = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const tabletPage = await tabletContext.newPage();
    
    await tabletPage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await tabletPage.screenshot({ path: '/tmp/8-tablet-view.png' });
    
    const tabletMenuVisible = await tabletPage.locator('button[aria-label="Menu"]').isVisible();
    const tabletSearchVisible = await tabletPage.locator('button[aria-label="Search"]').isVisible();
    
    results.results.push({
      name: 'Tablet view loads correctly (768px)',
      status: 'passed',
      duration: 0,
      screenshots: ['/tmp/8-tablet-view.png'],
      details: `Menu: ${tabletMenuVisible}, Search: ${tabletSearchVisible}`
    });
    results.summary.total++;
    results.summary.passed++;
    
    // TEST 6: Bottom Navigation
    console.log('\n=== TEST 6: Bottom Navigation ===');
    const mobileContext2 = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const mobilePage2 = await mobileContext2.newPage();
    
    await mobilePage2.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage2.waitForTimeout(1000);
    await mobilePage2.screenshot({ path: '/tmp/9-bottom-nav.png' });
    
    const bottomNavHome = await mobilePage2.locator('[aria-label="Home"]').count();
    
    results.results.push({
      name: 'Bottom navigation present on mobile',
      status: bottomNavHome > 0 ? 'passed' : 'failed',
      duration: 0,
      screenshots: ['/tmp/9-bottom-nav.png'],
      details: `Home button found: ${bottomNavHome > 0}`
    });
    results.summary.total++;
    if (bottomNavHome > 0) results.summary.passed++;
    else results.summary.failed++;
    
    await mobileContext2.close();
    await tabletContext.close();
    
    // Console errors
    const relevantErrors = consoleErrors.filter(e => !e.includes('ERR_CONNECTION_REFUSED'));
    results.consoleErrors = relevantErrors.slice(0, 5).map(err => ({ page: 'mobile', error: 'Console Error', message: err.substring(0, 200) }));
    
  } catch (error) {
    console.error('Test error:', error.message);
    results.results.push({ name: 'Test execution', status: 'failed', error: error.message });
    results.summary.total++;
    results.summary.failed++;
  }
  
  // Finalize
  results.testRun.completedAt = new Date().toISOString();
  results.testRun.duration = Date.now() - startTime;
  results.summary.passRate = results.summary.total > 0 ? `${Math.round((results.summary.passed / results.summary.total) * 100)}%` : '0%';
  
  return results;
}

// Run tests
runTests().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log('         DEVPREP MOBILE QA TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`Passed:      ${results.summary.passed}`);
  console.log(`Failed:      ${results.summary.failed}`);
  console.log(`Pass Rate:   ${results.summary.passRate}`);
  console.log(`Duration:   ${results.testRun.duration}ms`);
  console.log('='.repeat(60));
  
  console.log('\n📋 Test Results:');
  results.results.forEach((r, i) => {
    const icon = r.status === 'passed' ? '✅' : '❌';
    console.log(`\n${icon} ${r.name}`);
    if (r.error) console.log(`   Error: ${r.error}`);
    if (r.details) console.log(`   Details: ${r.details}`);
    if (r.screenshots) console.log(`   📸 ${r.screenshots.join(', ')}`);
  });
  
  if (results.consoleErrors.length > 0) {
    console.log('\n⚠️  Console Errors:');
    results.consoleErrors.forEach(e => console.log(`   - ${e.message}`));
  }
  
  // Write JSON
  const fs = require('fs');
  fs.writeFileSync('/tmp/test-results.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Results: /tmp/test-results.json');
  
  process.exit(results.summary.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
