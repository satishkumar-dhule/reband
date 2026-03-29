import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useAchievements } from '../hooks/use-achievements';
import { Trophy, Lock, Award, Home } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { Button } from "../components/ui/button";

const tierColors: Record<string, string> = {
  bronze: 'text-orange-600',
  silver: 'text-slate-400',
  gold: 'text-yellow-500',
  platinum: 'text-violet-400',
  diamond: 'text-cyan-400',
};

const tierBg: Record<string, string> = {
  bronze: 'bg-orange-500/10',
  silver: 'bg-slate-500/10',
  gold: 'bg-yellow-500/10',
  platinum: 'bg-violet-500/10',
  diamond: 'bg-cyan-500/10',
};

export default function BadgesGenZ() {
  const [, setLocation] = useLocation();
  const { progress: allBadges, stats, isLoading } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(allBadges.map(b => b.achievement.category))),
    [allBadges]
  );
  const filteredBadges = useMemo(
    () => selectedCategory
      ? allBadges.filter(b => b.achievement.category === selectedCategory)
      : allBadges,
    [allBadges, selectedCategory]
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-48 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] animate-pulse" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <SEOHead
        title="Achievements - DevPrep"
        description="View your earned badges and achievements"
        canonical="https://open-interview.github.io/badges"
      />

      <AppLayout>
        <div className="bg-[var(--gh-canvas-subtle)] min-h-screen">
          <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">
                    <Home className="w-3.5 h-3.5 mr-1" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Achievements</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-[var(--gh-fg)] flex items-center gap-2">
                <Award className="w-6 h-6 text-[var(--gh-fg-muted)]" />
                Achievements
              </h1>
              <p className="text-[var(--gh-fg-muted)]">
                You've earned {stats.unlocked} of {stats.total} total badges. Keep it up!
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md p-6 mb-8">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm font-medium text-[var(--gh-fg)]">Overall Progress</span>
                <span className="text-sm font-bold text-[var(--gh-fg)]">{stats.percentage}%</span>
              </div>
              <div className="gh-progress mb-4">
                <div 
                  className="gh-progress-bar" 
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--gh-success-emphasis)]" />
                  <span className="text-[var(--gh-fg-muted)]">{stats.unlocked} Earned</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--gh-border)]" />
                  <span className="text-[var(--gh-fg-muted)]">{stats.locked} Locked</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-[var(--gh-border)] mb-6 overflow-x-auto gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  !selectedCategory
                    ? 'border-[var(--gh-accent-fg)] text-[var(--gh-fg)]'
                    : 'border-transparent text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:border-[var(--gh-border)]'
                }`}
              >
                All Badges
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap capitalize ${
                    selectedCategory === cat
                      ? 'border-[var(--gh-accent-fg)] text-[var(--gh-fg)]'
                      : 'border-transparent text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:border-[var(--gh-border)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredBadges.map((badgeProgress) => {
                const badge = badgeProgress.achievement;
                const isUnlocked = badgeProgress.isUnlocked;
                const tier = badge.tier as keyof typeof tierColors;

                return (
                  <div
                    key={badge.id}
                    className={`bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md p-4 flex flex-col items-center text-center transition-all ${
                      isUnlocked ? 'hover:scale-[1.02] hover:shadow-md hover:border-[var(--gh-border-strong)]' : 'opacity-60 grayscale-[0.5] hover:opacity-80'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                      isUnlocked ? (tierBg[tier] || 'bg-[var(--gh-canvas-subtle)]') : 'bg-[var(--gh-canvas-subtle)]'
                    }`}>
                      {isUnlocked ? (
                        <Trophy className={`w-8 h-8 ${tierColors[tier] || 'text-[var(--gh-fg-muted)]'}`} />
                      ) : (
                        <Lock className="w-8 h-8 text-[var(--gh-fg-subtle)]" />
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-[var(--gh-fg)] leading-snug mb-1 line-clamp-1">{badge.name}</h3>
                    <p className="text-[10px] text-[var(--gh-fg-muted)] line-clamp-2 mb-3 h-6">{badge.description}</p>

                    <div className="mt-auto pt-2 border-t border-[var(--gh-border-muted)] w-full flex flex-col gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isUnlocked ? (tierColors[tier] || 'text-[var(--gh-fg-muted)]') : 'text-[var(--gh-fg-subtle)]'
                      }`}>
                        {badge.tier}
                      </span>
                      
                      {isUnlocked && badgeProgress.unlockedAt && (
                        <span className="text-[9px] text-[var(--gh-success-fg)] font-medium">
                          Unlocked {new Date(badgeProgress.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                      
                      {!isUnlocked && badgeProgress.progress !== undefined && badgeProgress.target !== undefined && (
                        <div className="w-full">
                          <div className="flex justify-between gap-2 text-[9px] text-[var(--gh-fg-subtle)] mb-1">
                            <span>{Math.round((badgeProgress.progress / badgeProgress.target) * 100)}%</span>
                          </div>
                          <div className="gh-progress h-1">
                            <div 
                              className="gh-progress-bar bg-[var(--gh-accent-emphasis)]" 
                              style={{ width: `${(badgeProgress.progress / badgeProgress.target) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {allBadges.length === 0 && (
              <div className="text-center py-12 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md">
                <Trophy className="w-12 h-12 text-[var(--gh-fg-subtle)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--gh-fg)] mb-2">No badges found</h3>
                <p className="text-[var(--gh-fg-muted)] mb-6">Start learning to unlock your first achievement!</p>
                <Button 
                  onClick={() => setLocation('/channels')}
                  className="bg-[var(--gh-success-emphasis)] text-white hover:bg-[var(--gh-success-hover)]"
                >
                  Browse Channels
                </Button>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
