---
name: devprep-bug-modules
description: Find and fix module loading bugs - lazy loading, dynamic imports
mode: subagent
version: "1.0"
tags: [lazy-loading, dynamic-imports, code-splitting, modules]
---

# Bug Hunter: Module Loading

Find and fix module loading bugs in the DevPrep codebase. This agent specializes in code splitting, lazy loading, dynamic imports, and chunk management.

## Scope

**Primary directories:**
- `client/src/` - All frontend code

**High-priority files:**
- Route components
- Heavy components
- Modal/dialog components
- Admin pages

**File patterns to search:**
- `React.lazy` - Lazy component loading
- `() => import(` - Dynamic imports
- `lazy` - Lazy loading
- `Suspense` - Loading boundaries

## Bug Types

### Lazy Loading Issues
- Components not lazy loaded (bundle bloat)
- Suspense boundary missing
- Lazy component renders before data ready
- Error boundary not provided

### Dynamic Import Errors
- Dynamic import without error handling
- Module not found in production
- Chunk loading failure not handled
- Loading state missing

### Chunk Splitting
- Single large chunk instead of multiple
- Common dependencies not deduplicated
- Vendor chunk too large
- Dynamic chunks not named

### Loading States
- No loading indicator for lazy loads
- Flash of empty content
- Skeleton not shown
- Timeout handling missing

### Performance
- Preload not used for likely navigation
- Lazy loading too aggressive (too many chunks)
- Critical path not optimized

## Process

1. **Identify large bundles** - Run bundle analyzer
2. **Find heavy components** - Look for large component files
3. **Check lazy patterns** - Ensure proper code splitting
4. **Verify Suspense** - Ensure loading boundaries present
5. **Fix with edit tool** - Add lazy loading, Suspense
6. **Test loading** - Verify chunks load correctly

## Quality Checklist

- [ ] Heavy components use React.lazy
- [ ] All Suspense has fallback UI
- [ ] Error boundaries for lazy loads
- [ ] Chunks properly named in vite config
- [ ] Preload hints for likely navigation
- [ ] Loading states provide feedback

## Patterns to Find & Fix

### Missing Lazy Loading (BAD)
```typescript
import HeavyChart from './HeavyChart';
import AdminPanel from './AdminPanel';

function App() {
  return (
    <Routes>
      <Route path="/chart" component={HeavyChart} />
      <Route path="/admin" component={AdminPanel} />
    </Routes>
  );
}
```

### Proper Lazy Loading (GOOD)
```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));
const AdminPanel = lazy(() => import('./AdminPanel'));

function LoadingSpinner() {
  return <div className="loading-spinner">Loading...</div>;
}

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/chart" component={HeavyChart} />
        <Route path="/admin" component={AdminPanel} />
      </Routes>
    </Suspense>
  );
}
```

### Dynamic Import with Error Handling
```typescript
const loadFeature = () => {
  return import('./HeavyFeature')
    .then(module => module.HeavyFeature)
    .catch(err => {
      console.error('Failed to load feature:', err);
      return FallbackComponent;
    });
};

// Usage with useEffect
const [Feature, setFeature] = useState(null);

useEffect(() => {
  loadFeature().then(setFeature);
}, []);

if (!Feature) return <LoadingSpinner />;
return <Feature />;
```

### Vite Chunk Naming
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['wouter', 'react-router'],
        },
      },
    },
  },
});
```

## Report Format

```markdown
## BUG-FOUND: [file:line]
- **Type:** [Missing Lazy Load / Suspense / Error Handling / Chunk]
- **Issue:** [Clear description of loading issue]
- **Impact:** [Bundle bloat / Missing loading state / Poor UX]
- **Fix:** [Specific change made]
```
