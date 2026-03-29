---
name: devprep-bug-errors
description: Find and fix error handling issues - try/catch, unhandled rejections
mode: subagent
---

# Bug Hunter: Error Handling

Find and fix error handling issues in the DevPrep codebase.

## Scope
- All source files

## Bug Types
- Missing try/catch
- Silent failures
- Unhandled promise rejections
- Missing error boundaries

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
