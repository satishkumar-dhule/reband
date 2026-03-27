# Code Reels (Open-Interview)

A technical interview prep platform with 1000+ questions, swipe-based learning, voice practice, and spaced repetition.

## Architecture

- **Frontend**: React 19 + Vite, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js server with Vite dev middleware (single server serves both API and frontend)
- **Database**: libSQL/Turso (uses local SQLite file `local.db` in development)
- **ORM**: Drizzle ORM with SQLite schema in `shared/schema.ts`
- **Port**: 5173 (mapped to external port 80 via Replit)

## Running the App

The app runs via the "Start application" workflow:
```
NODE_ENV=development TURSO_DATABASE_URL=file:local.db PORT=5173 tsx server/index.ts
```

## Key Files

- `server/index.ts` - Express server entry point, integrates Vite as middleware in dev
- `server/routes.ts` - All API routes (/api/channels, /api/questions, etc.)
- `server/db.ts` - Turso/libSQL client setup
- `server/vite.ts` - Vite dev server middleware integration
- `client/src/App.tsx` - React app with routing
- `client/src/lib/questions-loader.ts` - Question loading utilities
- `shared/schema.ts` - Drizzle ORM schema definitions
- `script/init-local-db.js` - Initialize local SQLite database tables
- `script/seed-db.mjs` - Seed database with sample questions

## Database Setup

For local development, the app uses SQLite via the `file:local.db` URL:
1. Run `node script/init-local-db.js` to create tables
2. Run `node script/seed-db.mjs` to seed sample questions

## API Endpoints

- `GET /api/channels` - List all channels with question counts
- `GET /api/questions/:channelId` - Get questions for a channel
- `GET /api/question/random` - Get a random question
- `GET /api/stats` - Get channel statistics
- `GET /api/coding/challenges` - Get coding challenges
- `GET /api/learning-paths` - Get learning paths
- `POST /api/history` - Save question history/progress

## Features

- Swipe-based learning (like TikTok/Reels for interview questions)
- 20+ topic channels (System Design, Algorithms, Frontend, Backend, DevOps, K8s, AWS, ML, etc.)
- Voice interview practice
- Spaced repetition system (SRS)
- Coding challenges (Python & JavaScript)
- Knowledge tests / quick quizzes
- Gamified progress with achievements
- AI companion for guidance
