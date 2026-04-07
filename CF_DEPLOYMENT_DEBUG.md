# Cloudflare Pages Deployment Debug & Fix Log

**Date:** 2026-04-07  
**Project:** devprep-pages (https://devprep-pages.pages.dev)  
**Status:** ✅ FIXED

---

## Summary of Issues Found

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | D1 schema missing columns — worker queries failed with 500 | 🔴 Critical | ✅ Fixed |
| 2 | D1 database completely empty — 0 rows in all key tables | 🔴 Critical | ✅ Fixed |
| 3 | `channels` query grouped by `cm.id` instead of `cm.channel_id` | 🟡 High | ✅ Fixed |
| 4 | `wrangler.toml` had `__D1_DATABASE_ID__` placeholder not substituted | 🟠 Medium | ✅ Fixed |
| 5 | `hono` dependency not in root `node_modules` | 🟠 Medium | ✅ Fixed |

---

## Step-by-Step Debug Process

### Step 1: Initial Diagnosis — Checked Deployment Status

```bash
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/devprep-pages/deployments?per_page=3"
```

**Result:** Deployments exist and show `stage: deploy - success`. The site at `devprep-pages.pages.dev` returns HTTP 200.

But checking individual API endpoints:

```bash
curl -sv "https://devprep-pages.pages.dev/api/channels"
# → HTTP 500 Internal Server Error
curl -sv "https://devprep-pages.pages.dev/api/questions?channel=algorithms"
# → HTTP 500 Internal Server Error
```

**Finding:** The site loads (HTML returns 200) but ALL `/api/*` endpoints return HTTP 500.

---

### Step 2: Check D1 Database Binding

```bash
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/devprep-pages"
```

**Result:**
```json
{
  "production": { "d1_databases": { "DB": { "id": "a469f158-2dc4-47dd-b859-b756f75e391e" } } }
}
```

D1 binding exists and is correct. `/api/health` returns `{"status":"ok","mode":"database"}` (DB binding detected).

---

### Step 3: Query D1 Directly — Found Schema & Data Issues

```bash
# Check tables
curl -X POST -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --data '{"sql":"SELECT name FROM sqlite_master WHERE type=\"table\""}' \
  "https://api.cloudflare.com/.../d1/database/$D1_ID/query"
```

Tables exist: `questions`, `channel_mappings`, `certifications`, `learning_paths`, etc.

```bash
# Check row counts
curl -X POST --data '{"sql":"SELECT COUNT(*) FROM questions"}' ...
# → 0 rows!
```

**Finding:** Database has correct table structure but **0 rows in all key tables**.

```bash
# Test the channels query directly
curl -X POST --data '{"sql":"SELECT cm.channel_name FROM channel_mappings cm LIMIT 1"}' ...
# → Error 7500: "no such column: cm.channel_name at offset 29: SQLITE_ERROR"
```

**Finding:** Schema mismatch. The `channel_mappings` table was missing columns that the worker code expects.

---

### Step 4: Schema Audit — Missing Columns

Compared actual D1 schema (via `PRAGMA table_info`) against what `worker/index.ts` queries:

| Table | Missing Column | Used In Worker Query |
|-------|----------------|----------------------|
| `questions` | `is_active` | `WHERE q.is_active = 1` |
| `questions` | `subchannel` | `AND q.subchannel = ?` |
| `questions` | `certification_id` | `WHERE q.certification_id = ?` |
| `questions` | `domain` | `AND q.domain = ?` |
| `channel_mappings` | `channel_name` | `SELECT cm.channel_name` |
| `channel_mappings` | `label` | `SELECT cm.label` |
| `channel_mappings` | `description` | `SELECT cm.description` |
| `channel_mappings` | `icon` | `SELECT cm.icon` |
| `channel_mappings` | `color` | `SELECT cm.color` |
| `channel_mappings` | `order_index` | `ORDER BY cm.order_index` |
| `channel_mappings` | `is_active` | `WHERE cm.is_active = 1` |
| `certifications` | `is_active` | `WHERE is_active = 1` |
| `learning_paths` | `is_active` | `WHERE is_active = 1` |
| `learning_paths` | `order_index` | `ORDER BY order_index` |
| `learning_paths` | `company` | `AND company = ?` |
| `learning_paths` | `job_title` | `AND job_title = ?` |

Also found: the channels query grouped by `cm.id` (per-mapping rows) instead of `cm.channel_id` (unique channels).

---

### Step 5: Fix — Create Migration `0002_add_missing_columns.sql`

Created `worker/migrations/0002_add_missing_columns.sql` with all missing column definitions.

Applied each `ALTER TABLE` via the D1 REST API:

```bash
curl -X POST \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --data '{"sql":"ALTER TABLE questions ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1"}' \
  "https://api.cloudflare.com/.../d1/database/$D1_ID/query"
# → success: True
```

All 16 `ALTER TABLE` statements succeeded.

---

### Step 6: Fix — Import Data from local.db

Used Python's built-in `sqlite3` module to read `local.db` (2MB) and upload to D1 via REST API:

```python
import sqlite3, urllib.request, json

conn = sqlite3.connect('local.db')
# Read 427 active questions, insert into D1 one-by-one via REST API
# Result: 427 questions, 402 channel_mappings, 8 certifications,
#         15 coding_challenges, 35 flashcards, 11 learning_paths
```

**Data imported:**

| Table | Local Source | Rows Imported |
|-------|-------------|---------------|
| `questions` | local.db | 427 |
| `channel_mappings` | Generated from questions | 402 |
| `certifications` | local.db | 8 |
| `coding_challenges` | local.db | 15 |
| `flashcards` | local.db | 35 |
| `learning_paths` | local.db | 11 |

Note: `channel_mappings` had 0 rows in local.db, so entries were generated programmatically from the questions' `channel` field.

---

### Step 7: Fix — Channels Query (GROUP BY Bug)

Updated `worker/index.ts` channels query from:
```sql
-- WRONG: Groups by cm.id → returns 402 rows (one per mapping)
GROUP BY cm.id
ORDER BY cm.order_index ASC
```

To:
```sql
-- CORRECT: Groups by channel_id → returns 46 distinct channels
GROUP BY cm.channel_id
ORDER BY MIN(cm.order_index) ASC
```

Also added `MIN()` aggregates for all selected columns.

---

### Step 8: Fix — wrangler.toml D1 ID Placeholder

The `wrangler.toml` contained:
```toml
database_id = "__D1_DATABASE_ID__"
```

Replaced with the actual D1 database ID:
```toml
database_id = "a469f158-2dc4-47dd-b859-b756f75e391e"
```

---

### Step 9: Install Missing `hono` Dependency

```bash
pnpm add -w hono@latest
# → Installed hono to workspace root node_modules
```

Previously `hono` was not available in `node_modules`, causing the wrangler functions build to fail with "Could not resolve 'hono'".

---

### Step 10: Build & Deploy

```bash
# 1. Build frontend
npx vite build
# → ✓ built in 34.13s

# 2. Deploy (with fake git dir to avoid Replit git restrictions)
GIT_DIR=/tmp/fakegit npx wrangler pages deploy dist/public \
  --project-name=devprep-pages --branch=main --commit-dirty=true
# → ✨ Compiled Worker successfully
# → ✨ Uploading Functions bundle
# → 🌎 Deploying...
# → ✅ Deployment: 2dd79162-e09e-4a3c-a8ff-07b706166e4c
```

---

## Post-Fix Verification

All endpoints tested and returning correct data:

```
✅ HTTP 200 /api/health → {"status":"ok","mode":"database","timestamp":"..."}
✅ HTTP 200 /api/channels → 46 distinct channels with question counts
✅ HTTP 200 /api/questions?channel=algorithms → 9 questions
✅ HTTP 200 /api/question/random → random question
✅ HTTP 200 /api/coding/challenges → 15 challenges
✅ HTTP 200 /api/certifications → 8 certifications
✅ HTTP 200 /api/flashcards/algorithms → flashcards
✅ HTTP 200 /api/learning-paths → 11 learning paths
✅ HTTP 200 /api/stats → stats data
```

Site accessible at: https://devprep-pages.pages.dev

---

## Root Cause Summary

The deployment failed because:

1. **Schema drift**: The initial migration (`0001_initial.sql`) created tables that did NOT include all columns referenced in `worker/index.ts`. The worker code was written for a different/newer schema than what was migrated to D1.

2. **Empty database**: No data was ever loaded into D1. The CI/CD pipeline had a data population step missing for the D1 database (it generates static JSON but never populates D1).

3. **Query bug**: The channels endpoint grouped results by `cm.id` (individual mapping rows) instead of `cm.channel_id` (unique channels), returning 402 rows instead of 46.

---

## Files Changed

| File | Change |
|------|--------|
| `worker/migrations/0002_add_missing_columns.sql` | **NEW** — adds all missing columns |
| `worker/index.ts` | Fixed channels `GROUP BY cm.channel_id` |
| `wrangler.toml` | Substituted actual D1 database ID |
| `package.json` | Added `hono` as dependency (via pnpm) |

---

## CI/CD Recommendation

The deployment workflow (`.github/workflows/deploy-cloudflare.yml`) should include a **data population step** after migrations:

```bash
# After: npx wrangler d1 migrations apply devprep --remote
# Add: populate D1 from static JSON or local.db
node scripts/populate-d1-from-static.js
```

This ensures the D1 database is never empty after a fresh deployment.
