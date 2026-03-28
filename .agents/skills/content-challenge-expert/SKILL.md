---
name: content-challenge-expert
description: Generate coding challenges with test cases for DevPrep. Use when creating LeetCode-style problems with JavaScript, TypeScript, and Python solutions. Includes difficulty calibration, test case generation, language parity validation, and complexity analysis.
---

# Content Challenge Expert

Specialized skill for generating coding challenges with comprehensive test cases and multi-language support.

## Supported Languages

- JavaScript
- TypeScript
- Python

## Generation Parameters

```typescript
interface ChallengeGenerationParams {
  category: string;          // arrays, strings, trees, graphs, dp, sorting, searching
  difficulty: 'easy' | 'medium' | 'hard';
  companies?: string[];       // Target companies
  count?: number;
  existingTitles?: string[];  // Avoid duplicates
}
```

## Required Output Structure

```typescript
interface CodingChallenge {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;       // Problem statement
  constraints: string[];     // Input constraints
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    javascript: string;
    typescript: string;
    python: string;
  };
  solution: {
    javascript: string;
    typescript: string;
    python: string;
  };
  testCases: {
    input: string;
    expected: string;
    isHidden?: boolean;
  }[];
  hints: string[];
  companies: string[];
  tags: string[];
}
```

## Validation Rules

### Language Parity
- ALL three languages MUST be present
- Function signatures must match across languages
- Solutions must produce identical outputs

### Test Case Requirements

| Difficulty | Minimum Test Cases |
|------------|-------------------|
| easy | 4 |
| medium | 6 |
| hard | 8 |

Test cases MUST cover:
- Happy path (normal input)
- Empty/null/zero cases
- Single element
- Large input (performance)
- Edge cases specific to problem type

### Syntax Validation
| Language | Tool |
|----------|------|
| JavaScript | acorn/espree |
| TypeScript | typescript compiler |
| Python | ast + py_compile |

### Difficulty Calibration

| Difficulty | Must Have |
|------------|-----------|
| easy | Direct solution, no complex data structures |
| medium | Optimized approach needed (sliding window, two pointers, etc.) |
| hard | Multiple optimizations, edge cases in constraints |

## Generation Prompt Template

```
Create {count} coding challenge(s) at {difficulty} level in {category}.

Companies: {companies or 'various tech companies'}

Requirements:
- Title: Clear problem name
- Description: Detailed problem statement
- Constraints: Input ranges and edge cases
- Examples: 2-3 input/output pairs with explanations
- Starter Code: Runnable skeleton in JavaScript, TypeScript, and Python
- Solution: Complete working solution in all three languages
- Test Cases: {4/6/8} test cases covering happy path, edge cases, and large input
- Hints: Progressive hints (3-5)
- Tags: Related topics and patterns

CRITICAL:
- All three languages must have matching function signatures
- Test cases must verify correctness, not just syntax
- Constraints should be realistic for interview context
- Time complexity should match stated difficulty

Return as JSON matching the CodingChallenge structure.
```

## Test Execution Pipeline

After generation, the challenge MUST go through:

1. **Syntax Validation** - Parse each language
2. **Solution Execution** - Run against test cases
3. **Language Equivalence** - Verify same output across languages
4. **Complexity Analysis** - Verify complexity matches difficulty

## Quality Gates

Before returning, verify:
- [ ] All three languages present
- [ ] Function signatures match
- [ ] Minimum test case count met
- [ ] Syntax valid for each language
- [ ] Solutions pass all test cases
- [ ] Language equivalence verified

## Error Handling

- If syntax fails: Return specific error with line number
- If solution fails tests: Log which tests failed
- If language mismatch: Report which language differs

## Related Skills

- Use `content-question-expert` for conceptual questions
- Use `pipeline-verifier` for code execution validation
- Use `pipeline-processor` for formatting and storage
