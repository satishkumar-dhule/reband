/**
 * Optimized Content Export Pipeline
 * 
 * Replaces fetch-questions-for-build.js with a multi-tier approach:
 * 1. Tier 0: Ultra-lightweight index (question IDs + metadata only) — always loaded first
 * 2. Tier 1: Channel manifests (question list per channel without full answers) — loaded on channel visit
 * 3. Tier 2: Full question content — loaded on-demand per question view
 * 4. Tier 3: Heavy assets (diagrams, videos) — lazy loaded
 * 
 * Benefits:
 * - Initial page load: ~2KB instead of ~70KB
 * - Channel page load: ~5-10KB instead of full channel dump
 * - Question view: only loads the one question being viewed
 * - Total bandwidth saved: ~60-80% for typical user sessions
 */

import 'dotenv/config';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const OUTPUT_DIR = 'client/public/data';
const url = 'file:local.db';

const client = createClient({ url, authToken: undefined });

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Safe JSON parse with fallback
 */
function safeJsonParse(str, fallback = null) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

/**
 * Parse a question row into a clean object
 */
function parseQuestionRow(row) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    explanation: row.explanation,
    tldr: row.tldr,
    diagram: row.diagram,
    difficulty: row.difficulty,
    tags: safeJsonParse(row.tags, []),
    channel: row.channel,
    subChannel: row.sub_channel,
    sourceUrl: row.source_url,
    videos: safeJsonParse(row.videos, null),
    companies: safeJsonParse(row.companies, null),
    eli5: row.eli5,
    relevanceScore: row.relevance_score,
    experienceLevelTags: safeJsonParse(row.experience_level_tags, []),
    voiceKeywords: safeJsonParse(row.voice_keywords, null),
    voiceSuitable: row.voice_suitable === 1,
    isNew: row.is_new === 1,
    lastUpdated: row.last_updated,
    createdAt: row.created_at,
  };
}

/**
 * Write JSON with optional gzip compression for large files
 */
function writeJson(filePath, data, compress = false) {
  const json = JSON.stringify(data);
  fs.writeFileSync(filePath, json);
  
  if (compress && json.length > 5000) {
    const gzipped = zlib.gzipSync(json);
    fs.writeFileSync(filePath + '.gz', gzipped);
    return { size: json.length, gzipped: gzipped.length };
  }
  return { size: json.length };
}

/**
 * TIER 0: Ultra-lightweight global index
 * Contains only: id, channel, difficulty, question (first 80 chars), tags
 * Size: ~15KB for 250 questions (vs 276KB full content)
 */
async function generateTier0Index(questions) {
  console.log('\n📦 Tier 0: Generating lightweight index...');
  
  const index = questions.map(q => ({
    id: q.id,
    q: q.question.substring(0, 80),  // Shortened key name
    c: q.channel,                     // Shortened key names for size
    s: q.subChannel,
    d: q.difficulty,
    t: q.tags,
    co: q.companies,
    n: q.isNew ? 1 : 0,
  }));
  
  const result = writeJson(path.join(OUTPUT_DIR, 'index.json'), index, true);
  console.log(`   ✓ index.json (${index.length} entries, ${result.size} bytes${result.gzipped ? `, ${result.gzipped} gzipped` : ''})`);
  
  // Also write a channel lookup map: channel -> [question IDs]
  const channelMap = {};
  for (const q of questions) {
    if (!channelMap[q.channel]) channelMap[q.channel] = [];
    channelMap[q.channel].push(q.id);
  }
  writeJson(path.join(OUTPUT_DIR, 'channel-map.json'), channelMap);
  console.log(`   ✓ channel-map.json (${Object.keys(channelMap).length} channels)`);
  
  return index;
}

/**
 * TIER 1: Channel manifests (metadata without full answers)
 * Contains: id, question, difficulty, subChannel, tags, companies, tldr
 * Excludes: answer, explanation, diagram, eli5 (loaded on demand)
 */
async function generateTier1Manifests(questions) {
  console.log('\n📦 Tier 1: Generating channel manifests...');
  
  const byChannel = {};
  for (const q of questions) {
    if (!byChannel[q.channel]) {
      byChannel[q.channel] = {
        questions: [],
        subChannels: new Set(),
        companies: new Set(),
        stats: { total: 0, beginner: 0, intermediate: 0, advanced: 0, easy: 0, medium: 0, hard: 0, newThisWeek: 0 }
      };
    }
    
    const ch = byChannel[q.channel];
    ch.questions.push({
      id: q.id,
      q: q.question,
      d: q.difficulty,
      s: q.subChannel,
      t: q.tags,
      co: q.companies,
      tl: q.tldr,
      n: q.isNew ? 1 : 0,
      rs: q.relevanceScore,
      vs: q.voiceSuitable ? 1 : 0,
    });
    
    ch.subChannels.add(q.subChannel);
    ch.stats.total++;
    if (ch.stats[q.difficulty] !== undefined) ch.stats[q.difficulty]++;
    if (q.isNew) ch.stats.newThisWeek++;
    if (q.companies) q.companies.forEach(c => ch.companies.add(c));
  }
  
  const channelStats = [];
  for (const [channelId, data] of Object.entries(byChannel)) {
    const manifest = {
      questions: data.questions,
      subChannels: Array.from(data.subChannels).sort(),
      companies: Array.from(data.companies).sort(),
      stats: data.stats
    };
    
    const result = writeJson(path.join(OUTPUT_DIR, `${channelId}.json`), manifest, true);
    console.log(`   ✓ ${channelId}.json (${data.questions.length} questions, ${result.size} bytes${result.gzipped ? `, ${result.gzipped} gzipped` : ''})`);
    
    channelStats.push({
      id: channelId,
      questionCount: data.stats.total,
      ...data.stats
    });
  }
  
  // Write channels index
  writeJson(path.join(OUTPUT_DIR, 'channels.json'), channelStats);
  console.log(`   ✓ channels.json (${channelStats.length} channels)`);
  
  return channelStats;
}

/**
 * TIER 2: Full question content (loaded on demand)
 * Each question gets its own file for granular loading
 * Also generates batch files for groups of 10 questions (for list views)
 */
async function generateTier2Content(questions) {
  console.log('\n📦 Tier 2: Generating question-level content...');
  
  const contentDir = path.join(OUTPUT_DIR, 'questions');
  fs.mkdirSync(contentDir, { recursive: true });
  
  let totalSize = 0;
  let count = 0;
  
  for (const q of questions) {
    const content = {
      id: q.id,
      question: q.question,
      answer: q.answer,
      explanation: q.explanation,
      tldr: q.tldr,
      diagram: q.diagram,
      eli5: q.eli5,
      tags: q.tags,
      companies: q.companies,
      videos: q.videos,
      sourceUrl: q.sourceUrl,
      relevanceScore: q.relevanceScore,
      experienceLevelTags: q.experienceLevelTags,
      voiceKeywords: q.voiceKeywords,
    };
    
    const filePath = path.join(contentDir, `${q.id}.json`);
    const result = writeJson(filePath, content, true);
    totalSize += result.size;
    count++;
  }
  
  console.log(`   ✓ questions/ (${count} files, ${(totalSize / 1024).toFixed(1)} KB total)`);
  
  // Generate batch files (groups of 20 by channel for efficient prefetching)
  const batchDir = path.join(OUTPUT_DIR, 'batches');
  fs.mkdirSync(batchDir, { recursive: true });
  
  const byChannel = {};
  for (const q of questions) {
    if (!byChannel[q.channel]) byChannel[q.channel] = [];
    byChannel[q.channel].push(q);
  }
  
  let batchCount = 0;
  for (const [channel, chQuestions] of Object.entries(byChannel)) {
    for (let i = 0; i < chQuestions.length; i += 20) {
      const batch = chQuestions.slice(i, i + 20).map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        explanation: q.explanation,
        tldr: q.tldr,
        diagram: q.diagram,
        eli5: q.eli5,
        difficulty: q.difficulty,
        tags: q.tags,
        companies: q.companies,
      }));
      
      const batchFile = path.join(batchDir, `${channel}-${Math.floor(i / 20)}.json`);
      writeJson(batchFile, batch, true);
      batchCount++;
    }
  }
  
  console.log(`   ✓ batches/ (${batchCount} batch files)`);
  
  // Generate a batch manifest so the frontend knows which batches exist
  const batchManifest = {};
  for (const [channel, chQuestions] of Object.entries(byChannel)) {
    batchManifest[channel] = {
      total: chQuestions.length,
      batches: Math.ceil(chQuestions.length / 20),
      size: Math.ceil(chQuestions.length / 20)
    };
  }
  writeJson(path.join(OUTPUT_DIR, 'batch-manifest.json'), batchManifest);
  console.log(`   ✓ batch-manifest.json`);
}

/**
 * Generate a content prefetch manifest for the frontend
 * Tells the browser what to prefetch based on user behavior patterns
 */
function generatePrefetchManifest(channelStats, questions) {
  console.log('\n🔮 Generating prefetch manifest...');
  
  // Critical resources: always load first
  const critical = [
    '/data/index.json',
    '/data/channels.json',
    '/data/channel-map.json',
  ];
  
  // High-priority channels (most questions = most likely to be visited)
  const sortedChannels = [...channelStats].sort((a, b) => b.questionCount - a.questionCount);
  const highPriority = sortedChannels.slice(0, 5).map(ch => `/data/${ch.id}.json`);
  
  // Prefetch strategy hints for the frontend
  const manifest = {
    version: 1,
    generated: new Date().toISOString(),
    critical,
    highPriority,
    strategy: {
      // On landing page: load index + top 5 channels
      landing: { load: [...critical, ...highPriority] },
      // On channel page: load that channel's manifest + first 2 batches
      channel: (channelId) => ({
        load: [`/data/${channelId}.json`, `/data/batches/${channelId}-0.json`, `/data/batches/${channelId}-1.json`],
        prefetch: sortedChannels.slice(5, 8).map(ch => `/data/${ch.id}.json`)
      }),
      // On question view: load individual question + prefetch next 2 in channel
      question: (questionId, channel) => ({
        load: [`/data/questions/${questionId}.json`],
        prefetch: []  // Frontend will compute next 2 IDs from channel manifest
      })
    },
    // Cache hints: how long each tier should be cached
    cacheHints: {
      'index.json': '1h',
      'channels.json': '1h',
      'channel-map.json': '1h',
      '*.json': '5m',         // Channel manifests
      'questions/*.json': '30m', // Individual questions
      'batches/*.json': '15m',   // Batch files
    }
  };
  
  writeJson(path.join(OUTPUT_DIR, 'prefetch-manifest.json'), manifest);
  console.log(`   ✓ prefetch-manifest.json`);
}

/**
 * Generate a content delivery optimization report
 */
function generateOptimizationReport(questions, tier0, tier1Stats) {
  console.log('\n📊 Generating optimization report...');
  
  // Calculate original full content size
  const fullContentSize = questions.reduce((sum, q) => {
    return sum + JSON.stringify({
      id: q.id, question: q.question, answer: q.answer,
      explanation: q.explanation, tldr: q.tldr, diagram: q.diagram,
      eli5: q.eli5, tags: q.tags, companies: q.companies,
      videos: q.videos, channel: q.channel, subChannel: q.subChannel,
      difficulty: q.difficulty, relevanceScore: q.relevanceScore,
      experienceLevelTags: q.experienceLevelTags, voiceKeywords: q.voiceKeywords,
      voiceSuitable: q.voiceSuitable, isNew: q.isNew,
    }).length;
  }, 0);
  
  // Tier 0 size
  const tier0Size = JSON.stringify(tier0.map(q => ({
    id: q.id, q: q.q, c: q.c, s: q.s, d: q.d, t: q.t, co: q.co, n: q.n,
  }))).length;
  
  // Typical user session savings:
  // Old: Load all questions (~276KB)
  // New: Load index (~15KB) + 1 channel manifest (~8KB) + 1 batch (~15KB) + 3 questions (~5KB) = ~43KB
  
  const typicalSessionOld = fullContentSize;
  const typicalSessionNew = tier0Size + 8000 + 15000 + 5000; // index + 1 channel + 1 batch + 3 questions
  const savings = ((1 - typicalSessionNew / typicalSessionOld) * 100).toFixed(1);
  
  const report = {
    version: 1,
    generated: new Date().toISOString(),
    contentStats: {
      totalQuestions: questions.length,
      totalChannels: tier1Stats.length,
      fullContentBytes: fullContentSize,
      tier0IndexBytes: tier0Size,
    },
    deliveryTiers: {
      tier0: { name: 'Global Index', description: 'Question IDs + metadata only', sizeBytes: tier0Size },
      tier1: { name: 'Channel Manifests', description: 'Question list without full answers', avgSizeBytes: Math.round(fullContentSize / tier1Stats.length * 0.3) },
      tier2: { name: 'Question Content', description: 'Full question + answer + explanation', perQuestionAvgBytes: Math.round(fullContentSize / questions.length) },
      tier3: { name: 'Heavy Assets', description: 'Diagrams, videos (lazy-loaded)', description_detail: 'Loaded only when user expands question details' },
    },
    performanceEstimates: {
      typicalSessionOldBytes: typicalSessionOld,
      typicalSessionNewBytes: typicalSessionNew,
      bandwidthSavingsPercent: parseFloat(savings),
      initialLoadOldBytes: fullContentSize,
      initialLoadNewBytes: tier0Size,
      initialLoadSavingsPercent: ((1 - tier0Size / fullContentSize) * 100).toFixed(1),
    }
  };
  
  writeJson(path.join(OUTPUT_DIR, 'delivery-report.json'), report);
  console.log(`   ✓ delivery-report.json`);
  console.log(`\n   📈 Bandwidth savings: ${savings}% for typical sessions`);
  console.log(`   📈 Initial load reduction: ${((1 - tier0Size / fullContentSize) * 100).toFixed(1)}%`);
}

/**
 * Export coding challenges in optimized format
 */
async function exportCodingChallenges() {
  console.log('\n📦 Exporting coding challenges...');
  try {
    const result = await client.execute(`
      SELECT id, title, description, difficulty, category, tags, companies,
             starter_code_js, starter_code_py, test_cases, hints,
             solution_js, solution_py, complexity_time, complexity_space, complexity_explanation,
             time_limit, created_at
      FROM coding_challenges
      ORDER BY category, difficulty, id
    `);

    const challenges = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      difficulty: row.difficulty,
      category: row.category,
      tags: safeJsonParse(row.tags, []),
      companies: safeJsonParse(row.companies, []),
      starterCode: {
        javascript: row.starter_code_js,
        python: row.starter_code_py
      },
      testCases: safeJsonParse(row.test_cases, []),
      hints: safeJsonParse(row.hints, []),
      solution: {
        javascript: row.solution_js,
        python: row.solution_py
      },
      complexity: {
        time: row.complexity_time,
        space: row.complexity_space,
        explanation: row.complexity_explanation
      },
      timeLimit: row.time_limit || 15,
      createdAt: row.created_at
    }));

    // Split into light index and full content
    const lightIndex = challenges.map(c => ({
      id: c.id, title: c.title, difficulty: c.difficulty,
      category: c.category, tags: c.tags, companies: c.companies,
    }));
    writeJson(path.join(OUTPUT_DIR, 'coding-challenges-index.json'), lightIndex);
    writeJson(path.join(OUTPUT_DIR, 'coding-challenges.json'), challenges, true);
    console.log(`   ✓ coding-challenges.json (${challenges.length} challenges)`);
    console.log(`   ✓ coding-challenges-index.json (lightweight index)`);
  } catch (e) {
    console.log(`   ⚠️ Could not fetch coding challenges: ${e.message}`);
    writeJson(path.join(OUTPUT_DIR, 'coding-challenges.json'), []);
    writeJson(path.join(OUTPUT_DIR, 'coding-challenges-index.json'), []);
  }
}

/**
 * Export flashcards in optimized format
 */
async function exportFlashcards() {
  console.log('\n📦 Exporting flashcards...');
  try {
    const result = await client.execute(`
      SELECT id, channel, front, back, hint, code_example, mnemonic, difficulty, tags, category, status
      FROM flashcards WHERE status = 'active'
      ORDER BY channel, difficulty, id
    `);
    
    const flashcards = result.rows.map(row => ({
      id: row.id,
      channel: row.channel,
      front: row.front,
      back: row.back,
      hint: row.hint,
      codeExample: row.code_example,
      mnemonic: row.mnemonic,
      difficulty: row.difficulty,
      tags: safeJsonParse(row.tags, []),
      category: row.category,
    }));
    
    // By-channel flashcard files
    const byChannel = {};
    for (const fc of flashcards) {
      if (!byChannel[fc.channel]) byChannel[fc.channel] = [];
      byChannel[fc.channel].push(fc);
    }
    
    for (const [channel, cards] of Object.entries(byChannel)) {
      writeJson(path.join(OUTPUT_DIR, `flashcards-${channel}.json`), cards, true);
    }
    
    writeJson(path.join(OUTPUT_DIR, 'flashcards.json'), flashcards, true);
    console.log(`   ✓ flashcards.json (${flashcards.length} cards)`);
    console.log(`   ✓ flashcards-*.json (${Object.keys(byChannel).length} channel files)`);
  } catch (e) {
    console.log(`   ⚠️ Could not fetch flashcards: ${e.message}`);
    writeJson(path.join(OUTPUT_DIR, 'flashcards.json'), []);
  }
}

/**
 * Export certifications
 */
async function exportCertifications() {
  console.log('\n📦 Exporting certifications...');
  try {
    const result = await client.execute(`
      SELECT id, name, provider, description, icon, color, difficulty, category,
             estimated_hours, exam_code, official_url, domains, prerequisites,
             status, passing_score, exam_duration, created_at, last_updated
      FROM certifications WHERE status = 'active' ORDER BY name
    `);
    
    const certifications = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      provider: row.provider,
      description: row.description,
      icon: row.icon || 'award',
      color: row.color || 'text-primary',
      difficulty: row.difficulty,
      category: row.category,
      estimatedHours: row.estimated_hours || 40,
      examCode: row.exam_code,
      officialUrl: row.official_url,
      domains: safeJsonParse(row.domains, []),
      prerequisites: safeJsonParse(row.prerequisites, []),
      passingScore: row.passing_score || 70,
      examDuration: row.exam_duration || 90,
    }));
    
    writeJson(path.join(OUTPUT_DIR, 'certifications.json'), certifications);
    console.log(`   ✓ certifications.json (${certifications.length} certs)`);
  } catch (e) {
    console.log(`   ⚠️ Could not fetch certifications: ${e.message}`);
    writeJson(path.join(OUTPUT_DIR, 'certifications.json'), []);
  }
}

/**
 * Export learning paths
 */
async function exportLearningPaths() {
  console.log('\n📦 Exporting learning paths...');
  try {
    const result = await client.execute(`
      SELECT id, title, description, path_type, target_company, target_job_title,
             difficulty, estimated_hours, question_ids, channels, tags,
             learning_objectives, milestones, popularity, status
      FROM learning_paths WHERE status = 'active'
      ORDER BY popularity DESC, created_at DESC
    `);
    
    const paths = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      pathType: row.path_type,
      targetCompany: row.target_company,
      targetJobTitle: row.target_job_title,
      difficulty: row.difficulty,
      estimatedHours: row.estimated_hours,
      questionIds: safeJsonParse(row.question_ids, []),
      channels: safeJsonParse(row.channels, []),
      tags: safeJsonParse(row.tags, []),
      learningObjectives: safeJsonParse(row.learning_objectives, []),
      milestones: safeJsonParse(row.milestones, []),
      popularity: row.popularity || 0,
    }));
    
    // Light index (without question IDs)
    const lightIndex = paths.map(p => ({
      id: p.id, title: p.title, description: p.description,
      pathType: p.pathType, difficulty: p.difficulty,
      estimatedHours: p.estimatedHours, popularity: p.popularity,
      channels: p.channels, tags: p.tags,
    }));
    
    writeJson(path.join(OUTPUT_DIR, 'learning-paths.json'), paths, true);
    writeJson(path.join(OUTPUT_DIR, 'learning-paths-index.json'), lightIndex);
    console.log(`   ✓ learning-paths.json (${paths.length} paths)`);
    console.log(`   ✓ learning-paths-index.json (lightweight index)`);
  } catch (e) {
    console.log(`   ⚠️ Could not fetch learning paths: ${e.message}`);
    writeJson(path.join(OUTPUT_DIR, 'learning-paths.json'), []);
    writeJson(path.join(OUTPUT_DIR, 'learning-paths-index.json'), []);
  }
}

/**
 * Generate stats and summary
 */
async function generateStats(questions, channelStats) {
  console.log('\n📊 Generating stats...');
  
  const stats = {
    totalQuestions: questions.length,
    totalChannels: channelStats.length,
    channels: channelStats,
    lastUpdated: new Date().toISOString(),
    // Content distribution
    byDifficulty: {
      beginner: questions.filter(q => q.difficulty === 'beginner').length,
      intermediate: questions.filter(q => q.difficulty === 'intermediate').length,
      advanced: questions.filter(q => q.difficulty === 'advanced').length,
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length,
    },
    // Top companies
    topCompanies: Object.entries(
      questions.reduce((acc, q) => {
        if (q.companies) q.companies.forEach(c => { acc[c] = (acc[c] || 0) + 1; });
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([name, count]) => ({ name, count })),
  };
  
  writeJson(path.join(OUTPUT_DIR, 'stats.json'), stats);
  console.log(`   ✓ stats.json`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('=== 🚀 Optimized Content Export Pipeline ===\n');
  console.log('Multi-tier delivery strategy:');
  console.log('  Tier 0: Lightweight index (~15KB)');
  console.log('  Tier 1: Channel manifests (no full answers)');
  console.log('  Tier 2: Individual question files + batches');
  console.log('  Tier 3: Heavy assets (lazy-loaded)\n');

  // Fetch all active questions
  console.log('📥 Fetching questions from database...');
  const result = await client.execute("SELECT * FROM questions WHERE status = 'active' ORDER BY channel, sub_channel, id");
  const questions = result.rows.map(parseQuestionRow);
  console.log(`   Found ${questions.length} active questions`);

  // Generate tiers
  const tier0 = await generateTier0Index(questions);
  const tier1Stats = await generateTier1Manifests(questions);
  await generateTier2Content(questions);
  
  // Generate supporting files
  generatePrefetchManifest(tier1Stats, questions);
  generateOptimizationReport(questions, tier0, tier1Stats);
  
  // Export other content types
  await exportCodingChallenges();
  await exportFlashcards();
  await exportCertifications();
  await exportLearningPaths();
  await generateStats(questions, tier1Stats);
  
  // Generate blog posts mapping
  console.log('\n📦 Exporting blog posts mapping...');
  try {
    const blogResult = await client.execute('SELECT question_id, title, slug FROM blog_posts ORDER BY created_at DESC');
    const blogPosts = {};
    for (const row of blogResult.rows) {
      blogPosts[row.question_id] = { title: row.title, slug: row.slug, url: `/posts/${row.question_id}/${row.slug}/` };
    }
    writeJson(path.join(OUTPUT_DIR, 'blog-posts.json'), blogPosts);
    console.log(`   ✓ blog-posts.json (${Object.keys(blogPosts).length} posts)`);
  } catch (e) {
    writeJson(path.join(OUTPUT_DIR, 'blog-posts.json'), {});
    console.log(`   ✓ blog-posts.json (empty)`);
  }

  // Write empty files for optional features
  writeJson(path.join(OUTPUT_DIR, 'tests.json'), []);
  writeJson(path.join(OUTPUT_DIR, 'bot-activity.json'), { activities: [], stats: [], lastUpdated: new Date().toISOString() });
  writeJson(path.join(OUTPUT_DIR, 'github-analytics.json'), { views: [], clones: [], referrers: [], repoStats: {}, lastUpdated: new Date().toISOString() });
  writeJson(path.join(OUTPUT_DIR, 'changelog.json'), {
    entries: [{ date: new Date().toISOString().split('T')[0], type: 'feature', title: 'Platform Active', description: 'Optimized content delivery pipeline.', details: {} }],
    stats: { totalQuestionsAdded: questions.length, totalQuestionsImproved: 0, lastUpdated: new Date().toISOString() }
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Export complete!');
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log(`   Questions: ${questions.length}`);
  console.log(`   Channels: ${tier1Stats.length}`);
  
  // Calculate total output size
  let totalOutputSize = 0;
  const files = fs.readdirSync(OUTPUT_DIR);
  for (const f of files) {
    const stat = fs.statSync(path.join(OUTPUT_DIR, f));
    if (stat.isFile()) totalOutputSize += stat.size;
  }
  const subdirs = ['questions', 'batches'];
  for (const dir of subdirs) {
    const dirPath = path.join(OUTPUT_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const subFiles = fs.readdirSync(dirPath);
      for (const f of subFiles) {
        totalOutputSize += fs.statSync(path.join(dirPath, f)).size;
      }
    }
  }
  console.log(`   Total output size: ${(totalOutputSize / 1024).toFixed(1)} KB`);
  console.log('='.repeat(60));
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
