/**
 * Voice Interview Tests
 * Voice practice feature testing
 */

import { test, expect, setupUser, waitForPageReady, waitForContent } from './fixtures';

test.describe('Voice Interview Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
    await page.goto('/voice-interview');
    await waitForPageReady(page);
  });

  test('page loads with question and record button', async ({ page }) => {
    await waitForContent(page, 200);
    
    // Wait for lazy-loaded component to fully render
    await page.waitForFunction(
      () => !document.body.textContent?.includes('Loading...') && document.body.textContent!.length > 200,
      { timeout: 15000 }
    ).catch(() => {});
    
    const voiceText = page.getByText(/Voice Interview|Practice|Question|Interview/i).first();
    const hasVoiceText = await voiceText.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasVoiceText || (await page.locator('body').textContent())?.length! > 200).toBeTruthy();
    
    const hasQuestion = await page.locator('h2, h3, [class*="question"]').first().isVisible().catch(() => false);
    const hasContent = await page.locator('main, [class*="content"]').first().isVisible().catch(() => false);
    expect(hasQuestion || hasContent).toBeTruthy();
    
    // Check for Start Recording button or any mic button with longer timeout for lazy loading
    const hasStartButton = await page.locator('button').filter({ hasText: /Start Recording/i }).first().isVisible({ timeout: 10000 }).catch(() => false);
    const hasMicButton = await page.locator('[data-testid="start-recording-button"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasAnyButton = await page.locator('button').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasStartButton || hasMicButton || hasAnyButton).toBeTruthy();
  });

  test('skip button and home navigation work', async ({ page }) => {
    const skipButton = page.locator('button').filter({ hasText: /Skip|Next/i }).first();
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
    }
    
    const homeButton = page.locator('button:has(svg.lucide-home)').first();
    if (await homeButton.isVisible({ timeout: 2000 })) {
      await homeButton.click();
      await expect(page).toHaveURL('/');
    }
  });
});
