/**
 * Gen Z Stats Page - Your Progress Dashboard
 * Beautiful charts, streaks, achievements with glassmorphism
 */

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { useGlobalStats } from '../hooks/use-progress';
import { useCredits } from '../context/CreditsContext';
import { channels, getQuestions, getAllQuestions } from '../lib/data';
import { SEOHead } from '../components/SEOHead';
import { PullToRefresh } from '../components/mobile';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import {
  Trophy, Flame, Zap, Target, TrendingUp, Calendar, BarChart2, Award, Home, ChevronRight, Star, Clock, CheckCircle2
} from 'lucide-react';

function CircularProgress({ value, size = 120, strokeWidth = 10, color = "#00ff88" }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 8px ${color}50)`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-black">{value}%</span>
      </div>
    </div>
  );
}

function AnimatedBar({ label, value, maxValue, delay, color }: { label: string; value: number; maxValue: number; delay: number; color: string }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}/{maxValue}</span>
      </div>
      <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            boxShadow: `0 0 12px ${color}40`
          }}
        />
      </div>
    </div>
  );
}

function HeatmapCalendar({ stats }: { stats: { date: string }[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeks = 13;
  
  const getActivityLevel = (dateStr: string) => {
    const found = stats.find(s => s.date === dateStr);
    if (!found) return 0;
    return Math.min(4, 1 + Math.floor(Math.random() * 4));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        <div className="w-8" />
        {Array.from({ length: weeks }).map((_, i) => (
          <div key={i} className="flex-1 text-xs text-muted-foreground text-center">
            {i % 2 === 0 ? '' : ''}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-1">
        <div className="flex flex-col gap-1">
          {days.map(day => (
            <div key={day} className="h-3 text-xs text-muted-foreground flex items-center">{day[0]}</div>
          ))}
        </div>
        <div className="grid grid-cols-13 gap-1">
          {Array.from({ length: weeks * 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (weeks * 7 - 1 - i));
            const dateStr = date.toISOString().split('T')[0];
            const level = getActivityLevel(dateStr);
            
            const colors = [
              'bg-muted/20',
              'bg-green-500/30',
              'bg-green-500/50',
              'bg-green-500/70',
              'bg-green-500'
            ];
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.001 }}
                className={`h-3 rounded-sm ${colors[level]} hover:scale-125 transition-transform cursor-pointer`}
                title={dateStr}
              />
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end text-xs text-muted-foreground pt-2">
        <span>Less</span>
        <div className="flex gap-1">
          {colors.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

const colors = ['bg-muted/20', 'bg-green-500/30', 'bg-green-500/50', 'bg-green-500/70', 'bg-green-500'];

const milestones = [
  { id: 1, name: 'First Question', xp: 10, achieved: true },
  { id: 2, name: '10 Questions', xp: 50, achieved: true },
  { id: 3, name: '7 Day Streak', xp: 100, achieved: true },
  { id: 4, name: '100 XP', xp: 100, achieved: false },
  { id: 5, name: '50 Questions', xp: 250, achieved: false },
  { id: 6, name: '30 Day Streak', xp: 500, achieved: false },
];

export default function StatsGenZ() {
  const [, setLocation] = useLocation();
  const { stats } = useGlobalStats();
  const { balance } = useCredits();
  const [isLoading, setIsLoading] = useState(false);

  const { totalCompleted, totalQuestions, streak, moduleProgress, longestStreak, weeklyActivity } = useMemo(() => {
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

    let longest = 0;
    let temp = 0;
    const sortedStats = [...stats].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (const stat of sortedStats) {
      const d = new Date(stat.date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (d <= yesterday) {
        temp++;
        longest = Math.max(longest, temp);
      }
    }

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return stats.find(x => x.date === d.toISOString().split('T')[0]) ? 1 : 0;
    });

    return {
      totalCompleted: allCompletedIds.size,
      totalQuestions: allQuestions.length,
      streak: currentStreak,
      longestStreak: Math.max(longest, currentStreak),
      moduleProgress: modProgress,
      weeklyActivity: last7Days
    };
  }, [stats]);

  const level = Math.floor(balance / 100);
  const xpInLevel = balance % 100;
  const overallProgress = totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0;

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.reload();
  };

  return (
    <>
      <SEOHead
        title="Your Stats - Track Your Progress 📊"
        description="See your learning progress, streaks, and achievements"
        canonical="https://open-interview.github.io/stats"
      />

      <AppLayout>
        <PullToRefresh onRefresh={handleRefresh}>
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <Home className="w-4 h-4" />
                  <span className="ml-1">Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Stats</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <div className="max-w-7xl mx-auto pb-12 w-full">
              {/* Animated Gradient Hero */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative mb-10 p-8 md:p-12 rounded-[28px] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                  transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
                  style={{
                    background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)'
                  }}
                />
                <div className="relative z-10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col md:flex-row items-center gap-8"
                  >
                    <CircularProgress value={overallProgress} size={160} strokeWidth={12} color="#fbbf24" />
                    <div className="text-center md:text-left">
                      <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Your Progress</h1>
                      <p className="text-white/80 text-lg">
                        {totalCompleted} of {totalQuestions} questions completed
                      </p>
                      <p className="text-white/60 text-sm mt-2">Keep going! You're doing amazing!</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-5 md:p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-[20px] border border-orange-500/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Flame className="w-8 h-8 text-orange-500" />
                    <span className="text-xs bg-orange-500/20 px-2 py-1 rounded-full text-orange-400">🔥 Hot</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-black mb-1">{streak}</div>
                  <div className="text-sm text-muted-foreground">day streak</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-5 md:p-6 bg-gradient-to-br from-primary/20 to-cyan-500/20 backdrop-blur-xl rounded-[20px] border border-primary/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Zap className="w-8 h-8 text-primary" />
                    <span className="text-xs bg-primary/20 px-2 py-1 rounded-full text-primary">⚡ Power</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-black mb-1">{balance.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">total XP</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-5 md:p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-[20px] border border-purple-500/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Trophy className="w-8 h-8 text-purple-400" />
                    <span className="text-xs bg-purple-500/20 px-2 py-1 rounded-full text-purple-400">👑 Rank</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-black mb-1">{level}</div>
                  <div className="text-sm text-muted-foreground">level</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-5 md:p-6 bg-gradient-to-br from-[#ffd700]/20 to-[#ff8c00]/20 backdrop-blur-xl rounded-[20px] border border-[#ffd700]/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Target className="w-8 h-8 text-[#ffd700]" />
                    <span className="text-xs bg-[#ffd700]/20 px-2 py-1 rounded-full text-[#ffd700]">🎯 Done</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-black mb-1">{totalCompleted}</div>
                  <div className="text-sm text-muted-foreground">completed</div>
                </motion.div>
              </div>

              {/* Level Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-xl rounded-[24px] border border-border mb-8 w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-cyan-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Level {level}</h2>
                      <p className="text-sm text-muted-foreground">{xpInLevel}/100 XP to level {level + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-primary">{xpInLevel}%</span>
                    <p className="text-xs text-muted-foreground">progress</p>
                  </div>
                </div>
                <div className="h-5 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpInLevel}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full bg-gradient-to-r from-primary via-cyan-400 to-primary bg-[length:200%_100%]"
                    style={{ animation: 'shimmer 2s infinite' }}
                  />
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 w-full">
                {/* Weekly Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-xl rounded-[24px] border border-border"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold">Weekly Activity</h2>
                  </div>
                  <div className="flex items-end justify-between h-40 gap-2">
                    {weeklyActivity.map((active, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: active ? '100%' : '10%' }}
                          transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                          className={`w-full rounded-t-lg ${active ? 'bg-gradient-to-t from-primary to-cyan-400' : 'bg-muted/50'}`}
                          style={active ? { boxShadow: '0 0 20px rgba(0,255,136,0.3)' } : {}}
                        />
                        <span className="text-xs text-muted-foreground">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Streak Tracker */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-[24px] border border-orange-500/20"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <h2 className="text-xl font-bold">Streak Tracker</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-500/10 rounded-2xl text-center">
                      <div className="text-4xl font-black text-orange-500 mb-1">🔥</div>
                      <div className="text-2xl font-bold">{streak}</div>
                      <div className="text-sm text-muted-foreground">Current</div>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-2xl text-center">
                      <div className="text-4xl font-black text-purple-400 mb-1">🏆</div>
                      <div className="text-2xl font-bold">{longestStreak}</div>
                      <div className="text-sm text-muted-foreground">Best</div>
                    </div>
                  </div>
                  {streak > 0 && (
                    <div className="mt-4 p-3 bg-green-500/10 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-400">You're on fire! Keep it up!</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Milestones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-8 w-full"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-6 h-6 text-[#ffd700]" />
                  <h2 className="text-xl font-bold">Milestones</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {milestones.map((milestone, i) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className={`p-4 rounded-2xl text-center transition-all ${
                        milestone.achieved
                          ? 'bg-gradient-to-br from-[#ffd700]/30 to-[#ff8c00]/30 border border-[#ffd700]/50'
                          : 'bg-muted/30 border border-border'
                      }`}
                    >
                      <div className={`text-3xl mb-2 ${milestone.achieved ? '' : 'opacity-30'}`}>
                        {milestone.achieved ? '🏅' : '🔒'}
                      </div>
                      <div className={`font-bold text-sm mb-1 ${milestone.achieved ? '' : 'text-muted-foreground'}`}>
                        {milestone.name}
                      </div>
                      <div className="text-xs text-muted-foreground">+{milestone.xp} XP</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Channel Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="space-y-6 w-full"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <BarChart2 className="w-7 h-7 text-primary" />
                    Channel Breakdown
                  </h2>
                  <button
                    onClick={() => setLocation('/channels')}
                    className="text-sm text-primary flex items-center gap-1 hover:underline"
                  >
                    Browse channels <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {moduleProgress.slice(0, 8).map((mod, i) => (
                    <motion.button
                      key={mod.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + i * 0.05 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLocation(`/channel/${mod.id}`)}
                      className="p-5 bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur-xl rounded-[18px] border border-border hover:border-primary/40 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-cyan-500/30 rounded-xl flex items-center justify-center">
                            <span className="text-xl">{mod.icon || '📚'}</span>
                          </div>
                          <h3 className="text-lg font-bold truncate pr-2">{mod.name}</h3>
                        </div>
                        {mod.pct === 100 && (
                          <div className="w-8 h-8 bg-gradient-to-br from-[#ffd700] to-[#ff8c00] rounded-full flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-4 h-4 text-black" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{mod.completed}/{mod.total}</span>
                          <span className="font-bold text-primary">{mod.pct}%</span>
                        </div>
                        <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${mod.pct}%` }}
                            transition={{ duration: 1, delay: 1.2 + i * 0.1 }}
                            className="h-full bg-gradient-to-r from-primary to-cyan-500"
                            style={{ boxShadow: '0 0 10px rgba(0,255,136,0.3)' }}
                          />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Activity Heatmap */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="mt-10 p-6 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-xl rounded-[24px] border border-border w-full"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">Activity Heatmap</h2>
                  <span className="text-sm text-muted-foreground ml-auto">Last 13 weeks</span>
                </div>

                <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                  <HeatmapCalendar stats={stats} />
                </div>
              </motion.div>
            </div>
          </div>
        </PullToRefresh>
      </AppLayout>
    </>
  );
}
