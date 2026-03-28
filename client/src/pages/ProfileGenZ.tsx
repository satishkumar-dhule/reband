import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useCredits } from '../context/CreditsContext';
import { getAllQuestions } from '../lib/data';
import {
  User, Settings, Target, 
  Award, BookOpen,
  Mail, Link as LinkIcon, MapPin, Twitter
} from 'lucide-react';

const achievements = [
  { id: 1, name: 'First Steps', desc: 'Complete your first question', icon: '🌟', achieved: true },
  { id: 2, name: 'Quick Learner', desc: 'Complete 10 questions', icon: '⚡', achieved: true },
  { id: 3, name: 'On Fire', desc: '7 day streak', icon: '🔥', achieved: true },
  { id: 4, name: 'Dedicated', desc: '30 day streak', icon: '💎', achieved: false },
  { id: 5, name: 'Master', desc: 'Complete all questions', icon: '👑', achieved: false },
  { id: 6, name: 'Perfect Week', desc: '7 days in a row', icon: '🎯', achieved: false },
];

const learningHistory = [
  { id: 1, channel: 'JavaScript', questions: 45, total: 100, lastActive: '2 hours ago' },
  { id: 2, channel: 'React', questions: 32, total: 80, lastActive: '1 day ago' },
  { id: 3, channel: 'TypeScript', questions: 28, total: 60, lastActive: '3 days ago' },
  { id: 4, channel: 'Node.js', questions: 15, total: 90, lastActive: '1 week ago' },
];

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
  const achievedCount = achievements.filter(a => a.achieved).length;

  return (
    <>
      <SEOHead
        title="Profile - DevPrep"
        description="Your learning profile and achievements"
        canonical="https://open-interview.github.io/profile"
      />

      <AppLayout>
        <div className="bg-[var(--gh-canvas-subtle)] min-h-screen">
          <div className="max-w-[1280px] mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Left Sidebar */}
              <div className="w-full md:w-72 flex-shrink-0">
                <div className="relative group mb-4">
                  <div className="w-full aspect-square rounded-full border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-center overflow-hidden">
                    <User className="w-1/2 h-1/2 text-[var(--gh-fg-muted)]" />
                  </div>
                  <button className="absolute bottom-4 right-4 p-2 rounded-full border border-[var(--gh-border)] bg-[var(--gh-canvas)] shadow-sm hover:bg-[var(--gh-canvas-subtle)] transition-colors">
                    <Settings className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                  </button>
                </div>

                <div className="mb-6">
                  <h1 className="text-2xl font-semibold text-[var(--gh-fg)]">User_{level}</h1>
                  <p className="text-xl text-[var(--gh-fg-muted)] font-light">Dev Enthusiast</p>
                </div>

                <button className="w-full gh-btn gh-btn-secondary justify-center mb-6">
                  Edit profile
                </button>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-[var(--gh-fg)]">
                    <Award className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                    <span className="font-semibold">{level}</span>
                    <span className="text-[var(--gh-fg-muted)]">level</span>
                    <span className="mx-1">·</span>
                    <span className="font-semibold">{balance.toLocaleString()}</span>
                    <span className="text-[var(--gh-fg-muted)]">XP</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--gh-fg)]">
                    <Target className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                    <span className="font-semibold">{totalCompleted}</span>
                    <span className="text-[var(--gh-fg-muted)]">completed</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--gh-border)] space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--gh-fg)]">
                    <MapPin className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                    <span>Global</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--gh-fg)]">
                    <Mail className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                    <span className="text-[var(--gh-accent-fg)] hover:underline cursor-pointer">user@example.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--gh-fg)]">
                    <LinkIcon className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                    <span className="text-[var(--gh-accent-fg)] hover:underline cursor-pointer">devprep.io</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--gh-fg)]">
                    <Twitter className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                    <span className="text-[var(--gh-accent-fg)] hover:underline cursor-pointer">@devprep</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <nav className="flex gap-4 border-b border-[var(--gh-border)] mb-6 overflow-x-auto">
                  <button className="px-4 py-2 text-sm font-semibold border-b-2 border-[var(--gh-accent-fg)] text-[var(--gh-fg)] whitespace-nowrap">
                    Overview
                  </button>
                  <button className="px-4 py-2 text-sm text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] whitespace-nowrap">
                    Learning Paths
                  </button>
                  <button className="px-4 py-2 text-sm text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] whitespace-nowrap flex items-center gap-2">
                    Achievements
                    <span className="bg-[var(--gh-neutral-subtle)] text-[var(--gh-fg-muted)] text-xs px-2 py-0.5 rounded-full">{achievedCount}</span>
                  </button>
                </nav>

                <div className="space-y-8">
                  {/* Achievements Grid */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-[var(--gh-fg)]">Achievements</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {achievements.map((achievement) => (
                        <div 
                          key={achievement.id}
                          className={`p-3 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] text-center transition-all ${achievement.achieved ? 'opacity-100 hover:shadow-sm' : 'opacity-40 grayscale'}`}
                        >
                          <div className="text-2xl mb-1">{achievement.icon}</div>
                          <div className="text-xs font-semibold text-[var(--gh-fg)] truncate">{achievement.name}</div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Learning History */}
                  <section>
                    <h2 className="text-base font-semibold text-[var(--gh-fg)] mb-4">Learning History</h2>
                    <div className="space-y-3">
                      {learningHistory.map((item) => (
                        <div key={item.id} className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] hover:border-[var(--gh-accent-fg)] transition-all group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-md bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-[var(--gh-accent-fg)] group-hover:underline cursor-pointer">{item.channel}</h3>
                                <p className="text-xs text-[var(--gh-fg-muted)]">Updated {item.lastActive}</p>
                              </div>
                            </div>
                            <div className="text-xs font-medium text-[var(--gh-fg-muted)]">
                              {item.questions} / {item.total} questions
                            </div>
                          </div>
                          <div className="gh-progress">
                            <div 
                              className="gh-progress-bar" 
                              style={{ width: `${(item.questions / item.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Settings Section */}
                  <section className="pt-8 border-t border-[var(--gh-border)]">
                    <h2 className="text-xl font-semibold text-[var(--gh-fg)] mb-6 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Preferences
                    </h2>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--gh-fg)]">Shuffle Questions</h3>
                          <p className="text-xs text-[var(--gh-fg-muted)]">Randomize question order</p>
                        </div>
                        <button 
                          onClick={toggleShuffleQuestions}
                          className={`w-10 h-5 rounded-full transition-colors relative ${preferences.shuffleQuestions ? 'bg-[var(--gh-success-emphasis)]' : 'bg-[var(--gh-border)]'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.shuffleQuestions ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--gh-fg)]">Prioritize Unvisited</h3>
                          <p className="text-xs text-[var(--gh-fg-muted)]">Show new questions first</p>
                        </div>
                        <button 
                          onClick={togglePrioritizeUnvisited}
                          className={`w-10 h-5 rounded-full transition-colors relative ${preferences.prioritizeUnvisited ? 'bg-[var(--gh-success-emphasis)]' : 'bg-[var(--gh-border)]'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.prioritizeUnvisited ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--gh-fg)]">Hide Certifications</h3>
                          <p className="text-xs text-[var(--gh-fg-muted)]">Hide certification paths</p>
                        </div>
                        <button 
                          onClick={toggleHideCertifications}
                          className={`w-10 h-5 rounded-full transition-colors relative ${preferences.hideCertifications ? 'bg-[var(--gh-success-emphasis)]' : 'bg-[var(--gh-border)]'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.hideCertifications ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
