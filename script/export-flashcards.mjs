/**
 * Export flashcards from Turso database to static JSON files for GitHub Pages build.
 */
import 'dotenv/config';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = 'public/data';

const url = 'file:local.db';
const authToken = undefined;

if (!url) {
  console.error('❌ Missing TURSO_DATABASE_URL environment variable');
  process.exit(1);
}

const client = createClient({ url, authToken });

const CHANNEL_LABELS = {
  'algorithms': 'Algorithms',
  'data-structures': 'Data Structures',
  'system-design': 'System Design',
  'frontend': 'Frontend',
  'backend': 'Backend',
  'devops': 'DevOps',
  'kubernetes': 'Kubernetes',
  'aws': 'AWS',
  'machine-learning': 'Machine Learning',
  'security': 'Security',
  'behavioral': 'Behavioral',
  'database': 'Database',
  'generative-ai': 'Generative AI',
};

function safeJsonParse(str, fallback = null) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

function parseFlashcardRow(row) {
  return {
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
    createdAt: row.created_at,
  };
}

async function main() {
  console.log('=== Exporting Flashcards to Static JSON ===\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('📥 Fetching all active flashcards...');
  const result = await client.execute("SELECT * FROM flashcards WHERE status = 'active' ORDER BY channel, id");
  const allFlashcards = result.rows.map(parseFlashcardRow);
  console.log(`   Found ${allFlashcards.length} flashcards`);

  const channelData = {};
  const channelStats = [];

  for (const fc of allFlashcards) {
    if (!channelData[fc.channel]) {
      channelData[fc.channel] = {
        flashcards: [],
        stats: { total: 0, beginner: 0, intermediate: 0, advanced: 0 }
      };
    }
    
    channelData[fc.channel].flashcards.push(fc);
    channelData[fc.channel].stats.total++;
    channelData[fc.channel].stats[fc.difficulty]++;
  }

  console.log('\n📝 Writing flashcard channel files...');
  for (const [channelId, data] of Object.entries(channelData)) {
    const channelFile = path.join(OUTPUT_DIR, `flashcards-${channelId}.json`);
    fs.writeFileSync(channelFile, JSON.stringify({
      channel: channelId,
      flashcards: data.flashcards,
      totalCount: data.stats.total
    }, null, 0));
    console.log(`   ✓ flashcards-${channelId}.json (${data.stats.total} flashcards)`);
    
    channelStats.push({
      id: channelId,
      label: CHANNEL_LABELS[channelId] || channelId,
      flashcardCount: data.stats.total
    });
  }

  const indexFile = path.join(OUTPUT_DIR, 'flashcards-index.json');
  fs.writeFileSync(indexFile, JSON.stringify({
    channels: channelStats
  }, null, 0));
  console.log(`   ✓ flashcards-index.json (${channelStats.length} channels)`);

  console.log('\n✅ Flashcards exported successfully!');
  console.log(`   Output directory: ${OUTPUT_DIR}`);
  console.log(`   Total flashcards: ${allFlashcards.length}`);
  console.log(`   Total channels: ${channelStats.length}`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
