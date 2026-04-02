# Content Pipeline Parallelization Design

**Date:** 2026-03-27  
**Status:** Approved for Implementation  
**Author:** DevPrep AI

## Overview

Redesign the content generation pipeline to be more productive, parallel, and higher quality using specialized skills and agents. Replace the sequential unified-content-bot with a hybrid parallel architecture.

## Goals

1. **10x faster generation** through parallelization (content-type + stage parallel)
2. **Better quality** through specialized validators per content type
3. **Easier maintenance** with modular skills and clear boundaries

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MESSAGE BUS (AgentMessageBus)            │
│  - Async pub/sub for agent communication                    │
│  - Request/Response for queries                             │
│  - Broadcast for system-wide notifications                  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ GENERATOR     │    │   VERIFIER    │    │  PROCESSOR    │
│ COORDINATOR   │    │ COORDINATOR   │    │ COORDINATOR   │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
   ┌────┴────┐            ┌────┴────┐            ┌────┴────┐
   ▼         ▼            ▼         ▼            ▼         ▼
[question] [challenge]  [question] [challenge] [question] [challenge]
[cert]    [flashcard]   [cert]     [flashcard]  [cert]     [flashcard]
[voice]   [blog]        [voice]    [blog]       [voice]    [blog]
```

## Specialized Skills (6 Content Types)

| Skill | Content Type | Specialization |
|-------|--------------|----------------|
| `question-expert` | Interview Q&A | Difficulty calibration, follow-up potential, channel-specific validation |
| `challenge-expert` | Coding challenges | Test case execution, language parity (JS/TS/Python), complexity analysis |
| `certification-expert` | Exam MCQs | Domain alignment, explanation quality, distractor validity |
| `flashcard-expert` | Spaced repetition | SM-2 fields, word count limits, code syntax validation |
| `voice-expert` | Voice prompts | Audio clarity, timing, follow-up structure |
| `blog-expert` | Blog posts | SEO optimization, readability, internal linking |

## Pipeline Stages

### Stage 1: Generate (Parallel per Content Type)
- Each skill generates independently
- No sequential 2s delays
- Parallel execution across content types

### Stage 2: Validate Structure (Parallel)
- Schema validation per content type
- Required fields check
- Format enforcement

### Stage 3: Execute Tests (Code Challenges Only)
- Sandboxed code execution
- Test case validation
- Language equivalence verification

### Stage 4: Quality Gate (Cross-Content)
- Global uniqueness check
- Difficulty distribution balancing
- Cross-type consistency

### Stage 5: Output & Queue
- Save to database
- Queue for further processing
- Broadcast completion

## Quality Validation Rules

### Question Expert Validation
- Title: 6-20 words, ends with "?"
- Short answer: 80-250 words
- Code: 8-35 lines, syntactically valid
- Difficulty matches channel taxonomy

### Flashcard Expert Validation
- Front: ≤15 words, ends with "?"
- Back: 40-120 words
- Code syntax valid (via parser)
- SM-2 fields initialized

### Challenge Expert Validation
- 3 languages present (JS/TS/Python)
- Test cases pass (4+/6+/8+ for easy/medium/hard)
- Language equivalence verified

## Error Handling

- **Dead Letter Queue** — Failed items go to DLQ for retry
- **Retry Logic** — 3 attempts with exponential backoff
- **Failure Reporting** — Detailed logs per stage
- **Circuit Breaker** — Pause generation if error rate > 20%

## GitHub Actions Integration

Replace linear stages with parallel matrix:
```yaml
jobs:
  generate:
    strategy:
      matrix:
        content_type: [question, challenge, certification, flashcard, voice, blog]
    runs-on: ubuntu-latest
    steps:
      - run: node script/bots/generator-coordinator.js --type=${{ matrix.content_type }}
```

## Implementation Priority

1. Message bus foundation
2. Generator coordinator with parallel execution
3. Specialized skills (question, challenge, certification)
4. Verifier coordinator with quality rules
5. Flashcard, voice, blog skills
6. Quality gate layer
7. Test execution for code challenges
8. GitHub Actions parallelization

## Success Metrics

- Generation throughput: 10x improvement
- Quality score: >90% pass rate on first verification
- Latency: <30s for single item generation
- Parallel items: 6 content types × 3 stages = 18 concurrent
