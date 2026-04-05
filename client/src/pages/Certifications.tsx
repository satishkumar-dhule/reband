/**
 * Certifications Page
 * DB-driven: categories, certs, and question counts all from /api/certifications
 */

import { useState, useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import {
  AppLayout, SEOHead, SkipLink, Input, Button, Badge,
  CertificationsSkeleton, EmptyState,
} from '@/lib/ui';
import {
  Search, Award, Clock, ChevronRight, Sparkles, Check, Plus,
  Cloud, Shield, Database, Brain, Code, Users, Box, Terminal,
  Server, Cpu, Layers, Network, GitBranch, Target, AlertTriangle,
  RefreshCw, BookOpen, Zap,
} from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  estimated_hours?: number;
  estimatedHours?: number;
  exam_code?: string;
  examCode?: string;
  question_count?: number;
  questionCount?: number;
  passing_score?: number;
  passingScore?: number;
  exam_duration?: number;
  examDuration?: number;
}

const iconMap: Record<string, React.ElementType> = {
  cloud: Cloud,
  shield: Shield,
  database: Database,
  brain: Brain,
  code: Code,
  users: Users,
  box: Box,
  terminal: Terminal,
  server: Server,
  cpu: Cpu,
  layers: Layers,
  network: Network,
  infinity: GitBranch,
  'git-branch': GitBranch,
  award: Award,
};

const difficultyConfig: Record<string, { label: string; variant: 'outline' | 'secondary' | 'default'; className: string }> = {
  beginner: { label: 'Beginner', variant: 'outline', className: 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950' },
  intermediate: { label: 'Intermediate', variant: 'outline', className: 'text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950' },
  advanced: { label: 'Advanced', variant: 'outline', className: 'text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950' },
  expert: { label: 'Expert', variant: 'outline', className: 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950' },
};

const categoryLabels: Record<string, string> = {
  cloud: 'Cloud',
  devops: 'DevOps',
  security: 'Security',
  data: 'Data',
  ai: 'AI & ML',
  development: 'Development',
  management: 'Management',
};

function getCertField<T>(cert: Certification, snake: keyof Certification, camel: keyof Certification): T {
  return ((cert[camel] ?? cert[snake]) as T);
}

function useCertifications() {
  return useQuery<Certification[]>({
    queryKey: ['certifications'],
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    queryFn: async () => {
      const url = import.meta.env.DEV
        ? '/api/certifications'
        : (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/data/certifications.json';
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch certifications (${response.status})`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid certifications data');
      return data;
    },
  });
}

function getProgress(certId: string): number {
  try {
    const saved = localStorage.getItem(`cert-progress-${certId}`);
    const ids: string[] = saved ? JSON.parse(saved) : [];
    return ids.length;
  } catch {
    return 0;
  }
}

export default function Certifications() {
  const [, navigate] = useLocation();
  const { data: certifications = [], isLoading, error } = useCertifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startedCerts, setStartedCerts] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('startedCertifications');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const toggleStarted = useCallback((certId: string) => {
    setStartedCerts(prev => {
      const next = new Set(prev);
      next.has(certId) ? next.delete(certId) : next.add(certId);
      try { localStorage.setItem('startedCertifications', JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  }, []);

  // Derive categories dynamically from data
  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const cert of certifications) {
      if (cert.category) seen.add(cert.category);
    }
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
    const matchesCategory = !selectedCategory || cert.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [certifications, searchQuery, selectedCategory]);

  if (isLoading) {
    return <AppLayout><CertificationsSkeleton /></AppLayout>;
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-center max-w-sm">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <h2 className="font-semibold mb-1">Failed to load certifications</h2>
            <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()} icon={<RefreshCw className="w-4 h-4" />}>
            Try Again
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <SEOHead
        title="Certifications - Practice for AWS, Azure, GCP & More"
        description="Practice for AWS, Azure, GCP, Kubernetes, and more certifications with mock exams and guided prep"
        canonical="https://open-interview.github.io/certifications"
      />
      <SkipLink />

      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">

          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Certifications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredCerts.length} certification{filteredCerts.length !== 1 ? 's' : ''} · practice exams &amp; guided prep
            </p>
          </div>

          {/* Search + Category Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search certifications..."
                aria-label="Search certifications"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
                data-testid="input-search-certifications"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant={!selectedCategory ? 'primary' : 'ghost'}
                onClick={() => setSelectedCategory(null)}
                data-testid="filter-category-all"
              >
                All
              </Button>
              {categories.map((cat) => (
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

          {/* Empty State */}
          {filteredCerts.length === 0 ? (
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="No certifications found"
              description="Try a different search term or category filter"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCerts.map((cert) => {
                const IconComponent = iconMap[cert.icon] || Award;
                const isStarted = startedCerts.has(cert.id);
                const questionCount = getCertField<number>(cert, 'question_count', 'questionCount') ?? 0;
                const passingScore = getCertField<number>(cert, 'passing_score', 'passingScore') ?? 70;
                const examDuration = getCertField<number>(cert, 'exam_duration', 'examDuration') ?? 90;
                const examCode = getCertField<string>(cert, 'exam_code', 'examCode');
                const completedCount = getProgress(cert.id);
                const progressPct = questionCount > 0
                  ? Math.min(100, Math.round((completedCount / questionCount) * 100))
                  : 0;
                const hasQuestions = questionCount > 0;
                const diff = difficultyConfig[cert.difficulty] ?? difficultyConfig.intermediate;

                return (
                  <div
                    key={cert.id}
                    className="group flex flex-col p-4 bg-card border border-border rounded-xl hover-elevate transition-all"
                    data-testid={`card-certification-${cert.id}`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4 text-primary" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground truncate">{cert.provider}</p>
                        <h3 className="text-sm font-semibold leading-tight line-clamp-2">{cert.name}</h3>
                        {examCode && (
                          <p className="text-xs text-muted-foreground mt-0.5">{examCode}</p>
                        )}
                      </div>
                      <Badge className={`text-[10px] capitalize shrink-0 ${diff.className}`}>
                        {diff.label}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{cert.description}</p>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary" />
                        {hasQuestions ? `${questionCount} Q` : 'Coming soon'}
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
                    {isStarted && hasQuestions && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-auto">
                      {hasQuestions ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/certification/${cert.id}`)}
                            icon={<BookOpen className="w-3.5 h-3.5" />}
                            data-testid={`button-practice-${cert.id}`}
                          >
                            Practice
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/certification/${cert.id}/exam`)}
                            icon={<Zap className="w-3.5 h-3.5" />}
                            data-testid={`button-mock-exam-${cert.id}`}
                          >
                            Mock Exam
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          disabled
                          icon={<Clock className="w-3.5 h-3.5" />}
                        >
                          Coming Soon
                        </Button>
                      )}

                      <Button
                        variant={isStarted ? 'success' : 'ghost'}
                        size="sm"
                        onClick={() => toggleStarted(cert.id)}
                        title={isStarted ? 'Remove from started' : 'Mark as started'}
                        icon={isStarted ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        data-testid={`button-toggle-started-${cert.id}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
