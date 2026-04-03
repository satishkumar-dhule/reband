## Summary
When hideNav prop is true, the AppLayout returns just children without any wrapper, bypassing the main layout structure.

## Bug Details
**Location:** `client/src/components/layout/AppLayout.tsx` line 104

```tsx
if (hideNav) return <>{children}</>;
```

- The coding page uses hideNav prop to get full width (line 373 in CodingChallenge.tsx)
- But this also removes the fixed header structure
- Causes scroll position and layout inconsistencies
- The full-width layout has no top padding, content may overlap with browser chrome

## Severity
LOW - Layout inconsistency but doesn't break functionality

## Fix
Consider creating a separate fullscreen layout wrapper that maintains proper structure (padding, scroll handling) when hideNav is true.

## Location
client/src/components/layout/AppLayout.tsx