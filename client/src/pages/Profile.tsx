import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'wouter';
import {
  AppLayout, SEOHead, Switch, SkipLink,
  PageHeader, SectionHeader, GhStatCard, LoadingSpinner,
} from '@/lib/ui';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useGlobalStats } from '../hooks/use-progress';
import { useCredits } from '../context/CreditsContext';
import { useChannelStats } from '../hooks/use-stats';
import { allChannelsConfig } from '../lib/channels-config';
import { channels } from '../lib/data';
import {
  User, Settings, Target, BookOpen, BarChart2,
  CheckCircle2, Layers, Trophy, Flame, Zap, Clock,
  CheckCircle, Boxes, ChartLine, GitBranch, Binary, Puzzle,
  Calculator, Cpu, Terminal, Layout, Server, Database,
  Infinity, Activity, Box, Cloud, Workflow, Brain, Sparkles,
  MessageCircle, Eye, FileText, Code, Shield, Network,
  Smartphone, Gauge, Users, Lock, type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'boxes': Boxes, 'chart-line': ChartLine, 'git-branch': GitBranch, 'binary': Binary,
  'puzzle': Puzzle, 'git-merge': GitBranch, 'calculator': Calculator, 'cpu': Cpu,
  'terminal': Terminal, 'layout': Layout, 'server': Server, 'database': Database,
  'infinity': Infinity, 'activity': Activity, 'box': Box, 'cloud': Cloud, 'layers': Layers,
  'workflow': Workflow, 'brain': Brain, 'sparkles': Sparkles, 'message-circle': MessageCircle,
  'eye': Eye, 'file-text': FileText, 'code': Code, 'shield': Shield, 'network': Network,
  'smartphone': Smartphone, 'check-circle': CheckCircle, 'gauge': Gauge, 'users': Users,
  'lock': Lock,
};

const progressCache = new Map<string, string[]>();

function readLocalStorageProgress(channelId: string): string[] {
  if (progressCache.has(channelId)) return progressCache.get(channelId)!;
  const stored = localStorage.getItem(`progress-${channelId}`);
  let ids: string[] = [];
  try { ids = stored ? JSON.parse(stored) : []; } catch { ids = []; }
  progressCache.set(channelId, ids);
  return ids;
}

function clearProgressCache() { progressCache.clear(); }

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
    const allIds = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('progress-') && !key.startsWith('progress-index')) {
        try {
          const ids: string[] = JSON.parse(localStorage.getItem(key) || '[]');
          ids.forEach(id => allIds.add(id));
        } catch { }
      }
    }
    return allIds.size;
  } catch { return 0; }
}

interface ChannelProgressItem { channelId: string; name: string; completed: number; }

function getRealChannelProgress(): ChannelProgressItem[] {
  const results: ChannelProgressItem[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('progress-') && !key.startsWith('progress-index')) {
        const channelId = key.replace('progress-', '');
        try {
          const ids: string[] = JSON.parse(localStorage.getItem(key) || '[]');
          if (ids.length > 0) {
            const config = allChannelsConfig.find(c => c.id === channelId);
            results.push({ channelId, name: config?.name ?? channelId, completed: ids.length });
          }
        } catch { }
      }
    }
  } catch { }
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
        } catch { }
      }
    }
  } catch { }
  return total;
}

// ── Preferences panel ─────────────────────────────────────────────────────────

interface PreferencesPanelProps {
  preferences: { shuffleQuestions?: boolean; prioritizeUnvisited?: boolean; hideCertifications?: boolean; };
  toggleShuffleQuestions: () => void;
  togglePrioritizeUnvisited: () => void;
  toggleHideCertifications: () => void;
}

function PreferencesPanel({ preferences, toggleShuffleQuestions, togglePrioritizeUnvisited, toggleHideCertifications }: PreferencesPanelProps) {
  return (
    <section className="pt-8 border-t border-[var(--gh-border)]">
      <SectionHeader title="Preferences" icon={<Settings className="w-4 h-4" />} as="h2" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { label: 'Shuffle Questions', desc: 'Randomize question order', checked: !!preferences.shuffleQuestions, onChange: toggleShuffleQuestions, testId: 'switch-shuffle-questions' },
          { label: 'Prioritize Unvisited', desc: 'Show new questions first', checked: !!preferences.prioritizeUnvisited, onChange: togglePrioritizeUnvisited, testId: 'switch-prioritize-unvisited' },
          { label: 'Hide Certifications', desc: 'Hide certification paths', checked: !!preferences.hideCertifications, onChange: toggleHideCertifications, testId: 'switch-hide-certifications' },
        ].map(({ label, desc, checked, onChange, testId }) => (
          <div key={label} className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--gh-fg)]">{label}</h3>
              <p className="text-xs text-[var(--gh-fg-muted)]">{desc}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} aria-label={`Toggle ${label}`} data-testid={testId} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Profile() {
  const { preferences, toggleShuffleQuestions, togglePrioritizeUnvisited, toggleHideCertifications } = useUserPreferences();
  const { stats } = useGlobalStats();
  const { balance } = useCredits();
  const { stats: channelStats, loading: channelStatsLoading } = useChannelStats();

  const [totalCompleted, setTotalCompleted] = useState(0);
  const [channelProgress, setChannelProgress] = useState<ChannelProgressItem[]>([]);
  const [flashcardsDone, setFlashcardsDone] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTotalCompleted(getTotalCompleted());
    setChannelProgress(getRealChannelProgress());
    setFlashcardsDone(getFlashcardProgress());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    window.addEventListener('storage', clearProgressCache);
    return () => window.removeEventListener('storage', clearProgressCache);
  }, []);

  const handleShuffleToggle = useCallback(() => toggleShuffleQuestions(), [toggleShuffleQuestions]);
  const handlePrioritizeToggle = useCallback(() => togglePrioritizeUnvisited(), [togglePrioritizeUnvisited]);
  const handleHideCertToggle = useCallback(() => toggleHideCertifications(), [toggleHideCertifications]);

  const { streak, level, moduleProgress, recentActivity } = useMemo(() => {
    const statsByChannelId = new Map(channelStats.map(s => [s.id, s]));
    const allCompletedIds = new Set<string>();

    const modProgress = channels.map(ch => {
      const apiStat = statsByChannelId.get(ch.id);
      const totalCount = apiStat ? apiStat.total : 0;
      const completedIdsArray = readLocalStorageProgress(ch.id);
      const completedIds = new Set(completedIdsArray);
      Array.from(completedIds).forEach(id => allCompletedIds.add(id));
      const validCompleted = totalCount > 0 ? Math.min(completedIds.size, totalCount) : completedIds.size;
      const pct = totalCount > 0 ? Math.min(100, Math.round((validCompleted / totalCount) * 100)) : 0;
      return { id: ch.id, name: ch.name, completed: validCompleted, total: totalCount, pct, icon: ch.icon };
    }).filter(m => m.total > 0 || m.completed > 0).sort((a, b) => b.pct - a.pct);

    let currentStreak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (stats.find(x => x.date === d.toISOString().split('T')[0])) currentStreak++;
      else break;
    }

    const recent = [...stats].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return { streak: currentStreak, level: Math.floor(balance / 100), moduleProgress: modProgress, recentActivity: recent };
  }, [stats, channelStats, balance]);

  if (isLoading || channelStatsLoading) {
    return (
      <>
        <SEOHead title="Profile & Stats - DevPrep" description="Your learning profile and progress" canonical="/profile" />
        <AppLayout>
          <div className="bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
              <PageHeader title="Profile & Stats" subtitle="Stats are tracked locally in your browser — no account needed." className="mb-0" />
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <LoadingSpinner fullPage label="Loading profile…" />
          </div>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Profile & Stats - DevPrep" description="Your learning profile and progress" canonical="/profile" />
      <AppLayout>
        <SkipLink />
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <PageHeader title="Profile & Stats" subtitle="Stats are tracked locally in your browser — no account needed." className="mb-0" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8" id="main-content">
          <div className="space-y-8">

            {/* Overview stats */}
            <section>
              <SectionHeader title="Overview" icon={<BarChart2 className="w-4 h-4" />} as="h2" className="mb-3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <GhStatCard label="Questions answered" value={totalCompleted} icon={<CheckCircle2 className="w-5 h-5" />} />
                <GhStatCard label="Channels studied" value={channelProgress.length} icon={<Layers className="w-5 h-5" />} />
                <GhStatCard label="Flashcards reviewed" value={flashcardsDone} icon={<BookOpen className="w-5 h-5" />} />
                <GhStatCard label="Day streak" value={streak} icon={<Flame className="w-5 h-5 text-[var(--gh-attention-fg)]" />} />
              </div>
            </section>

            {/* XP & Level */}
            <section>
              <div className="grid grid-cols-2 gap-3">
                <GhStatCard label="Total XP" value={balance.toLocaleString()} icon={<Zap className="w-5 h-5 text-[var(--gh-accent-fg)]" />} />
                <GhStatCard label="Level" value={level} icon={<Trophy className="w-5 h-5 text-[var(--gh-attention-fg)]" />} />
              </div>
            </section>

            {/* Channel breakdown table */}
            {moduleProgress.length > 0 && (
              <section>
                <SectionHeader title="Channel Breakdown" icon={<Target className="w-4 h-4" />} as="h2" className="mb-3" />
                <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)]">
                        {['Channel', 'Progress', 'Done'].map((h, i) => (
                          <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--gh-fg-muted)]${i === 2 ? ' text-right' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--gh-border)]">
                      {moduleProgress.map(mod => {
                        const ChannelIcon = iconMap[mod.icon] || Boxes;
                        return (
                          <tr key={mod.id} className="hover:bg-[var(--gh-canvas-subtle)] transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <ChannelIcon className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                                <span className="text-sm font-medium text-[var(--gh-fg)]">{mod.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 min-w-[140px]">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-[var(--gh-canvas-inset)] border border-[var(--gh-border-muted)] rounded-full overflow-hidden">
                                  <div className="h-full bg-[var(--gh-success-emphasis)] transition-all duration-500" style={{ width: `${mod.pct}%` }} />
                                </div>
                                <span className="text-xs font-medium text-[var(--gh-fg-muted)] w-8">{mod.pct}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-[var(--gh-fg-muted)] text-right">{mod.completed} / {mod.total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Channel progress quick links */}
            <section>
              <SectionHeader title="Channel Progress" icon={<Target className="w-4 h-4" />} as="h2" className="mb-3" />
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
                  {channelProgress.map(item => (
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

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <section>
                <SectionHeader title="Recent Activity" icon={<Clock className="w-4 h-4" />} as="h2" className="mb-3" />
                <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md shadow-sm divide-y divide-[var(--gh-border)]">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] flex items-center justify-center">
                          <BarChart2 className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--gh-fg)]">Study Session</p>
                          <p className="text-xs text-[var(--gh-fg-muted)]">{activity.date}</p>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-[var(--gh-success-fg)] bg-[var(--gh-success-subtle)] px-2 py-0.5 rounded-full border border-[var(--gh-success-fg)]/20">
                        Check-in
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Preferences */}
            <PreferencesPanel
              preferences={preferences}
              toggleShuffleQuestions={handleShuffleToggle}
              togglePrioritizeUnvisited={handlePrioritizeToggle}
              toggleHideCertifications={handleHideCertToggle}
            />

          </div>
        </div>
      </AppLayout>
    </>
  );
}
