# AgentMail Console Theme Clone — Detailed Implementation Plan

> **Reference**: https://console.agentmail.to/
> **Goal**: Reproduce the exact visual language, color system, typography, layout structure, and component patterns of the AgentMail developer console and apply it to this project (DevPrep / Code Reels).

---

## 1. Design Philosophy

AgentMail's console is a **dark terminal-first developer tool** — not a generic dark-mode SaaS app. Key principles:

- **Monospace everywhere**: JetBrains Mono is used for ALL UI text (not just code), making the entire interface feel like a high-end terminal.
- **Flat, borderless depth**: surfaces are distinguished purely by subtle background-color steps, never by drop shadows.
- **Green accent on near-black**: the `#00d084` terminal green on a `#0d0f12` near-black base is the core brand moment.
- **Micro-contrast borders**: borders are very dim (`#2a3140`) — just enough to define edges without fighting the content.
- **Density without clutter**: 12–13px monospace type, tight padding, clear spacing rhythm.
- **ASCII / terminal motifs**: ASCII art on auth pages, `$` prompt styling, blinking cursor, `[ Bracket Labels ]` for section headings.

---

## 2. Color System

Replace the current CSS variables in `client/src/index.css` with this full token set.

### 2.1 Core Palette

| Token | Hex | Role |
|---|---|---|
| `--bg-base` | `#0d0f12` | App root background |
| `--bg-surface` | `#161a1f` | Sidebar, topbar, cards |
| `--bg-elevated` | `#1e2329` | Hover rows, modals, dropdowns |
| `--bg-input` | `#080a0d` | Text inputs, code blocks |
| `--border` | `#2a3140` | All dividers, card borders, input borders |
| `--border-active` | `#3d4f6e` | Focused inputs, hovered borders |

### 2.2 Typography

| Token | Hex | Role |
|---|---|---|
| `--text-primary` | `#e8edf3` | Headings, active items, values |
| `--text-secondary` | `#7a8799` | Body text, nav labels |
| `--text-muted` | `#3d4a5c` | Placeholder, table column headers, timestamps |

### 2.3 Accent Colors

| Token | Hex | Role |
|---|---|---|
| `--accent` | `#00d084` | Primary CTA, active nav, success, cursor |
| `--accent-dim` | `#00d08422` | Active nav background, focus ring |
| `--accent-hover` | `#00e895` | Hover state on accent buttons |
| `--accent-blue` | `#4fa8ff` | Links, monospace values (API keys, IDs) |
| `--accent-amber` | `#f5a623` | Warnings, pending badges |
| `--accent-red` | `#ff5c5c` | Errors, destructive actions |
| `--accent-red-dim` | `#ff5c5c18` | Error badge backgrounds |

### 2.4 Tailwind Config Mapping

```typescript
// tailwind.config.ts — extend colors with CSS variable references
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  surface: "hsl(var(--surface))",
  elevated: "hsl(var(--elevated))",
  border: "hsl(var(--border))",
  "border-active": "hsl(var(--border-active))",
  accent: {
    DEFAULT: "hsl(var(--accent))",
    dim: "hsl(var(--accent-dim))",
    hover: "hsl(var(--accent-hover))",
  },
  "accent-blue": "hsl(var(--accent-blue))",
  "accent-amber": "hsl(var(--accent-amber))",
  "accent-red": "hsl(var(--accent-red))",
  muted: "hsl(var(--muted))",
  "muted-foreground": "hsl(var(--muted-foreground))",
}
```

### 2.5 Full index.css Variables Block

```css
:root {
  /* Backgrounds */
  --background:    220 14% 7%;        /* #0d0f12 */
  --surface:       220 13% 11%;       /* #161a1f */
  --elevated:      220 12% 14%;       /* #1e2329 */
  --input-bg:      220 15% 4%;        /* #080a0d */

  /* Borders */
  --border:        220 20% 22%;       /* #2a3140 */
  --border-active: 220 26% 34%;       /* #3d4f6e */

  /* Typography */
  --foreground:    210 40% 93%;       /* #e8edf3 */
  --muted:         220 15% 8%;        /* used for muted containers */
  --muted-foreground: 215 12% 53%;    /* #7a8799 */
  --placeholder:   218 19% 30%;       /* #3d4a5c */

  /* Accent — Terminal Green */
  --accent:        158 100% 41%;      /* #00d084 */
  --accent-dim:    158 100% 41% / 13%; /* #00d08422 */
  --accent-hover:  158 100% 46%;      /* #00e895 */
  --accent-blue:   211 100% 65%;      /* #4fa8ff */
  --accent-amber:  38 91% 55%;        /* #f5a623 */
  --accent-red:    0 100% 67%;        /* #ff5c5c */

  /* Shadcn Compatibility */
  --card:                var(--surface);
  --card-foreground:     var(--foreground);
  --popover:             var(--elevated);
  --popover-foreground:  var(--foreground);
  --primary:             var(--accent);
  --primary-foreground:  220 14% 4%;  /* near-black text on green CTA */
  --secondary:           var(--elevated);
  --secondary-foreground: var(--foreground);
  --destructive:         var(--accent-red);
  --destructive-foreground: var(--foreground);
  --ring:                var(--accent);
  --radius:              0.375rem;    /* 6px — subtle rounding */
}
```

> **Note**: No `.dark` class needed — this is a dark-only design system.

---

## 3. Typography System

### 3.1 Font

AgentMail uses **JetBrains Mono** for the entire UI — including nav labels, body text, headings, and buttons. This is the most impactful single change from the current app.

```html
<!-- Add to index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

```css
/* index.css */
body {
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", "Menlo", monospace;
  font-size: 13px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

### 3.2 Type Scale

| Usage | Size | Weight | Color |
|---|---|---|---|
| Page title | 18px | 600 | `--foreground` |
| Section heading | 15px | 500 | `--foreground` |
| `[ Bracket label ]` | 11px | 400 | `--muted-foreground`, uppercase, spaced |
| Body / nav items | 12.5–13px | 400 | `--muted-foreground` |
| Table col headers | 11px | 400 | `--placeholder`, uppercase, 0.08em spacing |
| Monospace values (IDs, keys) | 12px | 400 | `--accent-blue` |
| Meta / timestamps | 11px | 400 | `--placeholder` |
| Buttons | 12px | 500 | varies by variant |

### 3.3 The `[ Bracket Label ]` Pattern

Section labels throughout the console use square brackets in a specific style:

```tsx
// SectionLabel component
<span className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
  [ {label} ]
</span>
```

---

## 4. Layout Structure

### 4.1 Application Shell

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (220px fixed)  │  MAIN CONTENT AREA         │
│  ─────────────────────  │  ────────────────────────  │
│  Logo + wordmark        │  TOPBAR (52px)             │
│  ─────────────────────  │    breadcrumb / actions    │
│  Nav section: Core      │  ────────────────────────  │
│    Inboxes              │  CONTENT SCROLL AREA       │
│    Messages             │    page header             │
│    Webhooks             │    stats grid (optional)   │
│    Threads              │    data tables / cards     │
│  Nav section: Developer │    code blocks             │
│    API Keys             │                            │
│    Logs                 │                            │
│    Docs                 │                            │
│  Nav section: Account   │                            │
│    Usage                │                            │
│    Settings             │                            │
│  ─────────────────────  │                            │
│  Org switcher footer    │                            │
└─────────────────────────────────────────────────────┘
```

### 4.2 Sidebar Specs

- **Width**: 220px (CSS variable: `--sidebar-width: 14rem`)
- **Background**: `hsl(var(--surface))` — `#161a1f`
- **Right border**: `1px solid hsl(var(--border))`
- **Logo area**: 60px tall, bottom border, `@` logomark in accent green + "agent**mail**" wordmark
- **Active nav item**: `border-left: 2px solid --accent`, background `--accent-dim`, text `--accent`
- **Inactive nav item**: text `--muted-foreground`, no left border
- **Nav section labels**: 10px, uppercase, `--placeholder`, `letter-spacing: 0.1em`
- **Footer**: org avatar (gradient circle) + org name + user email, 11px

### 4.3 Topbar Specs

- **Height**: 52px
- **Background**: `hsl(var(--surface))`
- **Bottom border**: `1px solid hsl(var(--border))`
- **Breadcrumb**: `Page > Sub-page` in 12px, muted colors, active crumb in `--foreground`
- **Right side**: action buttons (ghost style)

### 4.4 Content Area

- **Padding**: `28px 32px`
- **Background**: `hsl(var(--background))` — the darker `#0d0f12`
- **Overflow**: `overflow-y: auto` with custom scrollbar

---

## 5. Component Specifications

### 5.1 Cards / Panels

```tsx
// Used for tables, code examples, stats
<div className="bg-surface border border-border rounded-md overflow-hidden">
  {/* table-header row */}
  <div className="px-[18px] py-[14px] border-b border-border flex items-center justify-between">
    <span className="text-[13px] font-medium text-foreground">{title}</span>
    <Button variant="ghost" size="sm">Action</Button>
  </div>
  {/* content */}
</div>
```

Specs:
- Background: `bg-surface` (`#161a1f`)
- Border: `border border-border` (`#2a3140`)
- Border-radius: `rounded-md` (6px)
- No drop shadow

### 5.2 Stat Cards

```tsx
<div className="bg-surface border border-border rounded-md p-[18px_20px]">
  <div className="text-[11px] text-muted-foreground uppercase tracking-[0.08em] mb-2">
    {label}
  </div>
  <div className="text-[24px] font-semibold text-foreground">{value}</div>
  <div className="text-[11px] text-placeholder mt-1">{meta}</div>
</div>
```

Layout: `grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]`

### 5.3 Data Tables

```tsx
<table className="w-full border-collapse">
  <thead>
    <tr>
      <th className="px-[18px] py-[10px] text-left text-[11px] text-placeholder uppercase tracking-[0.08em] border-b border-border font-normal">
        Column
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:bg-elevated transition-colors">
      <td className="px-[18px] py-[11px] text-[12.5px] text-muted-foreground border-b border-border">
        value
      </td>
      {/* Monospace ID/key cell */}
      <td className="px-[18px] py-[11px] font-mono text-[12px] text-accent-blue border-b border-border">
        am_key_abc123
      </td>
    </tr>
  </tbody>
</table>
```

### 5.4 Status Badges

Dot + label, no icon, small pill shape:

```tsx
// Variants: active (green), idle (muted), error (red), warning (amber)
const badgeStyles = {
  active:  "bg-accent/10 text-accent",
  idle:    "bg-muted-foreground/10 text-muted-foreground",
  error:   "bg-accent-red/10 text-accent-red",
  warning: "bg-accent-amber/10 text-accent-amber",
};

<span className={cn("inline-flex items-center gap-[5px] px-2 py-0.5 rounded text-[11px] font-medium", badgeStyles[variant])}>
  <span className={cn("w-[5px] h-[5px] rounded-full", dotColor)} />
  {label}
</span>
```

### 5.5 Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| `primary` | `--accent` (`#00d084`) | `#000` (black) | `--accent` | `--accent-hover` |
| `ghost` | transparent | `--muted-foreground` | `--border` | border: `--border-active`, text: `--foreground` |
| `danger` | transparent | `--accent-red` | `--accent-red/25` | bg: `--accent-red/10` |

All buttons:
- `font-family: inherit` (monospace)
- `font-size: 12px`, `font-weight: 500`
- `padding: 7px 14px`
- `border-radius: 6px`
- Transition: `all 0.12s`

### 5.6 Text Inputs

```css
.input {
  background: hsl(var(--input-bg));       /* #080a0d */
  border: 1px solid hsl(var(--border));   /* #2a3140 */
  border-radius: 6px;
  color: hsl(var(--foreground));
  font-family: inherit;                   /* monospace */
  font-size: 12.5px;
  padding: 8px 12px;
  transition: border-color 0.12s;
}
.input:focus {
  border-color: hsl(var(--accent));
  box-shadow: 0 0 0 3px hsl(var(--accent-dim));
  outline: none;
}
.input::placeholder {
  color: hsl(var(--placeholder));
}
```

### 5.7 Code / API Key Blocks

```tsx
<div className="relative bg-[#080a0d] border border-border rounded-md p-[16px_18px] font-mono text-[12px] overflow-x-auto">
  {/* Syntax-colored content */}
  <span className="text-muted-foreground"># comment</span>
  <span className="text-[#c792ea]">const</span>{" "}
  <span className="text-accent-blue">key</span>{" = "}
  <span className="text-accent">"am_key_..."</span>
  {/* Copy button absolutely positioned top-right */}
  <button className="absolute top-[10px] right-[10px] px-[10px] py-1 bg-elevated border border-border rounded text-[11px] text-muted-foreground hover:text-foreground hover:border-border-active transition-all">
    Copy
  </button>
</div>
```

### 5.8 Terminal / Prompt Blocks

```tsx
<div className="bg-[#080a0d] border border-border rounded-md p-[16px_18px] font-mono text-[12px] leading-[1.8]">
  <div className="text-foreground before:content-['$_'] before:text-accent">
    agentmail inboxes list
  </div>
  <div className="pl-[14px] text-muted-foreground">
    ✓ Found 3 inboxes
  </div>
  <div className="pl-[14px] text-accent">
    agent-1@agentmail.to
  </div>
  {/* Blinking cursor on active line */}
  <div className="text-foreground before:content-['$_'] before:text-accent">
    <span className="after:content-['▌'] after:text-accent after:animate-[blink_1s_step-end_infinite]" />
  </div>
</div>

/* Tailwind keyframes in tailwind.config.ts */
// keyframes: { blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } } }
// animation: { blink: "blink 1s step-end infinite" }
```

### 5.9 Auth Pages (Sign In / Sign Up)

The auth pages have a distinctive split layout:
- **Left panel** (centered, ~400px wide): Clerk auth form with the AgentMail logo above
- **Right side / background**: The ASCII art SVG (`agentmail-ascii.svg`) fills the dark background
- The `[ Sign In ]` heading uses the bracket label pattern in muted text above the main heading

```tsx
<div className="min-h-screen bg-background flex">
  {/* Left: Auth form */}
  <div className="flex flex-col items-center justify-center w-full max-w-[420px] mx-auto px-8 z-10">
    <img src="/logo.svg" alt="Logo" className="mb-8 h-8" />
    <div className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] mb-1">
      [ Sign In ]
    </div>
    <h1 className="text-[20px] font-semibold text-foreground mb-1">
      Sign in to DevPrep
    </h1>
    <p className="text-[12px] text-muted-foreground mb-8">
      Welcome back! Please sign in to continue.
    </p>
    {/* Auth form content */}
  </div>
  {/* Right: ASCII art background */}
  <div className="fixed inset-0 -z-10 flex items-end justify-end opacity-20 pointer-events-none">
    <img src="/ascii-art.svg" alt="" className="w-full max-w-2xl" />
  </div>
</div>
```

---

## 6. Navigation Structure (Applied to DevPrep)

Map AgentMail's nav sections to DevPrep equivalents:

| AgentMail | DevPrep Equivalent | Icon |
|---|---|---|
| **Core** section | **Practice** section | — |
| Inboxes | Questions / Swipe | `Inbox` |
| Messages | Flashcards | `BookOpen` |
| Webhooks | Coding Challenges | `Code2` |
| Threads | Voice Practice | `Mic` |
| **Developer** section | **Learning** section | — |
| API Keys | Learning Paths | `Route` |
| Logs | History / Activity | `ScrollText` |
| Docs | Certifications | `Award` |
| **Account** section | **Account** section | — |
| Usage | Progress / Stats | `BarChart2` |
| Settings | Settings | `Settings` |

---

## 7. Scrollbar Styling

```css
/* Custom scrollbar matching the terminal aesthetic */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--border-active));
}
```

---

## 8. Interaction States

| State | Behavior |
|---|---|
| Nav item hover | `color: --foreground`, `background: --elevated` |
| Nav item active | `color: --accent`, `background: --accent-dim`, `border-left: 2px solid --accent` |
| Table row hover | `background: --elevated` (transition 0.1s) |
| Button primary hover | `background: --accent-hover` |
| Button ghost hover | `border-color: --border-active`, `color: --foreground` |
| Input focus | `border-color: --accent`, `box-shadow: 0 0 0 3px --accent-dim` |
| All transitions | `all 0.12s` — very fast, snappy |

---

## 9. Implementation Order

### Phase 1 — Token Foundation (index.css)
1. Replace all existing CSS variables with the AgentMail color tokens
2. Set `body` to JetBrains Mono font family
3. Add Google Fonts link for JetBrains Mono to `index.html`
4. Add custom scrollbar styles
5. Add `blink` keyframe animation to Tailwind config

### Phase 2 — App Shell Layout
1. Update `App.tsx` with the correct `SidebarProvider` width variables (`--sidebar-width: 14rem`)
2. Update `AppSidebar` component:
   - Logo area with `@` mark in green + "DevPrep" wordmark
   - Nav section labels with `[ bracket ]` style or uppercase muted
   - Active item: green left border + green text + dim green background
   - Footer: org/user info block
3. Update Topbar with breadcrumb pattern and ghost action buttons
4. Set content area background to `--background` (darker than sidebar `--surface`)

### Phase 3 — Core Components
1. Update all `<Card>` usages to use `bg-surface border-border` with no shadow
2. Restyle data tables (column headers muted+uppercase, hover rows, monospace value cells)
3. Create `StatusBadge` component with dot indicator (active/idle/error/warning)
4. Restyle all `<Button>` variants to match AgentMail's palette (especially primary = green on black text)
5. Restyle all `<Input>` components (dark input background, accent focus ring)
6. Create `CodeBlock` component with copy button, syntax colors, dark background
7. Create `TerminalBlock` component with `$` prompt and blinking cursor

### Phase 4 — Page-level Updates
1. Restyle auth pages (Sign In / Sign Up) with split layout + ASCII art background
2. Update dashboard/home with stat cards grid
3. Apply `[ Bracket Label ]` heading pattern to section headings throughout
4. Update page headers: large title + subtitle in muted text

### Phase 5 — Polish
1. Verify all text color contrast (muted-foreground on surface backgrounds)
2. Ensure all interactive elements use the fast `0.12s` transition
3. Verify monospace font renders correctly in all contexts
4. Test layout at different viewport sizes
5. Check that no drop shadows have leaked in (should be zero)

---

## 10. Key Files to Modify

| File | Changes |
|---|---|
| `client/index.html` | Add JetBrains Mono Google Fonts `<link>` |
| `client/src/index.css` | Full CSS variables replacement, scrollbar, blink keyframe |
| `tailwind.config.ts` | Color token mapping, blink animation |
| `client/src/App.tsx` | Sidebar width vars, layout shell |
| `client/src/components/app-sidebar.tsx` | Full reskin: logo, nav structure, footer |
| `client/src/components/ui/button.tsx` | Variants updated to AgentMail palette |
| `client/src/components/ui/input.tsx` | Dark input background, accent focus |
| `client/src/components/ui/card.tsx` | Remove shadow, use surface+border |
| `client/src/components/ui/badge.tsx` | Dot-indicator badge pattern |
| All page components | `[ Bracket ]` headings, stat cards, table styling |
| Auth pages | Split layout + ASCII art background |

---

## 11. ASCII Art / Brand Details

The sign-in page shows an ASCII-art version of the logo/wordmark in the background at low opacity. For DevPrep, create a similar SVG:
- ASCII-rendered version of "DevPrep" or the logo
- Placed as a fixed, full-viewport background element
- Opacity: `0.15–0.20`
- Color: `--foreground` (white) — the dark background makes it subtle
- Only visible on auth pages

---

## 12. Quick Reference — What Makes It "AgentMail"

If you only implement one thing from each category, pick these:

| Category | The Single Most Impactful Thing |
|---|---|
| Color | Near-black `#0d0f12` background + `#00d084` terminal green accent |
| Font | JetBrains Mono for ALL text (not just code) |
| Layout | Surface-colored sidebar with green active left-border indicator |
| Components | Tables with muted uppercase column headers + monospace blue value cells |
| Motion | Ultra-fast `0.12s` transitions everywhere (feels very snappy and developer-y) |
| Copy | `[ Bracket Labels ]` for section headings |
| Auth | ASCII art background + split layout |
