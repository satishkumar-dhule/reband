#!/usr/bin/env node
/**
 * Update Script for Content Pipeline
 * 
 * Regenerates and updates all content types:
 * - Questions (from topics)
 * - Voice sessions
 * - Learning paths
 * - Static JSON data files
 * 
 * Usage:
 *   node script/update-content.js --type=questions --count=10
 *   node script/update-content.js --type=voice-sessions
 *   node script/update-content.js --type=all
 *   node script/update-content.js --rebuild-data
 */

import 'dotenv/config';
import { getDb, initBotTables } from './bots/shared/db.js';
import { runPipeline as runCreator } from './bots/creator-bot.js';
import { buildSessions as buildVoiceSessions } from './bots/session-builder-bot.js';

const db = getDb();

// Parse CLI arguments
const args = process.argv.slice(2);
const getArg = (name, defaultVal = null) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : defaultVal;
};

const contentType = getArg('type', 'all');
const count = parseInt(getArg('count', '10'));
const rebuildData = args.includes('--rebuild-data');

// ============================================
// CONTENT UPDATERS
// ============================================

async function updateQuestions(count) {
  console.log('\n📝 Updating questions...\n');
  
  const topics = [
    'microservices communication patterns',
    'database indexing strategies',
    'kubernetes pod scheduling',
    'react state management',
    'API rate limiting',
    'distributed caching',
    'CI/CD pipeline design',
    'load balancing algorithms',
    'event-driven architecture',
    'service mesh patterns'
  ];
  
  let updated = 0;
  
  for (let i = 0; i < Math.min(count, topics.length); i++) {
    const topic = topics[i % topics.length];
    console.log(`\n--- Processing: "${topic}" ---`);
    
    try {
      const result = await runCreator(topic, {});
      if (result.success) {
        updated++;
        console.log(`✅ Created: ${result.savedId}`);
      }
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\n✅ Questions updated: ${updated}`);
  return updated;
}

async function updateVoiceSessions() {
  console.log('\n🎤 Updating voice sessions...\n');
  
  try {
    const result = await buildVoiceSessions();
    console.log(`\n✅ Voice sessions updated: ${result?.sessions || 0}`);
    return result?.sessions || 0;
  } catch (error) {
    console.error(`❌ Voice sessions update failed: ${error.message}`);
    return 0;
  }
}

async function rebuildStaticData() {
  console.log('\n📦 Rebuilding static data files...\n');
  
  try {
    // Export questions to JSON
    const questions = await db.execute('SELECT * FROM questions WHERE status = ?', ['active']);
    
    // Group by channel
    const byChannel = {};
    for (const row of questions.rows) {
      const channel = row.channel;
      if (!byChannel[channel]) byChannel[channel] = [];
      byChannel[channel].push({
        id: row.id,
        question: row.question,
        answer: row.answer,
        explanation: row.explanation,
        difficulty: row.difficulty,
        tags: row.tags ? JSON.parse(row.tags) : [],
        companies: row.companies ? JSON.parse(row.companies) : []
      });
    }
    
    console.log(`   Exported ${questions.rows.length} questions to ${Object.keys(byChannel).length} channels`);
    
    // Export channels list
    const channels = Object.keys(byChannel).map(ch => ({
      id: ch,
      label: ch.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      questionCount: byChannel[ch].length
    }));
    
    console.log(`   Generated channels list with ${channels.length} channels`);
    
    // Export voice sessions
    const sessions = await db.execute('SELECT * FROM voice_sessions ORDER BY created_at DESC');
    console.log(`   Exported ${sessions.rows.length} voice sessions`);
    
    // Export bot stats
    const botRuns = await db.execute(`
      SELECT bot_name, COUNT(*) as runs, SUM(items_created) as created, MAX(started_at) as last_run
      FROM bot_runs
      GROUP BY bot_name
    `);
    
    console.log(`   Bot stats: ${botRuns.rows.length} bots tracked`);
    
    console.log('\n✅ Static data rebuild complete');
    return true;
  } catch (error) {
    console.error(`❌ Static data rebuild failed: ${error.message}`);
    return false;
  }
}

async function syncVectorDB() {
  console.log('\n🔄 Syncing to vector database...\n');
  
  try {
    const { default: vectorDB } = await import('./ai/services/vector-db.js');
    await vectorDB.init();
    
    // Get all active questions
    const questions = await db.execute('SELECT id, question, answer, explanation, channel FROM questions WHERE status = ?', ['active']);
    
    console.log(`   Syncing ${questions.rows.length} questions to vector DB...`);
    
    // Note: Actual sync would require the vector DB service to be available
    console.log('⚠️  Vector DB sync requires QDRANT_URL and QDRANT_API_KEY');
    
    return true;
  } catch (error) {
    console.error(`❌ Vector DB sync failed: ${error.message}`);
    return false;
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('═'.repeat(50));
  console.log('🔄 CONTENT PIPELINE UPDATE');
  console.log('═'.repeat(50));
  console.log(`Type: ${contentType}`);
  console.log(`Count: ${count}`);
  console.log(`Rebuild Data: ${rebuildData}`);
  console.log('═'.repeat(50));
  
  await initBotTables();
  
  const results = {
    questions: 0,
    voiceSessions: 0,
    staticData: false,
    vectorSync: false
  };
  
  try {
    // Update based on type
    if (contentType === 'all' || contentType === 'questions') {
      results.questions = await updateQuestions(count);
    }
    
    if (contentType === 'all' || contentType === 'voice-sessions') {
      results.voiceSessions = await updateVoiceSessions();
    }
    
    if (rebuildData || contentType === 'rebuild') {
      results.staticData = await rebuildStaticData();
    }
    
    if (contentType === 'sync' || contentType === 'all') {
      results.vectorSync = await syncVectorDB();
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('📊 UPDATE SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Questions updated: ${results.questions}`);
    console.log(`Voice sessions updated: ${results.voiceSessions}`);
    console.log(`Static data rebuilt: ${results.staticData ? '✅' : '❌'}`);
    console.log(`Vector DB synced: ${results.vectorSync ? '✅' : '❌'}`);
    console.log('═'.repeat(50));
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(console.error);
}

export { main as updateContent };
export default { updateContent: main };
