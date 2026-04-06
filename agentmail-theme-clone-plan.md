# AgentMail Console Theme Clone — Deep Research Plan

> **Reference**: https://console.agentmail.to/
> **Marketing site**: https://agentmail.to/
> **Docs**: https://docs.agentmail.to/
> **GitHub org**: https://github.com/agentmail-to (16 repos, using Fern API codegen)
> **Auth**: Clerk (Google OAuth + email/password)
> **Goal**: Precisely replicate AgentMail's visual language across every dimension — colors, fonts, layout, motion, component anatomy, data presentation, and copywriting conventions — and apply it to DevPrep.

---

## 1. Product Context & Design Motivation

AgentMail was built from scratch "every pixel, every interaction" for developers building AI email infrastructure. Founded 2025 by University of Michigan grads (Optiver, Nvidia, Accel alumni), YC S25, raised $6M led by General Catalyst. This origin informs the design at every level — it's built to impress and feel native to developers.

**The design has one job**: make a developer feel immediately at home, the way opening a terminal does. Not a polished consumer SaaS. Not a rounded-corner marketing dashboard. A tool.

**Three layers of the design** to replicate:
1. The **console** (`console.agentmail.to`) — the main app: sidebar, tables, API keys, webhooks
2. The **auth pages** (`/sign-in`, `/sign-up`) — split layout with ASCII art
3. The **marketing motifs** — pricing tables, `[ Bracket ]` headings, ASCII SVG backgrounds, terminal code blocks

---

## 2. Exact Color System

### 2.1 The Six Background Steps

AgentMail uses exactly six background shades that create depth through micro-contrast:

| Level | Hex | HSL (Tailwind format) | When used |
|---|---|---|---|
| 0 — Deep base | `#080a0d` | `220 24% 5%` | Code blocks, text inputs, terminal blocks, the darkest surfaces |
| 1 — App base | `#0d0f12` | `220 16% 7%` | Root app background, content area |
| 2 — Surface | `#161a1f` | `220 14% 11%` | Sidebar, topbar, cards, panels |
| 3 — Elevated | `#1e2329` | `220 13% 14%` | Hover states, modals, dropdowns, secondary panels |
| 4 — Raised | `#252c36` | `220 17% 18%` | Active inputs, dropdown items on hover |
| 5 — Highlight | `#2e3847` | `220 21% 23%` | Selected states, focused form elements |

### 2.2 Borders

| Token | Hex | Usage |
|---|---|---|
| `--border` | `#2a3140` | All dividers, card outlines, input borders, table rows |
| `--border-active` | `#3d4f6e` | Focused inputs, hovered border states |
| `--border-subtle` | `#1e2632` | Very faint separators inside cards |

### 2.3 Text Hierarchy

| Token | Hex | Role |
|---|---|---|
| `--text-primary` | `#e8edf3` | Headings, active nav, values, button labels |
| `--text-secondary` | `#7a8799` | Body text, inactive nav, descriptions |
| `--text-muted` | `#3d4a5c` | Placeholders, table column headers, timestamps, meta |
| `--text-code` | `#4fa8ff` | Monospace values: API keys (`am_key_...`), IDs, email addresses in tables |

### 2.4 Accent Palette

| Token | Hex | HSL | Role |
|---|---|---|---|
| `--accent` | `#00d084` | `158 100% 41%` | PRIMARY: active nav, CTA buttons, success badges, focus rings, cursor blink |
| `--accent-dim` | `#00d08418` | `158 100% 41% / 9%` | Active nav background, focus ring glow |
| `--accent-hover` | `#00e895` | `158 100% 46%` | Accent button hover |
| `--accent-blue` | `#4fa8ff` | `211 100% 65%` | Links, monospace table values, syntax "variable" color |
| `--accent-purple` | `#c792ea` | `281 70% 74%` | Syntax "keyword" color in code blocks |
| `--accent-amber` | `#f5a623` | `38 91% 55%` | Warnings, pending status badges |
| `--accent-red` | `#ff5c5c` | `0 100% 67%` | Errors, destructive actions, error badges |
| `--accent-red-dim` | `#ff5c5c18` | `0 100% 67% / 9%` | Error badge backgrounds |
| `--accent-amber-dim` | `#f5a62318` | `38 91% 55% / 9%` | Warning badge backgrounds |

### 2.5 Full index.css Variables (Ready to Paste)

```css
/* ============================================================
   AGENTMAIL CONSOLE THEME — Full Token Set
   Dark-only. No .dark class needed.
   ============================================================ */
:root {
  /* ─── Backgrounds (6 steps, deepest to lightest) ─── */
  --bg-deep:          220 24% 5%;      /* #080a0d — inputs, code blocks */
  --bg-base:          220 16% 7%;      /* #0d0f12 — content area */
  --bg-surface:       220 14% 11%;     /* #161a1f — sidebar, topbar, cards */
  --bg-elevated:      220 13% 14%;     /* #1e2329 — hover, modals, dropdowns */
  --bg-raised:        220 17% 18%;     /* #252c36 — active inputs */
  --bg-highlight:     220 21% 23%;     /* #2e3847 — selected states */

  /* ─── Borders ─── */
  --border:           220 20% 22%;     /* #2a3140 */
  --border-active:    220 26% 34%;     /* #3d4f6e */
  --border-subtle:    220 19% 15%;     /* #1e2632 */

  /* ─── Text ─── */
  --text-primary:     210 40% 93%;     /* #e8edf3 */
  --text-secondary:   215 12% 53%;     /* #7a8799 */
  --text-muted:       218 19% 30%;     /* #3d4a5c */
  --text-code:        211 100% 65%;    /* #4fa8ff */

  /* ─── Accents ─── */
  --accent:           158 100% 41%;    /* #00d084 — terminal green */
  --accent-dim:       158 100% 41%;    /* used with /9 opacity */
  --accent-hover:     158 100% 46%;    /* #00e895 */
  --accent-blue:      211 100% 65%;    /* #4fa8ff */
  --accent-purple:    281 70% 74%;     /* #c792ea — syntax keywords */
  --accent-amber:     38 91% 55%;      /* #f5a623 */
  --accent-red:       0 100% 67%;      /* #ff5c5c */

  /* ─── Shadcn Token Aliases (required for components to work) ─── */
  --background:       var(--bg-base);
  --foreground:       var(--text-primary);
  --card:             var(--bg-surface);
  --card-foreground:  var(--text-primary);
  --popover:          var(--bg-elevated);
  --popover-foreground: var(--text-primary);
  --primary:          var(--accent);
  --primary-foreground: 220 14% 4%;   /* black text on green button */
  --secondary:        var(--bg-elevated);
  --secondary-foreground: var(--text-primary);
  --muted:            var(--bg-elevated);
  --muted-foreground: var(--text-secondary);
  --accent-color:     var(--bg-elevated);
  --accent-color-foreground: var(--text-primary);
  --destructive:      var(--accent-red);
  --destructive-foreground: var(--text-primary);
  --border:           var(--border);
  --input:            var(--bg-deep);
  --ring:             var(--accent);
  --radius:           0.375rem;        /* 6px — subtle, not round */

  /* ─── Sidebar ─── */
  --sidebar:          var(--bg-surface);
  --sidebar-foreground: var(--text-primary);
  --sidebar-primary:  var(--accent);
  --sidebar-primary-foreground: 220 14% 4%;
  --sidebar-accent:   var(--bg-elevated);
  --sidebar-accent-foreground: var(--text-primary);
  --sidebar-border:   var(--border);
  --sidebar-ring:     var(--accent);
  --sidebar-width:    14rem;           /* 224px */
  --sidebar-width-icon: 3.5rem;
}
```

---

## 3. Typography — JetBrains Mono Throughout

### 3.1 The Core Decision

AgentMail uses **JetBrains Mono for every piece of text in the console** — not just code. Navigation labels, table headers, stat values, button text, breadcrumbs, timestamps, form inputs, tooltips — all monospace. This is the single most impactful design decision to clone.

### 3.2 Setup

```html
<!-- index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

```css
/* index.css */
*, *::before, *::after {
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", "Menlo", "Monaco", monospace;
}
body {
  font-size: 13px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: hsl(var(--bg-base));
  color: hsl(var(--text-primary));
}
```

### 3.3 Type Scale

| Element | Size | Weight | Color | Letter-spacing |
|---|---|---|---|---|
| Page title | 18px | 600 | `--text-primary` | normal |
| Section title | 15px | 500 | `--text-primary` | normal |
| `[ Bracket label ]` | 10–11px | 400 | `--text-muted` | `0.1em` |
| Nav section label | 10px | 400 | `--text-muted` | `0.1em` |
| Nav item | 12.5px | 400 | `--text-secondary` | normal |
| Body text | 13px | 400 | `--text-secondary` | normal |
| Table col header | 11px | 400 | `--text-muted` | `0.08em` |
| Table cell text | 12.5px | 400 | `--text-secondary` | normal |
| Table cell value (IDs, keys) | 12px | 400 | `--text-code` (blue) | normal |
| Stat value | 24px | 600 | `--text-primary` or `--accent` | normal |
| Stat label | 11px | 400 | `--text-secondary` | `0.08em` |
| Button text | 12px | 500 | varies | normal |
| Code/terminal | 12px | 400 | `--text-code` | normal |
| Timestamp/meta | 11px | 400 | `--text-muted` | normal |

### 3.4 The `[ Bracket Label ]` Pattern

Every section heading in the console and marketing site uses this convention:

```tsx
// Usage: above a major section or page heading
<span className="block text-[10px] text-muted-foreground uppercase tracking-[0.1em] mb-1">
  [ Inboxes ]
</span>
<h1 className="text-[18px] font-semibold text-foreground">
  Your Inboxes
</h1>
```

Seen on: auth pages `[ Sign In ]` / `[ Sign Up ]`, marketing sections `[ What we offer ]` / `[ By the numbers ]`, pricing page, every major console section.

---

## 4. Layout Architecture

### 4.1 Full App Shell

```
┌──────────────────────────────────────────────────────────────────┐
│ SIDEBAR (224px / --sidebar-width: 14rem)   │ MAIN AREA            │
│ bg: #161a1f  border-r: #2a3140             │ bg: #0d0f12          │
│                                            │                      │
│ ┌──────────────────────────────────────┐   │ ┌──────────────────┐ │
│ │ LOGO AREA (h: 56px, border-b)        │   │ │ TOPBAR (h: 52px) │ │
│ │  [@] agentmail  [org dropdown ▾]     │   │ │ breadcrumb | acts│ │
│ └──────────────────────────────────────┘   │ └──────────────────┘ │
│                                            │                      │
│ ┌──────────────────────────────────────┐   │ CONTENT SCROLL AREA  │
│ │ NAV SECTION LABEL                    │   │  padding: 28px 32px  │
│ │  [ Core ]                            │   │                      │
│ │  ▌ Inboxes    ← active (green)       │   │  page-header         │
│ │    Messages                          │   │  stats-grid          │
│ │    Webhooks                          │   │  data-table          │
│ │    Threads                           │   │  code-blocks         │
│ │                                      │   │                      │
│ │ [ Developer ]                        │   │                      │
│ │    API Keys                          │   │                      │
│ │    Logs                              │   │                      │
│ │    Docs ↗                            │   │                      │
│ │                                      │   │                      │
│ │ [ Account ]                          │   │                      │
│ │    Usage                             │   │                      │
│ │    Settings                          │   │                      │
│ └──────────────────────────────────────┘   │                      │
│                                            │                      │
│ ┌──────────────────────────────────────┐   │                      │
│ │ FOOTER                               │   │                      │
│ │  [●] org-name  ▾  user@email.com    │   │                      │
│ └──────────────────────────────────────┘   │                      │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Sidebar Specs (Exact)

```css
/* The sidebar */
--sidebar-width: 14rem;       /* 224px */
background: hsl(var(--bg-surface));
border-right: 1px solid hsl(var(--border));
display: flex;
flex-direction: column;
height: 100vh;
position: sticky;
top: 0;
overflow: hidden;
```

**Logo area**:
- Height: 56px
- Padding: `0 18px`
- Border-bottom: `1px solid hsl(var(--border))`
- `[@]` mark: 24×24px, `background: hsl(var(--accent))`, `border-radius: 4px`, black text, font-weight: 700
- Wordmark: `"agent"` in `--text-primary`, `"mail"` (or "Prep") in `--accent`
- Org dropdown: right side, chevron, 11px, `--text-secondary`

**Nav section labels**:
```css
padding: 10px 18px 4px;
font-size: 10px;
color: hsl(var(--text-muted));
text-transform: uppercase;
letter-spacing: 0.1em;
```

**Nav items**:
```css
/* Base */
display: flex; align-items: center; gap: 10px;
padding: 8px 18px;
font-size: 12.5px;
color: hsl(var(--text-secondary));
border-left: 2px solid transparent;
transition: all 0.12s;
cursor: pointer;

/* Hover */
color: hsl(var(--text-primary));
background: hsl(var(--bg-elevated));

/* Active */
color: hsl(var(--accent));
border-left-color: hsl(var(--accent));
background: hsl(var(--accent) / 9%);
```

**Sidebar footer**:
- Org/user block: avatar circle (24px, gradient), org name (11.5px, `--text-primary`), email (10.5px, `--text-secondary`)
- Plan badge: small pill, `bg-elevated`, `--text-muted`, e.g. "Free"

### 4.3 Topbar Specs

```css
height: 52px;
background: hsl(var(--bg-surface));
border-bottom: 1px solid hsl(var(--border));
display: flex;
align-items: center;
justify-content: space-between;
padding: 0 24px;
```

- **Left**: Breadcrumb: `Dashboard › Inboxes` — muted color for parent, `--text-primary` for current
- **Right**: Ghost action buttons (e.g. "Create Inbox") + user avatar
- Separator: `" / "` or `" › "` in `--text-muted`

### 4.4 Content Area

```css
flex: 1;
overflow-y: auto;
padding: 28px 32px;
background: hsl(var(--bg-base));   /* darker than sidebar */
```

**Page header block**:
```tsx
<div className="mb-7">
  <span className="block text-[10px] text-muted-foreground uppercase tracking-[0.1em] mb-1">
    [ Inboxes ]
  </span>
  <h1 className="text-[18px] font-semibold text-foreground mb-1">Your Inboxes</h1>
  <p className="text-[12px] text-muted-foreground">
    Create and manage email inboxes for your AI agents.
  </p>
</div>
```

---

## 5. Console Sections — Exact Data & UI per Page

### 5.1 Inboxes Page

**Data fields** (from `GET /v0/inboxes`):
| Field | Type | Display |
|---|---|---|
| `email` | string | Primary cell, `--text-primary` |
| `display_name` | string | Secondary, `--text-secondary` |
| `inbox_id` | string | Monospace, `--text-code` (blue), truncated with copy |
| `pod_id` | string | Monospace, `--text-code`, small/muted |
| `created_at` | datetime | Formatted "2 hours ago" / "Apr 5", `--text-muted` |
| `client_id` | string | Optional, shown if set |

**Table structure**:
```
EMAIL                          DISPLAY NAME     INBOX ID         POD      CREATED
agent-1@agentmail.to          My Agent         am_inbox_abc...  default  2h ago      [•••]
outreach@agentmail.to         Outreach Bot     am_inbox_xyz...  pod-2    Apr 3       [•••]
```

**Actions per row**: 3-dot menu → View, Copy ID, Delete

**Empty state**: Terminal-style block:
```
$ agentmail inboxes create
No inboxes yet. Create your first inbox to get started.
```

### 5.2 Messages Page (within Inbox)

**Data fields** (from `GET /v0/inboxes/:id/messages` — 18 properties):
| Field | Display |
|---|---|
| `from` | Primary sender cell |
| `subject` | Main content, `--text-primary` |
| `timestamp` | Right-aligned, `--text-muted`, relative format |
| `labels` | Badge pills (e.g. "inbox", "sent", "spam") |
| `text` preview | Truncated gray body preview |

**Filter bar**: Label filter chips + date range picker + search input

### 5.3 Webhooks Page

**Data fields** (from `POST /v0/webhooks` response):
| Field | Display |
|---|---|
| `url` | Monospace, `--text-code` |
| `webhook_id` | Monospace blue, truncated |
| `enabled` | Green "active" / gray "disabled" dot badge |
| `event_types` | Small pills, truncated list |
| `secret` | Hidden by default, "Reveal" button |
| `created_at` | Relative timestamp |

**Event types** (9 values from API):
- `message.received`, `message.sent`, `message.draft.created`
- `message.labeled`, `message.deleted`, `thread.created`
- `thread.labeled`, `thread.updated`, `inbox.created`

### 5.4 API Keys Page

**This is the highest-stakes page** for developers. Exact pattern:

```
[ API Keys ]
Manage API keys for accessing the AgentMail API.

┌────────────────────────────────────────────────────────────────┐
│ Name              Key                    Created     Actions    │
│────────────────────────────────────────────────────────────────│
│ Production Key    am_key_••••••••••1234  Apr 1       [Copy] [×]│
│ Dev Key           am_key_••••••••••abcd  Mar 28      [Copy] [×]│
└────────────────────────────────────────────────────────────────┘

[+ Create New API Key]
```

- Keys are shown masked by default (`am_key_••••••••`)
- Copy button: ghost, small, copies full key to clipboard with toast "Copied!"
- Delete button: icon, red on hover, confirmation dialog
- "Create New API Key" → modal: text input for name → generates key → show-once full key display

**Create key modal**:
```
Create API Key

Name
[________________________]
e.g. "Production", "Development"

[Cancel]  [Create Key]
```

**Post-creation show-once display** (critical UX):
```
API Key Created
Make sure to copy your key now. You won't be able to see it again.

am_key_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0

[Copy Key]  [Done]
```

### 5.5 Logs Page

Chronological event log:
```
TIMESTAMP            EVENT               INBOX              STATUS
2026-04-06 03:12:41  message.received    agent-1@...        200 OK
2026-04-06 03:11:30  webhook.delivered   https://api...     200 OK
2026-04-06 03:10:05  inbox.created       outreach@...       201 Created
```

- Status codes with color: `200` green, `4xx` amber, `5xx` red
- Click row to expand: full JSON payload in code block

### 5.6 Usage Page

Stats grid + time-series chart (recharts):
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Inboxes  │  │ Emails   │  │ Webhooks │  │ Storage  │
│ 2 / 3   │  │ 847/3000 │  │ 1 / 2   │  │ 0.3/3 GB │
│ Free tier│  │ 28% used │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

Email Volume (last 30 days)
[line/bar chart in accent green on dark bg]
```

---

## 6. Component Specifications (Pixel-Perfect)

### 6.1 Cards / Panel Containers

```tsx
// Standard card wrapping tables, code, stats
<div className="bg-surface border border-border rounded-md overflow-hidden">
  {/* Card header row */}
  <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-border">
    <span className="text-[13px] font-medium text-foreground">Title</span>
    <div className="flex gap-2">
      {/* ghost action buttons */}
    </div>
  </div>
  {/* Card body */}
  <div className="p-[18px]">...</div>
</div>
```

Rules:
- `bg-surface` NOT `bg-card` (surface = `#161a1f`)
- `border border-border` (`#2a3140`), `rounded-md` (6px)
- Zero drop shadows — NEVER `shadow-*` on cards
- Inside the darker `bg-base` content area this creates correct contrast

### 6.2 Data Tables (Full Spec)

```tsx
<div className="bg-surface border border-border rounded-md overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-border">
    <span className="text-[13px] font-medium text-foreground">Inboxes</span>
    <Button variant="ghost" size="sm">
      <Plus className="w-3 h-3 mr-1.5" /> Create Inbox
    </Button>
  </div>
  {/* Filter bar (optional) */}
  <div className="px-[18px] py-[10px] border-b border-border flex gap-2">
    <Input placeholder="Search..." className="h-8 w-48 text-xs" />
    {/* Label filter chips */}
  </div>
  {/* Table */}
  <table className="w-full border-collapse">
    <thead>
      <tr>
        <th className="px-[18px] py-[10px] text-left text-[11px] font-normal text-muted-foreground uppercase tracking-[0.08em] border-b border-border">
          Email
        </th>
        <th className="px-[18px] py-[10px] text-left text-[11px] font-normal text-muted-foreground uppercase tracking-[0.08em] border-b border-border">
          Inbox ID
        </th>
        <th className="px-[18px] py-[10px] text-left text-[11px] font-normal text-muted-foreground uppercase tracking-[0.08em] border-b border-border">
          Created
        </th>
        <th className="px-[18px] py-2 border-b border-border w-[40px]" />
      </tr>
    </thead>
    <tbody>
      <tr className="group hover:bg-elevated transition-colors duration-100">
        {/* Primary value cell */}
        <td className="px-[18px] py-[11px] text-[12.5px] text-foreground border-b border-border">
          agent@devprep.app
        </td>
        {/* Monospace ID / key cell */}
        <td className="px-[18px] py-[11px] border-b border-border">
          <span className="font-mono text-[12px] text-[#4fa8ff]">dp_inbox_a1b2c3</span>
        </td>
        {/* Timestamp */}
        <td className="px-[18px] py-[11px] text-[11px] text-muted-foreground border-b border-border">
          2 hours ago
        </td>
        {/* Row actions — visible on group-hover only */}
        <td className="px-[18px] py-[11px] border-b border-border">
          <div className="invisible group-hover:visible flex gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  {/* Pagination footer */}
  <div className="flex items-center justify-between px-[18px] py-[10px] border-t border-border">
    <span className="text-[11px] text-muted-foreground">Showing 1–10 of 47</span>
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" disabled>Previous</Button>
      <Button size="sm" variant="ghost">Next</Button>
    </div>
  </div>
</div>
```

Key rules:
- Column header: 11px, `--text-muted`, `uppercase`, `tracking-[0.08em]`, `font-normal` (NOT bold)
- Row text: 12.5px, `--text-secondary` for meta, `--text-primary` for main value, `--text-code` for IDs/keys
- Row hover: `bg-elevated` (`#1e2329`)
- Last row: no border-bottom
- Row actions: `invisible group-hover:visible` pattern

### 6.3 Status Badges (Dot Indicator Pattern)

```tsx
// The AgentMail badge is a small pill with a colored dot prefix
type BadgeVariant = 'active' | 'idle' | 'error' | 'warning';

const badge = {
  active:  { dot: 'bg-[#00d084]',  bg: 'bg-[#00d084]/10', text: 'text-[#00d084]' },
  idle:    { dot: 'bg-[#7a8799]',  bg: 'bg-[#7a8799]/10', text: 'text-[#7a8799]' },
  error:   { dot: 'bg-[#ff5c5c]',  bg: 'bg-[#ff5c5c]/10', text: 'text-[#ff5c5c]' },
  warning: { dot: 'bg-[#f5a623]',  bg: 'bg-[#f5a623]/10', text: 'text-[#f5a623]' },
};

function StatusBadge({ variant, label }: { variant: BadgeVariant; label: string }) {
  const s = badge[variant];
  return (
    <span className={cn(
      "inline-flex items-center gap-[5px] px-2 py-0.5 rounded text-[11px] font-medium",
      s.bg, s.text
    )}>
      <span className={cn("w-[5px] h-[5px] rounded-full flex-shrink-0", s.dot)} />
      {label}
    </span>
  );
}
```

Label examples:
- `active` → "Active", "Enabled", "Online"
- `idle` → "Idle", "Disabled", "Inactive"
- `error` → "Error", "Failed"
- `warning` → "Pending", "Warning", "Limited"

### 6.4 Buttons — All Variants

```tsx
// PRIMARY — green with black text (the CTA button)
<Button className="bg-[#00d084] text-black border-[#00d084] hover:bg-[#00e895] text-[12px] font-medium px-[14px] py-[7px] h-auto rounded-md">
  Create Inbox
</Button>

// GHOST — transparent with border (secondary action)
<Button variant="ghost" className="border border-border text-[#7a8799] hover:border-[#3d4f6e] hover:text-foreground text-[12px] font-medium px-[14px] py-[7px] h-auto rounded-md">
  View Docs
</Button>

// DANGER — red outline (destructive)
<Button className="border border-[#ff5c5c]/25 text-[#ff5c5c] hover:bg-[#ff5c5c]/10 text-[12px] font-medium px-[14px] py-[7px] h-auto rounded-md">
  Delete
</Button>

// ICON — ghost icon button (table row actions)
<Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
  <Copy className="w-3 h-3" />
</Button>
```

All buttons:
- `font-family: inherit` (monospace)
- `font-size: 12px`, `font-weight: 500`
- `border-radius: 6px`
- Transitions: `all 0.12s`
- No box shadows

### 6.5 Text Inputs & Form Fields

```tsx
// Standard input
<input className="
  bg-[#080a0d]           /* deep, darker than content area */
  border border-[#2a3140]
  rounded-md
  text-foreground
  font-mono text-[12.5px]
  px-3 py-2
  placeholder:text-[#3d4a5c]
  focus:outline-none
  focus:border-[#00d084]
  focus:ring-2 focus:ring-[#00d084]/10
  transition-all duration-100
  w-full
" />

// Label
<label className="block text-[11px] text-[#7a8799] mb-1.5 uppercase tracking-[0.05em]">
  Name
</label>
```

### 6.6 Code Blocks (Syntax-Colored)

```tsx
// Exact AgentMail color mapping for code:
// #7a8799 → comments (#  or //)
// #c792ea → keywords (import, const, from, async)
// #4fa8ff → function/method names, variables
// #00d084 → strings and values (green — the accent)
// #e8edf3 → default text

function CodeBlock({ children, language }: { children: ReactNode; language?: string }) {
  return (
    <div className="relative group bg-[#080a0d] border border-[#2a3140] rounded-md p-[16px_18px] font-mono text-[12px] overflow-x-auto leading-[1.8]">
      {language && (
        <span className="absolute top-[10px] left-[18px] text-[10px] text-[#3d4a5c] uppercase tracking-[0.08em]">
          {language}
        </span>
      )}
      <button
        className="absolute top-[10px] right-[10px] px-[10px] py-1 bg-[#1e2329] border border-[#2a3140] rounded text-[11px] text-[#7a8799] hover:text-foreground hover:border-[#3d4f6e] opacity-0 group-hover:opacity-100 transition-all duration-100"
        onClick={() => navigator.clipboard.writeText(/* raw text */'')}
      >
        Copy
      </button>
      <div className={language ? 'mt-5' : ''}>{children}</div>
    </div>
  );
}
```

### 6.7 Terminal / Prompt Blocks

```tsx
// Mimics an actual terminal session
function TerminalBlock({ lines }: { lines: TerminalLine[] }) {
  return (
    <div className="bg-[#080a0d] border border-[#2a3140] rounded-md p-[16px_18px] font-mono text-[12px] leading-[1.8]">
      {lines.map((line, i) => (
        <div key={i}>
          {line.type === 'command' && (
            <div className="text-foreground">
              <span className="text-[#00d084]">$ </span>
              {line.text}
            </div>
          )}
          {line.type === 'output' && (
            <div className="pl-[14px] text-[#7a8799]">{line.text}</div>
          )}
          {line.type === 'success' && (
            <div className="pl-[14px] text-[#00d084]">{line.text}</div>
          )}
          {line.type === 'error' && (
            <div className="pl-[14px] text-[#ff5c5c]">{line.text}</div>
          )}
          {line.type === 'cursor' && (
            <div className="text-foreground">
              <span className="text-[#00d084]">$ </span>
              <span className="after:content-['▌'] after:text-[#00d084] after:animate-blink" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 6.8 Stat Cards Grid

```tsx
// Stats grid: auto-fill columns, 14px gap
<div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px] mb-7">
  <StatCard label="Questions" value="1,247" meta="across 31 channels" accent={false} />
  <StatCard label="Streak" value="12" meta="days in a row" accent={true} />
  <StatCard label="Mastered" value="89%" meta="of attempted cards" accent={false} />
  <StatCard label="Coding Challenges" value="34" meta="completed" accent={false} />
</div>

function StatCard({ label, value, meta, accent }) {
  return (
    <div className="bg-[#161a1f] border border-[#2a3140] rounded-md p-[18px_20px]">
      <div className="text-[11px] text-[#7a8799] uppercase tracking-[0.08em] mb-2">{label}</div>
      <div className={cn("text-[24px] font-semibold", accent ? "text-[#00d084]" : "text-foreground")}>
        {value}
      </div>
      {meta && <div className="text-[11px] text-[#3d4a5c] mt-1">{meta}</div>}
    </div>
  );
}
```

### 6.9 Modals / Dialogs

```tsx
// The modal overlay is slightly different from Shadcn default
// Overlay: bg-black/60 backdrop-blur-sm
// Modal: bg-[#161a1f] border border-[#2a3140] rounded-md shadow-none
// Header: border-b border-[#2a3140], 15px font-medium
// Footer: border-t border-[#2a3140], flex gap-2 justify-end
```

---

## 7. Auth Pages — Exact Layout

### 7.1 Sign In / Sign Up Page Structure

```tsx
<div className="min-h-screen bg-[#0d0f12] flex items-center justify-center">
  {/* ASCII Art background — fixed, full viewport, very low opacity */}
  <div className="fixed inset-0 flex items-end justify-end pointer-events-none overflow-hidden">
    <img
      src="/ascii-art.svg"
      alt=""
      className="opacity-[0.12] w-full max-w-3xl select-none"
    />
  </div>

  {/* Auth card — centered, 400px wide */}
  <div className="relative z-10 w-full max-w-[420px] mx-auto px-6">
    {/* Logo */}
    <div className="flex items-center gap-2 mb-8 justify-center">
      <div className="w-8 h-8 bg-[#00d084] rounded flex items-center justify-center text-black font-bold text-sm">
        D
      </div>
      <span className="text-[15px] font-semibold text-foreground">
        dev<span className="text-[#00d084]">prep</span>
      </span>
    </div>

    {/* Bracket label */}
    <div className="text-center mb-1">
      <span className="text-[10px] text-[#3d4a5c] uppercase tracking-[0.1em]">[ Sign In ]</span>
    </div>

    {/* Main heading */}
    <h1 className="text-[20px] font-semibold text-center text-foreground mb-1">
      Sign in to DevPrep
    </h1>
    <p className="text-[12px] text-[#7a8799] text-center mb-8">
      Welcome back! Please sign in to continue.
    </p>

    {/* Auth form */}
    <div className="bg-[#161a1f] border border-[#2a3140] rounded-md p-6">
      {/* Google OAuth button */}
      <button className="w-full flex items-center justify-center gap-2 bg-[#1e2329] border border-[#2a3140] rounded-md px-4 py-2.5 text-[12.5px] text-foreground hover:border-[#3d4f6e] transition-colors mb-4">
        <img src="/google.svg" className="w-4 h-4" />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#2a3140]" />
        <span className="text-[11px] text-[#3d4a5c]">or</span>
        <div className="flex-1 h-px bg-[#2a3140]" />
      </div>

      {/* Email input */}
      <div className="mb-3">
        <label className="block text-[11px] text-[#7a8799] mb-1.5">Email address</label>
        <input type="email" className="..." placeholder="you@example.com" />
      </div>

      {/* Password input */}
      <div className="mb-5">
        <label className="block text-[11px] text-[#7a8799] mb-1.5">Password</label>
        <input type="password" className="..." />
      </div>

      {/* Submit */}
      <button className="w-full bg-[#00d084] text-black font-medium text-[13px] py-2.5 rounded-md hover:bg-[#00e895] transition-colors">
        Continue
      </button>
    </div>

    {/* Switch link */}
    <p className="text-center text-[12px] text-[#7a8799] mt-4">
      Don't have an account?{" "}
      <a href="/sign-up" className="text-[#00d084] hover:text-[#00e895]">Sign up</a>
    </p>
  </div>
</div>
```

### 7.2 ASCII Art Asset

AgentMail loads `/agentmail-ascii.svg` — an SVG rendering of ASCII art that forms the brand wordmark or logo in terminal characters. For DevPrep:

1. Create `/public/devprep-ascii.svg` — ASCII-art render of "DevPrep" or a bracket pattern
2. Alternatively use an ASCII-text block rendered via CSS/SVG
3. Apply: `position: fixed`, `bottom: 0`, `right: 0`, `opacity: 0.12`, `pointer-events: none`

The ASCII art is visible on **auth pages only** — not inside the console app.

AgentMail also uses `asci_4.svg` and `asci_6.svg` on their pricing/marketing pages as decorative backgrounds.

---

## 8. Scrollbar Styling

```css
/* Must match terminal aesthetic — thin, dark, barely visible */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: hsl(var(--border));   /* #2a3140 */
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--border-active));  /* #3d4f6e */
}
/* Hide scrollbar buttons */
::-webkit-scrollbar-button { display: none; }
```

---

## 9. Tailwind Config Additions

```typescript
// tailwind.config.ts — additions needed
export default {
  // ...
  theme: {
    extend: {
      colors: {
        // All mapped to CSS variables
        background:  "hsl(var(--bg-base))",
        surface:     "hsl(var(--bg-surface))",
        elevated:    "hsl(var(--bg-elevated))",
        deep:        "hsl(var(--bg-deep))",
        foreground:  "hsl(var(--text-primary))",
        border:      "hsl(var(--border))",
        accent: {
          DEFAULT: "hsl(var(--accent))",
          hover:   "hsl(var(--accent-hover))",
          dim:     "hsl(var(--accent) / 9%)",
        },
        "code-blue": "hsl(var(--accent-blue))",
        "code-purple": "hsl(var(--accent-purple))",
        muted: {
          DEFAULT:    "hsl(var(--bg-elevated))",
          foreground: "hsl(var(--text-secondary))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--accent-red))",
          foreground: "hsl(var(--text-primary))",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'Menlo', 'monospace'],
        sans: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'Menlo', 'monospace'],
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
      },
      borderRadius: {
        DEFAULT: "0.375rem",  // 6px everywhere
        md: "0.375rem",
        sm: "0.25rem",
        lg: "0.5rem",        // rarely used
      },
    },
  },
};
```

---

## 10. Interaction Principles

| Interaction | Spec | Notes |
|---|---|---|
| All transitions | `transition-all duration-100` (`0.1s`) | Extremely fast — feels snappy |
| Nav item hover | bg → `--bg-elevated` | No scale transform |
| Table row hover | bg → `--bg-elevated` | `transition-colors duration-100` |
| Button hover (primary) | bg → `--accent-hover` (#00e895) | Slightly lighter green |
| Button hover (ghost) | border → `--border-active`, text → primary | No bg change |
| Input focus | border → `--accent`, ring → `--accent/10` | No scale transform |
| Copy button click | Shows "Copied!" for 1.5s then reverts | No animation, just text swap |
| Modal open | No animation — instant appear with overlay | Pure function, no flourish |
| Row actions | `opacity-0 group-hover:opacity-100` | Appear on row hover |
| Zero drop shadows | NONE throughout the console | This is absolute |
| Zero scale transforms | NONE on hover/active | Layout-stable |

---

## 11. Nav to DevPrep Section Mapping

### Console Nav Structure Applied to DevPrep

```
[ Practice ]
  ▌ Questions          (swipe/browse questions — "Inboxes" analog)
    Flashcards         (SRS card review — "Messages" analog)
    Coding Challenges  (code editor — "Webhooks" analog)
    Voice Practice     (interview sim — "Threads" analog)

[ Learn ]
    Learning Paths     (curated paths — "API Keys" analog)
    Certifications     (cert prep — "Logs" analog)
    Docs / Guides      (external link — "Docs" analog)

[ Progress ]
    Stats & Usage      (analytics — "Usage" analog)
    History            (activity log — matches "Logs")
    Settings           (account settings)
```

---

## 12. Pricing Page Pattern (For Future Reference)

AgentMail's pricing page uses:
- **ASCII art SVG decoratives** (`asci_6.svg`, `asci_4.svg`) as page-section dividers
- **Tier cards**: horizontal row of 4, with `Developer` slightly elevated via subtle border change
- **Feature comparison table**: full-width, alternating sections (Core, Advanced, Deliverability, Security, Support)
- **Tier badge** on current plan shown in sidebar footer

Pricing layout to mirror for DevPrep's potential upgrade flow:
```
Free | Pro | Team | Enterprise
```

---

## 13. Implementation Order (Prioritized)

### Sprint 1 — Foundation (Most Impact, Least Risk)
1. `index.html`: Add JetBrains Mono Google Font link
2. `index.css`: Replace ALL CSS variables with the AgentMail token set
3. `index.css`: Add scrollbar, blink keyframe, monospace font declarations
4. `tailwind.config.ts`: Add color mappings and font aliases
5. Restart dev server and visually audit

### Sprint 2 — Shell & Navigation
6. `App.tsx`: Update `SidebarProvider` with `--sidebar-width: 14rem`
7. `components/app-sidebar.tsx`: Full reskin — logo area, nav labels, active states, footer
8. `components/layout/Topbar.tsx`: Breadcrumb pattern, ghost actions
9. Verify content area uses `bg-background` (darker `#0d0f12`) vs sidebar `bg-surface` (`#161a1f`)

### Sprint 3 — Core Components
10. `components/ui/button.tsx`: Update variants to AgentMail palette (primary = green/black)
11. `components/ui/input.tsx`: Deep input background, accent focus ring
12. `components/ui/card.tsx`: Remove shadow, ensure `bg-surface border-border`
13. New: `components/ui/status-badge.tsx` — dot indicator badge component
14. New: `components/ui/code-block.tsx` — syntax-colored, copy button, hover reveal
15. New: `components/ui/terminal-block.tsx` — `$` prompt, output, cursor blink
16. New: `components/ui/stat-card.tsx` — 24px value, uppercase label, meta

### Sprint 4 — Pages
17. All page headers: Add `[ Bracket ]` label + title + subtitle pattern
18. All data tables: monospace ID cells (blue), muted uppercase headers, hover rows
19. Dashboard page: Stats grid + terminal block welcome
20. Auth pages (`/sign-in`, `/sign-up`): Split layout + ASCII art background

### Sprint 5 — Polish
21. Create `/public/devprep-ascii.svg` ASCII art asset
22. Add `group-hover:opacity-100` row action pattern everywhere
23. Audit: zero drop shadows remain
24. Audit: all text contrasts correct (no light-on-light, no dark-on-dark)
25. Audit: all transitions at `duration-100` (0.1s)
26. Verify JetBrains Mono renders in all browsers
27. Verify scrollbar styling applied

---

## 14. Files to Modify — Complete List

| File | Changes |
|---|---|
| `client/index.html` | JetBrains Mono font link tag |
| `client/src/index.css` | Full token replacement, font, scrollbar, blink |
| `tailwind.config.ts` | Color system, font family, keyframes/animations |
| `client/src/App.tsx` | Sidebar width vars, remove any light-mode defaults |
| `client/src/components/app-sidebar.tsx` | Logo, nav sections with brackets, active state, footer |
| `client/src/components/ui/button.tsx` | Variant palette update |
| `client/src/components/ui/input.tsx` | Deep bg, accent focus |
| `client/src/components/ui/card.tsx` | No shadow, surface + border |
| `client/src/components/ui/badge.tsx` | Dot-indicator style |
| `client/src/components/ui/dialog.tsx` | Dark overlay, no shadow on panel |
| `client/src/components/ui/table.tsx` | Muted uppercase headers, hover rows |
| New: `client/src/components/ui/status-badge.tsx` | Dot badge component |
| New: `client/src/components/ui/code-block.tsx` | Syntax block with copy |
| New: `client/src/components/ui/terminal-block.tsx` | Terminal prompt block |
| New: `client/src/components/ui/stat-card.tsx` | Stat display card |
| All `client/src/pages/*.tsx` | Page headers with bracket labels |
| New: `public/devprep-ascii.svg` | ASCII art asset for auth pages |
| Auth page components | Split layout + ASCII background |

---

## 15. The "Is It AgentMail?" Checklist

Run through this after implementation:

- [ ] Background is near-black (`#0d0f12`), NOT pure black, NOT gray-900
- [ ] Every single piece of text — including nav labels and buttons — uses JetBrains Mono
- [ ] The sidebar is `#161a1f`, one step lighter than the content area
- [ ] Active nav item has a green left border (`2px solid #00d084`), green text, faint green bg
- [ ] API key / ID values in tables are shown in `#4fa8ff` (blue), not white
- [ ] Table column headers are 11px, muted, uppercase, 0.08em letter-spacing
- [ ] Primary CTA button is `#00d084` with **black** text (not white)
- [ ] ZERO drop shadows anywhere in the console
- [ ] ZERO scale transforms on hover/active
- [ ] All transitions are `duration-100` (0.1s) — not 200ms or 300ms
- [ ] Section headings use the `[ Bracket ]` label pattern above the title
- [ ] Auth pages have an ASCII art background element at ~12% opacity
- [ ] Scrollbar is 5px wide, `#2a3140` thumb, no track background
- [ ] Inputs have `#080a0d` background (darker than everything else) with accent focus ring
- [ ] Code blocks: comments gray, keywords purple, strings/values green, variables blue
