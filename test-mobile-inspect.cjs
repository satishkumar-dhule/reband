const { chromium } = require('playwright');

async function inspectMobile() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await mobileContext.newPage();
  
  await page.goto('http://localhost:5001', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  console.log('=== Mobile Header Analysis ===\n');
  
  // Get the header element
  const header = await page.$('header');
  if (header) {
    const headerHTML = await header.innerHTML();
    console.log('Header HTML (first 2000 chars):\n', headerHTML.substring(0, 2000));
    
    // Get all buttons in header
    const headerButtons = await header.$$('button');
    console.log(`\nButtons in header: ${headerButtons.length}`);
    
    for (let i = 0; i < headerButtons.length; i++) {
      const btn = headerButtons[i];
      const ariaLabel = await btn.getAttribute('aria-label');
      const text = await btn.textContent();
      const className = await btn.getAttribute('class');
      const isVisible = await btn.isVisible();
      console.log(`Button ${i}: aria-label="${ariaLabel}" text="${text}" class="${className?.substring(0, 50)}" visible=${isVisible}`);
    }
  }
  
  // Get all visible buttons on page
  console.log('\n=== All Visible Buttons ===');
  const allButtons = await page.$$('button');
  console.log(`Total buttons: ${allButtons.length}`);
  
  for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
    const btn = allButtons[i];
    try {
      const ariaLabel = await btn.getAttribute('aria-label');
      const text = (await btn.textContent())?.substring(0, 30);
      const isVisible = await btn.isVisible();
      console.log(`Button ${i}: aria-label="${ariaLabel}" text="${text}" visible=${isVisible}`);
    } catch (e) {
      console.log(`Button ${i}: error - ${e.message}`);
    }
  }
  
  // Look for elements with specific text
  console.log('\n=== Elements with "Channels" ===');
  const channelsElements = await page.$$('text=Channels');
  console.log(`Found ${channelsElements.length} elements with "Channels" text`);
  
  for (const el of channelsElements) {
    try {
      const tag = await el.evaluate(e => e.tagName);
      const className = await el.getAttribute('class');
      const isVisible = await el.isVisible();
      console.log(`  <${tag}> class="${className?.substring(0, 40)}" visible=${isVisible}`);
    } catch (e) {}
  }
  
  await browser.close();
}

inspectMobile().catch(console.error);
