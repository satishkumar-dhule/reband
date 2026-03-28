import { useState } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useAchievements } from '../hooks/use-achievements';
import { Trophy, Lock, ChevronRight, Award } from 'lucide-react';

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
  const { progress: allBadges, unlocked: unlockedBadges, locked: lockedBadges, nextUp, stats, isLoading } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(allBadges.map(b => b.achievement.category)));
  const filteredBadges = selectedCategory
    ? allBadges.filter(b => b.achievement.category === selectedCategory)
    : allBadges;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 rounded-md border border-border bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!allBadges || allBadges.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">
          <div className="rounded-md border border-border bg-card p-12 text-center">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-base font-semibold text-foreground mb-1">No badges yet</h2>
            <p className="text-sm text-muted-foreground mb-4">Complete challenges to earn your first badge</p>
            <button
              onClick={() => setLocation('/channels')}
              className="px-4 py-1.5 text-sm rounded-md font-medium text-white"
              style={{ backgroundColor: 'var(--gh-green)' }}
            >
              Start learning
            </button>
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
        <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">
          {/* Page header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-muted-foreground" />
                Achievements
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {stats.unlocked} of {stats.total} badges unlocked
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="rounded-md border border-border bg-card p-4 mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Overall progress</span>
              <span className="font-medium text-foreground">{stats.percentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%`, backgroundColor: 'var(--gh-green)' }}
              />
            </div>
            <div className="flex items-center gap-6 mt-3 text-sm">
              <span className="text-foreground font-medium">{stats.unlocked} unlocked</span>
              <span className="text-muted-foreground">{stats.locked} locked</span>
            </div>
          </div>

          {/* Category filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 text-xs rounded-md border font-medium transition-colors ${
                  !selectedCategory
                    ? 'border-[var(--gh-blue)] text-[var(--gh-blue)] bg-[var(--gh-blue)]/10'
                    : 'border-border text-muted-foreground hover:border-foreground/30'
                }`}
                data-testid="filter-all"
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-md border font-medium capitalize transition-colors ${
                    selectedCategory === cat
                      ? 'border-[var(--gh-blue)] text-[var(--gh-blue)] bg-[var(--gh-blue)]/10'
                      : 'border-border text-muted-foreground hover:border-foreground/30'
                  }`}
                  data-testid={`filter-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Badges grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredBadges.map((badgeProgress) => {
              const badge = badgeProgress.achievement;
              const isUnlocked = badgeProgress.isUnlocked;
              const currentProgress = badgeProgress.progress;
              const target = badgeProgress.target;
              const tier = badge.tier as keyof typeof tierColors;

              return (
                <div
                  key={badge.id}
                  className={`rounded-md border p-4 transition-colors ${
                    isUnlocked
                      ? 'border-border bg-card hover:border-foreground/30'
                      : 'border-border bg-card opacity-60'
                  }`}
                  data-testid={`badge-${badge.id}`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    isUnlocked ? (tierBg[tier] || 'bg-muted') : 'bg-muted'
                  }`}>
                    {isUnlocked ? (
                      <Trophy className={`w-6 h-6 ${tierColors[tier] || 'text-muted-foreground'}`} />
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="text-sm font-semibold text-foreground leading-tight mb-1">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{badge.description}</p>

                  {isUnlocked && badgeProgress.unlockedAt ? (
                    <p className="text-[10px] text-[var(--gh-green)]">
                      {new Date(badgeProgress.unlockedAt).toLocaleDateString()}
                    </p>
                  ) : !isUnlocked && currentProgress !== undefined && target !== undefined ? (
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{currentProgress}/{target}</span>
                        <span>{Math.round((currentProgress / target) * 100)}%</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((currentProgress / target) * 100, 100)}%`,
                            backgroundColor: 'var(--gh-blue)',
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* Tier label */}
                  <span className={`mt-2 inline-block text-[10px] font-medium uppercase tracking-wide ${
                    isUnlocked ? (tierColors[tier] || 'text-muted-foreground') : 'text-muted-foreground'
                  }`}>
                    {badge.tier}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Next up section */}
          {nextUp.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-foreground mb-3">Almost there</h2>
              <div className="rounded-md border border-border bg-card divide-y divide-border">
                {nextUp.slice(0, 4).map((badgeProgress) => {
                  const badge = badgeProgress.achievement;
                  const current = badgeProgress.current;
                  const target = badgeProgress.target;
                  const pct = target > 0 ? Math.round((current / target) * 100) : 0;

                  return (
                    <div key={badge.id} className="flex items-center gap-4 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{badge.name}</span>
                          <span className="text-xs text-muted-foreground">{current}/{target}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: 'var(--gh-blue)' }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
