# DevPrep/Open-Interview Database Schema Analysis

**Date:** April 1, 2026  
**Database:** SQLite (`file:local.db`) via libSQL/Turso  
**Schema Source:** `shared/schema.ts`  
**Analysis Scope:** All tables, indexes, queries, and migrations

---

## 1. Schema Design Review

### 1.1 Current Tables Overview

| Table | Row Count | Primary Key | Status |
|-------|-----------|-------------|--------|
| `users` | - | UUID (TEXT) | ✅ Active |
| `questions` | 251 | UUID (TEXT) | ✅ Active |
| `channel_mappings` | - | AUTOINCREMENT | ✅ Active |
| `work_queue` | - | AUTOINCREMENT | ✅ Active |
| `bot_ledger` | - | AUTOINCREMENT | ✅ Active |
| `bot_runs` | - | AUTOINCREMENT | ✅ Active |
| `question_relationships` | 0 | AUTOINCREMENT | ✅ Active |
| `voice_sessions` | 0 | UUID (TEXT) | ✅ Active |
| `certifications` | 0 | UUID (TEXT) | ✅ Active |
| `flashcards` | 216 | UUID (TEXT) | ✅ Active |
| `question_history` | 0 | AUTOINCREMENT | ✅ Active |
| `user_sessions` | 0 | UUID (TEXT) | ✅ Active |
| `learning_paths` | 0 | UUID (TEXT) | ✅ Active |
| `coding_challenges` | 44 | - | ✅ Active |

### 1.2 Table Relationships

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │    questions    │     │    channel_    │
│   (id: UUID)    │     │   (id: UUID)    │     │   mappings     │
│                 │     │                 │     │                │
└────────┬────────┘     └────────┬────────┘     └───────┬────────┘
         │                      │                      │
         │               ┌──────┴──────┐               │
         │               │             │               │
         ▼               ▼             ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  user_sessions  │  │question_history │  │question_        │
│  (user_id)      │  │ (question_id)   │  │relationships    │
│                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  voice_sessions │  │learning_paths   │  │ certifications  │
│                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 1.3 Primary Key Strategy Analysis

| Table | PK Type | Rationale | Assessment |
|-------|---------|-----------|------------|
| `questions` | UUID (TEXT) | Distributed ID generation | ✅ Good for merge scenarios |
| `users` | UUID (TEXT) | Same as questions | ✅ Consistent |
| `certifications` | UUID (TEXT) | Future-proof | ✅ Good |
| `voice_sessions` | UUID (TEXT) | - | ✅ Good |
| `learning_paths` | UUID (TEXT) | - | ✅ Good |
| `flashcards` | UUID (TEXT) | - | ✅ Good |
| `user_sessions` | UUID (TEXT) | Resume feature | ✅ Good |
| `question_history` | AUTOINCREMENT | Audit log | ⚠️ Consider UUID for consistency |
| `question_relationships` | AUTOINCREMENT | Junction table | ⚠️ Acceptable |
| `channel_mappings` | AUTOINCREMENT | Simple mapping | ⚠️ Acceptable |
| `work_queue` | AUTOINCREMENT | Queue processing | ⚠️ Acceptable |
| `bot_ledger` | AUTOINCREMENT | Audit trail | ⚠️ Acceptable |
| `bot_runs` | AUTOINCREMENT | Bot execution log | ⚠️ Acceptable |

**Recommendation:** The hybrid approach (UUID for content, AUTOINCREMENT for system tables) is acceptable. However, for PostgreSQL migration consistency, consider using UUIDs for all tables.

### 1.4 Soft Delete Pattern

Currently implemented via `status` field:

```sql
-- questions table
status: text("status").default("active") -- active, flagged, deleted

-- Soft delete query pattern
WHERE status != 'deleted'
```

**Assessment:** ✅ Soft delete pattern is properly implemented across relevant tables:
- `questions.status` (active, flagged, deleted)
- `certifications.status` (active, draft, archived)
- `learning_paths.status` (active, draft, archived)
- `user_sessions.status` (active, completed, abandoned)
- `flashcards.status` (active)

### 1.5 Foreign Key Constraints

**Current State:**
- `channel_mappings.question_id` → `questions.id` ✅
- `question_relationships.source_question_id` → `questions.id` ✅
- `question_relationships.target_question_id` → `questions.id` ✅

**Missing Foreign Keys:**
- `question_history.question_id` → No FK (references questions.id conceptually)
- `user_sessions.user_id` → No FK to users (user_id is optional for future auth)
- `user_sessions.certification_id` → No FK to certifications
- `user_sessions.channel_id` → No FK to questions or channel_mappings

**Recommendation:** Add foreign key constraints for data integrity:
```sql
ALTER TABLE question_history ADD FOREIGN KEY (question_id) REFERENCES questions(id);
ALTER TABLE user_sessions ADD FOREIGN KEY (certification_id) REFERENCES certifications(id);
```

---

## 2. Query Performance Analysis

### 2.1 Current Index Coverage

#### questions table (251 rows)
| Index | Columns | Used By Queries |
|-------|---------|-----------------|
| `idx_questions_channel` | (channel) | ✅ `/api/questions/:channelId` |
| `idx_questions_difficulty` | (difficulty) | ✅ Random queries |
| `idx_questions_status` | (status) | ✅ All SELECT queries |
| `idx_questions_channel_status` | (channel, status) | ✅ Composite filter |

**Missing Indexes for questions:**
| Missing Index | Use Case | Priority |
|---------------|----------|----------|
| `(channel, difficulty)` | Filter by channel + difficulty | HIGH |
| `(channel, sub_channel)` | Filter by subchannel | HIGH |
| `(created_at)` | Sorting by date | MEDIUM |
| `(is_new)` | New questions filter | MEDIUM |
| `(voice_suitable)` | Voice session queries | LOW |

#### certifications table (0 rows)
| Index | Status |
|-------|--------|
| `idx_certifications_status` | ✅ |
| `idx_certifications_category` | ✅ |
| `idx_certifications_difficulty` | ✅ |

**Missing Indexes:**
| Missing Index | Use Case | Priority |
|---------------|----------|----------|
| `(provider)` | Provider filtering | MEDIUM |

#### learning_paths table (0 rows)
| Index | Status |
|-------|--------|
| `idx_learning_paths_status` | ✅ |
| `idx_learning_paths_path_type` | ✅ |
| `idx_learning_paths_target_company` | ✅ |

**Missing Indexes:**
| Missing Index | Use Case | Priority |
|---------------|----------|----------|
| `(target_job_title)` | Job title filtering | HIGH |
| `(popularity)` | Sorting by popularity | MEDIUM |
| `(created_at)` | Sorting by date | MEDIUM |

#### flashcards table (216 rows)
**No indexes defined.** ⚠️

**Missing Indexes:**
| Missing Index | Use Case | Priority |
|---------------|----------|----------|
| `(channel)` | Channel filtering | HIGH |
| `(difficulty)` | Difficulty filtering | HIGH |
| `(status)` | Active/archived filter | MEDIUM |
| `(created_at)` | Sorting by date | MEDIUM |

#### user_sessions table (0 rows)
| Index | Status |
|-------|--------|
| `idx_user_sessions_status` | ✅ |
| `idx_user_sessions_session_key` | ✅ Unique |
| `idx_user_sessions_last_accessed` | ✅ |

**Missing Indexes:**
| Missing Index | Use Case | Priority |
|---------------|----------|----------|
| `(user_id)` | User session lookup | HIGH |
| `(session_type)` | Session type filter | MEDIUM |

#### coding_challenges table (44 rows)
| Index | Status |
|-------|--------|
| `idx_coding_difficulty` | ✅ |
| `idx_coding_category` | ✅ |

**Missing Indexes:**
| Missing Index | Use Case | Priority |
|---------------|----------|----------|
| `(status)` | Active/challenge filter | MEDIUM |
| `(created_at)` | Sorting | MEDIUM |

### 2.2 Query Performance Issues in Routes

#### Issue 1: N+1 Query Pattern in Companies API
**File:** `server/routes.ts` lines 251-276
```typescript
// GET /api/companies/:channelId
// Problem: Fetches ALL rows, then parses JSON in application code
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
```

**Impact:** Full table scan, then application-level deduplication  
**Recommendation:** Use SQLite's JSON functions or add a normalized `question_companies` table

#### Issue 2: Missing SubChannel Index
**File:** `server/routes.ts` lines 229-247
```typescript
// GET /api/subchannels/:channelId
// Missing index on sub_channel column
const result = await client.execute({
  sql: "SELECT DISTINCT sub_channel FROM questions WHERE channel = ? ORDER BY sub_channel",
  args: [channelId]
});
```

**Impact:** Full table scan or index scan without covering index  
**Recommendation:** Add `CREATE INDEX idx_questions_sub_channel ON questions(sub_channel)`

#### Issue 3: Random Query Performance
**File:** `server/routes.ts` lines 140-169
```typescript
// GET /api/question/random
// Uses ORDER BY RANDOM() - O(n) scan
sql += " ORDER BY RANDOM() LIMIT 1";
```

**Impact:** On larger datasets, this will be very slow  
**Recommendation:** For production with PostgreSQL, use TABLESAMPLE or efficient random selection

#### Issue 4: Search with Multiple LIKE Clauses
**File:** `server/routes.ts` lines 840-844
```typescript
// Learning paths search
sql += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)";
const searchPattern = `%${search}%`;
args.push(searchPattern, searchPattern, searchPattern);
```

**Impact:** Cannot use indexes for LIKE with leading wildcard  
**Recommendation:** Implement full-text search (FTS5) for PostgreSQL migration

### 2.3 JOIN Optimization

**Current State:** No JOINs in routes - all queries are single-table  
**Assessment:** ✅ No obvious JOIN performance issues

**Future Considerations:**
- If adding `question_tags` normalized table, use proper JOINs
- Consider using materialized views for complex aggregations

---

## 3. Data Integrity Analysis

### 3.1 Required Field Enforcement

| Table | Required Fields | Assessment |
|-------|-----------------|------------|
| `questions` | question, answer, explanation, difficulty, channel, subChannel | ✅ NotNull enforced |
| `certifications` | name, provider, description, difficulty, category | ✅ NotNull enforced |
| `learning_paths` | title, description, path_type, difficulty, question_ids, channels | ✅ NotNull enforced |
| `flashcards` | channel, front, back, difficulty | ✅ NotNull enforced |
| `user_sessions` | session_type, session_key, title, total_items | ✅ NotNull enforced |
| `voice_sessions` | topic, channel, difficulty, question_ids, totalQuestions | ✅ NotNull enforced |
| `coding_challenges` | title, description, difficulty, category | ✅ NotNull enforced |

### 3.2 Unique Constraints

| Table | Unique Constraints | Assessment |
|-------|-------------------|------------|
| `users` | username | ✅ Unique |
| `user_sessions` | session_key | ✅ Unique (via schema) |
| `questions` | None (id is unique but no explicit constraint documented) | ⚠️ Review |
| `certifications` | id (UUID) | ✅ Implicit |

**Issue:** No unique constraint on question (channel, sub_channel, question_text) to prevent duplicates

### 3.3 Enum Constraints

**Current Implementation:** TEXT fields with assumed values, no CHECK constraints

| Field | Expected Values | Status |
|-------|----------------|--------|
| `questions.difficulty` | beginner, intermediate, advanced | ⚠️ No CHECK constraint |
| `questions.status` | active, flagged, deleted | ⚠️ No CHECK constraint |
| `certifications.difficulty` | beginner, intermediate, advanced, expert | ⚠️ No CHECK constraint |
| `certifications.category` | cloud, devops, security, data, ai, development, management | ⚠️ No CHECK constraint |
| `user_sessions.status` | active, completed, abandoned | ⚠️ No CHECK constraint |
| `user_sessions.session_type` | test, voice-interview, certification, channel | ⚠️ No CHECK constraint |

**Recommendation:** Add CHECK constraints for PostgreSQL migration:
```sql
ALTER TABLE questions ADD CONSTRAINT chk_difficulty 
  CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
```

### 3.4 Cascade Delete Rules

**Current State:** No ON DELETE CASCADE defined

| Relationship | Current Behavior | Recommendation |
|--------------|------------------|----------------|
| `question_relationships` → questions | No FK | Add FK with CASCADE |
| `channel_mappings` → questions | No FK | Add FK with CASCADE |
| `question_history` → questions | No FK | Add FK with SET NULL |

**Recommendation:** Add foreign keys with appropriate delete rules:
```sql
ALTER TABLE question_relationships 
  ADD FOREIGN KEY (source_question_id) REFERENCES questions(id) ON DELETE CASCADE;
```

---

## 4. Migration Strategy Analysis

### 4.1 Current Migration Files

**Located at:** `script/migrate-add-missing-tables.ts`

| Table | Migration Status | Indexes Created |
|-------|-----------------|------------------|
| `voice_sessions` | ✅ Created | ✅ No |
| `certifications` | ✅ Created | ✅ 3 |
| `question_relationships` | ✅ Created with FK | ✅ No |
| `learning_paths` | ✅ Created | ✅ 3 |
| `question_history` | ✅ Created | ✅ 3 |
| `user_sessions` | ✅ Created | ✅ 3 |

**Assessment:** ✅ Migration file exists and is functional

### 4.2 Migration Coverage Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| No version tracking | No schema version table | HIGH |
| No rollback scripts | No down migrations | HIGH |
| No seed data management | No seed scripts for initial data | MEDIUM |
| No incremental migrations | All tables created in one migration | MEDIUM |

### 4.3 Recommended Migration Structure

```
migrations/
├── V1__initial_schema.sql
├── V2__add_indexes.sql
├── V3__add_foreign_keys.sql
├── V4__add_constraints.sql
└── seeds/
    └── V1__seed_channels.sql
```

### 4.4 PostgreSQL Migration Checklist

When migrating from SQLite to PostgreSQL:

| Item | SQLite Current | PostgreSQL Target |
|------|----------------|-------------------|
| UUID generation | `crypto.randomUUID()` | Use `gen_random_uuid()` |
| JSON storage | TEXT with JSON.parse() | Use native JSON type |
| Auto-increment | AUTOINCREMENT | Use SERIAL or GENERATED |
| Text search | LIKE queries | Use tsvector/gin index |
| Random selection | ORDER BY RANDOM() | Use TABLESAMPLE |
| Array fields | JSON text | Use native ARRAY type |

---

## 5. Index Recommendations Summary

### High Priority (Missing, Critical)

| Table | Index | Query Benefit |
|-------|-------|---------------|
| `questions` | `(channel, sub_channel)` | Subchannel filtering |
| `questions` | `(channel, difficulty)` | Composite filtering |
| `flashcards` | `(channel)` | Channel browsing |
| `flashcards` | `(difficulty)` | Difficulty filtering |
| `learning_paths` | `(target_job_title)` | Job title filters |
| `user_sessions` | `(user_id)` | User session lookup |

### Medium Priority

| Table | Index | Query Benefit |
|-------|-------|---------------|
| `questions` | `(created_at)` | Date sorting |
| `questions` | `(is_new)` | New question filter |
| `certifications` | `(provider)` | Provider filter |
| `learning_paths` | `(popularity)` | Popularity sorting |
| `coding_challenges` | `(status)` | Status filtering |
| `user_sessions` | `(session_type)` | Type filtering |

### Low Priority / Future

| Table | Index | Query Benefit |
|-------|-------|---------------|
| `questions` | `(voice_suitable)` | Voice session queries |
| `questions` | FTS5 (full-text) | Search functionality |
| `certifications` | FTS | Search certifications |

---

## 6. Query Optimization Suggestions

### 6.1 Immediate Optimizations

1. **Add missing indexes** (see Section 5)
2. **Optimize companies endpoint** - Use normalized table or subquery
3. **Cache frequently accessed data** - Already implemented with LRU cache ✅

### 6.2 Medium-term Optimizations

1. **Full-text search** - Implement for questions/learning_paths search
2. **Materialized views** - For complex statistics queries
3. **Covering indexes** - Include frequently selected columns

### 6.3 Long-term (PostgreSQL)

1. **Use native JSON** - Remove application-level JSON parsing
2. **Array columns** - Replace JSON arrays with native arrays
3. **Partial indexes** - For filtered queries (e.g., `WHERE status = 'active'`)
4. **Row-level security** - For multi-tenant isolation

---

## 7. Migration Roadmap

### Phase 1: Index Optimization (Week 1)
- [ ] Add high-priority indexes to questions, flashcards, learning_paths, user_sessions
- [ ] Test query performance improvements
- [ ] Document index usage in route comments

### Phase 2: Data Integrity (Week 2)
- [ ] Add CHECK constraints for enum fields
- [ ] Add foreign key constraints with cascade rules
- [ ] Add unique constraints where needed

### Phase 3: Schema Refinement (Week 3)
- [ ] Create schema version tracking table
- [ ] Split migration into versioned files
- [ ] Add rollback scripts
- [ ] Create seed data management

### Phase 4: PostgreSQL Preparation (Week 4-8)
- [ ] Audit all UUID generations
- [ ] Review JSON vs native types
- [ ] Plan full-text search implementation
- [ ] Test with PostgreSQL dev instance

---

## Appendix: Current Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                  │
│  │    users    │      │  questions  │      │channel_mapp │                  │
│  ├─────────────┤      ├─────────────┤      ├─────────────┤                  │
│  │ id (PK)     │      │ id (PK)     │      │ id (PK)     │                  │
│  │ username    │      │ question    │      │ channel_id  │                  │
│  │ password    │      │ answer      │──────│ sub_channel  │                  │
│  └─────────────┘      │ explanation │      │ question_id │────────┐         │
│                      │ difficulty  │      └─────────────┘        │         │
│                      │ channel     │                             │         │
│                      │ sub_channel │                             ▼         │
│                      │ status      │                      ┌─────────────┐  │
│                      │ tags (JSON) │                      │ question_   │  │
│                      │ ...         │                      │rel          │  │
│                      └─────────────┘                      ├─────────────┤  │
│                                                             │ id (PK)     │  │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐│ source_q_id │──┘
│  │ flashcards  │      │ learning_   │      │certifications││ target_q_id │──┐
│  ├─────────────┤      │ paths       │      ├─────────────┤└─────────────┘  │
│  │ id (PK)     │      │ id (PK)     │      │ id (PK)     │                │
│  │ channel     │      │ title       │      │ name        │                │
│  │ front       │      │ path_type   │      │ provider    │                │
│  │ back        │      │ target_cmpy │      │ category    │                │
│  │ difficulty  │      │ question_ids│      │ difficulty  │                │
│  │ status      │      │ channels    │      │ status      │                │
│  └─────────────┘      │ status      │      └─────────────┘                │
│                       └─────────────┘                                      │
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                  │
│  │voice_sessions│     │user_sessions│      │coding_      │                  │
│  ├─────────────┤      ├─────────────┤      │challenges   │                  │
│  │ id (PK)     │      │ id (PK)     │      ├─────────────┤                  │
│  │ topic       │      │ user_id     │      │ id (PK)     │                  │
│  │ channel     │      │ session_key│      │ title       │                  │
│  │ difficulty  │      │ session_type│     │ difficulty  │                  │
│  │ question_ids│      │ progress    │      │ category    │                  │
│  │ status      │      │ status      │      │ test_cases  │                  │
│  └─────────────┘      └─────────────┘      └─────────────┘                  │
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                  │
│  │question_   │      │  work_queue │      │  bot_ledger │                  │
│  │history     │      ├─────────────┤      ├─────────────┤                  │
│  ├─────────────┤      │ id (PK)     │      │ id (PK)     │                  │
│  │ id (PK)     │      │ item_type   │      │ bot_name    │                  │
│  │ question_id│      │ item_id     │      │ action      │                  │
│  │ event_type │      │ action      │      │ item_type   │                  │
│  │ event_source│     │ priority    │      │ item_id     │                  │
│  │ created_at │      │ status      │      │ created_at  │                  │
│  └─────────────┘      └─────────────┘      └─────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Report generated by DevPrep Database Optimizer Agent*
