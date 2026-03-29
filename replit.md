# DevPrep / Open-Interview

Free, GitHub-native technical interview prep — swipe learning, voice practice, spaced repetition, coding challenges.

**URL**: https://open-interview.github.io/

---

## Project Type: Static Website (GitHub Pages)

**No backend API server.** This is a pure static SPA deployed to GitHub Pages.

- SQLite runs directly in the browser (sql.js / WASM)
- DB syncs from remote Turso/SQLite source and stores locally
- Full offline support after initial sync
- GitHub design system for look & feel, colors, typography

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite 7, TypeScript, Tailwind CSS 4, shadcn/ui |
| Database | SQLite in browser (sql.js WASM) + Turso sync |
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
| `devprep-github-*-expert` | GitHub-themed UI (20+ agents) |
| `devprep-db-optimizer` | Database schema and queries |
| `devprep-seo-audit` | SEO, search, performance |
| `devprep-e2e-tester` | Playwright tests |
| `devprep-tech-writer` | Documentation |

Full agent list in `AGENTS.md`.

### Delegation Commands
```bash
# Delegate to specific agent
opencode run --agent devprep-frontend-designer "Add dark mode toggle"

# Or via helper script
./script/delegate.sh devprep-coordinator "Generate 10 questions for algorithms"
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

# Steps:
# 1. vite build              SPA → dist/
# 2. Copy pre-synced SQLite to public/ (optional, faster first load)
# 3. node script/build-pagefind.js   search index
# 4. tsx script/deploy-pages.ts     push to gh-pages branch
```

---

## Architecture Rules (Iron Laws)

1. **Static-first**: NO backend API. Pure static SPA on GitHub Pages
2. **Browser SQLite**: All data in sql.js running in browser
3. **Sync from Turso**: Remote DB synced to browser SQLite
4. **GitHub theme**: CSS tokens, system font stack, Primer-inspired components
5. **Offline support**: Full functionality after initial sync

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
- 20+ topic channels (System Design, Algorithms, Frontend, Backend, DevOps, K8s, AWS, ML...)
- Voice interview practice
- Spaced repetition system (SRS)
- Coding challenges (JS/Python) with Monaco editor
- GitHub-themed UI (dark/light mode)
- Full offline support
- Static search (Pagefind)
- SEO-optimized (sitemap, RSS, Open Graph)
