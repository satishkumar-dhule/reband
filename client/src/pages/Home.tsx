import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import {
  Mic, Code, RotateCcw, BookOpen, ChevronRight,
  Flame, CheckCircle2, Layers, TrendingUp,
  Clock, BookMarked, Activity, Brain, Award,
  Lock, Star, GitFork, Circle
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { allChannelsConfig } from "../lib/channels-config";
import { cn } from "../lib/utils";

interface ApiChannel {
  id: string;
  questionCount: number;
}

function useApiChannels() {
  return useQuery<ApiChannel[]>({
    queryKey: ["channels"],
    queryFn: () => fetch("/api/channels").then((r) => r.json()),
    staleTime: 120_000,
  });
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

const categoryColors: Record<string, string> = {
  fundamentals: "bg-blue-500",
  engineering: "bg-purple-500",
  cloud: "bg-orange-500",
  security: "bg-red-500",
  data: "bg-yellow-500",
  management: "bg-pink-500",
  mobile: "bg-cyan-500",
  ai: "bg-violet-500",
  testing: "bg-green-500",
  certification: "bg-amber-500",
};

const quickActions = [
  { label: "Voice Practice", icon: Mic, path: "/voice-interview", desc: "AI speech analysis", color: "text-rose-500" },
  { label: "Coding Challenges", icon: Code, path: "/coding", desc: "Solve problems", color: "text-violet-500" },
  { label: "SRS Review", icon: RotateCcw, path: "/review", desc: "Spaced repetition", color: "text-blue-500" },
  { label: "Learning Paths", icon: BookOpen, path: "/learning-paths", desc: "Curated journeys", color: "text-green-500" },
];

const recentActivity = [
  { icon: CheckCircle2, text: "Completed React Hooks quiz", time: "2h ago", color: "text-green-500" },
  { icon: BookMarked, text: "Reviewed 8 JavaScript flashcards", time: "4h ago", color: "text-blue-500" },
  { icon: Mic, text: "Finished voice interview session", time: "Yesterday", color: "text-rose-500" },
  { icon: Award, text: "Earned 'First Steps' badge", time: "2 days ago", color: "text-amber-500" },
  { icon: Code, text: "Solved Binary Search challenge", time: "3 days ago", color: "text-violet-500" },
];

function ContributionGrid() {
  const weeks = 15;
  const days = 7;
  const levels = [0, 1, 2, 3, 4];
  const cells: number[][] = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: days }, (_, d) => {
      const val = Math.random();
      if (val < 0.4) return 0;
      if (val < 0.6) return 1;
      if (val < 0.75) return 2;
      if (val < 0.9) return 3;
      return 4;
    })
  );

  const colorMap = [
    "dark:bg-[hsl(215_22%_13%)] bg-[hsl(213_20%_93%)]",
    "bg-[hsl(136_70%_20%)] dark:bg-[hsl(136_70%_18%)]",
    "bg-[hsl(136_70%_30%)] dark:bg-[hsl(136_70%_28%)]",
    "bg-[hsl(136_70%_42%)] dark:bg-[hsl(136_70%_40%)]",
    "bg-[hsl(136_79%_54%)] dark:bg-[hsl(136_79%_52%)]",
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
        <span className="text-[10px] text-muted-foreground">Less</span>
        {levels.map((l) => (
          <div key={l} className={cn("w-3 h-3 rounded-sm", colorMap[l])} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}

function ChannelCard({ channelId, questionCount }: { channelId: string; questionCount: number }) {
  const [, setLocation] = useLocation();
  const config = allChannelsConfig.find((c) => c.id === channelId);
  if (!config) return null;
  const { completed, pct } = getProgress(channelId, questionCount);
  const dotColor = categoryColors[config.category] ?? "bg-gray-500";

  return (
    <div
      onClick={() => setLocation(`/channel/${channelId}`)}
      className="flex flex-col gap-3 p-4 rounded-md border border-border hover-elevate cursor-pointer bg-card transition-colors"
      data-testid={`card-channel-${channelId}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-sm text-primary truncate">{config.name}</span>
        </div>
        <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0" />
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {config.description}
      </p>

      <div className="mt-auto space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{completed}/{questionCount} done</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: "var(--gh-green)" }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className={cn("w-2.5 h-2.5 rounded-full", dotColor)} />
          {config.category}
        </span>
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          {questionCount}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3 h-3" />
          {pct}%
        </span>
      </div>
    </div>
  );
}

function StatBadge({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string | number; color: string;
}) {
  return (
    <div className="flex items-center gap-2 py-2">
      <Icon className={cn("w-4 h-4 shrink-0", color)} />
      <span className="text-sm text-foreground font-medium">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: apiChannels = [], isLoading } = useApiChannels();

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
      <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Main column ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Quick actions */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.path}
                      onClick={() => setLocation(action.path)}
                      className="flex flex-col items-start gap-2 p-3 rounded-md border border-border bg-card hover-elevate text-left transition-colors"
                      data-testid={`action-${action.path.replace("/", "")}`}
                    >
                      <Icon className={cn("w-5 h-5", action.color)} strokeWidth={2} />
                      <div>
                        <div className="text-xs font-semibold text-foreground">{action.label}</div>
                        <div className="text-[11px] text-muted-foreground">{action.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Pinned channels */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Pinned Channels
                </h2>
                <Link
                  href="/channels"
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                  data-testid="link-all-channels"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 rounded-md border border-border bg-card animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
              </div>
              <div className="rounded-md border border-border bg-card divide-y divide-border">
                {recentActivity.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <Icon className={cn("w-4 h-4 shrink-0", item.color)} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-foreground">{item.text}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ── Right sidebar ── */}
          <div className="lg:w-72 shrink-0 space-y-5">

            {/* Stats card */}
            <section className="rounded-md border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Your Progress</h2>
              <div className="divide-y divide-border">
                <StatBadge
                  icon={CheckCircle2}
                  label="questions completed"
                  value={totalCompleted}
                  color="text-green-500"
                />
                <StatBadge
                  icon={Layers}
                  label="topics unlocked"
                  value={apiChannels.length}
                  color="text-blue-500"
                />
                <StatBadge
                  icon={TrendingUp}
                  label="overall progress"
                  value={`${overallProgress}%`}
                  color="text-violet-500"
                />
                <StatBadge
                  icon={Flame}
                  label="day streak"
                  value={streak || "—"}
                  color="text-orange-500"
                />
              </div>

              {/* Progress bar */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Total completion</span>
                  <span className="font-medium text-foreground">{overallProgress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${overallProgress}%`, backgroundColor: "var(--gh-green)" }}
                  />
                </div>
              </div>
            </section>

            {/* Contribution graph */}
            <section className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">Study Activity</h2>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {streak > 0 ? `${streak} day streak — keep going!` : "Start a streak today!"}
              </p>
              <ContributionGrid />
            </section>

            {/* Start learning CTA */}
            <section className="rounded-md border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-2">
                Ready to practice?
              </h2>
              <p className="text-xs text-muted-foreground mb-3">
                Jump into a topic channel and start answering questions.
              </p>
              <button
                onClick={() => setLocation("/channels")}
                className="w-full py-1.5 px-3 rounded-md text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "var(--accent)" }}
                data-testid="button-explore-channels"
              >
                Explore all channels
              </button>
              <button
                onClick={() => setLocation("/learning-paths")}
                className="w-full mt-2 py-1.5 px-3 rounded-md text-sm font-medium border border-border text-foreground hover-elevate transition-colors"
                data-testid="button-view-paths"
              >
                View learning paths
              </button>
            </section>

            {/* Badges teaser */}
            <section className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">Achievements</h2>
                <Link href="/badges" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="flex gap-2">
                {[Brain, Star, Award, Flame].map((Icon, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center",
                      i === 0 ? "bg-[var(--accent)] text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <Circle className="w-4 h-4 text-muted-foreground/40" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                1 badge earned — keep going to unlock more!
              </p>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
