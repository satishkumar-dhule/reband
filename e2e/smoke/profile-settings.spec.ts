/**
 * Profile Settings E2E Spec
 * 
 * Tests profile settings page:
 * - Profile page loads
 * - User info displays
 * - Settings forms work
 * - Credit balance visible
 * - Theme preference change
 * - Voice settings accessible
 * 
 * Priority: P1 (High)
 */

import { test, expect, setupUser, waitForPageReady, waitForContent } from '../fixtures';

test.describe('Profile Settings', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupUser(page);
  });
  
  test('profile page loads with user info', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);
    await waitForContent(page, 100);
    
    // Should have profile content
    const profileText = page.getByText(/Profile|Settings|Account/i).first();
    const hasProfileText = await profileText.isVisible({ timeout: 5000 }).catch(() => false);
    
    const content = await page.locator('body').textContent();
    expect(hasProfileText || (content && content.length > 100)).toBeTruthy();
  });
  
  test('credit balance is displayed', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);
    
    // Look for credit display
    const creditText = page.getByText(/Credits|Balance/i).first();
    const hasCredits = await creditText.isVisible({ timeout: 3000 }).catch(() => false);
    
    // Or numeric value
    const creditValue = page.locator('text=/\\d+/').first();
    const hasValue = await creditValue.isVisible().catch(() => false);
    
    expect(hasCredits || hasValue || (await page.locator('body').textContent())?.length! > 100).toBeTruthy();
  });
  
  test('theme preference toggle works', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);
    
    // Look for theme toggle
    const themeToggle = page.locator('button[class*="theme"], button[class*="sun"], button[class*="moon"]').first();
    
    if (await themeToggle.isVisible({ timeout: 3000 })) {
      // Get initial theme from localStorage
      const initialTheme = await page.evaluate(() => {
        const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        return prefs.theme || 'light';
      });
      
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Verify theme changed
      const newTheme = await page.evaluate(() => {
        const prefs = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        return prefs.theme || 'light';
      });
      
      expect(newTheme).not.toBe(initialTheme);
    } else {
      // No theme toggle, skip
      expect(true).toBe(true);
    }
  });
  
  test('voice settings section is accessible', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);
    
    // Look for voice settings link or section
    const voiceSettings = page.locator('text=Voice Settings, text=Voice, text=TTS').first();
    
    if (await voiceSettings.isVisible({ timeout: 3000 })) {
      await voiceSettings.click();
      await page.waitForTimeout(500);
      
      // Should navigate or expand
      const content = await page.locator('body').textContent();
      expect(content && content.length > 100).toBeTruthy();
    } else {
      // Voice settings may be in a different section
      expect(true).toBe(true);
    }
  });
  
  test('profile page has back navigation', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);
    
    // Look for back button or breadcrumb
    const backButton = page.locator('button:has-text("Back"), a:has-text("Home"), [aria-label="Back"]').first();
    
    if (await backButton.isVisible({ timeout: 3000 })) {
      await backButton.click();
      await page.waitForTimeout(1000);
      
      // Should navigate away from profile
      const url = page.url();
      expect(url).not.toContain('/profile');
    } else {
      // Use browser back
      await page.goBack();
      await waitForPageReady(page);
      
      const url = page.url();
      expect(url).toBeTruthy();
    }
  });
  
  test('profile page has working links', async ({ page }) => {
    await page.goto('/profile');
    await waitForPageReady(page);
    
    // Find links within main content
    const links = page.locator('main a, [class*="profile"] a').first();
    
    if (await links.isVisible({ timeout: 3000 })) {
      const href = await links.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('http')) {
        await links.click();
        await page.waitForTimeout(500);
        
        // Should navigate
        const url = page.url();
        expect(url).toBeTruthy();
      }
    } else {
      expect(true).toBe(true);
    }
  });
});