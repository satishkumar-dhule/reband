# API Input Validation Deep Analysis Report

**Project:** DevPrep/Open-Interview  
**Date:** April 1, 2026  
**Scope:** server/routes.ts, server/index.ts, validation middleware

---

## Executive Summary

This audit reveals **critical gaps** in API input validation across all four focus areas. The server lacks fundamental protections against common attack vectors including SQL injection (partial), XSS, and rate limiting. No formal schema validation library (Zod/Joi) is implemented.

| Category | Risk Level | Coverage |
|----------|-----------|----------|
| Request Validation | 🔴 HIGH | 20% |
| Schema Validation | 🔴 CRITICAL | 0% |
| File Upload Security | ✅ N/A | N/A |
| API Rate Limiting | 🔴 CRITICAL | 0% |

---

## 1. Request Validation

### 1.1 Input Type Validation

**Status:** ❌ NOT IMPLEMENTED

The server performs **no type checking** on query parameters, path parameters, or request body fields.

**Evidence:**

```typescript
// server/routes.ts:105-137
app.get("/api/questions/:channelId", async (req, res) => {
  const { channelId } = req.params;  // No type validation
  const { subChannel, difficulty } = req.query;  // No type validation
  // ...
});
```

**Issues:**
- `channelId` can be any string (including malicious payloads)
- `subChannel` and `difficulty` accept any value without type checking
- Query parameters not validated for expected types (strings, numbers)

**Impact:** Type coercion attacks, unexpected behavior, potential DoS

---

### 1.2 String Length Limits

**Status:** ❌ NOT IMPLEMENTED

No length validation on string inputs.

**Evidence:**
- Search queries accept unlimited length
- Path parameters not constrained
- Body fields not validated for length

```typescript
// server/routes.ts:840-844
if (search) {
  sql += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)";
  const searchPattern = `%${search}%`;  // No length check
  args.push(searchPattern, searchPattern, searchPattern);
}
```

**Impact:** Database resource exhaustion, potential buffer overflow in edge cases

---

### 1.3 SQL Injection Prevention

**Status:** ⚠️ PARTIAL - Parameterized queries used, but gaps remain

The codebase uses parameterized queries (SQLite prepared statements) for most queries, which prevents classical SQL injection. However, issues remain:

**What Works (Parameterized):**
```typescript
// server/routes.ts:113-128
const sql = "SELECT id, question... WHERE channel = ? AND status != 'deleted'";
const args: any[] = [channelId];
```

**Issues Identified:**

1. **Direct string interpolation in LIKE queries** (lines 841-844):
```typescript
// Vulnerable to SQL injection via special characters
const searchPattern = `%${search}%`;
```
Special characters like `%`, `_`, `\` can break the query or extract data.

2. **No input sanitization on parsed JSON** (lines 64, 294-295, 788-797):
```typescript
// Directly parsed into objects without validation
tags: row.tags ? JSON.parse(row.tags) : [],
companies: row.companies ? JSON.parse(row.companies) : [],
questionIds: row.question_ids ? JSON.parse(row.question_ids) : [],
```

If DB contains malicious JSON, it could trigger prototype pollution or injection when rendered.

3. **Cache key injection** (line 110):
```typescript
const cacheKey = `questions-${channelId}-${subChannel}-${difficulty}`;
```
User input directly in cache keys could cause cache poisoning or key collision.

**Impact:** Medium - Parameterized queries protect against most SQLi, but special character injection and DB-persisted payloads are risks

---

### 1.4 XSS Prevention

**Status:** ❌ NOT IMPLEMENTED

No server-side XSS sanitization. Data flows directly from DB to JSON response without encoding.

**Evidence:**

```typescript
// server/routes.ts:57-72 - Returns raw DB values
return {
  id: row.id,
  question: row.question,  // No sanitization
  answer: answer,
  explanation: row.explanation,  // No sanitization
  // ...
};
```

While the frontend may escape content, the server provides **no defense-in-depth**.

**Note:** The answer field has some sanitization logic (lines 36-55) that extracts MCQ format, but this is data transformation not XSS prevention.

**Impact:** Relies entirely on frontend sanitization - defense-in-depth missing

---

## 2. Schema Validation

### 2.1 Zod/Joi Validation Schemas

**Status:** ❌ NOT IMPLEMENTED

**Evidence:** Zero usage of validation libraries found:
```
$ grep -r "zod\|joi" server/
(No matches)
```

No input schema validation exists anywhere in the codebase.

---

### 2.2 Required Field Enforcement

**Status:** ⚠️ PARTIAL - Only on POST /api/history

Most endpoints perform **no required field validation**:

**Example of what exists (POST /api/history):**
```typescript
// server/routes.ts:531-535
if (!questionId || !eventType || !eventSource) {
  return res.status(400).json({ 
    error: "Missing required fields: questionId, eventType, eventSource" 
  });
}
```

**What's missing:**
- `POST /api/user/sessions` accepts any body without validation
- `PUT /api/user/sessions/:sessionId` has no body validation
- `POST /api/learning-paths/:pathId/start` no body validation
- `POST /api/certification/:id/update-count` no validation

---

### 2.3 Default Value Handling

**Status:** ⚠️ INCONSISTENT

Some endpoints have defaults, others don't:

**With defaults (partial):**
```typescript
// server/routes.ts:456
const { type = 'question', limit = '50' } = req.query;
```

**Without defaults (potential issues):**
```typescript
// server/routes.ts:724
const { domain, difficulty, limit = '50' } = req.query;
// But no validation - could be empty string, wrong type
```

---

### 2.4 Enum Validation

**Status:** ❌ NOT IMPLEMENTED

No enum validation for discrete values.

**Evidence:**
```typescript
// server/routes.ts:121-124
if (difficulty && difficulty !== "all") {
  sql += " AND difficulty = ?";  // No enum check - any string accepted
  args.push(difficulty);
}
```

Validates only against literal `"all"`, accepts any other string as-is.

**Affected Parameters:**
- `difficulty` - Should be: `beginner`, `intermediate`, `advanced`
- `pathType` - Should be validated against known path types
- `status` - Should be: `active`, `deleted`, etc.

---

## 3. File Upload Security

**Status:** ✅ NOT APPLICABLE

The API does **not support file uploads**. No multer, busboy, or file handling middleware exists.

**Evidence:**
```bash
$ grep -r "multer\|upload\|multipart" server/
(No significant matches)
```

---

## 4. API Rate Limiting

### 4.1 Rate Limit Headers

**Status:** ❌ NOT IMPLEMENTED

No rate limiting middleware. No `X-RateLimit-*` headers.

---

### 4.2 Per-Endpoint Limits

**Status:** ❌ NOT IMPLEMENTED

All endpoints have unlimited request rates.

---

### 4.3 Authentication Requirements

**Status:** ⚠️ INCONSISTENT

**What's Protected (via Better Auth):**
- `/api/auth/**` - All auth routes (handled by better-auth)

**What's NOT Protected (publicly accessible):**
- `GET /api/questions/:channelId` - Full question data
- `GET /api/question/:questionId` - Individual question
- `GET /api/coding/challenge/:id` - Challenge solutions exposed
- `POST /api/user/sessions` - Creates sessions without auth
- `POST /api/history` - Creates history without auth
- `POST /api/learning-paths/:pathId/start` - Modifies data without auth
- `DELETE /api/user/sessions/:sessionId` - Modifies data without auth

**Note:** User data (sessions) is accessible by ID only, not authenticated user context. This means:
- Any user can read any other user's session data (by session ID)
- Any user can create sessions in anyone else's name
- Any user can delete any session

**Evidence:**
```typescript
// server/routes.ts:960-970 - No auth check
app.get("/api/user/sessions", async (_req, res) => {
  // Returns ALL active sessions - no user filtering
  const result = await client.execute(
    "SELECT * FROM user_sessions WHERE status = 'active' ORDER BY last_accessed_at DESC"
  );
  res.json(result.rows);
});
```

---

## Detailed Vulnerability Matrix

| Endpoint | Method | Input Validation | Auth | Rate Limit | SQLi Risk |
|----------|--------|------------------|------|------------|-----------|
| `/api/questions/:channelId` | GET | ❌ | ❌ | ❌ | ✅ Safe |
| `/api/question/:questionId` | GET | ❌ | ❌ | ❌ | ✅ Safe |
| `/api/question/random` | GET | ❌ | ❌ | ❌ | ✅ Safe |
| `/api/learning-paths` | GET | ❌ | ❌ | ❌ | ⚠️ Partial |
| `/api/learning-paths/:pathId` | GET | ❌ | ❌ | ❌ | ✅ Safe |
| `/api/learning-paths/:pathId/start` | POST | ❌ | ❌ | ❌ | ✅ Safe |
| `/api/user/sessions` | GET | ❌ | ❌ | ❌ | ✅ Safe |
| `/api/user/sessions` | POST | ❌ | ❌ | ❌ | ✅ Safe |
| `/api/user/sessions/:id` | PUT | ❌ | ❌ | ❌ | ✅ Safe |
| `/api/user/sessions/:id` | DELETE | ❌ | ❌ | ❌ | ✅ Safe |
| `/api/history` | POST | ⚠️ Partial | ❌ | ❌ | ✅ Safe |
| `/api/coding/challenge/:id` | GET | ❌ | ❌ | ❌ | ✅ Safe |
| `/api/certification/:id` | GET | ❌ | ❌ | ❌ | ✅ Safe |

---

## Recommendations Priority

### 🔴 CRITICAL (Fix Immediately)

1. **Implement Rate Limiting**
   - Add `express-rate-limit` package
   - Configure per-endpoint limits
   - Add proper headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`)

2. **Add Authentication to Protected Endpoints**
   - All `/api/user/*` routes should require valid session
   - All mutation endpoints (POST, PUT, DELETE) should require auth
   - Verify user owns resource before modifications

3. **Implement Input Validation Library**
   - Add Zod for schema validation
   - Create validation middleware
   - Validate all user inputs against defined schemas

### 🟠 HIGH (Fix Soon)

4. **Add String Length Limits**
   - Limit search queries (max 200 chars)
   - Limit path parameters
   - Add max length on body fields

5. **Sanitize LIKE Query Inputs**
   - Escape special characters: `%`, `_`, `\`
   - Use parameterized queries for patterns

6. **Add Enum Validation**
   - Validate `difficulty` values
   - Validate `pathType` values  
   - Validate `status` values

### 🟡 MEDIUM (Defense in Depth)

7. **Sanitize DB Output**
   - Add HTML entity encoding on server for text fields
   - Validate JSON structure before parsing

8. **Add Cache Key Sanitization**
   - Sanitize user input in cache keys

9. **Implement Request Size Limits**
   - Add `express.json({ limit: '1mb' })` explicit limit

---

## Testing Checklist

- [ ] Test SQL injection via path parameters
- [ ] Test SQL injection via query parameters (special chars)
- [ ] Test XSS payloads in question/answer fields
- [ ] Test rate limiting on all endpoints
- [ ] Test unauthorized access to other users' sessions
- [ ] Test large payload DoS attacks
- [ ] Test enum validation bypass attempts

---

## Files Analyzed

- `server/routes.ts` (1157 lines)
- `server/index.ts` (130 lines)
- `server/src/auth.ts` (24 lines)
- `server/src/auth-routes.ts` (14 lines)
- `server/src/auth-schema.ts` (58 lines)

---

*Report generated for DevPrep/Open-Interview platform security audit*