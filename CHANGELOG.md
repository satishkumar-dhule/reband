# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Known Limitations
- **Coding Challenges in Static Mode**: Coding challenges currently require backend API and don't work in static mode. Need to generate static coding challenge data at build time. See `client/src/services/api.service.ts:419`
- **Credit System Integration**: Achievement credit awards not yet integrated with existing credit system. See `client/src/lib/achievements/engine.ts:346`

### Added
- **Channel Configuration Split**: Split `channels-config.ts` into modular files for better bundle splitting:
  - `channels-config.ts` - Full config with descriptions, roles, categories
  - `channels-manifest.ts` - Minimal manifest for sidebar/navigation
  - `channels-types.ts` - Type definitions for channel configs
  - `channels-certifications.ts` - Certification channels (lazy-loaded)
- **Learning Paths Data**: New `learning-paths-data.ts` module for curated learning paths
- **Per-Route Skeleton Screens**: Component-based skeleton loading for each page route
- **Route Prefetching**: Hover-based route prefetching system for faster navigation
- **Performance Instrumentation**: Added `perf:measure` script and `perf-measure.yml` CI workflow

### Changed
- **Server Compression**: Added gzip compression middleware (level 6, threshold 1KB)
- **CSS Optimization**: Added `content-visibility: auto` for off-screen sections
- **App Shell**: Improved app shell with skeleton screens and Suspense boundaries
- **Heavy Module Loading**: Refactored to use `requestIdleCallback` with priority ordering

### Fixed
- **Slow Connection Handling**: Heavy module preloading now skips on slow connections (`saveData`, `2g`, `slow-2g`)
- **Provider Nesting**: Flattened provider tree for better React reconciliation

## [2.2.0] - 2026-04-03

### Added
- **Authentication**: Added `better-auth` package with Drizzle ORM adapter for SQLite
- **GitHub Management Agents**: New agents for managing GitHub issues, PRs, and repositories
- **Page Optimization Instructions**: Comprehensive guide for AI agents optimizing application pages
- **Performance Instrumentation**: Added `perf:measure` script and `perf-measure.yml` CI workflow
- **Per-Route Skeleton Screens**: Component-based skeleton loading for each page route
- **Route Prefetching**: Hover-based route prefetching system for faster navigation

### Changed
- **Server Compression**: Added gzip compression middleware (level 6, threshold 1KB)
- **CSS Optimization**: Added `content-visibility: auto` for off-screen sections
- **App Shell**: Improved app shell with skeleton screens and Suspense boundaries
- **Heavy Module Loading**: Refactored to use `requestIdleCallback` with priority ordering

### Fixed
- **Slow Connection Handling**: Heavy module preloading now skips on slow connections (`saveData`, `2g`, `slow-2g`)
- **Provider Nesting**: Flattened provider tree for better React reconciliation

## [2.1.0] - 2026-04-01

### Added
- **Content-visibility CSS utilities**: `cv-auto` and `cv-auto-sm` classes
- **Pagefind Integration**: Static search index generation for production builds
- **Prerendered Paths**: Support for static HTML generation of high-traffic routes

### Changed
- **Bundle Optimization**: Consolidated vendor chunks (27 → 15 target)
- **Critical CSS**: Inlined first-paint styles in `<head>`
- **Lazy Fonts**: Google Fonts now use `media="print"` trick to avoid blocking

### Fixed
- **Bundle Size Warnings**: Reduced `chunkSizeWarningLimit` for better size monitoring

## [2.0.0] - 2026-03-15

### Added
- **DevPrep / Open-Interview Rebrand**: Complete project rename
- **Static-First Architecture**: GitHub Pages deployment with zero backend servers
- **Browser SQLite**: sql.js running in browser via WASM for offline-first experience
- **GitHub Theme**: Full GitHub design system with CSS tokens and Primer-inspired components

### Changed
- **Data Strategy**: DB is source of truth → build-time export to `public/data/*.json` → SPA fetches static JSON
- **Package Name**: Changed from `code-reels` to `devprep`

### Removed
- **Express Server**: No longer deployed in production (dev-only)
- **Turso Backend**: Cloud sync disabled, local-only operation

## [1.x.x] - Previous Versions

See [GitHub Releases](https://github.com/open-interview/open-interview/releases) for historical changelog entries.
