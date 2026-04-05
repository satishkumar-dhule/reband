import { createClient } from "@libsql/client";
import crypto from "crypto";

const db = createClient({ url: "file:local.db" });

const questions = [
  {
    id: crypto.randomUUID(),
    question: "Explain the difference between useEffect and useLayoutEffect in React. When would you choose one over the other?",
    answer: "useEffect runs asynchronously after render, while useLayoutEffect fires synchronously before browser paint. Use useEffect for most cases (data fetching, subscriptions), and useLayoutEffect when you need to measure DOM elements or prevent visible flickering.",
    explanation: `## useEffect vs useLayoutEffect

Both hooks serve similar purposes — running side effects after React updates the DOM — but timing differs significantly.

### useEffect (Asynchronous)
\`\`\`javascript
useEffect(() => {
  // Runs after paint, non-blocking
  document.title = count + ' items';
}, [count]);
\`\`\`
- Schedules after paint
- Won't block browser updates
- Use for: data fetching, subscriptions, logging

### useLayoutEffect (Synchronous)
\`\`\`javascript
useLayoutEffect(() => {
  // Runs before paint, blocking
  const rect = ref.current.getBoundingClientRect();
  console.log(rect.height);
}, []);
\`\`\`
- Fires before paint, synchronously
- Can block visual updates
- Use for: DOM measurements, avoiding flicker

### When to Choose

| Scenario | Hook |
|----------|------|
| Data fetching | useEffect |
| DOM measurements | useLayoutEffect |
| Third-party libs | useEffect |
| Preventing layout shift | useLayoutEffect |

### Key Rule
If your effect causes visual changes, test with useLayoutEffect. Otherwise, default to useEffect for better performance.`,
    eli5: "useEffect waits for the screen to finish drawing before running, while useLayoutEffect runs right before drawing. Use the first one almost always.",
    difficulty: "intermediate",
    tags: JSON.stringify(["frontend", "react"]),
    channel: "frontend",
    subChannel: "react",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "What is closure scope chain and how does it affect variable access in nested functions?",
    answer: "A closure captures variables from all enclosing scopes, not just the immediately surrounding one. The scope chain allows inner functions to access variables from outer functions, the module scope, and global scope in order of proximity.",
    explanation: `## Closure Scope Chain Deep Dive

A closure is created when an inner function references variables from its outer function's scope.

### How Scope Chains Work
\`\`\`javascript
const global = "global";

function outer() {
  const outerVar = "outer";

  function inner() {
    const innerVar = "inner";
    // Can access: innerVar, outerVar, global
    console.log(innerVar); // closest match
    console.log(outerVar); // found via scope chain
    console.log(global);   // found in global scope
  }

  inner();
}
\`\`\`

### The Scope Chain
1. **Local scope** — function's own variables
2. **Enclosing scope** — outer function's variables
3. **Module scope** — top-level module variables
4. **Global scope** — window/global objects

### Common Pitfall: Loop Closures
\`\`\`javascript
// BAD: all callbacks log 5
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}

// FIX: let creates new binding per iteration
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}

// FIX: IIFE captures value
for (var i = 0; i < 5; i++) {
  ((j) => setTimeout(() => console.log(j), 100))(i);
}
\`\`\`

### Memory Implications
Closures keep their enclosing scope alive. Unintended closures can cause memory leaks:

\`\`\`javascript
function bad() {
  const bigArray = new Array(1000000);
  return () => bigArray; // bigArray never garbage collected
}
\`\`\``,
    eli5: "Closures are like a backpack — inner functions carry their outer function's variables around even after the outer function finishes. The scope chain is the order they look for variables.",
    difficulty: "intermediate",
    tags: JSON.stringify(["frontend", "javascript"]),
    channel: "frontend",
    subChannel: "javascript",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "Given a CSS specificity conflict between inline styles, IDs, classes, and elements, which wins and why does the cascade order matter?",
    answer: "Inline styles have highest specificity (1,0,0,0), followed by IDs (0,1,0,0), then classes/attributes/pseudo-classes (0,0,1,0), then elements/pseudo-elements (0,0,0,1). When specificity ties, source order wins.",
    explanation: `## CSS Specificity Hierarchy

Browsers calculate specificity using a 4-column number system. Higher columns override lower ones.

### Specificity Calculator
\`\`\`css
/* Inline: 1,0,0,0 */
<div style="color: red">

/* ID: 0,1,0,0 */
#header { color: blue }

/* Class/Attribute/Pseudo-class: 0,0,1,0 */
.header { color: green }
[data-active] { color: green }
:hover { color: green }

/* Element/Pseudo-element: 0,0,0,1 */
div { color: purple }
::before { color: purple }

/* Universal: 0,0,0,0 */
* { color: orange }
\`\`\`

### Battle Examples
\`\`\`css
/* ID wins over class (1,0,0,0 vs 0,1,0,0) */
#nav .link { color: blue }    /* wins */
.nav .link { color: red }     /* loses */

/* Three classes beats two classes */
.nav .link .active { color: red }   /* 0,3,0,0 */
#nav .link { color: blue }          /* 1,1,0,0 */
\`\`\`

### Source Order Tiebreaker
When specificity is equal, last rule wins:
\`\`\`css
.link { color: red }    /* applied (comes last) */
.link { color: blue }   /* applied (comes last) */
.link { color: green }  /* THIS wins */
\`\`\`

### !important Override
\`\`\`css
.link { color: blue !important } /* beats everything except another !important */
\`\`\`

### Best Practice
Keep specificity low and consistent. Avoid !important and inline styles in production.`,
    eli5: "Think of specificity like a score: inline styles score highest (1000), IDs score 100, classes score 10, elements score 1. The highest score wins, and if tied, whoever spoke last wins.",
    difficulty: "beginner",
    tags: JSON.stringify(["frontend", "css"]),
    channel: "frontend",
    subChannel: "css",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "Describe the browser's event loop phases and explain how microtask vs macrotask queue processing affects render timing and frame drops.",
    answer: "The event loop processes tasks in phases: timers, I/O callbacks, idle, poll, check, close. Microtasks (Promises) run after each phase and before the next task, while macrotasks (setTimeout, setInterval) are picked up in the check phase. Multiple microtasks can starve rendering.",
    explanation: `## Event Loop Deep Dive

Browsers use the event loop to coordinate rendering, JavaScript execution, and I/O.

### Event Loop Phases
\`\`\`
┌─────────────┐
│   timers    │ ← setTimeout, setInterval
├─────────────┤
│ pending_cb  │ ← I/O callbacks
├─────────────┤
│   idle      │ ← process.nextTick
├─────────────┤
│    poll     │ ← I/O operations
├─────────────┤
│    check    │ ← setImmediate
├─────────────┤
│ close_cb    │ ← socket.on('close')
└─────────────┘
\`\`\`

### Microtask vs Macrotask
\`\`\`javascript
console.log('1');           // sync

setTimeout(() => console.log('2'), 0);     // macrotask
Promise.resolve().then(() => console.log('3')); // microtask

console.log('4');
// Output: 1, 4, 3, 2
\`\`\`

### The Rendering Problem
\`\`\`javascript
function heavyMicrotasks() {
  // Creates thousands of microtasks
  // Blocks rendering between frames
  for (let i = 0; i < 10000; i++) {
    Promise.resolve().then(() => {}); // keeps event loop busy
  }
}

// requestAnimationFrame waits for microtasks
requestAnimationFrame(() => console.log('frame')); // delayed!
\`\`\`

### Frame Budget
- 60fps = ~16.67ms per frame
- Browser needs time between frames for rendering
- Microtask queue is drained completely before rendering

### Avoiding Frame Drops
\`\`\`javascript
// Split work with setTimeout (macrotask)
function processInChunks(items, callback) {
  let i = 0;
  function chunk() {
    const end = Math.min(i + 100, items.length);
    // process items[i:end]
    if (end < items.length) {
      setTimeout(chunk, 0); // yield to rendering
    }
    i = end;
  }
  chunk();
}
\`\`\``,
    eli5: "The event loop is like a restaurant kitchen. Microtasks (Promises) are like priority orders that get made between regular orders, while macrotasks (setTimeout) wait their turn in line. Too many priority orders can delay the regular food from getting served.",
    difficulty: "advanced",
    tags: JSON.stringify(["frontend", "browser-internals"]),
    channel: "frontend",
    subChannel: "browser-internals",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "How would you optimize Cumulative Layout Shift (CLS) for a content-heavy landing page with dynamic ads and user-generated images?",
    answer: "Reserve explicit dimensions for all media (ads, images, embeds), use aspect-ratio boxes, set font-display:optional or preload critical fonts, and avoid inserting content above existing content. Lazy-load below-fold images with placeholder sizes.",
    explanation: `## CLS Optimization Strategies

Cumulative Layout Shift measures visual stability. Every unexpected content shift counts toward your CLS score.

### 1. Reserve Space for Dynamic Content
\`\`\`css
/* Always set dimensions for ads */
.ad-container {
  min-height: 250px;
  width: 300px;
  background: #f0f0f0; /* placeholder */
}

/* Use aspect-ratio for images */
img {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto; /* browser calculates height */
}
\`\`\`

### 2. Image Dimension Guidelines
\`\`\`html
<!-- BAD: no dimensions causes shift -->
<img src="hero.jpg" alt="Hero">

<!-- GOOD: explicit dimensions -->
<img src="hero.jpg" alt="Hero" width="800" height="450">

<!-- GOOD: aspect-ratio box -->
<div class="aspect-video">
  <img src="video-poster.jpg" alt="Video">
</div>
\`\`\`

### 3. Font Loading Strategy
\`\`\`css
/* Prevent FOUT causing layout shift */
@font-face {
  font-family: 'CustomFont';
  src: url('/font.woff2') format('woff2');
  font-display: optional; /* hides if not ready */
}

/* Or use font-display: swap with size-adjust */
@font-face {
  font-family: 'FallbackFont';
  src: local('Arial');
  size-adjust: 105%;
  ascent-override: 90%;
}
\`\`\`

### 4. Skeleton Loading Pattern
\`\`\`css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0, #e0e0e0, #f0f0f0);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  min-height: 200px; /* reserve space */
}
\`\`\`

### 5. CLS Measurement
\`\`\`javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      console.log('CLS:', entry.value);
    }
  }
});
observer.observe({ type: 'layout-shift', buffered: true });
\`\`\`

### Target
- Good: CLS < 0.1
- Needs Improvement: 0.1 - 0.25
- Poor: > 0.25`,
    eli5: "Imagine reading a page and the content jumps around — that's CLS. Reserve boxes for ads and images with known sizes, and don't insert things that push existing content down.",
    difficulty: "intermediate",
    tags: JSON.stringify(["frontend", "performance"]),
    channel: "frontend",
    subChannel: "performance",
    createdAt: new Date().toISOString()
  }
];

async function main() {
  for (const q of questions) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [q.id, q.question, q.answer, q.explanation, q.eli5, q.difficulty, q.tags, q.channel, q.subChannel, "active", 1, q.createdAt, q.createdAt]
    });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for frontend");
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
