/**
 * Unit tests for UserPreferencesContext onboarding reset behavior
 * 
 * Tests the context's needsOnboarding flag and reset functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UserPreferencesProvider, useUserPreferences } from './UserPreferencesContext';
import { PreferencesStorage, OnboardingStorage } from '../services/storage.service';
import { STORAGE_KEYS } from '../lib/constants';
import type { ReactNode } from 'react';

describe('UserPreferencesContext - Onboarding Reset', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <UserPreferencesProvider>{children}</UserPreferencesProvider>
  );

  describe('needsOnboarding flag behavior', () => {
    it('should show needsOnboarding=true when onboarding is incomplete', () => {
      const { result } = renderHook(() => useUserPreferences(), { wrapper });
      
      expect(result.current.needsOnboarding).toBe(true);
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

      const { result } = renderHook(() => useUserPreferences(), { wrapper });
      
      expect(result.current.needsOnboarding).toBe(false);
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

      const { result } = renderHook(() => useUserPreferences(), { wrapper });
      expect(result.current.needsOnboarding).toBe(false);

      act(() => {
        OnboardingStorage.resetOnboarding();
      });

      const { result: resultAfter } = renderHook(() => useUserPreferences(), { wrapper });
      expect(resultAfter.current.needsOnboarding).toBe(true);
    });
  });

  describe('resetPreferences behavior', () => {
    it('should reset preferences to defaults when resetPreferences is called', () => {
      PreferencesStorage.set({
        role: 'frontend',
        subscribedChannels: ['algorithms', 'frontend'],
        subscribedCertifications: [],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: false,
        prioritizeUnvisited: false,
      });

      const { result } = renderHook(() => useUserPreferences(), { wrapper });
      
      act(() => {
        result.current.resetPreferences();
      });

      expect(result.current.preferences.onboardingComplete).toBe(false);
      expect(result.current.preferences.role).toBeNull();
      expect(result.current.preferences.subscribedChannels).toEqual([]);
      expect(result.current.needsOnboarding).toBe(true);
    });

    it('should clear localStorage when resetPreferences is called', () => {
      PreferencesStorage.set({
        role: 'frontend',
        subscribedChannels: ['algorithms'],
        subscribedCertifications: [],
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        shuffleQuestions: true,
        prioritizeUnvisited: true,
      });

      const { result } = renderHook(() => useUserPreferences(), { wrapper });
      
      act(() => {
        result.current.resetPreferences();
      });

      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      expect(stored).toBeNull();
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

      const { result } = renderHook(() => useUserPreferences(), { wrapper });
      expect(result.current.needsOnboarding).toBe(true);
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

      const { result } = renderHook(() => useUserPreferences(), { wrapper });
      expect(result.current.preferences.onboardingComplete).toBe(false);
      expect(result.current.preferences.role).toBeNull();
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

      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);

      const { result } = renderHook(() => useUserPreferences(), { wrapper });
      expect(result.current.needsOnboarding).toBe(true);
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

      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);

      const { result } = renderHook(() => useUserPreferences(), { wrapper });
      expect(result.current.preferences).toMatchObject({
        role: null,
        subscribedChannels: [],
        onboardingComplete: false,
      });
    });
  });
});
