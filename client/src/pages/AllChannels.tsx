/**
 * All Channels Page - GitHub UI
 * Clean, light, professional design replacing GenZ dark aesthetic.
 */

import { useState, useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/lib/ui';
import { SEOHead } from '@/lib/ui';
import { SkipLink } from '@/lib/ui';
import { allChannelsConfig, ChannelConfig } from '../lib/channels-config';
import { useChannelStats } from '../hooks/use-stats';
import { useDebounce, useProgress } from '../hooks';
import { ChannelsSkeleton } from '@/lib/ui';
import { Input } from '@/lib/ui';
import { Button } from '@/lib/ui';
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

export function AllChannels() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { stats, loading, error } = useChannelStats();

  // Debounce search input (300ms)
  const debouncedSearch = useDebounce(searchQuery, 300);

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

  // Memoize filtered channels to prevent re-computation on unrelated renders
  const filteredChannels = useMemo(() => {
    return allChannelsConfig.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          channel.description.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = !selectedCategory || channel.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearch, selectedCategory]);

  // Memoize grouped channels by category
  const groupedChannels = useMemo(() => {
    const groups: Record<string, typeof allChannelsConfig> = {};
    filteredChannels.forEach(channel => {
      const cat = channel.category;
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(channel);
    });
    return groups;
  }, [filteredChannels]);

  // Get total question count for each channel from stats
  const channelQuestionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allChannelsConfig.forEach(channel => {
      const stat = channelStatsMap[channel.id];
      counts[channel.id] = stat?.total || 0;
    });
    return counts;
  }, [channelStatsMap]);

  return (
    <>
      <SkipLink />
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-channels"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedCategory(null)}
              variant={!selectedCategory ? 'primary' : 'ghost'}
              size="sm"
              data-testid="button-filter-all"
            >
              All Topics
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? 'primary' : 'ghost'}
                size="sm"
                data-testid={`button-filter-${cat}`}
              >
                {categoryLabels[cat] || cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        {loading ? (
          <ChannelsSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-destructive/20 rounded-md">
            <div className="p-3 bg-destructive/10 rounded-full mb-4">
              <Zap className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Failed to load topics</h3>
            <p className="text-muted-foreground mt-1 text-center max-w-md">
              {error.message || 'Something went wrong while loading the topics.'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="danger"
              size="sm"
            >
              Try again
            </Button>
          </div>
        ) : filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel) => {
              const channelStat = channelStatsMap[channel.id] || { total: 0 };
              const questionCount = channelStat.total || 0;
              
              return (
                <ChannelCard 
                  key={channel.id}
                  channel={channel}
                  questionCount={questionCount}
                />
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
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              variant="outline"
              size="sm"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
    </>
  );
}

// Channel Card component - gets its own progress state
interface ChannelCardProps {
  channel: ChannelConfig;
  questionCount: number;
}

function ChannelCard({ channel, questionCount }: ChannelCardProps) {
  const [, setLocation] = useLocation();
  const { completed } = useProgress(channel.id);
  
  const progress = questionCount > 0 
    ? Math.round((completed.length / questionCount) * 100) 
    : 0;
  
  const Icon = iconMap[channel.icon] || Box;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLocation(`/channel/${channel.id}`);
    }
  }, [setLocation, channel.id]);

  return (
    <button
      type="button"
      onClick={() => setLocation(`/channel/${channel.id}`)}
      onKeyDown={handleKeyDown}
      className="group bg-card border border-border rounded-md p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer flex flex-col h-full text-left w-full"
      data-testid={`card-channel-${channel.id}`}
      aria-label={`${channel.name}: ${questionCount} questions, ${progress}% completed`}
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
            {questionCount} questions
          </span>
          {progress > 0 && (
            <span className="font-medium text-muted-foreground">
              {progress}%
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
    </button>
  );
}

export default AllChannels;
