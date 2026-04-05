/**
 * All Channels Page - GitHub UI
 */

import { useState, useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  AppLayout, SEOHead, SkipLink, ChannelsSkeleton, Button,
  PageContainer, PageHeader, SearchInput, EmptyState,
} from '@/lib/ui';
import { allChannelsConfig, ChannelConfig } from '../lib/channels-config';
import { useChannelStats } from '../hooks/use-stats';
import { useDebounce, useProgress } from '../hooks';
import {
  Box, Terminal, Layout, Server, Database, Infinity, Activity, Cloud, Layers,
  Brain, Eye, FileText, Code, Shield, Network, Monitor, Smartphone, CheckCircle,
  Zap, Gauge, Users, MessageCircle, Calculator, Cpu, GitBranch, Binary, Puzzle,
  GitMerge, Workflow, Award, Search,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  'boxes': Box, 'chart-line': Gauge, 'git-branch': GitBranch, 'binary': Binary,
  'puzzle': Puzzle, 'git-merge': GitMerge, 'calculator': Calculator, 'cpu': Cpu,
  'terminal': Terminal, 'layout': Layout, 'server': Server, 'database': Database,
  'infinity': Infinity, 'activity': Activity, 'box': Box, 'cloud': Cloud, 'layers': Layers,
  'workflow': Workflow, 'brain': Brain, 'message-circle': MessageCircle, 'eye': Eye,
  'file-text': FileText, 'code': Code, 'shield': Shield, 'network': Network,
  'monitor': Monitor, 'smartphone': Smartphone, 'check-circle': CheckCircle,
  'zap': Zap, 'gauge': Gauge, 'users': Users, 'award': Award,
};

const categoryLabels: Record<string, string> = {
  frontend: 'Frontend', backend: 'Backend', cloud: 'Cloud', data: 'Data',
  security: 'Security', ai: 'AI/ML', fundamentals: 'Fundamentals',
  certification: 'Certification', testing: 'Testing', management: 'Management', mobile: 'Mobile',
};

export function AllChannels() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { stats, loading, error } = useChannelStats();

  const debouncedSearch = useDebounce(searchQuery, 300);

  const channelStatsMap = useMemo(
    () => (stats || []).reduce((acc, curr) => { acc[curr.id] = curr; return acc; }, {} as Record<string, any>),
    [stats],
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    allChannelsConfig.forEach(c => cats.add(c.category));
    return Array.from(cats).sort();
  }, []);

  const filteredChannels = useMemo(() => allChannelsConfig.filter(ch => {
    const q = debouncedSearch.toLowerCase();
    const matchSearch = ch.name.toLowerCase().includes(q) || ch.description.toLowerCase().includes(q);
    return matchSearch && (!selectedCategory || ch.category === selectedCategory);
  }), [debouncedSearch, selectedCategory]);

  return (
    <>
      <SkipLink />
      <AppLayout>
        <SEOHead title="All Topics | DevPrep" description="Explore all interview topics and learning paths." />

        {/* Header bar */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
            <PageHeader
              title="Explore Topics"
              subtitle="Browse our collection of curated interview topics and certifications."
              actions={
                <SearchInput
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  containerClassName="w-full md:w-80"
                  data-testid="input-search-channels"
                />
              }
              className="mb-6"
            />

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
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

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
          {loading ? (
            <ChannelsSkeleton />
          ) : error ? (
            <EmptyState
              icon={<Zap className="w-10 h-10" />}
              title="Failed to load topics"
              description={error.message || 'Something went wrong while loading the topics.'}
              action={
                <Button onClick={() => window.location.reload()} variant="danger" size="sm">
                  Try again
                </Button>
              }
              variant="error"
            />
          ) : filteredChannels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChannels.map(channel => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  questionCount={channelStatsMap[channel.id]?.total ?? 0}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="w-10 h-10" />}
              title="No topics found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={
                <Button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} variant="outline" size="sm">
                  Clear all filters
                </Button>
              }
            />
          )}
        </div>
      </AppLayout>
    </>
  );
}

// ─── Channel Card ─────────────────────────────────────────────────────────────

interface ChannelCardProps {
  channel: ChannelConfig;
  questionCount: number;
}

function ChannelCard({ channel, questionCount }: ChannelCardProps) {
  const [, setLocation] = useLocation();
  const { completed } = useProgress(channel.id);

  const progress = questionCount > 0 ? Math.round((completed.length / questionCount) * 100) : 0;
  const Icon = iconMap[channel.icon] || Box;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLocation(`/channel/${channel.id}`); }
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

      <h3 className="font-semibold text-foreground group-hover:text-primary mb-1">{channel.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">{channel.description}</p>

      <div className="mt-auto pt-4 border-t border-border-muted">
        <div className="flex justify-between items-center gap-2 text-xs mb-1.5">
          <span className="text-muted-foreground">{questionCount} questions</span>
          {progress > 0 && <span className="font-medium text-muted-foreground">{progress}%</span>}
        </div>
        {progress > 0 && (
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </button>
  );
}

export default AllChannels;
