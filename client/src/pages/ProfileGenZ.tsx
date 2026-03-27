/**
 * Gen Z Profile Page - Your Settings & Preferences
 * Customize your experience
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
  Volume2, Shuffle, Eye, ChevronRight, Bell, Shield
} from 'lucide-react';

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

  return (
    <>
      <SEOHead
        title="Profile - Your Settings ⚙️"
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

        <div className="min-h-screen bg-background text-foreground overflow-x-hidden w-full pb-12">
          <div className="max-w-4xl mx-auto w-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mb-8"
            >
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-cyan-500 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-cyan-500 rounded-full blur-2xl opacity-50" />
                  <User className="w-12 h-12 text-black relative z-10" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-black">Level {level}</h1>
                  <p className="text-muted-foreground">{balance} XP • {totalCompleted} completed</p>
                </div>
              </div>

              {/* Level Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Level {level}</span>
                  <span className="text-muted-foreground">Level {level + 1}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-primary to-cyan-500"
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground mt-2">
                  {xpInLevel}/100 XP to next level
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-5 bg-gradient-to-br from-primary/20 to-cyan-500/20 backdrop-blur-xl rounded-[20px] border border-primary/30 text-center"
              >
                <Zap className="w-7 h-7 text-primary mx-auto mb-2" />
                <div className="text-2xl font-black">{balance}</div>
                <div className="text-xs text-muted-foreground">Total XP</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-[20px] border border-purple-500/30 text-center"
              >
                <Trophy className="w-7 h-7 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-black">{level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-5 bg-gradient-to-br from-[#ffd700]/20 to-[#ff8c00]/20 backdrop-blur-xl rounded-[20px] border border-[#ffd700]/30 text-center"
              >
                <Target className="w-7 h-7 text-[#ffd700] mx-auto mb-2" />
                <div className="text-2xl font-black">{totalCompleted}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </motion.div>
            </div>

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6 w-full"
            >
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Settings className="w-7 h-7" />
                Settings
              </h2>

              {/* Learning Preferences */}
              <div className="p-6 bg-muted/50 backdrop-blur-xl rounded-[24px] border border-border space-y-6 w-full">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Learning Preferences
                </h3>

                {/* Shuffle Questions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shuffle className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">Shuffle Questions</div>
                      <div className="text-sm text-muted-foreground">Randomize question order</div>
                    </div>
                  </div>
                  <button
                    onClick={toggleShuffleQuestions}
                    className={`w-14 h-8 rounded-full transition-all ${
                      preferences.shuffleQuestions !== false
                        ? 'bg-gradient-to-r from-primary to-cyan-500'
                        : 'bg-muted'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      preferences.shuffleQuestions !== false ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Prioritize Unvisited */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-cyan-500" />
                    <div>
                      <div className="font-semibold">Prioritize New</div>
                      <div className="text-sm text-muted-foreground">Show unvisited questions first</div>
                    </div>
                  </div>
                  <button
                    onClick={togglePrioritizeUnvisited}
                    className={`w-14 h-8 rounded-full transition-all ${
                      preferences.prioritizeUnvisited !== false
                        ? 'bg-gradient-to-r from-primary to-cyan-500'
                        : 'bg-muted'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      preferences.prioritizeUnvisited !== false ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Hide Certifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-semibold">Hide Certifications</div>
                      <div className="text-sm text-muted-foreground">Show certification content</div>
                    </div>
                  </div>
                  <button
                    onClick={toggleHideCertifications}
                    className={`w-14 h-8 rounded-full transition-all ${
                      preferences.hideCertifications
                        ? 'bg-muted'
                        : 'bg-gradient-to-r from-primary to-cyan-500'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      preferences.hideCertifications ? 'translate-x-1' : 'translate-x-7'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation('/badges')}
                  className="p-5 bg-gradient-to-br from-[#ffd700]/20 to-[#ff8c00]/20 backdrop-blur-xl rounded-[20px] border border-[#ffd700]/30 text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <Trophy className="w-8 h-8 text-[#ffd700]" />
                    <div>
                      <div className="font-bold">Achievements</div>
                      <div className="text-sm text-muted-foreground">View your badges</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation('/stats')}
                  className="p-5 bg-gradient-to-br from-primary/20 to-cyan-500/20 backdrop-blur-xl rounded-[20px] border border-primary/30 text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                    <div>
                      <div className="font-bold">Statistics</div>
                      <div className="text-sm text-muted-foreground">View your progress</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation('/learning-paths')}
                  className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-[20px] border border-purple-500/30 text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <Target className="w-8 h-8 text-purple-400" />
                    <div>
                      <div className="font-bold">Learning Paths</div>
                      <div className="text-sm text-muted-foreground">Choose your career</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation('/channels')}
                  className="p-5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-[20px] border border-emerald-500/30 text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <Shield className="w-8 h-8 text-emerald-400" />
                    <div>
                      <div className="font-bold">Channels</div>
                      <div className="text-sm text-muted-foreground">Browse topics</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
