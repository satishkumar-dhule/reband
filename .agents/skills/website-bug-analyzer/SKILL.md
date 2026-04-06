---
name: website-bug-analyzer
description: Analyzes websites for UI/UX bugs and creates structured bug reports for GitHub issues.
---

# Skill: Website Bug Analyzer

## Overview

This skill enables AI agents to analyze websites for UI/UX bugs and create structured bug reports for GitHub issues.

## When to Use

Use this skill when:
- User asks to "analyze" a website/page for bugs
- User asks to "check" a page for issues
- User asks to "audit" a specific URL
- User asks to "create bugs" from a live website
- User provides a URL and asks for bug analysis

## Prerequisites

- webfetch tool for fetching page content
- gh CLI for creating issues (if token has access)
- Knowledge of common bug patterns in web apps

## Workflow

### Step 1: Fetch Page Content

Use webfetch to get the page HTML:

```javascript
webfetch({
  format: "html",
  url: "https://example.com/page"
})
```

### Step 2: Analyze for Common Bug Patterns

| Bug Category | What to Look For |
|--------------|------------------|
| **JSX/HTML Structure** | Mismatched tags, unclosed divs, broken nesting |
| **CSS/Layout** | Missing flex properties, wrong height/width, overflow issues |
| **Missing Components** | States referenced but never rendered |
| **State Management** | Confusing variable names, inverted logic |
| **Accessibility** | Missing labels, contrast issues |
| **Loading States** | No feedback for async operations |

### Step 3: Identify Specific Bugs

For each bug found, document:
1. **Location**: File and line number
2. **Description**: What the bug is
3. **Current Code**: Actual problematic code
4. **Expected**: What should happen
5. **Severity**: HIGH/MEDIUM/LOW

### Step 4: Create Bug Report File (Fallback)

If GitHub issues cannot be created (permission issues):

```markdown
# Page Bug Report

URL: https://...
Date: YYYY-MM-DD

## Bug #1: Title
**Location:** file:line
**Severity:** HIGH
**Description:** ...
**Current Code:** ...
**Fix:** ...
```

### Step 5: Create GitHub Issues (If Possible)

If token has access:

```bash
gh issue create --repo owner/repo \
  --title "[BUG] PageName: Bug Title (SEVERITY)" \
  --body "## Summary
...

## Location
file:line

## Severity
HIGH/MEDIUM/LOW

## Steps to Reproduce
1. ...
" \
  --label "bug"
```

## Analysis Checklist

### HTML/JSX Structure
- [ ] All tags properly closed
- [ ] Correct nesting hierarchy
- [ ] No orphaned closing tags
- [ ] Valid attribute syntax

### CSS/Layout
- [ ] Flex containers have proper height constraints
- [ ] Percentage-based heights work in context
- [ ] No z-index conflicts
- [ ] Responsive breakpoints work

### State Management
- [ ] State names match what they control
- [ ] Toggle logic is intuitive
- [ ] State updates trigger re-renders

### Component Rendering
- [ ] Conditional rendering states all handled
- [ ] Modal/overlay components render when triggered
- [ ] Loading states shown for async operations

### Accessibility
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient

## Common Bug Patterns by Page Type

### Coding Pages (Monaco Editor)
- Editor height not filling container
- Test results panel height issues
- Python runtime loading states missing

### Form Pages
- Validation not showing
- Submit button disabled incorrectly
- Form state not persisting

### Navigation Pages
- Active state incorrect
- Mobile menu not toggling
- Back navigation broken

### Modal/Dialog Pages
- Modal not rendering when triggered
- Close button not working
- Overlay not appearing

## Output Format

### Bug Report (File or GitHub)

```markdown
## Bug #N: Title

**Severity:** HIGH/MEDIUM/LOW
**Location:** client/src/pages/Page.tsx:line
**Component:** ComponentName

### Description
What the bug is and its impact.

### Current Code
```tsx
// problematic code
```

### Fix
How to fix it.

### Verification
- [ ] TypeScript compiles
- [ ] Tested in browser
```

## Error Handling

| Issue | Solution |
|-------|----------|
| 403 on issue creation | Create local bug report file |
| Page not loading | Try alternative fetch method |
| Complex JS issues | Document in bug report, suggest manual review |

## Integration

This skill works with:
- `bug-fix-workflow` skill - for fixing found bugs
- `github-tasks` skill - for GitHub issue creation
- `browser-use` skill - for interactive testing
- `audit-website` skill - for comprehensive audits

## Example: Analyze Coding Page

```javascript
// 1. Fetch the page
webfetch({
  format: "html",
  url: "https://0549bf25-8b00-4962-9d5a-36a4873ce972-00-19pzj0ylowvtm.riker.replit.dev:8000/coding/cc33"
})

// 2. Analyze - found JSX bug at lines 520-559
// 3. Create bug report
// 4. Try to create GitHub issue (if access)
```

## Best Practices

1. **Be specific** - Include exact file paths and line numbers
2. **Show code** - Include problematic code snippet
3. **Categorize severity** - HIGH breaks functionality, LOW is cosmetic
4. **Suggest fix** - Point to the likely solution
5. **Verify after fix** - Re-analyze to confirm bug is resolved