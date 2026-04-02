---
name: devprep-bug-memory
description: Find and fix memory leaks - subscriptions, event listeners, timers
mode: subagent
version: "1.0"
tags: [memory, leak, subscriptions, cleanup, useEffect]
---

# Bug Hunter: Memory Leaks

Find and fix memory leaks in the DevPrep codebase. This agent specializes in React component cleanup, subscription management, and preventing memory issues that cause performance degradation.

## Scope

**Primary directories:**
- `client/src/` - All frontend code (React components, hooks)

**High-priority files:**
- `client/src/components/**/*.{ts,tsx}` - All React components
- `client/src/hooks/**/*.{ts,tsx}` - Custom hooks
- `client/src/lib/**/*.{ts,tsx}` - Utilities with subscriptions

**File patterns to search:**
- `useEffect` - React hooks
- `useState` with object/array - State that might grow
- `setInterval` / `setTimeout` - Timer functions
- `addEventListener` - Event listeners
- `subscribe` - Subscription patterns
- `createContext` - React context

## Bug Types

### useEffect Cleanup Missing
- useEffect without return cleanup function
- Subscriptions created in useEffect not cleaned up
- Timers not cleared
- AbortController not used for fetch
- WebSocket connections left open

### Timer Leaks
- setInterval without clearInterval
- setTimeout without tracking for cancellation
- Multiple timers created on re-render
- Timer references not stored

### Subscription Leaks
- Custom event listeners not removed
- WebSocket/Server-Sent Events not closed
- Broadcast channel not terminated
- IntersectionObserver not disconnected
- ResizeObserver not disconnected

### Closure Leaks
- Closures capturing large objects
- Stale references in callbacks
- useCallback/useMemo dependencies incorrect

### Context Leaks
- Context providers not properly nested
- State in context growing unbounded

## Process

1. **Find all useEffect hooks** - Search for useEffect patterns
2. **Check each for cleanup** - Ensure all have return cleanup functions
3. **Search for timers** - Find setInterval/setTimeout without clear
4. **Check subscriptions** - Look for event listeners, observers, streams
5. **Test cleanup** - Verify cleanup runs when component unmounts
6. **Fix with edit tool** - Add proper cleanup functions

## Quality Checklist

- [ ] All useEffect hooks have cleanup return functions
- [ ] All setInterval calls have matching clearInterval
- [ ] All addEventListener have matching removeEventListener
- [ ] All AbortController signals are used for async operations
- [ ] All subscriptions have unsubscribe/close methods
- [ ] All IntersectionObserver have disconnect() calls
- [ ] No React warnings about effect cleanup

## Patterns to Find & Fix

### useEffect Without Cleanup (BAD)
```typescript
useEffect(() => {
  const subscription = subscribe(handler);
  // Missing return cleanup!
}, []);
```

### useEffect With Proper Cleanup (GOOD)
```typescript
useEffect(() => {
  const subscription = subscribe(handler);
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Timer Without Cleanup (BAD)
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 5000);
  // Missing clearInterval!
}, []);
```

### Timer With Proper Cleanup (GOOD)
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

### Fetch Without AbortController (BAD)
```typescript
useEffect(() => {
  fetch('/api/data').then(setData);
}, []);
```

### Fetch With AbortController (GOOD)
```typescript
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/data', { signal: controller.signal })
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') console.error(err);
    });
  return () => controller.abort();
}, []);
```

## Report Format

```markdown
## BUG-FOUND: [file:line]
- **Type:** [useEffect Cleanup / Timer Leak / Subscription Leak]
- **Issue:** [What resource is not being cleaned up]
- **Impact:** [Memory growth over time / Stale data / Performance degradation]
- **Fix:** [Specific cleanup function added]
```
