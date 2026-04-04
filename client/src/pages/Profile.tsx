import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useGlobalStats } from '../hooks/use-progress';
import { useCredits } from '../context/CreditsContext';
import { useChannelStats } from '../hooks/use-stats';
import { allChannelsConfig } from '../lib/channels-config';
import { channels } from '../lib/data';
import {
  User, Settings, Target, BookOpen, Home,
  BarChart2, CheckCircle2, Layers, Trophy, Flame,
  Zap, Clock, CheckCircle, Boxes, ChartLine, GitBranch,
  Binary, Puzzle, Calculator, Cpu, Terminal, Layout,
  Server, Database, Infinity, Activity, Box, Cloud,
  Workflow, Brain, Sparkles, MessageCircle, Eye,
  FileText, Code, Shield, Network, Smartphone, Gauge,
  Users, Lock, type LucideIcon
} from 'lucide-react';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator
} from '../components/ui/breadcrumb';
import { Switch } from '@/components/ui/switch';

// ── Icon map for channel icons ─────────────────────────────────────────────────
const iconMap: Record<string, LucideIcon> = {
  'boxes': Boxes, 'chart-line': ChartLine, 'git-branch': GitBranch,
  'binary': Binary, 'puzzle': Puzzle, 'git-merge': GitBranch,
  'calculator': Calculator, 'cpu': Cpu, 'terminal': Terminal,
  'layout': Layout, 'server': Server, 'database': Database,
  'infinity': Infinity, 'activity': Activity, 'box': Box,
  'cloud': Cloud, 'layers': Layers, 'workflow': Workflow,
  'brain': Brain, 'sparkles': Sparkles, 'message-circle': MessageCircle,
  'eye': Eye, 'file-text': FileText, 'code': Code, 'shield': Shield,
  'network': Network, 'smartphone': Smartphone, 'check-circle': CheckCircle,
  'gauge': Gauge, 'users': Users, 'lock': Lock,
};

// ── Module-level cache for localStorage progress ───────────────────────────────
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

// ── Sub-components ─────────────────────────────────────────────────────────────
interface StatCardProps { icon: React.ReactNode; label: string; value: number | string; }

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex flex-col items-center gap-1 text-center hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-default">
      <div className="text-[var(--gh-fg-muted)]">{icon}</div>
      <div className="text-2xl font-bold text-[var(--gh-fg)]">{value}</div>
      <div className="text-xs text-[var(--gh-fg-muted)]">{label}</div>
    </div>
  );
}

interface PreferencesPanelProps {
  preferences: { shuffleQuestions?: boolean; prioritizeUnvisited?: boolean; hideCertifications?: boolean; };
  toggleShuffleQuestions: () => void;
  togglePrioritizeUnvisited: () => void;
  toggleHideCertifications: () => void;
}

function PreferencesPanel({ preferences, toggleShuffleQuestions, togglePrioritizeUnvisited, toggleHideCertifications }: PreferencesPanelProps) {
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
          <Switch checked={!!preferences.shuffleQuestions} onCheckedChange={toggleShuffleQuestions} aria-label="Toggle shuffle questions" data-testid="switch-shuffle-questions" />
        </div>
        <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--gh-fg)]">Prioritize Unvisited</h3>
            <p className="text-xs text-[var(--gh-fg-muted)]">Show new questions first</p>
          </div>
          <Switch checked={!!preferences.prioritizeUnvisited} onCheckedChange={togglePrioritizeUnvisited} aria-label="Toggle prioritize unvisited" data-testid="switch-prioritize-unvisited" />
        </div>
        <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--gh-fg)]">Hide Certifications</h3>
            <p className="text-xs text-[var(--gh-fg-muted)]">Hide certification paths</p>
          </div>
          <Switch checked={!!preferences.hideCertifications} onCheckedChange={toggleHideCertifications} aria-label="Toggle hide certifications" data-testid="switch-hide-certifications" />
        </div>
      </div>
    </section>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
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
    const handleStorage = () => clearProgressCache();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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

    const recent = [...stats]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      streak: currentStreak,
      level: Math.floor(balance / 100),
      moduleProgress: modProgress,
      recentActivity: recent,
    };
  }, [stats, channelStats, balance]);

  if (isLoading || channelStatsLoading) {
    return (
      <>
        <SEOHead title="Profile & Stats - DevPrep" description="Your learning profile and progress" canonical="/profile" />
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
      <SEOHead title="Profile & Stats - DevPrep" description="Your learning profile and progress" canonical="/profile" />
      <AppLayout>
        <div className="bg-[var(--gh-canvas-subtle)] min-h-screen" id="main-content">
          <div className="max-w-3xl mx-auto px-4 py-8">

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
                  <BreadcrumbPage>Profile & Stats</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-[var(--gh-fg-muted)]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[var(--gh-fg)]">My Profile & Stats</h1>
                <p className="text-sm text-[var(--gh-fg-muted)]">
                  Stats are tracked locally in your browser — no account needed.
                </p>
              </div>
            </div>

            <div className="space-y-8">

              {/* Quick overview row */}
              <section>
                <h2 className="text-base font-semibold text-[var(--gh-fg)] mb-3 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Overview
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Questions answered" value={totalCompleted} />
                  <StatCard icon={<Layers className="w-5 h-5" />} label="Channels studied" value={channelsWorkedOn} />
                  <StatCard icon={<BookOpen className="w-5 h-5" />} label="Flashcards reviewed" value={flashcardsDone} />
                  <StatCard icon={<Flame className="w-5 h-5 text-[var(--gh-attention-fg)]" />} label="Day streak" value={streak} />
                </div>
              </section>

              {/* XP & Level row */}
              <section>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center gap-3 hover:shadow-sm transition-shadow">
                    <Zap className="w-5 h-5 text-[var(--gh-accent-fg)] flex-shrink-0" />
                    <div>
                      <div className="text-xs text-[var(--gh-fg-muted)]">Total XP</div>
                      <div className="text-xl font-bold text-[var(--gh-fg)]">{balance.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center gap-3 hover:shadow-sm transition-shadow">
                    <Trophy className="w-5 h-5 text-[var(--gh-attention-fg)] flex-shrink-0" />
                    <div>
                      <div className="text-xs text-[var(--gh-fg-muted)]">Level</div>
                      <div className="text-xl font-bold text-[var(--gh-fg)]">{level}</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Channel breakdown with progress bars */}
              {moduleProgress.length > 0 && (
                <section>
                  <h2 className="text-base font-semibold text-[var(--gh-fg)] mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Channel Breakdown
                  </h2>
                  <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)]">
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--gh-fg-muted)]">Channel</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--gh-fg-muted)]">Progress</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--gh-fg-muted)] text-right">Done</th>
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
                              <td className="px-4 py-3 text-sm text-[var(--gh-fg-muted)] text-right">
                                {mod.completed} / {mod.total}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Per-channel quick links */}
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
                  <h2 className="text-base font-semibold text-[var(--gh-fg)] mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Activity
                  </h2>
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
        </div>
      </AppLayout>
    </>
  );
}
