---
name: devprep-bug-async
description: Find and fix async/await bugs - unhandled rejections, promise leaks
mode: subagent
---

# Bug Hunter: Async/Await

Find and fix async/await bugs in the DevPrep codebase.

## Scope
- All source files

## Bug Types
- Unhandled rejections
- Missing await
- Promise leaks
- Race conditions

## Process
1. Read files thoroughly
2. Identify bugs
3. Fix using edit tool
4. Report in format:

```
## BUG-FOUND: [file:line]
- Issue: [description]
- Fix: [what you changed]
```
