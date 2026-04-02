/**
 * GenZ Progress Bar - Neon progress indicator
 * Supports reduced motion for accessibility
 */

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useReducedMotion } from '../../hooks/use-reduced-motion';

interface GenZProgressProps {
  value: number;
  max: number;
  color?: 'green' | 'blue' | 'pink' | 'gold';
  showLabel?: boolean;
  className?: string;
}

export function GenZProgress({
  value,
  max,
  color = 'green',
  showLabel = false,
  className,
}: GenZProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    green: 'from-green-500 to-cyan-500 dark:from-green-400 dark:to-cyan-400',
    blue: 'from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-500',
    pink: 'from-pink-500 to-fuchsia-500 dark:from-pink-400 dark:to-fuchsia-400',
    gold: 'from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: prefersReducedMotion ? 0.01 : 0.5, 
            ease: 'easeOut' 
          }}
          className={`h-full bg-gradient-to-r ${colors[color]}`}
        />
      </div>
      {showLabel && (
        <div className="mt-2 text-sm text-muted-foreground text-right">
          {value} / {max}
        </div>
      )}
    </div>
  );
}
