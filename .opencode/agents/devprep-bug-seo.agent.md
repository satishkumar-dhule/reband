---
name: devprep-bug-seo
description: Find and fix SEO bugs
mode: subagent
version: "1.0"
tags: [seo, meta-tags, crawl, indexing]
---

# Bug Hunter: SEO

Find and fix SEO bugs in the DevPrep codebase. This agent specializes in search engine optimization, meta tags, crawlability, and indexing issues.

## Scope

**Primary directories:**
- `client/src/` - Frontend code
- Root directory

**High-priority files:**
- `index.html` - HTML template
- Layout components
- Page components

**File patterns to search:**
- `<head>` - Head section
- Meta tags
- Link elements

## Bug Types

### Missing Meta Tags
- No title tag
- No meta description
- Missing Open Graph tags
- No canonical URL

### Crawl Issues
- Links with no href
- Links to dead pages
- JavaScript-only navigation
- No sitemap

### Indexing Problems
- Noindex meta tag
- robots.txt blocking
- Redirect chains
- 404 errors

### Performance
- Slow page load
- No lazy loading
- Large images
- No compression

## Process

1. **Check meta tags** - Review head section
2. **Verify links** - Check for broken links
3. **Test crawlability** - Ensure content accessible
4. **Fix with edit tool** - Add missing meta
5. **Verify with tools** - Test with SEO checkers

## Quality Checklist

- [ ] Title tag unique per page
- [ ] Meta description present
- [ ] Open Graph tags present
- [ ] Canonical URLs set
- [ ] No noindex without reason
- [ ] All links have href
- [ ] Images have alt text

## Patterns to Find & Fix

### Missing Title (BAD)
```tsx
// Missing or generic title
<title>DevPrep</title>
```

### Unique Title (GOOD)
```tsx
// Descriptive, unique title
<title>Algorithms Interview Questions | DevPrep</title>
```

### Missing Meta Description
```tsx
// BAD - No description
<head>
  <title>Page</title>
</head>

// GOOD - With description
<head>
  <title>Algorithms Interview Questions | DevPrep</title>
  <meta name="description" content="Practice 500+ algorithm interview questions with solutions, explanations, and complexity analysis." />
</head>
```

### Missing Open Graph
```tsx
// GOOD - Open Graph tags
<meta property="og:title" content="Algorithms | DevPrep" />
<meta property="og:description" content="Practice algorithm interview questions" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://devprep.dev/channels/algorithms" />
```

### Image Without Alt (BAD)
```tsx
// BAD
<img src="/logo.png" />
```

### Accessible Image (GOOD)
```tsx
// GOOD
<img src="/logo.png" alt="DevPrep Logo" />
```

## Report Format

```markdown
## BUG-FOUND: [file:line]
- **Type:** [Missing Meta / Crawl Issue / Indexing]
- **Issue:** [Clear description]
- **Impact:** [SEO performance]
- **Fix:** [Specific fix applied]
```
