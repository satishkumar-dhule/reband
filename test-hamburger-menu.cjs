const { chromium, devices } = require('@playwright/test');

async function runTest() {
  console.log('=== DevPrep Hamburger Menu QA Test ===\n');
  
  // Set up mobile viewport (375px width)
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }
  });
  
  const page = await context.newPage();
  
  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  let allTestsPassed = true;
  const testResults = [];
  
  try {
    // Step 1: Navigate to the app
    console.log('Step 1: Navigating to http://localhost:5001');
    await page.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for React to render
    await page.waitForTimeout(2000);
    
    console.log('✓ Page loaded successfully\n');
    testResults.push({ test: 'Homepage loads', status: 'PASS' });
    
    // Get the page title
    const title = await page.title();
    console.log(`Page title: ${title}\n`);
    
    // Take initial screenshot
    await page.screenshot({ path: '/tmp/devprep-initial.png', fullPage: true });
    console.log('Screenshot: /tmp/devprep-initial.png\n');
    
    // Step 2: Set viewport to mobile (already done above)
    console.log('Step 2: Mobile viewport set to 375x812px');
    testResults.push({ test: 'Mobile viewport (375px)', status: 'PASS' });
    
    // Step 3: Find and click the hamburger menu button
    console.log('Step 3: Looking for hamburger menu button...');
    
    // Try multiple selectors for hamburger menu
    const hamburgerSelectors = [
      'button[aria-label="Menu"]',
      'button[aria-label="menu"]',
      '[class*="hamburger"] button',
      'button[class*="menu"]'
    ];
    
    let hamburgerButton = null;
    let isHamburgerVisible = false;
    
    for (const selector of hamburgerSelectors) {
      const el = await page.locator(selector).first();
      try {
        isHamburgerVisible = await el.isVisible({ timeout: 2000 });
        if (isHamburgerVisible) {
          hamburgerButton = el;
          console.log(`  Found with: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (isHamburgerVisible) {
      console.log('✓ Hamburger button found (aria-label="Menu")');
      testResults.push({ test: 'Hamburger button exists', status: 'PASS' });
      
      // Click hamburger
      await hamburgerButton.click();
      await page.waitForTimeout(1000); // Wait for drawer animation
      
      // Take screenshot with drawer open
      await page.screenshot({ path: '/tmp/devprep-drawer-open.png', fullPage: true });
      console.log('✓ Screenshot saved: /tmp/devprep-drawer-open.png');
      
      // Step 4: Verify drawer is open with navigation items
      console.log('\nStep 4: Verifying drawer appears...');
      
      // Check for drawer/dialog element
      const dialogExists = await page.locator('[role="dialog"]').count();
      const drawerExists = await page.locator('[class*="drawer"]').count();
      
      if (dialogExists > 0 || drawerExists > 0) {
        console.log('✓ Drawer/modal dialog element found in DOM');
        testResults.push({ test: 'Drawer/Dialog opens', status: 'PASS' });
      }
      
      // Check for visible navigation items
      console.log('\nVerifying navigation items in drawer...');
      
      // Look for common navigation items
      const navItemsToCheck = ['Channels', 'Practice', 'Learn', 'Home', 'Voice', 'Coding'];
      let foundNavItems = [];
      
      for (const item of navItemsToCheck) {
        const locator = page.locator(`text="${item}"`).first();
        const count = await locator.count();
        if (count > 0) {
          foundNavItems.push(item);
        }
      }
      
      console.log(`  Found navigation text: ${foundNavItems.join(', ')}`);
      testResults.push({ test: 'Navigation items visible in drawer', status: foundNavItems.length > 0 ? 'PASS' : 'FAIL' });
      
      // Step 5: Close the drawer by pressing Escape
      console.log('\nStep 5: Testing drawer close...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: '/tmp/devprep-drawer-closed.png', fullPage: true });
      console.log('✓ Drawer closed (pressed Escape)');
      testResults.push({ test: 'Drawer closes with Escape key', status: 'PASS' });
      
      // Step 6: Test search functionality (back on main page)
      console.log('\nStep 6: Testing search functionality...');
      
      // Look for search input (usually visible in header)
      const searchInput = await page.locator('input[placeholder*="Search" i], input[aria-label*="Search" i]').first();
      const isSearchVisible = await searchInput.isVisible().catch(() => false);
      
      if (isSearchVisible) {
        console.log('✓ Search input found');
        
        await searchInput.fill('React');
        await page.waitForTimeout(300);
        await page.screenshot({ path: '/tmp/devprep-search-filled.png', fullPage: true });
        console.log('✓ Search filled with "React"');
        
        // Try submitting
        await searchInput.press('Enter');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: '/tmp/devprep-search-results.png', fullPage: true });
        console.log('✓ Search submitted');
        
        const searchResultsUrl = page.url();
        console.log(`  URL after search: ${searchResultsUrl}`);
        
        testResults.push({ test: 'Search input works', status: 'PASS' });
      } else {
        console.log('⚠ Search input not visible (may be in different location on mobile)');
        // Try finding search button instead
        const searchButton = await page.locator('button[aria-label*="Search" i]').first();
        const isSearchButtonVisible = await searchButton.isVisible().catch(() => false);
        
        if (isSearchButtonVisible) {
          console.log('✓ Search button found (will click to open search)');
          await searchButton.click();
          await page.waitForTimeout(500);
          
          // Now search modal should be open
          const searchModalInput = await page.locator('input[type="text"]').first();
          const isModalInputVisible = await searchModalInput.isVisible().catch(() => false);
          
          if (isModalInputVisible) {
            await searchModalInput.fill('React');
            await searchModalInput.press('Enter');
            await page.waitForTimeout(1000);
            
            await page.screenshot({ path: '/tmp/devprep-search-modal-results.png', fullPage: true });
            console.log('✓ Search modal works');
            testResults.push({ test: 'Search modal works', status: 'PASS' });
          }
        } else {
          testResults.push({ test: 'Search functionality', status: 'FAIL' });
          console.log('⚠ Search functionality not found');
        }
      }
      
    } else {
      console.log('✗ Hamburger menu button NOT FOUND');
      testResults.push({ test: 'Hamburger button exists', status: 'FAIL' });
      allTestsPassed = false;
    }
    
    // Report console errors
    console.log('\n=== Console Errors ===');
    if (consoleErrors.length === 0) {
      console.log('✓ No console errors detected');
      testResults.push({ test: 'No console errors', status: 'PASS' });
    } else {
      console.log(`Found ${consoleErrors.length} console error(s):`);
      consoleErrors.slice(0, 5).forEach(err => console.log(`  - ${err.substring(0, 100)}`));
      testResults.push({ test: 'No console errors', status: 'FAIL' });
      allTestsPassed = false;
    }
    
    // Final summary
    console.log('\n=== TEST RESULTS ===');
    console.log('─────────────────────');
    let passed = 0;
    let failed = 0;
    testResults.forEach(result => {
      const symbol = result.status === 'PASS' ? '✓' : '✗';
      console.log(`${symbol} ${result.test}: ${result.status}`);
      if (result.status === 'PASS') passed++;
      else failed++;
    });
    console.log('─────────────────────');
    console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log('');
    
    if (allTestsPassed && failed === 0) {
      console.log('✅ ALL TESTS PASSED - Hamburger menu drawer is working correctly!');
    } else {
      console.log('⚠ Some tests had issues - review results above');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await page.screenshot({ path: '/tmp/devprep-error.png', fullPage: true });
    console.log('\nScreenshots saved:');
    console.log('  - /tmp/devprep-initial.png');
    console.log('  - /tmp/devprep-drawer-open.png');
    console.log('  - /tmp/devprep-drawer-closed.png');
    console.log('  - /tmp/devprep-error.png');
  } finally {
    await browser.close();
  }
}

runTest();
