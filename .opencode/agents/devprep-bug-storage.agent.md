---
name: devprep-bug-storage
description: Find and fix localStorage/cookies bugs
mode: subagent
---

# Bug Hunter: Storage

Find and fix localStorage/cookies bugs in the DevPrep codebase.

## Scope
- client/src/

## Bug Types
- Missing try/catch for storage
- Size limits ignored
- Parsing errors
- Sync issues with DB

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
