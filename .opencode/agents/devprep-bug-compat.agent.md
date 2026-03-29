---
name: devprep-bug-compat
description: Find and fix browser compatibility bugs
mode: subagent
---

# Bug Hunter: Browser Compatibility

Find and fix browser compatibility bugs in the DevPrep codebase.

## Scope
- client/src/

## Bug Types
- Missing polyfills
- Missing vendor prefixes
- API compatibility issues
- Feature detection missing

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
