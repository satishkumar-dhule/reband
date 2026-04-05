import { useState, useMemo, memo } from 'react';
import { useLocation } from 'wouter';
import {
  AppLayout, SEOHead, SkipLink, Button, Badge,
  PageHeader, GenericPageSkeleton, EmptyState,
} from '@/lib/ui';
import { useAchievements } from '../hooks/use-achievements';
import { AchievementProgress } from '../lib/achievements';
import { Trophy, Lock, Award } from 'lucide-react';
import { ProgressBar } from '@/lib/ui';

// ─── Tier config ──────────────────────────────────────────────────────────────

const tierBadgeClass: Record<string, string> = {
  bronze:   'text-amber-700  dark:text-amber-400  border-amber-200  dark:border-amber-800  bg-amber-50  dark:bg-amber-950/40',
  silver:   'text-slate-600  dark:text-slate-400  border-slate-200  dark:border-slate-700  bg-slate-50  dark:bg-slate-900/40',
  gold:     'text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/40',
  platinum: 'text-cyan-700   dark:text-cyan-400   border-cyan-200   dark:border-cyan-800   bg-cyan-50   dark:bg-cyan-950/40',
  diamond:  'text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40',
};

const tierIconClass: Record<string, string> = {
  bronze:   'text-amber-500',
  silver:   'text-slate-400',
  gold:     'text-yellow-500',
  platinum: 'text-cyan-500',
  diamond:  'text-violet-500',
};

const tierBgClass: Record<string, string> = {
  bronze:   'bg-amber-50  dark:bg-amber-950/30',
  silver:   'bg-slate-50  dark:bg-slate-900/30',
  gold:     'bg-yellow-50 dark:bg-yellow-950/30',
  platinum: 'bg-cyan-50   dark:bg-cyan-950/30',
  diamond:  'bg-violet-50 dark:bg-violet-950/30',
};

// ─── Badge Card ───────────────────────────────────────────────────────────────

const BadgeCard = memo(function BadgeCard({ badgeProgress }: { badgeProgress: AchievementProgress }) {
  const badge = badgeProgress.achievement;
  const isUnlocked = badgeProgress.isUnlocked;
  const tier = badge.tier as string;
  const progressPct = badgeProgress.progress !== undefined && badgeProgress.target
    ? Math.min(100, Math.round((badgeProgress.progress / badgeProgress.target) * 100))
    : 0;

  return (
    <div
      className={`bg-card border border-border rounded-md p-4 flex flex-col items-center text-center transition-all hover-elevate ${
        !isUnlocked ? 'opacity-60 grayscale-[0.4]' : ''
      }`}
      data-testid={`badge-${badge.id}`}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
        isUnlocked ? (tierBgClass[tier] ?? 'bg-muted') : 'bg-muted'
      }`}>
        {isUnlocked
          ? <Trophy className={`w-7 h-7 ${tierIconClass[tier] ?? 'text-muted-foreground'}`} />
          : <Lock className="w-7 h-7 text-muted-foreground" />
        }
      </div>

      <h3 className="text-sm font-semibold leading-snug mb-1 line-clamp-1">{badge.name}</h3>
      <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">{badge.description}</p>

      <div className="mt-auto pt-2 border-t border-border w-full flex flex-col gap-1.5">
        <Badge className={`text-[10px] uppercase tracking-wider w-fit mx-auto ${tierBadgeClass[tier] ?? ''}`}>
          {badge.tier}
        </Badge>

        {isUnlocked && badgeProgress.unlockedAt && (
          <span className="text-[9px] text-primary font-medium">
            Unlocked {new Date(badgeProgress.unlockedAt).toLocaleDateString()}
          </span>
        )}

        {!isUnlocked && badgeProgress.progress !== undefined && badgeProgress.target !== undefined && (
          <div className="w-full">
            <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
              <span>{progressPct}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Badges() {
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
        <GenericPageSkeleton />
      </AppLayout>
    );
  }

  return (
    <>
      <SEOHead
        title="Achievements | DevPrep"
        description="View your earned badges and achievements"
      />
      <SkipLink />

      <AppLayout>
        {/* ── Page Header — same shell as AllChannels / Certifications ── */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <PageHeader
              title="Achievements"
              subtitle={`${stats?.unlocked ?? 0} of ${stats?.total ?? 0} badges earned`}
              className="mb-5"
            />

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={!selectedCategory ? 'primary' : 'ghost'}
                onClick={() => setSelectedCategory(null)}
                data-testid="filter-all"
              >
                All Badges
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? 'primary' : 'ghost'}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className="capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Overall progress summary */}
          <div className="bg-card border border-border rounded-md p-5 mb-8" data-testid="card-overall-progress">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold">{stats?.percentage ?? 0}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${stats?.percentage ?? 0}%` }}
              />
            </div>
            <div className="flex gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                {stats?.unlocked ?? 0} Earned
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 border border-border inline-block" />
                {stats?.locked ?? 0} Locked
              </span>
            </div>
          </div>

          {/* Badges Grid */}
          {allBadges.length === 0 ? (
            <EmptyState
              icon={<Trophy className="w-10 h-10" />}
              title="No badges found"
              description="Start learning to unlock your first achievement!"
              action={
                <Button onClick={() => setLocation('/channels')} variant="primary">
                  Browse Channels
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredBadges.map(bp => (
                <BadgeCard key={bp.achievement.id} badgeProgress={bp} />
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
