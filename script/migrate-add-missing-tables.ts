/**
 * Database Migration: Add missing tables
 * 
 * Tables defined in shared/schema.ts but not created in local.db:
 * - voice_sessions
 * - certifications  
 * - question_relationships
 * - learning_paths
 * - question_history
 * - user_sessions
 * 
 * Run with: npx tsx script/migrate-add-missing-tables.ts
 */

import { createClient } from "@libsql/client";

const client = createClient({ url: "file:local.db" });

async function migrate() {
  console.log("🔄 Running migration: Add missing tables\n");

  // 1. voice_sessions - pre-built sessions of related questions
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS voice_sessions (
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
    )`,
  });
  console.log("✅ Created voice_sessions table");

  // 2. certifications - certification exam tracks
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS certifications (
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
    )`,
  });
  console.log("✅ Created certifications table");

  // 3. question_relationships - links between questions for voice sessions
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS question_relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_question_id TEXT NOT NULL,
      target_question_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL,
      strength INTEGER DEFAULT 50,
      created_at TEXT,
      FOREIGN KEY (source_question_id) REFERENCES questions(id),
      FOREIGN KEY (target_question_id) REFERENCES questions(id)
    )`,
  });
  console.log("✅ Created question_relationships table");

  // 4. learning_paths - dynamically generated learning paths
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS learning_paths (
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
    )`,
  });
  console.log("✅ Created learning_paths table");

  // 5. question_history - audit trail for question changes
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS question_history (
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
    )`,
  });
  console.log("✅ Created question_history table");

  // 6. user_sessions - track active user sessions for resume functionality
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS user_sessions (
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
    )`,
  });
  console.log("✅ Created user_sessions table");

  // Create indexes for performance
  console.log("\n📊 Creating indexes for performance...\n");

  // questions indexes
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_questions_channel ON questions(channel)`,
  });
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty)`,
  });
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status)`,
  });
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_questions_channel_status ON questions(channel, status)`,
  });
  console.log("✅ Created indexes on questions table");

  // certifications indexes
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications(status)`,
  });
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_certifications_category ON certifications(category)`,
  });
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_certifications_difficulty ON certifications(difficulty)`,
  });
  console.log("✅ Created indexes on certifications table");

  // learning_paths indexes
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_learning_paths_status ON learning_paths(status)`,
  });
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_learning_paths_path_type ON learning_paths(path_type)`,
  });
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_learning_paths_target_company ON learning_paths(target_company)`,
  });
  console.log("✅ Created indexes on learning_paths table");

  // user_sessions indexes
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(status)`,
  });
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_user_sessions_session_key ON user_sessions(session_key)`,
  });
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_user_sessions_last_accessed ON user_sessions(last_accessed_at)`,
  });
  console.log("✅ Created indexes on user_sessions table");

  // question_history indexes
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_question_history_question_id ON question_history(question_id)`,
  });
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_question_history_event_type ON question_history(event_type)`,
  });
  await client.execute({
    sql: `CREATE INDEX IF NOT EXISTS idx_question_history_created_at ON question_history(created_at)`,
  });
  console.log("✅ Created indexes on question_history table");

  console.log("\n🎉 Migration completed successfully!\n");

  // Verify tables exist
  const result = await client.execute({
    sql: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  });
  console.log("📋 Tables in database:");
  result.rows.forEach((row: any) => console.log(`  - ${row.name}`));
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });