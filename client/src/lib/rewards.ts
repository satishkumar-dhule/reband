/**
 * Rewards System Stub
 * Provides minimal type definitions for backward compatibility
 * Full implementation in credits.ts
 */

import { CREDIT_CONFIG } from './credits';

export interface ActivityEvent {
  type: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface RewardResult {
  summary: {
    hasRewards: boolean;
    xpEarned: number;
    creditsEarned: number;
    achievements: string[];
  };
  creditsEarned: number;
}

export interface UserProgressState {
  level: number;
  totalXP: number;
  creditBalance: number;
  currentStreak: number;
  longestStreak: number;
  questionsCompleted: number;
  beginnerCompleted: number;
  intermediateCompleted: number;
  advancedCompleted: number;
  currentSessionQuestions: number;
  channelsExplored: string[];
  channelProgress: Record<string, number>;
  quizAnswersCorrect: number;
  quizAnswersWrong: number;
  voiceInterviews: number;
  voiceSuccesses: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
}

export interface RewardNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

export const getStreakMultiplier = (streak: number): number => {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.25;
  return 1.0;
};

const defaultProgress: UserProgressState = {
  level: 1,
  totalXP: 0,
  creditBalance: CREDIT_CONFIG.NEW_USER_BONUS,
  currentStreak: 0,
  longestStreak: 0,
  questionsCompleted: 0,
  beginnerCompleted: 0,
  intermediateCompleted: 0,
  advancedCompleted: 0,
  currentSessionQuestions: 0,
  channelsExplored: [],
  channelProgress: {},
  quizAnswersCorrect: 0,
  quizAnswersWrong: 0,
  voiceInterviews: 0,
  voiceSuccesses: 0,
  totalCreditsEarned: CREDIT_CONFIG.NEW_USER_BONUS,
  totalCreditsSpent: 0,
};

class RewardStorage {
  getProgress(): UserProgressState {
    const stored = localStorage.getItem('user-progress');
    return stored ? JSON.parse(stored) : defaultProgress;
  }

  saveProgress(progress: UserProgressState): void {
    localStorage.setItem('user-progress', JSON.stringify(progress));
  }

  getNotifications(): RewardNotification[] {
    const stored = localStorage.getItem('reward-notifications');
    return stored ? JSON.parse(stored) : [];
  }

  saveNotifications(notifications: RewardNotification[]): void {
    localStorage.setItem('reward-notifications', JSON.stringify(notifications));
  }

  getCreditBalance(): number {
    return this.getProgress().creditBalance;
  }

  spendCredits(amount: number): { success: boolean; balance: number } {
    const progress = this.getProgress();
    if (progress.creditBalance < amount) {
      return { success: false, balance: progress.creditBalance };
    }
    progress.creditBalance -= amount;
    progress.totalCreditsSpent += amount;
    this.saveProgress(progress);
    return { success: true, balance: progress.creditBalance };
  }

  canAfford(amount: number): boolean {
    return this.getProgress().creditBalance >= amount;
  }

  dismissNotification(id: string): void {
    const notifications = this.getNotifications().map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications(notifications);
  }

  clearNotifications(): void {
    this.saveNotifications([]);
  }
}

class RewardEngine {
  private listeners: ((result: RewardResult) => void)[] = [];

  addListener(callback: (result: RewardResult) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  processActivity(event: ActivityEvent): RewardResult {
    const result: RewardResult = {
      summary: { hasRewards: false, xpEarned: 0, creditsEarned: 0, achievements: [] },
      creditsEarned: 0,
    };

    switch (event.type) {
      case 'question_completed':
        result.summary.xpEarned = 10;
        result.summary.creditsEarned = 1;
        result.creditsEarned = 1;
        break;
      case 'quiz_answered':
        const isCorrect = event.data?.isCorrect as boolean;
        result.summary.xpEarned = isCorrect ? 5 : 1;
        result.summary.creditsEarned = isCorrect ? CREDIT_CONFIG.QUIZ_CORRECT : CREDIT_CONFIG.QUIZ_WRONG;
        result.creditsEarned = result.summary.creditsEarned;
        break;
      case 'voice_interview_completed':
        const verdict = event.data?.verdict as string;
        result.summary.xpEarned = verdict === 'strong-hire' ? 50 : verdict === 'hire' ? 30 : 10;
        result.summary.creditsEarned = CREDIT_CONFIG.VOICE_ATTEMPT + 
          (verdict === 'strong-hire' || verdict === 'hire' ? CREDIT_CONFIG.VOICE_SUCCESS_BONUS : 0);
        result.creditsEarned = result.summary.creditsEarned;
        break;
      case 'daily_login':
        result.summary.xpEarned = 5;
        result.summary.creditsEarned = 10;
        result.creditsEarned = 10;
        break;
      case 'session_started':
      case 'session_ended':
      case 'srs_card_rated':
      case 'certification_passed':
      case 'certification_completed':
      case 'coding_challenge_passed':
      case 'coding_challenge_completed':
      case 'training_session_completed':
        result.summary.xpEarned = 5;
        break;
    }

    result.summary.hasRewards = result.summary.xpEarned > 0 || result.summary.creditsEarned > 0;

    this.listeners.forEach(l => l(result));
    return result;
  }
}

export const rewardStorage = new RewardStorage();
export const rewardEngine = new RewardEngine();
