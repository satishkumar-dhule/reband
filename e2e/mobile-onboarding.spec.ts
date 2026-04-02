/**
 * Mobile Onboarding Tests
 * Test cases: responsive on mobile, localStorage, touch interactions, no horizontal scroll
 */

import { test, expect, Page } from '@playwright/test';

// Test multiple mobile viewport sizes (320px - 768px)
const mobileViewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'Small Android', width: 360, height: 640 },
  { name: 'Large Phone', width: 414, height: 896 },
  { name: 'Small Tablet', width: 768, height: 1024 },
];

// Setup fresh user (no prior onboarding)
async function setupFreshUser(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('marvel-intro-seen', 'true');
  });
}

test.describe('Mobile Onboarding - Responsive', () => {
  for (const viewport of mobileViewports) {
    test(`${viewport.name} (${viewport.width}x${viewport.height}) - no horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await setupFreshUser(page);
      
      await page.goto('/onboarding');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for React to render
      await page.waitForSelector('button', { timeout: 10000 });
      
      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;
        return scrollWidth > clientWidth;
      });
      
      expect(hasOverflow).toBe(false);
      
      // Verify content is visible and not cut off
      const welcomeText = page.locator('text=Welcome to DevPrep');
      await expect(welcomeText).toBeVisible();
    });
  }
});

test.describe('Mobile Onboarding - Touch Interactions', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  
  test.beforeEach(async ({ page }) => {
    await setupFreshUser(page);
  });

  test('can tap Continue button on step 1', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Tap Continue to move to step 2
    const continueBtn = page.locator('button').filter({ hasText: 'Continue' });
    await expect(continueBtn).toBeVisible();
    await continueBtn.tap();
    await page.waitForTimeout(500);
    
    // Should be on step 2 now - role selection
    await expect(page.locator('text=Choose Your Career Path')).toBeVisible();
  });

  test('can select a role via tap', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Move to step 2
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    
    // Select Frontend Developer role
    const roleButton = page.locator('button').filter({ hasText: 'Frontend Developer' });
    await expect(roleButton).toBeVisible();
    await roleButton.tap();
    await page.waitForTimeout(300);
    
    // Should show SELECTED indicator
    await expect(page.locator('text=SELECTED')).toBeVisible();
  });

  test('can navigate back via touch', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Move to step 2
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    
    // Tap Back button
    const backBtn = page.locator('button').filter({ hasText: 'Back' });
    await expect(backBtn).toBeVisible();
    await backBtn.tap();
    await page.waitForTimeout(500);
    
    // Should be back on step 1
    await expect(page.locator('text=Welcome to DevPrep')).toBeVisible();
  });

  test('can complete onboarding flow via touch', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Step 1 -> Step 2
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    
    // Select a role
    await page.locator('button').filter({ hasText: 'Frontend Developer' }).tap();
    await page.waitForTimeout(300);
    
    // Step 2 -> Step 3
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    
    // Select at least one channel
    const channelButton = page.locator('button').filter({ hasText: /React|JavaScript/i }).first();
    if (await channelButton.isVisible()) {
      await channelButton.tap();
      await page.waitForTimeout(300);
    }
    
    // Step 3 -> Step 4
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    
    // Should see completion screen
    await expect(page.locator("text=You're all set!")).toBeVisible();
    
    // Complete onboarding
    await page.locator('button').filter({ hasText: 'Start Your Journey' }).tap();
    await page.waitForTimeout(1000);
    
    // Should navigate away from onboarding
    expect(page.url()).not.toContain('/onboarding');
  });
});

test.describe('Mobile Onboarding - localStorage Persistence', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  
  test('selected role persists in localStorage', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Move to step 2 and select a role
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: 'Frontend Developer' }).tap();
    await page.waitForTimeout(300);
    
    // Navigate back to step 1
    await page.locator('button').filter({ hasText: 'Back' }).tap();
    await page.waitForTimeout(500);
    
    // Go forward again to step 2
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    
    // Role should still be selected (persisted in localStorage)
    await expect(page.locator('text=SELECTED')).toBeVisible();
    
    // Verify localStorage directly
    const roleStored = await page.evaluate(() => {
      const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
      return prefs.role;
    });
    expect(roleStored).toBe('frontend');
  });

  test('selected channels persist in localStorage', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Move to step 2
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: 'Frontend Developer' }).tap();
    await page.waitForTimeout(300);
    
    // Move to step 3
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    
    // Select a channel
    const channelButton = page.locator('button').filter({ hasText: /React/i }).first();
    if (await channelButton.isVisible()) {
      await channelButton.tap();
      await page.waitForTimeout(300);
    }
    
    // Go back to step 2
    await page.locator('button').filter({ hasText: 'Back' }).tap();
    await page.waitForTimeout(500);
    
    // Go forward to step 3 again
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    
    // Channel should still be selected
    const checkIcon = channelButton.locator('svg');
    await expect(checkIcon).toBeVisible();
    
    // Verify localStorage
    const channelsStored = await page.evaluate(() => {
      const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
      return prefs.subscribedChannels;
    });
    expect(channelsStored).toContain('react');
  });

  test('onboarding complete flag is set in localStorage', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Complete full onboarding flow
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: 'Frontend Developer' }).tap();
    await page.waitForTimeout(300);
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    
    const channelButton = page.locator('button').filter({ hasText: /React/i }).first();
    if (await channelButton.isVisible()) {
      await channelButton.tap();
      await page.waitForTimeout(300);
    }
    
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: 'Start Your Journey' }).tap();
    await page.waitForTimeout(1000);
    
    // Verify onboardingComplete is set
    const onboardingComplete = await page.evaluate(() => {
      const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
      return prefs.onboardingComplete;
    });
    expect(onboardingComplete).toBe(true);
  });
});

test.describe('Mobile Onboarding - UI Elements', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  
  test.beforeEach(async ({ page }) => {
    await setupFreshUser(page);
  });

  test('progress indicator is visible on mobile', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Progress indicator should have 4 steps
    const progressSteps = page.locator('[class*="rounded-full"]');
    await expect(progressSteps).toHaveCount(4);
  });

  test('buttons meet minimum touch target size', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Check main action buttons
    const continueBtn = page.locator('button').filter({ hasText: 'Continue' });
    const box = await continueBtn.boundingBox();
    
    // Minimum touch target should be at least 30x30 (Apple HIG recommends 44x44)
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(30);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(30);
  });

  test('validation errors display correctly', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Try to continue without selecting a role
    await page.locator('button').filter({ hasText: 'Continue' }).tap();
    await page.waitForTimeout(500);
    
    // Should show validation error for role selection
    await expect(page.locator('text=Please select a career path')).toBeVisible();
  });

  test('skip button works on step 1', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Tap Skip for now
    const skipBtn = page.locator('button').filter({ hasText: 'Skip for now' });
    await expect(skipBtn).toBeVisible();
    await skipBtn.tap();
    await page.waitForTimeout(500);
    
    // Should navigate to home
    expect(page.url()).toBe('/');
  });
});
