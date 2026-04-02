# Content Generation Workflow

This directory contains tools for generating and managing interview preparation content.

## Overview

The content generation system creates and manages:
- Interview questions across multiple channels
- Coding challenges with test cases
- Certification exam questions
- Flashcards for spaced repetition
- Voice practice sessions

## Scripts

### save-content.mjs

Helper script for saving generated content to the database.

```javascript
import { saveContent } from './save-content.mjs';

// Save an interview question
const question = {
  question: 'What is the CAP theorem?',
  answer: 'Consistency, Availability, Partition tolerance...',
  explanation: 'The CAP theorem states...',
  difficulty: 'intermediate',
  channel: 'system-design',
  subChannel: 'distributed-systems',
  tags: ['cap theorem', 'distributed systems'],
};
const saved = await saveContent(question, 'question');

// Save a flashcard
const flashcard = {
  channel: 'algorithms',
  front: 'What is Big O of quicksort?',
  back: 'O(n log n) average, O(n²) worst case',
  difficulty: 'intermediate',
  tags: ['big-o', 'sorting'],
};
const saved = await saveContent(flashcard, 'flashcard');

// Save a voice session
const session = {
  topic: 'System Design Basics',
  description: 'Practice session for system design fundamentals',
  channel: 'system-design',
  difficulty: 'beginner',
  questionIds: ['q1', 'q2', 'q3'],
  totalQuestions: 3,
  estimatedMinutes: 10,
};
const saved = await saveContent(session, 'voiceSession');
```

## Supported Content Types

| Type | Description | Table |
|------|-------------|-------|
| `question` | Interview Q&A questions | `questions` |
| `flashcard` | SRS flashcards | `flashcards` |
| `exam` | Certification exams | `certifications` |
| `voiceSession` | Voice practice sessions | `voice_sessions` |
| `codingChallenge` | Coding problems | `questions` |

## Database

The scripts connect to `file:local.db` using `@libsql/client`.

## Related Documentation

- [CONTENT_STANDARDS.md](../../CONTENT_STANDARDS.md) - Content quality rules
- [CONTENT_LIFECYCLE_SOP.md](../../CONTENT_LIFECYCLE_SOP.md) - Content lifecycle procedures
