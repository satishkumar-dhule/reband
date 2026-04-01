import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isAuthenticated, setAuthToken, getAuthToken, clearAuthToken } from './ProtectedRoute';
import { PreferencesStorage } from '../services/storage.service';

// Mock localStorage for the tests
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  },
  setItem(key: string, value: string): void {
    this.store[key] = value;
  },
  removeItem(key: string): void {
    delete this.store[key];
  },
  clear(): void {
    this.store = {};
  },
  get length(): number {
    return Object.keys(this.store).length;
  },
  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('ProtectedRoute Auth Token Persistence', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    // Clear user-preferences to ensure clean state
    PreferencesStorage.reset();
  });

  describe('isAuthenticated', () => {
    it('should return false when onboarding is not complete', () => {
      // Clear preferences - default is onboardingComplete: false
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when onboarding is complete', () => {
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

    it('should return false when onboarding is explicitly incomplete', () => {
      PreferencesStorage.set({
        role: null,
        subscribedChannels: [],
        subscribedCertifications: [],
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
        shuffleQuestions: true,
        prioritizeUnvisited: true,
      });
      
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('getAuthToken', () => {
    it('should return onboarding-complete when authenticated', () => {
      PreferencesStorage.set({
        role: 'frontend',
        subscribedChannels: [],
        subscribedCertifications: [],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: true,
        prioritizeUnvisited: true,
      });
      
      expect(getAuthToken()).toBe('onboarding-complete');
    });

    it('should return null when not authenticated', () => {
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('setAuthToken', () => {
    it('is now a no-op (tokens managed via onboardingComplete in user-preferences)', () => {
      // setAuthToken is kept for backward compatibility but does nothing
      setAuthToken('any-token');
      // The function should exist and not throw
      expect(typeof setAuthToken).toBe('function');
    });
  });

  describe('clearAuthToken', () => {
    it('is now a no-op (auth state managed via user preferences)', () => {
      // clearAuthToken is kept for backward compatibility but does nothing
      clearAuthToken();
      expect(typeof clearAuthToken).toBe('function');
    });
  });

  describe('ProtectedRoute exports', () => {
    it('should export isAuthenticated function', () => {
      expect(typeof isAuthenticated).toBe('function');
    });

    it('should export setAuthToken function', () => {
      expect(typeof setAuthToken).toBe('function');
    });

    it('should export clearAuthToken function', () => {
      expect(typeof clearAuthToken).toBe('function');
    });

    it('should export getAuthToken function', () => {
      expect(typeof getAuthToken).toBe('function');
    });
  });
});
