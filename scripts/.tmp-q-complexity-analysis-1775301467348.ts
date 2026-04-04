import { createClient } from "@libsql/client";
import crypto from "crypto";

const db = createClient({ url: "file:local.db" });

const questions = [
  {
    id: crypto.randomUUID(),
    question: "What is the difference between Big-O, Big-Theta, and Big-Omega notation? When would you use each one?",
    answer: "Big-O provides an upper bound (worst-case), Big-Omega provides a lower bound (best-case), and Big-Theta provides a tight bound (both upper and lower). Use Big-O for worst-case analysis, Omega for best-case guarantees, and Theta when you can prove exact asymptotic behavior.",
    explanation: `## Understanding the Three Notations

### Big-O (Upper Bound)
Big-O notation describes an **upper limit** on the growth rate of a function. When we say f(n) = O(g(n)), we mean f grows no faster than g.

\`\`\`
f(n) = O(g(n)) means: ∃ c, n₀ such that 0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀
\`\`\`

### Big-Omega (Lower Bound)
Big-Omega describes a **lower bound**. When f(n) = Ω(g(n)), f grows at least as fast as g.

\`\`\`
f(n) = Ω(g(n)) means: ∃ c, n₀ such that 0 ≤ c·g(n) ≤ f(n) for all n ≥ n₀
\`\`\`

### Big-Theta (Tight Bound)
Big-Theta provides a **tight bound** when upper and lower bounds match.

\`\`\`
f(n) = Θ(g(n)) means: O(g(n)) AND Ω(g(n))
\`\`\`

## When to Use Each

- **Big-O**: Most common in practice - describes worst-case performance
- **Big-Omega**: Used when proving inherent difficulty of problems (lower bounds)
- **Big-Theta**: Used when you can prove exact asymptotic behavior

Example: Binary search is O(log n), Ω(1), and Θ(log n) in all cases.`,
    eli5: "Big-O says \"at most this slow\", Big-Omega says \"at least this fast\", and Big-Theta says \"exactly this fast\".",
    difficulty: "beginner",
    tags: JSON.stringify(["complexity-analysis", "big-o-notation"]),
    channel: "complexity-analysis",
    subChannel: "big-o-notation",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Analyze the time complexity of inserting n elements into an empty array list that doubles its size when full. What is the amortized cost per insertion?",
    answer: "The amortized cost per insertion is O(1). While individual insertions may cost O(n) when resizing occurs, spreading this cost across all n insertions yields constant time on average.",
    explanation: `## Amortized Analysis of Dynamic Array Resizing

### The Problem
When a dynamic array (ArrayList in Java, list in Python) fills up, it allocates a new array typically 2x the size and copies all elements over.

### Individual Insert Costs
- Regular insertion: O(1)
- Resize insertion: O(n) - must copy all existing elements

### Amortized Analysis

Let's use the **accounting method**:

\`\`\`
Cost for each insertion: 1 (for copying new element)
Extra credit saved: 1 (for future copy when resized)
Total credits after n insertions: n
Total copies needed: 1 + 2 + 4 + ... + n ≈ 2n
Amortized cost: (n + 2n) / n = O(1)
\`\`\`

### Why It Works
Each element gets copied at most once when the array doubles. Over n insertions:
- n regular insertions: O(n)
- At most n-1 element copies: O(n)
- Total: O(n), giving O(1) amortized per insertion

This is why ArrayList has O(1) amortized append despite occasional O(n) resize operations.`,
    eli5: "Even though occasionally we pay O(n) to copy everything when the array fills up, we only do this about log(n) times total, making the average just constant time.",
    difficulty: "intermediate",
    tags: JSON.stringify(["complexity-analysis", "amortized-analysis"]),
    channel: "complexity-analysis",
    subChannel: "amortized-analysis",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Use the Master Theorem to determine the asymptotic complexity of T(n) = 4T(n/2) + n². Verify your answer.",
    answer: "This recurrence falls into the second case of the Master Theorem, giving T(n) = Θ(n² log n). The exponent a=4 equals b²=4, so it matches case 2 with f(n) = Θ(n²).",
    explanation: `## Applying the Master Theorem

### Step 1: Identify Parameters
For T(n) = 4T(n/2) + n²:
- a = 4 (number of subproblems)
- b = 2 (factor we divide n by)
- f(n) = n² (cost of combining results)

### Step 2: Compare n^log_b(a) with f(n)

\`\`\`
n^log_b(a) = n^log_2(4) = n^2
f(n) = n²
\`\`\`

### Step 3: Apply Master Theorem Cases

Case 1: f(n) = O(n^(log_b(a) - ε)) → Θ(n^(log_b(a)))
Case 2: f(n) = Θ(n^(log_b(a))) → Θ(n^(log_b(a)) · log n)
Case 3: f(n) = Ω(n^(log_b(a) + ε)) → Θ(f(n))

Here, f(n) = Θ(n²) = Θ(n^(log_b(a))), so **Case 2 applies**.

### Result
T(n) = Θ(n² · log n)

### Verification
Let T(n) = n² log n:
\`\`\`
T(n) = 4T(n/2) + n²
     = 4((n/2)² log(n/2)) + n²
     = 4(n²/4)(log n - 1) + n²
     = n² log n - n² + n²
     = n² log n ✓
\`\`\``,
    eli5: "Since we split into 4 pieces half the size, and the work to combine equals the size of each piece, we get the work times logarithm - like sorting takes n log n.",
    difficulty: "advanced",
    tags: JSON.stringify(["complexity-analysis", "recurrence-relations", "master-theorem"]),
    channel: "complexity-analysis",
    subChannel: "recurrence-relations",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Explain the difference between worst-case, average-case, and best-case time complexity. When is each type of analysis most useful?",
    answer: "Worst-case is the maximum time for any input of size n (Big-O). Best-case is the minimum time (Omega). Average-case assumes random inputs and requires probability. Worst-case is most common, best-case rarely matters, average-case is useful but harder to compute.",
    explanation: `## Three Types of Complexity Analysis

### Worst-Case Complexity (Big-O)
The maximum time taken over all possible inputs of size n.

\`\`\`
T_worst(n) = max { T(input) : |input| = n }
\`\`\`

**Example**: Searching an element in an unsorted array
- Worst case: O(n) - element at end or not present
- This is what we typically analyze because it provides a guarantee

### Best-Case Complexity (Big-Omega)
The minimum time over all inputs of size n.

\`\`\`
T_best(n) = min { T(input) : |input| = n }
\`\`\`

**Example**: Searching in an unsorted array
- Best case: O(1) - element at first position
- Often less useful as it doesn't reflect typical behavior

### Average-Case Complexity (Big-Theta with expectation)
Expected time over all possible inputs, typically assuming uniform distribution.

\`\`\`
T_avg(n) = Σ P(input_i) × T(input_i)
\`\`\`

**Example**: QuickSort with random pivot
- Average case: O(n log n)
- Worst case: O(n²) - rare with random pivot

## When to Use Each

| Analysis Type | Use Case |
|---------------|----------|
| Worst-case | Production systems requiring guarantees |
| Best-case | Theoretical lower bounds |
| Average-case | Predicting typical performance |`,
    eli5: "Worst-case is like planning for the slowest possible day. Best-case is the lucky day. Average-case is what you'd bet on for a typical day.",
    difficulty: "beginner",
    tags: JSON.stringify(["complexity-analysis", "big-o-notation"]),
    channel: "complexity-analysis",
    subChannel: "big-o-notation",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "What is the time complexity of the following recurrence using substitution method: T(n) = 2T(n/2) + n. Prove your answer.",
    answer: "T(n) = O(n log n). By substituting T(n) = n log n, we verify it satisfies the recurrence with constant factors.",
    explanation: `## Solving T(n) = 2T(n/2) + n

### Guessing the Solution
Let us guess T(n) = n log n. We'll prove via substitution.

### Substitution Method Proof

**Inductive Hypothesis**: Assume T(k) ≤ c·k log k for all k < n

**Inductive Step**:
\`\`\`
T(n) = 2T(n/2) + n
     ≤ 2 · c · (n/2) · log(n/2) + n     [by hypothesis]
     = c · n · (log n - 1) + n
     = c · n · log n - c · n + n
     ≤ c · n · log n                    [for c ≥ 1]
\`\`\`

### Base Case
For n = 1: T(1) = O(1), and c·1·log(1) = 0
Need base case at n = 2: T(2) = 2T(1) + 2 = O(1) + 2 = O(2)
For constant c = 1: 2 ≤ 1·2·log(2) = 2 ✓

### Verification by Expansion
\`\`\`
T(n) = 2T(n/2) + n
     = 2[2T(n/4) + n/2] + n
     = 4T(n/4) + 2n
     = 8T(n/8) + 3n
     ...
     = nT(1) + n·log n
     = n + n log n
     = Θ(n log n)
\`\`\`

This matches the Master Theorem case 2: a=2, b=2, f(n)=n → Θ(n log n).`,
    eli5: "We split into 2 half-sized problems and do O(n) work combining them. This is like merge sort - you do n work at each level, and there are log n levels, giving n log n total.",
    difficulty: "intermediate",
    tags: JSON.stringify(["complexity-analysis", "recurrence-relations"]),
    channel: "complexity-analysis",
    subChannel: "recurrence-relations",
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
  console.log("Inserted", questions.length, "questions for complexity-analysis");
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});