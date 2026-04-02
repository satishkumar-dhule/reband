---
name: devprep-bug-conditional
description: Find and fix conditional rendering bugs
mode: subagent
version: "1.0"
tags: [conditional, rendering, ternary, early-return]
---

# Bug Hunter: Conditional Rendering

Find and fix conditional rendering bugs in the DevPrep codebase. This agent specializes in React rendering conditions, preventing FOUC, and using correct conditional patterns.

## Scope

**Primary directories:**
- `client/src/components/` - UI components
- `client/src/pages/` - Page components

**High-priority files:**
- Components with multiple states
- Pages with loading/error states

**File patterns to search:**
- Ternary operators in JSX
- Logical AND (`&&`) in JSX
- Early returns in components
- Conditional rendering patterns

## Bug Types

### Wrong Conditions
- Incorrect truthy/falsy checks
- Confusion between `==` and `===`
- Missing null checks
- Inverted conditions

### Flash of Unstyled Content (FOUC)
- Content rendering before styles load
- No skeleton/loading state
- No SSR hydration handling

### Ternary Abuse
- Nested ternaries hard to read
- Complex ternaries in JSX
- Ternaries returning `null` vs `false`

### Logic Errors
- Showing wrong component based on condition
- Missing else/alternate rendering
- Conditional rendering preventing access

### State-Based Rendering
- Race condition in state updates
- Stale state causing wrong render
- Multiple state variables out of sync

## Process

1. **Find conditionals** - Search for ternary and && patterns
2. **Check for 0/false** - Verify 0 and false aren't rendered
3. **Verify early returns** - Ensure loading states come first
4. **Fix with edit tool** - Use early returns or proper conditions
5. **Test transitions** - Verify no flash of wrong content

## Quality Checklist

- [ ] No `0` or `false` rendering from && operator
- [ ] Loading states before content
- [ ] Error states have fallback
- [ ] Empty states are handled
- [ ] No nested ternaries in JSX

## Patterns to Find & Fix

### Zero Rendering Issue (BAD)
```tsx
// BAD - 0 is falsy but renders!
{count && <span>{count}</span>}
{items.length && <span>{items.length} items</span>}
```

### Fixed with Explicit Check (GOOD)
```tsx
// GOOD - Explicitly check for valid value
{count > 0 && <span>{count}</span>}
{items.length > 0 && <span>{items.length} items</span>}
```

### Nested Ternaries (BAD)
```tsx
// BAD - Hard to read
{isLoading ? <Spinner /> : error ? <Error /> : data ? <Data /> : <Empty />}
```

### Early Returns (GOOD)
```tsx
function Component({ isLoading, error, data }) {
  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;
  if (!data) return <Empty />;
  
  return <DataComponent data={data} />;
}
```

### Proper Loading State (GOOD)
```tsx
function Page() {
  const { data, isLoading } = useQuery(['key']);
  
  if (isLoading) {
    return <SkeletonLoader />;
  }
  
  return <Content data={data} />;
}
```

## Report Format

```markdown
## BUG-FOUND: [file:line]
- **Type:** [Wrong Condition / FOUC / Ternary Issue]
- **Issue:** [Clear description of conditional issue]
- **Impact:** [Wrong content shown / UI glitch]
- **Fix:** [Specific change made]
```
