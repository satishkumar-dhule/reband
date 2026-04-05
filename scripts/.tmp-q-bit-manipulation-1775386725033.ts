import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const questions = [
  {
    id: crypto.randomUUID(),
    question: "How would you check if a number is a power of 2 using bit manipulation?",
    answer: "A number is a power of 2 if it's positive and only has one bit set. The trick: n > 0 && (n & (n - 1)) === 0.",
    explanation: `## Power of 2 Check

To determine if a number is a power of 2, we leverage a key property of binary representation:

**Powers of 2 in binary:**
- 1 (2⁰) = 0001
- 2 (2¹) = 0010
- 4 (2²) = 0100
- 8 (2³) = 1000

Notice that powers of 2 have exactly **one bit set** and **no adjacent bits**.

### The Trick

\`\`\`javascript
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}
\`\`\`

**Why does this work?**

When you subtract 1 from a power of 2, all bits flip from the rightmost set bit onward:

\`\`\`
n     = 1000 (8)
n - 1 = 0111 (7)

n & (n-1) = 1000 & 0111 = 0000
\`\`\`

For non-powers of 2, the result is non-zero:

\`\`\`
n     = 1010 (10)
n - 1 = 1001 (9)

n & (n-1) = 1010 & 1001 = 1000 (non-zero)
\`\`\`

### Edge Cases
- \`n = 0\`: Returns false (correct, 0 is not a power of 2)
- \`n < 0\`: Returns false (negative numbers excluded)

### Time Complexity
O(1) — constant time operation`,
    eli5: "A power of 2 looks like a single 1 followed by zeros in binary. If you AND it with one less than itself, you get zero because all the bits flip.",
    difficulty: "beginner",
    tags: JSON.stringify(["bit-manipulation", "bit-tricks", "power-of-two"]),
    channel: "bit-manipulation",
    subChannel: "bit-tricks",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "Implement a function to count the number of set bits (1s) in a binary representation of an integer.",
    answer: "Use the Kernighan algorithm: repeatedly do n &= (n - 1) to clear the lowest set bit, counting iterations until n becomes 0.",
    explanation: `## Counting Set Bits

Counting how many 1s appear in a number's binary form has several approaches, each with trade-offs.

### Approach 1: Kernighan's Algorithm (Most Efficient)

\`\`\`javascript
function countBits(n) {
  let count = 0;
  while (n !== 0) {
    n &= (n - 1); // Clear lowest set bit
    count++;
  }
  return count;
}
\`\`\`

Each iteration clears exactly one bit. For a number with k set bits, this runs k times.

### Approach 2: Built-in Methods

\`\`\`javascript
// JavaScript
n.toString(2).split('1').length - 1

// Python
bin(n).count('1')

// Java
Integer.bitCount(n)
\`\`\`

### Step-by-Step Example

\`\`\`
n = 12 = 1100

Iteration 1:
  n     = 1100
  n-1   = 1011
  n&=n-1 = 1000 (count=1)

Iteration 2:
  n     = 1000
  n-1   = 0111
  n&=n-1 = 0000 (count=2)

n is 0, done! Result: 2 bits
\`\`\`

### Time Complexity
- **O(k)** where k is the number of set bits
- Worst case: O(log n) for numbers like 0xFFFFFFFF`,
    eli5: "Keep removing the rightmost 1 bit until nothing's left. The number of times you can do that is your answer.",
    difficulty: "beginner",
    tags: JSON.stringify(["bit-manipulation", "bit-tricks", "counting-bits"]),
    channel: "bit-manipulation",
    subChannel: "bit-tricks",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "How do you swap two integers without using a temporary variable using XOR?",
    answer: "Use the three-XOR swap: a ^= b; b ^= a; a ^= b. This works because XORing a value with itself gives 0, and any number XOR 0 is itself.",
    explanation: `## XOR Swap Algorithm

Swapping two values without a temporary variable is a classic bit manipulation trick.

### The Code

\`\`\`javascript
function swap(a, b) {
  a = a ^ b;
  b = b ^ a;  // b = b ^ (a ^ b) = a
  a = a ^ b;  // a = (a ^ b) ^ a = b
  return [a, b];
}
\`\`\`

### Why It Works

XOR has two key properties:
1. **Self-inverse**: \`x ^ x = 0\`
2. **Identity**: \`x ^ 0 = x\`

Let's trace through with a=5, b=9:

\`\`\`
Step 1: a = 5 ^ 9
        a = 0101 ^ 1001 = 1100 (12)

Step 2: b = 9 ^ 12
        b = 1001 ^ 1100 = 0101 (5)

Step 3: a = 12 ^ 5
        a = 1100 ^ 0101 = 1001 (9)

Result: a=9, b=5 ✓ Swapped!
\`\`\`

### Important Caveats

1. **No self-swap**: If a and b point to the same memory location, both become 0:
   \`\`\`
   a = a ^ a = 0
   b = a ^ 0 = 0  // (a was already 0)
   \`\`\`

2. **Not faster on modern CPUs**: Compilers optimize temp-variable swaps equally well

3. **Less readable**: Code clarity often outweighs micro-optimizations

### When to Use
Useful in embedded systems or interview questions, but prefer standard swap in production code.`,
    eli5: "XOR yourself with the other number, then XOR the other with the result, then XOR again. The values dance around and swap places!",
    difficulty: "intermediate",
    tags: JSON.stringify(["bit-manipulation", "bitwise-operators", "xor"]),
    channel: "bit-manipulation",
    subChannel: "bitwise-operators",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "Explain how to use bit masking to extract individual bits from a byte. How would you get bit 3 (0-indexed) from a byte?",
    answer: "Use AND with a mask that has only the target bit set: (byte >> n) & 1 extracts bit n. For bit 3: (byte >> 3) & 1.",
    explanation: `## Bit Masking Fundamentals

Bit masking lets you isolate, set, clear, or toggle specific bits within a value.

### Extracting a Single Bit

To get bit n (0-indexed from the right):

\`\`\`javascript
function getBit(byte, n) {
  return (byte >> n) & 1;
}
\`\`\`

**How it works:**
1. **Right shift**: \`byte >> n\` moves bit n to position 0
2. **AND with 1**: \`& 1\` masks away all other bits (keeps only LSB)

### Visual Example: Getting Bit 3

\`\`\`
byte = 0b10110101 (181)

Step 1: Shift right by 3
        10110101 >> 3 = 00010110

Step 2: AND with 1
        00010110 & 00000001 = 0

Bit 3 is 0
\`\`\`

### Common Mask Patterns

\`\`\`javascript
// Extract bit at position n
const getBit = (byte, n) => (byte >> n) & 1;

// Extract multiple bits (e.g., bits 2-3)
const getBits = (byte, start, len) => 
  (byte >> start) & ((1 << len) - 1);

// Set bit n to 1
const setBit = (byte, n) => byte | (1 << n);

// Clear bit n to 0
const clearBit = (byte, n) => byte & ~(1 << n);

// Toggle bit n
const toggleBit = (byte, n) => byte ^ (1 << n);
\`\`\`

### Real-World Applications

- **Flags/Options**: Store multiple boolean options in one byte
- **Color extraction**: Pull RGB components from a 24-bit color value
- **Protocol parsing**: Extract fields from network packets

### Time Complexity
O(1) for all operations — constant time regardless of position.`,
    eli5: "Slide the bit you want to the far right, then chop everything else off with AND 1. Think of it like using a mask to reveal only what you need.",
    difficulty: "intermediate",
    tags: JSON.stringify(["bit-manipulation", "bit-masking", "bitwise-operators"]),
    channel: "bit-manipulation",
    subChannel: "bit-masking",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "How can you multiply or divide a number by 2 using bit shifts? What are the advantages and pitfalls?",
    answer: "Left shift (<<) multiplies by 2, right shift (>>) divides by 2. Pitfalls: overflow for multiplication, and signed vs unsigned division behavior differs.",
    explanation: `## Bit Shift Arithmetic

Bit shifts provide an efficient way to perform powers-of-2 multiplication and division.

### The Operations

\`\`\`javascript
// Multiply by 2^n
const multiply = (num, n) => num << n;

// Divide by 2^n
const divide = (num, n) => num >> n;
\`\`\`

### Why Shifts Work

\`\`\`
Left shift by 1:
  5 (0101) << 1 = 1010 = 10 ✓

Left shift by 2:
  5 (0101) << 2 = 0101_00 = 20 ✓

Right shift by 1:
  20 (10100) >> 1 = 01010 = 10 ✓
\`\`\`

### Signed vs Unsigned Division

**Right shift behavior differs for negative numbers:**

\`\`\`javascript
// In JavaScript (all numbers are 64-bit floats, but bit ops work on 32-bit ints)
-8 >> 1  // = -4 (arithmetic shift, sign preserved)

-8 >>> 1 // = 2147483644 (logical shift, treats as unsigned)
\`\`\`

### Division Truncation

\`\`\`javascript
5 >> 1   // = 2 (truncates, not rounds)
7 >> 1   // = 3
9 >> 1   // = 4
\`\`\`

### Advantages

1. **Speed**: Shift is typically a single CPU instruction vs. DIV which takes 10-40 cycles
2. **No floating-point errors**: Exact integer arithmetic
3. **Compiler optimization**: Most compilers automatically use shifts when multiplying/dividing by powers of 2

### Pitfalls

\`\`\`javascript
// Overflow examples
(1 << 31)        // -2147483648 in 32-bit signed (sign flip!)
(1 << 31) | 0     // Forces 32-bit interpretation

// Better approach
BigInt(1) << 32n  // Use BigInt for large shifts
\`\`\`

### When Safe to Use
- Multiplication/division by constants that are powers of 2
- Working within known bit-width bounds
- Embedded systems with fixed integer sizes`,
    eli5: "Sliding bits left makes the number bigger (double each shift), sliding right makes it smaller (halve each shift). Just watch out for running off the edge!",
    difficulty: "advanced",
    tags: JSON.stringify(["bit-manipulation", "bitwise-operators", "bit-shifts"]),
    channel: "bit-manipulation",
    subChannel: "bitwise-operators",
    createdAt: new Date().toISOString()
  }
];
async function main() {
  for (const q of questions) {
    await db.execute({ sql: `INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, args: [q.id,q.question,q.answer,q.explanation,q.eli5,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt] });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for bit-manipulation");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
