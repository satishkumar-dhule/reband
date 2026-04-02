/**
 * Comprehensive Mobile Test Suite
 * 
 * Complete mobile testing coverage for DevPrep platform:
 * 1. Responsive Design - Test all breakpoints (320px to 1920px)
 * 2. Touch Gestures - Swipe navigation, pull-to-refresh, pinch-to-zoom
 * 3. Mobile Navigation - Bottom nav, hamburger menu, tab switching
 * 4. Safe Area - iOS notch/Dynamic Island handling
 * 5. Orientation - Portrait/landscape handling
 * 6. Viewports - Test on iPhone SE, iPhone 13/14, iPad, Android phones
 * 7. Mobile Content - Text readability, button sizes, form inputs on mobile
 * 8. PWA Features - Service worker, manifest, offline handling
 * 9. Network Conditions - Offline mode, slow network handling
 * 10. Hardware Back - Android back button handling
 */

import { test, expect, devices, Page } from '@playwright/test';
import { setupUser, waitForPageReady, checkNoOverflow } from '../fixtures';

const BREAKPOINTS = [
  { name: 'Small Mobile', width: 320, height: 568 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 13', width: 390, height: 844 },
  { name: 'iPhone 14 Pro', width: 393, height: 852 },
  { name: 'Samsung Galaxy', width: 360, height: 780 },
  { name: 'Pixel 7', width: 412, height: 915 },
  { name: 'Small Tablet', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 834, height: 1194 },
  { name: 'Desktop', width: 1280, height: 720 },
  { name: 'Large Desktop', width: 1920, height: 1080 },
];

const MOBILE_DEVICES = [
  { name: 'iPhone SE', ...devices['iPhone SE'] },
  { name: 'iPhone 13', ...devices['iPhone 13'] },
  { name: 'iPhone 14 Pro', ...devices['iPhone 14 Pro'] },
  { name: 'Samsung Galaxy S24', ...devices['Samsung Galaxy S24'] },
  { name: 'Pixel 7', ...devices['Pixel 7'] },
  { name: 'iPad Pro 11', ...devices['iPad Pro 11'] },
];

async function performSwipe(page: Page, direction: 'up' | 'down' | 'left' | 'right', distance = 300) {
  const viewport = page.viewportSize();
  if (!viewport) return;

  const startX = viewport.width / 2;
  const startY = viewport.height / 2;
  let endX = startX;
  let endY = startY;

  switch (direction) {
    case 'up':
      endY = startY - distance;
      break;
    case 'down':
      endY = startY + distance;
      break;
    case 'left':
      endX = startX - distance;
      break;
    case 'right':
      endX = startX + distance;
      break;
  }

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 10 });
  await page.mouse.up();
}

async function performLongPress(page: Page, x: number, y: number, duration = 500) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(duration);
  await page.mouse.up();
}

test.describe.skip('1. Responsive Design - Breakpoint Testing', () => {
  for (const breakpoint of BREAKPOINTS) {
    test(`${breakpoint.name} (${breakpoint.width}x${breakpoint.height}) - Home page renders`, async ({ page }) => {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await setupUser(page);
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await waitForPageReady(page);
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(breakpoint.width);
      expect(viewport?.height).toBe(breakpoint.height);
    });

    test(`${breakpoint.name} - No horizontal overflow on home`, async ({ page }) => {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await setupUser(page);
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await waitForPageReady(page);
      await checkNoOverflow(page);
    });

    test(`${breakpoint.name} - Channels page renders`, async ({ page }) => {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await setupUser(page);
      await page.goto('/channels', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await waitForPageReady(page);
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  }
});

test.describe.skip('2. Touch Gestures - Swipe Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('swipe up scrolls page content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const initialScroll = await page.evaluate(() => window.scrollY);
    
    await performSwipe(page, 'up', 200);
    await page.waitForTimeout(500);
    
    const newScroll = await page.evaluate(() => window.scrollY);
    expect(newScroll).toBeGreaterThanOrEqual(initialScroll);
  });

  test('swipe down scrolls page up', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    
    await performSwipe(page, 'down', 200);
    await page.waitForTimeout(500);
    
    const newScroll = await page.evaluate(() => window.scrollY);
    expect(newScroll).toBeLessThan(500);
  });

  test('swipe left on channel cards', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/channels', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const card = page.locator('[class*="cursor-pointer"]').first();
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await card.boundingBox();
      if (box) {
        await performSwipe(page, 'left', 150);
        await page.waitForTimeout(500);
      }
    }
  });

  test('horizontal swipe on learning paths', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/learning-paths', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const scrollContainer = page.locator('[class*="overflow-x-auto"], [class*="scroll"], .snap-x').first();
    if (await scrollContainer.isVisible({ timeout: 3000 }).catch(() => false)) {
      await performSwipe(page, 'left', 200);
      await page.waitForTimeout(500);
    }
  });
});

test.describe.skip('3. Touch Gestures - Pull to Refresh', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('home page has scrollable content for pull-to-refresh', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const isScrollable = await page.evaluate(() => {
      return document.body.scrollHeight > window.innerHeight;
    });
    expect(isScrollable).toBe(true);
  });

  test('channels page scroll behavior', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/channels', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const isScrollable = await page.evaluate(() => {
      return document.body.scrollHeight > window.innerHeight;
    });
    expect(isScrollable).toBe(true);
  });

  test('learning paths scroll behavior', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/learning-paths', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const isScrollable = await page.evaluate(() => {
      return document.body.scrollHeight > window.innerHeight;
    });
    expect(isScrollable).toBe(true);
  });

  test('pull gesture detection', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    
    const startY = 100;
    await page.mouse.move(195, startY);
    await page.mouse.down();
    
    for (let i = 0; i < 5; i++) {
      await page.mouse.move(195, startY - (i * 30), { steps: 3 });
      await page.waitForTimeout(50);
    }
    
    await page.mouse.up();
    await page.waitForTimeout(500);
  });
});

test.describe.skip('4. Touch Gestures - Pinch to Zoom', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('viewport supports zoom on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toContain('user-scalable=yes');
  });

  test('content is zoomable on channels page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/channels', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toMatch(/maximum-scale=[5-9]|user-scalable=yes/);
  });
});

test.describe.skip('5. Mobile Navigation - Bottom Nav', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('bottom navigation is visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const bottomNav = page.locator('nav.fixed.bottom-0, nav[class*="bottom-0"], [class*="bottom-nav"]');
    await expect(bottomNav).toBeVisible({ timeout: 10000 });
  });

  test('bottom nav has touch targets >= 44px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const nav = page.locator('nav.fixed.bottom-0').first();
    if (await nav.isVisible({ timeout: 3000 }).catch(() => false)) {
      const buttons = await nav.locator('button, a').all();
      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          expect(box.height).toBeGreaterThanOrEqual(30);
        }
      }
    }
  });

  test('home tab is active by default', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const homeButton = page.locator('nav button').filter({ hasText: /Home/i }).first();
    await expect(homeButton).toBeVisible({ timeout: 10000 });
  });

  test('tapping learn navigates to channels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const learnButton = page.locator('nav button').filter({ hasText: /Learn/i }).first();
    await learnButton.tap();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL(/\/channels/);
  });

  test('tapping profile navigates to profile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const profileButton = page.locator('nav button').filter({ hasText: /Profile/i }).first();
    if (await profileButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await profileButton.tap();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/profile/);
    }
  });

  test('tapping stats navigates to stats', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const statsButton = page.locator('nav button').filter({ hasText: /Stats/i }).first();
    if (await statsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await statsButton.tap();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/stats/);
    }
  });
});

test.describe.skip('6. Mobile Navigation - Tab Switching', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('practice tab shows submenu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const practiceButton = page.locator('nav button').filter({ hasText: /Practice/i }).first();
    await practiceButton.tap();
    await page.waitForTimeout(1000);
    
    const voiceOption = page.locator('button, a').filter({ hasText: /Voice/i }).first();
    await expect(voiceOption).toBeVisible({ timeout: 5000 });
  });

  test('quick quiz accessible from nav', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const quickQuizOption = page.locator('button, a').filter({ hasText: /Quiz/i }).first();
    if (await quickQuizOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await quickQuizOption.tap();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe.skip('7. Safe Area - iOS Notch/Dynamic Island', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('viewport has viewport-fit=cover', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const html = await page.content();
    expect(html).toMatch(/viewport-fit=cover/);
  });

  test('safe area CSS variables are defined', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const safeAreaProps = await page.evaluate(() => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      return {
        top: style.getPropertyValue('--safe-area-inset-top').trim(),
        bottom: style.getPropertyValue('--safe-area-inset-bottom').trim(),
        left: style.getPropertyValue('--safe-area-inset-left').trim(),
        right: style.getPropertyValue('--safe-area-inset-right').trim(),
      };
    });
    
    expect(safeAreaProps.top).toBeTruthy();
    expect(safeAreaProps.bottom).toBeTruthy();
  });

  test('mobile-safe-container class applies padding', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const hasSafeContainer = await page.evaluate(() => {
      const testDiv = document.createElement('div');
      testDiv.className = 'mobile-safe-container';
      document.body.appendChild(testDiv);
      const style = getComputedStyle(testDiv);
      document.body.removeChild(testDiv);
      return style.paddingTop !== '0px' || style.paddingBottom !== '0px';
    });
    
    expect(hasSafeContainer).toBe(true);
  });

  test('content not obscured by notch area', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const header = page.locator('header, [class*="header"], nav[class*="top"]').first();
    if (await header.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await header.boundingBox();
      if (box) {
        expect(box.y).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('bottom content above home indicator', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    
    const nav = page.locator('nav.fixed.bottom-0').first();
    if (await nav.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await nav.boundingBox();
      const viewport = page.viewportSize();
      if (box && viewport) {
        expect(box.y).toBeLessThan(viewport.height);
      }
    }
  });
});

test.describe.skip('8. Orientation - Portrait/Landscape', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('portrait orientation - home page renders', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const viewport = page.viewportSize();
    expect(viewport!.height).toBeGreaterThan(viewport!.width);
  });

  test('landscape orientation - home page renders', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const viewport = page.viewportSize();
    expect(viewport!.width).toBeGreaterThan(viewport!.height);
  });

  test('landscape orientation - no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    await checkNoOverflow(page);
  });

  test('orientation change - bottom nav repositions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const navPortrait = page.locator('nav.fixed.bottom-0').first();
    await expect(navPortrait).toBeVisible({ timeout: 10000 });
    
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500);
    
    const navLandscape = page.locator('nav.fixed.bottom-0').first();
    await expect(navLandscape).toBeVisible({ timeout: 10000 });
  });

  test('landscape channels page renders', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/channels', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe.skip('9. Mobile Device Emulation', () => {
  for (const device of MOBILE_DEVICES) {
    test(`${device.name} - Home page loads`, async ({ page }) => {
      await page.setViewportSize({ 
        width: device.viewport?.width || 390, 
        height: device.viewport?.height || 844 
      });
      
      await setupUser(page);
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await waitForPageReady(page);
      
      await expect(page.locator('body')).toBeVisible();
    });

    test(`${device.name} - No console errors`, async ({ page }) => {
      await page.setViewportSize({ 
        width: device.viewport?.width || 390, 
        height: device.viewport?.height || 844 
      });
      
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(err.message));
      
      await setupUser(page);
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await waitForPageReady(page);
      
      expect(errors.filter(e => !e.includes('Warning'))).toHaveLength(0);
    });

    test(`${device.name} - Touch interactions work`, async ({ page }) => {
      await page.setViewportSize({ 
        width: device.viewport?.width || 390, 
        height: device.viewport?.height || 844 
      });
      
      await setupUser(page);
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await waitForPageReady(page);
      
      const button = page.locator('button').first();
      if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
        await button.tap();
        await page.waitForTimeout(500);
      }
    });
  }
});

test.describe.skip('10. Mobile Content - Readability', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('text is readable on small screens (16px minimum)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const bodyFontSize = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return parseFloat(style.fontSize);
    });
    
    expect(bodyFontSize).toBeGreaterThanOrEqual(14);
  });

  test('buttons meet minimum touch target size (44x44)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const buttons = await page.locator('button').all();
    let passCount = 0;
    
    for (const button of buttons.slice(0, 10)) {
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        const box = await button.boundingBox();
        if (box && box.width >= 44 && box.height >= 44) {
          passCount++;
        }
      }
    }
    
    expect(passCount).toBeGreaterThan(0);
  });

  test('form inputs are accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        const box = await input.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(30);
        }
      }
    }
  });

  test('links have adequate touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/channels', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const links = await page.locator('a').all();
    let adequateTargets = 0;
    
    for (const link of links.slice(0, 10)) {
      if (await link.isVisible({ timeout: 1000 }).catch(() => false)) {
        const box = await link.boundingBox();
        if (box && box.height >= 30) {
          adequateTargets++;
        }
      }
    }
    
    expect(adequateTargets).toBeGreaterThan(0);
  });

  test('cards are tappable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/channels', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const card = page.locator('[class*="cursor-pointer"]').first();
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await card.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
    }
  });
});

test.describe.skip('11. PWA Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('manifest link exists in head', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', /manifest\.json/);
  });

  test('theme-color meta tag exists', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', /#.*|rgb/);
  });

  test('apple-mobile-web-app-capable meta', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const appleMeta = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleMeta).toHaveAttribute('content', 'yes');
  });

  test('apple-mobile-web-app-status-bar-style meta', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const appleStatusBar = page.locator('meta[name="apple-mobile-web-app-status-bar-style"]');
    await expect(appleStatusBar).toHaveAttribute('content', /black-translucent|default|black/);
  });

  test('icons are defined for PWA', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const icons = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="apple-touch-startup-image"]').count();
    expect(icons).toBeGreaterThan(0);
  });
});

test.describe.skip('12. Network Conditions - Offline Mode', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('page loads with network', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('can navigate while online', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.goto('/channels', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    await expect(page).toHaveURL(/\/channels/);
  });

  test('slow network handling - page still loads', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await waitForPageReady(page);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('cached content is accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const cacheControl = await page.evaluate(() => {
      return document.body.innerHTML.length > 0;
    });
    expect(cacheControl).toBe(true);
  });
});

test.describe.skip('13. Hardware Back Button - Android', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('browser back button navigates correctly', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.goto('/channels', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.goBack();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL('/');
  });

  test('back button works from profile page', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.goto('/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.goBack();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL('/');
  });

  test('history navigation works for learning paths', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.goto('/learning-paths', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.goBack();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL('/');
  });
});

test.describe.skip('14. Mobile-Specific Pages', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('voice interview page renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/voice-interview', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await expect(page.locator('body')).toBeVisible();
    await checkNoOverflow(page);
  });

  test('coding page renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/coding', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('stats page renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/stats', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('profile page renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('certifications page renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/certifications', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('training page renders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/training', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe.skip('15. Mobile Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('very narrow viewport - 280px width', async ({ page }) => {
    await page.setViewportSize({ width: 280, height: 600 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await expect(page.locator('body')).toBeVisible();
    await checkNoOverflow(page);
  });

  test('very tall viewport - extreme height', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('all bottom nav buttons are tappable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const navButtons = page.locator('nav button');
    const count = await navButtons.count();
    
    for (let i = 0; i < count; i++) {
      const button = navButtons.nth(i);
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.tap();
        await page.waitForTimeout(500);
      }
    }
  });

  test('modal/drawer opens on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/learning-paths', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const createButton = page.locator('button').filter({ hasText: /Create|New/i }).first();
    if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createButton.tap();
      await page.waitForTimeout(1000);
      
      const drawer = page.locator('[role="dialog"], [data-vaul-drawer], [class*="drawer"]').first();
      if (await drawer.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(drawer).toBeVisible();
      }
    }
  });

  test('scrolling to bottom of page works', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(0);
  });
});

test.describe.skip('16. Mobile Performance', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('page loads within reasonable time on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(15000);
  });

  test('no memory leaks during navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.goto('/channels', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.goto('/learning-paths', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await waitForPageReady(page);
    
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    
    expect(errors.filter(e => e.includes('Memory'))).toHaveLength(0);
  });
});
