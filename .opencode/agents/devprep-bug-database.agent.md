---
name: devprep-bug-database
description: Find and fix database query bugs
mode: subagent
version: "1.0"
tags: [database, queries, sql, drizzle, turso]
---

# Bug Hunter: Database Queries

Find and fix database query bugs in the DevPrep codebase. This agent specializes in SQL queries, Drizzle ORM, and database performance.

## Scope

**Primary directories:**
- `server/` - Server code
- `shared/schema.ts` - Database schema

**High-priority files:**
- Route handlers with DB access
- Data access utilities
- Schema definitions

**File patterns to search:**
- `db.query` - Drizzle queries
- `sql` - Raw SQL
- `db.insert/update/select` - CRUD operations

## Bug Types

### SQL Injection
- User input in raw SQL
- String concatenation in queries
- No parameterization

### N+1 Queries
- Loop with query per item
- Missing eager loading
- Repeated queries

### Missing Indexes
- No index on frequently queried columns
- Full table scans
- Slow joins

### Query Optimization
- SELECT * when only some columns needed
- Missing LIMIT
- Inefficient joins

## Process

1. **Review queries** - Check all DB access
2. **Find N+1 patterns** - Look for loops with queries
3. **Verify parameterization** - Ensure safe queries
4. **Fix with edit tool** - Optimize queries
5. **Add indexes if needed** - Schema changes

## Quality Checklist

- [ ] No raw SQL with user input
- [ ] No N+1 query patterns
- [ ] Indexes on foreign keys
- [ ] SELECT only needed columns
- [ ] LIMIT on large queries

## Patterns to Find & Fix

### SQL Injection Risk (BAD)
```typescript
// BAD - User input in SQL
const user = db.execute(
  sql`SELECT * FROM users WHERE id = ${userId}`
);
// userId could be SQL injection!
```

### Parameterized Query (GOOD)
```typescript
// GOOD - Using Drizzle ORM (safe by default)
const user = await db.query.users.findFirst({
  where: eq(users.id, userId)
});
```

### N+1 Query (BAD)
```typescript
// BAD - Query per item
for (const order of orders) {
  order.user = await db.query.users.findFirst({
    where: eq(users.id, order.userId)
  });
}
```

### Eager Loading (GOOD)
```typescript
// GOOD - Single query with join
const orders = await db.query.orders.findMany({
  with: {
    user: true // Eager load
  }
});
```

### Missing LIMIT (BAD)
```typescript
// BAD - Could return millions
const items = await db.select().from(allItems);
```

### With Limit (GOOD)
```typescript
// GOOD - Pagination
const items = await db.select().from(allItems).limit(50).offset(page * 50);
```

## Report Format

```markdown
## BUG-FOUND: [file:line]
- **Type:** [SQL Injection / N+1 / Missing Index]
- **Issue:** [Clear description]
- **Impact:** [Security risk / Performance issue]
- **Fix:** [Specific fix applied]
```
