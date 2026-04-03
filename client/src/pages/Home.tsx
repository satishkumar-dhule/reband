import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import React, { useMemo, useCallback, lazy, Suspense } from "react";
import {
  Mic, Code, RotateCcw, BookOpen, ChevronRight,
  Flame, CheckCircle2, Layers, TrendingUp,
  Clock, BookMarked, Activity, Brain, Award,
  Circle, Star, GitFork, AlertCircle, Coins
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { SEOHead } from "@/components/SEOHead";
import { SkipLink } from "@/components/unified/SkipLink";
import { allChannelsConfig } from "../lib/channels-config";
import { cn } from "../lib/utils";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "../components/ui/breadcrumb";
import { useCredits } from "../context/CreditsContext";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { useAchievementContext } from "../context/AchievementContext";
import { Button } from "@/components/unified/Button";
import { HomeSkeleton } from "@/components/skeletons/PageSkeletons";
import { t } from "@/lib/i18n";

// Lazy-load ContributionGrid to not block initial paint
const ContributionGrid = lazy(() => import("./ContributionGrid"));

interface ApiChannel {
  id: string;
  questionCount: number;
}

/**
 * Data fetching with TanStack Query - proper caching, staleTime, and deduplication.
 * No more raw useEffect + fetch that bypasses the cache.
 */
function useApiChannels() {
  return useQuery<ApiChannel[]>({
    queryKey: ['channels'],
    staleTime: Infinity, // Static data - never refetch
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    queryFn: async () => {
      const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/';
      const response = await fetch(`${basePath}data/channels.json`);
      if (!response.ok) throw new Error(`Failed to fetch channels: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No channels available');
      }
      return data;
    },
  });
}

// Isolated CreditsChip component to prevent re-renders of entire page on balance change
const CreditsChip = React.memo(function CreditsChip() {
  const { balance } = useCredits();
  return (
    <section className="gh-card p-4">
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-[var(--gh-attention-fg)]" />
        <h2 className="text-sm font-semibold text-[var(--gh-fg)]">{t('home.credits')}</h2>
      </div>
      <div className="mt-3 text-center">
        <p className="text-2xl font-bold text-[var(--gh-fg)]">{balance.toLocaleString()}</p>
        <p className="text-xs text-[var(--gh-fg-muted)]">{t('home.credits.available')}</p>
      </div>
      <Link 
        href="/profile" 
        className="block mt-3 text-xs text-center text-[var(--gh-accent-fg)] hover:underline"
      >
        {t('home.credits.view')}
      </Link>
    </section>
  );
});

function getProgress(channelId: string, total: number) {
  try {
    const stored = localStorage.getItem(`progress-${channelId}`);
    const completed = stored ? JSON.parse(stored).length : 0;
    return { completed, pct: total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0 };
  } catch {
    return { completed: 0, pct: 0 };
  }
}

// Hook to generate recent activity from real user data
function useRecentActivity() {
  return useMemo(() => {
    const activities: Array<{
      icon: typeof CheckCircle2;
      text: string;
      time: string;
      color: string;
    }> = [];
    
    try {
      const statsStr = localStorage.getItem('activity-stats');
      const stats = statsStr ? JSON.parse(statsStr) : [];
      
      const completedIds = new Set<string>();
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('progress-')) {
          const ids = JSON.parse(localStorage.getItem(key) || '[]');
          ids.forEach((id: string) => completedIds.add(id));
        }
      }
      
      const achievementsStr = localStorage.getItem('devprep_achievements');
      const achievements = achievementsStr ? JSON.parse(achievementsStr) : [];
      
      const now = new Date();
      
      if (completedIds.size > 0) {
        const today = now.toISOString().split('T')[0];
        const hasActivityToday = stats.some((s: { date: string }) => s.date === today);
        
        if (hasActivityToday) {
          activities.push({
            icon: CheckCircle2,
            text: `Completed ${completedIds.size} questions`,
            time: "Today",
            color: "text-[var(--gh-success-fg)]"
          });
        } else if (stats.length > 0) {
          const lastStat = stats[stats.length - 1];
          const lastDate = new Date(lastStat.date);
          const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          const timeAgo = diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
          
          activities.push({
            icon: CheckCircle2,
            text: `Completed ${completedIds.size} questions`,
            time: timeAgo,
            color: "text-[var(--gh-success-fg)]"
          });
        }
      }
      
      if (achievements.length > 0) {
        const lastAchievement = achievements[achievements.length - 1];
        const unlockedAt = lastAchievement.unlockedAt ? new Date(lastAchievement.unlockedAt) : now;
        const diffDays = Math.floor((now.getTime() - unlockedAt.getTime()) / (1000 * 60 * 60 * 24));
        const timeAgo = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
        
        activities.push({
          icon: Award,
          text: `Earned '${lastAchievement.title}' badge`,
          time: timeAgo,
          color: "text-[var(--gh-attention-fg)]"
        });
      }
    } catch (error) {
      console.warn('Failed to load recent activity:', error);
    }
    
    if (activities.length === 0) {
      return [
        { icon: CheckCircle2, text: "Start answering questions to track progress", time: "Now", color: "text-[var(--gh-fg-muted)]" },
      ];
    }
    
    return activities.slice(0, 5);
  }, []);
}

// Hook to get earned badges from storage
function useEarnedBadges() {
  return useMemo(() => {
    try {
      const stored = localStorage.getItem('devprep_achievements');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);
}

const quickActions = [
  { label: t('home.action.voicePractice'), icon: Mic, path: "/voice-interview", desc: t('home.action.voicePractice.desc') },
  { label: t('home.action.codingChallenges'), icon: Code, path: "/coding", desc: t('home.action.codingChallenges.desc') },
  { label: t('home.action.srsReview'), icon: RotateCcw, path: "/review", desc: t('home.action.srsReview.desc') },
  { label: t('home.action.learningPaths'), icon: BookOpen, path: "/learning-paths", desc: t('home.action.learningPaths.desc') },
];

const ChannelCard = React.memo(function ChannelCard({ channelId, questionCount }: { channelId: string; questionCount: number }) {
  const [, setLocation] = useLocation();
  
  // Memoize config lookup to avoid re-computation on every render
  const config = useMemo(() => 
    allChannelsConfig.find((c) => c.id === channelId),
    [channelId]
  );
  
  // Memoize progress calculation
  const progress = useMemo(() => 
    getProgress(channelId, questionCount),
    [channelId, questionCount]
  );
  
  if (!config) return null;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLocation(`/channel/${channelId}`);
    }
  }, [setLocation, channelId]);

  return (
    <Button
      variant="outline"
      onClick={() => setLocation(`/channel/${channelId}`)}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-3 p-4 rounded-md border border-[var(--gh-border)] hover:border-[var(--gh-accent-fg)] cursor-pointer bg-[var(--gh-canvas)] transition-colors group text-left w-full"
      data-testid={`card-channel-${channelId}`}
      aria-label={`${config.name}: ${progress.completed} of ${questionCount} questions completed, ${progress.pct}% progress`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-[var(--gh-accent-fg)] shrink-0" aria-hidden="true" />
          <span className="font-semibold text-sm text-[var(--gh-accent-fg)] truncate group-hover:underline">{config.name}</span>
        </div>
      </div>

      <p className="text-xs text-[var(--gh-fg-muted)] line-clamp-2 leading-relaxed">
        {config.description}
      </p>

      <div className="mt-auto space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[var(--gh-fg-muted)]">
          <span>{progress.completed}/{questionCount} done</span>
          <span>{progress.pct}%</span>
        </div>
        <div className="gh-progress" role="progressbar" aria-valuenow={progress.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress">
          <div
            className="gh-progress-bar"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-[var(--gh-fg-muted)]">
        <span className="flex items-center gap-1 capitalize">
          <Circle className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
          {config.category}
        </span>
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3" aria-hidden="true" />
          {questionCount}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3 h-3" aria-hidden="true" />
          {progress.pct}%
        </span>
      </div>
    </Button>
  );
});

function StatBadge({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string | number; color: string;
}) {
  return (
    <div className="flex items-center gap-2 py-2">
      <Icon className={cn("w-4 h-4 shrink-0", color)} />
      <span className="text-sm text-[var(--gh-fg)] font-medium">{value}</span>
      <span className="text-sm text-[var(--gh-fg-muted)]">{label}</span>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: apiChannels = [], isLoading, error } = useApiChannels();
  
  // Dynamic user data hooks
  const earnedBadges = useEarnedBadges();
  const { preferences } = useUserPreferences();
  const recentActivityData = useRecentActivity();

  const channelMap = useMemo(() => 
    Object.fromEntries(apiChannels.map((c: ApiChannel) => [c.id, c.questionCount])),
    [apiChannels]
  );

  const totalQuestions = useMemo(() => 
    apiChannels.reduce((s: number, c: ApiChannel) => s + c.questionCount, 0),
    [apiChannels]
  );

  const totalCompleted = useMemo(() => 
    allChannelsConfig.reduce((s, c) => {
      const total = channelMap[c.id] ?? 0;
      return s + getProgress(c.id, total).completed;
    }, 0),
    [allChannelsConfig, channelMap]
  );

  const overallProgress = useMemo(() => 
    totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0,
    [totalQuestions, totalCompleted]
  );

  const streak = useMemo(() => {
    let currentStreak = 0;
    try {
      const statsStr = localStorage.getItem("daily-stats");
      if (!statsStr) return 0;
      const stats = JSON.parse(statsStr);
      for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (stats.find((x: any) => x.date === d.toISOString().split("T")[0])) currentStreak++;
        else break;
      }
    } catch (error) {
      console.warn('Failed to calculate streak:', error);
    }
    return currentStreak;
  }, []);

  const pinnedChannels = apiChannels.slice(0, Math.min(6, apiChannels.length));
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <>
      <SEOHead
        title="DevPrep - Free Technical Interview Prep"
        description="Master technical interviews with 1000+ questions, spaced repetition flashcards, and voice practice. Free forever, no sign-up required."
      />
      <SkipLink />
      <AppLayout>
      <div className="min-h-screen bg-[var(--gh-canvas-subtle)]" id="main-content">
        <div className="max-w-6xl mx-auto px-4 py-8 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[var(--gh-fg-muted)]">Home</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[var(--gh-fg)]">{t('home.dashboard')}</h1>
            <p className="text-[var(--gh-fg-muted)] mt-1">{today}</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Main column ── */}
            <div className="flex-1 min-w-0 space-y-8">

              {/* Quick actions */}
              <section>
                <h2 className="text-sm font-semibold text-[var(--gh-fg)] mb-4">{t('home.quickActions')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.path}
                        variant="outline"
                        onClick={() => setLocation(action.path)}
                        className="flex flex-col items-start gap-2 p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] hover:bg-[var(--gh-canvas-inset)] text-left transition-colors"
                        data-testid={`action-${action.path.replace("/", "")}`}
                      >
                        <Icon className="w-5 h-5 text-[var(--gh-accent-fg)]" strokeWidth={2} />
                        <div>
                          <div className="text-sm font-semibold text-[var(--gh-fg)]">{action.label}</div>
                          <div className="text-xs text-[var(--gh-fg-muted)] mt-0.5">{action.desc}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </section>

              {/* Topics section header */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-[var(--gh-fg)]">
                      {t('home.yourTopics')}
                    </h2>
                    <span className="gh-label gh-label-gray">{apiChannels.length}</span>
                  </div>
                  <Link
                    href="/channels"
                    className="text-xs text-[var(--gh-accent-fg)] hover:underline flex items-center gap-0.5"
                    data-testid="link-all-channels"
                  >
                    {t('home.viewAll')} <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-32 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] animate-pulse" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-[var(--gh-danger-subtle)] border border-[var(--gh-danger-fg)]/20 p-6 rounded-xl mb-4 max-w-md">
                      <AlertCircle className="w-10 h-10 text-[var(--gh-danger-fg)] mx-auto mb-3" />
                      <h3 className="text-base font-semibold text-[var(--gh-fg)] mb-2">{t('home.error.channels')}</h3>
                      <p className="text-sm text-[var(--gh-fg-muted)]">{error instanceof Error ? error.message : String(error)}</p>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => window.location.reload()}
                    >
                      {t('home.error.tryAgain')}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pinnedChannels.map((channel) => (
                      <ChannelCard
                        key={channel.id}
                        channelId={channel.id}
                        questionCount={channel.questionCount}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* ── Right sidebar ── */}
            <div className="hidden lg:block w-72 shrink-0 space-y-6">

              {/* Credits card - isolated to prevent re-renders on balance change */}
              <CreditsChip />

              {/* Stats card */}
              <section className="gh-card p-4">
                <h2 className="text-sm font-semibold text-[var(--gh-fg)] mb-4">{t('home.stats.yourProgress')}</h2>
                <div className="divide-y divide-[var(--gh-border-muted)]">
                  <StatBadge
                    icon={CheckCircle2}
                    label={t('home.stats.questionsCompleted')}
                    value={totalCompleted}
                    color="text-[var(--gh-success-fg)]"
                  />
                  <StatBadge
                    icon={Layers}
                    label={t('home.stats.topicsUnlocked')}
                    value={apiChannels.length}
                    color="text-[var(--gh-accent-fg)]"
                  />
                  <StatBadge
                    icon={TrendingUp}
                    label={t('home.stats.overallProgress')}
                    value={`${overallProgress}%`}
                    color="text-[var(--gh-done-fg)]"
                  />
                  <StatBadge
                    icon={Flame}
                    label={t('home.stats.dayStreak')}
                    value={streak || "—"}
                    color="text-[var(--gh-attention-fg)]"
                  />
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-4 border-t border-[var(--gh-border-muted)]">
                  <div className="flex items-center justify-between text-xs text-[var(--gh-fg-muted)] mb-2">
                    <span>{t('home.stats.totalCompletion')}</span>
                    <span className="font-medium text-[var(--gh-fg)]">{overallProgress}%</span>
                  </div>
                  <div className="gh-progress">
                    <div
                      className="gh-progress-bar"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="gh-card overflow-hidden">
                <h2 className="text-sm font-semibold text-[var(--gh-fg)] p-4 border-b border-[var(--gh-border-muted)]">{t('home.activity.recent')}</h2>
                <div className="divide-y divide-[var(--gh-border-muted)]">
                  {recentActivityData.map((item: { icon: typeof CheckCircle2; text: string; time: string; color: string }, i: number) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 p-4">
                        <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", item.color)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[var(--gh-fg)] leading-snug">{item.text}</p>
                          <div className="flex items-center gap-1 text-[10px] text-[var(--gh-fg-subtle)] mt-1">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Contribution graph */}
              <section className="gh-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[var(--gh-fg)]">{t('home.activity.study')}</h2>
                  <Activity className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                </div>
                <p className="text-xs text-[var(--gh-fg-muted)] mb-4">
                  {streak > 0 ? t('home.activity.streak.active', { count: streak }) : t('home.activity.streak.none')}
                </p>
                <ContributionGrid />
              </section>

              {/* Start learning CTA */}
              <section className="gh-card p-4">
                <h2 className="text-sm font-semibold text-[var(--gh-fg)] mb-2">
                  {t('home.cta.ready')}
                </h2>
                <p className="text-xs text-[var(--gh-fg-muted)] mb-4">
                  {t('home.cta.subtitle')}
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    onClick={() => setLocation("/channels")}
                    fullWidth
                    data-testid="button-explore-channels"
                  >
                    {t('home.cta.explore')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setLocation("/learning-paths")}
                    fullWidth
                    data-testid="button-view-paths"
                  >
                    {t('home.cta.paths')}
                  </Button>
                </div>
              </section>

              {/* Achievements teaser */}
              <section className="gh-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[var(--gh-fg)]">{t('home.achievements')}</h2>
                  <Link href="/badges" className="text-xs text-[var(--gh-accent-fg)] hover:underline">
                    {t('home.achievements.viewAll')}
                  </Link>
                </div>
                <div className="flex gap-2">
                  {[Brain, Star, Award, Flame].map((Icon, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center border border-[var(--gh-border-muted)]",
                        i === 0 ? "bg-[var(--gh-success-subtle)] text-[var(--gh-success-fg)]" : "bg-[var(--gh-canvas-subtle)] text-[var(--gh-fg-subtle)]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border-muted)] border-dashed flex items-center justify-center">
                    <Circle className="w-4 h-4 text-[var(--gh-fg-subtle)] opacity-40" />
                  </div>
                </div>
                <p className="text-xs text-[var(--gh-fg-muted)] mt-3">
                  {t('home.achievements.badgeCount', { count: earnedBadges.length })}
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
    </>
  );
}
