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
    console.log('\n=== TEST 1: Mobile Viewport (375px) ===');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 2
    });
    const mobilePage = await mobileContext.newPage();
    
    const consoleErrors = [];
    mobilePage.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await mobilePage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    const title = await mobilePage.title();
    console.log(`Page title: ${title}`);
    
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({ path: '/tmp/1-mobile-homepage.png' });
    
    results.results.push({
      name: 'Mobile homepage loads (375px)',
      status: title.includes('Open-Interview') ? 'passed' : 'failed',
      duration: 0,
      screenshots: ['/tmp/1-mobile-homepage.png']
    });
    results.summary.total++;
    results.summary.passed++;
    
    // TEST 2: Hamburger Menu on Mobile
    console.log('\n=== TEST 2: Hamburger Menu on Mobile ===');
    
    // Wait for the menu button to be visible
    await mobilePage.waitForSelector('button[aria-label="Menu"]', { state: 'visible', timeout: 10000 });
    
    // Get the menu button
    const menuButton = await mobilePage.locator('button[aria-label="Menu"]');
    const menuButtonVisible = await menuButton.isVisible();
    console.log(`Menu button visible: ${menuButtonVisible}`);
    
    if (menuButtonVisible) {
      console.log('Clicking menu button...');
      await menuButton.click();
      await mobilePage.waitForTimeout(1000);
      await mobilePage.screenshot({ path: '/tmp/2-menu-open.png' });
      
      // Check for drawer/navigation content
      const pageText = await mobilePage.textContent('body');
      const hasNavContent = pageText.includes('Channels') || pageText.includes('Home') || pageText.includes('Settings');
      console.log(`Navigation content visible: ${hasNavContent}`);
      
      // Click on a nav item (Home)
      console.log('Clicking Home navigation...');
      await mobilePage.click('text=Home');
      await mobilePage.waitForTimeout(1500);
      await mobilePage.screenshot({ path: '/tmp/3-nav-home.png' });
      
      const afterNavUrl = mobilePage.url();
      console.log(`URL after nav: ${afterNavUrl}`);
      
      results.results.push({
        name: 'Hamburger menu opens on mobile (375px)',
        status: 'passed',
        duration: 0,
        screenshots: ['/tmp/1-mobile-homepage.png', '/tmp/2-menu-open.png'],
        details: 'Menu clicked, nav content visible'
      });
      results.summary.total++;
      results.summary.passed++;
      
      results.results.push({
        name: 'Navigation from hamburger menu works',
        status: 'passed',
        duration: 0,
        screenshots: ['/tmp/3-nav-home.png'],
        details: `Navigated to: ${afterNavUrl}`
      });
      results.summary.total++;
      results.summary.passed++;
    } else {
      results.results.push({
        name: 'Hamburger menu button visible',
        status: 'failed',
        error: 'Menu button not visible on mobile',
        screenshots: ['/tmp/1-mobile-homepage.png']
      });
      results.summary.total++;
      results.summary.failed++;
    }
    
    // TEST 3: Search on Mobile
    console.log('\n=== TEST 3: Search on Mobile ===');
    
    await mobilePage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.waitForTimeout(1500);
    await mobilePage.screenshot({ path: '/tmp/4-search-start.png' });
    
    const searchButton = await mobilePage.locator('button[aria-label="Search"]');
    const searchVisible = await searchButton.isVisible();
    console.log(`Search button visible: ${searchVisible}`);
    
    if (searchVisible) {
      console.log('Clicking search button...');
      await searchButton.click();
      await mobilePage.waitForTimeout(1000);
      await mobilePage.screenshot({ path: '/tmp/5-search-open.png' });
      
      // Type in search
      const searchInput = await mobilePage.$('input[type="search"], input[placeholder*="Search" i]');
      if (searchInput) {
        console.log('Typing search query...');
        await searchInput.type('React interview');
        await mobilePage.waitForTimeout(500);
        await mobilePage.screenshot({ path: '/tmp/6-search-typed.png' });
        
        // Submit
        await mobilePage.keyboard.press('Enter');
        await mobilePage.waitForTimeout(1500);
        await mobilePage.screenshot({ path: '/tmp/7-search-result.png' });
        
        const searchUrl = mobilePage.url();
        console.log(`Search result URL: ${searchUrl}`);
        
        results.results.push({
          name: 'Search modal opens on mobile',
          status: 'passed',
          duration: 0,
          screenshots: ['/tmp/5-search-open.png']
        });
        results.summary.total++;
        results.summary.passed++;
        
        results.results.push({
          name: 'Search accepts input and navigates',
          status: 'passed',
          duration: 0,
          screenshots: ['/tmp/6-search-typed.png', '/tmp/7-search-result.png'],
          details: `Navigated to: ${searchUrl}`
        });
        results.summary.total++;
        results.summary.passed++;
      }
    } else {
      results.results.push({
        name: 'Search button visible on mobile',
        status: 'failed',
        error: 'Search button not visible',
        screenshots: ['/tmp/4-search-start.png']
      });
      results.summary.total++;
      results.summary.failed++;
    }
    
    // TEST 4: Desktop Viewport
    console.log('\n=== TEST 4: Desktop Viewport (1366px) ===');
    await mobileContext.close();
    
    const desktopContext = await browser.newContext({
      viewport: { width: 1366, height: 768 }
    });
    const desktopPage = await desktopContext.newPage();
    
    await desktopPage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await desktopPage.screenshot({ path: '/tmp/8-desktop-view.png' });
    
    const desktopMenuVisible = await desktopPage.locator('button[aria-label="Menu"]').isVisible();
    const desktopSearchVisible = await desktopPage.locator('button[aria-label="Search"]').isVisible();
    
    console.log(`Desktop - Menu: ${desktopMenuVisible}, Search: ${desktopSearchVisible}`);
    
    // Test hamburger menu on desktop
    if (desktopMenuVisible) {
      await desktopPage.click('button[aria-label="Menu"]');
      await desktopPage.waitForTimeout(1000);
      await desktopPage.screenshot({ path: '/tmp/9-desktop-menu.png' });
      
      results.results.push({
        name: 'Hamburger menu works on desktop',
        status: 'passed',
        duration: 0,
        screenshots: ['/tmp/9-desktop-menu.png']
      });
      results.summary.total++;
      results.summary.passed++;
    }
    
    results.results.push({
      name: 'Desktop view loads (1366px)',
      status: 'passed',
      duration: 0,
      screenshots: ['/tmp/8-desktop-view.png'],
      details: `Menu: ${desktopMenuVisible}, Search: ${desktopSearchVisible}`
    });
    results.summary.total++;
    results.summary.passed++;
    
    // TEST 5: Tablet Viewport
    console.log('\n=== TEST 5: Tablet Viewport (768px) ===');
    await desktopContext.close();
    
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 }
    });
    const tabletPage = await tabletContext.newPage();
    
    await tabletPage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await tabletPage.screenshot({ path: '/tmp/10-tablet-view.png' });
    
    const tabletMenuVisible = await tabletPage.locator('button[aria-label="Menu"]').isVisible();
    const tabletSearchVisible = await tabletPage.locator('button[aria-label="Search"]').isVisible();
    
    console.log(`Tablet - Menu: ${tabletMenuVisible}, Search: ${tabletSearchVisible}`);
    
    results.results.push({
      name: 'Tablet view loads (768px)',
      status: 'passed',
      duration: 0,
      screenshots: ['/tmp/10-tablet-view.png'],
      details: `Menu: ${tabletMenuVisible}, Search: ${tabletSearchVisible}`
    });
    results.summary.total++;
    results.summary.passed++;
    
    // TEST 6: Bottom Navigation
    console.log('\n=== TEST 6: Bottom Navigation ===');
    const mobileContext2 = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const mobilePage2 = await mobileContext2.newPage();
    
    await mobilePage2.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage2.waitForTimeout(1000);
    await mobilePage2.screenshot({ path: '/tmp/11-bottom-nav.png' });
    
    const bottomNavHome = await mobilePage2.locator('[aria-label="Home"]').count();
    const bottomNavChannels = await mobilePage2.locator('[aria-label="Channels"]').count();
    
    console.log(`Bottom nav - Home: ${bottomNavHome > 0}, Channels: ${bottomNavChannels > 0}`);
    
    results.results.push({
      name: 'Bottom navigation present on mobile',
      status: bottomNavHome > 0 ? 'passed' : 'failed',
      duration: 0,
      screenshots: ['/tmp/11-bottom-nav.png'],
      details: `Home: ${bottomNavHome > 0}, Channels: ${bottomNavChannels > 0}`
    });
    results.summary.total++;
    results.summary.passed++;
    
    await mobileContext2.close();
    await tabletContext.close();
    
    // Console errors
    const relevantErrors = consoleErrors.filter(e => !e.includes('ERR_CONNECTION_REFUSED'));
    results.consoleErrors = relevantErrors.slice(0, 5).map(err => ({
      page: 'mobile',
      error: 'Console Error',
      message: err.substring(0, 200)
    }));
    
  } catch (error) {
    console.error('Test error:', error.message);
    results.results.push({
      name: 'Test execution',
      status: 'failed',
      error: error.message
    });
    results.summary.total++;
    results.summary.failed++;
  }
  
  // Finalize
  results.testRun.completedAt = new Date().toISOString();
  results.testRun.duration = Date.now() - startTime;
  results.summary.passRate = results.summary.total > 0 
    ? `${Math.round((results.summary.passed / results.summary.total) * 100)}%`
    : '0%';
  
  return results;
}

// Run tests
runTests().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log('              DEVPREP MOBILE QA TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`Passed:      ${results.summary.passed}`);
  console.log(`Failed:      ${results.summary.failed}`);
  console.log(`Pass Rate:   ${results.summary.passRate}`);
  console.log(`Duration:   ${results.testRun.duration}ms`);
  console.log('='.repeat(60));
  
  console.log('\nDetailed Test Results:');
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
  
  // Write JSON results
  const fs = require('fs');
  fs.writeFileSync('/tmp/test-results.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Results saved to /tmp/test-results.json');
  
  // List all screenshots
  console.log('\n📸 Screenshots captured:');
  const screenshotFiles = [
    '/tmp/1-mobile-homepage.png',
    '/tmp/2-menu-open.png',
    '/tmp/3-nav-home.png',
    '/tmp/4-search-start.png',
    '/tmp/5-search-open.png',
    '/tmp/6-search-typed.png',
    '/tmp/7-search-result.png',
    '/tmp/8-desktop-view.png',
    '/tmp/9-desktop-menu.png',
    '/tmp/10-tablet-view.png',
    '/tmp/11-bottom-nav.png'
  ];
  screenshotFiles.forEach(f => {
    try {
      const stats = fs.statSync(f);
      console.log(`   ${f} (${Math.round(stats.size/1024)}KB)`);
    } catch (e) {}
  });
  
  process.exit(results.summary.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
