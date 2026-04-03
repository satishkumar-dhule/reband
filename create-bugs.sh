#!/bin/bash
# Create GitHub issues for coding page UI bugs

REPO="open-interview/open-interview"

# Issue 1: JSX Structure Bug (HIGH)
gh issue create \
  --repo "$REPO" \
  --title "[BUG] Coding Page: JSX Structure Bug - Layout Broken" \
  --body '## Summary
The challenge view in CodingChallenge.tsx has a broken JSX structure causing layout issues.

## Bug Details
**Location:** `client/src/pages/CodingChallenge.tsx` lines 520-559

The right pane (editor & results) has mismatched closing tags in the toolbar section:

```tsx
<div className="h-10 ...">
  <div className="flex items-center gap-2">...</div>
<div className="flex items-center gap-1">  // Missing closing div!
  ...
</div>
</div>  // Extra closing div
```

## Severity
HIGH - Causes layout breaks, toolbar buttons misaligned, test panel breaks

## Steps to Reproduce
1. Navigate to /coding/cc33 or any specific challenge
2. Observe the layout issues with the code editor and test results panel' \
  --label "bug"

# Issue 2: Missing Success Modal
gh issue create \
  --repo "$REPO" \
  --title "[BUG] Coding Page: Success Modal Never Renders" \
  --body '## Summary
The showSuccessModal state is set to true when tests pass but the modal is never rendered.

## Bug Details
- Line 209: `const [showSuccessModal, setShowSuccessModal] = useState(false);`
- Line 325: `setShowSuccessModal(true);` (called when all tests pass)
- Missing: Modal component rendering

## Severity
MEDIUM - User gets no feedback on success

## Fix
Add success modal component that shows congratulations, time spent, and options to continue.' \
  --label "bug"

# Issue 3: Mobile Tab Switcher Logic
gh issue create \
  --repo "$REPO" \
  --title "[BUG] Coding Page: Mobile Tab Switcher Has Inverted Logic" \
  --body '## Summary
The mobile tab switcher uses resultsExpanded state which has confusing/inverted logic.

## Bug Details
**Location:** `client/src/pages/CodingChallenge.tsx` lines 430-447

- When "Description" is clicked, resultsExpanded is set to true
- But the left pane uses resultsExpanded with hidden pattern
- The toggle logic is inverted from what it should be

## Severity
MEDIUM - Mobile users see wrong tab content

## Fix
Rename to showDescription and fix toggle logic.' \
  --label "bug"

# Issue 4: Test Results Panel Height
gh issue create \
  --repo "$REPO" \
  --title "[BUG] Coding Page: Test Panel Height Uses Invalid Percentage" \
  --body '## Summary
The test results panel uses h-1/3 which requires explicit parent height.

## Bug Details
**Location:** `client/src/pages/CodingChallenge.tsx` line 59

```tsx
<div className={`... ${isExpanded ? 'h-1/3 min-h-[200px]' : 'h-10'}`}>
```

h-1/3 uses percentage which breaks in flex containers.

## Severity
MEDIUM - Panel may not resize correctly

## Fix
Use flex properties or viewport units instead.' \
  --label "bug"

# Issue 5: CodeEditor Height
gh issue create \
  --repo "$REPO" \
  --title "[BUG] Coding Page: CodeEditor Height Not Filling Container" \
  --body '## Summary
The Monaco editor uses height="100%" which does not work in flex containers.

## Bug Details
**Location:** `client/src/pages/CodingChallenge.tsx` lines 538-546

The editor container has flex-1 but Monaco needs explicit height.

## Severity
MEDIUM - Editor may not fill available space

## Fix
Ensure container has explicit height constraints.' \
  --label "bug"

echo "Created 5 bug issues!"