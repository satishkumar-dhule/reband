/**
 * GenZ Timer - Countdown timer with neon glow
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface GenZTimerProps {
  duration: number; // in seconds
  onComplete?: () => void;
  showProgress?: boolean;
}

export function GenZTimer({ duration, onComplete, showProgress = true }: GenZTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / duration) * 100;

  const isLowTime = timeLeft < 60;
  const isCritical = timeLeft < 30;

  return (
    <div className="flex items-center gap-4">
      <motion.div
        animate={{
          scale: isCritical ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: isCritical ? Infinity : 0,
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-[12px] border motion-reduce:animate-none ${
          isCritical
            ? 'bg-[var(--gh-danger-subtle)] border-[var(--gh-danger-fg)]'
            : isLowTime
            ? 'bg-[var(--gh-attention-subtle)] border-[var(--gh-attention-fg)]'
            : 'bg-muted/50 border-border'
        }`}
        aria-live="polite"
      >
        <Clock className={`w-5 h-5 ${isCritical ? 'text-[var(--gh-danger-fg)]' : isLowTime ? 'text-[var(--gh-attention-fg)]' : 'text-[var(--gh-accent-fg)]'}`} />
        <span className={`font-mono text-xl font-bold ${isCritical ? 'text-[var(--gh-danger-fg)]' : isLowTime ? 'text-[var(--gh-attention-fg)]' : 'text-foreground'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </motion.div>

      {showProgress && (
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${percentage}%` }}
            className={`h-full ${
              isCritical
                ? 'bg-[var(--gh-danger-fg)]'
                : isLowTime
                ? 'bg-[var(--gh-attention-fg)]'
                : 'bg-[var(--gh-accent-fg)]'
            }`}
          />
        </div>
      )}
    </div>
  );
}
