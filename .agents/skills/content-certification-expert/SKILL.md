---
name: content-certification-expert
description: Generate certification exam MCQ questions for DevPrep. Use when creating AWS, GCP, Kubernetes, Terraform, and other certification exam questions. Includes domain alignment, explanation quality, and distractor validity.
---

# Content Certification Expert

Specialized skill for generating certification exam questions with proper domain coverage and educational explanations.

## Supported Certifications

- AWS Solutions Architect Associate (SAA)
- AWS Solutions Architect Professional (SAP)
- AWS Developer Associate
- CKA (Certified Kubernetes Administrator)
- CKAD (Certified Kubernetes Application Developer)
- Terraform Associate
- GCP Professional Cloud Architect
- CompTIA Security+

## Generation Parameters

```typescript
interface CertificationGenerationParams {
  certificationId: string;    // aws-saa, cka, terraform-associate, etc.
  domain?: string;            // Specific domain within certification
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
}
```

## Required Output Structure

```typescript
interface CertificationQuestion {
  id: string;
  certificationId: string;
  domain: string;
  question: string;            // Clear, scenario-based question
  options: {
    id: string;               // a, b, c, d
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;       // Why correct answer is correct
  distractors: {             // Why each wrong answer is wrong
    optionId: string;
    reason: string;
  }[];
  difficulty: string;
  tags: string[];
  references?: string[];      // Official documentation links
}
```

## Validation Rules

### Question Quality
- Scenario-based, not trivia
- Clear, unambiguous language
- Single correct answer
- All options plausible

### Option Balance
- All options similar length (within 20%)
- Correct answer NOT noticeably longer
- No "All of the above", "None of the above", "Both A and B"
- No absolute terms ("always", "never", "must") in incorrect options

### Domain Coverage
Each certification should cover its official domains:

| Certification | Domains |
|--------------|---------|
| AWS SAA | Design Resilient Architectures, Design High-Performing Architectures, etc. |
| CKA | Cluster Architecture, Workloads & Scheduling, etc. |
| Terraform | Infrastructure as Code, Module, etc. |

### Explanation Quality
- Explains WHY the correct answer is correct
- Each distractor has a specific reason why it's wrong
- References official documentation where applicable
- Educational, not just "because it's right"

## Generation Prompt Template

```
Create {count} certification exam question(s) for {certificationId}.

Domain: {domain or 'all domains'}
Difficulty: {difficulty or 'mixed'}

Requirements:
- Question: Scenario-based, test practical knowledge
- Options: Exactly 4 options, similar length, single correct answer
- Explanation: Educational, explains correct answer + each distractor
- References: Official AWS/K8s/Terraform documentation links
- Difficulty: Matches certification standards

IMPORTANT:
- No "All of the above", "None of the above", "Both A and B"
- Options should be similar in detail and length
- Questions should test understanding, not memorization

Return as JSON matching the CertificationQuestion structure.
```

## Quality Gates

Before returning, verify:
- [ ] Exactly 4 options
- [ ] Single correct answer
- [ ] Options similar length (within 20%)
- [ ] No invalid option types
- [ ] Explanation covers all options
- [ ] Domain alignment correct
- [ ] Difficulty matches certification standard

## Related Skills

- Use `content-question-expert` for interview questions
- Use `content-challenge-expert` for coding challenges
- Use `pipeline-verifier` for validation
