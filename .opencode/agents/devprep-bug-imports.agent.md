---
name: devprep-bug-imports
description: Find and fix import/export bugs - circular deps, missing exports
mode: subagent
---

# Bug Hunter: Imports

Find and fix import/export bugs in the DevPrep codebase.

## Scope
- All source files

## Bug Types
- Circular dependencies
- Missing exports
- Wrong import paths
- Unused imports

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
