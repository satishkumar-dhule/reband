import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useMemo, useState, useEffect } from "react";
import {
  Mic, Code, RotateCcw, BookOpen, ChevronRight,
  Flame, CheckCircle2, Layers, TrendingUp,
  Clock, BookMarked, Activity, Brain, Award,
  Circle, Star, GitFork, AlertCircle
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { allChannelsConfig } from "../lib/channels-config";
import { cn } from "../lib/utils";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";

interface ApiChannel {
  id: string;
  questionCount: number;
}

function useApiChannels() {
  const [channels, setChannels] = useState<ApiChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannels() {
      try {
        // Use static JSON in production, API in dev
        const basePath = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${basePath}data/channels.json`);
        if (!response.ok) throw new Error(`Failed to fetch channels: ${response.status}`);
        const data = await response.json();
        setChannels(data);
      } catch (err) {
        // Fallback: try API endpoint in dev mode
        if (import.meta.env.DEV) {
          try {
            const r = await fetch("/api/channels");
            if (!r.ok) throw new Error(`Failed to fetch channels: ${r.status}`);
            const data = await r.json();
            setChannels(data);
            return;
          } catch {
            // Fall through to error
          }
        }
        setError(err instanceof Error ? err.message : 'Failed to load channels');
      } finally {
        setLoading(false);
      }
    }
    fetchChannels();
  }, []);

  return { data: channels, isLoading: loading, error };
}

function getProgress(channelId: string, total: number) {
  try {
    const stored = localStorage.getItem(`progress-${channelId}`);
    const completed = stored ? JSON.parse(stored).length : 0;
    return { completed, pct: total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0 };
  } catch {
    return { completed: 0, pct: 0 };
  }
}

const quickActions = [
  { label: "Voice Practice", icon: Mic, path: "/voice-interview", desc: "AI speech analysis" },
  { label: "Coding Challenges", icon: Code, path: "/coding", desc: "Solve problems" },
  { label: "SRS Review", icon: RotateCcw, path: "/review", desc: "Spaced repetition" },
  { label: "Learning Paths", icon: BookOpen, path: "/learning-paths", desc: "Curated journeys" },
];

const recentActivity = [
  { icon: CheckCircle2, text: "Completed React Hooks quiz", time: "2h ago", color: "text-[var(--gh-success-fg)]" },
  { icon: BookMarked, text: "Reviewed 8 JavaScript flashcards", time: "4h ago", color: "text-[var(--gh-accent-fg)]" },
  { icon: Mic, text: "Finished voice interview session", time: "Yesterday", color: "text-[var(--gh-success-fg)]" },
  { icon: Award, text: "Earned 'First Steps' badge", time: "2 days ago", color: "text-[var(--gh-attention-fg)]" },
  { icon: Code, text: "Solved Binary Search challenge", time: "3 days ago", color: "text-[var(--gh-done-fg)]" },
];

function ContributionGrid() {
  const weeks = 15;
  const days = 7;
  const levels = [0, 1, 2, 3, 4];
  
  const cells = useMemo(() => {
    const seed = 12345;
    let random = seed;
    const nextRandom = () => {
      random = (random * 1103515245 + 12345) & 0x7fffffff;
      return random / 0x7fffffff;
    };
    return Array.from({ length: weeks }, (_, w) =>
      Array.from({ length: days }, (_, d) => {
        const val = nextRandom();
        if (val < 0.4) return 0;
        if (val < 0.6) return 1;
        if (val < 0.75) return 2;
        if (val < 0.9) return 3;
        return 4;
      })
    );
  }, []);

  const colorMap = [
    "bg-[var(--gh-canvas-inset)]",
    "bg-[hsl(136_70%_20%)]",
    "bg-[hsl(136_70%_30%)]",
    "bg-[hsl(136_70%_42%)]",
    "bg-[var(--gh-success-emphasis)]",
  ];

  return (
    <div>
      <div className="flex gap-1">
        {cells.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((level, di) => (
              <div
                key={di}
                className={cn("w-3 h-3 rounded-sm", colorMap[level])}
                title={`Level ${level}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-2">
        <span className="text-[10px] text-[var(--gh-fg-muted)]">Less</span>
        {levels.map((l) => (
          <div key={l} className={cn("w-3 h-3 rounded-sm", colorMap[l])} />
        ))}
        <span className="text-[10px] text-[var(--gh-fg-muted)]">More</span>
      </div>
    </div>
  );
}

function ChannelCard({ channelId, questionCount }: { channelId: string; questionCount: number }) {
  const [, setLocation] = useLocation();
  const config = allChannelsConfig.find((c) => c.id === channelId);
  if (!config) return null;
  const { completed, pct } = getProgress(channelId, questionCount);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLocation(`/channel/${channelId}`);
    }
  };

  return (
    <button
      onClick={() => setLocation(`/channel/${channelId}`)}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-3 p-4 rounded-md border border-[var(--gh-border)] hover:border-[var(--gh-accent-fg)] cursor-pointer bg-[var(--gh-canvas)] transition-colors group text-left w-full"
      data-testid={`card-channel-${channelId}`}
      aria-label={`${config.name}: ${completed} of ${questionCount} questions completed, ${pct}% progress`}
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
          <span>{completed}/{questionCount} done</span>
          <span>{pct}%</span>
        </div>
        <div className="gh-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress">
          <div
            className="gh-progress-bar"
            style={{ width: `${pct}%` }}
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
          {pct}%
        </span>
      </div>
    </button>
  );
}

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

  const channelMap = Object.fromEntries(
    apiChannels.map((c: ApiChannel) => [c.id, c.questionCount])
  );

  const totalQuestions = apiChannels.reduce(
    (s: number, c: ApiChannel) => s + c.questionCount, 0
  );
  const totalCompleted = allChannelsConfig.reduce((s, c) => {
    const total = channelMap[c.id] ?? 0;
    return s + getProgress(c.id, total).completed;
  }, 0);

  const overallProgress = totalQuestions > 0
    ? Math.round((totalCompleted / totalQuestions) * 100)
    : 0;

  const streak = (() => {
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
    } catch {}
    return currentStreak;
  })();

  const pinnedChannels = apiChannels.slice(0, 6);
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
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
            <h1 className="text-2xl font-semibold text-[var(--gh-fg)]">Dashboard</h1>
            <p className="text-[var(--gh-fg-muted)] mt-1">{today}</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Main column ── */}
            <div className="flex-1 min-w-0 space-y-8">

              {/* Quick actions */}
              <section>
                <h2 className="text-sm font-semibold text-[var(--gh-fg)] mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.path}
                        onClick={() => setLocation(action.path)}
                        className="flex flex-col items-start gap-2 p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] hover:bg-[var(--gh-canvas-inset)] text-left transition-colors"
                        data-testid={`action-${action.path.replace("/", "")}`}
                      >
                        <Icon className="w-5 h-5 text-[var(--gh-accent-fg)]" strokeWidth={2} />
                        <div>
                          <div className="text-sm font-semibold text-[var(--gh-fg)]">{action.label}</div>
                          <div className="text-xs text-[var(--gh-fg-muted)] mt-0.5">{action.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Topics section header */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-[var(--gh-fg)]">
                      Your Topics
                    </h2>
                    <span className="gh-label gh-label-gray">{apiChannels.length}</span>
                  </div>
                  <Link
                    href="/channels"
                    className="text-xs text-[var(--gh-accent-fg)] hover:underline flex items-center gap-0.5"
                    data-testid="link-all-channels"
                  >
                    View all <ChevronRight className="w-3 h-3" />
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
                      <h3 className="text-base font-semibold text-[var(--gh-fg)] mb-2">Failed to load channels</h3>
                      <p className="text-sm text-[var(--gh-fg-muted)]">{error}</p>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gh-accent-fg)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Try Again
                    </button>
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

              {/* Stats card */}
              <section className="gh-card p-4">
                <h2 className="text-sm font-semibold text-[var(--gh-fg)] mb-4">Your Progress</h2>
                <div className="divide-y divide-[var(--gh-border-muted)]">
                  <StatBadge
                    icon={CheckCircle2}
                    label="questions completed"
                    value={totalCompleted}
                    color="text-[var(--gh-success-fg)]"
                  />
                  <StatBadge
                    icon={Layers}
                    label="topics unlocked"
                    value={apiChannels.length}
                    color="text-[var(--gh-accent-fg)]"
                  />
                  <StatBadge
                    icon={TrendingUp}
                    label="overall progress"
                    value={`${overallProgress}%`}
                    color="text-[var(--gh-done-fg)]"
                  />
                  <StatBadge
                    icon={Flame}
                    label="day streak"
                    value={streak || "—"}
                    color="text-[var(--gh-attention-fg)]"
                  />
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-4 border-t border-[var(--gh-border-muted)]">
                  <div className="flex items-center justify-between text-xs text-[var(--gh-fg-muted)] mb-2">
                    <span>Total completion</span>
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
                <h2 className="text-sm font-semibold text-[var(--gh-fg)] p-4 border-b border-[var(--gh-border-muted)]">Recent Activity</h2>
                <div className="divide-y divide-[var(--gh-border-muted)]">
                  {recentActivity.map((item, i) => {
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
                  <h2 className="text-sm font-semibold text-[var(--gh-fg)]">Study Activity</h2>
                  <Activity className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                </div>
                <p className="text-xs text-[var(--gh-fg-muted)] mb-4">
                  {streak > 0 ? `${streak} day streak — keep going!` : "Start a streak today!"}
                </p>
                <ContributionGrid />
              </section>

              {/* Start learning CTA */}
              <section className="gh-card p-4">
                <h2 className="text-sm font-semibold text-[var(--gh-fg)] mb-2">
                  Ready to practice?
                </h2>
                <p className="text-xs text-[var(--gh-fg-muted)] mb-4">
                  Jump into a topic channel and start answering questions.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setLocation("/channels")}
                    className="gh-btn gh-btn-primary w-full justify-center"
                    data-testid="button-explore-channels"
                  >
                    Explore all channels
                  </button>
                  <button
                    onClick={() => setLocation("/learning-paths")}
                    className="gh-btn gh-btn-secondary w-full justify-center"
                    data-testid="button-view-paths"
                  >
                    View learning paths
                  </button>
                </div>
              </section>

              {/* Achievements teaser */}
              <section className="gh-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[var(--gh-fg)]">Achievements</h2>
                  <Link href="/badges" className="text-xs text-[var(--gh-accent-fg)] hover:underline">
                    View all
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
                  1 badge earned — keep going to unlock more!
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
