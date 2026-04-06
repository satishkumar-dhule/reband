import { useState, useMemo, memo } from 'react';
import { useLocation } from 'wouter';
import {
  AppLayout, SEOHead, SkipLink, Button, Badge,
  PageHeader, GenericPageSkeleton, EmptyState,
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from '@/lib/ui';
import { useAchievements } from '../hooks/use-achievements';
import { AchievementProgress } from '../lib/achievements';
import { Trophy, Lock, Award } from 'lucide-react';
import { ProgressBar } from '@/lib/ui';

// ─── Tier config ──────────────────────────────────────────────────────────────
// All colours are driven by CSS variables in github-tokens.css.
// Adding a new tier only requires a new --tier-<name>-* token definition there.

type TierStyles = {
  badge: React.CSSProperties;
  icon: React.CSSProperties;
  bg: React.CSSProperties;
};

const KNOWN_TIERS = new Set(['bronze', 'silver', 'gold', 'platinum', 'diamond']);

function getTierStyles(tier: string): TierStyles {
  if (!KNOWN_TIERS.has(tier)) {
    return {
      badge: {},
      icon:  { color: 'var(--muted-foreground)' },
      bg:    { backgroundColor: 'var(--muted)' },
    };
  }
  return {
    badge: {
      color:           `var(--tier-${tier}-fg)`,
      backgroundColor: `var(--tier-${tier}-bg)`,
      borderColor:     `var(--tier-${tier}-border)`,
    },
    icon: {
      color: `var(--tier-${tier}-fg)`,
    },
    bg: {
      backgroundColor: `var(--tier-${tier}-bg)`,
    },
  };
}

// ─── Badge Card ───────────────────────────────────────────────────────────────

const BadgeCard = memo(function BadgeCard({ badgeProgress }: { badgeProgress: AchievementProgress }) {
  const badge = badgeProgress.achievement;
  const isUnlocked = badgeProgress.isUnlocked;
  const tier = badge.tier as string;
  const tierStyle = getTierStyles(tier);
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
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
        style={isUnlocked ? tierStyle.bg : undefined}
      >
        {isUnlocked
          ? <Trophy className="w-7 h-7" style={tierStyle.icon} />
          : <Lock className="w-7 h-7 text-muted-foreground" />
        }
      </div>

      <h3 className="text-sm font-semibold leading-snug mb-1 line-clamp-1">{badge.name}</h3>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem] cursor-default">
              {badge.description}
            </p>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[220px] text-xs text-center">
            {badge.description}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="mt-auto pt-2 border-t border-border w-full flex flex-col gap-1.5">
        <Badge
          className="text-[10px] uppercase tracking-wider w-fit mx-auto border"
          style={tierStyle.badge}
        >
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
