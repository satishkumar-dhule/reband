import { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon?: string;
  unlockedAt?: Date;
  metadata?: Record<string, unknown>;
}

interface AchievementContextType {
  achievements: Achievement[];
  pendingAchievements: Achievement[];
  trackEvent: (event: string, metadata?: Record<string, unknown>) => void;
  unlockAchievement: (achievement: Achievement) => void;
  consumePendingAchievement: () => Achievement | null;
}

const AchievementContext = createContext<AchievementContextType | null>(null);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);

  const achievementsRef = useRef(achievements);
  achievementsRef.current = achievements;

  useEffect(() => {
    const saved = localStorage.getItem('devprep_achievements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAchievements(parsed.map((a: Achievement) => ({
          ...a,
          unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
        })));
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  useEffect(() => {
    if (achievements.length > 0) {
      localStorage.setItem('devprep_achievements', JSON.stringify(achievements));
    }
  }, [achievements]);

  const trackEvent = useCallback((event: string, metadata?: Record<string, unknown>) => {
    // Handle different achievement events
    const eventHandlers: Record<string, () => void> = {
      'question_answered': () => {
        const count = achievementsRef.current.filter(a => a.type === 'question_answered').length;
        if (count === 0) {
          unlockAchievement({
            id: 'first_question',
            type: 'question_answered',
            title: 'First Steps',
            description: 'Answered your first question'
          });
        }
      },
      'test_completed': () => {
        const count = achievementsRef.current.filter(a => a.type === 'test_completed').length;
        if (count === 0) {
          unlockAchievement({
            id: 'first_test',
            type: 'test_completed',
            title: 'Test Taker',
            description: 'Completed your first practice test'
          });
        }
      },
      'voice_session': () => {
        const count = achievementsRef.current.filter(a => a.type === 'voice_session').length;
        if (count === 0) {
          unlockAchievement({
            id: 'first_voice',
            type: 'voice_session',
            title: 'Voice Ready',
            description: 'Completed your first voice practice session'
          });
        }
      },
      'streak_3': () => {
        unlockAchievement({
          id: 'streak_3',
          type: 'streak_3',
          title: 'On Fire',
          description: '3-day learning streak'
        });
      },
      'streak_7': () => {
        unlockAchievement({
          id: 'streak_7',
          type: 'streak_7',
          title: 'Week Warrior',
          description: '7-day learning streak'
        });
      },
      'questions_10': () => {
        unlockAchievement({
          id: 'questions_10',
          type: 'questions_10',
          title: 'Getting Started',
          description: 'Answered 10 questions'
        });
      },
      'questions_50': () => {
        unlockAchievement({
          id: 'questions_50',
          type: 'questions_50',
          title: 'Dedicated Learner',
          description: 'Answered 50 questions'
        });
      },
      'questions_100': () => {
        unlockAchievement({
          id: 'questions_100',
          type: 'questions_100',
          title: 'Century Club',
          description: 'Answered 100 questions'
        });
      },
    };

    if (eventHandlers[event]) {
      eventHandlers[event]();
    }
  }, []);

  const unlockAchievement = useCallback((achievement: Achievement) => {
    setAchievements(prev => {
      if (prev.some(a => a.id === achievement.id)) {
        return prev;
      }
      return [...prev, { ...achievement, unlockedAt: new Date() }];
    });
    setPendingAchievements(prev => [...prev, achievement]);
  }, []);

  const consumePendingAchievement = useCallback(() => {
    if (pendingAchievements.length === 0) return null;
    const [next, ...rest] = pendingAchievements;
    setPendingAchievements(rest);
    return next;
  }, [pendingAchievements]);

  return (
    <AchievementContext.Provider value={{
      achievements,
      pendingAchievements,
      trackEvent,
      unlockAchievement,
      consumePendingAchievement
    }}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievementContext(): AchievementContextType {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievementContext must be used within AchievementProvider');
  }
  return context;
}

export { AchievementContext };
