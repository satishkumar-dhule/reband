import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff, Code } from 'lucide-react';
import { Button } from './unified/Button';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  codeExample?: string;
  codeLanguage?: string;
}

interface FlashcardsTabProps {
  channelId: string;
  flashcards: Flashcard[];
}

const STORAGE_KEY = (channelId: string) => `flashcards-progress-${channelId}`;

function loadSeenCards(channelId: string): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY(channelId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSeenCards(channelId: string, seen: string[]): void {
  localStorage.setItem(STORAGE_KEY(channelId), JSON.stringify(seen));
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div className="mt-4 rounded-lg border border-[var(--gh-border-default)] bg-[var(--gh-canvas-subtle)] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--gh-canvas-inset)] border-b border-[var(--gh-border-default)]">
        <Code className="w-3.5 h-3.5 text-[var(--gh-fg-muted)]" />
        <span className="text-xs text-[var(--gh-fg-muted)]">{language || 'code'}</span>
      </div>
      <pre className="p-3 text-sm overflow-x-auto">
        <code className="text-[var(--gh-fg-default)] font-mono">{code}</code>
      </pre>
    </div>
  );
}

export function FlashcardsTab({ channelId, flashcards }: FlashcardsTabProps) {
  const [seenCards, setSeenCards] = useState<string[]>(() => loadSeenCards(channelId));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    saveSeenCards(channelId, seenCards);
  }, [channelId, seenCards]);

  const markAsSeen = useCallback((id: string) => {
    setSeenCards(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      markAsSeen(flashcards[currentIndex].id);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => Math.min(prev + 1, flashcards.length - 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleRestart = () => {
    setSeenCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const progress = flashcards.length > 0 ? (seenCards.length / flashcards.length) * 100 : 0;
  const currentCard = flashcards[currentIndex];

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-[var(--gh-fg-muted)]">No flashcards available for this channel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--gh-fg-muted)]">
              {seenCards.length} / {flashcards.length} cards seen
            </span>
            <span className="text-sm text-[var(--gh-fg-muted)]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-[var(--gh-border-default)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--gh-accent-emphasis)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRestart} icon={<RotateCcw className="w-4 h-4" />}>
          Reset
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentIndex === 0}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-[var(--gh-fg-muted)] min-w-[60px] text-center">
          {currentIndex + 1} / {flashcards.length}
        </span>
        <Button variant="outline" size="sm" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="perspective-1000 mx-auto max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            className="relative min-h-[300px] cursor-pointer"
            onClick={handleFlip}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`absolute inset-0 transition-transform duration-500 preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
            >
              <div
                className="backface-hidden p-6 rounded-xl border border-[var(--gh-border-default)] bg-[var(--gh-canvas-default)]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex flex-col h-full">
                  <span className="text-xs uppercase tracking-wider text-[var(--gh-fg-muted)] mb-3">Question</span>
                  <p className="text-lg font-medium flex-1">{currentCard.front}</p>
                  {currentCard.hint && !showHint && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                      className="mt-4 flex items-center gap-2 text-sm text-[var(--gh-accent-fg)] hover:underline"
                    >
                      <Eye className="w-4 h-4" /> Show hint
                    </button>
                  )}
                </div>
              </div>

              <div
                className="backface-hidden p-6 rounded-xl border border-[var(--gh-border-default)] bg-[var(--gh-canvas-inset)] rotate-y-180"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="flex flex-col h-full">
                  <span className="text-xs uppercase tracking-wider text-[var(--gh-fg-muted)] mb-3">Answer</span>
                  <p className="text-lg flex-1">{currentCard.back}</p>
                  {currentCard.codeExample && (
                    <CodeBlock code={currentCard.codeExample} language={currentCard.codeLanguage} />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {showHint && currentCard.hint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-[var(--gh-accent-subtle)] border border-[var(--gh-accent-emphasis)]"
        >
          <div className="flex items-start gap-3">
            <EyeOff className="w-4 h-4 text-[var(--gh-accent-fg)] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--gh-accent-fg)] mb-1">Hint</p>
              <p className="text-sm text-[var(--gh-fg-muted)]">{currentCard.hint}</p>
            </div>
          </div>
        </motion.div>
      )}

      <p className="text-center text-xs text-[var(--gh-fg-muted)]">
        Click card to flip • Progress saved automatically
      </p>
    </div>
  );
}
