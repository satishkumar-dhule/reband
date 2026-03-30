/**
 * Application-wide constants
 * Centralized location for magic numbers, strings, and configuration values
 */

// ============================================
// STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
  // User preferences
  USER_PREFERENCES: 'user-preferences',
  THEME: 'theme',
  THEME_AUTO_ROTATE: 'theme-auto-rotate',
  THEME_USER_CHANGED: 'theme-user-changed',

  // Notifications
  NOTIFICATIONS: 'app-notifications',

  // Progress tracking
  PROGRESS_PREFIX: 'progress-',
  MARKED_PREFIX: 'marked-',
  LAST_VISITED_PREFIX: 'last-visited-',

  // Onboarding
  ONBOARDING_COMPLETE: 'onboarding-complete',  // Legacy fast-read key
  ONBOARDING_STEP: 'onboarding-step',
  ONBOARDING_ROLE: 'onboarding-role',
  ONBOARDING_CHANNELS: 'onboarding-channels',
  MARVEL_INTRO_SEEN: 'marvel-intro-seen',
  SWIPE_HINT_SEEN: 'swipe-hint-seen',
  GETTING_STARTED_SEEN: 'getting-started-seen',
  COACH_MARKS_SEEN: 'coach-marks-seen',
  PROGRESSIVE_ONBOARDING_DISMISSED: 'progressive-onboarding-dismissed',

  // Auth (used in ProtectedRoute.tsx)
  AUTH_TOKEN: 'devprep-auth-token',
  AUTH_EXPIRY: 'devprep-auth-expiry',

  // Timer settings
  TIMER_ENABLED: 'timer-enabled',
  TIMER_DURATION: 'timer-duration',

  // Activity tracking
  ACTIVITY_STATS: 'activity-stats',
  LAST_ACTIVITY_DATE: 'last-activity-date',

  // UI preferences
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  UI_TOGGLE_SEEN: 'ui-toggle-banner-seen',
  USE_NEW_UI: 'use-new-ui',
  WHATS_NEW_DISMISSED: 'whats-new-banner-dismissed',

  // Learning paths
  ACTIVE_LEARNING_PATHS: 'activeLearningPaths',
  CUSTOM_PATHS: 'customPaths',
  CUSTOM_LEARNING_PATHS: 'customLearningPaths',

  // Coding challenges
  CODING_PROGRESS: 'coding-challenge-progress',

  // Achievements
  ACHIEVEMENTS: 'devprep_achievements',

  // Confetti
  CONFETTI_PREFERENCE: 'confetti-preference',

  // Mermaid
  MERMAID_THEME: 'mermaid-theme',

  // Badges
  SHOWN_BADGES: 'shown-badge-unlocks',

  // AI Companion
  AI_COMPANION_MESSAGES: 'ai-companion-messages',

  // Test sessions
  TEST_AUTO_SUBMIT: 'test-auto-submit',
} as const;

/**
 * ONBOARDING STORAGE DOCUMENTATION
 * ================================
 * Onboarding state is stored across multiple locations:
 *
 * 1. UserPreferences (primary):
 *    - role: string | null - Selected career path
 *    - subscribedChannels: string[] - User's chosen channels
 *    - onboardingComplete: boolean - Full onboarding completion flag
 *    - Stored at: STORAGE_KEYS.USER_PREFERENCES
 *
 * 2. Onboarding-specific flags (legacy/progressive):
 *    - STORAGE_KEYS.ONBOARDING_STEP - Current step in multi-step onboarding
 *    - STORAGE_KEYS.ONBOARDING_ROLE - Persisted role selection
 *    - STORAGE_KEYS.ONBOARDING_CHANNELS - Persisted channel selection
 *
 * 3. Tutorial/hint flags:
 *    - MARVEL_INTRO_SEEN - Hero intro overlay shown
 *    - SWIPE_HINT_SEEN - Swipe gesture tutorial shown
 *    - GETTING_STARTED_SEEN - Getting started card dismissed
 *    - COACH_MARKS_SEEN - Interface coach marks shown
 *    - PROGRESSIVE_ONBOARDING_DISMISSED - Floating onboarding card dismissed
 *
 * Flow: User visits -> checks onboardingComplete in preferences -> redirects to /onboarding
 * Completion: role + channels set + onboardingComplete = true in USER_PREFERENCES
 */

// ============================================
// TIMING CONSTANTS
// ============================================
export const TIMING = {
  // Theme auto-rotation interval (15 minutes)
  AUTO_ROTATE_INTERVAL: 15 * 60 * 1000,
  
  // Default timer duration for questions (seconds)
  DEFAULT_TIMER_DURATION: 60,
  
  // Swipe hint display duration (ms)
  SWIPE_HINT_DURATION: 4000,
  
  // Toast display duration (ms)
  TOAST_DURATION: 3000,
  
  // Debounce delays (ms)
  SEARCH_DEBOUNCE: 300,
  RESIZE_DEBOUNCE: 150,
  
  // Animation durations (ms)
  ANIMATION_FAST: 150,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,
} as const;

// ============================================
// LIMITS
// ============================================
export const LIMITS = {
  // Maximum notifications stored
  MAX_NOTIFICATIONS: 50,
  
  // Minimum swipe distance for gesture detection (px)
  MIN_SWIPE_DISTANCE: 50,
  
  // Search results limit
  MAX_SEARCH_RESULTS: 50,
  
  // Question text truncation
  QUESTION_PREVIEW_LENGTH: 100,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
} as const;

// ============================================
// BREAKPOINTS
// ============================================
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// ============================================
// LAYOUT CONSTANTS
// Standardized layout values for consistent spacing and sizing
// ============================================
export const LAYOUT = {
  // Sidebar width (standardized across all sidebar implementations)
  SIDEBAR_WIDTH: 256, // w-64 = 256px
  
  // Header height
  HEADER_HEIGHT: 44,
  
  // Mobile navigation height
  MOBILE_NAV_HEIGHT: 64, // h-16 = 64px
  
  // Container padding
  CONTAINER_PADDING: {
    MOBILE: 16, // px-4 = 16px
    TABLET: 24,  // px-6 = 24px
    DESKTOP: 32, // px-8 = 32px
  },
  
  // Content max widths
  CONTENT_MAX_WIDTH: {
    DEFAULT: 1200,
    WIDE: 1400,
    NARROW: 800,
  },
  
  // Grid gutter spacing (standardized)
  GRID_GUTTER: {
    NONE: 0,
    SM: 8,   // gap-2
    MD: 16,  // gap-4
    LG: 24,  // gap-6
    XL: 32,  // gap-8
  },
  
  // Card and component border radius
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    FULL: 9999,
  },
  
  // Overflow strategy
  OVERFLOW: {
    // Content areas - prevent overflow
    CONTENT_HIDDEN: 'overflow-hidden',
    // Scrollable lists and containers
    SCROLL_Y: 'overflow-y-auto',
    SCROLL_X: 'overflow-x-auto',
    SCROLL_BOTH: 'overflow-auto',
    // Visible (no overflow handling)
    VISIBLE: 'overflow-visible',
  },
} as const;

// ============================================
// DIFFICULTY LEVELS
// ============================================
export const DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export type Difficulty = typeof DIFFICULTY[keyof typeof DIFFICULTY];

export const DIFFICULTY_COLORS = {
  [DIFFICULTY.BEGINNER]: '#22c55e',    // green-500
  [DIFFICULTY.INTERMEDIATE]: '#eab308', // yellow-500
  [DIFFICULTY.ADVANCED]: '#ef4444',     // red-500
} as const;

export const DIFFICULTY_LABELS = {
  [DIFFICULTY.BEGINNER]: 'Beginner',
  [DIFFICULTY.INTERMEDIATE]: 'Intermediate',
  [DIFFICULTY.ADVANCED]: 'Advanced',
} as const;

// ============================================
// NOTIFICATION TYPES
// ============================================
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// ============================================
// API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
  CHANNELS: '/api/channels',
  QUESTIONS: '/api/questions',
  QUESTION: '/api/question',
  STATS: '/api/stats',
  SUBCHANNELS: '/api/subchannels',
  COMPANIES: '/api/companies',
  CODING_CHALLENGES: '/api/coding/challenges',
  CODING_CHALLENGE: '/api/coding/challenge',
  CODING_RANDOM: '/api/coding/random',
  CODING_STATS: '/api/coding/stats',
} as const;

// ============================================
// ROUTES
// ============================================
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  WHATS_NEW: '/whats-new',
  STATS: '/stats',
  BADGES: '/badges',
  TESTS: '/tests',
  TEST: '/test',
  CODING: '/coding',
  BOT_ACTIVITY: '/bot-activity',
  CHANNELS: '/channels',
  CHANNEL: '/channel',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  MERMAID_TEST: '/test/mermaid',
} as const;

// ============================================
// EXTERNAL LINKS
// ============================================
export const EXTERNAL_LINKS = {
  GITHUB_REPO: 'https://github.com/open-interview/open-interview',
  GITHUB_ISSUES: 'https://github.com/open-interview/open-interview/issues/new',
  GITHUB_DISCUSSIONS: 'https://github.com/open-interview/open-interview/discussions',
  GITHUB_SPONSOR: 'https://github.com/sponsors/satishkumar-dhule',
} as const;

// ============================================
// APP METADATA
// ============================================
export const APP_METADATA = {
  NAME: 'Code Reels',
  VERSION: '2.3.0',
  DESCRIPTION: 'Free technical interview prep platform with 1000+ questions across 30+ channels. Voice interview practice, spaced repetition, coding challenges, and gamified learning.',
  CANONICAL_URL: 'https://open-interview.github.io',
} as const;

// ============================================
// POPULAR COMPANIES (for filtering/display)
// ============================================
export const POPULAR_COMPANIES = [
  'Google', 'Amazon', 'Meta', 'Microsoft', 'Apple',
  'Netflix', 'Uber', 'Airbnb', 'LinkedIn', 'Twitter',
  'Stripe', 'Salesforce', 'Adobe', 'Oracle', 'IBM',
] as const;

// ============================================
// COMPANY NAME ALIASES (for normalization)
// ============================================
export const COMPANY_ALIASES: Record<string, string> = {
  'facebook': 'Meta',
  'fb': 'Meta',
  'aws': 'Amazon',
  'msft': 'Microsoft',
  'goog': 'Google',
  'alphabet': 'Google',
};

// ============================================
// DEFAULT VALUES
// ============================================
export const DEFAULTS = {
  THEME: 'premium-dark',
  ROLE: null,
  SUBSCRIBED_CHANNELS: ['system-design', 'algorithms', 'frontend', 'backend', 'database', 'devops'],
  TIMER_DURATION: 60,
  AUTO_ROTATE_ENABLED: false,
} as const;
