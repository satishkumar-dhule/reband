import { useMemo, useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useGlobalStats } from '../hooks/use-progress';
import { useCredits } from '../context/CreditsContext';
import { channels, getQuestions, getAllQuestions } from '../lib/data';
import { SEOHead } from '../components/SEOHead';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '../components/ui/breadcrumb';
import {
  Trophy,
  Flame,
  Zap,
  Target,
  Home,
  CheckCircle2,
  Clock,
  BarChart2
} from 'lucide-react';

export default function StatsGenZ() {
  const { stats } = useGlobalStats();
  const { balance } = useCredits();
  const [localStorageKey, setLocalStorageKey] = useState(0);

  useEffect(() => {
    const handleStorage = () => setLocalStorageKey(k => k + 1);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const { totalCompleted, totalQuestions, streak, moduleProgress, recentActivity } = useMemo(() => {
    const allQuestions = getAllQuestions();
    const allCompletedIds = new Set<string>();

    const modProgress = channels.map(ch => {
      const questions = getQuestions(ch.id);
      const stored = localStorage.getItem(`progress-${ch.id}`);
      const completedIds = stored ? new Set(JSON.parse(stored)) : new Set();

      Array.from(completedIds).forEach((id) => allCompletedIds.add(id as string));

      const validCompleted = Math.min(completedIds.size, questions.length);
      const pct = questions.length > 0 ? Math.min(100, Math.round((validCompleted / questions.length) * 100)) : 0;

      return {
        id: ch.id,
        name: ch.name,
        completed: validCompleted,
        total: questions.length,
        pct,
        icon: ch.icon
      };
    }).filter(m => m.total > 0).sort((a, b) => b.pct - a.pct);

    let currentStreak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (stats.find(x => x.date === d.toISOString().split('T')[0])) currentStreak++;
      else break;
    }

    const recent = [...stats]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      totalCompleted: allCompletedIds.size,
      totalQuestions: allQuestions.length,
      streak: currentStreak,
      moduleProgress: modProgress,
      recentActivity: recent
    };
  }, [stats, localStorageKey]);

  const level = Math.floor(balance / 100);

  return (
    <>
      <SEOHead
        title="Progress Stats - DevPrep"
        description="Track your interview preparation progress"
      />

      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 bg-[var(--gh-canvas-subtle)] min-h-screen">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <Home className="w-4 h-4" />
                  <span className="ml-1 text-[var(--gh-fg)]">Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[var(--gh-fg-muted)]">Stats</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[var(--gh-fg)]">Progress Stats</h1>
          </div>

          {/* Stats Overview Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md p-4 shadow-sm hover:scale-[1.02] hover:shadow-md hover:border-[var(--gh-accent-fg)] transition-all duration-200 cursor-default">
              <div className="flex items-center gap-2 text-[var(--gh-fg-muted)] mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Total Completed</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[var(--gh-fg)]">{totalCompleted}</span>
                <span className="text-sm text-[var(--gh-fg-muted)]">/ {totalQuestions}</span>
              </div>
            </div>

            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md p-4 shadow-sm hover:scale-[1.02] hover:shadow-md hover:border-[var(--gh-accent-fg)] transition-all duration-200 cursor-default">
              <div className="flex items-center gap-2 text-[var(--gh-fg-muted)] mb-2">
                <Flame className="w-4 h-4 text-[var(--gh-attention-fg)]" />
                <span className="text-sm font-medium">Current Streak</span>
              </div>
              <div className="text-2xl font-bold text-[var(--gh-fg)]">{streak} days</div>
            </div>

            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md p-4 shadow-sm hover:scale-[1.02] hover:shadow-md hover:border-[var(--gh-accent-fg)] transition-all duration-200 cursor-default">
              <div className="flex items-center gap-2 text-[var(--gh-fg-muted)] mb-2">
                <Zap className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                <span className="text-sm font-medium">Total XP</span>
              </div>
              <div className="text-2xl font-bold text-[var(--gh-fg)]">{balance.toLocaleString()}</div>
            </div>

            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md p-4 shadow-sm hover:scale-[1.02] hover:shadow-md hover:border-[var(--gh-accent-fg)] transition-all duration-200 cursor-default">
              <div className="flex items-center gap-2 text-[var(--gh-fg-muted)] mb-2">
                <Trophy className="w-4 h-4 text-[var(--gh-attention-fg)]" />
                <span className="text-sm font-medium">Level</span>
              </div>
              <div className="text-2xl font-bold text-[var(--gh-fg)]">{level}</div>
            </div>
          </div>

          {/* Channel Breakdown */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[var(--gh-fg-muted)]" />
              <h2 className="text-lg font-semibold text-[var(--gh-fg)]">Channel Breakdown</h2>
            </div>
            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md shadow-sm overflow-x-auto">
              <div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)]">
                      <th className="px-4 py-2 text-sm font-semibold text-[var(--gh-fg-muted)]">Channel</th>
                      <th className="px-4 py-2 text-sm font-semibold text-[var(--gh-fg-muted)]">Progress</th>
                      <th className="px-4 py-2 text-sm font-semibold text-[var(--gh-fg-muted)] text-right">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--gh-border)]">
                    {moduleProgress.map((mod) => (
                      <tr key={mod.id} className="hover:bg-[var(--gh-canvas-subtle)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{mod.icon}</span>
                            <span className="text-sm font-medium text-[var(--gh-fg)]">{mod.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 min-w-[150px]">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-[var(--gh-canvas-inset)] border border-[var(--gh-border-muted)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[var(--gh-success-emphasis)] transition-all duration-500"
                                style={{ width: `${mod.pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-[var(--gh-fg-muted)] w-8">{mod.pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--gh-fg-muted)] text-right">
                          {mod.completed} / {mod.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[var(--gh-fg-muted)]" />
              <h2 className="text-lg font-semibold text-[var(--gh-fg)]">Recent Activity</h2>
            </div>
            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md shadow-sm">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-[var(--gh-border)]">
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
              ) : (
                <div className="px-4 py-8 text-center text-[var(--gh-fg-muted)]">
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
