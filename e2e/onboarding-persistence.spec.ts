/**
 * Onboarding Persistence Integration Tests
 * 
 * Tests the complete onboarding flow and verifies persistence:
 * - Full onboarding flow completion
 * - Persistence after completing onboarding
 * - Returning user skips onboarding
 * - Browser storage cleared scenarios
 * 
 * Priority: P0 (Critical)
 */

import { test, expect, Page } from '@playwright/test';

// Helper: Set up fresh user (no onboarding) - uses addInitScript
async function setupFreshUser(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('user-preferences');
    localStorage.removeItem('onboarding-complete');
    localStorage.removeItem('onboarding-role');
    localStorage.removeItem('onboarding-channels');
    localStorage.removeItem('marvel-intro-seen');
  });
}

// Helper: Set user preferences via init script
async function setPreferences(page: Page, prefs: any) {
  await page.addInitScript((p) => {
    localStorage.setItem('user-preferences', JSON.stringify(p));
  }, prefs);
}

// Helper: Wait for page to be ready
async function waitForPageReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
}

// Helper: Wait for onboarding page to load
async function waitForOnboardingPage(page: Page) {
  await waitForPageReady(page);
  await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
}

// Helper: Get user preferences from localStorage
async function getPreferences(page: Page): Promise<any> {
  return await page.evaluate(() => {
    const prefs = localStorage.getItem('user-preferences');
    return prefs ? JSON.parse(prefs) : null;
  });
}

test.describe('Onboarding Persistence', () => {
  
  test('complete onboarding flow navigates to channels', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await waitForOnboardingPage(page);
    
    // Verify we're on onboarding page
    await expect(page.locator('h1')).toContainText('Welcome');
    
    // Step 1 -> 2
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);
    
    // Step 2: Select role
    await expect(page.locator('text=Choose Your Career Path')).toBeVisible();
    await page.click('button:has-text("Frontend Developer")');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);
    
    // Step 3: Select channel
    await expect(page.locator('text=Select Focus Areas')).toBeVisible();
    const reactBtn = page.locator('button').filter({ hasText: 'React' }).first();
    if (await reactBtn.isVisible().catch(() => false)) {
      await reactBtn.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);
    
    // Step 4: Complete
    await expect(page.locator("text=You're all set!")).toBeVisible();
    await page.click('button:has-text("Start Your Journey")');
    await page.waitForTimeout(1000);
    
    // Should navigate away from onboarding
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/onboarding');
  });

  test('persists onboardingComplete after completion', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await waitForOnboardingPage(page);
    
    // Complete onboarding quickly
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Frontend Developer")');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    const reactBtn = page.locator('button').filter({ hasText: 'React' }).first();
    if (await reactBtn.isVisible().catch(() => false)) {
      await reactBtn.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    // Complete the flow
    await page.click('button:has-text("Start Your Journey")');
    await page.waitForURL('**/channels**', { timeout: 5000 }).catch(() => {});
    await waitForPageReady(page);
    
    // Now check localStorage after navigation
    const prefsAfter = await getPreferences(page);
    
    // Verify onboarding was completed
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/onboarding');
    expect(prefsAfter?.onboardingComplete).toBe(true);
  });

  test('returning user skips onboarding when complete', async ({ page }) => {
    // Set up user with onboarding already complete
    await setPreferences(page, {
      role: 'fullstack',
      subscribedChannels: ['system-design'],
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    });
    
    await page.goto('/');
    await waitForPageReady(page);
    await page.waitForTimeout(1000);
    
    // Should NOT redirect to onboarding
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/onboarding');
  });

  test('shows onboarding when not complete', async ({ page }) => {
    // Set up user with onboarding NOT complete
    await setPreferences(page, {
      role: '',
      subscribedChannels: [],
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
    });
    
    await page.goto('/');
    await waitForPageReady(page);
    await page.waitForTimeout(1500);
    
    // Should redirect to onboarding
    const currentUrl = page.url();
    expect(currentUrl).toContain('/onboarding');
  });

  test('new user sees onboarding after storage cleared', async ({ page }) => {
    // First simulate returning user
    await setPreferences(page, {
      role: 'fullstack',
      subscribedChannels: ['system-design'],
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    });
    
    await page.goto('/');
    await waitForPageReady(page);
    await page.waitForTimeout(1000);
    
    let urlBefore = page.url();
    expect(urlBefore).not.toContain('/onboarding');
    
    // Clear storage
    await page.addInitScript(() => {
      localStorage.clear();
    });
    
    // Reload
    await page.reload();
    await waitForPageReady(page);
    await page.waitForTimeout(1500);
    
    // Should now go to onboarding
    const urlAfter = page.url();
    expect(urlAfter).toContain('/onboarding');
  });

  test('skip button completes onboarding', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await waitForOnboardingPage(page);
    
    // Click Skip - this navigates to home page
    await page.click('button:has-text("Skip for now")');
    
    // Wait for navigation - might take a moment
    await page.waitForTimeout(2000);
    
    // Should navigate away from onboarding (to home page)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/onboarding');
  });

  test('requires role selection to proceed from step 2', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await waitForOnboardingPage(page);
    
    // Step 1 -> 2
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);
    
    // Continue button should be disabled when no role selected
    // Try clicking it anyway - it should not work
    const continueBtn = page.locator('button:has-text("Continue")');
    await expect(continueBtn).toBeVisible();
    
    // The button is disabled, so we can't click it. Let's verify the error appears
    // by first selecting a role then going back and trying to continue without selection
    await page.click('button:has-text("Frontend Developer")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    // Now go back
    await page.click('button:has-text("Back")');
    await page.waitForTimeout(300);
    
    // Now try to continue without selecting a role
    await continueBtn.click({ force: true });
    await page.waitForTimeout(500);
    
    // Should show error message
    await expect(page.locator('text=Please select a career path')).toBeVisible();
  });

  test('persists data across page navigation', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await waitForOnboardingPage(page);
    
    // Complete onboarding
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Frontend Developer")');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    const reactBtn = page.locator('button').filter({ hasText: 'React' }).first();
    if (await reactBtn.isVisible().catch(() => false)) {
      await reactBtn.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Start Your Journey")');
    await page.waitForURL('**/channels**', { timeout: 5000 }).catch(() => {});
    
    // Navigate around
    await page.goto('/');
    await waitForPageReady(page);
    await page.waitForTimeout(500);
    
    // Go to channels again
    await page.goto('/channels');
    await waitForPageReady(page);
    
    // Should not redirect to onboarding
    const currentUrl = page.url();
    expect(currentUrl).toContain('/channels');
  });

  // ========================================
  // Cross-Page Persistence Tests (Task)
  // ========================================

  test('Complete onboarding → visit /channels → role should be available', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await waitForOnboardingPage(page);
    
    // Complete onboarding with Frontend Developer role
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Frontend Developer")');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    const reactBtn = page.locator('button').filter({ hasText: 'React' }).first();
    if (await reactBtn.isVisible().catch(() => false)) {
      await reactBtn.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Start Your Journey")');
    await page.waitForURL('**/channels**', { timeout: 5000 }).catch(() => {});
    
    // Navigate to /channels
    await page.goto('/channels');
    await waitForPageReady(page);
    await page.waitForTimeout(500);
    
    // Verify role is available in localStorage
    const prefs = await getPreferences(page);
    expect(prefs?.role).toBe('frontend');
    expect(prefs?.onboardingComplete).toBe(true);
  });

  test('Complete onboarding → visit /certifications → channels should be subscribed', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await waitForOnboardingPage(page);
    
    // Complete onboarding
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Frontend Developer")');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    const reactBtn = page.locator('button').filter({ hasText: 'React' }).first();
    if (await reactBtn.isVisible().catch(() => false)) {
      await reactBtn.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Start Your Journey")');
    await page.waitForURL('**/channels**', { timeout: 5000 }).catch(() => {});
    
    // Navigate to /certifications
    await page.goto('/certifications');
    await waitForPageReady(page);
    await page.waitForTimeout(500);
    
    // Verify subscribedChannels is populated from onboarding
    const prefs = await getPreferences(page);
    expect(prefs?.subscribedChannels).toBeDefined();
    expect(Array.isArray(prefs?.subscribedChannels)).toBe(true);
    expect(prefs?.subscribedChannels.length).toBeGreaterThan(0);
  });

  test('Complete onboarding → visit /profile → preferences should show', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await waitForOnboardingPage(page);
    
    // Complete onboarding
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Frontend Developer")');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    const reactBtn = page.locator('button').filter({ hasText: 'React' }).first();
    if (await reactBtn.isVisible().catch(() => false)) {
      await reactBtn.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Start Your Journey")');
    await page.waitForURL('**/channels**', { timeout: 5000 }).catch(() => {});
    
    // Navigate to /profile
    await page.goto('/profile');
    await waitForPageReady(page);
    await page.waitForTimeout(500);
    
    // Verify preferences are accessible on profile page
    const prefs = await getPreferences(page);
    expect(prefs?.role).toBe('frontend');
    expect(prefs?.onboardingComplete).toBe(true);
    expect(prefs?.shuffleQuestions).toBeDefined();
    expect(prefs?.prioritizeUnvisited).toBeDefined();
  });

  test('Complete onboarding → visit /voice → should use same preferences', async ({ page }) => {
    await setupFreshUser(page);
    await page.goto('/onboarding');
    await waitForOnboardingPage(page);
    
    // Complete onboarding
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Frontend Developer")');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    const reactBtn = page.locator('button').filter({ hasText: 'React' }).first();
    if (await reactBtn.isVisible().catch(() => false)) {
      await reactBtn.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Start Your Journey")');
    await page.waitForURL('**/channels**', { timeout: 5000 }).catch(() => {});
    
    // Navigate to /voice
    await page.goto('/voice');
    await waitForPageReady(page);
    await page.waitForTimeout(1000);
    
    // Verify voice page uses same preferences
    const prefs = await getPreferences(page);
    expect(prefs?.subscribedChannels).toBeDefined();
    expect(prefs?.subscribedChannels.length).toBeGreaterThan(0);
    
    // Voice page should load questions from subscribed channels
    // Check that questions are loading (indicates context is working)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/voice');
  });
});
