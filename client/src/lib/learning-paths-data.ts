/**
 * Shared Learning Paths Data
 * Extracted to avoid duplication between LearningPaths.tsx and MyPath.tsx
 */

import { Code, Server, Rocket, Target, Sparkles, Brain } from 'lucide-react';

export interface CuratedPath {
  id: string;
  name: string;
  icon: typeof Code;
  gradientFrom?: string;
  gradientTo?: string;
  gradientOpacity?: number;
  description: string;
  channels: string[];
  difficulty: 'Beginner' | 'Beginner Friendly' | 'Intermediate' | 'Advanced';
  duration: string;
  totalQuestions: number;
  skills: string[];
  jobs?: string[];
  salary?: string;
}

export const curatedPaths: CuratedPath[] = [
  {
    id: 'frontend',
    name: 'Frontend Developer',
    icon: Code,
    gradientFrom: 'var(--gh-accent-emphasis)',
    gradientTo: 'var(--gh-accent-emphasis)',
    gradientOpacity: 0.7,
    description: 'Master React, JavaScript, and modern web development',
    channels: ['frontend', 'react-native', 'javascript', 'algorithms'],
    difficulty: 'Beginner',
    duration: '3-6 months',
    totalQuestions: 450,
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
    jobs: ['Frontend Developer', 'React Developer', 'UI Engineer'],
    salary: '$80k - $120k'
  },
  {
    id: 'backend',
    name: 'Backend Engineer',
    icon: Server,
    gradientFrom: 'var(--gh-success-fg)',
    gradientTo: 'var(--gh-success-fg)',
    gradientOpacity: 0.7,
    description: 'Build scalable APIs and microservices',
    channels: ['backend', 'database', 'system-design', 'algorithms'],
    difficulty: 'Intermediate',
    duration: '4-8 months',
    totalQuestions: 520,
    skills: ['Node.js', 'Python', 'SQL', 'REST APIs', 'Microservices'],
    jobs: ['Backend Engineer', 'API Developer', 'Systems Engineer'],
    salary: '$90k - $140k'
  },
  {
    id: 'fullstack',
    name: 'Full Stack Developer',
    icon: Rocket,
    gradientFrom: 'var(--gh-done-fg)',
    gradientTo: 'var(--gh-danger-fg)',
    gradientOpacity: 0.7,
    description: 'End-to-end application development',
    channels: ['frontend', 'backend', 'database', 'devops', 'system-design'],
    difficulty: 'Advanced',
    duration: '6-12 months',
    totalQuestions: 680,
    skills: ['React', 'Node.js', 'SQL', 'AWS', 'System Design'],
    jobs: ['Full Stack Developer', 'Software Engineer', 'Tech Lead'],
    salary: '$100k - $160k'
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    icon: Target,
    gradientFrom: 'var(--gh-attention-fg)',
    gradientTo: 'var(--gh-danger-fg)',
    gradientOpacity: 0.7,
    description: 'Infrastructure, CI/CD, and cloud platforms',
    channels: ['devops', 'kubernetes', 'aws', 'terraform', 'docker'],
    difficulty: 'Advanced',
    duration: '4-8 months',
    totalQuestions: 420,
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
    jobs: ['DevOps Engineer', 'SRE', 'Cloud Engineer'],
    salary: '$110k - $170k'
  },
  {
    id: 'mobile',
    name: 'Mobile Developer',
    icon: Sparkles,
    gradientFrom: 'var(--gh-danger-fg)',
    gradientTo: 'var(--gh-danger-fg)',
    gradientOpacity: 0.7,
    description: 'iOS and Android app development',
    channels: ['react-native', 'ios', 'android', 'frontend'],
    difficulty: 'Intermediate',
    duration: '4-6 months',
    totalQuestions: 380,
    skills: ['React Native', 'Swift', 'Kotlin', 'Mobile UI', 'App Store'],
    jobs: ['Mobile Developer', 'iOS Developer', 'Android Developer'],
    salary: '$85k - $130k'
  },
  {
    id: 'data',
    name: 'Data Engineer',
    icon: Brain,
    gradientFrom: 'var(--gh-done-fg)',
    gradientTo: 'var(--gh-done-fg)',
    gradientOpacity: 0.7,
    description: 'Data pipelines, warehousing, and analytics',
    channels: ['data-engineering', 'database', 'python', 'aws'],
    difficulty: 'Advanced',
    duration: '6-10 months',
    totalQuestions: 490,
    skills: ['Python', 'SQL', 'Spark', 'Airflow', 'Data Modeling'],
    jobs: ['Data Engineer', 'Analytics Engineer', 'ML Engineer'],
    salary: '$95k - $150k'
  }
];
