/**
 * API client for fetching questions from static JSON files (GitHub Pages)
 * Data is pre-generated at build time from Turso database
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
  // Additional fields from database
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

// Cache for loaded data with TTL support
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Default TTL: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

function createTimedCache<T>() {
  const cache = new Map<string, CacheEntry<T>>();
  
  return {
    get(key: string, ttl: number = DEFAULT_TTL): T | undefined {
      const entry = cache.get(key);
      if (!entry) return undefined;
      
      // Check if entry is stale
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
  };
}

const channelCache = createTimedCache<ChannelData>();
// Internal map for iteration (channelCache doesn't support entries())
const channelDataMap = new Map<string, ChannelData>();
const statsCacheEntry: { data: ChannelDetailedStats[] | null; timestamp: number | null } = { data: null, timestamp: null };
const questionIdToChannel = new Map<string, string>();

// Get the internal map for iteration operations
function getChannelDataMap(): Map<string, ChannelData> {
  return channelDataMap;
}

// Helper to check if stats cache is valid
function isStatsCacheValid(): boolean {
  if (!statsCacheEntry.data || statsCacheEntry.timestamp === null) return false;
  return Date.now() - statsCacheEntry.timestamp < DEFAULT_TTL;
}

/**
 * Fetch with retry logic and exponential backoff
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param retries - Number of retry attempts (default: 3)
 * @param backoff - Initial backoff delay in ms (default: 1000)
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
      console.warn(`Fetch failed (attempt ${i + 1}/${retries}), retrying in ${backoff * Math.pow(2, i)}ms...`, error);
      await new Promise(r => setTimeout(r, backoff * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  try {
    // Simple cache busting - add build timestamp
    const cacheBuster = `v=${BUILD_VERSION}`;
    const urlWithCache = url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;
    
    const response = await fetch(urlWithCache, { signal });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    // Handle network errors gracefully
    if (error instanceof TypeError && error.message.includes('network')) {
      throw new Error('Network error: Please check your internet connection');
    }
    throw error;
  }
}

// Build version for cache busting - use timestamp to ensure fresh data on rebuild
const BUILD_VERSION = import.meta.env.VITE_BUILD_TIMESTAMP || Date.now().toString();

// Sanitize answer field if it contains MCQ JSON format
function sanitizeAnswer(answer: string | undefined): string {
  if (!answer || typeof answer !== 'string') return answer ?? '';
  
  const trimmed = answer.trim();
  if (trimmed.startsWith('[{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const correctOption = parsed.find((opt: any) => opt.isCorrect === true);
        if (correctOption?.text) {
          return correctOption.text;
        }
      }
    } catch (e) {
      // Return original if parsing fails
    }
  }
  
  return answer;
}

async function loadChannelData(channelId: string): Promise<ChannelData> {
  if (channelCache.has(channelId)) {
    return channelCache.get(channelId)!;
  }

  const data = await fetchJson<ChannelData>(`${DATA_BASE}/${channelId}.json`);
  
  // Sanitize all questions in the channel data
  if (data.questions && Array.isArray(data.questions)) {
    data.questions = data.questions.map(q => ({
      ...q,
      answer: sanitizeAnswer(q.answer)
    }));
  }
  
  // Build question ID to channel mapping for fast lookups
  for (const q of data.questions) {
    questionIdToChannel.set(q.id, channelId);
  }
  
  // Store in both caches
  channelCache.set(channelId, data);
  channelDataMap.set(channelId, data); // For iteration support
  return data;
}

// Get all channels with question counts
export async function fetchChannels(): Promise<ChannelStats[]> {
  const data = await fetchJson<ChannelStats[]>(`${DATA_BASE}/channels.json`);
  return data;
}

// Get question IDs for a channel with optional filters
export async function fetchQuestionIds(
  channelId: string,
  subChannel?: string,
  difficulty?: string
): Promise<QuestionListItem[]> {
  const data = await loadChannelData(channelId);
  
  let questions = data.questions;
  
  if (subChannel && subChannel !== 'all') {
    questions = questions.filter(q => q.subChannel === subChannel);
  }
  
  if (difficulty && difficulty !== 'all') {
    questions = questions.filter(q => q.difficulty === difficulty);
  }
  
  return questions.map(q => ({
    id: q.id,
    difficulty: q.difficulty,
    subChannel: q.subChannel
  }));
}

// Get a single question by ID
export async function fetchQuestion(questionId: string): Promise<Question> {
  // Fast path: check if we've already loaded this question's channel
  const cachedChannel = questionIdToChannel.get(questionId);
  if (cachedChannel && channelCache.has(cachedChannel)) {
    const data = channelCache.get(cachedChannel)!;
    const question = data.questions.find(q => q.id === questionId);
    if (question) return question;
  }
  
  // Slow path: search through all loaded channels (use the internal map for iteration)
  const dataMap = getChannelDataMap();
  for (const [channelId, data] of Array.from(dataMap.entries())) {
    const question = data.questions.find((q: Question) => q.id === questionId);
    if (question) {
      questionIdToChannel.set(questionId, channelId);
      return question;
    }
  }
  
  // Fallback: load channels from index and search
  const channels = await fetchChannels();
  
  for (const channel of channels) {
    try {
      const data = await loadChannelData(channel.id);
      const question = data.questions.find(q => q.id === questionId);
      if (question) {
        return question;
      }
    } catch {
      // Channel file might not exist, continue
    }
  }
  
  throw new Error(`Question not found: ${questionId}`);
}

// Get a random question
export async function fetchRandomQuestion(
  channel?: string,
  difficulty?: string
): Promise<Question> {
  let questions: Question[] = [];
  
  if (channel && channel !== 'all') {
    const data = await loadChannelData(channel);
    questions = data.questions;
  } else {
    // Load all channels
    const channels = await fetchChannels();
    for (const ch of channels) {
      try {
        const data = await loadChannelData(ch.id);
        questions.push(...data.questions);
      } catch {
        // Continue if channel fails
      }
    }
  }
  
  if (difficulty && difficulty !== 'all') {
    questions = questions.filter(q => q.difficulty === difficulty);
  }
  
  if (questions.length === 0) {
    throw new Error('No questions found');
  }
  
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

// Get channel statistics
export async function fetchStats(): Promise<ChannelDetailedStats[]> {
  // Check if stats cache is valid (within TTL)
  if (isStatsCacheValid()) {
    return statsCacheEntry.data!;
  }
  
  const channels = await fetchChannels();
  
  // Parallelize channel data loading
  const results = await Promise.all(
    channels.map(async (channel) => {
      try {
        const data = await loadChannelData(channel.id);
        return {
          id: channel.id,
          total: data.stats.total,
          beginner: data.stats.beginner,
          intermediate: data.stats.intermediate,
          advanced: data.stats.advanced,
        };
      } catch {
        return null;
      }
    })
  );
  
  const stats = results.filter((s): s is ChannelDetailedStats => s !== null);
  statsCacheEntry.data = stats;
  statsCacheEntry.timestamp = Date.now();
  return stats;
}

// Get subchannels for a channel
export async function fetchSubChannels(channelId: string): Promise<string[]> {
  const data = await loadChannelData(channelId);
  return data.subChannels;
}

// Get companies for a channel
export async function fetchCompanies(channelId: string): Promise<string[]> {
  const data = await loadChannelData(channelId);
  return data.companies;
}

// Clear cache (useful for forcing refresh)
export function clearCache(): void {
  channelCache.clear();
  channelDataMap.clear();
  statsCacheEntry.data = null;
  statsCacheEntry.timestamp = null;
}

// Invalidate a specific channel's cache
export function invalidateChannel(channelId: string): void {
  channelCache.delete(channelId);
  channelDataMap.delete(channelId);
}

// Get all questions for a channel (full data)
export async function fetchChannelQuestions(channelId: string): Promise<Question[]> {
  const data = await loadChannelData(channelId);
  return data.questions;
}
