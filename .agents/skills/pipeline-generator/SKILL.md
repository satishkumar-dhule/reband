---
name: pipeline-generator
description: Orchestrate parallel content generation across all content types. Use when generating multiple content types (questions, challenges, coding-problems, mock-exams, certifications, flashcards, voice sessions, blogs) simultaneously. Manages worker allocation, rate limiting, and result aggregation.
---

# Pipeline Generator Coordinator

Orchestrates parallel content generation across all specialized content skills.

## Supported Content Types

| Type | Description | Generator |
|------|-------------|-----------|
| `question` | Interview Q&A questions | `creator-bot.js` |
| `challenge` | Coding challenges | `coding-challenge-graph.js` |
| `problem` | Enhanced coding problems | `coding-problem-graph.js` |
| `exam` | Mock exams | `mock-exam-graph.js` |
| `certification` | Certification MCQs | `certification-question-graph.js` |
| `flashcard` | SRS flashcards | `flashcard-bot.js` |
| `voice` | Voice sessions | `session-builder-bot.js` |
| `blog` | Blog posts | `blog-graph.js` |

## Responsibilities

1. **Parallel Execution** - Launch multiple content generators simultaneously
2. **Worker Management** - Allocate resources to each content type
3. **Rate Limiting** - Manage API quotas across parallel tasks
4. **Result Aggregation** - Combine results from all generators
5. **Error Handling** - Retry failed items, track failures

## Configuration

```typescript
interface GeneratorConfig {
  contentTypes: ContentType[];
  countPerType: number;
  parallel: boolean;
  rateLimit: {
    requestsPerMinute: number;
    burstSize: number;
  };
  retry: {
    maxAttempts: number;
    backoffMs: number;
  };
}

type ContentType = 'question' | 'challenge' | 'problem' | 'exam' | 'certification' | 'flashcard' | 'voice' | 'blog';
```

## Parallel Execution Strategy

```
                    ┌─────────────────┐
                    │ Generator       │
                    │ Coordinator     │
                    └────────┬────────┘
                             │
      ┌──────────┬───────────┼───────────┬──────────┐
      ▼          ▼           ▼           ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Question │ │Challenge│ │  Cert    │ │ Flashcard│ │  Voice   │
│ Worker   │ │ Worker   │ │  Worker  │ │  Worker  │ │  Worker  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
      │          │           │           │           │
      └──────────┴───────────┼───────────┴──────────┘
                             │
                    ┌────────▼────────┐
                    │ Result         │
                    │ Aggregator     │
                    └────────────────┘
```

## Message Types

### Incoming Messages
```typescript
// Start generation job
{
  type: 'GENERATE',
  payload: {
    contentTypes: ContentType[];
    count: number;
    options: Record<ContentType, GenerationOptions>;
  }
}

// Stop all generation
{
  type: 'STOP'
}
```

### Outgoing Messages
```typescript
// Progress update
{
  type: 'PROGRESS',
  payload: {
    contentType: ContentType;
    completed: number;
    total: number;
    status: 'running' | 'completed' | 'failed';
  }
}

// Generation complete
{
  type: 'COMPLETE',
  payload: {
    results: Record<ContentType, GenerationResult[]>;
    summary: {
      totalGenerated: number;
      totalFailed: number;
      duration: number;
    };
  }
}

// Generation failed
{
  type: 'ERROR',
  payload: {
    contentType: ContentType;
    error: string;
    itemId?: string;
  }
}
```

## Usage

> **Note:** Actual scripts are located in `script/bots/` directory. Use `node script/bots/creator-bot.js` instead of `script/pipeline/generator-coordinator.js`.

```bash
# Generate all content types
node script/bots/creator-bot.js --all --count=10

# Generate specific types in parallel
node script/bots/creator-bot.js --types=question,challenge --count=5

# Generate with custom options
node script/bots/creator-bot.js --types=question --channel=react --difficulty=advanced
```

## Integration with Skills

| Content Type | Skill |
|--------------|-------|
| question | content-question-expert |
| challenge | content-challenge-expert |
| problem | content-challenge-expert (enhanced) |
| exam | Mock exam generation |
| certification | content-certification-expert |
| flashcard | content-flashcard-expert |
| voice | content-voice-expert |
| blog | content-blog-expert |

## Error Handling

1. **Individual Failure** - Retry single item, continue others
2. **Worker Crash** - Restart worker, re-queue pending items
3. **Rate Limit Hit** - Backoff, then continue
4. **Complete Failure** - Log to DLQ, report in summary

## Related Skills

- Use individual content skills for generation
- Use `pipeline-verifier` for validation
- Use `pipeline-processor` for post-processing
