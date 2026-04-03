// Lean channel manifest - only fields needed for navigation/sidebar
// Split from channels-config.ts to reduce initial bundle size

import type { CategoryConfig } from './channels-types';

// Minimal channel data for sidebar and navigation - NO descriptions, NO question counts
export interface ChannelManifest {
  id: string;
  name: string;
  icon: string;
  category: string;
}

// Core channels only (no certifications) - ~50 channels
export const channelsManifest: ChannelManifest[] = [
  // CS Fundamentals
  { id: 'data-structures', name: 'Data Structures', icon: 'boxes', category: 'fundamentals' },
  { id: 'complexity-analysis', name: 'Complexity Analysis', icon: 'chart-line', category: 'fundamentals' },
  { id: 'dynamic-programming', name: 'Dynamic Programming', icon: 'git-branch', category: 'fundamentals' },
  { id: 'bit-manipulation', name: 'Bit Manipulation', icon: 'binary', category: 'fundamentals' },
  { id: 'design-patterns', name: 'Design Patterns', icon: 'puzzle', category: 'fundamentals' },
  { id: 'concurrency', name: 'Concurrency', icon: 'git-merge', category: 'fundamentals' },
  { id: 'math-logic', name: 'Math & Logic', icon: 'calculator', category: 'fundamentals' },
  { id: 'low-level', name: 'Low-Level Programming', icon: 'cpu', category: 'fundamentals' },

  // Engineering
  { id: 'system-design', name: 'System Design', icon: 'cpu', category: 'engineering' },
  { id: 'algorithms', name: 'Algorithms', icon: 'terminal', category: 'engineering' },
  { id: 'frontend', name: 'Frontend', icon: 'layout', category: 'engineering' },
  { id: 'backend', name: 'Backend', icon: 'server', category: 'engineering' },
  { id: 'database', name: 'Database', icon: 'database', category: 'engineering' },

  // DevOps & Cloud
  { id: 'devops', name: 'DevOps', icon: 'infinity', category: 'cloud' },
  { id: 'sre', name: 'SRE', icon: 'activity', category: 'cloud' },
  { id: 'kubernetes', name: 'Kubernetes', icon: 'box', category: 'cloud' },
  { id: 'aws', name: 'AWS', icon: 'cloud', category: 'cloud' },
  { id: 'terraform', name: 'Terraform', icon: 'layers', category: 'cloud' },

  // Data & AI
  { id: 'data-engineering', name: 'Data Engineering', icon: 'workflow', category: 'data' },
  { id: 'machine-learning', name: 'Machine Learning', icon: 'brain', category: 'ai' },
  { id: 'generative-ai', name: 'Generative AI', icon: 'sparkles', category: 'ai' },
  { id: 'prompt-engineering', name: 'Prompt Engineering', icon: 'message-circle', category: 'ai' },
  { id: 'llm-ops', name: 'LLMOps', icon: 'server', category: 'ai' },
  { id: 'computer-vision', name: 'Computer Vision', icon: 'eye', category: 'ai' },
  { id: 'nlp', name: 'NLP', icon: 'file-text', category: 'ai' },
  { id: 'python', name: 'Python', icon: 'code', category: 'engineering' },

  // Security & Ops
  { id: 'security', name: 'Security', icon: 'shield', category: 'security' },
  { id: 'networking', name: 'Networking', icon: 'network', category: 'engineering' },
  { id: 'operating-systems', name: 'Operating Systems', icon: 'monitor', category: 'engineering' },
  { id: 'linux', name: 'Linux', icon: 'terminal', category: 'engineering' },
  { id: 'unix', name: 'Unix', icon: 'terminal', category: 'engineering' },

  // Mobile
  { id: 'ios', name: 'iOS', icon: 'smartphone', category: 'mobile' },
  { id: 'android', name: 'Android', icon: 'smartphone', category: 'mobile' },
  { id: 'react-native', name: 'React Native', icon: 'smartphone', category: 'mobile' },

  // Testing
  { id: 'testing', name: 'Testing', icon: 'check-circle', category: 'testing' },
  { id: 'e2e-testing', name: 'E2E Testing', icon: 'monitor', category: 'testing' },
  { id: 'api-testing', name: 'API Testing', icon: 'zap', category: 'testing' },
  { id: 'performance-testing', name: 'Performance Testing', icon: 'gauge', category: 'testing' },

  // Management
  { id: 'engineering-management', name: 'Engineering Management', icon: 'users', category: 'management' },
  { id: 'behavioral', name: 'Behavioral', icon: 'message-circle', category: 'management' },
];

// Categories for navigation (minimal version)
export const categoriesManifest: CategoryConfig[] = [
  { id: 'fundamentals', name: 'CS Fundamentals', icon: 'book-open' },
  { id: 'engineering', name: 'Engineering', icon: 'code' },
  { id: 'cloud', name: 'Cloud & DevOps', icon: 'cloud' },
  { id: 'data', name: 'Data', icon: 'database' },
  { id: 'ai', name: 'AI & ML', icon: 'brain' },
  { id: 'testing', name: 'Testing & QA', icon: 'check-circle' },
  { id: 'security', name: 'Security', icon: 'shield' },
  { id: 'mobile', name: 'Mobile', icon: 'smartphone' },
  { id: 'management', name: 'Management', icon: 'users' },
];

// Helper to get channel by ID
export function getChannelFromManifest(id: string): ChannelManifest | undefined {
  return channelsManifest.find(c => c.id === id);
}

// Helper to get channels by category
export function getChannelsByCategoryFromManifest(category: string): ChannelManifest[] {
  return channelsManifest.filter(c => c.category === category);
}

// Helper to get recommended channels for a role (lean version)
export function getRecommendedChannelsFromManifest(roleId: string): ChannelManifest[] {
  // Role to categories mapping
  const roleCategories: Record<string, string[]> = {
    frontend: ['engineering', 'fundamentals'],
    backend: ['engineering', 'cloud'],
    fullstack: ['engineering', 'cloud', 'fundamentals'],
    mobile: ['mobile', 'engineering'],
    devops: ['cloud', 'security'],
    sre: ['cloud', 'security'],
    'data-engineer': ['data', 'engineering'],
    'ml-engineer': ['ai', 'data'],
    'ai-engineer': ['ai'],
    'data-scientist': ['ai', 'data'],
    security: ['security', 'cloud'],
    architect: ['engineering', 'cloud'],
    manager: ['management'],
    platform: ['cloud', 'engineering'],
    qa: ['testing'],
    sdet: ['testing', 'engineering'],
  };

  const categories = roleCategories[roleId] || ['engineering'];
  return channelsManifest.filter(c => categories.includes(c.category));
}
