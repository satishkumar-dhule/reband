/**
 * Spaced Repetition System (SRS) Configuration
 * 
 * Centralized configuration for all SRS-related constants and parameters.
 * This module serves as the single source of truth for SM-2 algorithm settings,
 * mastery thresholds, XP rewards, and other tunable SRS parameters.
 * 
 * @module srs-config
 */

/** Confidence rating options for review responses */
export type ConfidenceRating = 'again' | 'hard' | 'good' | 'easy';

/** Mastery level index (0-5) */
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Mastery level metadata */
export interface MasteryLevelConfig {
  /** Minimum interval in days to reach this level */
  intervalDays: number;
  /** Required consecutive correct reviews */
  streakRequired: number;
}

/** SM-2 algorithm ease factor constraints */
export interface EaseFactorConfig {
  /** Minimum allowed ease factor (prevents intervals from shrinking too fast) */
  min: number;
  /** Default ease factor for new cards */
  default: number;
  /** Maximum allowed ease factor (caps bonus for "easy" responses) */
  max: number;
}

/** Rating adjustment parameters */
export interface RatingAdjustment {
  /** Penalty to ease factor (subtracted) */
  easePenalty?: number;
  /** Bonus to ease factor (added) */
  easeBonus?: number;
  /** Multiplier applied to current interval */
  intervalMultiplier: number;
  /** Additional bonus for first-time intervals (easy only) */
  firstIntervalBonus?: number;
}

/** XP reward configuration per rating */
export interface XPConfig {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

/**
 * Rating adjustment configuration
 * Controls how each confidence rating affects ease factor and interval
 */
export interface RatingsConfig {
  /** User forgot the material - reset progress */
  again: RatingAdjustment;
  /** User struggled but remembered - apply penalty */
  hard: RatingAdjustment;
  /** Standard recall - normal progression */
  good: RatingAdjustment;
  /** Perfect recall - accelerated progression */
  easy: RatingAdjustment;
}

/**
 * Mastery level thresholds
 * Defines interval and streak requirements for each mastery level
 */
export interface MasteryConfig {
  /** Level 5: Fully retained - review every 90 days */
  mastered: MasteryLevelConfig;
  /** Level 4: Expert recall - review every 30 days */
  expert: MasteryLevelConfig;
  /** Level 3: Proficient - review every 14 days */
  proficient: MasteryLevelConfig;
  /** Level 2: Familiar - review every 7 days */
  familiar: MasteryLevelConfig;
}

/**
 * Mastery level display information
 */
export interface MasteryDisplayInfo {
  label: string;
  color: string;
  emoji: string;
}

/** Local storage keys for SRS persistence */
export const SRS_STORAGE_KEYS = {
  CARDS: 'code-reels-srs',
  STATS: 'code-reels-srs-stats',
} as const;

/**
 * SM-2 Algorithm Configuration
 * Core spaced repetition algorithm parameters tuned for interview prep
 */

// Individual config values (not nested in object to avoid undefined access issues)
export const SRS_EASE_FACTOR = {
  min: 1.3,
  default: 2.5,
  max: 3.0,
} as const satisfies EaseFactorConfig;

export const SRS_INITIAL_INTERVALS = [1, 3, 7] as const;

export const SRS_MAX_INTERVAL = 180;

export const SRS_RATINGS = {
  again: {
    easePenalty: 0.2,
    intervalMultiplier: 0,
  },
  hard: {
    easePenalty: 0.15,
    intervalMultiplier: 1.2,
  },
  good: {
    easePenalty: 0,
    intervalMultiplier: 1,
  },
  easy: {
    easeBonus: 0.1,
    intervalMultiplier: 1.3,
    firstIntervalBonus: 1.5,
  },
} as const satisfies RatingsConfig;

export const SRS_MASTERY = {
  mastered: { intervalDays: 90, streakRequired: 5 },
  expert: { intervalDays: 30, streakRequired: 4 },
  proficient: { intervalDays: 14, streakRequired: 3 },
  familiar: { intervalDays: 7, streakRequired: 2 },
} as const satisfies MasteryConfig;

export const SRS_XP = {
  again: 5,
  hard: 10,
  good: 15,
  easy: 20,
} as const satisfies XPConfig;

export const SRS_MASTERY_BONUS_XP = 2;

export const SRS_LEVEL_FORMULA = {
  xpDivisor: 100,
  levelOffset: 1,
} as const;

export const SRS_MASTERY_DISPLAY = {
  0: { label: 'New', color: 'text-muted-foreground', emoji: '🌱' },
  1: { label: 'Learning', color: 'text-blue-500', emoji: '📚' },
  2: { label: 'Familiar', color: 'text-cyan-500', emoji: '🌿' },
  3: { label: 'Proficient', color: 'text-green-500', emoji: '🌳' },
  4: { label: 'Expert', color: 'text-purple-500', emoji: '⭐' },
  5: { label: 'Mastered', color: 'text-yellow-500', emoji: '👑' },
} as const satisfies Record<MasteryLevel, MasteryDisplayInfo>;

export const SRS_RATING_LABELS = {
  again: 'Again',
  hard: 'Hard',
  good: 'Good',
  easy: 'Easy',
} as const satisfies Record<ConfidenceRating, string>;

export const SRS_PREVIEW_INTERVALS = {
  again: 1,
  hard: 2,
  good: 4,
  easy: 7,
} as const satisfies Record<ConfidenceRating, number>;

/**
 * Backward-compatible SRS_CONFIG object
 * Uses individual values to avoid undefined property access issues
 */
export const SRS_CONFIG = {
  easeFactor: SRS_EASE_FACTOR,
  initialIntervals: SRS_INITIAL_INTERVALS,
  maxInterval: SRS_MAX_INTERVAL,
  ratings: SRS_RATINGS,
  mastery: SRS_MASTERY,
  xp: SRS_XP,
  masteryBonusXP: SRS_MASTERY_BONUS_XP,
  levelFormula: SRS_LEVEL_FORMULA,
  masteryDisplay: SRS_MASTERY_DISPLAY,
  ratingLabels: SRS_RATING_LABELS,
  previewIntervals: SRS_PREVIEW_INTERVALS,
} as const;

/** Type for the full SRS configuration object */
export type SRSConfig = typeof SRS_CONFIG;

/**
 * Type-safe getters for SRS configuration values
 */
export const srsConfig = {
  getEaseFactor: () => SRS_EASE_FACTOR,
  getInitialIntervals: () => SRS_INITIAL_INTERVALS,
  getMaxInterval: () => SRS_MAX_INTERVAL,
  getRatingAdjustment: (rating: ConfidenceRating): RatingAdjustment => SRS_RATINGS[rating],
  getMasteryConfig: () => SRS_MASTERY,
  getMasteryLevel: (level: MasteryLevel): MasteryLevelConfig => {
    if (level === 0) return { intervalDays: 0, streakRequired: 0 };
    if (level === 1) return { intervalDays: 1, streakRequired: 1 };
    return SRS_MASTERY[MasteryLabels[level] as keyof MasteryConfig];
  },
  getXP: (rating: ConfidenceRating): number => SRS_XP[rating],
  getXPConfig: () => SRS_XP,
  getMasteryBonusXP: () => SRS_MASTERY_BONUS_XP,
  getLevelFormula: () => SRS_LEVEL_FORMULA,
  calculateLevel: (totalXP: number): number => 
    Math.floor(Math.sqrt(totalXP / SRS_LEVEL_FORMULA.xpDivisor)) + SRS_LEVEL_FORMULA.levelOffset,
  getMasteryDisplay: (level: MasteryLevel): MasteryDisplayInfo => SRS_MASTERY_DISPLAY[level],
  getMasteryDisplayConfig: () => SRS_MASTERY_DISPLAY,
  getRatingLabel: (rating: ConfidenceRating): string => SRS_RATING_LABELS[rating],
  getPreviewIntervals: () => SRS_PREVIEW_INTERVALS,
  getStorageKeys: () => SRS_STORAGE_KEYS,
} as const;

/** Mastery level to config key mapping */
const MasteryLabels: Record<MasteryLevel, string> = {
  0: 'new',
  1: 'learning',
  2: 'familiar',
  3: 'proficient',
  4: 'expert',
  5: 'mastered',
};

export default SRS_CONFIG;
