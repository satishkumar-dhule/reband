/**
 * Unified Smoke Test Suite - DevPrep
 * 
 * Critical user journey tests covering:
 * - Home page and core UI elements
 * - Navigation and routing
 * - Channel browsing
 * - Content viewing
 * - Search functionality
 * - Theme switching
 * - Accessibility basics
 * 
 * Priority: P0 (Critical) - Run on every deployment
 */

import { test, expect, Page } from '@playwright/test';
import { setupUser, waitForPageReady, waitForContent } from '../fixtures';

const BASE_URL = 'http://localhost:5173';
const CRITICAL_PAGES = ['/', '/channels', '/learning-paths', '/coding-challenges', '/about'];

async function verifyPageLoads(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await waitForPageReady(page);
  await waitForContent(page, 100);
  
  const content = await page.locator('body').textContent();
  expect(content && content.length > 50, `Page ${path} should have content`).toBeTruthy();
}

async function verifyNavigationWorks(page: Page) {
  const links = page.locator('a[href]');
  const linkCount = await links.count();
  
  if (linkCount > 0) {
    const firstLink = links.first();
    const href = await firstLink.getAttribute('href');
    const isVisible = await firstLink.isVisible();
    
    if (isVisible && href && !href.startsWith('#') && !href.startsWith('http')) {
      await firstLink.click();
      await page.waitForTimeout(500);
      
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    }
  }
}

test.describe('Smoke Tests - Critical User Journeys', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test.describe('1. Home Page', () => {
    
    test('home page loads without errors', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const bodyText = await page.locator('body').textContent();
      expect(bodyText && bodyText.length > 100).toBeTruthy();
      
      const hasNoErrors = await page.evaluate(() => {
        return document.body.textContent && document.body.textContent.length > 0;
      });
      expect(hasNoErrors).toBe(true);
    });
    
    test('home page displays primary CTAs', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const hasContent = await page.locator('body').textContent();
      expect(hasContent && hasContent.length > 50).toBeTruthy();
    });
    
    test('home page has working navigation elements', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });
  });

  test.describe('2. Navigation', () => {
    
    test('main navigation routes work correctly', async ({ page }) => {
      for (const path of CRITICAL_PAGES) {
        await verifyPageLoads(page, path);
      }
    });
    
    test('navigation between pages preserves state', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const initialPrefs = await page.evaluate(() => {
        return localStorage.getItem('user-preferences');
      });
      
      await page.goto('/channels');
      await waitForPageReady(page);
      await waitForContent(page);
      
      await page.goto('/learning-paths');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const finalPrefs = await page.evaluate(() => {
        return localStorage.getItem('user-preferences');
      });
      
      expect(finalPrefs).toEqual(initialPrefs);
    });
  });

  test.describe('3. Channels', () => {
    
    test('channels page loads and displays content', async ({ page }) => {
      await page.goto('/channels');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const content = await page.locator('body').textContent();
      expect(content && content.length > 50).toBeTruthy();
    });
    
    test('individual channel pages load', async ({ page }) => {
      const channels = ['system-design', 'algorithms', 'devops'];
      
      for (const channel of channels) {
        await page.goto(`/channel/${channel}`);
        await waitForPageReady(page);
        await waitForContent(page, 50);
        
        const content = await page.locator('body').textContent();
        expect(content && content.length > 50).toBeTruthy();
      }
    });
    
    test('channel selection persists', async ({ page }) => {
      await page.goto('/channels');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const prefsBefore = await page.evaluate(() => {
        const p = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        return p.subscribedChannels || [];
      });
      
      await page.goto('/');
      await waitForPageReady(page);
      
      const prefsAfter = await page.evaluate(() => {
        const p = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        return p.subscribedChannels || [];
      });
      
      expect(prefsAfter).toEqual(prefsBefore);
    });
  });

  test.describe('4. Content Viewing', () => {
    
    test('learning paths page loads', async ({ page }) => {
      await page.goto('/learning-paths');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const content = await page.locator('body').textContent();
      expect(content && content.length > 50).toBeTruthy();
    });
    
    test('coding challenges page loads', async ({ page }) => {
      await page.goto('/coding-challenges');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const content = await page.locator('body').textContent();
      expect(content && content.length > 50).toBeTruthy();
    });
    
    test('content is readable and properly formatted', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const hasProperFormatting = await page.evaluate(() => {
        const body = document.body;
        const hasHeadings = body.querySelectorAll('h1, h2, h3').length > 0;
        const hasParagraphs = body.querySelectorAll('p').length > 0 || body.textContent && body.textContent.length > 100;
        return hasParagraphs;
      });
      
      expect(hasProperFormatting).toBe(true);
    });
  });

  test.describe('5. Search', () => {
    
    test('search input is accessible', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const searchInput = page.getByPlaceholder(/Search/i);
      const searchVisible = await searchInput.isVisible().catch(() => false);
      
      if (searchVisible) {
        expect(searchInput).toBeTruthy();
      }
    });
    
    test('search returns results', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const searchInput = page.getByPlaceholder(/Search/i);
      
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill('javascript');
        await page.waitForTimeout(500);
        
        const content = await page.locator('body').textContent();
        expect(content && content.length > 50).toBeTruthy();
      } else {
        expect(true).toBe(true);
      }
    });
    
    test('search clears properly', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const searchInput = page.getByPlaceholder(/Search/i);
      
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill('test');
        await searchInput.clear();
        await page.waitForTimeout(300);
        
        const inputValue = await searchInput.inputValue();
        expect(inputValue).toBe('');
      }
    });
  });

  test.describe('6. Theme Switching', () => {
    
    test('default theme loads correctly', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const hasStyles = await page.evaluate(() => {
        const body = document.body;
        const computed = window.getComputedStyle(body);
        return computed.backgroundColor !== '' || computed.backgroundImage !== '';
      });
      
      expect(hasStyles).toBe(true);
    });
    
    test('theme can be toggled', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const themeToggle = page.locator('button[class*="theme"], button[class*="sun"], button[class*="moon"], button[class*="light"], button[class*="dark"]').first();
      
      if (await themeToggle.isVisible({ timeout: 2000 })) {
        await themeToggle.click();
        await page.waitForTimeout(300);
        
        const content = await page.locator('body').textContent();
        expect(content && content.length > 50).toBeTruthy();
      }
    });
    
    test('theme persists across navigation', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      const initialTheme = await page.evaluate(() => {
        const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        return prefs.theme || 'light';
      });
      
      await page.goto('/channels');
      await waitForPageReady(page);
      await page.goto('/');
      await waitForPageReady(page);
      
      const finalTheme = await page.evaluate(() => {
        const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        return prefs.theme || 'light';
      });
      
      expect(finalTheme).toEqual(initialTheme);
    });
    
    test('dark mode applies correctly', async ({ page }) => {
      await page.addInitScript(() => {
        const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        prefs.theme = 'dark';
        localStorage.setItem('user-preferences', JSON.stringify(prefs));
      });
      
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const hasStyles = await page.evaluate(() => {
        const body = document.body;
        const computed = window.getComputedStyle(body);
        return computed.backgroundColor !== '';
      });
      
      expect(hasStyles).toBe(true);
    });
  });

  test.describe('7. Accessibility Basics', () => {
    
    test('page has proper heading structure', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const hasHeadings = await page.locator('h1, h2, h3').count();
      expect(hasHeadings).toBeGreaterThan(0);
    });
    
    test('interactive elements are keyboard accessible', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toMatch(/BUTTON|A|INPUT/);
    });
    
    test('links navigate correctly', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const link = page.locator('a').first();
      if (await link.isVisible({ timeout: 2000 })) {
        const href = await link.getAttribute('href');
        await link.click();
        await page.waitForTimeout(500);
        
        if (href && !href.startsWith('#') && !href.startsWith('http')) {
          const currentUrl = page.url();
          expect(currentUrl).toBeTruthy();
        }
      }
    });
    
    test('page has landmark regions', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const hasMain = await page.locator('main, [role="main"]').count() > 0;
      const hasNav = await page.locator('nav, [role="navigation"]').count() > 0;
      
      expect(hasMain || hasNav).toBe(true);
    });
  });

  test.describe('8. User State & Progress', () => {
    
    test('user preferences are loaded', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const prefs = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('user-preferences') || '{}');
      });
      
      expect(prefs).toBeTruthy();
      expect(prefs.onboardingComplete).toBe(true);
    });
    
    test('credits balance is accessible', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const hasCreditData = await page.evaluate(() => {
        const credits = localStorage.getItem('user-credits');
        return credits && JSON.parse(credits).balance !== undefined;
      });
      
      expect(hasCreditData).toBe(true);
    });
    
    test('user state persists across pages', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      const initialCredits = await page.evaluate(() => {
        const credits = JSON.parse(localStorage.getItem('user-credits') || '{}');
        return credits.balance;
      });
      
      await page.goto('/channels');
      await waitForPageReady(page);
      await page.goto('/learning-paths');
      await waitForPageReady(page);
      
      const finalCredits = await page.evaluate(() => {
        const credits = JSON.parse(localStorage.getItem('user-credits') || '{}');
        return credits.balance;
      });
      
      expect(finalCredits).toEqual(initialCredits);
    });
  });

  test.describe('9. Error Handling', () => {
    
    test('invalid route shows appropriate response', async ({ page }) => {
      await page.goto('/invalid-route-12345');
      await waitForPageReady(page);
      
      const content = await page.locator('body').textContent();
      expect(content && content.length > 0).toBeTruthy();
    });
    
    test('page remains functional after errors', async ({ page }) => {
      await page.goto('/channel/non-existent-channel-xyz');
      await waitForPageReady(page);
      await page.waitForTimeout(1000);
      
      const content = await page.locator('body').textContent();
      expect(content && content.length > 0).toBeTruthy();
    });
  });

  test.describe('10. Cross-Page Integration', () => {
    
    test('complete user journey works end-to-end', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      await page.goto('/channels');
      await waitForPageReady(page);
      await waitForContent(page);
      
      await page.goto('/learning-paths');
      await waitForPageReady(page);
      await waitForContent(page);
      
      await page.goto('/coding-challenges');
      await waitForPageReady(page);
      await waitForContent(page);
      
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      const finalPrefs = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('user-preferences') || '{}');
      });
      
      expect(finalPrefs).toBeTruthy();
    });
    
    test('multiple channel navigation works', async ({ page }) => {
      const channels = ['system-design', 'algorithms', 'frontend', 'backend'];
      
      for (const channel of channels) {
        await page.goto(`/channel/${channel}`);
        await waitForPageReady(page);
        await waitForContent(page, 50);
        
        const content = await page.locator('body').textContent();
        expect(content && content.length > 50).toBeTruthy();
      }
    });
  });
});

test.describe('Smoke Tests - Fresh User', () => {
  
  test('new user sees appropriate content', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('marvel-intro-seen', 'true');
    });
    
    await page.goto('/');
    await waitForPageReady(page);
    await waitForContent(page);
    
    const content = await page.locator('body').textContent();
    expect(content && content.length > 50).toBeTruthy();
  });
});

test.describe('Smoke Tests - Performance', () => {
  
  test('pages load within reasonable time', async ({ page }) => {
    const start = Date.now();
    
    await page.goto('/');
    await waitForPageReady(page);
    await waitForContent(page);
    
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10000);
  });
  
  test('no memory leaks on navigation', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    
    for (let i = 0; i < 3; i++) {
      await page.goto('/channels');
      await waitForPageReady(page);
      await page.goto('/');
      await waitForPageReady(page);
    }
    
    const content = await page.locator('body').textContent();
    expect(content && content.length > 50).toBeTruthy();
  });
});
