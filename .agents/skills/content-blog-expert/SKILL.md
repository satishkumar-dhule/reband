---
name: content-blog-expert
description: Generate blog posts for DevPrep. Use when creating educational content, tutorials, and articles. Includes SEO optimization, readability scoring, and internal linking strategies.
---

# Content Blog Expert

Specialized skill for generating blog posts with SEO optimization and educational structure.

## Generation Parameters

```typescript
interface BlogGenerationParams {
  topic: string;
  channel?: string;           // Related channel
  type?: 'tutorial' | 'guide' | 'explanation' | 'comparison';
  targetAudience?: 'beginner' | 'intermediate' | 'advanced';
  wordCount?: number;         // Target word count
  count?: number;
}
```

## Required Output Structure

```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;               // URL-friendly slug
  excerpt: string;            // 150-160 chars for SEO
  content: string;            // Full HTML/Markdown content
  type: string;
  channelId?: string;
  tags: string[];
  relatedQuestions?: string[]; // Links to related questions
  readingTime: number;        // Minutes
  difficulty: string;
  seo: {
    metaTitle: string;        // 50-60 chars
    metaDescription: string;  // 150-160 chars
    keywords: string[];
  };
}
```

## Validation Rules

### SEO Requirements
- Meta title: 50-60 characters
- Meta description: 150-160 characters
- Excerpt: 150-160 characters
- Keywords: 3-5 primary, 5-10 secondary

### Content Structure
- Clear headings (H2, H3)
- Introduction with hook
- Body with logical flow
- Conclusion with summary
- Code examples if applicable

### Readability
- Average sentence length: 15-20 words
- Paragraph length: 3-4 sentences
- Use active voice
- Avoid jargon without explanation

### Internal Linking
- Link to related questions
- Link to related flashcards
- Create content hub structure

## Generation Prompt Template

```
Create {count} blog post(s) about {topic}.

Type: {type or 'explanation'}
Audience: {audience or 'intermediate'}
Word Count: {wordCount or '800-1200'}

Requirements:
- Title: Clear, compelling, includes main keyword
- Meta: Title 50-60 chars, Description 150-160 chars
- Excerpt: 150-160 chars for previews
- Keywords: 3-5 primary, 5-10 secondary
- Content: Well-structured with headings, examples, code
- Related: Links to relevant questions/flashcards
- Reading Time: Calculate based on word count

SEO Best Practices:
- Include keyword in title and first paragraph
- Use headers naturally
- Add code examples for technical topics
- Include actionable takeaways

Return as JSON matching the BlogPost structure.
```

## Quality Gates

Before returning, verify:
- [ ] Meta title 50-60 characters
- [ ] Meta description 150-160 characters
- [ ] Excerpt 150-160 characters
- [ ] Keywords present (3-5 primary)
- [ ] Content has clear structure
- [ ] Code examples are valid
- [ ] Internal links present
- [ ] Reading time calculated

## Related Skills

- Use `content-question-expert` for related questions
- Use `content-flashcard-expert` for related cards
- Use `pipeline-processor` for publishing
