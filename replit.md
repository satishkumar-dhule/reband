# DevPrep / Open-Interview

Free, GitHub-native technical interview prep — swipe learning, voice practice, spaced repetition, coding challenges.

**URL**: https://open-interview.github.io/

---

## Project Type: Static Website (GitHub Pages)

**No backend API server.** This is a pure static SPA deployed to GitHub Pages.

- Content is stored in SQLite/Turso database.
- At build time, content is exported to static JSON files in `public/data/`.
- The frontend fetches these static JSON files in production.
- GitHub design system for look & feel, colors, typography

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite 7, TypeScript, Tailwind CSS 4, shadcn/ui |
| Database | SQLite in browser (sql.js WASM) + Turso sync |
| Vector Search | Qdrant (for semantic similarity/duplicates) |
| Sync | Background sync from Turso remote DB |
| ORM | Drizzle ORM |
| Deployment | GitHub Pages (static) |
| Search | Pagefind (static search index) |

---

## Agent Orchestration System

**Replit acts as Supervisor/Coordinator** — it plans work, delegates to opencode agents, monitors outputs, and synthesizes results.

### Supervisor Pattern
```
REPLIT (Supervisor)
├── ANALYZE     — Which agent(s) own this work?
├── PLAN        — Write task breakdown with agent assignments
├── DELEGATE    — opencode run --agent <name> "task"
├── MONITOR     — Review outputs; send corrections if needed
├── SYNTHESIZE  — Combine results, write summary
└── UPDATE      — Update docs if architecture changed
```

### Key Agents

| Agent | Purpose |
|-------|---------|
| `devprep-supervisor` | Master orchestrator — plans and delegates |
| `devprep-coordinator` | Content pipeline (questions, flashcards, challenges) |
| `devprep-static-deployment` | GitHub Pages static build |
| `devprep-frontend-designer` | React components and pages |
| `devprep-github-*-expert` | GitHub-themed UI (15 agents) |
| `devprep-bug-*` | Bug category agents (15 agents) |
| `devprep-db-optimizer` | Database schema and queries |
| `devprep-seo-audit` | SEO, search, performance |
| `devprep-e2e-tester` | Playwright tests |
| `devprep-tech-writer` | Documentation |

Full agent list in `AGENTS.md`.

### Delegation Commands
```bash
# Delegate to specific agent
opencode run --agent devprep-frontend-designer "Add dark mode toggle"

# Or via unified content bot
npm run bot:unified -- --type=question --count=10
```

### Content Pipeline (Unified Bot System)
```bash
# Unified content generation
npm run bot:unified -- --type=all

# Specific content types
npm run bot:question      # Interview questions
npm run bot:challenge     # Coding challenges
npm run bot:certification # Exam questions
npm run bot:sessions      # Voice interview sessions

# Pipeline stages
npm run bot:creator       # Create new content
npm run bot:verifier      # Validate content
npm run bot:processor     # Format and publish
```

---

## Data Architecture

1. **Browser SQLite**: sql.js runs SQLite in browser via WASM
2. **Initial sync**: Fetch DB from Turso CDN/storage
3. **Local storage**: SQLite in IndexedDB
4. **Background sync**: Periodic or on-demand sync
5. **Offline-first**: Works fully after sync

---

## Build Pipeline

```bash
# Full static build
npm run build:static

# Steps (parallel execution where possible):
# 1. fetch-questions-for-build.js   DB → public/data/*.json
# 2. fetch-question-history.js      Export question history
# 3. generate-curated-paths.js       Learning paths JSON
# 4. export-flashcards.mjs           Flashcard data
# 5. generate-rss.js                 RSS feed
# 6. generate-sitemap.js             sitemap.xml
# 7. fetch-bot-monitor-data.js      Bot activity data
# 8. vite build                      SPA → dist/
# 9. generate-pagefind-index.js     Search index
# 10. build-pagefind.js               Pagefind static search
```

### Deployment Environments
- **Staging**: `https://stage-open-interview.github.io`
- **Production**: `https://open-interview.github.io`

### CI/CD
- GitHub Actions `deploy-app.yml` builds and deploys to both environments
- Verification steps ensure content integrity and rollback capability

## Architecture Rules (Iron Laws)

1. **Static-first**: NO backend API. Pure static SPA on GitHub Pages
2. **Browser SQLite**: All data in sql.js running in browser
3. **Sync from Turso**: Remote DB synced to browser SQLite
4. **Vector Search**: Qdrant for semantic similarity and duplicate detection
5. **GitHub theme**: CSS tokens, system font stack, Primer-inspired components
6. **Offline support**: Full functionality after initial sync

---

## Key Files

```
shared/schema.ts             Drizzle ORM schema (DB source of truth)
client/src/App.tsx           React app with wouter routing
client/src/pages/            All page components
client/src/components/       UI components
client/src/lib/db/           Browser SQLite (sql.js, sync, queries)
script/                      Build scripts
.github/workflows/           GitHub Actions CI/CD
.opencode/agents/           All agent definitions
.agents/skills/             Agent skills
```

---

## Development

```bash
npm run dev          # Start Vite dev server
npm run sync-db     # Sync from remote Turso
```

---

## Features

- Swipe-based learning (TikTok-style)
- 30+ topic channels (System Design, Algorithms, Frontend, Backend, DevOps, K8s, AWS, ML...)
- Voice interview practice with session building
- Spaced repetition system (SRS) with flashcards
- Coding challenges (JS/Python) with Monaco editor
- Certification exam practice (AWS, GCP, Kubernetes, Terraform)
- Interview intelligence with AI-powered insights
- Vector search for semantic similarity (Qdrant)
- GitHub-themed UI (dark/light mode)
- Unified controls across all pages
- Full offline support
- Static search (Pagefind)
- SEO-optimized (sitemap, RSS, Open Graph)
- Badge & achievement system
- Progress tracking & analytics

---

## Performance Optimization Strategy

### Target Metrics
- **Hydration Time**: Sub-millisecond internal processing for critical paths
- **Time to Interactive (TTI)**: Sub-100ms for initial interactive readiness  
- **First Contentful Paint (FCP)**: < 1.0 second
- **Largest Contentful Paint (LCP)**: < 2.0 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Total Page Load**: < 2.0 seconds for initial view

### Quick Wins (Implement Immediately)
1. **Critical CSS Inlining**: Extract and inline CSS for above-the-fold content
2. **Resource Hints**: Preconnect to critical origins, prefetch essential JSON data
3. **Route Code-Splitting**: Use React.lazy() for heavy route components
4. **Skeleton Screens**: Immediate loading feedback for data fetches
5. **Image Optimization**: Add width/height, loading="lazy", modern formats
6. **Font Loading**: Use font-display: swap, preload critical fonts

### Medium-term Optimizations (2-4 weeks)
1. **Service Worker**: Cache-first strategy for static assets
2. **Data Chunking**: On-demand loading of large JSON files
3. **Telemetry Hooks**: Measure real-world performance metrics
4. **CSS Purging**: Verify Tailwind CSS content paths for minimal output
5. **Bundle Analysis**: Identify and remove unused dependencies

### Long-term Architecture (1-3 months)
1. **Data Chunking System**: Split large channel data into manageable chunks
2. **Prerendered Paths**: Static HTML for high-traffic routes
3. **Performance Budgets**: CI enforcement of size limits
4. **Lighthouse CI Integration**: Automated performance testing
5. **Advanced Caching**: CDN-level optimizations within GitHub Pages constraints

### Implementation Priority
```bash
# Phase 1: Immediate improvements
1. Inline critical CSS for landing page
2. Add preconnect/prefetch hints to index.html
3. Implement React.lazy() for route components
4. Add skeleton loading states

# Phase 2: Build optimizations
5. Configure Vite for content-hashed assets
6. Implement service worker for caching
7. Add performance telemetry hooks

# Phase 3: Data architecture
8. Implement chunked data loading
9. Add prerendered paths for top channels
10. Set up Lighthouse CI in GitHub Actions
```

---

Last Updated: 2026-04-01

### Performance instrumentation
- Perf-measure tooling added: scripts/measure-perf.js, perf:measure script, and perf-measure.yml CI workflow.
- Run locally via npm run perf:measure; CI runs on PRs/staging; artifacts include perf-results.json and perf/screenshots.
