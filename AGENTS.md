# DevPrep / Open-Interview — Agent System

## Supervisor System Prompt

This project uses a **supervisor-delegate pattern**. The main Replit agent acts as **supervisor** — it plans work, delegates to specialized opencode agents via `opencode run --agent <name> "<task>"`, monitors outputs, sends corrections if needed, and synthesizes results.

**The supervisor never writes code directly.** It only orchestrates, reviews, and corrects.

### Performance instrumentation
- Perf-measure tooling added to milestone 1: perf:measure script, scripts/measure-perf.js, and CI workflow perf-measure.yml for loading baselines on staging and PRs.
- Baseline pages: landing, channel-browser, algorithms channel, and interview start.
- Outputs: perf-results.json and perf/screenshots for loaded-state analysis.
- This section will be used to drive regression QA and performance improvements.
---

## Project Context (All Agents Must Follow)

**Name**: DevPrep / Open-Interview (Code-Reels v2.2)
**Mission**: Free, GitHub-native technical interview prep — swipe learning, voice practice, SRS, coding challenges
**Theme**: GitHub design system (Primer-inspired, GitHub color tokens, system font stack)
**Stack**: React 19 + Vite 7 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
**Database**: Local SQLite (`file:local.db`) — Turso sync for remote backup
**Deployment**: **GitHub Pages (static SPA, zero backend servers in production)**
- Staging: `https://stage-open-interview.github.io`
- Production: `https://open-interview.github.io`
**Data strategy**: DB is source of truth → build-time export to `public/data/*.json` → SPA fetches static JSON
**Package**: `code-reels`

---

## Architecture Principles (Iron Laws)

### 1. Static-First (GitHub Pages)
- Production runs with **NO backend server** — pure static files served by GitHub Pages
- All dynamic data (questions, channels, paths) is **exported from DB at build time** to `public/data/*.json`
- Frontend fetches static JSON in production (`/data/channels.json`, `/data/channel-<id>.json`, etc.)
- In development, frontend proxies `/api/*` to Express server (port 5173)
- Use `IS_STATIC` env flag (`VITE_STATIC_MODE=true`) to switch data fetching strategy

### 2. DB as Single Source of Truth
- All content lives in SQLite/Turso — **never hardcode question/answer data in React**
- Content changes: Update DB → re-run export → rebuild
- Schema defined in `shared/schema.ts` (Drizzle ORM)

### 3. GitHub-Themed UI
- Colors: CSS variables matching GitHub design tokens (`--color-canvas-default`, `--color-fg-default`, etc.)
- Font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial` (GitHub system stack)
- Components: shadcn/ui + Primer-inspired styles from `.agents/skills/github-theme-migration/`
- No random Tailwind colors that aren't mapped to GitHub tokens
- Dark/light mode follows GitHub's theme system

### 4. Vector Search (Qdrant)
- Qdrant for semantic similarity search
- Duplicate detection using vector embeddings
- RAG-powered interview intelligence

### 5. Local Browser Storage (No Auth)
- **No server-side user authentication or accounts**
- All user work, progress, and preferences stored in local browser storage (IndexedDB/localStorage)
- User session data, completed questions, flashcard progress, and learning path progress stored client-side
- Data persists across browser sessions but is not synced across devices
- Optional future enhancement: export/import user data as JSON files

---

## Supervisor Delegation Protocol

When the main agent receives a task:

```
1. ANALYZE   — Which agent(s) own this work?
2. PLAN      — Write a task breakdown with agent assignments
3. DELEGATE  — opencode run --agent <name> "<task>" (parallel where possible)
4. MONITOR   — Review outputs; if wrong, send a correction request
5. SYNTHESIZE — Combine results, write summary
6. UPDATE    — Update replit.md + AGENTS.md if architecture changed
```

### Correction Request Format (when an agent makes a mistake)
```
CORRECTION REQUEST → <agent-name>
Issue: <what is wrong>
Expected: <what should have been done>
Context: <relevant files or code snippets>
Action: <specific redo instruction>
```

---

## Build Pipeline (Static GitHub Pages)

```bash
# Full static build (run before deploying)
node script/fetch-questions-for-build.js    # DB → public/data/*.json
node script/generate-curated-paths.js       # learning paths JSON
node script/generate-rss.js                 # RSS feed
node script/generate-sitemap.js             # sitemap.xml
vite build                                  # SPA → dist/
node script/build-pagefind.js               # static search index
tsx script/deploy-pages.ts                  # push dist/ to gh-pages branch
```

npm script: `npm run build:static`

---

## Agent Team (`.opencode/agents/`)

### Orchestrators
| Agent | File | Description |
|-------|------|-------------|
| `devprep-supervisor` | `supervisor.agent.md` | **Main supervisor** — plans, delegates, reviews all work |
| `devprep-coordinator` | `coordinator.agent.md` | Content pipeline orchestration (questions, flashcards, etc.) |

### Deployment & Infrastructure
| Agent | File | Description |
|-------|------|-------------|
| `devprep-static-deployment` | `static-deployment.agent.md` | GitHub Pages static SPA deployment |
| `devprep-deployment-strategy-evaluator` | `deployment-strategy-evaluator.agent.md` | Deployment strategy analysis |
| `devprep-devops-engineer` | `devops-engineer.agent.md` | DevOps, CI/CD, GH Actions |
| `devprep-cicd-security-reviewer` | `cicd-security-reviewer.agent.md` | CI/CD security |
| `devprep-github-actions-workflow-auditor` | `github-actions-workflow-auditor.agent.md` | GH Actions review |

### Frontend & UI
| Agent | File | Description |
|-------|------|-------------|
| `devprep-frontend-designer` | `frontend-designer.agent.md` | React components, pages, layout |
| `devprep-ui-ux-expert` | `ui-ux-expert.agent.md` | UI/UX review and guidance |
| `devprep-react-optimizer` | `react-optimizer.agent.md` | React performance optimization |
| `devprep-web-reviewer` | `web-reviewer.agent.md` | Web interface guidelines |

### GitHub Theme Agents (15)
| Agent Group | Description |
|-------------|-------------|
| `devprep-github-colors-expert` | GitHub color palette migration |
| `devprep-github-typography-expert` | GitHub typography system |
| `devprep-github-layout-expert` | GitHub layout patterns |
| `devprep-github-nav-expert` | GitHub navigation components |
| `devprep-github-cards-expert` | GitHub card components |
| `devprep-github-darkmode-expert` | Dark mode implementation |
| `devprep-github-badges-expert` | GitHub labels/badges |
| `devprep-github-modals-expert` | GitHub dialogs/modals |
| `devprep-github-tables-expert` | GitHub table components |
| `devprep-github-forms-expert` | GitHub form components |
| `devprep-github-buttons-expert` | GitHub button styles |
| `devprep-github-inputs-expert` | GitHub input components |
| `devprep-github-icons-expert` | GitHub iconography |
| `devprep-github-alerts-expert` | GitHub alert notices |
| `devprep-theme-*` (15) | Full theme component agents |

### Bug Category Agents (15)
| Agent | Description |
|-------|-------------|
| `devprep-bug-a11y` | Accessibility issues |
| `devprep-bug-animations` | Animation/transition bugs |
| `devprep-bug-api` | API integration bugs |
| `devprep-bug-async` | Async/timing issues |
| `devprep-bug-build` | Build configuration bugs |
| `devprep-bug-css` | CSS/styling bugs |
| `devprep-bug-database` | Database/query bugs |
| `devprep-bug-events` | Event handling bugs |
| `devprep-bug-logic` | Business logic bugs |
| `devprep-bug-performance` | Performance issues |
| `devprep-bug-security` | Security vulnerabilities |
| `devprep-bug-seo` | SEO issues |
| `devprep-bug-sync` | Data synchronization bugs |
| `devprep-bug-state` | State management bugs |

### Content Generation
| Agent | Description |
|-------|-------------|
| `devprep-question-expert` | Technical interview Q&A questions |
| `devprep-flashcard-expert` | Spaced-repetition flashcards |
| `devprep-exam-expert` | Certification exam questions |
| `devprep-voice-expert` | Verbal practice prompts |
| `devprep-coding-expert` | Coding challenges with solutions |
| `devprep-blog-generator` | SEO-optimized blog posts |
| `devprep-study-guide-generator` | PDF study materials |
| `devprep-presentation-generator` | PowerPoint slides |

### Pipeline (via unified-content-bot)
| Script | Purpose |
|--------|---------|
| `unified-content-bot.js` | Unified pipeline orchestrator |
| `creator-bot.js` | Question/challenge creation |
| `verifier-bot.js` | Content validation |
| `processor-bot.js` | Content formatting & publishing |
| `session-builder-bot.js` | Voice session generation |
| `reconciliation-bot.js` | Data consistency checks |

### Data & Database
| Agent | Description |
|-------|-------------|
| `devprep-db-optimizer` | Database schema, queries, export |
| `devprep-caching-strategy-specialist` | Caching strategy |
| `devprep-error-handling-auditor` | Error handling patterns |

### Quality & Testing
| Agent | Description |
|-------|-------------|
| `devprep-e2e-tester` | Playwright tests, accessibility |
| `devprep-testing-agent` | Automated UI testing with browser-use |
| `devprep-seo-audit` | SEO and Lighthouse analysis |
| `devprep-site-auditor` | Comprehensive site auditing |
| `devprep-code-reviewer` | Code review |
| `devprep-action-composite-reviewer` | GH Action composite review |

### Performance Optimization Swarm (10 agents)
When optimizing page load performance, spawn these 10 agents in parallel:

| Agent | Role in Swarm | Key Deliverable |
|-------|---------------|-----------------|
| `devprep-coordinator` | Orchestration & planning | Performance optimization plan |
| `devprep-frontend-designer` | Critical CSS & lazy loading | Code-splitting implementation |
| `devprep-bug-performance` | Bottleneck analysis | Bundle optimization report |
| `devprep-bug-css` | CSS extraction | Critical CSS inlining |
| `devprep-static-deployment` | Build configuration | Asset hashing & caching |
| `devprep-db-optimizer` | Data optimization | Chunked JSON loading |
| `devprep-e2e-tester` | Instrumentation | Telemetry hooks |
| `devprep-web-reviewer` | UI/UX performance | Layout stability improvements |
| `devprep-seo-audit` | Lighthouse readiness | Performance score optimization |
| `devprep-coordinator` (2nd) | Content pipeline adaptation | Prerendered paths |

**Swarm Protocol:**
```bash
# Spawn all 10 agents in parallel for performance optimization
task("devprep-coordinator", "Create performance optimization plan...")
task("devprep-frontend-designer", "Implement critical CSS and lazy loading...")
task("devprep-bug-performance", "Analyze bundle sizes and render paths...")
# ... etc for all 10 agents
```

### Strategy & Documentation
| Agent | Description |
|-------|-------------|
| `devprep-tech-writer` | Documentation (README, AGENTS.md, replit.md) |
| `devprep-brainstormer` | Feature design and ideation |
| `devprep-copywriter` | Marketing copy |
| `devprep-ai-tools` | AI/ML tools integration |
| `devprep-workflow-architecture-advisor` | Workflow design |
| `devprep-workflow-performance-analyzer` | Workflow performance |

---

## Skills (`.agents/skills/`)

### Content Generation (6)
`content-question-expert`, `content-flashcard-expert`, `content-certification-expert`, `content-voice-expert`, `content-challenge-expert`, `content-blog-expert`

### Pipeline (3)
`pipeline-generator`, `pipeline-verifier`, `pipeline-processor`

### Frontend/React (5)
`frontend-design`, `ui-ux-pro-max`, `web-design-guidelines`, `vercel-react-best-practices`, `next-best-practices`

### GitHub Theme (2)
`github-theme-migration`, `github-theme-components`

### Database (1)
`supabase-postgres-best-practices`

### SEO & Auditing (2)
`seo-audit`, `audit-website`

### Media (3)
`pdf`, `pptx`, `remotion-best-practices`

### Automation & AI (3)
`browser-use`, `agent-tools`, `claw-multi-agent`

### Creative & Strategy (4)
`copywriting`, `brainstorming`, `find-skills`, `swarm-coordination`

---

## Unified Controls

See `UNIFIED_CONTROLS_SPEC.md` for the unified controls specification used across pages.

---

## Static Data Files (Generated at Build Time)

```
public/data/
├── channels.json            # [{id, label, questionCount, ...}]
├── questions-index.json     # lightweight index (id, channel, difficulty, question)
├── channel-algorithms.json  # full questions for algorithms channel
├── channel-frontend.json    # full questions for frontend channel
├── channel-*.json           # one file per channel
├── learning-paths.json      # curated learning path definitions
├── coding-challenges.json   # coding challenges with solutions
├── stats.json               # aggregate statistics
└── search-index/            # pagefind static search
    ├── pagefind.js
    └── *.idx
```

---

## Key Project Files

```
server/index.ts           Express entry (dev only — not used in prod static build)
server/routes.ts          API routes (dev only)
server/db.ts              Turso/libSQL client
shared/schema.ts          Drizzle ORM schema (source of truth for DB structure)
client/src/App.tsx        React app with routing (wouter)
client/src/lib/           Core business logic
client/src/pages/         All pages
client/src/components/    All UI components
script/                   Build & data scripts (100+ utility scripts)
.github/workflows/        GitHub Actions CI/CD
.opencode/agents/         All opencode agent definitions
.agents/skills/           All agent skills
CONTENT_STANDARDS.md      Content quality rules (all content agents must read this)
```

---

## What No Agent May Do

- Add Express/backend API calls in production code paths
- Hardcode question/answer data in React components (must come from DB export)
- Use `process.env` without `VITE_` prefix in frontend code
- Break GitHub theme colors (use CSS tokens, not raw hex)
- Modify `drizzle.config.ts` or `.replit`
- Change primary key ID column types in the DB schema
- Deploy without running `fetch-questions-for-build.js` first

---

## Static Data Files (Generated at Build Time)

```
public/data/
├── channels.json            # [{id, label, questionCount, ...}]
├── questions-index.json     # lightweight index (id, channel, difficulty, question)
├── channel-algorithms.json  # full questions for algorithms channel
├── channel-frontend.json    # full questions for frontend channel
├── channel-*.json           # one file per channel
├── learning-paths.json      # curated learning path definitions
├── coding-challenges.json   # coding challenges with solutions
├── stats.json               # aggregate statistics
└── search-index/            # pagefind static search
    ├── pagefind.js
    └── *.idx
```

---

## Key Project Files

```
server/index.ts           Express entry (dev only — not used in prod static build)
server/routes.ts          API routes (dev only)
server/db.ts              Turso/libSQL client
shared/schema.ts          Drizzle ORM schema (source of truth for DB structure)
client/src/App.tsx        React app with routing (wouter)
client/src/lib/           Core business logic
client/src/pages/          All pages
client/src/components/    All UI components
script/                   Build & data scripts (100+ utility scripts)
.github/workflows/        GitHub Actions CI/CD
.opencode/agents/         All opencode agent definitions
.agents/skills/           All agent skills
CONTENT_STANDARDS.md      Content quality rules (all content agents must read this)
UNIFIED_CONTROLS_SPEC.md  Unified controls specification
```

---

## GitHub Actions Workflows (`.github/workflows/`)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deploy-app.yml` | Push to main | Deploy static SPA to GitHub Pages (with staging) |
| `deploy-blog.yml` | Push to main | Deploy blog to GitHub Pages |
| `content-generation.yml` | Scheduled | Generate new content via coordinator |
| `daily-maintenance.yml` | Daily | DB cleanup, duplicate check |
| `duplicate-check.yml` | On push | Detect duplicate questions |
| `manual-intake.yml` | Manual | Add content manually |
| `generate-learning-paths.yml` | Scheduled | Generate learning paths |
| `social-media.yml` | Scheduled | Social media posting |
| `issue-processing.yml` | On issue | Auto-process GitHub issues |
| `scheduled-deploy.yml` | Scheduled | Automated deployment scheduling |

---

## Last Session Summary (April 1, 2026)

### Key Changes Applied
- **Architecture**: Migrated to local SQLite (`file:local.db`), implemented static-first GitHub Pages deployment
- **Features Added**: Flashcards system with SRS (spaced repetition), Coding challenges pipeline
- **GitHub Theme**: Full GitHub design system integration with CSS variables and dark/light mode
- **Documentation**: Added UNIFIED_CONTROLS_SPEC.md, TESTING_REPORT.md, multiple doc files
- **Testing**: E2E tests with Playwright (70+ tests), reviewed Vitest infrastructure

### Files Modified
- 11 GitHub workflow files
- 20+ page components
- 30+ UI components
- 15+ library files
- Database schema and configuration

### Known Issues
- Schema.ts has Drizzle ORM type warnings (pre-existing, non-blocking)
- Vitest needs setup.ts file for test utilities
- Missing unit tests for critical libraries

---

Last Updated: 2026-04-01
Maintained by: devprep-tech-writer agent + supervisor
