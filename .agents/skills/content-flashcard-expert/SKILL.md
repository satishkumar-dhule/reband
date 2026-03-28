---
name: content-flashcard-expert
description: Generate spaced repetition flashcards for DevPrep. Use when creating flashcards for learning programming concepts, APIs, and technologies. Includes SM-2 algorithm fields, word count limits, and code syntax validation.
---

# Content Flashcard Expert

Specialized skill for generating spaced repetition flashcards with proper format and SM-2 metadata.

## Generation Parameters

```typescript
interface FlashcardGenerationParams {
  channel: string;              // javascript, react, aws, python, etc.
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  topic?: string;              // Specific topic
  count?: number;
}
```

## Required Output Structure

```typescript
interface Flashcard {
  id: string;
  channelId: string;
  front: string;               // Question, ≤15 words, ends with "?"
  back: string;                // Answer, 40-120 words
  hint?: string;               // Optional hint
  code?: {                     // Optional code example
    language: string;
    snippet: string;
  };
  difficulty: string;
  tags: string[];
  // SM-2 Spaced Repetition Fields (initialized by pipeline)
  sm2?: {
    easeFactor: number;       // Default 2.5
    interval: number;         // Days until next review
    repetitions: number;      // Successful reviews count
    nextReviewDate: Date;
  };
}
```

## Validation Rules

### Word Count Limits
- Front: ≤15 words, must end with "?"
- Back: 40-120 words
- Direct answer first, then elaboration

### Format Requirements
- Front: Question format, clear and specific
- Back: Direct answer at start, then explanation
- Code examples: Valid syntax, minimal

### Difficulty Taxonomy

| Level | Description |
|-------|-------------|
| beginner | Basic syntax, fundamental concepts |
| intermediate | Patterns, best practices, common APIs |
| advanced | Performance, edge cases, deep internals |

### Code Validation
- JavaScript: Valid ES6+ syntax
- Python: Valid Python 3 syntax
- Syntax errors make flashcards unusable

### Hint Quality
- Hint should NOT give away the answer
- Should point in right direction
- Partial information only

## Generation Prompt Template

```
Create {count} flashcard(s) for {channel} at {difficulty} level.

Topic: {topic or 'core concepts'}

Requirements:
- Front: ≤15 words, question format, ends with "?"
- Back: 40-120 words, direct answer first, then explanation
- Hint: Optional, should not give away answer
- Code: Optional, must be valid syntax
- Tags: Include channel and related concepts

CRITICAL:
- Word count limits are STRICT
- Front should be answerable without seeing back
- Code examples should be minimal and runnable

Return as JSON matching the Flashcard structure.
```

## SM-2 Algorithm Integration

The pipeline will initialize these fields on save:

```typescript
const defaultSM2 = {
  easeFactor: 2.5,
  interval: 1,           // Start at 1 day
  repetitions: 0,
  nextReviewDate: new Date()
};
```

## Quality Gates

Before returning, verify:
- [ ] Front ≤15 words
- [ ] Front ends with "?"
- [ ] Back 40-120 words
- [ ] Direct answer first in back
- [ ] Code syntax valid (if present)
- [ ] Hint doesn't give away answer
- [ ] Difficulty matches channel taxonomy
- [ ] No duplicate cards

## Related Skills

- Use `content-question-expert` for detailed questions
- Use `pipeline-processor` for SM-2 initialization
- Use `pipeline-verifier` for format validation
