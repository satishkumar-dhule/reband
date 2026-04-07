# Build Guide - Open Interview / Code Reels

Quick reference for building and deploying the application.

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- SQLite database (`local.db`) with questions data

## Development

### Start Dev Server

```bash
pnpm install
pnpm dev
```

Server runs on http://localhost:5000

### Type Checking

```bash
pnpm check
```

## Building for Production

### Quick Build (Development/Testing)

```bash
pnpm build
```

This will:
1. Generate questions data from database
2. Generate flashcards data
3. Generate learning paths data
4. Build with Vite
5. Copy all data files to dist

### Full Static Build (GitHub Pages)

```bash
pnpm build:static
```

This includes everything from `pnpm build` plus:
- Question history data
- RSS feed generation
- Sitemap generation
- Pagefind search index
- Build optimization

## Data Generation Scripts

### Generate All Data

```bash
pnpm fetch:data        # Questions from database
pnpm fetch:flashcards  # Flashcards from database
pnpm generate:paths    # Learning paths
```

### Individual Scripts

```bash
node script/fetch-questions-for-build.js    # Questions
node script/export-flashcards.mjs           # Flashcards
node script/generate-curated-paths.js       # Learning paths
node script/generate-rss.js                 # RSS feed
node script/generate-sitemap.js             # Sitemap
```

## Testing

### Run All Tests

```bash
pnpm test
```

### Run Specific Test Suites

```bash
pnpm test:mobile      # Mobile tests
pnpm test:desktop     # Desktop tests
pnpm test:a11y        # Accessibility tests
pnpm test:perf        # Performance tests
```

## Deployment

### GitHub Pages

```bash
pnpm build:static
pnpm deploy:pages
```

### Cloudflare Pages

```bash
pnpm build:cf
pnpm deploy:cf
```

## Troubleshooting

### Missing Data Files

If pages fail to load data:

```bash
# Regenerate all data files
pnpm fetch:data
pnpm fetch:flashcards
pnpm generate:paths

# Rebuild
pnpm build
```

### TypeScript Errors

```bash
# Reinstall dependencies
pnpm install

# Check for errors
pnpm check
```

### Build Fails

```bash
# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm build
```

## File Structure

```
workspace/
├── client/
│   ├── public/
│   │   └── data/          # Static data files (generated)
│   └── src/               # React application
├── server/                # Express server (dev only)
├── script/                # Build and data generation scripts
├── dist/
│   └── public/
│       └── data/          # Static data files (copied from client/public/data)
└── local.db               # SQLite database
```

## Important Notes

1. **Always run data generation scripts before building** - The build process now does this automatically
2. **Data files are copied to dist automatically** - The post-build script handles this
3. **Static-first architecture** - Production uses only static JSON files, no backend API
4. **Database is source of truth** - All data comes from `local.db` at build time

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm build:static` | Full static build with all features |
| `pnpm check` | TypeScript type checking |
| `pnpm test` | Run all tests |
| `pnpm preview` | Preview production build locally |

## Environment Variables

Create a `.env` file for development:

```env
# Required for AI features (optional for basic functionality)
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=

# Optional
QDRANT_URL=
QDRANT_API_KEY=
```

## Support

For issues or questions:
- Check `FIXES_APPLIED.md` for recent fixes
- Check `ISSUES_BREAKING_PAGES.md` for known issues
- Check `AGENT_TASKS.md` for optimization tasks
- Check `SPECIFICATIONS.md` for architecture details
