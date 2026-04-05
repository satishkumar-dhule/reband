// Lean channel manifest - only fields needed for navigation/sidebar
// Split from channels-config.ts to reduce initial bundle size
// 66 channels + 17 certifications = 83 total

import type { CategoryConfig } from './channels-types';

// Minimal channel data for sidebar and navigation - NO descriptions, NO question counts
export interface ChannelManifest {
  id: string;
  name: string;
  icon: string;
  category: string;
}

// 66 question channels + certification track
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

  // Algorithms & Data
  { id: 'algorithms', name: 'Algorithms', icon: 'terminal', category: 'algorithms' },
  { id: 'graphs', name: 'Graphs', icon: 'git-branch', category: 'fundamentals' },
  { id: 'trees', name: 'Trees', icon: 'git-branch', category: 'fundamentals' },
  { id: 'heaps', name: 'Heaps', icon: 'layers', category: 'fundamentals' },
  { id: 'sorting', name: 'Sorting Algorithms', icon: 'arrow-up-down', category: 'algorithms' },
  { id: 'searching', name: 'Searching Algorithms', icon: 'search', category: 'algorithms' },

  // Engineering
  { id: 'system-design', name: 'System Design', icon: 'server', category: 'engineering' },
  { id: 'distributed-systems', name: 'Distributed Systems', icon: 'globe', category: 'engineering' },
  { id: 'frontend', name: 'Frontend', icon: 'layout', category: 'engineering' },
  { id: 'backend', name: 'Backend', icon: 'server', category: 'engineering' },
  { id: 'api-design', name: 'API Design', icon: 'plug', category: 'engineering' },
  { id: 'authentication', name: 'Authentication', icon: 'key', category: 'security' },
  { id: 'microservices', name: 'Microservices', icon: 'boxes', category: 'engineering' },
  { id: 'database', name: 'Database', icon: 'database', category: 'engineering' },
  { id: 'sql', name: 'SQL', icon: 'table', category: 'engineering' },
  { id: 'nosql', name: 'NoSQL', icon: 'database', category: 'engineering' },

  // Programming Languages
  { id: 'javascript', name: 'JavaScript', icon: 'code', category: 'languages' },
  { id: 'typescript', name: 'TypeScript', icon: 'code', category: 'languages' },
  { id: 'python', name: 'Python', icon: 'code', category: 'languages' },
  { id: 'nodejs', name: 'Node.js', icon: 'server', category: 'languages' },
  { id: 'react', name: 'React', icon: 'layout', category: 'frameworks' },

  // DevOps & Cloud
  { id: 'devops', name: 'DevOps', icon: 'infinity', category: 'cloud' },
  { id: 'ci-cd', name: 'CI/CD', icon: 'git-branch', category: 'cloud' },
  { id: 'containers', name: 'Containers', icon: 'box', category: 'cloud' },
  { id: 'sre', name: 'SRE', icon: 'activity', category: 'cloud' },
  { id: 'kubernetes', name: 'Kubernetes', icon: 'box', category: 'cloud' },
  { id: 'aws', name: 'AWS', icon: 'cloud', category: 'cloud' },
  { id: 'gcp', name: 'GCP', icon: 'cloud', category: 'cloud' },
  { id: 'azure', name: 'Azure', icon: 'cloud', category: 'cloud' },
  { id: 'terraform', name: 'Terraform', icon: 'layers', category: 'cloud' },
  { id: 'monitoring', name: 'Monitoring', icon: 'activity', category: 'cloud' },
  { id: 'caching', name: 'Caching', icon: 'zap', category: 'cloud' },

  // Data & AI
  { id: 'data-engineering', name: 'Data Engineering', icon: 'workflow', category: 'data' },
  { id: 'machine-learning', name: 'Machine Learning', icon: 'brain', category: 'ai' },
  { id: 'supervised-learning', name: 'Supervised Learning', icon: 'brain', category: 'ai' },
  { id: 'neural-networks', name: 'Neural Networks', icon: 'brain', category: 'ai' },
  { id: 'ensemble-methods', name: 'Ensemble Methods', icon: 'users', category: 'ai' },
  { id: 'generative-ai', name: 'Generative AI', icon: 'sparkles', category: 'ai' },
  { id: 'llms', name: 'LLMs', icon: 'message-square', category: 'ai' },
  { id: 'prompt-engineering', name: 'Prompt Engineering', icon: 'message-circle', category: 'ai' },
  { id: 'llm-ops', name: 'LLMOps', icon: 'server', category: 'ai' },
  { id: 'computer-vision', name: 'Computer Vision', icon: 'eye', category: 'ai' },
  { id: 'nlp', name: 'NLP', icon: 'file-text', category: 'ai' },

  // Security
  { id: 'security', name: 'Security', icon: 'shield', category: 'security' },

  // Operating Systems & Infrastructure
  { id: 'networking', name: 'Networking', icon: 'network', category: 'infrastructure' },
  { id: 'operating-systems', name: 'Operating Systems', icon: 'monitor', category: 'infrastructure' },
  { id: 'linux', name: 'Linux', icon: 'terminal', category: 'infrastructure' },
  { id: 'unix', name: 'Unix', icon: 'terminal', category: 'infrastructure' },

  // Mobile
  { id: 'ios', name: 'iOS', icon: 'smartphone', category: 'mobile' },
  { id: 'android', name: 'Android', icon: 'smartphone', category: 'mobile' },
  { id: 'react-native', name: 'React Native', icon: 'smartphone', category: 'mobile' },

  // Testing
  { id: 'testing', name: 'Testing', icon: 'check-circle', category: 'testing' },
  { id: 'e2e-testing', name: 'E2E Testing', icon: 'monitor', category: 'testing' },
  { id: 'api-testing', name: 'API Testing', icon: 'zap', category: 'testing' },
  { id: 'performance-testing', name: 'Performance Testing', icon: 'gauge', category: 'testing' },

  // Management & Behavioral
  { id: 'engineering-management', name: 'Engineering Management', icon: 'users', category: 'management' },
  { id: 'behavioral', name: 'Behavioral', icon: 'message-circle', category: 'management' },

  // Certifications
  { id: 'certifications', name: 'Certifications', icon: 'award', category: 'certifications' },
];

// Categories for navigation
export const categoriesManifest: CategoryConfig[] = [
  { id: 'fundamentals', name: 'CS Fundamentals', icon: 'book-open' },
  { id: 'algorithms', name: 'Algorithms', icon: 'terminal' },
  { id: 'engineering', name: 'Engineering', icon: 'code' },
  { id: 'languages', name: 'Languages', icon: 'code' },
  { id: 'frameworks', name: 'Frameworks', icon: 'layout' },
  { id: 'cloud', name: 'Cloud & DevOps', icon: 'cloud' },
  { id: 'data', name: 'Data', icon: 'database' },
  { id: 'ai', name: 'AI & ML', icon: 'brain' },
  { id: 'security', name: 'Security', icon: 'shield' },
  { id: 'infrastructure', name: 'Infrastructure', icon: 'server' },
  { id: 'mobile', name: 'Mobile', icon: 'smartphone' },
  { id: 'testing', name: 'Testing & QA', icon: 'check-circle' },
  { id: 'management', name: 'Management', icon: 'users' },
  { id: 'certifications', name: 'Certifications', icon: 'award' },
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
  const roleCategories: Record<string, string[]> = {
    frontend: ['engineering', 'frameworks', 'fundamentals'],
    backend: ['engineering', 'cloud', 'languages'],
    fullstack: ['engineering', 'cloud', 'frameworks', 'fundamentals'],
    mobile: ['mobile', 'engineering'],
    devops: ['cloud', 'containers', 'ci-cd'],
    sre: ['cloud', 'monitoring'],
    'data-engineer': ['data', 'engineering', 'python'],
    'ml-engineer': ['ai', 'data', 'python'],
    'ai-engineer': ['ai', 'python'],
    'data-scientist': ['ai', 'data'],
    security: ['security', 'cloud', 'authentication'],
    architect: ['engineering', 'distributed-systems', 'cloud'],
    manager: ['management'],
    platform: ['cloud', 'engineering'],
    qa: ['testing'],
    sdet: ['testing', 'engineering'],
  };

  const categories = roleCategories[roleId] || ['engineering'];
  return channelsManifest.filter(c => categories.includes(c.category));
}
