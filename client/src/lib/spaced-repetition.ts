/**
 * Spaced Repetition System (SRS) for Code Reels
 * 
 * Uses a modified SM-2 algorithm optimized for interview prep:
 * - Shorter initial intervals (interviews are time-sensitive)
 * - Difficulty-aware scheduling
 * - Confidence-based adjustments
 */

import { SRS_CONFIG, SRS_STORAGE_KEYS, srsConfig, MasteryLevel, RatingAdjustment } from './srs-config';

export type ConfidenceRating = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewCard {
  questionId: string;
  channel: string;
  difficulty: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: string;
  lastReview: string;
  totalReviews: number;
  correctStreak: number;
  masteryLevel: number;
}

export interface SRSStats {
  totalCards: number;
  dueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
  mastered: number;
  learning: number;
  newToday: number;
  reviewStreak: number;
  lastReviewDate: string | null;
}

const STORAGE_KEY = SRS_STORAGE_KEYS.CARDS;
const STATS_KEY = SRS_STORAGE_KEYS.STATS;

function calculateNextInterval(
  card: ReviewCard,
  rating: ConfidenceRating
): { interval: number; easeFactor: number; repetitions: number } {
  let { interval, easeFactor, repetitions } = card;
  const adjustment = SRS_CONFIG.ratings[rating] as RatingAdjustment;

  switch (rating) {
    case 'again':
      return {
        interval: 1,
        easeFactor: Math.max(SRS_CONFIG.easeFactor.min, easeFactor - (adjustment.easePenalty ?? 0)),
        repetitions: 0
      };

    case 'hard':
      const hardInterval = Math.max(1, Math.round(interval * adjustment.intervalMultiplier));
      return {
        interval: hardInterval,
        easeFactor: Math.max(SRS_CONFIG.easeFactor.min, easeFactor - (adjustment.easePenalty ?? 0)),
        repetitions: repetitions + 1
      };

    case 'good':
      let goodInterval: number;
      if (repetitions < SRS_CONFIG.initialIntervals.length) {
        goodInterval = SRS_CONFIG.initialIntervals[repetitions];
      } else {
        goodInterval = Math.round(interval * easeFactor);
      }
      return {
        interval: Math.min(SRS_CONFIG.maxInterval, goodInterval),
        easeFactor,
        repetitions: repetitions + 1
      };

    case 'easy':
      let easyInterval: number;
      if (repetitions < SRS_CONFIG.initialIntervals.length) {
        const nextIntervalIndex = Math.min(repetitions + 1, SRS_CONFIG.initialIntervals.length - 1);
        easyInterval = SRS_CONFIG.initialIntervals[nextIntervalIndex] * (adjustment.firstIntervalBonus ?? 1);
      } else {
        easyInterval = Math.round(interval * easeFactor * adjustment.intervalMultiplier);
      }
      return {
        interval: Math.min(SRS_CONFIG.maxInterval, Math.round(easyInterval)),
        easeFactor: Math.min(SRS_CONFIG.easeFactor.max, easeFactor + (adjustment.easeBonus ?? 0)),
        repetitions: repetitions + 1
      };
  }
}

function calculateMasteryLevel(card: ReviewCard): number {
  const { repetitions, interval, correctStreak } = card;
  
  if (repetitions === 0) return 0;
  // Check from lowest to highest threshold so higher levels can override
  if (interval >= SRS_CONFIG.mastery.familiar.intervalDays && correctStreak >= SRS_CONFIG.mastery.familiar.streakRequired) return 2;
  if (interval >= SRS_CONFIG.mastery.proficient.intervalDays && correctStreak >= SRS_CONFIG.mastery.proficient.streakRequired) return 3;
  if (interval >= SRS_CONFIG.mastery.expert.intervalDays && correctStreak >= SRS_CONFIG.mastery.expert.streakRequired) return 4;
  if (interval >= SRS_CONFIG.mastery.mastered.intervalDays && correctStreak >= SRS_CONFIG.mastery.mastered.streakRequired) return 5;
  if (repetitions >= 1) return 1;
  return 0;
}

export function getAllCards(): Map<string, ReviewCard> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Map();
    const parsed = JSON.parse(stored);
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function saveAllCards(cards: Map<string, ReviewCard>): void {
  try {
    const obj = Object.fromEntries(cards);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error('Failed to save review cards:', e);
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded');
    }
  }
}

export function getCard(questionId: string, channel: string, difficulty: string): ReviewCard {
  const cards = getAllCards();
  const existing = cards.get(questionId);
  
  if (existing) return existing;
  
  const newCard: ReviewCard = {
    questionId,
    channel,
    difficulty,
    interval: 0,
    easeFactor: SRS_CONFIG.easeFactor.default,
    repetitions: 0,
    nextReview: new Date().toISOString().split('T')[0],
    lastReview: '',
    totalReviews: 0,
    correctStreak: 0,
    masteryLevel: 0
  };
  
  return newCard;
}

export function recordReview(
  questionId: string,
  channel: string,
  difficulty: string,
  rating: ConfidenceRating
): ReviewCard {
  const cards = getAllCards();
  const card = getCard(questionId, channel, difficulty);
  
  const { interval, easeFactor, repetitions } = calculateNextInterval(card, rating);
  
  const today = new Date().toISOString().split('T')[0];
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  const updatedCard: ReviewCard = {
    ...card,
    interval,
    easeFactor,
    repetitions,
    nextReview: nextReviewDate.toISOString().split('T')[0],
    lastReview: today,
    totalReviews: card.totalReviews + 1,
    correctStreak: rating === 'again' ? 0 : card.correctStreak + 1,
    masteryLevel: 0
  };
  
  updatedCard.masteryLevel = calculateMasteryLevel(updatedCard);
  
  cards.set(questionId, updatedCard);
  saveAllCards(cards);
  
  updateReviewStreak();
  
  return updatedCard;
}

export function getDueCards(): ReviewCard[] {
  const cards = getAllCards();
  const today = new Date().toISOString().split('T')[0];
  
  return Array.from(cards.values())
    .filter(card => card.nextReview <= today)
    .sort((a, b) => {
      if (a.nextReview !== b.nextReview) {
        return a.nextReview.localeCompare(b.nextReview);
      }
      return a.masteryLevel - b.masteryLevel;
    });
}

export function getCardsDueInRange(days: number): ReviewCard[] {
  const cards = getAllCards();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  const endStr = endDate.toISOString().split('T')[0];
  
  return Array.from(cards.values())
    .filter(card => card.nextReview <= endStr);
}

export function getSRSStats(): SRSStats {
  const cards = getAllCards();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split('T')[0];
  
  const allCards = Array.from(cards.values());
  
  let stats = { reviewStreak: 0, lastReviewDate: null as string | null };
  try {
    const statsStr = localStorage.getItem(STATS_KEY);
    stats = statsStr ? JSON.parse(statsStr) : { reviewStreak: 0, lastReviewDate: null };
  } catch {
    // Ignore parse errors
  }
  
  return {
    totalCards: allCards.length,
    dueToday: allCards.filter(c => c.nextReview <= today).length,
    dueTomorrow: allCards.filter(c => c.nextReview === tomorrowStr).length,
    dueThisWeek: allCards.filter(c => c.nextReview <= weekEndStr).length,
    mastered: allCards.filter(c => c.masteryLevel >= 4).length,
    learning: allCards.filter(c => c.masteryLevel > 0 && c.masteryLevel < 4).length,
    newToday: allCards.filter(c => c.lastReview === today && c.totalReviews === 1).length,
    reviewStreak: stats.reviewStreak,
    lastReviewDate: stats.lastReviewDate
  };
}

function updateReviewStreak(): void {
  const today = new Date().toISOString().split('T')[0];
  let stats = { reviewStreak: 0, lastReviewDate: null as string | null };
  try {
    const statsStr = localStorage.getItem(STATS_KEY);
    stats = statsStr ? JSON.parse(statsStr) : { reviewStreak: 0, lastReviewDate: null };
  } catch {
    // Ignore parse errors
  }
  
  if (stats.lastReviewDate === today) {
    return;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (stats.lastReviewDate === yesterdayStr) {
    stats.reviewStreak += 1;
  } else if (stats.lastReviewDate !== today) {
    stats.reviewStreak = 1;
  }
  
  stats.lastReviewDate = today;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save review streak:', e);
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded');
    }
  }
}

export function addToSRS(questionId: string, channel: string, difficulty: string): ReviewCard {
  const cards = getAllCards();
  
  if (cards.has(questionId)) {
    return cards.get(questionId)!;
  }
  
  const newCard: ReviewCard = {
    questionId,
    channel,
    difficulty,
    interval: 1,
    easeFactor: SRS_CONFIG.easeFactor.default,
    repetitions: 0,
    nextReview: new Date().toISOString().split('T')[0],
    lastReview: '',
    totalReviews: 0,
    correctStreak: 0,
    masteryLevel: 0
  };
  
  cards.set(questionId, newCard);
  saveAllCards(cards);
  
  return newCard;
}

export function isInSRS(questionId: string): boolean {
  return getAllCards().has(questionId);
}

export function getMasteryLabel(level: number): string {
  const safeLevel = Math.min(Math.max(level, 0), 5) as 0 | 1 | 2 | 3 | 4 | 5;
  return SRS_CONFIG.masteryDisplay[safeLevel].label;
}

export function getMasteryColor(level: number): string {
  const safeLevel = Math.min(Math.max(level, 0), 5) as 0 | 1 | 2 | 3 | 4 | 5;
  return SRS_CONFIG.masteryDisplay[safeLevel].color;
}

export function getMasteryEmoji(level: number): string {
  const safeLevel = Math.min(Math.max(level, 0), 5) as 0 | 1 | 2 | 3 | 4 | 5;
  return SRS_CONFIG.masteryDisplay[safeLevel].emoji;
}

export function calculateXP(rating: ConfidenceRating, masteryLevel: number): number {
  const baseXP = SRS_CONFIG.xp[rating];
  const masteryBonus = masteryLevel * SRS_CONFIG.masteryBonusXP;
  return baseXP + masteryBonus;
}

export function getUserXP(): { totalXP: number; level: number; xpToNext: number; progress: number } {
  let stats = { totalXP: 0 };
  try {
    const statsStr = localStorage.getItem(STATS_KEY);
    stats = statsStr ? JSON.parse(statsStr) : { totalXP: 0 };
  } catch {
    // Ignore parse errors
  }
  const totalXP = stats.totalXP || 0;
  
  const level = srsConfig.calculateLevel(totalXP);
  const xpForCurrentLevel = Math.pow(level - 1, 2) * SRS_CONFIG.levelFormula.xpDivisor;
  const xpForNextLevel = Math.pow(level, 2) * SRS_CONFIG.levelFormula.xpDivisor;
  const xpToNext = xpForNextLevel - totalXP;
  const progress = ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  
  return { totalXP, level, xpToNext, progress: Math.max(0, Math.min(100, progress)) };
}

export function addXP(amount: number): { totalXP: number; level: number; leveledUp: boolean } {
  let stats = { totalXP: 0, reviewStreak: 0, lastReviewDate: null as string | null };
  try {
    const statsStr = localStorage.getItem(STATS_KEY);
    stats = statsStr ? JSON.parse(statsStr) : { totalXP: 0, reviewStreak: 0, lastReviewDate: null };
  } catch {
    // Ignore parse errors
  }
  
  const oldLevel = srsConfig.calculateLevel(stats.totalXP || 0);
  stats.totalXP = (stats.totalXP || 0) + amount;
  const newLevel = srsConfig.calculateLevel(stats.totalXP);
  
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save XP:', e);
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded');
    }
  }
  
  return { 
    totalXP: stats.totalXP, 
    level: newLevel, 
    leveledUp: newLevel > oldLevel 
  };
}

export function getRatingLabel(rating: ConfidenceRating): string {
  return SRS_CONFIG.ratingLabels[rating];
}

export function getNextReviewPreview(card: ReviewCard): Record<ConfidenceRating, string> {
  const ratings: ConfidenceRating[] = ['again', 'hard', 'good', 'easy'];
  const previews: Record<ConfidenceRating, string> = {} as any;
  
  for (const rating of ratings) {
    const { interval } = calculateNextInterval(card, rating);
    if (interval === 1) {
      previews[rating] = '1d';
    } else if (interval < 7) {
      previews[rating] = `${interval}d`;
    } else if (interval < 30) {
      previews[rating] = `${Math.round(interval / 7)}w`;
    } else {
      previews[rating] = `${Math.round(interval / 30)}mo`;
    }
  }
  
  return previews;
}

export default {
  getAllCards,
  getCard,
  recordReview,
  getDueCards,
  getCardsDueInRange,
  getSRSStats,
  addToSRS,
  isInSRS,
  getMasteryLabel,
  getMasteryColor,
  getMasteryEmoji,
  getRatingLabel,
  getNextReviewPreview,
  calculateXP,
  getUserXP,
  addXP
};
