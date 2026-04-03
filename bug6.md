## Summary
When running Python code, Pyodide (~10MB) needs to be loaded. There is no visual feedback to the user during this loading process.

## Bug Details
**Location:** `client/src/lib/pyodide-runner.ts` initPyodide() function

- initPyodide() is called when Python execution starts (line 109 in coding-challenges.ts)
- The user sees no indication that Python runtime is being loaded
- No loading spinner or "Loading Python runtime..." message
- User may think the app is frozen while Pyodide downloads

## Severity
LOW - Poor user experience but doesn't break functionality

## Fix
Add a loading state that shows "Loading Python runtime..." when Pyodide is being initialized. Use the existing isRunning state in CodingChallenge.tsx to show this message.

## Location
client/src/lib/pyodide-runner.ts, client/src/pages/CodingChallenge.tsx