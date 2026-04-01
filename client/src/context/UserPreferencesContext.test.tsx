/**
 * Unit tests for UserPreferencesContext onboarding reset behavior
 * 
 * Tests the context's needsOnboarding flag and reset functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isAuthenticated } from '../components/ProtectedRoute';
import { PreferencesStorage, OnboardingStorage } from '../services/storage.service';

describe('UserPreferencesContext - Onboarding Reset', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('needsOnboarding flag behavior (via isAuthenticated)', () => {
    it('should show needsOnboarding=true when onboarding is incomplete', () => {
      // Default state - onboardingComplete is false
      expect(isAuthenticated()).toBe(false);
    });

    it('should show needsOnboarding=false when onboarding is complete', () => {
      PreferencesStorage.set({
        role: 'frontend',
        subscribedChannels: ['algorithms'],
        subscribedCertifications: [],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: true,
        prioritizeUnvisited: true,
      });

      expect(isAuthenticated()).toBe(true);
    });

    it('should update needsOnboarding after resetOnboarding', () => {
      PreferencesStorage.set({
        role: 'frontend',
        subscribedChannels: ['algorithms'],
        subscribedCertifications: [],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: true,
        prioritizeUnvisited: true,
      });

      expect(isAuthenticated()).toBe(true);

      OnboardingStorage.resetOnboarding();

      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('resetPreferences behavior', () => {
    it('should reset preferences to defaults when resetOnboarding is called', () => {
      PreferencesStorage.set({
        role: 'frontend',
        subscribedChannels: ['algorithms', 'frontend'],
        subscribedCertifications: [],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: false,
        prioritizeUnvisited: false,
      });

      OnboardingStorage.resetOnboarding();

      const prefs = PreferencesStorage.get();
      expect(prefs.onboardingComplete).toBe(false);
      expect(prefs.role).toBeNull();
      expect(prefs.subscribedChannels).toEqual([]);
    });

    it('should keep theme preference when resetting onboarding', () => {
      // First set preferences with onboarding complete
      PreferencesStorage.set({
        role: 'frontend',
        subscribedChannels: ['algorithms'],
        subscribedCertifications: [],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: true,
        prioritizeUnvisited: true,
      });

      // Set a theme preference separately (simulating user manually changing theme)
      localStorage.setItem('devprep-theme', 'dark');

      // Reset onboarding
      OnboardingStorage.resetOnboarding();

      // Theme should still be preserved
      expect(localStorage.getItem('devprep-theme')).toBe('dark');
    });
  });

  describe('Complete onboarding → clear localStorage manually', () => {
    it('should show needsOnboarding=true after manual localStorage clear', () => {
      PreferencesStorage.set({
        role: 'frontend',
        subscribedChannels: ['algorithms'],
        subscribedCertifications: [],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: true,
        prioritizeUnvisited: true,
      });

      localStorage.clear();

      expect(isAuthenticated()).toBe(false);
    });

    it('should reset preferences after manual localStorage clear', () => {
      PreferencesStorage.set({
        role: 'frontend',
        subscribedChannels: ['algorithms'],
        subscribedCertifications: [],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: true,
        prioritizeUnvisited: true,
      });

      localStorage.clear();

      const prefs = PreferencesStorage.get();
      expect(prefs.onboardingComplete).toBe(false);
      expect(prefs.role).toBeNull();
    });
  });

  describe('Complete onboarding → remove only user-preferences key', () => {
    it('should show needsOnboarding=true after removing user-preferences', () => {
      PreferencesStorage.set({
        role: 'frontend',
        subscribedChannels: ['algorithms'],
        subscribedCertifications: [],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: true,
        prioritizeUnvisited: true,
      });

      localStorage.removeItem('user-preferences');

      expect(isAuthenticated()).toBe(false);
    });

    it('should reset to defaults after removing user-preferences', () => {
      PreferencesStorage.set({
        role: 'frontend',
        subscribedChannels: ['algorithms'],
        subscribedCertifications: [],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: true,
        prioritizeUnvisited: true,
      });

      localStorage.removeItem('user-preferences');

      const prefs = PreferencesStorage.get();
      expect(prefs.role).toBeNull();
      expect(prefs.subscribedChannels).toEqual([]);
      expect(prefs.onboardingComplete).toBe(false);
    });
  });
});
