/**
 * Theme Toggle Button - Gen Z Edition
 * PROBLEM 6 FIXED: Clearly separated from AI Companion with distinct position and label
 * Supports reduced motion for accessibility
 */

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/use-reduced-motion';
import { cn } from '../lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === 'genz-dark';

  return (
    <motion.button
      whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 15 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center rounded-lg px-3 py-2 transition-all group",
        isDark
          ? "bg-emerald-500/20 hover:bg-emerald-500/30"
          : "bg-amber-500/20 hover:bg-amber-500/30"
      )}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, scale: isDark ? 1 : 0 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.3 }}
        className="absolute"
      >
        <Moon className="w-4 h-4 text-emerald-400" strokeWidth={2.5} aria-hidden="true" />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0 : 1 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.3 }}
        className="absolute"
      >
        <Sun className="w-4 h-4 text-amber-500" strokeWidth={2.5} aria-hidden="true" />
      </motion.div>
      
      <span className={cn("text-xs font-semibold ml-5", isDark ? "text-emerald-400" : "text-amber-500")}>
        {isDark ? "Light" : "Dark"}
      </span>
    </motion.button>
  );
}
