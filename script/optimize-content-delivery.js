/**
 * Content Delivery Optimizer
 * 
 * Generates optimized content delivery configuration for the frontend:
 * 1. Service Worker caching strategy for static data files
 * 2. Preload/prefetch hints for critical resources
 * 3. Content chunking configuration
 * 4. Cache invalidation strategy
 * 
 * This script runs during the build and generates configuration files
 * that the frontend uses for optimal content delivery.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = 'client/public/data';
const CLIENT_SRC = 'client/src/lib';

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Generate service worker caching strategy configuration
 */
function generateServiceWorkerConfig() {
  console.log('\n🔧 Generating service worker caching config...');
  
  const config = {
    version: 1,
    generated: new Date().toISOString(),
    
    // Cache-first strategy for static data
    cacheStrategies: {
      // Critical metadata - cache first, long TTL
      critical: {
        pattern: '/data/(index|channels|channel-map|stats|prefetch-manifest)\\.json$',
        strategy: 'cache-first',
        maxAge: 3600, // 1 hour
        maxEntries: 10,
      },
      // Channel manifests - cache first, medium TTL
      channelManifests: {
        pattern: '/data/[a-z0-9-]+\\.json$',
        strategy: 'cache-first',
        maxAge: 1800, // 30 minutes
        maxEntries: 50,
        exclude: ['index.json', 'channels.json', 'channel-map.json', 'stats.json'],
      },
      // Individual questions - stale-while-revalidate
      questions: {
        pattern: '/data/questions/[a-z0-9-]+\\.json$',
        strategy: 'stale-while-revalidate',
        maxAge: 900, // 15 minutes
        maxEntries: 200,
      },
      // Batch files - cache first, short TTL
      batches: {
        pattern: '/data/batches/[a-z0-9-]+\\.json$',
        strategy: 'cache-first',
        maxAge: 600, // 10 minutes
        maxEntries: 100,
      },
      // Coding challenges - cache first, long TTL (rarely changes)
      challenges: {
        pattern: '/data/coding-challenges.*\\.json$',
        strategy: 'cache-first',
        maxAge: 7200, // 2 hours
        maxEntries: 5,
      },
      // Flashcards - cache first, long TTL
      flashcards: {
        pattern: '/data/flashcards.*\\.json$',
        strategy: 'cache-first',
        maxAge: 3600, // 1 hour
        maxEntries: 20,
      },
      // Learning paths - cache first, medium TTL
      learningPaths: {
        pattern: '/data/learning-paths.*\\.json$',
        strategy: 'cache-first',
        maxAge: 1800, // 30 minutes
        maxEntries: 10,
      },
      // Certifications - cache first, long TTL
      certifications: {
        pattern: '/data/certifications\\.json$',
        strategy: 'cache-first',
        maxAge: 7200, // 2 hours
        maxEntries: 5,
      },
      // Search index - cache first, very long TTL
      search: {
        pattern: '/data/search/search-index\\.json(\\.gz)?$',
        strategy: 'cache-first',
        maxAge: 86400, // 24 hours
        maxEntries: 2,
      },
    },
    
    // Cache name prefix for versioning
    cacheNamePrefix: 'devprep-v1',
    
    // Maximum total cache size
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    
    // Precache list (loaded on SW install)
    precache: [
      '/data/index.json',
      '/data/channels.json',
      '/data/channel-map.json',
      '/data/stats.json',
      '/data/prefetch-manifest.json',
      '/data/search/search-index.json.gz',
    ],
  };
  
  const outputPath = path.join(OUTPUT_DIR, 'sw-cache-config.json');
  fs.writeFileSync(outputPath, JSON.stringify(config, null, 0));
  console.log(`   ✓ sw-cache-config.json`);
  
  return config;
}

/**
 * Generate preload hints for the HTML head
 */
function generatePreloadHints() {
  console.log('\n⚡ Generating preload hints...');
  
  const hints = {
    // Preload critical resources (high priority, fetched immediately)
    preload: [
      { href: '/data/index.json', as: 'fetch', type: 'application/json', crossorigin: 'anonymous' },
      { href: '/data/channels.json', as: 'fetch', type: 'application/json', crossorigin: 'anonymous' },
      { href: '/data/channel-map.json', as: 'fetch', type: 'application/json', crossorigin: 'anonymous' },
    ],
    // Prefetch likely-needed resources (low priority, fetched when idle)
    prefetch: [
      { href: '/data/stats.json', as: 'fetch', type: 'application/json' },
      { href: '/data/prefetch-manifest.json', as: 'fetch', type: 'application/json' },
    ],
    // DNS prefetch for external resources
    dnsPrefetch: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ],
    // Preconnect for critical external origins
    preconnect: [],
  };
  
  // Generate HTML link tags for injection into index.html
  const htmlTags = [];
  
  for (const item of hints.preload) {
    htmlTags.push(`<link rel="preload" href="${item.href}" as="${item.as}" type="${item.type}" crossorigin>`);
  }
  for (const item of hints.prefetch) {
    htmlTags.push(`<link rel="prefetch" href="${item.href}" as="${item.as}" type="${item.type}">`);
  }
  for (const url of hints.dnsPrefetch) {
    htmlTags.push(`<link rel="dns-prefetch" href="${url}">`);
  }
  for (const url of hints.preconnect) {
    htmlTags.push(`<link rel="preconnect" href="${url}" crossorigin>`);
  }
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'preload-hints.html'),
    htmlTags.join('\n')
  );
  console.log(`   ✓ preload-hints.html (${htmlTags.length} tags)`);
  
  // Also write as JSON for programmatic use
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'preload-config.json'),
    JSON.stringify(hints, null, 0)
  );
  console.log(`   ✓ preload-config.json`);
  
  return hints;
}

/**
 * Generate content chunking configuration
 * Defines how content should be split for progressive loading
 */
function generateChunkingConfig() {
  console.log('\n📦 Generating content chunking config...');
  
  const config = {
    version: 1,
    // Maximum payload per request
    maxPayloadSize: 50000, // 50KB per request
    // Batch sizes for different content types
    batchSizes: {
      questions: 20,       // 20 questions per batch
      flashcards: 30,      // 30 flashcards per batch
      challenges: 10,      // 10 challenges per batch
    },
    // Progressive loading stages
    stages: {
      // Stage 1: Critical - blocks rendering
      critical: {
        timeout: 3000, // 3 second timeout
        resources: ['index.json', 'channels.json', 'channel-map.json'],
        description: 'Must load before app renders',
      },
      // Stage 2: Important - renders after critical
      important: {
        timeout: 5000,
        resources: ['stats.json', 'prefetch-manifest.json'],
        description: 'Load after app shell renders',
      },
      // Stage 3: Background - loads when idle
      background: {
        timeout: 15000,
        resources: ['coding-challenges.json', 'flashcards.json', 'learning-paths.json'],
        description: 'Load during idle time',
      },
    },
    // Retry configuration
    retry: {
      maxRetries: 3,
      backoffMs: 1000,
      maxBackoffMs: 8000,
    },
    // Compression
    compression: {
      acceptEncoding: 'gzip, br',
      preferGzip: true, // GitHub Pages doesn't support brotli natively
    },
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'chunking-config.json'),
    JSON.stringify(config, null, 0)
  );
  console.log(`   ✓ chunking-config.json`);
  
  return config;
}

/**
 * Generate a content delivery manifest for the frontend data loader
 */
function generateDeliveryManifest() {
  console.log('\n📋 Generating delivery manifest...');
  
  const manifest = {
    version: 1,
    generated: new Date().toISOString(),
    
    // Content registry: maps content type to file paths
    registry: {
      index: {
        path: '/data/index.json',
        gzipPath: '/data/index.json.gz',
        type: 'index',
        priority: 'critical',
        description: 'Lightweight question index (ID + metadata only)',
      },
      channels: {
        path: '/data/channels.json',
        type: 'index',
        priority: 'critical',
        description: 'Channel listing with stats',
      },
      channelMap: {
        path: '/data/channel-map.json',
        type: 'index',
        priority: 'critical',
        description: 'Channel -> question ID mapping',
      },
      stats: {
        path: '/data/stats.json',
        type: 'index',
        priority: 'important',
        description: 'Aggregate statistics',
      },
      prefetchManifest: {
        path: '/data/prefetch-manifest.json',
        type: 'config',
        priority: 'important',
        description: 'Content prefetching hints',
      },
      searchIndex: {
        path: '/data/search/search-index.json.gz',
        type: 'search',
        priority: 'background',
        description: 'Client-side searchable index (gzipped)',
      },
      prerenderPaths: {
        path: '/data/prerender-paths.json',
        type: 'config',
        priority: 'background',
        description: 'Prerendered route manifest',
      },
      swCacheConfig: {
        path: '/data/sw-cache-config.json',
        type: 'config',
        priority: 'background',
        description: 'Service worker caching configuration',
      },
    },
    
    // Dynamic content loaders
    loaders: {
      channel: {
        template: '/data/{channelId}.json',
        gzipTemplate: '/data/{channelId}.json.gz',
        description: 'Channel manifest (question list without full answers)',
      },
      question: {
        template: '/data/questions/{questionId}.json',
        gzipTemplate: '/data/questions/{questionId}.json.gz',
        description: 'Individual question with full content',
      },
      batch: {
        template: '/data/batches/{channelId}-{batchIndex}.json',
        gzipTemplate: '/data/batches/{channelId}-{batchIndex}.json.gz',
        description: 'Batch of 20 questions for efficient prefetching',
      },
      flashcards: {
        template: '/data/flashcards-{channelId}.json',
        description: 'Channel-specific flashcards',
      },
      learningPath: {
        path: '/data/learning-paths.json',
        indexPath: '/data/learning-paths-index.json',
        description: 'Learning paths (use index for listing, full for detail)',
      },
      certifications: {
        path: '/data/certifications.json',
        description: 'Certification exam data',
      },
      codingChallenges: {
        path: '/data/coding-challenges.json',
        indexPath: '/data/coding-challenges-index.json',
        description: 'Coding challenges (use index for listing, full for detail)',
      },
    },
    
    // Content versioning
    versioning: {
      strategy: 'query-param', // Append ?v=timestamp to bust cache
      // Or use: 'filename-hashing' for build-time hashing
    },
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'delivery-manifest.json'),
    JSON.stringify(manifest, null, 0)
  );
  console.log(`   ✓ delivery-manifest.json`);
  
  return manifest;
}

/**
 * Generate a lightweight frontend data loader utility
 */
function generateDataLoader() {
  console.log('\n🔧 Generating frontend data loader utility...');
  
  const loader = `/**
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
        throw new Error(\`HTTP \${response.status} for \${url}\`);
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
    return this.fetch(\`/data/\${channelId}.json\`);
  }

  /**
   * Load a single question's full content
   */
  async getQuestion(questionId) {
    return this.fetch(\`/data/questions/\${questionId}.json\`);
  }

  /**
   * Load a batch of questions
   */
  async getBatch(channelId, batchIndex = 0) {
    return this.fetch(\`/data/batches/\${channelId}-\${batchIndex}.json\`);
  }

  /**
   * Load flashcards for a channel
   */
  async getFlashcards(channelId) {
    return this.fetch(\`/data/flashcards-\${channelId}.json\`);
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
`;

  fs.writeFileSync(
    path.join(CLIENT_SRC, 'data-loader.js'),
    loader
  );
  console.log(`   ✓ data-loader.js (frontend utility)`);
}

// ============================================
// MAIN
// ============================================

function main() {
  console.log('=== 📦 Content Delivery Optimizer ===\n');
  
  generateServiceWorkerConfig();
  generatePreloadHints();
  generateChunkingConfig();
  generateDeliveryManifest();
  generateDataLoader();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Content delivery optimization complete!');
  console.log('='.repeat(60));
}

main();
