---
name: content-learning-path-expert
description: Generate structured learning paths for DevPrep. Use when creating company-specific, job-title-specific, skill-based, or certification-aligned interview preparation journeys. Includes milestone generation, question sequencing, and objective mapping.
---

# Content Learning Path Expert

Specialized skill for generating structured, opinionated learning paths that guide engineers through interview preparation.

## Path Types

| Type | Description | Examples |
|------|-------------|---------|
| `company` | Tailored for a specific company's interview style | Google, Amazon, Meta, Apple, Netflix |
| `job-title` | Role-specific preparation | Frontend Engineer, Backend Engineer, SRE, EM |
| `skill` | Deep-dive into one technical domain | Algorithms Mastery, System Design Pro |
| `certification` | Aligned to a certification exam | AWS SAA, CKA, Terraform Associate |

## Generation Parameters

```typescript
interface LearningPathParams {
  pathType: 'company' | 'job-title' | 'skill' | 'certification';
  target: string;             // Company name, job title, skill name, or cert ID
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  count?: number;             // Number of paths to generate
}
```

## Required Output Structure

```typescript
interface LearningPath {
  id: string;
  title: string;                  // e.g. "Google SWE Interview Prep"
  description: string;            // 2-3 sentences on what this path covers and who it's for
  pathType: 'company' | 'job-title' | 'skill' | 'certification';
  targetCompany?: string;         // e.g. "Google"
  targetJobTitle?: string;        // e.g. "frontend-engineer"
  difficulty: string;
  estimatedHours: number;         // Realistic hours (20-120)
  questionIds: string[];          // Ordered list of question IDs
  channels: string[];             // Channels covered: ["algorithms", "system-design"]
  tags: string[];                 // Searchable tags
  prerequisites: string[];        // IDs of prerequisite paths
  learningObjectives: string[];   // 4-6 concrete objectives
  milestones: {                   // 4-6 milestones
    title: string;
    description: string;
    completionPercent: number;    // 20, 40, 60, 80, 100
    questionCount: number;
  }[];
  metadata: {                     // Additional context
    focusAreas: string[];
    companiesTargeted?: string[];
    interviewRounds?: string[];
  };
}
```

## Validation Rules

### Path Quality
- Title: 3-6 words, specific and compelling
- Description: Says who it's for AND what they'll achieve
- Objectives: Concrete and measurable ("can implement", not "understand")
- At least 4 milestones with increasing completionPercent

### Question Ordering Strategy
- Beginner topics first, advanced last
- Each milestone should introduce new concepts
- Related topics grouped together (not random)

### Channel Coverage
| Path Type | Required Channels |
|-----------|------------------|
| company (FAANG) | algorithms, system-design, behavioral |
| job-title (Frontend) | frontend, javascript, algorithms |
| skill (algorithms) | algorithms, data-structures |
| certification (AWS) | aws, system-design, database |

### Difficulty per Path Type
- `company` paths: intermediate to advanced
- `job-title` paths: beginner to advanced (full spectrum)
- `skill` paths: deep focus on one domain
- `certification` paths: match cert difficulty

## Company Path Guidelines

### FAANG Companies
- **Google**: Heavy algorithms, system design (distributed), behavioral (leadership principles)
- **Amazon**: Leadership Principles (14 LPs), system design (scale), behavioral stories
- **Meta**: Product sense, algorithms, system design (social graph)
- **Apple**: Quality focus, system design (consumer products), Swift/iOS (for mobile roles)
- **Netflix**: Systems at scale, culture fit, senior-level system design

### Non-FAANG Companies
- **Stripe**: API design, distributed payments, reliability
- **Airbnb**: Product thinking, full-stack, data modeling
- **Uber**: Geo-distributed systems, real-time, mobile
