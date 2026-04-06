/**
 * Enhanced Coding Problem Prompt Template
 * Generates comprehensive coding challenges with multiple difficulty levels, 
 * solution explanations, and detailed test cases
 */

import { jsonOutputRule, markdownFormattingRules } from './base.js';

export const schema = {
  id: "challenge-xxx-001",
  title: "Two Sum",
  difficulty: "easy",
  category: "arrays",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists"
  ],
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  starterCode: {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
}`,
    typescript: `function twoSum(nums: number[], target: number): number[] {
  // Your code here
}`,
    python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Your code here
    pass`
  },
  solution: {
    javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}`,
    typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
}`,
    python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i`
  },
  solutionExplanation: {
    approach: "Hash Map",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    steps: [
      "Create a hash map to store number -> index pairs",
      "For each number, calculate the complement (target - current)",
      "Check if complement exists in the map",
      "If found, return the stored index and current index",
      "Otherwise, add current number and index to the map"
    ],
    whyThisWorks: "Using a hash map allows O(1) lookup for complements. We only need to traverse the array once.",
    commonMistakes: [
      "Using nested loops leads to O(n²) time complexity",
      "Forgetting to check if complement exists before adding current number",
      "Not handling the case where a number is added to map before being checked as complement of itself"
    ]
  },
  testCases: [
    { id: 1, input: "[2,7,11,15], 9", expected: "[0,1]", isHidden: false, type: "basic" },
    { id: 2, input: "[3,2,4], 6", expected: "[1,2]", isHidden: false, type: "basic" },
    { id: 3, input: "[3,3], 6", expected: "[0,1]", isHidden: false, type: "edge" },
    { id: 4, input: "[1,5,8,3,9,2], 11", expected: "[2,3]", isHidden: true, type: "hidden" },
    { id: 5, input: "[-1,-2,-3,-4,-5], -8", expected: "[2,4]", isHidden: true, type: "hidden" }
  ],
  hints: [
    "Think about what number you need to find for each element",
    "Can you use extra space to trade for time?",
    "A hash map can help you find complements in O(1)"
  ],
  companies: ["Google", "Amazon", "Meta", "Apple"],
  tags: ["arrays", "hash-table"],
  difficultyLevels: {
    easy: "Direct application of common data structures",
    medium: "Requires optimization or two-pointer technique",
    hard: "Multiple optimizations, complex edge cases"
  }
};

export const categories = {
  'arrays': ['two-pointer', 'sliding-window', 'hash-map', 'dynamic-programming', 'sorting'],
  'strings': ['two-pointer', 'stacking', 'parsing', 'regex'],
  'linked-lists': ['two-pointer', 'dummy-head', 'reversal'],
  'trees': ['bfs', 'dfs', 'recursive', 'iterative'],
  'graphs': ['bfs', 'dfs', 'dijkstra', 'topological-sort'],
  'dynamic-programming': ['memoization', 'tabulation', 'space-optimization'],
  'sorting': ['comparison', 'counting', 'bucket'],
  'searching': ['binary-search', 'modified-binary']
};

export const guidelines = [
  'Problems should be realistic interview questions from major tech companies',
  'All three languages (JavaScript, TypeScript, Python) must have working solutions',
  'Test cases must cover happy path, edge cases, and hidden test cases',
  'Solution explanations must include time/space complexity and step-by-step approach',
  'Constraints should be realistic for interview context',
  'Include common follow-up questions or extensions',
  'Difficulty should match the complexity of optimal solution',
  'Starter code should compile but not contain the solution'
];

export function build(context) {
  const { difficulty = 'medium', category = 'arrays', companies = [], count = 1, includeVariants = false } = context;
  
  const categoryTopics = categories[category] || categories['arrays'];
  const targetTopic = categoryTopics[Math.floor(Math.random() * categoryTopics.length)];
  
  return `You are an expert coding interview problem designer. Generate ${count} comprehensive coding challenge(s).

DIFFICULTY: ${difficulty}
CATEGORY: ${category}
TARGET TOPIC: ${targetTopic}
COMPANIES: ${companies.length > 0 ? companies.join(', ') : 'Google, Amazon, Meta, Apple'}

Generate challenges with:

1. **Problem Statement**
   - Clear, concise description
   - Real-world context where applicable
   - Input/output format specification

2. **Constraints**
   - Realistic input ranges
   - Edge case specifications
   - Performance requirements

3. **Examples**
   - 2-3 input/output pairs
   - Explanation for each example
   - Edge case examples

4. **Starter Code** (all 3 languages)
   - JavaScript with JSDoc
   - TypeScript with type annotations
   - Python with type hints
   - Function signatures must match

5. **Solution** (all 3 languages)
   - Complete, working code
   - Follows language best practices
   - Optimized for the difficulty level

6. **Solution Explanation**
   - Approach name and description
   - Time and space complexity
   - Step-by-step breakdown
   - Why this approach works
   - Common mistakes to avoid

7. **Test Cases** (minimum per difficulty):
   - Easy: 4 test cases (2 basic, 1 edge, 1 hidden)
   - Medium: 6 test cases (2 basic, 2 edge, 2 hidden)
   - Hard: 8 test cases (2 basic, 3 edge, 3 hidden)

8. **Hints** (3-5 progressive hints)
   - First hint: Approach guidance
   - Middle hints: Specific techniques
   - Last hint: Near-solution guidance

${includeVariants ? `
9. **Difficulty Variants**
   - Easy version of this problem
   - Hard extension or follow-up
` : ''}

${markdownFormattingRules}

Return a JSON array of challenge objects:
${JSON.stringify([schema], null, 2)}

GUIDELINES:
${guidelines.map(g => `- ${g}`).join('\n')}

IMPORTANT:
- All solutions must produce identical outputs across languages
- Test cases must be executable and have verified expected outputs
- Solutions should match the stated time/space complexity
- No placeholder comments like "// implementation here"

${jsonOutputRule}`;
}

export default { schema, categories, guidelines, build };
