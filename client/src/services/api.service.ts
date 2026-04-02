/**
 * Unified API Service
 * 
 * Environment-aware: switches between:
 * - Dev mode (import.meta.env.DEV): Express server API at /api/*
 * - Production mode: Static JSON files at /data/*
 * 
 * Uses the existing api-client.ts for static mode.
 */

import type {
  Question,
  ChannelStats,
  ChannelDetailedStats,
  ChannelData,
  CodingChallenge,
  CodingStats,
  QuestionFilters,
  CodingFilters,
} from '../types';

// Import static client (works in both dev and prod)
import {
  fetchChannels,
  fetchChannelQuestions,
  fetchQuestion as fetchStaticQuestion,
  fetchRandomQuestion as fetchStaticRandomQuestion,
  fetchStats as fetchStaticStats,
  fetchSubChannels,
  fetchCompanies,
  clearCache as clearApiClientCache,
  fetchQuestionIds,
  type Question as StaticQuestion,
} from '../lib/api-client';

// Type cast helper for static questions (relevanceDetails is string in api-client, RelevanceDetails in types)
function castQuestion(q: StaticQuestion): Question {
  return q as unknown as Question;
}

// Check if we're in development mode
const IS_DEV = import.meta.env.DEV;

// ============================================
// CACHE (used only in dev mode for API caching)
// ============================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CacheManager<T> {
  private cache = new Map<string, CacheEntry<T>>();
  // Default TTL: 5 minutes in development, 1 hour in production
  private ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) {
    this.ttl = ttl;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    // Check if entry is stale
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.data;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { data: value, timestamp: Date.now() });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  setTTL(ttl: number): void {
    this.ttl = ttl;
  }
}

// Cache with TTL: 5 minutes in dev mode
const channelDataCache = new CacheManager<ChannelData>(5 * 60 * 1000);
const statsCache = new CacheManager<ChannelDetailedStats[]>(5 * 60 * 1000);
const questionsCache = new CacheManager<Question>(10 * 60 * 1000);

// ============================================
// HTTP UTILITIES (dev mode only)
// ============================================
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(url: string, timeoutMs = 10000): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        url
      );
    }
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(`Request timeout after ${timeoutMs}ms`, 408, url);
    }
    throw error;
  }
}

// ============================================
// CHANNEL SERVICE
// ============================================
export const ChannelService = {
  async getAll(): Promise<ChannelStats[]> {
    if (IS_DEV) {
      // Dev mode: fetch from Express API
      const data = await fetchJson<{ id: string; questionCount: number }[]>('/api/channels');
      return data;
    } else {
      // Production mode: fetch from static JSON
      return fetchChannels();
    }
  },

  async getData(channelId: string): Promise<ChannelData> {
    if (IS_DEV) {
      // Dev mode: use cache and fetch from API
      const cached = channelDataCache.get(channelId);
      if (cached) return cached;

      const [questions, subChannels, companies] = await Promise.all([
        fetchJson<Question[]>(`/api/questions/${channelId}`).catch((err) => {
          console.warn(`Failed to fetch questions for channel ${channelId}:`, err);
          return [] as Question[];
        }),
        fetchJson<string[]>(`/api/subchannels/${channelId}`).catch((err) => {
          console.warn(`Failed to fetch subchannels for ${channelId}:`, err);
          return [] as string[];
        }),
        fetchJson<string[]>(`/api/companies/${channelId}`).catch((err) => {
          console.warn(`Failed to fetch companies for ${channelId}:`, err);
          return [] as string[];
        }),
      ]);

      const stats = {
        total: questions.length,
        beginner: questions.filter(q => q.difficulty === 'beginner').length,
        intermediate: questions.filter(q => q.difficulty === 'intermediate').length,
        advanced: questions.filter(q => q.difficulty === 'advanced').length,
      };

      const data: ChannelData = { questions, subChannels, companies, stats };
      channelDataCache.set(channelId, data);

      // Also cache individual questions
      for (const q of questions) {
        questionsCache.set(q.id, q);
      }

      return data;
    } else {
      // Production mode: use static client
      const [questions, subChannels, companies] = await Promise.all([
        fetchChannelQuestions(channelId),
        fetchSubChannels(channelId),
        fetchCompanies(channelId),
      ]);

      const stats = {
        total: questions.length,
        beginner: questions.filter(q => q.difficulty === 'beginner').length,
        intermediate: questions.filter(q => q.difficulty === 'intermediate').length,
        advanced: questions.filter(q => q.difficulty === 'advanced').length,
      };

      // Cache questions for later retrieval (cast to app Question type)
      const typedQuestions = questions.map(castQuestion);
      for (const q of typedQuestions) {
        questionsCache.set(q.id, q);
      }

      return { questions: typedQuestions, subChannels, companies, stats };
    }
  },

  async getSubChannels(channelId: string): Promise<string[]> {
    if (IS_DEV) {
      const data = await this.getData(channelId);
      return data.subChannels;
    } else {
      return fetchSubChannels(channelId);
    }
  },

  async getCompanies(channelId: string): Promise<string[]> {
    if (IS_DEV) {
      const data = await this.getData(channelId);
      return data.companies;
    } else {
      return fetchCompanies(channelId);
    }
  },

  // Invalidate cache for a specific channel or all channels
  invalidate(channelId?: string): void {
    if (channelId) {
      channelDataCache.delete(channelId);
      statsCache.delete(`channel-${channelId}`);
    } else {
      channelDataCache.clear();
      statsCache.clear();
    }
    questionsCache.clear();
  },
};

// ============================================
// QUESTION SERVICE
// ============================================
export const QuestionService = {
  async getByChannel(channelId: string, filters: QuestionFilters = {}): Promise<Question[]> {
    if (IS_DEV) {
      const data = await ChannelService.getData(channelId);
      let questions = data.questions;

      if (filters.subChannel && filters.subChannel !== 'all') {
        questions = questions.filter(q => q.subChannel === filters.subChannel);
      }
      if (filters.difficulty && filters.difficulty !== 'all') {
        questions = questions.filter(q => q.difficulty === filters.difficulty);
      }
      if (filters.company && filters.company !== 'all') {
        questions = questions.filter(q => q.companies?.includes(filters.company!));
      }

      return questions;
    } else {
      // Production: use static client - fetch all questions once and filter in memory
      const allQuestions = await fetchChannelQuestions(channelId);
      
      let questions = allQuestions;

      if (filters.subChannel && filters.subChannel !== 'all') {
        questions = questions.filter(q => q.subChannel === filters.subChannel);
      }
      if (filters.difficulty && filters.difficulty !== 'all') {
        questions = questions.filter(q => q.difficulty === filters.difficulty);
      }
      if (filters.company && filters.company !== 'all') {
        questions = questions.filter(q => q.companies?.includes(filters.company as string));
      }

      return questions.map(castQuestion);
    }
  },

  async getById(questionId: string): Promise<Question> {
    if (IS_DEV) {
      const cached = questionsCache.get(questionId);
      if (cached) return cached;

      const question = await fetchJson<Question>(`/api/question/${questionId}`);
      questionsCache.set(questionId, question);
      return question;
    } else {
      // Production mode: use static client
      return castQuestion(await fetchStaticQuestion(questionId));
    }
  },

  async getRandom(channel?: string, difficulty?: string): Promise<Question> {
    if (IS_DEV) {
      const params = new URLSearchParams();
      if (channel && channel !== 'all') params.set('channel', channel);
      if (difficulty && difficulty !== 'all') params.set('difficulty', difficulty);
      return fetchJson<Question>(`/api/question/random?${params}`);
    } else {
      // Production mode: use static client
      return castQuestion(await fetchStaticRandomQuestion(channel, difficulty));
    }
  },

  async search(query: string, limit: number = 20): Promise<Question[]> {
    if (!query.trim()) return [];

    if (IS_DEV) {
      const channels = await ChannelService.getAll();
      const results: Question[] = [];
      const q = query.toLowerCase();

      for (const ch of channels) {
        try {
          const data = await ChannelService.getData(ch.id);
          const matches = data.questions.filter(question =>
            question.question.toLowerCase().includes(q) ||
            question.tags?.some(t => t.toLowerCase().includes(q))
          );
          results.push(...matches);
          if (results.length >= limit) break;
        } catch {
          // skip
        }
      }

      return results.slice(0, limit);
    } else {
      // Production mode: search through all channels (parallel with bounded concurrency)
      const channels = await fetchChannels();
      const searchQuery = query.toLowerCase();

      // Process in batches of 5 to avoid overwhelming the browser
      const BATCH_SIZE = 5;
      const results: Question[] = [];

      for (let i = 0; i < channels.length; i += BATCH_SIZE) {
        const batch = channels.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (ch) => {
            try {
              const questions = await fetchChannelQuestions(ch.id);
              return questions.filter(
                (question) =>
                  question.question.toLowerCase().includes(searchQuery) ||
                  question.tags?.some((t) => t.toLowerCase().includes(searchQuery))
              );
            } catch {
              return [];
            }
          })
        );
        results.push(...batchResults.flat().map(castQuestion));
        if (results.length >= limit) break;
      }

      return results.slice(0, limit);
    }
  },
};

// ============================================
// STATS SERVICE
// ============================================
export const StatsService = {
  async getAll(): Promise<ChannelDetailedStats[]> {
    if (IS_DEV) {
      const cached = statsCache.get('all');
      if (cached) return cached;

      try {
        const data = await fetchJson<ChannelDetailedStats[]>('/api/stats');
        statsCache.set('all', data);
        return data;
      } catch {
        return [];
      }
    } else {
      // Production mode: use static client
      return fetchStaticStats();
    }
  },
};

// ============================================
// CODING SERVICE
// NOTE: Coding challenges don't have static JSON files yet.
// In production, this returns empty array. To fix, add static coding data.
// ============================================
export const CodingService = {
  async getAll(filters: CodingFilters = {}): Promise<CodingChallenge[]> {
    if (IS_DEV) {
      const params = new URLSearchParams();
      if (filters.difficulty) params.set('difficulty', filters.difficulty);
      if (filters.category) params.set('category', filters.category);
      try {
        return fetchJson<CodingChallenge[]>(`/api/coding/challenges?${params}`);
      } catch {
        return [];
      }
    } else {
      // Production: coding challenges not yet supported in static mode
      // TODO: Generate static coding challenge data
      // Note: Coding challenges currently require backend API and don't work in static mode
      console.warn('Coding challenges not available in production static mode');
      return [];
    }
  },

  async getById(id: string): Promise<CodingChallenge> {
    if (IS_DEV) {
      return fetchJson<CodingChallenge>(`/api/coding/challenge/${id}`);
    } else {
      throw new Error('Coding challenges not available in production static mode');
    }
  },

  async getRandom(difficulty?: string): Promise<CodingChallenge> {
    if (IS_DEV) {
      const params = new URLSearchParams();
      if (difficulty) params.set('difficulty', difficulty);
      return fetchJson<CodingChallenge>(`/api/coding/random?${params}`);
    } else {
      throw new Error('Coding challenges not available in production static mode');
    }
  },

  async getStats(): Promise<CodingStats> {
    if (IS_DEV) {
      return fetchJson<CodingStats>('/api/coding/stats');
    } else {
      return { total: 0, byDifficulty: { easy: 0, medium: 0 }, byCategory: {} };
    }
  },
};

// ============================================
// BLOG SERVICE (stub - no server endpoint)
// ============================================
export const BlogService = {
  async getAll(): Promise<Record<string, { title: string; slug: string; url: string }>> {
    return {};
  },
  async getByQuestionId(_questionId: string) {
    return null;
  },
};

// ============================================
// CACHE UTILITIES
// ============================================
export const CacheUtils = {
  clearAll(): void {
    if (IS_DEV) {
      channelDataCache.clear();
      statsCache.clear();
      questionsCache.clear();
    }
    // Also clear static client cache
    clearApiClientCache();
  },

  invalidateChannel(channelId: string): void {
    if (IS_DEV) {
      channelDataCache.delete(channelId);
    }
    // Also invalidate in static client
    clearApiClientCache();
  },

  async preloadAll(): Promise<void> {
    const channels = await ChannelService.getAll();
    const results = await Promise.allSettled(
      channels.map(ch => ChannelService.getData(ch.id))
    );
    
    const failedCount = results.filter(r => r.status === 'rejected').length;
    if (failedCount > 0) {
      console.warn(`Cache preload: ${failedCount}/${channels.length} channels failed to load`);
    }
  },

  // Force refresh a specific channel
  async refreshChannel(channelId: string): Promise<ChannelData | null> {
    CacheUtils.invalidateChannel(channelId);
    try {
      return await ChannelService.getData(channelId);
    } catch {
      return null;
    }
  },
};

// ============================================
// EXPORT DEFAULT API OBJECT
// ============================================
export const api = {
  channels: ChannelService,
  questions: QuestionService,
  stats: StatsService,
  coding: CodingService,
  blog: BlogService,
  cache: CacheUtils,
};

export default api;
