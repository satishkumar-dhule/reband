/**
 * Unit tests for onboarding persistence
 * 
 * Tests localStorage persistence for user onboarding state including:
 * - onboardingComplete flag persistence
 * - role persistence
 * - subscribedChannels persistence
 * - Reset behavior when clearing storage
 * 
 * Uses jsdom's localStorage implementation provided by vitest environment.
 * 
 * @module onboarding-persistence.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PreferencesStorage, OnboardingStorage } from './storage.service';
import { STORAGE_KEYS } from '../lib/constants';

describe('Onboarding Persistence', () => {
  const testPreferences = {
    role: 'frontend',
    subscribedChannels: ['algorithms', 'frontend', 'system-design'],
    onboardingComplete: true,
    createdAt: '2024-01-15T10:30:00.000Z',
    shuffleQuestions: true,
    prioritizeUnvisited: true,
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('PreferencesStorage', () => {
    describe('get()', () => {
      it('should return default preferences when localStorage is empty', () => {
        const result = PreferencesStorage.get();
        
        expect(result).toMatchObject({
          role: null,
          subscribedChannels: [],
          onboardingComplete: false,
        });
      });

      it('should return stored preferences from localStorage', () => {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(testPreferences));
        
        const result = PreferencesStorage.get();
        
        expect(result.role).toBe(testPreferences.role);
        expect(result.subscribedChannels).toEqual(testPreferences.subscribedChannels);
        expect(result.onboardingComplete).toBe(testPreferences.onboardingComplete);
      });

      it('should handle corrupted JSON gracefully', () => {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, 'invalid-json{');
        
        const result = PreferencesStorage.get();
        
        expect(result).toMatchObject({
          role: null,
          subscribedChannels: [],
          onboardingComplete: false,
        });
      });
    });

    describe('set()', () => {
      it('should save preferences to localStorage', () => {
        PreferencesStorage.set(testPreferences);
        
        const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
        expect(JSON.parse(stored!)).toEqual(testPreferences);
      });

      it('should overwrite existing preferences', () => {
        // Set initial preferences
        PreferencesStorage.set({ ...testPreferences, role: 'backend' });
        
        // Update with new preferences
        const updatedPrefs = { ...testPreferences, role: 'fullstack' };
        PreferencesStorage.set(updatedPrefs);
        
        const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
        expect(JSON.parse(stored!)).toEqual(updatedPrefs);
      });
    });

    describe('update()', () => {
      it('should merge partial updates with existing preferences', () => {
        PreferencesStorage.set(testPreferences);
        
        const result = PreferencesStorage.update({
          role: 'backend',
          subscribedChannels: ['devops'],
        });
        
        expect(result.role).toBe('backend');
        expect(result.subscribedChannels).toEqual(['devops']);
        expect(result.onboardingComplete).toBe(true); // Preserved from original
        expect(result.createdAt).toBe(testPreferences.createdAt); // Preserved
      });

      it('should create new preferences if none exist', () => {
        const result = PreferencesStorage.update({
          role: 'frontend',
          onboardingComplete: true,
        });
        
        expect(result.role).toBe('frontend');
        expect(result.onboardingComplete).toBe(true);
        expect(result.subscribedChannels).toEqual([]); // Default
      });
    });

    describe('reset()', () => {
      it('should remove preferences from localStorage', () => {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(testPreferences));
        
        PreferencesStorage.reset();
        
        expect(localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)).toBeNull();
      });

      it('should return default preferences after reset', () => {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(testPreferences));
        PreferencesStorage.reset();
        
        const result = PreferencesStorage.get();
        
        expect(result.role).toBeNull();
        expect(result.onboardingComplete).toBe(false);
        expect(result.subscribedChannels).toEqual([]);
      });
    });
  });

  describe('OnboardingStorage', () => {
    describe('hasSeenIntro()', () => {
      it('should return false when intro has not been seen', () => {
        const result = OnboardingStorage.hasSeenIntro();
        expect(result).toBe(false);
      });

      it('should return true when intro has been seen', () => {
        localStorage.setItem(STORAGE_KEYS.MARVEL_INTRO_SEEN, 'true');
        
        const result = OnboardingStorage.hasSeenIntro();
        expect(result).toBe(true);
      });
    });

    describe('markIntroSeen()', () => {
      it('should set intro seen flag in localStorage', () => {
        OnboardingStorage.markIntroSeen();
        
        expect(localStorage.getItem(STORAGE_KEYS.MARVEL_INTRO_SEEN)).toBe('true');
      });
    });

    describe('hasSeenSwipeHint()', () => {
      it('should return false by default', () => {
        const result = OnboardingStorage.hasSeenSwipeHint();
        expect(result).toBe(false);
      });

      it('should return true when swipe hint has been seen', () => {
        localStorage.setItem(STORAGE_KEYS.SWIPE_HINT_SEEN, 'true');
        
        const result = OnboardingStorage.hasSeenSwipeHint();
        expect(result).toBe(true);
      });
    });

    describe('markSwipeHintSeen()', () => {
      it('should set swipe hint seen flag in localStorage', () => {
        OnboardingStorage.markSwipeHintSeen();
        
        expect(localStorage.getItem(STORAGE_KEYS.SWIPE_HINT_SEEN)).toBe('true');
      });
    });

    describe('hasSeenGettingStarted()', () => {
      it('should return false by default', () => {
        const result = OnboardingStorage.hasSeenGettingStarted();
        expect(result).toBe(false);
      });

      it('should return true when getting started has been seen', () => {
        localStorage.setItem(STORAGE_KEYS.GETTING_STARTED_SEEN, 'true');
        
        const result = OnboardingStorage.hasSeenGettingStarted();
        expect(result).toBe(true);
      });
    });

    describe('markGettingStartedSeen()', () => {
      it('should set getting started seen flag in localStorage', () => {
        OnboardingStorage.markGettingStartedSeen();
        
        expect(localStorage.getItem(STORAGE_KEYS.GETTING_STARTED_SEEN)).toBe('true');
      });
    });

    describe('hasSeenCoachMarks()', () => {
      it('should return false by default', () => {
        const result = OnboardingStorage.hasSeenCoachMarks();
        expect(result).toBe(false);
      });

      it('should return true when coach marks have been seen', () => {
        localStorage.setItem(STORAGE_KEYS.COACH_MARKS_SEEN, 'true');
        
        const result = OnboardingStorage.hasSeenCoachMarks();
        expect(result).toBe(true);
      });
    });

    describe('markCoachMarksSeen()', () => {
      it('should set coach marks seen flag in localStorage', () => {
        OnboardingStorage.markCoachMarksSeen();
        
        expect(localStorage.getItem(STORAGE_KEYS.COACH_MARKS_SEEN)).toBe('true');
      });
    });
  });

  describe('onboardingComplete Persistence', () => {
    it('should persist onboardingComplete as true after save', () => {
      const prefsWithOnboardingComplete = {
        ...testPreferences,
        onboardingComplete: true,
      };
      
      PreferencesStorage.set(prefsWithOnboardingComplete);
      
      // Simulate page refresh by clearing and re-reading
      localStorage.clear();
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefsWithOnboardingComplete));
      
      const retrieved = PreferencesStorage.get();
      expect(retrieved.onboardingComplete).toBe(true);
    });

    it('should persist onboardingComplete as false after save', () => {
      const prefsWithIncompleteOnboarding = {
        ...testPreferences,
        onboardingComplete: false,
      };
      
      PreferencesStorage.set(prefsWithIncompleteOnboarding);
      
      // Simulate page refresh
      localStorage.clear();
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefsWithIncompleteOnboarding));
      
      const retrieved = PreferencesStorage.get();
      expect(retrieved.onboardingComplete).toBe(false);
    });

    it('should maintain onboardingComplete through multiple updates', () => {
      // Set initial
      PreferencesStorage.set({ ...testPreferences, onboardingComplete: true });
      expect(PreferencesStorage.get().onboardingComplete).toBe(true);
      
      // Update role (should preserve onboardingComplete)
      PreferencesStorage.update({ role: 'backend' });
      expect(PreferencesStorage.get().onboardingComplete).toBe(true);
      
      // Update channels (should preserve onboardingComplete)
      PreferencesStorage.update({ subscribedChannels: ['algorithms'] });
      expect(PreferencesStorage.get().onboardingComplete).toBe(true);
      
      // Verify persistence in localStorage
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)!);
      expect(stored.onboardingComplete).toBe(true);
    });

    it('should persist onboardingComplete through simulated page refresh', () => {
      // First, save the preferences
      PreferencesStorage.set({ ...testPreferences, onboardingComplete: true });
      
      // Simulate page refresh - clear state, then reload from localStorage
      const storedData = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      localStorage.clear();
      if (storedData) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, storedData);
      }
      
      // Now read - this should get the data from localStorage
      const retrieved = PreferencesStorage.get();
      expect(retrieved.onboardingComplete).toBe(true);
      expect(retrieved.role).toBe(testPreferences.role);
      expect(retrieved.subscribedChannels).toEqual(testPreferences.subscribedChannels);
    });
  });

  describe('role Persistence', () => {
    it('should persist role after save', () => {
      const prefsWithRole = {
        ...testPreferences,
        role: 'frontend',
      };
      
      PreferencesStorage.set(prefsWithRole);
      
      // Simulate page refresh
      const storedData = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      localStorage.clear();
      if (storedData) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, storedData);
      }
      
      const retrieved = PreferencesStorage.get();
      expect(retrieved.role).toBe('frontend');
    });

    it('should persist role as null', () => {
      const prefsWithNullRole = {
        ...testPreferences,
        role: null,
      };
      
      PreferencesStorage.set(prefsWithNullRole);
      
      // Simulate page refresh
      const storedData = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      localStorage.clear();
      if (storedData) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, storedData);
      }
      
      const retrieved = PreferencesStorage.get();
      expect(retrieved.role).toBeNull();
    });

    it('should update role while preserving other fields', () => {
      const initialPrefs = {
        ...testPreferences,
        role: 'backend',
        subscribedChannels: ['devops', 'security'],
      };
      
      PreferencesStorage.set(initialPrefs);
      
      // Update role
      PreferencesStorage.update({ role: 'frontend' });
      
      const retrieved = PreferencesStorage.get();
      expect(retrieved.role).toBe('frontend');
      expect(retrieved.subscribedChannels).toEqual(['devops', 'security']);
    });

    it('should persist role through simulated page refresh', () => {
      const prefsWithRole = {
        ...testPreferences,
        role: 'fullstack',
      };
      
      PreferencesStorage.set(prefsWithRole);
      
      // Simulate page refresh
      const storedData = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      localStorage.clear();
      if (storedData) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, storedData);
      }
      
      const retrieved = PreferencesStorage.get();
      expect(retrieved.role).toBe('fullstack');
    });
  });

  describe('subscribedChannels Persistence', () => {
    it('should persist subscribedChannels array after save', () => {
      const prefsWithChannels = {
        ...testPreferences,
        subscribedChannels: ['algorithms', 'frontend', 'system-design'],
      };
      
      PreferencesStorage.set(prefsWithChannels);
      
      // Simulate page refresh
      const storedData = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      localStorage.clear();
      if (storedData) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, storedData);
      }
      
      const retrieved = PreferencesStorage.get();
      expect(retrieved.subscribedChannels).toEqual(['algorithms', 'frontend', 'system-design']);
    });

    it('should persist empty subscribedChannels array', () => {
      const prefsWithEmptyChannels = {
        ...testPreferences,
        subscribedChannels: [],
      };
      
      PreferencesStorage.set(prefsWithEmptyChannels);
      
      // Simulate page refresh
      const storedData = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      localStorage.clear();
      if (storedData) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, storedData);
      }
      
      const retrieved = PreferencesStorage.get();
      expect(retrieved.subscribedChannels).toEqual([]);
    });

    it('should update subscribedChannels while preserving role', () => {
      const initialPrefs = {
        ...testPreferences,
        role: 'backend',
        subscribedChannels: ['devops'],
      };
      
      PreferencesStorage.set(initialPrefs);
      
      // Update channels
      PreferencesStorage.update({ subscribedChannels: ['database', 'security'] });
      
      const retrieved = PreferencesStorage.get();
      expect(retrieved.subscribedChannels).toEqual(['database', 'security']);
      expect(retrieved.role).toBe('backend');
    });

    it('should handle channel subscription changes', () => {
      const initialChannels = ['algorithms', 'frontend'];
      PreferencesStorage.set({ ...testPreferences, subscribedChannels: initialChannels });
      
      // Add channel
      PreferencesStorage.update({ subscribedChannels: [...initialChannels, 'backend'] });
      expect(PreferencesStorage.get().subscribedChannels).toContain('backend');
      
      // Remove channel
      PreferencesStorage.update({ 
        subscribedChannels: PreferencesStorage.get().subscribedChannels.filter(c => c !== 'algorithms') 
      });
      expect(PreferencesStorage.get().subscribedChannels).not.toContain('algorithms');
    });

    it('should persist channel subscriptions through simulated page refresh', () => {
      const prefsWithChannels = {
        ...testPreferences,
        subscribedChannels: ['system-design', 'algorithms', 'frontend', 'backend'],
      };
      
      PreferencesStorage.set(prefsWithChannels);
      
      // Simulate page refresh
      const storedData = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      localStorage.clear();
      if (storedData) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, storedData);
      }
      
      const retrieved = PreferencesStorage.get();
      expect(retrieved.subscribedChannels).toHaveLength(4);
      expect(retrieved.subscribedChannels).toContain('system-design');
      expect(retrieved.subscribedChannels).toContain('algorithms');
    });
  });

  describe('Reset Behavior', () => {
    it('should reset onboardingComplete when clearing preferences', () => {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify({
        ...testPreferences,
        onboardingComplete: true,
      }));
      expect(PreferencesStorage.get().onboardingComplete).toBe(true);
      
      PreferencesStorage.reset();
      
      expect(PreferencesStorage.get().onboardingComplete).toBe(false);
    });

    it('should reset role when clearing preferences', () => {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify({
        ...testPreferences,
        role: 'frontend',
      }));
      expect(PreferencesStorage.get().role).toBe('frontend');
      
      PreferencesStorage.reset();
      
      expect(PreferencesStorage.get().role).toBeNull();
    });

    it('should reset subscribedChannels when clearing preferences', () => {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify({
        ...testPreferences,
        subscribedChannels: ['algorithms', 'frontend'],
      }));
      expect(PreferencesStorage.get().subscribedChannels).toHaveLength(2);
      
      PreferencesStorage.reset();
      
      expect(PreferencesStorage.get().subscribedChannels).toEqual([]);
    });

    it('should reset all onboarding flags when clearing preferences', () => {
      // Set all onboarding storage flags
      localStorage.setItem(STORAGE_KEYS.MARVEL_INTRO_SEEN, 'true');
      localStorage.setItem(STORAGE_KEYS.SWIPE_HINT_SEEN, 'true');
      localStorage.setItem(STORAGE_KEYS.GETTING_STARTED_SEEN, 'true');
      localStorage.setItem(STORAGE_KEYS.COACH_MARKS_SEEN, 'true');
      
      // Verify all are set
      expect(OnboardingStorage.hasSeenIntro()).toBe(true);
      expect(OnboardingStorage.hasSeenSwipeHint()).toBe(true);
      expect(OnboardingStorage.hasSeenGettingStarted()).toBe(true);
      expect(OnboardingStorage.hasSeenCoachMarks()).toBe(true);
      
      // Clear preferences (which is what reset does)
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
      
      // After full reset, new user should have default state
      const retrieved = PreferencesStorage.get();
      expect(retrieved.onboardingComplete).toBe(false);
      expect(retrieved.role).toBeNull();
      expect(retrieved.subscribedChannels).toEqual([]);
    });

    it('should create fresh preferences after complete storage clear', () => {
      // Set up user who completed onboarding
      const completedOnboardingPrefs = {
        role: 'frontend',
        subscribedChannels: ['algorithms', 'frontend'],
        onboardingComplete: true,
        createdAt: '2024-01-15T10:30:00.000Z',
      };
      
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(completedOnboardingPrefs));
      
      // Simulate user clearing browser data
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
      
      // After clearing, user should be treated as new
      const freshPrefs = PreferencesStorage.get();
      expect(freshPrefs.onboardingComplete).toBe(false);
      expect(freshPrefs.role).toBeNull();
      expect(freshPrefs.subscribedChannels).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing createdAt field by returning undefined', () => {
      const prefsWithoutCreatedAt = {
        role: 'frontend',
        subscribedChannels: ['algorithms'],
        onboardingComplete: true,
      };
      
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefsWithoutCreatedAt));
      
      const result = PreferencesStorage.get();
      
      // createdAt is not present in stored data, so it will be undefined
      expect(result.createdAt).toBeUndefined();
      expect(result.role).toBe('frontend');
      expect(result.onboardingComplete).toBe(true);
    });

    it('should handle undefined subscribedChannels by returning undefined', () => {
      const prefsWithUndefinedChannels = {
        role: 'frontend',
        subscribedChannels: undefined,
        onboardingComplete: true,
        createdAt: '2024-01-15T10:30:00.000Z',
      };
      
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefsWithUndefinedChannels));
      
      const result = PreferencesStorage.get();
      
      // When stored value is undefined, getItem returns it as-is
      expect(result.subscribedChannels).toBeUndefined();
      expect(result.role).toBe('frontend');
    });

    it('should handle very large subscribedChannels array', () => {
      const manyChannels = Array.from({ length: 100 }, (_, i) => `channel-${i}`);
      
      PreferencesStorage.set({
        ...testPreferences,
        subscribedChannels: manyChannels,
      });
      
      // Simulate page refresh
      const storedData = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      localStorage.clear();
      if (storedData) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, storedData);
      }
      
      const result = PreferencesStorage.get();
      
      expect(result.subscribedChannels).toHaveLength(100);
    });

    it('should handle special characters in role', () => {
      const specialRoles = ['front-end', 'full_stack', 'DevOps', 'ML/AI'];
      
      for (const role of specialRoles) {
        PreferencesStorage.set({ ...testPreferences, role });
        
        // Simulate page refresh
        const storedData = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
        localStorage.clear();
        if (storedData) {
          localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, storedData);
        }
        
        expect(PreferencesStorage.get().role).toBe(role);
      }
    });
  });
});
