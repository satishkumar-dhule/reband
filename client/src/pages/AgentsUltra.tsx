// DevPrep Ultra Pro Max - 30 Autonomous Agents System
// Coordinates via message passing with Google services integration

import { useState } from "react";
import { 
  Palette, Sparkles, Accessibility, Smartphone, 
  Database, Search, RefreshCw, Save, Zap, 
  BarChart, Lock, Cloud, Map, FileText, 
  Layers, Box, Globe, Activity, Shield, 
  Bot, Code, TestTube, Library, Microscope,
  Star, Bell, DoorOpen, MessageSquare, HardDrive
} from "lucide-react";
import { Button } from "@/components/unified/Button";

const iconsMap: Record<string, any> = {
  Palette, Sparkles, Accessibility, Smartphone,
  Database, Search, RefreshCw, Save, Zap,
  BarChart, Lock, Cloud, Map, FileText,
  Layers, Box, Globe, Activity, Shield,
  Bot, Code, TestTube, Library, Microscope,
  Star, Bell, DoorOpen, MessageSquare, HardDrive
};

// 30 Autonomous Agents Configuration
// Using GitHub CSS variables for semantic colors
const agents = [
  // UI/UX Agents (1-5)
  { id: 'ui-ux-architect', name: 'UI/UX Architect', icon: 'Palette', color: 'text-[var(--gh-accent-fg)]', bg: 'bg-[var(--gh-accent-subtle)]', border: 'border-[var(--gh-accent-emphasis)]', category: 'UI/UX', desc: 'Design & prototyping' },
  { id: 'design-system', name: 'Design System', icon: 'Layers', color: 'text-[var(--gh-accent-fg)]', bg: 'bg-[var(--gh-accent-subtle)]', border: 'border-[var(--gh-accent-emphasis)]', category: 'UI/UX', desc: 'Component libraries' },
  { id: 'accessibility', name: 'Accessibility', icon: 'Accessibility', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'UI/UX', desc: 'WCAG compliance' },
  { id: 'animation', name: 'Animation', icon: 'Sparkles', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'UI/UX', desc: 'Motion & transitions' },
  { id: 'responsive', name: 'Responsive', icon: 'Smartphone', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'UI/UX', desc: 'Multi-device layouts' },
  
  // Database Agents (6-10)
  { id: 'db-architect', name: 'DB Architect', icon: 'HardDrive', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Database', desc: 'Schema design' },
  { id: 'query-optimizer', name: 'Query Optimizer', icon: 'Search', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Database', desc: 'SQL performance' },
  { id: 'migration', name: 'Migration', icon: 'RefreshCw', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Database', desc: 'Data migration' },
  { id: 'backup', name: 'Backup', icon: 'Save', color: 'text-[var(--gh-fg-muted)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Database', desc: 'Disaster recovery' },
  { id: 'cache', name: 'Cache Manager', icon: 'Zap', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Database', desc: 'Redis caching' },
  
  // Google Agents (11-15)
  { id: 'google-analytics', name: 'Google Analytics', icon: 'BarChart', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Google', desc: 'User tracking' },
  { id: 'google-auth', name: 'Google Auth', icon: 'Lock', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Google', desc: 'OAuth/SSO' },
  { id: 'google-cloud', name: 'Google Cloud', icon: 'Cloud', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Google', desc: 'GCP deployment' },
  { id: 'google-maps', name: 'Google Maps', icon: 'Map', color: 'text-[var(--gh-danger-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Google', desc: 'Location services' },
  { id: 'google-sheets', name: 'Google Sheets', icon: 'FileText', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Google', desc: 'Data export' },
  
  // DevOps Agents (16-20)
  { id: 'ci-cd', name: 'CI/CD Pipeline', icon: 'RefreshCw', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'DevOps', desc: 'Automation' },
  { id: 'docker', name: 'Docker', icon: 'Box', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'DevOps', desc: 'Containers' },
  { id: 'kubernetes', name: 'Kubernetes', icon: 'Globe', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'DevOps', desc: 'Orchestration' },
  { id: 'monitoring', name: 'Monitoring', icon: 'Activity', color: 'text-[var(--gh-danger-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'DevOps', desc: 'System health' },
  { id: 'security', name: 'Security', icon: 'Shield', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'DevOps', desc: 'Security scanning' },
  
  // AI/ML Agents (21-25)
  { id: 'ai-assistant', name: 'AI Assistant', icon: 'Bot', color: 'text-[var(--gh-accent-fg)]', bg: 'bg-[var(--gh-accent-subtle)]', border: 'border-[var(--gh-accent-emphasis)]', category: 'AI/ML', desc: 'NLP & generative' },
  { id: 'code-generator', name: 'Code Generator', icon: 'Code', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'AI/ML', desc: 'Code generation' },
  { id: 'testing', name: 'Testing', icon: 'TestTube', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'AI/ML', desc: 'QA & coverage' },
  { id: 'documentation', name: 'Documentation', icon: 'Library', color: 'text-[var(--gh-fg-muted)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'AI/ML', desc: 'API docs' },
  { id: 'analytics-ml', name: 'ML Analytics', icon: 'Microscope', color: 'text-[var(--gh-accent-fg)]', bg: 'bg-[var(--gh-accent-subtle)]', border: 'border-[var(--gh-accent-emphasis)]', category: 'AI/ML', desc: 'Data insights' },
  
  // Feature Agents (26-30)
  { id: 'onboarding', name: 'Onboarding', icon: 'Star', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Features', desc: 'User guidance' },
  { id: 'notifications', name: 'Notifications', icon: 'Bell', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Features', desc: 'Push & email' },
  { id: 'search', name: 'Search', icon: 'Search', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Features', desc: 'Indexing' },
  { id: 'api-gateway', name: 'API Gateway', icon: 'DoorOpen', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Features', desc: 'Routes & rate limiting' },
  { id: 'feedback', name: 'Feedback', icon: 'MessageSquare', color: 'text-[var(--gh-fg)]', bg: 'bg-[var(--gh-canvas)]', border: 'border-[var(--gh-border)]', category: 'Features', desc: 'Surveys' },
];

// Get agent component based on selection
function AgentPanel({ agent }: { agent: typeof agents[0] }) {
  const Icon = iconsMap[agent.icon] || Bot;
  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center gap-4 mb-4">
        <Icon className={`w-12 h-12 ${agent.color}`} />
        <div>
          <h2 className={`text-2xl font-bold ${agent.color}`}>{agent.name}</h2>
          <span className="text-sm text-muted-foreground">{agent.category} Agent</span>
        </div>
      </div>
      <p className="text-muted-foreground mb-4">{agent.desc}</p>
      <div className="flex gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-full text-xs bg-[var(--gh-accent-subtle)] text-[var(--gh-accent-fg)]">Status: Active</span>
        <span className={`px-3 py-1 rounded-full text-xs ${agent.bg} ${agent.color}`}>Message Passing: Enabled</span>
        <span className="px-3 py-1 rounded-full text-xs bg-[var(--gh-accent-subtle)] text-[var(--gh-accent-fg)]">Async: Ready</span>
      </div>
    </div>
  );
}

export default function AgentsUltra() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [agentStatus, setAgentStatus] = useState<Record<string, string>>({});
  
  // Group agents by category
  const categories = Array.from(new Set(agents.map(a => a.category)));
  
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
              <div className="w-10 h-10 rounded-lg bg-[var(--gh-accent-emphasis)] flex items-center justify-center">
                <span className="text-white font-bold">DP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">DevPrep Ultra Pro Max</h1>
                <p className="text-xs text-muted-foreground">30 Autonomous AI Agents</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full text-xs bg-[var(--gh-accent-subtle)] text-[var(--gh-accent-fg)]">● System Online</span>
              <span className="px-3 py-1 rounded-full text-xs bg-[var(--gh-accent-subtle)] text-[var(--gh-accent-fg)]">Message Bus: Active</span>
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
                      <Button
                        key={agent.id}
                        variant={selectedAgent.id === agent.id ? 'primary' : 'ghost'}
                        size="sm"
                        className={`w-full justify-start gap-3 ${
                          selectedAgent.id === agent.id 
                            ? '' 
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => handleAgentSelect(agent)}
                      >
                        <span className="text-lg">{agent.icon}</span>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium text-sm truncate">{agent.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{agent.desc}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${
                          agentStatus[agent.id] === 'processing' 
                            ? 'bg-[var(--gh-danger-fg)] animate-pulse' 
                            : 'bg-[var(--gh-accent-fg)]'
                        }`} />
                      </Button>
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
                  <span className="text-[var(--gh-accent-fg)]">→</span>
                  <span className="text-muted-foreground">User:</span>
                  <span>Requesting data from {selectedAgent.name}...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--gh-danger-fg)]">↔</span>
                  <span className="text-muted-foreground">Message Bus:</span>
                  <span>Routing message to {selectedAgent.id} via async queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--gh-accent-fg)]">✓</span>
                  <span className="text-muted-foreground">{selectedAgent.name}:</span>
                  <span>Processing request and coordinating with other agents...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--gh-accent-fg)]">←</span>
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
                    className={`p-3 rounded-lg bg-muted text-center border ${agent.border}`}
                  >
                    <span className="text-2xl block mb-1">{agent.icon}</span>
                    <span className={`text-xs font-medium ${agent.color}`}>{agent.name.split(' ')[0]}</span>
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
