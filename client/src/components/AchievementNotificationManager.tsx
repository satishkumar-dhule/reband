/**
 * Achievement & Badge Notification Manager
 * Bridge between AchievementContext/BadgeContext and UnifiedNotificationManager
 * Feeds achievements and badges into the unified queue system
 */

import { useEffect } from 'react';
import { useAchievementContext } from '../context/AchievementContext';
import { useBadgeContext } from '../context/BadgeContext';
import { useUnifiedNotifications } from './UnifiedNotificationManager';

export function AchievementNotificationManager() {
  const { pendingAchievements, consumePendingAchievement } = useAchievementContext();
  const { pendingBadges, consumePendingBadge } = useBadgeContext();
  const { showToast } = useUnifiedNotifications();

  // Feed pending achievements into unified notification system
  useEffect(() => {
    if (pendingAchievements.length > 0) {
      const achievement = consumePendingAchievement();
      if (achievement) {
        showToast(achievement.title, achievement.description, 'success');
      }
    }
  }, [pendingAchievements, consumePendingAchievement, showToast]);

  // Feed pending badges into unified notification system
  useEffect(() => {
    if (pendingBadges.length > 0) {
      const badge = consumePendingBadge();
      if (badge) {
        showToast(`Badge: ${badge.name}`, badge.description || '', 'success');
      }
    }
  }, [pendingBadges, consumePendingBadge, showToast]);

  // No longer renders anything - unified system handles display
  return null;
}
