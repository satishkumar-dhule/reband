---
name: devprep-bug-lifecycle
description: Find and fix component lifecycle bugs - useEffect cleanup, mount/unmount
mode: subagent
---

# Bug Hunter: Component Lifecycle

Find and fix component lifecycle bugs in the DevPrep codebase.

## Scope
- client/src/

## Bug Types
- useEffect cleanup missing
- Wrong lifecycle usage
- Double renders
- Mount/unmount issues

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
