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
class CacheManager<T> {
  private cache = new Map<string, T>();

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const channelDataCache = new CacheManager<ChannelData>();
const statsCache = new CacheManager<ChannelDetailedStats[]>();
const questionsCache = new CacheManager<Question>();

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

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      url
    );
  }
  return response.json();
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
        fetchJson<Question[]>(`/api/questions/${channelId}`).catch(() => [] as Question[]),
        fetchJson<string[]>(`/api/subchannels/${channelId}`).catch(() => [] as string[]),
        fetchJson<string[]>(`/api/companies/${channelId}`).catch(() => [] as string[]),
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
      const questions = await fetchChannelQuestions(channelId);
      const subChannels = await fetchSubChannels(channelId);
      const companies = await fetchCompanies(channelId);

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
      // Production: use static client with filtering
      const questionItems = await fetchQuestionIds(
        channelId,
        filters.subChannel,
        filters.difficulty
      );

      // Get full question data for filtered items
      const questions: Question[] = [];
      for (const item of questionItems) {
        try {
          const q = await fetchStaticQuestion(item.id);
          // Additional company filter if needed
          if (filters.company && filters.company !== 'all') {
            if (!q.companies?.includes(filters.company)) continue;
          }
          questions.push(castQuestion(q));
        } catch {
          // Skip if question not found
        }
      }

      return questions;
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
      // Production mode: search through all channels
      const channels = await fetchChannels();
      const results: Question[] = [];
      const searchQuery = query.toLowerCase();

      for (const ch of channels) {
        try {
          const questions = await fetchChannelQuestions(ch.id);
          const matches = questions
            .filter(question =>
              question.question.toLowerCase().includes(searchQuery) ||
              question.tags?.some(t => t.toLowerCase().includes(searchQuery))
            )
            .map(castQuestion);
          results.push(...matches);
          if (results.length >= limit) break;
        } catch {
          // Skip if channel fails
        }
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

  async preloadAll(): Promise<void> {
    const channels = await ChannelService.getAll();
    await Promise.all(
      channels.map(ch => ChannelService.getData(ch.id).catch(() => null))
    );
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
