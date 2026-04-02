# Content Lifecycle & Governance SOP

## 1. Overview

This document defines the standard operating procedures for content creation, review, publication, and retirement in the DevPrep platform. It ensures consistent quality, avoids duplication, and maintains data integrity across all channels.

**Scope:** All content types (Q&A, flashcards, coding challenges, exam questions, voice prompts, blogs, study guides, presentations) across all channels (tech and certification).

**Key Principles:**
- **DB as Source of Truth:** All content lives in SQLite; no hardcoded data in frontend.
- **Pipeline-Driven:** Content flows through automated validation and processing pipelines.
- **Quality Gates:** Content must pass validation before publication.
- **Versioning & Archival:** Content is versioned and retired gracefully.

---

## 2. Content Lifecycle Phases

### 2.1 Creation

**Process:**
1. **Initiation:** Content is generated via pipeline orchestrators (`pipeline-generator` skill) or manual entry via GitHub Issues/PR.
2. **Generation:** Specialist agents (question-expert, flashcard-expert, etc.) generate content according to `CONTENT_STANDARDS.md`.
3. **Initial Validation:** Content is validated against schema and type-specific rules (pipeline-verifier).
4. **Storage:** Validated content is saved to DB via `save-content.mjs` with status `pending` or `draft`.

**Tooling References:**
- `node script/pipeline/generator-coordinator.js` – parallel content generation
- `node script/pipeline/verifier-coordinator.js` – validation
- `node script/pipeline/processor-coordinator.js` – persistence
- `/home/runner/workspace/content-gen/save-content.mjs` – DB save helper

### 2.2 Review & Deduplication

**Process:**
1. **Automated Validation:** Batch validation via `pipeline-verifier` ensures schema compliance, word counts, syntax, and difficulty taxonomy.
2. **Deduplication Check:** Vector similarity search (Qdrant) and duplicate detection scripts compare new content against existing DB.
3. **Quality Scoring:** Content scored 0-100; scores <70 rejected, 70-89 flagged for manual review, ≥90 pass.
4. **Manual Review (Optional):** For flagged items, human reviewer inspects via GitHub PR review or admin dashboard.

**Dedup Validation Steps:**
1. Compute embeddings for new content via vector DB client.
2. Query existing embeddings for similarity > 0.85 (configurable).
3. If duplicate found, mark as `duplicate` and log to duplicate report.
4. If near-duplicate, flag for manual merge/rejection.

**Tooling References:**
- `node script/check-duplicates.js` – duplicate detection
- `node script/sync-vector-db.js` – vector DB sync
- `node script/batch-validation-utility.js` – batch validation
- `node script/vector-db-cli.js` – vector DB CLI

### 2.3 Publication

**Process:**
1. **Approval:** Content with status `pending` and quality score ≥90 is approved for publication.
2. **Processing:** `pipeline-processor` applies final formatting, SM-2 initialization (flashcards), vector indexing, and metadata enrichment.
3. **Export:** `node script/fetch-questions-for-build.js` exports DB to static JSON files (`public/data/*.json`).
4. **Build & Deploy:** `npm run build:static` builds SPA; `tsx script/deploy-pages.ts` deploys to GitHub Pages.
5. **Cache Invalidation:** CDN cache busted; search indexes rebuilt.

**Tooling References:**
- `node script/fetch-questions-for-build.js` – DB → JSON export
- `node script/generate-curated-paths.js` – learning paths export
- `node script/build-pagefind.js` – search index
- `npm run build:static` – full static build
- `tsx script/deploy-pages.ts` – deploy to gh-pages

### 2.4 Retirement & Archival

**Process:**
1. **Deprecation:** Content flagged as `deprecated` via DB update (soft delete).
2. **Archival:** Deprecated content moved to `archive` table with timestamp and reason.
3. **Versioning:** Content version incremented; previous version retained for rollback.
4. **Cleanup:** Expired flashcards (SM-2 interval > 365 days) auto-archived.
5. **Removal:** Content removed from public exports on next build.

**Tooling References:**
- DB migration scripts for archival tables.
- `node script/cleanup-expired-content.js` – automated cleanup.
- Git tags for version snapshots.

---

## 3. Governance Checklist

### 3.1 Pre‑Creation
- [ ] Content type and channel identified.
- [ ] Difficulty taxonomy correct (Tech: beginner/intermediate/advanced; Cert: easy/medium/hard; Coding: easy/medium/hard).
- [ ] Generation parameters (channel, difficulty, count) specified.

### 3.2 Post‑Generation (Automated)
- [ ] Schema validation passed (all required fields present).
- [ ] Word/line counts within limits (per CONTENT_STANDARDS.md).
- [ ] Syntax validation passed (code examples).
- [ ] Difficulty matches channel taxonomy.
- [ ] Quality score ≥70.

### 3.3 Deduplication
- [ ] Vector similarity check (<0.85 similarity to existing content).
- [ ] No exact duplicates (text hash comparison).
- [ ] Near-duplicates flagged for manual review.

### 3.4 Publication Approval
- [ ] Quality score ≥90.
- [ ] Status changed from `pending` to `approved`.
- [ ] No blocking validation issues.

### 3.5 Post‑Publication
- [ ] Content exported to static JSON.
- [ ] Vector index updated.
- [ ] Cache invalidated.
- [ ] Monitoring alerts configured (error tracking).

### 3.6 Retirement
- [ ] Deprecation reason documented.
- [ ] Archived with version tag.
- [ ] Removed from public exports.
- [ ] Dependent learning paths updated.

---

## 4. Roles & Responsibilities

| Role | Responsibilities |
|------|------------------|
| **Content Generator** | Generate content via pipelines; ensure compliance with standards. |
| **Validator** | Run validation scripts; triage quality scores. |
| **Dedup Auditor** | Monitor duplicate detection; merge/reject duplicates. |
| **Publisher** | Approve content; trigger build/deploy; monitor deployment. |
| **Archivist** | Retire/deprecate content; maintain archival integrity. |

---

## 5. Quality Metrics & Monitoring

| Metric | Target | Monitoring Tool |
|--------|--------|----------------|
| Content Quality Score | ≥90 | `pipeline-verifier` |
| Duplicate Rate | <1% | `check-duplicates.js` |
| Publication Lead Time | <24 hours | Pipeline logs |
| Retirement Cycle Time | <48 hours | DB timestamps |
| Export Freshness | <1 hour before deploy | `fetch-questions-for-build.js` logs |

---

## 6. Tooling Summary

| Tool | Purpose | Command Example |
|------|---------|-----------------|
| `pipeline-generator` | Parallel content generation | `node script/pipeline/generator-coordinator.js --all` |
| `pipeline-verifier` | Validation & scoring | `node script/pipeline/verifier-coordinator.js --status=pending` |
| `pipeline-processor` | Post-processing & save | `node script/pipeline/processor-coordinator.js --status=validated` |
| `save-content.mjs` | DB save helper | `node content-gen/save-content.mjs --type=question --channel=react` |
| `check-duplicates.js` | Duplicate detection | `node script/check-duplicates.js --threshold=0.85` |
| `vector-db-cli.js` | Vector DB management | `node script/vector-db-cli.js query --embedding="..."` |
| `fetch-questions-for-build.js` | Export DB to JSON | `node script/fetch-questions-for-build.js` |
| `build-pagefind.js` | Search index | `node script/build-pagefind.js` |
| `deploy-pages.ts` | Deploy to GitHub Pages | `tsx script/deploy-pages.ts` |

---

## 7. Appendices

### A. Content Type Specific Rules

Refer to `CONTENT_STANDARDS.md` §3 for detailed specifications per content type.

### B. Pipeline Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Generator  │ →  │  Verifier   │ →  │  Processor  │ →  │  Publisher  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
   (create)          (validate)         (persist)          (export)
   (dedup)           (score)            (index)           (deploy)
```

### C. Versioning Strategy

- **Major:** Schema changes requiring migration.
- **Minor:** New content types or fields.
- **Patch:** Content updates, bug fixes.

---

**Document Version:** 1.0  
**Last Updated:** 2026‑04‑01  
**Owner:** DevPrep Content Team