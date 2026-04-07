/**
 * Unified API Service — GraphQL Edition
 *
 * All data fetching goes through the /graphql endpoint in dev mode.
 * Static JSON files at /data/* are used in production (static build).
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

import {
  fetchChannels,
  fetchChannelQuestions,
  fetchQuestion as fetchStaticQuestion,
  fetchRandomQuestion as fetchStaticRandomQuestion,
  fetchStats as fetchStaticStats,
  fetchSubChannels,
  fetchCompanies,
  clearCache as clearApiClientCache,
  type Question as StaticQuestion,
} from '../lib/api-client';

import { gql } from '../lib/graphql-client';
import {
  GET_CHANNELS,
  GET_QUESTIONS,
  GET_QUESTION,
  GET_RANDOM_QUESTION,
  SEARCH_QUESTIONS,
  GET_SUBCHANNELS,
  GET_COMPANIES,
  GET_STATS,
  GET_CODING_CHALLENGES,
  GET_CODING_CHALLENGE,
  GET_RANDOM_CODING_CHALLENGE,
  GET_CODING_STATS,
} from '../lib/graphql-queries';

function castQuestion(q: StaticQuestion): Question {
  return q as unknown as Question;
}

const IS_DEV = import.meta.env.DEV;

// ============================================
// SIMPLE IN-MEMORY CACHE (dev mode)
// ============================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CacheManager<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) {
    this.ttl = ttl;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
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
}

const channelDataCache = new CacheManager<ChannelData>(5 * 60 * 1000);
const statsCache = new CacheManager<ChannelDetailedStats[]>(5 * 60 * 1000);
const questionsCache = new CacheManager<Question>(10 * 60 * 1000);

// ============================================
// CHANNEL SERVICE
// ============================================
export const ChannelService = {
  async getAll(): Promise<ChannelStats[]> {
    if (IS_DEV) {
      const data = await gql<{ channels: { id: string; questionCount: number }[] }>(GET_CHANNELS);
      return data.channels;
    } else {
      return fetchChannels();
    }
  },

  async getData(channelId: string): Promise<ChannelData> {
    if (IS_DEV) {
      const cached = channelDataCache.get(channelId);
      if (cached) return cached;

      const [questionsData, subChannelsData, companiesData] = await Promise.all([
        gql<{ questions: Question[] }>(GET_QUESTIONS, { channelId }).catch(() => ({ questions: [] as Question[] })),
        gql<{ subchannels: string[] }>(GET_SUBCHANNELS, { channelId }).catch(() => ({ subchannels: [] })),
        gql<{ companies: string[] }>(GET_COMPANIES, { channelId }).catch(() => ({ companies: [] })),
      ]);

      const questions = questionsData.questions;
      const subChannels = subChannelsData.subchannels;
      const companies = companiesData.companies;

      const stats = {
        total: questions.length,
        beginner: questions.filter(q => q.difficulty === 'beginner').length,
        intermediate: questions.filter(q => q.difficulty === 'intermediate').length,
        advanced: questions.filter(q => q.difficulty === 'advanced').length,
      };

      const result: ChannelData = { questions, subChannels, companies, stats };
      channelDataCache.set(channelId, result);

      for (const q of questions) {
        questionsCache.set(q.id, q);
      }

      return result;
    } else {
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

      const data = await gql<{ question: Question }>(GET_QUESTION, { id: questionId });
      if (data.question) {
        questionsCache.set(questionId, data.question);
      }
      return data.question;
    } else {
      return castQuestion(await fetchStaticQuestion(questionId));
    }
  },

  async getRandom(channel?: string, difficulty?: string): Promise<Question> {
    if (IS_DEV) {
      const data = await gql<{ randomQuestion: Question }>(GET_RANDOM_QUESTION, { channel, difficulty });
      return data.randomQuestion;
    } else {
      return castQuestion(await fetchStaticRandomQuestion(channel, difficulty));
    }
  },

  async search(query: string, limit: number = 20): Promise<Question[]> {
    if (!query.trim()) return [];

    if (IS_DEV) {
      const data = await gql<{ search: { results: Question[] } }>(SEARCH_QUESTIONS, { query: query.trim(), limit });
      return data.search.results as unknown as Question[];
    } else {
      const channels = await fetchChannels();
      const searchQuery = query.toLowerCase();

      const BATCH_SIZE = 5;
      const results: Question[] = [];

      for (let i = 0; i < channels.length; i += BATCH_SIZE) {
        const batch = channels.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (ch) => {
            try {
              const questions = await fetchChannelQuestions(ch.id);
              return questions.filter(
                (q) =>
                  q.question.toLowerCase().includes(searchQuery) ||
                  q.tags?.some((t) => t.toLowerCase().includes(searchQuery))
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
        const data = await gql<{ stats: ChannelDetailedStats[] }>(GET_STATS);
        statsCache.set('all', data.stats);
        return data.stats;
      } catch {
        return [];
      }
    } else {
      return fetchStaticStats();
    }
  },
};

// ============================================
// CODING SERVICE
// ============================================
export const CodingService = {
  async getAll(filters: CodingFilters = {}): Promise<CodingChallenge[]> {
    if (IS_DEV) {
      try {
        const data = await gql<{ codingChallenges: CodingChallenge[] }>(GET_CODING_CHALLENGES, {
          difficulty: filters.difficulty,
          category: filters.category,
        });
        return data.codingChallenges;
      } catch {
        return [];
      }
    } else {
      console.warn('Coding challenges not available in production static mode');
      return [];
    }
  },

  async getById(id: string): Promise<CodingChallenge> {
    if (IS_DEV) {
      const data = await gql<{ codingChallenge: CodingChallenge }>(GET_CODING_CHALLENGE, { id });
      return data.codingChallenge;
    } else {
      throw new Error('Coding challenges not available in production static mode');
    }
  },

  async getRandom(difficulty?: string): Promise<CodingChallenge> {
    if (IS_DEV) {
      const data = await gql<{ randomCodingChallenge: CodingChallenge }>(GET_RANDOM_CODING_CHALLENGE, { difficulty });
      return data.randomCodingChallenge;
    } else {
      throw new Error('Coding challenges not available in production static mode');
    }
  },

  async getStats(): Promise<CodingStats> {
    if (IS_DEV) {
      const data = await gql<{ codingStats: CodingStats }>(GET_CODING_STATS);
      return data.codingStats;
    } else {
      return { total: 0, byDifficulty: { easy: 0, medium: 0 }, byCategory: {} };
    }
  },
};

// ============================================
// BLOG SERVICE (stub)
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
    clearApiClientCache();
  },

  invalidateChannel(channelId: string): void {
    if (IS_DEV) {
      channelDataCache.delete(channelId);
    }
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
// EXPORT
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
