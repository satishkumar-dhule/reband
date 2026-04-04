import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const questions = [
  {
    id: crypto.randomUUID(),
    question: "How do you check if a number is a power of 2 using bitwise operators?",
    answer: "A number is a power of 2 if it has exactly one bit set. Use `n > 0 && (n & (n - 1)) === 0` to check.",
    explanation: "## Understanding Power of 2\n\nA power of 2 in binary always has exactly one bit set (e.g., 4 = 100, 8 = 1000). The trick `n & (n - 1)` clears the lowest set bit.\n\n### Why it works\n\n- `n - 1` flips all bits from the rightmost set bit to the right (e.g., 8 = 1000, 7 = 0111)\n- When you AND them, the result is 0 only if n had exactly one bit set\n- Example: `8 & 7` = `1000 & 0111` = `0000` = 0\n\n## Code Implementation\n\n```javascript\nfunction isPowerOfTwo(n) {\n  return n > 0 && (n & (n - 1)) === 0;\n}\n```\n\n### Edge Cases\n- n = 0: Returns false (0 is not a power of 2)\n- n < 0: Returns false (negative numbers cannot be powers of 2)\n- n = 1: Returns true (1 = 2^0)",
    eli5: "A power of 2 has only one 'on' switch in binary. Turning off that one switch gives you zero, so if you AND a number with one less than itself and get zero, it's a power of 2.",
    difficulty: "intermediate",
    tags: JSON.stringify(["bit-manipulation", "bit-tricks"]),
    channel: "bit-manipulation",
    subChannel: "bit-tricks",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "How can you swap two integers without using a temporary variable?",
    answer: "Use XOR: `a = a ^ b; b = a ^ b; a = a ^ b;`. This works because a ^ a = 0 and a ^ 0 = a.",
    explanation: "## XOR Swap Algorithm\n\nXOR is its own inverse, meaning `(a ^ b) ^ b = a`. This property allows us to swap values without a temp variable.\n\n### Step-by-step breakdown\n\n1. `a = a ^ b` - a now holds XOR of original a and b\n2. `b = a ^ b` - b = (a ^ b) ^ b = a (original)\n3. `a = a ^ b` - a = (a ^ b) ^ a = b (original)\n\n## Code Implementation\n\n```javascript\nfunction swap(a, b) {\n  a = a ^ b;\n  b = a ^ b;\n  a = a ^ b;\n  return [a, b];\n}\n```\n\n### Important Caveats\n- Both variables must be different memory locations (a !== b)\n- Does not work if a and b point to same memory\n- In modern compilers, temp variable is often faster due to register pressure",
    eli5: "XOR is like a toggle switch - doing it twice gets you back to where you started. By carefully passing the values through XOR three times, the numbers magically swap places.",
    difficulty: "intermediate",
    tags: JSON.stringify(["bit-manipulation", "bitwise-operators"]),
    channel: "bit-manipulation",
    subChannel: "bitwise-operators",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "Write a function to count the number of set bits (population count) in an integer.",
    answer: "Use `n.toString(2).split('1').length - 1` for simplicity, or Brian Kernighan's algorithm: `while (n) { count++; n &= (n - 1); }` for O(k) time where k is set bits.",
    explanation: "## Brian Kernighan's Algorithm\n\nThis is the most efficient method for counting set bits. Each iteration clears the lowest set bit.\n\n### Why (n & (n - 1)) works\n\n- `n - 1` flips all bits from the rightmost set bit to the right\n- `n & (n - 1)` clears that lowest set bit\n- We count how many times we can do this\n\n## Code Implementation\n\n```javascript\nfunction countBits(n) {\n  let count = 0;\n  while (n) {\n    n &= (n - 1);  // clear lowest set bit\n    count++;\n  }\n  return count;\n}\n```\n\n### Complexity Analysis\n- Time: O(k) where k is the number of set bits\n- Space: O(1)\n\n### Alternative: Built-in Methods\n```javascript\n// JavaScript\nn.toString(2).split('1').length - 1;\nn.bitCount();  // in some languages\n```",
    eli5: "Keep removing the rightmost 'on' bit and count how many times you can do it before the number becomes zero. That's your answer.",
    difficulty: "intermediate",
    tags: JSON.stringify(["bit-manipulation", "bit-tricks"]),
    channel: "bit-manipulation",
    subChannel: "bit-tricks",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "How would you use bit masking to extract the nth bit from a 32-bit integer?",
    answer: "Use `(num >> n) & 1`. Shift the target bit to position 0, then mask with 1 to keep only that bit.",
    explanation: "## Bit Masking Fundamentals\n\nBit masking uses AND (`&`) to isolate specific bits. The pattern is:\n\n1. Shift the target bit to the least significant position\n2. AND with 1 to keep only that bit\n\n## Code Implementation\n\n```javascript\nfunction getNthBit(num, n) {\n  return (num >> n) & 1;\n}\n```\n\n### Visual Example\n\nFor `num = 12` (1100 in binary) and `n = 2`:\n- `12 >> 2` = `3` (0011)\n- `3 & 1` = `1`\n\n## Setting and Clearing Bits\n\n```javascript\n// Set nth bit\nnum | (1 << n);\n\n// Clear nth bit\nnum & ~(1 << n);\n\n// Toggle nth bit\nnum ^ (1 << n);\n```\n\n### Practical Use Cases\n- Flags and options storage\n- Color component extraction (RGB)\n- Permission systems",
    eli5: "Think of bits like a row of light switches. Shifting moves the switch you care about to the far right, and the mask acts like a magnifying glass to see only that one switch.",
    difficulty: "beginner",
    tags: JSON.stringify(["bit-manipulation", "bit-masking"]),
    channel: "bit-manipulation",
    subChannel: "bit-masking",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    question: "How do you reverse the bits in a 32-bit unsigned integer (without using built-in reverse functions)?",
    answer: "Iterate through each bit position, extract it from the source and set it in the reversed position. Use bit masking and shifting: `result = (result << 1) | ((n >> i) & 1)`.",
    explanation: "## Bit Reversal Algorithm\n\nReverse each bit position from LSB to MSB, building the result from right to left.\n\n### Step-by-step Process\n\nFor each bit position i from 0 to 31:\n1. Extract the i-th bit from input: `(n >> i) & 1`\n2. Shift it to position (31 - i)\n3. OR it into the result\n\n## Code Implementation\n\n```javascript\nfunction reverseBits(n) {\n  let result = 0;\n  for (let i = 0; i < 32; i++) {\n    result = (result << 1) | ((n >> i) & 1);\n  }\n  return result >>> 0;  // unsigned\n}\n```\n\n### Optimized Approach (Byte-wise)\n\n```javascript\nfunction reverseBits(n) {\n  n = ((n >>> 1) & 0x55555555) | ((n & 0x55555555) << 1);\n  n = ((n >>> 2) & 0x33333333) | ((n & 0x33333333) << 2);\n  n = ((n >>> 4) & 0x0F0F0F0F) | ((n & 0x0F0F0F0F) << 4);\n  n = ((n >>> 8) & 0x00FF00FF) | ((n & 0x00FF00FF) << 8);\n  n = (n >>> 16) | (n << 16);\n  return n >>> 0;\n}\n```\n\n### Applications\n- Network packet processing\n- Cryptography\n- FFT algorithms",
    eli5: "Take each light switch from the left side of the number and move it to the exact opposite position on the right side, one by one.",
    difficulty: "advanced",
    tags: JSON.stringify(["bit-manipulation", "bit-tricks"]),
    channel: "bit-manipulation",
    subChannel: "bit-tricks",
    createdAt: new Date().toISOString(),
  },
];
async function main() {
  for (const q of questions) {
    await db.execute({ sql: `INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, args: [q.id,q.question,q.answer,q.explanation,q.eli5,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt] });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for bit-manipulation");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
