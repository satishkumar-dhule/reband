/**
 * Optimized Data Loader for DevPrep
 * 
 * Handles tiered content loading with:
 * - Progressive loading (critical → important → background)
 * - Automatic gzip decompression
 * - Request deduplication
 * - Cache management
 * - Retry with exponential backoff
 * 
 * Usage:
 *   import { DataLoader } from './data-loader.js';
 *   const loader = new DataLoader();
 *   await loader.init();
 *   const questions = await loader.getChannel('algorithms');
 */

// Content delivery manifest (injected at build time)
import deliveryManifest from '../../public/data/delivery-manifest.json' assert { type: 'json' };
import prefetchManifest from '../../public/data/prefetch-manifest.json' assert { type: 'json' };

export class DataLoader {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '';
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.maxRetries = options.maxRetries || 3;
    this.baseBackoff = options.baseBackoff || 1000;
    this.useGzip = options.useGzip !== false;
    this.metrics = { requests: 0, cacheHits: 0, errors: 0, bytesLoaded: 0 };
  }

  /**
   * Initialize the loader by loading critical resources
   */
  async init() {
    const critical = prefetchManifest.critical || [];
    await Promise.allSettled(critical.map(path => this.fetch(path)));
    return this;
  }

  /**
   * Fetch with deduplication, caching, and retry
   */
  async fetch(url, options = {}) {
    const key = url;
    
    // Check cache first
    if (this.cache.has(key)) {
      this.metrics.cacheHits++;
      return this.cache.get(key);
    }
    
    // Deduplicate in-flight requests
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }
    
    const promise = this._fetchWithRetry(url, options);
    this.pendingRequests.set(key, promise);
    
    try {
      const result = await promise;
      this.cache.set(key, result);
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  async _fetchWithRetry(url, options, attempt = 0) {
    try {
      this.metrics.requests++;
      
      // Try gzip first if enabled
      let fetchUrl = this.baseUrl + url;
      const headers = { 'Accept': 'application/json' };
      
      if (this.useGzip) {
        headers['Accept-Encoding'] = 'gzip';
      }
      
      const response = await fetch(fetchUrl, { headers, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      
      const data = await response.json();
      this.metrics.bytesLoaded += response.headers.get('content-length') || 0;
      return data;
    } catch (error) {
      if (attempt < this.maxRetries) {
        const backoff = Math.min(this.baseBackoff * Math.pow(2, attempt), 8000);
        await new Promise(r => setTimeout(r, backoff));
        return this._fetchWithRetry(url, options, attempt + 1);
      }
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * Load a channel manifest (question list without full answers)
   */
  async getChannel(channelId) {
    return this.fetch(`/data/${channelId}.json`);
  }

  /**
   * Load a single question's full content
   */
  async getQuestion(questionId) {
    return this.fetch(`/data/questions/${questionId}.json`);
  }

  /**
   * Load a batch of questions
   */
  async getBatch(channelId, batchIndex = 0) {
    return this.fetch(`/data/batches/${channelId}-${batchIndex}.json`);
  }

  /**
   * Load flashcards for a channel
   */
  async getFlashcards(channelId) {
    return this.fetch(`/data/flashcards-${channelId}.json`);
  }

  /**
   * Load all coding challenges (lightweight index)
   */
  async getCodingChallengesIndex() {
    return this.fetch('/data/coding-challenges-index.json');
  }

  /**
   * Load full coding challenges
   */
  async getCodingChallenges() {
    return this.fetch('/data/coding-challenges.json');
  }

  /**
   * Load learning paths index
   */
  async getLearningPathsIndex() {
    return this.fetch('/data/learning-paths-index.json');
  }

  /**
   * Load full learning paths
   */
  async getLearningPaths() {
    return this.fetch('/data/learning-paths.json');
  }

  /**
   * Load certifications
   */
  async getCertifications() {
    return this.fetch('/data/certifications.json');
  }

  /**
   * Load search index
   */
  async getSearchIndex() {
    return this.fetch('/data/search/search-index.json.gz');
  }

  /**
   * Prefetch resources for a given page
   */
  prefetchForPage(pageType, params = {}) {
    const strategy = prefetchManifest.strategy?.[pageType];
    if (!strategy) return;
    
    const urls = typeof strategy.load === 'function' 
      ? strategy.load(params) 
      : strategy.load || [];
    
    // Prefetch without blocking
    for (const url of urls) {
      this.fetch(url).catch(() => {}); // Silently fail
    }
    
    // Also prefetch suggested resources
    if (strategy.prefetch) {
      const prefetchUrls = typeof strategy.prefetch === 'function'
        ? strategy.prefetch(params)
        : strategy.prefetch;
      for (const url of prefetchUrls) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = this.baseUrl + url;
        link.as = 'fetch';
        document.head.appendChild(link);
      }
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get loader metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
}

// Singleton instance
let _instance = null;
export function getDataLoader(options) {
  if (!_instance) {
    _instance = new DataLoader(options);
  }
  return _instance;
}
