const { chromium } = require('@playwright/test');

async function debug() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }
  });
  
  const page = await context.newPage();
  
  await page.goto('http://localhost:5001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Get all buttons and their attributes
  const buttons = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    return Array.from(btns).slice(0, 20).map((btn, i) => ({
      index: i,
      ariaLabel: btn.getAttribute('aria-label'),
      className: btn.className,
      id: btn.id,
      text: btn.textContent?.substring(0, 30),
      visible: btn.offsetParent !== null
    }));
  });
  
  console.log('=== Buttons on page ===');
  buttons.forEach(btn => {
    console.log(`[${btn.index}] aria-label="${btn.ariaLabel}", class="${btn.className}", visible=${btn.visible}, text="${btn.text}"`);
  });
  
  // Get all icons/svg
  const icons = await page.evaluate(() => {
    const svgs = document.querySelectorAll('svg');
    return Array.from(svgs).slice(0, 20).map((svg, i) => ({
      index: i,
      parent: svg.parentElement?.tagName,
      parentClass: svg.parentElement?.className?.baseVal || svg.parentElement?.className,
    }));
  });
  
  console.log('\n=== SVGs on page ===');
  icons.forEach(icon => {
    console.log(`[${icon.index}] parent: <${icon.parent}> class="${icon.parentClass}"`);
  });
  
  await page.screenshot({ path: '/tmp/debug-page.png', fullPage: true });
  console.log('\nScreenshot: /tmp/debug-page.png');
  
  await browser.close();
}

debug();
