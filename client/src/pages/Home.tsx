import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Mic, Code, RotateCcw, ChevronRight, TrendingUp } from "lucide-react";
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
    staleTime: 60_000,
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

const difficultyColor: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-600",
  intermediate: "bg-amber-500/10 text-amber-600",
  advanced: "bg-red-500/10 text-red-600",
};

const quickActions = [
  { label: "Voice Practice", icon: Mic, path: "/voice-interview", desc: "Answer aloud, build confidence" },
  { label: "Coding Challenges", icon: Code, path: "/coding", desc: "Python & JavaScript problems" },
  { label: "SRS Review", icon: RotateCcw, path: "/review", desc: "Spaced repetition session" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: apiChannels = [], isLoading } = useApiChannels();

  const channelMap = Object.fromEntries(apiChannels.map((c) => [c.id, c.questionCount]));

  const visibleChannels = allChannelsConfig
    .filter((c) => !c.isCertification)
    .filter((c) => (channelMap[c.id] ?? 0) > 0 || isLoading);

  const totalQuestions = apiChannels.reduce((s, c) => s + c.questionCount, 0);
  const totalCompleted = allChannelsConfig.reduce((s, c) => {
    const total = channelMap[c.id] ?? 0;
    return s + getProgress(c.id, total).completed;
  }, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Interview Prep</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Practice with {totalQuestions.toLocaleString()} questions across{" "}
            {apiChannels.length} topics
          </p>
        </div>

        {/* Stats strip */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg border border-border bg-card p-3">
            <div className="text-2xl font-bold text-foreground">{totalCompleted}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Questions answered</div>
          </div>
          <div className="flex-1 rounded-lg border border-border bg-card p-3">
            <div className="text-2xl font-bold text-foreground">{apiChannels.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Topics available</div>
          </div>
          <div className="flex-1 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div className="text-2xl font-bold text-primary">
                {totalQuestions > 0
                  ? Math.round((totalCompleted / totalQuestions) * 100)
                  : 0}%
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Overall progress</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Practice Modes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => setLocation(action.path)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Channel Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Topics
            </h2>
            <button
              onClick={() => setLocation("/channels")}
              className="text-xs text-primary flex items-center gap-0.5 hover:underline"
            >
              All topics <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg border border-border bg-muted/40 animate-pulse"
                />
              ))}
            </div>
          ) : visibleChannels.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
              No questions in the database yet. Seed the database to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {visibleChannels.map((ch) => {
                const total = channelMap[ch.id] ?? 0;
                const { completed, pct } = getProgress(ch.id, total);
                return (
                  <button
                    key={ch.id}
                    onClick={() => setLocation(`/channel/${ch.id}`)}
                    className="group flex flex-col gap-2 p-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/50 transition-all text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {ch.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {ch.description}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {completed}/{total}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          pct === 100 ? "bg-emerald-500" : "bg-primary"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
