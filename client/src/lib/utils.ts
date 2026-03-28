import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a tag for display - converts kebab-case to lowercase with spaces
 * e.g., "state-management" -> "state management"
 */
export function formatTag(tag: string): string {
  return tag.toLowerCase().replace(/-/g, ' ')
}

// ============================================================================
// THEME UTILITIES - For safe access to CSS custom properties
// ============================================================================

/**
 * Get computed CSS variable value from root element
 * Use this instead of hardcoded inline styles
 * 
 * @example
 * // Instead of: style={{ backgroundColor: 'hsl(0 0% 0%)' }}
 * // Use: style={{ backgroundColor: getCSSVar('color-base-black') }}
 */
export function getCSSVar(property: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(property)
    .trim();
}

/**
 * Get theme-aware CSS variable
 * Returns value from current theme's CSS variables
 */
export function getThemeVar(property: string, fallback: string = ''): string {
  const value = getCSSVar(property);
  return value || fallback;
}

/**
 * Subscribe to theme changes
 * Useful for third-party libraries that need to update on theme change
 */
export function onThemeChange(callback: (theme: string) => void): () => void {
  const handler = (e: CustomEvent<{ theme: string }>) => {
    callback(e.detail.theme);
  };
  
  window.addEventListener('themechange', handler as EventListener);
  return () => {
    window.removeEventListener('themechange', handler as EventListener);
  };
}

// ============================================================================
// COMMON THEME COLOR MAPPINGS
// ============================================================================

/**
 * Map semantic color names to CSS variables
 * Use these instead of hardcoded HSL values in inline styles
 */
export const themeColors = {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',
  secondary: 'var(--secondary)',
  secondaryForeground: 'var(--secondary-foreground)',
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',
  accent: 'var(--accent)',
  accentForeground: 'var(--accent-foreground)',
  destructive: 'var(--destructive)',
  destructiveForeground: 'var(--destructive-foreground)',
  border: 'var(--border)',
  card: 'var(--card)',
  cardForeground: 'var(--card-foreground)',
  ring: 'var(--ring)',
} as const;

/**
 * Pre-built style objects for common patterns
 * Use with spread operator: {...cardStyles}
 */
export const themeStyles = {
  card: {
    backgroundColor: themeColors.card,
    color: themeColors.cardForeground,
    borderColor: themeColors.border,
  },
  button: {
    backgroundColor: themeColors.primary,
    color: themeColors.primaryForeground,
  },
  buttonSecondary: {
    backgroundColor: themeColors.secondary,
    color: themeColors.secondaryForeground,
  },
  muted: {
    backgroundColor: themeColors.muted,
    color: themeColors.mutedForeground,
  },
  text: {
    color: themeColors.foreground,
  },
  textMuted: {
    color: themeColors.mutedForeground,
  },
  border: {
    borderColor: themeColors.border,
  },
} as const;
