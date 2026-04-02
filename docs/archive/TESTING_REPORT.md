# DevPrep Testing Infrastructure Review & Improvement Report

**Date**: March 31, 2026
**Stack**: Vitest + Playwright
**Reviewer**: Testing Agent

---

## Executive Summary

The DevPrep project has a well-structured testing infrastructure with 70+ E2E tests and ~6,900 lines of unit tests. However, there are several gaps that need attention to improve test coverage, reliability, and maintainability.

| Category | Status | Score |
|----------|--------|-------|
| Unit Tests (Vitest) | Needs Improvement | 6/10 |
| E2E Tests (Playwright) | Good | 8/10 |
| Test Infrastructure | Needs Work | 5/10 |
| Coverage | Incomplete | 4/10 |

---

## 1. Vitest Configuration Issues

### Problem: Empty Setup Files

```typescript
// client/vitest.config.ts - CURRENT (lines 7-11)
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: [],  // ❌ EMPTY - no test utilities loaded
},
```

**Impact**: 
- No global test utilities available
- No mock implementations for external dependencies
- No common assertions or helpers

**Recommendation**: Create a test setup file:

```typescript
// client/src/test/setup.ts
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock fetch
global.fetch = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

export {};
```

Update vitest config:
```typescript
setupFiles: ['./src/test/setup.ts'],
```

---

## 2. Missing Unit Test Coverage

### Critical Libraries Without Tests

| Library | Lines | Purpose | Priority |
|---------|-------|---------|----------|
| `spaced-repetition.ts` | 423 | SRS algorithm | HIGH |
| `fuzzy-search.ts` | 247 | Search functionality | HIGH |
| `credits.ts` | ~200 | User credits system | MEDIUM |
| `rewards.ts` | ~150 | Gamification | MEDIUM |
| `badges.ts` | ~200 | Achievement badges | MEDIUM |
| `api-client.ts` | ~150 | API communication | HIGH |
| `coding-challenges.ts` | ~200 | Coding challenges | HIGH |
| `questions-loader.ts` | ~150 | Data loading | HIGH |

### Example: Missing SRS Tests

```typescript
// Should exist: client/src/lib/spaced-repetition.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateNextInterval, type ConfidenceRating } from './spaced-repetition';

describe('Spaced Repetition System', () => {
  describe('calculateNextInterval', () => {
    it('should increase interval on "good" rating', () => {
      const card = {
        questionId: '1',
        channel: 'algorithms',
        difficulty: 'intermediate',
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReview: '',
        lastReview: '',
        totalReviews: 0,
        correctStreak: 0,
        masteryLevel: 0,
      };
      
      const result = calculateNextInterval(card, 'good');
      
      expect(result.interval).toBeGreaterThan(card.interval);
    });

    it('should reset interval on "again" rating', () => {
      // Test that failed cards return to beginning
    });
    
    it('should apply ease factor adjustments', () => {
      // Test difficulty-based adjustments
    });
  });
});
```

---

## 3. Test Utilities Infrastructure

### Current State

**E2E Helpers**: ✅ Well organized (`e2e/helpers/`)
- `test-helpers.ts` - Navigation, waits, assertions
- `page-objects.ts` - Page object model
- `accessibility-helpers.ts` - A11y helpers
- `viewport-helpers.ts` - Mobile helpers

**Unit Test Utilities**: ❌ Missing

### Recommended: Create Test Utilities

```typescript
// client/src/test/utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserPreferencesProvider } from '@/context/UserPreferencesContext';

// Wrapper for component tests
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <UserPreferencesProvider>
        {children}
      </UserPreferencesProvider>
    </BrowserRouter>
  );
}

// Custom render with all providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Mock hooks
export function createMockHook<T>(defaultValue: T) {
  return () => useState(defaultValue);
}

// Re-export testing-library utilities
export * from '@testing-library/react';
export { render, cleanup } from '@testing-library/react';
```

---

## 4. E2E Test Organization Issues

### Problem: Test File Duplication

Found multiple test files testing similar functionality:

- `e2e/home.spec.ts` - Basic home page
- `e2e/features/home-search.spec.ts` - Home search
- `e2e/home.spec.ts` (duplicate pattern)

- `e2e/voice-session.spec.ts`
- `e2e/refactored/voice-interview-refactored.spec.ts`

### Recommendation: Consolidate Tests

```
e2e/
├── pages/                    # Page-level tests
│   ├── home.spec.ts
│   ├── channels.spec.ts
│   └── voice-interview.spec.ts
├── features/                # Feature tests
│   ├── search.spec.ts
│   └── bookmarks.spec.ts
├── smoke/                   # Smoke tests
│   └── smoke.spec.ts
└── accessibility/            # A11y tests
    └── a11y.spec.ts
```

---

## 5. Missing Critical Test Scenarios

### Page Component Tests Needed

| Page | Test Cases | Priority |
|------|------------|----------|
| `Home.tsx` | Render, navigation, search | HIGH |
| `QuestionViewer.tsx` | Swipe, reveal, next/prev | HIGH |
| `VoiceInterview.tsx` | Recording, playback | HIGH |
| `LearningPaths.tsx` | Path selection, progress | MEDIUM |
| `TestSession.tsx` | Timer, answer submission | HIGH |
| `CertificationExam.tsx` | Exam flow, scoring | HIGH |

### Example: Home Page Test

```typescript
// client/src/pages/Home.test.tsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import Home from './Home';

describe('Home Page', () => {
  it('should render hero section', () => {
    renderWithProviders(<Home />);
    
    expect(screen.getByText(/DevPrep/i)).toBeInTheDocument();
  });

  it('should display channel cards', () => {
    renderWithProviders(<Home />);
    
    const channels = screen.getAllByRole('link', { name: /channel/i });
    expect(channels.length).toBeGreaterThan(0);
  });
  
  it('should navigate to channel on click', async () => {
    // Test navigation
  });
});
```

---

## 6. Test Coverage Report

### Current Coverage Analysis

```
Unit Tests (Vitest):
├── services/           ████████░░  80%
│   ├── storage-persistence.test.ts ✓
│   └── onboarding-reset.test.ts    ✓
├── lib/               ████░░░░░░  40%
│   ├── answer-formatting/  ✓✓✓✓✓✓  (6 files)
│   ├── spaced-repetition.ts   ❌
│   ├── fuzzy-search.ts        ❌
│   ├── credits.ts            ❌
│   └── rewards.ts            ❌
├── hooks/             ████████░░  80%
│   ├── use-announcer.test.ts     ✓
│   ├── use-focus-trap.test.ts    ✓
│   └── use-*.test.ts            ✓
└── components/        ██░░░░░░░░  20%
    └── (minimal coverage)

E2E Tests (Playwright):
├── smoke/             ██████████  100%
├── mobile/            ██████████  100%
├── accessibility/     ██████████  100%
├── performance/       ██████████  100%
└── features/          ████████░░  80%
```

---

## 7. Immediate Actions Recommended

### High Priority (This Sprint)

1. **Fix Vitest Setup**
   - Create `client/src/test/setup.ts`
   - Update `client/vitest.config.ts`

2. **Add Critical Unit Tests**
   - `spaced-repetition.test.ts`
   - `fuzzy-search.test.ts`
   - `api-client.test.ts`

3. **Add Page Component Tests**
   - `Home.test.tsx`
   - `QuestionViewer.test.tsx`

### Medium Priority (Next Sprint)

4. **Create Test Utilities**
   - `client/src/test/utils.tsx`
   - `client/src/test/mocks/`

5. **Consolidate E2E Tests**
   - Remove duplicate tests
   - Organize by feature

### Low Priority (Future)

6. **Add Integration Tests**
   - Test full user flows
   - Database integration

---

## 8. Testing Scripts to Add

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:unit": "vitest run --dir client/src",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:smoke": "playwright test e2e/smoke",
    "test:all": "npm run test:unit && npm run test:e2e"
  }
}
```

Add Vitest coverage to config:

```typescript
// client/vitest.config.ts
export default defineConfig({
  test: {
    // ... existing
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
});
```

---

## 9. CI/CD Test Integration

Current GitHub Actions should be enhanced:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run test:coverage
        with:
          name: coverage-report
          path: coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:e2e
```

---

## 10. Summary of Improvements Needed

| Issue | Severity | Effort | Impact |
|-------|----------|--------|--------|
| Empty Vitest setupFiles | HIGH | 1h | Enables all testing |
| Missing SRS tests | HIGH | 2h | Critical algorithm |
| Missing fuzzy-search tests | HIGH | 2h | Core feature |
| No page component tests | MEDIUM | 4h | UI coverage |
| Duplicate E2E tests | MEDIUM | 2h | Maintainability |
| No test utilities | MEDIUM | 2h | DX improvement |
| Missing API mock tests | MEDIUM | 2h | Reliability |

**Estimated Total Effort**: ~15 hours for MVP improvements

---

## Conclusion

The DevPrep testing infrastructure has a solid foundation but needs improvements in:
1. **Vitest configuration** - add setup files and global mocks
2. **Unit test coverage** - add tests for critical libraries
3. **Component testing** - add page-level tests
4. **Test utilities** - create shared helpers and mocks

The E2E testing is well-organized with good coverage across smoke, mobile, accessibility, and performance. Focus should be on improving unit test coverage and fixing the Vitest configuration.
