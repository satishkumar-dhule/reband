import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  CREDIT_CONFIG,
  getCreditsState,
  getBalance,
  earnCredits,
  spendCredits,
  canAfford,
  redeemCoupon,
  formatCredits,
  processQuizAnswer,
  processSRSReview,
} from './credits';

const CREDITS_KEY = 'user-credits';

describe('Credits Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('CREDIT_CONFIG constants', () => {
    it('should define positive new user bonus', () => {
      expect(CREDIT_CONFIG.NEW_USER_BONUS).toBeGreaterThan(0);
    });

    it('should define question view cost as positive', () => {
      expect(CREDIT_CONFIG.QUESTION_VIEW_COST).toBeGreaterThan(0);
    });

    it('should define SRS ratings correctly', () => {
      expect(CREDIT_CONFIG.SRS_AGAIN).toBeLessThan(0);
      expect(CREDIT_CONFIG.SRS_GOOD).toBeGreaterThan(0);
      expect(CREDIT_CONFIG.SRS_EASY).toBeGreaterThanOrEqual(CREDIT_CONFIG.SRS_GOOD);
    });

    it('should define quiz answer credits', () => {
      expect(CREDIT_CONFIG.QUIZ_CORRECT).toBeGreaterThan(0);
      expect(CREDIT_CONFIG.QUIZ_WRONG).toBeLessThan(0);
    });
  });

  describe('getCreditsState', () => {
    it('should return initialized state with new user bonus when storage is empty', () => {
      const state = getCreditsState();
      expect(state.initialized).toBe(true);
      expect(state.balance).toBe(CREDIT_CONFIG.NEW_USER_BONUS);
    });

    it('should return persisted state on subsequent calls', () => {
      getCreditsState(); // Initialize
      const state = getCreditsState();
      expect(state.balance).toBe(CREDIT_CONFIG.NEW_USER_BONUS);
    });
  });

  describe('getBalance', () => {
    it('should return the current balance', () => {
      const balance = getBalance();
      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('earnCredits', () => {
    it('should increase balance by the given amount', () => {
      const initialBalance = getBalance();
      const newBalance = earnCredits(50, 'test earn');
      expect(newBalance).toBe(initialBalance + 50);
    });

    it('should not allow earning zero or negative credits', () => {
      const initialBalance = getBalance();
      earnCredits(0, 'zero earn');
      expect(getBalance()).toBe(initialBalance);
    });

    it('should record the transaction in history', () => {
      earnCredits(100, 'test transaction');
      const state = getCreditsState();
      expect(state.totalEarned).toBeGreaterThanOrEqual(100);
    });
  });

  describe('spendCredits', () => {
    it('should decrease balance when user can afford it', () => {
      earnCredits(200, 'setup');
      const balanceBefore = getBalance();
      const result = spendCredits(50, 'test spend');
      expect(result.success).toBe(true);
      expect(result.balance).toBe(balanceBefore - 50);
    });

    it('should fail when user cannot afford the amount', () => {
      localStorage.clear();
      // Set balance to 0
      localStorage.setItem(CREDITS_KEY, JSON.stringify({
        balance: 0, totalEarned: 0, totalSpent: 0, usedCoupons: [], initialized: true,
      }));
      const result = spendCredits(100, 'expensive action');
      expect(result.success).toBe(false);
    });
  });

  describe('canAfford', () => {
    it('should return true when balance is sufficient', () => {
      earnCredits(500, 'setup');
      expect(canAfford(10)).toBe(true);
    });

    it('should return false for amount exceeding balance', () => {
      localStorage.setItem(CREDITS_KEY, JSON.stringify({
        balance: 5, totalEarned: 5, totalSpent: 0, usedCoupons: [], initialized: true,
      }));
      expect(canAfford(1000)).toBe(false);
    });
  });

  describe('redeemCoupon', () => {
    it('should succeed with a valid coupon code', () => {
      const result = redeemCoupon('WELCOME100');
      expect(result.success).toBe(true);
      expect(result.creditsAdded).toBeGreaterThan(0);
    });

    it('should fail with an invalid coupon code', () => {
      const result = redeemCoupon('INVALID_CODE_XYZ');
      expect(result.success).toBe(false);
    });

    it('should fail when coupon is used twice', () => {
      redeemCoupon('WELCOME100'); // First use
      const result = redeemCoupon('WELCOME100'); // Second use
      expect(result.success).toBe(false);
    });

    it('should be case-insensitive for coupon codes', () => {
      const result = redeemCoupon('welcome100');
      expect(result.success).toBe(true);
    });
  });

  describe('formatCredits', () => {
    it('should format positive credits correctly', () => {
      const formatted = formatCredits(1000);
      expect(formatted).toContain('1');
      expect(typeof formatted).toBe('string');
    });

    it('should handle zero credits', () => {
      const formatted = formatCredits(0);
      expect(typeof formatted).toBe('string');
    });
  });

  describe('processQuizAnswer', () => {
    it('should award credits for correct answer', () => {
      const result = processQuizAnswer(true);
      expect(result.creditsChange).toBeGreaterThan(0);
      expect(result.newBalance).toBeGreaterThan(0);
    });

    it('should deduct credits for wrong answer', () => {
      earnCredits(500, 'setup');
      const balanceBefore = getBalance();
      const result = processQuizAnswer(false);
      expect(result.creditsChange).toBeLessThan(0);
      expect(result.newBalance).toBeLessThan(balanceBefore);
    });
  });

  describe('processSRSReview', () => {
    it('should award credits for GOOD rating', () => {
      const before = getBalance();
      processSRSReview('good');
      const after = getBalance();
      expect(after).toBeGreaterThan(before);
    });

    it('should award more credits for EASY than GOOD', () => {
      const goodResult = processSRSReview('good');
      const easyResult = processSRSReview('easy');
      expect(easyResult.creditsChange).toBeGreaterThanOrEqual(goodResult.creditsChange);
    });

    it('should deduct credits for AGAIN rating', () => {
      earnCredits(500, 'setup');
      const result = processSRSReview('again');
      expect(result.creditsChange).toBeLessThan(0);
    });

    it('should not change balance for HARD rating', () => {
      const before = getBalance();
      const result = processSRSReview('hard');
      expect(result.creditsChange).toBe(0);
      expect(getBalance()).toBe(before);
    });
  });
});
