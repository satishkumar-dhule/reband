---
name: content-voice-expert
description: Generate voice practice prompts for DevPrep interview preparation. Use when creating verbal practice sessions for technical and behavioral interviews. Includes speaking prompts, timing guidelines, and follow-up questions.
---

# Content Voice Expert

Specialized skill for generating voice practice prompts for interview preparation.

## Generation Parameters

```typescript
interface VoiceGenerationParams {
  channel: string;            // system-design, behavioral, etc.
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'technical' | 'behavioral' | 'mixed';
  count?: number;
}
```

## Required Output Structure

```typescript
interface VoiceSession {
  id: string;
  channelId: string;
  title: string;
  type: 'technical' | 'behavioral';
  difficulty: string;
  prompt: string;              // Main question/prompt to answer
  keyPoints: string[];        // 3-5 key points to cover
  suggestedTime: {             // Timing guidelines
    min: number;              // seconds
    max: number;
  };
  followUpQuestions: string[]; // 2-3 follow-up prompts
  sampleAnswer?: string;       // Optional example answer outline
  tags: string[];
}
```

## Validation Rules

### Prompt Quality
- Clear, specific question
- Ambiguous enough to allow discussion
- Not too broad (can't cover in 30 seconds)
- Not too narrow (not a trivia question)

### Timing Guidelines

| Type | Easy | Medium | Hard |
|------|------|--------|------|
| technical | 60-90s | 90-180s | 180-300s |
| behavioral | 60-120s | 120-180s | 180-240s |

### Follow-up Questions
- Should extend the main topic
- Allow deeper exploration
- Shouldn't have obvious answers
- 2-3 per session

### Key Points
- 3-5 essential points to mention
- Each point should take ~15-30 seconds to explain
- Should cover different aspects of the topic

## Generation Prompt Template

```
Create {count} voice practice session(s) for {channel} at {difficulty} level.

Type: {type or 'technical'}

Requirements:
- Prompt: Clear question to answer verbally
- Key Points: 3-5 essential points to cover
- Suggested Time: {timing based on difficulty}
- Follow-up Questions: 2-3 extensions
- Sample Answer: Optional outline

Voice Practice Best Practices:
- Questions should be discussion-oriented
- Should allow 2-5 minutes of speaking
- Follow-ups should explore edge cases or tradeoffs

Return as JSON matching the VoiceSession structure.
```

## Quality Gates

Before returning, verify:
- [ ] Prompt is clear and specific
- [ ] Timing matches difficulty
- [ ] 3-5 key points listed
- [ ] 2-3 follow-up questions
- [ ] Key points cover different aspects
- [ ] Tags include channel

## Related Skills

- Use `content-question-expert` for related questions
- Use `content-challenge-expert` for coding voice sessions
- Use `pipeline-processor` for session storage
