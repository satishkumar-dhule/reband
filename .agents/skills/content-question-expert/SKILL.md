---
name: content-question-expert
description: Generate high-quality interview questions for DevPrep. Use when generating interview Q&A content for channels like system-design, algorithms, frontend, backend, devops, SRE, database, security, or ML/AI. Creates questions with difficulty calibration, channel-specific validation, follow-up potential, and proper structure.
---

# Content Question Expert

Specialized skill for generating interview questions with proper structure, difficulty calibration, and validation.

## Content Types Supported

- **Concept Questions** - Theory and conceptual understanding
- **Coding Questions** - Live coding challenges with code examples
- **System Design Questions** - Architecture and scalability
- **Behavioral Questions** - Situational and STAR-method responses

## Generation Parameters

```typescript
interface QuestionGenerationParams {
  channel: string;           // system-design, algorithms, frontend, backend, devops, etc.
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic?: string;            // Specific topic within channel
  count?: number;            // Number of questions to generate
  companies?: string[];      // Target companies for realism
}
```

## Required Output Structure

Every question MUST follow this structure:

```typescript
interface Question {
  id: string;
  channelId: string;
  title: string;             // 6-20 words, ends with "?"
  difficulty: string;
  tags: string[];
  short: {                   // 80-250 words
    lead: string;            // 1 sentence hook
    points: string[];         // 3-6 bold key points
  };
  code?: {                   // 8-35 lines if present
    language: string;
    snippet: string;
    output?: string;
  };
  eli5?: string;             // 30-80 words, no jargon
  related?: {                // 2-4 related topics
    topic: string;
    description: string;
  }[];
}
```

## Validation Rules

### Title Quality
- Length: 6-20 words
- Must end with "?"
- Contains specific technology/concept name

### Difficulty Calibration
| Channel | Beginner | Intermediate | Advanced |
|---------|----------|--------------|----------|
| algorithms | Basic loops, arrays | Trees, graphs, DP | Hard optimization |
| system-design | Single service | Distributed systems | Multi-region |
| frontend | HTML/CSS basics | React patterns | Performance tuning |
| backend | REST APIs | Caching, queues | Microservices |
| devops | Basic commands | CI/CD, containers | GitOps, k8s |

### Channel-Specific Validation

| Channel | Required Elements |
|---------|-------------------|
| algorithms | Time/space complexity in answer |
| system-design | Scalability considerations |
| react | Actual runnable code |
| aws-saa | Specific AWS service names |
| security | Security implications |
| database | Query examples |

### Code Quality (if present)
- Syntactically valid (parseable)
- No placeholder comments like `// ...`
- Output shown as inline comments
- 8-35 lines maximum

### Follow-up Potential
Every question should have at least one follow-up vector:
- Edge cases that can be explored
- Optimization paths
- Related concepts

## Generation Prompt Template

```
Create {count} interview question(s) for {channel} at {difficulty} level.

Topic: {topic or 'general'}
Companies: {companies or 'various tech companies'}

Requirements:
- Title: 6-20 words, ends with "?"
- Short answer: 80-250 words with 1-sentence lead + 3-6 bold key points
- Code examples if applicable: 8-35 lines, valid syntax, inline output comments
- ELI5 section: 30-80 words, no technical jargon
- Related topics: 2-4 topics with brief descriptions
- Follow-up potential: Include at least one extension point

Return as JSON matching the Question structure.
```

## Quality Gates

Before returning, verify:
1. [ ] Title length 6-20 words and ends with "?"
2. [ ] Short answer 80-250 words
3. [ ] 3-6 key points in short answer
4. [ ] Code is valid (if present)
5. [ ] Difficulty matches channel taxonomy
6. [ ] Tags include channel as first tag
7. [ ] At least one follow-up potential mentioned

## Error Handling

If generation fails:
- Log the error with context
- Return partial results if possible
- Queue for retry with exponential backoff

## Related Skills

- Use `content-challenge-expert` for coding challenges with test cases
- Use `content-certification-expert` for exam MCQs
- Use `content-flashcard-expert` for spaced repetition cards
- Use `pipeline-verifier` to validate generated questions
