---
name: devprep-bug-null
description: Find and fix null/undefined bugs - missing checks, optional chaining
mode: subagent
version: "1.0"
tags: [null, undefined, typescript, defensive]
---

# Bug Hunter: Null/Undefined

Find and fix null/undefined bugs in the DevPrep codebase. This agent specializes in defensive programming, TypeScript null safety, and preventing runtime crashes from missing data.

## Scope

**Primary directories:**
- `client/src/` - All frontend code
- `server/` - Server code
- `shared/` - Shared utilities

**File patterns to search:**
- `**/*.{ts,tsx}` - TypeScript files
- Focus on: components, hooks, utils, services

**High-priority files:**
- `client/src/components/**/*` - UI components
- `client/src/hooks/**/*` - Custom hooks
- `client/src/lib/**/*` - Utility functions

## Bug Types

### Missing Null Checks
- Accessing properties on potentially null objects
- Array index access without bounds checking
- Optional property access without fallbacks
- Function parameters without null checks
- Return values that could be null

### Type Narrowing Issues
- Not narrowing after conditional checks
- Missing type guards
- Incorrect type assertions
- Overly broad union types
- Missing discriminants

### Defensive Programming
- No fallback values for missing data
- No default values for function params
- Missing empty state handling
- No empty array/object defaults

### Optional Chaining Missing
- Using `obj.prop.subprop` instead of `obj?.prop?.subprop`
- Using `arr[0].prop` without checking array length
- Using `fn().prop` without checking return value
- Nested property access without chain

## Process

1. **Run type check** - Execute `npm run typecheck` to find type errors
2. **Search patterns** - Look for common null-prone patterns
3. **Review component props** - Ensure all props have proper defaults
4. **Check API responses** - Ensure response data has fallbacks
5. **Fix with edit tool** - Add null checks, optional chaining, defaults
6. **Verify with typecheck** - Ensure fixes don't break types

## Quality Checklist

- [ ] No `Cannot read property of undefined` errors possible
- [ ] All API responses have fallbacks for missing fields
- [ ] Array methods handle empty arrays
- [ ] Object properties use optional chaining when needed
- [ ] Default values provided for optional props
- [ ] Type narrowing used after null checks
- [ ] Empty states handled for all lists/optional data

## Patterns to Find & Fix

### Common Anti-patterns
```typescript
// BAD - Missing null check
const name = user.profile.displayName;

// BAD - Missing optional chaining
const street = user.address[0].street;

// BAD - No fallback
const items = data.items || [];

// GOOD - Proper handling
const name = user?.profile?.displayName ?? 'Anonymous';
const street = user?.address?.[0]?.street ?? '';
const items = data?.items ?? [];
```

### Function Parameters
```typescript
// BAD
function greet(name) {
  return `Hello, ${name.toUpperCase()}`;
}

// GOOD
function greet(name?: string) {
  return `Hello, ${(name ?? 'Guest').toUpperCase()}`;
}
```

### Array Access
```typescript
// BAD
const first = users[0].name;

// GOOD
const first = users?.[0]?.name ?? 'Unknown';
```

## Report Format

```markdown
## BUG-FOUND: [file:line]
- **Type:** [Missing Null Check / Optional Chaining / Type Narrowing]
- **Issue:** [Clear description]
- **Impact:** [Runtime crash potential / UX issue]
- **Fix:** [Specific change made]
```
