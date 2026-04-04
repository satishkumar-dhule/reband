import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const questions = [
  {
    id: crypto.randomUUID(),
    question: "What is the time complexity of inserting an element at the beginning of a singly linked list, and when would you choose an array instead?",
    answer: "O(1) for linked list vs O(n) for array. Choose linked list when frequent insertions at beginning; choose array when you need random access or cache locality.",
    explanation: "## Insertion at Beginning\n\nIn a singly linked list, inserting at the beginning is O(1) because you only need to:\n1. Create a new node\n2. Set its `next` pointer to the current head\n3. Update head to point to the new node\n\n```javascript\nfunction insertAtHead(head, value) {\n  const newNode = { value, next: head };\n  return newNode; // new head\n}\n```\n\n## Array Insertion\n\nIn an array, inserting at the beginning is O(n) because you must shift all existing elements one position to the right.\n\n```javascript\narray.unshift(value); // O(n) - shifts all elements\n```\n\n## When to Choose Each\n\n**Linked List**: Frequent insertions/deletions at arbitrary positions, unknown size ahead, no need for random access\n\n**Array**: Frequent random access needed, memory locality matters, you can afford O(n) insertions",
    eli5: "A linked list is like a train - you can add a new car at the front instantly. An array is like a row of numbered lockers - to add something at locker 1, you have to move everything down.",
    difficulty: "beginner",
    tags: JSON.stringify(["data-structures", "linked-lists"]),
    channel: "data-structures",
    subChannel: "linked-lists",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Explain how a hash table handles collisions using chaining. What are the trade-offs compared to open addressing?",
    answer: "Chaining stores multiple items in each bucket via a linked list. Trade-off: simpler deletion and better load factor tolerance, but uses extra memory for pointers.",
    explanation: "## Chaining Implementation\n\nEach bucket in a hash table holds a linked list (or other structure) of all entries that hash to that index:\n\n```python\nclass HashTable:\n    def __init__(self, size=10):\n        self.size = size\n        self.buckets = [[] for _ in range(size)]\n    \n    def insert(self, key, value):\n        index = hash(key) % self.size\n        self.buckets[index].append((key, value))\n    \n    def get(self, key):\n        index = hash(key) % self.size\n        for k, v in self.buckets[index]:\n            if k == key:\n                return v\n        return None\n```\n\n## Trade-offs\n\n**Chaining Pros:**\n- Deletion is simple (just remove from list)\n- Performance degrades gracefully under high load\n- Can handle arbitrarily many collisions\n\n**Chaining Cons:**\n- Extra memory for linked list pointers\n- Poor cache locality (scattered memory)\n\n**Open Addressing Pros:**\n- No extra pointers = better cache performance\n- More memory efficient at low load factors\n\n**Open Addressing Cons:**\n- Complex deletion (tombstones)\n- Performance degrades sharply past 70-80% load",
    eli5: "Imagine each locker can hold a whole shelf of books. If multiple books map to the same locker, they just stack on that shelf. Open addressing is like having only one book per locker and finding another spot when it's full.",
    difficulty: "intermediate",
    tags: JSON.stringify(["data-structures", "hash-tables"]),
    channel: "data-structures",
    subChannel: "hash-tables",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Given a binary tree, describe an algorithm to find the lowest common ancestor (LCA) of two nodes. What is the time and space complexity?",
    answer: "Use recursive DFS from root. Time O(n), Space O(h) where h is height. If nodes have parent pointers, use O(1) extra space with depth-first approach from both nodes.",
    explanation: "## Recursive Approach\n\n```python\ndef lca(root, p, q):\n    if not root or root == p or root == q:\n        return root\n    \n    left = lca(root.left, p, q)\n    right = lca(root.right, p, q)\n    \n    if left and right:\n        return root\n    return left or right\n```\n\n## How It Works\n\n1. **Base case**: If current node is null or equals one of targets, return it\n2. **Recurse**: Search left and right subtrees\n3. **Combine**: \n   - If both left and right return non-null, current node is LCA\n   - If only one returns non-null, propagate that up (one target is in that subtree)\n\n## Complexity Analysis\n\n- **Time**: O(n) - must visit each node in worst case\n- **Space**: O(h) - recursive call stack, where h is tree height\n  - Best case (balanced): O(log n)\n  - Worst case (skewed): O(n)\n\n## Optimization with Parent Pointers\n\nIf each node has a parent pointer, find depth of both nodes, then move up from deeper node to same depth, then move both up together until they meet. This uses O(1) extra space.",
    eli5: "Starting from the root, ask each side 'Do you have both nodes in your subtree?' If one side says yes and the other says yes, you're at the lowest common ancestor. If only one side says yes, that's where the ancestor must be.",
    difficulty: "intermediate",
    tags: JSON.stringify(["data-structures", "trees"]),
    channel: "data-structures",
    subChannel: "trees",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "What is a min-heap and how does it differ from a max-heap? How would you implement a priority queue using a heap?",
    answer: "Min-heap has smallest element at root; max-heap has largest. For priority queue: use min-heap for ascending priority (highest priority = smallest number) or max-heap for descending.",
    explanation: "## Heap Properties\n\nA binary heap is a complete binary tree where:\n\n**Min-Heap**: Every node's value ≤ children's values (root = minimum)\n**Max-Heap**: Every node's value ≥ children's values (root = maximum)\n\n```python\n# Min-heap array representation (index i)\n# Parent: (i-1) // 2\n# Left child: 2*i + 1\n# Right child: 2*i + 2\n```\n\n## Priority Queue Implementation\n\n```python\nimport heapq\n\nclass PriorityQueue:\n    def __init__(self, max_heap=False):\n        self.heap = []\n        self.max_heap = max_heap\n    \n    def push(self, item, priority):\n        # Negate for max-heap behavior\n        p = -priority if self.max_heap else priority\n        heapq.heappush(self.heap, (p, item))\n    \n    def pop(self):\n        p, item = heapq.heappop(self.heap)\n        return item\n```\n\n## Operations\n\n- **Insert**: O(log n) - add to end, bubble up\n- **Extract min/max**: O(log n) - remove root, move last to root, bubble down\n- **Peek**: O(1) - just look at root\n\n## Use Cases\n\n- Min-heap: task scheduling (smallest timestamp first)\n- Max-heap: job scheduling (highest priority first), Dijkstra's algorithm",
    eli5: "A heap is like a binary tree where everyone listens to the boss at the top. In a min-heap, the smallest person is in charge. A priority queue is just a waiting line where the most important person gets served first.",
    difficulty: "intermediate",
    tags: JSON.stringify(["data-structures", "heaps"]),
    channel: "data-structures",
    subChannel: "heaps",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "How would you detect if a directed graph contains a cycle? Compare the performance of DFS-based and Kahn's algorithm approaches.",
    answer: "DFS detects cycles via back edges (O(V+E), O(V) space). Kahn's uses topological sort - remove nodes with in-degree 0 (O(V+E), O(V) space). Both have same complexity.",
    explanation: "## DFS Approach - Back Edge Detection\n\n```python\ndef has_cycle_dfs(graph):\n    visited = set()      # Fully processed\n    rec_stack = set()    # Currently in recursion\n    \n    def dfs(node):\n        visited.add(node)\n        rec_stack.add(node)\n        \n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                if dfs(neighbor):\n                    return True\n            elif neighbor in rec_stack:\n                return True  # Back edge = cycle\n        \n        rec_stack.remove(node)\n        return False\n    \n    return any(dfs(n) for n in graph if n not in visited)\n```\n\n## Kahn's Algorithm (BFS-based)\n\n```python\ndef has_cycle_kahn(graph, in_degree):\n    queue = [n for n in range(len(in_degree)) if in_degree[n] == 0]\n    count = 0\n    \n    while queue:\n        node = queue.pop(0)\n        count += 1\n        for neighbor in graph[node]:\n            in_degree[neighbor] -= 1\n            if in_degree[neighbor] == 0:\n                queue.append(neighbor)\n    \n    return count != len(graph)  # If not all nodes processed, cycle exists\n```\n\n## Comparison\n\n| Aspect | DFS | Kahn's |\n|--------|-----|--------|\n| Time | O(V+E) | O(V+E) |\n| Space | O(V) | O(V) |\n| Approach | Back edge detection | Topological sort |\n| Finds cycle location | Yes | No (just detects) |\n\nKahn's gives you the topological order for free; DFS tells you where the cycle is.",
    eli5: "DFS is like exploring a maze and marking where you've been. If you hit a room you've already visited, you found a loop. Kahn's is like gradually removing doors that lead nowhere - if you can't enter all rooms, there's a loop trapping some inside.",
    difficulty: "advanced",
    tags: JSON.stringify(["data-structures", "graphs"]),
    channel: "data-structures",
    subChannel: "graphs",
    createdAt: new Date().toISOString(),
  }
];
async function main() {
  for (const q of questions) {
    await db.execute({ sql: `INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, args: [q.id,q.question,q.answer,q.explanation,q.eli5,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt] });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for data-structures");
}
main().catch(e=>{console.error(e.message);process.exit(1);});