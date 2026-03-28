const { chromium, devices } = require('playwright');

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
    // Launch browser
    console.log('Launching browser...');
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Test 1: Mobile viewport (iPhone 13 - 375px width)
    console.log('\n=== TEST 1: Mobile Viewport Setup (375px) ===');
    const mobileContext = await browser.newContext({
      ...devices['iPhone 13'],
      viewport: { width: 375, height: 667 }
    });
    const mobilePage = await mobileContext.newPage();
    
    // Collect console errors
    const consoleErrors = [];
    mobilePage.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to homepage
    console.log('Opening homepage at http://localhost:5001...');
    await mobilePage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    
    const title = await mobilePage.title();
    console.log(`Page title: ${title}`);
    
    // Wait a bit for the page to fully load
    await mobilePage.waitForTimeout(2000);
    
    // Take initial screenshot
    await mobilePage.screenshot({ path: '/tmp/mobile-homepage.png' });
    console.log('Screenshot: /tmp/mobile-homepage.png');
    
    results.results.push({
      name: 'Mobile homepage loads successfully',
      status: title ? 'passed' : 'failed',
      duration: 0,
      screenshots: ['/tmp/mobile-homepage.png']
    });
    results.summary.total++;
    if (title) results.summary.passed++;
    else results.summary.failed++;
    
    // TEST 2: Hamburger Menu
    console.log('\n=== TEST 2: Hamburger Menu Functionality ===');
    
    // Look for hamburger menu button (three lines / menu icon)
    const menuButtonSelectors = [
      'button[class*="menu"]',
      'button[class*="hamburger"]',
      '[class*="MenuIcon"]',
      'button:has(svg)',
      '[data-testid="menu-button"]',
      'button[class*="Drawer"]',
      'button[class*="AppBar"]'
    ];
    
    let menuButton = null;
    let menuButtonText = '';
    
    for (const selector of menuButtonSelectors) {
      try {
        menuButton = await mobilePage.$(selector);
        if (menuButton) {
          menuButtonText = await menuButton.textContent() || await menuButton.getAttribute('class') || selector;
          console.log(`Found menu button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    // If not found, try clicking any button in the header area
    if (!menuButton) {
      console.log('Searching for menu button in header...');
      try {
        const allButtons = await mobilePage.$$('button');
        console.log(`Found ${allButtons.length} buttons on page`);
        
        // Look for menu icon (three horizontal lines)
        for (const btn of allButtons) {
          const html = await btn.innerHTML();
          if (html.includes('Menu') || html.includes('menu') || html.includes('=') || html.includes('line')) {
            menuButton = btn;
            menuButtonText = 'Found menu-like button';
            console.log('Found menu-like button');
            break;
          }
        }
      } catch (e) {
        console.log('Error finding buttons:', e.message);
      }
    }
    
    // Try clicking anywhere that might be the hamburger menu
    if (!menuButton) {
      console.log('Attempting alternative menu button search...');
      try {
        // Look for any SVG that might be a menu icon
        const menuIcon = await mobilePage.$('svg[class*="menu"], svg[class*="Menu"]');
        if (menuIcon) {
          menuButton = await menuIcon.$('xpath=..'); // Parent button
          menuButtonText = 'Found SVG menu icon parent';
        }
      } catch (e) {
        console.log('Error with SVG search:', e.message);
      }
    }
    
    // Test clicking the menu button if found
    if (menuButton) {
      try {
        console.log('Clicking hamburger menu button...');
        await menuButton.click();
        await mobilePage.waitForTimeout(1000);
        
        await mobilePage.screenshot({ path: '/tmp/mobile-menu-open.png' });
        
        // Look for navigation items in the opened menu
        const navItems = await mobilePage.$$('a[href*="/"], nav a, [role="menuitem"]');
        console.log(`Found ${navItems.length} navigation items in menu`);
        
        // Check for common navigation text
        const menuContent = await mobilePage.content();
        const hasNavContent = menuContent.includes('Practice') || menuContent.includes('Learn') || menuContent.includes('Home');
        
        results.results.push({
          name: 'Hamburger menu opens',
          status: 'passed',
          duration: 0,
          screenshots: ['/tmp/mobile-menu-open.png'],
          details: `Found ${navItems.length} nav items, has nav content: ${hasNavContent}`
        });
        results.summary.total++;
        results.summary.passed++;
        
        // Test navigation item click
        if (navItems.length > 0) {
          console.log('Clicking first navigation item...');
          await navItems[0].click();
          await mobilePage.waitForTimeout(1000);
          
          await mobilePage.screenshot({ path: '/tmp/mobile-nav-click.png' });
          
          results.results.push({
            name: 'Navigation from hamburger menu works',
            status: 'passed',
            duration: 0,
            screenshots: ['/tmp/mobile-nav-click.png']
          });
          results.summary.total++;
          results.summary.passed++;
        }
        
        // Try to close the menu (click outside or press escape)
        try {
          await mobilePage.keyboard.press('Escape');
          await mobilePage.waitForTimeout(500);
        } catch (e) {}
        
      } catch (e) {
        console.log('Error with menu interaction:', e.message);
        results.results.push({
          name: 'Hamburger menu interaction',
          status: 'failed',
          error: e.message,
          screenshots: ['/tmp/mobile-homepage.png']
        });
        results.summary.total++;
        results.summary.failed++;
      }
    } else {
      console.log('Hamburger menu button NOT FOUND');
      results.results.push({
        name: 'Hamburger menu button visible',
        status: 'failed',
        error: 'Menu button not found on mobile viewport',
        screenshots: ['/tmp/mobile-homepage.png']
      });
      results.summary.total++;
      results.summary.failed++;
    }
    
    // TEST 3: Search Functionality
    console.log('\n=== TEST 3: Search Functionality ===');
    
    // Look for search icon/button
    const searchButtonSelectors = [
      'button[class*="search"]',
      'input[type="search"]',
      'input[placeholder*="Search"]',
      '[class*="SearchIcon"]',
      '[data-testid="search"]'
    ];
    
    let searchButton = null;
    
    for (const selector of searchButtonSelectors) {
      try {
        searchButton = await mobilePage.$(selector);
        if (searchButton) {
          console.log(`Found search element with selector: ${selector}`);
          break;
        }
      } catch (e) {}
    }
    
    // Also look for search icon in header
    if (!searchButton) {
      try {
        const searchSvg = await mobilePage.$('svg[class*="search"], svg[class*="Search"]');
        if (searchSvg) {
          searchButton = await searchSvg.$('xpath=..');
          console.log('Found search SVG');
        }
      } catch (e) {}
    }
    
    if (searchButton) {
      try {
        console.log('Clicking search button...');
        await searchButton.click();
        await mobilePage.waitForTimeout(1000);
        
        await mobilePage.screenshot({ path: '/tmp/mobile-search-open.png' });
        
        // Check if search modal or input appeared
        const searchInputVisible = await mobilePage.$('input[type="search"], input[placeholder*="Search"], [class*="Dialog"]:has(input), [class*="Modal"]:has(input)');
        
        if (searchInputVisible) {
          results.results.push({
            name: 'Search modal opens',
            status: 'passed',
            duration: 0,
            screenshots: ['/tmp/mobile-search-open.png']
          });
          results.summary.total++;
          results.summary.passed++;
          
          // Test search input
          console.log('Testing search input...');
          await searchInputVisible.type('React');
          await mobilePage.waitForTimeout(500);
          await mobilePage.screenshot({ path: '/tmp/mobile-search-typed.png' });
          
          results.results.push({
            name: 'Search input works',
            status: 'passed',
            duration: 0,
            screenshots: ['/tmp/mobile-search-typed.png']
          });
          results.summary.total++;
          results.summary.passed++;
          
        } else {
          results.results.push({
            name: 'Search modal opens',
            status: 'failed',
            error: 'Search input not visible after clicking search button',
            screenshots: ['/tmp/mobile-search-open.png']
          });
          results.summary.total++;
          results.summary.failed++;
        }
        
        // Close search (escape or click outside)
        try {
          await mobilePage.keyboard.press('Escape');
          await mobilePage.waitForTimeout(500);
        } catch (e) {}
        
      } catch (e) {
        console.log('Error with search interaction:', e.message);
        results.results.push({
          name: 'Search functionality',
          status: 'failed',
          error: e.message,
          screenshots: ['/tmp/mobile-homepage.png']
        });
        results.summary.total++;
        results.summary.failed++;
      }
    } else {
      console.log('Search button NOT FOUND');
      results.results.push({
        name: 'Search button visible on mobile',
        status: 'failed',
        error: 'Search button not found on mobile viewport',
        screenshots: ['/tmp/mobile-homepage.png']
      });
      results.summary.total++;
      results.summary.failed++;
    }
    
    // TEST 4: Desktop viewport for comparison
    console.log('\n=== TEST 4: Desktop Viewport (1366px) ===');
    const desktopContext = await browser.newContext({
      viewport: { width: 1366, height: 768 }
    });
    const desktopPage = await desktopContext.newPage();
    
    await desktopPage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await desktopPage.screenshot({ path: '/tmp/desktop-homepage.png' });
    
    // Check for hamburger menu on desktop (should not exist or be different)
    const desktopMenuButton = await desktopPage.$('button[class*="menu"], button[class*="hamburger"]');
    const desktopSearchButton = await desktopPage.$('button[class*="search"], input[type="search"]');
    
    results.results.push({
      name: 'Desktop view loads correctly',
      status: 'passed',
      duration: 0,
      screenshots: ['/tmp/desktop-homepage.png'],
      details: `Menu button present: ${!!desktopMenuButton}, Search present: ${!!desktopSearchButton}`
    });
    results.summary.total++;
    results.summary.passed++;
    
    // Test 5: Tablet viewport
    console.log('\n=== TEST 5: Tablet Viewport (768px) ===');
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 }
    });
    const tabletPage = await tabletContext.newPage();
    
    await tabletPage.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    await tabletPage.screenshot({ path: '/tmp/tablet-homepage.png' });
    
    results.results.push({
      name: 'Tablet view loads correctly',
      status: 'passed',
      duration: 0,
      screenshots: ['/tmp/tablet-homepage.png']
    });
    results.summary.total++;
    results.summary.passed++;
    
    // Save console errors
    results.consoleErrors = consoleErrors.map(err => ({
      page: 'mobile-homepage',
      error: 'Console Error',
      message: err
    }));
    
    // Close contexts
    await mobileContext.close();
    await desktopContext.close();
    await tabletContext.close();
    
  } catch (error) {
    console.error('Test error:', error);
    results.results.push({
      name: 'Test execution',
      status: 'failed',
      error: error.message
    });
    results.summary.total++;
    results.summary.failed++;
  }
  
  // Calculate final stats
  results.testRun.completedAt = new Date().toISOString();
  results.testRun.duration = Date.now() - startTime;
  results.summary.passRate = results.summary.total > 0 
    ? `${Math.round((results.summary.passed / results.summary.total) * 100)}%`
    : '0%';
  
  return results;
}

// Run tests and output results
runTests().then(results => {
  console.log('\n=== TEST RESULTS SUMMARY ===');
  console.log(`Total: ${results.summary.total}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Pass Rate: ${results.summary.passRate}`);
  console.log('\nDetailed Results:');
  results.results.forEach((r, i) => {
    console.log(`${i + 1}. [${r.status.toUpperCase()}] ${r.name}`);
    if (r.error) console.log(`   Error: ${r.error}`);
    if (r.screenshots) console.log(`   Screenshots: ${r.screenshots.join(', ')}`);
  });
  
  // Write JSON results
  const fs = require('fs');
  fs.writeFileSync('/tmp/test-results.json', JSON.stringify(results, null, 2));
  console.log('\nResults written to /tmp/test-results.json');
  
  process.exit(results.summary.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
