---
name: devprep-bug-deadcode
description: Find and remove dead code - unused vars, unreachable code
mode: subagent
---

# Bug Hunter: Dead Code

Find and remove dead code in the DevPrep codebase.

## Scope
- All source files

## Bug Types
- Unused variables
- Unreachable code
- Unused imports
- Dead components

## Process
1. Read files thoroughly
2. Identify dead code
3. Remove using edit tool
4. Report in format:

```
## BUG-FOUND: [file:line]
- Issue: [description]
- Fix: [what you removed]
```
