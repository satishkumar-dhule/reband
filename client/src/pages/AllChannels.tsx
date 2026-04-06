/**
 * All Channels Page
 * Same page structure as Certifications: header + filters + identical card grid
 */

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  AppLayout, SEOHead, SkipLink, ChannelsSkeleton, Button,
  PageHeader, SearchInput, EmptyState,
} from '@/lib/ui';
import { ProgressBar } from '@/components/unified/ProgressBar';
import { allChannelsConfig, ChannelConfig } from '../lib/channels-config';
import { useChannelStats } from '../hooks/use-stats';
import { useDebounce, useProgress } from '../hooks';
import {
  Box, Terminal, Layout, Server, Database, Infinity, Activity, Cloud, Layers,
  Brain, Eye, FileText, Code, Shield, Network, Monitor, Smartphone,
  Zap, Gauge, Users, MessageCircle, Calculator, Cpu, GitBranch, Binary, Puzzle,
  GitMerge, Workflow, Award, Search, CheckCircle, Sparkles,
} from 'lucide-react';
import { Badge } from '@/lib/ui';

const iconMap: Record<string, React.ElementType> = {
  'boxes': Box, 'chart-line': Gauge, 'git-branch': GitBranch, 'binary': Binary,
  'puzzle': Puzzle, 'git-merge': GitMerge, 'calculator': Calculator, 'cpu': Cpu,
  'terminal': Terminal, 'layout': Layout, 'server': Server, 'database': Database,
  'infinity': Infinity, 'activity': Activity, 'box': Box, 'cloud': Cloud, 'layers': Layers,
  'workflow': Workflow, 'brain': Brain, 'message-circle': MessageCircle, 'eye': Eye,
  'file-text': FileText, 'code': Code, 'shield': Shield, 'network': Network,
  'monitor': Monitor, 'smartphone': Smartphone, 'check-circle': CheckCircle,
  'zap': Zap, 'gauge': Gauge, 'users': Users, 'award': Award, 'sparkles': Sparkles,
};

const categoryLabels: Record<string, string> = {
  frontend: 'Frontend', backend: 'Backend', cloud: 'Cloud', data: 'Data',
  security: 'Security', ai: 'AI/ML', fundamentals: 'Fundamentals',
  engineering: 'Engineering', certification: 'Cert', testing: 'Testing',
  management: 'Management', mobile: 'Mobile',
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

  // Derive categories from config
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allChannelsConfig.forEach(c => cats.add(c.category));
    return Array.from(cats).sort().map(id => ({
      id,
      name: categoryLabels[id] ?? id.charAt(0).toUpperCase() + id.slice(1),
    }));
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
        <SEOHead title="Topics | DevPrep" description="Explore all interview topics and learning paths." />

        {/* ── Page Header ── */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <PageHeader
              title="Explore Topics"
              subtitle={`${filteredChannels.length} topic${filteredChannels.length !== 1 ? 's' : ''} · curated interview prep`}
              actions={
                <SearchInput
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  containerClassName="w-full md:w-72"
                  data-testid="input-search-channels"
                />
              }
              className="mb-5"
            />

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedCategory(null)}
                variant={!selectedCategory ? 'primary' : 'ghost'}
                size="sm"
                data-testid="button-filter-all"
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  variant={selectedCategory === cat.id ? 'primary' : 'ghost'}
                  size="sm"
                  data-testid={`button-filter-${cat.id}`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {loading ? (
            <ChannelsSkeleton />
          ) : error ? (
            <EmptyState
              icon={<Zap className="w-10 h-10" />}
              title="Failed to load topics"
              description={error.message || 'Something went wrong loading topics.'}
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
              description="Try adjusting your search or filters."
              action={
                <Button
                  onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                  variant="outline"
                  size="sm"
                >
                  Clear filters
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
  const catLabel = categoryLabels[channel.category] ?? channel.category;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setLocation(`/channel/${channel.id}`)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLocation(`/channel/${channel.id}`); } }}
      className="group flex flex-col p-4 bg-card border border-border rounded-md hover-elevate transition-all cursor-pointer"
      data-testid={`card-channel-${channel.id}`}
      aria-label={`${channel.name}: ${questionCount} questions, ${progress}% completed`}
    >
      {/* Card Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-tight">{channel.name}</h3>
        </div>
        <Badge className="text-[10px] shrink-0 capitalize bg-muted text-muted-foreground border-0">
          {catLabel}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{channel.description}</p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-primary/20 inline-flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </span>
          {questionCount > 0 ? `${questionCount} questions` : 'Coming soon'}
        </span>
        {progress > 0 && (
          <span className="text-muted-foreground">{progress}% done</span>
        )}
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="mt-auto">
          <ProgressBar current={progress} max={100} size="xs" variant="success" />
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          tabIndex={-1}
          data-testid={`button-open-${channel.id}`}
        >
          {progress > 0 ? 'Continue' : 'Start practicing'}
        </Button>
      </div>
    </div>
  );
}

export default AllChannels;
