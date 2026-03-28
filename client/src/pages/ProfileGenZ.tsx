/**
 * Gen Z Profile Page - Premium Dark Theme
 * Uses design-system.css variables for consistent theming
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useCredits } from '../context/CreditsContext';
import { getAllQuestions } from '../lib/data';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import {
  User, Settings, Zap, Trophy, Target, Sparkles, Home,
  Shuffle, Eye, ChevronRight, Shield, Crown,
  Clock, Star, Award, BookOpen
} from 'lucide-react';

const achievements = [
  { id: 1, name: 'First Steps', desc: 'Complete your first question', icon: '🌟', achieved: true },
  { id: 2, name: 'Quick Learner', desc: 'Complete 10 questions', icon: '⚡', achieved: true },
  { id: 3, name: 'On Fire', desc: '7 day streak', icon: '🔥', achieved: true },
  { id: 4, name: 'Dedicated', desc: '30 day streak', icon: '💎', achieved: false },
  { id: 5, name: 'Master', desc: 'Complete all questions', icon: '👑', achieved: false },
  { id: 6, name: 'Perfect Week', desc: '7 days in a row', icon: '🎯', achieved: false },
];

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function formatRelativeTime(hoursAgo: number): string {
  if (hoursAgo < 24) return rtf.format(-hoursAgo, 'hour');
  const days = Math.round(hoursAgo / 24);
  return rtf.format(-days, 'day');
}

const learningHistory = [
  { id: 1, channel: 'JavaScript', questions: 45, lastActiveHours: 2, color: 'from-yellow-400 to-yellow-600' },
  { id: 2, channel: 'React', questions: 32, lastActiveHours: 24, color: 'from-cyan-400 to-blue-500' },
  { id: 3, channel: 'TypeScript', questions: 28, lastActiveHours: 72, color: 'from-blue-500 to-indigo-600' },
  { id: 4, channel: 'Node.js', questions: 15, lastActiveHours: 168, color: 'from-green-400 to-emerald-600' },
];

// Design system card styles using CSS variables
const cardBase = "relative rounded-2xl transition-all duration-300 border";
const cardPremium = `${cardBase} bg-[var(--color-base-card)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5`;
const cardGlass = `${cardBase} bg-card/50 backdrop-blur-xl border-border`;

export default function ProfileGenZ() {
  const [, setLocation] = useLocation();
  const { preferences, toggleShuffleQuestions, togglePrioritizeUnvisited, toggleHideCertifications } = useUserPreferences();
  const { balance } = useCredits();
  const [totalCompleted, setTotalCompleted] = useState(0);

  useEffect(() => {
    const allQuestions = getAllQuestions();
    const allCompletedIds = new Set<string>();
    
    allQuestions.forEach(q => {
      const stored = localStorage.getItem(`progress-${q.channel}`);
      if (stored) {
        const completedIds = new Set(JSON.parse(stored));
        if (completedIds.has(q.id)) {
          allCompletedIds.add(q.id);
        }
      }
    });
    
    setTotalCompleted(allCompletedIds.size);
  }, []);

  const level = Math.floor(balance / 100);
  const xpInLevel = balance % 100;
  const progressPercent = xpInLevel;
  const achievedCount = achievements.filter(a => a.achieved).length;

  return (
    <>
      <SEOHead
        title="Profile - Your Settings"
        description="Customize your learning experience"
        canonical="https://open-interview.github.io/profile"
      />

      <AppLayout>
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
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Dark theme background using design system */}
        <div 
          className="min-h-screen text-[var(--color-text-primary)] overflow-x-hidden w-full pb-12"
          style={{ background: 'linear-gradient(180deg, var(--color-base-dark) 0%, var(--color-base-black) 100%)' }}
        >
          {/* Animated background orbs - dark theme accent colors */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-96 h-96 rounded-full blur-3xl"
              style={{ 
                background: 'linear-gradient(135deg, hsla(190, 100%, 50%, 0.15) 0%, hsla(270, 100%, 65%, 0.15) 100%)',
                top: '10%', 
                left: '10%' 
              }}
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-80 h-80 rounded-full blur-3xl"
              style={{ 
                background: 'linear-gradient(135deg, hsla(270, 100%, 65%, 0.1) 0%, hsla(330, 100%, 65%, 0.1) 100%)',
                top: '60%', 
                right: '10%' 
              }}
              animate={{
                x: [0, -40, 0],
                y: [0, 50, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="max-w-4xl mx-auto w-full relative z-10 px-4">
            {/* Premium Profile Header - Dark theme with gradient */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-8 p-8 rounded-3xl overflow-hidden"
              style={{ 
                background: 'var(--gradient-primary)',
                boxShadow: 'var(--shadow-lg), var(--glow-cyan)'
              }}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsla(190, 100%, 40%, 0.8) 0%, hsla(270, 100%, 55%, 0.9) 50%, hsla(330, 100%, 65%, 0.8) 100%)' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Decorative Elements */}
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
                style={{
                  background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.5) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 40%)'
                }}
              />
              
              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-foreground/30 rounded-full"
                    initial={{ 
                      x: Math.random() * 100 + '%', 
                      y: '110%' 
                    }}
                    animate={{ 
                      y: '-10%',
                      x: `${Math.random() * 100}%`
                    }}
                    transition={{ 
                      duration: 4 + Math.random() * 2, 
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "linear"
                    }}
                  />
                ))}
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Premium Avatar with Glow Effect */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="relative"
                >
                  {/* Outer glow ring */}
                  <div className="absolute -inset-3 rounded-full blur-xl animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%)' }} />
                  
                  {/* Glass avatar container */}
                  <div 
                    className="relative w-32 h-32 rounded-2xl flex items-center justify-center border-4"
                    style={{ 
                      background: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(255,255,255,0.3)',
                      boxShadow: 'var(--shadow-md), inset 2px 2px 8px rgba(255,255,255,0.1), inset -2px -2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <User className="w-16 h-16 text-foreground" strokeWidth={1.5} />
                  </div>
                  
                  {/* Premium badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, hsl(45, 100%, 50%) 0%, hsl(30, 100%, 50%) 100%)',
                      border: '3px solid white',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <Star className="w-6 h-6 text-foreground" fill="white" stroke="none" />
                  </motion.div>
                </motion.div>
                
                <div className="text-center md:text-left flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h1 className="text-4xl md:text-5xl font-black text-foreground mb-1 tracking-tight">
                      Level {level}
                    </h1>
                    <p className="text-foreground/90 text-lg font-medium">{balance.toLocaleString()} XP • {totalCompleted} completed</p>
                  </motion.div>
                  
                  {/* XP Progress Bar - Dark theme style */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-5 max-w-sm mx-auto md:mx-0"
                  >
                    <div className="flex justify-between text-sm text-foreground/70 mb-2 font-medium">
                      <span>Level {level}</span>
                      <span>{xpInLevel}/100 XP</span>
                      <span>Level {level + 1}</span>
                    </div>
                    <div 
                      className="h-4 rounded-full overflow-hidden"
                      style={{ background: 'rgba(0,0,0,0.3)' }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ 
                          background: 'linear-gradient(90deg, hsl(45, 100%, 50%) 0%, hsl(30, 100%, 50%) 100%)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 to-transparent" />
                        <motion.div
                          className="absolute inset-0 bg-foreground/40"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Premium Crown Button - Glass morphism */}
                <motion.button
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-5 rounded-2xl border group"
                  aria-label="Premium"
                  style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <Crown className="w-10 h-10 drop-shadow-md text-[var(--color-accent-cyan)]" style={{ color: 'hsl(45, 100%, 50%)' }} />
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Cards - Dark theme grid */}
            <div className="grid grid-cols-3 gap-5 mb-8 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${cardPremium} p-5 text-center`}
              >
                <div 
                  className="w-14 h-14 mx-auto mb-3 rounded-[18px] flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, hsla(190, 100%, 50%, 0.15) 0%, hsla(220, 100%, 50%, 0.15) 100%)',
                    boxShadow: 'var(--shadow-sm), inset 2px 2px 6px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  <Zap className="w-7 h-7" style={{ color: 'var(--color-accent-cyan)' }} />
                </div>
                <div className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>{balance.toLocaleString()}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total XP</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${cardPremium} p-5 text-center`}
              >
                <div 
                  className="w-14 h-14 mx-auto mb-3 rounded-[18px] flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, hsla(270, 100%, 65%, 0.15) 0%, hsla(330, 100%, 65%, 0.15) 100%)',
                    boxShadow: 'var(--shadow-sm), inset 2px 2px 6px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  <Trophy className="w-7 h-7" style={{ color: 'var(--color-accent-purple)' }} />
                </div>
                <div className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>{level}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Level</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${cardPremium} p-5 text-center`}
              >
                <div 
                  className="w-14 h-14 mx-auto mb-3 rounded-[18px] flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, hsla(45, 100%, 50%, 0.15) 0%, hsla(30, 100%, 50%, 0.15) 100%)',
                    boxShadow: 'var(--shadow-sm), inset 2px 2px 6px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  <Target className="w-7 h-7" style={{ color: 'hsl(30, 100%, 50%)' }} />
                </div>
                <div className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>{totalCompleted}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Completed</div>
              </motion.div>
            </div>

            {/* Premium Banner - Glassmorphism with Design System Gradient */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-8 relative"
            >
              <div 
                className="absolute -inset-0.5 rounded-2xl blur opacity-40" 
                style={{ background: 'var(--gradient-primary)' }}
              />
              <div 
                className="relative p-6 rounded-2xl overflow-hidden"
                style={{ 
                  background: 'var(--gradient-primary)',
                  boxShadow: 'var(--shadow-lg), var(--glow-purple)'
                }}
              >
                <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }} />
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-[18px] flex items-center justify-center"
                      style={{ 
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.2), inset -2px -2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Crown className="w-7 h-7" style={{ color: 'hsl(45, 100%, 50%)' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground">Upgrade to Premium</h3>
                      <p className="text-sm text-foreground/80">Unlock all features & accelerate learning</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 font-bold rounded-2xl"
                    style={{ 
                      background: 'var(--color-base-card)',
                      color: 'var(--color-text-primary)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    Upgrade
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Achievement Badges - Dark theme cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 w-full"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, hsla(45, 100%, 50%, 0.2) 0%, hsla(30, 100%, 50%, 0.2) 100%)'
                    }}
                  >
                    <Award className="w-5 h-5" style={{ color: 'hsl(30, 100%, 50%)' }} />
                  </div>
                  Achievements
                </h2>
                <span 
                  className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ 
                    background: 'var(--color-base-elevated)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  {achievedCount}/{achievements.length}
                </span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {achievements.map((achievement, i) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`${cardPremium} p-4 text-center cursor-pointer ${
                      achievement.achieved
                        ? ''
                        : 'opacity-60'
                    }`}
                    style={{
                      background: achievement.achieved 
                        ? 'linear-gradient(135deg, hsla(45, 100%, 50%, 0.1) 0%, hsla(30, 100%, 50%, 0.1) 100%)'
                        : 'var(--color-base-card)'
                    }}
                  >
                    <div className="text-4xl mb-2 transform transition-transform hover:scale-110">{achievement.icon}</div>
                    <div 
                      className="font-bold text-sm"
                      style={{ color: achievement.achieved ? 'var(--color-text-primary)' : 'var(--color-text-disabled)' }}
                    >
                      {achievement.name}
                    </div>
                    <div 
                      className="text-xs mt-1"
                      style={{ color: achievement.achieved ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)' }}
                    >
                      {achievement.desc}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Learning History Timeline - Dark theme */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8 w-full"
            >
              <h2 className="text-2xl font-black flex items-center gap-3 mb-6" style={{ color: 'var(--color-text-primary)' }}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, hsla(190, 100%, 50%, 0.15) 0%, hsla(220, 100%, 50%, 0.15) 100%)'
                  }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: 'var(--color-accent-cyan)' }} />
                </div>
                Learning History
              </h2>
              <div className="space-y-4">
                {learningHistory.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className={`${cardPremium} p-5 flex items-center gap-5`}
                  >
                    <div 
                      className="w-14 h-14 rounded-[18px] flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${item.color.includes('yellow') ? 'hsl(48, 100%, 50%)' : item.color.includes('cyan') ? 'hsl(190, 100%, 50%)' : item.color.includes('blue') ? 'hsl(220, 100%, 50%)' : 'hsl(150, 100%, 40%)'} 0%, ${item.color.includes('yellow') ? 'hsl(38, 100%, 50%)' : item.color.includes('cyan') ? 'hsl(210, 100%, 50%)' : item.color.includes('blue') ? 'hsl(240, 100%, 60%)' : 'hsl(160, 100%, 40%)'} 100%)`,
                        boxShadow: 'var(--shadow-md)'
                      }}
                    >
                      <BookOpen className="w-7 h-7 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{item.channel}</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.questions} questions completed</p>
                    </div>
                    <div className="text-right">
                      <div 
                        className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full"
                        style={{ 
                          background: 'var(--color-base-elevated)',
                          color: 'var(--color-text-secondary)'
                        }}
                      >
                        <Clock className="w-4 h-4" />
                        {formatRelativeTime(item.lastActiveHours)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Settings - Dark theme section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-6 w-full"
            >
              <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, hsla(0, 0%, 20%, 0.5) 0%, hsla(0, 0%, 10%, 0.5) 100%)'
                  }}
                >
                  <Settings className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                </div>
                Settings
              </h2>

              {/* Learning Preferences - Dark theme card */}
              <div className={`${cardPremium} p-7 space-y-6 w-full`}>
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent-cyan)' }} />
                  Learning Preferences
                </h3>

                <div 
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: 'var(--color-base-elevated)' }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, hsla(190, 100%, 50%, 0.15) 0%, hsla(220, 100%, 50%, 0.15) 100%)',
                        boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Shuffle className="w-5 h-5" style={{ color: 'var(--color-accent-cyan)' }} />
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Shuffle Questions</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Randomize question order</div>
                    </div>
                  </div>
                  <button
                    onClick={toggleShuffleQuestions}
                    role="switch"
                    aria-checked={preferences.shuffleQuestions !== false}
                    aria-label="Shuffle Questions"
                    className="w-14 h-8 rounded-full transition-all"
                    style={{ 
                      background: preferences.shuffleQuestions !== false
                        ? 'var(--gradient-primary)'
                        : 'var(--color-base-darker)',
                      boxShadow: preferences.shuffleQuestions !== false ? 'var(--glow-cyan)' : 'inset 2px 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    <motion.div
                      animate={{ x: preferences.shuffleQuestions !== false ? 24 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-6 h-6 rounded-full"
                      style={{ 
                        background: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    />
                  </button>
                </div>

                <div 
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: 'var(--color-base-elevated)' }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, hsla(190, 100%, 60%, 0.15) 0%, hsla(200, 100%, 50%, 0.15) 100%)',
                        boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Eye className="w-5 h-5" style={{ color: 'var(--color-accent-cyan-light)' }} />
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Prioritize New</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Show unvisited questions first</div>
                    </div>
                  </div>
                  <button
                    onClick={togglePrioritizeUnvisited}
                    role="switch"
                    aria-checked={preferences.prioritizeUnvisited !== false}
                    aria-label="Prioritize New"
                    className="w-14 h-8 rounded-full transition-all"
                    style={{ 
                      background: preferences.prioritizeUnvisited !== false
                        ? 'var(--gradient-primary)'
                        : 'var(--color-base-darker)',
                      boxShadow: preferences.prioritizeUnvisited !== false ? 'var(--glow-cyan)' : 'inset 2px 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    <motion.div
                      animate={{ x: preferences.prioritizeUnvisited !== false ? 24 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-6 h-6 rounded-full"
                      style={{ 
                        background: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    />
                  </button>
                </div>

                <div 
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: 'var(--color-base-elevated)' }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, hsla(270, 100%, 65%, 0.15) 0%, hsla(330, 100%, 65%, 0.15) 100%)',
                        boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Shield className="w-5 h-5" style={{ color: 'var(--color-accent-purple)' }} />
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Hide Certifications</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Show certification content</div>
                    </div>
                  </div>
                  <button
                    onClick={toggleHideCertifications}
                    role="switch"
                    aria-checked={preferences.hideCertifications}
                    aria-label="Hide Certifications"
                    className="w-14 h-8 rounded-full transition-all"
                    style={{ 
                      background: preferences.hideCertifications
                        ? 'var(--color-base-darker)'
                        : 'var(--gradient-primary)',
                      boxShadow: preferences.hideCertifications ? 'inset 2px 2px 6px rgba(0,0,0,0.2)' : 'var(--glow-purple)'
                    }}
                  >
                    <motion.div
                      animate={{ x: preferences.hideCertifications ? 2 : 24 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-6 h-6 rounded-full"
                      style={{ 
                        background: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* Quick Actions - Dark theme buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation('/badges')}
                  className={`${cardPremium} p-5 text-left flex items-center justify-between group`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, hsla(45, 100%, 50%, 0.15) 0%, hsla(30, 100%, 50%, 0.15) 100%)',
                        boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Trophy className="w-6 h-6" style={{ color: 'hsl(30, 100%, 50%)' }} />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Achievements</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>View your badges</div>
                    </div>
                  </div>
                  <ChevronRight 
                    className="w-5 h-5 transition-all group-hover:translate-x-1" 
                    style={{ color: 'var(--color-text-tertiary)' }} 
                  />
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation('/stats')}
                  className={`${cardPremium} p-5 text-left flex items-center justify-between group`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, hsla(190, 100%, 50%, 0.15) 0%, hsla(220, 100%, 50%, 0.15) 100%)',
                        boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Sparkles className="w-6 h-6" style={{ color: 'var(--color-accent-cyan)' }} />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Statistics</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>View your progress</div>
                    </div>
                  </div>
                  <ChevronRight 
                    className="w-5 h-5 transition-all group-hover:translate-x-1" 
                    style={{ color: 'var(--color-text-tertiary)' }} 
                  />
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation('/learning-paths')}
                  className={`${cardPremium} p-5 text-left flex items-center justify-between group`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, hsla(270, 100%, 65%, 0.15) 0%, hsla(330, 100%, 65%, 0.15) 100%)',
                        boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Target className="w-6 h-6" style={{ color: 'var(--color-accent-purple)' }} />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Learning Paths</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Choose your career</div>
                    </div>
                  </div>
                  <ChevronRight 
                    className="w-5 h-5 transition-all group-hover:translate-x-1" 
                    style={{ color: 'var(--color-text-tertiary)' }} 
                  />
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation('/channels')}
                  className={`${cardPremium} p-5 text-left flex items-center justify-between group`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, hsla(160, 100%, 40%, 0.15) 0%, hsla(170, 100%, 40%, 0.15) 100%)',
                        boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Shield className="w-6 h-6" style={{ color: 'hsl(160, 100%, 40%)' }} />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Channels</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Browse topics</div>
                    </div>
                  </div>
                  <ChevronRight 
                    className="w-5 h-5 transition-all group-hover:translate-x-1" 
                    style={{ color: 'var(--color-text-tertiary)' }} 
                  />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
