---
name: devprep-bug-memory
description: Find and fix memory leaks - subscriptions, event listeners, timers
mode: subagent
---

# Bug Hunter: Memory Leaks

Find and fix memory leaks in the DevPrep codebase.

## Scope
- client/src/

## Bug Types
- Uncleaned subscriptions
- Event listener leaks
- Timer leaks (setInterval without clear)
- Closure leaks
- useEffect without cleanup

## Process
1. Read files thoroughly
2. Identify leaks
3. Fix using edit tool
4. Report in format:

```
## BUG-FOUND: [file:line]
- Issue: [description]
- Fix: [what you changed]
```
