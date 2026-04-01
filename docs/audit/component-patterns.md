# DevPrep / Open-Interview Component Patterns Audit

**Date:** April 1, 2026  
**Focus:** React component patterns, hooks usage, context optimization, and render performance  
**Scope:** `client/src/hooks/*`, `client/src/context/*`, `client/src/components/*`  

---

## Executive Summary

This audit analyzed 22 custom hooks, 9 context providers, and 100+ React components across the DevPrep codebase. The codebase demonstrates **strong React fundamentals** with several production-ready patterns. However, there are **specific optimization opportunities** that could improve performance, especially for the static SPA deployment model.

**Overall Assessment:** 7.5/10  
**Critical Issues:** 2  
**Medium Issues:** 5  
**Minor Issues:** 4  

---

## 1. Hook Usage Patterns

### 1.1 Strengths

| Hook | Pattern | Assessment |
|------|---------|------------|
| `use-questions.ts` | **Request deduplication** using `requestIdRef` | ✅ Excellent |
| `use-swipe.ts` | **Transient values in refs** to avoid re-renders | ✅ Excellent |
| `use-debounce.ts` | Proper cleanup with `clearTimeout` | ✅ Good |
| `use-mobile.tsx` | Media query listener with proper cleanup | ✅ Good |
| `use-analytics.ts` | Passive event listeners | ✅ Good |

### 1.2 Issues Found

#### Issue 1: Missing AbortController in useQuestions (MEDIUM)

**File:** `client/src/hooks/use-questions.ts` (lines 78-131)

**Problem:** The main `useQuestions` hook creates a `requestIdRef` for stale request detection but does **not** use `AbortController` for actual request cancellation. When the component unmounts or dependencies change, pending requests continue and may overwrite state.

**Current Code:**
```typescript
const currentRequestId = ++requestIdRef.current;
// ... fetch logic without AbortController
// Cleanup only sets requestId, doesn't cancel the actual request
```

**Impact:** Race conditions can cause flickering and incorrect question display.

**Recommendation:** Add AbortController pattern like `useQuestion` has:
```typescript
const controller = new AbortController();
return () => controller.abort();
```

---

#### Issue 2: useToast Cleanup Pattern (MEDIUM)

**File:** `client/src/hooks/use-toast.ts` (lines 210-228)

**Problem:** Uses an array of listeners with direct splice in cleanup, which is error-prone.

**Current Code:**
```typescript
React.useEffect(() => {
  listeners.push(setState)
  return () => {
    const index = listeners.indexOf(setState)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}, [state]) // ⚠️ state in deps causes new listener every render
```

**Impact:** Can cause memory leaks and incorrect listener removal.

**Recommendation:**
```typescript
// Use a ref to hold the listener to avoid re-registration
const stateRef = React.useRef(memoryState);
const [state, setState] = React.useState(memoryState);

React.useEffect(() => {
  const listener = (newState: State) => {
    stateRef.current = newState;
    setState(newState);
  };
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}, []); // Empty deps - stable listener
```

---

#### Issue 3: Dependency Array Warnings (MINOR)

**Files:** Multiple hooks

**Problem:** Several hooks include `delay` (number) in dependency arrays which is fine, but some include non-primitive objects in deps incorrectly.

**Example from use-toast.ts (line 221):**
```typescript
}, [state]) // State causes new subscription on every state change
```

**Impact:** Performance degradation from unnecessary effect re-runs.

**Recommendation:** Extract stable callbacks or use refs for state.

---

## 2. Custom Hook Extraction Opportunities

### 2.1 Hooks That Could Be Extracted

| Current Location | Logic | Suggested Hook |
|-----------------|-------|----------------|
| `QuestionViewer.tsx` | localStorage reading for progress | `useLocalStorageState` |
| `QuestionViewer.tsx` | Filter computation for questions | `useQuestionFilters` |
| `use-questions.ts` | Seeded random/shuffle logic | `useSeededShuffle` |
| `QuestionViewer.tsx` | Question ID URL parsing | `useQuestionFromUrl` |
| Multiple files | localStorage get/set patterns | `useLocalStorage<T>` (generic) |

### 2.2 Issue: Duplicate Filter Logic (MEDIUM)

**Files:** `use-questions.ts`, `QuestionViewer.tsx`, `ReviewSession.tsx`

**Problem:** Filter logic is duplicated across components:
- Filtering by subChannel, difficulty, company
- Shuffle and prioritize unvisited logic

**Current:** Each component re-implements similar filtering.

**Recommendation:** Create `useQuestionFilters`:
```typescript
export function useQuestionFilters(
  questions: Question[],
  filters: FilterState
) {
  return useMemo(() => {
    return questions.filter(q => {
      if (filters.subChannel !== 'all' && q.subChannel !== filters.subChannel) return false;
      // ... other filters
    });
  }, [questions, filters]);
}
```

---

## 3. Context Optimization

### 3.1 Strengths

| Context | Pattern | Assessment |
|---------|---------|------------|
| `ThemeContext.tsx` | **useMemo for value**, `startTransition` for theme changes | ✅ Excellent |
| `UserPreferencesContext.tsx` | Memoized callbacks, early return for crawlers | ✅ Good |
| `SidebarContext.tsx` | Simple, focused, memoized value | ✅ Good |
| `NotificationsContext.tsx` | Proper useCallback, derived state memoization | ✅ Good |

### 3.2 Context Split Opportunities

#### Issue 4: UserPreferencesContext is Overly Large (MEDIUM)

**File:** `client/src/context/UserPreferencesContext.tsx` (273 lines)

**Problem:** The context provides 25+ values/methods. This causes unnecessary re-renders when any preference changes, as consumers subscribe to the entire context.

**Current:**
```typescript
const value = useMemo(() => ({
  preferences,
  isInitialized,
  setRole,
  subscribeChannel,
  unsubscribeChannel,
  toggleSubscription,
  isSubscribed,      // 🔄 Changes when subscribedChannels changes
  getSubscribedChannels,
  // ... 15+ more
}), [/* 20+ dependencies */]);
```

**Recommendation:** Split into focused contexts:
```typescript
// preferences-context.tsx
const PreferencesContext = createContext<Preferences | null>(null);

// actions-context.tsx  
const PreferencesActionsContext = createContext<{
  setRole: (id: string) => void;
  subscribeChannel: (id: string) => void;
  // ... actions only
} | null>(null);
```

---

#### Issue 5: Context Selector Pattern Not Used (MEDIUM)

**Files:** All context consumers

**Problem:** Components consume entire context and re-render on any change.

**Current in InterviewIntelligence.tsx:**
```typescript
const { loading, cognitiveProfile, ... } = useInterviewIntelligence();
// Re-renders when ANY context value changes
```

**Recommendation:** Implement selector pattern:
```typescript
// In context provider
export function useContextSelector<T, S>(
  Context: ContextType<T>,
  selector: (value: T) => S
): S {
  const context = useContext(Context);
  return useMemo(() => selector(context), [context, selector]);
}

// Usage - only re-renders when cognitiveProfile changes
const cognitiveProfile = useContextSelector(
  InterviewIntelligenceContext,
  c => c.cognitiveProfile
);
```

**Alternative (simpler):** Create focused hooks:
```typescript
export function useCognitiveProfile() {
  return useInterviewIntelligence().cognitiveProfile;
}
```

---

## 4. Render Optimization

### 4.1 Strengths

| Component | Optimization | Assessment |
|-----------|-------------|------------|
| `UnifiedQuestionPanel.tsx` | `React.memo` applied | ✅ Good |
| `use-swipe.ts` | Transient values in refs | ✅ Good |
| Multiple components | Lazy loading with `React.lazy` | ✅ Good |

### 4.2 Issues Found

#### Issue 6: Missing Memo in List Items (MINOR)

**File:** `client/src/components/shared/UnifiedQuestionPanel.tsx` (lines 163-180)

**Problem:** Tag rendering uses `idx` instead of stable key for mapped elements:

```typescript
{question.tags.slice(0, 6).map((tag, idx) => (
  <motion.div key={idx} ...>  // ⚠️ idx is unstable key
```

**Impact:** React reconciliation issues on filter changes.

**Recommendation:** Use `tag` itself as key (tags should be unique):
```typescript
{question.tags.slice(0, 6).map((tag) => (
  <motion.div key={tag} ...>
```

---

#### Issue 7: Inline Component Definitions (MINOR)

**File:** `use-adaptive-learning.ts` (lines 125-138)

**Problem:** Helper functions defined inside the hook are recreated on every render:

```typescript
export function useAdaptiveLearning(channelId?: string) {
  function getGapRecommendation(mastery: number, total: number): string {  // 🔄 Recreated
    // ...
  }
  // ...
}
```

**Impact:** Minor, but causes unnecessary function allocations.

**Recommendation:** Move to module level:
```typescript
// Module-level (outside hook)
function getGapRecommendation(mastery: number, total: number): string { ... }

export function useAdaptiveLearning(...) { ... }
```

---

#### Issue 8: UserPreferencesContext Value Recreation (MINOR)

**File:** `client/src/context/UserPreferencesContext.tsx` (lines 221-258)

**Problem:** The memoized value object has 20+ dependencies, meaning it recreates on nearly any change:

```typescript
const value = useMemo(() => ({
  preferences,
  isInitialized,
  setRole,
  // ... all 25 properties
}), [
  preferences,           // Changes often
  isInitialized,          // Changes once
  setRole,                // Stable (useCallback)
  subscribeChannel,       // Stable
  // ... 15+ more
]);
```

**Impact:** Context value object recreated frequently, causing unnecessary re-renders.

**Recommendation:** Split into multiple contexts or use the Context Split approach (Issue 4).

---

## 5. Additional Findings

### 5.1 Unused/Missing Optimizations

| Area | Finding | Priority |
|------|---------|----------|
| `useQuestions` | Has requestIdRef but not AbortController | Medium |
| Analytics hooks | Uses passive listeners ✅ | N/A |
| Toast system | Uses custom reducer outside React | Low |
| Question filtering | Duplicate logic in multiple files | Medium |
| Mobile detection | Recreates matchMedia on every render | Minor |

### 5.2 Good Patterns to Preserve

1. **ThemeContext.startTransition** - Proper non-blocking UI updates
2. **Request ID pattern** - `requestIdRef` for deduplication in useQuestions
3. **Transient refs** - useSwipe uses refs for touch coordinates
4. **Memoized contexts** - All contexts properly memoize values
5. **Passive event listeners** - use-analytics.ts uses passive: true

---

## 6. Priority Recommendations

### Critical (Fix Within Current Sprint)

1. **Add AbortController to useQuestions** - Prevents race conditions
2. **Fix useToast dependency array** - Prevents memory leaks

### High (Next Sprint)

3. **Split UserPreferencesContext** - Reduces unnecessary re-renders
4. **Extract useQuestionFilters** - Removes duplicate code
5. **Implement context selector pattern** - Targeted re-renders

### Medium (Backlog)

6. **Move helper functions to module level** - Reduces allocations
7. **Fix unstable keys in mapped elements** - Proper reconciliation
8. **Create generic useLocalStorage hook** - Reusable pattern

### Low (Nice to Have)

9. **Add useDeferredValue for search inputs** - Responsive UI
10. **Consider useTransition for theme changes** - Already partially done

---

## 7. Test Coverage Notes

Found test files for:
- `use-reduced-motion.test.ts`
- `use-keyboard-navigation.test.ts`
- `use-format-overrides.test.ts`
- `use-focus-trap.test.ts`
- `use-announcer.test.ts`

**Gap:** No tests for:
- `useQuestions` (complex data fetching)
- `useToast` (state management)
- Context providers
- Filter logic

**Recommendation:** Add integration tests for hooks with async behavior.

---

## 8. Appendix: Files Reviewed

### Hooks (22 files)
- `use-adaptive-learning.ts`
- `use-analytics.ts`
- `use-announcer.ts`
- `use-code-copy.ts`
- `use-debounce.ts`
- `use-focus-trap.ts`
- `use-format-overrides.ts`
- `use-interview-intelligence.ts`
- `use-keyboard-navigation.ts`
- `use-mobile.tsx`
- `use-performance.ts`
- `use-progress.tsx`
- `use-questions.ts`
- `use-reading-progress.ts`
- `use-reduced-motion.ts`
- `use-scroll-lock.ts`
- `use-search-provider.ts`
- `use-speech-recognition.ts`
- `use-stats.ts`
- `use-swipe.ts`
- `use-toast.ts`
- `use-unified-toast.ts`
- `use-voice-recording.ts`

### Contexts (9 files)
- `AchievementContext.tsx`
- `BadgeContext.tsx`
- `CreditsContext.tsx`
- `NotificationsContext.tsx`
- `RewardContext.tsx`
- `SidebarContext.tsx`
- `ThemeContext.tsx`
- `UserPreferencesContext.tsx`

### Sample Components (20 files)
- `InterviewIntelligence.tsx`
- `UnifiedQuestionPanel.tsx`
- `QuestionViewer.tsx`
- Various UI components

---

*Report generated by DevPrep React Performance Optimizer*
