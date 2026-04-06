/**
 * Shared difficulty styling utility
 *
 * Single source of truth for difficulty colour mappings across the app.
 * Previously duplicated independently in LearningPaths, Certifications,
 * PathDetail, TestSession, and QuestionViewer.
 *
 * Usage:
 *   import { getDifficultyClasses, getDifficultyLabel } from '@/lib/difficulty';
 *   <Badge className={getDifficultyClasses(item.difficulty)}>
 *     {getDifficultyLabel(item.difficulty)}
 *   </Badge>
 */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | string;

interface DifficultyConfig {
  label: string;
  badge: string;
  text: string;
  bg: string;
  icon: string;
  ghLabel: string;
}

const DIFFICULTY_MAP: Record<string, DifficultyConfig> = {
  beginner: {
    label: 'Beginner',
    badge: 'text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40',
    text: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-500/20',
    icon: 'text-green-500',
    ghLabel: 'gh-label-green',
  },
  'beginner friendly': {
    label: 'Beginner Friendly',
    badge: 'text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40',
    text: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-500/20',
    icon: 'text-green-500',
    ghLabel: 'gh-label-green',
  },
  intermediate: {
    label: 'Intermediate',
    badge: 'text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/40',
    text: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-500/20',
    icon: 'text-yellow-500',
    ghLabel: 'gh-label-yellow',
  },
  advanced: {
    label: 'Advanced',
    badge: 'text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-500/20',
    icon: 'text-orange-500',
    ghLabel: 'gh-label-orange',
  },
  expert: {
    label: 'Expert',
    badge: 'text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-500/20',
    icon: 'text-red-500',
    ghLabel: 'gh-label-red',
  },
};

const DEFAULT_CONFIG: DifficultyConfig = {
  label: 'Unknown',
  badge: 'text-muted-foreground border-border bg-muted/40',
  text: 'text-muted-foreground',
  bg: 'bg-muted/20',
  icon: 'text-muted-foreground',
  ghLabel: 'gh-label-gray',
};

function getConfig(difficulty: string): DifficultyConfig {
  return DIFFICULTY_MAP[difficulty?.toLowerCase()] ?? DEFAULT_CONFIG;
}

export function getDifficultyClasses(difficulty: string): string {
  return getConfig(difficulty).badge;
}

export function getDifficultyText(difficulty: string): string {
  return getConfig(difficulty).text;
}

export function getDifficultyBg(difficulty: string): string {
  return getConfig(difficulty).bg;
}

export function getDifficultyGhLabel(difficulty: string): string {
  return getConfig(difficulty).ghLabel;
}

export function getDifficultyLabel(difficulty: string): string {
  return getConfig(difficulty).label;
}
