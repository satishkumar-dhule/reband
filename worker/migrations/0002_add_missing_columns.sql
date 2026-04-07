-- Migration 0002: Add missing columns to match worker code expectations
-- Many columns referenced in worker/index.ts were missing from the initial schema

-- ─── questions: add missing columns ─────────────────────────────────────────
ALTER TABLE questions ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
ALTER TABLE questions ADD COLUMN subchannel TEXT;
ALTER TABLE questions ADD COLUMN certification_id TEXT;
ALTER TABLE questions ADD COLUMN domain TEXT;

-- Backfill: map status='active' → is_active=1, everything else → 0
UPDATE questions SET is_active = CASE WHEN status = 'active' THEN 1 ELSE 0 END;

-- Backfill: copy sub_channel → subchannel
UPDATE questions SET subchannel = sub_channel;

-- ─── channel_mappings: add all missing columns ───────────────────────────────
ALTER TABLE channel_mappings ADD COLUMN channel_name TEXT;
ALTER TABLE channel_mappings ADD COLUMN label TEXT;
ALTER TABLE channel_mappings ADD COLUMN description TEXT;
ALTER TABLE channel_mappings ADD COLUMN icon TEXT DEFAULT 'code';
ALTER TABLE channel_mappings ADD COLUMN color TEXT DEFAULT 'text-primary';
ALTER TABLE channel_mappings ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE channel_mappings ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;

-- ─── certifications: add is_active ───────────────────────────────────────────
ALTER TABLE certifications ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
UPDATE certifications SET is_active = CASE WHEN status = 'active' THEN 1 ELSE 0 END;

-- ─── learning_paths: add missing columns ─────────────────────────────────────
ALTER TABLE learning_paths ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
ALTER TABLE learning_paths ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE learning_paths ADD COLUMN company TEXT;
ALTER TABLE learning_paths ADD COLUMN job_title TEXT;

UPDATE learning_paths SET is_active = CASE WHEN status = 'active' THEN 1 ELSE 0 END;
UPDATE learning_paths SET company = target_company;
UPDATE learning_paths SET job_title = target_job_title;

-- ─── coding_challenges: add is_active ────────────────────────────────────────
ALTER TABLE coding_challenges ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
UPDATE coding_challenges SET is_active = CASE WHEN status = 'active' THEN 1 ELSE 0 END;

-- ─── flashcards: add is_active ────────────────────────────────────────────────
ALTER TABLE flashcards ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
