// Lean channel configuration with lazy-loaded certification data
// Split to reduce initial bundle size - certifications loaded on demand

import type { ChannelConfig, RoleConfig, CategoryConfig } from './channels-types';
import { certificationChannels, getCertificationChannels, getCertificationsByProvider } from './channels-certifications';

// ==========================================
// CHANNEL ID TO NAME MAPPING (for display)
// ==========================================
export function getChannelName(channelId: string): string {
  const channel = allChannelsConfig.find(ch => ch.id === channelId);
  return channel?.name ?? channelId;
}

export function getChannelNames(channelIds: string[]): string[] {
  return channelIds.map(id => getChannelName(id));
}

// ==========================================
// CORE CHANNELS (always loaded - used frequently)
// ==========================================
export const allChannelsConfig: ChannelConfig[] = [
  // CS Fundamentals
  { id: 'data-structures', name: 'Data Structures', description: 'Arrays, linked lists, stacks, queues, trees & hash tables', icon: 'boxes', color: 'text-emerald-500', category: 'fundamentals', roles: ['backend', 'fullstack', 'frontend', 'mobile', 'data-engineer', 'ml-engineer'] },
  { id: 'complexity-analysis', name: 'Complexity Analysis', description: 'Big-O notation, time & space complexity', icon: 'chart-line', color: 'text-blue-500', category: 'fundamentals', roles: ['backend', 'fullstack', 'frontend', 'mobile', 'data-engineer', 'ml-engineer'] },
  { id: 'dynamic-programming', name: 'Dynamic Programming', description: 'Recursion, memoization, tabulation', icon: 'git-branch', color: 'text-violet-500', category: 'fundamentals', roles: ['backend', 'fullstack', 'frontend', 'mobile', 'data-engineer', 'ml-engineer'] },
  { id: 'bit-manipulation', name: 'Bit Manipulation', description: 'Bitwise operations, binary math', icon: 'binary', color: 'text-cyan-500', category: 'fundamentals', roles: ['backend', 'fullstack', 'mobile', 'security'] },
  { id: 'design-patterns', name: 'Design Patterns', description: 'Creational, structural, behavioral patterns', icon: 'puzzle', color: 'text-amber-500', category: 'fundamentals', roles: ['backend', 'fullstack', 'frontend', 'mobile', 'architect'] },
  { id: 'concurrency', name: 'Concurrency', description: 'Threads, locks, parallelism', icon: 'git-merge', color: 'text-rose-500', category: 'fundamentals', roles: ['backend', 'fullstack', 'sre', 'platform', 'mobile'] },
  { id: 'math-logic', name: 'Math & Logic', description: 'Combinatorics, probability, number theory', icon: 'calculator', color: 'text-indigo-500', category: 'fundamentals', roles: ['backend', 'data-scientist', 'ml-engineer', 'data-engineer'] },
  { id: 'low-level', name: 'Low-Level Programming', description: 'Memory management, compilers, CPU', icon: 'cpu', color: 'text-slate-500', category: 'fundamentals', roles: ['backend', 'sre', 'platform', 'security'] },

  // Engineering
  { id: 'system-design', name: 'System Design', description: 'Scalable architecture patterns', icon: 'cpu', color: 'text-cyan-500', category: 'engineering', roles: ['backend', 'fullstack', 'architect', 'sre', 'devops'] },
  { id: 'algorithms', name: 'Algorithms', description: 'Data structures, sorting, searching', icon: 'terminal', color: 'text-green-500', category: 'engineering', roles: ['backend', 'fullstack', 'frontend', 'mobile', 'data-engineer'] },
  { id: 'frontend', name: 'Frontend', description: 'React, Vue, CSS, Performance', icon: 'layout', color: 'text-purple-500', category: 'engineering', roles: ['frontend', 'fullstack', 'mobile'] },
  { id: 'backend', name: 'Backend', description: 'APIs, microservices, caching', icon: 'server', color: 'text-blue-500', category: 'engineering', roles: ['backend', 'fullstack', 'architect'] },
  { id: 'database', name: 'Database', description: 'SQL, NoSQL, indexing', icon: 'database', color: 'text-yellow-500', category: 'engineering', roles: ['backend', 'fullstack', 'data-engineer', 'dba'] },

  // DevOps & Cloud
  { id: 'devops', name: 'DevOps', description: 'CI/CD, automation, containers', icon: 'infinity', color: 'text-orange-500', category: 'cloud', roles: ['devops', 'sre', 'backend', 'platform'] },
  { id: 'sre', name: 'SRE', description: 'Reliability, monitoring, incident response', icon: 'activity', color: 'text-red-500', category: 'cloud', roles: ['sre', 'devops', 'platform'] },
  { id: 'kubernetes', name: 'Kubernetes', description: 'Container orchestration', icon: 'box', color: 'text-blue-400', category: 'cloud', roles: ['devops', 'sre', 'platform', 'backend'] },
  { id: 'aws', name: 'AWS', description: 'EC2, S3, Lambda, RDS', icon: 'cloud', color: 'text-orange-400', category: 'cloud', roles: ['devops', 'sre', 'backend', 'architect', 'platform'] },
  { id: 'terraform', name: 'Terraform', description: 'Infrastructure as Code', icon: 'layers', color: 'text-purple-400', category: 'cloud', roles: ['devops', 'sre', 'platform'] },

  // Data & AI
  { id: 'data-engineering', name: 'Data Engineering', description: 'ETL, data pipelines', icon: 'workflow', color: 'text-teal-500', category: 'data', roles: ['data-engineer', 'backend', 'ml-engineer'] },
  { id: 'machine-learning', name: 'Machine Learning', description: 'ML algorithms, model training', icon: 'brain', color: 'text-pink-500', category: 'ai', roles: ['ml-engineer', 'data-scientist', 'ai-engineer'] },
  { id: 'generative-ai', name: 'Generative AI', description: 'LLMs, RAG, fine-tuning', icon: 'sparkles', color: 'text-violet-500', category: 'ai', roles: ['ai-engineer', 'ml-engineer', 'fullstack', 'backend'] },
  { id: 'prompt-engineering', name: 'Prompt Engineering', description: 'Prompt design, optimization', icon: 'message-circle', color: 'text-cyan-400', category: 'ai', roles: ['ai-engineer', 'ml-engineer', 'fullstack', 'product'] },
  { id: 'llm-ops', name: 'LLMOps', description: 'LLM deployment, optimization', icon: 'server', color: 'text-orange-400', category: 'ai', roles: ['ai-engineer', 'ml-engineer', 'devops', 'sre'] },
  { id: 'computer-vision', name: 'Computer Vision', description: 'Image classification, object detection', icon: 'eye', color: 'text-blue-400', category: 'ai', roles: ['ml-engineer', 'ai-engineer', 'data-scientist'] },
  { id: 'nlp', name: 'NLP', description: 'Text processing, embeddings', icon: 'file-text', color: 'text-emerald-400', category: 'ai', roles: ['ml-engineer', 'ai-engineer', 'data-scientist'] },
  { id: 'python', name: 'Python', description: 'Python fundamentals, libraries', icon: 'code', color: 'text-yellow-400', category: 'engineering', roles: ['backend', 'data-engineer', 'ml-engineer', 'data-scientist'] },

  // Security & Ops
  { id: 'security', name: 'Security', description: 'Application security, OWASP', icon: 'shield', color: 'text-red-400', category: 'security', roles: ['security', 'backend', 'fullstack', 'devops'] },
  { id: 'networking', name: 'Networking', description: 'TCP/IP, DNS, load balancing', icon: 'network', color: 'text-indigo-500', category: 'engineering', roles: ['sre', 'devops', 'security', 'backend'] },
  { id: 'operating-systems', name: 'Operating Systems', description: 'OS concepts, processes', icon: 'monitor', color: 'text-slate-500', category: 'engineering', roles: ['backend', 'sre', 'devops', 'security', 'platform'] },
  { id: 'linux', name: 'Linux', description: 'Linux administration, shell scripting', icon: 'terminal', color: 'text-yellow-600', category: 'engineering', roles: ['backend', 'sre', 'devops', 'security', 'platform', 'data-engineer'] },
  { id: 'unix', name: 'Unix', description: 'Unix fundamentals, commands', icon: 'terminal', color: 'text-gray-500', category: 'engineering', roles: ['backend', 'sre', 'devops', 'security', 'platform'] },

  // Mobile
  { id: 'ios', name: 'iOS', description: 'Swift, UIKit, SwiftUI', icon: 'smartphone', color: 'text-gray-400', category: 'mobile', roles: ['mobile', 'ios'] },
  { id: 'android', name: 'Android', description: 'Kotlin, Jetpack Compose', icon: 'smartphone', color: 'text-green-400', category: 'mobile', roles: ['mobile', 'android'] },
  { id: 'react-native', name: 'React Native', description: 'Cross-platform mobile', icon: 'smartphone', color: 'text-cyan-400', category: 'mobile', roles: ['mobile', 'frontend', 'fullstack'] },

  // Testing
  { id: 'testing', name: 'Testing', description: 'Unit testing, integration testing', icon: 'check-circle', color: 'text-green-500', category: 'testing', roles: ['frontend', 'backend', 'fullstack', 'mobile', 'qa'] },
  { id: 'e2e-testing', name: 'E2E Testing', description: 'Playwright, Cypress', icon: 'monitor', color: 'text-purple-500', category: 'testing', roles: ['frontend', 'fullstack', 'qa', 'sdet'] },
  { id: 'api-testing', name: 'API Testing', description: 'REST API testing, contract testing', icon: 'zap', color: 'text-yellow-500', category: 'testing', roles: ['backend', 'fullstack', 'qa', 'sdet'] },
  { id: 'performance-testing', name: 'Performance Testing', description: 'Load testing, stress testing', icon: 'gauge', color: 'text-orange-500', category: 'testing', roles: ['sre', 'backend', 'qa', 'sdet', 'devops'] },

  // Management
  { id: 'engineering-management', name: 'Engineering Management', description: 'Team leadership, 1:1s', icon: 'users', color: 'text-amber-500', category: 'management', roles: ['manager', 'tech-lead', 'architect'] },
  { id: 'behavioral', name: 'Behavioral', description: 'STAR method, leadership principles', icon: 'message-circle', color: 'text-emerald-500', category: 'management', roles: ['all'] },
];

// User roles
export const rolesConfig: RoleConfig[] = [
  { id: 'frontend', name: 'Frontend Engineer', description: 'React, Vue, CSS', icon: 'layout' },
  { id: 'backend', name: 'Backend Engineer', description: 'APIs, Databases', icon: 'server' },
  { id: 'fullstack', name: 'Full Stack Engineer', description: 'End-to-end development', icon: 'layers' },
  { id: 'mobile', name: 'Mobile Engineer', description: 'iOS, Android', icon: 'smartphone' },
  { id: 'devops', name: 'DevOps Engineer', description: 'CI/CD, Infrastructure', icon: 'infinity' },
  { id: 'sre', name: 'Site Reliability Engineer', description: 'Reliability, Monitoring', icon: 'activity' },
  { id: 'data-engineer', name: 'Data Engineer', description: 'ETL, Data Pipelines', icon: 'workflow' },
  { id: 'ml-engineer', name: 'ML Engineer', description: 'Machine Learning', icon: 'brain' },
  { id: 'ai-engineer', name: 'AI Engineer', description: 'GenAI, LLMs', icon: 'sparkles' },
  { id: 'data-scientist', name: 'Data Scientist', description: 'ML, Statistics', icon: 'chart' },
  { id: 'security', name: 'Security Engineer', description: 'AppSec, Compliance', icon: 'shield' },
  { id: 'architect', name: 'Solutions Architect', description: 'System Design', icon: 'cpu' },
  { id: 'manager', name: 'Engineering Manager', description: 'Team Leadership', icon: 'users' },
  { id: 'platform', name: 'Platform Engineer', description: 'Developer Experience', icon: 'box' },
  { id: 'qa', name: 'QA Engineer', description: 'Testing, Quality', icon: 'check-circle' },
  { id: 'sdet', name: 'SDET', description: 'Test Automation', icon: 'code' }
];

// Categories
export const categories: CategoryConfig[] = [
  { id: 'fundamentals', name: 'CS Fundamentals', icon: 'book-open' },
  { id: 'engineering', name: 'Engineering', icon: 'code' },
  { id: 'cloud', name: 'Cloud & DevOps', icon: 'cloud' },
  { id: 'data', name: 'Data', icon: 'database' },
  { id: 'ai', name: 'AI & ML', icon: 'brain' },
  { id: 'testing', name: 'Testing & QA', icon: 'check-circle' },
  { id: 'security', name: 'Security', icon: 'shield' },
  { id: 'mobile', name: 'Mobile', icon: 'smartphone' },
  { id: 'management', name: 'Management', icon: 'users' },
  { id: 'certification', name: 'Certifications', icon: 'award' }
];

// ==========================================
// HELPER FUNCTIONS (inline to avoid extra imports)
// ==========================================

// Get recommended channels for a role
export function getRecommendedChannels(roleId: string): ChannelConfig[] {
  return allChannelsConfig.filter(
    channel => channel.roles.includes(roleId) || channel.roles.includes('all')
  );
}

// Get channels by category
export function getChannelsByCategory(category: string): ChannelConfig[] {
  return allChannelsConfig.filter(channel => channel.category === category);
}

// Get all channels including certifications (lazy loaded)
// This function dynamically combines core + certification channels
export function getAllChannelsWithCertifications(): ChannelConfig[] {
  return [...allChannelsConfig, ...certificationChannels];
}

// Get certification channels (lazy loaded)
export { getCertificationChannels, getCertificationsByProvider };

// Re-export types
export type { ChannelConfig, RoleConfig, CategoryConfig };
