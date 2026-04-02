/**
 * API client for fetching questions from static JSON files (GitHub Pages)
 * Data is pre-generated at build time from SQLite database
 *
 * Optimizations applied:
 * - Single shared cache utility (deduplicated from questions-loader)
 * - Stats served from channels.json (no need to load all channel files)
 * - Question ID → channel lookup index for O(1) question fetch
 * - AbortSignal support on all fetch calls
 * - Reduced redundant data in channel payloads
 */

// Base path for static data files
const DATA_BASE = import.meta.env.BASE_URL.replace(/\/$/, '') + '/data';

export interface Question {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  diagram?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  channel: string;
  subChannel: string;
  sourceUrl?: string;
  videos?: {
    shortVideo?: string;
    longVideo?: string;
  };
  companies?: string[];
  eli5?: string;
  relevanceScore?: number;
  lastUpdated?: string;
  tldr?: string;
  voiceKeywords?: string[];
  voiceSuitable?: boolean;
  isNew?: boolean;
  relevanceDetails?: string;
  jobTitleRelevance?: string[];
  experienceLevelTags?: string[];
}

export interface QuestionListItem {
  id: string;
  difficulty: string;
  subChannel: string;
}

export interface ChannelStats {
  id: string;
  questionCount: number;
}

export interface ChannelDetailedStats {
  id: string;
  total: number;
  beginner: number;
  intermediate: number;
  advanced: number;
}

interface ChannelData {
  questions: Question[];
  subChannels: string[];
  companies: string[];
  stats: {
    total: number;
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

// ─── Shared timed cache (single implementation, used by both api-client and questions-loader) ───

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_TTL = 5 * 60 * 1000;

export function createTimedCache<T>() {
  const cache = new Map<string, CacheEntry<T>>();

  return {
    get(key: string, ttl: number = DEFAULT_TTL): T | undefined {
      const entry = cache.get(key);
      if (!entry) return undefined;
      if (Date.now() - entry.timestamp > ttl) {
        cache.delete(key);
        return undefined;
      }
      return entry.data;
    },

    set(key: string, value: T): void {
      cache.set(key, { data: value, timestamp: Date.now() });
    },

    has(key: string, ttl: number = DEFAULT_TTL): boolean {
      return this.get(key, ttl) !== undefined;
    },

    delete(key: string): void {
      cache.delete(key);
    },

    clear(): void {
      cache.clear();
    },

    getAll(): Map<string, T> {
      const result = new Map<string, T>();
      for (const [key, entry] of Array.from(cache.entries())) {
        if (Date.now() - entry.timestamp <= DEFAULT_TTL) {
          result.set(key, entry.data);
        }
      }
      return result;
    },

    entries(): IterableIterator<[string, T]> {
      const now = Date.now();
      const validEntries: [string, T][] = [];
      cache.forEach((entry, key) => {
        if (now - entry.timestamp <= DEFAULT_TTL) {
          validEntries.push([key, entry.data]);
        }
      });
      return validEntries[Symbol.iterator]();
    },
  };
}

// ─── In-memory caches ───

const channelCache = createTimedCache<ChannelData>();
const statsCache = createTimedCache<ChannelDetailedStats[]>();
// Reverse index: questionId → channelId for O(1) lookup
const questionIdToChannel = new Map<string, string>();
// Lightweight index loaded from all-questions.json (small, fast)
let searchIndexLoaded = false;
const searchIndexCache = createTimedCache<QuestionListItem[]>();

// Build version for cache busting
const BUILD_VERSION = import.meta.env.VITE_BUILD_TIMESTAMP || Date.now().toString();

// ─── Fetch utilities ───

/**
 * Fetch with retry logic and exponential backoff
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, backoff * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const cacheBuster = `v=${BUILD_VERSION}`;
  const urlWithCache = url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;

  const response = await fetch(urlWithCache, {
    signal,
    // Let the browser handle HTTP caching — static files are cacheable
    cache: 'default',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

// ─── Answer sanitization ───

function sanitizeAnswer(answer: string | undefined): string {
  if (!answer || typeof answer !== 'string') return answer ?? '';
  const trimmed = answer.trim();
  if (trimmed.startsWith('[{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const correctOption = parsed.find((opt: any) => opt.isCorrect === true);
        if (correctOption?.text) return correctOption.text;
      }
    } catch { /* fall through */ }
  }
  return answer;
}

// ─── Channel data loading ───

async function loadChannelData(channelId: string, signal?: AbortSignal): Promise<ChannelData> {
  if (channelCache.has(channelId)) {
    return channelCache.get(channelId)!;
  }

  const manifest = await fetchJson<any>(`${DATA_BASE}/${channelId}.json`, signal);

  // Check if this is a chunked channel
  if (manifest.chunked && manifest.totalChunks) {
    return loadChunkedChannel(channelId, manifest, signal);
  }

  // Standard single-file channel
  const data = manifest as ChannelData;
  if (data.questions && Array.isArray(data.questions)) {
    for (const q of data.questions) {
      q.answer = sanitizeAnswer(q.answer);
      questionIdToChannel.set(q.id, channelId);
    }
  }

  channelCache.set(channelId, data);
  return data;
}

/**
 * Load a chunked channel by fetching all chunks in parallel.
 * Chunks are small enough (~2-3KB each) to be fetched concurrently.
 */
async function loadChunkedChannel(
  channelId: string,
  manifest: { subChannels: string[]; companies: string[]; stats: any; totalChunks: number },
  signal?: AbortSignal
): Promise<ChannelData> {
  const chunkPromises: Promise<any>[] = [];
  for (let i = 0; i < manifest.totalChunks; i++) {
    chunkPromises.push(
      fetchJson<any>(`${DATA_BASE}/${channelId}-chunk-${i}.json`, signal)
    );
  }

  const chunks = await Promise.all(chunkPromises);
  const allQuestions: Question[] = [];

  for (const chunk of chunks) {
    if (chunk.questions && Array.isArray(chunk.questions)) {
      for (const q of chunk.questions) {
        q.answer = sanitizeAnswer(q.answer);
        questionIdToChannel.set(q.id, channelId);
      }
      allQuestions.push(...chunk.questions);
    }
  }

  const data: ChannelData = {
    questions: allQuestions,
    subChannels: manifest.subChannels || [],
    companies: manifest.companies || [],
    stats: manifest.stats || { total: allQuestions.length, beginner: 0, intermediate: 0, advanced: 0 },
  };

  channelCache.set(channelId, data);
  return data;
}

// ─── Public API ───

/**
 * Get all channels with question counts.
 * Reads from channels.json only — does NOT load individual channel files.
 */
export async function fetchChannels(): Promise<ChannelStats[]> {
  return fetchJson<ChannelStats[]>(`${DATA_BASE}/channels.json`);
}

/**
 * Get channel statistics from channels.json (already contains per-channel stats).
 * This avoids loading every channel JSON file just to compute stats.
 */
export async function fetchStats(): Promise<ChannelDetailedStats[]> {
  if (statsCache.has('all')) {
    return statsCache.get('all')!;
  }

  const channels = await fetchChannels();
  const stats: ChannelDetailedStats[] = channels.map(ch => ({
    id: ch.id,
    total: (ch as any).total ?? ch.questionCount ?? 0,
    beginner: (ch as any).beginner ?? 0,
    intermediate: (ch as any).intermediate ?? 0,
    advanced: (ch as any).advanced ?? 0,
  }));

  statsCache.set('all', stats);
  return stats;
}

/**
 * Get question IDs for a channel with optional filters.
 * Uses the lightweight search index when only IDs are needed (no full question data).
 */
export async function fetchQuestionIds(
  channelId: string,
  subChannel?: string,
  difficulty?: string
): Promise<QuestionListItem[]> {
  const cacheKey = `${channelId}:${subChannel || 'all'}:${difficulty || 'all'}`;
  if (searchIndexCache.has(cacheKey)) {
    return searchIndexCache.get(cacheKey)!;
  }

  const data = await loadChannelData(channelId);
  let questions = data.questions;

  if (subChannel && subChannel !== 'all') {
    questions = questions.filter(q => q.subChannel === subChannel);
  }
  if (difficulty && difficulty !== 'all') {
    questions = questions.filter(q => q.difficulty === difficulty);
  }

  const result = questions.map(q => ({
    id: q.id,
    difficulty: q.difficulty,
    subChannel: q.subChannel,
  }));

  searchIndexCache.set(cacheKey, result);
  return result;
}

/**
 * Get a single question by ID using the reverse index for O(1) lookup.
 */
export async function fetchQuestion(questionId: string): Promise<Question> {
  // Fast path: check reverse index
  const cachedChannel = questionIdToChannel.get(questionId);
  if (cachedChannel && channelCache.has(cachedChannel)) {
    const data = channelCache.get(cachedChannel)!;
    const question = data.questions.find(q => q.id === questionId);
    if (question) return question;
  }

  // Medium path: search already-loaded channels
  const allLoaded = channelCache.getAll();
  let found: Question | undefined;
  allLoaded.forEach((data) => {
    if (found) return;
    const q = data.questions.find((qq: Question) => qq.id === questionId);
    if (q) found = q;
  });
  if (found) return found;

  // Slow path: load the search index to find which channel owns this question
  if (!searchIndexLoaded) {
    try {
      const index = await fetchJson<{ id: string; channel: string }[]>(`${DATA_BASE}/all-questions.json`);
      for (let i = 0; i < index.length; i++) {
        const item = index[i];
        if (!questionIdToChannel.has(item.id)) {
          questionIdToChannel.set(item.id, item.channel);
        }
      }
      searchIndexLoaded = true;
    } catch {
      // Index unavailable — fall through to brute-force
    }
  }

  // Use the index to load only the right channel
  const targetChannel = questionIdToChannel.get(questionId);
  if (targetChannel) {
    const data = await loadChannelData(targetChannel);
    const question = data.questions.find(q => q.id === questionId);
    if (question) return question;
  }

  throw new Error(`Question not found: ${questionId}`);
}

/**
 * Get a random question from one or all channels.
 */
export async function fetchRandomQuestion(
  channel?: string,
  difficulty?: string
): Promise<Question> {
  let questions: Question[] = [];

  if (channel && channel !== 'all') {
    const data = await loadChannelData(channel);
    questions = data.questions;
  } else {
    const channels = await fetchChannels();
    for (const ch of channels) {
      try {
        const data = await loadChannelData(ch.id);
        questions.push(...data.questions);
      } catch { /* skip */ }
    }
  }

  if (difficulty && difficulty !== 'all') {
    questions = questions.filter(q => q.difficulty === difficulty);
  }

  if (questions.length === 0) {
    throw new Error('No questions found');
  }

  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Get subchannels for a channel.
 */
export async function fetchSubChannels(channelId: string): Promise<string[]> {
  const data = await loadChannelData(channelId);
  return data.subChannels;
}

/**
 * Get companies for a channel.
 */
export async function fetchCompanies(channelId: string): Promise<string[]> {
  const data = await loadChannelData(channelId);
  return data.companies;
}

/**
 * Get all questions for a channel (full data).
 */
export async function fetchChannelQuestions(channelId: string): Promise<Question[]> {
  const data = await loadChannelData(channelId);
  return data.questions;
}

/**
 * Clear all caches.
 */
export function clearCache(): void {
  channelCache.clear();
  statsCache.clear();
  searchIndexCache.clear();
  questionIdToChannel.clear();
  searchIndexLoaded = false;
}

/**
 * Invalidate a specific channel's cache.
 */
export function invalidateChannel(channelId: string): void {
  channelCache.delete(channelId);
  // Remove reverse index entries for this channel
  const toDelete: string[] = [];
  questionIdToChannel.forEach((ch, qid) => {
    if (ch === channelId) toDelete.push(qid);
  });
  for (let i = 0; i < toDelete.length; i++) {
    questionIdToChannel.delete(toDelete[i]);
  }
}
