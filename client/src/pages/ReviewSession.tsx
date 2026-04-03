import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useCredits } from '../context/CreditsContext';
import { ListenButton } from '../components/ListenButton';
import { Button } from '../components/unified/Button';
import {
  Brain, ChevronLeft, Eye, Flame, Sparkles, Zap, Check, RotateCcw, BookOpen, ArrowRight
} from 'lucide-react';
import { SRS_CONFIG } from '../lib/srs-config';
import { getDueCards, recordReview, getSRSStats, type ReviewCard, type ConfidenceRating } from '../lib/spaced-repetition';
import { getQuestionByIdAsync, loadChannelQuestions } from '../lib/questions-loader';
import type { Question } from '../types';

// Lazy-load heavy dependencies to reduce initial bundle size (~150KB savings)
// EnhancedMermaid uses named export, so wrap it
const EnhancedMermaid = lazy(() => 
  import('../components/EnhancedMermaid').then(m => ({ default: m.EnhancedMermaid as unknown as React.ComponentType<any> }))
);
const ReactMarkdown = lazy(() => 
  import('react-markdown').then(m => ({ default: m.default as unknown as React.ComponentType<any> }))
);

// Skeleton fallback for lazy components
function ComponentSkeleton() {
  return <div className="h-24 animate-pulse rounded-md bg-[var(--gh-neutral-muted)]" />;
}

const confidenceLevels: { id: ConfidenceRating; label: string; colorClass: string }[] = [
  { id: 'again', label: 'Again', colorClass: 'bg-[var(--gh-danger-emphasis)]' },
  { id: 'hard',  label: 'Hard',  colorClass: 'bg-[var(--gh-attention-emphasis)]' },
  { id: 'good',  label: 'Good',  colorClass: 'bg-[var(--gh-accent-emphasis)]' },
  { id: 'easy',  label: 'Easy',  colorClass: 'bg-[var(--gh-success-emphasis)]' },
];

function DiagramSection({ diagram }: { diagram: string }) {
  const [renderSuccess, setRenderSuccess] = useState<boolean | null>(null);
  if (renderSuccess === false) return null;
  return (
    <div className="mt-4 p-4 gh-card bg-[var(--gh-canvas-inset)]">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-[var(--gh-fg-muted)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gh-fg-muted)]">Diagram</span>
      </div>
      <div className="overflow-x-auto">
        <Suspense fallback={<ComponentSkeleton />}>
          <EnhancedMermaid
            chart={diagram}
            onRenderResult={(success: boolean) => setRenderSuccess(success)}
            caption="Visual explanation"
          />
        </Suspense>
      </div>
    </div>
  );
}

function preprocessMarkdown(text: string): string {
  if (!text) return '';
  let processed = text;
  processed = processed.replace(/([^\n])(```)/g, '$1\n$2');
  processed = processed.replace(/(```\w*)\s*\n?\s*([^\n`])/g, '$1\n$2');
  processed = processed.replace(/^\*\*\s*$/gm, '');
  processed = processed.replace(/\*\*\s*\n\s*([^*]+)\*\*/g, '**$1**');
  processed = processed.replace(/^[•·]\s*/gm, '- ');
  processed = processed.replace(/\n{3,}/g, '\n\n');
  return processed.trim();
}

// Lazy-loaded markdown renderer component
function MarkdownRenderer({ content }: { content: string }) {
  const [SyntaxHighlighterComponent, setSyntaxHighlighter] = useState<React.ComponentType<any> | null>(null);
  const [syntaxStyle, setSyntaxStyle] = useState<any>(null);
  const [remarkGfmPlugin, setRemarkGfmPlugin] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import('react-syntax-highlighter').then(m => m.Prism),
      import('react-syntax-highlighter/dist/esm/styles/prism').then(m => m.vscDarkPlus),
      import('remark-gfm').then(m => m.default),
    ]).then(([SyntaxHighlighter, style, remarkGfm]) => {
      setSyntaxHighlighter(() => SyntaxHighlighter);
      setSyntaxStyle(style);
      setRemarkGfmPlugin(() => remarkGfm);
    });
  }, []);

  if (!SyntaxHighlighterComponent || !syntaxStyle || !remarkGfmPlugin) {
    return <ComponentSkeleton />;
  }

  return (
    <Suspense fallback={<ComponentSkeleton />}>
      <ReactMarkdown
        remarkPlugins={[remarkGfmPlugin]}
        components={{
          code({ className, children }: { className?: string; children: React.ReactNode }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-xs font-mono text-[var(--gh-fg)]">
                  {children}
                </code>
              );
            }
            return (
              <div className="my-4 rounded-md overflow-hidden border border-[var(--gh-border)]">
                <SyntaxHighlighterComponent
                  language={match ? match[1] : 'text'}
                  style={syntaxStyle}
                  customStyle={{ margin: 0, padding: '1rem', fontSize: '0.85rem' }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighterComponent>
              </div>
            );
          },
          p: ({ children }: { children: React.ReactNode }) => <p className="mb-3 text-[var(--gh-fg-muted)]">{children}</p>,
          strong: ({ children }: { children: React.ReactNode }) => <strong className="font-semibold text-[var(--gh-fg)]">{children}</strong>,
          ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
          li: ({ children }: { children: React.ReactNode }) => <li className="text-[var(--gh-fg-muted)]">{children}</li>,
        }}
      >
        {preprocessMarkdown(content)}
      </ReactMarkdown>
    </Suspense>
  );
}

interface SessionCard {
  srs: ReviewCard;
  question: Question;
}

export default function ReviewSession() {
  const [, setLocation] = useLocation();
  const { onSRSReview } = useCredits();

  const [sessionCards, setSessionCards] = useState<SessionCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load due SRS cards and resolve their question data
  useEffect(() => {
    let cancelled = false;

    async function loadCards() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const dueCards = getDueCards();

        if (dueCards.length === 0) {
          if (!cancelled) {
            setSessionCards([]);
            setIsLoading(false);
          }
          return;
        }

        // Pre-load channels needed to resolve questions (parallel)
        const channelsNeeded = [...new Set(dueCards.map(c => c.channel))];
        await Promise.all(channelsNeeded.map(ch => loadChannelQuestions(ch).catch(() => null)));

        // Resolve all SRS cards to their full questions (PARALLEL - no waterfall)
        const resolved: SessionCard[] = [];
        const questionResults = await Promise.all(
          dueCards.map(srs => getQuestionByIdAsync(srs.questionId))
        );
        questionResults.forEach((question, index) => {
          if (question) {
            resolved.push({ srs: dueCards[index], question });
          }
        });

        if (!cancelled) {
          setSessionCards(resolved);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError('Failed to load review cards. Please try again.');
          setIsLoading(false);
        }
      }
    }

    loadCards();
    return () => { cancelled = true; };
  }, []);

  const handleConfidence = useCallback((rating: ConfidenceRating) => {
    const card = sessionCards[currentIndex];
    if (!card) return;

    // Update SRS schedule in localStorage
    recordReview(card.srs.questionId, card.srs.channel, card.srs.difficulty, rating);

    // Award credits
    onSRSReview(rating);

    // Track history via API (fire-and-forget — no login required)
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: card.question.id,
        questionType: 'srs',
        eventType: 'review',
        eventSource: 'review-session',
        confidence: rating,
      }),
    }).catch(() => { /* Silently ignore — browser storage is authoritative */ });

    setReviewedCount(prev => prev + 1);
    setStreak(prev => (rating === 'easy' || rating === 'good') ? prev + 1 : 0);
    setShowAnswer(false);

    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setLocation('/stats', { replace: true });
    }
  }, [sessionCards, currentIndex, onSRSReview, setLocation]);

  const srsStats = getSRSStats();
  const progress = sessionCards.length > 0 ? (reviewedCount / sessionCards.length) * 100 : 0;
  const currentCard = sessionCards[currentIndex];

  // --- Loading state ---
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-[var(--gh-neutral-muted)] animate-pulse rounded-md" />
            <div className="flex gap-4">
              <div className="h-5 w-16 bg-[var(--gh-neutral-muted)] animate-pulse rounded-md" />
              <div className="h-5 w-16 bg-[var(--gh-neutral-muted)] animate-pulse rounded-md" />
            </div>
          </div>
          <div className="h-2 w-full bg-[var(--gh-neutral-muted)] animate-pulse rounded-md" />
          <div className="gh-card p-6 md:p-8 space-y-4">
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-[var(--gh-neutral-muted)] animate-pulse rounded-md" />
              <div className="h-5 w-24 bg-[var(--gh-neutral-muted)] animate-pulse rounded-md" />
            </div>
            <div className="h-32 flex items-center justify-center">
              <div className="h-8 w-3/4 bg-[var(--gh-neutral-muted)] animate-pulse rounded-md" />
            </div>
            <div className="flex justify-center py-4">
              <div className="h-12 w-40 bg-[var(--gh-neutral-muted)] animate-pulse rounded-md" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // --- Error state ---
  if (loadError) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <p className="text-[var(--gh-danger-fg)] mb-4">{loadError}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
        </div>
      </AppLayout>
    );
  }

  // --- Empty state: no cards due ---
  if (sessionCards.length === 0) {
    return (
      <>
        <SEOHead title="SRS Review — Nothing Due" description="All caught up on your spaced repetition reviews!" />
        <AppLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <div className="w-16 h-16 bg-[var(--gh-success-subtle)] text-[var(--gh-success-fg)] rounded-full flex items-center justify-center mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--gh-fg)] mb-2">All caught up!</h2>
            <p className="text-[var(--gh-fg-muted)] mb-2 max-w-sm">
              You have no cards due for review right now.
            </p>
            {srsStats.totalCards === 0 ? (
              <p className="text-sm text-[var(--gh-fg-subtle)] mb-6 max-w-sm">
                Start studying questions and tap <strong>Add to SRS</strong> on any question to build your review deck.
              </p>
            ) : (
              <p className="text-sm text-[var(--gh-fg-subtle)] mb-6 max-w-sm">
                You have <strong>{srsStats.totalCards}</strong> cards in your deck. Next review due tomorrow. Keep the streak going!
              </p>
            )}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => setLocation('/channels')} variant="primary" icon={<BookOpen className="w-4 h-4" />}>
                Browse Questions
              </Button>
              <Button onClick={() => setLocation('/')} variant="outline" icon={<ArrowRight className="w-4 h-4" />}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </AppLayout>
      </>
    );
  }

  // --- Session complete (after last card) ---
  if (!currentCard) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="w-16 h-16 bg-[var(--gh-success-subtle)] text-[var(--gh-success-fg)] rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-[var(--gh-fg)] mb-2">Review Complete!</h2>
          <p className="text-[var(--gh-fg-muted)] mb-6">
            You reviewed {reviewedCount} card{reviewedCount !== 1 ? 's' : ''}. Your memory is leveling up!
          </p>
          <Button onClick={() => setLocation('/')} variant="primary">
            Back to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  const { question } = currentCard;

  return (
    <>
      <SEOHead
        title="SRS Review — Spaced Repetition"
        description="Review your cards with spaced repetition"
        canonical="https://open-interview.github.io/review"
      />

      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setLocation('/')}
                variant="ghost"
                size="sm"
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Back to Dashboard
              </Button>

              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 text-[var(--gh-attention-fg)]">
                  <Flame className="w-4 h-4" />
                  <span>Streak: {streak}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--gh-fg-muted)]">
                  <Brain className="w-4 h-4" />
                  <span>{reviewedCount} / {sessionCards.length}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="gh-progress">
              <div className="gh-progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Card */}
          <div className="gh-card shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              {/* Metadata */}
              <div className="flex items-center gap-2 mb-6">
                <span className="gh-label gh-label-gray uppercase text-[10px]">
                  {question.channel}
                </span>
                <span className={`gh-label text-[10px] uppercase ${
                  question.difficulty === 'beginner' ? 'gh-label-green' :
                  question.difficulty === 'intermediate' ? 'gh-label-yellow' :
                  'gh-label-red'
                }`}>
                  {question.difficulty}
                </span>
                {currentCard.srs.masteryLevel > 0 && (
                  <span className="gh-label gh-label-purple text-[10px] uppercase">
                    Mastery {currentCard.srs.masteryLevel}/5
                  </span>
                )}
              </div>

              {/* Question */}
              <div className="min-h-[120px] flex items-center justify-center mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-center text-[var(--gh-fg)] leading-snug">
                  {question.question}
                </h2>
              </div>

              {/* Action Area */}
              {!showAnswer ? (
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowAnswer(true)}
                    variant="primary"
                    size="lg"
                    data-testid="button-reveal-answer"
                  >
                    Reveal Answer
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* TLDR */}
                  {question.tldr && (
                    <div className="p-4 rounded-md border-l-4 border-[var(--gh-accent-fg)] bg-[var(--gh-canvas-subtle)]">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                        <span className="text-xs font-bold uppercase text-[var(--gh-accent-fg)]">TL;DR</span>
                      </div>
                      <p className="text-sm text-[var(--gh-fg)]">{question.tldr}</p>
                    </div>
                  )}

                  {/* Main Answer */}
                  <div className="p-6 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                        <span className="font-semibold text-[var(--gh-fg)]">Full Answer</span>
                      </div>
                      <ListenButton
                        text={`${question.answer}${question.explanation ? '. ' + question.explanation : ''}`}
                        label="Listen"
                        size="sm"
                      />
                    </div>
                    <p className="text-lg text-[var(--gh-fg)] leading-relaxed">
                      {question.answer}
                    </p>
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="p-6 bg-[var(--gh-canvas-inset)] border border-[var(--gh-border)] rounded-md">
                      <div className="flex items-center gap-2 mb-4">
                        <Check className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                        <span className="font-bold uppercase text-xs text-[var(--gh-fg-muted)] tracking-wider">Analysis</span>
                      </div>
                      <div className="prose prose-sm max-w-none prose-slate">
                        <MarkdownRenderer content={question.explanation} />
                      </div>
                    </div>
                  )}

                  {/* Diagram */}
                  {question.diagram && <DiagramSection diagram={question.diagram} />}

                  {/* Rating Section */}
                  <div className="pt-6 border-t border-[var(--gh-border)]">
                    <p className="text-center text-sm font-medium text-[var(--gh-fg-muted)] mb-4">
                      How well did you know this?
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {confidenceLevels.map((level) => (
                        <Button
                          key={level.id}
                          onClick={() => handleConfidence(level.id)}
                          variant="outline"
                          data-testid={`button-rate-${level.id}`}
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${level.colorClass}`} />
                          {level.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[var(--gh-canvas-subtle)] border-t border-[var(--gh-border)] flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[var(--gh-fg-subtle)]">
              <span>Spaced Repetition System</span>
              <div className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                <span>Active Session</span>
              </div>
            </div>
          </div>

          {/* Hint */}
          {!showAnswer && (
            <div className="mt-8 p-4 gh-card bg-[var(--gh-accent-subtle)] border-[var(--gh-border)] flex gap-3 items-start">
              <Zap className="w-4 h-4 text-[var(--gh-accent-fg)] mt-0.5" />
              <div className="text-sm text-[var(--gh-fg)]">
                <p className="font-semibold mb-1">Pro Tip</p>
                <p>Try to recall the answer out loud before revealing. This strengthens memory recall neural pathways!</p>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
