# GitHub Issues for Breaking Pages

Created issues for the following pages that are breaking:

## Critical Issues (P0)

### 1. Static Build Missing Data Files
**Title**: `[BUG] Static Build: Missing public/data/ directory with required JSON files`

**Priority**: P0 - Critical

**Summary**: The static build process does not generate the required `public/data/` directory with JSON data files needed for the SPA to function.

**Missing Files**:
| File | Used By |
|------|---------|
| `public/data/channels.json` | Home, AllChannels, Stats |
| `public/data/channel-{id}.json` | QuestionViewer |
| `public/data/certifications.json` | Certifications, LearningPaths |
| `public/data/flashcards/{channelId}.json` | QuestionViewer (flashcards tab) |

---

### 2. Home Page - Channels Fail to Load
**Title**: `[BUG] Home Page: Fails to load channels - missing static data files`

**Priority**: P0 - Critical

**Summary**: The Home page fails to load and display channels because it relies on `/data/channels.json` which does not exist.

**File**: `client/src/pages/Home.tsx:40-48`

```typescript
queryFn: async () => {
  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/';
  const response = await fetch(`${basePath}data/channels.json`);
  if (!response.ok) throw new Error(`Failed to fetch channels: ${response.status}`);
  ...
}
```

---

### 3. AllChannels Page - Channel Data Fails to Load
**Title**: `[BUG] AllChannels Page: Fails to load channel data and stats`

**Priority**: P0 - Critical

**Summary**: The AllChannels page (Topics browser) fails to display channels properly because it relies on static data files and hooks that don't have data.

**File**: `client/src/pages/AllChannels.tsx:77`

```typescript
const { stats, loading, error } = useChannelStats();
```

---

## High Priority Issues (P1)

### 4. QuestionViewer - API Call Fails in Static Mode
**Title**: `[BUG] QuestionViewer Page: API call to /api/flashcards fails in static mode`

**Priority**: P1 - High

**Summary**: The QuestionViewer page makes an API call to `/api/flashcards/${channelId}` that fails in production static mode (GitHub Pages).

**File**: `client/src/pages/QuestionViewer.tsx:268-280`

```typescript
fetch(`/api/flashcards/${channelId}`)
  .then(res => {
    if (!res.ok) throw new Error('No flashcards');
    return res.json();
  })
```

---

### 5. Certifications Page - Missing Data
**Title**: `[BUG] Certifications Page: Missing static data - certifications.json not generated`

**Priority**: P1 - High

**Summary**: The Certifications page fails to load because it fetches from `/data/certifications.json` which doesn't exist.

**File**: `client/src/pages/Certifications.tsx:77`

```typescript
const response = await fetch(`${basePath}data/certifications.json`);
```

---

## Medium Priority Issues (P2)

### 6. LearningPaths Page - Multiple Issues
**Title**: `[BUG] LearningPaths Page: certifications.json missing + modal accessibility issues`

**Priority**: P2 - Medium

**Summary**: The Learning Paths page has two issues:
1. Fails to load certifications data
2. Custom path modal has accessibility issues

**Files**: 
- `client/src/pages/LearningPaths.tsx:55-56` (missing data)
- `client/src/pages/LearningPaths.tsx:331-340` (accessibility)

---

### 7. Stats Page - Hooks Not Implemented Properly
**Title**: `[BUG] Stats Page: useGlobalStats and useChannelStats hooks missing implementation`

**Priority**: P2 - Medium

**Summary**: The Stats page relies on hooks (`useGlobalStats`, `useChannelStats`) that may not properly load data in static mode.

**Files**:
- `client/src/pages/Stats.tsx:122-126`
- `client/src/hooks/use-stats.ts`
- `client/src/hooks/use-progress.ts`

---

### 8. VoicePractice Page - Questions Fail to Load
**Title**: `[BUG] VoicePractice Page: loadChannelQuestions fails silently in static mode`

**Priority**: P2 - Medium

**Summary**: The Voice Practice page loads questions using `loadChannelQuestions()` which fetches from static JSON files that may not exist.

**File**: `client/src/pages/VoicePractice.tsx:114-117`

---

## Low Priority Issues (P3)

### 9. Profile Page - Inefficient localStorage Scanning
**Title**: `[BUG] Profile Page: localStorage progress scanning is inefficient`

**Priority**: P3 - Low

**Summary**: The Profile page uses an inefficient approach to scan localStorage for progress data, causing potential performance issues.

**File**: `client/src/pages/Profile.tsx:32-46`

---

## Summary

| # | Page | Priority | Issue |
|---|------|----------|-------|
| 1 | Static Build | P0 | Missing data directory |
| 2 | Home | P0 | channels.json missing |
| 3 | AllChannels | P0 | Stats hook fails |
| 4 | QuestionViewer | P1 | API call fails |
| 5 | Certifications | P1 | certifications.json missing |
| 6 | LearningPaths | P2 | Data + accessibility |
| 7 | Stats | P2 | Hooks incomplete |
| 8 | VoicePractice | P2 | Questions don't load |
| 9 | Profile | P3 | Performance issue |

## Root Cause
The application follows a "static-first" architecture where:
1. **Build time**: Database → static JSON files in `public/data/`
2. **Runtime**: SPA fetches static JSON via `fetch()`

However, the `public/data/` directory with required JSON files is **not generated** during the build process.

## Suggested Fix
1. Ensure `script/fetch-questions-for-build.js` runs during CI/CD
2. Verify all required JSON files are generated
3. Add validation to check required files exist after build
4. Add error boundaries with retry functionality for static data fetches
