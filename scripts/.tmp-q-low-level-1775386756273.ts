import { createClient } from "@libsql/client";
import crypto from "crypto";

const db = createClient({ url: "file:local.db" });

const questions = [
  {
    id: crypto.randomUUID(),
    question: "What's the difference between the stack and the heap, and when would you choose one over the other?",
    answer: "Stack is fast, fixed-size, auto-managed memory for local variables. Heap is slower, dynamically allocated memory for objects with variable lifetimes.",
    explanation: "## Stack vs Heap\n\nThe **stack** is a LIFO (Last In, First Out) data structure used for static memory allocation. It's extremely fast because it uses a simple pointer increment/decrement model, but has limited size (typically 1-8 MB) and is automatically managed.\n\nThe **heap** is a large pool of memory used for dynamic allocation. It offers flexibility but requires manual memory management (or garbage collection) and has higher allocation overhead.\n\n```c\n// Stack allocation - automatic, fast\nvoid example() {\n    int x = 10;           // on stack\n    char buffer[64];       // on stack\n    // freed automatically when function returns\n}\n\n// Heap allocation - manual management\nvoid example() {\n    int* x = malloc(sizeof(int));  // on heap\n    char* buffer = malloc(1024);    // on heap\n    free(x);\n    free(buffer);\n}\n```\n\n**When to use stack:** Local variables, fixed-size arrays, function calls, when lifetime matches scope.\n\n**When to use heap:** Dynamic data structures (linked lists, trees), large allocations, data needing to outlive the creating function, shared data between threads.",
    eli5: "The stack is like a stack of plates - you put things on top and take them off in reverse order. The heap is more like a messy desk where you can put things anywhere, but you have to keep track of them yourself.",
    difficulty: "beginner",
    tags: JSON.stringify(["low-level", "memory-management", "stack", "heap"]),
    channel: "low-level",
    subChannel: "memory-management",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "How does a CPU cache hierarchy (L1, L2, L3) affect program performance, and what strategies can you use to improve cache utilization?",
    answer: "L1 is fastest (1-2ns), L2 slower (3-10ns), L3 slowest (10-20ns). Cache misses cause expensive main memory access (100+ns).",
    explanation: "## CPU Cache Hierarchy\n\nModern CPUs have multiple cache levels to bridge the speed gap between CPU and RAM:\n\n- **L1 Cache**: 32-64KB per core, ~1-2ns latency, fastest\n- **L2 Cache**: 256KB-1MB per core, ~3-10ns latency\n- **L3 Cache**: Shared 8-64MB, ~10-20ns latency\n\n```python\n# Cache-unfriendly: scanning column-major array\ndef sum_columns(matrix, rows, cols):\n    total = 0\n    for c in range(cols):        # outer loop over columns\n        for r in range(rows):    # inner loop over rows\n            total += matrix[r][c]  # cache miss every access!\n    return total\n\n# Cache-friendly: scanning row-major array contiguously\ndef sum_rows(matrix, rows, cols):\n    total = 0\n    for r in range(rows):        # outer loop over rows\n        for c in range(cols):    # inner loop over columns\n            total += matrix[r][c]  # sequential access = cache hits\n    return total\n```\n\n**Key strategies:**\n1. **Data locality**: Access memory sequentially, keep related data together\n2. **Cache line awareness**: Size data to fit in cache lines (typically 64 bytes)\n3. **Loop reordering**: Swap loop order to match memory layout\n4. **Structure of Arrays (SoA) vs Array of Structures (AoS)**: Depends on access pattern",
    eli5: "Think of cache like a refrigerator near your desk vs walking to the grocery store. The closer the food, the faster you can eat. CPUs try to keep frequently used data nearby.",
    difficulty: "intermediate",
    tags: JSON.stringify(["low-level", "cpu-cache", "performance", "optimization"]),
    channel: "low-level",
    subChannel: "cpu-cache",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Explain how virtual memory works and describe the role of page tables in translating virtual addresses to physical addresses.",
    answer: "Virtual memory maps virtual addresses to physical addresses using page tables. Pages are loaded from disk on demand via page faults.",
    explanation: "## Virtual Memory and Page Tables\n\nVirtual memory creates the illusion of a large, contiguous address space by mapping virtual pages to physical frames, with pages optionally stored on disk.\n\n**Page Table Structure:**\n\n```c\n// Simplified page table entry\nstruct PTE {\n    unsigned present      : 1;   // page in RAM?\n    unsigned frame_num    : 20;  // physical frame number\n    unsigned accessed     : 1;   // recently used?\n    unsigned dirty        : 1;   // modified?\n    unsigned protection   : 3;   // read/write/execute\n};\n\n// Virtual to physical address translation\nvpn = virtual_addr >> PAGE_SHIFT;\noffset = virtual_addr & PAGE_MASK;\nframe_num = page_table[vpn].frame_num;\nphysical_addr = (frame_num << PAGE_SHIFT) | offset;\n```\n\n**Key concepts:**\n- **Page faults**: Occur when a page isn't in RAM; OS loads it from disk\n- **TLB**: Translation Lookaside Buffer caches recent translations for speed\n- **Swapping**: Moving cold pages to disk when RAM is full\n- **Page replacement algorithms**: LRU, CLOCK, working set\n\n**Performance impact**: Each memory access may require multiple lookups (TLB miss → page table walk → memory access), but hardware and OS optimize this heavily.",
    eli5: "Virtual memory is like a library's book reservation system. You get a card saying where your book is, and the librarian (OS) fetches it from storage (disk) if needed.",
    difficulty: "intermediate",
    tags: JSON.stringify(["low-level", "virtual-memory", "memory-management", "paging"]),
    channel: "low-level",
    subChannel: "virtual-memory",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "What happens during a system call, and why is the transition between user mode and kernel mode expensive?",
    answer: "System calls involve mode switch via interrupts/traps, kernel entry, permission checks, execution, and return. The mode switch requires CPU state saves.",
    explanation: "## System Call Mechanism\n\nA system call is how user programs request services from the kernel. The transition involves multiple expensive steps:\n\n**The System Call Flow:**\n\n```c\n// User space code making a system call\n#include <unistd.h>\n\nint fd = open(\"/path/to/file\", O_RDONLY);  // triggers syscall\n\n// What happens internally:\n// 1. User code places syscall number in register (e.g., eax)\n// 2. User code places arguments in other registers\n// 3. User code executes 'int 0x80' or 'syscall' instruction\n// 4. CPU switches from user mode to kernel mode\n// 5. CPU saves current state to kernel stack\n// 6. Kernel validates arguments and permissions\n// 7. Kernel performs the operation\n// 8. Kernel restores state and returns to user mode\n```\n\n**Why it's expensive:**\n\n1. **Mode switch**: CPU must change privilege level, flush pipelines\n2. **Context switch**: Full register save/restore\n3. **TLB flush**: Virtual memory context may change\n4. **Cache pollution**: Kernel code/data evicts user data from cache\n5. **Atomicity enforcement**: Kernel must ensure operation completes safely\n\n**Optimization techniques:**\n- **Batch syscalls**: Combine multiple operations\n- **io_uring**: Linux async I/O interface\n- **vDSO**: Shared kernel pages for simple gettimeofday-style calls",
    eli5: "It's like going through airport security. You have to stop, show your passport (permissions), wait in line, and only then can you access the special areas. Going back is the same process.",
    difficulty: "advanced",
    tags: JSON.stringify(["low-level", "system-calls", "kernel", "performance"]),
    channel: "low-level",
    subChannel: "system-calls",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "What is memory fragmentation (internal vs external), and how do allocators like jemalloc and tcmalloc reduce fragmentation compared to glibc's ptmalloc?",
    answer: "Internal fragmentation is wasted space within allocated blocks; external is non-contiguous free memory. Modern allocators use size classes, thread caches, and splitting/coalescing.",
    explanation: "## Memory Fragmentation\n\n**Internal Fragmentation**: Waste within allocated blocks due to rounding to alignment/power-of-two sizes.\n\n```c\n// Request 65 bytes, get 128 bytes (63 bytes wasted)\nvoid* p = malloc(65);  // allocator rounds up to nearest size class\n```\n\n**External Fragmentation**: Free memory exists but is non-contiguous, preventing large allocations despite sufficient total free space.\n\n## Allocator Comparisons\n\n**ptmalloc (glibc):**\n- Single global heap with mmap'd arenas\n- Coarse-grained locking → contention in multithreaded apps\n- Medium fragmentation risk\n\n**jemalloc (Firefox, Redis):**\n\n```c\n// Size classes: 8, 16, 32, 48, 64, 80, 96, 112... (multiple of 8)\n// Each thread has TLS cache (arena) to avoid locking\n// Segregated size classes reduce internal fragmentation\n// Decay mechanism returns memory to OS efficiently\n```\n\n**tcmalloc (Google):**\n- Per-thread Ccentral free lists\n- Smaller footprint than jemalloc\n- Good for short-lived connections\n\n**Key techniques modern allocators use:**\n1. **Size classes**: Reduce internal fragmentation\n2. **Thread caches**: Avoid lock contention\n3. **Splitting**: Use large blocks for multiple small allocations\n4. **Coalescing**: Merge adjacent free blocks to combat external fragmentation",
    eli5: "Internal fragmentation is like buying a 10-pack of batteries when you only need 3 - you waste some. External fragmentation is like trying to fit a big sofa through a door that's blocked by small boxes scattered everywhere.",
    difficulty: "advanced",
    tags: JSON.stringify(["low-level", "memory-management", "allocators", "fragmentation"]),
    channel: "low-level",
    subChannel: "memory-management",
    createdAt: new Date().toISOString(),
  },
];

async function main() {
  for (const q of questions) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [q.id, q.question, q.answer, q.explanation, q.eli5, q.difficulty, q.tags, q.channel, q.subChannel, "active", 1, q.createdAt, q.createdAt]
    });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for low-level");
}

main().catch(e => { console.error(e.message); process.exit(1); });
