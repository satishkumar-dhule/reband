---
name: pipeline-processor
description: Process and save validated content to database. Use when finalizing content after generation and validation. Handles formatting, SM-2 initialization, vector indexing, and publishing.
---

# Pipeline Processor Coordinator

Processes and persists validated content with post-processing tasks.

## Responsibilities

1. **Database Persistence** - Save content to database
2. **Format Processing** - Apply final formatting
3. **Metadata Enrichment** - Add SM-2, timestamps, etc.
4. **Vector Indexing** - Add to search index
5. **Queue Management** - Handle post-processing queues

## Processing Steps

### 1. Pre-process (per content type)

```typescript
// Questions
- Generate unique ID
- Add timestamps
- Calculate word counts
- Extract keywords

// Challenges  
- Validate test cases
- Compute complexity metrics
- Generate unique slug

// Flashcards
- Initialize SM-2 fields
- Set next review date
- Calculate retrieval difficulty

// Voice Sessions
- Generate audio duration estimates
- Extract key points for search

// Blog Posts
- Generate reading time
- Extract excerpt
- Calculate SEO score
```

### 2. Database Save
```typescript
const result = await db.insert(contentType, {
  ...processedContent,
  status: 'published',
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### 3. Post-processing
- Vector DB indexing
- Cache invalidation
- Analytics event
- Notification (if needed)

## Message Types

### Incoming
```typescript
{
  type: 'PROCESS',
  payload: {
    contentType: ContentType;
    items: ValidatedItem[];
  }
}
```

### Outgoing
```typescript
{
  type: 'PROCESSED',
  payload: {
    itemId: string;
    savedId: string;
    vectorIndexId?: string;
  }
}

{
  type: 'PROCESS_COMPLETE',
  payload: {
    contentType: ContentType;
    processed: number;
    failed: number;
    duration: number;
  }
}
```

## Usage

> **Note:** Actual scripts are located in `script/bots/` directory. Use `node script/bots/processor-bot.js` instead of `script/pipeline/processor-coordinator.js`, and `node script/bots/unified-content-bot.js` for the full pipeline.

```bash
# Process validated content
node script/bots/processor-bot.js --status=validated

# Process specific type
node script/bots/processor-bot.js --type=flashcard --batch=50

# Full pipeline (generate -> verify -> process)
node script/bots/unified-content-bot.js --count=10
```

## SM-2 Initialization (Flashcards)

```typescript
const initializeSM2 = (card: Flashcard): Flashcard => ({
  ...card,
  sm2: {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: new Date()
  }
});
```

## Vector Indexing

```typescript
interface VectorDocument {
  id: string;
  contentType: string;
  title: string;
  body: string;
  tags: string[];
  metadata: Record<string, any>;
}

// Index to Qdrant/Pinecone
await vectorClient.upsert({
  collection: contentType,
  documents: [vectorDoc]
});
```

## Error Handling

- **DB Save Failure** - Retry with exponential backoff
- **Vector Index Failure** - Log, continue, manual retry later
- **Partial Batch Failure** - Process successful, queue failed for retry

## Monitoring

Track metrics:
- Items processed per minute
- Average processing time
- Failure rate
- Queue depth

## Related Skills

- Use `pipeline-generator` for content to process
- Use `pipeline-verifier` for validated content
- Uses vector DB for search indexing
