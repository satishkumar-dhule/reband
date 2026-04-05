/**
 * Questions loader - fetches questions from static JSON files
 * Data is pre-generated at build time from SQLite database
 *
 * Optimizations:
 * - Uses shared createTimedCache from api-client (no duplicate implementation)
 * - Progressive loading: only loads channels that are actually viewed
 * - Smart prefetching with bounded concurrency (max 2 concurrent prefetches)
 * - Lightweight stats from channels.json (no full channel load needed)
 */

import { api, QuestionService, ChannelService, StatsService } from '../services/api.service';
import { createTimedCache } from './api-client';
import { COMPANY_ALIASES, POPULAR_COMPANIES } from './constants';
import type { Question, ChannelDetailedStats } from '../types';

// Re-export Question type for backward compatibility
export type { Question };

// Base path for static data files
const DATA_BASE = import.meta.env.BASE_URL.replace(/\/$/, '') + '/data';

// Default TTL: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

// Shared caches (single source of truth)
const questionsCache = createTimedCache<Question>();
const channelQuestionsCache = createTimedCache<Question[]>();
const statsCacheEntry: { data: ChannelDetailedStats[] | null; timestamp: number | null } = { data: null, timestamp: null };
let initialized = false;

// Track prefetched channels to avoid duplicate prefetches
const prefetchedChannels = new Set<string>();

// Prefetch concurrency limiter
const MAX_PREFETCH_CONCURRENT = 2;
let activePrefetches = 0;
const prefetchQueue: Array<() => Promise<unknown>> = [];

function runNextPrefetch(): void {
  if (prefetchQueue.length === 0 || activePrefetches >= MAX_PREFETCH_CONCURRENT) return;
  activePrefetches++;
  const next = prefetchQueue.shift()!;
  next().then(() => {
    activePrefetches--;
    runNextPrefetch();
  }).catch(() => {
    activePrefetches--;
    runNextPrefetch();
  });
}

// Helper to check if stats cache is valid
function isStatsCacheValid(): boolean {
  if (!statsCacheEntry.data || statsCacheEntry.timestamp === null) return false;
  return Date.now() - statsCacheEntry.timestamp < DEFAULT_TTL;
}

// Related channels mapping for smart prefetching
const RELATED_CHANNELS: Record<string, string[]> = {
  'system-design': ['backend', 'database', 'devops', 'data-structures'],
  'algorithms': ['frontend', 'backend', 'system-design', 'data-structures', 'dynamic-programming'],
  'frontend': ['react-native', 'algorithms', 'backend'],
  'backend': ['database', 'system-design', 'devops', 'concurrency'],
  'database': ['backend', 'system-design', 'data-engineering'],
  'devops': ['kubernetes', 'aws', 'sre', 'terraform'],
  'kubernetes': ['devops', 'aws', 'sre'],
  'aws': ['devops', 'kubernetes', 'terraform'],
  'sre': ['devops', 'kubernetes', 'backend'],
  'generative-ai': ['machine-learning', 'llm-ops', 'prompt-engineering'],
  'machine-learning': ['generative-ai', 'nlp', 'computer-vision', 'math-logic'],
  'data-structures': ['algorithms', 'complexity-analysis', 'dynamic-programming'],
  'complexity-analysis': ['algorithms', 'data-structures', 'dynamic-programming'],
  'dynamic-programming': ['algorithms', 'data-structures', 'complexity-analysis'],
  'bit-manipulation': ['algorithms', 'low-level', 'concurrency'],
  'design-patterns': ['backend', 'system-design', 'concurrency'],
  'concurrency': ['backend', 'operating-systems', 'low-level'],
  'math-logic': ['algorithms', 'machine-learning', 'complexity-analysis'],
  'low-level': ['operating-systems', 'concurrency', 'security'],
};

// Load questions for a channel from static JSON
export async function loadChannelQuestions(channelId: string): Promise<Question[]> {
  if (channelQuestionsCache.has(channelId)) {
    return channelQuestionsCache.get(channelId)!;
  }

  try {
    const data = await ChannelService.getData(channelId);
    const questions = data.questions;
    channelQuestionsCache.set(channelId, questions);

    // Also cache individual questions
    for (let i = 0; i < questions.length; i++) {
      questionsCache.set(questions[i].id, questions[i]);
    }

    return questions;
  } catch (error) {
    console.error(`Failed to load questions for channel ${channelId}:`, error);
    return [];
  }
}

// Get all questions (sync - from cache)
export function getAllQuestions(): Question[] {
  return Array.from(questionsCache.getAll().values());
}

// Get questions for a channel with optional filters
export function getQuestions(
  channelId: string,
  subChannel?: string,
  difficulty?: string,
  company?: string
): Question[] {
  let questions = channelQuestionsCache.get(channelId) || [];

  if (subChannel && subChannel !== 'all') {
    questions = questions.filter(q => q.subChannel === subChannel);
  }

  if (difficulty && difficulty !== 'all') {
    questions = questions.filter(q => q.difficulty === difficulty);
  }

  if (company && company !== 'all') {
    const normalizedCompany = normalizeCompanyName(company);
    questions = questions.filter(q =>
      q.companies?.some((c: string) => normalizeCompanyName(c) === normalizedCompany)
    );
  }

  return questions;
}

// Get a single question by ID (sync - from cache)
export function getQuestionById(questionId: string): Question | undefined {
  return questionsCache.get(questionId);
}

// Get a single question by ID (async - will fetch if needed)
export async function getQuestionByIdAsync(questionId: string): Promise<Question | null> {
  if (questionsCache.has(questionId)) {
    return questionsCache.get(questionId)!;
  }

  try {
    const question = await QuestionService.getById(questionId);
    questionsCache.set(question.id, question);
    return question;
  } catch {
    return null;
  }
}

// Get question IDs for a channel with optional filters
export function getQuestionIds(
  channelId: string,
  subChannel?: string,
  difficulty?: string
): string[] {
  return getQuestions(channelId, subChannel, difficulty).map((q: Question) => q.id);
}

// Get subchannels for a channel
export function getSubChannels(channelId: string): string[] {
  const questions = channelQuestionsCache.get(channelId) || [];
  const subChannels = new Set<string>();
  questions.forEach((q: Question) => {
    if (q.subChannel) {
      subChannels.add(q.subChannel);
    }
  });
  return Array.from(subChannels).sort();
}

// Get channel statistics
export function getChannelStats(): { id: string; total: number; beginner: number; intermediate: number; advanced: number }[] {
  if (isStatsCacheValid()) {
    return statsCacheEntry.data!;
  }

  const allCached = channelQuestionsCache.getAll();
  const result: { id: string; total: number; beginner: number; intermediate: number; advanced: number }[] = [];
  allCached.forEach((questions, channelId) => {
    result.push({
      id: channelId,
      total: questions.length,
      beginner: questions.filter((q: Question) => q.difficulty === 'beginner').length,
      intermediate: questions.filter((q: Question) => q.difficulty === 'intermediate').length,
      advanced: questions.filter(q => q.difficulty === 'advanced').length,
    });
  });
  return result;
}

// Get available channel IDs
export function getAvailableChannelIds(): string[] {
  const keys: string[] = [];
  channelQuestionsCache.getAll().forEach((_, key) => keys.push(key));
  return keys;
}

// Check if a channel has questions
export function channelHasQuestions(channelId: string): boolean {
  return (channelQuestionsCache.get(channelId)?.length || 0) > 0;
}

// Normalize company name for consistency
function normalizeCompanyName(name: string): string {
  const normalized = name.trim();
  const lower = normalized.toLowerCase();
  return COMPANY_ALIASES[lower] || normalized;
}

// Get all unique companies across all questions
export function getAllCompanies(): string[] {
  const companies = new Set<string>();
  questionsCache.getAll().forEach((q) => {
    if (q.companies) {
      q.companies.forEach((c: string) => companies.add(normalizeCompanyName(c)));
    }
  });
  return Array.from(companies).sort();
}

// Get companies for a specific channel
export function getCompaniesForChannel(channelId: string): string[] {
  const questions = channelQuestionsCache.get(channelId) || [];
  const companies = new Set<string>();
  questions.forEach((q: Question) => {
    if (q.companies) {
      q.companies.forEach((c: string) => companies.add(normalizeCompanyName(c)));
    }
  });
  return Array.from(companies).sort();
}

// Get companies with counts for a channel
export function getCompaniesWithCounts(
  channelId: string,
  subChannel?: string,
  difficulty?: string
): { name: string; count: number }[] {
  let questions = channelQuestionsCache.get(channelId) || [];

  if (subChannel && subChannel !== 'all') {
    questions = questions.filter((q: Question) => q.subChannel === subChannel);
  }
  if (difficulty && difficulty !== 'all') {
    questions = questions.filter((q: Question) => q.difficulty === difficulty);
  }

  const companyCounts = new Map<string, number>();
  questions.forEach((q: Question) => {
    if (q.companies) {
      q.companies.forEach((c: string) => {
        const normalized = normalizeCompanyName(c);
        companyCounts.set(normalized, (companyCounts.get(normalized) || 0) + 1);
      });
    }
  });

  return Array.from(companyCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// Popular tech companies for prioritization in UI
export { POPULAR_COMPANIES };

/**
 * Prefetch related channels for faster navigation.
 * Uses bounded concurrency to avoid saturating the network.
 * Falls back to <link rel="prefetch"> for browser-native prefetching.
 */
export function prefetchRelatedChannels(currentChannel: string): void {
  if (typeof window === 'undefined') return;

  const related = RELATED_CHANNELS[currentChannel] || [];
  const allChannels = statsCacheEntry.data?.map((s: ChannelDetailedStats) => s.id) || [];
  const uniqueChannels = new Set([...related, ...allChannels]);
  const toPrefetch = Array.from(uniqueChannels)
    .filter(ch => ch !== currentChannel && !prefetchedChannels.has(ch) && !channelQuestionsCache.has(ch))
    .slice(0, 3);

  toPrefetch.forEach(channelId => {
    prefetchedChannels.add(channelId);

    // Queue with bounded concurrency — always load via the data layer
    // (api.service.ts routes this to /api/* in dev, /data/*.json in production)
    prefetchQueue.push(() => loadChannelQuestions(channelId));
    runNextPrefetch();

    // Browser-native link prefetch hint — only useful in production where
    // static JSON files exist at /data/. In development the Express API serves
    // channel data, so skip the hint to avoid 404 noise.
    if (!import.meta.env.DEV) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `${DATA_BASE}/${channelId}.json`;
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
}

/**
 * Preload a specific channel's data (higher priority than prefetch).
 * In production, adds a <link rel="preload"> hint for the static JSON file.
 * In development, the hint is skipped — the Express API serves channel data.
 */
export function preloadChannel(channelId: string): void {
  if (typeof window === 'undefined') return;
  if (channelQuestionsCache.has(channelId)) return;
  if (import.meta.env.DEV) return; // API serves this in dev; no static file to hint

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = `${DATA_BASE}/${channelId}.json`;
  link.as = 'fetch';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * Progressive preload: only load stats (lightweight) on init.
 * Full channel data is loaded on-demand when the user navigates to a channel.
 * This replaces the old preloadQuestions() which loaded ALL channels eagerly.
 */
export async function preloadQuestions(): Promise<void> {
  if (initialized) return;

  try {
    // Only fetch stats (channels.json) — lightweight, ~7KB
    const stats = await StatsService.getAll();
    statsCacheEntry.data = stats;
    statsCacheEntry.timestamp = Date.now();

    // Do NOT load all channel data eagerly.
    // Channel data is loaded on-demand via loadChannelQuestions().
    // This reduces initial payload from ~71KB to ~7KB.
    initialized = true;
  } catch (error) {
    console.error('Failed to preload questions:', error);
  }
}

// Get all questions async
export async function getAllQuestionsAsync(): Promise<Question[]> {
  if (!initialized) {
    await preloadQuestions();
  }
  return getAllQuestions();
}

// ============================================
// CACHE INVALIDATION
// ============================================

/**
 * Invalidate all caches - use when data needs to be refreshed
 */
export function invalidateAllCaches(): void {
  questionsCache.clear();
  channelQuestionsCache.clear();
  statsCacheEntry.data = null;
  statsCacheEntry.timestamp = null;
  initialized = false;
  prefetchedChannels.clear();
}

/**
 * Invalidate cache for a specific channel
 */
export function invalidateChannelCache(channelId: string): void {
  questionsCache.clear();
  channelQuestionsCache.delete(channelId);
  prefetchedChannels.delete(channelId);
}

/**
 * Force refresh a channel's questions
 */
export async function refreshChannel(channelId: string): Promise<Question[]> {
  invalidateChannelCache(channelId);
  return loadChannelQuestions(channelId);
}

// Export API service for direct use
export { api };
