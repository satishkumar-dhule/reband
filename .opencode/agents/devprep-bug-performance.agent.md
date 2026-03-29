---
name: devprep-bug-performance
description: Find and fix performance issues - memoization, re-renders, expensive operations
mode: subagent
---

# Bug Hunter: Performance

Find and fix performance issues in the DevPrep codebase.

## Scope
- client/src/

## Bug Types
- Missing useMemo/useCallback
- Expensive operations in render
- Large list rendering without virtualization
- Prop drilling
- Unnecessary re-renders

## Process
1. Read files thoroughly
2. Identify issues
3. Fix using edit tool
4. Report in format:

```
## BUG-FOUND: [file:line]
- Issue: [description]
- Fix: [what you changed]
```
