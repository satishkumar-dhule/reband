# DevPrep Performance Optimization Plan

**Date:** 2026-04-01  
**Author:** devprep-coordinator (Performance Optimization Swarm)  
**Goal:** Sub-100ms TTI for cached pages, <1.5s FCP on cold load, <500KB total JS budget

---

## 1. Current State Analysis

### 1.1 Baseline Metrics (from `perf/perf-results.json`)

| Page | Load Time (cached) | DOMContentLoaded | Notes |
|---|---|---|---|
| Landing (`/`) | 232ms | 232ms | Heaviest page — hero animations |
| Channel Browser | 116ms | 116ms | Moderate — channel grid |
| Login | 105ms | 105ms | Lightest — simple form |
| Algorithms Channel | 118ms | 118ms | Moderate — question list |
| Interview | 123ms | 114ms | Moderate — voice UI |

> **Caveat:** These are warm-cache measurements on a fast connection. Real-world cold-start on mobile 3G will be 5-10× higher. No Web Vitals (LCP, FCP, CLS, INP) are being measured.

### 1.2 Bundle Architecture

The current `vite.config.ts` defines **27 vendor chunks** via `manualChunks()`:

| Chunk | Libraries | Estimated Size | Priority |
|---|---|---|---|
| `vendor-mermaid` | mermaid | ~2.9 MB | P0 — defer entirely |
| `vendor-editor` | @monaco-editor/react | ~1.5 MB | P0 — defer entirely |
| `vendor-mui` | @mui/material, icons, lab | ~800 KB | P0 — replace or defer |
| `vendor-ai` | @langchain/*, @qdrant/* | ~500 KB | P1 — tree-shake |
| `vendor-react` | react, react-dom | ~140 KB | P2 — acceptable |
| `vendor-markdown` | react-markdown, remark-*, rehype-* | ~300 KB | P1 — defer |
| `vendor-syntax` | react-syntax-highlighter | ~200 KB | P1 — defer |
| `vendor-radix` | @radix-ui/* (22 packages) | ~150 KB | P2 — acceptable |
| `vendor-icons` | lucide-react | ~100 KB | P2 — acceptable |
| `vendor-charts` | recharts | ~200 KB | P2 — defer |
| `vendor-motion` | framer-motion | ~150 KB | P2 — acceptable |
| `vendor-query` | @tanstack/react-query | ~50 KB | P3 — fine |
| `vendor-forms` | react-hook-form, @hookform/* | ~40 KB | P3 — fine |
| `vendor-date` | date-fns | ~30 KB | P3 — fine |
| `vendor-router` | wouter | ~10 KB | P3 — fine |
| `vendor-libs` | catch-all for remaining | ~200 KB | P2 — audit |
| 12 micro-chunks | cmdk, sonner, vaul, otp, etc. | ~5-15 KB each | P1 — consolidate |

**Total estimated JS payload:** ~7-8 MB uncompressed, ~2-3 MB gzip.

### 1.3 Identified Bottlenecks

#### Critical (P0)
1. **CSS duplication bloat** — 5 CSS files with massive overlap. `index.css` alone is 1943+ lines with 7 complete theme definitions (dark, light, genz-dark, genz-light, premium-dark, pro-aurora, pro-obsidian, pro-sapphire, pro-emerald, pro-ruby, pro-amethyst). Same variables defined in `design-system.css`, `genz-design-system.css`, `github-tokens.css`, AND `index.css`.
2. **MUI bundled in production** — `@mui/material`, `@mui/icons-material`, `@mui/lab` are ~800 KB and used minimally (mostly for icons). This is the single largest avoidable dependency.
3. **Mermaid 2.9 MB preloaded eagerly** — `preloadHeavyModules()` starts loading mermaid after just 3 seconds, competing with user interaction.
4. **No critical CSS inlining** — All CSS is loaded via separate `<link>` tags, blocking first paint.
5. **No resource hints** — Missing `<link rel="preconnect">`, `<link rel="dns-prefetch">`, `<link rel="preload">` for critical assets.

#### High (P1)
6. **27 vendor chunks** — Too many small chunks cause HTTP request overhead. The 12 micro-chunks (5-15 KB each) should be consolidated.
7. **9 nested context providers** — Each provider adds a React render pass. The provider tree in `App()` has 9 levels of nesting.
8. **20+ lazy-loaded page imports** — All page imports are declared at module scope, meaning Webpack/Vite must parse all 20 page files even if only 1 is rendered.
9. **No Web Vitals measurement** — The perf tool only measures `loadEventEnd - navigationStart`, which misses LCP, FCP, CLS, INP entirely.
10. **Langchain/Qdrant in client bundle** — AI/ML libraries should not be in the client SPA bundle.

#### Medium (P2)
11. **`chunkSizeWarningLimit: 1500`** — This is 10× the recommended 150 KB limit, masking bundle bloat.
12. **No image optimization** — No WebP/AVIF conversion, no responsive images, no lazy loading for below-fold images.
13. **Animation-heavy CSS** — 20+ @keyframes animations, many running on every page load regardless of whether they're visible.
14. **No compression strategy** — GitHub Pages serves gzip by default, but Brotli is not leveraged.
15. **Service worker `sw.js` not found** — The registration code references `/sw.js` but no service worker file exists in the project.

#### Low (P3)
16. **`optimizeDeps.include` has 12 entries** — Some of these (framer-motion, lucide-react) don't need pre-bundling.
17. **No `modulepreload` for critical chunks** — SPA navigation relies on lazy loading without preloading.
18. **No `fetchpriority` on critical resources** — The main JS bundle has no fetch priority hint.
19. **No `content-visibility` for below-fold sections** — Long pages (channels, question lists) render everything at once.

---

## 2. Prioritized Optimization Plan

### P0 — Critical (Implement First, Highest Impact)

#### P0-1: CSS Consolidation & Critical CSS Inlining
**Owner:** devprep-bug-css  
**Estimated Impact:** -40% CSS payload, -200ms FCP

**Problem:** 5 CSS files with massive duplication. Same CSS variables defined 3-4 times across files. `index.css` contains 7 complete theme definitions.

**Actions:**
1. **Merge `design-system.css` and `genz-design-system.css`** — They define identical color palettes, gradients, shadows, and utility classes. Keep one source of truth.
2. **Remove duplicate GitHub tokens** — `design-system.css` lines 618-896 duplicate `github-tokens.css` entirely. Remove the duplicate block.
3. **Consolidate theme definitions** — Move all 10 theme definitions (dark, light, genz-*, premium-*, pro-*) into a single `themes.css` file with clear section boundaries.
4. **Extract critical CSS** — Identify the CSS needed for first paint (body styles, font definitions, layout, first-view components) and inline it in `index.html` as `<style>`.
5. **Defer non-critical CSS** — Load theme-specific CSS only when the theme is activated via `media` attribute or JS.
6. **Remove unused animations** — At least 10 of the 20+ @keyframes are never triggered on the landing page.

**Target:** Single consolidated CSS file ≤30 KB (compressed), critical CSS ≤8 KB inlined.

#### P0-2: Remove or Defer MUI from Client Bundle
**Owner:** devprep-frontend-designer  
**Estimated Impact:** -800 KB JS, -300ms parse time

**Problem:** `@mui/material`, `@mui/icons-material`, and `@mui/lab` are bundled but used minimally. The project already uses shadcn/ui + lucide-react for its design system.

**Actions:**
1. **Audit MUI usage** — Search for all `@mui/*` imports across the codebase.
2. **Replace MUI icons with lucide-react** — The project already has lucide-react. Any MUI icon can be replaced.
3. **Replace MUI components with shadcn/ui** — Any MUI material components should use existing shadcn/ui equivalents.
4. **If MUI must remain** — Move to `vendor-mui` as a dynamically imported chunk, loaded only on pages that need it.

**Target:** Zero MUI in the initial bundle, or <50 KB if some components are unavoidable.

#### P0-3: Defer Heavy Libraries (Mermaid, Monaco, Markdown)
**Owner:** devprep-frontend-designer  
**Estimated Impact:** -4.5 MB initial JS, -500ms TTI

**Problem:** `preloadHeavyModules()` in `App.tsx` starts loading mermaid (2.9 MB), syntax highlighter, and react-markdown within 3-5 seconds of app mount — competing with user interaction.

**Actions:**
1. **Remove `preloadHeavyModules()` from `App.tsx`** — Do not preload anything on app mount.
2. **Lazy-load mermaid only when a diagram is visible** — Use IntersectionObserver to detect when a `.mermaid-container` enters the viewport, then dynamically import.
3. **Lazy-load Monaco editor only on coding challenge pages** — Import inside `CodingChallengeGenZ.tsx` component, not globally.
4. **Lazy-load markdown processor only on review/blog pages** — Import inside `ReviewSessionGenZ.tsx`.
5. **Keep the `manualChunks` separation** — The chunk isolation is good; just don't preload them.

**Target:** Zero heavy libraries loaded on initial page render.

#### P0-4: Add Resource Hints & Critical Asset Preloading
**Owner:** devprep-static-deployment  
**Estimated Impact:** -100ms FCP, -200ms LCP

**Problem:** No `<link rel="preconnect">`, `<link rel="dns-prefetch">`, or `<link rel="preload">` tags in the HTML.

**Actions:**
1. **Add `<link rel="preconnect" href="https://fonts.googleapis.com">`** — If Google Fonts are used.
2. **Add `<link rel="preload" as="script" href="[main-bundle].js" fetchpriority="high">`** — For the entry JS bundle.
3. **Add `<link rel="preload" as="style" href="[critical-css].css">`** — For the critical CSS file.
4. **Add `<link rel="modulepreload" href="[vendor-react].js">`** — For the React vendor chunk.
5. **Add `<link rel="dns-prefetch" href="[api-domain]">`** — For any external API calls.

---

### P1 — High (Implement Second)

#### P1-1: Consolidate Vendor Chunks
**Owner:** devprep-frontend-designer  
**Estimated Impact:** -15 HTTP requests, -50ms network overhead

**Problem:** 27 vendor chunks, including 12 micro-chunks of 5-15 KB each. Each chunk requires a separate HTTP request.

**Actions:**
1. **Merge micro-chunks into `vendor-libs`** — Consolidate cmdk, sonner, vaul, otp, resizable, carousel, daypicker, themes, toast, floating, cva into a single `vendor-ui` chunk.
2. **Keep only truly heavy libraries separate** — mermaid, monaco, mui (if kept), langchain should remain isolated for lazy loading.
3. **Target 8-10 vendor chunks max** — vendor-react, vendor-radix, vendor-ui, vendor-icons, vendor-router, vendor-query, vendor-forms, vendor-date, vendor-charts.

#### P1-2: Remove AI Libraries from Client Bundle
**Owner:** devprep-bug-performance  
**Estimated Impact:** -500 KB JS

**Problem:** `@langchain/core`, `@langchain/langgraph`, and `@qdrant/js-client-rest` are bundled in the client SPA. These are server-side AI/ML libraries that should never ship to the browser.

**Actions:**
1. **Move AI imports to server-only code** — Any code that imports `@langchain/*` or `@qdrant/*` should be in `server/` routes.
2. **If client needs AI features** — Use API calls to server endpoints instead of direct library imports.
3. **Mark as `external` in Vite build** — Add to `rollupOptions.external` to prevent bundling.

#### P1-3: Optimize Context Provider Tree
**Owner:** devprep-react-optimizer  
**Estimated Impact:** -30ms initial render, cleaner code

**Problem:** 9 nested context providers in `App()` create a deep render tree. Each provider adds a reconciliation pass.

**Actions:**
1. **Combine related contexts** — Merge `CreditsProvider`, `AchievementProvider`, and `BadgeContext` into a single `GamificationProvider`.
2. **Create a `Providers` composite component** — Flatten the nesting with a single component that renders all providers.
3. **Move non-essential providers below Suspense boundary** — `LiveRegionProvider` and `UnifiedNotificationManager` don't need to wrap the entire app.
4. **Use `useMemo` for provider values** — Ensure context values are memoized to prevent unnecessary re-renders.

#### P1-4: Implement Web Vitals Measurement
**Owner:** devprep-e2e-tester  
**Estimated Impact:** Observable metrics for regression tracking

**Problem:** Current perf measurement only captures `loadEventEnd - navigationStart`, which is not a meaningful Web Vital.

**Actions:**
1. **Add `web-vitals` library** — Import `getLCP`, `getFCP`, `getCLS`, `getINP`, `getFID` from the `web-vitals` package.
2. **Report to analytics** — Send metrics to Google Analytics or a custom endpoint.
3. **Update `measure-perf.js`** — Use Playwright's `performance.getEntriesByType('paint')` and `largest-contentful-paint` observer.
4. **Add thresholds to CI** — Fail the build if LCP > 2.5s, CLS > 0.1, INP > 200ms.

#### P1-5: Reduce `chunkSizeWarningLimit` and Enable Bundle Analysis
**Owner:** devprep-static-deployment  
**Estimated Impact:** Ongoing bundle size awareness

**Problem:** `chunkSizeWarningLimit: 1500` (1.5 MB) masks bundle bloat. No bundle visualization in CI.

**Actions:**
1. **Set `chunkSizeWarningLimit: 200`** — 200 KB is a reasonable limit for individual chunks.
2. **Add `rollup-plugin-visualizer` to build** — Already in devDependencies; enable it in CI builds.
3. **Add bundle size check to CI** — Fail if total JS > 500 KB gzip.
4. **Generate `stats.json` on every build** — Track bundle size over time.

---

### P2 — Medium (Implement Third)

#### P2-1: Implement `content-visibility` for Long Lists
**Owner:** devprep-frontend-designer  
**Estimated Impact:** -200ms render time on channel pages

**Actions:**
1. Add `content-visibility: auto` to question list items.
2. Set `contain-intrinsic-size: 0 200px` for stable scroll.
3. Apply to channel question lists, flashcard lists, and coding challenge lists.

#### P2-2: Image Optimization Strategy
**Owner:** devprep-static-deployment  
**Estimated Impact:** -40% image payload

**Actions:**
1. Convert all PNG/JPG to WebP or AVIF.
2. Add `loading="lazy"` to all below-fold images.
3. Add `decoding="async"` to all images.
4. Use `srcset` for responsive images.

#### P2-3: Animation Performance Audit
**Owner:** devprep-bug-css  
**Estimated Impact:** -15% CPU usage, smoother scrolling

**Actions:**
1. Ensure all animations use `transform` and `opacity` only (GPU-composited).
2. Add `will-change` sparingly to animated elements.
3. Remove animations that run on `main` element (every page triggers `fadeIn`).
4. Use `@media (prefers-reduced-motion: reduce)` consistently.

#### P2-4: Brotli Compression for GitHub Pages
**Owner:** devprep-static-deployment  
**Estimated Impact:** -15% total payload vs gzip

**Actions:**
1. Pre-compress critical assets with Brotli during build.
2. Upload `.br` files alongside originals.
3. GitHub Pages will serve `.br` files when the client supports it.

#### P2-5: Fix Service Worker
**Owner:** devprep-static-deployment  
**Estimated Impact:** Offline support, faster repeat visits

**Actions:**
1. Create `public/sw.js` with a minimal cache-first strategy.
2. Cache the app shell (HTML, CSS, JS) on install.
3. Cache API responses with network-first strategy.
4. Add update notification UI.

---

### P3 — Low (Implement Last)

#### P3-1: Optimize `optimizeDeps` Configuration
**Owner:** devprep-static-deployment

Remove `framer-motion` and `lucide-react` from `optimizeDeps.include` — they're already tree-shaken effectively.

#### P3-2: Add `modulepreload` for SPA Navigation
**Owner:** devprep-frontend-designer

Use `<link rel="modulepreload">` for route chunks that are likely to be visited next (prefetch on hover).

#### P3-3: Reduce `main` Element Animation
**Owner:** devprep-bug-css

Remove the `fadeIn` animation from `main` in `index.css` (line 1379-1381). It triggers on every page navigation and adds unnecessary paint work.

#### P3-4: Lazy-Load Unused shadcn/ui Components
**Owner:** devprep-frontend-designer

57 UI components exist in `components/ui/`. Audit which are actually used and remove unused imports.

---

## 3. Swarm Agent Task Assignments

| Agent | Tasks | Priority | Dependencies |
|---|---|---|---|
| **devprep-bug-css** | P0-1 (CSS consolidation), P2-3 (Animation audit), P3-3 (Remove fadeIn) | P0 | None |
| **devprep-frontend-designer** | P0-2 (Remove MUI), P0-3 (Defer heavy libs), P1-1 (Consolidate chunks), P2-1 (content-visibility), P3-2 (modulepreload), P3-4 (Lazy-load UI) | P0 | P0-1 |
| **devprep-static-deployment** | P0-4 (Resource hints), P1-5 (Bundle analysis), P2-2 (Image optimization), P2-4 (Brotli), P2-5 (Service Worker), P3-1 (optimizeDeps) | P0 | None |
| **devprep-bug-performance** | P1-2 (Remove AI libs from client) | P1 | None |
| **devprep-react-optimizer** | P1-3 (Optimize context providers) | P1 | None |
| **devprep-e2e-tester** | P1-4 (Web Vitals measurement) | P1 | None |
| **devprep-web-reviewer** | Review all CSS changes for theme consistency | P1 | P0-1 |
| **devperf-coordinator** (me) | Overall orchestration, dependency management, verification | All | All |

---

## 4. Dependency Graph

```
Phase 1 (P0 — Week 1)
├── P0-1: CSS Consolidation (devprep-bug-css)
│   └── P0-4: Resource Hints (devprep-static-deployment) [depends on CSS file names]
├── P0-2: Remove MUI (devprep-frontend-designer)
├── P0-3: Defer Heavy Libraries (devprep-frontend-designer)
│   └── P1-1: Consolidate Vendor Chunks (devprep-frontend-designer) [depends on P0-2, P0-3]
└── P0-4: Resource Hints (devprep-static-deployment)

Phase 2 (P1 — Week 2)
├── P1-1: Consolidate Vendor Chunks (devprep-frontend-designer)
├── P1-2: Remove AI Libraries (devprep-bug-performance)
├── P1-3: Optimize Context Providers (devprep-react-optimizer)
├── P1-4: Web Vitals Measurement (devprep-e2e-tester)
└── P1-5: Bundle Analysis (devprep-static-deployment)

Phase 3 (P2 — Week 3)
├── P2-1: content-visibility (devprep-frontend-designer)
├── P2-2: Image Optimization (devprep-static-deployment)
├── P2-3: Animation Audit (devprep-bug-css)
├── P2-4: Brotli Compression (devprep-static-deployment)
└── P2-5: Service Worker (devprep-static-deployment)

Phase 4 (P3 — Week 4)
├── P3-1: optimizeDeps cleanup
├── P3-2: modulepreload
├── P3-3: Remove fadeIn animation
└── P3-4: Lazy-load unused UI components
```

---

## 5. Expected Performance Improvements

### After Phase 1 (P0)
| Metric | Before | After | Improvement |
|---|---|---|---|
| Total JS (gzip) | ~2.5 MB | ~1.2 MB | -52% |
| Total CSS (gzip) | ~80 KB | ~25 KB | -69% |
| FCP (cold, 3G) | ~3.5s | ~1.5s | -57% |
| TTI (cold, 3G) | ~6.0s | ~2.5s | -58% |
| Vendor chunks | 27 | ~15 | -44% |

### After Phase 2 (P1)
| Metric | After P0 | After P1 | Improvement |
|---|---|---|---|
| Total JS (gzip) | ~1.2 MB | ~700 KB | -42% |
| Initial chunk | ~400 KB | ~200 KB | -50% |
| Route transition | ~800ms | ~200ms | -75% |
| Memory usage | ~180 MB | ~120 MB | -33% |

### After All Phases (Target State)
| Metric | Initial | Target | Improvement |
|---|---|---|---|
| Total JS (gzip) | ~2.5 MB | ~500 KB | -80% |
| Total CSS (gzip) | ~80 KB | ~20 KB | -75% |
| FCP (cold, 3G) | ~3.5s | <1.0s | -71% |
| LCP (cold, 3G) | ~4.0s | <1.5s | -63% |
| TTI (cold, 3G) | ~6.0s | <2.0s | -67% |
| CLS | ~0.15 | <0.05 | -67% |
| INP | ~250ms | <150ms | -40% |
| Route transition | ~800ms | <100ms | -87% |
| Cached page load | ~200ms | <50ms | -75% |

---

## 6. Implementation Order & Risk Assessment

| Order | Task | Risk | Rollback Plan |
|---|---|---|---|
| 1 | P0-1: CSS Consolidation | Medium — theme regression | Keep original CSS files, switch import back |
| 2 | P0-3: Defer Heavy Libraries | Low — already lazy | Re-add preload calls to App.tsx |
| 3 | P0-2: Remove MUI | Medium — missing icons | Audit first, replace incrementally |
| 4 | P0-4: Resource Hints | Low | Remove link tags from index.html |
| 5 | P1-2: Remove AI Libraries | Low — server-side only | Re-add imports to client if needed |
| 6 | P1-1: Consolidate Chunks | Low | Revert manualChunks function |
| 7 | P1-3: Context Providers | Low — internal refactor | Revert to nested providers |
| 8 | P1-4: Web Vitals | None — additive only | Remove web-vitals import |
| 9 | P1-5: Bundle Analysis | None — CI only | Remove from CI workflow |
| 10 | P2-P3 tasks | Low | Individual reverts per task |

---

## 7. Verification Checklist

After each phase, run:

```bash
# 1. Build and check bundle size
npm run build
ls -la dist/public/assets/js/*.js | awk '{sum += $5} END {print "Total JS:", sum/1024, "KB"}'

# 2. Run performance tests
npm run test:perf

# 3. Run accessibility tests
npm run test:a11y

# 4. Run smoke tests
npm run test:smoke

# 5. Generate bundle visualization
npx vite-bundle-visualizer

# 6. Measure real-world performance
npm run perf:measure
```

---

## 8. Notes & Constraints

- **GitHub Pages limitation:** No server-side configuration. All optimizations must be build-time or client-side.
- **No backend in production:** All data is static JSON. No SSR/SSG possible.
- **Static-first architecture:** DB → export → build → deploy. Optimization changes must survive this pipeline.
- **Dark/light mode must work:** CSS consolidation must preserve both themes and all 10 theme variants.
- **Mobile-first:** All optimizations must benefit mobile (iPhone 13 viewport: 390×844) at least as much as desktop.
- **Accessibility:** No optimization may reduce WCAG 2.1 AA compliance. Reduced motion preferences must be preserved.
