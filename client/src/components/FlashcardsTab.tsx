import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw, ChevronLeft, ChevronRight, Zap, Code,
  BookOpen, CheckCircle2, XCircle, Clock, Flame,
  Keyboard, Shuffle, Target, TrendingUp, Star,
  Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from './unified/Button';
import { cn } from '../lib/utils';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  codeExample?: string;
  codeLanguage?: string;
  mnemonic?: string;
  difficulty?: string;
  category?: string | null;
  tags?: string | string[] | null;
}

function parseCodeExample(codeExample?: string): { code: string; language: string } | null {
  if (!codeExample) return null;
  try {
    const parsed = JSON.parse(codeExample);
    if (parsed && typeof parsed.code === 'string') {
      return { code: parsed.code, language: parsed.language || 'code' };
    }
  } catch {}
  return { code: codeExample, language: 'code' };
}

function parseTags(tags?: string | string[] | null): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  return String(tags).split(',').map(t => t.trim()).filter(Boolean);
}

interface FlashcardsTabProps {
  channelId: string;
  flashcards: Flashcard[];
}

type ConfidenceRating = 'again' | 'hard' | 'good' | 'easy';

interface CardProgress {
  seen: boolean;
  rating?: ConfidenceRating;
  reviewedAt?: number;
}

const STORAGE_KEY = (channelId: string) => `flashcards-v2-progress-${channelId}`;

function loadProgress(channelId: string): Record<string, CardProgress> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY(channelId));
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveProgress(channelId: string, progress: Record<string, CardProgress>): void {
  localStorage.setItem(STORAGE_KEY(channelId), JSON.stringify(progress));
}

const ratingConfig: Record<ConfidenceRating, { label: string; shortcut: string; color: string; bg: string; textColor: string; emoji: string }> = {
  again:  { label: 'Again',  shortcut: '1', color: 'border-red-500/60',    bg: 'bg-red-500/10 hover:bg-red-500/20',       textColor: 'text-red-400',    emoji: '✗' },
  hard:   { label: 'Hard',   shortcut: '2', color: 'border-orange-400/60', bg: 'bg-orange-400/10 hover:bg-orange-400/20', textColor: 'text-orange-400', emoji: '~' },
  good:   { label: 'Good',   shortcut: '3', color: 'border-blue-400/60',   bg: 'bg-blue-400/10 hover:bg-blue-400/20',    textColor: 'text-blue-400',   emoji: '✓' },
  easy:   { label: 'Easy',   shortcut: '4', color: 'border-emerald-400/60',bg: 'bg-emerald-400/10 hover:bg-emerald-400/20',textColor: 'text-emerald-400',emoji: '★' },
};

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="mt-4 rounded-lg overflow-hidden border border-[var(--gh-border)] bg-[var(--gh-canvas-inset)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)]">
        <div className="flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-[var(--gh-fg-muted)]" />
          <span className="text-xs font-mono text-[var(--gh-fg-muted)]">{language || 'code'}</span>
        </div>
        <button
          onClick={copy}
          className="text-xs text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] transition-colors px-2 py-0.5 rounded border border-transparent hover:border-[var(--gh-border)]"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto scrollbar-hide">
        <code className="text-[var(--gh-fg)] font-mono leading-relaxed whitespace-pre-wrap break-words">{code}</code>
      </pre>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  if (!difficulty) return null;
  const map: Record<string, string> = {
    beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    advanced: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  const cls = map[difficulty.toLowerCase()] || 'bg-[var(--gh-canvas-subtle)] text-[var(--gh-fg-muted)] border-[var(--gh-border)]';
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border', cls)}>
      {difficulty}
    </span>
  );
}

function StatsBar({ progress, total }: { progress: Record<string, CardProgress>; total: number }) {
  const seen = Object.values(progress).filter(p => p.seen).length;
  const mastered = Object.values(progress).filter(p => p.rating === 'easy').length;
  const learning = Object.values(progress).filter(p => p.rating === 'good' || p.rating === 'hard').length;
  const needsWork = Object.values(progress).filter(p => p.rating === 'again').length;
  const pct = total > 0 ? Math.round((seen / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-[var(--gh-border)] bg-[var(--gh-canvas)] overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gh-fg-muted)]">Progress</span>
          <span className="text-sm font-bold text-[var(--gh-fg)]">{pct}%</span>
        </div>
        {/* Segmented progress bar */}
        <div className="h-2 w-full bg-[var(--gh-canvas-subtle)] rounded-full overflow-hidden flex gap-px">
          {mastered > 0 && (
            <motion.div
              className="h-full bg-emerald-500 rounded-l-full"
              initial={{ width: 0 }}
              animate={{ width: `${(mastered / total) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
          {learning > 0 && (
            <motion.div
              className="h-full bg-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${(learning / total) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            />
          )}
          {needsWork > 0 && (
            <motion.div
              className="h-full bg-orange-400"
              initial={{ width: 0 }}
              animate={{ width: `${(needsWork / total) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 border-t border-[var(--gh-border)]">
        {[
          { label: 'Total', value: total, icon: BookOpen, color: 'text-[var(--gh-fg-muted)]' },
          { label: 'Mastered', value: mastered, icon: Star, color: 'text-emerald-400' },
          { label: 'Learning', value: learning, icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Review', value: needsWork, icon: XCircle, color: 'text-orange-400' },
        ].map((stat, i) => (
          <div key={stat.label} className={cn('flex flex-col items-center py-3 gap-0.5', i > 0 && 'border-l border-[var(--gh-border)]')}>
            <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
            <span className="text-base font-bold text-[var(--gh-fg)]">{stat.value}</span>
            <span className="text-[9px] uppercase tracking-wider text-[var(--gh-fg-muted)]">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeyboardHint({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-[var(--gh-fg-muted)]"
        >
          {[
            { key: 'Space / Enter', action: 'Flip' },
            { key: '← →', action: 'Navigate' },
            { key: '1–4', action: 'Rate' },
          ].map(({ key, action }) => (
            <div key={key} className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] font-mono text-[9px] text-[var(--gh-fg-muted)]">
                {key}
              </kbd>
              <span>{action}</span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FlashcardsTab({ channelId, flashcards }: FlashcardsTabProps) {
  const [progress, setProgress] = useState<Record<string, CardProgress>>(() => loadProgress(channelId));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState<number[]>(() => flashcards.map((_, i) => i));
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [expandAnswer, setExpandAnswer] = useState(false);
  const [lastRating, setLastRating] = useState<ConfidenceRating | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveProgress(channelId, progress);
  }, [channelId, progress]);

  useEffect(() => {
    setCardOrder(flashcards.map((_, i) => i));
  }, [flashcards.length]);

  const actualIndex = cardOrder[currentIndex] ?? currentIndex;
  const currentCard = flashcards[actualIndex];

  const flipCard = useCallback(() => {
    if (!currentCard) return;
    setIsFlipped(f => {
      const nextFlipped = !f;
      if (nextFlipped) {
        setProgress(prev => ({
          ...prev,
          [currentCard.id]: { ...prev[currentCard.id], seen: true }
        }));
      }
      return nextFlipped;
    });
    setShowHint(false);
    setExpandAnswer(false);
  }, [currentCard]);

  const goNext = useCallback(() => {
    if (currentIndex >= flashcards.length - 1) return;
    setCurrentIndex(i => i + 1);
    setIsFlipped(false);
    setShowHint(false);
    setExpandAnswer(false);
    setLastRating(null);
  }, [currentIndex, flashcards.length]);

  const goPrev = useCallback(() => {
    if (currentIndex === 0) return;
    setCurrentIndex(i => i - 1);
    setIsFlipped(false);
    setShowHint(false);
    setExpandAnswer(false);
    setLastRating(null);
  }, [currentIndex]);

  const rate = useCallback((rating: ConfidenceRating) => {
    if (!currentCard) return;
    setProgress(prev => ({
      ...prev,
      [currentCard.id]: { seen: true, rating, reviewedAt: Date.now() }
    }));
    setStreak(s => rating === 'good' || rating === 'easy' ? s + 1 : 0);
    setLastRating(rating);
    setTimeout(() => goNext(), 600);
  }, [currentCard, goNext]);

  const toggleShuffle = useCallback(() => {
    if (shuffled) {
      setCardOrder(flashcards.map((_, i) => i));
    } else {
      const arr = flashcards.map((_, i) => i);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setCardOrder(arr);
    }
    setShuffled(s => !s);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [shuffled, flashcards]);

  const handleReset = useCallback(() => {
    setProgress({});
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setStreak(0);
    setLastRating(null);
    setCardOrder(flashcards.map((_, i) => i));
    setShuffled(false);
  }, [flashcards]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flipCard(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); return; }
      if (isFlipped && e.key === '1') rate('again');
      if (isFlipped && e.key === '2') rate('hard');
      if (isFlipped && e.key === '3') rate('good');
      if (isFlipped && e.key === '4') rate('easy');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flipCard, goNext, goPrev, rate, isFlipped]);

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-[var(--gh-fg-muted)]" />
        </div>
        <div>
          <p className="font-semibold text-[var(--gh-fg)]">No flashcards yet</p>
          <p className="text-sm text-[var(--gh-fg-muted)] mt-1">Flashcards for this topic are coming soon.</p>
        </div>
      </div>
    );
  }

  const cardProgress = currentCard ? progress[currentCard.id] : undefined;
  const hasSeen = !!cardProgress?.seen;
  const prevRating = cardProgress?.rating;

  return (
    <div ref={containerRef} className="space-y-5" data-testid="flashcards-tab">
      {/* Stats Bar */}
      <StatsBar progress={progress} total={flashcards.length} />

      {/* Controls Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleShuffle}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all',
              shuffled
                ? 'bg-[var(--gh-accent-subtle)] border-[var(--gh-accent-emphasis)] text-[var(--gh-accent-fg)]'
                : 'border-[var(--gh-border)] text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-subtle)]'
            )}
            data-testid="button-shuffle"
          >
            <Shuffle className="w-3.5 h-3.5" />
            {shuffled ? 'Shuffled' : 'Shuffle'}
          </button>
          {streak > 1 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/30"
            >
              <Flame className="w-3.5 h-3.5" />
              {streak} streak
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyboard(s => !s)}
            className="p-1.5 rounded-md border border-[var(--gh-border)] text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-subtle)] transition-all"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>
      </div>

      <KeyboardHint show={showKeyboard} />

      {/* Card Navigation Row */}
      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex-shrink-0 w-9 h-9 rounded-lg border border-[var(--gh-border)] flex items-center justify-center text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-subtle)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          data-testid="button-prev-card"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Progress pills */}
        <div className="flex-1 flex items-center gap-1 overflow-hidden">
          {flashcards.slice(0, Math.min(flashcards.length, 40)).map((card, i) => {
            const cardIdx = cardOrder.indexOf(flashcards.indexOf(card));
            const p = progress[card.id];
            const isCurrent = cardOrder[currentIndex] === flashcards.indexOf(card);
            return (
              <button
                key={card.id}
                onClick={() => { setCurrentIndex(cardIdx === -1 ? i : cardIdx); setIsFlipped(false); setLastRating(null); }}
                className={cn(
                  'h-2 flex-1 rounded-full transition-all min-w-[4px]',
                  isCurrent ? 'h-3 ring-1 ring-offset-1 ring-[var(--gh-accent-fg)] ring-offset-[var(--gh-canvas)]' : '',
                  !p?.seen ? 'bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)]' :
                  p.rating === 'easy' ? 'bg-emerald-500' :
                  p.rating === 'good' ? 'bg-blue-400' :
                  p.rating === 'hard' ? 'bg-amber-400' :
                  p.rating === 'again' ? 'bg-red-400' :
                  'bg-[var(--gh-fg-muted)]'
                )}
                title={`Card ${i + 1}: ${card.front.slice(0, 40)}...`}
              />
            );
          })}
          {flashcards.length > 40 && (
            <span className="text-[10px] text-[var(--gh-fg-muted)] ml-1 whitespace-nowrap">+{flashcards.length - 40}</span>
          )}
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex === flashcards.length - 1}
          className="flex-shrink-0 w-9 h-9 rounded-lg border border-[var(--gh-border)] flex items-center justify-center text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-subtle)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          data-testid="button-next-card"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Card counter */}
      <div className="flex items-center justify-between text-xs text-[var(--gh-fg-muted)]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--gh-fg)]">{currentIndex + 1}</span>
          <span>/</span>
          <span>{flashcards.length}</span>
          {prevRating && (
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', ratingConfig[prevRating].color, ratingConfig[prevRating].bg, ratingConfig[prevRating].textColor)}>
              {ratingConfig[prevRating].label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentCard?.difficulty && <DifficultyBadge difficulty={currentCard.difficulty} />}
          {currentCard?.category && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--gh-canvas-subtle)] text-[var(--gh-fg-muted)] border border-[var(--gh-border)]">
              {currentCard.category}
            </span>
          )}
        </div>
      </div>

      {/* MAIN FLASHCARD */}
      <div className="perspective-[1200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCard?.id}-container`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {/* 3D Flip wrapper */}
            <div
              className="relative w-full cursor-pointer"
              style={{ minHeight: 260, perspective: '1200px' }}
              onClick={!isFlipped ? flipCard : undefined}
              role="button"
              tabIndex={0}
              aria-label={isFlipped ? 'Card is showing answer' : 'Click to reveal answer'}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(); } }}
            >
              <motion.div
                className="w-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformStyle: 'preserve-3d', position: 'relative' }}
              >
                {/* FRONT FACE */}
                <div
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  className={cn(
                    'w-full rounded-2xl border p-8 flex flex-col',
                    'bg-[var(--gh-canvas)] border-[var(--gh-border)]',
                    'shadow-[0_4px_24px_rgba(0,0,0,0.08)]',
                    isFlipped ? 'absolute inset-0 pointer-events-none' : 'relative'
                  )}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gh-fg-muted)]">Question</span>
                    <div className="flex items-center gap-1.5">
                      {hasSeen && !isFlipped && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--gh-fg-muted)]" />
                      )}
                      <Target className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center py-4">
                    <p className="text-xl md:text-2xl font-semibold text-[var(--gh-fg)] text-center leading-snug">
                      {currentCard?.front}
                    </p>
                  </div>

                  {currentCard?.hint && !showHint && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                        className="flex items-center gap-2 text-xs text-[var(--gh-accent-fg)] border border-[var(--gh-accent-fg)]/30 px-3 py-1.5 rounded-full hover:bg-[var(--gh-accent-subtle)] transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Show hint
                      </button>
                    </div>
                  )}

                  {showHint && currentCard?.hint && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 px-4 py-3 rounded-lg bg-[var(--gh-accent-subtle)] border border-[var(--gh-accent-emphasis)]/20"
                      onClick={e => e.stopPropagation()}
                    >
                      <p className="text-xs font-semibold text-[var(--gh-accent-fg)] mb-1 flex items-center gap-1.5">
                        <Zap className="w-3 h-3" />
                        Hint
                      </p>
                      <p className="text-sm text-[var(--gh-fg-muted)]">{currentCard.hint}</p>
                    </motion.div>
                  )}

                  {!isFlipped && (
                    <div className="mt-6 flex justify-center">
                      <motion.div
                        animate={{ y: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="text-xs text-[var(--gh-fg-muted)] flex items-center gap-1.5 border border-dashed border-[var(--gh-border)] px-4 py-2 rounded-full"
                      >
                        <span className="text-[var(--gh-accent-fg)]">Space</span>
                        <span>or click to reveal answer</span>
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* BACK FACE */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    position: isFlipped ? 'relative' : 'absolute',
                    top: 0, left: 0, right: 0,
                  }}
                  className={cn(
                    'w-full rounded-2xl border p-8 flex flex-col',
                    'bg-[var(--gh-canvas-inset)] border-[var(--gh-border)]',
                    'shadow-[0_4px_24px_rgba(0,0,0,0.12)]',
                  )}
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Answer</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); flipCard(); }}
                      className="flex items-center gap-1 text-xs text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] px-2 py-1 rounded-md hover:bg-[var(--gh-canvas-subtle)] border border-transparent hover:border-[var(--gh-border)] transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Flip back
                    </button>
                  </div>

                  <div className={cn('space-y-3', !expandAnswer && currentCard?.back && currentCard.back.length > 300 ? 'max-h-48 overflow-hidden relative' : '')}>
                    <p className="text-base md:text-lg text-[var(--gh-fg)] leading-relaxed">
                      {currentCard?.back}
                    </p>
                    {!expandAnswer && currentCard?.back && currentCard.back.length > 300 && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--gh-canvas-inset)] to-transparent pointer-events-none" />
                    )}
                  </div>

                  {currentCard?.back && currentCard.back.length > 300 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandAnswer(s => !s); }}
                      className="mt-2 flex items-center gap-1 text-xs text-[var(--gh-accent-fg)] hover:underline self-start"
                    >
                      {expandAnswer ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show more</>}
                    </button>
                  )}

                  {(() => {
                    const parsed = parseCodeExample(currentCard?.codeExample);
                    return parsed ? <CodeBlock code={parsed.code} language={parsed.language} /> : null;
                  })()}

                  {currentCard?.mnemonic && (
                    <div className="mt-4 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/25">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                        <Star className="w-3 h-3" /> Mnemonic
                      </p>
                      <p className="text-sm text-amber-200/80 italic">{currentCard.mnemonic}</p>
                    </div>
                  )}

                  {(() => {
                    const tags = parseTags(currentCard?.tags);
                    return tags.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--gh-canvas-subtle)] text-[var(--gh-fg-muted)] border border-[var(--gh-border)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating Buttons — shown after card is revealed */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <p className="text-center text-xs font-medium text-[var(--gh-fg-muted)] uppercase tracking-wider">
              How well did you know this?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(ratingConfig) as ConfidenceRating[]).map((r) => {
                const cfg = ratingConfig[r];
                const isSelected = lastRating === r;
                return (
                  <motion.button
                    key={r}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => rate(r)}
                    data-testid={`button-rate-${r}`}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200',
                      cfg.bg, cfg.color,
                      isSelected ? 'scale-95 shadow-inner' : 'hover:scale-[1.02]'
                    )}
                  >
                    <span className={cn('text-lg font-bold', cfg.textColor)}>{cfg.emoji}</span>
                    <span className={cn('text-xs font-semibold', cfg.textColor)}>{cfg.label}</span>
                    <kbd className="text-[9px] px-1 rounded bg-[var(--gh-canvas-subtle)] text-[var(--gh-fg-muted)] border border-[var(--gh-border)] font-mono">{cfg.shortcut}</kbd>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion state */}
      {(() => {
        const seen = Object.values(progress).filter(p => p.seen).length;
        const rated = Object.values(progress).filter(p => p.rating).length;
        if (rated === flashcards.length && flashcards.length > 0) {
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-5 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="font-semibold text-[var(--gh-fg)]">All cards reviewed!</p>
              <p className="text-sm text-[var(--gh-fg-muted)] mt-1 mb-4">
                {Object.values(progress).filter(p => p.rating === 'easy').length} mastered,{' '}
                {Object.values(progress).filter(p => p.rating === 'again' || p.rating === 'hard').length} to review again.
              </p>
              <Button variant="secondary" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
                Study Again
              </Button>
            </motion.div>
          );
        }
        return null;
      })()}

      {/* Footer hint */}
      <p className="text-center text-[10px] text-[var(--gh-fg-subtle)] flex items-center justify-center gap-1.5">
        <Clock className="w-3 h-3" />
        Progress auto-saved
      </p>
    </div>
  );
}
