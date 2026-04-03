# Open-Interview — Agent Task Instructions

> **For opencode-ai agents only.**  
> Every section below maps to one GitHub Project item.  
> Agents must not change unrelated files. Each task is self-contained.  
> Stack: React 19 + Vite 7 (client) · Express + libSQL (server) · TanStack Query v5 · wouter v3 · Tailwind CSS 4 · shadcn/ui

---

## Ground Rules for All Agents

1. **No default React import.** Never write `import React from 'react'`. Use named imports only (`import { useState } from 'react'`). The Vite JSX transform injects React automatically; duplicate imports cause hook errors.
2. **Use TanStack Query v5 object-form only.** `useQuery({ queryKey: [...], ... })` not `useQuery([...], fn)`.
3. **Invalidate cache after mutations.** Always call `queryClient.invalidateQueries({ queryKey: [...] })` in `onSuccess`.
4. **No `window.location.reload()`.** Replace with local state updates or `queryClient.invalidateQueries`.
5. **No inline `fetch` in `useEffect` for server data.** Use `useQuery` with the shared `queryClient`.
6. **Skeleton screens required.** Every async data section must show a skeleton (`client/src/components/skeletons/PageSkeletons.tsx`) while loading.
7. **Heavy libraries must be lazy-imported.** `SyntaxHighlighter`, `ReactMarkdown`, `EnhancedMermaid`, `framer-motion` (in non-critical paths) must use `React.lazy` + dynamic `import()`.
8. **`useMemo` / `useCallback` for expensive derivations.** Any calculation that iterates arrays or parses localStorage must be wrapped in `useMemo`.

---

## TASK-001 · Home Page — Data Fetching Rearchitecture

**File:** `client/src/pages/Home.tsx`  
**Priority:** P0 (most visited page)

### Problem
The Home page fetches `data/channels.json` via a raw `fetch` inside `useEffect`, completely bypassing TanStack Query. This means:
- No cache — every page visit re-downloads the file
- No `staleTime` — data is never marked fresh
- No skeleton shown while loading — users see empty cards

### What the Agent Must Do

1. **Remove the custom `useApiChannels` hook call** (or the inline `useEffect` fetch) and replace it with:
   ```ts
   const { data: channels, isLoading } = useQuery({
     queryKey: ['/data/channels.json'],
     staleTime: Infinity,
   });
   ```
2. **Wrap the channels grid in a skeleton** while `isLoading` is true. Use `<ChannelsSkeleton />` from `client/src/components/skeletons/PageSkeletons.tsx`.
3. **Memoize the stat calculations** (`totalQuestions`, `completedChannels`, `streak`) that read from `localStorage`. Wrap them in `useMemo` with `[channels]` as dependency.
4. **Move `ContributionGrid`** into its own `React.lazy`-loaded component so it does not block the initial paint of the dashboard header.
5. **Ensure credits balance** rendered in the hero section does not cause a re-render of the entire page — move the `useCredits()` call into a small isolated `<CreditsChip />` sub-component.

### Acceptance Criteria
- `npx tsc --noEmit` passes
- No `fetch` inside `useEffect` for channels data
- Skeleton displayed on first load (before cache is warm)
- Lighthouse performance score does not regress

---

## TASK-002 · QuestionViewer — Effect Cleanup & Bundle Split

**File:** `client/src/pages/QuestionViewer.tsx`  
**Priority:** P0 (core interaction page)

### Problem
- 6+ `useEffect` hooks create cascading re-renders when filter state changes (channel → sub-topic → difficulty → company all trigger separate effects)
- `GenZAnswerPanel`, `FlashcardsTab`, `SRSReviewButtons` are eagerly imported — they load even when the user has never opened the Flashcards tab
- Complex question filtering (sub-topic, difficulty, company) runs unsorted on every render without memoization

### What the Agent Must Do

1. **Consolidate URL-sync effects.** Replace multiple individual `useEffect` hooks that sync filters to URL params with a single effect that reads all filter values at once.
2. **Lazy-load the Flashcards tab content.**
   ```tsx
   const FlashcardsTab = lazy(() => import('@/components/FlashcardsTab'));
   ```
   Wrap in `<Suspense fallback={<ReviewSkeleton />}>` inside the tab panel.
3. **Lazy-load `GenZAnswerPanel`** with the same pattern; show `<QuestionViewerSkeleton />` while loading.
4. **Memoize the filtered question list.**
   ```ts
   const filteredQuestions = useMemo(() =>
     allQuestions.filter(q =>
       (!subTopic || q.subTopic === subTopic) &&
       (!difficulty || q.difficulty === difficulty) &&
       (!company || q.companies?.includes(company))
     ),
   [allQuestions, subTopic, difficulty, company]);
   ```
5. **Remove the `channel` object re-derivation** on every render — call `useMemo` to look up the channel from the channels array once.

### Acceptance Criteria
- Tab switching to Flashcards loads lazily (visible in Network panel: `FlashcardsTab` chunk loads on first tab click)
- Filter changes do not cause full component remount
- `npx tsc --noEmit` passes

---

## TASK-003 · ReviewSession — Waterfall Fix & Heavy Library Lazy-Loading

**File:** `client/src/pages/ReviewSession.tsx`  
**Priority:** P1

### Problem
1. **Sequential fetch waterfall** — questions are resolved in a `for...of` loop with `await` inside, creating N serial network requests instead of one parallel batch.
2. **`SyntaxHighlighter` and `ReactMarkdown`** are top-level imports. They add ~150KB to the initial JS bundle even when the user has not yet revealed an answer.
3. **`EnhancedMermaid`** is also eagerly imported and parsed on mount.

### What the Agent Must Do

1. **Replace the `for...of await` loop** with `Promise.all`:
   ```ts
   const questions = await Promise.all(
     srsCards.map(card => getQuestionByIdAsync(card.questionId))
   );
   ```
2. **Lazy-load `SyntaxHighlighter`:**
   ```tsx
   const SyntaxHighlighter = lazy(() =>
     import('react-syntax-highlighter').then(m => ({ default: m.Prism }))
   );
   ```
3. **Lazy-load `ReactMarkdown`:**
   ```tsx
   const ReactMarkdown = lazy(() => import('react-markdown'));
   ```
4. **Lazy-load `EnhancedMermaid`:**
   ```tsx
   const EnhancedMermaid = lazy(() => import('@/components/EnhancedMermaid'));
   ```
5. Wrap all lazy components in `<Suspense fallback={<div className="h-24 animate-pulse rounded-md bg-muted" />}>`.

### Acceptance Criteria
- Network waterfall eliminated — all question fetches fire in parallel
- `SyntaxHighlighter`, `ReactMarkdown`, `EnhancedMermaid` are absent from the initial JS bundle (verify in Vite build output / `rollup-plugin-visualizer`)
- `npx tsc --noEmit` passes

---

## TASK-004 · VoiceSession — Parallel Load & Skeleton

**File:** `client/src/pages/VoiceSession.tsx`  
**Priority:** P1

### Problem
- All channel questions are loaded via `Promise.all` but the individual `loadChannelQuestions` calls are composed serially inside a `.reduce` or loop pattern — verify and flatten to true parallel.
- The entire page shows a `<Loader2>` spinner instead of a skeleton that reflects the session card layout.
- `SpeechRecognition` instance is not explicitly stopped on component unmount, risking memory leaks during rapid navigation.

### What the Agent Must Do

1. **Verify parallel loading.** Ensure `loadChannelQuestions` for all subscribed channels fires in a single `Promise.all([channel1, channel2, ...])` — not chained `.then`.
2. **Replace `<Loader2>` spinner** with `<VoiceSkeleton />` from `client/src/components/skeletons/PageSkeletons.tsx`.
3. **Add cleanup for SpeechRecognition:**
   ```ts
   useEffect(() => {
     return () => {
       if (recognitionRef.current) {
         recognitionRef.current.stop();
         recognitionRef.current = null;
       }
     };
   }, []);
   ```
4. **Debounce transcript state updates.** If transcript `setState` fires on every `onresult` event, batch updates using a ref accumulator and flush on `onend`.

### Acceptance Criteria
- No memory leak in React DevTools after navigating away from VoiceSession
- Skeleton matches the card layout visible in the finished page
- `npx tsc --noEmit` passes

---

## TASK-005 · AllChannels — Search Debounce & Progress Integration

**File:** `client/src/pages/AllChannels.tsx`  
**Priority:** P1

### Problem
- `filteredChannels` is recomputed on every keystroke because the filter runs synchronously in render.
- `progress` is hardcoded to `0` for every channel — the `useProgress` hook is not wired up.
- Channel stats (`useChannelStats`) are fetched but the loading state has no skeleton.

### What the Agent Must Do

1. **Debounce the search input** by storing the raw input value in local state and deriving a debounced value with a 150ms delay:
   ```ts
   const [rawSearch, setRawSearch] = useState('');
   const debouncedSearch = useDebounce(rawSearch, 150); // use existing hook or lodash.debounce
   const filteredChannels = useMemo(() =>
     channels.filter(c => c.name.toLowerCase().includes(debouncedSearch.toLowerCase())),
   [channels, debouncedSearch]);
   ```
2. **Wire `useProgress`** to compute per-channel completion percentage and pass it to each channel card.
3. **Add `<ChannelsSkeleton />`** while `channelStats` is loading.
4. **Memoize the category grouping** — the channel list grouped by category should be a `useMemo` so category headers don't re-render on search input change.

### Acceptance Criteria
- Typing in the search box does not cause visible lag (debounce verified in React DevTools profiler)
- Each channel card shows a real progress percentage
- `npx tsc --noEmit` passes

---

## TASK-006 · Stats Page — localStorage Optimisation & Skeleton

**File:** `client/src/pages/Stats.tsx`  
**Priority:** P1

### Problem
- `moduleProgress` calls a `useMemo` but the inner loop iterates ALL localStorage keys for EVERY channel on every re-render.
- The channel breakdown table renders empty rows until `channelStats` loads — no skeleton.
- `useGlobalStats` and `useChannelStats` results are shown simultaneously but fetched independently — the page jumps layout when the second one arrives.

### What the Agent Must Do

1. **Cache the localStorage scan** outside the render cycle. Extract a `readLocalStorageProgress()` utility function that runs once on page load and stores results in a module-level `Map`. Re-read only when a storage event fires.
2. **Add a skeleton for the stats table** — a fixed number of `<tr>` rows with pulsing `<td>` cells while `channelStats.isLoading` is true.
3. **Show total stats header only after both queries resolve** — use a combined `isLoading` flag:
   ```ts
   const isLoading = globalStats.isLoading || channelStats.isLoading;
   ```
   Show `<StatsSkeleton />` until `isLoading` is false.

### Acceptance Criteria
- localStorage is never iterated more than once per page visit
- No layout shift after initial paint
- `npx tsc --noEmit` passes

---

## TASK-007 · Profile Page — LocalStorage Loop Elimination & Memoization

**File:** `client/src/pages/Profile.tsx`  
**Priority:** P2

### Problem
- On mount, the component loops through the **entire** `localStorage` (line ~48) to find `progress-*` keys. This is an $O(N)$ blocking main-thread operation.
- `achievedCount` is recalculated on every render.
- Preference toggles (`Switch` components) call `setState` on the parent, triggering a full Profile re-render including the localStorage scan.

### What the Agent Must Do

1. **Replace the full localStorage loop** with a targeted approach. Store progress under a single known key (e.g., `allProgress` as a JSON object) and read it with one `getItem` call. If the existing data format cannot change, build an index key (`progress-index`) that stores a comma-separated list of channel IDs.
2. **Move preference toggles** into an isolated `<PreferencesPanel />` sub-component so their state changes don't re-render the achievements section.
3. **Memoize `achievedCount`:**
   ```ts
   const achievedCount = useMemo(
     () => achievements.filter(a => a.unlocked).length,
     [achievements]
   );
   ```

### Acceptance Criteria
- Only one `localStorage.getItem` call on mount (verifiable in browser Performance panel)
- Toggling a preference switch does not cause the achievements list to re-render (verifiable in React DevTools Profiler)
- `npx tsc --noEmit` passes

---

## TASK-008 · CertificationExam — State Isolation & Sync Perf

**File:** `client/src/pages/CertificationExam.tsx`  
**Priority:** P2

### Problem
- All exam state (answers map, flagged set, timer, mode) lives in a single component, so every answer selection re-renders the full exam UI including the question list sidebar.
- `generatePracticeSession` runs synchronously on mount — if the question pool grows it will block the main thread.

### What the Agent Must Do

1. **Split the component into three isolated sub-components:**
   - `<ExamSidebar>` — question list + navigation. Receives the answers map and flagged set as props. Memoize with `React.memo`.
   - `<ExamQuestion>` — current question + answer options. Receives current question index and answer state.
   - `<ExamTimer>` — standalone timer that only re-renders itself every second.
2. **Run `generatePracticeSession` asynchronously** by wrapping it in `setTimeout(fn, 0)` or moving it to a `useEffect` with a loading state so it doesn't block the first paint.
3. **Use `useReducer`** instead of multiple `useState` calls for the combined exam state (answers, flagged, currentIndex) to batch updates.

### Acceptance Criteria
- Selecting an answer does not re-render `<ExamSidebar>` (verifiable in React DevTools Profiler with highlight updates)
- Timer updates do not re-render question content
- `npx tsc --noEmit` passes

---

## TASK-009 · LearningPaths & MyPath — Deduplication & Navigation Fix

**Files:** `client/src/pages/LearningPaths.tsx`, `client/src/pages/MyPath.tsx`  
**Priority:** P2

### Problem
- `curatedPaths` data is defined separately in both files — two sources of truth.
- `MyPath.tsx` calls `window.location.reload()` after activating a path, causing a full page reload and losing React state.

### What the Agent Must Do

1. **Extract `curatedPaths`** into a shared constant file `client/src/lib/learning-paths-data.ts` and import it in both pages.
2. **Replace `window.location.reload()`** in `MyPath.tsx` with:
   ```ts
   queryClient.invalidateQueries({ queryKey: ['/api/learning-paths'] });
   setActivePath(newPath); // local state update
   ```
3. **Add `<GenericPageSkeleton />`** while learning path data loads.

### Acceptance Criteria
- `curatedPaths` exists in exactly one file
- No `window.location.reload()` in the codebase (use `grep -r "location.reload" client/src/pages/` to verify)
- `npx tsc --noEmit` passes

---

## TASK-010 · CodingChallenge — Monaco Lazy Load & Test Runner Isolation

**File:** `client/src/pages/CodingChallenge.tsx`  
**Priority:** P1

### Problem
- Monaco Editor (`@monaco-editor/react`) is one of the heaviest JS packages (~2MB unzipped). It is likely imported at the top of the file as a regular import.
- The test runner output panel re-renders the entire challenge view whenever tests run.

### What the Agent Must Do

1. **Lazy-load Monaco Editor:**
   ```tsx
   const MonacoEditor = lazy(() => import('@monaco-editor/react'));
   ```
   Wrap with `<Suspense fallback={<CodingSkeleton />}>`.
2. **Isolate the test output panel** into a `<TestOutputPanel results={testResults} />` component wrapped in `React.memo` so it only re-renders when `testResults` changes.
3. **Pre-warm Monaco during idle time.** In `client/src/lib/queryClient.ts` (in the existing `prefetchCriticalRoutes` function), add:
   ```ts
   if (typeof requestIdleCallback !== 'undefined') {
     requestIdleCallback(() => import('@monaco-editor/react'), { timeout: 3000 });
   }
   ```

### Acceptance Criteria
- Monaco is absent from the initial JS bundle
- Monaco chunk loads only when the user navigates to a coding challenge
- Test result updates do not re-render the challenge description panel
- `npx tsc --noEmit` passes

---

## TASK-011 · Bookmarks Page — React Query Migration

**File:** `client/src/pages/Bookmarks.tsx`  
**Priority:** P2

### Problem
- Bookmarks are likely read from localStorage in a `useEffect` with no caching.
- Deleting a bookmark triggers a full re-render of the list.

### What the Agent Must Do

1. **Treat bookmarks as a query:**
   ```ts
   const { data: bookmarks } = useQuery({
     queryKey: ['bookmarks'],
     queryFn: () => JSON.parse(localStorage.getItem('bookmarks') ?? '[]'),
     staleTime: Infinity,
   });
   ```
2. **Treat delete as a mutation:**
   ```ts
   const deleteBookmark = useMutation({
     mutationFn: (id: string) => {
       const updated = bookmarks.filter(b => b.id !== id);
       localStorage.setItem('bookmarks', JSON.stringify(updated));
       return updated;
     },
     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
   });
   ```
3. **Add `<GenericPageSkeleton />`** as the Suspense fallback.

### Acceptance Criteria
- Removing a bookmark invalidates the cache and updates the list without a full re-render
- `npx tsc --noEmit` passes

---

## TASK-012 · Badges / Achievements Page — Memoization & Skeleton

**File:** `client/src/pages/Badges.tsx`  
**Priority:** P3

### Problem
- Badge unlock criteria are likely recomputed on every render by iterating progress data.
- No skeleton shown while progress data is loading.

### What the Agent Must Do

1. **Memoize badge evaluation:**
   ```ts
   const evaluatedBadges = useMemo(() =>
     allBadges.map(badge => ({
       ...badge,
       unlocked: badge.criteria(progress),
     })),
   [allBadges, progress]);
   ```
2. **Add `<GenericPageSkeleton />`** as loading state.
3. **Memoize the category filter** — grouping badges by category should be a `useMemo`.

### Acceptance Criteria
- Badge evaluation runs only when `progress` changes (verifiable in React DevTools Profiler)
- `npx tsc --noEmit` passes

---

## TASK-013 · UnifiedNav / AppLayout — Animation Overhead & Bundle

**Files:** `client/src/components/layout/UnifiedNav.tsx`, `client/src/components/layout/AppLayout.tsx`  
**Priority:** P1

### Problem
- `UnifiedNav.tsx` imports all of `framer-motion` for mobile sub-menu animations — this adds ~60KB even on desktop where animations are never used.
- The mobile "Active Indicator" position is calculated via inline JavaScript on every render rather than using CSS custom properties.
- `AppLayout.tsx` contains a duplicate `NavItem` / `SidebarNav` implementation that is redundant with `UnifiedNav.tsx`.

### What the Agent Must Do

1. **Tree-shake framer-motion.** Replace `import { motion, AnimatePresence } from 'framer-motion'` with:
   ```ts
   const { motion, AnimatePresence } = await import('framer-motion');
   ```
   Or use a dynamic lazy component wrapper so framer-motion loads only on mobile/when the menu opens.
2. **Replace the JS-calculated active indicator** with a CSS `transform: translateX(var(--active-x))` approach — set `--active-x` via a style attribute instead of recalculating layout in JS on every render.
3. **Remove the duplicate `SidebarNav` / `NavItem` in `AppLayout.tsx`** — these should delegate entirely to the components in `UnifiedNav.tsx`.

### Acceptance Criteria
- `framer-motion` is absent from the initial desktop JS bundle
- The active indicator uses CSS transforms (verify: no `getBoundingClientRect` calls in the component's render path)
- `npx tsc --noEmit` passes

---

## TASK-014 · Server Routes — In-Memory Cache for Questions API

**File:** `server/routes.ts`  
**Priority:** P1

### Problem
- The `/api/questions/:channelId` endpoint queries the database on every request. For a read-heavy platform with static questions, this is unnecessary.
- The existing `setReadCache` helper adds HTTP caching headers, but the server still performs a DB round-trip before responding.

### What the Agent Must Do

1. **Add an in-memory LRU cache** using a `Map` with a TTL:
   ```ts
   const questionCache = new Map<string, { data: unknown; expiresAt: number }>();
   const QUESTION_TTL = 5 * 60 * 1000; // 5 minutes

   function getCachedQuestions(channelId: string) {
     const entry = questionCache.get(channelId);
     if (entry && entry.expiresAt > Date.now()) return entry.data;
     return null;
   }

   function setCachedQuestions(channelId: string, data: unknown) {
     questionCache.set(channelId, { data, expiresAt: Date.now() + QUESTION_TTL });
   }
   ```
2. **Wrap the questions route handler:**
   ```ts
   app.get('/api/questions/:channelId', async (req, res) => {
     const cached = getCachedQuestions(req.params.channelId);
     if (cached) return res.json(cached);
     const data = await db.select()...;
     setCachedQuestions(req.params.channelId, data);
     setReadCache(res, 120);
     res.json(data);
   });
   ```
3. **Apply the same pattern** to `/api/flashcards/:channelId`, `/api/certifications/:certId/questions`, and `/api/coding/challenges`.

### Acceptance Criteria
- Second request for the same channel returns in <5ms (verifiable via `curl -w "%{time_total}"`)
- Cache entries expire after 5 minutes
- `npx tsc --noEmit` passes

---

## TASK-015 · channels-config.ts — Lean Manifest Split

**File:** `client/src/lib/channels-config.ts`  
**Priority:** P2

### Problem
- `channels-config.ts` is 700+ lines and is imported in every component that needs even a single channel name. This bundles the entire config into the initial chunk.
- The sidebar only needs `{ id, name, icon }` — it does not need descriptions, question counts, or sub-topics.

### What the Agent Must Do

1. **Create `client/src/lib/channels-manifest.ts`** — a lean version containing only `{ id, name, icon, category }` for each channel (no descriptions, sub-topics, or question counts).
2. **Update the sidebar and navigation components** to import from `channels-manifest.ts` instead of `channels-config.ts`.
3. **Keep `channels-config.ts`** but add dynamic import in `QuestionViewer.tsx` and other pages that need full detail:
   ```ts
   const { allChannelsConfig } = await import('@/lib/channels-config');
   ```
4. **Verify** that `channels-config.ts` does NOT appear in the initial bundle — check `dist/` chunk sizes after `npm run build`.

### Acceptance Criteria
- Initial JS bundle size decreases by at least 20KB (verifiable via `du -sh dist/assets/*.js`)
- Sidebar renders correctly using the lean manifest
- Full channel config still loads correctly on the QuestionViewer page
- `npx tsc --noEmit` passes

---

## TASK-016 · VoicePractice Page — Skeleton & Speech API Cleanup

**File:** `client/src/pages/VoicePractice.tsx`  
**Priority:** P2

### Problem
- VoicePractice shares many issues with VoiceSession: no skeleton, potential SpeechRecognition leak, full-page spinner.

### What the Agent Must Do

1. **Replace spinner** with `<VoiceSkeleton />`.
2. **Add SpeechRecognition cleanup** on unmount (same pattern as TASK-004).
3. **Memoize the session list** — if sessions are derived from raw data, wrap in `useMemo`.
4. **Add `data-testid` attributes** to all interactive elements (start button, stop button, question navigation).

### Acceptance Criteria
- Skeleton visible during load
- No memory leak in React DevTools
- `npx tsc --noEmit` passes

---

## TASK-017 · WhatsNew / About / Onboarding — Static Page Optimisation

**Files:** `client/src/pages/WhatsNew.tsx`, `client/src/pages/About.tsx`, `client/src/pages/Onboarding.tsx`  
**Priority:** P3

### Problem
- These are largely static pages but may import heavy components (Mermaid, ReactMarkdown, icons) eagerly.
- `Onboarding.tsx` likely has localStorage writes that should be debounced or batched.

### What the Agent Must Do

1. **Audit imports** in all three files. Any import heavier than 10KB (framer-motion, syntax-highlighter, mermaid) must be lazy-loaded.
2. **In `Onboarding.tsx`**, batch all onboarding progress writes into a single `localStorage.setItem` call at the end of each step instead of writing on every state change.
3. **Add `<GenericPageSkeleton />`** as the Suspense fallback for any lazy-loaded section.
4. **Ensure `SEOHead`** is present in all three pages with correct `title` and `description`.

### Acceptance Criteria
- No synchronous localStorage write on every keypress/state change in Onboarding
- `npx tsc --noEmit` passes

---

## TASK-018 · TrainingMode & TestSession — Isolated State & Lazy Content

**Files:** `client/src/pages/TrainingMode.tsx`, `client/src/pages/TestSession.tsx`  
**Priority:** P2

### Problem
- Answer reveal and scoring state likely causes the entire training card to re-render including the question text.
- `SyntaxHighlighter` and `ReactMarkdown` are probably eagerly imported.

### What the Agent Must Do

1. **Lazy-load `SyntaxHighlighter` and `ReactMarkdown`** (same pattern as TASK-003).
2. **Split `<QuestionCard>` into two sub-components:**
   - `<QuestionText>` — memoized, never re-renders once question loads
   - `<AnswerReveal>` — only renders/updates when reveal state changes
3. **Add `data-testid`** to all interactive elements.

### Acceptance Criteria
- `SyntaxHighlighter` absent from initial bundle
- Question text does not flash on answer reveal (verifiable via React DevTools Profiler)
- `npx tsc --noEmit` passes

---

## TASK-019 · Certifications Listing Page — React Query + Skeleton

**File:** `client/src/pages/Certifications.tsx`  
**Priority:** P2

### Problem
- `data/certifications.json` is likely fetched via `fetch` in `useEffect`, not TanStack Query.
- No skeleton during load.

### What the Agent Must Do

1. **Replace `fetch` in `useEffect`** with:
   ```ts
   const { data: certs, isLoading } = useQuery({
     queryKey: ['/data/certifications.json'],
     staleTime: Infinity,
   });
   ```
2. **Show `<CertificationsSkeleton />`** while `isLoading`.
3. **Memoize the category grouping** of certifications.

### Acceptance Criteria
- No raw `fetch` in `useEffect` for certifications data
- Skeleton visible on first load
- `npx tsc --noEmit` passes

---

## TASK-020 · Global — `data-testid` Attribute Audit

**Scope:** All files in `client/src/pages/` and `client/src/components/`  
**Priority:** P3

### Problem
- Interactive elements (buttons, inputs, links, selects) and meaningful display elements (scores, progress bars, status badges) are missing `data-testid` attributes in most pages.
- Without test IDs, automated testing by agents is impossible.

### Convention
- Interactive elements: `{action}-{target}` → `button-submit`, `input-search`, `link-profile`
- Display elements: `{type}-{content}` → `text-score`, `badge-level`, `progress-channel`
- Dynamic lists: `{type}-{description}-{id}` → `card-channel-system-design`, `row-question-42`

### What the Agent Must Do

Audit and add `data-testid` attributes to every interactive and display element in:
- `Home.tsx` — channel cards, quick-action buttons, stat values
- `QuestionViewer.tsx` — filter dropdowns, difficulty selector, question cards, answer reveal button
- `CodingChallenge.tsx` — run button, submit button, language selector, test output
- `ReviewSession.tsx` — show answer button, SRS rating buttons (Again/Hard/Good/Easy)
- `VoiceSession.tsx` — start/stop recording, session card, score display
- `Profile.tsx` — preference toggles, achievement badges
- `Stats.tsx` — stat values, channel completion percentages
- `AllChannels.tsx` — channel cards, search input, category filter

### Acceptance Criteria
- `grep -r "data-testid" client/src/pages/` returns at least 80 unique attributes
- All buttons, inputs, and interactive custom components have `data-testid`

---

## TASK-021 · QueryClient — Prefetch All Static JSON on Idle

**File:** `client/src/lib/queryClient.ts`  
**Priority:** P1

### Problem
- `prefetchCriticalRoutes` already warms the cache for `/channels`, `/voice-interview`, and `/coding` during idle time. But other static files (`/data/certifications.json`, `/data/learning-paths.json`) are not prefetched.
- Monaco Editor is not pre-warmed during idle time.

### What the Agent Must Do

1. **Add to `prefetchCriticalRoutes`:**
   ```ts
   queryClient.prefetchQuery({ queryKey: ['/data/certifications.json'], staleTime: Infinity });
   queryClient.prefetchQuery({ queryKey: ['/data/learning-paths.json'], staleTime: Infinity });
   ```
2. **Pre-warm Monaco during idle:**
   ```ts
   if (typeof requestIdleCallback !== 'undefined') {
     requestIdleCallback(() => import('@monaco-editor/react'), { timeout: 5000 });
   }
   ```
3. **Pre-warm SyntaxHighlighter during idle:**
   ```ts
   requestIdleCallback(() => import('react-syntax-highlighter'), { timeout: 6000 });
   ```

### Acceptance Criteria
- After 6 seconds of idle time, `/data/certifications.json` is present in TanStack Query DevTools cache
- Monaco and SyntaxHighlighter JS chunks are present in the browser's resource cache after idle
- `npx tsc --noEmit` passes

---

## TASK-022 · CertificationPractice & Tests Pages — Skeleton & Query Migration

**Files:** `client/src/pages/CertificationPractice.tsx`, `client/src/pages/Tests.tsx`  
**Priority:** P2

### Problem
- These pages likely fetch data via raw `fetch` in `useEffect`.
- No skeleton during load.

### What the Agent Must Do

1. **Migrate all `fetch` calls in `useEffect`** to `useQuery` with `staleTime: Infinity`.
2. **Add `<CertificationsSkeleton />`** or `<GenericPageSkeleton />` as loading state.
3. **Add `data-testid`** to all interactive elements.

### Acceptance Criteria
- No raw `fetch` in `useEffect`
- Skeleton visible on first load
- `npx tsc --noEmit` passes

---

## Summary — Task Priority Matrix

| Task | Page/Component | Priority | Category |
|------|---------------|----------|----------|
| TASK-001 | Home | P0 | Data fetching |
| TASK-002 | QuestionViewer | P0 | Bundle + effects |
| TASK-003 | ReviewSession | P1 | Bundle + network |
| TASK-004 | VoiceSession | P1 | Memory + skeleton |
| TASK-005 | AllChannels | P1 | Debounce + integration |
| TASK-006 | Stats | P1 | localStorage + skeleton |
| TASK-007 | Profile | P2 | localStorage + memo |
| TASK-008 | CertificationExam | P2 | State isolation |
| TASK-009 | LearningPaths/MyPath | P2 | Dedup + nav fix |
| TASK-010 | CodingChallenge | P1 | Bundle (Monaco) |
| TASK-011 | Bookmarks | P2 | Query migration |
| TASK-012 | Badges | P3 | Memoization |
| TASK-013 | UnifiedNav/AppLayout | P1 | Bundle (framer-motion) |
| TASK-014 | Server Routes | P1 | Server cache |
| TASK-015 | channels-config.ts | P2 | Bundle split |
| TASK-016 | VoicePractice | P2 | Skeleton + cleanup |
| TASK-017 | WhatsNew/About/Onboarding | P3 | Static optimisation |
| TASK-018 | TrainingMode/TestSession | P2 | Bundle + state |
| TASK-019 | Certifications | P2 | Query migration |
| TASK-020 | Global data-testid | P3 | Accessibility/testing |
| TASK-021 | QueryClient prefetch | P1 | Prefetch strategy |
| TASK-022 | CertPractice/Tests | P2 | Query migration |
