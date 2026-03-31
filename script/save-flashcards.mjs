#!/usr/bin/env node
/**
 * Save flashcards to database
 * Reads JSON from stdin or file and inserts into the flashcards table
 */
import 'dotenv/config';
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

// Get database connection
const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url: url.startsWith("file:") ? url : url,
  authToken: url.startsWith("file:") ? undefined : authToken
});

// Read JSON file from argument
const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node save-flashcards.mjs <file.json>");
  process.exit(1);
}

const content = JSON.parse(readFileSync(filePath, 'utf-8'));
const flashcards = content.flashcards || content;

console.log(`Saving ${flashcards.length} flashcards to database...`);

let saved = 0;
let failed = 0;

for (const card of flashcards) {
  try {
    // Map fields to database schema
    const dbCard = {
      id: card.id,
      channel: card.tags?.[0] || 'devops',
      front: card.front,
      back: card.back,
      hint: card.hint || null,
      codeExample: card.codeExample ? JSON.stringify(card.codeExample) : null,
      mnemonic: card.mnemonic || null,
      difficulty: card.difficulty,
      tags: JSON.stringify(card.tags || []),
      category: card.category || null,
      status: 'active'
    };

    // Insert into database
    await db.execute(
      `INSERT INTO flashcards (id, channel, front, back, hint, code_example, mnemonic, difficulty, tags, category, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dbCard.id,
        dbCard.channel,
        dbCard.front,
        dbCard.back,
        dbCard.hint,
        dbCard.codeExample,
        dbCard.mnemonic,
        dbCard.difficulty,
        dbCard.tags,
        dbCard.category,
        dbCard.status
      ]
    );
    saved++;
    console.log(`  ✓ Saved: ${card.front.substring(0, 50)}...`);
  } catch (err) {
    failed++;
    console.error(`  ✗ Failed: ${card.front.substring(0, 50)}... - ${err.message}`);
  }
}

console.log(`\n✓ Saved ${saved} flashcards, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);