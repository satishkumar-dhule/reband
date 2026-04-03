# Coding Page UI Bugs Report

Date: 2026-04-03
Page: /coding/cc33 (Coding Challenge View)
File: client/src/pages/CodingChallenge.tsx

---

## Bug #1: JSX Structure/Indentation Bug (HIGH SEVERITY)

**Location:** `client/src/pages/CodingChallenge.tsx` lines 520-559

**Description:**
The challenge view has broken JSX structure causing layout issues. The indentation and nesting of divs in the right pane is incorrect.

**Current Code (problematic):**
```tsx
{/* Right Pane - Editor & Results */}
<div className={`flex-1 flex flex-col min-w-0 bg-[var(--gh-canvas)] ${!resultsExpanded ? 'flex' : 'hidden lg:flex'}`}>
  {/* Editor Toolbar */}
  <div className="h-10 border-b bg-[var(--gh-canvas-subtle)] flex items-center justify-between px-4 shrink-0">
    <div className="flex items-center gap-2">
      <Code className="w-4 h-4 text-[var(--gh-fg-muted)]" />
      <span className="text-xs font-medium text-[var(--gh-fg-muted)] uppercase tracking-wider">Code Editor</span>
    </div>
  <div className="flex items-center gap-1">  {/* <- Missing closing div for toolbar content */}
    <Button variant="ghost" size="sm" ...>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
    <Button variant="ghost" size="sm" ...>
      <RotateCcw className="w-3.5 h-3.5" />
    </Button>
  </div>
  </div>  {/* <- Extra closing div here */}
```

**Issue:**
- Line 528-535: The toolbar inner content `<div className="flex items-center gap-1">` is never properly closed before the toolbar wrapper closes
- Line 536: The closing `</div>` on line 536 closes the wrong element

**Fix Required:**
```tsx
<div className="h-10 border-b bg-[var(--gh-canvas-subtle)] flex items-center justify-between px-4 shrink-0">
  <div className="flex items-center gap-2">
    <Code className="w-4 h-4 text-[var(--gh-fg-muted)]" />
    <span className="text-xs font-medium text-[var(--gh-fg-muted)] uppercase tracking-wider">Code Editor</span>
  </div>
  <div className="flex items-center gap-1">
    {/* ... buttons ... */}
  </div>
</div>
```

---

## Bug #2: Missing Success Modal (MEDIUM SEVERITY)

**Location:** `client/src/pages/CodingChallenge.tsx`

**Description:**
The `showSuccessModal` state exists (line 209) and is set to true when all tests pass (line 325), but the modal component is never rendered anywhere in the component.

**Code References:**
- Line 209: `const [showSuccessModal, setShowSuccessModal] = useState(false);`
- Line 325: `setShowSuccessModal(true);`
- **Missing:** Actual modal component rendering

**Fix Required:**
Add a success modal that displays when `showSuccessModal` is true, showing:
- Congratulations message
- Stats (time spent, tests passed)
- Options to continue (next challenge, review solution, back to list)

---

## Bug #3: Mobile Tab Switcher Logic Inconsistency (MEDIUM SEVERITY)

**Location:** `client/src/pages/CodingChallenge.tsx` lines 430-447

**Description:**
The mobile tab switcher toggles `resultsExpanded` state, but this naming is confusing and the logic seems inverted for the actual UI behavior.

**Current Code:**
```tsx
<div className="lg:hidden flex border-b bg-[var(--gh-canvas)]">
  <Button
    variant={resultsExpanded ? 'secondary' : 'ghost'}
    size="sm"
    onClick={() => setResultsExpanded(true)}
    className={`flex-1 rounded-none ${resultsExpanded ? 'border-b-2 border-[var(--gh-accent-fg)]' : ''}`}
  >
    Description
  </Button>
  <Button
    variant={!resultsExpanded ? 'secondary' : 'ghost'}
    size="sm"
    onClick={() => setResultsExpanded(false)}
    className={`flex-1 rounded-none ${!resultsExpanded ? 'border-b-2 border-[var(--gh-accent-fg)]' : ''}`}
  >
    Code Editor
  </Button>
</div>
```

**Issue:**
- When "Description" is clicked, `resultsExpanded` is set to `true`
- But the left pane (description) uses `resultsExpanded` with `hidden lg:flex` pattern (line 450)
- This means when `resultsExpanded` is true, the description is shown on desktop but the toggle suggests mobile behavior

**Fix Required:**
Rename state to be more semantic (e.g., `showDescription`) and fix the toggle logic to correctly show/hide panes.

---

## Bug #4: Test Results Panel Height Issue (MEDIUM SEVERITY)

**Location:** `client/src/pages/CodingChallenge.tsx` line 59 (TestOutputPanel)

**Description:**
The test results panel has fixed height constraints that may not work well with the flex layout.

**Current Code:**
```tsx
<div className={`border-t flex flex-col bg-[var(--gh-canvas)] transition-all duration-300 ${isExpanded ? 'h-1/3 min-h-[200px]' : 'h-10'}`}>
```

**Issue:**
- `h-1/3` uses percentage-based height which requires the parent to have explicit height
- The parent container may not have proper height constraints causing the panel to not resize correctly
- On smaller viewports, `min-h-[200px]` may cause overflow

**Fix Required:**
Use flex properties or viewport-relative units instead of percentage-based heights.

---

## Bug #5: CodeEditor Height Not Filling Container (MEDIUM SEVERITY)

**Location:** `client/src/pages/CodingChallenge.tsx` lines 538-546

**Description:**
The CodeEditor component is inside a flex container but may not properly fill the available space.

**Current Code:**
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

**Issue:**
- `height="100%"` may not work correctly with flex containers
- The Monaco Editor needs explicit height constraints

**Fix Required:**
Ensure the container has explicit height (using flex properties) and pass appropriate height to CodeEditor.

---

## Bug #6: Pyodide Loading State Not Shown (LOW SEVERITY)

**Location:** `client/src/lib/coding-challenges.ts` and `client/src/pages/CodingChallenge.tsx`

**Description:**
When running Python code, Pyodide (~10MB) needs to be loaded. There's no visual feedback to the user during this loading process.

**Issue:**
- `initPyodide()` is called when Python execution starts
- The user sees no indication that Python is being loaded
- No loading spinner or "Loading Python runtime..." message

**Fix Required:**
Add a loading state that shows "Loading Python runtime..." when Pyodide is being initialized.

---

## Bug #7: FullWidth Layout Without Header (LOW SEVERITY)

**Location:** `client/src/components/layout/AppLayout.tsx` line 104

**Description:**
When `hideNav` is true, the AppLayout returns just children without any wrapper, bypassing the main layout structure.

**Current Code:**
```tsx
if (hideNav) return <>{children}</>;
```

**Issue:**
- The coding page uses `hideNav` to get full width
- But this also removes the fixed header structure
- Causes scroll position and layout inconsistencies

**Fix Required:**
Consider creating a separate fullscreen layout or wrapping children in a proper container when hideNav is true.

---

## Summary

| Bug # | Title | Severity | Component |
|-------|-------|----------|-----------|
| 1 | JSX Structure Bug | HIGH | CodingChallenge.tsx |
| 2 | Missing Success Modal | MEDIUM | CodingChallenge.tsx |
| 3 | Mobile Tab Switcher Logic | MEDIUM | CodingChallenge.tsx |
| 4 | Test Results Panel Height | MEDIUM | CodingChallenge.tsx |
| 5 | CodeEditor Height | MEDIUM | CodingChallenge.tsx |
| 6 | Pyodide Loading State | LOW | pyodide-runner.ts |
| 7 | FullWidth Layout | LOW | AppLayout.tsx |
