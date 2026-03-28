/**
 * Unified API Service
 * Calls the Express server API (SQLite-backed), not static JSON files.
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

// ============================================
// CACHE
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
// HTTP UTILITIES
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
    const data = await fetchJson<{ id: string; questionCount: number }[]>('/api/channels');
    return data;
  },

  async getData(channelId: string): Promise<ChannelData> {
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
  },

  async getSubChannels(channelId: string): Promise<string[]> {
    const data = await this.getData(channelId);
    return data.subChannels;
  },

  async getCompanies(channelId: string): Promise<string[]> {
    const data = await this.getData(channelId);
    return data.companies;
  },
};

// ============================================
// QUESTION SERVICE
// ============================================
export const QuestionService = {
  async getByChannel(channelId: string, filters: QuestionFilters = {}): Promise<Question[]> {
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
  },

  async getById(questionId: string): Promise<Question> {
    const cached = questionsCache.get(questionId);
    if (cached) return cached;

    const question = await fetchJson<Question>(`/api/question/${questionId}`);
    questionsCache.set(questionId, question);
    return question;
  },

  async getRandom(channel?: string, difficulty?: string): Promise<Question> {
    const params = new URLSearchParams();
    if (channel && channel !== 'all') params.set('channel', channel);
    if (difficulty && difficulty !== 'all') params.set('difficulty', difficulty);
    return fetchJson<Question>(`/api/question/random?${params}`);
  },

  async search(query: string, limit: number = 20): Promise<Question[]> {
    if (!query.trim()) return [];
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
  },
};

// ============================================
// STATS SERVICE
// ============================================
export const StatsService = {
  async getAll(): Promise<ChannelDetailedStats[]> {
    const cached = statsCache.get('all');
    if (cached) return cached;

    try {
      const data = await fetchJson<ChannelDetailedStats[]>('/api/stats');
      statsCache.set('all', data);
      return data;
    } catch {
      return [];
    }
  },
};

// ============================================
// CODING SERVICE
// ============================================
export const CodingService = {
  async getAll(filters: CodingFilters = {}): Promise<CodingChallenge[]> {
    const params = new URLSearchParams();
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.category) params.set('category', filters.category);
    try {
      return fetchJson<CodingChallenge[]>(`/api/coding/challenges?${params}`);
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<CodingChallenge> {
    return fetchJson<CodingChallenge>(`/api/coding/challenge/${id}`);
  },

  async getRandom(difficulty?: string): Promise<CodingChallenge> {
    const params = new URLSearchParams();
    if (difficulty) params.set('difficulty', difficulty);
    return fetchJson<CodingChallenge>(`/api/coding/random?${params}`);
  },

  async getStats(): Promise<CodingStats> {
    return fetchJson<CodingStats>('/api/coding/stats');
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
    channelDataCache.clear();
    statsCache.clear();
    questionsCache.clear();
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
