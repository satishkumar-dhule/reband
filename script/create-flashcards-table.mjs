/**
 * Create flashcards table in the database.
 */
import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:local.db' });

async function createTable() {
  console.log('Creating flashcards table...');
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      hint TEXT,
      code_example TEXT,
      mnemonic TEXT,
      difficulty TEXT NOT NULL,
      tags TEXT,
      category TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT
    )
  `);
  
  console.log('✅ Table created successfully!');
  
  // Verify
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='flashcards'");
  if (result.rows.length > 0) {
    console.log('   Verified: flashcards table exists');
  }
}

createTable()
  .then(() => process.exit(0))
  .catch(e => { 
    console.error('Fatal:', e); 
    process.exit(1); 
  });
