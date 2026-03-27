/**
 * Gen Z Stats Page - Your Progress Dashboard
 * Premium Pro Max UI/UX with Design System Consistency
 * Dark theme with cyan/purple/pink accents
 */

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { useGlobalStats } from '../hooks/use-progress';
import { useCredits } from '../context/CreditsContext';
import { channels, getQuestions, getAllQuestions } from '../lib/data';
import { SEOHead } from '../components/SEOHead';
import { PullToRefresh } from '../components/mobile';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import {
  Trophy, Flame, Zap, Target, TrendingUp, Calendar, BarChart2, Award, Home, ChevronRight, Star, Clock, CheckCircle2, Sparkles, Infinity, Rocket
} from 'lucide-react';

// ============================================
// DESIGN SYSTEM UTILITIES
// ============================================

const ds = {
  // Card styles using design system
  card: "card-premium",
  glass: "glass-card",
  
  // Gradient utilities
  gradientPrimary: "bg-gradient-primary",
  gradientAccent: "from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)]",
  gradientSuccess: "from-[var(--color-success)] to-[var(--color-success-light)]",
  gradientWarning: "from-[var(--color-warning)] to-[var(--color-warning-light)]",
  gradientError: "from-[var(--color-error)] to-[var(--color-error-light)]",
  
  // Accent colors for different stat types
  accentStreak: "from-[var(--color-warning)] to-[var(--color-error)]",
  accentXP: "from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)]",
  accentLevel: "from-[var(--color-accent-purple)] to-[var(--color-accent-pink)]",
  accentCompleted: "from-[var(--color-warning)] to-[var(--color-warning-light)]",
  
  // Text utilities
  textPrimary: "text-[var(--color-text-primary)]",
  textSecondary: "text-[var(--color-text-secondary)]",
  textTertiary: "text-[var(--color-text-tertiary)]",
  textDisabled: "text-[var(--color-text-disabled)]",
  
  // Glow effects
  glowCyan: "shadow-[var(--glow-cyan)]",
  glowPurple: "shadow-[var(--glow-purple)]",
  glowPink: "shadow-[var(--glow-pink)]",
  glowSuccess: "shadow-[var(--glow-success)]",
  
  // Border utilities
  borderSubtle: "border-[var(--color-border-subtle)]",
  borderDefault: "border-[var(--color-border-default)]",
  
  // Background utilities
  bgBase: "bg-[var(--color-base-black)]",
  bgCard: "bg-[var(--color-base-card)]",
  bgElevated: "bg-[var(--color-base-elevated)]",
};

// ============================================
// COMPONENTS
// ============================================

function CircularProgress({ value, size = 140, strokeWidth = 10, color = "var(--color-accent-cyan)" }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer ring with glass effect */}
      <div className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-white/10 to-white/5 shadow-lg" />
      
      <svg width={size + 16} height={size + 16} className="transform -rotate-90 absolute -inset-2">
        <defs>
          <filter id="progressGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={(size + 16) / 2}
          cy={(size + 16) / 2}
          r={radius + 4}
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth={strokeWidth + 4}
        />
        <motion.circle
          cx={(size + 16) / 2}
          cy={(size + 16) / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 12px ${color}60)`,
          }}
        />
      </svg>
      
      {/* Inner gradient effect */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/5 to-black/20" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          className="text-3xl font-black gradient-text"
        >
          {value}%
        </motion.span>
        <span className="text-xs text-[var(--color-text-tertiary)] font-medium">Complete</span>
      </div>
      
      {/* Floating particles with design system accent */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute -top-2 -right-2 w-6 h-6"
      >
        <Sparkles className="w-6 h-6 text-[var(--color-warning)]" style={{ opacity: 0.6 }} />
      </motion.div>
    </div>
  );
}

function AnimatedBar({ label, value, maxValue, delay, color }: { label: string; value: number; maxValue: number; delay: number; color: string }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-[var(--color-text-primary)]">{label}</span>
        <span className="text-[var(--color-text-tertiary)]">{value}/{maxValue}</span>
      </div>
      <div className="h-4 bg-[var(--color-base-elevated)] rounded-full overflow-hidden shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className="h-full rounded-full relative overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            boxShadow: `0 0 20px ${color}40, 0 0 40px ${color}20`,
          }}
        >
          <motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full"
          />
        </motion.div>
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

  const colors = [
    'bg-[var(--color-border-subtle)]',
    'bg-gradient-to-br from-[var(--color-success)]/40 to-[var(--color-success-light)]/30',
    'bg-gradient-to-br from-[var(--color-success)]/60 to-[var(--color-success-light)]/50',
    'bg-gradient-to-br from-[var(--color-success)]/80 to-[var(--color-success-light)]/70',
    'bg-gradient-to-br from-[var(--color-success)] to-[var(--color-success-light)]',
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        <div className="w-8" />
        {Array.from({ length: weeks }).map((_, i) => (
          <div key={i} className="flex-1 text-xs text-[var(--color-text-tertiary)] text-center">
            {i % 2 === 0 ? '' : ''}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-1">
        <div className="flex flex-col gap-1">
          {days.map(day => (
            <div key={day} className="h-3 text-xs text-[var(--color-text-tertiary)] flex items-center">{day[0]}</div>
          ))}
        </div>
        <div className="grid grid-cols-13 gap-1">
          {Array.from({ length: weeks * 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (weeks * 7 - 1 - i));
            const dateStr = date.toISOString().split('T')[0];
            const level = getActivityLevel(dateStr);
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.002 }}
                className={`h-3 rounded-md ${colors[level]} hover:scale-125 transition-transform cursor-pointer relative`}
                title={dateStr}
                whileHover={{ 
                  scale: 1.3,
                  boxShadow: level > 0 ? `0 0 12px var(--color-success)` : 'none'
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end text-xs text-[var(--color-text-tertiary)] pt-2">
        <span>Less</span>
        <div className="flex gap-1">
          {colors.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-md ${c}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

const milestones = [
  { id: 1, name: 'First Question', xp: 10, achieved: true, icon: '🎯' },
  { id: 2, name: '10 Questions', xp: 50, achieved: true, icon: '📚' },
  { id: 3, name: '7 Day Streak', xp: 100, achieved: true, icon: '🔥' },
  { id: 4, name: '100 XP', xp: 100, achieved: false, icon: '⭐' },
  { id: 5, name: '50 Questions', xp: 250, achieved: false, icon: '🏆' },
  { id: 6, name: '30 Day Streak', xp: 500, achieved: false, icon: '👑' },
];

// Floating element component
function FloatingElement({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Stat card with premium design using design system
function StatCard({ icon: Icon, value, label, accentColor, badge, delay }: { 
  icon: React.ElementType; 
  value: string | number; 
  label: string; 
  accentColor: string; 
  badge?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.03, y: -5 }}
      className={`relative overflow-hidden rounded-[var(--radius-xl)] card-premium`}
    >
      {/* Gradient accent bar using design system */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColor}`} />
      
      {/* Floating orb with design system colors */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${accentColor} blur-3xl`}
      />
      
      <div className="relative p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${accentColor} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {badge && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.3 }}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-[var(--color-text-primary)] border border-white/10"
            >
              {badge}
            </motion.span>
          )}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="text-3xl md:text-4xl font-black text-[var(--color-text-primary)] mb-1 drop-shadow-lg"
        >
          {value}
        </motion.div>
        <div className="text-sm text-[var(--color-text-tertiary)] font-medium">{label}</div>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

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

          <div className="min-h-screen overflow-x-hidden relative">
            {/* Animated background using design system */}
            <div className="fixed inset-0 bg-gradient-to-br from-[var(--color-base-black)] via-[var(--color-base-darker)] to-[var(--color-base-black)]" />
            
            {/* Animated gradient orbs with design system colors */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
              className="fixed inset-0 opacity-40"
              style={{
                background: `
                  radial-gradient(ellipse at 20% 20%, var(--color-accent-cyan) 0%, transparent 50%),
                  radial-gradient(ellipse at 80% 80%, var(--color-accent-purple) 0%, transparent 50%),
                  radial-gradient(ellipse at 60% 10%, var(--color-accent-pink) 0%, transparent 40%)
                `,
              }}
            />
            
            {/* Grid pattern overlay */}
            <div className="fixed inset-0 opacity-10" style={{
              backgroundImage: `
                linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
                linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }} />

            <div className="relative z-10 max-w-7xl mx-auto pb-12 w-full">
              {/* Premium Hero Section with design system gradient */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative mb-10 p-8 md:p-12 rounded-[32px] overflow-hidden"
              >
                {/* Complex gradient background using design system */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-cyan)] via-[var(--color-accent-purple)] to-[var(--color-accent-pink)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Animated orbs */}
                <motion.div
                  animate={{ 
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{ 
                    x: [0, -40, 0],
                    y: [0, 40, 0],
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[var(--color-accent-pink)]/30 rounded-full blur-3xl"
                />
                
                {/* Floating decorative elements */}
                <FloatingElement delay={0}>
                  <span className="absolute top-8 right-16 text-4xl opacity-30" aria-hidden="true">✨</span>
                </FloatingElement>
                <FloatingElement delay={0.5}>
                  <span className="absolute top-16 left-12 text-3xl opacity-20" aria-hidden="true">🚀</span>
                </FloatingElement>
                
                {/* Glass overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

                <div className="relative z-10">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col lg:flex-row items-center gap-10"
                  >
                    {/* Progress Circle with premium styling */}
                    <div className="relative">
                      <CircularProgress value={overallProgress} size={180} strokeWidth={14} color="var(--color-accent-cyan)" />
                      
                      {/* Decorative rings */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-white/20 border-dashed"
                      />
                    </div>
                    
                    <div className="text-center lg:text-left flex-1">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-4"
                      >
                        <Sparkles className="w-4 h-4 text-[var(--color-warning)]" />
                        <span className="text-sm font-semibold text-white">Your Learning Journey</span>
                      </motion.div>
                      
                      <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 drop-shadow-xl"
                      >
                        Your Progress
                      </motion.h1>
                      
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-white/90 text-lg md:text-xl mb-2"
                      >
                        {totalCompleted} of {totalQuestions} questions completed
                      </motion.p>
                      
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-white/60"
                      >
                        Keep going! You're doing amazing! 🌟
                      </motion.p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Premium Stats Grid with design system accents */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 w-full">
                <StatCard 
                  icon={Flame} 
                  value={streak} 
                  label="Day Streak" 
                  accentColor={ds.accentStreak} 
                  badge="🔥 Hot"
                  delay={0.1}
                />
                <StatCard 
                  icon={Zap} 
                  value={balance.toLocaleString()} 
                  label="Total XP" 
                  accentColor={ds.accentXP} 
                  badge="⚡ Power"
                  delay={0.2}
                />
                <StatCard 
                  icon={Trophy} 
                  value={level} 
                  label="Level" 
                  accentColor={ds.accentLevel} 
                  badge="👑 Rank"
                  delay={0.3}
                />
                <StatCard 
                  icon={Target} 
                  value={totalCompleted} 
                  label="Completed" 
                  accentColor={ds.accentCompleted} 
                  badge="🎯 Done"
                  delay={0.4}
                />
              </div>

              {/* Level Progress with Premium Design using design system */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`relative overflow-hidden rounded-[var(--radius-xl)] mb-8 w-full card-premium`}
              >
                {/* Background gradient using design system */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-base-darker)] to-[var(--color-base-black)]" />
                
                {/* Decorative elements using design system colors */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] rounded-full blur-3xl"
                />
                
                <div className="relative p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] flex items-center justify-center shadow-lg ${ds.glowCyan}`}>
                        <Star className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Level {level}</h2>
                        <p className="text-sm text-[var(--color-text-tertiary)]">{xpInLevel}/100 XP to level {level + 1}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Infinity className="w-8 h-8 text-[var(--color-accent-cyan)]" />
                      <div className="text-right">
                        <span className="text-4xl font-black gradient-text">
                          {xpInLevel}%
                        </span>
                        <p className="text-xs text-[var(--color-text-tertiary)]">progress</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Premium progress bar using design system gradient */}
                  <div className="h-6 bg-[var(--color-base-elevated)] rounded-full overflow-hidden relative shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpInLevel}%` }}
                      transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
                      className="h-full relative overflow-hidden rounded-full"
                      style={{
                        background: 'var(--gradient-primary)',
                        backgroundSize: '200% 100%',
                        boxShadow: '0 0 20px var(--glow-cyan), 0 0 40px var(--glow-purple)',
                      }}
                    >
                      <motion.div 
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full"
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 w-full">
                {/* Weekly Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`relative overflow-hidden rounded-[var(--radius-xl)] card-premium`}
                >
                  {/* Gradient accent using design system */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent-cyan)] via-[var(--color-accent-purple)] to-[var(--color-accent-cyan)]" />
                  
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-[var(--color-accent-cyan)]/20 to-[var(--color-accent-purple)]/20 rounded-full blur-3xl"
                  />
                  
                  <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] rounded-[var(--radius-md)] flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Weekly Activity</h2>
                    </div>
                    
                    <div className="flex items-end justify-between h-44 gap-2">
                      {weeklyActivity.map((active, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: active ? '100%' : '8%' }}
                            transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                            className={`w-full rounded-t-2xl relative overflow-hidden ${
                              active 
                                ? 'bg-gradient-to-t from-[var(--color-accent-cyan)] via-[var(--color-accent-purple)] to-[var(--color-accent-pink)]' 
                                : 'bg-[var(--color-border-subtle)]'
                            }`}
                            style={active ? { 
                              boxShadow: '0 0 30px var(--glow-cyan)',
                            } : {}}
                          >
                            {active && (
                              <motion.div 
                                animate={{ y: ["-100%", "200%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent w-full h-full"
                              />
                            )}
                          </motion.div>
                          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Streak Tracker */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className={`relative overflow-hidden rounded-[var(--radius-xl)] card-premium`}
                >
                  {/* Gradient accent using design system */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-warning)] via-[var(--color-error)] to-[var(--color-warning)]" />
                  
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-16 -left-16 w-32 h-32 bg-gradient-to-br from-[var(--color-warning)]/20 to-[var(--color-error)]/20 rounded-full blur-3xl"
                  />
                  
                  <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-error)] rounded-[var(--radius-md)] flex items-center justify-center">
                        <Flame className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Streak Tracker</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-5 bg-gradient-to-br from-[var(--color-warning)]/20 to-[var(--color-error)]/10 rounded-[var(--radius-lg)] border border-[var(--color-warning)]/20 relative overflow-hidden"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-4 -right-4 w-16 h-16 bg-[var(--color-warning)]/30 rounded-full blur-2xl"
                        />
                        <div className="relative">
                          <span className="text-4xl mb-2" aria-hidden="true">🔥</span>
                          <div className="text-3xl font-black text-[var(--color-text-primary)]">{streak}</div>
                          <div className="text-sm text-[var(--color-text-tertiary)]">Current</div>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-5 bg-gradient-to-br from-[var(--color-accent-purple)]/20 to-[var(--color-accent-pink)]/10 rounded-[var(--radius-lg)] border border-[var(--color-accent-purple)]/20 relative overflow-hidden"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          className="absolute -top-4 -right-4 w-16 h-16 bg-[var(--color-accent-purple)]/30 rounded-full blur-2xl"
                        />
                        <div className="relative">
                          <span className="text-4xl mb-2" aria-hidden="true">🏆</span>
                          <div className="text-3xl font-black text-[var(--color-text-primary)]">{longestStreak}</div>
                          <div className="text-sm text-[var(--color-text-tertiary)]">Best</div>
                        </div>
                      </motion.div>
                    </div>
                    
                    {streak > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="mt-4 p-3 bg-gradient-to-r from-[var(--color-success)]/20 to-[var(--color-success-light)]/10 rounded-[var(--radius-md)] flex items-center gap-2 border border-[var(--color-success)]/20"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-[var(--color-success-light)]" />
                        </motion.div>
                        <span className="text-sm text-[var(--color-success-light)] font-medium">You're on fire! Keep it up!</span>
                      </motion.div>
                    )}
                  </div>
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
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-warning-light)] rounded-[var(--radius-md)] flex items-center justify-center shadow-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Milestones</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {milestones.map((milestone, i) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`relative overflow-hidden rounded-[var(--radius-lg)] p-4 text-center transition-all ${
                        milestone.achieved
                          ? `bg-gradient-to-br from-[var(--color-warning)]/30 to-[var(--color-warning-light)]/20 border border-[var(--color-warning)]/30 card-premium`
                          : 'bg-[var(--color-border-subtle)] border border-[var(--color-border-subtle)]'
                      }`}
                    >
                      {milestone.achieved && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute inset-0 bg-gradient-to-br from-[var(--color-warning)]/20 to-[var(--color-warning-light)]/20"
                        />
                      )}
                      
                      <div className="relative">
                        <motion.div 
                          animate={milestone.achieved ? { 
                            y: [0, -5, 0],
                            rotate: [0, 5, -5, 0],
                          } : {}}
                          transition={{ duration: 3, repeat: Infinity }}
                          className={`text-4xl mb-3 ${milestone.achieved ? '' : 'opacity-30 grayscale'}`}
                        >
                          {milestone.icon}
                        </motion.div>
                        
                        <div className={`font-bold text-sm mb-1 ${milestone.achieved ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-disabled)]'}`}>
                          {milestone.name}
                        </div>
                        
                        <div className={`text-xs ${milestone.achieved ? 'text-[var(--color-warning-light)]' : 'text-[var(--color-text-tertiary)]'}`}>
                          +{milestone.xp} XP
                        </div>
                      </div>
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
                  <h2 className="text-2xl font-black flex items-center gap-3 text-[var(--color-text-primary)]">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] rounded-[var(--radius-md)] flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-white" />
                    </div>
                    Channel Breakdown
                  </h2>
                  <button
                    onClick={() => setLocation('/channels')}
                    className="text-sm text-[var(--color-accent-cyan)] flex items-center gap-1 hover:underline font-medium transition-colors"
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
                      className={`relative overflow-hidden rounded-[var(--radius-xl)] text-left group transition-all card-premium`}
                    >
                      {/* Gradient accent using design system */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${mod.pct === 100 ? ds.accentCompleted : ds.accentXP}`} />
                      
                      {/* Animated glow using design system */}
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0, 0.3, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${
                          mod.pct === 100 ? 'from-[var(--color-warning)]/30' : 'from-[var(--color-accent-cyan)]/30'
                        } to-transparent blur-2xl`}
                      />
                      
                      <div className="relative p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center ${
                              mod.pct === 100 
                                ? 'bg-gradient-to-br from-[var(--color-warning)]/30 to-[var(--color-warning-light)]/20 border border-[var(--color-warning)]/30' 
                                : 'bg-gradient-to-br from-[var(--color-accent-cyan)]/20 to-[var(--color-accent-purple)]/20 border border-[var(--color-border-subtle)]'
                            }`}>
                              <span className="text-2xl">{mod.icon || '📚'}</span>
                            </div>
                            <h3 className="text-lg font-bold truncate pr-2 text-[var(--color-text-primary)]">{mod.name}</h3>
                          </div>
                          {mod.pct === 100 && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", delay: 1.5 + i * 0.1 }}
                              className="w-9 h-9 bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-warning-light)] rounded-full flex items-center justify-center shadow-lg"
                              style={{ boxShadow: 'var(--glow-warning)' }}
                            >
                              <Trophy className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-text-tertiary)]">{mod.completed}/{mod.total}</span>
                            <span className="font-bold text-[var(--color-text-primary)]">{mod.pct}%</span>
                          </div>
                          <div className="h-3 bg-[var(--color-base-elevated)] rounded-full overflow-hidden shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${mod.pct}%` }}
                              transition={{ duration: 1, delay: 1.2 + i * 0.1 }}
                              className="h-full rounded-full relative overflow-hidden"
                              style={{
                                background: mod.pct === 100 
                                  ? 'var(--gradient-warning)'
                                  : 'var(--gradient-primary)',
                                boxShadow: mod.pct === 100 
                                  ? 'var(--glow-warning)' 
                                  : 'var(--glow-cyan)',
                              }}
                            >
                              <motion.div 
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full"
                              />
                            </motion.div>
                          </div>
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
                className={`relative overflow-hidden rounded-[var(--radius-xl)] mt-10 w-full card-premium`}
              >
                {/* Gradient accent using design system */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-success)] via-[var(--color-accent-cyan)] to-[var(--color-success)]" />
                
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-[var(--color-success)]/20 to-[var(--color-accent-cyan)]/20 rounded-full blur-3xl"
                />
                
                <div className="relative p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-success)] to-[var(--color-accent-cyan)] rounded-[var(--radius-md)] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Activity Heatmap</h2>
                    <span className="text-sm text-[var(--color-text-tertiary)] ml-auto">Last 13 weeks</span>
                  </div>

                  <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                    <HeatmapCalendar stats={stats} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </PullToRefresh>
      </AppLayout>
    </>
  );
}
