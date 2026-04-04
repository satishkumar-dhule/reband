import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { allChannelsConfig } from '../lib/channels-config';
import {
  User, Settings, Target, BookOpen, Home,
  BarChart2, CheckCircle2, Layers
} from 'lucide-react';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator
} from '../components/ui/breadcrumb';
import { Switch } from '@/components/ui/switch';

// ── Real data helpers (localStorage only) ─────────────────────────────────────

function getTotalCompleted(): number {
  try {
    const allProgress = localStorage.getItem('allProgress');
    if (allProgress) {
      const progress = JSON.parse(allProgress);
      if (Array.isArray(progress)) return progress.length;
      if (typeof progress === 'object') {
        return Object.values(progress).reduce((acc: number, ids: unknown) => {
          if (Array.isArray(ids)) return acc + ids.length;
          return acc;
        }, 0);
      }
    }
    // Fallback: scan progress-* keys
    const allIds = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('progress-') && !key.startsWith('progress-index')) {
        try {
          const ids: string[] = JSON.parse(localStorage.getItem(key) || '[]');
          ids.forEach(id => allIds.add(id));
        } catch { /* skip */ }
      }
    }
    return allIds.size;
  } catch {
    return 0;
  }
}

interface ChannelProgress {
  channelId: string;
  name: string;
  completed: number;
}

function getRealChannelProgress(): ChannelProgress[] {
  const results: ChannelProgress[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('progress-') && !key.startsWith('progress-index')) {
        const channelId = key.replace('progress-', '');
        try {
          const ids: string[] = JSON.parse(localStorage.getItem(key) || '[]');
          if (ids.length > 0) {
            const config = allChannelsConfig.find(c => c.id === channelId);
            results.push({
              channelId,
              name: config?.name ?? channelId,
              completed: ids.length,
            });
          }
        } catch { /* skip */ }
      }
    }
  } catch { /* skip */ }
  return results.sort((a, b) => b.completed - a.completed);
}

function getFlashcardProgress(): number {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('flashcards-v2-progress-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          total += Object.values(data).filter((p: unknown) => (p as { seen?: boolean }).seen).length;
        } catch { /* skip */ }
      }
    }
  } catch { /* skip */ }
  return total;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex flex-col items-center gap-1 text-center">
      <div className="text-[var(--gh-fg-muted)]">{icon}</div>
      <div className="text-2xl font-bold text-[var(--gh-fg)]">{value}</div>
      <div className="text-xs text-[var(--gh-fg-muted)]">{label}</div>
    </div>
  );
}

interface PreferencesPanelProps {
  preferences: {
    shuffleQuestions?: boolean;
    prioritizeUnvisited?: boolean;
    hideCertifications?: boolean;
  };
  toggleShuffleQuestions: () => void;
  togglePrioritizeUnvisited: () => void;
  toggleHideCertifications: () => void;
}

function PreferencesPanel({
  preferences,
  toggleShuffleQuestions,
  togglePrioritizeUnvisited,
  toggleHideCertifications,
}: PreferencesPanelProps) {
  return (
    <section className="pt-8 border-t border-[var(--gh-border)]">
      <h2 className="text-base font-semibold text-[var(--gh-fg)] mb-4 flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Preferences
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--gh-fg)]">Shuffle Questions</h3>
            <p className="text-xs text-[var(--gh-fg-muted)]">Randomize question order</p>
          </div>
          <Switch
            checked={!!preferences.shuffleQuestions}
            onCheckedChange={toggleShuffleQuestions}
            aria-label="Toggle shuffle questions"
            data-testid="switch-shuffle-questions"
          />
        </div>
        <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--gh-fg)]">Prioritize Unvisited</h3>
            <p className="text-xs text-[var(--gh-fg-muted)]">Show new questions first</p>
          </div>
          <Switch
            checked={!!preferences.prioritizeUnvisited}
            onCheckedChange={togglePrioritizeUnvisited}
            aria-label="Toggle prioritize unvisited"
            data-testid="switch-prioritize-unvisited"
          />
        </div>
        <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--gh-fg)]">Hide Certifications</h3>
            <p className="text-xs text-[var(--gh-fg-muted)]">Hide certification paths</p>
          </div>
          <Switch
            checked={!!preferences.hideCertifications}
            onCheckedChange={toggleHideCertifications}
            aria-label="Toggle hide certifications"
            data-testid="switch-hide-certifications"
          />
        </div>
      </div>
    </section>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Profile() {
  const { preferences, toggleShuffleQuestions, togglePrioritizeUnvisited, toggleHideCertifications } = useUserPreferences();
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [channelProgress, setChannelProgress] = useState<ChannelProgress[]>([]);
  const [flashcardsDone, setFlashcardsDone] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTotalCompleted(getTotalCompleted());
    setChannelProgress(getRealChannelProgress());
    setFlashcardsDone(getFlashcardProgress());
    setIsLoading(false);
  }, []);

  const handleShuffleToggle = useCallback(() => toggleShuffleQuestions(), [toggleShuffleQuestions]);
  const handlePrioritizeToggle = useCallback(() => togglePrioritizeUnvisited(), [togglePrioritizeUnvisited]);
  const handleHideCertToggle = useCallback(() => toggleHideCertifications(), [toggleHideCertifications]);

  if (isLoading) {
    return (
      <>
        <SEOHead title="Profile - DevPrep" description="Your learning profile and progress" canonical="/profile" />
        <AppLayout>
          <div className="bg-[var(--gh-canvas-subtle)] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-6">
              <div className="h-6 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded w-48" />
              <div className="h-32 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md" />
              <div className="h-64 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md" />
            </div>
          </div>
        </AppLayout>
      </>
    );
  }

  const channelsWorkedOn = channelProgress.length;

  return (
    <>
      <SEOHead title="Profile - DevPrep" description="Your learning profile and progress" canonical="/profile" />
      <AppLayout>
        <div className="bg-[var(--gh-canvas-subtle)] min-h-screen" id="main-content">
          <div className="max-w-3xl mx-auto px-4 py-8">

            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-[var(--gh-fg-muted)]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[var(--gh-fg)]">My Progress</h1>
                <p className="text-sm text-[var(--gh-fg-muted)]">
                  Stats are tracked locally in your browser — no account needed.
                </p>
              </div>
            </div>

            <div className="space-y-8">

              {/* Stats overview */}
              <section>
                <h2 className="text-base font-semibold text-[var(--gh-fg)] mb-3 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Overview
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    label="Questions answered"
                    value={totalCompleted}
                  />
                  <StatCard
                    icon={<Layers className="w-5 h-5" />}
                    label="Channels studied"
                    value={channelsWorkedOn}
                  />
                  <StatCard
                    icon={<BookOpen className="w-5 h-5" />}
                    label="Flashcards reviewed"
                    value={flashcardsDone}
                  />
                </div>
              </section>

              {/* Per-channel progress */}
              <section>
                <h2 className="text-base font-semibold text-[var(--gh-fg)] mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Channel Progress
                </h2>

                {channelProgress.length === 0 ? (
                  <div className="p-8 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] text-center">
                    <BookOpen className="w-8 h-8 text-[var(--gh-fg-muted)] mx-auto mb-3" />
                    <p className="text-sm font-medium text-[var(--gh-fg)]">No questions answered yet</p>
                    <p className="text-xs text-[var(--gh-fg-muted)] mt-1">
                      Visit any channel and start answering questions — your progress will show up here.
                    </p>
                    <Link href="/" className="inline-block mt-4 text-xs text-[var(--gh-accent-fg)] hover:underline">
                      Browse channels →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {channelProgress.map((item) => (
                      <Link
                        key={item.channelId}
                        href={`/channel/${item.channelId}`}
                        className="block p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] hover:border-[var(--gh-accent-fg)] transition-colors group"
                        data-testid={`channel-progress-${item.channelId}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-md bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                            </div>
                            <span className="text-sm font-medium text-[var(--gh-fg)] group-hover:text-[var(--gh-accent-fg)] transition-colors truncate">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-[var(--gh-fg)] flex-shrink-0">
                            {item.completed} <span className="text-[var(--gh-fg-muted)] font-normal text-xs">answered</span>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Preferences */}
              <PreferencesPanel
                preferences={preferences}
                toggleShuffleQuestions={handleShuffleToggle}
                togglePrioritizeUnvisited={handlePrioritizeToggle}
                toggleHideCertifications={handleHideCertToggle}
              />

            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
