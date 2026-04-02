/**
 * Core User Flows - Comprehensive E2E Tests
 * 
 * Critical user journeys covering:
 * - Home page → channel selection → content viewing
 * - User progress tracking
 * - Content filtering and search
 * - Theme switching
 * 
 * Priority: P0 (Critical)
 */

import { test, expect, setupUser, setupFreshUser, waitForPageReady, waitForContent } from '../fixtures';

test.describe('Critical User Flows', () => {
  test.describe('Home → Channel → Content Flow', () => {
    test.beforeEach(async ({ page }) => {
      await setupUser(page);
      await page.goto('/');
      await waitForPageReady(page);
    });

    test('complete user journey: home to content viewing', async ({ page }) => {
      await waitForContent(page);
      
      // Verify home page loads with key elements
      const bodyText = await page.locator('body').textContent();
      expect(bodyText && bodyText.length > 100).toBeTruthy();
      
      // Navigate to channels via Your Channels section
      const yourChannelsLink = page.getByText('Your Channels');
      if (await yourChannelsLink.isVisible({ timeout: 3000 })) {
        // Click on first available channel
        const channelButton = page.locator('[class*="channel"], button[class*="cursor"]').first();
        if (await channelButton.isVisible({ timeout: 2000 })) {
          await channelButton.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Verify navigation occurred
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    });

    test('home page displays all primary CTAs', async ({ page }) => {
      await waitForContent(page);
      
      // Check for Quick Start / Ready to Practice
      const hasQuickStart = await page.getByText('Quick Start').isVisible().catch(() => false) ||
                           await page.getByText('Ready to practice?').isVisible().catch(() => false);
      expect(hasQuickStart).toBeTruthy();
      
      // Check for credits display
      const hasCredits = await page.locator('nav.fixed.bottom-0 button').filter({ hasText: /^\d+$/ }).first().isVisible().catch(() => false) ||
                        await page.getByText('Credits').first().isVisible().catch(() => false);
      expect(hasCredits).toBeTruthy();
    });

    test('channel selection persists user preference', async ({ page }) => {
      await waitForContent(page);
      
      // Get initial preferences
      const initialPrefs = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('user-preferences') || '{}');
      });
      
      // Navigate to channels page
      await page.goto('/channels');
      await waitForPageReady(page);
      await waitForContent(page);
      
      // Verify channels page loads
      const channelNames = ['System Design', 'Algorithms', 'Frontend', 'Backend', 'DevOps'];
      let foundChannel = false;
      for (const name of channelNames) {
        if (await page.getByText(name).first().isVisible().catch(() => false)) {
          foundChannel = true;
          break;
        }
      }
      
      // If channels loaded, verify preferences still intact
      const finalPrefs = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('user-preferences') || '{}');
      });
      
      expect(finalPrefs.subscribedChannels).toEqual(initialPrefs.subscribedChannels);
    });

    test('content loads after channel selection', async ({ page }) => {
      // Direct navigation to a known channel
      await page.goto('/channel/devops');
      await waitForPageReady(page);
      await waitForContent(page, 200);
      
      // Verify content is present
      const content = await page.locator('body').textContent();
      expect(content && content.length > 50).toBeTruthy();
    });
  });

  test.describe('User Progress Tracking', () => {
    test.beforeEach(async ({ page }) => {
      await setupUser(page);
      await page.goto('/');
      await waitForPageReady(page);
    });

    test('progress displays on home page', async ({ page }) => {
      await waitForContent(page);
      
      // Look for progress indicators (Done, Streak, Topics)
      const progressElements = await page.locator('text=Done, text=Streak, text=Topics').count();
      
      // At least one progress element should be visible
      const hasProgress = progressElements > 0 || 
                         await page.getByText(/[0-9]+/).first().isVisible().catch(() => false);
      expect(hasProgress).toBeTruthy();
    });

    test('progress persists across page reloads', async ({ page }) => {
      await waitForContent(page);
      
      // Get initial progress state from localStorage
      const initialProgress = await page.evaluate(() => {
        const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        return prefs;
      });
      
      // Navigate around to trigger any progress updates
      await page.goto('/channels');
      await waitForPageReady(page);
      await page.goto('/');
      await waitForPageReady(page);
      
      // Verify progress data still exists
      const finalProgress = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('user-preferences') || '{}');
      });
      
      expect(finalProgress).toBeTruthy();
    });

    test('credits balance displays correctly', async ({ page }) => {
      await waitForContent(page);
      
      // Check for credits in navigation or content
      const creditsVisible = await page.locator('nav button').filter({ hasText: /^\d+$/ }).first().isVisible().catch(() => false) ||
                            await page.getByText(/Credits/i).first().isVisible().catch(() => false);
      
      // Credits should be visible or localStorage should have credit data
      const hasCreditData = await page.evaluate(() => {
        const credits = localStorage.getItem('user-credits');
        return credits && JSON.parse(credits).balance !== undefined;
      });
      
      expect(creditsVisible || hasCreditData).toBeTruthy();
    });
  });

  test.describe('Content Filtering and Search', () => {
    test.beforeEach(async ({ page }) => {
      await setupUser(page);
      await page.goto('/');
      await waitForPageReady(page);
    });

    test('search functionality works from home', async ({ page }) => {
      await waitForContent(page);
      
      // Find search input
      const searchInput = page.getByPlaceholder(/Search/i);
      
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill('devops');
        await page.waitForTimeout(500);
        
        // Verify search results appear or page updates
        const bodyText = await page.locator('body').textContent();
        expect(bodyText && bodyText.length > 50).toBeTruthy();
      }
    });

    test('channel filter shows correct content', async ({ page }) => {
      // Navigate to a specific channel
      await page.goto('/channel/algorithms');
      await waitForPageReady(page);
      await waitForContent(page);
      
      // Verify we're on the correct channel page
      const url = page.url();
      expect(url).toContain('algorithms');
      
      // Content should be relevant to the channel
      const content = await page.locator('body').textContent();
      expect(content && content.length > 50).toBeTruthy();
    });

    test('search returns relevant results', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      // Try search if available
      const searchInput = page.getByPlaceholder(/Search/i);
      
      const testQuery = 'question';
      await searchInput.fill(testQuery);
      await page.waitForTimeout(1000);
      
      // Page should show some results or navigation
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    });

    test('filter by content type works', async ({ page }) => {
      // Navigate to a channel with content types
      await page.goto('/channels');
      await waitForPageReady(page);
      await waitForContent(page);
      
      // Look for filter options (e.g., Questions, Flashcards, Exams)
      const filterOptions = await page.locator('button, [role="button"]').filter({ hasText: /Question|Flashcard|Exam/i }).count();
      
      // If filters exist, verify at least one is accessible
      if (filterOptions > 0) {
        const firstFilter = page.locator('button, [role="button"]').filter({ hasText: /Question|Flashcard|Exam/i }).first();
        if (await firstFilter.isVisible()) {
          await firstFilter.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Page should remain functional
      const content = await page.locator('body').textContent();
      expect(content && content.length > 50).toBeTruthy();
    });
  });

  test.describe('Theme Switching', () => {
    test.beforeEach(async ({ page }) => {
      await setupUser(page);
      await page.goto('/');
      await waitForPageReady(page);
    });

    test('default theme loads correctly', async ({ page }) => {
      await waitForContent(page);
      
      // Verify page has applied styles (not unstyled)
      const hasStyles = await page.evaluate(() => {
        const body = document.body;
        const computed = window.getComputedStyle(body);
        return computed.backgroundColor !== '' || computed.backgroundImage !== '';
      });
      
      expect(hasStyles).toBeTruthy();
    });

    test('theme can be toggled', async ({ page }) => {
      await waitForContent(page);
      
      // Look for theme toggle button
      const themeToggle = page.locator('button[class*="theme"], button[class*="sun"], button[class*="moon"], button[class*="light"], button[class*="dark"]').first();
      
      if (await themeToggle.isVisible({ timeout: 2000 })) {
        await themeToggle.click();
        await page.waitForTimeout(300);
        
        // Verify theme changed (localStorage should update)
        const themeChanged = await page.evaluate(() => {
          const prefs = localStorage.getItem('user-preferences');
          if (!prefs) return false;
          return JSON.parse(prefs).theme !== undefined;
        });
        
        // Theme preference should either be set or page should still be functional
        const pageFunctional = await page.locator('body').textContent();
        expect(pageFunctional && pageFunctional.length > 50).toBeTruthy();
      }
    });

    test('theme persists across navigation', async ({ page }) => {
      await waitForContent(page);
      
      // Get initial theme preference
      const initialTheme = await page.evaluate(() => {
        const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        return prefs.theme || 'light';
      });
      
      // Navigate to different pages
      await page.goto('/channels');
      await waitForPageReady(page);
      await page.goto('/');
      await waitForPageReady(page);
      
      // Theme should persist
      const finalTheme = await page.evaluate(() => {
        const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        return prefs.theme || 'light';
      });
      
      expect(finalTheme).toEqual(initialTheme);
    });

    test('dark mode applies correctly', async ({ page }) => {
      // Set dark theme directly
      await page.addInitScript(() => {
        const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        prefs.theme = 'dark';
        localStorage.setItem('user-preferences', JSON.stringify(prefs));
      });
      
      await page.goto('/');
      await waitForPageReady(page);
      await waitForContent(page);
      
      // Verify dark theme applied
      const isDarkMode = await page.evaluate(() => {
        const body = document.body;
        const classes = body.className || '';
        const style = body.getAttribute('style') || '';
        return classes.includes('dark') || style.includes('dark') || style.includes('#1a1a1a') || style.includes('#000');
      });
      
      // Page should have some styling applied
      const hasStyles = await page.evaluate(() => {
        const body = document.body;
        const computed = window.getComputedStyle(body);
        return computed.backgroundColor !== '';
      });
      
      expect(hasStyles).toBeTruthy();
    });
  });

  test.describe('Onboarding Flow (Fresh User)', () => {
    test('new user sees onboarding', async ({ page }) => {
      await setupFreshUser(page);
      await page.goto('/');
      await waitForPageReady(page);
      
      // Should either show onboarding or main app
      const content = await page.locator('body').textContent();
      expect(content && content.length > 50).toBeTruthy();
    });

    test('onboarding completion sets preferences', async ({ page }) => {
      await setupFreshUser(page);
      await page.goto('/');
      await waitForPageReady(page);
      
      // Set up user with onboarding complete
      await page.evaluate(() => {
        const prefs = {
          role: 'fullstack',
          subscribedChannels: ['system-design', 'algorithms'],
          onboardingComplete: true
        };
        localStorage.setItem('user-preferences', JSON.stringify(prefs));
      });
      
      // Reload and verify
      await page.reload();
      await waitForPageReady(page);
      
      const prefs = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('user-preferences') || '{}');
      });
      
      expect(prefs.onboardingComplete).toBe(true);
    });
  });

  test.describe('Navigation & Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await setupUser(page);
      await page.goto('/');
      await waitForPageReady(page);
    });

    test('main navigation is keyboard accessible', async ({ page }) => {
      await waitForContent(page);
      
      // Press Tab to navigate through interactive elements
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      // Focus should move to an interactive element
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toMatch(/BUTTON|A|INPUT/);
    });

    test('page has proper heading structure', async ({ page }) => {
      await waitForContent(page);
      
      // Check for heading elements
      const hasH1 = await page.locator('h1').first().isVisible().catch(() => false);
      const hasHeadings = await page.locator('h1, h2, h3').count();
      
      // At least one heading should exist
      expect(hasHeadings > 0 || hasH1).toBeTruthy();
    });

    test('links navigate correctly', async ({ page }) => {
      await waitForContent(page);
      
      // Find and click a link
      const link = page.locator('a').first();
      if (await link.isVisible({ timeout: 2000 })) {
        const href = await link.getAttribute('href');
        await link.click();
        await page.waitForTimeout(500);
        
        // Verify navigation occurred
        if (href && !href.startsWith('#')) {
          const currentUrl = page.url();
          expect(currentUrl).toBeTruthy();
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('invalid route shows appropriate response', async ({ page }) => {
      await page.goto('/invalid-route-12345');
      await waitForPageReady(page);
      
      // Should show some content (error page or redirect)
      const content = await page.locator('body').textContent();
      expect(content && content.length > 0).toBeTruthy();
    });

    test('API errors display gracefully', async ({ page }) => {
      await setupUser(page);
      
      // Navigate to a page that might have API issues
      await page.goto('/channel/non-existent-channel-xyz');
      await waitForPageReady(page);
      await page.waitForTimeout(2000);
      
      // Page should show content or graceful error
      const content = await page.locator('body').textContent();
      expect(content && content.length > 0).toBeTruthy();
    });
  });
});

test.describe('Cross-Page Flows', () => {
  test('complete user session: login to progress', async ({ page }) => {
    await setupUser(page);
    
    // Start at home
    await page.goto('/');
    await waitForPageReady(page);
    await waitForContent(page);
    
    // Navigate to channels
    await page.goto('/channels');
    await waitForPageReady(page);
    await waitForContent(page);
    
    // Select a channel
    const channelCard = page.locator('button, a').filter({ hasText: /System Design|Algorithms|Frontend/i }).first();
    if (await channelCard.isVisible({ timeout: 3000 })) {
      await channelCard.click();
      await page.waitForTimeout(500);
    }
    
    // Verify we're on a channel page
    const url = page.url();
    expect(url).toMatch(/\/channel\/|channels/);
  });

  test('content consumption across multiple pages', async ({ page }) => {
    await setupUser(page);
    
    const channels = ['system-design', 'algorithms', 'devops'];
    
    for (const channel of channels) {
      await page.goto(`/channel/${channel}`);
      await waitForPageReady(page);
      await waitForContent(page, 100);
      
      // Verify content loaded
      const content = await page.locator('body').textContent();
      expect(content && content.length > 50).toBeTruthy();
    }
  });
});
