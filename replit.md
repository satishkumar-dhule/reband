# Open Interview (Code Reels)

## Overview
An AI-powered technical interview preparation platform with swipe-based learning, voice interview practice, spaced repetition (SRS), coding challenges, and gamified progress tracking.

## Architecture
- **Frontend**: React 19 + Vite, Tailwind CSS v4, Radix UI, Framer Motion, TanStack Query
- **Backend**: Express.js server that also hosts Vite in development (middleware mode)
- **Database**: Turso (libSQL) with Drizzle ORM; falls back to local SQLite (`file:local.db`) if `TURSO_DATABASE_URL` is not set
- **Auth**: Passport.js (local strategy)

## How to Run
The `npm run dev` command starts the Express server on port 5000. In development, the server also runs Vite as middleware (hot reload included). The API and frontend are served from the same origin.

- **Dev**: `npm run dev` → Express + Vite on port 5000
- **Build**: `npm run build` → Vite builds to `dist/public/`
- **Production**: `npm run start` → `node dist/index.cjs`

## Key Configuration
- **Port**: App runs on `PORT` env var (defaults to 5173, dev script sets to 5000 to match Replit workflow)
- **Database**: Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` for production Turso DB; without them a local SQLite file is used
- **Vite config**: `vite.config.ts` at root, client source in `client/`, builds to `dist/public/`

## Environment Variables
- `TURSO_DATABASE_URL` — Turso database connection URL (e.g. `libsql://...`)
- `TURSO_AUTH_TOKEN` — Turso auth token
- `PORT` — Server port (set to 5000 in dev script)
- `NODE_ENV` — `development` or `production`

## Project Structure
```
client/          React frontend source
server/          Express backend (routes, db, auth)
shared/          Shared TypeScript types and schema
script/          Build and data automation scripts
scripts/         Shell scripts
blog-output/     Generated static blog HTML
artifacts/       Sub-artifacts (devprep, mockup-sandbox, api-server)
```
