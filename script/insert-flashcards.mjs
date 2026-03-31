/**
 * Insert flashcards into the database from JSON file.
 */
import 'dotenv/config';
import { createClient } from '@libsql/client';
import fs from 'fs';

const INPUT_FILE = process.argv[2] || '/tmp/flashcards-algorithms.json';

const url = process.env.TURSO_DATABASE_URL_RO || process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN_RO || process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function insertFlashcards() {
  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  const flashcards = data.flashcards;
  
  let inserted = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const fc of flashcards) {
    try {
      await client.execute({
        sql: `INSERT OR IGNORE INTO flashcards 
              (id, channel, front, back, hint, code_example, mnemonic, difficulty, tags, category, status, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
        args: [
          fc.id,
          'algorithms',
          fc.front,
          fc.back,
          fc.hint || null,
          JSON.stringify(fc.codeExample) || null,
          fc.mnemonic || null,
          fc.difficulty,
          JSON.stringify(fc.tags),
          fc.category,
          now
        ]
      });
      inserted++;
    } catch (e) {
      // Check if it's a duplicate (primary key constraint)
      if (e.message && e.message.includes('UNIQUE constraint failed')) {
        skipped++;
        console.log(`  ⏭️  Skipped duplicate: ${fc.id}`);
      } else {
        console.error(`  ❌ Error inserting ${fc.id}:`, e.message);
      }
    }
  }

  console.log(`\n✅ Flashcard insertion complete!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped (duplicates): ${skipped}`);
  console.log(`   Total: ${flashcards.length}`);
}

insertFlashcards()
  .then(() => process.exit(0))
  .catch(e => { 
    console.error('Fatal:', e); 
    process.exit(1); 
  });
