# Flashcards Feature Design

**Date:** 2026-03-31
**Status:** Approved
**Type:** Feature Addition

## Overview

Add a channel-integrated flashcards feature to DevPrep. Flashcards are accessible via tabs on channel pages, with basic progress tracking using localStorage.

## Requirements

- Flashcards accessible via tabs on channel pages (Questions | Flashcards | Voice)
- Basic localStorage progress tracking (seen/unseen, progress percentage)
- Parallel generation via multiple flashcard-expert agents
- Build-time export to `public/data/flashcards-<channel>.json`

## Architecture

### Database Schema Addition

```typescript
// shared/schema.ts - add flashcards table
export const flashcards = sqliteTable("flashcards", {
  id: text("id").primaryKey(),
  channel: text("channel").notNull(),
  front: text("front").notNull(),           // Question, ≤15 words
  back: text("back").notNull(),             // Answer, 40-120 words
  hint: text("hint"),                       // Optional retrieval cue
  codeExample: text("code_example"),         // JSON { language, code }
  mnemonic: text("mnemonic"),                // Optional memory aid
  difficulty: text("difficulty").notNull(),  // beginner|intermediate|advanced
  tags: text("tags"),                        // JSON array
  category: text("category"),                // Title Case category
  status: text("status").default("active"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});
```

### Frontend Components

1. **FlashcardsTab.tsx** - Tab content for flashcard review
   - Flip animation card component
   - Progress bar (seen/total)
   - Mark as seen functionality
   - localStorage persistence

2. **ChannelPage Tabs** - Extend existing tab navigation
   - Add "Flashcards" tab between Questions and Voice
   - Lazy load FlashcardsTab component

### Data Files

```
public/data/
├── flashcards-algorithms.json
├── flashcards-javascript.json
├── flashcards-react.json
└── ...
```

### Agent Swarm (Parallel Generation)

```
Coordinator Agent
├── Flashcard-Expert (algorithms)     ← parallel
├── Flashcard-Expert (javascript)   ← parallel
├── Flashcard-Expert (react)        ← parallel
├── Flashcard-Expert (devops)        ← parallel
└── ... (all channels)
```

## Implementation Tasks

1. **DB Schema** - Add flashcards table
2. **Export Script** - Add flashcards export to build pipeline
3. **Frontend Component** - FlashcardsTab with flip UI
4. **Channel Page** - Add Flashcards tab
5. **Progress Tracking** - localStorage hook
6. **Agent Generation** - Trigger parallel flashcard generation

## Verification

- [ ] Flashcards display on channel page tabs
- [ ] Cards flip on click
- [ ] Progress persists in localStorage
- [ ] All channels have flashcard decks
- [ ] Build exports flashcards to JSON
