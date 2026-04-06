/**
 * Database initialization — ensures all required tables and indexes exist.
 * Safe to call on every startup (uses CREATE TABLE/INDEX IF NOT EXISTS).
 */
import { client } from "./db";

export async function ensureTablesExist(): Promise<void> {
  // Core tables
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
    items_processed INTEGER DEFAULT 0,
    items_created INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    items_deleted INTEGER DEFAULT 0,
    summary TEXT
  )`);

  // Extended tables
  await client.execute(`CREATE TABLE IF NOT EXISTS flashcards (
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
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS voice_sessions (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    description TEXT,
    channel TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question_ids TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    estimated_minutes INTEGER DEFAULT 5,
    created_at TEXT,
    last_updated TEXT
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS certifications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'award',
    color TEXT DEFAULT 'text-primary',
    difficulty TEXT NOT NULL,
    category TEXT NOT NULL,
    estimated_hours INTEGER DEFAULT 40,
    exam_code TEXT,
    official_url TEXT,
    domains TEXT,
    channel_mappings TEXT,
    tags TEXT,
    prerequisites TEXT,
    status TEXT DEFAULT 'active',
    question_count INTEGER DEFAULT 0,
    passing_score INTEGER DEFAULT 70,
    exam_duration INTEGER DEFAULT 90,
    created_at TEXT,
    last_updated TEXT
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS question_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_question_id TEXT NOT NULL,
    target_question_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    strength INTEGER DEFAULT 50,
    created_at TEXT
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS learning_paths (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    path_type TEXT NOT NULL,
    target_company TEXT,
    target_job_title TEXT,
    difficulty TEXT NOT NULL,
    estimated_hours INTEGER DEFAULT 40,
    question_ids TEXT NOT NULL,
    channels TEXT NOT NULL,
    tags TEXT,
    prerequisites TEXT,
    learning_objectives TEXT,
    milestones TEXT,
    popularity INTEGER DEFAULT 0,
    completion_rate INTEGER DEFAULT 0,
    average_rating INTEGER DEFAULT 0,
    metadata TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT,
    last_updated TEXT,
    last_generated TEXT
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS question_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id TEXT NOT NULL,
    question_type TEXT DEFAULT 'question',
    event_type TEXT NOT NULL,
    event_source TEXT NOT NULL,
    source_name TEXT,
    changes_summary TEXT,
    changed_fields TEXT,
    before_snapshot TEXT,
    after_snapshot TEXT,
    reason TEXT,
    metadata TEXT,
    created_at TEXT
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    session_type TEXT NOT NULL,
    session_key TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    channel_id TEXT,
    certification_id TEXT,
    progress INTEGER DEFAULT 0,
    total_items INTEGER NOT NULL,
    completed_items INTEGER DEFAULT 0,
    session_data TEXT,
    started_at TEXT,
    last_accessed_at TEXT,
    completed_at TEXT,
    status TEXT DEFAULT 'active'
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS coding_challenges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT,
    companies TEXT,
    starter_code_js TEXT,
    starter_code_py TEXT,
    test_cases TEXT,
    hints TEXT,
    solution_js TEXT,
    solution_py TEXT,
    complexity_time TEXT,
    complexity_space TEXT,
    complexity_explanation TEXT,
    time_limit INTEGER DEFAULT 15,
    created_at TEXT
  )`);

  // ─── Indexes ────────────────────────────────────────────────────────────────
  // Covering indexes are ordered to match the WHERE + GROUP BY + ORDER BY
  // clauses in the most frequently executed queries.
  const indexes = [
    // Basic column indexes (kept for backward compat)
    `CREATE INDEX IF NOT EXISTS idx_questions_channel ON questions(channel)`,
    `CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty)`,
    `CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status)`,

    // ── COVERING indexes — eliminate table-lookups for hot queries ──────────

    // /api/channels  → SELECT channel, COUNT(*) … WHERE status != ? GROUP BY channel
    `CREATE INDEX IF NOT EXISTS idx_questions_status_channel
       ON questions(status, channel)`,

    // /api/stats     → SELECT channel, difficulty, COUNT(*) … WHERE status != ?
    //                  GROUP BY channel, difficulty
    // Covering (status, channel, difficulty) lets SQLite resolve the whole
    // query from the index without touching the main B-tree rows.
    `CREATE INDEX IF NOT EXISTS idx_questions_stats_covering
       ON questions(status, channel, difficulty)`,

    // /api/questions?channel=X  → WHERE channel=? AND status != ? ORDER BY created_at
    `CREATE INDEX IF NOT EXISTS idx_questions_channel_status_created
       ON questions(channel, status, created_at)`,

    // /api/questions?channel=X&subChannel=Y
    `CREATE INDEX IF NOT EXISTS idx_questions_channel_sub_status
       ON questions(channel, sub_channel, status)`,

    // /api/questions?channel=X&difficulty=Y
    `CREATE INDEX IF NOT EXISTS idx_questions_channel_diff_status
       ON questions(channel, difficulty, status)`,

    // /api/question/random, /api/question/:id
    `CREATE INDEX IF NOT EXISTS idx_questions_channel_status_id
       ON questions(channel, status, id)`,

    // /api/certifications  → WHERE status = ?
    `CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications(status)`,
    `CREATE INDEX IF NOT EXISTS idx_certifications_category ON certifications(category)`,

    // /api/learning-paths  → WHERE status = 'active' ORDER BY popularity DESC
    `CREATE INDEX IF NOT EXISTS idx_learning_paths_status_pop
       ON learning_paths(status, popularity DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_learning_paths_path_type ON learning_paths(path_type)`,

    // /api/user/sessions
    `CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(status)`,
    `CREATE INDEX IF NOT EXISTS idx_user_sessions_session_key ON user_sessions(session_key)`,
    `CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`,

    // /api/history
    `CREATE INDEX IF NOT EXISTS idx_question_history_question_id ON question_history(question_id)`,

    // /api/coding/challenges
    `CREATE INDEX IF NOT EXISTS idx_coding_challenges_difficulty ON coding_challenges(difficulty)`,
    `CREATE INDEX IF NOT EXISTS idx_coding_challenges_category ON coding_challenges(category)`,

    // /api/flashcards/:channelId → WHERE channel = ? AND status = ?
    `CREATE INDEX IF NOT EXISTS idx_flashcards_channel_status
       ON flashcards(channel, status)`,

    // /api/voice-sessions → WHERE channel = ?
    `CREATE INDEX IF NOT EXISTS idx_voice_sessions_channel ON voice_sessions(channel)`,
  ];

  for (const sql of indexes) {
    await client.execute(sql);
  }
}
