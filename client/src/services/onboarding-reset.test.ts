/**
 * Unit tests for onboarding reset/clear functionality
 * 
 * Test Cases:
 * 1. Complete onboarding → call resetOnboarding() → state should clear
 * 2. Complete onboarding → clear localStorage manually → state should reset
 * 3. Complete onboarding → remove only user-preferences key → should reset
 * 4. Reset → refresh → should redirect to onboarding
 * 
 * Uses jsdom's localStorage implementation provided by vitest environment.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PreferencesStorage, OnboardingStorage } from './storage.service';
import { STORAGE_KEYS } from '../lib/constants';

describe('Onboarding Reset Functionality', () => {
  const completePreferences = {
    role: 'frontend',
    subscribedChannels: ['algorithms', 'frontend', 'system-design'],
    subscribedCertifications: [],
    onboardingComplete: true,
    createdAt: '2024-01-15T10:30:00.000Z',
    shuffleQuestions: true,
    prioritizeUnvisited: true,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Test Case 1: Complete onboarding → call resetOnboarding() → state should clear', () => {
    it('should reset onboardingComplete to false after resetOnboarding()', () => {
      PreferencesStorage.set(completePreferences);
      
      expect(OnboardingStorage.isOnboardingComplete()).toBe(true);
      
      OnboardingStorage.resetOnboarding();
      
      expect(OnboardingStorage.isOnboardingComplete()).toBe(false);
    });

    it('should reset role to null after resetOnboarding()', () => {
      PreferencesStorage.set(completePreferences);
      
      OnboardingStorage.resetOnboarding();
      
      expect(OnboardingStorage.getRole()).toBeNull();
    });

    it('should reset subscribedChannels to empty array after resetOnboarding()', () => {
      PreferencesStorage.set(completePreferences);
      
      OnboardingStorage.resetOnboarding();
      
      expect(OnboardingStorage.getSubscribedChannels()).toEqual([]);
    });

    it('should remove legacy onboarding keys after resetOnboarding()', () => {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_ROLE, 'frontend');
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_CHANNELS, JSON.stringify(['algorithms']));
      
      OnboardingStorage.resetOnboarding();
      
      expect(localStorage.getItem(STORAGE_KEYS.ONBOARDING_ROLE)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.ONBOARDING_CHANNELS)).toBeNull();
    });
  });

  describe('Test Case 2: Complete onboarding → clear localStorage manually → state should reset', () => {
    it('should reset state when entire localStorage is cleared', () => {
      PreferencesStorage.set(completePreferences);
      
      expect(OnboardingStorage.isOnboardingComplete()).toBe(true);
      
      localStorage.clear();
      
      const prefs = PreferencesStorage.get();
      expect(prefs.onboardingComplete).toBe(false);
      expect(prefs.role).toBeNull();
      expect(prefs.subscribedChannels).toEqual([]);
    });

    it('should return to default preferences after localStorage clear', () => {
      PreferencesStorage.set(completePreferences);
      
      localStorage.clear();
      
      const prefs = PreferencesStorage.get();
      expect(prefs).toMatchObject({
        role: null,
        subscribedChannels: [],
        onboardingComplete: false,
      });
    });
  });

  describe('Test Case 3: Complete onboarding → remove only user-preferences key → should reset', () => {
    it('should reset state when user-preferences key is removed', () => {
      PreferencesStorage.set(completePreferences);
      
      expect(OnboardingStorage.isOnboardingComplete()).toBe(true);
      
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
      
      const prefs = PreferencesStorage.get();
      expect(prefs.onboardingComplete).toBe(false);
      expect(prefs.role).toBeNull();
      expect(prefs.subscribedChannels).toEqual([]);
    });

    it('should show onboarding as incomplete after removing user-preferences', () => {
      PreferencesStorage.set(completePreferences);
      
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
      
      expect(OnboardingStorage.isOnboardingComplete()).toBe(false);
      expect(OnboardingStorage.hasStarted()).toBe(false);
    });

    it('should preserve other localStorage keys when only removing user-preferences', () => {
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(completePreferences));
      
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
      
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('dark');
    });
  });

  describe('Test Case 4: Reset → refresh → should redirect to onboarding (needsOnboarding = true)', () => {
    it('should show needsOnboarding as true after reset', () => {
      PreferencesStorage.set(completePreferences);
      
      OnboardingStorage.resetOnboarding();
      
      const prefs = PreferencesStorage.get();
      expect(prefs.onboardingComplete).toBe(false);
    });

    it('should return to onboarding state after PreferencesStorage.reset()', () => {
      PreferencesStorage.set(completePreferences);
      
      PreferencesStorage.reset();
      
      const prefs = PreferencesStorage.get();
      expect(prefs.onboardingComplete).toBe(false);
      expect(prefs.role).toBeNull();
    });

    it('should not retain any onboarding data after full reset', () => {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_ROLE, 'frontend');
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_CHANNELS, JSON.stringify(['algorithms']));
      PreferencesStorage.set(completePreferences);
      
      OnboardingStorage.resetOnboarding();
      
      const prefs = PreferencesStorage.get();
      expect(prefs.onboardingComplete).toBe(false);
      expect(prefs.role).toBeNull();
      expect(prefs.subscribedChannels).toEqual([]);
      expect(OnboardingStorage.hasStarted()).toBe(false);
    });
  });

  describe('Additional: Context behavior simulation', () => {
    it('should simulate needsOnboarding flag behavior', () => {
      PreferencesStorage.set(completePreferences);
      
      let needsOnboarding = !PreferencesStorage.get().onboardingComplete;
      expect(needsOnboarding).toBe(false);
      
      OnboardingStorage.resetOnboarding();
      
      needsOnboarding = !PreferencesStorage.get().onboardingComplete;
      expect(needsOnboarding).toBe(true);
    });

    it('should properly sync between OnboardingStorage and PreferencesStorage', () => {
      OnboardingStorage.completeOnboarding();
      expect(OnboardingStorage.isOnboardingComplete()).toBe(true);
      
      OnboardingStorage.resetOnboarding();
      expect(OnboardingStorage.isOnboardingComplete()).toBe(false);
      
      const prefs = PreferencesStorage.get();
      expect(prefs.onboardingComplete).toBe(false);
    });
  });
});
