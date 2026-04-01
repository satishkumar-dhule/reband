# Open-Interview Specification (Code-Reels v2.2)

This document formalizes the production-grade specifications for the DevPrep / Open-Interview project, aligned with the static-first GitHub Pages architecture and the GitHub design system.

## Executive Summary
- Open-Interview is a GitHub-native, free technical interview preparation platform. It uses a static SPA built with React 19 + Vite, TypeScript 5, Tailwind CSS 4, and shadcn/ui. Content is stored in a local SQLite DB during development and exported at build-time to public/data/*.json, which the frontend fetches. A vector-search pipeline (Qdrant) powers semantic retrieval for questions and learning paths. The goal is to deliver reliable content with strong UX, accessibility, and performance while enabling easy contribution and governance.

## Goals & Scope
- Provide high-quality interview content: questions, flashcards, and coding challenges.
- Maintain GitHub design tokens and typography.
- Ensure static-first architecture with deterministic builds.
- Provide accessibility, performance budgets, and SEO health checks.
- Enable content governance and versioning for data exports.

## Architectural Constraints
- Static-First: Production is a static SPA; no backend server.
- DB as Source of Truth: All content lives in SQLite/Turso; changes go through DB then export.
- GitHub Theme: CSS variables tokens; system font stack; Primer-inspired components.
- Vector Search: Qdrant-based embedding search for content similarity.
- Development Proxy: API proxies in development; static JSON exports in production.

## Non-Functional Requirements
- Performance budgets: TTFB < 2s; LCP < 2.5s on typical network; Lighthouse pass.
- Accessibility: WCAG 2.1 AA conformance; keyboard navigable; ARIA labeling; focus management for modals.
- Security & Privacy: No secrets in frontend; data exposed is sanitized; dependencies patched.
- Reliability: Deterministic builds; reproducible exports; rollback plan.
- Observability: Perf metrics; Lighthouse results; UI error instrumentation.
- Internationalization: Planning for i18n in future.

## Data & Content Model
- DB: Local SQLite in development; Turso cloud in production; schema defined in shared/schema.ts.
- public/data exports: channels.json, questions-index.json, channel-*.json, learning-paths.json, coding-challenges.json, stats.json, search-index/ (PageFind).
- Content types: Channel, Question, Learning Path, Coding Challenge, Stats.
- Versioning: Export version and timestamp; content snapshots.
- Data governance: Content curated via pipeline; de-duplication and validation.

## Build & Release Pipeline
- Data export: node script/fetch-questions-for-build.js (DB → public/data/*.json)
- Additional scripts: generate-curated-paths.js, generate-rss.js, generate-sitemap.js
- Build: vite build
- Search index: node script/build-pagefind.js
- Deploy: tsx script/deploy-pages.ts (gh-pages)
- CI: GitHub Actions runs build and deploy on push to main; staging vs production branches.

## Content Lifecycle & Governance
- Creation: Content added via curated pipelines; no hard-coded data.
- Review: Content quality checks; dedup; correctness.
- Publication: Build-export; publish to gh-pages.
- Retirement: Content retired; versioned; archived.

## API & Data Access
- Production fetch: static JSON endpoints under /data/*
- Development: API proxy for /api/* to Express server on port 5173.
- IS_STATIC flag: VITE_STATIC_MODE controls data fetching strategy.

## QA & Testing Strategy
- Smoke tests; UI flows.
- End-to-end tests with Playwright.
- Accessibility tests; keyboard navigation checks.
- Performance tests; baseline Lighthouse budgets tracked in CI.
- Data export validation tests.

## Monitoring & Observability
- Perf baselines captured in perf-results.json; screenshots for loaded-state analysis.
- UI errors logged; Lighthouse results tracked.

## Security & Compliance
- No secrets in frontend; secrets management at build time only.
- Data privacy: ensure public data exports do not contain PII.
- Access controls: static hosting via GitHub Pages; no server-side sessions.

## Internationalization & Localization
- Plan for i18n support in future sprint; locale-neutral data layout; strings externalized in future.

## Migration & Migration Strategy
- Data migrations: export changes; require re-export; ensure backward compatibility.
- Schema changes: versioned migrations; tests run before production.

## Acceptance Criteria & Metrics
- Specs document updated and approved by stakeholders.
- CI builds pass with new spec alignment; tests pass.
- Accessibility conformance and performance budgets met.

## Roadmap & Known Risks
- Risks: data export drift; content quality; i18n readiness; performance drift.
- Plan: incremental improvements with quarterly reviews.

## Appendix & References
- References: UNIFIED_CONTROLS_SPEC.md, CONTENT_STANDARDS.md, AGENTS.md.
