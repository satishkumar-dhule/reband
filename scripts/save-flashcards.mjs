#!/usr/bin/env node
/**
 * Flashcard Saver
 * Saves flashcards to the database
 * 
 * Usage:
 *   node scripts/save-flashcards.mjs <json-file> --channel=<channel>
 * 
 * Example:
 *   node scripts/save-flashcards.mjs /tmp/flashcards-networking.json --channel=networking
 */

import { createClient } from "@libsql/client";
import fs from "fs";
import crypto from "crypto";
import path from "path";

const args = process.argv.slice(2);
const jsonFile = args[0];
const channelArg = args.find(a => a.startsWith('--channel='));
const channel = channelArg ? channelArg.split('=')[1] : 'javascript';

if (!jsonFile) {
  console.error("Usage: node scripts/save-flashcards.mjs <json-file> --channel=<channel>");
  process.exit(1);
}

// Read and parse the JSON file
const content = fs.readFileSync(jsonFile, 'utf-8');
const data = JSON.parse(content);

const flashcards = data.flashcards || data;
console.log(`\nFound ${flashcards.length} flashcards to save for channel: ${channel}`);

// Save flashcards to database
async function saveFlashcards(cards) {
  const client = createClient({ url: "file:local.db" });
  
  let saved = 0;
  let errors = 0;
  
  for (const card of cards) {
    try {
      const id = card.id || `fla-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
      const now = new Date().toISOString();
      
      // Convert codeExample object to JSON string if present
      // Note: DB column is "code_example", not "codeExample"
      const codeExample = card.codeExample ? JSON.stringify(card.codeExample) : null;
      
      // Convert tags array to JSON string
      const tags = card.tags ? JSON.stringify(card.tags) : null;
      
      await client.execute({
        sql: `INSERT OR IGNORE INTO flashcards (id, channel, front, back, hint, code_example, mnemonic, difficulty, tags, category, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          id,
          card.channel || channel,
          card.front,
          card.back,
          card.hint || null,
          codeExample,
          card.mnemonic || null,
          card.difficulty,
          tags,
          card.category || null,
          'active',
          now
        ]
      });
      saved++;
      console.log(`  ✓ Saved: ${card.front.slice(0, 50)}...`);
    } catch (e) {
      errors++;
      console.error(`  ✗ Failed: ${card.front?.slice(0, 50)} - ${e.message}`);
    }
  }
  
  client.close();
  return { saved, errors };
}

const result = await saveFlashcards(flashcards);
console.log(`\n✓ Saved ${result.saved} flashcards, ${result.errors} errors`);
process.exit(result.errors > 0 ? 1 : 0);
