import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mic, Code, RotateCcw, ChevronRight, TrendingUp, Bot, Sparkles, Zap, Cpu, Layers, BookOpen, Target, Award, ArrowRight, Play, Star, Clock, Flame, CheckCircle2, BookMarked, MessageSquare, Brain, Activity, Calendar } from "lucide-react";
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

const quickActions = [
  { label: "Voice Practice", icon: Mic, path: "/voice-interview", desc: "AI-powered speech analysis", badge: "PRO", gradient: "from-rose-500 via-red-500 to-orange-500", borderColor: "hover:border-rose-500/50" },
  { label: "Coding Challenges", icon: Code, path: "/coding", desc: "Code with AI assistance", badge: "PRO", gradient: "from-violet-500 via-purple-500 to-fuchsia-500", borderColor: "hover:border-violet-500/50" },
  { label: "SRS Review", icon: RotateCcw, path: "/review", desc: "Smart spaced repetition", badge: "PRO", gradient: "from-cyan-500 via-blue-500 to-indigo-500", borderColor: "hover:border-cyan-500/50" },
  { label: "Learning Paths", icon: BookOpen, path: "/learning-paths", desc: "Choose your career path", badge: "NEW", gradient: "from-emerald-500 via-teal-500 to-cyan-500", borderColor: "hover:border-emerald-500/50" },
];

const agentCategories = [
  { icon: Zap, label: "UI/UX", count: 5, color: "from-purple-500 to-pink-500", glow: "shadow-purple-500/25" },
  { icon: Cpu, label: "Database", count: 5, color: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/25" },
  { icon: Sparkles, label: "Google", count: 5, color: "from-pink-500 to-rose-500", glow: "shadow-pink-500/25" },
  { icon: Layers, label: "DevOps", count: 5, color: "from-amber-500 to-orange-500", glow: "shadow-amber-500/25" },
  { icon: Bot, label: "AI/ML", count: 5, color: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/25" },
];

const todayFocusItems = [
  { label: "Complete 5 questions", progress: 60, total: 5, current: 3, icon: Brain },
  { label: "Review 10 flashcards", progress: 40, total: 10, current: 4, icon: BookMarked },
  { label: "15 min voice practice", progress: 80, total: 15, current: 12, icon: Mic },
];

const recentActivity = [
  { type: "question", title: "Completed React Hooks quiz", time: "2 hours ago", icon: CheckCircle2, color: "text-emerald-400" },
  { type: "flashcard", title: "Reviewed 8 JavaScript cards", time: "4 hours ago", icon: BookMarked, color: "text-cyan-400" },
  { type: "voice", title: "Voice interview practice", time: "Yesterday", icon: Mic, color: "text-rose-400" },
  { type: "achievement", title: "Earned 'First Steps' badge", time: "2 days ago", icon: Award, color: "text-amber-400" },
];

function ProgressRing({ progress, size = 120, strokeWidth = 8, className }: { progress: number; size?: number; strokeWidth?: number; className?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(150, 100%, 50%)" />
            <stop offset="50%" stopColor="hsl(190, 100%, 50%)" />
            <stop offset="100%" stopColor="hsl(45, 100%, 50%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{progress}%</span>
      </div>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/10 to-transparent rounded-full" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: apiChannels = [], isLoading } = useApiChannels();

  const channelMap = Object.fromEntries(apiChannels.map((c: ApiChannel) => [c.id, c.questionCount]));

  const totalQuestions = apiChannels.reduce((s: number, c: ApiChannel) => s + c.questionCount, 0);
  const totalCompleted = allChannelsConfig.reduce((s: number, c: typeof allChannelsConfig[number]) => {
    const total = channelMap[c.id] ?? 0;
    return s + getProgress(c.id, total).completed;
  }, 0);

  const streak = (() => {
    let currentStreak = 0;
    const statsStr = localStorage.getItem('daily-stats');
    if (!statsStr) return 0;
    try {
      const stats = JSON.parse(statsStr);
      for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (stats.find((x: any) => x.date === d.toISOString().split('T')[0])) currentStreak++;
        else break;
      }
    } catch {}
    return currentStreak;
  })();

  const overallProgress = totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border border-border/50"
        >
          <AnimatedBackground />
          <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Welcome back
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight"
                >
                  Master Your Tech Skills
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-amber-400">
                    with AI-Powered Learning
                  </span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-lg max-w-xl"
                >
                  Your personal AI tutor is ready. Practice interviews, coding challenges, and track your progress with 30 specialized AI agents.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-3"
                >
                  <button 
                    onClick={() => setLocation("/channels")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                  >
                    <Play className="w-5 h-5" />
                    Start Learning
                  </button>
                  <button 
                    onClick={() => setLocation("/learning-paths")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-card/50 border border-border text-foreground rounded-xl font-semibold hover:bg-card/80 transition-all hover:scale-105"
                  >
                    <BookOpen className="w-5 h-5" />
                    View Paths
                  </button>
                </motion.div>
              </div>
              
              {/* Progress Ring */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <ProgressRing progress={overallProgress} size={160} strokeWidth={10} className="drop-shadow-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <Target className="w-6 h-6 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">Progress</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{totalCompleted}</div>
                  <div className="text-sm text-muted-foreground">of {totalQuestions} questions</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Completed", value: totalCompleted, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
            { label: "Topics", value: apiChannels.length, icon: Layers, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Progress", value: `${overallProgress}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Streak", value: streak, icon: Flame, color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((stat, i) => (
            <div 
              key={stat.label}
              className="relative overflow-hidden rounded-2xl bg-card/50 border border-border/50 p-4 hover:border-border transition-all group"
            >
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity", stat.bg)} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className={cn("text-3xl font-bold", stat.color)}>{stat.value}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Agent Status Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/10 via-primary/10 to-cyan-500/10 border border-purple-500/20"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0xMCAyMGM1LjUyMyAwIDEwLTQuNDc3IDEwLTEwLTQuNDc3IDAtMTAgNC40NzctMTAgMTB6bTAgMmMtNC40MTIgMC04LTMuNTg4LTgtOHMzLjU4OC04IDggOCA4IDMuNTg4IDggOHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30" />
          <div className="relative flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {agentCategories.map((cat, i) => (
                  <div 
                    key={cat.label}
                    className={cn(
                      "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center border-2 border-card",
                      cat.color
                    )}
                    style={{ zIndex: agentCategories.length - i }}
                  >
                    <cat.icon className="w-4 h-4 text-white" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">30 AI Agents Active</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Specialized agents ready to help you learn</p>
              </div>
            </div>
            <button 
              onClick={() => setLocation("/agents")}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border text-sm font-medium text-foreground hover:bg-card transition-colors"
            >
              View Agents
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  onClick={() => setLocation(action.path)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl bg-card/50 border border-border/50 p-5 text-left transition-all hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm",
                    action.borderColor
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
                    action.gradient.replace('from-', 'from-').replace(' via-', ' via-').replace(' to-', ' to-')
                  )} />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
                  <div className="relative">
                    <div className={cn(
                      "w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br",
                      action.gradient
                    )}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{action.label}</span>
                      <span className={cn(
                        "px-2 py-0.5 text-xs font-bold rounded-full",
                        action.badge === "PRO" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                      )}>
                        {action.badge}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Today's Focus & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Focus */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="rounded-2xl bg-card/50 border border-border/50 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Focus
              </h2>
              <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="space-y-4">
              {todayFocusItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.label}
                    className="relative overflow-hidden rounded-xl bg-muted/30 p-4 border border-border/30"
                  >
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/20 to-transparent rounded-l-xl"
                      style={{ width: `${item.progress}%` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.current}/{item.total} completed</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{item.progress}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="rounded-2xl bg-card/50 border border-border/50 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Recent Activity
              </h2>
              <button 
                onClick={() => setLocation("/activity")}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div 
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className={cn("p-2 rounded-lg bg-muted", activity.color)}>
                      <Icon className={cn("w-4 h-4", activity.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{activity.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Agent Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Agent Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {agentCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + i * 0.1 }}
                  onClick={() => setLocation(`/channels?category=${cat.label.toLowerCase().replace('/', '')}`)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl bg-card/50 border border-border/50 p-5 text-center transition-all hover:-translate-y-1 hover:shadow-xl",
                    cat.glow
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
                    cat.color
                  )} />
                  <div className="relative">
                    <div className={cn(
                      "w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-gradient-to-br",
                      cat.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-semibold text-foreground">{cat.label}</div>
                    <div className="text-sm text-muted-foreground">{cat.count} agents</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={() => setLocation("/learning-paths")}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            View Learning Paths
          </button>
          <button
            onClick={() => setLocation("/badges")}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            View Achievements
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
