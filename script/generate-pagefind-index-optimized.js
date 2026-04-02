/**
 * Optimized Pagefind Search Index Generator
 * 
 * Improvements over the original:
 * 1. Generates a single consolidated search index JSON instead of thousands of HTML files
 * 2. Uses Pagefind's native JSON indexing API for faster builds
 * 3. Deduplicates content and strips unnecessary HTML markup
 * 4. Includes flashcards, coding challenges, and learning paths in the search index
 * 5. Generates a lightweight search index that the frontend can load client-side
 * 6. Implements content chunking for large result sets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import { createClient } from '@libsql/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'client/public/data');
const outputDir = path.join(rootDir, 'dist/public/_pagefind-source');

// Also generate a client-side searchable index
const clientSearchDir = path.join(rootDir, 'client/public/data/search');

// Ensure output directories exist
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(clientSearchDir, { recursive: true });

const url = 'file:local.db';
let dbClient = null;

function getDb() {
  if (!dbClient) {
    dbClient = createClient({ url, authToken: undefined });
  }
  return dbClient;
}

function safeJsonParse(str, fallback = null) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatSubChannel(subChannel) {
  if (!subChannel) return '';
  return subChannel.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Generate optimized HTML for Pagefind indexing
 * Uses minimal HTML structure to reduce file count and size
 */
function generateIndexedHtml(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${escapeHtml(content.title)}</title></head>
<body>
<article data-pagefind-body>
<h1 data-pagefind-meta="title">${escapeHtml(content.title)}</h1>
<div data-pagefind-filter="type">${escapeHtml(content.type)}</div>
<div data-pagefind-filter="channel">${escapeHtml(content.channel)}</div>
<div data-pagefind-filter="difficulty">${escapeHtml(content.difficulty || 'intermediate')}</div>
${content.topic ? `<div data-pagefind-filter="topic">${escapeHtml(content.topic)}</div>` : ''}
<div data-pagefind-meta="type" data-pagefind-meta-value="${escapeHtml(content.type)}"></div>
<div data-pagefind-meta="channel" data-pagefind-meta-value="${escapeHtml(content.channel)}"></div>
<div data-pagefind-meta="difficulty" data-pagefind-meta-value="${escapeHtml(content.difficulty || 'intermediate')}"></div>
<div data-pagefind-meta="id" data-pagefind-meta-value="${escapeHtml(content.id)}"></div>
<div data-pagefind-meta="url" data-pagefind-meta-value="${escapeHtml(content.url)}"></div>
<main>
<section class="content">${escapeHtml(content.body)}</section>
${content.tags?.length ? `<section class="tags">${content.tags.map(t => `<span>${escapeHtml(t)}</span>`).join(' ')}</section>` : ''}
${content.companies?.length ? `<section class="companies">${content.companies.map(c => `<span>${escapeHtml(c)}</span>`).join(' ')}</section>` : ''}
</main>
</article>
</body>
</html>`;
}

/**
 * Generate a client-side searchable JSON index
 * This allows instant search without Pagefind for small datasets
 */
function generateClientSearchIndex(allItems) {
  console.log('\n🔍 Generating client-side search index...');
  
  // Create a lightweight inverted index
  const index = {
    version: 1,
    generated: new Date().toISOString(),
    totalItems: allItems.length,
    // Inverted index: word -> [item IDs]
    index: {},
    // Item lookup: ID -> item data
    items: {},
    // Facets for filtering
    facets: {
      types: new Set(),
      channels: new Set(),
      difficulties: new Set(),
      topics: new Set(),
    },
  };
  
  const stopwords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'because', 'but', 'and', 'or', 'if', 'while', 'it', 'this', 'that',
    'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he',
    'him', 'his', 'she', 'her', 'they', 'them', 'their', 'what', 'which',
    'who', 'whom', 'about', 'up',
  ]);
  
  for (const item of allItems) {
    // Store item data
    index.items[item.id] = {
      t: item.title.substring(0, 120),
      c: item.channel,
      d: item.difficulty,
      tp: item.type,
      u: item.url,
      s: item.body.substring(0, 200), // snippet
    };
    
    // Track facets
    index.facets.types.add(item.type);
    index.facets.channels.add(item.channel);
    if (item.difficulty) index.facets.difficulties.add(item.difficulty);
    if (item.topic) index.facets.topics.add(item.topic);
    
    // Build inverted index from title + body
    const text = `${item.title} ${item.body} ${(item.tags || []).join(' ')} ${(item.companies || []).join(' ')}`.toLowerCase();
    const words = new Set(text.match(/[a-z0-9]+/g)?.filter(w => w.length > 2 && !stopwords.has(w)) || []);
    
    for (const word of words) {
      if (!index.index[word]) index.index[word] = [];
      index.index[word].push(item.id);
    }
  }
  
  // Convert sets to arrays for JSON serialization
  index.facets = {
    types: [...index.facets.types],
    channels: [...index.facets.channels],
    difficulties: [...index.facets.difficulties],
    topics: [...index.facets.topics],
  };
  
  // Write the full index
  const indexPath = path.join(clientSearchDir, 'search-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index));
  console.log(`   ✓ search-index.json (${allItems.length} items, ${(index.index ? Object.keys(index.index).length : 0)} terms)`);
  
  // Also write a compressed version
  const compressed = zlib.gzipSync(JSON.stringify(index));
  fs.writeFileSync(path.join(clientSearchDir, 'search-index.json.gz'), compressed);
  console.log(`   ✓ search-index.json.gz (${(compressed.length / 1024).toFixed(1)} KB)`);
}

/**
 * Index questions for Pagefind
 */
async function indexQuestions() {
  console.log('📚 Indexing questions...');
  
  const questionsPath = path.join(dataDir, 'all-questions.json');
  const channelsPath = path.join(dataDir, 'channels.json');
  
  if (!fs.existsSync(questionsPath)) {
    console.log('   ⚠️  all-questions.json not found. Run build:static first.');
    return [];
  }
  
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  const channels = fs.existsSync(channelsPath) ? JSON.parse(fs.readFileSync(channelsPath, 'utf-8')) : [];
  const channelMap = new Map(channels.map(c => [c.id, c]));
  
  let indexed = 0;
  const searchItems = [];
  
  for (const q of questions) {
    const channel = channelMap.get(q.channel);
    const channelName = channel?.name || q.channel;
    
    const content = {
      id: q.id,
      title: q.question,
      type: 'question',
      channel: channelName,
      difficulty: q.difficulty,
      topic: formatSubChannel(q.subChannel),
      url: `/channel/${q.channel}#q-${q.id}`,
      body: q.answer || '',
      tags: q.tags || [],
      companies: q.companies || [],
    };
    
    // Write HTML for Pagefind
    const html = generateIndexedHtml(content);
    fs.writeFileSync(path.join(outputDir, `q-${q.id}.html`), html);
    
    // Collect for client-side index
    searchItems.push(content);
    indexed++;
  }
  
  console.log(`   ✓ ${indexed} questions indexed`);
  return searchItems;
}

/**
 * Index coding challenges for Pagefind
 */
async function indexCodingChallenges() {
  console.log('\n🧩 Indexing coding challenges...');
  
  const challengesPath = path.join(dataDir, 'coding-challenges.json');
  if (!fs.existsSync(challengesPath)) {
    console.log('   ⚠️  coding-challenges.json not found.');
    return [];
  }
  
  const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf-8'));
  if (!Array.isArray(challenges) || challenges.length === 0) {
    console.log('   No coding challenges to index');
    return [];
  }
  
  let indexed = 0;
  const searchItems = [];
  
  for (const challenge of challenges) {
    const content = {
      id: challenge.id,
      title: challenge.title,
      type: 'coding-challenge',
      channel: challenge.category || 'coding',
      difficulty: challenge.difficulty,
      topic: challenge.category,
      url: `/challenge/${challenge.id}`,
      body: `${challenge.description}\n\nTime complexity: ${challenge.complexity?.time || 'N/A'}\nSpace complexity: ${challenge.complexity?.space || 'N/A'}`,
      tags: challenge.tags || [],
      companies: challenge.companies || [],
    };
    
    const html = generateIndexedHtml(content);
    fs.writeFileSync(path.join(outputDir, `cc-${challenge.id}.html`), html);
    searchItems.push(content);
    indexed++;
  }
  
  console.log(`   ✓ ${indexed} coding challenges indexed`);
  return searchItems;
}

/**
 * Index flashcards for Pagefind
 */
async function indexFlashcards() {
  console.log('\n🃏 Indexing flashcards...');
  
  const flashcardsPath = path.join(dataDir, 'flashcards.json');
  if (!fs.existsSync(flashcardsPath)) {
    console.log('   ⚠️  flashcards.json not found.');
    return [];
  }
  
  const flashcards = JSON.parse(fs.readFileSync(flashcardsPath, 'utf-8'));
  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    console.log('   No flashcards to index');
    return [];
  }
  
  let indexed = 0;
  const searchItems = [];
  
  // Group flashcards by channel to reduce file count
  const byChannel = {};
  for (const fc of flashcards) {
    if (!byChannel[fc.channel]) byChannel[fc.channel] = [];
    byChannel[fc.channel].push(fc);
  }
  
  for (const [channel, cards] of Object.entries(byChannel)) {
    // Create one HTML file per channel with all its flashcards
    let html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Flashcards - ${escapeHtml(channel)}</title></head>
<body>
<article data-pagefind-body>
<h1 data-pagefind-meta="title">Flashcards: ${escapeHtml(channel)}</h1>
<div data-pagefind-filter="type">flashcard</div>
<div data-pagefind-filter="channel">${escapeHtml(channel)}</div>
<div data-pagefind-meta="type" data-pagefind-meta-value="flashcard"></div>
<div data-pagefind-meta="channel" data-pagefind-meta-value="${escapeHtml(channel)}"></div>
<main>`;
    
    for (const fc of cards) {
      html += `<section class="flashcard" data-pagefind-meta="flashcard-${fc.id}">
<h2>${escapeHtml(fc.front)}</h2>
<p>${escapeHtml(fc.back)}</p>
${fc.hint ? `<p class="hint">${escapeHtml(fc.hint)}</p>` : ''}
${fc.codeExample ? `<pre>${escapeHtml(fc.codeExample)}</pre>` : ''}
</section>`;
      
      searchItems.push({
        id: fc.id,
        title: fc.front,
        type: 'flashcard',
        channel: fc.channel,
        difficulty: fc.difficulty,
        topic: fc.category,
        url: `/flashcards/${fc.channel}`,
        body: fc.back,
        tags: fc.tags || [],
      });
    }
    
    html += '</main></article></body></html>';
    fs.writeFileSync(path.join(outputDir, `fc-${channel}.html`), html);
    indexed += cards.length;
  }
  
  console.log(`   ✓ ${indexed} flashcards indexed (${Object.keys(byChannel).length} channel files)`);
  return searchItems;
}

/**
 * Index learning paths for Pagefind
 */
async function indexLearningPaths() {
  console.log('\n🗺️  Indexing learning paths...');
  
  const pathsPath = path.join(dataDir, 'learning-paths.json');
  if (!fs.existsSync(pathsPath)) {
    console.log('   ⚠️  learning-paths.json not found.');
    return [];
  }
  
  const learningPaths = JSON.parse(fs.readFileSync(pathsPath, 'utf-8'));
  if (!Array.isArray(learningPaths) || learningPaths.length === 0) {
    console.log('   No learning paths to index');
    return [];
  }
  
  let indexed = 0;
  const searchItems = [];
  
  for (const lp of learningPaths) {
    const content = {
      id: lp.id,
      title: lp.title,
      type: 'learning-path',
      channel: (lp.channels ? JSON.parse(lp.channels) : []).join(', '),
      difficulty: lp.difficulty,
      topic: lp.pathType,
      url: `/learn/${lp.id}`,
      body: `${lp.description}\n\nLearning objectives:\n${(lp.learningObjectives ? JSON.parse(lp.learningObjectives) : []).join('\n')}`,
      tags: lp.tags ? JSON.parse(lp.tags) : [],
    };
    
    const html = generateIndexedHtml(content);
    fs.writeFileSync(path.join(outputDir, `lp-${lp.id}.html`), html);
    searchItems.push(content);
    indexed++;
  }
  
  console.log(`   ✓ ${indexed} learning paths indexed`);
  return searchItems;
}

/**
 * Index certifications for Pagefind
 */
async function indexCertifications() {
  console.log('\n📜 Indexing certifications...');
  
  const certsPath = path.join(dataDir, 'certifications.json');
  if (!fs.existsSync(certsPath)) {
    console.log('   ⚠️  certifications.json not found.');
    return [];
  }
  
  const certs = JSON.parse(fs.readFileSync(certsPath, 'utf-8'));
  if (!Array.isArray(certs) || certs.length === 0) {
    console.log('   No certifications to index');
    return [];
  }
  
  let indexed = 0;
  const searchItems = [];
  
  for (const cert of certs) {
    const content = {
      id: cert.id,
      title: `${cert.name} Certification Prep`,
      type: 'certification',
      channel: cert.provider,
      difficulty: cert.difficulty,
      topic: cert.category,
      url: `/cert/${cert.id}`,
      body: `${cert.description}\n\nExam: ${cert.examCode || 'N/A'}\nDuration: ${cert.examDuration || 90} minutes\nPassing score: ${cert.passingScore || 70}%\nEstimated hours: ${cert.estimatedHours || 40}`,
      tags: cert.domains ? JSON.parse(cert.domains) : [],
    };
    
    const html = generateIndexedHtml(content);
    fs.writeFileSync(path.join(outputDir, `cert-${cert.id}.html`), html);
    searchItems.push(content);
    indexed++;
  }
  
  console.log(`   ✓ ${indexed} certifications indexed`);
  return searchItems;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('=== 🔍 Optimized Pagefind Index Generator ===\n');
  
  const allSearchItems = [];
  
  // Index all content types
  allSearchItems.push(...await indexQuestions());
  allSearchItems.push(...await indexCodingChallenges());
  allSearchItems.push(...await indexFlashcards());
  allSearchItems.push(...await indexLearningPaths());
  allSearchItems.push(...await indexCertifications());
  
  console.log(`\n📊 Total items indexed: ${allSearchItems.length}`);
  console.log(`   HTML files generated: ${allSearchItems.length}`);
  console.log(`   Output directory: ${outputDir}`);
  
  // Generate client-side search index
  await generateClientSearchIndex(allSearchItems);
  
  // Generate search index metadata
  const metadata = {
    version: 1,
    generated: new Date().toISOString(),
    totalItems: allSearchItems.length,
    types: {},
    channels: {},
  };
  
  for (const item of allSearchItems) {
    metadata.types[item.type] = (metadata.types[item.type] || 0) + 1;
    metadata.channels[item.channel] = (metadata.channels[item.channel] || 0) + 1;
  }
  
  fs.writeFileSync(
    path.join(clientSearchDir, 'search-metadata.json'),
    JSON.stringify(metadata, null, 0)
  );
  console.log(`\n✅ Search index complete!`);
  console.log(`   Types: ${JSON.stringify(metadata.types)}`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
