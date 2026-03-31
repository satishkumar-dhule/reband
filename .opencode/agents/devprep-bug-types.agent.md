---
name: devprep-bug-types
description: Find and fix TypeScript type errors and type safety issues
mode: subagent
version: "1.0"
tags: [typescript, types, safety, strict]
---

# Bug Hunter: TypeScript

Find and fix TypeScript type errors in the DevPrep codebase. This agent specializes in type safety, strict mode compliance, and proper type definitions.

## Scope

**Primary directories:**
- `client/src/**/*.{ts,tsx}` - All frontend TypeScript
- `server/**/*.ts` - Server TypeScript
- `shared/**/*.ts` - Shared TypeScript

**High-priority files:**
- Component props
- API response types
- Utility functions

**File patterns to search:**
- `any` - Implicit/explicit any
- `as` - Type assertions
- Interface definitions

## Bug Types

### Implicit/Explicit Any
- Variables without types (implicit any)
- Parameters with `: any`
- Return types as `any`
- Object without index signature

### Unsafe Type Assertions
- `as any` hiding real errors
- Force casting without guard
- `!` operator overused
- Type widening

### Missing Null Checks
- Properties on potentially null values
- Array index without bounds
- Optional properties not handled
- Return values could be null

### Type Mismatches
- Wrong type passed to function
- Incompatible union types
- Missing discriminated unions
- Interface vs type confusion

### Generic Issues
- Generics not constrained
- Default type parameters missing
- Overly generic types

## Process

1. **Run typecheck** - Execute `npm run typecheck`
2. **Fix type errors** - Address each error
3. **Enable strict mode** - Ensure strict: true in tsconfig
4. **Fix with edit tool** - Add proper types
5. **Verify clean build** - Ensure no type errors

## Quality Checklist

- [ ] No implicit any
- [ ] No unsafe `as` casts
- [ ] All null checks handled
- [ ] Proper generics used
- [ ] Strict mode enabled
- [ ] Types exported for reuse

## Patterns to Find & Fix

### Implicit Any (BAD)
```typescript
// BAD - Implicit any
function processData(data) { // No type!
  return data.map(item => item.value);
}
```

### Proper Typing (GOOD)
```typescript
// GOOD
interface DataItem {
  id: string;
  value: number;
}

function processData(data: DataItem[]): number[] {
  return data.map(item => item.value);
}
```

### Unsafe Assertion (BAD)
```typescript
// BAD - Hiding type errors
const user = data as any;
const name = user.profile.displayName; // No type safety!
```

### Safe Pattern (GOOD)
```typescript
// GOOD - Proper type guard
interface UserData {
  profile?: { displayName?: string };
}

const user = data as UserData;
const name = user.profile?.displayName ?? 'Unknown';
```

### Index Signature (BAD)
```typescript
// BAD - No type safety
function getValue(obj: any, key: string) {
  return obj[key];
}
```

### Proper Typing (GOOD)
```typescript
// GOOD
function getValue<T>(obj: Record<string, T>, key: string): T | undefined {
  return obj[key];
}
```

## Report Format

```markdown
## BUG-FOUND: [file:line]
- **Type:** [Implicit Any / Unsafe Cast / Missing Null Check]
- **Issue:** [Clear description]
- **Fix:** [Specific type fix applied]
```
