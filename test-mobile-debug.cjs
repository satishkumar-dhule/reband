const { chromium, devices } = require('playwright');

async function debugPage() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await mobileContext.newPage();
  
  await page.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('=== Page Structure Analysis ===\n');
  
  // Get page HTML summary
  const html = await page.content();
  
  // Find all button elements
  const buttons = await page.$$('button');
  console.log(`Total buttons found: ${buttons.length}`);
  
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    const tagName = await btn.evaluate(el => el.tagName);
    const className = await btn.getAttribute('class');
    const id = await btn.getAttribute('id');
    const ariaLabel = await btn.getAttribute('aria-label');
    const type = await btn.getAttribute('type');
    console.log(`Button ${i}: class="${className}" id="${id}" aria-label="${ariaLabel}" type="${type}"`);
  }
  
  // Find all SVG elements
  const svgs = await page.$$('svg');
  console.log(`\nTotal SVG elements found: ${svgs.length}`);
  
  // Look for common icon names in SVG classes/ids
  for (let i = 0; i < Math.min(svgs.length, 20); i++) {
    const svg = svgs[i];
    const className = await svg.getAttribute('class');
    const parent = await svg.$('xpath=..');
    const parentClass = parent ? await parent.getAttribute('class') : '';
    const grandParent = parent ? await parent.$('xpath=..') : null;
    const grandParentClass = grandParent ? await grandParent.getAttribute('class') : '';
    console.log(`SVG ${i}: class="${className}" | parent: "${parentClass}" | grandparent: "${grandParentClass}"`);
  }
  
  // Check for header/nav elements
  console.log('\n=== Header/Nav Elements ===');
  const header = await page.$('header');
  if (header) {
    const headerClass = await header.getAttribute('class');
    console.log(`Header found: class="${headerClass}"`);
    
    // Get children of header
    const headerChildren = await header.$$('*');
    console.log(`Header has ${headerChildren.length} direct children`);
    
    for (const child of headerChildren) {
      const childClass = await child.getAttribute('class');
      const childTag = await child.evaluate(el => el.tagName);
      console.log(`  - ${childTag}: "${childClass}"`);
    }
  }
  
  // Check for any elements with "menu" or "search" in their attributes
  console.log('\n=== Elements with "menu" or "search" ===');
  const allElements = await page.$$('*');
  for (const el of allElements) {
    const className = await el.getAttribute('class');
    const id = await el.getAttribute('id');
    const ariaLabel = await el.getAttribute('aria-label');
    const role = await el.getAttribute('role');
    
    const searchStr = `${className || ''} ${id || ''} ${ariaLabel || ''} ${role || ''}`.toLowerCase();
    if (searchStr.includes('menu') || searchStr.includes('search') || searchStr.includes('drawer')) {
      const tagName = await el.evaluate(e => e.tagName);
      console.log(`<${tagName}> class="${className}" id="${id}" aria-label="${ariaLabel}" role="${role}"`);
    }
  }
  
  // Check what's visible in the viewport
  console.log('\n=== Visible Elements in Mobile View ===');
  
  // Look for navigation
  const nav = await page.$('nav');
  if (nav) {
    const navClass = await nav.getAttribute('class');
    console.log(`Nav found: class="${navClass}"`);
    const navHtml = await nav.innerHTML();
    console.log(`Nav content length: ${navHtml.length} chars`);
  }
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/debug-mobile.png', fullPage: false });
  console.log('\nScreenshot saved: /tmp/debug-mobile.png');
  
  await browser.close();
}

debugPage().catch(console.error);
