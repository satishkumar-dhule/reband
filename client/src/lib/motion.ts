/**
 * Shared motion constants — single source of truth for all Framer Motion
 * transitions and animation variants throughout the app.
 *
 * Issue #114: Previously QuestionPanel used 0.3s, AnswerPanel 0.2s, and
 * MascotToaster used an ad-hoc spring. This file standardises every tier.
 */

/** Standard easing for all enter/exit animations */
export const EASE_OUT = [0.25, 0.1, 0.25, 1] as const;

/** Transition presets */
export const MOTION = {
  /** Fast: micro-interactions, badge pulses, icon swaps */
  fast: { duration: 0.15, ease: EASE_OUT },
  /** Default: page content fade-ins, card reveals */
  default: { duration: 0.2, ease: EASE_OUT },
  /** Slow: hero sections, large layout transitions */
  slow: { duration: 0.35, ease: EASE_OUT },
  /** Spring: toasts, notifications, drawer opens */
  spring: { type: 'spring' as const, damping: 20, stiffness: 300 },
  /** Stiff spring: interactive elements that snap into place */
  snappy: { type: 'spring' as const, damping: 25, stiffness: 400 },
} as const;

/** Reusable fade-up variant factory */
export function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { ...MOTION.default, delay },
  };
}

/** Reusable fade-in variant factory */
export function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { ...MOTION.default, delay },
  };
}

/** Scale pop for notification / toast entry */
export const TOAST_VARIANTS = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.96 },
  transition: MOTION.spring,
} as const;
