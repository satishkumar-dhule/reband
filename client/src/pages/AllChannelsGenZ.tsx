/**
 * All Channels Page - GitHub UI
 * Clean, light, professional design replacing GenZ dark aesthetic.
 */

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { allChannelsConfig } from '../lib/channels-config';
import { useChannelStats } from '../hooks/use-stats';
import { SEOHead } from '../components/SEOHead';
import {
  Search, Box, Terminal, Layout, Server, Database, Infinity, Activity, Cloud, Layers,
  Brain, Eye, FileText, Code, Shield, Network, Monitor, Smartphone, CheckCircle,
  Zap, Gauge, Users, MessageCircle, Calculator, Cpu, GitBranch, Binary, Puzzle,
  GitMerge, Workflow, Award
} from 'lucide-react';

const iconMap: Record<string, any> = {
  'boxes': Box,
  'chart-line': Gauge,
  'git-branch': GitBranch,
  'binary': Binary,
  'puzzle': Puzzle,
  'git-merge': GitMerge,
  'calculator': Calculator,
  'cpu': Cpu,
  'terminal': Terminal,
  'layout': Layout,
  'server': Server,
  'database': Database,
  'infinity': Infinity,
  'activity': Activity,
  'box': Box,
  'cloud': Cloud,
  'layers': Layers,
  'workflow': Workflow,
  'brain': Brain,
  'message-circle': MessageCircle,
  'eye': Eye,
  'file-text': FileText,
  'code': Code,
  'shield': Shield,
  'network': Network,
  'monitor': Monitor,
  'smartphone': Smartphone,
  'check-circle': CheckCircle,
  'zap': Zap,
  'gauge': Gauge,
  'users': Users,
  'award': Award,
};

const categoryLabels: Record<string, string> = {
  'frontend': 'Frontend',
  'backend': 'Backend',
  'cloud': 'Cloud',
  'data': 'Data',
  'security': 'Security',
  'ai': 'AI/ML',
  'fundamentals': 'Fundamentals',
  'certification': 'Certification',
  'testing': 'Testing',
  'management': 'Management',
  'mobile': 'Mobile',
};

export function AllChannelsGenZ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { stats, loading, error } = useChannelStats();

  const channelStatsMap = useMemo(() => {
    return (stats || []).reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {} as Record<string, any>);
  }, [stats]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    allChannelsConfig.forEach(c => cats.add(c.category));
    return Array.from(cats).sort();
  }, []);

  const filteredChannels = useMemo(() => {
    return allChannelsConfig.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          channel.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || channel.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <AppLayout>
      <SEOHead 
        title="All Topics | DevPrep" 
        description="Explore all interview topics and learning paths."
      />
      
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Explore Topics</h1>
              <p className="text-muted-foreground mt-1">
                Browse our collection of curated interview topics and certifications.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                !selectedCategory 
                  ? 'bg-primary text-primary-foreground border-transparent' 
                  : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              All Topics
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground border-transparent'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                }`}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading topics...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-destructive/20 rounded-md">
            <div className="p-3 bg-destructive/10 rounded-full mb-4">
              <Zap className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Failed to load topics</h3>
            <p className="text-muted-foreground mt-1 text-center max-w-md">
              {error.message || 'Something went wrong while loading the topics.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel) => {
              const channelStat = channelStatsMap[channel.id] || { total: 0 };
              // Note: We don't have per-channel completion data in useChannelStats yet
              // This is a placeholder for progress until we have useProgress integrated
              const progress = 0; 

              const Icon = iconMap[channel.icon] || Box;

              return (
                <div 
                  key={channel.id}
                  onClick={() => setLocation(`/channel/${channel.id}`)}
                  className="group bg-card border border-border rounded-md p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer flex flex-col h-full"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2 bg-muted rounded-md border border-border-muted group-hover:border-primary transition-colors">
                      <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border-muted">
                      {categoryLabels[channel.category] || channel.category}
                    </span>
                  </div>

                  <h3 className="font-semibold text-foreground group-hover:text-primary mb-1">
                    {channel.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                    {channel.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-border-muted">
                    <div className="flex justify-between items-center gap-2 text-xs mb-1.5">
                      <span className="text-muted-foreground">
                        {channelStat.total} questions
                      </span>
                      {progress > 0 && (
                        <span className="font-medium text-muted-foreground">
                          {Math.round(progress)}%
                        </span>
                      )}
                    </div>
                    {progress > 0 && (
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-border border-dashed rounded-md">
            <Search className="w-12 h-12 text-border mb-4" />
            <h3 className="text-lg font-medium text-foreground">No topics found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="mt-4 px-4 py-2 text-sm font-medium bg-muted text-foreground border border-border rounded-md hover:bg-muted/80 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default AllChannelsGenZ;
