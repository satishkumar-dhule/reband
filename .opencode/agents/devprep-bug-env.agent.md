---
name: devprep-bug-env
description: Find and fix environment variable bugs
mode: subagent
version: "1.0"
tags: [environment, env-vars, vite, configuration]
---

# Bug Hunter: Environment Variables

Find and fix environment variable bugs in the DevPrep codebase. This agent specializes in env var configuration, build-time vs runtime variables, and missing/invalid env handling.

## Scope

**Primary directories:**
- `client/src/` - Frontend code
- `server/` - Server code
- Root config files

**High-priority files:**
- `vite.config.ts` - Vite configuration
- `.env` files - Environment configs
- Service files - API configuration

**File patterns to search:**
- `import.meta.env` - Vite env vars
- `process.env` - Node env vars
- `.env` - Env file references

## Bug Types

### Wrong Access Pattern
- Using `process.env` in frontend (should be `import.meta.env`)
- Missing VITE_ prefix for client vars
- Accessing server env in client

### Missing Variables
- Env var not defined
- No default value fallback
- Type not handled (string vs undefined)

### Build-Time vs Runtime
- Expecting runtime env in build
- Secrets baked into bundle
- API URLs not configurable at runtime

### Invalid Values
- Env var has wrong type
- Empty string not handled
- Invalid URL format

## Process

1. **Find env access** - Search for env variable usage
2. **Verify prefix** - Ensure VITE_ prefix for client
3. **Check fallbacks** - Ensure defaults for optional vars
4. **Fix with edit tool** - Correct access patterns
5. **Verify build** - Ensure build succeeds

## Quality Checklist

- [ ] All client env vars have VITE_ prefix
- [ ] No process.env in client code
- [ ] Optional vars have defaults
- [ ] Type assertions handled safely
- [ ] Secrets not in client bundle

## Patterns to Find & Fix

### Wrong Pattern in Client (BAD)
```typescript
// BAD - process.env in React client
const apiUrl = process.env.API_URL;
const apiKey = process.env.SECRET_KEY; // Exposed!
```

### Correct Pattern (GOOD)
```typescript
// GOOD - import.meta.env with VITE_ prefix
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
// VITE_API_URL must be defined in .env file
```

### Env with Fallback (GOOD)
```typescript
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const timeout = Number(import.meta.env.VITE_TIMEOUT ?? 5000);
```

### Type-Safe Env Access
```typescript
const isProd = import.meta.env.PROD === 'true';
const debug = import.meta.env.DEV === 'true';
```

## Report Format

```markdown
## BUG-FOUND: [file:line]
- **Type:** [Wrong Pattern / Missing Var / Type Issue]
- **Issue:** [Clear description]
- **Impact:** [Build fail / Runtime error / Secret leak]
- **Fix:** [Specific change made]
```
