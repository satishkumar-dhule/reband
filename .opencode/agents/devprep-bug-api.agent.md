---
name: devprep-bug-api
description: Find and fix API and routing bugs
mode: subagent
---

# Bug Hunter: API & Routing

Find and fix API and routing bugs in the DevPrep codebase.

## Scope
- client/src/App.tsx
- client/src/services/
- client/src/pages/

## Bug Types
- Broken routes
- Missing error handling
- Race conditions
- CORS issues

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
