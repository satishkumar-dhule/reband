import { createClient } from "@libsql/client";
import crypto from "crypto";

const db = createClient({ url: "file:local.db" });

const questions = [
  {
    id: crypto.randomUUID(),
    question: "Explain the difference between memoization and tabulation in dynamic programming. When would you choose one over the other?",
    answer: "Memoization is top-down with recursion and caches results after computation, while tabulation is bottom-up with iteration and fills a table from smallest subproblems. Choose memoization for sparse DP tables or when you only need some subproblems; tabulation for complete tables or when avoiding recursion overhead matters.",
    explanation: "## Memoization (Top-Down)\n\nMemoization starts from the original problem and recursively breaks it into subproblems, storing results as they're computed:\n\n```python\ndef fib_memo(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)\n    return memo[n]\n```\n\n## Tabulation (Bottom-Up)\n\nTabulation starts from the smallest subproblems and builds up to the solution:\n\n```python\ndef fib_tab(n):\n    if n <= 1:\n        return n\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]\n```\n\n## When to Use Each\n\n- **Memoization**: Easier to implement from recursive solutions, only computes needed subproblems, good for sparse dependency graphs\n- **Tabulation**: Better space optimization possible, no recursion overhead, cache-friendly memory access patterns",
    eli5: "Memoization is like asking a friend to remember answers to sub-questions for you. Tabulation is like filling out a table from the smallest numbers up to the final answer.",
    difficulty: "beginner",
    tags: JSON.stringify(["dynamic-programming", "memoization", "tabulation", "fundamentals"]),
    channel: "dynamic-programming",
    subChannel: "memoization",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Solve the 0/1 Knapsack problem: given weights [2,3,4,5] and values [3,4,5,6] with capacity 5, what is the maximum value? Show the DP table.",
    answer: "Maximum value is 7 (items with weight 2/value 3 and weight 3/value 4 combined). The DP table shows that capacity 5 cannot fit weight 4+5=9, so we take weight 2+3=5 for total value 7.",
    explanation: "## Problem Setup\n\nWe need to maximize value without exceeding capacity 5.\n\n## DP Table Construction\n\n```\nCapacity:  0   1   2   3   4   5\nItem 0:   0   0   0   0   0   0\nItem 1:   0   0   3   3   3   3  (wt=2, val=3)\nItem 2:   0   0   3   4   4   7  (wt=3, val=4)\nItem 3:   0   0   3   4   5   7  (wt=4, val=5)\nItem 4:   0   0   3   4   5   7  (wt=5, val=6)\n```\n\n## Recurrence\n\n```python\ndef knapsack(weights, values, capacity):\n    n = len(weights)\n    dp = [[0] * (capacity + 1) for _ in range(n + 1)]\n    \n    for i in range(1, n + 1):\n        for w in range(capacity + 1):\n            if weights[i-1] <= w:\n                dp[i][w] = max(\n                    dp[i-1][w],\n                    dp[i-1][w - weights[i-1]] + values[i-1]\n                )\n            else:\n                dp[i][w] = dp[i-1][w]\n    return dp[n][capacity]\n```\n\n## Space Optimization\n\nCan reduce to 1D array: `dp[w] = max(dp[w], dp[w - wt] + val)` iterating right-to-left to avoid reuse.",
    eli5: "Imagine you're packing a bag with limited space. You pick items that give you the most value without exceeding the weight limit. The DP table helps you figure out the best combination.",
    difficulty: "intermediate",
    tags: JSON.stringify(["dynamic-programming", "knapsack", "tabulation", "classic-problems"]),
    channel: "dynamic-programming",
    subChannel: "tabulation",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "What is the Longest Common Subsequence (LCS) between 'ABCDGH' and 'AEDFHR'? Write the recurrence relation and identify the LCS length.",
    answer: "The LCS length is 3. The LCS is 'ADH' (or 'AFH' or 'ADH' - there can be multiple valid subsequences). The recurrence: if characters match, add 1 to LCS of remaining strings; if not, take max of skipping last char from either string.",
    explanation: "## Understanding LCS\n\nA subsequence maintains order but isn't necessarily contiguous. 'ADH' appears in both strings in the same order.\n\n## Recurrence Relation\n\n```\nLCS[i][j] = 0                                    if i=0 or j=0\nLCS[i][j] = LCS[i-1][j-1] + 1                    if X[i-1] == Y[j-1]\nLCS[i][j] = max(LCS[i-1][j], LCS[i][j-1])        otherwise\n```\n\n## DP Table\n\n```\n       ""  A  E  D  F  H  R\n    ""   0  0  0  0  0  0  0\n    A    0  1  1  1  1  1  1\n    B    0  1  1  1  1  1  1\n    C    0  1  1  1  1  1  1\n    D    0  1  1  2  2  2  2\n    G    0  1  1  2  2  2  2\n    H    0  1  1  2  2  3  3\n    R    0  1  1  2  2  3  3\n```\n\n## Implementation\n\n```python\ndef lcs(X, Y):\n    m, n = len(X), len(Y)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    \n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if X[i-1] == Y[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    \n    return dp[m][n]\n```",
    eli5: "LCS is like finding what letters stay in the same order when you read two words. 'ADH' is the longest common sequence between your two strings.",
    difficulty: "intermediate",
    tags: JSON.stringify(["dynamic-programming", "lcs", "tabulation", "string-matching", "classic-problems"]),
    channel: "dynamic-programming",
    subChannel: "classic-problems",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Solve the Coin Change problem: given coins [1,2,5] and amount 11, find the minimum number of coins needed. Is this greedy optimal?",
    answer: "Minimum coins = 3 (5+5+1). Greedy works here because [1,2,5] is a canonical coin system, but for coins [1,3,4] and amount 6, greedy fails—it picks 4+1+1=3 coins while optimal is 3+3=2 coins.",
    explanation: "## Greedy vs DP\n\nGreedy fails for certain coin systems because it makes locally optimal choices that don't lead to global optimum.\n\n## Greedy (Fails for Non-Canonical Systems)\n\n```python\ndef coin_change_greedy(coins, amount):\n    count = 0\n    for coin in sorted(coins, reverse=True):\n        while amount >= coin:\n            amount -= coin\n            count += 1\n    return count if amount == 0 else -1\n```\n\n## DP Solution (Always Optimal)\n\n```python\ndef coin_change_dp(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    \n    for i in range(1, amount + 1):\n        for coin in coins:\n            if coin <= i:\n                dp[i] = min(dp[i], dp[i - coin] + 1)\n    \n    return dp[amount] if dp[amount] != float('inf') else -1\n```\n\n## Trace for coins=[1,2,5], amount=11\n\n```\ndp[0]=0, dp[1]=1, dp[2]=1, dp[3]=2, dp[4]=2, dp[5]=1\ndp[6]=2 (5+1), dp[7]=3 (5+2), dp[8]=4 (5+2+1)\ndp[9]=2 (5+4), dp[10]=2 (5+5), dp[11]=3 (5+5+1)\n```",
    eli5: "Counting coins is like making change—you want the fewest coins total. For most coin systems, greedy works, but some tricky ones need the full DP approach to guarantee the fewest coins.",
    difficulty: "intermediate",
    tags: JSON.stringify(["dynamic-programming", "coin-change", "optimization", "greedy"]),
    channel: "dynamic-programming",
    subChannel: "optimization",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Solve the Edit Distance problem: transform 'kitten' to 'sitting'. What is the minimum number of operations (insert, delete, substitute)?",
    answer: "Edit distance is 3: 'kitten' → 'sitten' (substitute k→s) → 'sittin' (substitute e→i) → 'sitting' (insert g at end). The Levenshtein distance recurrence considers insert, delete, and substitute operations.",
    explanation: "## Operations\n\n- **Insert**: Add a character (cost 1)\n- **Delete**: Remove a character (cost 1)\n- **Substitute**: Replace a character (cost 1)\n\n## DP Recurrence\n\n```\nedit[i][j] = edit[i-1][j-1]                    if X[i-1] == Y[j-1]\nedit[i][j] = 1 + min(\n    edit[i-1][j],      # delete\n    edit[i][j-1],      # insert\n    edit[i-1][j-1]     # substitute\n)\n```\n\n## DP Table for 'kitten' → 'sitting'\n\n```\n       ""  s  i  t  t  i  n  g\n    ""   0  1  2  3  4  5  6  7\n    k    1  1  2  3  4  5  6  7\n    i    2  2  1  2  3  4  5  6\n    t    3  3  2  1  2  3  4  5\n    t    4  4  3  2  1  2  3  4\n    e    5  5  4  3  2  2  3  4\n    n    6  6  5  4  3  3  2  3\n    ""   7  7  6  5  4  4  3  3\n```\n\n## Implementation\n\n```python\ndef edit_distance(word1, word2):\n    m, n = len(word1), len(word2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    \n    for i in range(m + 1):\n        dp[i][0] = i\n    for j in range(n + 1):\n        dp[0][j] = j\n    \n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if word1[i-1] == word2[j-1]:\n                dp[i][j] = dp[i-1][j-1]\n            else:\n                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])\n    \n    return dp[m][n]\n```\n\n## Space Optimization\n\nCan reduce to O(min(m,n)) space using only two rows.",
    eli5: "Edit distance measures how different two words are by counting single-letter changes. 'kitten' needs 3 changes to become 'sitting'—one swap, one change, one addition.",
    difficulty: "advanced",
    tags: JSON.stringify(["dynamic-programming", "edit-distance", "tabulation", "string-processing", "classic-problems"]),
    channel: "dynamic-programming",
    subChannel: "classic-problems",
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
  console.log("Inserted", questions.length, "questions for dynamic-programming");
}

main().catch(e => { console.error(e.message); process.exit(1); });
