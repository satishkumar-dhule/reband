# DevPrep Content Standards

## 1. Overview

This document defines quality rules for all content types in the DevPrep platform. All content generation agents MUST read and comply with these standards.

## 2. Difficulty Taxonomy

### Tech Channels (Q&A, Flashcards, Voice)
Use `DifficultyTech`: `beginner` | `intermediate` | `advanced`

**Tech Channels**: javascript, react, algorithms, devops, networking, system-design

### Certification Channels (Exam Questions, Flashcards)
Use `DifficultyExam`: `easy` | `medium` | `hard`

**Cert Channels**: aws-saa, aws-dev, cka, terraform

### Coding Challenges (ALL channels)
Use: `easy` | `medium` | `hard` (never beginner/intermediate/advanced)

## 3. Content Type Specifications

### 3.1 Q&A Questions (channel_id: questions)

| Property | Rule |
|----------|------|
| `short` | 80–250 words |
| `answer` | Detailed explanation, 150–400 words |
| `difficulty` | beginner/intermediate/advanced (tech), easy/medium/hard (cert) |
| `channel_id` | Any tech or cert channel |
| `follow_up` | Optional follow-up questions |

### 3.2 Flashcards (channel_id: flashcards)

| Property | Rule |
|----------|------|
| `front` | ≤ 15 words |
| `back` | 40–120 words |
| `difficulty` | Matches channel taxonomy |
| `sm2_interval` | Initialize to 1 |
| `sm2_efactor` | Initialize to 2.5 |

### 3.3 Coding Challenges (channel_id: coding_challenges)

| Property | Rule |
|----------|------|
| `difficulty` | easy/medium/hard only |
| `solution` | Full working solution |
| `hints` | Array of progressive hints |
| `test_cases` | At least 3 test cases |
| `languages` | js, ts, python minimum |

### 3.4 Exam Questions (channel_id: exam_questions)

| Property | Rule |
|----------|------|
| `choices` | Exactly 4 choices |
| `correct_index` | 0-3 |
| `explanation` | Detailed why answer is correct |
| `distractors` | Plausible but wrong options |
| `difficulty` | easy/medium/hard |

### 3.5 Voice Practice (channel_id: voice_prompts)

| Property | Rule |
|----------|------|
| `type` | technical, behavioral, scenario, explain |
| `prompt` | Question to answer verbally |
| `key_points` | 3-5 bullet points to cover |
| `time_estimate` | Minutes |

### 3.6 Blog Posts (channel_id: blogs)

| Property | Rule |
|----------|------|
| `title` | SEO-optimized title |
| `content` | 800-2000 words |
| `readability` | Flesch-Kincaid ≤ 10 |
| `keywords` | 3-5 target keywords |

### 3.7 Study Guides (channel_id: study_guides)

| Property | Rule |
|----------|------|
| `format` | PDF |
| `content` | Comprehensive coverage |
| `pages` | 5-20 pages |

### 3.8 Presentations (channel_id: presentations)

| Property | Rule |
|----------|------|
| `format` | PPTX |
| `slides` | 10-30 slides |
| `content` | Visual learning aid |

## 4. Quality Gates

Before saving to DB:
- [ ] Word counts within limits
- [ ] Difficulty values match channel taxonomy
- [ ] No hardcoded content in React (must be DB-sourced)
- [ ] Code syntax valid for all language solutions
- [ ] All required fields present

## 5. Coverage Targets

### Tech Channels
| Content Type | Minimum |
|--------------|---------|
| Q&A Questions | ≥ 20 |
| Flashcards | ≥ 25 |
| Coding Challenges | ≥ 8 |
| Voice Prompts | ≥ 8 |
| Blog Posts | ≥ 2 |
| Study Guides | ≥ 1 |
| Presentations | ≥ 1 |

### Cert Channels
| Content Type | Minimum |
|--------------|---------|
| Q&A Questions | ≥ 20 |
| Flashcards | ≥ 30 |
| Exam Questions | ≥ 30 |
| Voice Prompts | ≥ 6 |
| Blog Posts | ≥ 2 |
| Study Guides | ≥ 1 |
| Presentations | ≥ 1 |

## 6. Save Helper

All content saved via:
```
/home/runner/workspace/content-gen/save-content.mjs
```

Database: `/home/runner/workspace/data/devprep.db`

---

## 7. Content Lifecycle (from CONTENT_LIFECYCLE_SOP.md)

### 7.1 Lifecycle Phases

| Phase | Description |
|-------|-------------|
| Creation | Generated via pipeline; stored with `pending` status |
| Review | Validated; scored 0-100; duplicates checked via Qdrant |
| Publication | Approved if score ≥90; exported to static JSON |
| Retirement | Soft delete; archived with version tag |

### 7.2 Pipeline Architecture

```
Generator → Verifier → Processor → Publisher
   │           │           │           │
(create)   (validate)  (persist)   (export)
```

### 7.3 Key Commands

| Command | Purpose |
|---------|---------|
| `node script/pipeline/generator-coordinator.js` | Parallel content generation |
| `node script/pipeline/verifier-coordinator.js` | Validation & scoring |
| `node script/pipeline/processor-coordinator.js` | Persistence |
| `node script/check-duplicates.js` | Duplicate detection |
| `node script/fetch-questions-for-build.js` | Export DB to JSON |

### 7.4 Governance Checklist

**Pre-Creation:**
- [ ] Content type and channel identified
- [ ] Difficulty taxonomy correct

**Post-Generation:**
- [ ] Schema validation passed
- [ ] Word counts within limits
- [ ] Quality score ≥70

**Deduplication:**
- [ ] Vector similarity <0.85
- [ ] No exact duplicates

**Publication:**
- [ ] Quality score ≥90
- [ ] Status `approved`

### 7.5 Quality Metrics

| Metric | Target |
|--------|--------|
| Content Quality Score | ≥90 |
| Duplicate Rate | <1% |
| Publication Lead Time | <24h |