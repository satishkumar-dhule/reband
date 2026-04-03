# Performance Report

## Baseline Metrics

**Date:** 2026-04-01  
**Environment:** GitHub Pages (staging), warm cache, fast connection

### Page Load Times (Cached)

| Page | Load Time | DOMContentLoaded | Notes |
|------|-----------|-------------------|-------|
| Landing (`/`) | 232ms | 232ms | Heaviest page — hero animations |
| Channel Browser | 116ms | 116ms | Moderate — channel grid |
| Login | 105ms | 105ms | Lightest — simple form |
| Algorithms Channel | 118ms | 118ms | Moderate — question list |
| Interview | 123ms | 114ms | Moderate — voice UI |

### Bundle Analysis

| Metric | Value | Target |
|--------|-------|--------|
| Total JS (uncompressed) | ~7-8 MB | <3 MB |
| Total JS (gzipped) | ~2-3 MB | <500 KB |
| Vendor chunks | 27 | <15 |
| CSS files | 5 | 1-2 |

### Identified Bottlenecks

#### Critical (P0)
- CSS duplication (5 files, ~2000 lines of overlap)
- MUI bundled in production (~800 KB)
- Mermaid preloaded eagerly (2.9 MB)
- No critical CSS inlining
- Missing resource hints

#### High (P1)
- 27 vendor chunks (HTTP overhead)
- 9 nested context providers
- 20+ lazy-loaded page imports
- Langchain/Qdrant in client bundle

## Optimization Plan

See `perf/optimization-plan.md` for full details.

### Priority Actions
1. **CSS Consolidation** — Merge duplicate CSS, inline critical styles
2. **MUI Removal** — Replace with lighter alternatives or defer
3. **Heavy Module Deferral** — Lazy load mermaid, monaco-editor
4. **Bundle Consolidation** — Reduce 27 chunks to ~15
5. **Provider Tree Flattening** — Reduce 9 levels to <5

## CI Performance Monitoring

The `perf-measure.yml` workflow runs on:
- Pull requests to staging
- Scheduled baseline measurements
- Manual performance regression checks

Results stored in `perf/perf-results.json` with screenshots in `perf/screenshots/`.