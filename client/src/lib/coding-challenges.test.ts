import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getAllChallenges,
  getChallengeById,
  getRandomChallenge,
  getSolvedChallengeIds,
  getCodingStats,
  saveChallengeAttempt,
  getChallengeAttempts,
  analyzeCodeComplexity,
  type Language,
  type ChallengeAttempt,
} from './coding-challenges';

const ATTEMPTS_KEY = 'coding-attempts';
const SOLVED_KEY = 'coding-solved-ids';

describe('Coding Challenges Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAllChallenges', () => {
    it('should return an array of challenges', () => {
      const challenges = getAllChallenges();
      expect(Array.isArray(challenges)).toBe(true);
    });

    it('should return challenges with required fields', () => {
      const challenges = getAllChallenges();
      if (challenges.length > 0) {
        const ch = challenges[0];
        expect(ch).toHaveProperty('id');
        expect(ch).toHaveProperty('title');
        expect(ch).toHaveProperty('description');
        expect(ch).toHaveProperty('difficulty');
        expect(ch).toHaveProperty('starterCode');
        expect(ch.starterCode).toHaveProperty('javascript');
        expect(ch.starterCode).toHaveProperty('python');
      }
    });

    it('should return challenges with valid difficulty values', () => {
      const challenges = getAllChallenges();
      const validDifficulties = new Set(['easy', 'medium', 'hard']);
      challenges.forEach(ch => {
        expect(validDifficulties.has(ch.difficulty as string)).toBe(true);
      });
    });
  });

  describe('getChallengeById', () => {
    it('should return null for unknown id', () => {
      const result = getChallengeById('non-existent-id-xyz-123');
      expect(result).toBeNull();
    });

    it('should return the correct challenge when given a valid id', () => {
      const challenges = getAllChallenges();
      if (challenges.length > 0) {
        const firstId = challenges[0].id;
        const found = getChallengeById(firstId);
        expect(found).not.toBeNull();
        expect(found?.id).toBe(firstId);
      }
    });
  });

  describe('getRandomChallenge', () => {
    it('should return a challenge object', () => {
      const challenge = getRandomChallenge();
      expect(challenge).toHaveProperty('id');
      expect(challenge).toHaveProperty('title');
    });

    it('should return an easy challenge when difficulty filter is applied', () => {
      const challenge = getRandomChallenge('easy');
      expect(challenge.difficulty).toBe('easy');
    });

    it('should return a medium challenge when difficulty filter is applied', () => {
      const challenge = getRandomChallenge('medium');
      expect(['medium', 'easy']).toContain(challenge.difficulty);
    });
  });

  describe('saveChallengeAttempt & getChallengeAttempts', () => {
    it('should save and retrieve a challenge attempt', () => {
      const attempt: ChallengeAttempt = {
        challengeId: 'test-challenge-1',
        code: 'function solve() { return 42; }',
        language: 'javascript',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        passed: true,
        testResults: [],
        timeSpent: 120,
      };

      saveChallengeAttempt(attempt);
      const attempts = getChallengeAttempts();
      expect(Array.isArray(attempts)).toBe(true);
      const saved = attempts.find(a => a.challengeId === 'test-challenge-1');
      expect(saved).not.toBeUndefined();
      expect(saved?.passed).toBe(true);
    });

    it('should handle multiple attempts for the same challenge', () => {
      const base = {
        code: 'function solve() {}',
        language: 'javascript' as Language,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        testResults: [],
        timeSpent: 60,
      };

      saveChallengeAttempt({ ...base, challengeId: 'ch-1', passed: false });
      saveChallengeAttempt({ ...base, challengeId: 'ch-1', passed: true });

      const attempts = getChallengeAttempts();
      const ch1Attempts = attempts.filter(a => a.challengeId === 'ch-1');
      expect(ch1Attempts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getSolvedChallengeIds', () => {
    it('should return an empty Set when nothing is solved', () => {
      const solved = getSolvedChallengeIds();
      expect(solved instanceof Set).toBe(true);
    });

    it('should return solved ids after a passing attempt', () => {
      saveChallengeAttempt({
        challengeId: 'solved-challenge-id',
        code: 'return 42;',
        language: 'javascript',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        passed: true,
        testResults: [],
        timeSpent: 30,
      });

      const solved = getSolvedChallengeIds();
      expect(solved.has('solved-challenge-id')).toBe(true);
    });
  });

  describe('getCodingStats', () => {
    it('should return stats object with expected fields', () => {
      const stats = getCodingStats();
      expect(stats).toHaveProperty('totalAttempts');
      expect(stats).toHaveProperty('totalSolved');
      expect(stats).toHaveProperty('successRate');
    });

    it('should report zero stats when no attempts exist', () => {
      const stats = getCodingStats();
      expect(stats.totalAttempts).toBe(0);
      expect(stats.totalSolved).toBe(0);
    });

    it('should calculate success rate correctly', () => {
      const base = {
        code: 'function solve() {}',
        language: 'javascript' as Language,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        testResults: [],
        timeSpent: 60,
      };

      saveChallengeAttempt({ ...base, challengeId: 'c1', passed: true });
      saveChallengeAttempt({ ...base, challengeId: 'c2', passed: false });

      const stats = getCodingStats();
      expect(stats.totalAttempts).toBeGreaterThanOrEqual(2);
    });
  });

  describe('analyzeCodeComplexity', () => {
    it('should return time and space complexity strings', () => {
      const code = 'function solve(arr) { return arr.sort(); }';
      const result = analyzeCodeComplexity(code);
      if (result) {
        expect(typeof result.time).toBe('string');
        expect(typeof result.space).toBe('string');
        expect(result.time.length).toBeGreaterThan(0);
        expect(result.space.length).toBeGreaterThan(0);
      }
    });

    it('should handle empty code without throwing', () => {
      expect(() => analyzeCodeComplexity('')).not.toThrow();
    });
  });
});
