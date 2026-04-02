/**
 * Modern Home Page V3 - Clean, Spacious, Aesthetic
 * Simplified design with better spacing and visual hierarchy
 */

import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useChannelStats } from '../../hooks/use-stats';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useProgress, useGlobalStats } from '../../hooks/use-progress';
import { useCredits } from '../../context/CreditsContext';
import { ProgressStorage } from '../../services/storage.service';
import { allChannelsConfig } from '../../lib/channels-config';
import { ResumeSection } from './ResumeSection';
import {
  Target, Flame, Trophy, Zap, ChevronRight, Plus,
  Mic, Code, Brain, TrendingUp, ArrowRight, Sparkles, Users,
  Layout, Server, CheckCircle
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, any> = {
  'layout': Layout,
  'server': Server,
  'brain': Brain,
  'code': Code,
};

export function ModernHomePageV3() {
  const [, setLocation] = useLocation();
  const { stats: channelStats } = useChannelStats();
  const { getSubscribedChannels } = useUserPreferences();
  const { stats: activityStats } = useGlobalStats();
  const { balance, formatCredits } = useCredits();
  
  const subscribedChannels = getSubscribedChannels();
  const hasChannels = subscribedChannels.length > 0;
  const totalCompleted = ProgressStorage.getAllCompletedIds().size;
  
  // Calculate streak
  const streak = (() => {
    try {
      let s = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (activityStats?.find(x => x.date === dateStr)) s++;
        else break;
      }
      return s;
    } catch {
      return 0;
    }
  })();

  const questionCounts: Record<string, number> = {};
  channelStats?.forEach(s => { questionCounts[s.id] = s.total || 0; });

  if (!hasChannels) {
    return (
      <div className="min-h-screen bg-var(--gh-canvas) flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl text-center space-y-12"
        >
          <div className="space-y-6">
            <div className="w-24 h-24 mx-auto bg-var(--gh-success-emphasis) rounded-2xl flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-4">Welcome to CodeReels</h1>
              <p className="text-xl text-var(--gh-fg-muted)">Master technical interviews with AI-powered practice</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "AI-Powered", desc: "Smart question selection" },
              { icon: Mic, title: "Voice Practice", desc: "Real interview simulation" },
              { icon: Trophy, title: "Track Progress", desc: "Detailed analytics" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="p-8 bg-var(--gh-canvas-overlay) rounded-xl border border-var(--gh-border)"
              >
                <div className="w-14 h-14 bg-var(--gh-success-emphasis)/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-var(--gh-success-fg)" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-var(--gh-fg-muted)">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.button
            onClick={() => setLocation('/channels')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-var(--gh-success-emphasis) hover:bg-var(--gh-success-hover) text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3"
          >
            Start Your Journey
            <ArrowRight className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-var(--gh-canvas)">
      {/* Hero */}
      <section className="border-b border-var(--gh-border-muted)">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h1 className="text-5xl font-bold text-white mb-3">Ready to practice?</h1>
                <p className="text-lg text-var(--gh-fg-muted)">Continue your interview preparation journey</p>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-var(--gh-success-emphasis)/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-var(--gh-success-fg)" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{totalCompleted}</div>
                    <div className="text-xs text-var(--gh-fg-muted)">Completed</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{streak}</div>
                    <div className="text-xs text-var(--gh-fg-muted)">Day Streak</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{formatCredits(balance)}</div>
                    <div className="text-xs text-var(--gh-fg-muted)">Credits</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setLocation('/voice-interview')}
              className="group px-8 py-4 bg-var(--gh-success-emphasis) hover:bg-var(--gh-success-hover) text-white rounded-xl font-semibold text-lg transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Mic className="w-6 h-6" />
              Voice Interview
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Resume */}
          <ResumeSection />
          
          {/* Quick Actions */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Quick Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Voice Interview', desc: 'Practice speaking', icon: Mic, color: 'bg-var(--gh-accent-emphasis)', path: '/voice-interview' },
                { title: 'Coding Challenge', desc: 'Solve problems', icon: Code, color: 'bg-var(--gh-success-emphasis)', path: '/coding' },
                { title: 'Training Mode', desc: 'Structured learning', icon: Target, color: 'bg-var(--gh-danger-emphasis)', path: '/training' },
                { title: 'Quick Tests', desc: 'Rapid checks', icon: Zap, color: 'bg-var(--gh-attention-emphasis)', path: '/tests' }
              ].map((action, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setLocation(action.path)}
                  className="group text-left p-6 bg-var(--gh-canvas-overlay) hover:bg-[var(--gh-canvas-overlay)]/80 border border-var(--gh-border) hover:border-var(--gh-accent-fg) rounded-xl transition-all"
                >
                  <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{action.title}</h3>
                  <p className="text-sm text-var(--gh-fg-muted)">{action.desc}</p>
                </motion.button>
              ))}
            </div>
          </section>
          
          {/* Channels */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">Your Channels</h2>
                <div className="px-3 py-1 bg-var(--gh-accent-emphasis)/10 text-var(--gh-accent-fg) rounded-full text-sm font-semibold">
                  {subscribedChannels.length}
                </div>
              </div>
              <button
                onClick={() => setLocation('/channels')}
                className="px-4 py-2 bg-var(--gh-bg-muted) hover:bg-var(--gh-border) text-white rounded-lg transition-all flex items-center gap-2 border border-var(--gh-border)"
              >
                <Plus className="w-4 h-4" />
                Add Channel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscribedChannels.map((channel: any, i: number) => {
                const { completed } = useProgress(channel.id);
                const questionCount = questionCounts[channel.id] || 0;
                const progress = questionCount > 0 ? Math.round((completed.length / questionCount) * 100) : 0;
                const config = allChannelsConfig.find(c => c.id === channel.id);
                const IconComponent = config?.icon ? iconMap[config.icon] || Code : Code;

                return (
                  <motion.button
                    key={channel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    onClick={() => setLocation(`/channel/${channel.id}`)}
                    className="group relative p-6 bg-var(--gh-canvas-overlay) hover:bg-[var(--gh-canvas-overlay)]/80 border border-var(--gh-border) hover:border-var(--gh-accent-fg) rounded-xl transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-var(--gh-bg-muted) group-hover:bg-var(--gh-border) flex items-center justify-center text-var(--gh-accent-fg) transition-colors">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">{channel.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-var(--gh-fg-muted)">
                            <span>{completed.length}/{questionCount}</span>
                            <span>•</span>
                            <span>{progress}%</span>
                          </div>
                        </div>
                      </div>
                      {progress === 100 && <Trophy className="w-5 h-5 text-amber-500" />}
                    </div>
                    
                    <div className="h-2 bg-var(--gh-bg-muted) rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-var(--gh-success-emphasis) rounded-full motion-reduce:transition-none"
                      />
                    </div>

                    <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-var(--gh-fg-muted) group-hover:text-var(--gh-accent-fg) group-hover:translate-x-1 transition-all" />
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Paths */}
            <section className="p-8 bg-var(--gh-canvas-overlay) border border-var(--gh-border) rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Learning Paths</h3>
                <button onClick={() => setLocation('/learning-paths')} className="text-sm text-var(--gh-accent-fg) hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-6">
                {[
                  { title: 'Frontend Development', progress: 65, color: 'bg-var(--gh-accent-emphasis)', icon: Layout },
                  { title: 'Backend Engineering', progress: 40, color: 'bg-var(--gh-success-emphasis)', icon: Server },
                  { title: 'Algorithms & DS', progress: 80, color: 'bg-var(--gh-done-fg)', icon: Brain }
                ].map((path, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${path.color} rounded-lg flex items-center justify-center`}>
                        <path.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">{path.title}</span>
                          <span className="text-sm text-var(--gh-fg-muted)">{path.progress}%</span>
                        </div>
                        <div className="h-2 bg-var(--gh-bg-muted) rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${path.progress}%` }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className={`h-full ${path.color} rounded-full motion-reduce:transition-none`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Community */}
            <section className="p-8 bg-var(--gh-canvas-overlay) border border-var(--gh-border) rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-var(--gh-accent-emphasis)/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-var(--gh-accent-fg)" />
                </div>
                <h3 className="text-xl font-bold text-white">Community</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-var(--gh-border-muted)">
                  <span className="text-var(--gh-fg-muted)">Active learners</span>
                  <span className="text-xl font-bold text-white">12,847</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-var(--gh-border-muted)">
                  <span className="text-var(--gh-fg-muted)">Questions solved today</span>
                  <span className="text-xl font-bold text-white">3,291</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-var(--gh-fg-muted)">Success rate</span>
                  <span className="text-xl font-bold text-var(--gh-success-fg)">94%</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-var(--gh-border-muted)">
                <div className="flex items-center gap-2 text-sm text-var(--gh-fg-muted)">
                  <TrendingUp className="w-4 h-4 text-var(--gh-success-fg)" />
                  <span>You're in the top <span className="text-var(--gh-success-fg) font-semibold">15%</span> this week!</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
