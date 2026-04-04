import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const questions = [
  {
    id: crypto.randomUUID(),
    question: "What is the key difference between memoization and tabulation in dynamic programming? When would you choose one over the other?",
    answer: "Memoization is top-down with recursion and caches results as needed, while tabulation is bottom-up with iteration and fills a table systematically. Choose memoization for sparse state spaces and tabulation when all subproblems must be solved.",
    explanation: "## Memoization (Top-Down)\n\nMemoization is a recursive approach where you solve the problem naturally but store results as you compute them. Think of it like a cache — when you need a subproblem's answer, you first check if you've already calculated it.\n\n```python\ndef fib_memo(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)\n    return memo[n]\n```\n\n## Tabulation (Bottom-Up)\n\nTabulation builds the solution iteratively from the smallest subproblems up to the final answer. You fill a table sequentially — no recursion needed.\n\n```python\ndef fib_tab(n):\n    if n <= 1:\n        return n\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]\n```\n\n## When to Use Which\n\n**Use Memoization when:**\n- You only need a subset of subproblems (sparse state space)\n- The recursion depth isn't problematic\n- The problem naturally flows top-down\n\n**Use Tabulation when:**\n- All subproblems must be computed anyway\n- You need O(1) lookup after building the table\n- Recursion stack overflow is a concern",
    eli5: "Memoization is like writing down answers to math problems as you solve them so you don't have to solve them again. Tabulation is like solving all the easy problems first and using those answers to build up to the hard ones.",
    difficulty: "beginner",
    tags: JSON.stringify(["dynamic-programming", "memoization", "tabulation"]),
    channel: "dynamic-programming",
    subChannel: "memoization",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Given the classic 0/1 knapsack problem where weights = [2, 3, 4, 5] and values = [3, 4, 5, 6] with capacity = 5, what is the maximum value you can carry? Walk through your approach.",
    answer: "The maximum value is 7 (items with weight 2+3, value 3+4). Use DP where dp[i][w] = max value using first i items with capacity w. Fill table bottom-up: dp[4][5] = 7.",
    explanation: "## Problem Setup\n\nWe have a knapsack with capacity 5 and 4 items:\n- Item 0: weight=2, value=3\n- Item 1: weight=3, value=4\n- Item 2: weight=4, value=5\n- Item 3: weight=5, value=6\n\n## DP Approach\n\nCreate a 2D table where dp[i][w] represents max value using first i items with capacity w.\n\n```python\ndef knapsack(weights, values, capacity):\n    n = len(weights)\n    dp = [[0] * (capacity + 1) for _ in range(n + 1)]\n    \n    for i in range(1, n + 1):\n        for w in range(capacity + 1):\n            if weights[i-1] <= w:\n                dp[i][w] = max(\n                    dp[i-1][w],\n                    dp[i-1][w - weights[i-1]] + values[i-1]\n                )\n            else:\n                dp[i][w] = dp[i-1][w]\n    \n    return dp[n][capacity]\n```\n\n## Trace Through\n\nCapacity 5:\n- Without item 3 (weight 5): can use weights 2+3 = 5 → value 3+4 = **7**\n- With item 3 only: weight 5, value 6 (but then cannot add item 0)\n- With item 2 only: weight 4, value 5\n\nBest is **7** from items at indices 0 and 1.\n\n## Complexity\n\n- Time: O(n × W)\n- Space: O(n × W), can be optimized to O(W)",
    eli5: "Imagine you're packing a backpack that can only hold 5 pounds. You have items weighing 2,3,4,5 pounds worth 3,4,5,6 dollars. You want the most valuable combination that fits. The best is taking the 2lb item ($3) and 3lb item ($4) for $7 total.",
    difficulty: "intermediate",
    tags: JSON.stringify(["dynamic-programming", "classic-problems", "knapsack"]),
    channel: "dynamic-programming",
    subChannel: "classic-problems",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "How would you compute the Longest Common Subsequence (LCS) between strings 'ABCD' and 'AEBD'? Show your DP table and the resulting subsequence.",
    answer: "LCS = 'ABD' (length 3). Build dp[i][j] table where dp[i][j] = LCS length of suffixes ending at i,j. Final dp[4][4] = 3, trace back to find 'ABD'.",
    explanation: "## Problem Definition\n\nGiven two strings, find the longest subsequence present in both. A subsequence maintains order but may not be contiguous.\n\n## DP Table Construction\n\nLet dp[i][j] = LCS length of str1[0:i] and str2[0:j].\n\n```python\ndef lcs(str1, str2):\n    m, n = len(str1), len(str2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    \n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if str1[i-1] == str2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    \n    return dp[m][n]\n```\n\n## Table for 'ABCD' vs 'AEBD'\n\n|   | '' | A | E | B | D |\n|---|---|---|---|---|---|\n| '' | 0 | 0 | 0 | 0 | 0 |\n| A | 0 | 1 | 1 | 1 | 1 |\n| B | 0 | 1 | 1 | 2 | 2 |\n| C | 0 | 1 | 1 | 2 | 2 |\n| D | 0 | 1 | 1 | 2 | 3 |\n\n## Finding the LCS\n\nTrace from dp[4][4]=3 back:\n- dp[4][4]=3, str1[3]='D' == str2[3]='D' → include 'D'\n- dp[3][3]=2, str1[2]='C' != str2[2]='B' → take max\n- dp[2][2]=2, str1[1]='B' == str2[1]='B' → include 'B'\n- dp[1][1]=1, str1[0]='A' == str2[0]='A' → include 'A'\n\n**LCS = 'ABD'**",
    eli5: "Imagine finding the longest word you can spell using letters that appear in order in both 'ABCD' and 'AEBD'. You can skip letters but can't reorder. The longest match is A-B-D, which is 3 letters long.",
    difficulty: "intermediate",
    tags: JSON.stringify(["dynamic-programming", "classic-problems", "lcs"]),
    channel: "dynamic-programming",
    subChannel: "classic-problems",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "For coin change: coins = [1, 2, 5] and amount = 11, what is the minimum number of coins needed? Is this the same as the knapsack problem?",
    answer: "Minimum coins = 3 (5+5+1 or 5+2+2+2). Unlike 0/1 knapsack, this is unbounded—you can use each coin unlimited times. DP approach: dp[i] = min coins for amount i.",
    explanation: "## Problem\n\nGiven coin denominations [1, 2, 5], find minimum coins needed to make amount 11.\n\n## Why Not Same as Knapsack\n\n- **0/1 Knapsack**: Each item used once (bounded)\n- **Coin Change (Unbounded)**: Each coin can be used unlimited times\n\nThis changes the recurrence — you need to consider all coins at each amount.\n\n## DP Solution\n\n```python\ndef coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    \n    for i in range(1, amount + 1):\n        for coin in coins:\n            if coin <= i:\n                dp[i] = min(dp[i], dp[i - coin] + 1)\n    \n    return dp[amount] if dp[amount] != float('inf') else -1\n```\n\n## Step-by-Step\n\n- dp[1] = 1 (coin: 1)\n- dp[2] = 1 (coin: 2)\n- dp[3] = 2 (2+1)\n- dp[4] = 2 (2+2)\n- dp[5] = 1 (coin: 5)\n- dp[6] = 2 (5+1)\n- dp[7] = 3 (5+2)\n- dp[8] = 4 (5+2+1)\n- dp[9] = 3 (5+2+2)\n- dp[10] = 2 (5+5)\n- dp[11] = 3 (5+5+1)\n\n## Complexity\n\n- Time: O(amount × len(coins))\n- Space: O(amount)",
    eli5: "You're making 11 cents with coins [1,2,5]. What's the fewest coins needed? You can use unlimited 5s, 2s, and 1s. The answer is 3 coins: two 5-cent coins plus one 1-cent coin.",
    difficulty: "intermediate",
    tags: JSON.stringify(["dynamic-programming", "classic-problems", "coin-change"]),
    channel: "dynamic-programming",
    subChannel: "classic-problems",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "What is the time and space complexity of the Edit Distance (Levenshtein) algorithm? How would you optimize the space complexity from O(mn) to O(min(m,n))?",
    answer: "Standard: O(mn) time and O(mn) space. Optimize to O(min(m,n)) by only keeping two rows—previous and current—since each row only depends on the row above and current row.",
    explanation: "## Standard DP Solution\n\nEdit Distance finds minimum operations (insert, delete, replace) to transform one string to another.\n\n```python\ndef minDistance(word1, word2):\n    m, n = len(word1), len(word2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    \n    for i in range(m + 1):\n        dp[i][0] = i\n    for j in range(n + 1):\n        dp[0][j] = j\n    \n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if word1[i-1] == word2[j-1]:\n                dp[i][j] = dp[i-1][j-1]\n            else:\n                dp[i][j] = 1 + min(\n                    dp[i-1][j],    # delete\n                    dp[i][j-1],    # insert\n                    dp[i-1][j-1]   # replace\n                )\n    \n    return dp[m][n]\n```\n\n## Complexity Analysis\n\n- **Time**: O(m × n) — compare every character pair\n- **Space**: O(m × n) — full DP table\n\n## Space Optimization\n\nObserve: dp[i][j] only depends on:\n- dp[i-1][j-1] (diagonal)\n- dp[i-1][j] (above)\n- dp[i][j-1] (left)\n\nKeep only two rows:\n\n```python\ndef minDistance_optimized(word1, word2):\n    m, n = len(word1), len(word2)\n    \n    # Ensure word2 is shorter for space efficiency\n    if m < n:\n        word1, word2 = word2, word1\n        m, n = n, m\n    \n    prev = list(range(n + 1))\n    curr = [0] * (n + 1)\n    \n    for i in range(1, m + 1):\n        curr[0] = i\n        for j in range(1, n + 1):\n            if word1[i-1] == word2[j-1]:\n                curr[j] = prev[j-1]\n            else:\n                curr[j] = 1 + min(prev[j], curr[j-1], prev[j-1])\n        prev, curr = curr, prev\n    \n    return prev[n]\n```\n\n**Space**: O(min(m, n)) — only two 1D arrays",
    eli5: "Converting 'kitten' to 'sitting' takes 3 operations (k→s, e→i, add g). Standard DP uses a full table. But you can just remember the previous row and current row—two lines of numbers—instead of the whole table. That's O(min(m,n)) space instead of O(mn).",
    difficulty: "advanced",
    tags: JSON.stringify(["dynamic-programming", "optimization", "edit-distance"]),
    channel: "dynamic-programming",
    subChannel: "optimization",
    createdAt: new Date().toISOString(),
  },
];
async function main() {
  for (const q of questions) {
    await db.execute({ sql: `INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, args: [q.id,q.question,q.answer,q.explanation,q.eli5,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt] });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for dynamic-programming");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
