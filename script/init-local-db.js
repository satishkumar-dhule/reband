import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:local.db' });

async function init() {
  await client.execute(`CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    diagram TEXT,
    difficulty TEXT NOT NULL,
    tags TEXT,
    channel TEXT NOT NULL,
    sub_channel TEXT NOT NULL,
    source_url TEXT,
    videos TEXT,
    companies TEXT,
    eli5 TEXT,
    tldr TEXT,
    relevance_score INTEGER,
    relevance_details TEXT,
    job_title_relevance TEXT,
    experience_level_tags TEXT,
    voice_keywords TEXT,
    voice_suitable INTEGER,
    status TEXT DEFAULT 'active',
    is_new INTEGER DEFAULT 1,
    last_updated TEXT,
    created_at TEXT
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS channel_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL,
    sub_channel TEXT NOT NULL,
    question_id TEXT NOT NULL
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS work_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    action TEXT NOT NULL,
    priority INTEGER DEFAULT 5,
    status TEXT DEFAULT 'pending',
    reason TEXT,
    created_by TEXT,
    assigned_to TEXT,
    created_at TEXT,
    processed_at TEXT,
    result TEXT
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS bot_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bot_name TEXT NOT NULL,
    action TEXT NOT NULL,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    before_state TEXT,
    after_state TEXT,
    reason TEXT,
    created_at TEXT
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS bot_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bot_name TEXT NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    status TEXT DEFAULT 'running',
    stats TEXT,
    error_log TEXT
  )`);

  console.log('Local SQLite database initialized successfully');
  process.exit(0);
}

init().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
