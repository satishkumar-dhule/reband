# Database Query Optimization Audit Report

**Project:** DevPrep/Open-Interview  
**Date:** April 1, 2026  
**Scope:** server/routes.ts, server/db.ts, shared/schema.ts

---

## Executive Summary

| Category | Status | Risk Level |
|----------|--------|------------|
| SQL Injection | ✅ PASS | Low |
| N+1 Queries | ✅ PASS | Low |
| Index Coverage | ⚠️ NEEDS WORK | Medium |
| Pagination | ⚠️ NEEDS WORK | Medium |
| Connection Management | ⚠️ NEEDS WORK | Low |

**Overall Assessment:** The codebase uses parameterized queries correctly and has no SQL injection vulnerabilities. Main areas for improvement are missing indexes and lack of pagination on several endpoints.

---

## 1. Query Patterns Analysis

### 1.1 Parameterization - PASS ✅

All queries in `server/routes.ts` properly use parameterized queries:

```typescript
// GOOD - Parameterized query
const result = await client.execute({
  sql: "SELECT * FROM questions WHERE id = ? LIMIT 1",
  args: [questionId]
});
```

**Verification:**
- Line 91-94: Channel count query - parameterized ✅
- Line 113-128: Questions by channel - parameterized ✅
- Line 176-179: Single question - parameterized ✅
- Line 236-240: Subchannels - parameterized ✅
- Line 321-337: Coding challenges - parameterized ✅
- All INSERT/UPDATE operations use parameterized queries

**No SQL injection vulnerabilities detected.**

---

### 1.2 N+1 Query Patterns - PASS ✅

No N+1 patterns detected. The routes don't perform joins that would require multiple queries.

**Analysis:**
- Routes use single-table queries
- No loops that execute queries per item
- Caching strategy reduces repeated queries

---

### 1.3 Pagination Implementation

| Endpoint | Status | Issue |
|----------|--------|-------|
| `/api/channels` | ✅ OK | COUNT aggregation, small result |
| `/api/questions/:channelId` | ❌ MISSING | No pagination - loads ALL questions |
| `/api/stats` | ✅ OK | Aggregation query |
| `/api/subchannels/:channelId` | ✅ OK | DISTINCT query |
| `/api/companies/:channelId` | ❌ INEFFICIENT | Fetches all rows, parses in JS |
| `/api/coding/challenges` | ✅ OK | No pagination but reasonable |
| `/api/certification/:id/questions` | ⚠️ PARTIAL | Has LIMIT but unbounded |
| `/api/learning-paths` | ✅ OK | Has pagination |

---

## 2. Missing Indexes

### 2.1 Current Indexes (from schema.ts)

```sql
-- Questions table indexes
idx_questions_channel        -- on channel
idx_questions_difficulty     -- on difficulty  
idx_questions_status         -- on status
idx_questions_channel_status -- composite (channel, status)

-- Missing critical indexes:
```

### 2.2 Recommended New Indexes

| Priority | Table | Index Name | Columns | Reason |
|----------|-------|------------|---------|--------|
| HIGH | questions | idx_questions_channel_subchannel | (channel, sub_channel) | Filtered together in line 113-128 |
| HIGH | questions | idx_questions_channel_difficulty | (channel, difficulty) | Common filter combo |
| MEDIUM | questions | idx_questions_created_at | (created_at) | ORDER BY created_at in line 126 |
| HIGH | user_sessions | idx_user_sessions_session_key_status | (session_key, status) | Unique lookup in line 1009 |
| MEDIUM | question_history | idx_question_history_composite | (question_id, question_type, created_at) | Multi-column filter in line 458-463 |

### 2.3 Index Impact Analysis

**Current problematic query (Line 113-128):**
```typescript
sql += " AND sub_channel = ?";  // No index on sub_channel
sql += " AND difficulty = ?";     // No composite index
sql += " ORDER BY created_at ASC"; // No index on created_at
```

**Recommended index:**
```sql
CREATE INDEX idx_questions_channel_subchannel_difficulty 
ON questions(channel, sub_channel, difficulty, created_at);
```

---

## 3. Specific Query Optimizations

### 3.1 Question List Endpoint - Add Pagination

**File:** `server/routes.ts` line 105-137  
**Issue:** No LIMIT clause, loads all matching questions

```typescript
// CURRENT (line 126)
sql += " ORDER BY created_at ASC";
// Returns ALL matching questions - could be thousands

// RECOMMENDED
sql += " ORDER BY created_at ASC LIMIT ? OFFSET ?";
args.push(parseInt(limit || '50'), parseInt(offset || '0'));
```

### 3.2 Companies Endpoint - Reduce Data Transfer

**File:** `server/routes.ts` line 250-277  
**Issue:** Fetches full rows, parses in JavaScript

```typescript
// CURRENT - fetches all rows then parses
const result = await client.execute({
  sql: "SELECT companies FROM questions WHERE channel = ? AND companies IS NOT NULL",
  args: [channelId]
});
const companiesSet = new Set<string>();
for (const row of result.rows) {
  if (row.companies) {
    const parsed = JSON.parse(row.companies as string);
    parsed.forEach((c: string) => companiesSet.add(c));
  }
}

// RECOMMENDED - Use GROUP_CONCAT at DB level
const result = await client.execute({
  sql: `SELECT companies FROM questions 
        WHERE channel = ? AND companies IS NOT NULL
        GROUP BY channel`,
  args: [channelId]
});
// Process results once
```

### 3.3 Random Question Query

**File:** `server/routes.ts` line 140-169  
**Issue:** Uses `ORDER BY RANDOM()` which is inefficient

```typescript
// CURRENT - full table scan + sort
sql += " ORDER BY RANDOM() LIMIT 1";

// RECOMMENDED for large tables - use subquery with LIMIT
sql = `SELECT * FROM questions 
       WHERE channel = ? AND status != 'deleted'
       ORDER BY RANDOM() 
       LIMIT 1`;
```

**Note:** For tables < 10,000 rows, current approach is acceptable.

---

## 4. Connection Management

### 4.1 Current Implementation

**File:** `server/db.ts`

```typescript
const url = "file:local.db";
export const client = createClient({ url });
```

**Observations:**
- Single client instance (suitable for SQLite file-based)
- No connection pooling (not needed for SQLite)
- No query timeout configuration
- No explicit transaction handling

### 4.2 Recommendations

```typescript
// Add timeout configuration
export const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// For queries that might hang, add timeout handling
export async function executeWithTimeout(sql: string, args: any[], timeout = 5000) {
  return Promise.race([
    client.execute({ sql, args }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), timeout)
    )
  ]);
}
```

---

## 5. ORM Usage Analysis

### 5.1 Current State

The project defines schema in `shared/schema.ts` using Drizzle ORM, but routes use raw SQL via libSQL client.

**Schema (Drizzle):** ✅ Properly defined  
**Queries (Raw SQL):** ⚠️ Works but loses type safety

```typescript
// schema.ts - uses Drizzle
export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  channel: text("channel").notNull(),
  // ...
});

// routes.ts - uses raw SQL
const result = await client.execute({
  sql: "SELECT * FROM questions WHERE channel = ?",
  args: [channelId]
});
```

### 5.2 Recommendation

Consider using Drizzle's query builder for type safety:

```typescript
// If adding Drizzle queries
import { db } from './db';
import { eq } from 'drizzle-orm';
import { questions } from '../shared/schema';

const result = await db.select()
  .from(questions)
  .where(eq(questions.channel, channelId));
```

**Note:** Current raw SQL approach is acceptable for this use case and performs well.

---

## 6. Query Caching Analysis

### 6.1 Current Implementation

**File:** `server/routes.ts` lines 5-32

```typescript
const MAX_CACHE_SIZE = 100;
const CACHE_TTL = 60_000;
const channelCache = new Map<string, { data: any; timestamp: number }>();
```

**Observations:**
- LRU cache with 100 entry limit
- 60-second TTL
- Cache invalidation available via `invalidateChannelCache()`

### 6.2 Recommendations

1. **Add cache invalidation triggers** - When questions are created/updated
2. **Consider Redis for multi-instance deployments** - Current in-memory cache won't work with multiple servers
3. **Add cache hit/miss metrics** - For monitoring cache effectiveness

---

## 7. Summary of Findings

### Critical Issues

| Issue | Location | Fix |
|-------|----------|-----|
| No pagination on questions list | Line 113-128 | Add LIMIT/OFFSET |
| Missing composite indexes | schema.ts | Add idx_questions_channel_subchannel_difficulty |

### Medium Priority

| Issue | Location | Fix |
|-------|----------|-----|
| Inefficient company extraction | Line 256-269 | Use DB-level aggregation |
| No query timeouts | server/db.ts | Add timeout handling |
| Missing sub_channel index | schema.ts | Add index |

### Low Priority

| Issue | Location | Fix |
|-------|----------|-----|
| ORDER BY RANDOM() | Line 156 | Acceptable for small tables |
| SELECT * in some queries | Various | Use specific columns |

---

## 8. Recommended Index Creation Script

```sql
-- Add to script/migrate-add-missing-tables.ts or new migration

-- Priority 1: Questions filtering
CREATE INDEX IF NOT EXISTS idx_questions_channel_subchannel 
ON questions(channel, sub_channel);

CREATE INDEX IF NOT EXISTS idx_questions_channel_difficulty 
ON questions(channel, difficulty);

CREATE INDEX IF NOT EXISTS idx_questions_created_at 
ON questions(created_at);

-- Priority 2: User sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_key_status 
ON user_sessions(session_key, status);

-- Priority 3: Question history
CREATE INDEX IF NOT EXISTS idx_question_history_composite 
ON question_history(question_id, question_type, created_at);
```

---

## 9. Performance Test Recommendations

1. **Pagination test** - Measure response time with 1000+ questions
2. **Cache hit rate** - Monitor cache effectiveness
3. **Index usage** - Use EXPLAIN QUERY PLAN to verify index usage

```typescript
// Example: Verify index usage
const result = await client.execute({
  sql: "EXPLAIN QUERY PLAN SELECT * FROM questions WHERE channel = ? AND sub_channel = ?",
  args: ["algorithms", "arrays"]
});
console.log(result.rows);
```

---

## Appendix: Query Inventory

| Route | Query Type | Complexity | Indexable |
|-------|------------|------------|-----------|
| GET /api/channels | Aggregation | Simple | ✅ |
| GET /api/questions/:channelId | Filter + Sort | Medium | ⚠️ Needs composite |
| GET /api/question/random | Random | Simple | ✅ |
| GET /api/question/:questionId | Point lookup | Simple | ✅ Primary key |
| GET /api/stats | Aggregation | Simple | ✅ |
| GET /api/subchannels/:channelId | DISTINCT | Simple | ✅ |
| GET /api/companies/:channelId | JSON parse | Medium | ⚠️ Inefficient |
| GET /api/coding/challenges | Filter | Simple | ✅ |
| GET /api/learning-paths | Filter + Pagination | Medium | ✅ Has pagination |
| GET /api/user/sessions | Filter | Simple | ✅ |
| GET /api/history | Filter + Sort | Medium | ✅ |

---

*End of Report*