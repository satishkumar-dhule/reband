# DevPrep / Open-Interview — Complete Workspace Reference

**Package name**: `code-reels` v2.2.0  
**Public name**: DevPrep / Open-Interview  
**Author**: Satishkumar Dhule <https://github.com/satishkumar-dhule>  
**License**: MIT  
**Repository**: <https://github.com/open-interview/open-interview>  
**Production URL**: <https://open-interview.github.io>  
**Staging URL**: <https://stage-open-interview.github.io>

Free technical interview prep app — swipe learning, voice practice, spaced repetition, coding challenges, certification practice, learning paths.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Database Schema](#4-database-schema)
5. [Server (Express — Dev Only)](#5-server-express--dev-only)
6. [Go API Service](#6-go-api-service)
7. [Frontend (React SPA)](#7-frontend-react-spa)
8. [Build Pipeline](#8-build-pipeline)
9. [Environment Variables](#9-environment-variables)
10. [Replit Configuration](#10-replit-configuration)
11. [Claude CLI + Anthropic Proxy](#11-claude-cli--anthropic-proxy)
12. [AI Agent System (opencode)](#12-ai-agent-system-opencode)
13. [Content Pipeline (Bots)](#13-content-pipeline-bots)
14. [Testing](#14-testing)
15. [GitHub Actions CI/CD](#15-github-actions-cicd)
16. [npm Scripts Reference](#16-npm-scripts-reference)
17. [Iron Laws — What No Agent May Do](#17-iron-laws--what-no-agent-may-do)
18. [Known Issues](#18-known-issues)

---

## 1. Architecture Overview

This project operates in **two completely different modes**:

### Development Mode (Replit)
```
Browser
  └─► Vite dev server (port 5000, served by Express)
        ├─► Express API  /api/*  →  LibSQL (local.db)
        └─► Go API       /api/v1/*  →  local.db (port 3001)
        └─► Anthropic Strip Proxy (port 4000) ← Claude CLI only
```

- Express at port 5000 handles both the REST API and serves the Vite-compiled React SPA.
- Go API auto-starts on port 3001, serving high-performance read endpoints.
- Anthropic Strip Proxy auto-starts on port 4000, fixing Claude CLI ↔ Replit proxy compatibility.

### Production Mode (GitHub Pages)
```
Browser
  └─► GitHub Pages CDN (static files only)
        ├─► dist/public/  (Vite-built SPA)
        ├─► public/data/*.json  (pre-exported from SQLite at build time)
        └─► public/search-index/ (Pagefind static search)
```

- **Zero backend servers** in production. 100% static files.
- All data (questions, channels, flashcards, etc.) is exported to `public/data/*.json` at build time.
- The SPA detects `VITE_STATIC_MODE=true` and fetches static JSON instead of calling `/api`.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | 19.2.0 |
| Build tool | Vite | 7.1.9 |
| Language | TypeScript | 5.6.3 |
| CSS framework | Tailwind CSS | 4.1.14 |
| Component library | shadcn/ui (Radix primitives) | latest |
| Routing | wouter | 3.3.5 |
| Data fetching | TanStack Query | 5.60.5 |
| Animation | Framer Motion | 12.23.24 |
| Forms | react-hook-form + zod | 7.66 / 3.25 |
| Icons | lucide-react | 0.545.0 |
| Backend | Express | 4.21.2 |
| Runtime | Node.js 20 + tsx | >=18.0.0 |
| DB (server) | LibSQL / Turso (local.db) | 0.17.2 |
| ORM | Drizzle ORM | 0.45.2 |
| Auth | better-auth | 1.5.6 |
| Go API | Go 1.23 + chi router | — |
| Search (static) | Pagefind | 1.4.0 |
| Code editor | Monaco Editor | 4.7.0 |
| Diagrams | Mermaid | 11.12.2 |
| Markdown | react-markdown + remark-gfm | 10.1.0 |
| Code highlighting | react-syntax-highlighter | 16.1.0 |
| Package manager | pnpm (monorepo) | >=8.0.0 |
| Testing (E2E) | Playwright | 1.57.0 |
| Testing (unit) | Vitest | 4.0.16 |
| Compression | gzip via `compression` middleware | level 6, threshold 1KB |
| Vector search | Qdrant (optional) | 1.16.2 |

### Dependency notes
- `@mui/*`, `@emotion/*`, `react-router-dom`, `@langchain/*`, `@qdrant/*`, `pg`, `passport*` are in `package.json` but **not imported** in the frontend bundle (dead code, kept for future).
- `pnpm.overrides` pins: `minimatch@10.2.3`, `dompurify@3.3.2`, `yaml@2.8.3`, `esbuild@0.27.4`.
- `bufferutil` is an optional dependency (ws performance).

---

## 3. Directory Structure

```
.
├── anthropic-proxy.py        ← ACTIVE: Vertex AI strip proxy (port 4000), stdlib only
├── anthropic_proxy.py        ← OLD: Flask-based Ollama/OpenAI bridge (port 8081), not used
├── cl.sh                     ← Claude CLI multi-LLM launcher (via LiteLLM, optional)
├── config.yaml               ← LiteLLM config for Ollama qwen2.5-3b (localhost:8080)
├── components.json           ← shadcn/ui component config
├── drizzle.config.ts         ← Drizzle Kit config (dialect: sqlite, schema: shared/schema.ts)
├── vite.config.ts            ← Vite build + dev server config (do NOT modify)
├── package.json              ← npm package with 60+ scripts
├── local.db                  ← SQLite database (LibSQL format, WAL mode)
├── local.db-shm / -wal       ← SQLite WAL journal files
├── AGENTS.md                 ← Agent system docs + delegation protocol
├── CHANGELOG.md              ← Semantic versioning changelog
├── CONTENT_STANDARDS.md      ← Content quality rules for all agents
├── replit.md                 ← THIS FILE — loaded into agent memory
│
├── client/                   ← React frontend (Vite root)
│   ├── index.html            ← Entry HTML (critical CSS inlined, JSON-LD, prefetch hints)
│   └── src/
│       ├── App.tsx           ← Router + providers (QueryClient, ThemeProvider, etc.)
│       ├── main.tsx          ← React DOM entry
│       ├── pages/            ← 28 page components (all lazy-loaded)
│       ├── components/       ← UI components (layout, skeletons, coding, etc.)
│       ├── lib/              ← Core logic (db, queryClient, prefetch, utils)
│       ├── hooks/            ← Custom React hooks
│       ├── services/         ← API service layer (api.service.ts)
│       └── styles/           ← Global CSS, Tailwind base
│
├── server/                   ← Express backend (dev only)
│   ├── index.ts              ← Entry: starts Express + Go API + Anthropic proxy
│   ├── routes.ts             ← All REST API route handlers
│   ├── db.ts                 ← LibSQL client (url: "file:local.db")
│   ├── db-init.ts            ← CREATE TABLE IF NOT EXISTS for all tables
│   ├── storage.ts            ← IStorage interface + TursoStorage implementation
│   ├── static.ts             ← Static file / Vite dev server middleware
│   ├── vite.ts               ← Vite dev server integration (do NOT modify)
│   ├── migrations/           ← SQL migration scripts
│   └── src/
│       ├── auth.ts           ← better-auth server instance
│       └── auth-routes.ts    ← /api/auth/* route registration
│
├── shared/
│   └── schema.ts             ← Drizzle ORM schema (source of truth for all DB types)
│
├── go-api/                   ← High-performance Go API service
│   ├── main.go               ← Routes + server entry (chi router)
│   ├── start.sh              ← Auto-build + launch script (spawned by server/index.ts)
│   ├── go.mod / go.sum       ← Go module dependencies
│   ├── bin/devprep-api       ← Compiled binary (auto-rebuilt if main.go is newer)
│   ├── db/db.go              ← SQLite connection pool (read-only WAL mode)
│   ├── models/models.go      ← Response structs + JSONRaw type
│   ├── middleware/           ← CORS, logger, in-memory LRU cache
│   └── handlers/             ← Route handlers by resource
│       ├── questions.go
│       ├── challenges.go
│       ├── flashcards.go
│       ├── certifications.go
│       ├── learning_paths.go
│       ├── voice_sessions.go
│       └── util.go
│
├── script/                   ← Build-time Node.js scripts (100+)
│   ├── fetch-questions-for-build.js   ← DB → public/data/*.json
│   ├── fetch-question-history.js
│   ├── generate-curated-paths.js
│   ├── export-flashcards.mjs
│   ├── generate-rss.js
│   ├── generate-sitemap.js
│   ├── generate-pagefind-index.js
│   ├── build-pagefind.js
│   ├── build-optimize.js
│   └── bots/                 ← Content generation bots
│       ├── unified-content-bot.js
│       ├── creator-bot.js
│       ├── verifier-bot.js
│       ├── processor-bot.js
│       ├── session-builder-bot.js
│       └── reconciliation-bot.js
│
├── scripts/                  ← Developer/CI scripts (distinct from script/)
│   ├── measure-perf.js       ← Lighthouse perf measurement
│   ├── parallel-content-swarm.ts
│   ├── swarm-qa-orchestrator.ts
│   ├── generate-*-pipeline.ts
│   └── post-merge.sh         ← Runs after task agent merges
│
├── e2e/                      ← Playwright end-to-end tests
│   ├── smoke/
│   ├── unified/
│   ├── comprehensive/
│   └── visual/
│
├── docs/                     ← Developer documentation
│   └── claude-cli-setup.md   ← Claude CLI + Anthropic proxy replication guide
│
├── .opencode/
│   ├── config.json           ← opencode CLI configuration
│   └── agents/               ← 70+ opencode agent definition files (.agent.md)
│
├── .agents/
│   └── skills/               ← 35+ reusable agent skills (SKILL.md + assets)
│
├── .claude/
│   └── litellm-config.yaml   ← LiteLLM proxy config (all 4 Replit AI providers)
│
├── .github/
│   └── workflows/            ← 14 GitHub Actions workflow files
│
├── public/                   ← Static assets served at root
│   └── data/                 ← Generated at build time (gitignored)
│
└── dist/                     ← Production build output (gitignored)
    └── public/               ← Vite-compiled SPA assets
```

---

## 4. Database Schema

**Database file**: `local.db` (SQLite, LibSQL format, WAL mode)  
**Client**: `@libsql/client` via `server/db.ts` — `createClient({ url: "file:local.db" })`  
**ORM**: Drizzle ORM — schema in `shared/schema.ts`  
**Drizzle Kit config**: `drizzle.config.ts` — dialect: sqlite, output: ./migrations

All tables created idempotently at startup by `server/db-init.ts` using `CREATE TABLE IF NOT EXISTS`.

### Tables

#### `questions`
Core content table. All text fields; array fields stored as JSON strings.
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | nanoid |
| `question` | TEXT NOT NULL | |
| `answer` | TEXT NOT NULL | |
| `explanation` | TEXT NOT NULL | |
| `diagram` | TEXT | Mermaid syntax or null |
| `difficulty` | TEXT NOT NULL | easy / medium / hard |
| `tags` | TEXT | JSON array |
| `channel` | TEXT NOT NULL | e.g. "algorithms" |
| `sub_channel` | TEXT NOT NULL | |
| `source_url` | TEXT | |
| `videos` | TEXT | JSON array |
| `companies` | TEXT | JSON array |
| `eli5` | TEXT | ELI5 explanation |
| `tldr` | TEXT | TL;DR summary |
| `relevance_score` | INTEGER | |
| `relevance_details` | TEXT | JSON |
| `job_title_relevance` | TEXT | JSON |
| `experience_level_tags` | TEXT | JSON |
| `voice_keywords` | TEXT | JSON array |
| `voice_suitable` | INTEGER | 0 or 1 |
| `status` | TEXT | DEFAULT 'active' |
| `is_new` | INTEGER | DEFAULT 1 |
| `last_updated` | TEXT | ISO date |
| `created_at` | TEXT | ISO date |

**Indexes**: channel, difficulty, status, (channel+status)

#### `users`
| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `username` | TEXT NOT NULL UNIQUE |
| `password` | TEXT NOT NULL |

#### `flashcards`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | |
| `channel` | TEXT NOT NULL | |
| `front` | TEXT NOT NULL | Question/prompt side |
| `back` | TEXT NOT NULL | Answer side |
| `hint` | TEXT | |
| `code_example` | TEXT | |
| `mnemonic` | TEXT | |
| `difficulty` | TEXT NOT NULL | |
| `tags` | TEXT | JSON array |
| `category` | TEXT | |
| `status` | TEXT | DEFAULT 'active' |
| `created_at` | TEXT | |

#### `voice_sessions`
| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `topic` | TEXT NOT NULL |
| `description` | TEXT |
| `channel` | TEXT NOT NULL |
| `difficulty` | TEXT NOT NULL |
| `question_ids` | TEXT NOT NULL (JSON array) |
| `total_questions` | INTEGER NOT NULL |
| `estimated_minutes` | INTEGER DEFAULT 5 |
| `created_at` / `last_updated` | TEXT |

#### `certifications`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | |
| `name` | TEXT NOT NULL | e.g. "AWS Solutions Architect" |
| `provider` | TEXT NOT NULL | AWS, GCP, Kubernetes, etc. |
| `description` | TEXT NOT NULL | |
| `icon` | TEXT DEFAULT 'award' | |
| `color` | TEXT DEFAULT 'text-primary' | |
| `difficulty` | TEXT NOT NULL | |
| `category` | TEXT NOT NULL | |
| `estimated_hours` | INTEGER DEFAULT 40 | |
| `exam_code` | TEXT | |
| `official_url` | TEXT | |
| `domains` | TEXT | JSON array |
| `channel_mappings` | TEXT | JSON |
| `tags` | TEXT | JSON array |
| `prerequisites` | TEXT | JSON array |
| `question_count` | INTEGER DEFAULT 0 | |
| `passing_score` | INTEGER DEFAULT 70 | % |
| `exam_duration` | INTEGER DEFAULT 90 | minutes |
| `status` | TEXT DEFAULT 'active' | |
| `created_at` / `last_updated` | TEXT | |

**Indexes**: status, category

#### `learning_paths`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | |
| `title` | TEXT NOT NULL | |
| `description` | TEXT NOT NULL | |
| `path_type` | TEXT NOT NULL | company / job-title / skill / certification |
| `target_company` | TEXT | e.g. "Google" |
| `target_job_title` | TEXT | e.g. "Senior SRE" |
| `difficulty` | TEXT NOT NULL | |
| `estimated_hours` | INTEGER DEFAULT 40 | |
| `question_ids` | TEXT NOT NULL | JSON array |
| `channels` | TEXT NOT NULL | JSON array |
| `tags` / `prerequisites` | TEXT | JSON arrays |
| `learning_objectives` / `milestones` | TEXT | JSON |
| `popularity` / `completion_rate` / `average_rating` | INTEGER | |
| `metadata` | TEXT | JSON |
| `status` | TEXT DEFAULT 'active' | |
| `created_at` / `last_updated` / `last_generated` | TEXT | |

**Indexes**: status, path_type

#### `coding_challenges`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | |
| `title` | TEXT NOT NULL | |
| `description` | TEXT NOT NULL | Markdown |
| `difficulty` | TEXT NOT NULL | |
| `category` | TEXT NOT NULL | |
| `tags` / `companies` | TEXT | JSON arrays |
| `starter_code_js` / `starter_code_py` | TEXT | |
| `test_cases` | TEXT | JSON array |
| `hints` | TEXT | JSON array |
| `solution_js` / `solution_py` | TEXT | |
| `complexity_time` / `complexity_space` | TEXT | Big-O strings |
| `complexity_explanation` | TEXT | |
| `time_limit` | INTEGER DEFAULT 15 | minutes |
| `created_at` | TEXT | |

**Indexes**: difficulty, category

#### `user_sessions`
Tracks in-progress quiz/study sessions (anonymous, linked by session_key in browser).
| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `user_id` | TEXT (nullable) |
| `session_type` | TEXT NOT NULL |
| `session_key` | TEXT NOT NULL |
| `title` / `subtitle` | TEXT |
| `channel_id` / `certification_id` | TEXT |
| `progress` / `total_items` / `completed_items` | INTEGER |
| `session_data` | TEXT (JSON) |
| `started_at` / `last_accessed_at` / `completed_at` | TEXT |
| `status` | TEXT DEFAULT 'active' |

**Indexes**: status, session_key

#### `question_history`
Audit log of all question changes.
| Column | Type |
|--------|------|
| `id` | INTEGER PK AUTOINCREMENT |
| `question_id` | TEXT NOT NULL |
| `question_type` | TEXT DEFAULT 'question' |
| `event_type` | TEXT NOT NULL |
| `event_source` | TEXT NOT NULL |
| `source_name` | TEXT |
| `changes_summary` | TEXT |
| `changed_fields` | TEXT (JSON) |
| `before_snapshot` / `after_snapshot` | TEXT (JSON) |
| `reason` / `metadata` | TEXT |
| `created_at` | TEXT |

**Index**: question_id

#### `question_relationships`
Semantic relationships between questions (for RAG / knowledge graph).
| Column | Type |
|--------|------|
| `id` | INTEGER PK AUTOINCREMENT |
| `source_question_id` | TEXT NOT NULL |
| `target_question_id` | TEXT NOT NULL |
| `relationship_type` | TEXT NOT NULL |
| `strength` | INTEGER DEFAULT 50 |
| `created_at` | TEXT |

#### `channel_mappings`
| Column | Type |
|--------|------|
| `id` | INTEGER PK AUTOINCREMENT |
| `channel_id` | TEXT NOT NULL |
| `sub_channel` | TEXT NOT NULL |
| `question_id` | TEXT NOT NULL |

#### `work_queue`
Agent/bot task queue.
| Column | Type |
|--------|------|
| `id` | INTEGER PK AUTOINCREMENT |
| `item_type` / `item_id` | TEXT NOT NULL |
| `action` | TEXT NOT NULL |
| `priority` | INTEGER DEFAULT 5 |
| `status` | TEXT DEFAULT 'pending' |
| `reason` / `created_by` / `assigned_to` | TEXT |
| `created_at` / `processed_at` | TEXT |
| `result` | TEXT (JSON) |

#### `bot_ledger`
Detailed audit log of all bot write operations.
| Column | Type |
|--------|------|
| `id` | INTEGER PK AUTOINCREMENT |
| `bot_name` / `action` / `item_type` / `item_id` | TEXT NOT NULL |
| `before_state` / `after_state` | TEXT (JSON) |
| `reason` | TEXT |
| `created_at` | TEXT |

#### `bot_runs`
One row per bot execution for monitoring.
| Column | Type |
|--------|------|
| `id` | INTEGER PK AUTOINCREMENT |
| `bot_name` | TEXT NOT NULL |
| `started_at` | TEXT NOT NULL |
| `completed_at` | TEXT |
| `status` | TEXT DEFAULT 'running' |
| `items_processed` / `items_created` / `items_updated` / `items_deleted` | INTEGER |
| `summary` | TEXT |

---

## 5. Server (Express — Dev Only)

**Entry**: `server/index.ts` — started by `npm run dev` (`PORT=5000 NODE_ENV=development tsx server/index.ts`)

### Startup sequence
1. Call `ensureTablesExist()` — idempotent CREATE TABLE IF NOT EXISTS for all tables.
2. Register compression middleware (gzip, level 6, threshold 1KB).
3. Register security headers (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy).
4. Register auth routes at `/api/auth/*` via `registerAuthRoutes()`.
5. Register all REST routes via `registerRoutes()`.
6. Serve Vite dev server via `serveStatic()`.
7. Listen on port from `PORT` env (default 5000).
8. On listen: start keep-alive pings, start Go API subprocess, start Anthropic strip proxy (dev only).

### Keep-alive
Pings `/api/keep-alive` every 4 minutes to prevent Replit sleep. Uses `0.0.0.0:PORT`.

### stderr filter
`process.stderr.write` is monkey-patched in dev to suppress Vite's non-fatal "Failed to parse JSON file" noise from JSON-LD inline scripts.

### Authentication
`better-auth` with Drizzle ORM adapter. Server instance in `server/src/auth.ts`.  
Routes registered under `/api/auth/*` by `server/src/auth-routes.ts`.

### Storage layer
`server/storage.ts` — `IStorage` interface with `TursoStorage` implementation.
Methods: `getUser(id)`, `getUserByUsername(username)`, `createUser(user)`.
Uses raw SQL (not Drizzle ORM) to avoid type conflicts.

### Subprocess management
Both `startGoAPI()` and `startAnthropicProxy()` follow the same pattern:
- `spawn()` the child process with `stdio: ['ignore','pipe','pipe']`
- Prefix all child stdout/stderr with `[go-api]` / `[anthropic-proxy]`
- Auto-restart with 3-second delay on non-zero exit codes
- Anthropic proxy only started when `NODE_ENV !== 'production'`

---

## 6. Go API Service

**Location**: `go-api/`  
**Port**: 3001 (external: 6000 via Replit port mapping)  
**Runtime**: Go 1.23 at `/home/runner/go/bin/go`  
**DB driver**: `modernc.org/sqlite` (pure Go, no CGO required)  
**Router**: `github.com/go-chi/chi/v5`

### Auto-build logic (`go-api/start.sh`)
1. Check if `go` binary exists in PATH — skip silently if not.
2. If `bin/devprep-api` is missing or `main.go` is newer than the binary → rebuild.
3. Build with `go build -o bin/devprep-api .`
4. `exec` the binary (replaces shell process).
5. `DATABASE_PATH` defaults to `../local.db` relative to `go-api/`.

### All endpoints (`GET /api/v1/*`)

| Endpoint | Query params |
|----------|-------------|
| `GET /health` | — |
| `GET /api/v1/channels` | — |
| `GET /api/v1/stats` | — |
| `GET /api/v1/questions` | `channel`, `sub_channel`, `difficulty`, `search`, `page`, `page_size` |
| `GET /api/v1/questions/random` | `channel`, `difficulty` |
| `GET /api/v1/questions/{id}` | — |
| `GET /api/v1/channels/{id}/subchannels` | — |
| `GET /api/v1/channels/{id}/companies` | — |
| `GET /api/v1/coding/challenges` | `difficulty`, `category`, `page`, `page_size` |
| `GET /api/v1/coding/challenges/{id}` | — |
| `GET /api/v1/coding/random` | `difficulty` |
| `GET /api/v1/coding/stats` | — |
| `GET /api/v1/flashcards` | `channel`, `difficulty`, `page`, `page_size` |
| `GET /api/v1/flashcards/{channelId}` | — |
| `GET /api/v1/voice-sessions` | `channel`, `difficulty`, `page`, `page_size` |
| `GET /api/v1/certifications` | `category`, `difficulty`, `page`, `page_size` |
| `GET /api/v1/certifications/{id}` | — |
| `GET /api/v1/learning-paths` | `path_type`, `difficulty`, `company`, `job_title`, `page`, `page_size` |
| `GET /api/v1/learning-paths/{id}` | — |

### Paginated response format
```json
{
  "data": [...],
  "total": 322,
  "page": 1,
  "pageSize": 50,
  "totalPages": 7,
  "hasNext": true,
  "hasPrev": false
}
```

---

## 7. Frontend (React SPA)

**Vite root**: `client/`  
**Entry**: `client/src/main.tsx` → `client/index.html`  
**Build output**: `dist/public/`

### Routing (wouter v3)
Requires explicit `<Router>` wrapper in `App.tsx`. All routes use `lazy()` for code splitting.

### Pages (`client/src/pages/`)
28 pages, all lazy-loaded:

| Page | Route | Description |
|------|-------|-------------|
| `Home.tsx` | `/` | Landing / swipe feed |
| `AllChannels.tsx` | `/channels` | Channel browser |
| `QuestionViewer.tsx` | `/channel/:id` | Question swipe view |
| `CodingChallenge.tsx` | `/coding` | Coding IDE + test runner |
| `Certifications.tsx` | `/certifications` | Cert catalog |
| `CertificationPractice.tsx` | `/certifications/:id` | Cert practice |
| `CertificationExam.tsx` | `/certifications/:id/exam` | Timed exam |
| `LearningPaths.tsx` | `/paths` | Path catalog |
| `PathDetail.tsx` | `/paths/:id` | Path detail |
| `MyPath.tsx` | `/my-path` | User's current path |
| `VoicePractice.tsx` | `/voice` | Voice session list |
| `VoiceSession.tsx` | `/voice/:id` | Voice interview session |
| `TrainingMode.tsx` | `/training` | SRS training |
| `ReviewSession.tsx` | `/review` | Flashcard review |
| `TestSession.tsx` | `/test` | Certification test |
| `Tests.tsx` | `/tests` | Test list |
| `Profile.tsx` | `/profile` | User profile + stats |
| `Stats.tsx` | `/stats` | Redirects to `/profile` |
| `Badges.tsx` | `/badges` | Badge/achievement system |
| `Bookmarks.tsx` | `/bookmarks` | Saved questions |
| `BotActivity.tsx` | `/bot-activity` | Content bot monitor |
| `ContributionGrid.tsx` | `/contributions` | GitHub-style activity grid |
| `GoExplorer.tsx` | `/go-explorer` | Go API explorer |
| `WhatsNew.tsx` | `/whats-new` | Changelog page |
| `Onboarding.tsx` | `/onboarding` | First-run setup |
| `About.tsx` | `/about` | About page |
| `not-found.tsx` | `*` | 404 |

### Component library rule
**All components must be imported from `@/lib/ui`** — a single barrel export file. Never import directly from shadcn paths or component files.

```ts
import { Button, Card, AppLayout, SEOHead, ... } from '@/lib/ui';
```

### Data fetching strategy
- **Development**: TanStack Query fetches from `/api/*` → Express → LibSQL
- **Static production**: fetches from `/data/*.json` pre-exported at build time
- `VITE_STATIC_MODE=true` switches strategy
- `staleTime: Infinity` for all static data (never refetches)

### Performance techniques
| Technique | Implementation |
|-----------|---------------|
| Route code splitting | All pages use `React.lazy()` |
| Skeleton screens | Per-route skeletons in `client/src/components/skeletons/PageSkeletons.tsx` |
| Route prefetching | Hover-based prefetch in `client/src/lib/prefetch.ts` |
| Idle preloading | Mermaid, Monaco, react-markdown loaded via `requestIdleCallback` |
| `content-visibility: auto` | `cv-auto` / `cv-auto-sm` CSS utilities for off-screen sections |
| Critical CSS inlined | First-paint styles in `<head>` of `index.html` |
| Lazy font loading | Google Fonts via `media="print"` trick |
| Static JSON prefetch | `<link rel="prefetch">` in `index.html` for `channels.json`, `stats.json` |

### Vite build chunks (manualChunks)
| Chunk | Contents |
|-------|---------|
| `vendor-core` | react, react-dom, scheduler |
| `vendor-ui` | @radix-ui/*, @floating-ui/*, CVA, clsx, tailwind-merge |
| `vendor-icons` | lucide-react |
| `vendor-data` | wouter, @tanstack/react-query |
| `vendor-motion` | framer-motion, motion-dom, motion-utils |
| `vendor-forms` | react-hook-form, @hookform/resolvers, zod |
| `vendor-mermaid` | mermaid (lazy) |
| `vendor-editor` | @monaco-editor/react, monaco-editor (lazy) |
| `vendor-markdown` | react-markdown, remark-*, unified (lazy) |
| `vendor-syntax` | react-syntax-highlighter, highlight.js (lazy) |
| `vendor-ui-extras` | cmdk, vaul, sonner, embla-carousel, recharts, etc. |
| `vendor-auth` | better-auth, oslo, jose |
| `vendor-charts` | recharts, d3-* |
| `vendor-dead` | @mui/*, @emotion/*, react-router-dom (tree-shaken) |

### Vite aliases
| Alias | Resolves to |
|-------|------------|
| `@` | `client/src/` |
| `@shared` | `shared/` |
| `@assets` | `attached_assets/` |
| `react` | Pinned to root `node_modules/react` (deduplication) |
| `react-dom` | Pinned to root `node_modules/react-dom` |

### Key rules
- **Never** `import React from 'react'` — Vite JSX transform injects it automatically. Use named imports only.
- `VITE_` prefix required for any env var exposed to the frontend.
- wouter v3 requires explicit `<Router>` wrapper (not just `<Switch>`).

### Design system
- GitHub Primer-inspired — CSS variables matching GitHub design tokens.
- Font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial` (GitHub system stack).
- Dark/light mode follows GitHub's theme system.
- CSS custom properties: `--color-canvas-default`, `--color-fg-default`, etc.

---

## 8. Build Pipeline

### Development
```bash
npm run dev
# PORT=5000 NODE_ENV=development tsx server/index.ts
# Starts Express + Vite dev server on port 5000
# Auto-starts Go API on port 3001
# Auto-starts Anthropic strip proxy on port 4000
```

### Full static build (for GitHub Pages deployment)
```bash
npm run build:static
```
Steps (sequential):
1. `script/fetch-questions-for-build.js` — DB → `public/data/*.json` (channels, questions, stats)
2. `script/fetch-question-history.js` — export question history
3. `script/generate-curated-paths.js` — learning paths JSON
4. `script/export-flashcards.mjs` — flashcard data
5. `script/generate-rss.js` — RSS feed
6. `script/generate-sitemap.js` — sitemap.xml
7. `vite build` — React SPA → `dist/public/`
8. `script/generate-pagefind-index.js` — Pagefind search index prep
9. `script/build-pagefind.js` — build Pagefind static search
10. `script/build-optimize.js` — post-build optimizations

### Static data files generated at build time
```
public/data/
├── channels.json              # [{id, label, questionCount, ...}]
├── questions-index.json       # lightweight index (id, channel, difficulty)
├── channel-algorithms.json    # full questions for each channel
├── channel-frontend.json
├── channel-*.json             # one file per channel
├── learning-paths.json
├── coding-challenges.json
├── stats.json
└── search-index/              # Pagefind static search
    ├── pagefind.js
    └── *.idx
```
These files are **gitignored** (`client/public/data/`) and regenerated on every deployment.

### Production server (if deployed with backend)
```bash
npm run build:server   # tsx script/build.ts → dist/index.cjs
npm start              # NODE_ENV=production node dist/index.cjs
```

---

## 9. Environment Variables

### Active in development (set in `.replit [userenv.development]`)

| Variable | Value | Purpose |
|----------|-------|---------|
| `ANTHROPIC_BASE_URL` | `http://localhost:4000` | Points Claude CLI at the strip proxy |
| `ANTHROPIC_API_KEY` | `_DUMMY_API_KEY_` | Non-empty value required by Claude CLI |
| `LITELLM_MASTER_KEY` | `sk-local-dev-key` | Only needed if using cl.sh + LiteLLM |

### Auto-injected by Replit AI integrations (development)

| Variable | Value | Provider |
|----------|-------|----------|
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | `http://localhost:1106/modelfarm/anthropic` | Anthropic |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | (Replit-managed token) | Anthropic |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | `http://localhost:1106/modelfarm/openai` | OpenAI |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | (Replit-managed token) | OpenAI |
| `AI_INTEGRATIONS_GEMINI_BASE_URL` | `http://localhost:1106/modelfarm/gemini` | Gemini |
| `AI_INTEGRATIONS_GEMINI_API_KEY` | (Replit-managed token) | Gemini |
| `AI_INTEGRATIONS_OPENROUTER_BASE_URL` | `http://localhost:1106/modelfarm/openrouter` | OpenRouter |
| `AI_INTEGRATIONS_OPENROUTER_API_KEY` | (Replit-managed token) | OpenRouter |

### Set in `.replit [userenv.shared]`

| Variable | Value | Purpose |
|----------|-------|---------|
| `BETTER_AUTH_SECRET` | (base64 secret) | better-auth session signing |
| `BETTER_AUTH_URL` | `https://<replit-domain>` | better-auth base URL |

### Optional (from `.env.example`, not committed)

| Variable | Purpose |
|----------|---------|
| `VITE_OPENROUTER_COOKIE` | OpenRouter browser auth |
| `DATABASE_URL` | Overrides DB path (default: `file:local.db`) |
| `VITE_BETTER_AUTH_URL` | Frontend auth URL |
| `VITE_GISCUS_*` | GitHub Discussions integration |
| `VITE_GITHUB_REPO` | Feedback issue creation repo |
| `GA_MEASUREMENT_ID` / `VITE_GA_MEASUREMENT_ID` | Google Analytics |
| `VITE_STAGING` | Show staging banner |
| `VITE_USE_SERVER` | Enable server API in dev |
| `QDRANT_URL` / `QDRANT_API_KEY` | Qdrant vector DB (optional) |
| `EMBEDDING_MODEL` | tfidf (default) / ollama / opencode |
| `OLLAMA_URL` | Local Ollama instance (default: `http://localhost:11434`) |
| `DECISION_MODEL` | Ollama model name (default: `llama3.2`) |
| `VITE_BASE_URL` | Vite base URL (default: `/`) |

---

## 10. Replit Configuration

### Workflows (`.replit`)

| Workflow | Command | Port |
|----------|---------|------|
| **Start application** | `npm run dev` | 5000 |
| **artifacts/mockup-sandbox: Component Preview Server** | `PORT=5173 BASE_PATH=/__mockup/ pnpm --filter @workspace/mockup-sandbox run dev` | 5173 |

The **Project** workflow runs both in parallel.

### Port mappings

| Local port | External port | Service |
|-----------|--------------|---------|
| 4000 | — | Anthropic strip proxy (internal only) |
| 3001 | 6000 | Go API |
| 5000 | 8000 | Main Express + Vite app |
| 5001 | 8081 | Secondary dev server |
| 5002 | 9000 | Tertiary dev server |
| 5173 | 80 | Mockup sandbox |
| 5174 | 8080 | Mockup sandbox alt |
| 3128 | 3002 | Proxy |
| 4096 | 3000 | — |
| 9999 | 8099 | — |
| 63774 | 3001 | — |

### Nix packages (`.replit [nix]`)
Channel: `stable-25_05`  
Packages: `glib`, `nss`, `nspr`, `atk`, `cups`, `dbus`, `libdrm`, `xorg.*`, `libgbm`, `libxkbcommon`, `pango`, `cairo`, `alsa-lib`, `gh`, `chromium`, `chromium-xorg-conf`, `firefox`, `firefox-esr`, `act`, `containerd`, `vim-full`, `ollama`, `gotrue-supabase`, `plan9port`, `tmux`, `zip`

### Runtime modules (`.replit modules`)
`web`, `python-3.12`, `nodejs-20`

### Deployment (`.replit [deployment]`)
- Router: `application`
- Target: `autoscale`
- Build: `npm run build`
- Run: `node ./dist/index.cjs`
- Post-build: `pnpm store prune` with `CI=true`

### Post-merge script
`scripts/post-merge.sh` — runs automatically after task agent code merges. Timeout: 20 seconds.

---

## 11. Claude CLI + Anthropic Proxy

### The problem
Replit's Anthropic proxy (`localhost:1106/modelfarm/anthropic`) uses a **Google Vertex AI** backend. Vertex AI rejects `cache_control: {type: "ephemeral"}` fields that Claude CLI always sends, returning:
```
"Extra inputs are not permitted" (req_vrtx_* error)
```

### The solution
`anthropic-proxy.py` — a lightweight Python HTTP proxy (pure stdlib, zero dependencies) that:
1. Receives all requests from Claude CLI
2. Recursively strips `cache_control` from the entire JSON body
3. Strips unsupported top-level keys (`betas`, `system_betas`)
4. Forwards the cleaned request to `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`
5. Streams the response back to Claude CLI

### Request flow
```
Claude CLI  (ANTHROPIC_BASE_URL=http://localhost:4000)
    │
    ▼
anthropic-proxy.py  (port 4000)
    │  strips cache_control, betas, system_betas
    │  sets x-api-key = AI_INTEGRATIONS_ANTHROPIC_API_KEY
    ▼
Replit proxy  (http://localhost:1106/modelfarm/anthropic)
    │  Vertex AI backend
    ▼
Claude API response
```

### Auto-start
`server/index.ts` spawns `anthropic-proxy.py` as a child process inside the `httpServer.listen` callback, guarded by `NODE_ENV !== 'production'`:
```ts
if (process.env.NODE_ENV !== 'production') {
  startAnthropicProxy();  // spawns python3 anthropic-proxy.py with PROXY_PORT=4000
}
```
Auto-restarts on crash with 3-second delay.

### How to use Claude CLI
```bash
claude          # uses default model (configured in ANTHROPIC_BASE_URL)
```
No `export` needed. All env vars are set by Replit automatically.

> **Critical**: Never set `ANTHROPIC_BASE_URL=localhost:4000` — must include `http://` scheme: `http://localhost:4000`.

### Verify the proxy is running
Look for this in "Start application" workflow logs:
```
[anthropic-proxy] started on port 4000
[proxy] Anthropic strip-proxy listening on http://127.0.0.1:4000
[proxy] Forwarding to: http://localhost:1106/modelfarm/anthropic
```

### Manual test
```bash
curl -s -X POST http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -H "x-api-key: _DUMMY_API_KEY_" \
  -d '{"model":"claude-haiku-4-5","max_tokens":10,
       "system":[{"type":"text","text":"Brief.","cache_control":{"type":"ephemeral"}}],
       "messages":[{"role":"user","content":"Say OK"}]}'
# Expected: {"content":[{"type":"text","text":"OK"}], ...}
```

### Full replication guide
See `docs/claude-cli-setup.md` for step-by-step replication instructions.

### Other proxy files
| File | Purpose | Status |
|------|---------|--------|
| `anthropic-proxy.py` | Active strip proxy (stdlib, port 4000) | **In use** |
| `anthropic_proxy.py` | Old Flask proxy bridging Anthropic → Ollama/OpenAI (port 8081) | **Not in use** |
| `cl.sh` | Claude CLI launcher via LiteLLM (multi-LLM support) | Optional |
| `.claude/litellm-config.yaml` | LiteLLM config for all 4 providers | Only used with `cl.sh` |
| `config.yaml` | LiteLLM config for Ollama qwen2.5-3b only | Standalone Ollama mode |

### cl.sh (optional multi-LLM launcher)
Starts LiteLLM on port 4000 and launches Claude CLI with `--model` flag:
```bash
./cl.sh                                  # default: claude-sonnet-4-6
./cl.sh --model gpt-5.2                  # OpenAI
./cl.sh --model gemini-2.5-pro           # Gemini
./cl.sh --model deepseek/deepseek-r1     # via OpenRouter
```
> **Note**: `cl.sh` and `anthropic-proxy.py` both use port 4000 — they conflict. Use one or the other.

---

## 12. AI Agent System (opencode)

**CLI**: `opencode` at `/home/runner/workspace/.config/npm/node_global/bin/opencode`  
**Config**: `.opencode/config.json`  
**Agent definitions**: `.opencode/agents/` (70+ `.agent.md` files)  
**Skills**: `.agents/skills/` (35+ skill directories)

### npm shortcuts
```bash
npm run ai              # opencode interactive
npm run ai:run          # opencode run
npm run ai:supervisor   # opencode run --agent devprep-supervisor
npm run ai:question     # opencode run --agent devprep-question-expert
npm run ai:flashcard    # opencode run --agent devprep-flashcard-expert
npm run ai:bug          # opencode run --agent devprep-bug-fix-supervisor
npm run ai:ui           # opencode run --agent devprep-frontend-designer
npm run ai:agents       # opencode agent list
npm run ai:models       # opencode models
npm run ai:stats        # opencode stats
npm run ai:proxy        # python3 anthropic_proxy.py (OLD proxy — use anthropic-proxy.py instead)
```

### Supervisor pattern
Replit agent acts as supervisor — plans, delegates to specialized agents, reviews outputs.
```
REPLIT (Supervisor)
├── ANALYZE  — Which agent(s) own this work?
├── PLAN     — Task breakdown with agent assignments
├── DELEGATE — opencode run --agent <name> "task"
├── MONITOR  — Review outputs; correction if wrong
├── SYNTHESIZE — Combine results
└── UPDATE   — Update replit.md + AGENTS.md if architecture changed
```

### Agent categories

**Orchestrators**: `devprep-supervisor`, `devprep-coordinator`

**Frontend**: `devprep-frontend-designer`, `devprep-ui-ux-expert`, `devprep-react-optimizer`, `devprep-web-reviewer`

**GitHub Theme (15)**: `devprep-github-colors-expert`, `devprep-github-typography-expert`, `devprep-github-layout-expert`, `devprep-github-nav-expert`, `devprep-github-cards-expert`, `devprep-github-darkmode-expert`, `devprep-github-badges-expert`, `devprep-github-modals-expert`, `devprep-github-tables-expert`, `devprep-github-forms-expert`, `devprep-github-buttons-expert`, `devprep-github-inputs-expert`, `devprep-github-icons-expert`, `devprep-github-alerts-expert`, + theme agents

**Bug Category (15+)**: `devprep-bug-a11y`, `devprep-bug-animations`, `devprep-bug-api`, `devprep-bug-async`, `devprep-bug-build`, `devprep-bug-css`, `devprep-bug-database`, `devprep-bug-events`, `devprep-bug-logic`, `devprep-bug-performance`, `devprep-bug-security`, `devprep-bug-seo`, `devprep-bug-sync`, `devprep-bug-state`, `devprep-bug-fix-supervisor`

**Content Generation**: `devprep-question-expert`, `devprep-flashcard-expert`, `devprep-exam-expert`, `devprep-voice-expert`, `devprep-coding-expert`, `devprep-blog-generator`

**Infrastructure**: `devprep-static-deployment`, `devprep-devops-engineer`, `devprep-db-optimizer`, `devprep-cicd-security-reviewer`, `devprep-e2e-tester`, `devprep-seo-audit`

**Strategy**: `devprep-tech-writer`, `devprep-brainstormer`, `devprep-copywriter`, `devprep-ai-tools`

### Correction request format
```
CORRECTION REQUEST → <agent-name>
Issue: <what is wrong>
Expected: <what should have been done>
Context: <relevant files or code snippets>
Action: <specific redo instruction>
```

---

## 13. Content Pipeline (Bots)

### Unified content bot
```bash
npm run bot:unified -- --type=all          # all content types
npm run bot:question                       # interview questions
npm run bot:challenge                      # coding challenges
npm run bot:certification                  # certification exam questions
npm run bot:sessions                       # voice practice sessions

# Pipeline stages
npm run bot:creator     # Create new content
npm run bot:verifier    # Validate content
npm run bot:processor   # Format + publish to DB
npm run bot:reconcile   # Check data consistency
npm run bot:reconcile:dry  # Dry run
```

### Swarm-based parallel generation
```bash
npm run swarm:content              # parallel content across all types
npm run swarm:content:questions    # only questions
npm run swarm:content:certs        # only certifications
npm run swarm:content:flashcards   # only flashcards
npm run swarm:content:voice        # only voice sessions
npm run swarm:content:paths        # only learning paths
npm run swarm:content:challenges   # only coding challenges
npm run swarm:content:fast         # 30 workers
```

### Pipeline scripts (`scripts/`)
| Script | Purpose |
|--------|---------|
| `generate-questions-pipeline.ts` | Questions via `content-question-expert` |
| `generate-flashcards-pipeline.ts` | Flashcards via `content-flashcard-expert` |
| `generate-voice-sessions-pipeline.ts` | Voice sessions via `content-voice-expert` |
| `generate-learning-paths-pipeline.ts` | Learning paths via `content-learning-path-expert` |
| `generate-certifications-pipeline.ts` | Certifications via `content-certification-expert` |

All support `--min=N` (skip channels already at N items) and `--channel=X` / `--cert=X` flags.

### Vector search operations
```bash
npm run vector:init        # Initialize Qdrant collection
npm run vector:sync        # Sync questions → Qdrant embeddings
npm run vector:search      # Semantic search CLI
npm run vector:duplicates  # Find duplicate questions
npm run vector:stats       # Collection statistics
npm run vector:similar     # Generate similar question suggestions
npm run rag:graph          # Generate knowledge graph
npm run rag:intelligence   # Generate interview intelligence insights
```

### Data validation
```bash
npm run validate:questions    # Validate question format
npm run check:duplicates      # Find duplicate questions
npm run check:duplicates:fix  # Auto-fix duplicates
```

---

## 14. Testing

### E2E (Playwright)
```bash
npm test                   # All tests
npm run test:smoke         # Smoke suite (quick pass/fail)
npm run test:smoke:ci      # Smoke suite for CI
npm run test:core          # Core flows
npm run test:unified       # Unified test suite
npm run test:a11y          # Accessibility tests
npm run test:mobile        # Mobile (iPhone 13 profile)
npm run test:desktop       # Desktop (Chromium)
npm run test:headed        # Visible browser
npm run test:debug         # Playwright debug mode
npm run test:report        # Show HTML report
npm run test:api           # API-only tests
npm run test:full          # Full suite via scripts/run-e2e-tests.sh
npm run test:perf          # Performance tests
npm run test:perf:mobile   # Mobile performance tests
npm run test:perf:desktop  # Desktop performance tests
npm run test:codegen       # Record new tests
```

Test configs: `playwright.config.ts` (main), `playwright.perf.config.ts` (perf), `playwright.api.config.ts` (API)  
Projects: `chromium-desktop`, `mobile-iphone13`, `accessibility`  
Reports: `playwright-report/` (gitignored)

### Unit (Vitest)
```bash
npx vitest          # watch mode
npx vitest run      # single run
```
Test files: `client/src/pages/Home.test.tsx`, `server/credits.test.ts`, `server/coding-challenges.test.ts`

### Performance measurement
```bash
npm run perf:measure    # Measure staging + production Lighthouse scores
```
Outputs: `perf-results.json`, `perf/screenshots/`

---

## 15. GitHub Actions CI/CD

Located in `.github/workflows/`:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deploy-app.yml` | Push to main | Build + deploy static SPA to GitHub Pages |
| `deploy-blog.yml` | Push to main | Deploy blog |
| `deploy-go-api.yml` | Push to main | Deploy Go API |
| `content-generation.yml` | Scheduled | Generate new questions/content |
| `daily-maintenance.yml` | Daily | DB cleanup, dedup check |
| `duplicate-check.yml` | On push | Detect duplicate questions |
| `manual-intake.yml` | Manual dispatch | Add content manually |
| `generate-learning-paths.yml` | Scheduled | Generate learning paths |
| `social-media.yml` | Scheduled | Post to LinkedIn, etc. |
| `issue-processing.yml` | On issue open | Auto-process GitHub issues |
| `scheduled-deploy.yml` | Scheduled | Automated deployment |
| `autonomous-perf-loop.yml` | Manual / scheduled | Autonomous perf optimization |
| `perf-tests.yml` | On PR | Lighthouse perf regression |
| `setup-labels.yml` | Manual | Initialize GitHub labels |

---

## 16. npm Scripts Reference

### Development
```bash
npm run dev               # Start dev server (port 5000)
npm run dev:vite          # Vite only (port 5001)
npm run dev:server        # Express only
```

### Build
```bash
npm run build             # Vite SPA build only
npm run build:static      # Full static build (data export + SPA + search)
npm run build:pagefind    # Pagefind search index only
npm run build:optimize    # Post-build optimizations
npm run build:server      # Bundle server to dist/index.cjs
npm run preview           # Preview built SPA (port 3333)
```

### Data fetch/export
```bash
npm run fetch:data        # DB → public/data/*.json
npm run fetch:flashcards  # Export flashcard data
npm run fetch:history     # Export question history
npm run generate:paths    # Generate curated learning paths
```

### Database migrations
```bash
npm run db:migrate:history      # Add question_history table
npm run db:migrate:job-titles   # Add job title fields
```

### Deploy
```bash
npm run deploy:pages      # Push dist/ to gh-pages branch
```

### AI agents
```bash
npm run ai                # opencode interactive
npm run ai:run            # opencode run
npm run ai:supervisor     # Run devprep-supervisor agent
npm run ai:question       # Run question-expert agent
npm run ai:flashcard      # Run flashcard-expert agent
npm run ai:bug            # Run bug-fix-supervisor agent
npm run ai:ui             # Run frontend-designer agent
```

### Performance
```bash
npm run perf:measure      # Lighthouse measurement (staging + prod URLs)
npm run swarm:qa          # QA swarm via tsx
npm run swarm:qa:bash     # QA swarm via bash
```

### Other utilities
```bash
npm run check             # TypeScript type check (tsc)
npm run linkedin:poll     # Post LinkedIn poll
npm run linkedin:poll:dry # Dry run LinkedIn poll
```

---

## 17. Iron Laws — What No Agent May Do

1. **No backend API calls in production code paths** — production is static-only (GitHub Pages).
2. **No hardcoded question/answer data in React** — all content must come from DB exports or API.
3. **No `process.env` without `VITE_` prefix in frontend code** — use `import.meta.env.VITE_*`.
4. **No random Tailwind colors not mapped to GitHub design tokens** — use CSS variable tokens.
5. **Never modify `drizzle.config.ts`** — dialect and schema path are locked.
6. **Never modify `.replit`** — workflows, ports, and nix packages must not be changed directly.
7. **Never change primary key ID column types** — breaks existing data and migrations.
8. **Never deploy without running `fetch-questions-for-build.js` first** — empty data files = broken SPA.
9. **Never import directly from component files** — always import from `@/lib/ui`.
10. **Never add `import React from 'react'`** — Vite JSX transform handles it automatically.
11. **Never set `ANTHROPIC_BASE_URL` without `http://` scheme** — `localhost:4000` fails; use `http://localhost:4000`.

---

## 18. Known Issues

| Issue | Location | Status |
|-------|----------|--------|
| Coding challenges don't work in static mode | `client/src/services/api.service.ts:419` | Open — needs static export |
| Achievement credit awards not integrated with credit system | `client/src/lib/achievements/engine.ts:346` | Open |
| Drizzle ORM type warnings in `schema.ts` | `shared/schema.ts` | Pre-existing, non-blocking |
| Vitest needs `setup.ts` file for test utilities | `vitest.config.ts` | Open |
| `anthropic_proxy.py` (old Flask proxy) still in root | root dir | Harmless — not invoked |
| `cl.sh` conflicts with `anthropic-proxy.py` (both use port 4000) | `cl.sh`, `anthropic-proxy.py` | Use one at a time |
| `lsof` not available on Replit | `cl.sh` | Guarded with `command -v lsof` |
| Go API not available when Go binary absent | `go-api/start.sh` | Handled gracefully — exits 0 |
| `local.db-wal` journal file must not be deleted while server runs | root dir | WAL mode — safe to leave |

---

Last Updated: 2026-04-06  
Maintained by: devprep-tech-writer agent + Replit supervisor
