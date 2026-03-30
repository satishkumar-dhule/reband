import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveTestSession,
  getTestSession,
  updateTestSession,
  saveCertificationSession,
  getCertificationSession,
  updateCertificationSession,
  clearSession,
  isStorageAvailable,
} from './session-tracker';

describe('Session Tracker Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Test Session - Resume on Refresh', () => {
    it('should save test session and retrieve it (simulating refresh)', () => {
      const channelId = 'algorithms';
      const channelName = 'Algorithms';
      const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }];
      const currentQuestionIndex = 1;
      const answers = { 'q1': ['answer1'] };

      const saved = saveTestSession(channelId, channelName, questions, currentQuestionIndex, answers);
      expect(saved).toBe(true);

      const retrieved = getTestSession(channelId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.channelId).toBe(channelId);
      expect(retrieved?.channelName).toBe(channelName);
      expect(retrieved?.currentQuestionIndex).toBe(1);
      expect(retrieved?.answers).toEqual(answers);
    });

    it('should resume session after simulated refresh', () => {
      const channelId = 'frontend';
      const channelName = 'Frontend';

      saveTestSession(channelId, channelName, [], 0, {});

      const stored = localStorage.getItem(`test-session-${channelId}`);
      localStorage.clear();
      if (stored) {
        localStorage.setItem(`test-session-${channelId}`, stored);
      }

      const resumed = getTestSession(channelId);
      expect(resumed).not.toBeNull();
      expect(resumed?.channelId).toBe(channelId);
    });

    it('should update session progress and persist', () => {
      const channelId = 'system-design';
      const channelName = 'System Design';

      saveTestSession(channelId, channelName, [], 0, {});

      const updated = updateTestSession(channelId, 2, { 'q1': ['a'], 'q2': ['b'] });
      expect(updated).toBe(true);

      const retrieved = getTestSession(channelId);
      expect(retrieved?.currentQuestionIndex).toBe(2);
      expect(retrieved?.answers).toEqual({ 'q1': ['a'], 'q2': ['b'] });
    });
  });

  describe('Certification Session - Resume on Refresh', () => {
    it('should save certification session and retrieve it', () => {
      const certId = 'aws-saa';
      const certName = 'AWS Solutions Architect';
      const questions = [{ id: 'c1' }, { id: 'c2' }];
      const currentQuestionIndex = 0;
      const answers = {};

      const saved = saveCertificationSession(certId, certName, questions, currentQuestionIndex, answers);
      expect(saved).toBe(true);

      const retrieved = getCertificationSession(certId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.certificationId).toBe(certId);
    });

    it('should resume certification session after simulated refresh', () => {
      const certId = 'k8s-cka';
      const certName = 'Kubernetes CKA';

      saveCertificationSession(certId, certName, [], 0, {});

      const stored = localStorage.getItem(`certification-session-${certId}`);
      localStorage.clear();
      if (stored) {
        localStorage.setItem(`certification-session-${certId}`, stored);
      }

      const resumed = getCertificationSession(certId);
      expect(resumed).not.toBeNull();
      expect(resumed?.certificationId).toBe(certId);
    });

    it('should update certification session progress', () => {
      const certId = 'terraform';
      const certName = 'Terraform';

      saveCertificationSession(certId, certName, [], 0, {});

      const updated = updateCertificationSession(certId, 3, { 'c1': ['answer'] });
      expect(updated).toBe(true);

      const retrieved = getCertificationSession(certId);
      expect(retrieved?.currentQuestionIndex).toBe(3);
    });
  });

  describe('Session Clear', () => {
    it('should clear session from storage', () => {
      const channelId = 'test-channel';
      saveTestSession(channelId, 'Test', [], 0, {});

      expect(getTestSession(channelId)).not.toBeNull();

      clearSession(`test-session-${channelId}`);

      expect(getTestSession(channelId)).toBeNull();
    });
  });

  describe('Storage Availability', () => {
    it('should report storage availability', () => {
      const available = isStorageAvailable();
      expect(typeof available).toBe('boolean');
    });
  });
});
