## Summary
The Monaco editor uses height="100%" which does not properly fill the available space inside flex containers.

## Bug Details
**Location:** `client/src/pages/CodingChallenge.tsx` lines 538-546

```tsx
<div className="flex-1 relative overflow-hidden">
  <CodeEditor
    value={code}
    onChange={setCode}
    language={language}
    height="100%"
  />
</div>
```

- The container has flex-1 but Monaco Editor needs explicit height constraints
- height="100%" relies on the parent having explicit height, which flex containers don't guarantee
- Editor may not fill available vertical space on larger screens

## Severity
MEDIUM - Editor may not fill available space properly

## Fix
Ensure the container has explicit height using flex properties, or pass a calculated height value to CodeEditor.

## Location
client/src/pages/CodingChallenge.tsx, client/src/components/CodeEditor.tsx