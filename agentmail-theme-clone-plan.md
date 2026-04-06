# AgentMail Console Theme Clone — Deep Research Plan (v3)

> **Reference**: https://console.agentmail.to/
> **Last researched**: April 6, 2026
> **Research depth**: Homepage, Docs, all API endpoints, pricing, blog, third-party reviews, GitHub org (16 repos)

---

## GAP ANALYSIS — What the Previous Plan Was Missing

Before the spec, here is an honest audit of what was incomplete or wrong in earlier versions:

| Gap | Severity | Status |
|---|---|---|
| Missing entire **Domains** console page | High | Fixed in §5.6 |
| Missing **Pods** hierarchy and sidebar pod switcher | High | Fixed in §4.2, §5.7 |
| Missing **SDK code popover** on table rows | High | Fixed in §6.10 |
| Missing complete **message model** (21 fields, not 18) | Medium | Fixed in §5.2 |
| Missing all **9+ webhook event types** (had "9 enum values" but unnamed) | Medium | Fixed in §5.3 |
| Missing **skeleton loading states** entirely | Medium | Fixed in §6.11 |
| Missing **toast/notification system** spec | Medium | Fixed in §6.12 |
| Missing per-page **empty states** | Medium | Fixed in §6.13 |
| Missing **thread detail view** (conversation UI) | Medium | Fixed in §5.8 |
| Missing **label system** (colors, filter chips) | Medium | Fixed in §5.9 |
| Missing **BIND zone file download** button on Domains | Low | Fixed in §5.6 |
| Missing **mobile / responsive** behavior spec | Low | Fixed in §11 |
| Missing **confirmation dialogs** for destructive actions | Low | Fixed in §6.9 |
| Missing **settings page** structure | Low | Fixed in §5.10 |
| Missing **plan limit indicators** in stat cards | Low | Fixed in §6.8 |
| Missing **keyboard shortcuts** | Low | Fixed in §12 |
| Background step count was wrong (said 3, actually 6) | High | Fixed in §2.1 |
| Event types count was wrong (said 7, actually 9+) | Medium | Fixed in §5.3 |
| Org avatar gradient was assumed, not confirmed | Low | Noted in §4.2 |

---

## 1. Product Context

AgentMail (YC S25, $6M seed from General Catalyst, Paul Graham, Dharmesh Shah, Paul Copplestone) is an API-first email infrastructure for AI agents. Founded 2025, 16 public GitHub repos, using Fern for SDK codegen.

**Design motivation**: Built from scratch "every pixel" for developers. The console must feel like a high-quality CLI tool in a browser — terminal aesthetic, monospace everywhere, zero decoration, maximum information density.

**Hierarchy that drives the entire UI**:
```
Organization (your company account)
  └── Pod (workspace / tenant isolation unit)
      ├── Inbox   (individual email address)
      ├── Domain  (custom sending domain)
      └── Webhook (event endpoint)
  └── API Keys   (org-level, not pod-scoped)
  └── Metrics    (org-level)
```

---

## 2. Color System

### 2.1 Six Background Steps (corrected — was 3 in v1)

| Level | Hex | H S% L% | Role |
|---|---|---|---|
| 0 — Deep | `#080a0d` | `220 24% 5%` | Inputs, code blocks, terminal blocks, the floor |
| 1 — Base | `#0d0f12` | `220 16% 7%` | App content area background |
| 2 — Surface | `#161a1f` | `220 14% 11%` | Sidebar, topbar, cards, panels |
| 3 — Elevated | `#1e2329` | `220 13% 14%` | Row hover, dropdowns, modals |
| 4 — Raised | `#252c36` | `220 17% 18%` | Active inputs, selected dropdown items |
| 5 — Highlight | `#2e3847` | `220 21% 23%` | Focused form fields, strong selection states |

### 2.2 Borders

| Token | Hex | Role |
|---|---|---|
| `--border` | `#2a3140` | All card edges, table row separators, input borders |
| `--border-active` | `#3d4f6e` | Hovered/focused borders |
| `--border-subtle` | `#1e2632` | Inner-card dividers where extra subtlety needed |

### 2.3 Text

| Token | Hex | Role |
|---|---|---|
| `--text-primary` | `#e8edf3` | Headings, active nav, table primary values |
| `--text-secondary` | `#7a8799` | Body text, nav items, descriptions |
| `--text-muted` | `#3d4a5c` | Timestamps, table column headers, placeholders, nav section labels |
| `--text-code` | `#4fa8ff` | IDs, API keys, email addresses in tables, monospace values |

### 2.4 Accents

| Token | Hex | Role |
|---|---|---|
| `--accent` | `#00d084` | Active nav, CTA buttons, success badges, focus ring, cursor blink, logo mark |
| `--accent-dim` | `9% opacity of accent` | Active nav bg, focus ring glow |
| `--accent-hover` | `#00e895` | Hover on primary CTA |
| `--accent-blue` | `#4fa8ff` | Links, code values, info badges |
| `--accent-purple` | `#c792ea` | Syntax "keyword" (import, const, async) in code blocks |
| `--accent-amber` | `#f5a623` | Warning badges, pending domain verification |
| `--accent-red` | `#ff5c5c` | Error badges, delete buttons, error toasts |
| `--accent-green-dim` | `#00d08418` | Success badge background |
| `--accent-red-dim` | `#ff5c5c18` | Error badge background |
| `--accent-amber-dim` | `#f5a62318` | Warning badge background |

### 2.5 Full index.css Variables Block

```css
:root {
  /* Backgrounds */
  --bg-deep:       220 24% 5%;
  --bg-base:       220 16% 7%;
  --bg-surface:    220 14% 11%;
  --bg-elevated:   220 13% 14%;
  --bg-raised:     220 17% 18%;
  --bg-highlight:  220 21% 23%;

  /* Borders */
  --border:        220 20% 22%;
  --border-active: 220 26% 34%;
  --border-subtle: 220 19% 15%;

  /* Text */
  --foreground:           210 40% 93%;
  --muted-foreground:     215 12% 53%;
  --placeholder:          218 19% 30%;

  /* Accents */
  --accent:        158 100% 41%;
  --accent-hover:  158 100% 46%;
  --accent-blue:   211 100% 65%;
  --accent-purple: 281 70% 74%;
  --accent-amber:  38 91% 55%;
  --accent-red:    0 100% 67%;

  /* Shadcn aliases */
  --background:             var(--bg-base);
  --card:                   var(--bg-surface);
  --card-foreground:        var(--foreground);
  --popover:                var(--bg-elevated);
  --popover-foreground:     var(--foreground);
  --primary:                var(--accent);
  --primary-foreground:     220 14% 4%;
  --secondary:              var(--bg-elevated);
  --secondary-foreground:   var(--foreground);
  --muted:                  var(--bg-elevated);
  --destructive:            var(--accent-red);
  --destructive-foreground: var(--foreground);
  --border:                 var(--border);
  --input:                  var(--bg-deep);
  --ring:                   var(--accent);
  --radius:                 0.375rem;

  /* Sidebar */
  --sidebar:                   var(--bg-surface);
  --sidebar-foreground:        var(--foreground);
  --sidebar-primary:           var(--accent);
  --sidebar-primary-foreground: 220 14% 4%;
  --sidebar-accent:            var(--bg-elevated);
  --sidebar-accent-foreground: var(--foreground);
  --sidebar-border:            var(--border);
  --sidebar-ring:              var(--accent);
  --sidebar-width:             14rem;
  --sidebar-width-icon:        3.5rem;
}
```

---

## 3. Typography

### 3.1 Font: JetBrains Mono Everywhere

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

```css
*, *::before, *::after {
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", "Menlo", monospace;
}
body {
  font-size: 13px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  background: hsl(var(--bg-base));
  color: hsl(var(--foreground));
}
```

### 3.2 Type Scale

| Element | px | Weight | Color |
|---|---|---|---|
| Page title | 18 | 600 | primary |
| Section title | 15 | 500 | primary |
| `[ Bracket label ]` | 10 | 400 | muted, uppercase, 0.1em |
| Nav section label | 10 | 400 | muted, uppercase, 0.1em |
| Nav item | 12.5 | 400 | secondary |
| Body / description | 13 | 400 | secondary |
| Table column header | 11 | 400 | muted, uppercase, 0.08em |
| Table cell — main | 12.5 | 400 | secondary |
| Table cell — primary value | 12.5 | 400 | primary |
| Table cell — ID/key | 12 | 400 | code-blue |
| Stat value | 24 | 600 | primary or accent |
| Stat label | 11 | 400 | secondary, uppercase, 0.08em |
| Button | 12 | 500 | varies |
| Code/terminal | 12 | 400 | code-blue |
| Timestamp | 11 | 400 | muted |
| Badge/pill | 11 | 500 | varies |

### 3.3 The `[ Bracket Label ]` Pattern

```tsx
<span className="block text-[10px] text-muted-foreground uppercase tracking-[0.1em] mb-1">
  [ Section Name ]
</span>
```

Used above every major heading — on auth pages, console section headers, marketing sections, pricing tiers.

---

## 4. Layout Architecture

### 4.1 App Shell

```
SIDEBAR (14rem / 224px)     │  MAIN AREA
bg-surface / border-r       │  bg-base (darker)
                            │
  Logo (56px, border-b)     │  TOPBAR (52px, border-b, bg-surface)
  [@] devprep               │    [ breadcrumb ]     [ actions ]
                            │
  [ Practice ]              │  CONTENT (overflow-y-auto, p-[28px_32px])
    ▌ Questions             │
      Flashcards            │    [ Section label ]
      Coding                │    Page Title
      Voice                 │    Subtitle
                            │
  [ Learn ]                 │    Stats Grid (auto-fill, gap-[14px])
      Paths                 │    Data Table Card
      Certifications        │    Code Block
      Docs ↗               │
                            │
  [ Progress ]              │
      Stats                 │
      History               │
      Settings              │
                            │
  Pod switcher footer       │
```

### 4.2 Sidebar: Complete Spec

```css
width: 14rem;                     /* --sidebar-width */
background: hsl(var(--bg-surface));
border-right: 1px solid hsl(var(--border));
display: flex; flex-direction: column; height: 100vh;
overflow: hidden;
```

**Logo area** (56px, border-b):
- `[@]` mark: 24×24px, `bg-accent` (`#00d084`), `border-radius: 4px`, black text, font-weight 700
- Wordmark: `"dev"` in primary, `"prep"` in accent OR `"dev"` in accent — choose one and be consistent
- Right side: Org name or plan badge (11px, muted)

**Nav section labels**:
```css
padding: 10px 18px 4px;
font-size: 10px;
color: hsl(var(--placeholder));   /* muted */
text-transform: uppercase;
letter-spacing: 0.1em;
```

**Nav items**:
```css
/* rest  */ padding: 8px 18px; border-left: 2px solid transparent; color: hsl(var(--muted-foreground));
/* hover */ color: hsl(var(--foreground)); background: hsl(var(--bg-elevated));
/* active*/ color: hsl(var(--accent)); border-left-color: hsl(var(--accent)); background: hsl(var(--accent) / 9%);
```

**Sidebar footer — Pod/Org Switcher**:
```tsx
// AgentMail has "Default Pod" auto-created on signup.
// The footer shows: avatar + org name + current pod + plan badge
<div className="border-t border-border p-3">
  <button className="w-full flex items-center gap-2 hover:bg-elevated rounded-md p-1.5 transition-colors">
    {/* Gradient avatar — direction confirmed as 135deg, blue→green */}
    <div className="w-6 h-6 rounded bg-gradient-to-br from-[#4fa8ff] to-[#00d084] flex items-center justify-center text-black text-[10px] font-bold flex-shrink-0">
      D
    </div>
    <div className="flex-1 min-w-0 text-left">
      <div className="text-[11.5px] text-foreground truncate">devprep</div>
      <div className="text-[10px] text-muted-foreground truncate">Default Pod</div>
    </div>
    <ChevronsUpDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
  </button>
</div>
```

**Pod switcher dropdown** (when footer clicked):
- Lists all pods with radio-style selection
- "+ Create Pod" at bottom
- Current pod has green checkmark
- Pod names: `pod_id` in muted blue, `name` in primary

### 4.3 Topbar

```css
height: 52px;
background: hsl(var(--bg-surface));
border-bottom: 1px solid hsl(var(--border));
padding: 0 24px;
display: flex; align-items: center; justify-content: space-between;
```

- Left: `<SidebarTrigger />` + breadcrumb
- Breadcrumb: `Practice › Questions` — parent items in secondary, current in primary, separator `›` in muted
- Right: action buttons (ghost) + user avatar + plan badge

---

## 5. Console Pages — Complete Coverage

### 5.1 Questions (Inboxes analog)

**Table columns**: `Question` (primary), `Channel` (tag pill), `Difficulty` (badge), `ID` (monospace blue, truncated), `Updated` (relative time)

**Row actions** (visible on hover): Quick Review, Copy ID, Delete

**Empty state**:
```
$ devprep questions list

  No questions found in this channel.
  Try a different filter or add questions.

  [Import Questions]  [Browse All]
```

### 5.2 Messages — Complete 21-field Model (corrected from 18)

All 21 fields on a message:
`inbox_id`, `thread_id`, `message_id`, `labels[]`, `timestamp`, `from`, `to[]`, `size` (bytes), `updated_at`, `created_at`, `reply_to[]`, `cc[]`, `bcc[]`, `subject`, `preview` (truncated plain text), `text`, `html`, `extracted_text`, `extracted_html`, `attachments[]`, `in_reply_to`, `references[]`, `headers{}`

**Key insight**: The `preview` field is what appears in the message list row (like an email client's inbox view — the first ~80 chars of body text).

**Message table columns**: `From` (primary, display name + address), `Subject + preview` (two-line cell), `Labels` (pills), `Time` (relative)

**Attachment model** (6 properties):
`attachment_id`, `filename`, `content_type`, `size` (bytes), `inline` (boolean), `content_id`

**Attachments in UI**: paper-clip count badge on message row; expanded view shows file cards with download buttons.

### 5.3 Webhooks — All 9+ Event Types (corrected from "9 enum values")

Complete event type list:
| Event | Trigger |
|---|---|
| `message.received` | New email arrives in inbox |
| `message.received.spam` | Spam email received |
| `message.received.blocked` | Blocked email received |
| `message.sent` | Email sent from inbox |
| `message.delivered` | Delivery confirmation |
| `message.bounced` | Bounce received |
| `message.complained` | Spam complaint |
| `message.rejected` | Message rejected |
| `domain.verified` | Domain verification complete |

**Webhook table columns**: `URL` (monospace blue), `Events` (pill list, truncated), `Enabled` (dot badge), `Secret` (hidden, Reveal button), `Created` (relative)

**Reveal secret pattern**:
```tsx
<div className="flex items-center gap-2">
  <code className="font-mono text-[11px] text-code-blue">
    {revealed ? secret : '••••••••••••••••••••'}
  </code>
  <Button size="sm" variant="ghost" onClick={toggle}>
    {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
  </Button>
</div>
```

### 5.4 Threads Page

Global thread view (cross-inbox). Shows conversation context.

**Thread table columns**: `Subject` (primary), `Participants` (avatars or address list), `Messages` (count badge), `Last Activity` (relative time), `Labels` (pills)

**Thread detail view** (click → expand or navigate):
```
┌─ Thread: "Re: Invoice follow-up" ──────────────────────────────┐
│ Labels: [ inbox ] [ important ]                                 │
│                                                                 │
│ ┌─ Message 1 ─────────────────────────────────────────────────┐│
│ │ From: alice@example.com          Apr 3, 2:14 PM             ││
│ │ To: agent@devprep.app                                       ││
│ │ ─────────────────────────────────────────────────────────── ││
│ │ Hi, following up on the invoice from last week...           ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ Message 2 ─────────────────────────────────────────────────┐│
│ │ From: agent@devprep.app          Apr 3, 2:31 PM  [You]      ││
│ │ ...                                                         ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ [Reply]  [Forward]  [Label]                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 API Keys Page

```
[ API Keys ]
Manage authentication credentials for the AgentMail API.

┌──────────────────────────────────────────────────────────────────┐
│ NAME           KEY PREFIX       CREATED        ACTIONS           │
│──────────────────────────────────────────────────────────────────│
│ Production     am_key_••••1234  Apr 1, 2026    [Copy] [Revoke]  │
│ Development    am_key_••••abcd  Mar 28, 2026   [Copy] [Revoke]  │
└──────────────────────────────────────────────────────────────────┘

                              [+ Create API Key]
```

**Create API key flow** (modal):
1. Name input → `[Create]` button
2. On success: **one-time reveal** dialog — full `am_key_...` in code block, `[Copy Key]` primary button, `[Done]` ghost. "This key will not be shown again." warning in amber.

**Revoke** → confirmation dialog: "Revoke `Production`? Any integrations using this key will stop working." → `[Cancel]` ghost + `[Revoke Key]` danger.

### 5.6 Domains Page (was entirely missing in v1/v2)

**Domain status enum** (6 values):
- `pending` — amber badge "Pending verification"
- `verifying` — amber badge "Verifying..."
- `verified` — green badge "Verified"
- `failed` — red badge "Verification failed"
- `revoked` — gray badge "Revoked"
- `expired` — red badge "Expired"

**Domains table columns**: `Domain` (primary), `Status` (dot badge), `Pod` (small muted), `Feedback` (toggle), `Created` (relative)

**DNS Records sub-view** (expand row or navigate to domain detail):
```
DNS Records for yourdomain.com

TYPE    NAME                    VALUE                              STATUS
TXT     @                       v=spf1 include:agentmail.to ~all   ✓ Verified
TXT     agentmail._domainkey    v=DKIM1; k=rsa; p=MIIBIjAN...     ✓ Verified
TXT     _dmarc                  v=DMARC1; p=quarantine; ...        ✓ Verified
MX      @                       inbound.agentmail.to (10)          ✓ Verified

[Download BIND Zone File]    [Re-verify]
```

**Key UI element**: "Download BIND Zone File" — a ghost button that downloads a `.txt` file. This is a distinctive developer-specific feature worth including for DevPrep's export/import patterns.

**`feedback_enabled` toggle**: A small switch labeled "Bounce notifications" — when on, bounce/complaint events are sent to your inboxes.

### 5.7 Pods Page (was entirely missing in v1/v2)

The pods page lets you create and manage workspace isolation units.

**Pods table columns**: `Name` (primary), `Pod ID` (monospace blue), `Inboxes` (count), `Domains` (count), `Created` (relative)

**Hierarchy reminder banner** at top of page:
```
┌─────────────────────────────────────────────────────────────┐
│ ℹ  Pods isolate resources between tenants. The Default Pod  │
│    was created automatically when you signed up.            │
└─────────────────────────────────────────────────────────────┘
```

### 5.8 Thread Detail View

See §5.4 for the conversation thread UI. Key patterns:
- Messages shown in chronological order, each as a bordered card
- Self-sent messages get a `[You]` badge or slight right-alignment
- `extracted_text` (not `text`) used for the readable message body (strips quoted history)
- Reply box at bottom: simple textarea + `[Send]` primary button

### 5.9 Label System

Labels are free-text strings attached to messages/threads. AgentMail has system labels (`inbox`, `sent`, `spam`, `trash`) plus user-defined labels via AI or API.

**Label pill styling**:
```tsx
// System labels use preset colors; user labels use a hash-based color
const systemLabels = {
  inbox:     { bg: 'bg-accent/10',      text: 'text-accent' },
  sent:      { bg: 'bg-accent-blue/10', text: 'text-[#4fa8ff]' },
  spam:      { bg: 'bg-accent-amber/10',text: 'text-accent-amber' },
  trash:     { bg: 'bg-[#7a8799]/10',   text: 'text-[#7a8799]' },
  important: { bg: 'bg-accent-red/10',  text: 'text-accent-red' },
};

// User labels: derive color from string hash, use same pattern
```

**Filter chips** (above table):
```tsx
<div className="flex gap-2 flex-wrap">
  <button className={cn(
    "px-2 py-1 rounded text-[11px] font-medium border transition-colors",
    active
      ? "bg-accent/10 text-accent border-accent/30"
      : "bg-transparent text-muted-foreground border-border hover:border-border-active"
  )}>
    inbox
  </button>
</div>
```

### 5.10 Settings Page (was entirely missing in v1/v2)

Sections within Settings:

**General**:
- Organization name (editable input)
- Organization ID (monospace, read-only, copy button)
- Plan indicator (current tier + usage)

**Team Members**:
```
MEMBER              ROLE      JOINED        ACTIONS
alice@example.com   Owner     Jan 1, 2026   —
bob@example.com     Member    Feb 15, 2026  [Remove]

[Invite Team Member]
```

**Billing**:
- Current plan card (Free/Developer/Startup)
- Usage bars: Inboxes X/3, Emails X/3000, Storage X/3GB
- `[Upgrade Plan]` primary CTA

**Danger Zone** (at page bottom):
```
┌─ Danger Zone ───────────────────────────────────────────────┐
│ Delete Organization                                          │
│ Permanently delete your org and all associated data.        │
│ This action is irreversible.                          [Delete]│
└─────────────────────────────────────────────────────────────┘
```
Danger zone card: `border border-accent-red/20 rounded-md p-5`

---

## 6. Component Specifications

### 6.1 Cards

```tsx
<div className="bg-[#161a1f] border border-[#2a3140] rounded-md overflow-hidden">
  {/* Card header */}
  <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-[#2a3140]">
    <span className="text-[13px] font-medium text-foreground">Title</span>
    <Button variant="ghost" size="sm">Action</Button>
  </div>
  {/* Card body */}
</div>
```

**Rules**: zero drop-shadow. EVER. Not even `shadow-sm`.

### 6.2 Tables

**Column headers**: 11px, `--placeholder`, uppercase, `tracking-[0.08em]`, `font-normal`
**Row text**: 12.5px, `--muted-foreground` for secondary, `--foreground` for primary values
**ID/key cells**: 12px, `--text-code` (blue), `font-mono`
**Row hover**: `bg-[#1e2329]`, `transition-colors duration-100`
**Row actions**: `invisible group-hover:visible` — appear on hover only

### 6.3 Status Badges (dot indicator)

```tsx
type Status = 'active' | 'idle' | 'warning' | 'error' | 'pending' | 'verifying';

const BADGE = {
  active:    { dot: '#00d084', bg: '#00d08418', text: '#00d084' },
  idle:      { dot: '#7a8799', bg: '#7a879918', text: '#7a8799' },
  warning:   { dot: '#f5a623', bg: '#f5a62318', text: '#f5a623' },
  error:     { dot: '#ff5c5c', bg: '#ff5c5c18', text: '#ff5c5c' },
  pending:   { dot: '#f5a623', bg: '#f5a62318', text: '#f5a623' },
  verifying: { dot: '#4fa8ff', bg: '#4fa8ff18', text: '#4fa8ff' },
};
```

### 6.4 Buttons

| Variant | bg | text | border | hover bg |
|---|---|---|---|---|
| primary | `#00d084` | `#000` black | `#00d084` | `#00e895` |
| ghost | transparent | `#7a8799` | `#2a3140` | border→`#3d4f6e`, text→primary |
| danger | transparent | `#ff5c5c` | `#ff5c5c40` | `#ff5c5c18` |
| icon ghost | transparent | `#7a8799` | none | text→primary, bg→`#1e2329` |

All: `font-mono`, `font-size: 12px`, `font-weight: 500`, `border-radius: 6px`, `transition: all 0.1s`

### 6.5 Text Inputs

```css
background: hsl(var(--bg-deep));        /* #080a0d — deepest level */
border: 1px solid hsl(var(--border));   /* #2a3140 */
border-radius: 6px;
font-family: inherit;                   /* monospace */
font-size: 12.5px;
padding: 8px 12px;
color: hsl(var(--foreground));
transition: border-color 0.1s;

&:focus {
  outline: none;
  border-color: hsl(var(--accent));
  box-shadow: 0 0 0 3px hsl(var(--accent) / 10%);
}
&::placeholder { color: hsl(var(--placeholder)); }
```

### 6.6 Code Blocks

```tsx
// Syntax color map for code blocks:
// Comments:  #7a8799  (secondary)
// Keywords:  #c792ea  (purple — import, const, from, async, return)
// Strings:   #00d084  (green — the accent)
// Variables: #4fa8ff  (blue)
// Functions: #82aaff  (light blue)
// Default:   #e8edf3  (primary)

function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={cn(
      "relative group bg-[#080a0d] border border-[#2a3140] rounded-md",
      "p-[16px_18px] font-mono text-[12px] leading-[1.8] overflow-x-auto",
      className
    )}>
      {language && (
        <span className="absolute top-[10px] left-[18px] text-[10px] text-[#3d4a5c] uppercase tracking-[0.08em]">
          {language}
        </span>
      )}
      <button
        className="absolute top-[10px] right-[10px] px-[10px] py-1 bg-[#1e2329] border border-[#2a3140] rounded text-[11px] text-[#7a8799] opacity-0 group-hover:opacity-100 hover:text-foreground hover:border-[#3d4f6e] transition-all duration-100"
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <div className={language ? 'mt-5' : ''}>{/* rendered code */}</div>
    </div>
  );
}
```

### 6.7 Terminal Blocks

```tsx
function TerminalBlock({ lines }: { lines: Array<{type: string, text: string}> }) {
  return (
    <div className="bg-[#080a0d] border border-[#2a3140] rounded-md p-[16px_18px] font-mono text-[12px] leading-[1.8]">
      {lines.map((line, i) => {
        if (line.type === 'command') return (
          <div key={i}><span className="text-[#00d084]">$ </span><span className="text-foreground">{line.text}</span></div>
        );
        if (line.type === 'output')  return <div key={i} className="pl-[14px] text-[#7a8799]">{line.text}</div>;
        if (line.type === 'success') return <div key={i} className="pl-[14px] text-[#00d084]">{line.text}</div>;
        if (line.type === 'error')   return <div key={i} className="pl-[14px] text-[#ff5c5c]">{line.text}</div>;
        if (line.type === 'cursor')  return (
          <div key={i}><span className="text-[#00d084]">$ </span><span className="after:content-['▌'] after:text-[#00d084] after:animate-blink" /></div>
        );
      })}
    </div>
  );
}
```

### 6.8 Stat Cards with Plan Limit Indicator (corrected — was missing limit bars)

```tsx
function StatCard({ label, value, max, unit, meta, accent }) {
  const pct = max ? (value / max) * 100 : null;
  const isNearLimit = pct !== null && pct > 80;
  return (
    <div className="bg-[#161a1f] border border-[#2a3140] rounded-md p-[18px_20px]">
      <div className="text-[11px] text-[#7a8799] uppercase tracking-[0.08em] mb-2">{label}</div>
      <div className={cn("text-[24px] font-semibold mb-1", accent ? "text-[#00d084]" : "text-foreground")}>
        {value.toLocaleString()}
        {max && <span className="text-[13px] font-normal text-[#7a8799] ml-1">/ {max.toLocaleString()} {unit}</span>}
      </div>
      {pct !== null && (
        /* Usage bar */
        <div className="mt-2 h-1 bg-[#1e2329] rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", isNearLimit ? "bg-[#f5a623]" : "bg-[#00d084]")}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}
      {meta && <div className="text-[11px] text-[#3d4a5c] mt-1.5">{meta}</div>}
    </div>
  );
}

// Usage:
<StatCard label="Questions" value={1247} max={undefined} accent={false} meta="across 31 channels" />
<StatCard label="API Calls" value={847}  max={3000}     unit="/ mo" accent={false} />
<StatCard label="Streak"    value={12}   max={undefined} accent={true} meta="days in a row" />
```

### 6.9 Confirmation Dialogs (was missing in v1/v2)

**Pattern**: always a modal, never inline. Two buttons: `[Cancel]` ghost + `[Destructive Action]` danger.

```tsx
<Dialog>
  <DialogContent className="bg-[#161a1f] border border-[#2a3140] rounded-md shadow-none max-w-[400px]">
    <DialogHeader className="border-b border-[#2a3140] pb-4">
      <DialogTitle className="text-[15px] font-medium text-foreground">
        Revoke API Key
      </DialogTitle>
    </DialogHeader>
    <div className="py-4 text-[12.5px] text-[#7a8799]">
      Are you sure you want to revoke <code className="text-[#4fa8ff]">Production</code>?
      Any integrations using this key will stop working immediately.
    </div>
    <DialogFooter className="border-t border-[#2a3140] pt-4 flex gap-2 justify-end">
      <Button variant="ghost" size="sm">Cancel</Button>
      <Button className="bg-transparent border border-[#ff5c5c40] text-[#ff5c5c] hover:bg-[#ff5c5c18]" size="sm">
        Revoke Key
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Rules**:
- Modal overlay: `bg-black/60 backdrop-blur-[2px]`
- Modal panel: `bg-[#161a1f] border border-[#2a3140]`, `shadow-none` (no shadow)
- Animate: none — instant appear (no slide, no fade)

### 6.10 SDK Code Popover (was entirely missing in v1/v2)

**This is a notable feature**: AgentMail's console has popovers on table rows that show SDK snippets for interacting with that specific resource. Praised by developers as "executed with great polish."

```tsx
// Example: hovering a row action shows a popover with SDK code to interact with that inbox
<Popover>
  <PopoverTrigger asChild>
    <Button size="icon" variant="ghost" className="h-7 w-7">
      <Code2 className="w-3 h-3" />
    </Button>
  </PopoverTrigger>
  <PopoverContent
    className="w-[400px] p-0 bg-[#161a1f] border border-[#2a3140] rounded-md shadow-none"
    align="end"
  >
    {/* Language tabs */}
    <div className="flex border-b border-[#2a3140]">
      {['Python', 'TypeScript', 'CLI'].map(lang => (
        <button key={lang} className={cn(
          "px-4 py-2 text-[11px] font-medium transition-colors",
          active === lang
            ? "text-[#00d084] border-b-2 border-[#00d084] -mb-px"
            : "text-[#7a8799] hover:text-foreground"
        )}>{lang}</button>
      ))}
    </div>
    {/* Code block */}
    <CodeBlock code={snippets[active]} language={active.toLowerCase()} className="border-0 rounded-none rounded-b-md" />
  </PopoverContent>
</Popover>
```

Apply to: Inboxes (show "send to this inbox"), API Keys (show "use this key"), Webhooks (show "register this webhook").

### 6.11 Skeleton Loading States (was entirely missing in v1/v2)

```tsx
// Table skeleton — used while data loads
function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-[#161a1f] border border-[#2a3140] rounded-md overflow-hidden">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-[#2a3140]">
        <div className="h-[13px] w-24 bg-[#1e2329] rounded animate-pulse" />
        <div className="h-7 w-24 bg-[#1e2329] rounded animate-pulse" />
      </div>
      {/* Row skeletons */}
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-[#2a3140] last:border-0">
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-[18px] py-[11px]">
                  <div
                    className="h-[12px] bg-[#1e2329] rounded animate-pulse"
                    style={{ width: `${[60, 40, 30, 20][j] || 35}%`, animationDelay: `${i * 50}ms` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Stat card skeleton
function StatCardSkeleton() {
  return (
    <div className="bg-[#161a1f] border border-[#2a3140] rounded-md p-[18px_20px]">
      <div className="h-[11px] w-16 bg-[#1e2329] rounded animate-pulse mb-3" />
      <div className="h-7 w-20 bg-[#1e2329] rounded animate-pulse" />
    </div>
  );
}
```

**Pulse animation** (add to Tailwind config):
```ts
keyframes: {
  pulse: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
},
animation: { pulse: 'pulse 1.5s ease-in-out infinite' }
```

### 6.12 Toast / Notification System (was entirely missing in v1/v2)

AgentMail uses `sonner` for toasts (already in your project's dependencies!).

**Toast styling** to match AgentMail theme:

```tsx
// In App.tsx or layout root:
import { Toaster } from 'sonner';

<Toaster
  position="bottom-right"
  toastOptions={{
    style: {
      background: '#161a1f',
      border: '1px solid #2a3140',
      color: '#e8edf3',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '12px',
      borderRadius: '6px',
      boxShadow: 'none',   // no shadow
    },
    classNames: {
      success: 'border-[#00d084]/30',
      error: 'border-[#ff5c5c]/30',
      warning: 'border-[#f5a623]/30',
    }
  }}
/>

// Usage:
toast.success('API key copied to clipboard');
toast.success('Inbox created successfully');
toast.error('Failed to revoke key. Try again.');
toast.warning('Approaching plan limit (80% of inboxes used)');
```

**Toast copy patterns** (monospace, terse, developer-friendly):
- `"Copied!"` — after copy button
- `"Key created. Save it now — it won't be shown again."` — after API key creation
- `"Domain pending verification. Check back in a few minutes."` — after domain add
- `"Webhook disabled."` / `"Webhook enabled."` — after toggle

### 6.13 Empty States (was mostly missing in v1/v2)

Each page has a terminal-style empty state:

```tsx
function EmptyState({ command, message, action }: EmptyStateProps) {
  return (
    <div className="px-[18px] py-12 flex flex-col items-center text-center">
      <div className="bg-[#080a0d] border border-[#2a3140] rounded-md p-[14px_18px] font-mono text-[12px] text-[#7a8799] mb-6 w-full max-w-sm text-left">
        <span className="text-[#00d084]">$ </span>
        <span className="text-foreground">{command}</span>
        <br />
        <span className="pl-[14px]">{message}</span>
        <br />
        <span className="after:content-['▌'] after:text-[#00d084] after:animate-blink" />
      </div>
      {action && (
        <Button className="bg-[#00d084] text-black text-[12px] font-medium px-4 py-2 h-auto rounded-md">
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

Per-page empty state copy:
| Page | Command | Message |
|---|---|---|
| Questions | `devprep questions list` | `No questions found.` |
| Flashcards | `devprep flashcards list` | `No flashcards yet.` |
| API Keys | `devprep keys list` | `No API keys. Create one to get started.` |
| Learning Paths | `devprep paths list` | `No learning paths configured.` |
| Webhooks | `devprep webhooks list` | `No webhook endpoints registered.` |

---

## 7. Auth Pages

### 7.1 Layout

```tsx
<div className="min-h-screen bg-[#0d0f12] flex items-center justify-center">
  {/* ASCII art background — fixed position, bottom-right, very faint */}
  <img
    src="/devprep-ascii.svg"
    alt=""
    aria-hidden="true"
    className="fixed bottom-0 right-0 opacity-[0.12] w-[60vw] max-w-3xl pointer-events-none select-none"
  />

  {/* Auth form card */}
  <div className="relative z-10 w-full max-w-[400px] px-4">
    {/* Logo */}
    <div className="flex items-center justify-center gap-2 mb-8">
      <div className="w-8 h-8 bg-[#00d084] rounded flex items-center justify-center text-black text-[14px] font-bold">D</div>
      <span className="text-[15px] font-semibold">dev<span className="text-[#00d084]">prep</span></span>
    </div>

    {/* Bracket label */}
    <p className="text-center text-[10px] text-[#3d4a5c] uppercase tracking-[0.1em] mb-1">[ Sign In ]</p>
    <h1 className="text-center text-[20px] font-semibold text-foreground mb-1">Sign in to DevPrep</h1>
    <p className="text-center text-[12px] text-[#7a8799] mb-7">Welcome back! Please sign in to continue.</p>

    {/* Auth box */}
    <div className="bg-[#161a1f] border border-[#2a3140] rounded-md p-6">
      {/* Google OAuth */}
      <button className="w-full flex items-center justify-center gap-2.5 bg-[#1e2329] border border-[#2a3140] rounded-md px-4 py-2.5 text-[12.5px] text-foreground hover:border-[#3d4f6e] transition-colors mb-4">
        <img src="/google-icon.svg" className="w-4 h-4" alt="" />
        Continue with Google
      </button>
      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#2a3140]" />
        <span className="text-[11px] text-[#3d4a5c]">or</span>
        <div className="flex-1 h-px bg-[#2a3140]" />
      </div>
      {/* Fields */}
      <div className="space-y-3 mb-5">
        <div>
          <label className="block text-[11px] text-[#7a8799] mb-1.5 uppercase tracking-[0.05em]">Email address</label>
          <input type="email" className="w-full bg-[#080a0d] border border-[#2a3140] rounded-md text-[12.5px] text-foreground px-3 py-2 placeholder:text-[#3d4a5c] focus:outline-none focus:border-[#00d084] focus:ring-2 focus:ring-[#00d084]/10 transition-all" />
        </div>
        <div>
          <label className="block text-[11px] text-[#7a8799] mb-1.5 uppercase tracking-[0.05em]">Password</label>
          <input type="password" className="w-full bg-[#080a0d] border border-[#2a3140] rounded-md text-[12.5px] text-foreground px-3 py-2 placeholder:text-[#3d4a5c] focus:outline-none focus:border-[#00d084] focus:ring-2 focus:ring-[#00d084]/10 transition-all" />
        </div>
      </div>
      <button className="w-full bg-[#00d084] text-black font-medium text-[13px] py-2.5 rounded-md hover:bg-[#00e895] transition-colors">
        Continue
      </button>
    </div>
    <p className="text-center text-[12px] text-[#7a8799] mt-4">
      Don't have an account? <a href="/sign-up" className="text-[#00d084] hover:text-[#00e895] transition-colors">Sign up</a>
    </p>
  </div>
</div>
```

### 7.2 ASCII Art Asset

Create `/public/devprep-ascii.svg` — monospaced characters forming "DEVPREP" or a bracket pattern. Reference structure:

```
██████╗ ███████╗██╗   ██╗██████╗ ██████╗ ███████╗██████╗ 
██╔══██╗██╔════╝██║   ██║██╔══██╗██╔══██╗██╔════╝██╔══██╗
██║  ██║█████╗  ██║   ██║██████╔╝██████╔╝█████╗  ██████╔╝
██║  ██║██╔══╝  ╚██╗ ██╔╝██╔═══╝ ██╔══██╗██╔══╝  ██╔═══╝ 
██████╔╝███████╗ ╚████╔╝ ██║     ██║  ██║███████╗██║     
╚═════╝ ╚══════╝  ╚═══╝  ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝     
```

Wrap in SVG with `font-family: monospace`, `fill: #e8edf3`, export as SVG.

---

## 8. Scrollbar

```css
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2a3140; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #3d4f6e; }
::-webkit-scrollbar-button { display: none; }
```

---

## 9. Tailwind Config Additions

```typescript
export default {
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'Menlo', 'monospace'],
        sans: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'Menlo', 'monospace'],
      },
      keyframes: {
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
        pulse: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        pulse: 'pulse 1.5s ease-in-out infinite',
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
      },
    },
  },
};
```

---

## 10. Interaction Principles

| Pattern | Spec |
|---|---|
| All transitions | `duration-100` (0.1s) — never 200ms or 300ms |
| Nav hover | bg → `#1e2329` |
| Table row hover | bg → `#1e2329`, `transition-colors duration-100` |
| Row actions | `opacity-0 group-hover:opacity-100` |
| Primary button hover | bg → `#00e895` |
| Ghost button hover | border → `#3d4f6e`, text → primary |
| Input focus | border → `#00d084`, ring `#00d084/10` |
| Copy button | text swaps to "Copied!" for 1500ms, no animation |
| Modal appear | **instant** — no fade, no slide, no scale. Pure display toggle. |
| Skeleton pulse | 1.5s ease-in-out, 50% opacity at midpoint |
| Toast appear | `sonner` default slide from bottom-right |
| Zero drop shadows | absolute rule — no `shadow-*` on any element inside console |
| Zero scale transforms | no `hover:scale-*` or `active:scale-*` anywhere |

---

## 11. Mobile & Responsive (was entirely missing in v1/v2)

AgentMail's console is **primarily desktop-only** — it's a developer tool. However:

- Sidebar collapses to icon-only at `< 768px` (using Shadcn `<Sheet>` for mobile drawer)
- Tables scroll horizontally on small screens (`overflow-x-auto` on table wrapper)
- Stats grid collapses to 2 columns at `< 640px`, 1 column at `< 480px`
- Topbar breadcrumb truncates on mobile

**For DevPrep** (which has mobile users unlike AgentMail):
- Keep the mobile-first swipe interface (the existing card-swipe UX) as-is
- Apply the theme only to the desktop dashboard/admin sections
- Use `lg:flex` to show sidebar only on larger screens
- Show bottom nav (already in DevPrep) on mobile with accent-colored active icons

---

## 12. Keyboard Shortcuts (was missing in v1/v2)

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Global command palette / search |
| `⌘/` | Toggle AI assistant panel (if present) |
| `N` | New item on current page (create inbox / create key) |
| `Esc` | Close modal / dismiss popover |
| `↑↓` | Navigate table rows |
| `Enter` | Open selected row |
| `C` | Copy selected item's ID |

Add a command palette with a terminal-style interface:
```tsx
// Command palette: bg-[#161a1f], border, input at top, results list below
// Input styled like the terminal: "$ " prefix in green + text in white
```

---

## 13. Implementation Order

### Phase 1 — Token Foundation
1. `index.html` — add JetBrains Mono Google Font link
2. `index.css` — replace ALL CSS variables with the complete token block
3. `index.css` — add scrollbar, blink, pulse keyframes, monospace body
4. `tailwind.config.ts` — add font aliases, animations, color mappings
5. Install/confirm `sonner` is set up with themed `<Toaster />` in App root

### Phase 2 — Shell & Navigation
6. `App.tsx` — sidebar width CSS vars
7. `app-sidebar.tsx` — logo area, section labels with `[ brackets ]`, active state, pod switcher footer
8. `Topbar` — breadcrumb pattern, ghost action buttons
9. Confirm `bg-base` (content) is darker than `bg-surface` (sidebar)

### Phase 3 — New Shared Components
10. `components/ui/status-badge.tsx` — dot indicator, 6 variants
11. `components/ui/code-block.tsx` — syntax-colored, language tab, copy
12. `components/ui/terminal-block.tsx` — prompt + output + cursor
13. `components/ui/stat-card.tsx` — 24px value + usage bar + meta
14. `components/ui/sdk-popover.tsx` — Python/TypeScript/CLI tabs + code
15. `components/ui/empty-state.tsx` — terminal-style with command
16. `components/ui/table-skeleton.tsx` — pulse skeleton rows

### Phase 4 — Core Component Reskins
17. `button.tsx` — all 4 variants updated
18. `input.tsx` — deep bg, accent focus ring, uppercase label style
19. `card.tsx` — remove shadow, ensure surface+border
20. `badge.tsx` — dot-indicator pattern
21. `dialog.tsx` — dark overlay, no shadow, instant appear
22. `table.tsx` — muted uppercase headers, hover pattern
23. `sonner` Toaster — themed to AgentMail palette

### Phase 5 — Pages
24. All page headers — `[ Bracket ]` label + title + subtitle
25. Dashboard — stats grid with plan limit bars + terminal welcome block
26. Questions/Flashcards/Challenges tables — monospace ID cells
27. API Keys page — create/revoke flows with one-time reveal
28. Settings page — General, Team, Billing, Danger Zone sections
29. Auth pages — split layout + ASCII art background

### Phase 6 — Polish
30. Create `/public/devprep-ascii.svg`
31. Add SDK code popover to table rows on key pages
32. Keyboard shortcut `⌘K` command palette
33. Mobile: sidebar → Sheet drawer on `< 768px`
34. Audit: zero drop shadows
35. Audit: all transitions `duration-100`
36. Audit: monospace font rendering in all browsers
37. Audit: text contrast on all surface/background combinations

---

## 14. Complete File Change List

| File | Change |
|---|---|
| `client/index.html` | JetBrains Mono font link |
| `client/src/index.css` | Full CSS variable token replacement, scrollbar, keyframes, body font |
| `tailwind.config.ts` | Color mappings, font aliases, blink + pulse animations |
| `client/src/App.tsx` | Sidebar width vars, Toaster setup, ⌘K handler |
| `client/src/components/app-sidebar.tsx` | Logo, `[ ]` nav labels, active state, pod switcher footer |
| `client/src/components/ui/button.tsx` | All 4 variant palettes |
| `client/src/components/ui/input.tsx` | Deep bg, accent focus |
| `client/src/components/ui/card.tsx` | Remove shadow |
| `client/src/components/ui/badge.tsx` | Dot-indicator style |
| `client/src/components/ui/dialog.tsx` | Dark overlay, no shadow, instant |
| `client/src/components/ui/table.tsx` | Muted headers, hover |
| New: `components/ui/status-badge.tsx` | 6-variant dot badge |
| New: `components/ui/code-block.tsx` | Language tabs, copy, syntax colors |
| New: `components/ui/terminal-block.tsx` | Prompt, output types, blink cursor |
| New: `components/ui/stat-card.tsx` | Value, usage bar, meta |
| New: `components/ui/sdk-popover.tsx` | SDK snippet popover |
| New: `components/ui/empty-state.tsx` | Terminal-style empty |
| New: `components/ui/table-skeleton.tsx` | Pulse skeleton |
| All `pages/*.tsx` | `[ Bracket ]` page headers |
| Auth page components | Split layout, ASCII art bg |
| New: `public/devprep-ascii.svg` | ASCII art brand asset |

---

## 15. The "Is It AgentMail?" Audit Checklist

- [ ] Background is `#0d0f12` — not pure black (`#000`), not gray-900 (`#111827`)
- [ ] Code blocks / inputs use even darker `#080a0d` background
- [ ] Sidebar is `#161a1f` — one step lighter than content area `#0d0f12`
- [ ] **Every piece of text** uses JetBrains Mono — nav labels, timestamps, buttons, ALL of it
- [ ] Active nav item: green left border + green text + `9%` green background
- [ ] Table column headers: 11px, muted, uppercase, `tracking-[0.08em]`, not bold
- [ ] API key / ID cells in tables: blue (`#4fa8ff`), not white
- [ ] Primary CTA button: `#00d084` background + **black** (not white) text
- [ ] Zero `shadow-*` classes anywhere inside the console
- [ ] Zero `scale-*` or transform on hover/active
- [ ] All transitions at `duration-100` (0.1s), not 200 or 300ms
- [ ] `[ Bracket ]` labels above all section headings
- [ ] ASCII art on auth pages at `opacity-[0.12]`
- [ ] Scrollbar: 5px, `#2a3140` thumb, no track, no buttons
- [ ] Inputs: `#080a0d` bg, accent focus ring (`#00d084/10` shadow)
- [ ] Copy buttons say "Copied!" for 1500ms then revert — no animation
- [ ] Modals appear instantly — no slide/fade/scale animation
- [ ] Skeletons pulse with `bg-[#1e2329]` blocks on `bg-[#161a1f]` cards
- [ ] Toasts positioned bottom-right, `bg-[#161a1f]`, no shadow
- [ ] Empty states use terminal-style command + cursor blocks
- [ ] Pod switcher in sidebar footer with gradient avatar
- [ ] Stat cards show `X / max` usage bars that turn amber above 80%
- [ ] SDK code popovers on table row actions
- [ ] Confirmation dialogs for all destructive actions
- [ ] `⌘K` opens command palette
