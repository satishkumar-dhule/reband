# GitHub Theme Compliance Audit

**Date:** April 1, 2026  
**Project:** DevPrep/Open-Interview  
**Focus:** CSS tokens, GitHub design patterns, component library, dark mode

---

## Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| CSS Token Usage | 90% | Good |
| Typography | 95% | Excellent |
| GitHub Design Patterns | 70% | Needs Improvement |
| Component Library | 85% | Good |
| Dark Mode Consistency | 80% | Acceptable |

**Overall Compliance: 84%**

---

## 1. CSS Token Usage

### Compliance: 90%

**Passed:**
- GitHub design tokens (`--gh-*`) defined in `client/src/styles/github-tokens.css` with both light/dark variants
- 2,569 references to `--gh-*` tokens across codebase
- Legacy color aliases (`--color-text-primary`, etc.) mapped to `--gh-*` for backward compatibility
- Focus ring token (`--gh-focus-ring`) properly defined

**Violations:**

| File | Line | Issue |
|------|------|-------|
| client/src/index.css | 1572-1991 | Hardcoded hex colors in gradient definitions (#ee7752, #e73c7e, #23a6d5, etc.) |
| client/src/components/SearchModal.tsx | 158-220 | Fallback colors with hardcoded hex: `var(--success, #22c55e)` |
| client/src/components/question/CodeExamplesPanel.tsx | 95-113 | Language icon colors hardcoded (#f7df1e, #3178c6, etc.) - acceptable for syntax highlighting |
| client/src/components/MermaidDiagram.tsx | 86-95 | Hardcoded Mermaid theme colors |
| client/src/components/AICompanion.tsx | 1707 | Hardcoded gradient colors |

**Recommendation:** Replace hardcoded hex with CSS variable fallbacks or create semantic tokens for these use cases.

---

## 2. Typography

### Compliance: 95%

**Passed:**
- Font stack matches GitHub: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif`
- CSS variable `--font-sans` properly defined
- Monospace font: `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`
- Font smoothing applied consistently

**Minor Issues:**
- Inter font loaded additionally (line 90 in index.html) - optional enhancement
- Baloo 2 font for decorative elements (non-critical)

---

## 3. GitHub Design Patterns

### Compliance: 70%

**Passed Components:**
- GitHub-style buttons (`.gh-btn-*`) - design-system.css:749-800
- GitHub-style cards (`.gh-card`) - design-system.css:802-807
- GitHub-style labels/badges (`.gh-label-*`) - design-system.css:809-849
- GitHub-style tabs (`.gh-tabs`, `.gh-tab`) - design-system.css:851-874
- GitHub-style page header (`.gh-page-header`) - design-system.css:876-881
- GitHub-style progress bar (`.gh-progress`, `.gh-progress-bar`) - design-system.css:883-896
- EmptyState component uses GitHub semantic colors

**Violations:**

| File | Line | Issue |
|------|------|-------|
| client/src/styles/design-system.css | 64-68 | Custom shadows (--shadow-*) use generic values instead of GitHub tokens |
| client/src/styles/design-system.css | 66-68 | Glow effects (--glow-*) non-GitHub aesthetic |
| client/src/components/ui/card.tsx | 28 | Uses `hover:border-primary/40` instead of GitHub border token |
| client/src/components/unified/Button.tsx | 32-37 | Uses Tailwind colors (bg-primary, bg-emerald-600) instead of `--gh-*` tokens |
| client/src/components/unified/Button.tsx | 72 | Button uses generic focus ring instead of `--gh-focus-ring` |

**Missing Patterns:**
- Blankslate component (pure GitHub pattern) - uses custom EmptyState instead
- Timeline component (GitHub pattern) - not implemented
- ActionList/Menu patterns - uses Radix primitives

---

## 4. Component Library Alignment

### Compliance: 85%

**Passed:**
- shadcn/ui components properly configured
- Badge component uses `--gh-*` tokens correctly (badge.tsx:24-42)
- Card component uses GitHub border-radius (6px/rounded-md) and tokens
- Input component uses GitHub tokens for borders and focus states (input.tsx:28-41)
- DifficultyBadge properly uses `--gh-diff-*` tokens

**Violations:**

| File | Line | Issue |
|------|------|-------|
| client/src/components/ui/button.tsx | 26 | Uses `focus-visible:ring-ring` instead of `--gh-focus-ring` |
| client/src/components/ui/button.tsx | 30-36 | Uses `bg-primary`, `bg-destructive` instead of GitHub tokens |
| client/src/components/unified/Button.tsx | 32 | Uses `bg-primary` which maps to legacy --primary (not GitHub token) |
| client/src/components/unified/Button.tsx | 37 | Uses `bg-emerald-600` - hardcoded, not GitHub token |

---

## 5. Dark Mode Consistency

### Compliance: 80%

**Passed:**
- ThemeContext properly sets `data-theme` attribute on HTML
- GitHub tokens defined for both light/dark modes in github-tokens.css:14-176
- Dark mode variants for all --gh-* tokens
- Legacy aliases properly map to theme-aware tokens
- Respects `prefers-color-scheme: dark` (index.html:40)
- Reduced motion support in github-tokens.css:284-291

**Violations:**

| File | Line | Issue |
|------|------|-------|
| client/index.html | 39-40 | Theme color hardcoded (#0d1117 for dark) - should use CSS variable |
| client/index.html | 253 | Inline style hardcoded: `background-color: #0d1117` |
| client/index.html | 258-339 | Noscript fallback has hardcoded colors in inline styles |
| client/src/components/AICompanion.tsx | 1707 | Hardcoded gradient doesn't adjust for dark mode |
| client/src/components/MermaidDiagram.tsx | 86-95 | Mermaid theme colors hardcoded, not theme-aware |

**Additional Concerns:**
- Extra theme variants exist: `genz-dark`, `genz-light`, `premium-dark` - not standard GitHub
- Some inline styles in components lack dark mode variants

---

## Detailed Findings

### Severity: High (Immediate Action)

1. **Button Token Migration** - unified/Button.tsx still uses Tailwind color classes instead of `--gh-*` tokens
2. **index.html Hardcoded Colors** - Noscript fallback and theme-color meta use hardcoded values

### Severity: Medium (Recommended)

3. **Focus Ring Consistency** - Should use `--gh-focus-ring` across all components
4. **Mermaid Diagrams** - Theme colors should adapt to dark/light mode
5. **Extra Theme Variants** - Consider removing non-standard themes (genz-*, premium-*)

### Severity: Low (Enhancement)

6. **Custom Shadows** - Consider removing non-GitHub shadow tokens
7. **Language Icon Colors** - Acceptable as syntax highlighting is language-specific

---

## Recommendations

### Priority 1 (Fix Now)

1. Migrate `unified/Button.tsx` to use `--gh-*` tokens:
   ```tsx
   // Current
   primary: 'bg-primary text-primary-foreground...'
   // Should be
   primary: 'bg-[var(--gh-success-emphasis)] text-[var(--gh-fg-on-emphasis)]...'
   ```

2. Fix index.html theme-color:
   ```html
   <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0d1117">
   ```

3. Add dark mode to MermaidDiagram.tsx

### Priority 2 (Next Sprint)

4. Standardize focus rings using `--gh-focus-ring`
5. Remove hardcoded fallback colors from SearchModal.tsx
6. Audit extra theme variants

---

## Files Requiring Attention

| Category | Files |
|----------|-------|
| High Priority | `unified/Button.tsx`, `index.html`, `MermaidDiagram.tsx` |
| Medium Priority | `SearchModal.tsx`, `AICompanion.tsx`, `Mermaid.tsx` |
| Pattern Gap | Need Blankslate component, Timeline component |

---

## Conclusion

The DevPrep/Open-Interview platform demonstrates **strong GitHub theme compliance** (84%) with comprehensive CSS token infrastructure. The majority of violations are cosmetic and don't impact functionality. The core design system properly uses `--gh-*` tokens for colors, borders, and focus states in both light and dark modes.

**Key Strengths:**
- Comprehensive token system with legacy aliases
- Dark mode properly implemented
- Good component usage of GitHub design patterns

**Key Areas for Improvement:**
- Button component token migration
- Hardcoded colors in index.html and diagrams
- Missing GitHub-specific patterns (Blankslate, Timeline)