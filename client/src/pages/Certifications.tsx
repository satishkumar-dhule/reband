/**
 * Certifications Page
 * Compact, consistent design — efficient use of space
 */

import { useState, useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { SkipLink } from '@/components/unified/SkipLink';
import { Input } from '../components/ui/input';
import { CertificationsSkeleton } from '../components/skeletons/PageSkeletons';
import {
  Search, Award, Clock, ChevronRight, Sparkles, Check, Plus,
  Cloud, Shield, Database, Brain, Code, Users, Box, Terminal, Server, Cpu,
  Layers, Network, GitBranch, Loader2, Target, AlertTriangle, RefreshCw,
  BookOpen, Zap, TrendingUp
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
  estimatedHours: number;
  examCode?: string;
  questionCount: number;
  passingScore: number;
  examDuration: number;
}

const iconMap: Record<string, any> = {
  'cloud': Cloud,
  'shield': Shield,
  'database': Database,
  'brain': Brain,
  'code': Code,
  'users': Users,
  'box': Box,
  'terminal': Terminal,
  'server': Server,
  'cpu': Cpu,
  'layers': Layers,
  'network': Network,
  'infinity': GitBranch,
  'award': Award,
};

const categories = [
  { id: 'cloud', name: 'Cloud' },
  { id: 'devops', name: 'DevOps' },
  { id: 'security', name: 'Security' },
  { id: 'data', name: 'Data' },
  { id: 'ai', name: 'AI & ML' },
  { id: 'development', name: 'Development' },
  { id: 'management', name: 'Management' },
];

const difficultyColors: Record<string, string> = {
  beginner: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950',
  intermediate: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950',
  advanced: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950',
  expert: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950',
};

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
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
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

          {/* ── Page Header ─────────────────────── */}
          <div className="mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Certifications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredCerts.length} certifications · practice exams &amp; guided prep
            </p>
          </div>

          {/* ── Search + Filters ────────────────── */}
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
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* ── Certifications Grid ──────────────── */}
          {filteredCerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2 text-center">
              <Search className="w-8 h-8 text-muted-foreground/40" />
              <h3 className="font-semibold">No certifications found</h3>
              <p className="text-sm text-muted-foreground">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCerts.map((cert) => {
                const IconComponent = iconMap[cert.icon] || Award;
                const isStarted = startedCerts.has(cert.id);
                const completedCount = getProgress(cert.id);
                const progressPct = cert.questionCount > 0
                  ? Math.min(100, Math.round((completedCount / cert.questionCount) * 100))
                  : 0;
                const hasQuestions = cert.questionCount > 0;

                return (
                  <div
                    key={cert.id}
                    className="group flex flex-col p-4 bg-card border border-border rounded-xl hover-elevate transition-all"
                  >
                    {/* Card Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4 text-primary" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground truncate">{cert.provider}</p>
                        <h3 className="text-sm font-semibold leading-tight line-clamp-2">{cert.name}</h3>
                        {cert.examCode && (
                          <p className="text-xs text-muted-foreground mt-0.5">{cert.examCode}</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize shrink-0 ${difficultyColors[cert.difficulty] ?? ''}`}>
                        {cert.difficulty}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{cert.description}</p>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary" />
                        {cert.questionCount > 0 ? `${cert.questionCount} Q` : 'Coming soon'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        {cert.examDuration}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-primary" />
                        {cert.passingScore}% pass
                      </span>
                    </div>

                    {/* Progress bar (only when started and has questions) */}
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
                          <button
                            onClick={() => navigate(`/certification/${cert.id}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
                            data-testid={`button-practice-${cert.id}`}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            Practice
                          </button>
                          <button
                            onClick={() => navigate(`/certification/${cert.id}/exam`)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium transition-colors hover:bg-primary/90"
                            data-testid={`button-mock-exam-${cert.id}`}
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Mock Exam
                          </button>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Questions Coming Soon
                        </div>
                      )}

                      <button
                        onClick={() => toggleStarted(cert.id)}
                        title={isStarted ? 'Remove from started' : 'Mark as started'}
                        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors shrink-0 ${
                          isStarted
                            ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        data-testid={`button-toggle-started-${cert.id}`}
                      >
                        {isStarted ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
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
