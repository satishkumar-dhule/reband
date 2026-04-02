/**
 * Skill Agents Index
 * Central registry of all 20 specialized skill agents
 */

export { BaseSkillAgent, type Skill, type SkillContext, type SkillResult, type SkillCategory } from './SkillAgent';

import {
  skillAgents,
  allSkillAgents,
  LearningPathAgent,
  SpacedRepetitionAgent,
  QuestionBankAgent,
  VoicePracticeAgent,
  CodingChallengeAgent,
  AnalyticsAgent,
  UserProgressAgent,
  NotificationAgent,
  CertificationAgent,
  SearchAgent,
  BookmarkAgent,
  ThemeAgent,
  TimerAgent,
  ChannelAgent,
  OnboardingAgent,
  PreferencesAgent,
  SyncAgent,
  RecommendationAgent,
  BadgeAgent,
  ExportAgent,
  CacheAgent,
  ContentAgent,
} from './AllSkillAgents';

export {
  skillAgents,
  allSkillAgents,
  LearningPathAgent,
  SpacedRepetitionAgent,
  QuestionBankAgent,
  VoicePracticeAgent,
  CodingChallengeAgent,
  AnalyticsAgent,
  UserProgressAgent,
  NotificationAgent,
  CertificationAgent,
  SearchAgent,
  BookmarkAgent,
  ThemeAgent,
  TimerAgent,
  ChannelAgent,
  OnboardingAgent,
  PreferencesAgent,
  SyncAgent,
  RecommendationAgent,
  BadgeAgent,
  ExportAgent,
  CacheAgent,
  ContentAgent,
};

export const SKILL_REGISTRY = {
  learningPath: {
    id: 'skill-learning-path',
    name: 'Learning Path Agent',
    category: 'learning',
    description: 'Manages personalized learning paths and progress tracking',
    capabilities: ['create-path', 'track-progress', 'recommend-next', 'generate-insights'],
  },
  spacedRepetition: {
    id: 'skill-spaced-repetition',
    name: 'Spaced Repetition Agent',
    category: 'learning',
    description: 'Manages SRS flashcards and review scheduling',
    capabilities: ['schedule-review', 'calculate-interval', 'track-recall', 'optimize-review'],
  },
  questionBank: {
    id: 'skill-question-bank',
    name: 'Question Bank Agent',
    category: 'content',
    description: 'Manages question retrieval, filtering, and caching',
    capabilities: ['fetch-questions', 'filter-questions', 'cache-questions', 'search-questions'],
  },
  voicePractice: {
    id: 'skill-voice-practice',
    name: 'Voice Practice Agent',
    category: 'practice',
    description: 'Handles voice interview practice and speech analysis',
    capabilities: ['start-session', 'analyze-speech', 'evaluate-answer', 'generate-feedback'],
  },
  codingChallenge: {
    id: 'skill-coding-challenge',
    name: 'Coding Challenge Agent',
    category: 'practice',
    description: 'Manages coding challenges and code execution',
    capabilities: ['fetch-challenge', 'validate-solution', 'run-tests', 'provide-hints'],
  },
  analytics: {
    id: 'skill-analytics',
    name: 'Analytics Agent',
    category: 'analytics',
    description: 'Tracks and analyzes user learning analytics',
    capabilities: ['track-event', 'generate-stats', 'calculate-streak', 'export-data'],
  },
  userProgress: {
    id: 'skill-user-progress',
    name: 'User Progress Agent',
    category: 'user',
    description: 'Manages user progress across channels',
    capabilities: ['get-progress', 'mark-complete', 'toggle-bookmark', 'reset-progress'],
  },
  notification: {
    id: 'skill-notification',
    name: 'Notification Agent',
    category: 'user',
    description: 'Manages user notifications and alerts',
    capabilities: ['send-notification', 'get-notifications', 'mark-read', 'clear-notifications'],
  },
  certification: {
    id: 'skill-certification',
    name: 'Certification Agent',
    category: 'learning',
    description: 'Manages certification paths and exam preparation',
    capabilities: ['get-certifications', 'track-progress', 'recommend-path', 'generate-exam'],
  },
  search: {
    id: 'skill-search',
    name: 'Search Agent',
    category: 'content',
    description: 'Handles search across questions, challenges, and content',
    capabilities: ['search-all', 'filter-results', 'suggest-queries', 'index-content'],
  },
  bookmark: {
    id: 'skill-bookmark',
    name: 'Bookmark Agent',
    category: 'user',
    description: 'Manages bookmarks and saved items',
    capabilities: ['add-bookmark', 'remove-bookmark', 'list-bookmarks', 'sync-bookmarks'],
  },
  theme: {
    id: 'skill-theme',
    name: 'Theme Agent',
    category: 'user',
    description: 'Manages application theming and user preferences',
    capabilities: ['get-theme', 'set-theme', 'rotate-theme', 'export-theme'],
  },
  timer: {
    id: 'skill-timer',
    name: 'Timer Agent',
    category: 'practice',
    description: 'Manages practice session timers',
    capabilities: ['start-timer', 'pause-timer', 'get-time', 'configure-timer'],
  },
  channel: {
    id: 'skill-channel',
    name: 'Channel Agent',
    category: 'content',
    description: 'Manages learning channels and subchannels',
    capabilities: ['list-channels', 'get-channel', 'subscribe-channel', 'get-stats'],
  },
  onboarding: {
    id: 'skill-onboarding',
    name: 'Onboarding Agent',
    category: 'user',
    description: 'Manages user onboarding and guided tours',
    capabilities: ['check-status', 'mark-complete', 'get-next-step', 'reset-onboarding'],
  },
  preferences: {
    id: 'skill-preferences',
    name: 'Preferences Agent',
    category: 'user',
    description: 'Manages user preferences and settings',
    capabilities: ['get-preferences', 'update-preferences', 'reset-preferences', 'export-preferences'],
  },
  sync: {
    id: 'skill-sync',
    name: 'Sync Agent',
    category: 'analytics',
    description: 'Synchronizes local data with database as source of truth',
    capabilities: ['sync-progress', 'sync-bookmarks', 'resolve-conflicts', 'force-sync'],
  },
  recommendation: {
    id: 'skill-recommendation',
    name: 'Recommendation Agent',
    category: 'learning',
    description: 'Provides personalized content recommendations',
    capabilities: ['recommend-questions', 'recommend-challenges', 'recommend-paths', 'analyze-preferences'],
  },
  badge: {
    id: 'skill-badge',
    name: 'Badge Agent',
    category: 'analytics',
    description: 'Manages gamification badges and achievements',
    capabilities: ['check-badges', 'award-badge', 'get-progress', 'list-badges'],
  },
  export: {
    id: 'skill-export',
    name: 'Export Agent',
    category: 'user',
    description: 'Exports user data in various formats',
    capabilities: ['export-json', 'export-csv', 'generate-report', 'backup-data'],
  },
  cache: {
    id: 'skill-cache',
    name: 'Cache Agent',
    category: 'analytics',
    description: 'Manages application caching for performance',
    capabilities: ['cache-question', 'invalidate-cache', 'get-cache-stats', 'clear-cache'],
  },
  content: {
    id: 'skill-content',
    name: 'Content Agent',
    category: 'content',
    description: 'Manages static content and configuration',
    capabilities: ['get-content', 'update-content', 'list-content', 'refresh-content'],
  },
} as const;

export type SkillAgentId = keyof typeof SKILL_REGISTRY;

export const SKILL_CATEGORIES = {
  learning: {
    name: 'Learning',
    description: 'Learning path and progress management',
    color: '#22c55e',
  },
  practice: {
    name: 'Practice',
    description: 'Practice sessions and exercises',
    color: '#3b82f6',
  },
  analytics: {
    name: 'Analytics',
    description: 'Analytics and data tracking',
    color: '#f59e0b',
  },
  content: {
    name: 'Content',
    description: 'Content management and retrieval',
    color: '#8b5cf6',
  },
  user: {
    name: 'User',
    description: 'User preferences and management',
    color: '#ec4899',
  },
} as const;

export function getSkillAgent(id: SkillAgentId) {
  return skillAgents[id];
}

export function getSkillByCategory(category: string) {
  return Object.values(SKILL_REGISTRY).filter(skill => skill.category === category);
}

export function initializeSkillAgents() {
  const initialized: Array<{id: string; name: string; status: string}> = [];
  
  for (const agent of allSkillAgents) {
    const status = agent.getStatus();
    initialized.push({
      id: status.id,
      name: status.name,
      status: status.status,
    });
  }
  
  return initialized;
}
