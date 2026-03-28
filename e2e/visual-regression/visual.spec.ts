/**
 * Visual Regression Tests for DevPrep
 * Tests: Homepage, Channels, Content Cards, Navigation, Theme Switching, Mobile vs Desktop, Dark vs Light Mode
 */

import { test, expect, Page } from '@playwright/test';
import { setupUser, waitForPageReady, waitForContent } from '../fixtures';

const SCREENSHOT_OPTIONS = {
  fullPage: true,
};

const VISUAL_THRESHOLD = 0.3;

async function captureScreenshot(page: Page, name: string, options = {}) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  const screenshotOptions = { ...SCREENSHOT_OPTIONS, ...options };
  return expect(page).toHaveScreenshot(`visual/${name}.png`, {
    maxDiffPixelRatio: VISUAL_THRESHOLD,
    ...screenshotOptions,
  });
}

async function setupTheme(page: Page, theme: 'light' | 'dark') {
  await page.addInitScript((theme) => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('color-mode', theme);
  }, theme);
}

async function navigateTo(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' });
  await waitForPageReady(page);
  await waitForContent(page);
}

test.describe('Visual Regression Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test.describe('Homepage Visual Elements', () => {
    
    test('homepage light mode desktop', async ({ page }) => {
      await setupTheme(page, 'light');
      await navigateTo(page, '/');
      await captureScreenshot(page, 'homepage-light-desktop');
    });

    test('homepage dark mode desktop', async ({ page }) => {
      await setupTheme(page, 'dark');
      await navigateTo(page, '/');
      await captureScreenshot(page, 'homepage-dark-desktop');
    });

    test('homepage hero section', async ({ page }) => {
      await navigateTo(page, '/');
      await captureScreenshot(page, 'homepage-hero-section');
    });

    test('homepage stats cards', async ({ page }) => {
      await navigateTo(page, '/stats');
      await captureScreenshot(page, 'homepage-stats-cards');
    });



  });

  test.describe('Channel Pages', () => {
    
    test('individual channel page - system-design', async ({ page }) => {
      await navigateTo(page, '/channel/system-design');
      await captureScreenshot(page, 'channel-system-design');
    });

  });

  test.describe('Content Cards', () => {
    
    test('question cards display', async ({ page }) => {
      await navigateTo(page, '/channel/algorithms');
      await captureScreenshot(page, 'question-cards');
    });

    test('flashcard visual', async ({ page }) => {
      await navigateTo(page, '/review');
      await captureScreenshot(page, 'flashcard-review');
    });

    test('learning path cards', async ({ page }) => {
      await navigateTo(page, '/learning-paths');
      await captureScreenshot(page, 'learning-path-cards');
    });

  });

  test.describe('Navigation Elements', () => {
    
    test('top navigation bar light', async ({ page }) => {
      await setupTheme(page, 'light');
      await navigateTo(page, '/');
      await captureScreenshot(page, 'nav-top-light', { fullPage: false });
    });

    test('top navigation bar dark', async ({ page }) => {
      await setupTheme(page, 'dark');
      await navigateTo(page, '/');
      await captureScreenshot(page, 'nav-top-dark', { fullPage: false });
    });

    test('sidebar navigation desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await navigateTo(page, '/');
      await captureScreenshot(page, 'sidebar-desktop', { fullPage: false });
    });

    test('mobile bottom navigation', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await navigateTo(page, '/');
      await captureScreenshot(page, 'mobile-bottom-nav', { fullPage: false });
    });

  });

  test.describe('Theme Switching Visual', () => {
    
    test('theme toggle button exists', async ({ page }) => {
      await navigateTo(page, '/');
      await captureScreenshot(page, 'theme-toggle-button', { fullPage: false });
    });

    test('light to dark transition', async ({ page }) => {
      await setupTheme(page, 'light');
      await navigateTo(page, '/');
      
      const themeToggle = page.locator(
        '[class*="theme"], [class*="Theme"], button[aria-label*="theme"], button[aria-label*="mode"]'
      ).first();
      
      if (await themeToggle.count() > 0) {
        await themeToggle.click();
        await page.waitForTimeout(300);
        await captureScreenshot(page, 'theme-dark-after-toggle');
      }
    });

    test('color scheme consistency light', async ({ page }) => {
      await setupTheme(page, 'light');
      await navigateTo(page, '/');
      await captureScreenshot(page, 'color-scheme-light');
    });

    test('color scheme consistency dark', async ({ page }) => {
      await setupTheme(page, 'dark');
      await navigateTo(page, '/');
      await captureScreenshot(page, 'color-scheme-dark');
    });

  });

  test.describe('Mobile vs Desktop Layouts', () => {
    
    test('homepage mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await navigateTo(page, '/');
      await captureScreenshot(page, 'homepage-mobile-390');
    });

    test('homepage tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await navigateTo(page, '/');
      await captureScreenshot(page, 'homepage-tablet-768');
    });

    test('homepage desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await navigateTo(page, '/');
      await captureScreenshot(page, 'homepage-desktop-1280');
    });

    test('responsive card grid mobile', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await navigateTo(page, '/learning-paths');
      await captureScreenshot(page, 'cards-grid-mobile');
    });

    test('responsive card grid desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await navigateTo(page, '/learning-paths');
      await captureScreenshot(page, 'cards-grid-desktop');
    });

  });

  test.describe('Dark Mode vs Light Mode', () => {
    
    test('stats page dark mode', async ({ page }) => {
      await setupTheme(page, 'dark');
      await navigateTo(page, '/stats');
      await captureScreenshot(page, 'stats-dark');
    });

    test('stats page light mode', async ({ page }) => {
      await setupTheme(page, 'light');
      await navigateTo(page, '/stats');
      await captureScreenshot(page, 'stats-light');
    });

    test('learning paths dark mode', async ({ page }) => {
      await setupTheme(page, 'dark');
      await navigateTo(page, '/learning-paths');
      await captureScreenshot(page, 'paths-dark');
    });

    test('learning paths light mode', async ({ page }) => {
      await setupTheme(page, 'light');
      await navigateTo(page, '/learning-paths');
      await captureScreenshot(page, 'paths-light');
    });

  });

  test.describe('Interactive Elements Visual State', () => {
    
    test('button hover states', async ({ page }) => {
      await navigateTo(page, '/');
      const buttons = page.locator('button').first();
      if (await buttons.count() > 0) {
        await buttons.hover();
        await captureScreenshot(page, 'button-hover-state');
      }
    });

    test('card hover effects', async ({ page }) => {
      await navigateTo(page, '/channels');
      const cards = page.locator('[class*="card"]').first();
      if (await cards.count() > 0) {
        await cards.hover();
        await captureScreenshot(page, 'card-hover-effect');
      }
    });

    test('input focus states', async ({ page }) => {
      await navigateTo(page, '/');
      const inputs = page.locator('input').first();
      if (await inputs.count() > 0) {
        await inputs.focus();
        await captureScreenshot(page, 'input-focus-state', { fullPage: false });
      }
    });

    test('loading states visual', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('loading-test', 'true');
      });
      await navigateTo(page, '/');
      const loading = page.locator('[class*="loading"], [class*="Loader"], .spinner');
      if (await loading.count() > 0) {
        await captureScreenshot(page, 'loading-state');
      }
    });

  });

  test.describe('Form & Input Visuals', () => {
    
    test('search input styling light', async ({ page }) => {
      await setupTheme(page, 'light');
      await navigateTo(page, '/');
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"], [class*="search"] input').first();
      if (await searchInput.count() > 0) {
        await captureScreenshot(page, 'search-input-light', { fullPage: false });
      }
    });

    test('search input styling dark', async ({ page }) => {
      await setupTheme(page, 'dark');
      await navigateTo(page, '/');
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"], [class*="search"] input').first();
      if (await searchInput.count() > 0) {
        await captureScreenshot(page, 'search-input-dark', { fullPage: false });
      }
    });

    test('form inputs consistent styling', async ({ page }) => {
      await navigateTo(page, '/profile');
      const inputs = page.locator('input, textarea, select');
      if (await inputs.count() > 0) {
        await captureScreenshot(page, 'form-inputs-styling');
      }
    });

  });

  test.describe('Typography & Spacing', () => {
    
    test('font hierarchy visible', async ({ page }) => {
      await navigateTo(page, '/');
      await captureScreenshot(page, 'font-hierarchy');
    });

    test('text contrast in light mode', async ({ page }) => {
      await setupTheme(page, 'light');
      await navigateTo(page, '/');
      await captureScreenshot(page, 'text-contrast-light');
    });

    test('text contrast in dark mode', async ({ page }) => {
      await setupTheme(page, 'dark');
      await navigateTo(page, '/');
      await captureScreenshot(page, 'text-contrast-dark');
    });

  });

});
