import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const questions = [
  {
    id: crypto.randomUUID(),
    question: "What is the time complexity of quicksort in the average case, and why does it degrade to O(n²) in the worst case?",
    answer: "Average case is O(n log n). Worst case O(n²) occurs when pivot selection consistently produces highly unbalanced partitions.",
    explanation: "## Quicksort Time Complexity Analysis\n\nQuicksort is a divide-and-conquer algorithm that works by selecting a 'pivot' element and partitioning the array around it.\n\n### Average Case: O(n log n)\n\nIn the average case, quicksort achieves O(n log n) complexity because:\n- Each partition divides the array roughly in half\n- We perform n comparisons per level\n- The recursion depth is approximately log n\n- Total: n * log n operations\n\n### Worst Case: O(n²)\n\nThe worst case occurs when:\n- Pivot is always the smallest or largest element\n- One partition has n-1 elements, the other has 0\n- Recursion depth becomes n\n- Total: n + (n-1) + (n-2) + ... + 1 = n(n+1)/2 = O(n²)\n\n### Mitigation Strategies\n\n```python\ndef quicksort(arr, low, high):\n    if low < high:\n        pivot_index = partition(arr, low, high)\n        quicksort(arr, low, pivot_index - 1)\n        quicksort(arr, pivot_index + 1, high)\n\ndef partition(arr, low, high):\n    # Randomized pivot selection prevents worst case\n    pivot_idx = random.randint(low, high)\n    arr[pivot_idx], arr[high] = arr[high], arr[pivot_idx]\n    pivot = arr[high]\n    i = low - 1\n    for j in range(low, high):\n        if arr[j] <= pivot:\n            i += 1\n            arr[i], arr[j] = arr[j], arr[i]\n    arr[i + 1], arr[high] = arr[high], arr[i + 1]\n    return i + 1\n```\n\nUsing randomized pivot selection or median-of-three pivot selection significantly reduces the probability of worst-case behavior in practice.",
    eli5: "Imagine splitting a pile of cards by always picking the top card as pivot. If the pile was already sorted, you'd only move one card at a time, making it super slow. Picking a random card as pivot usually splits the pile evenly, making it fast.",
    difficulty: "intermediate",
    tags: JSON.stringify(["algorithms", "sorting", "divide-conquer"]),
    channel: "algorithms",
    subChannel: "sorting",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "How would you find the shortest path in an unweighted graph, and what data structure enables this?",
    answer: "Use Breadth-First Search (BFS) with a queue. BFS explores nodes level-by-level, guaranteeing the shortest path in unweighted graphs.",
    explanation: "## Finding Shortest Path with BFS\n\nBFS is the optimal algorithm for finding shortest paths in unweighted graphs because it explores nodes in order of their distance from the source.\n\n### How BFS Works\n\n```javascript\nfunction shortestPath(graph, start, end) {\n    const queue = [[start, [start]]];\n    const visited = new Set([start]);\n    \n    while (queue.length > 0) {\n        const [node, path] = queue.shift();\n        \n        if (node === end) {\n            return path;\n        }\n        \n        for (const neighbor of graph[node]) {\n            if (!visited.has(neighbor)) {\n                visited.add(neighbor);\n                queue.push([neighbor, [...path, neighbor]]);\n            }\n        }\n    }\n    return null; // No path exists\n}\n```\n\n### Key Properties\n\n| Property | Value |\n|----------|-------|\n| Time Complexity | O(V + E) |\n| Space Complexity | O(V) |\n| Data Structure | Queue (FIFO) |\n| Path Type | Shortest in unweighted graphs |\n\n### Why Queue Enables Shortest Path\n\nThe queue ensures nodes are processed in the order they were discovered:\n1. Start node at distance 0 goes in queue\n2. All distance-1 nodes discovered and queued\n3. Only after all distance-1 nodes processed, distance-2 nodes are discovered\n4. First time we reach a node, it's via the shortest path",
    eli5: "Imagine a ripple spreading in water from a stone. The first point touched at each distance from the center is the closest point at that distance. BFS does the same thing with graph nodes.",
    difficulty: "beginner",
    tags: JSON.stringify(["algorithms", "graph-algorithms", "searching"]),
    channel: "algorithms",
    subChannel: "graph-algorithms",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Explain the time-space tradeoff in merge sort versus in-place quicksort. When would you choose one over the other?",
    answer: "Merge sort trades O(n) extra space for stable O(n log n) performance. Quicksort uses O(log n) space but has variable O(n²) worst case. Choose merge sort for stability and worst-case guarantees; quicksort for better average performance with lower memory.",
    explanation: "## Merge Sort vs Quicksort Tradeoffs\n\n### Space Complexity\n\n```python\n# Merge Sort - O(n) auxiliary space\ndef merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\ndef merge(left, right):\n    result = []  # O(n) extra space\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i])\n            i += 1\n        else:\n            result.append(right[j])\n            j += 1\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result\n\n# Quicksort (in-place) - O(log n) stack space\ndef quicksort_inplace(arr, low, high):\n    if low < high:\n        pi = partition(arr, low, high)\n        quicksort_inplace(arr, low, pi - 1)\n        quicksort_inplace(arr, pi + 1, high)\n```\n\n### Comparison Table\n\n| Aspect | Merge Sort | Quicksort |\n|--------|------------|-----------|\n| Time (Average) | O(n log n) | O(n log n) |\n| Time (Worst) | O(n log n) | O(n²) |\n| Space | O(n) | O(log n) |\n| Stable | Yes | No |\n| In-place | No | Yes |\n\n### When to Choose\n\n**Use Merge Sort when:**\n- You need stable sorting (preserving order of equal elements)\n- Working with linked lists (O(1) space possible)\n- Worst-case guarantee is critical\n- External sorting with large datasets\n\n**Use Quicksort when:**\n- Memory is constrained\n- Average case performance matters more than worst case\n- Sorting arrays in memory",
    eli5: "Merge sort is like having a helper copy your work to a whiteboard as you sort. It uses more space but always works the same way. Quicksort is like organizing books on a shelf in place - saves space but sometimes you have to move things around a lot more.",
    difficulty: "intermediate",
    tags: JSON.stringify(["algorithms", "sorting", "divide-conquer"]),
    channel: "algorithms",
    subChannel: "sorting",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "What is dynamic programming, and how does memoization differ from tabulation?",
    answer: "DP solves problems by breaking them into overlapping subproblems and computing each only once. Memoization (top-down) caches results as needed; tabulation (bottom-up) builds the solution from smallest subproblems first.",
    explanation: "## Dynamic Programming Fundamentals\n\nDynamic programming applies when a problem has:\n1. **Optimal substructure** - optimal solution contains optimal solutions to subproblems\n2. **Overlapping subproblems** - same subproblems solved multiple times\n\n### Memoization (Top-Down)\n\n```python\ndef fib_memo(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)\n    return memo[n]\n# Time: O(n), Space: O(n)\n```\n\n### Tabulation (Bottom-Up)\n\n```python\ndef fib_tab(n):\n    if n <= 1:\n        return n\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]\n# Time: O(n), Space: O(n) - can reduce to O(1) with optimization\n```\n\n### Comparison\n\n| Aspect | Memoization | Tabulation |\n|--------|-------------|------------|\n| Approach | Recursive, start from problem | Iterative, start from base cases |\n| Order | Natural (only compute needed) | Must determine order |\n| Cache | Cache misses possible | No cache misses |\n| Stack Space | O(n) recursion depth | O(1) |\n| Debugging | Easier (start from goal) | Harder |\n\n### When to Use Each\n\n- **Memoization**: When subproblem space is sparse, or when you don't know all subproblems needed upfront\n- **Tabulation**: When you know all subproblems will be needed, or when space optimization is important",
    eli5: "Memoization is like writing down answers to math problems as you solve them so you don't have to solve them again. Tabulation is like filling out a multiplication table from the top, so by the time you need 7x8, you've already computed it.",
    difficulty: "beginner",
    tags: JSON.stringify(["algorithms", "divide-conquer", "dynamic-programming"]),
    channel: "algorithms",
    subChannel: "divide-conquer",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "How does Dijkstra's algorithm find shortest paths, and why can't we use it when edge weights are negative?",
    answer: "Dijkstra's uses a priority queue to greedily select the closest unvisited node, guaranteeing shortest path. It fails with negative weights because the greedy selection can be invalidated - a later discovered path might be shorter than an already-finalized node.",
    explanation: "## Dijkstra's Shortest Path Algorithm\n\n### Algorithm Overview\n\nDijkstra's algorithm finds shortest paths from a source node to all other nodes in a weighted graph with non-negative weights.\n\n### Implementation\n\n```python\nimport heapq\n\ndef dijkstra(graph, start):\n    dist = {node: float('inf') for node in graph}\n    dist[start] = 0\n    pq = [(0, start)]  # (distance, node)\n    \n    while pq:\n        d, node = heapq.heappop(pq)\n        \n        if d > dist[node]:  # Skip outdated entries\n            continue\n            \n        for neighbor, weight in graph[node]:\n            new_dist = dist[node] + weight\n            if new_dist < dist[neighbor]:\n                dist[neighbor] = new_dist\n                heapq.heappush(pq, (new_dist, neighbor))\n    \n    return dist\n# Time: O((V + E) log V) with binary heap\n```\n\n### Why Negative Weights Break It\n\n```\nExample:\n    A --(2)--> B\n    |          |\n   (5)        (-4)\n    v          v\n    C\n    \nShortest path A->B: A->C->B = 5 + (-4) = 1\nDijkstra's would set B's distance to 2 (via direct edge) and mark B as finalized.\nThen it discovers the shorter path through C, but B is already finalized!\n```\n\n### Algorithm Comparison\n\n| Algorithm | Weights | Time Complexity | Use Case |\n|-----------|----------|-----------------|----------|\n| BFS | Unweighted | O(V + E) | Shortest path, no weights |\n| Dijkstra | Non-negative | O((V+E) log V) | Shortest path, positive weights |\n| Bellman-Ford | Any | O(VE) | Negative weights, cycle detection |\n| Floyd-Warshall | Any | O(V³) | All-pairs shortest path |\n\n### Key Invariant\n\nDijkstra's correctness relies on the invariant that once a node is extracted from the priority queue, its shortest distance is finalized. Negative weights violate this invariant because discovering a new path might yield a shorter distance to an already-processed node.",
    eli5: "Dijkstra's works like a race where you always pick the closest runner to finish next. But if someone can go backwards (negative weight) and then forwards a lot, they might actually finish sooner. Once someone crosses the finish line, you can't change your mind - but negative weights might make that wrong.",
    difficulty: "advanced",
    tags: JSON.stringify(["algorithms", "graph-algorithms", "shortest-path"]),
    channel: "algorithms",
    subChannel: "graph-algorithms",
    createdAt: new Date().toISOString(),
  }
];
async function main() {
  for (const q of questions) {
    await db.execute({ sql: `INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, args: [q.id,q.question,q.answer,q.explanation,q.eli5,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt] });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for algorithms");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
