import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useCredits } from '../context/CreditsContext';
import { getAllQuestions } from '../lib/data';
import {
  User, Settings, Target, 
  Award, BookOpen,
  Mail, Link as LinkIcon, MapPin, Twitter,
  ChevronLeft, Home, Coins, Gift, History, Mic
} from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { Button, IconButton } from '@/components/unified/Button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

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
  const { balance, state: creditsState, history, onRedeemCoupon, config } = useCredits();
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const allQuestions = getAllQuestions();
    const allCompletedIds = new Set<string>();
    
    allQuestions.forEach(q => {
      const stored = localStorage.getItem(`progress-${q.channel}`);
      if (stored) {
        let completedQuestions = [];
        try {
          completedQuestions = JSON.parse(stored);
        } catch {
          completedQuestions = [];
        }
        const completedIds = new Set(completedQuestions);
        if (completedIds.has(q.id)) {
          allCompletedIds.add(q.id);
        }
      }
    });
    
    setTotalCompleted(allCompletedIds.size);
    setIsLoading(false);
  }, []);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponMessage({ type: 'error', text: 'Please enter a coupon code' });
      return;
    }
    setIsSubmitting(true);
    const result = onRedeemCoupon(couponCode);
    setCouponMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    if (result.success) {
      setCouponCode('');
    }
    setIsSubmitting(false);
    setTimeout(() => setCouponMessage(null), 3000);
  };

  const level = Math.floor(balance / 100);
  const achievedCount = achievements.filter(a => a.achieved).length;

  // Loading skeleton
  if (isLoading) {
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
              <div className="animate-pulse space-y-6">
                <div className="flex gap-8">
                  {/* Sidebar skeleton */}
                  <div className="w-72 space-y-4">
                    <div className="aspect-square rounded-full bg-[var(--gh-canvas)] border border-[var(--gh-border)]" />
                    <div className="h-8 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded w-3/4" />
                    <div className="h-6 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded w-1/2" />
                  </div>
                  {/* Main content skeleton */}
                  <div className="flex-1 space-y-6">
                    <div className="h-48 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md" />
                    <div className="h-64 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Profile - DevPrep"
        description="Your learning profile and achievements"
        canonical="https://open-interview.github.io/profile"
      />

      <AppLayout>
        <div className="bg-[var(--gh-canvas-subtle)] min-h-screen" id="main-content">
          <div className="max-w-[1280px] mx-auto px-4 py-8">
            {/* Breadcrumb Navigation */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Left Sidebar */}
              <div className="w-full md:w-72 flex-shrink-0">
                <div className="relative group mb-4">
                  <div className="w-full aspect-square rounded-full border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-center overflow-hidden">
                    <User className="w-1/2 h-1/2 text-[var(--gh-fg-muted)]" />
                  </div>
                  <IconButton
                    icon={<Settings className="w-4 h-4 text-[var(--gh-fg-muted)]" />}
                    aria-label="Settings"
                    size="sm"
                    rounded="full"
                    className="absolute bottom-4 right-4"
                  />
                </div>

                <div className="mb-6">
                  <h1 className="text-2xl font-semibold text-[var(--gh-fg)]">User_{level}</h1>
                  <p className="text-xl text-[var(--gh-fg-muted)] font-light">Dev Enthusiast</p>
                </div>

                <Button variant="secondary" className="w-full mb-6">
                  Edit profile
                </Button>

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

                {/* Credits Section */}
                <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Coins className="w-4 h-4 text-[var(--gh-attention-fg)]" />
                    <span className="text-sm font-semibold text-[var(--gh-fg)]">{balance.toLocaleString()} Credits</span>
                  </div>
                  <p className="text-xs text-[var(--gh-fg-muted)] mb-3">
                    Earned: {creditsState.totalEarned.toLocaleString()} · Spent: {creditsState.totalSpent.toLocaleString()}
                  </p>

                  {/* How to earn */}
                  <div className="bg-[var(--gh-canvas)] rounded-lg p-2 mb-3">
                    <h4 className="text-xs font-semibold text-[var(--gh-attention-fg)] mb-1 flex items-center gap-1">
                      <Mic className="w-3 h-3" /> Earn Credits
                    </h4>
                    <div className="space-y-0.5 text-xs text-[var(--gh-fg-muted)]">
                      <div className="flex justify-between">
                        <span>Voice interview attempt</span>
                        <span className="text-[var(--gh-success-fg)]">+{config.VOICE_ATTEMPT}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Successful interview</span>
                        <span className="text-[var(--gh-success-fg)]">+{config.VOICE_SUCCESS_BONUS} bonus</span>
                      </div>
                      <div className="flex justify-between">
                        <span>View question</span>
                        <span className="text-[var(--gh-danger-fg)]">-{config.QUESTION_VIEW_COST}</span>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Redemption */}
                  <form onSubmit={handleCouponSubmit}>
                    <h4 className="text-xs font-semibold mb-1 flex items-center gap-1">
                      <Gift className="w-3 h-3" /> Redeem Coupon
                    </h4>
                    <div className="flex gap-1">
                      <label htmlFor="coupon-code" className="sr-only">Coupon code</label>
                      <Input
                        id="coupon-code"
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 text-xs"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={isSubmitting}
                      >
                        Apply
                      </Button>
                    </div>
                    {couponMessage && (
                      <p className={`text-xs mt-1 ${couponMessage.type === 'success' ? 'text-[var(--gh-success-fg)]' : 'text-[var(--gh-danger-fg)]'}`}>
                        {couponMessage.text}
                      </p>
                    )}
                  </form>

                  {/* Transaction History */}
                  {history.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--gh-border)]">
                      <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                        <History className="w-3 h-3" /> Recent Activity
                      </h4>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {history.slice(0, 5).map((tx) => (
                          <div key={tx.id} className="flex justify-between text-xs">
                            <span className="text-[var(--gh-fg-muted)] truncate flex-1">{tx.description}</span>
                            <span className={tx.amount > 0 ? 'text-[var(--gh-success-fg)]' : 'text-[var(--gh-danger-fg)]'}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <Button variant="primary" size="sm" className="border-b-2 border-[var(--gh-accent-fg)] rounded-none bg-transparent text-[var(--gh-fg)] hover:bg-transparent">
                    Overview
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-none text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)]">
                    Learning Paths
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-none text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)]">
                    Achievements
                    <span className="bg-[var(--gh-neutral-subtle)] text-[var(--gh-fg-muted)] text-xs px-2 py-0.5 rounded-full">{achievedCount}</span>
                  </Button>
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
                          className={`p-3 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] text-center transition-all ${achievement.achieved ? 'opacity-100 hover:scale-[1.02] hover:shadow-md' : 'opacity-40 grayscale'}`}
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
                        <Switch
                          checked={preferences.shuffleQuestions}
                          onCheckedChange={toggleShuffleQuestions}
                          aria-label="Toggle shuffle questions"
                        />
                      </div>

                      <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--gh-fg)]">Prioritize Unvisited</h3>
                          <p className="text-xs text-[var(--gh-fg-muted)]">Show new questions first</p>
                        </div>
                        <Switch
                          checked={preferences.prioritizeUnvisited}
                          onCheckedChange={togglePrioritizeUnvisited}
                          aria-label="Toggle prioritize unvisited"
                        />
                      </div>

                      <div className="p-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--gh-fg)]">Hide Certifications</h3>
                          <p className="text-xs text-[var(--gh-fg-muted)]">Hide certification paths</p>
                        </div>
                        <Switch
                          checked={preferences.hideCertifications}
                          onCheckedChange={toggleHideCertifications}
                          aria-label="Toggle hide certifications"
                        />
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
