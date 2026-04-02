# Skill: github-theme-components

# GitHub Theme Component Library

This skill provides GitHub-style UI components for React applications using shadcn/ui and Tailwind CSS 4.

> Note: CSS variables use the `--gh-*` prefix convention in this project (e.g., `--gh-canvas-default`, `--gh-fg-default`).

## Color System

### Light Mode
```css
--color-canvas-default: #ffffff
--color-canvas-subtle: #f6f8fa
--color-canvas-inset: #f6f8fa
--color-border-default: #d0d7de
--color-border-muted: #d8dee4
--color-fg-default: #1f2328
--color-fg-muted: #656d76
--color-fg-subtle: #8b949e
--color-accent-fg: #0969da
--color-accent-emphasis: #0969da
--color-success-fg: #1a7f37
--color-danger-fg: #cf222e
--color-warning-fg: #bf8700
```

### Dark Mode
```css
--color-canvas-default: #0d1117
--color-canvas-subtle: #010409
--color-canvas-inset: #161b22
--color-border-default: #30363d
--color-border-muted: #21262d
--color-fg-default: #e6edf3
--color-fg-muted: #8b949e
--color-fg-subtle: #6e7681
--color-accent-fg: #58a6ff
--color-accent-emphasis: #1f6feb
--color-success-fg: #3fb950
--color-danger-fg: #f85149
--color-warning-fg: #d29922
```

## Typography

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif
font-family-code: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
font-size-base: 14px
line-height-base: 1.5
```

## Component Styles

### Buttons
- Primary: Blue fill (#0969da), white text, 6px radius
- Secondary: Border only, gray text
- Danger: Red fill (#cf222e) for destructive actions
- Ghost: No background, subtle hover

### Inputs
- Border: 1px solid #d0d7de
- Border radius: 6px
- Focus: Blue ring (2px)
- Padding: 8px 12px

### Cards
- Background: white (light) / #161b22 (dark)
- Border: 1px solid #d0d7de / #30363d
- Border radius: 6px
- Padding: 16px

### Navigation
- Sidebar: 240px width
- Header: 64px height
- Item padding: 8px 12px
- Active indicator: Left border accent

## Spacing Scale

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

## Border Radius

- small: 4px
- medium: 6px
- large: 8px
- full: 9999px
