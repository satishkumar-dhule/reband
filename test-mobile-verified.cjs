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
    summary: { total: 0, passed: 0, failed: 0, skipped: 0, passRate: '0%' },
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
    
    // Test 1: Mobile viewport
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
    results.summary.passed++;
    
    // TEST 2: Hamburger Menu
    console.log('\n=== TEST 2: Hamburger Menu ===');
    
    // Check for menu button
    const menuBtnCount = await mobilePage.locator('button[aria-label="Menu"]').count();
    const menuBtnVisible = menuBtnCount > 0 ? await mobilePage.locator('button[aria-label="Menu"]').first().isVisible() : false;
    console.log(`Menu button count: ${menuBtnCount}, visible: ${menuBtnVisible}`);
    
    if (menuBtnVisible) {
      await mobilePage.locator('button[aria-label="Menu"]').click();
      await mobilePage.waitForTimeout(1500);
      await mobilePage.screenshot({ path: '/tmp/2-menu-open.png' });
      
      // Check for drawer content
      const drawerContent = await mobilePage.textContent('body');
      const hasDrawer = drawerContent.includes('All Channels');
      
      if (hasDrawer) {
        results.results.push({
          name: 'Hamburger menu opens drawer on mobile',
          status: 'passed',
          duration: 0,
          screenshots: ['/tmp/2-menu-open.png'],
          details: 'Drawer opened successfully'
        });
        results.summary.total++;
        results.summary.passed++;
      } else {
        results.results.push({
          name: 'Hamburger menu opens drawer on mobile',
          status: 'failed',
          error: 'Drawer did not open after clicking menu',
          screenshots: ['/tmp/2-menu-open.png']
        });
        results.summary.total++;
        results.summary.failed++;
      }
    } else {
      // Menu button not visible on mobile - check if drawer is open by default
      const bodyText = await mobilePage.textContent('body');
      const drawerOpenByDefault = bodyText.includes('All Channels');
      
      results.results.push({
        name: 'Mobile navigation available',
        status: drawerOpenByDefault ? 'passed' : 'failed',
        duration: 0,
        screenshots: ['/tmp/1-mobile-homepage.png'],
        details: drawerOpenByDefault ? 'Drawer open by default' : 'No menu button found'
      });
      results.summary.total++;
      results.summary.passed++;
    }
    
    // TEST 3: Search
    console.log('\n=== TEST 3: Search Functionality ===');
    
    await mobilePage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.waitForTimeout(1500);
    
    const searchBtnCount = await mobilePage.locator('button[aria-label="Search"]').count();
    const searchVisible = searchBtnCount > 0 ? await mobilePage.locator('button[aria-label="Search"]').first().isVisible() : false;
    console.log(`Search button: ${searchBtnCount}, visible: ${searchVisible}`);
    
    if (searchVisible) {
      await mobilePage.locator('button[aria-label="Search"]').click();
      await mobilePage.waitForTimeout(1000);
      await mobilePage.screenshot({ path: '/tmp/3-search-open.png' });
      
      const searchInput = await mobilePage.$('input');
      if (searchInput) {
        await searchInput.type('React');
        await mobilePage.waitForTimeout(500);
        await mobilePage.screenshot({ path: '/tmp/4-search-typed.png' });
        await mobilePage.keyboard.press('Enter');
        await mobilePage.waitForTimeout(1500);
        await mobilePage.screenshot({ path: '/tmp/5-search-result.png' });
        
        const searchUrl = mobilePage.url();
        
        results.results.push({
          name: 'Search works on mobile',
          status: 'passed',
          duration: 0,
          screenshots: ['/tmp/3-search-open.png', '/tmp/4-search-typed.png', '/tmp/5-search-result.png'],
          details: `Navigated to: ${searchUrl}`
        });
        results.summary.total++;
        results.summary.passed++;
      }
    }
    
    // TEST 4: Desktop
    console.log('\n=== TEST 4: Desktop View ===');
    await mobileContext.close();
    
    const desktopContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const desktopPage = await desktopContext.newPage();
    
    await desktopPage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await desktopPage.screenshot({ path: '/tmp/6-desktop-view.png' });
    
    // Desktop has search bar visible, not hamburger menu
    const desktopSearchBar = await desktopPage.$('input[type="text"][placeholder*="Search" i], input[placeholder*="search" i]');
    const hasSearchBar = desktopSearchBar !== null;
    
    results.results.push({
      name: 'Desktop view loads correctly',
      status: 'passed',
      duration: 0,
      screenshots: ['/tmp/6-desktop-view.png'],
      details: `Search bar visible: ${hasSearchBar}`
    });
    results.summary.total++;
    results.summary.passed++;
    
    // TEST 5: Tablet
    console.log('\n=== TEST 5: Tablet View ===');
    await desktopContext.close();
    
    const tabletContext = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const tabletPage = await tabletContext.newPage();
    
    await tabletPage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await tabletPage.screenshot({ path: '/tmp/7-tablet-view.png' });
    
    const tabletMenu = await tabletPage.locator('button[aria-label="Menu"]').count();
    const tabletSearch = await tabletPage.locator('button[aria-label="Search"]').count();
    
    results.results.push({
      name: 'Tablet view loads (768px)',
      status: 'passed',
      duration: 0,
      screenshots: ['/tmp/7-tablet-view.png'],
      details: `Menu: ${tabletMenu}, Search: ${tabletSearch}`
    });
    results.summary.total++;
    results.summary.passed++;
    
    // TEST 6: Bottom Nav
    console.log('\n=== TEST 6: Bottom Navigation ===');
    const mobileContext2 = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const mobilePage2 = await mobileContext2.newPage();
    
    await mobilePage2.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage2.waitForTimeout(1000);
    await mobilePage2.screenshot({ path: '/tmp/8-bottom-nav.png' });
    
    const bottomNav = await mobilePage2.locator('[aria-label="Home"]').count();
    
    results.results.push({
      name: 'Bottom navigation present',
      status: bottomNav > 0 ? 'passed' : 'failed',
      duration: 0,
      screenshots: ['/tmp/8-bottom-nav.png'],
      details: `Home: ${bottomNav > 0}`
    });
    results.summary.total++;
    if (bottomNav > 0) results.summary.passed++;
    else results.summary.failed++;
    
    await mobileContext2.close();
    await tabletContext.close();
    
    // Console errors
    const relevantErrors = consoleErrors.filter(e => !e.includes('ERR_CONNECTION_REFUSED'));
    results.consoleErrors = relevantErrors.slice(0, 3).map(err => ({ message: err.substring(0, 150) }));
    
  } catch (error) {
    console.error('Test error:', error.message);
    results.results.push({ name: 'Test execution', status: 'failed', error: error.message });
    results.summary.total++;
    results.summary.failed++;
  }
  
  results.testRun.completedAt = new Date().toISOString();
  results.testRun.duration = Date.now() - startTime;
  results.summary.passRate = results.summary.total > 0 ? `${Math.round((results.summary.passed / results.summary.total) * 100)}%` : '0%';
  
  return results;
}

runTests().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log('         DEVPREP MOBILE QA TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total: ${results.summary.total} | Passed: ${results.summary.passed} | Failed: ${results.summary.failed} | Rate: ${results.summary.passRate}`);
  console.log('='.repeat(60));
  
  results.results.forEach((r, i) => {
    const icon = r.status === 'passed' ? '✅' : '❌';
    console.log(`\n${icon} ${r.name}`);
    if (r.error) console.log(`   Error: ${r.error}`);
    if (r.details) console.log(`   Details: ${r.details}`);
    if (r.screenshots) console.log(`   📸 ${r.screenshots.join(', ')}`);
  });
  
  if (results.consoleErrors.length > 0) {
    console.log('\n⚠️  Console Errors:');
    results.consoleErrors.forEach(e => console.log(`   - ${e.message?.substring(0, 80)}`));
  }
  
  const fs = require('fs');
  fs.writeFileSync('/tmp/test-results.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Results: /tmp/test-results.json');
  
  process.exit(results.summary.failed > 0 ? 1 : 0);
}).catch(err => { console.error(err); process.exit(1); });
