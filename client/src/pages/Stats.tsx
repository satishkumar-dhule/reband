import { useMemo, useEffect } from 'react';
import {
  AppLayout, SEOHead, SkipLink, StatsSkeleton, Badge,
  PageHeader, SectionHeader, GhStatCard,
} from '@/lib/ui';
import { useGlobalStats } from '../hooks/use-progress';
import { useCredits } from '../context/CreditsContext';
import { channels } from '../lib/data';
import { useChannelStats } from '../hooks/use-stats';
import {
  Trophy, Flame, Zap, Target, CheckCircle2, Clock, BarChart2,
  Boxes, ChartLine, GitBranch, Binary, Puzzle, Calculator, Cpu, Terminal,
  Layout, Server, Database, Infinity, Activity, Box, Cloud, Layers, Workflow,
  Brain, Sparkles, MessageCircle, Eye, FileText, Code, Shield, Network,
  Smartphone, CheckCircle, Gauge, Users, Lock, type LucideIcon,
} from 'lucide-react';

const progressCache = new Map<string, string[]>();
let cacheInitialized = false;

function readLocalStorageProgress(channelId: string): string[] {
  if (progressCache.has(channelId)) return progressCache.get(channelId)!;
  try {
    const ids = JSON.parse(localStorage.getItem(`progress-${channelId}`) || '[]');
    progressCache.set(channelId, Array.isArray(ids) ? ids : []);
  } catch { progressCache.set(channelId, []); }
  return progressCache.get(channelId)!;
}

function clearProgressCache() { progressCache.clear(); cacheInitialized = false; }

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

export default function Stats() {
  const { stats } = useGlobalStats();
  const { balance } = useCredits();
  const { stats: channelStats, loading: channelStatsLoading } = useChannelStats();
  const isLoading = (stats.length === 0 && channelStatsLoading) || channelStatsLoading;

  useEffect(() => {
    window.addEventListener('storage', clearProgressCache);
    return () => window.removeEventListener('storage', clearProgressCache);
  }, []);

  const { totalCompleted, totalQuestions, streak, moduleProgress, recentActivity } = useMemo(() => {
    const statsByChannelId = new Map(channelStats.map(s => [s.id, s]));
    const allCompletedIds = new Set<string>();

    const modProgress = channels.map(ch => {
      const apiStat = statsByChannelId.get(ch.id);
      const totalCount = apiStat ? apiStat.total : 0;
      const completedIdsArr = readLocalStorageProgress(ch.id);
      const completedSet = new Set(completedIdsArr);
      completedSet.forEach(id => allCompletedIds.add(id));
      const validCompleted = totalCount > 0 ? Math.min(completedSet.size, totalCount) : completedSet.size;
      const pct = totalCount > 0 ? Math.min(100, Math.round((validCompleted / totalCount) * 100)) : 0;
      return { id: ch.id, name: ch.name, completed: validCompleted, total: totalCount, pct, icon: ch.icon };
    }).filter(m => m.total > 0 || m.completed > 0).sort((a, b) => b.pct - a.pct);

    let currentStreak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (stats.find(x => x.date === d.toISOString().split('T')[0])) currentStreak++;
      else break;
    }

    const recent = [...stats].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    const totalQuestionsCount = channelStats.reduce((sum, s) => sum + s.total, 0);

    return { totalCompleted: allCompletedIds.size, totalQuestions: totalQuestionsCount, streak: currentStreak, moduleProgress: modProgress, recentActivity: recent };
  }, [stats, channelStats]);

  if (isLoading) {
    return (
      <>
        <SEOHead title="Progress Stats | DevPrep" description="Track your interview preparation progress" />
        <StatsSkeleton />
      </>
    );
  }

  const level = Math.floor(balance / 100);

  return (
    <>
      <SEOHead title="Progress Stats | DevPrep" description="Track your interview preparation progress" />
      <SkipLink />

      <AppLayout>
        {/* ── Page Header — same shell as AllChannels / Certifications ── */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <PageHeader title="Progress Stats" subtitle="Your interview preparation at a glance" className="mb-0" />
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8" id="main-content">

          {/* Stat overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <GhStatCard data-testid="stat-total-completed" label="Total Completed" value={totalCompleted} valueSuffix={`/ ${totalQuestions}`} icon={<CheckCircle2 className="w-4 h-4" />} />
            <GhStatCard data-testid="stat-streak" label="Current Streak" value={streak} valueSuffix="days" icon={<Flame className="w-4 h-4 text-orange-500" />} />
            <GhStatCard data-testid="stat-xp" label="Total XP" value={balance.toLocaleString()} icon={<Zap className="w-4 h-4 text-primary" />} />
            <GhStatCard data-testid="stat-level" label="Level" value={level} icon={<Trophy className="w-4 h-4 text-yellow-500" />} />
          </div>

          {/* Channel Breakdown */}
          <div className="mb-8">
            <SectionHeader title="Channel Breakdown" icon={<Target className="w-5 h-5" />} />
            <div className="bg-card border border-border rounded-md overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {['Channel', 'Progress', 'Completed'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground${i === 2 ? ' text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {moduleProgress.map(mod => {
                    const ChannelIcon = iconMap[mod.icon] || Boxes;
                    return (
                      <tr key={mod.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ChannelIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{mod.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 min-w-[150px]">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${mod.pct}%` }} />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground w-8">{mod.pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground text-right">{mod.completed} / {mod.total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <SectionHeader title="Recent Activity" icon={<Clock className="w-5 h-5" />} />
            <div className="bg-card border border-border rounded-md">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                          <BarChart2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Study Session</p>
                          <p className="text-xs text-muted-foreground">{activity.date}</p>
                        </div>
                      </div>
                      <Badge className="text-[10px] text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40">
                        Check-in
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  <p className="text-sm">No recent activity found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
