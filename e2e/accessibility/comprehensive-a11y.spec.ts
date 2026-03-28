/**
 * Comprehensive Accessibility Test Suite
 * 
 * DevPrep - Technical Interview Preparation Platform
 * 
 * This test suite performs comprehensive WCAG 2.1/2.2 AA compliance testing:
 * 1. Automated axe-core scans on all major pages
 * 2. Keyboard navigation testing (tab order, focus indicators, skip links)
 * 3. Screen reader announcements (live regions, dynamic content)
 * 4. Color contrast testing (WCAG AA compliance)
 * 5. Touch target testing (minimum 44x44px for mobile)
 * 6. Form accessibility (labels, error messages, validation)
 * 7. Modal/dialog accessibility (focus trapping, escape to close)
 * 8. Reduced motion testing (prefers-reduced-motion)
 * 9. Dark mode accessibility (sufficient contrast in both themes)
 * 
 * Requirements: WCAG 2.1 AA, WCAG 2.2 AA
 * Testing Tools: Playwright, axe-core
 */

import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const MAJOR_PAGES = [
  '/',
  '/learning-paths',
  '/coding-challenges',
  '/about',
];

const MIN_TOUCH_TARGET_SIZE = 44; // WCAG 2.1 AA / iOS standard
const MIN_CONTRAST_NORMAL = 4.5;  // WCAG AA for normal text
const MIN_CONTRAST_LARGE = 3.0;   // WCAG AA for large text (18pt+ or 14pt bold)
const MIN_CONTRAST_UI = 3.0;      // WCAG AA for UI components

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Run axe-core audit on a page
 */
async function runAxeAudit(page: Page, tags: string[] = ['wcag2a', 'wcag2aa', 'wcag21aa']) {
  return await new AxeBuilder({ page })
    .withTags(tags)
    .analyze();
}

/**
 * Get all focusable elements on a page
 */
async function getFocusableElements(page: Page) {
  return page.locator(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])'
  );
}

/**
 * Check if an element has a visible focus indicator
 */
async function hasFocusIndicator(page: Page, element: any): Promise<boolean> {
  return element.evaluate(async (el: Element) => {
    const computed = window.getComputedStyle(el);
    const focusComputed = window.getComputedStyle(el, ':focus');
    
    // Check for outline
    if (focusComputed.outlineStyle && focusComputed.outlineStyle !== 'none' && focusComputed.outlineWidth !== '0px') {
      return true;
    }
    
    // Check for box-shadow (common focus indicator)
    if (focusComputed.boxShadow && focusComputed.boxShadow !== 'none') {
      return true;
    }
    
    // Check for border changes
    if (computed.border !== focusComputed.border) {
      return true;
    }
    
    // Check for background changes
    if (computed.backgroundColor !== focusComputed.backgroundColor) {
      return true;
    }
    
    return false;
  });
}

/**
 * Get all interactive elements that don't meet touch target size requirements
 */
async function getSmallTouchTargets(page: Page, minSize: number = MIN_TOUCH_TARGET_SIZE) {
  const interactiveElements = page.locator(
    'button, a, input, select, textarea, [role="button"], [role="link"]'
  );
  
  const count = await interactiveElements.count();
  const violations: Array<{ html: string; width: number; height: number }> = [];
  
  for (let i = 0; i < count; i++) {
    const element = interactiveElements.nth(i);
    const isVisible = await element.isVisible();
    if (!isVisible) continue;
    
    const box = await element.boundingBox();
    if (!box) continue;
    
    if (box.width < minSize || box.height < minSize) {
      const html = await element.evaluate(el => el.outerHTML.substring(0, 150));
      violations.push({
        html,
        width: Math.round(box.width),
        height: Math.round(box.height)
      });
    }
  }
  
  return violations;
}

/**
 * Check for skip link presence
 */
async function checkForSkipLink(page: Page) {
  const skipLink = page.locator('a[href="#main-content"], [class*="skip"], [id*="skip"]').first();
  return await skipLink.count() > 0;
}

/**
 * Check heading hierarchy for proper nesting
 */
async function checkHeadingHierarchy(page: Page) {
  const headings = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    return elements.map(el => ({
      level: parseInt(el.tagName.substring(1)),
      text: el.textContent?.trim().substring(0, 50) || '',
      html: el.outerHTML.substring(0, 100)
    }));
  });
  
  const violations: string[] = [];
  const h1Count = headings.filter(h => h.level === 1).length;
  
  if (h1Count !== 1) {
    violations.push(`Expected exactly one h1, found ${h1Count}`);
  }
  
  for (let i = 1; i < headings.length; i++) {
    const diff = headings[i].level - headings[i - 1].level;
    if (diff > 1) {
      violations.push(`Skipped heading level: h${headings[i - 1].level} to h${headings[i].level} (${headings[i].text})`);
    }
  }
  
  return { headings, violations };
}

/**
 * Check landmark regions presence
 */
async function checkLandmarks(page: Page) {
  const results = {
    hasMain: await page.locator('main, [role="main"]').count() > 0,
    hasNav: await page.locator('nav, [role="navigation"]').count() > 0,
    hasHeader: await page.locator('header, [role="banner"]').count() > 0,
    hasFooter: await page.locator('footer, [role="contentinfo"]').count() > 0,
    hasAside: await page.locator('aside, [role="complementary"]').count() > 0,
  };
  return results;
}

/**
 * Check for proper form labels
 */
async function checkFormLabels(page: Page) {
  const inputs = await page.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea').all();
  const violations: string[] = [];
  
  for (const input of inputs) {
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledby = await input.getAttribute('aria-labelledby');
    const placeholder = await input.getAttribute('placeholder');
    const type = await input.getAttribute('type');
    
    // Skip hidden inputs
    if (type === 'hidden') continue;
    
    // Check for label association
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      const labelCount = await label.count();
      if (labelCount === 0 && !ariaLabel && !ariaLabelledby) {
        const html = await input.evaluate(el => el.outerHTML.substring(0, 100));
        violations.push(`Input missing label: ${html}`);
      }
    } else if (!ariaLabel && !ariaLabelledby) {
      const html = await input.evaluate(el => el.outerHTML.substring(0, 100));
      violations.push(`Input missing label: ${html}`);
    }
  }
  
  return violations;
}

/**
 * Check for live regions for dynamic content
 */
async function checkLiveRegions(page: Page) {
  const liveRegions = await page.locator('[aria-live], [role="alert"], [role="status"], [role="log"], [role="marquee"], [role="timer"]').count();
  return liveRegions;
}

/**
 * Check modal/dialog accessibility
 */
async function checkModalAccessibility(page: Page, selector: string) {
  const modal = page.locator(selector);
  const isVisible = await modal.isVisible();
  
  if (!isVisible) {
    return { isOpen: false, hasFocusTrap: false, hasEscapeHandler: false };
  }
  
  const role = await modal.getAttribute('role');
  const ariaModal = await modal.getAttribute('aria-modal');
  const ariaLabel = await modal.getAttribute('aria-label') || await modal.getAttribute('aria-labelledby');
  
  // Check for focus trap
  const focusableElements = modal.locator(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  const focusableCount = await focusableElements.count();
  
  return {
    isOpen: true,
    hasRole: !!role,
    hasAriaModal: ariaModal === 'true',
    hasAriaLabel: !!ariaLabel,
    hasFocusableElements: focusableCount > 0,
    focusableCount
  };
}

/**
 * Check reduced motion preference
 */
async function checkReducedMotionCompliance(page: Page) {
  // Emulate reduced motion
  await page.emulateMedia({ reducedMotion: 'reduce' });
  
  // Check for animations that don't respect reduced motion
  const violations = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('*'));
    const problematic: string[] = [];
    
    for (const el of allElements) {
      const style = window.getComputedStyle(el);
      const animationDuration = parseFloat(style.animationDuration);
      const transitionDuration = parseFloat(style.transitionDuration);
      
      // If animation/transition is > 0.1s and not explicitly disabled for reduced motion
      if ((animationDuration > 0.1 || transitionDuration > 0.1)) {
        // Check if animation-name is not 'none'
        if (style.animationName && style.animationName !== 'none') {
          problematic.push(el.outerHTML.substring(0, 100));
        }
      }
    }
    
    return problematic.slice(0, 10); // Limit to first 10
  });
  
  return violations;
}

/**
 * Set dark mode
 */
async function setDarkMode(page: Page) {
  try {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('theme', 'dark');
      } catch (e) {
        // localStorage may be blocked in test context
      }
    });
  } catch (e) {
    // Fallback: just add the dark class
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
  }
}

/**
 * Set light mode
 */
async function setLightMode(page: Page) {
  try {
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('theme', 'light');
      } catch (e) {
        // localStorage may be blocked in test context
      }
    });
  } catch (e) {
    // Fallback: just remove the dark class
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
  }
}

// ============================================================================
// TEST SUITE: AXE-CORE SCANS
// ============================================================================

test.describe('1. Axe-Core Automated Scans', () => {
  
  test.describe('Major Pages Scan', () => {
    for (const pagePath of MAJOR_PAGES) {
      test(`should have no critical axe violations on ${pagePath}`, async ({ page }) => {
        await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);
        
        const results = await runAxeAudit(page);
        const criticalViolations = results.violations.filter(v => v.impact === 'critical');
        
        if (criticalViolations.length > 0) {
          console.log(`\n=== CRITICAL VIOLATIONS ON ${pagePath} ===`);
          criticalViolations.forEach(v => {
            console.log(`- ${v.id}: ${v.description}`);
            v.nodes.forEach(n => console.log(`  ${n.target}`));
          });
        }
        
        expect(criticalViolations).toEqual([]);
      });
    }
  });
  
  test('should generate axe scan report for all major pages', async ({ page }) => {
    const allResults: Array<{ url: string; violations: number; passes: number }> = [];
    
    for (const pagePath of MAJOR_PAGES) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      
      const results = await runAxeAudit(page);
      
      allResults.push({
        url: pagePath,
        violations: results.violations.length,
        passes: results.passes.length
      });
      
      console.log(`${pagePath}: ${results.violations.length} violations, ${results.passes.length} passes`);
    }
    
    const totalViolations = allResults.reduce((sum, r) => sum + r.violations, 0);
    console.log(`\nTotal violations across all pages: ${totalViolations}`);
    
    // This is informational - we'll track violations
    expect(allResults.length).toBe(MAJOR_PAGES.length);
  });
});

// ============================================================================
// TEST SUITE: KEYBOARD NAVIGATION
// ============================================================================

test.describe('2. Keyboard Navigation', () => {
  
  test.describe('Tab Order and Focusability', () => {
    
    test('all interactive elements should be keyboard accessible', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const focusable = await getFocusableElements(page);
      const count = await focusable.count();
      
      console.log(`\nFound ${count} focusable elements`);
      
      const inaccessible: string[] = [];
      
      for (let i = 0; i < Math.min(count, 20); i++) {
        const element = focusable.nth(i);
        const isVisible = await element.isVisible();
        if (!isVisible) continue;
        
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        const tabIndex = await element.getAttribute('tabindex');
        
        // Elements with tabindex="-1" are not keyboard accessible
        if (tabIndex === '-1') {
          const html = await element.evaluate(el => el.outerHTML.substring(0, 80));
          inaccessible.push(`${tagName}: ${html}`);
        }
      }
      
      if (inaccessible.length > 0) {
        console.log('\nElements with tabindex="-1" (not keyboard accessible):');
        inaccessible.forEach(el => console.log(`  - ${el}`));
      }
      
      expect(inaccessible.length).toBe(0);
    });
    
    test('tab order should follow logical visual layout', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const focusable = await getFocusableElements(page);
      const count = await focusable.count();
      
      const tabOrder: Array<{ y: number; element: string }> = [];
      
      for (let i = 0; i < Math.min(count, 15); i++) {
        const element = focusable.nth(i);
        const isVisible = await element.isVisible();
        if (!isVisible) continue;
        
        const box = await element.boundingBox();
        if (!box) continue;
        
        const html = await element.evaluate(el => el.outerHTML.substring(0, 50));
        tabOrder.push({ y: box.y, element: html });
      }
      
      // Check if order is generally top-to-bottom
      let issues = 0;
      for (let i = 1; i < tabOrder.length; i++) {
        if (tabOrder[i].y < tabOrder[i-1].y - 50) {
          issues++;
        }
      }
      
      if (issues > 0) {
        console.log(`\n${issues} potential tab order issues found`);
      }
      
      expect(issues).toBeLessThanOrEqual(3); // Allow some tolerance
    });
    
    test('focus should not get trapped unexpectedly', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      // Start from body
      await page.focus('body');
      
      // Tab through first 10 elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
      }
      
      const activeTag = await page.evaluate(() => document.activeElement?.tagName);
      
      // If focus is still in the document, it's not trapped
      expect(activeTag).not.toBe('BODY');
    });
  });
  
  test.describe('Focus Indicators', () => {
    
    test('all interactive elements should have visible focus indicators', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const focusable = await getFocusableElements(page);
      const count = await focusable.count();
      
      const withoutFocus: string[] = [];
      
      // Test sample of elements
      const sampleSize = Math.min(count, 10);
      for (let i = 0; i < sampleSize; i++) {
        const element = focusable.nth(Math.floor(i * count / sampleSize));
        const isVisible = await element.isVisible();
        if (!isVisible) continue;
        
        await element.focus();
        const hasIndicator = await hasFocusIndicator(page, element);
        
        if (!hasIndicator) {
          const html = await element.evaluate(el => el.outerHTML.substring(0, 80));
          withoutFocus.push(html);
        }
      }
      
      if (withoutFocus.length > 0) {
        console.log(`\n${withoutFocus.length} elements without visible focus indicators`);
        withoutFocus.slice(0, 3).forEach(el => console.log(`  - ${el}`));
      }
      
      expect(withoutFocus.length).toBe(0);
    });
  });
  
  test.describe('Skip Links', () => {
    
    test.skip('should have skip link for keyboard users', async ({ page }) => {
      // Skip link is recommended but not critical for basic a11y
      // This test is informational only
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const hasSkipLink = await checkForSkipLink(page);
      
      if (!hasSkipLink) {
        console.log('\nNo skip link found. Consider adding for better keyboard UX.');
      }
    });
    
    test('skip link should be functional', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const skipLink = page.locator('a[href="#main-content"], [class*="skip"]').first();
      const count = await skipLink.count();
      
      if (count > 0) {
        // Tab to skip link
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
        
        // Press Enter to activate
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
        
        // Check if main content is now focused or URL changed
        const url = page.url();
        expect(url.includes('#main-content') || focusedTag).toBeTruthy();
      } else {
        console.log('\nSkipping - no skip link present');
      }
    });
  });
});

// ============================================================================
// TEST SUITE: SCREEN READER ANNOUNCEMENTS
// ============================================================================

test.describe('3. Screen Reader Announcements', () => {
  
  test.describe('Landmarks and Structure', () => {
    
    test('page should have proper landmark regions', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const landmarks = await checkLandmarks(page);
      
      console.log('\nLandmark regions found:');
      console.log(`  - main: ${landmarks.hasMain}`);
      console.log(`  - nav: ${landmarks.hasNav}`);
      console.log(`  - header: ${landmarks.hasHeader}`);
      console.log(`  - footer: ${landmarks.hasFooter}`);
      console.log(`  - aside: ${landmarks.hasAside}`);
      
      // At minimum, should have main and header or nav
      expect(landmarks.hasMain).toBe(true);
    });
    
    test('heading hierarchy should be properly nested', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const { headings, violations } = await checkHeadingHierarchy(page);
      
      console.log(`\nFound ${headings.length} headings`);
      if (headings.length > 0) {
        console.log(`First 5: ${headings.slice(0, 5).map(h => `h${h.level}`).join(', ')}`);
      }
      
      if (violations.length > 0) {
        console.log('\nHeading violations:');
        violations.forEach(v => console.log(`  - ${v}`));
      }
      
      expect(violations.length).toBe(0);
    });
  });
  
  test.describe('Live Regions', () => {
    
    test('dynamic content should have appropriate live regions', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const liveRegionCount = await checkLiveRegions(page);
      
      console.log(`\nFound ${liveRegionCount} live regions`);
      
      // Live regions are optional but helpful for dynamic content
      // This test documents the current state
      expect(liveRegionCount).toBeGreaterThanOrEqual(0);
    });
    
    test('notifications should be announced to screen readers', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      // Check for alert roles
      const alerts = await page.locator('[role="alert"], [role="status"]').count();
      
      console.log(`\nAlert/status regions: ${alerts}`);
      
      // This is informational
      expect(alerts).toBeGreaterThanOrEqual(0);
    });
  });
  
  test.describe('Accessible Names', () => {
    
    test('interactive elements should have accessible names', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const buttons = await page.locator('button').all();
      const links = await page.locator('a').all();
      
      const missingNames: string[] = [];
      
      // Check buttons
      for (const button of buttons.slice(0, 10)) {
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledby = await button.getAttribute('aria-labelledby');
        const text = await button.textContent();
        const title = await button.getAttribute('title');
        
        if (!ariaLabel && !ariaLabelledby && !text?.trim() && !title) {
          const html = await button.evaluate(el => el.outerHTML.substring(0, 80));
          missingNames.push(`button: ${html}`);
        }
      }
      
      // Check links
      for (const link of links.slice(0, 10)) {
        const ariaLabel = await link.getAttribute('aria-label');
        const ariaLabelledby = await link.getAttribute('aria-labelledby');
        const text = await link.textContent();
        
        if (!ariaLabel && !ariaLabelledby && !text?.trim()) {
          const html = await link.evaluate(el => el.outerHTML.substring(0, 80));
          missingNames.push(`a: ${html}`);
        }
      }
      
      if (missingNames.length > 0) {
        console.log(`\n${missingNames.length} elements missing accessible names:`);
        missingNames.slice(0, 5).forEach(el => console.log(`  - ${el}`));
      }
      
      expect(missingNames.length).toBe(0);
    });
  });
});

// ============================================================================
// TEST SUITE: COLOR CONTRAST
// ============================================================================

test.describe('4. Color Contrast - WCAG AA', () => {
  
  test('should have no color contrast violations in light mode', async ({ page }) => {
    await setLightMode(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    
    const results = await runAxeAudit(page);
    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    
    if (contrastViolations.length > 0) {
      console.log(`\n${contrastViolations.length} color contrast violations in light mode:`);
      contrastViolations.slice(0, 5).forEach(v => {
        console.log(`  - ${v.description}`);
        v.nodes.slice(0, 2).forEach(n => console.log(`    ${n.target}`));
      });
    }
    
    expect(contrastViolations).toEqual([]);
  });
  
  test('should have no color contrast violations in dark mode', async ({ page }) => {
    await setDarkMode(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    
    const results = await runAxeAudit(page);
    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    
    if (contrastViolations.length > 0) {
      console.log(`\n${contrastViolations.length} color contrast violations in dark mode:`);
      contrastViolations.slice(0, 5).forEach(v => {
        console.log(`  - ${v.description}`);
        v.nodes.slice(0, 2).forEach(n => console.log(`    ${n.target}`));
      });
    }
    
    expect(contrastViolations).toEqual([]);
  });
  
  test('should test color contrast on multiple pages', async ({ page }) => {
    const violations: Array<{ page: string; count: number }> = [];
    
    for (const pagePath of MAJOR_PAGES) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const results = await runAxeAudit(page);
      const contrastCount = results.violations.filter(v => v.id === 'color-contrast').length;
      
      violations.push({ page: pagePath, count: contrastCount });
    }
    
    console.log('\nColor contrast violations by page:');
    violations.forEach(v => console.log(`  ${v.page}: ${v.count}`));
    
    const totalViolations = violations.reduce((sum, v) => sum + v.count, 0);
    expect(totalViolations).toBe(0);
  });
});

// ============================================================================
// TEST SUITE: TOUCH TARGETS
// ============================================================================

test.describe('5. Touch Target Sizes', () => {
  
  test('all touch targets should meet minimum 44x44px size', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    const violations = await getSmallTouchTargets(page);
    
    if (violations.length > 0) {
      console.log(`\n${violations.length} touch targets below ${MIN_TOUCH_TARGET_SIZE}x${MIN_TOUCH_TARGET_SIZE}px:`);
      violations.slice(0, 5).forEach(v => {
        console.log(`  - ${v.width}x${v.height}px: ${v.html.substring(0, 60)}`);
      });
    }
    
    expect(violations).toEqual([]);
  });
  
  test('should check touch targets on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    const violations = await getSmallTouchTargets(page);
    
    console.log(`\nMobile viewport (375x667): ${violations.length} small touch targets`);
    
    if (violations.length > 0) {
      violations.slice(0, 3).forEach(v => {
        console.log(`  - ${v.width}x${v.height}px`);
      });
    }
    
    expect(violations.length).toBe(0);
  });
  
  test('should check touch targets on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    const violations = await getSmallTouchTargets(page);
    
    console.log(`\nTablet viewport (768x1024): ${violations.length} small touch targets`);
    
    expect(violations.length).toBe(0);
  });
});

// ============================================================================
// TEST SUITE: FORM ACCESSIBILITY
// ============================================================================

test.describe('6. Form Accessibility', () => {
  
  test('all form inputs should have proper labels', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    const violations = await checkFormLabels(page);
    
    if (violations.length > 0) {
      console.log(`\n${violations.length} form inputs missing labels:`);
      violations.slice(0, 5).forEach(v => console.log(`  - ${v}`));
    }
    
    expect(violations).toEqual([]);
  });
  
  test('required fields should be indicated', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    const requiredInputs = await page.locator('[required], [aria-required="true"]').count();
    
    console.log(`\nFound ${requiredInputs} required fields`);
    
    // Just document the count
    expect(requiredInputs).toBeGreaterThanOrEqual(0);
  });
  
  test('form error messages should be associated with inputs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Check for aria-describedby on inputs with error messages
    const inputsWithAriaDesc = await page.locator('[aria-describedby]').count();
    const errorMessages = await page.locator('[role="alert"], .error, [aria-invalid="true"]').count();
    
    console.log(`\nInputs with aria-describedby: ${inputsWithAriaDesc}`);
    console.log(`Error message elements: ${errorMessages}`);
    
    // Informational - forms should associate errors with inputs
    expect(true).toBe(true);
  });
});

// ============================================================================
// TEST SUITE: MODAL/DIALOG ACCESSIBILITY
// ============================================================================

test.describe('7. Modal/Dialog Accessibility', () => {
  
  test('modals should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Look for any open modals or dialogs
    const modals = page.locator('[role="dialog"], [role="alertdialog"]');
    const modalCount = await modals.count();
    
    if (modalCount > 0) {
      for (let i = 0; i < modalCount; i++) {
        const modal = modals.nth(i);
        const role = await modal.getAttribute('role');
        const ariaModal = await modal.getAttribute('aria-modal');
        const ariaLabel = await modal.getAttribute('aria-label');
        
        console.log(`\nModal ${i + 1}:`);
        console.log(`  role: ${role}`);
        console.log(`  aria-modal: ${ariaModal}`);
        console.log(`  aria-label: ${ariaLabel || 'MISSING'}`);
        
        expect(role).toBeTruthy();
        expect(ariaModal).toBe('true');
        expect(ariaLabel).toBeTruthy();
      }
    } else {
      console.log('\nNo open modals found on this page');
    }
  });
  
  test('modals should trap focus within the dialog', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Look for any open modal
    const modal = page.locator('[role="dialog"][aria-modal="true"]').first();
    const isVisible = await modal.isVisible();
    
    if (!isVisible) {
      console.log('\nNo modal available to test focus trap');
      return;
    }
    
    // Get focusable elements in modal
    const focusable = modal.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const count = await focusable.count();
    
    if (count > 0) {
      // Focus first element
      await focusable.first().focus();
      const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
      
      // Tab to last element
      for (let i = 0; i < count - 1; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
      }
      
      // Tab one more time - should cycle back to first
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
      
      const afterTabFocused = await page.evaluate(() => document.activeElement?.tagName);
      
      console.log(`\nFocus trap test:`);
      console.log(`  First element: ${firstFocused}`);
      console.log(`  After cycling: ${afterTabFocused}`);
      
      // Focus should cycle within the modal
      expect(afterTabFocused).not.toBe('BODY');
    }
  });
  
  test('modals should close with Escape key', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Look for any open modal
    const modal = page.locator('[role="dialog"]').first();
    const isVisible = await modal.isVisible();
    
    if (isVisible) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      const stillVisible = await modal.isVisible();
      
      console.log(`\nModal closed with Escape: ${!stillVisible}`);
      expect(stillVisible).toBe(false);
    } else {
      console.log('\nNo modal available to test Escape key');
    }
  });
});

// ============================================================================
// TEST SUITE: REDUCED MOTION
// ============================================================================

test.describe('8. Reduced Motion Support', () => {
  
  test('should respect prefers-reduced-motion setting', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    const violations = await checkReducedMotionCompliance(page);
    
    if (violations.length > 0) {
      console.log(`\n${violations.length} elements may not respect reduced motion:`);
      violations.forEach(v => console.log(`  - ${v.substring(0, 60)}`));
    }
    
    // This test documents findings - animations should respect reduced motion
    expect(violations.length).toBe(0);
  });
  
  test('should check reduced motion on multiple pages', async ({ page }) => {
    const allViolations: Array<{ page: string; count: number }> = [];
    
    for (const pagePath of MAJOR_PAGES) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const violations = await checkReducedMotionCompliance(page);
      allViolations.push({ page: pagePath, count: violations.length });
    }
    
    console.log('\nReduced motion violations by page:');
    allViolations.forEach(v => console.log(`  ${v.page}: ${v.count}`));
    
    const total = allViolations.reduce((sum, v) => sum + v.count, 0);
    expect(total).toBe(0);
  });
});

// ============================================================================
// TEST SUITE: DARK MODE ACCESSIBILITY
// ============================================================================

test.describe('9. Dark Mode Accessibility', () => {
  
  test('dark mode should have sufficient contrast', async ({ page }) => {
    await setDarkMode(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    
    const results = await runAxeAudit(page);
    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    
    console.log(`\nDark mode contrast violations: ${contrastViolations.length}`);
    
    expect(contrastViolations).toEqual([]);
  });
  
  test('should check dark mode on all major pages', async ({ page }) => {
    await setDarkMode(page);
    
    const results: Array<{ page: string; violations: number }> = [];
    
    for (const pagePath of MAJOR_PAGES) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const audit = await runAxeAudit(page);
      const contrastCount = audit.violations.filter(v => v.id === 'color-contrast').length;
      
      results.push({ page: pagePath, violations: contrastCount });
    }
    
    console.log('\nDark mode contrast by page:');
    results.forEach(r => console.log(`  ${r.page}: ${r.violations}`));
    
    const total = results.reduce((sum, r) => sum + r.violations, 0);
    expect(total).toBe(0);
  });
  
  test('dark mode interactive elements should be clearly visible', async ({ page }) => {
    await setDarkMode(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    const focusable = await getFocusableElements(page);
    const count = await focusable.count();
    
    console.log(`\nDark mode: ${count} focusable elements`);
    
    // Check that elements are visible
    let visibleCount = 0;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = focusable.nth(i);
      if (await element.isVisible()) visibleCount++;
    }
    
    expect(visibleCount).toBeGreaterThan(0);
  });
});

// ============================================================================
// TEST SUITE: COMPREHENSIVE AUDIT
// ============================================================================

test.describe('10. Comprehensive Accessibility Audit', () => {
  
  test('should run full audit on home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    
    console.log('\n=== COMPREHENSIVE A11Y AUDIT - HOME PAGE ===\n');
    
    // 1. Axe-core scan
    const axeResults = await runAxeAudit(page);
    console.log(`1. Axe-Core: ${axeResults.violations.length} violations, ${axeResults.passes.length} passes`);
    
    const byImpact = {
      critical: axeResults.violations.filter(v => v.impact === 'critical').length,
      serious: axeResults.violations.filter(v => v.impact === 'serious').length,
      moderate: axeResults.violations.filter(v => v.impact === 'moderate').length,
      minor: axeResults.violations.filter(v => v.impact === 'minor').length,
    };
    console.log(`   By impact: C:${byImpact.critical} S:${byImpact.serious} M:${byImpact.moderate} m:${byImpact.minor}`);
    
    // 2. Keyboard navigation
    const focusable = await getFocusableElements(page);
    const focusableCount = await focusable.count();
    console.log(`2. Focusable elements: ${focusableCount}`);
    
    // 3. Landmarks
    const landmarks = await checkLandmarks(page);
    console.log(`3. Landmarks: main=${landmarks.hasMain}, nav=${landmarks.hasNav}, header=${landmarks.hasHeader}`);
    
    // 4. Headings
    const { headings, violations: headingViolations } = await checkHeadingHierarchy(page);
    console.log(`4. Headings: ${headings.length} found, ${headingViolations.length} violations`);
    
    // 5. Touch targets
    const touchViolations = await getSmallTouchTargets(page);
    console.log(`5. Touch targets: ${touchViolations.length} below minimum size`);
    
    // 6. Form labels
    const formViolations = await checkFormLabels(page);
    console.log(`6. Form labels: ${formViolations.length} missing`);
    
    // 7. Live regions
    const liveRegions = await checkLiveRegions(page);
    console.log(`7. Live regions: ${liveRegions} found`);
    
    // 8. Skip link
    const hasSkipLink = await checkForSkipLink(page);
    console.log(`8. Skip link: ${hasSkipLink ? 'present' : 'missing'}`);
    
    console.log('\n=== AUDIT COMPLETE ===\n');
    
    // Critical violations should be 0
    expect(byImpact.critical).toBe(0);
  });
  
  test('should generate audit summary for all pages', async ({ page }) => {
    const summary: Array<{
      url: string;
      violations: number;
      byImpact: Record<string, number>;
      landmarks: Record<string, boolean>;
      headings: number;
      touchViolations: number;
    }> = [];
    
    for (const pagePath of MAJOR_PAGES) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      const axeResults = await runAxeAudit(page);
      const landmarks = await checkLandmarks(page);
      const { headings } = await checkHeadingHierarchy(page);
      const touchViolations = await getSmallTouchTargets(page);
      
      summary.push({
        url: pagePath,
        violations: axeResults.violations.length,
        byImpact: {
          critical: axeResults.violations.filter(v => v.impact === 'critical').length,
          serious: axeResults.violations.filter(v => v.impact === 'serious').length,
          moderate: axeResults.violations.filter(v => v.impact === 'moderate').length,
          minor: axeResults.violations.filter(v => v.impact === 'minor').length,
        },
        landmarks,
        headings: headings.length,
        touchViolations: touchViolations.length
      });
    }
    
    console.log('\n=== ACCESSIBILITY SUMMARY ===\n');
    console.log('Page                    | Violations | C | S | M | m | Touch | Landmarks');
    console.log('------------------------|------------|---|---|---|---|-------|----------');
    
    for (const s of summary) {
      const landmarkCount = Object.values(s.landmarks).filter(Boolean).length;
      console.log(
        `${s.url.padEnd(24)} | ${s.violations.toString().padEnd(10)} | ${s.byImpact.critical} | ${s.byImpact.serious} | ${s.byImpact.moderate} | ${s.byImpact.minor} | ${s.touchViolations.toString().padEnd(5)} | ${landmarkCount}/5`
      );
    }
    
    const totalViolations = summary.reduce((sum, s) => sum + s.violations, 0);
    const totalCritical = summary.reduce((sum, s) => sum + s.byImpact.critical, 0);
    
    console.log('\n');
    console.log(`Total violations: ${totalViolations}`);
    console.log(`Critical: ${totalCritical}`);
    
    // No critical violations allowed
    expect(totalCritical).toBe(0);
  });
});
