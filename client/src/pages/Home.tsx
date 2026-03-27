import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Mic, Code, RotateCcw, ChevronRight, TrendingUp, Sparkles, BookOpen, Target, Award, ArrowRight, Play, Star, Clock, Flame, CheckCircle2, BookMarked, Brain, Activity, Calendar, Layers, Zap } from "lucide-react";
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
          className="text-slate-700"
          aria-hidden="true"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#clayProgressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="clayProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold gradient-text">{progress}%</span>
      </div>
    </div>
  );
}

function FloatingBlob({ className, delay = 0, color = "bg-cyan-500/20" }: { className?: string; delay?: number; color?: string }) {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return (
    <motion.div
      className={cn("absolute rounded-full blur-3xl opacity-40", color, className)}
      animate={prefersReducedMotion ? {} : {
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 30, -10, 0],
        scale: [1, 1.1, 0.9, 1.05, 1],
      }}
      transition={prefersReducedMotion ? { duration: 0 } : {
        duration: 20,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    />
  );
}

function ClayCard({ children, className, hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={cn(
      "relative glass-card rounded-[32px] p-6 border border-white/10",
      hover && "hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 transition-colors duration-300",
      className
    )}>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bgColor, index }: { label: string; value: string | number; icon: any; color: string; bgColor: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
    >
      <ClayCard className="relative overflow-hidden">
        <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2", bgColor)} />
        <div className="relative">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", bgColor)}>
            <Icon className={cn("w-5 h-5", color)} />
          </div>
          <p className="text-2xl font-bold gradient-text">{value}</p>
          <p className="text-sm text-slate-400">{label}</p>
        </div>
      </ClayCard>
    </motion.div>
  );
}

function QuickActionCard({ action, index }: { action: typeof quickActions[0]; index: number }) {
  const Icon = action.icon;
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.8, type: "spring" }}
      onClick={() => useLocation()[1](action.path)}
      className="group relative w-full text-left"
    >
      <div className="absolute inset-0 bg-gradient-to-br rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: action.gradient ? `linear-gradient(135deg, ${action.gradient.split(' ')[1]?.replace('from-', '') || 'rose-500'}, ${action.gradient.split(' ')[3]?.replace('to-', '') || 'orange-500'})` : 'linear-gradient(135deg, rose-500, orange-500)' }}
      />
      <div className="relative glass-card rounded-[32px] p-5 border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br",
            action.gradient
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className={cn(
            "px-3 py-1 text-xs font-bold rounded-full",
            action.badge === "PRO" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          )}>
            {action.badge}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{action.label}</h3>
        <p className="text-sm text-slate-400">{action.desc}</p>
      </div>
    </motion.button>
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        
        :root {
          --primary: #06b6d4;
          --secondary: #8b5cf6;
          --cta: #ec4899;
          --background: #09090b;
          --text: #fafafa;
          --card: #18181b;
        }
        
        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }
        
        .font-mono {
          font-family: 'Space Mono', monospace;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glass-card-strong {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        
        .blob-pulse {
          animation: blobPulse 8s ease-in-out infinite;
        }
        
        @keyframes blobPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%);
        }
        
        .glow-cyan {
          box-shadow: 0 0 40px hsla(190, 100%, 50%, 0.3);
        }
        
        .glow-purple {
          box-shadow: 0 0 40px hsla(270, 100%, 65%, 0.3);
        }
      `}</style>
      
      <div className="space-y-8 pb-8">
        {/* Hero Section with Floating Blobs */}
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[50px] overflow-hidden glass-card-strong border border-white/15"
        >
          {/* Floating Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatingBlob className="w-96 h-96 -top-20 -right-20" delay={0} color="bg-cyan-500/15" />
            <FloatingBlob className="w-80 h-80 -bottom-20 -left-20" delay={5} color="bg-purple-500/15" />
            <FloatingBlob className="w-64 h-64 top-1/2 left-1/3" delay={10} color="bg-pink-500/15" />
            <FloatingBlob className="w-48 h-48 top-1/3 right-1/4" delay={15} color="bg-emerald-500/10" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>
          
          <div className="relative z-10 px-8 py-12 md:px-12 md:py-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
              <div className="space-y-5">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-cyan-500/30 text-sm font-medium text-cyan-400"
                >
                  <Sparkles className="w-4 h-4" />
                  Welcome back to DevPrep
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight font-outfit"
                >
                  Master Your Tech Skills
                  <span className="block gradient-text mt-1">
                    with AI-Powered Learning
                  </span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400 text-lg max-w-xl leading-relaxed"
                >
                  Your personal tutor is ready. Practice interviews, coding challenges, and track your progress with specialized learning tools.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link 
                    href="/channels"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white rounded-[20px] font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-transform hover:scale-105 hover:-translate-y-1"
                  >
                    <Play className="w-5 h-5" />
                    Start Learning
                  </Link>
                  <Link 
                    href="/learning-paths"
                    className="inline-flex items-center gap-2 px-8 py-4 glass-card border border-white/20 text-white rounded-[20px] font-semibold hover:bg-white/10 hover:border-white/30 transition-transform hover:scale-105 hover:-translate-y-1"
                  >
                    <BookOpen className="w-5 h-5" />
                    View Paths
                  </Link>
                </motion.div>
              </div>
              
              {/* Progress Ring */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-2xl" />
                  <div className="relative glass-card rounded-full p-2 border border-white/10">
                    <ProgressRing progress={overallProgress} size={180} strokeWidth={12} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <Target className="w-8 h-8 text-cyan-400 mb-2" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text">{totalCompleted}</div>
                  <div className="text-sm text-slate-400">of {totalQuestions} questions</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
            label="Completed" 
            value={totalCompleted} 
            icon={CheckCircle2} 
            color="text-cyan-400" 
            bgColor="bg-cyan-500/20 border border-cyan-500/30" 
            index={0} 
          />
          <StatCard 
            label="Topics" 
            value={apiChannels.length} 
            icon={Layers} 
            color="text-purple-400" 
            bgColor="bg-purple-500/20 border border-purple-500/30" 
            index={1} 
          />
          <StatCard 
            label="Progress" 
            value={`${overallProgress}%`} 
            icon={TrendingUp} 
            color="text-emerald-400" 
            bgColor="bg-emerald-500/20 border border-emerald-500/30" 
            index={2} 
          />
          <StatCard 
            label="Streak" 
            value={streak} 
            icon={Flame} 
            color="text-pink-400" 
            bgColor="bg-pink-500/20 border border-pink-500/30" 
            index={3} 
          />
        </div>

        {/* Learning Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative overflow-hidden rounded-[40px] glass-card-strong border border-white/15"
        >
          <div className="absolute inset-0 overflow-hidden">
            <FloatingBlob className="w-64 h-64 top-0 left-1/4" delay={2} color="bg-violet-500/15" />
            <FloatingBlob className="w-48 h-48 bottom-0 right-1/4" delay={7} color="bg-purple-500/15" />
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6">
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {apiChannels.slice(0, 6).map((channel, i) => (
                  <motion.div 
                    key={channel.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * i }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-md bg-gradient-to-br from-cyan-500 to-purple-500"
                    style={{ zIndex: 6 - i }}
                  >
                    <BookOpen className="w-5 h-5 text-white" />
                  </motion.div>
                ))}
              </div>
              
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">Learning Progress</h3>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-400">On Track</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-1">Continue your learning journey across all channels</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full border border-white/10">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">{apiChannels.length} Channels</span>
              </div>
              <button 
                onClick={() => setLocation("/channels")}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105"
              >
                Explore
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickActions.map((action, i) => (
              <QuickActionCard key={action.path} action={action} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Today's Focus & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Focus */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <ClayCard>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Today's Focus
                  </h2>
                </div>
                <span className="text-sm text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  {new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}
                </span>
              </div>
              <div className="space-y-4">
                {todayFocusItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + i * 0.1 }}
                      className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10"
                    >
                      <motion.div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-l-2xl"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ delay: 1.3 + i * 0.1, duration: 0.8 }}
                      />
                      <div className="relative flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-white/10">
                            <Icon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{item.label}</div>
                            <div className="text-xs text-slate-400">{item.current}/{item.total} completed</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold gradient-text">{item.progress}%</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ClayCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <ClayCard>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Recent Activity
                  </h2>
                </div>
                <button 
                  onClick={() => setLocation("/activity")}
                  className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 + i * 0.1 }}
                      onClick={() => setLocation("/activity")}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10"
                    >
                      <div className={cn("p-2.5 rounded-xl bg-white/10", activity.color)}>
                        <Icon className={cn("w-5 h-5", activity.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{activity.title}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ClayCard>
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex items-center justify-between pt-6 border-t border-white/10"
        >
          <button
            onClick={() => setLocation("/learning-paths")}
            className="flex items-center gap-2 px-5 py-2.5 glass-card rounded-full border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Learning Paths</span>
          </button>
          <button
            onClick={() => setLocation("/badges")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <span>View Achievements</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
