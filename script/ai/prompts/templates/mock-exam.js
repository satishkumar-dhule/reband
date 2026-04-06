/**
 * Mock Exam Generation Prompt Template
 * Generates structured mock exams with timed sessions, question pools, and scoring
 */

import { jsonOutputRule, markdownFormattingRules } from './base.js';

export const schema = {
  id: "exam-xxx-001",
  title: "Mock AWS Solutions Architect Practice Exam",
  description: "Full-length practice exam simulating the real certification test",
  certificationId: "aws-saa",
  difficulty: "intermediate",
  questionCount: 65,
  timeLimit: 130,
  passingScore: 72,
  domains: [
    { id: "design-secure", name: "Design Secure Architectures", weight: 30, questionCount: 20 },
    { id: "design-resilient", name: "Design Resilient Architectures", weight: 26, questionCount: 17 },
    { id: "design-performant", name: "Design High-Performing Architectures", weight: 24, questionCount: 16 },
    { id: "design-cost", name: "Design Cost-Optimized Architectures", weight: 20, questionCount: 13 }
  ],
  instructions: "Read each question carefully. Select the best answer. You have 130 minutes to complete this exam.",
  questionPool: [],
  metadata: {
    examType: "full-length",
    randomizationSeed: null,
    createdBy: "ai-generator"
  }
};

export const examTypes = {
  'quick': {
    name: 'Quick Practice',
    questionCount: 10,
    timeLimit: 15,
    description: 'Fast 10-question practice session'
  },
  'domain-focused': {
    name: 'Domain Focus',
    questionCount: 15,
    timeLimit: 25,
    description: 'Deep dive into a specific exam domain'
  },
  'mixed': {
    name: 'Mixed Topics',
    questionCount: 25,
    timeLimit: 40,
    description: 'Random mix of questions across all domains'
  },
  'full-length': {
    name: 'Full-Length Exam',
    questionCount: 65,
    timeLimit: 130,
    description: 'Complete certification exam simulation'
  },
  'challenge': {
    name: 'Challenge Mode',
    questionCount: 30,
    timeLimit: 45,
    description: 'Timed challenge with higher difficulty'
  }
};

export const guidelines = [
  'Generate realistic exam-style questions that mirror actual certification tests',
  'Questions should test practical knowledge and decision-making skills',
  'Use scenario-based questions for intermediate and advanced exams',
  'Balance difficulty across all domains according to official weights',
  'Include detailed explanations for all answer options',
  'Add time pressure context where appropriate',
  'Include real-world AWS/GCP/K8s scenarios for cloud certifications',
  'Questions should require analysis, not just recall'
];

export const instructions = `## Exam Instructions

1. Read each question carefully before selecting your answer
2. All questions have exactly ONE correct answer
3. You cannot skip questions or return to them later (simulated mode)
4. Your score is calculated based on correct answers only
5. A passing score is required to pass the exam
6. Time remaining is displayed throughout the exam

## Exam Format

- Multiple choice questions (single answer)
- Scenario-based questions with business context
- Diagram/architecture analysis questions
- Best practice and optimization questions
- Trouble-shooting and debugging scenarios`;

export function build(context) {
  const { certificationId, examType = 'full-length', difficulty, questionCount, domain, count = 1 } = context;
  
  const typeConfig = examTypes[examType] || examTypes['full-length'];
  const targetCount = questionCount || typeConfig.questionCount;
  const targetTime = context.timeLimit || typeConfig.timeLimit;
  
  return `You are an expert certification exam designer. Generate ${count} realistic mock exam(s).

CERTIFICATION: ${certificationId.toUpperCase()}
EXAM TYPE: ${typeConfig.name}
DIFFICULTY: ${difficulty || 'intermediate'}
QUESTION COUNT: ${targetCount}
TIME LIMIT: ${targetTime} minutes

${examType === 'domain-focused' && domain ? `FOCUS DOMAIN: ${domain}` : ''}

STRUCTURE YOUR EXAM:
1. Title and description
2. Exam metadata (certification, difficulty, question count, time limit)
3. Domain breakdown with weights
4. Standardized instructions
5. Question pool with ${targetCount} questions

EXAM REQUIREMENTS:
- Generate ${targetCount} high-quality questions
- Each question has exactly 4 options with ONE correct answer
- Mix of difficulty levels (Easy 20%, Medium 50%, Hard 30%)
- Questions should be scenario-based and test practical skills
- Include detailed explanations for all options
- Add tags and references to relevant documentation

${instructions}

${markdownFormattingRules}

Return a JSON array of exam objects:
${JSON.stringify([schema], null, 2)}

GUIDELINES:
${guidelines.map(g => `- ${g}`).join('\n')}

${jsonOutputRule}`;
}

export default { schema, examTypes, guidelines, instructions, build };
