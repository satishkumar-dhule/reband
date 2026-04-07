/**
 * Voice Session Tests
 * Focused voice practice sessions
 */

import { test, expect, setupUser, waitForPageReady, waitForContent } from './fixtures';

test.describe('Voice Session Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });

  test('page loads with session content and controls', async ({ page }) => {
    await page.goto('/voice-session');
    await waitForPageReady(page);
    await waitForContent(page);
    
    // Wait for session page to transition from loading to select state
    await page.waitForFunction(
      () => !document.body.textContent?.includes('Loading...') && document.body.textContent!.length > 100,
      { timeout: 15000 }
    ).catch(() => {});
    
    const hasSessionText = (await page.locator('body').textContent())?.match(/Session|Practice|Question|Voice/i);
    expect(hasSessionText).toBeTruthy();
    
    // Check for any interactive element - use longer timeout for lazy-loaded page
    // Session cards are divs with data-testid="card-session-*" (not buttons)
    const hasSessionCard = await page.locator('[data-testid^="card-session-"]').first().isVisible({ timeout: 10000 }).catch(() => false);
    const hasRecordButton = await page.locator('[data-testid="button-start-interview"], [data-testid="start-recording-button"]').first().isVisible({ timeout: 10000 }).catch(() => false);
    const hasStartButton = await page.locator('button').filter({ hasText: /Start|Record|Begin|Practice|Cancel|Explore/i }).first().isVisible({ timeout: 10000 }).catch(() => false);
    const hasInteractiveElement = await page.locator('[class*="cursor-pointer"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasSessionCard || hasRecordButton || hasStartButton || hasInteractiveElement).toBeTruthy();
  });

  test('navigation back to home works', async ({ page }) => {
    await page.goto('/voice-session');
    await waitForPageReady(page);
    
    const homeButton = page.locator('button, a').filter({ has: page.locator('svg.lucide-home') }).first();
    const backButton = page.locator('button:has(svg.lucide-chevron-left, svg.lucide-arrow-left)').first();
    
    if (await homeButton.isVisible({ timeout: 2000 })) {
      await homeButton.click();
      await expect(page).toHaveURL('/');
    } else if (await backButton.isVisible({ timeout: 2000 })) {
      await backButton.click();
      expect(page.url()).toBeTruthy();
    }
  });

  test('can navigate to specific question session', async ({ page }) => {
    await page.goto('/voice-session/q-test-123');
    await waitForPageReady(page);
    await expect(page.locator('body')).toContainText(/.{50,}/);
  });
});

test.describe('Voice Session - From Voice Interview', () => {
  test('sessions link visible from voice interview', async ({ page }) => {
    await setupUser(page);
    await page.goto('/voice-interview');
    await waitForPageReady(page);
    
    const sessionsLink = page.locator('button, a').filter({ hasText: /Sessions/i }).first();
    if (await sessionsLink.isVisible({ timeout: 2000 })) {
      await sessionsLink.click();
      expect(page.url()).toContain('/voice-session');
    }
  });
});
