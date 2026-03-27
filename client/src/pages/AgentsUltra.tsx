// DevPrep Ultra Pro Max - 30 Autonomous Agents System
// Coordinates via message passing with Google services integration

import { useState } from "react";
import { messageBus } from "@/agents/core/AgentMessageBus";

// 30 Autonomous Agents Configuration
const agents = [
  // UI/UX Agents (1-5)
  { id: 'ui-ux-architect', name: 'UI/UX Architect', icon: '🎨', color: '#6366f1', category: 'UI/UX', desc: 'Design & prototyping' },
  { id: 'design-system', name: 'Design System', icon: '🖌️', color: '#8b5cf6', category: 'UI/UX', desc: 'Component libraries' },
  { id: 'accessibility', name: 'Accessibility', icon: '♿', color: '#10b981', category: 'UI/UX', desc: 'WCAG compliance' },
  { id: 'animation', name: 'Animation', icon: '✨', color: '#f59e0b', category: 'UI/UX', desc: 'Motion & transitions' },
  { id: 'responsive', name: 'Responsive', icon: '📱', color: '#ec4899', category: 'UI/UX', desc: 'Multi-device layouts' },
  
  // Database Agents (6-10)
  { id: 'db-architect', name: 'DB Architect', icon: '🏗️', color: '#3b82f6', category: 'Database', desc: 'Schema design' },
  { id: 'query-optimizer', name: 'Query Optimizer', icon: '🔍', color: '#0ea5e9', category: 'Database', desc: 'SQL performance' },
  { id: 'migration', name: 'Migration', icon: '🔄', color: '#14b8a6', category: 'Database', desc: 'Data migration' },
  { id: 'backup', name: 'Backup', icon: '💾', color: '#64748b', category: 'Database', desc: 'Disaster recovery' },
  { id: 'cache', name: 'Cache Manager', icon: '⚡', color: '#f97316', category: 'Database', desc: 'Redis caching' },
  
  // Google Agents (11-15)
  { id: 'google-analytics', name: 'Google Analytics', icon: '📊', color: '#f9a8d4', category: 'Google', desc: 'User tracking' },
  { id: 'google-auth', name: 'Google Auth', icon: '🔐', color: '#4285f4', category: 'Google', desc: 'OAuth/SSO' },
  { id: 'google-cloud', name: 'Google Cloud', icon: '☁️', color: '#34a853', category: 'Google', desc: 'GCP deployment' },
  { id: 'google-maps', name: 'Google Maps', icon: '🗺️', color: '#ea4335', category: 'Google', desc: 'Location services' },
  { id: 'google-sheets', name: 'Google Sheets', icon: '📑', color: '#0f9d58', category: 'Google', desc: 'Data export' },
  
  // DevOps Agents (16-20)
  { id: 'ci-cd', name: 'CI/CD Pipeline', icon: '🔄', color: '#06b6d4', category: 'DevOps', desc: 'Automation' },
  { id: 'docker', name: 'Docker', icon: '🐳', color: '#2496ed', category: 'DevOps', desc: 'Containers' },
  { id: 'kubernetes', name: 'Kubernetes', icon: '☸️', color: '#326ce5', category: 'DevOps', desc: 'Orchestration' },
  { id: 'monitoring', name: 'Monitoring', icon: '📈', color: '#ef4444', category: 'DevOps', desc: 'System health' },
  { id: 'security', name: 'Security', icon: '🛡️', color: '#7c3aed', category: 'DevOps', desc: 'Security scanning' },
  
  // AI/ML Agents (21-25)
  { id: 'ai-assistant', name: 'AI Assistant', icon: '🤖', color: '#a855f7', category: 'AI/ML', desc: 'NLP & generative' },
  { id: 'code-generator', name: 'Code Generator', icon: '💻', color: '#22c55e', category: 'AI/ML', desc: 'Code generation' },
  { id: 'testing', name: 'Testing', icon: '🧪', color: '#eab308', category: 'AI/ML', desc: 'QA & coverage' },
  { id: 'documentation', name: 'Documentation', icon: '📚', color: '#64748b', category: 'AI/ML', desc: 'API docs' },
  { id: 'analytics-ml', name: 'ML Analytics', icon: '🔬', color: '#8b5cf6', category: 'AI/ML', desc: 'Data insights' },
  
  // Feature Agents (26-30)
  { id: 'onboarding', name: 'Onboarding', icon: '🌟', color: '#f59e0b', category: 'Features', desc: 'User guidance' },
  { id: 'notifications', name: 'Notifications', icon: '🔔', color: '#f43f5e', category: 'Features', desc: 'Push & email' },
  { id: 'search', name: 'Search', icon: '🔎', color: '#3b82f6', category: 'Features', desc: 'Indexing' },
  { id: 'api-gateway', name: 'API Gateway', icon: '🚪', color: '#6366f1', category: 'Features', desc: 'Routes & rate limiting' },
  { id: 'feedback', name: 'Feedback', icon: '💬', color: '#14b8a6', category: 'Features', desc: 'Surveys' },
];

// Get agent component based on selection
function AgentPanel({ agent }: { agent: typeof agents[0] }) {
  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl">{agent.icon}</span>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: agent.color }}>{agent.name}</h2>
          <span className="text-sm text-muted-foreground">{agent.category} Agent</span>
        </div>
      </div>
      <p className="text-muted-foreground mb-4">{agent.desc}</p>
      <div className="flex gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">Status: Active</span>
        <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-500">Message Passing: Enabled</span>
        <span className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500">Async: Ready</span>
      </div>
    </div>
  );
}

export default function AgentsUltra() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [agentStatus, setAgentStatus] = useState<Record<string, string>>({});
  
  // Group agents by category
  const categories = [...new Set(agents.map(a => a.category))];
  
  const handleAgentSelect = (agent: typeof agents[0]) => {
    setSelectedAgent(agent);
    // Simulate message passing status
    setAgentStatus(prev => ({ ...prev, [agent.id]: 'processing' }));
    setTimeout(() => setAgentStatus(prev => ({ ...prev, [agent.id]: 'active' })), 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold">DP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">DevPrep Ultra Pro Max</h1>
                <p className="text-xs text-muted-foreground">30 Autonomous AI Agents</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-500">● System Online</span>
              <span className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500">Message Bus: Active</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Status Bar */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="px-4 py-2 rounded-lg bg-card border border-border flex items-center gap-2">
            <span>🤖</span>
            <span className="font-medium">{agents.length} Active Agents</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-card border border-border flex items-center gap-2">
            <span>📡</span>
            <span className="font-medium">Message Passing: Active</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-card border border-border flex items-center gap-2">
            <span>☁️</span>
            <span className="font-medium">Google Services: Connected</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-card border border-border flex items-center gap-2">
            <span>🗄️</span>
            <span className="font-medium">Database: Coordinated</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Agent List */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">Select Agent</h2>
              </div>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {categories.map(category => (
                  <div key={category} className="p-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase">{category}</p>
                    {agents.filter(a => a.category === category).map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => handleAgentSelect(agent)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          selectedAgent.id === agent.id 
                            ? 'bg-primary/10 text-primary' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="text-lg">{agent.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{agent.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{agent.desc}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${
                          agentStatus[agent.id] === 'processing' 
                            ? 'bg-yellow-500 animate-pulse' 
                            : 'bg-green-500'
                        }`} />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Agent Panel */}
          <div className="lg:col-span-3">
            <AgentPanel agent={selectedAgent} />
            
            {/* Message Passing Demo */}
            <div className="mt-6 bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">🔄 Message Passing Demo</h3>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">→</span>
                  <span className="text-muted-foreground">User:</span>
                  <span>Requesting data from {selectedAgent.name}...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">↔</span>
                  <span className="text-muted-foreground">Message Bus:</span>
                  <span>Routing message to {selectedAgent.id} via async queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-muted-foreground">{selectedAgent.name}:</span>
                  <span>Processing request and coordinating with other agents...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">←</span>
                  <span className="text-muted-foreground">Response:</span>
                  <span>Data returned to UI successfully</span>
                </div>
              </div>
            </div>

            {/* Agent Coordination */}
            <div className="mt-6 bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">🤝 Agent Coordination</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {agents.slice(0, 5).map(agent => (
                  <div 
                    key={agent.id}
                    className="p-3 rounded-lg bg-muted text-center"
                    style={{ borderColor: agent.color, borderWidth: 1 }}
                  >
                    <span className="text-2xl block mb-1">{agent.icon}</span>
                    <span className="text-xs font-medium">{agent.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {selectedAgent.name} coordinates with other agents through the message bus for optimal performance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
