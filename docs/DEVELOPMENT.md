# Development Guide

## Quick Start

```bash
pnpm install
pnpm dev          # http://localhost:5001
```

## Architecture

### Directory Structure

```
├── client/                    # React frontend (static site)
│   ├── src/
│   │   ├── pages/            # Route components
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom hooks
│   │   │   ├── use-adaptive-learning.ts  # Personalized learning
│   │   │   ├── use-questions.ts          # Question fetching
│   │   │   └── use-spaced-repetition.ts  # SRS system
│   │   └── lib/              # Utilities
│   └── public/data/          # Pre-generated JSON files
│
├── script/                    # Build-time automation
│   ├── ai/
│   │   ├── graphs/           # LangGraph pipelines
│   │   │   ├── quality-gate-graph.js     # Content validation
│   │   │   ├── adaptive-learning-graph.js # Learning paths
│   │   │   ├── blog-graph.js             # Blog generation
│   │   │   └── qdrant-duplicate-graph.js # Duplicate detection
│   │   ├── services/
│   │   │   ├── vector-db.js              # Qdrant operations
│   │   │   └── ml-decisions.js           # ML-based decisions
│   │   └── providers/
│   │       ├── qdrant.js                 # Qdrant client
│   │       └── embeddings.js             # TF-IDF/Ollama
│   ├── bots/                 # Automated content bots
│   └── *.js                  # CLI scripts
│
├── server/                    # Express (dev mode only)
└── e2e/                       # Playwright tests
```

## Vector Database

### Setup

```bash
# Initialize collection
pnpm vector:init

# Sync all questions
pnpm vector:sync

# Test integration
pnpm vector:test
```

### Environment Variables

```env
QDRANT_URL=https://xxx.qdrant.io:6333
QDRANT_API_KEY=your-api-key
EMBEDDING_MODEL=tfidf  # or ollama
```

### Usage in Code

```javascript
import vectorDB from './ai/services/vector-db.js';

// Initialize
await vectorDB.init();

// Index a question
await vectorDB.indexQuestion(question);

// Semantic search
const results = await vectorDB.semanticSearch('distributed systems', {
  limit: 10,
  threshold: 0.15,
  channel: 'system-design'
});

// Find similar questions
const similar = await vectorDB.findSimilar(questionText, {
  limit: 5,
  excludeIds: [currentId]
});
```

## AI Pipelines (LangGraph)

### Quality Gate

Validates new questions before adding to database:

```javascript
import { runQualityGate } from './ai/graphs/quality-gate-graph.js';

const result = await runQualityGate(question, existingQuestions);
// result.decision: 'approved' | 'rejected' | 'needs_review'
// result.score: 0-100
```

### Adaptive Learning

Generates personalized learning paths:

```javascript
import { generateLearningPath } from './ai/graphs/adaptive-learning-graph.js';

const path = await generateLearningPath({
  userId: 'user-123',
  answeredQuestions: [...],
  correctAnswers: [...],
  channelId: 'system-design'
});
```

## Static Site Generation

Since we deploy to GitHub Pages, all dynamic data is pre-computed:

```bash
# Generate all static data
pnpm build:static

# Individual generators
node script/fetch-questions-for-build.js  # Question JSONs
node script/generate-similar-questions.js  # Similar questions
node script/generate-voice-sessions.js     # Voice sessions
```

### Pre-computed Data Files

| File | Description |
|------|-------------|
| `data/{channel}.json` | Questions per channel |
| `data/similar-questions.json` | Pre-computed similarities |
| `data/voice-sessions.json` | Voice interview sessions |
| `data/blog-posts.json` | Generated blog content |

## Testing

### E2E Tests (Playwright)

```bash
pnpm test              # Run all
pnpm test:ui           # Interactive mode
pnpm test:headed       # See browser
```

### Vector DB Tests

```bash
pnpm vector:test       # Integration tests
```

### Test Structure

```
e2e/
├── core.spec.ts       # Navigation, responsiveness
├── home.spec.ts       # Home page features
├── channels.spec.ts   # Channel browsing
├── voice-interview.spec.ts
├── coding.spec.ts
└── fixtures.ts        # Test utilities
```

## 📋 Spec-Driven Development

All development must align with our formal specifications. Review these documents before making changes:

- **[Open-Interview Specification](../SPECIFICATIONS.md)** - Production-grade specifications for architecture, non-functional requirements, data model, and QA strategy.
- **[Unified Control Specification](../UNIFIED_CONTROLS_SPEC.md)** - Standard controls, accessibility rules, and UI component standards.
- **[Content Standards](../CONTENT_STANDARDS.md)** - Quality rules for all content types, difficulty taxonomies, and coverage targets.

### QA Checklist

Before submitting any change, ensure compliance with:

- [ ] **Static-first architecture**: No backend servers in production; all data exported to `public/data/*.json`.
- [ ] **GitHub theme compliance**: Use CSS variables (`--gh-*`), system font stack, and Primer-inspired components.
- [ ] **Accessibility**: WCAG 2.1 AA conformance; keyboard navigation; ARIA labeling; focus management.
- [ ] **Performance budgets**: TTFB < 2s; LCP < 2.5s; Lighthouse pass.
- [ ] **Data integrity**: No hardcoded content in React; all data from DB exports.
- [ ] **Content standards**: Follow CONTENT_STANDARDS.md for word counts, difficulty taxonomies, and coverage targets.
- [ ] **Control consistency**: Use unified components from `@/components/unified/` and shadcn/ui; avoid prohibited patterns.
- [ ] **Testing**: Run `pnpm test` for E2E tests; ensure no regressions.

Refer to the [SPECIFICATIONS.md QA & Testing Strategy](../SPECIFICATIONS.md#qa--testing-strategy) for full details.

## Code Patterns

### Adding a New Page

```typescript
// client/src/pages/NewPage.tsx
export default function NewPage() {
  return (
    <div className="min-h-screen p-4">
      {/* Content */}
    </div>
  );
}

// Add route in App.tsx
<Route path="/new-page" component={NewPage} />
```

### Adding a New Hook

```typescript
// client/src/hooks/use-feature.ts
export function useFeature() {
  const [state, setState] = useState(null);
  
  // Logic here
  
  return { state, actions };
}
```

### Adding a New AI Graph

```javascript
// script/ai/graphs/new-graph.js
import { StateGraph, END, START } from '@langchain/langgraph';

const State = Annotation.Root({
  input: Annotation({ reducer: (_, b) => b, default: () => '' }),
  output: Annotation({ reducer: (_, b) => b, default: () => null })
});

function processNode(state) {
  // Process logic
  return { output: result };
}

export function createGraph() {
  const graph = new StateGraph(State);
  graph.addNode('process', processNode);
  graph.addEdge(START, 'process');
  graph.addEdge('process', END);
  return graph.compile();
}
```

## Debugging

### Browser DevTools
- React DevTools for component inspection
- Network tab for API/data loading
- Application tab for localStorage

### Server Logs
```bash
DEBUG=* pnpm dev
```

### Vector DB Issues
```bash
# Check connection
pnpm vector:stats

# Re-sync if needed
pnpm vector:sync --force
```

## Performance Tips

1. **Lazy load pages** — Use dynamic imports
2. **Prefetch questions** — Adjacent questions load in background
3. **Cache embeddings** — TF-IDF vocabulary cached
4. **Batch operations** — Use `indexQuestions()` for bulk

## Common Issues

### Port in use
```bash
lsof -ti:5001 | xargs kill -9
```

### Vector DB connection failed
- Check `QDRANT_URL` and `QDRANT_API_KEY`
- Verify Qdrant Cloud cluster is running

### Build errors
```bash
rm -rf node_modules dist
pnpm install
pnpm build
```

## Resources

- [React 19 Docs](https://react.dev)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [Qdrant](https://qdrant.tech/documentation/)
- [Playwright](https://playwright.dev)
