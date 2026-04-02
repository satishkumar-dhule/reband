// 30 Specialized Agents Registry
// Each agent is autonomous and communicates via message passing

import { messageBus, Agent, createMessage, AgentMessage } from './AgentMessageBus';

// Agent configuration
interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  icon: string;
  color: string;
}

// 30 Pre-built Specialized Agents
export const AGENT_REGISTRY: AgentConfig[] = [
  // UI/UX Agents (1-5)
  { id: 'ui-ux-architect', name: 'UI/UX Architect', description: 'Designs beautiful user interfaces', capabilities: ['design', 'prototyping', 'wireframing'], icon: '🎨', color: '#6366f1' },
  { id: 'design-system-agent', name: 'Design System Agent', description: 'Manages component libraries', capabilities: ['components', 'theming', 'styling'], icon: '🖌️', color: '#8b5cf6' },
  { id: 'accessibility-agent', name: 'Accessibility Agent', description: 'Ensures WCAG compliance', capabilities: ['a11y', 'testing', 'compliance'], icon: '♿', color: '#10b981' },
  { id: 'animation-agent', name: 'Animation Agent', description: 'Creates smooth animations', capabilities: ['motion', 'transitions', 'micro-interactions'], icon: '✨', color: '#f59e0b' },
  { id: 'responsive-agent', name: 'Responsive Agent', description: 'Handles multi-device layouts', capabilities: ['mobile', 'tablet', 'desktop'], icon: '📱', color: '#ec4899' },
  
  // Database Agents (6-10)
  { id: 'db-architect', name: 'Database Architect', description: 'Designs database schemas', capabilities: ['schema', 'modeling', 'optimization'], icon: '🏗️', color: '#3b82f6' },
  { id: 'query-agent', name: 'Query Agent', description: 'Optimizes database queries', capabilities: ['sql', 'performance', 'indexing'], icon: '🔍', color: '#0ea5e9' },
  { id: 'migration-agent', name: 'Migration Agent', description: 'Handles data migrations', capabilities: ['migration', 'transform', 'backup'], icon: '🔄', color: '#14b8a6' },
  { id: 'backup-agent', name: 'Backup Agent', description: 'Manages data backups', capabilities: ['backup', 'restore', 'disaster-recovery'], icon: '💾', color: '#64748b' },
  { id: 'cache-agent', name: 'Cache Agent', description: 'Manages caching layer', capabilities: ['redis', 'cache', 'performance'], icon: '⚡', color: '#f97316' },
  
  // Google Services Agents (11-15)
  { id: 'google-analytics-agent', name: 'Google Analytics Agent', description: 'Tracks user analytics', capabilities: ['analytics', 'tracking', 'reporting'], icon: '📊', color: '#f9a8d4' },
  { id: 'google-auth-agent', name: 'Google Auth Agent', description: 'Handles OAuth/SSO', capabilities: ['auth', 'oauth', 'security'], icon: '🔐', color: '#4285f4' },
  { id: 'google-cloud-agent', name: 'Google Cloud Agent', description: 'Manages GCP resources', capabilities: ['gcp', 'cloud', 'deployment'], icon: '☁️', color: '#34a853' },
  { id: 'google-maps-agent', name: 'Google Maps Agent', description: 'Integrates maps/location', capabilities: ['maps', 'geolocation', 'directions'], icon: '🗺️', color: '#ea4335' },
  { id: 'google-sheets-agent', name: 'Google Sheets Agent', description: 'Manages spreadsheet data', capabilities: ['sheets', 'data', 'export'], icon: '📑', color: '#0f9d58' },
  
  // DevOps Agents (16-20)
  { id: 'ci-cd-agent', name: 'CI/CD Agent', description: 'Manages pipelines', capabilities: ['pipelines', 'deployment', 'automation'], icon: '🔄', color: '#06b6d4' },
  { id: 'docker-agent', name: 'Docker Agent', description: 'Manages containers', capabilities: ['containers', 'docker', 'orchestration'], icon: '🐳', color: '#2496ed' },
  { id: 'k8s-agent', name: 'Kubernetes Agent', description: 'Orchestrates clusters', capabilities: ['kubernetes', 'pods', 'services'], icon: '☸️', color: '#326ce5' },
  { id: 'monitoring-agent', name: 'Monitoring Agent', description: 'Tracks system health', capabilities: ['monitoring', 'alerts', 'metrics'], icon: '📈', color: '#ef4444' },
  { id: 'security-agent', name: 'Security Agent', description: 'Handles security scanning', capabilities: ['security', 'scanning', 'compliance'], icon: '🛡️', color: '#7c3aed' },
  
  // AI/ML Agents (21-25)
  { id: 'ai-assistant-agent', name: 'AI Assistant Agent', description: 'Provides AI responses', capabilities: ['ai', 'nlp', 'generative'], icon: '🤖', color: '#a855f7' },
  { id: 'code-generator-agent', name: 'Code Generator Agent', description: 'Generates code snippets', capabilities: ['code-generation', 'templates', 'scaffolding'], icon: '💻', color: '#22c55e' },
  { id: 'testing-agent', name: 'Testing Agent', description: 'Runs automated tests', capabilities: ['testing', 'qa', 'coverage'], icon: '🧪', color: '#eab308' },
  { id: 'documentation-agent', name: 'Documentation Agent', description: 'Generates docs', capabilities: ['docs', 'api-docs', 'readme'], icon: '📚', color: '#64748b' },
  { id: 'analytics-agent', name: 'Analytics Agent', description: 'Analyzes user data', capabilities: ['analytics', 'metrics', 'insights'], icon: '🔬', color: '#8b5cf6' },
  
  // Feature Agents (26-30)
  { id: 'onboarding-agent', name: 'Onboarding Agent', description: 'Guides new users', capabilities: ['onboarding', 'tours', 'guidance'], icon: '🌟', color: '#f59e0b' },
  { id: 'notification-agent', name: 'Notification Agent', description: 'Manages alerts', capabilities: ['notifications', 'push', 'email'], icon: '🔔', color: '#f43f5e' },
  { id: 'search-agent', name: 'Search Agent', description: 'Handles search functionality', capabilities: ['search', 'indexing', 'filtering'], icon: '🔎', color: '#3b82f6' },
  { id: 'api-gateway-agent', name: 'API Gateway Agent', description: 'Manages API routes', capabilities: ['api', 'routes', 'rate-limiting'], icon: '🚪', color: '#6366f1' },
  { id: 'feedback-agent', name: 'Feedback Agent', description: 'Collects user feedback', capabilities: ['feedback', 'surveys', 'reviews'], icon: '💬', color: '#14b8a6' },
];

// Agent Base Class
export abstract class BaseAgent {
  protected bus = messageBus;
  protected config: AgentConfig;
  protected status: 'idle' | 'busy' | 'error' | 'offline' = 'idle';
  protected handlers: Map<string, (message: AgentMessage) => Promise<void>> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
    this.register();
  }

  private register(): void {
    const agent: Agent = {
      id: this.config.id,
      name: this.config.name,
      description: this.config.description,
      capabilities: this.config.capabilities,
      status: this.status,
      subscriptions: new Set(),
    };
    this.bus.registerAgent(agent);
    
    // Set up message handler
    this.bus.onMessage(this.config.id, this.handleMessage.bind(this));
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    const handler = this.handlers.get(message.type);
    if (handler) {
      await handler(message);
    }
  }

  protected on(type: string, handler: (message: AgentMessage) => Promise<void>): void {
    this.handlers.set(type, handler);
  }

  protected async respond(to: string, payload: any, correlationId?: string): Promise<void> {
    const message = createMessage(this.config.id, to, 'RESPONSE', payload, correlationId);
    await this.bus.send(message);
  }

  protected async broadcast(payload: any): Promise<void> {
    await this.bus.broadcast(this.config.id, payload);
  }

  protected async request(to: string, payload: any): Promise<void> {
    const message = createMessage(this.config.id, to, 'REQUEST', payload);
    await this.bus.send(message);
  }

  getId(): string {
    return this.config.id;
  }

  getName(): string {
    return this.config.name;
  }

  getStatus(): string {
    return this.status;
  }
}

// Initialize all agents
export function initializeAllAgents(): void {
  AGENT_REGISTRY.forEach(config => {
    // Each agent will be instantiated in its own module
    console.log(`[AgentRegistry] Ready: ${config.name}`);
  });
}

export { messageBus };
