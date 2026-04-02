# DevPrep/Open-Interview Architecture Review

**Date:** April 1, 2026  
**Author:** Architecture Analysis  
**Scope:** client/src/components/*, client/src/context/*, client/src/hooks/*, client/src/lib/*

---

## Executive Summary

This review examines the React component architecture of the DevPrep platform. The codebase demonstrates solid foundational patterns but has several areas requiring attention, particularly around error boundary granularity, context provider nesting depth, and state colocation.

**Key Findings:**
- **10 context providers** at application root creates deep provider nesting (8+ levels)
- **Single ErrorBoundary** wraps entire app - too coarse-grained
- **Excellent custom hooks** for data fetching with proper request cancellation
- **Good separation** between UI library (shadcn), unified components, and feature components
- **State colocation patterns** present but inconsistent

---

## 1. Component Architecture Patterns

### 1.1 Component Hierarchy

```
App.tsx (Root)
├── ErrorBoundary [ROOT]
│   ├── ThemeProvider
│   │   └── UserPreferencesProvider
│   │       └── QueryClientProvider
│   │           └── TooltipProvider
│   │               └── FullApp
│   │                   ├── LiveRegionProvider
│   │                   ├── SidebarProvider
│   │                   ├── CreditsProvider
│   │                   │   └── AchievementProvider
│   │                   │       └── UnifiedNotificationManager
│   │                   │           └── ProtectedRoute
│   │                   │               └── PublicRoute
│   │                   │                   └── OnboardingGuard
│   │                   │                       └── MinimalApp
│   │                   │                           └── [Routes → Pages]
```

**Depth Analysis:** The provider nesting reaches **8+ levels** at the deepest point. This creates:
- Implicit dependency ordering requirements
- Difficult-to-trace context propagations
- Potential performance impact from unnecessary re-renders

### 1.2 Component Organization

| Layer | Location | Count | Purpose |
|-------|----------|-------|---------|
| UI primitives | `components/ui/*` | 60+ | shadcn/ui base components |
| Unified layer | `components/unified/*` | 15+ | GitHub-themed wrappers |
| Shared | `components/shared/*` | 10+ | Cross-feature components |
| Feature | `components/question/*` | 8+ | Question-specific UI |
| Mobile | `components/mobile/*` | 12+ | Mobile-optimized components |

### 1.3 Pattern Analysis

**Compound Components (Good)**
```tsx
// Example: ToggleGroup from shadcn/ui
<ToggleGroup type="single" value={value} onValueChange={setValue}>
  <ToggleGroupItem value="a">Option A</ToggleGroupItem>
  <ToggleGroupItem value="b">Option B</ToggleGroupItem>
</ToggleGroup>
```

**Presentational vs Container (Partial)**
```tsx
// UnifiedQuestionView - mixed responsibilities
export function UnifiedQuestionView({ 
  question,              // Data
  onNext,               // Callback
  onPrevious,           // Callback
  onBookmark,           // Callback
  // ... internal state for animations/swipe
}) {
  // Presentational + logic + animation state
}
```

**Recommendation:** Extract animation/gesture state into custom hooks:
```tsx
// Recommended pattern
const { 
  isTransitioning, 
  handleNext, 
  handlePrevious 
} = useQuestionNavigation({
  totalQuestions,
  onNext,
  onPrevious
});
```

### 1.4 Context Usage Optimization

**Current:** 10 context providers, some with overlapping concerns.

**Issues Found:**
1. `UserPreferencesContext` contains both preferences AND routing logic (OnboardingGuard)
2. `UnifiedNotificationManager` duplicates notification state management
3. `LiveRegion` context exists but may not be needed separately

**Context Relationship Diagram:**

```
                    ┌──────────────────┐
                    │  ThemeContext    │ ← Global (theme only)
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ UserPreferences  │ ← Global (prefs + routing)
                    │    Context       │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐  ┌─────────▼───────┐  ┌──────▼──────┐
│ CreditsContext│  │ AchievementCtx  │  │BadgeContext │
└───────────────┘  └─────────────────┘  └─────────────┘

┌──────────────────────────────────────────────────────┐
│              SidebarContext (UI state only)          │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│       LiveRegionContext (Accessibility only)        │
└──────────────────────────────────────────────────────┘
```

---

## 2. State Management Architecture

### 2.1 State Classification

| State Type | Examples | Storage | Pattern |
|------------|----------|---------|---------|
| Global/Theme | Theme, user preferences | localStorage | Context |
| Global/Feature | Achievements, credits, badges | localStorage | Context |
| Session | Current question index, filters | useState | Colocated |
| Derived | Unread count, filtered lists | useMemo | Computed |
| API/Cache | Questions, channels | React Query | queryClient |

### 2.2 State Ownership Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION STATE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ GLOBAL STATE (Context Providers)                     │   │
│  │  • ThemeContext - theme, setTheme, toggleTheme       │   │
│  │  • UserPreferencesContext - all user preferences    │   │
│  │  • AchievementContext - achievements, unlock        │   │
│  │  • CreditsContext - credits, earn, spend             │   │
│  │  • BadgeContext - badges, progress                   │   │
│  │  • NotificationsContext - notifications, unread       │   │
│  │  • SidebarContext - open state                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PAGE STATE (useState in pages)                      │   │
│  │  • QuestionViewerGenZ: filters, index, search        │   │
│  │  • VoiceInterview: transcript, evaluation            │   │
│  │  • ReviewSession: sessionState, cards               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ HOOK STATE (Custom hooks manage)                     │   │
│  │  • useQuestions: questions, loading, error          │   │
│  │  • useVoiceRecording: recording state               │   │
│  │  • useSwipe: swipe direction, threshold              │   │
│  │  • useInterviewIntelligence: AI state                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 State Colocation Analysis

**Good Examples:**
```tsx
// use-questions.ts - Request deduplication with requestIdRef
const requestIdRef = useRef(0);

useEffect(() => {
  const currentRequestId = ++requestIdRef.current;
  // ... fetch logic
  if (currentRequestId === requestIdRef.current) {
    setQuestions(processed);
  }
}, [channelId, subChannel, /* ... */]);
```

**Issue: AchievementContext uses refs for stale closure prevention**
```tsx
// Current pattern - works but complex
const achievementsRef = useRef<Achievement[]>([]);
achievementsRef.current = achievements;

const trackEvent = useCallback((event: string, metadata?) => {
  const currentAchievements = achievementsRef.current; // Access via ref
  // ... handler logic
}, [unlockAchievement]);
```

**Better Pattern:** Use functional updates consistently:
```tsx
// Recommended - simpler, no refs needed
const trackEvent = useCallback((event: string, metadata?: Record<string, unknown>) => {
  setAchievements(prev => {
    // Use prev directly, no ref needed
    const currentAchievements = prev;
    // ... handler logic
    return prev; // Return unchanged if no unlock needed
  });
}, []);
```

### 2.4 Derived State Patterns

**Good use of useMemo:**
```tsx
// UserPreferencesContext.tsx
const value = useMemo(() => ({
  preferences,
  isInitialized,
  needsOnboarding: !preferences.onboardingComplete, // Derived
  // ... other derived values
}), [preferences, isInitialized, /* all deps */]);
```

**Potential optimization - NotificationsContext:**
```tsx
// Current - recalculates on every notifications change
const unreadCount = useMemo(
  () => notifications.filter(n => !n.read).length,
  [notifications]
);

// Could be combined into context value memoization
```

---

## 3. Data Flow Architecture

### 3.1 Prop Drilling Analysis

**Current Flow in App.tsx:**
```
OnboardingGuard receives:
  - needsOnboarding (from context)
  - isInitialized (from context)
  - preferences (from context)
  - children (render prop)

MinimalApp receives:
  - location (from useLocation hook)
  - children (none - uses Switch directly)
```

**Page Component Props (QuestionViewerGenZ):**
```
UnifiedQuestionView receives:
  ├── question: Question (from parent useQuestions hook)
  ├── questionNumber: number (derived)
  ├── totalQuestions: number (derived)
  ├── mode: Mode (passed from page)
  ├── showAnswer: boolean (page state)
  ├── onAnswerToggle: () => void (page callback)
  ├── onNext: () => void (page callback)
  ├── onPrevious: () => void (page callback)
  ├── onBookmark: () => void (page callback)
  └── isBookmarked: boolean (derived from page state)
```

**Depth: 3-4 levels** - Acceptable, but consider composition for complex components.

### 3.2 Custom Hook Extraction Opportunities

**Current Hooks (22 custom hooks):**

| Hook | Responsibility | Status |
|------|----------------|--------|
| `useQuestions` | Question fetching, filtering, pagination | Excellent |
| `useQuestion` | Single question with abort controller | Excellent |
| `useSubChannels` | Sub-channel fetching | Good |
| `useCompanies` | Company list fetching | Good |
| `useSwipe` | Swipe gesture handling | Good |
| `useVoiceRecording` | Recording state management | Good |
| `use-voice-recording` | Audio recording | Good |
| `useSpeechRecognition` | Speech-to-text | Good |
| `use-interview-intelligence` | AI interview features | Good |
| `useAchievements` | Achievement tracking | Good |
| `useLevel` | Level calculation | Good |
| `useStats` | Statistics fetching | Good |

**Extraction Opportunities:**

1. **useQuestionFilters** - Extract filter state from pages
```tsx
// Current: Filter state lives in QuestionViewerGenZ.tsx (lines 61-63)
const [selectedSubChannel, setSelectedSubChannel] = useState('all');
const [selectedDifficulty, setSelectedDifficulty] = useState('all');
const [selectedCompany, setSelectedCompany] = useState('all');

// Recommended: Extract to hook
export function useQuestionFilters(initial?: Partial<FilterState>) {
  const [subChannel, setSubChannel] = useState(initial?.subChannel ?? 'all');
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? 'all');
  const [company, setCompany] = useState(initial?.company ?? 'all');
  
  // ... reset, serialization, URL sync logic
  return { subChannel, setSubChannel, difficulty, /* ... */ };
}
```

2. **useQuestionNavigation** - Extract from UnifiedQuestionView
```tsx
// Current: Navigation logic mixed with UI in UnifiedQuestionView.tsx
// Lines 91-119: handleNext, handlePrevious with animation state

// Recommended: Separate concerns
export function useQuestionNavigation({ 
  total, 
  onNext, 
  onPrevious 
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  // ... navigation logic
  return { isTransitioning, handleNext, handlePrevious };
}
```

### 3.3 Data Fetching Architecture

**Current Pattern (Excellent):**
```
┌─────────────────────────────────────────────────────────┐
│              questions-loader.ts (Cache)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ getQuestions│  │getQuestionBy│  │loadChannel  │     │
│  │   (sync)    │  │    Id       │  │  Questions  │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
└─────────┼────────────────┼────────────────┼─────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│              useQuestions (Hook)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ cache-first │  │ requestId   │  │ abort ctrl  │     │
│  │   logic     │  │  dedup      │  │  cleanup    │     │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘     │
└─────────┼────────────────┼─────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              React Query (queryClient)                  │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │  queryKey   │  │   cache     │                       │
│  │  ['questions', channelId, filters]                  │
│  └─────────────┘  └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

**Strengths:**
- Cache-first strategy reduces redundant fetches
- Request ID pattern prevents race conditions
- Abort controller for proper cleanup
- Seeded shuffle for consistent ordering

### 3.4 Callback Prop Patterns

**Consistent Pattern:**
```tsx
// Parent passes callbacks
<UnifiedQuestionView
  onNext={handleNext}
  onPrevious={handlePrevious}
  onBookmark={handleBookmark}
  onAnswerToggle={() => setShowAnswer(!showAnswer)}
/>

// Child calls callbacks
const handleNext = useCallback(() => {
  onNext?.(); // Optional chaining for flexibility
}, [onNext]);
```

**Pattern Score:** 8/10 - Good, but some inconsistency in optional chaining usage.

---

## 4. Error Boundary Strategy

### 4.1 Current Implementation

**App.tsx (Lines 236-255):**
```tsx
<ErrorBoundary>  {/* Single boundary at root */}
  <ThemeProvider>
    <UserPreferencesProvider>
      {/* ... all providers and pages */}
    </UserPreferencesProvider>
  </ThemeProvider>
</ErrorBoundary>
```

**ErrorBoundary.tsx provides:**
- `ErrorBoundary` - Base class component
- `PageErrorBoundary` - Wrapper for page-level errors
- `ComponentErrorBoundary` - Wrapper for component-level errors
- `useErrorBoundary` - Hook for programmatic error triggering

### 4.2 Granularity Analysis

**Current: Single Root Boundary**
```
┌────────────────────────────────────────────────────────┐
│                    ErrorBoundary                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Entire Application                               │ │
│  │  • Theme error → crash entire app               │ │
│  │  • Single question render error → crash app     │ │
│  │  • Navigation error → crash app                 │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

**Recommended: Layered Boundaries**
```
┌────────────────────────────────────────────────────────┐
│              Root ErrorBoundary (Fallback Shell)       │
│  ┌────────────────────┬────────────────────────────┐  │
│  │ Page ErrorBoundary │   Page ErrorBoundary        │  │
│  │ ┌────────────────┐ │ ┌────────────────────────┐ │  │
│  │ │Route: /channel │ │ │Route: /voice-session   │ │  │
│  │ │                │ │ │                        │ │  │
│  │ │ ComponentEB    │ │ │ ComponentEB            │ │  │
│  │ │ ┌────────────┐ │ │ │ ┌──────────────────┐   │ │  │
│  │ │ │QuestionView│ │ │ │ │VoiceRecording   │   │ │  │
│  │ │ └────────────┘ │ │ │ └──────────────────┘   │ │  │
│  │ └────────────────┘ │ └────────────────────────┘ │  │
│  └────────────────────┴────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 4.3 Missing Error Boundaries

**Analysis of page components:**

| Page | Has Local EB? | Risk Level | Should Have EB? |
|------|---------------|------------|-----------------|
| QuestionViewerGenZ | No | High | Yes - question parsing |
| VoiceInterview | No | High | Yes - speech API |
| VoiceSessionGenZ | No | High | Yes - recording API |
| CodingChallengeGenZ | No | Medium | Yes - code execution |
| ReviewSessionGenZ | No | High | Yes - SRS logic |
| Home | No | Low | Maybe |
| StatsGenZ | No | Low | Maybe |

### 4.4 Error Recovery Patterns

**Current:**
```tsx
// ErrorBoundary.tsx provides retry
handleRetry = (): void => {
  this.setState({ hasError: false, error: null, errorInfo: null });
  this.forceUpdate();
};
```

**Missing Patterns:**
1. **Partial recovery** - Show cached content on API failure
2. **Fallback to static data** - Already implemented via questions-loader
3. **Error boundary logging** - Console only, no error tracking service

---

## 5. Architecture Recommendations

### 5.1 Quick Wins (High Impact, Low Effort)

| Issue | Current | Recommended | Effort |
|-------|---------|-------------|--------|
| Error boundaries | 1 root EB | Add 3-5 page EBs | Medium |
| Filter state | In page | Extract `useQuestionFilters` hook | Low |
| Navigation state | In component | Extract `useQuestionNavigation` hook | Low |

### 5.2 Medium-Term Refactoring

| Issue | Recommendation | Impact |
|-------|----------------|--------|
| Context nesting | Flatten via consolidated providers | Performance |
| Stale closure pattern | Use functional updates | Maintainability |
| Prop drilling | Use composition for deep trees | Flexibility |

### 5.3 Long-Term Architecture

| Area | Current State | Target State |
|------|---------------|--------------|
| State management | 10 contexts | 5-6 core contexts |
| Error handling | 1 boundary | Layered boundaries |
| Data fetching | Custom hooks + React Query | Standardized pattern |
| Component reuse | Ad-hoc | Systematic composition |

---

## 6. Component Relationship Diagrams

### 6.1 Question Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Question Viewer Page                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              useQuestions (channel, filters)                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐      │  │
│  │  │ cache-get │  │ API-fetch  │  │ process+shuffle   │      │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘      │  │
│  └────────────────────────────┬────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              useQuestionNavigation (internal)                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐      │  │
│  │  │ index     │  │ transition │  │ swipe gesture     │      │  │
│  │  │ state     │  │ state      │  │ handler           │      │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘      │  │
│  └────────────────────────────┬────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              UnifiedQuestionView (render)                    │  │
│  │                                                               │  │
│  │  ┌──────────────────┐  ┌──────────────────┐                 │  │
│  │  │UnifiedQuestion   │  │ UnifiedAnswer    │                 │  │
│  │  │Panel             │  │ Panel            │                 │  │
│  │  │                  │  │                  │                 │  │
│  │  │ • question text  │  │ • answer text    │                 │  │
│  │  │ • difficulty    │  │ • code examples  │                 │  │
│  │  │ • metadata      │  │ • companies      │                 │  │
│  │  └──────────────────┘  └──────────────────┘                 │  │
│  │                                                               │  │
│  │  ┌──────────────────┐  ┌──────────────────┐                 │  │
│  │  │UnifiedMetadata  │  │ UnifiedProgress  │                 │  │
│  │  │Bar              │  │ Bar              │                 │  │
│  │  └──────────────────┘  └──────────────────┘                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Context Provider Dependency Graph

```
                    ┌─────────────┐
                    │ QueryClient │
                    │  Provider   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ThemeContext │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌─────▼──────┐   ┌────▼──────┐
    │  Sidebar  │    │  Tooltip  │   │   Theme   │
    │  Context  │    │  Provider │   │  toggle   │
    └─────┬─────┘    └───────────┘   └───────────┘
          │
    ┌─────▼─────┐    ┌───────────┐   ┌───────────┐
    │  Credits  │───▶│Achievement│◀──│  Badge    │
    │  Context  │    │  Context  │   │  Context  │
    └───────────┘    └─────┬─────┘   └───────────┘
                          │
                    ┌─────▼──────┐
                    │ Notifications│
                    │  Manager    │
                    └─────────────┘
```

---

## 7. Implementation Priority Matrix

| Priority | Item | Reason | Est. Effort |
|----------|------|--------|-------------|
| P0 | Add ErrorBoundary to QuestionViewer | High risk of crashes | 2 hours |
| P0 | Add ErrorBoundary to VoiceInterview | Speech API failures | 2 hours |
| P1 | Extract useQuestionFilters hook | Reuse across pages | 4 hours |
| P1 | Fix AchievementContext stale closure | Maintainability | 2 hours |
| P2 | Flatten provider nesting | Performance | 8 hours |
| P2 | Extract useQuestionNavigation | Separation of concerns | 4 hours |
| P3 | Implement error tracking service | Production monitoring | 16 hours |

---

## Appendix: File Inventory

### Context Providers
- `context/ThemeContext.tsx` - Theme state
- `context/UserPreferencesContext.tsx` - User preferences
- `context/AchievementContext.tsx` - Achievements
- `context/CreditsContext.tsx` - Credits system
- `context/BadgeContext.tsx` - Badge progress
- `context/NotificationsContext.tsx` - Notifications
- `context/SidebarContext.tsx` - Sidebar state
- `context/RewardContext.tsx` - Rewards system

### Custom Hooks (Data)
- `hooks/use-questions.ts` - Question fetching
- `hooks/use-stats.ts` - Statistics
- `hooks/use-level.ts` - Level calculation
- `hooks/use-achievements.ts` - Achievement tracking

### Custom Hooks (UI)
- `hooks/use-swipe.ts` - Swipe gestures
- `hooks/use-voice-recording.ts` - Recording
- `hooks/use-speech-recognition.ts` - Speech-to-text
- `hooks/use-announcer.ts` - Accessibility announcements

---

*Report generated from architecture analysis of DevPrep/Open-Interview codebase*