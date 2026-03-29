/**
 * Review Session - EXTREME UX OPTIMIZED
 * Mobile-first SRS review with checkpoint tests every 5 questions
 * NO TIMERS, NO REDUNDANCY, MINIMAL MOBILE-FIRST DESIGN
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft, Brain, Flame, Trophy, Zap, Star, Check, X, Target, Eye, EyeOff, Copy
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { UnifiedSearch } from '../components/UnifiedSearch';
import { 
  getDueCards, recordReview, getSRSStats,
  calculateXP, addXP,
  type ReviewCard, type ConfidenceRating 
} from '../lib/spaced-repetition';
import { getQuestionById } from '../lib/questions-loader';
import { useCredits } from '../context/CreditsContext';
import { useAchievementContext } from '../context/AchievementContext';
import type { Question } from '../types';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type SessionState = 'loading' | 'reviewing' | 'checkpoint' | 'completed';

// Markdown preprocessing helper
function preprocessMarkdown(text: string): string {
  if (!text) return '';
  let processed = text;
  
  // Fix code fences
  processed = processed.replace(/([^\n])(```)/g, '$1\n$2');
  processed = processed.replace(/(```\w*)\s*\n?\s*([^\n`])/g, '$1\n$2');
  
  // Fix bold markers
  processed = processed.replace(/^\*\*\s*$/gm, '');
  processed = processed.replace(/\*\*\s*\n\s*([^*]+)\*\*/g, '**$1**');
  
  // Fix bullet points
  processed = processed.replace(/^[•·]\s*/gm, '- ');
  
  return processed;
}

export default function ReviewSessionOptimized() {
  const [, setLocation] = useLocation();
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [dueCards, setDueCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentCard, setCurrentCard] = useState<ReviewCard | null>(null);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [sessionXP, setSessionXP] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [recentCards, setRecentCards] = useState<ReviewCard[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  
  const { onSRSReview } = useCredits();
  const { trackEvent } = useAchievementContext();

  // Haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 10, medium: 20, heavy: 30 };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Load due cards
  useEffect(() => {
    const cards = getDueCards();
    setDueCards(cards);
    
    if (cards.length === 0) {
      setSessionState('completed');
    } else {
      loadQuestion(cards[0]);
    }
  }, []);

  const loadQuestion = useCallback((card: ReviewCard) => {
    const question = getQuestionById(card.questionId);
    if (question) {
      setCurrentQuestion(question);
      setCurrentCard(card);
      setSessionState('reviewing');
      setShowAnswer(false);
    }
  }, []);

  const handleRate = useCallback((rating: ConfidenceRating) => {
    if (!currentCard || !currentQuestion) return;

    // Record the review
    recordReview(
      currentCard.questionId,
      currentCard.channel,
      currentCard.difficulty,
      rating
    );

    // Calculate and add XP
    const xpEarned = calculateXP(rating, currentCard.masteryLevel);
    addXP(xpEarned);
    setSessionXP(prev => prev + xpEarned);
    
    // Process credits
    onSRSReview(rating);
    
    // Track achievement
    trackEvent({
      type: 'srs_review',
      timestamp: new Date().toISOString(),
      data: { rating },
    });

    // Update stats
    setSessionStats(prev => ({ ...prev, [rating]: prev[rating] + 1 }));
    setReviewedCount(prevCount => {
      const newCount = prevCount + 1;
      
      // Track this card for checkpoint
      setRecentCards(prev => [...prev, currentCard]);

      // Use functional update for currentIndex to avoid stale closure
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        
        // Check for checkpoint AFTER updating count
        if (newCount % 5 === 0 && nextIndex < dueCards.length) {
          console.log(`[Checkpoint] Triggering at question ${newCount}`);
          setSessionState('checkpoint');
          return nextIndex;
        }

        // Load next card or complete
        if (nextIndex < dueCards.length) {
          loadQuestion(dueCards[nextIndex]);
        } else {
          setSessionState('completed');
        }
        return nextIndex;
      });
      
      return newCount;
    });
    triggerHaptic('medium');
  }, [currentCard, currentQuestion, dueCards, onSRSReview, trackEvent, triggerHaptic, loadQuestion]);

  const handleCheckpointComplete = useCallback((checkpointScore: number) => {
    console.log(`[Checkpoint] Completed with score: ${checkpointScore}`);
    triggerHaptic('heavy');
    if (currentIndex < dueCards.length) {
      loadQuestion(dueCards[currentIndex]);
    } else {
      setSessionState('completed');
    }
  }, [currentIndex, dueCards, loadQuestion, triggerHaptic]);

  const progress = dueCards.length > 0 ? Math.round((reviewedCount / dueCards.length) * 100) : 0;

  const handleTagClick = useCallback((tag: string) => {
    setSearchQuery(tag);
    setShowSearch(true);
    triggerHaptic('light');
  }, [triggerHaptic]);

  const handleCopyCode = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  return (
    <>
      <SEOHead
        title="Review Session | Code Reels"
        description="Spaced repetition review with checkpoint tests"
      />

      <div className="min-h-screen min-h-dvh bg-[var(--gh-canvas)] flex flex-col">
        {/* Minimal Header - NO REDUNDANCY */}
        <motion.header 
          className="h-12 bg-card/90 backdrop-blur-xl border-b border-border/50 flex items-center px-3 gap-3 shrink-0"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <motion.button 
            onClick={() => setLocation('/')} 
            whileTap={{ scale: 0.92 }}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          
          <Brain className="w-4 h-4 text-[var(--gh-success-fg)]" />
          <h1 className="font-bold text-sm">SRS Review</h1>
          
          <div className="flex-1" />
          
          {/* Single progress display */}
          {dueCards.length > 0 && sessionState !== 'completed' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{reviewedCount}/{dueCards.length}</span>
              <div className="w-16 h-1.5 bg-[var(--gh-neutral-subtle)] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[var(--gh-success-emphasis)] to-[var(--gh-success-fg)]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {sessionXP > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 bg-[var(--gh-done-subtle)] rounded-lg"
            >
              <Zap className="w-3 h-3 text-[var(--gh-done-fg)]" />
              <span className="text-xs font-bold text-[var(--gh-done-fg)]">{sessionXP}</span>
            </motion.div>
          )}
        </motion.header>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {sessionState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div 
                  className="w-10 h-10 border-2 border-[var(--gh-success-emphasis)] border-t-transparent rounded-full mx-auto mb-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="text-muted-foreground text-sm">Loading...</p>
              </div>
            </motion.div>
          )}

          {sessionState === 'reviewing' && currentQuestion && currentCard && (
            <motion.div
              key={`review-${currentCard.questionId}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Question - COMPACT */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="max-w-2xl mx-auto space-y-3">
                  {/* Tags - COMPACT & CLICKABLE */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <motion.button
                      onClick={() => handleTagClick(currentCard.channel)}
                      whileTap={{ scale: 0.95 }}
                      className="px-2 py-0.5 bg-[var(--gh-accent-subtle)] text-[var(--gh-accent-fg)] text-xs font-semibold rounded-full border border-[var(--gh-accent-fg)]/30 hover:opacity-80 transition-colors cursor-pointer"
                    >
                      {currentCard.channel}
                    </motion.button>
                    <motion.button
                      onClick={() => handleTagClick(currentCard.difficulty)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold rounded-full border hover:opacity-80 transition-opacity cursor-pointer",
                        currentCard.difficulty === 'beginner' ? 'bg-[var(--gh-success-subtle)] text-[var(--gh-success-fg)] border-[var(--gh-success-fg)]/30' :
                        currentCard.difficulty === 'intermediate' ? 'bg-[var(--gh-attention-subtle)] text-[var(--gh-attention-fg)] border-[var(--gh-attention-fg)]/30' :
                        'bg-[var(--gh-danger-subtle)] text-[var(--gh-danger-fg)] border-[var(--gh-danger-fg)]/30'
                      )}
                    >
                      {currentCard.difficulty}
                    </motion.button>
                    {currentQuestion.tags && currentQuestion.tags.slice(0, 3).map((tag, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleTagClick(tag)}
                        whileTap={{ scale: 0.95 }}
                        className="px-2 py-0.5 bg-[var(--gh-done-subtle)] text-[var(--gh-done-fg)] text-xs font-semibold rounded-full border border-[var(--gh-done-fg)]/30 hover:opacity-80 transition-colors cursor-pointer"
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>

                  {/* Question - COMPACT */}
                  <h2 className="text-lg font-bold leading-tight">
                    {currentQuestion.question}
                  </h2>

                  {/* Answer - COMPACT, NO WASTED SPACE */}
                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      {/* TLDR - COMPACT */}
                      {currentQuestion.tldr && (
                        <div className="p-2 bg-[var(--gh-accent-subtle)] border border-[var(--gh-accent-fg)]/30 rounded-lg">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="w-3 h-3 text-[var(--gh-accent-fg)]" />
                            <span className="text-xs font-bold text-[var(--gh-accent-fg)]">TL;DR</span>
                          </div>
                          <p className="text-sm text-foreground/90">{currentQuestion.tldr}</p>
                        </div>
                      )}

                      {/* Answer - COMPACT with Markdown */}
                      <div className="p-2 bg-[var(--gh-success-subtle)] border border-[var(--gh-success-fg)]/30 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Check className="w-3 h-3 text-[var(--gh-success-fg)]" />
                          <span className="text-xs font-bold text-[var(--gh-success-fg)]">ANSWER</span>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none text-sm">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');
                                const codeId = `answer-code-${Math.random().toString(36).substr(2, 9)}`;
                                const inline = !match;

                                if (!inline && match) {
                                  return (
                                    <div className="relative group my-2">
                                      <button
                                        onClick={() => handleCopyCode(codeString, codeId)}
                                        className="absolute top-1 right-1 p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary transition-all opacity-0 group-hover:opacity-100 z-10"
                                      >
                                        {copiedCode === codeId ? (
                                          <Check className="w-3 h-3 text-[var(--gh-success-fg)]" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                      <SyntaxHighlighter
                                        style={vscDarkPlus}
                                        language={match[1]}
                                        PreTag="div"
                                        className="rounded-lg !bg-black/40 !my-0 !text-xs !p-2"
                                        {...props}
                                      >
                                        {codeString}
                                      </SyntaxHighlighter>
                                    </div>
                                  );
                                }

                                return (
                                  <code className="px-1 py-0.5 rounded bg-primary/15 text-primary text-xs font-mono" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="text-sm space-y-1 mb-2">{children}</ul>,
                              ol: ({ children }) => <ol className="text-sm space-y-1 mb-2">{children}</ol>,
                              li: ({ children }) => <li className="text-sm">{children}</li>,
                            }}
                          >
                            {preprocessMarkdown(currentQuestion.answer)}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* Explanation - COMPACT with Markdown */}
                      {currentQuestion.explanation && (
                        <div className="p-2 bg-[var(--gh-attention-subtle)] border border-[var(--gh-attention-fg)]/30 rounded-lg">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Brain className="w-3 h-3 text-[var(--gh-attention-fg)]" />
                            <span className="text-xs font-bold text-[var(--gh-attention-fg)]">EXPLANATION</span>
                          </div>
                          <div className="prose prose-invert prose-sm max-w-none text-xs">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const codeString = String(children).replace(/\n$/, '');
                                  const codeId = `exp-code-${Math.random().toString(36).substr(2, 9)}`;
                                  const inline = !match;

                                  if (!inline && match) {
                                    return (
                                      <div className="relative group my-2">
                                        <button
                                          onClick={() => handleCopyCode(codeString, codeId)}
                                          className="absolute top-1 right-1 p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary transition-all opacity-0 group-hover:opacity-100 z-10"
                                        >
                                          {copiedCode === codeId ? (
                                            <Check className="w-3 h-3 text-green-400" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                        <SyntaxHighlighter
                                          style={vscDarkPlus}
                                          language={match[1]}
                                          PreTag="div"
                                          className="rounded-lg !bg-black/40 !my-0 !text-xs !p-2"
                                          {...props}
                                        >
                                          {codeString}
                                        </SyntaxHighlighter>
                                      </div>
                                    );
                                  }

                                  return (
                                    <code className="px-1 py-0.5 rounded bg-primary/15 text-primary text-xs font-mono" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                p: ({ children }) => <p className="text-xs leading-relaxed text-foreground/80 mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="text-xs space-y-1 mb-2">{children}</ul>,
                                ol: ({ children }) => <ol className="text-xs space-y-1 mb-2">{children}</ol>,
                                li: ({ children }) => <li className="text-xs">{children}</li>,
                              }}
                            >
                              {preprocessMarkdown(currentQuestion.explanation)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Bottom Actions - REORGANIZED FOR LOGICAL FLOW */}
              <div className="shrink-0 pb-safe bg-card/90 backdrop-blur-xl border-t border-border/50">
                {!showAnswer ? (
                  /* Step 1: Tap anywhere to reveal answer */
                  <motion.button
                    onClick={() => {
                      setShowAnswer(true);
                      triggerHaptic('light');
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-[var(--gh-success-fg)]">
                      <Eye className="w-5 h-5" />
                      <span className="font-semibold">Tap to reveal answer</span>
                    </div>
                  </motion.button>
                ) : (
                  /* Step 2: Rate your confidence */
                  <div className="p-3 space-y-2">
                    <p className="text-center text-xs text-muted-foreground">
                      How well did you remember?
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { rating: 'again' as ConfidenceRating, label: 'Again', color: 'from-[var(--gh-danger-emphasis)] to-[var(--gh-danger-fg)]', icon: X },
                        { rating: 'hard' as ConfidenceRating, label: 'Hard', color: 'from-[var(--gh-attention-emphasis)] to-[var(--gh-attention-fg)]', icon: Brain },
                        { rating: 'good' as ConfidenceRating, label: 'Good', color: 'from-[var(--gh-success-emphasis)] to-[var(--gh-success-fg)]', icon: Check },
                        { rating: 'easy' as ConfidenceRating, label: 'Easy', color: 'from-[var(--gh-accent-emphasis)] to-[var(--gh-accent-fg)]', icon: Zap },
                      ].map((btn) => {
                        const Icon = btn.icon;
                        return (
                          <motion.button
                            key={btn.rating}
                            onClick={() => handleRate(btn.rating)}
                            whileTap={{ scale: 0.92 }}
                            className={cn(
                              'flex flex-col items-center gap-1 py-2.5 rounded-xl text-white',
                              'bg-gradient-to-br shadow-lg hover:shadow-xl min-h-[44px]',
                              btn.color
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-semibold">{btn.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {sessionState === 'checkpoint' && (
            <CheckpointTest
              reviewedCount={reviewedCount}
              recentCards={recentCards}
              onComplete={handleCheckpointComplete}
            />
          )}

          {sessionState === 'completed' && (
            <CompletedScreen 
              stats={sessionStats} 
              totalReviewed={reviewedCount}
              sessionXP={sessionXP}
              onGoHome={() => setLocation('/')}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Search Modal */}
      <UnifiedSearch 
        isOpen={showSearch} 
        onClose={() => {
          setShowSearch(false);
          setSearchQuery('');
        }}
        initialQuery={searchQuery}
      />
    </>
  );
}

// Checkpoint Test Component - Real quiz questions
function CheckpointTest({ 
  reviewedCount,
  recentCards,
  onComplete 
}: { 
  reviewedCount: number;
  recentCards: ReviewCard[];
  onComplete: (score: number) => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Get the last 5 reviewed cards for checkpoint
  const checkpointCards = recentCards.slice(-5);
  const currentCard = checkpointCards[currentQuestionIndex];
  const currentQuestion = currentCard ? getQuestionById(currentCard.questionId) : null;
  
  const totalQuestions = checkpointCards.length;
  const answeredCount = Object.keys(answers).length;
  const score = Object.values(answers).filter(Boolean).length;

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: isCorrect }));
    setShowAnswer(true);
    
    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <motion.div
      key="checkpoint"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-[var(--gh-canvas)]"
    >
      {/* Header */}
      <div className="h-12 bg-[var(--gh-canvas-overlay)]/90 backdrop-blur-xl border-b border-[var(--gh-border)]/50 flex items-center px-3 gap-3">
        <Target className="w-4 h-4 text-[var(--gh-attention-fg)]" />
        <h1 className="font-bold text-sm">Checkpoint Test</h1>
        <div className="flex-1" />
        <span className="text-xs font-medium">{answeredCount}/{totalQuestions}</span>
      </div>

      {!showResult ? (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Q{currentQuestionIndex + 1}/{totalQuestions}</span>
                <span className="text-xs font-bold text-[var(--gh-attention-fg)]">Score: {score}/{answeredCount}</span>
              </div>
              <div className="h-1.5 bg-[var(--gh-neutral-subtle)] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[var(--gh-attention-emphasis)] to-[var(--gh-attention-fg)]" 
                  animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[var(--gh-canvas-overlay)]/90 border border-[var(--gh-border)]/50 rounded-xl p-3 mb-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-[var(--gh-accent-subtle)] text-[var(--gh-accent-fg)] text-xs font-semibold rounded-full">
                  {currentCard.channel}
                </span>
              </div>
              
              <h2 className="text-base font-bold mb-3 leading-tight">
                {currentQuestion.question}
              </h2>

              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-2 bg-[var(--gh-success-subtle)] border border-[var(--gh-success-fg)]/30 rounded-lg"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Check className="w-3 h-3 text-[var(--gh-success-fg)]" />
                    <span className="text-xs font-bold text-[var(--gh-success-fg)]">ANSWER</span>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          const codeId = `checkpoint-code-${Math.random().toString(36).substr(2, 9)}`;
                          const inline = !match;

                          if (!inline && match) {
                            return (
                              <div className="relative group my-2">
                                <button
                                  onClick={() => handleCopyCode(codeString, codeId)}
                                  className="absolute top-1 right-1 p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary transition-all opacity-0 group-hover:opacity-100 z-10"
                                >
                                  {copiedCode === codeId ? (
                                    <Check className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-lg !bg-black/40 !my-0 !text-xs !p-2"
                                  {...props}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
                            );
                          }

                          return (
                            <code className="px-1 py-0.5 rounded bg-primary/15 text-primary text-xs font-mono" {...props}>
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="text-sm space-y-1 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="text-sm space-y-1 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                      }}
                    >
                      {preprocessMarkdown(currentQuestion.answer)}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Answer Buttons */}
            {!showAnswer && (
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  onClick={() => handleAnswer(false)}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gradient-to-br from-[var(--gh-danger-emphasis)] to-[var(--gh-danger-fg)] text-[var(--gh-fg-on-emphasis)] shadow-lg min-h-[56px]"
                >
                  <X className="w-5 h-5" />
                  <span className="text-sm font-semibold">Don't Remember</span>
                </motion.button>

                <motion.button
                  onClick={() => handleAnswer(true)}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gradient-to-br from-[var(--gh-success-emphasis)] to-[var(--gh-success-fg)] text-[var(--gh-fg-on-emphasis)] shadow-lg min-h-[56px]"
                >
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-semibold">Remember</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md w-full">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="w-16 h-16 rounded-full bg-[var(--gh-attention-subtle)] flex items-center justify-center mx-auto mb-4"
            >
              <Trophy className="w-8 h-8 text-[var(--gh-attention-fg)]" />
            </motion.div>

            <h2 className="text-xl font-bold mb-2">Checkpoint Complete!</h2>
            
            <div className="p-4 bg-[var(--gh-success-subtle)] border border-[var(--gh-success-fg)]/30 rounded-xl mb-4">
              <div className="text-3xl font-bold text-[var(--gh-success-fg)] mb-1">
                {score}/{totalQuestions}
              </div>
              <p className="text-sm text-muted-foreground">
                {score === totalQuestions ? 'Perfect!' : 
                 score >= 4 ? 'Great job!' :
                 score >= 3 ? 'Good!' : 
                 'Keep practicing!'}
              </p>
            </div>

            <motion.button
              onClick={() => onComplete(score)}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-gradient-to-r from-[var(--gh-attention-emphasis)] to-[var(--gh-attention-fg)] text-[var(--gh-fg-on-emphasis)] rounded-xl font-bold shadow-lg"
            >
              Continue Reviewing
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Completed Screen
function CompletedScreen({ 
  stats, 
  totalReviewed,
  sessionXP,
  onGoHome
}: { 
  stats: { again: number; hard: number; good: number; easy: number };
  totalReviewed: number;
  sessionXP: number;
  onGoHome: () => void;
}) {
  const srsStats = getSRSStats();

  return (
    <motion.div
      key="completed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex items-center justify-center p-4"
    >
      <div className="text-center max-w-md w-full">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="w-20 h-20 rounded-full bg-[var(--gh-attention-subtle)] flex items-center justify-center mx-auto mb-4 relative"
        >
          <Trophy className="w-10 h-10 text-[var(--gh-attention-fg)]" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.5 }}
            className="absolute -top-1 -right-1"
          >
            <Star className="w-5 h-5 text-[var(--gh-attention-fg)] fill-[var(--gh-attention-fg)]" />
          </motion.div>
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">
          {totalReviewed === 0 ? 'All Caught Up!' : 'Session Complete!'}
        </h2>
        
        <p className="text-muted-foreground mb-4">
          {totalReviewed === 0 ? 'No cards due.' : `Reviewed ${totalReviewed} cards!`}
        </p>

        {sessionXP > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gh-done-subtle)] rounded-full mb-4">
            <Zap className="w-5 h-5 text-[var(--gh-done-fg)]" />
            <span className="text-lg font-bold text-[var(--gh-done-fg)]">+{sessionXP} XP</span>
          </div>
        )}

        {totalReviewed > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-[var(--gh-neutral-subtle)]/30 rounded-xl">
            {[
              { label: 'Again', value: stats.again, color: 'text-[var(--gh-danger-fg)]' },
              { label: 'Hard', value: stats.hard, color: 'text-[var(--gh-attention-fg)]' },
              { label: 'Good', value: stats.good, color: 'text-[var(--gh-success-fg)]' },
              { label: 'Easy', value: stats.easy, color: 'text-[var(--gh-accent-fg)]' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={cn('text-lg font-bold', stat.color)}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {srsStats.reviewStreak > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-[var(--gh-attention-fg)]" />
            <span className="text-sm font-bold text-[var(--gh-attention-fg)]">
              {srsStats.reviewStreak} day streak!
            </span>
          </div>
        )}

        <motion.button
          onClick={onGoHome}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 bg-gradient-to-r from-[var(--gh-success-emphasis)] to-[var(--gh-success-fg)] text-[var(--gh-fg-on-emphasis)] rounded-xl font-bold shadow-lg"
        >
          Back to Home
        </motion.button>
      </div>
    </motion.div>
  );
}
