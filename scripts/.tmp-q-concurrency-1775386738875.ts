import { createClient } from "@libsql/client";
import crypto from "crypto";

const db = createClient({ url: "file:local.db" });

const questions = [
  {
    id: crypto.randomUUID(),
    question: "What is a race condition, and how does it differ from a deadlock?",
    answer: "A race condition occurs when multiple threads access shared data simultaneously, causing unpredictable results. A deadlock is when threads are permanently blocked waiting for each other to release resources.",
    explanation: `## Race Conditions

A **race condition** occurs when the behavior of a program depends on the relative timing of concurrent operations. Two or more threads access shared data at the same time, and at least one thread modifies the data.

## Deadlocks

A **deadlock** is a specific condition where two or more threads are blocked forever, each waiting for a resource held by another thread in the set.

## Key Differences

| Aspect | Race Condition | Deadlock |
|--------|-----------------|----------|
| Outcome | Unpredictable/corrupted data | Threads permanently blocked |
| Detection | Harder to reproduce | Can be systematically identified |
| Prevention | Use synchronization primitives | Follow ordering/locking rules |

## Code Example

\`\`\`javascript
// Race condition: counter may not reach 10000
let counter = 0;
for (let i = 0; i < 100; i++) {
  Promise.all([
    Promise.resolve().then(() => counter++),
    Promise.resolve().then(() => counter++)
  ]);
}
\`\`\`

Both issues are concurrency bugs but require different mitigation strategies.`,
    eli5: "Race condition is when two people try to edit the same Google Doc at once and the last save wins. Deadlock is when two people each hold a pencil and are waiting for the other's pencil to finish.",
    difficulty: "intermediate",
    tags: JSON.stringify(["concurrency", "race-conditions", "deadlocks"]),
    channel: "concurrency",
    subChannel: "threads",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Explain the producer-consumer problem and how semaphores solve it.",
    answer: "The producer-consumer problem involves producers creating data and consumers processing it from a shared buffer. Semaphores solve it by using a 'filled' semaphore to track available items and an 'empty' semaphore to track buffer slots.",
    explanation: `## The Problem

The **producer-consumer problem** (bounded-buffer problem) involves:
- A fixed-size buffer shared between producers (who add items) and consumers (who remove items)
- Producers must wait if buffer is full
- Consumers must wait if buffer is empty

## Semaphore Solution

\`\`\`javascript
const empty = new Semaphore(bufferSize); // tracks empty slots
const full = new Semaphore(0);            // tracks filled slots
const mutex = new Mutex();                // protects buffer access

// Producer
async function produce(item) {
  await empty.acquire();
  await mutex.acquire();
  buffer.add(item);
  mutex.release();
  full.release();
}

// Consumer
async function consume() {
  await full.acquire();
  await mutex.acquire();
  const item = buffer.remove();
  mutex.release();
  empty.release();
  return item;
}
\`\`\`

## Why Semaphores Work

- **empty**: Blocks producers when buffer is full
- **full**: Blocks consumers when buffer is empty  
- **mutex**: Ensures atomic buffer operations

This classic pattern is used in message queues, task schedulers, and event loops.`,
    eli5: "Imagine a bus with limited seats. 'empty' tracks empty seats, 'full' tracks occupied seats. Bus driver waits for 'full' to say someone wants off, passenger waits for 'empty' to say there's a seat.",
    difficulty: "advanced",
    tags: JSON.stringify(["concurrency", "synchronization", "semaphores", "producer-consumer"]),
    channel: "concurrency",
    subChannel: "synchronization",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "What are the four necessary conditions for a deadlock to occur?",
    answer: "Mutual exclusion (resource can't be shared), hold and wait (thread holds resources while waiting for others), no preemption (can't forcibly take resources), and circular wait (dependency cycle exists).",
    explanation: `## Coffman Conditions

Edward G. Coffman identified four conditions that must ALL be true for a deadlock:

### 1. Mutual Exclusion
Resources cannot be shared. Only one thread can use a resource at a time.
\`\`\`
Printer (physical device) = mutually exclusive
\`\`\`

### 2. Hold and Wait
Threads hold resources already allocated while waiting for additional resources.
\`\`\`
Thread A: has R1, waiting for R2
Thread B: has R2, waiting for R1
\`\`\`

### 3. No Preemption
Resources cannot be forcibly taken from a thread. They must be explicitly released.
\`\`\`
Cannot do: force Release(R1) from Thread A
Must do: Thread A calls Release(R1) itself
\`\`\`

### 4. Circular Wait
A circular chain of threads exists where each thread waits for a resource held by the next.
\`\`\`
T1 → waits for R2 held by T2
T2 → waits for R1 held by T1
\`\`\`

## Breaking Deadlocks

To prevent deadlocks, violate at least ONE condition:
- **Avoid hold-and-wait**: Request all resources at once
- **Prevent circular wait**: Establish global resource ordering
- **Allow preemption**: Implement resource preemption`,
    eli5: "Think of two kids fighting over toys: both refuse to share (mutual exclusion), both hold their toy while reaching for the other's (hold & wait), neither parent can force them to swap (no preemption), and they each wait in a circle for the other (circular wait).",
    difficulty: "intermediate",
    tags: JSON.stringify(["concurrency", "deadlocks", "theory"]),
    channel: "concurrency",
    subChannel: "deadlocks",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "How does async/await differ from traditional callback-based concurrency?",
    answer: "Async/await provides sequential-looking code that executes asynchronously, avoiding 'callback hell'. Callbacks require nesting and make error handling complex, while async/await allows try/catch blocks and clearer control flow.",
    explanation: `## Callback Hell Problem

\`\`\`javascript
// Callback pyramid of doom
fetchData(function(result) {
  processData(result, function(processed) {
    saveData(processed, function(saved) {
      sendNotification(saved, function() {
        console.log('Done!');
      });
    });
  });
});
\`\`\`

## Async/Await Solution

\`\`\`javascript
// Clean, sequential-looking code
async function processEverything() {
  try {
    const result = await fetchData();
    const processed = await processData(result);
    const saved = await saveData(processed);
    await sendNotification(saved);
  } catch (error) {
    console.error('Something failed:', error);
  }
}
\`\`\`

## Key Differences

| Aspect | Callbacks | Async/Await |
|--------|-----------|-------------|
| Readability | Nested pyramid | Sequential flow |
| Error handling | Multiple error callbacks | Single try/catch |
| Debugging | Hard to step through | Can use breakpoints |
| Flow control | Callback hell | Natural loops/conditions |

## Under the Hood

Async/await is syntactic sugar over Promises. \`await\` pauses execution within an async function while waiting for the Promise to resolve, but doesn't block the entire thread.

This makes it ideal for I/O-bound tasks (API calls, file operations) where waiting is expected.`,
    eli5: "Callbacks are like leaving notes for someone at different stations of a factory - messy纸条满天飞. Async/await is like a to-do list - you write steps 1, 2, 3 in order, and the system handles waiting between steps.",
    difficulty: "beginner",
    tags: JSON.stringify(["concurrency", "async-patterns", "async-await", "promises"]),
    channel: "concurrency",
    subChannel: "async-patterns",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "What is a mutex vs a semaphore, and when would you use each?",
    answer: "A mutex is a binary lock for exclusive access to ONE resource (thread owns and releases it). A semaphore manages access to MULTIPLE identical resources (just acquire/release counts). Use mutex for single-resource protection, semaphore for resource pools.",
    explanation: `## Mutex (Mutual Exclusion)

- Binary semaphore (0 or 1)
- **Ownership**: Only the thread that acquires can release
- **Use case**: Protecting a shared variable or critical section

\`\`\`javascript
const lock = new Mutex();

async function safeIncrement(counter) {
  await lock.acquire();
  try {
    counter.value++;
  } finally {
    lock.release(); // guaranteed cleanup
  }
}
\`\`\`

## Semaphore

- Counter-based (0 to N)
- **No ownership**: Any thread can signal
- **Use case**: Limiting concurrent access to N resources

\`\`\`javascript
const pool = new Semaphore(3); // 3 database connections

async function query(sql) {
  await pool.acquire();
  try {
    return await db.execute(sql);
  } finally {
    pool.release();
  }
}
\`\`\`

## Comparison Table

| Feature | Mutex | Semaphore |
|---------|-------|-----------|
| Count | 0 or 1 | 0 to N |
| Release by | Owner only | Any thread |
| Use case | Critical section | Resource pool |
| Ownership | Yes | No |
| Recursive | Usually supported | No |

## When to Use Mutex

- Protecting shared state (counters, buffers)
- Critical sections with single-thread requirement

## When to Use Semaphore

- Connection pools (limit to N connections)
- Reader-writer problems (allow N readers)
- Rate limiting (N requests per second)`,
    eli5: "Mutex is like a single-occupancy bathroom key - only one person can have it and must return it. Semaphore is like a parking lot with 10 spaces - anyone can park if there's an open spot, and anyone can leave to free a spot.",
    difficulty: "intermediate",
    tags: JSON.stringify(["concurrency", "synchronization", "mutex", "semaphore"]),
    channel: "concurrency",
    subChannel: "synchronization",
    createdAt: new Date().toISOString(),
  },
];

async function main() {
  for (const q of questions) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [q.id, q.question, q.answer, q.explanation, q.eli5, q.difficulty, q.tags, q.channel, q.subChannel, "active", 1, q.createdAt, q.createdAt],
    });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for concurrency");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
