/**
 * SRS Review Buttons Component
 * Shows confidence rating buttons after revealing an answer
 */

import { motion } from 'framer-motion';
import { RotateCcw, Brain, Check, Zap } from 'lucide-react';
import type { ReviewCard, ConfidenceRating } from '../lib/spaced-repetition';
import { getNextReviewPreview, getMasteryLabel, getMasteryColor } from '../lib/spaced-repetition';
import { Button } from './unified/Button';

interface SRSReviewButtonsProps {
  card: ReviewCard;
  onRate: (rating: ConfidenceRating) => void;
  compact?: boolean;
}

export function SRSReviewButtons({ card, onRate, compact = false }: SRSReviewButtonsProps) {
  const previews = getNextReviewPreview(card);
  
  const buttons: { rating: ConfidenceRating; label: string; preview: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { 
      rating: 'again', 
      label: 'Again', 
      preview: previews.again,
      icon: <RotateCcw className="w-4 h-4" />,
      color: 'text-[var(--gh-danger-fg)]',
      bg: 'bg-[var(--gh-danger-subtle)] hover:bg-[var(--gh-danger-fg)]/20 border-[var(--gh-danger-fg)]/30'
    },
    { 
      rating: 'hard', 
      label: 'Hard', 
      preview: previews.hard,
      icon: <Brain className="w-4 h-4" />,
      color: 'text-[var(--gh-attention-fg)]',
      bg: 'bg-[var(--gh-attention-subtle)] hover:bg-[var(--gh-attention-fg)]/20 border-[var(--gh-attention-fg)]/30'
    },
    { 
      rating: 'good', 
      label: 'Good', 
      preview: previews.good,
      icon: <Check className="w-4 h-4" />,
      color: 'text-[var(--gh-success-fg)]',
      bg: 'bg-[var(--gh-success-subtle)] hover:bg-[var(--gh-success-fg)]/20 border-[var(--gh-success-fg)]/30'
    },
    { 
      rating: 'easy', 
      label: 'Easy', 
      preview: previews.easy,
      icon: <Zap className="w-4 h-4" />,
      color: 'text-[var(--gh-accent-fg)]',
      bg: 'bg-[var(--gh-accent-subtle)] hover:bg-[var(--gh-accent-fg)]/20 border-[var(--gh-accent-fg)]/30'
    }
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Rate:</span>
        {buttons.map((btn) => (
          <Button
            key={btn.rating}
            onClick={() => onRate(btn.rating)}
            variant="secondary"
            size="sm"
            className={`px-2 py-1 ${btn.bg} ${btn.color}`}
            title={`${btn.label} - Next review in ${btn.preview}`}
          >
            {btn.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Mastery indicator */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="text-muted-foreground">Mastery:</span>
        <span className={`font-medium ${getMasteryColor(card.masteryLevel)}`}>
          {getMasteryLabel(card.masteryLevel)}
        </span>
        {card.totalReviews > 0 && (
          <span className="text-xs text-muted-foreground">
            ({card.totalReviews} reviews)
          </span>
        )}
      </div>

      {/* Rating buttons */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {buttons.map((btn, idx) => (
          <motion.div
            key={btn.rating}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Button
              onClick={() => onRate(btn.rating)}
              variant="secondary"
              className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border transition-all ${btn.bg}`}
            >
              <div className={`${btn.color}`}>{btn.icon}</div>
              <span className={`text-xs sm:text-sm font-medium ${btn.color}`}>{btn.label}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{btn.preview}</span>
            </Button>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Rate your confidence to schedule the next review
      </p>
    </motion.div>
  );
}

export default SRSReviewButtons;
