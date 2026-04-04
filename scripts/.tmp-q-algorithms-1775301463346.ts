import { createClient } from "@libsql/client";
import crypto from "crypto";

const db = createClient({ url: "file:local.db" });

const questions = [
  {
    id: crypto.randomUUID(),
    question: "You need to sort a large dataset that nearly fits in memory. Which sorting algorithm would you choose and why?",
    answer: "Use Merge Sort for external sorting because it guarantees O(n log n) and handles data that doesn't fit in memory by reading in chunks.",
    explanation: `## Why Merge Sort for External Sorting\n\nWhen data doesn't fully fit in memory, we need **external sorting** algorithms that can handle data in chunks. Merge Sort is the ideal choice here.\n\n## How It Works\n\n1. **Phase 1 - Sort chunks**: Read data in manageable chunks (e.g., 100MB), sort each chunk in memory using an efficient algorithm like Quick Sort, then write to temporary files.\n\n2. **Phase 2 - Merge sorted chunks**: Read the first element from each sorted chunk into a priority queue. Extract the minimum, add the next element from that chunk, and repeat until all data is merged.\n\n## Time Complexity\n\n- **Best/Average/Worst**: O(n log n) - no degradation even with pathological inputs\n- **Space**: O(n) for the merge phase\n\n## Why Not Other Algorithms?\n\n- **Quick Sort**: Can degrade to O(n²) with poor pivot selection, unpredictable performance\n- **Heap Sort**: Good but less cache-efficient during the merge phase\n- **Radix Sort**: Only works well for integers with limited digit count\n\n## Practical Consideration\n\nModern systems often use **timSort** (Python, Java) which is a hybrid of Merge Sort and Insertion Sort, optimized for real-world data that often contains pre-sorted sections.`,
    eli5: "Merge Sort works well because it splits data into chunks you can handle, sorts each chunk separately, then combines them back in order. It's reliable and doesn't slow down no matter what data you give it.",
    difficulty: "intermediate",
    tags: JSON.stringify(["algorithms", "sorting", "big-o", "external-sorting"]),
    channel: "algorithms",
    subChannel: "sorting",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Given a sorted but rotated array, design an algorithm to find a target element in O(log n) time.",
    answer: "Use modified binary search that determines which half is sorted, then decide whether to search left or right based on where the target lies.",
    explanation: `## Problem Analysis\n\nA **rotated sorted array** looks like [4, 5, 6, 7, 0, 1, 2] - a sorted array that was rotated at some pivot point. Normal binary search fails because the array isn't fully sorted.\n\n## The Key Insight\n\nAt any point in the search, **one half of the array is always sorted**. We can determine which half is sorted by comparing the middle element with the boundaries.\n\n## Algorithm\n\n\`\`\`typescript\nfunction search(nums: number[], target: number): number {\n  let left = 0, right = nums.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (nums[mid] === target) return mid;\n    \n    // Is left half sorted?\n    if (nums[left] <= nums[mid]) {\n      if (target >= nums[left] && target < nums[mid]) {\n        right = mid - 1;\n      } else {\n        left = mid + 1;\n      }\n    } else {\n      // Right half is sorted\n      if (target > nums[mid] && target <= nums[right]) {\n        left = mid + 1;\n      } else {\n        right = mid - 1;\n      }\n    }\n  }\n  return -1;\n}\n\`\`\`\n\n## Time and Space Complexity\n\n- **Time**: O(log n) - we halve the search space each iteration\n- **Space**: O(1) - constant extra space\n\n## Edge Cases to Consider\n\n- Array with no rotation (already sorted)\n- Array with single element\n- Target not in array\n- Duplicates can break O(log n) guarantee`,
    eli5: "The trick is that at any point, one half of the array is perfectly sorted. You can check which half is sorted by comparing the middle to the edges, then only search in the half where your target could actually be.",
    difficulty: "advanced",
    tags: JSON.stringify(["algorithms", "searching", "binary-search", "big-o"]),
    channel: "algorithms",
    subChannel: "searching",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Explain how you would detect if a directed graph contains a cycle. What data structure would you use and why?",
    answer: "Use DFS with three color states (white/gray/black) to detect cycles. A back-edge to a 'gray' node indicates a cycle exists.",
    explanation: `## Graph Cycle Detection\n\nA cycle in a directed graph creates a problem where you can follow edges forever without reaching a terminal node. We detect this using graph coloring during traversal.\n\n## The Three-Color Approach\n\n- **White (0)**: Node not yet visited\n- **Gray (1)**: Node currently being processed (in current DFS path)\n- **Black (2)**: Node fully processed (all descendants explored)\n\n## Algorithm\n\n\`\`\`typescript\nfunction hasCycle(graph: Map<string, string[]>): boolean {\n  const visited = new Map<string, number>(); // 0=white, 1=gray, 2=black\n  \n  function dfs(node: string): boolean {\n    visited.set(node, 1); // Mark as gray (in progress)\n    \n    for (const neighbor of graph.get(node) || []) {\n      const color = visited.get(neighbor) ?? 0;\n      \n      if (color === 1) return true; // Back-edge to gray = cycle\n      if (color === 0 && dfs(neighbor)) return true;\n    }\n    \n    visited.set(node, 2); // Mark as black (done)\n    return false;\n  }\n  \n  for (const node of graph.keys()) {\n    if ((visited.get(node) ?? 0) === 0) {\n      if (dfs(node)) return true;\n    }\n  }\n  return false;\n}\n\`\`\`\n\n## Why Not BFS?\n\nBFS with Kahn's algorithm (topological sort) detects cycles but requires processing the entire graph. DFS finds cycles faster and identifies *where* the cycle is.\n\n## Complexity\n\n- **Time**: O(V + E) - visit each vertex and edge once\n- **Space**: O(V) - recursion stack and visited map`,
    eli5: "Imagine painting nodes as you explore: gray means 'still exploring this path', black means 'finished with this node'. If you ever try to go to a gray node again, you've found a loop - you're going in circles!",
    difficulty: "intermediate",
    tags: JSON.stringify(["algorithms", "graph-algorithms", "dfs", "big-o"]),
    channel: "algorithms",
    subChannel: "graph-algorithms",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "How would you use divide-and-conquer to find the closest pair of points in a 2D plane?",
    answer: "Recursively divide points by x-coordinate, solve for left/right halves, then check strip around the dividing line. Combine results in O(n) using the strip technique.",
    explanation: `## The Closest Pair Problem\n\nFinding the closest two points among n points seems O(n²) brute force, but divide-and-conquer reduces this to O(n log n).\n\n## Algorithm Steps\n\n1. **Sort points** by x-coordinate (preprocessing O(n log n))\n2. **Divide** points into left and right halves by median x\n3. **Conquer** recursively find closest pair in each half\n4. **Combine** check for pairs spanning the divide\n\n## The Key Insight - The Strip\n\nThe minimum distance d is the smaller of left and right results. Only points within distance d of the dividing line need checking.\n\n## The Strip Optimization\n\n\`\`\`typescript\nfunction checkStrip(strip: Point[], d: number): number {\n  strip.sort((a, b) => a.y - b.y); // Sort by y\n  \n  for (let i = 0; i < strip.length; i++) {\n    for (let j = i + 1; j < strip.length; j++) {\n      if (strip[j].y - strip[i].y >= d) break;\n      const dist = Math.hypot(strip[j].x - strip[i].x, strip[j].y - strip[i].y);\n      d = Math.min(d, dist);\n    }\n  }\n  return d;\n}\n\`\`\`\n\nOnly need to check at most 7 neighbors in the strip (mathematically proven).\n\n## Complexity Analysis\n\n- **Recurrence**: T(n) = 2T(n/2) + O(n) + O(n log n)\n- **Final**: O(n log n)\n\nThis beats the naive O(n²) approach significantly for large datasets.`,
    eli5: "Split the points in half, find the closest pair in each side, then only check points near the middle line. The magic trick is that you only need to compare each point to a few neighbors in the middle, not everyone.",
    difficulty: "advanced",
    tags: JSON.stringify(["algorithms", "divide-conquer", "geometry", "big-o"]),
    channel: "algorithms",
    subChannel: "divide-conquer",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Describe the greedy choice property and how it applies to the activity selection problem.",
    answer: "Greedy works when local optimal choices lead to global optimal. For activity selection, picking the earliest finishing activity leaves maximum room for remaining choices.",
    explanation: `## Greedy Choice Property\n\nThe **greedy choice property** means making the locally optimal decision at each step leads to a globally optimal solution. Not all problems have this property!\n\n## Activity Selection Problem\n\nGiven n activities with start and end times, find maximum activities that don't overlap.\n\n## Why Greedy Works Here\n\n**Theorem**: Choosing the activity that finishes earliest (among compatible activities) never blocks the optimal solution.\n\n**Proof intuition**: Let the first activity in an optimal solution be A, and let B be the activity with earliest finish time. Since B finishes no later than A, replacing A with B leaves *more* room for remaining activities. By induction, this greedy choice maintains optimality.\n\n## Greedy Algorithm\n\n\`\`\`typescript\nfunction activitySelection(activities: {start: number, end: number}[]): number {\n  // Sort by end time\n  activities.sort((a, b) => a.end - b.end);\n  \n  let count = 1; // First activity always selected\n  let lastEnd = activities[0].end;\n  \n  for (let i = 1; i < activities.length; i++) {\n    if (activities[i].start >= lastEnd) {\n      count++;\n      lastEnd = activities[i].end;\n    }\n  }\n  return count;\n}\n\`\`\`\n\n## When Greedy Fails\n\nNot all problems are greedy-solvable:\n- **Knapsack** (fractional works, 0/1 doesn't)\n- **Shortest path with negative edges** - Dijkstra fails\n- **Traveling salesman** - no greedy guarantees\n\n## Complexity\n\n- **Time**: O(n log n) for sorting\n- **Space**: O(1) extra`,
    eli5: "For scheduling, picking whatever finishes first seems obvious - but it's actually mathematically proven to always give you the most activities. The trick is proving that being locally greedy doesn't hurt you later.",
    difficulty: "intermediate",
    tags: JSON.stringify(["algorithms", "greedy", "scheduling", "big-o"]),
    channel: "algorithms",
    subChannel: "sorting",
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
  console.log("Inserted", questions.length, "questions for algorithms");
}

main().catch(e => { console.error(e.message); process.exit(1); });