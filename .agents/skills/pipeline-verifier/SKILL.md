---
name: pipeline-verifier
description: Validate generated content across all content types. Use when verifying questions, challenges, flashcards, and other content before saving. Implements content-type-specific validation rules, syntax checking, and quality gates.
---

# Pipeline Verifier Coordinator

Validates generated content with specialized rules per content type.

## Responsibilities

1. **Schema Validation** - Verify required fields present
2. **Content-Specific Rules** - Apply type-specific validation
3. **Syntax Checking** - Validate code examples
4. **Quality Scoring** - Rate content quality
5. **Parallel Validation** - Process multiple items concurrently

## Validation Rules by Content Type

### Questions (content-question-expert)
- Title: 6-20 words, ends with "?"
- Short answer: 80-250 words
- Code: 8-35 lines, valid syntax
- Difficulty matches channel taxonomy

### Challenges (content-challenge-expert)
- All three languages present (JS/TS/Python)
- Test case minimums met
- Syntax valid for each language
- Solutions pass all tests

### Certifications (content-certification-expert)
- Exactly 4 options
- Single correct answer
- Options similar length
- Explanation covers all options

### Flashcards (content-flashcard-expert)
- Front: ≤15 words, ends with "?"
- Back: 40-120 words
- Code syntax valid
- SM-2 fields present

### Voice Sessions (content-voice-expert)
- Prompt clear and specific
- Timing matches difficulty
- Key points: 3-5 items
- Follow-ups: 2-3 items

### Blog Posts (content-blog-expert)
- Meta title: 50-60 chars
- Meta description: 150-160 chars
- Keywords present
- Internal links present

## Message Types

### Incoming
```typescript
{
  type: 'VALIDATE',
  payload: {
    contentType: ContentType;
    items: ContentItem[];
    options?: ValidationOptions;
  }
}
```

### Outgoing
```typescript
{
  type: 'VALIDATION_RESULT',
  payload: {
    itemId: string;
    status: 'pass' | 'fail' | 'warning';
    score: number;           // 0-100
    issues: ValidationIssue[];
  }
}

{
  type: 'BATCH_COMPLETE',
  payload: {
    contentType: ContentType;
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  }
}
```

## Validation Options

```typescript
interface ValidationOptions {
  strict: boolean;           // Fail on warnings
  parallel: boolean;        // Run validations in parallel
  maxConcurrent: number;    // Max parallel workers
}
```

## Usage

> **Note:** Actual scripts are located in `script/bots/` directory. Use `node script/bots/verifier-bot.js` instead of `script/pipeline/verifier-coordinator.js`.

```bash
# Validate pending content
node script/bots/verifier-bot.js --status=pending

# Validate specific type
node script/bots/verifier-bot.js --type=question --limit=100

# Strict validation
node script/bots/verifier-bot.js --all --strict
```

## Quality Scoring

```typescript
interface ValidationResult {
  score: number;           // 0-100
  breakdown: {
    structure: number;     // Required fields
    quality: number;       // Content quality
    syntax: number;        // Code validity
    uniqueness: number;   // No duplicates
  };
  issues: {
    severity: 'error' | 'warning' | 'info';
    field: string;
    message: string;
  }[];
}
```

## Quality Gates

| Score | Status | Action |
|-------|--------|--------|
| 90-100 | ✅ Pass | Proceed to processor |
| 70-89 | ⚠️ Warning | Review, then proceed |
| <70 | ❌ Fail | Return to generator |

## Error Handling

- **Validation Timeout** - Retry with backoff
- **Parser Error** - Log and skip syntax check
- **Database Error** - Queue for retry

## Related Skills

- Use `content-question-expert` for question validation rules
- Use `content-challenge-expert` for challenge validation rules
- Use `pipeline-generator` for content to verify
- Use `pipeline-processor` for validated content
