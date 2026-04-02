---
name: devprep-bug-lifecycle
description: Find and fix component lifecycle bugs - useEffect cleanup, mount/unmount
mode: subagent
version: "1.0"
tags: [lifecycle, useEffect, mount, unmount, cleanup]
---

# Bug Hunter: Component Lifecycle

Find and fix component lifecycle bugs in the DevPrep codebase. This agent specializes in React hooks lifecycle, cleanup patterns, and preventing issues from improper mount/unmount handling.

## Scope

**Primary directories:**
- `client/src/` - All React code

**High-priority files:**
- `client/src/components/**/*.{ts,tsx}` - All components
- `client/src/hooks/**/*.{ts,tsx}` - Custom hooks

**File patterns to search:**
- `useEffect` - Effect hooks
- `useLayoutEffect` - Layout effect hooks
- `useState` - State with complex initialization
- `useRef` - Refs holding mutable values
- `useCallback` - Memoized callbacks

## Bug Types

### useEffect Cleanup Missing
- Subscriptions not cleaned up
- Event listeners not removed
- Timers not cleared
- Async operations not aborted

### Double Renders
- StrictMode causing double renders
- useEffect running twice in dev
- Unnecessary re-renders from deps
- State updates in wrong effect

### Mount/Unmount Issues
- Component rendering before data ready
- Cleanup running too early
- Parent-child lifecycle conflicts
- Context value changes

### Dependency Array Issues
- Missing dependencies (infinite loops)
- Unnecessary dependencies (excessive re-runs)
- Objects/functions as dependencies
- Stale closures

### useLayoutEffect Problems
- useLayoutEffect causing blocking
- SSR compatibility issues
- Missing cleanup in useLayoutEffect

## Process

1. **Find all useEffect hooks** - Search for effect patterns
2. **Check cleanup functions** - Ensure all have proper cleanup
3. **Review dependency arrays** - Check for missing/unnecessary deps
4. **Test mount/unmount** - Verify cleanup runs
5. **Fix with edit tool** - Add proper cleanup and deps
6. **Run lint** - Check exhaustive-deps rule

## Quality Checklist

- [ ] All useEffect have cleanup return
- [ ] Dependency arrays include all used values
- [ ] Objects/functions in deps use useMemo/useCallback
- [ ] StrictMode double-render handled
- [ ] No state updates in cleanup functions
- [ ] AbortController for async operations

## Patterns to Find & Fix

### Missing Cleanup (BAD)
```typescript
useEffect(() => {
  const subscription = subscribeToData(id, handleData);
  // Missing cleanup!
}, [id]);
```

### Proper Cleanup (GOOD)
```typescript
useEffect(() => {
  const subscription = subscribeToData(id, handleData);
  return () => subscription.unsubscribe();
}, [id]);
```

### Object Dependency Issue (BAD)
```typescript
const options = { timeout: 5000, retries: 3 };

useEffect(() => {
  fetchData(options);
}, [options]); // Object reference changes every render - infinite loop!
```

### useMemo for Object Deps (GOOD)
```typescript
const options = useMemo(() => ({ timeout: 5000, retries: 3 }), []);

useEffect(() => {
  fetchData(options);
}, [options]); // Stable reference
```

### Function Dependency Issue (BAD)
```typescript
const handleSubmit = () => {
  submitForm(data);
};

useEffect(() => {
  handleSubmit();
}, [handleSubmit]); // New function every render - infinite loop!
```

### useCallback for Function Deps (GOOD)
```typescript
const handleSubmit = useCallback(() => {
  submitForm(data);
}, [data]);

useEffect(() => {
  handleSubmit();
}, [handleSubmit]); // Stable reference
```

### AbortController for Fetch
```typescript
useEffect(() => {
  const controller = new AbortController();
  
  fetchData({ signal: controller.signal })
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    });
  
  return () => controller.abort();
}, [id]);
```

## Report Format

```markdown
## BUG-FOUND: [file:line]
- **Type:** [Missing Cleanup / Dependency Array / Mount Issue]
- **Issue:** [Clear description of lifecycle issue]
- **Impact:** [Memory leak / Infinite loop / Stale data]
- **Fix:** [Specific change made]
```
