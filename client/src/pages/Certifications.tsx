/**
 * Certifications Page
 * Same page structure as AllChannels: bg-card header → PageHeader + SearchInput → filters → card grid
 * DB-driven: categories and question counts from /api/certifications
 */

import { useState, useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { getDifficultyClasses, getDifficultyLabel } from '@/lib/difficulty';
import {
  AppLayout, SEOHead, SkipLink, Button, Badge,
  PageHeader, SearchInput, CertificationsSkeleton, EmptyState,
} from '@/lib/ui';
import {
  Search, Award, Clock, Sparkles, Check, Plus, AlertTriangle,
  Cloud, Shield, Database, Brain, Code, Users, Box, Terminal,
  Server, Cpu, Layers, Network, GitBranch, Target, RefreshCw,
  BookOpen, Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Certification {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  estimatedHours?: number;
  examCode?: string;
  questionCount?: number;
  passingScore?: number;
  examDuration?: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ElementType> = {
  cloud: Cloud, shield: Shield, database: Database, brain: Brain,
  code: Code, users: Users, box: Box, terminal: Terminal,
  server: Server, cpu: Cpu, layers: Layers, network: Network,
  infinity: GitBranch, 'git-branch': GitBranch, award: Award,
};


const categoryLabels: Record<string, string> = {
  cloud: 'Cloud', devops: 'DevOps', security: 'Security',
  data: 'Data', ai: 'AI & ML', development: 'Development', management: 'Management',
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCertifications() {
  return useQuery<Certification[]>({
    queryKey: ['certifications'],
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await fetch('/api/certifications');
      if (!res.ok) throw new Error(`Failed to fetch certifications (${res.status})`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid certifications data');
      return data;
    },
  });
}

function getCertProgress(certId: string): number {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(`cert-progress-${certId}`) || '[]');
    return ids.length;
  } catch { return 0; }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Certifications() {
  const [, navigate] = useLocation();
  const { data: certifications = [], isLoading, error } = useCertifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startedCerts, setStartedCerts] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('startedCertifications') || '[]')); }
    catch { return new Set(); }
  });

  const toggleStarted = useCallback((certId: string) => {
    setStartedCerts(prev => {
      const next = new Set(prev);
      next.has(certId) ? next.delete(certId) : next.add(certId);
      try { localStorage.setItem('startedCertifications', JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  }, []);

  // Derive categories from live data — same pattern as AllChannels
  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const cert of certifications) { if (cert.category) seen.add(cert.category); }
    return Array.from(seen).sort().map(id => ({
      id,
      name: categoryLabels[id] ?? id.charAt(0).toUpperCase() + id.slice(1),
    }));
  }, [certifications]);

  const filteredCerts = useMemo(() => certifications.filter(cert => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = cert.name.toLowerCase().includes(q) ||
      cert.description.toLowerCase().includes(q) ||
      cert.provider.toLowerCase().includes(q);
    return matchesSearch && (!selectedCategory || cert.category === selectedCategory);
  }), [certifications, searchQuery, selectedCategory]);

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <div className="p-4 rounded-md border border-destructive/20 bg-destructive/5 text-center max-w-sm">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <h2 className="font-semibold mb-1">Failed to load certifications</h2>
            <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()} icon={<RefreshCw className="w-4 h-4" />}>
            Try again
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <SEOHead
        title="Certifications | DevPrep"
        description="Practice for AWS, Azure, GCP, Kubernetes, and more with mock exams and guided prep."
      />
      <SkipLink />

      <AppLayout>
        {/* ── Page Header — identical shell to AllChannels ── */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <PageHeader
              title="Certifications"
              subtitle={`${filteredCerts.length} certification${filteredCerts.length !== 1 ? 's' : ''} · practice exams & guided prep`}
              actions={
                <SearchInput
                  placeholder="Search certifications..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  containerClassName="w-full md:w-72"
                  data-testid="input-search-certifications"
                />
              }
              className="mb-5"
            />

            {/* Category filters — same pattern as AllChannels */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={!selectedCategory ? 'primary' : 'ghost'}
                onClick={() => setSelectedCategory(null)}
                data-testid="filter-category-all"
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={selectedCategory === cat.id ? 'primary' : 'ghost'}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  data-testid={`filter-category-${cat.id}`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {isLoading ? (
            <CertificationsSkeleton />
          ) : filteredCerts.length === 0 ? (
            <EmptyState
              icon={<Search className="w-10 h-10" />}
              title="No certifications found"
              description="Try a different search term or category filter."
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCerts.map(cert => (
                <CertCard
                  key={cert.id}
                  cert={cert}
                  isStarted={startedCerts.has(cert.id)}
                  onToggleStarted={toggleStarted}
                  onNavigate={navigate}
                />
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}

// ─── Cert Card — same anatomy as ChannelCard ──────────────────────────────────

interface CertCardProps {
  cert: Certification;
  isStarted: boolean;
  onToggleStarted: (id: string) => void;
  onNavigate: (path: string) => void;
}

function CertCard({ cert, isStarted, onToggleStarted, onNavigate }: CertCardProps) {
  const IconComponent = iconMap[cert.icon] || Award;
  const questionCount = cert.questionCount ?? 0;
  const passingScore = cert.passingScore ?? 70;
  const examDuration = cert.examDuration ?? 90;
  const examCode = cert.examCode;
  const completedCount = getCertProgress(cert.id);
  const progressPct = questionCount > 0 ? Math.min(100, Math.round((completedCount / questionCount) * 100)) : 0;
  const hasQuestions = questionCount > 0;
  const catLabel = categoryLabels[cert.category] ?? cert.category;

  return (
    <div
      className="group flex flex-col p-4 bg-card border border-border rounded-md hover-elevate transition-all"
      data-testid={`card-certification-${cert.id}`}
    >
      {/* Card Header — same layout as ChannelCard */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <IconComponent className="w-4 h-4 text-primary" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{cert.provider}</p>
          <h3 className="text-sm font-semibold leading-tight line-clamp-2">{cert.name}</h3>
          {examCode && <p className="text-[10px] text-muted-foreground mt-0.5">{examCode}</p>}
        </div>
        <Badge className={`text-[10px] capitalize shrink-0 ${getDifficultyClasses(cert.difficulty)}`}>
          {getDifficultyLabel(cert.difficulty)}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{cert.description}</p>

      {/* Stats — same row structure as ChannelCard */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          {hasQuestions ? `${questionCount} questions` : 'Coming soon'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-primary" />
          {examDuration}m
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3 text-primary" />
          {passingScore}% pass
        </span>
      </div>

      {/* Progress bar */}
      {isStarted && hasQuestions && progressPct > 0 && (
        <div className="mb-3">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{progressPct}% done</p>
        </div>
      )}

      {/* Action buttons — unique to certifications */}
      <div className="mt-auto flex items-center gap-2">
        {hasQuestions ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => onNavigate(`/certification/${cert.id}`)}
              icon={<BookOpen className="w-3.5 h-3.5" />}
              data-testid={`button-practice-${cert.id}`}
            >
              Practice
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => onNavigate(`/certification/${cert.id}/exam`)}
              icon={<Zap className="w-3.5 h-3.5" />}
              data-testid={`button-mock-exam-${cert.id}`}
            >
              Mock Exam
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" className="flex-1" disabled icon={<Clock className="w-3.5 h-3.5" />}>
            Not Available
          </Button>
        )}
        <Button
          variant={isStarted ? 'success' : 'ghost'}
          size="sm"
          onClick={() => onToggleStarted(cert.id)}
          title={isStarted ? 'Remove bookmark' : 'Bookmark'}
          icon={isStarted ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          data-testid={`button-toggle-started-${cert.id}`}
        />
      </div>
    </div>
  );
}
