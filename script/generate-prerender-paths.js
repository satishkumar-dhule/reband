/**
 * Generate Prerendered Paths for Static Build
 * 
 * Creates a manifest of all prerenderable routes for the SPA,
 * enabling GitHub Pages to serve pre-built HTML for key pages
 * via Vite's prerender capability or static HTML fallbacks.
 * 
 * This ensures sub-millisecond latency for the most common entry points:
 * - Landing page
 * - Channel pages (top channels by question count)
 * - Popular learning paths
 * - Certification overview pages
 */

import 'dotenv/config';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = 'client/public/data';
const url = 'file:local.db';

const client = createClient({ url, authToken: undefined });

function safeJsonParse(str, fallback = null) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

async function main() {
  console.log('=== 🗺️  Generating Prerendered Paths Manifest ===\n');
  
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const paths = {
    // Always prerender these core routes
    required: [
      { path: '/', priority: 1, type: 'landing', description: 'Landing page' },
      { path: '/channels', priority: 1, type: 'channels', description: 'All channels listing' },
      { path: '/learn', priority: 1, type: 'learning-paths', description: 'Learning paths page' },
      { path: '/certifications', priority: 1, type: 'certifications', description: 'Certifications page' },
      { path: '/challenges', priority: 2, type: 'coding-challenges', description: 'Coding challenges listing' },
      { path: '/flashcards', priority: 2, type: 'flashcards', description: 'Flashcards page' },
      { path: '/interview', priority: 2, type: 'voice-interview', description: 'Voice interview page' },
    ],
    channels: [],
    learningPaths: [],
    certifications: [],
    // Dynamic route templates for the SPA router
    dynamicRoutes: [
      { pattern: '/channel/:channelId', description: 'Channel detail page', dataFile: '/data/{channelId}.json' },
      { pattern: '/channel/:channelId/interview', description: 'Voice interview for channel', dataFile: '/data/{channelId}.json' },
      { pattern: '/challenge/:challengeId', description: 'Coding challenge detail', dataFile: '/data/coding-challenges.json' },
      { pattern: '/learn/:pathId', description: 'Learning path detail', dataFile: '/data/learning-paths.json' },
      { pattern: '/cert/:certId', description: 'Certification detail', dataFile: '/data/certifications.json' },
      { pattern: '/flashcards/:channelId', description: 'Channel flashcards', dataFile: '/data/flashcards-{channelId}.json' },
    ],
    // Prefetch graph: what to prefetch when on each page type
    prefetchGraph: {},
  };
  
  // ============================================
  // Channel paths (prioritized by question count)
  // ============================================
  console.log('📊 Analyzing channels for prerendering...');
  const channelResult = await client.execute(`
    SELECT channel, COUNT(*) as count,
           SUM(CASE WHEN difficulty IN ('beginner','easy') THEN 1 ELSE 0 END) as easy_count,
           SUM(CASE WHEN difficulty IN ('intermediate','medium') THEN 1 ELSE 0 END) as medium_count,
           SUM(CASE WHEN difficulty IN ('advanced','hard') THEN 1 ELSE 0 END) as hard_count
    FROM questions WHERE status = 'active'
    GROUP BY channel ORDER BY count DESC
  `);
  
  for (const row of channelResult.rows) {
    const isHighPriority = row.count >= 20;
    paths.channels.push({
      path: `/channel/${row.channel}`,
      priority: isHighPriority ? 1 : 2,
      questionCount: row.count,
      difficulty: {
        beginner: row.easy_count,
        intermediate: row.medium_count,
        advanced: row.hard_count,
      },
      dataFile: `/data/${row.channel}.json`,
    });
  }
  
  console.log(`   Found ${paths.channels.length} channels`);
  console.log(`   High priority (≥20 questions): ${paths.channels.filter(c => c.priority === 1).length}`);
  
  // ============================================
  // Learning path paths
  // ============================================
  console.log('\n📊 Analyzing learning paths...');
  try {
    const pathResult = await client.execute(`
      SELECT id, title, path_type, popularity, channels
      FROM learning_paths WHERE status = 'active'
      ORDER BY popularity DESC
      LIMIT 20
    `);
    
    for (const row of pathResult.rows) {
      paths.learningPaths.push({
        path: `/learn/${row.id}`,
        priority: row.popularity > 10 ? 1 : 2,
        title: row.title,
        type: row.path_type,
        dataFile: '/data/learning-paths.json',
      });
    }
    console.log(`   Found ${paths.learningPaths.length} learning paths`);
  } catch (e) {
    console.log(`   ⚠️ Could not fetch learning paths: ${e.message}`);
  }
  
  // ============================================
  // Certification paths
  // ============================================
  console.log('\n📊 Analyzing certifications...');
  try {
    const certResult = await client.execute(`
      SELECT id, name, provider, difficulty
      FROM certifications WHERE status = 'active'
      ORDER BY name
    `);
    
    for (const row of certResult.rows) {
      paths.certifications.push({
        path: `/cert/${row.id}`,
        priority: 1,
        name: row.name,
        provider: row.provider,
        dataFile: '/data/certifications.json',
      });
    }
    console.log(`   Found ${paths.certifications.length} certifications`);
  } catch (e) {
    console.log(`   ⚠️ Could not fetch certifications: ${e.message}`);
  }
  
  // ============================================
  // Build prefetch graph
  // ============================================
  console.log('\n🔗 Building prefetch graph...');
  
  paths.prefetchGraph = {
    // When user lands on homepage, prefetch these
    '/': {
      prefetch: [
        '/data/index.json',
        '/data/channels.json',
        '/data/stats.json',
        '/data/channel-map.json',
        ...paths.channels.filter(c => c.priority === 1).slice(0, 5).map(c => c.dataFile),
      ],
      description: 'Landing page — prefetch global index and top 5 channels',
    },
    // When user visits a channel, prefetch its data + related channels
    '/channel/:channelId': {
      prefetch: [
        '/data/{channelId}.json',
        '/data/batches/{channelId}-0.json',
        '/data/batches/{channelId}-1.json',
        '/data/flashcards-{channelId}.json',
      ],
      description: 'Channel page — prefetch channel manifest, first 2 batches, and flashcards',
    },
    // When user starts a voice interview
    '/channel/:channelId/interview': {
      prefetch: [
        '/data/{channelId}.json',
        '/data/voice-sessions.json',
      ],
      description: 'Voice interview — prefetch channel questions and sessions',
    },
    // When user views a coding challenge
    '/challenge/:challengeId': {
      prefetch: [
        '/data/coding-challenges.json',
      ],
      description: 'Challenge page — prefetch all challenges (small dataset)',
    },
    // When user browses learning paths
    '/learn': {
      prefetch: [
        '/data/learning-paths-index.json',
        '/data/index.json',
      ],
      description: 'Learning paths listing — prefetch lightweight index',
    },
    // When user views a specific learning path
    '/learn/:pathId': {
      prefetch: [
        '/data/learning-paths.json',
        '/data/index.json',
      ],
      description: 'Learning path detail — prefetch full paths and question index',
    },
    // When user browses certifications
    '/certifications': {
      prefetch: [
        '/data/certifications.json',
      ],
      description: 'Certifications listing — prefetch cert data',
    },
    // When user views flashcards
    '/flashcards/:channelId': {
      prefetch: [
        '/data/flashcards-{channelId}.json',
      ],
      description: 'Flashcards — prefetch channel-specific flashcards',
    },
  };
  
  // ============================================
  // Generate route priority map for build-time prerendering
  // ============================================
  const allPrerenderPaths = [
    ...paths.required.map(p => ({ path: p.path, priority: p.priority })),
    ...paths.channels.filter(c => c.priority === 1).map(c => ({ path: c.path, priority: c.priority })),
    ...paths.learningPaths.filter(p => p.priority === 1).map(p => ({ path: p.path, priority: p.priority })),
    ...paths.certifications.map(c => ({ path: c.path, priority: c.priority })),
  ];
  
  // Sort by priority for build ordering
  allPrerenderPaths.sort((a, b) => a.priority - b.priority);
  
  paths.prerenderOrder = allPrerenderPaths;
  paths.generatedAt = new Date().toISOString();
  paths.version = 1;
  
  // ============================================
  // Write output
  // ============================================
  const outputPath = path.join(OUTPUT_DIR, 'prerender-paths.json');
  fs.writeFileSync(outputPath, JSON.stringify(paths, null, 0));
  console.log(`\n✅ Written prerender-paths.json`);
  console.log(`   Total prerender paths: ${allPrerenderPaths.length}`);
  console.log(`   Priority 1 (critical): ${allPrerenderPaths.filter(p => p.priority === 1).length}`);
  console.log(`   Priority 2 (important): ${allPrerenderPaths.filter(p => p.priority === 2).length}`);
  console.log(`   Dynamic route templates: ${paths.dynamicRoutes.length}`);
  console.log(`   Prefetch graph entries: ${Object.keys(paths.prefetchGraph).length}`);
  
  // Also generate a simple flat list for vite.config.js prerender option
  const flatPaths = allPrerenderPaths.map(p => p.path);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'prerender-paths-list.json'),
    JSON.stringify(flatPaths, null, 0)
  );
  console.log(`   ✓ prerender-paths-list.json (${flatPaths.length} paths)`);
  
  // Generate an HTML sitemap for SEO
  const sitemapUrls = flatPaths.map(p => `https://open-interview.github.io${p}`);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url><loc>${url}</loc><changefreq>weekly</changefreq></url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-prerender.xml'), sitemap);
  console.log(`   ✓ sitemap-prerender.xml (${sitemapUrls.length} URLs)`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
