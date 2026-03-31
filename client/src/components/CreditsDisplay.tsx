/**
 * Credits Display Component
 * Shows current credit balance in header/nav
 */

import { Coins } from 'lucide-react';
import { useCredits } from '../context/CreditsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, MotionButton } from './unified/Button';

interface CreditsDisplayProps {
  compact?: boolean;
  onClick?: () => void;
}

export function CreditsDisplay({ compact = false, onClick }: CreditsDisplayProps) {
  const { balance, formatCredits } = useCredits();

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="flex items-center gap-1 px-2 py-1 border rounded-full"
        style={{ backgroundColor: 'color-mix(in srgb, var(--gh-accent-emphasis) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--gh-accent-emphasis) 20%, transparent)' }}
      >
        <Coins className="w-3.5 h-3.5" style={{ color: 'var(--gh-accent-emphasis)' }} />
        <span className="text-xs font-bold" style={{ color: 'var(--gh-accent-emphasis)' }}>{formatCredits(balance)}</span>
      </Button>
    );
  }

  return (
    <MotionButton
      variant="ghost"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-3 py-1.5 border rounded-lg"
      style={{ backgroundColor: 'color-mix(in srgb, var(--gh-accent-emphasis) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--gh-accent-emphasis) 20%, transparent)' }}
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--gh-accent-emphasis) 20%, transparent)' }}>
        <Coins className="w-3.5 h-3.5" style={{ color: 'var(--gh-accent-emphasis)' }} />
      </div>
      <div className="text-left">
        <div className="text-xs" style={{ color: 'var(--gh-fg-muted)' }}>Credits</div>
        <div className="text-sm font-bold" style={{ color: 'var(--gh-accent-emphasis)' }}>{formatCredits(balance)}</div>
      </div>
    </MotionButton>
  );
}

// Animated credit change splash/bubble
export function CreditSplash({ amount, show, onComplete }: { amount: number; show: boolean; onComplete?: () => void }) {
  const isPositive = amount > 0;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 15
          }}
          className="fixed bottom-24 right-4 z-[100] pointer-events-none"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 0.3, times: [0, 0.5, 1] }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg ${
              isPositive 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
            }`}
          >
            <Coins className="w-5 h-5" />
            <span className="text-lg font-bold">
              {isPositive ? '+' : ''}{amount}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
