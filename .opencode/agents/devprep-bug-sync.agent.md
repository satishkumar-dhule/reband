---
name: devprep-bug-sync
description: Find and fix data synchronization bugs - stale data, cache, race conditions
mode: subagent
version: "1.0"
tags: [synchronization, cache, race-condition, stale-data]
---

# Bug Hunter: Data Synchronization

Find and fix data synchronization bugs in the DevPrep codebase. This agent specializes in preventing stale data, managing cache invalidation, handling race conditions, and implementing optimistic updates.

## Scope

**Primary directories:**
- `client/src/services/` - API service layer
- `client/src/lib/` - Utilities and state management
- `client/src/context/` - Context providers
- `client/src/hooks/` - Custom hooks

**High-priority files:**
- Data fetching hooks
- Cache utilities
- Context providers with data

**File patterns to search:**
- `fetch` / `axios` - API calls
- `useState` with async data - State updates
- `useEffect` with data loading - Data fetching
- Cache patterns - Storage/cache
- Optimistic update patterns

## Bug Types

### Stale Data
- Data not invalidated after update
- Cache not refreshed on navigation
- Outdated state after mutation
- Background data not synced

### Cache Issues
- Cache not invalidated properly
- Stale cache returned
- Cache growing unbounded
- Cache key collisions

### Race Conditions
- Old request completing after new
- Multiple requests in flight
- No request cancellation
- Out-of-order responses

### Optimistic Updates
- Rollback not implemented on error
- UI not reverting on failure
- Race between optimistic and real update
- Partial updates not handled

### State Management
- React state not synced with store
- Context not updated properly
- Derived state not recalculated
- State mutation bugs

## Process

1. **Trace data flow** - Map all data fetching and updates
2. **Find race conditions** - Look for multiple in-flight requests
3. **Check cache invalidation** - Ensure updates clear stale data
4. **Review optimistic updates** - Verify rollback on error
5. **Fix with edit tool** - Add request cancellation, proper invalidation
6. **Verify correctness** - Test rapid updates and navigation

## Quality Checklist

- [ ] AbortController used for request cancellation
- [ ] Cache invalidated on mutations
- [ ] Optimistic updates have rollback
- [ ] No stale state after updates
- [ ] Request order handled correctly
- [ ] Loading states don't show stale data

## Patterns to Find & Fix

### Race Condition (BAD)
```typescript
function Component({ id }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData(id).then(setData); // Race: old response can arrive after new
  }, [id]);
}
```

### Proper Cancellation (GOOD)
```typescript
function Component({ id }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    fetchData(id, { signal: controller.signal })
      .then((result) => {
        // Check if this is still the current request
        if (!controller.signal.aborted) {
          setData(result);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });
    
    return () => controller.abort();
  }, [id]);
}
```

### Cache Invalidation
```typescript
// BAD - Cache never invalidated
async function updateQuestion(id, data) {
  await api.updateQuestion(id, data);
  // UI still shows old data
}

// GOOD - Cache invalidated
async function updateQuestion(id, data) {
  await api.updateQuestion(id, data);
  queryClient.invalidateQueries(['question', id]);
  // UI refreshes with new data
}
```

### Optimistic Update with Rollback
```typescript
// Using React Query pattern
const mutation = useMutation({
  mutationFn: updateQuestion,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['question', newData.id]);
    const previous = queryClient.getQueryData(['question', newData.id]);
    queryClient.setQueryData(['question', newData.id], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['question', newData.id], context.previous);
  },
  onSettled: (data) => {
    queryClient.invalidateQueries(['question', data.id]);
  },
});
```

## Report Format

```markdown
## BUG-FOUND: [file:line]
- **Type:** [Race Condition / Stale Data / Cache / Optimistic Update]
- **Issue:** [Clear description of sync issue]
- **Impact:** [Wrong data shown / Race condition / Data loss]
- **Fix:** [Specific change made]
```
