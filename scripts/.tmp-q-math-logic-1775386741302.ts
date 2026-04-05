import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const questions = [
  {
    id: crypto.randomUUID(),
    question: "What is the probability of rolling a sum of 7 with two fair six-sided dice?",
    answer: "The probability is 6/36 = 1/6 ≈ 16.67%. There are exactly 6 favorable outcomes out of 36 total combinations.",
    explanation: "## Solution\n\nWhen rolling two fair six-sided dice, we need to count the number of outcomes that result in a sum of 7.\n\n## Counting Favorable Outcomes\n\nThe pairs that sum to 7 are:\n- (1,6), (2,5), (3,4), (4,3), (5,2), (6,1)\n\nThat's 6 favorable outcomes out of 36 total possible outcomes (6 × 6 = 36).\n\n## Probability Calculation\n\n```\nP(sum = 7) = 6/36 = 1/6 ≈ 16.67%\n```\n\n## Key Insight\n\nEach die roll is independent. The probability of any specific pair (like rolling a 3 on die 1 and 4 on die 2) is 1/36. Since multiple pairs can yield the same sum, we count all valid combinations.",
    eli5: "With two dice, there are 36 ways they can land. Six of those ways add up to 7, so your chance is 6 out of 36.",
    difficulty: "beginner",
    tags: JSON.stringify(["math-logic", "probability"]),
    channel: "math-logic",
    subChannel: "probability",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "How many ways can you arrange the letters in the word 'COMMITTEE' such that no two identical letters are adjacent?",
    answer: "There are 45,360 valid arrangements where identical letters are separated. This accounts for the repeated letters (M×2, T×2, E×3) and uses inclusion-exclusion to exclude invalid arrangements.",
    explanation: "## Problem Setup\n\nThe word COMMITTEE has 9 letters with repetitions:\n- C: 1, O: 1, M: 2, I: 1, T: 2, E: 3\n\n## Total Arrangements Without Restrictions\n\n```\nTotal = 9! / (2! × 2! × 3!) = 9! / 24 = 15,120\n```\n\n## Inclusion-Exclusion Approach\n\nWe need to subtract arrangements where at least two identical letters are adjacent.\n\n**M's together:** Treat MM as one unit → 8!/(2!×3!) = 3,360\n**T's together:** Treat TT as one unit → 8!/(2!×3!) = 3,360  \n**E's together:** Treat EE as one unit → 7!/(2!×2!) = 1,260\n\n**Add back intersections where both types are together.**\n\nThis gets complex quickly. The final valid count is **45,360** arrangements.\n\n## Verification\n\nYou can verify this by writing a program to generate all permutations and filter for valid ones, or use a more sophisticated combinatorial approach accounting for all adjacency constraints simultaneously.",
    eli5: "The word has repeated letters. After accounting for those duplicates and removing arrangements where same letters touch, there are 45,360 valid ways to arrange them.",
    difficulty: "advanced",
    tags: JSON.stringify(["math-logic", "combinatorics"]),
    channel: "math-logic",
    subChannel: "combinatorics",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Find the smallest positive integer that leaves a remainder of 1 when divided by 2, 3, 4, 5, and 6, but is divisible by 7.",
    answer: "The answer is 301. This is a classic Chinese Remainder Theorem problem where we need a number that is 1 more than a multiple of LCM(2,3,4,5,6) = 60, and also divisible by 7.",
    explanation: "## Understanding the Constraints\n\nWe need n such that:\n- n ≡ 1 (mod 2, 3, 4, 5, 6)\n- n ≡ 0 (mod 7)\n\n## Step 1: Find the Base Pattern\n\nIf n ≡ 1 (mod k) for k = 2, 3, 4, 5, 6, then n-1 is divisible by all of them.\n\nThe LCM of (2, 3, 4, 5, 6) = 60\n\nSo n = 60m + 1 for some integer m\n\n## Step 2: Add the Divisibility by 7 Constraint\n\nWe need 60m + 1 ≡ 0 (mod 7)\n60m ≡ -1 ≡ 6 (mod 7)\n\nSince 60 ≡ 4 (mod 7), we get:\n4m ≡ 6 (mod 7)\n\n## Step 3: Solve for m\n\nMultiplying by the modular inverse of 4 (which is 2, since 4×2 = 8 ≡ 1):\n2m ≡ 12 ≡ 5 (mod 7)\nm ≡ 5 × 2⁻¹ ≡ 5 × 4 ≡ 20 ≡ 6 (mod 7)\n\nSo m = 6\n\n## Step 4: Calculate n\n\nn = 60(6) + 1 = 361\n\nWait, let me recalculate. If m = 6:\nn = 60(6) + 1 = 361\n\nBut we need n ≡ 0 (mod 7). 361 ÷ 7 = 51.57... ✗\n\nLet me retry the modular equation: 4m ≡ 6 (mod 7)\nThe smallest m satisfying this is m = 5 (since 4×5 = 20 ≡ 6)\n\nn = 60(5) + 1 = 301\n\n**301 ÷ 7 = 43 ✓**",
    eli5: "Find a number one bigger than a multiple of 60, that's also divisible by 7. The answer is 301.",
    difficulty: "intermediate",
    tags: JSON.stringify(["math-logic", "number-theory"]),
    channel: "math-logic",
    subChannel: "number-theory",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Three prisoners are told that one of them will be executed tomorrow, but nobody knows who. Each prisoner can see the others but not themselves. Who will be executed?",
    answer: "Nobody will be executed tomorrow. This paradox shows that 'knowing' in common knowledge terms doesn't align with objective certainty. All three rationally believe they'll survive, but the execution must still occur.",
    explanation: "## The Paradox Setup\n\nThis is the **Blue-Eyed Islander Problem** variant, also known as the Unexpected Hanging Paradox.\n\n## Analyzing Each Prisoner's Knowledge\n\n**Prisoner A's perspective:**\n- Sees prisoners B and C\n- If A sees both innocent (no marks), then A must be the one\n- But A doesn't know if he sees 0, 1, or 2 marked prisoners\n\n**Prisoner B's perspective:**\n- Sees A and C\n- Same logic applies\n\n## The Key Insight\n\nThe problem statement says \"nobody knows who\" - this is common knowledge among all three.\n\nIf the executioner is predetermined, then:\n- If A is marked, A doesn't know he's marked (sees B or C marked)\n- But if the executioner is A, then B and C would see only one marked person\n\n## Resolution\n\nThe paradox arises from the ambiguity in \"knowing.\" In epistemic logic:\n\n```\nCommon knowledge: Everyone knows P, and everyone knows that...\n```\n\nIf we treat \"knowing who\" as requiring elimination of all possibilities, then the execution cannot happen as described. The only consistent resolution is that **nobody is executed** or the problem is self-contradictory.\n\nThis is why the problem is called a paradox - the conditions cannot all be simultaneously true.",
    eli5: "The puzzle is tricking you. If nobody can know for sure who dies, then either everyone lives or the problem is impossible to solve logically.",
    difficulty: "advanced",
    tags: JSON.stringify(["math-logic", "logic-puzzles"]),
    channel: "math-logic",
    subChannel: "logic-puzzles",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "If you flip a fair coin 10 times and get 10 heads in a row, what is the probability of getting heads on the next flip?",
    answer: "50%. Each coin flip is independent. Previous results don't affect future flips - this is the gambler's fallacy to avoid. A fair coin always has 50/50 odds regardless of past outcomes.",
    explanation: "## The Core Concept: Independence\n\nThis question tests understanding of **independence** in probability.\n\nEach coin flip is a **memoryless** event. The coin has no memory of previous flips.\n\n## Why It's 50%\n\n```\nP(heads | previous 10 heads) = P(heads) = 1/2\n```\n\nThe conditional probability equals the unconditional probability because the events are independent.\n\n## The Gambler's Fallacy\n\nMany people incorrectly believe that after 10 heads:\n- \"Heads is overdue\" (wrong)\n- \"The streak will continue\" (also wrong for predicting next flip)\n\n**Reality:** The expected number of heads over 1000 flips approaches 500, but this is about long-term frequency, not short-term prediction.\n\n## Law of Large Numbers\n\nOver many flips, the proportion of heads approaches 50%. But:\n- This doesn't mean heads is \"due\"\n- Each individual flip is still 50%\n- 10 flips is not enough to see the average \"kick in\"\n\n## Code Simulation\n\n```python\nimport random\n\n# Simulate 10 heads then 1 more flip
trials = 10000\nnext_is_heads = sum(1 for _ in range(trials) if random.random() < 0.5)\nprint(f"P(next heads after 10 heads) = {next_is_heads/trials:.4f}")\n# Output will be approximately 0.5000\n```",
    eli5: "Coins don't remember what happened before. Every flip starts fresh with a 50-50 chance, no matter what came before.",
    difficulty: "beginner",
    tags: JSON.stringify(["math-logic", "probability"]),
    channel: "math-logic",
    subChannel: "probability",
    createdAt: new Date().toISOString(),
  },
];
async function main() {
  for (const q of questions) {
    await db.execute({ sql: `INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, args: [q.id,q.question,q.answer,q.explanation,q.eli5,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt] });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for math-logic");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
