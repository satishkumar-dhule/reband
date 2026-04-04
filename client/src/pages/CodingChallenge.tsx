import { useState, useEffect, useCallback, useMemo } from 'react';
import React from 'react';
import { useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, RotateCcw, Eye, CheckCircle, XCircle,
  Code, Lightbulb, ChevronRight, Zap, Trophy, Copy, Check,
  Brain, Flame, Target, Terminal, ChevronDown,
  ChevronUp, Search, BookOpen, Clock, Building2, Tag,
  Sparkles, Lock, Unlock, Filter, BarChart2, Timer,
  ChevronLeft, Hash, Star
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { AppLayout } from '../components/layout/AppLayout';
import { CodeEditor } from '../components/CodeEditor';
import {
  CodingChallenge as Challenge, Language, TestResult,
  getAllChallengesAsync, getChallengeById, getRandomChallenge,
  runTestsAsync, saveChallengeAttempt, analyzeCodeComplexity,
  getCodingStats, getSolvedChallengeIds, ComplexityAnalysis,
} from '../lib/coding-challenges';
import { isPyodideReady } from '../lib/pyodide-runner';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Button } from '../components/unified/Button';
import { Input } from '../components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import { cn } from '../lib/utils';

// ─── Constants ───────────────────────────────────────────────
const CODING_LANGUAGE_KEY = 'coding-preferred-language';
const CODING_PROGRESS_PREFIX = 'coding-progress-';

type ViewState = 'list' | 'challenge';

function getStoredLanguage(): Language {
  try {
    const s = localStorage.getItem(CODING_LANGUAGE_KEY);
    if (s === 'javascript' || s === 'python') return s;
  } catch {}
  return 'javascript';
}
function getStoredCode(id: string, lang: Language): string | null {
  try { return localStorage.getItem(`${CODING_PROGRESS_PREFIX}${id}-${lang}`); } catch { return null; }
}
function saveCodeProgress(id: string, lang: Language, code: string): void {
  try { localStorage.setItem(`${CODING_PROGRESS_PREFIX}${id}-${lang}`, code); } catch {}
}

// ─── Difficulty helpers ───────────────────────────────────────
function diffColor(d?: string) {
  if (d === 'easy') return { bg: 'bg-emerald-500/12', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  if (d === 'hard') return { bg: 'bg-red-500/12', text: 'text-red-400', border: 'border-red-500/30' };
  return { bg: 'bg-amber-500/12', text: 'text-amber-400', border: 'border-amber-500/30' };
}

function DiffBadge({ d }: { d?: string }) {
  const c = diffColor(d);
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border', c.bg, c.text, c.border)}>
      {d ?? 'medium'}
    </span>
  );
}

// ─── Live Timer ───────────────────────────────────────────────
function LiveTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return (
    <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--gh-fg-muted)]">
      <Timer className="w-3.5 h-3.5" />
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
}

// ─── Test Results Panel ──────────────────────────────────────
interface TestOutputPanelProps {
  results: TestResult[];
  isExpanded: boolean;
  onToggle: () => void;
  testCases: any[];
  allPassed: boolean;
  complexity?: { time: string; space: string } | null;
  isRunning: boolean;
  isPythonLoading?: boolean;
}

const TestOutputPanel = React.memo(function TestOutputPanel({
  results, isExpanded, onToggle, testCases, allPassed, complexity, isRunning, isPythonLoading,
}: TestOutputPanelProps) {
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  return (
    <div className={cn(
      'border-t border-[var(--gh-border)] flex flex-col bg-[var(--gh-canvas)] transition-all duration-300 shrink-0',
      isExpanded ? 'h-[38vh] min-h-[160px] max-h-[55vh]' : 'h-11'
    )}>
      {/* Header */}
      <div
        className="h-11 flex items-center justify-between px-4 cursor-pointer shrink-0 hover:bg-[var(--gh-canvas-subtle)] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[var(--gh-fg-muted)]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gh-fg-muted)]">
            Test Results
          </span>
          {total > 0 && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold border',
              allPassed
                ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/12 text-red-400 border-red-500/30'
            )}>
              {passed}/{total} Passed
            </span>
          )}
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--gh-accent-fg)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gh-accent-fg)] animate-pulse" />
              Running…
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {allPassed && total > 0 && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              All tests pass!
            </span>
          )}
          {isExpanded ? <ChevronDown className="w-4 h-4 text-[var(--gh-fg-muted)]" /> : <ChevronUp className="w-4 h-4 text-[var(--gh-fg-muted)]" />}
        </div>
      </div>

      {isExpanded && (
        <ScrollArea className="flex-1 p-4">
          {isRunning ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-[var(--gh-fg-muted)]">
              <div className="w-8 h-8 border-2 border-[var(--gh-accent-fg)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">
                {isPythonLoading ? 'Loading Python runtime…' : 'Running your code…'}
              </p>
            </div>
          ) : total === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-[var(--gh-fg-muted)] opacity-50">
              <Play className="w-8 h-8" />
              <p className="text-sm font-medium">Run your code to see test results</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result, idx) => {
                const tc = testCases.find(t => t.id === result.testCaseId);
                return (
                  <motion.div
                    key={result.testCaseId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className={cn(
                      'rounded-lg border overflow-hidden',
                      result.passed
                        ? 'border-emerald-500/25 bg-emerald-500/6'
                        : 'border-red-500/25 bg-red-500/6'
                    )}
                  >
                    {/* Test case header */}
                    <div className={cn(
                      'flex items-center gap-2 px-3 py-2 border-b',
                      result.passed ? 'border-emerald-500/20 bg-emerald-500/8' : 'border-red-500/20 bg-red-500/8'
                    )}>
                      {result.passed
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                      <span className={cn('text-xs font-bold', result.passed ? 'text-emerald-400' : 'text-red-400')}>
                        Test Case {idx + 1}
                      </span>
                      {tc?.description && (
                        <span className="text-xs text-[var(--gh-fg-muted)] truncate">— {tc.description}</span>
                      )}
                    </div>

                    {/* I/O Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--gh-border)]/30 text-xs font-mono">
                      {[
                        { label: 'Input', val: tc?.input },
                        { label: 'Expected', val: tc?.expectedOutput },
                        { label: 'Got', val: result.actualOutput, highlight: true },
                      ].map(({ label, val, highlight }) => (
                        <div key={label} className="bg-[var(--gh-canvas-inset)] px-3 py-2">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--gh-fg-muted)] mb-1">{label}</p>
                          <p className={cn(
                            'break-all',
                            highlight && !result.passed ? 'text-red-300' :
                            highlight && result.passed ? 'text-emerald-300' :
                            'text-[var(--gh-fg)]'
                          )}>
                            {val ?? '—'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {!result.passed && result.error && (
                      <div className="px-3 py-2 bg-red-500/8 border-t border-red-500/20">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-red-400 mb-1">Error</p>
                        <p className="text-xs font-mono text-red-300 break-all">{result.error}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {allPassed && complexity && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-4 rounded-lg bg-[var(--gh-accent-subtle)]/40 border border-[var(--gh-accent-fg)]/25"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--gh-accent-fg)]">Complexity Analysis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Time Complexity', val: complexity.time },
                      { label: 'Space Complexity', val: complexity.space },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--gh-accent-fg)] mb-1">{label}</p>
                        <p className="text-sm font-mono font-semibold text-[var(--gh-fg)]">{val}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
});

// ─── Challenge view ───────────────────────────────────────────
interface ChallengeViewProps {
  challenge: Challenge;
  language: Language;
  setLanguage: (l: Language) => void;
  code: string;
  setCode: (c: string) => void;
  testResults: TestResult[];
  isRunning: boolean;
  showHints: boolean;
  setShowHints: (v: boolean) => void;
  hintIndex: number;
  setHintIndex: (v: number) => void;
  showSuccessModal: boolean;
  setShowSuccessModal: (v: boolean) => void;
  solvedIds: Set<string>;
  startTime: number;
  resultsPanelExpanded: boolean;
  setResultsPanelExpanded: (v: boolean) => void;
  onRun: () => void;
  onReset: () => void;
  onBack: () => void;
  onNextChallenge: () => void;
  onBackToList: () => void;
}

function ChallengeView({
  challenge, language, setLanguage, code, setCode,
  testResults, isRunning, showHints, setShowHints, hintIndex, setHintIndex,
  showSuccessModal, setShowSuccessModal, solvedIds,
  startTime, resultsPanelExpanded, setResultsPanelExpanded,
  onRun, onReset, onBack, onNextChallenge, onBackToList,
}: ChallengeViewProps) {
  const [copied, setCopied] = useState(false);
  const [showDesc, setShowDesc] = useState(true);

  const allPassed = testResults.length > 0 && testResults.every(r => r.passed);
  const isSolved = solvedIds.has(challenge.id);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dc = diffColor(challenge.difficulty);

  return (
    <AppLayout fullWidth hideNav>
      <SEOHead title={`${challenge.title} | Coding Challenge`} description={challenge.description} />
      <div className="flex flex-col h-screen bg-[var(--gh-canvas-subtle)]">

        {/* ── Top Bar ─────────────────────────────────────────── */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-[var(--gh-border)] bg-[var(--gh-canvas)] shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] px-2 py-1.5 rounded-md hover:bg-[var(--gh-neutral-subtle)] transition-all shrink-0"
              data-testid="button-back"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <div className="w-px h-4 bg-[var(--gh-border)]" />

            <div className="flex items-center gap-2 min-w-0">
              <span className={cn('w-2 h-2 rounded-full shrink-0', isSolved ? 'bg-emerald-400' : 'bg-amber-400')} />
              <h1 className="text-sm font-semibold text-[var(--gh-fg)] truncate">{challenge.title}</h1>
              <DiffBadge d={challenge.difficulty} />
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--gh-border)] text-[var(--gh-fg-muted)] bg-[var(--gh-canvas-subtle)] hidden sm:inline">
                {challenge.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LiveTimer startTime={startTime} />
            <div className="w-px h-4 bg-[var(--gh-border)]" />

            {/* Language tabs */}
            <div className="flex items-center bg-[var(--gh-canvas-inset)] border border-[var(--gh-border)] rounded-md overflow-hidden">
              {(['javascript', 'python'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium transition-all',
                    language === lang
                      ? 'bg-[var(--gh-accent-fg)] text-white'
                      : 'text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:bg-[var(--gh-neutral-subtle)]'
                  )}
                  data-testid={`button-lang-${lang}`}
                >
                  {lang === 'javascript' ? 'JS' : 'Python'}
                </button>
              ))}
            </div>

            <button
              onClick={onRun}
              disabled={isRunning}
              data-testid="button-run-tests"
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all',
                isRunning
                  ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black active:scale-95'
              )}
            >
              {isRunning
                ? <><span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />Running…</>
                : <><Play className="w-3.5 h-3.5" />Run Tests</>
              }
            </button>
          </div>
        </header>

        {/* ── Mobile Tab Switch ─────────────────────────────── */}
        <div className="lg:hidden flex border-b border-[var(--gh-border)] bg-[var(--gh-canvas)] shrink-0">
          {['Description', 'Code Editor'].map((label, i) => {
            const active = i === 0 ? showDesc : !showDesc;
            return (
              <button
                key={label}
                onClick={() => setShowDesc(i === 0)}
                className={cn(
                  'flex-1 py-2 text-xs font-semibold transition-all border-b-2',
                  active ? 'text-[var(--gh-fg)] border-[var(--gh-accent-fg)]' : 'text-[var(--gh-fg-muted)] border-transparent hover:text-[var(--gh-fg)]'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Main Split Pane ───────────────────────────────── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

          {/* LEFT: Problem Description */}
          <div className={cn(
            'lg:w-[42%] lg:border-r border-[var(--gh-border)] flex flex-col bg-[var(--gh-canvas-subtle)] min-h-0',
            showDesc ? 'flex' : 'hidden lg:flex'
          )}>
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">

                {/* Header with companies */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <DiffBadge d={challenge.difficulty} />
                    <span className="text-[10px] px-2 py-0.5 rounded border border-[var(--gh-border)] text-[var(--gh-fg-muted)]">
                      {challenge.category}
                    </span>
                    {isSolved && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-400 font-bold">
                        <CheckCircle className="w-3 h-3" /> Solved
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-[var(--gh-fg)]">{challenge.title}</h2>

                  {/* Companies */}
                  {challenge.companies && challenge.companies.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[var(--gh-fg-muted)]" />
                      {challenge.companies.map(c => (
                        <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-fg-muted)]">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {challenge.tags && challenge.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {challenge.tags.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gh-accent-subtle)]/30 border border-[var(--gh-accent-fg)]/20 text-[var(--gh-accent-fg)]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Complexity */}
                {challenge.complexity && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Time', val: challenge.complexity.time },
                      { label: 'Space', val: challenge.complexity.space },
                    ].map(({ label, val }) => (
                      <div key={label} className="px-3 py-2.5 rounded-lg bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)]">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--gh-fg-muted)] mb-0.5">{label} Complexity</p>
                        <p className="text-sm font-mono font-semibold text-[var(--gh-fg)]">{val}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--gh-fg-muted)] mb-3">Problem Statement</h3>
                  <p className="text-sm text-[var(--gh-fg-muted)] leading-relaxed whitespace-pre-wrap">
                    {challenge.description}
                  </p>
                </div>

                {/* Examples */}
                {challenge.testCases && challenge.testCases.filter(tc => !tc.isHidden).length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--gh-fg-muted)] mb-3">Examples</h3>
                    <div className="space-y-3">
                      {challenge.testCases.filter(tc => !tc.isHidden).map((ex, i) => (
                        <div key={ex.id} className="rounded-lg border border-[var(--gh-border)] overflow-hidden bg-[var(--gh-canvas-inset)]">
                          <div className="px-3 py-1.5 bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gh-fg-muted)]">Example {i + 1}</span>
                            {ex.description && <span className="text-[10px] text-[var(--gh-fg-muted)] ml-2">— {ex.description}</span>}
                          </div>
                          <div className="p-3 grid grid-cols-2 gap-2 text-xs font-mono">
                            <div>
                              <span className="text-[var(--gh-fg-muted)] font-sans text-[9px] uppercase font-bold">Input</span>
                              <div className="mt-1 p-2 bg-[var(--gh-canvas-subtle)] rounded border border-[var(--gh-border)] text-[var(--gh-fg)]">{ex.input}</div>
                            </div>
                            <div>
                              <span className="text-[var(--gh-fg-muted)] font-sans text-[9px] uppercase font-bold">Output</span>
                              <div className="mt-1 p-2 bg-[var(--gh-canvas-subtle)] rounded border border-[var(--gh-border)] text-emerald-300">{ex.expectedOutput}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hints */}
                {challenge.hints && challenge.hints.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--gh-border)] hover:border-amber-500/40 hover:bg-amber-500/6 transition-all group"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                        <Lightbulb className="w-4 h-4" />
                        {showHints ? 'Hide hints' : `Need a hint? (${challenge.hints.length} available)`}
                      </span>
                      {showHints ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
                    </button>

                    <AnimatePresence>
                      {showHints && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 p-4 rounded-lg bg-amber-500/8 border border-amber-500/25 space-y-3">
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={hintIndex}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-sm text-[var(--gh-attention-fg)] leading-relaxed"
                              >
                                {challenge.hints[hintIndex]}
                              </motion.p>
                            </AnimatePresence>
                            {challenge.hints.length > 1 && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-amber-400/60">{hintIndex + 1}/{challenge.hints.length}</span>
                                <button
                                  onClick={() => setHintIndex((hintIndex + 1) % challenge.hints.length)}
                                  className="text-xs text-amber-400 font-semibold hover:underline"
                                >
                                  Next hint →
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: Editor + Results */}
          <div className={cn(
            'flex-1 flex flex-col min-h-0 bg-[var(--gh-canvas-subtle)]',
            !showDesc ? 'flex' : 'hidden lg:flex'
          )}>
            {/* Editor toolbar */}
            <div className="h-10 flex items-center justify-between px-3 border-b border-[var(--gh-border)] bg-[var(--gh-canvas)] shrink-0">
              <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-[var(--gh-fg-muted)]" />
                <span className="text-xs font-medium text-[var(--gh-fg-muted)] uppercase tracking-wider">
                  solution.{language === 'javascript' ? 'js' : 'py'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:bg-[var(--gh-neutral-subtle)] transition-all"
                  data-testid="button-copy-code"
                >
                  {copied ? <><Check className="w-3 h-3 text-emerald-400" />Copied!</> : <><Copy className="w-3 h-3" />Copy</>}
                </button>
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[var(--gh-fg-muted)] hover:text-red-400 hover:bg-red-500/8 transition-all"
                  data-testid="button-reset-code"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>

            {/* Monaco editor — absolute inset-0 wrapper is required so CodeEditor's
                h-full resolves against a concrete pixel height, not a flex-distributed
                height (CSS height:100% doesn't resolve against flex-grow). */}
            <div className="flex-1 relative overflow-hidden min-h-0">
              <div className="absolute inset-0">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  onLanguageChange={setLanguage}
                  height="100%"
                  showToolbar={false}
                />
              </div>
            </div>

            {/* Test results */}
            <TestOutputPanel
              results={testResults}
              isExpanded={resultsPanelExpanded}
              onToggle={() => setResultsPanelExpanded(!resultsPanelExpanded)}
              testCases={challenge.testCases || []}
              allPassed={allPassed}
              complexity={challenge.complexity}
              isRunning={isRunning}
              isPythonLoading={!isPyodideReady() && language === 'python'}
            />
          </div>
        </div>

        {/* ── Success Modal ──────────────────────────────────── */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent size="lg" className="bg-[var(--gh-canvas)] border-[var(--gh-border)] text-center">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center">
                    <Star className="w-3.5 h-3.5 text-black" />
                  </div>
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold text-[var(--gh-fg)]">Challenge Complete!</DialogTitle>
              <DialogDescription className="text-[var(--gh-fg-muted)] mt-2">
                All tests passed. Great solution!
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center gap-8 py-6 my-2 rounded-xl bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)]">
              {[
                { label: 'Time', val: (() => { const e = Math.floor((Date.now() - startTime) / 1000); return `${Math.floor(e/60)}:${String(e%60).padStart(2,'0')}`; })() },
                { label: 'Tests', val: `${testResults.length}/${testResults.length}` },
                { label: 'Status', val: challenge.difficulty },
              ].map(({ label, val }) => (
                <div key={label} className="text-center">
                  <p className="text-[10px] text-[var(--gh-fg-muted)] uppercase font-bold tracking-wider mb-1">{label}</p>
                  <p className="text-xl font-bold text-[var(--gh-fg)]">{val}</p>
                </div>
              ))}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 gap-2" onClick={onBackToList}>
                <BookOpen className="w-4 h-4" /> Back to List
              </Button>
              <Button variant="success" className="flex-1 gap-2" onClick={onNextChallenge}>
                <Zap className="w-4 h-4" /> Next Challenge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

// ─── Challenge Card ───────────────────────────────────────────
function ChallengeCard({ challenge, solved, onClick }: {
  challenge: Challenge; solved: boolean; onClick: () => void;
}) {
  const dc = diffColor(challenge.difficulty);
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      data-testid={`card-challenge-${challenge.id}`}
      className={cn(
        'group relative cursor-pointer rounded-xl border overflow-hidden transition-all',
        solved
          ? 'border-emerald-500/25 bg-[var(--gh-canvas-subtle)]'
          : 'border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] hover:border-[var(--gh-accent-fg)]/50',
      )}
    >
      {/* Solved glow */}
      {solved && (
        <div className="absolute inset-0 bg-emerald-500/3 pointer-events-none" />
      )}

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center border',
              solved ? 'bg-emerald-500/12 border-emerald-500/30' : 'bg-[var(--gh-canvas-subtle)] border-[var(--gh-border)]'
            )}>
              {solved
                ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                : <Terminal className="w-4 h-4 text-[var(--gh-accent-fg)]" />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gh-fg-muted)]">
              {challenge.category}
            </span>
          </div>
          <DiffBadge d={challenge.difficulty} />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[var(--gh-fg)] group-hover:text-[var(--gh-accent-fg)] transition-colors mb-2 line-clamp-1">
          {challenge.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[var(--gh-fg-muted)] line-clamp-2 leading-relaxed mb-4">
          {challenge.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--gh-border)]/50">
          <div className="flex items-center gap-3">
            {/* Tags */}
            {challenge.tags?.slice(0, 2).map(t => (
              <span key={t} className="text-[9px] text-[var(--gh-fg-muted)] font-mono">#{t}</span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--gh-fg-muted)]">
            {challenge.companies?.slice(0, 2).map(c => (
              <span key={c} className="flex items-center gap-0.5">
                <Building2 className="w-2.5 h-2.5" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hover arrow */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-4 h-4 text-[var(--gh-accent-fg)]" />
      </div>
    </motion.div>
  );
}

// ─── Main Export ──────────────────────────────────────────────
export default function CodingChallenge() {
  const { id } = useParams<{ id?: string }>();
  const [_, setLocation] = useLocation();

  const [viewState, setViewState] = useState<ViewState>(id ? 'challenge' : 'list');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [language, setLanguage] = useState<Language>(getStoredLanguage);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => getSolvedChallengeIds());
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [resultsPanelExpanded, setResultsPanelExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState<'all' | 'easy' | 'medium'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const stats = getCodingStats();

  // Load challenges
  useEffect(() => {
    getAllChallengesAsync().then(setChallenges).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(CODING_LANGUAGE_KEY, language); } catch {}
  }, [language]);

  useEffect(() => {
    if (!currentChallenge || !code) return;
    const t = setTimeout(() => saveCodeProgress(currentChallenge.id, language, code), 500);
    return () => clearTimeout(t);
  }, [code, currentChallenge, language]);

  useEffect(() => {
    if (id && !isLoading) {
      const c = getChallengeById(id) || challenges.find(x => x.id === id);
      if (c) openChallenge(c);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isLoading, challenges]);

  useEffect(() => {
    if (currentChallenge) {
      setCode(getStoredCode(currentChallenge.id, language) || currentChallenge.starterCode[language]);
      setTestResults([]);
    }
  }, [language, currentChallenge]);

  const openChallenge = useCallback((c: Challenge) => {
    setCurrentChallenge(c);
    setCode(getStoredCode(c.id, language) || c.starterCode[language]);
    setTestResults([]);
    setShowHints(false);
    setHintIndex(0);
    setShowSuccessModal(false);
    setStartTime(Date.now());
    setViewState('challenge');
    setLocation(`/coding/${c.id}`);
  }, [language, setLocation]);

  const runCode = useCallback(async () => {
    if (!currentChallenge) return;
    setIsRunning(true);
    setShowSuccessModal(false);
    try {
      const results = await runTestsAsync(code, currentChallenge, language);
      setTestResults(results);
      const allPassed = results.every(r => r.passed);
      if (allPassed) {
        saveChallengeAttempt({
          challengeId: currentChallenge.id, code, language,
          startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
          passed: true, testResults: results,
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
        });
        setShowSuccessModal(true);
        setSolvedIds(prev => new Set(Array.from(prev).concat(currentChallenge.id)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  }, [code, currentChallenge, language, startTime]);

  const resetCode = useCallback(() => {
    if (!currentChallenge) return;
    setCode(currentChallenge.starterCode[language]);
    setTestResults([]);
    try { localStorage.removeItem(`${CODING_PROGRESS_PREFIX}${currentChallenge.id}-${language}`); } catch {}
  }, [currentChallenge, language]);

  const goBack = () => {
    if (viewState === 'challenge') { setViewState('list'); setLocation('/coding'); }
    else setLocation('/');
  };

  const startRandom = useCallback((d?: 'easy' | 'medium') => {
    openChallenge(getRandomChallenge(d));
  }, [openChallenge]);

  const categories = useMemo(() => {
    const all = Array.from(new Set(challenges.map(c => c.category).filter(Boolean)));
    return all.sort();
  }, [challenges]);

  const filtered = useMemo(() => challenges.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    const matchDiff = diffFilter === 'all' || c.difficulty === diffFilter;
    const matchCat = categoryFilter === 'all' || c.category === categoryFilter;
    return matchSearch && matchDiff && matchCat;
  }), [challenges, searchQuery, diffFilter, categoryFilter]);

  // ─── Challenge view ───────────────────────────────────────
  if (viewState === 'challenge' && currentChallenge) {
    return (
      <ChallengeView
        challenge={currentChallenge}
        language={language} setLanguage={setLanguage}
        code={code} setCode={setCode}
        testResults={testResults}
        isRunning={isRunning}
        showHints={showHints} setShowHints={setShowHints}
        hintIndex={hintIndex} setHintIndex={setHintIndex}
        showSuccessModal={showSuccessModal} setShowSuccessModal={setShowSuccessModal}
        solvedIds={solvedIds}
        startTime={startTime}
        resultsPanelExpanded={resultsPanelExpanded} setResultsPanelExpanded={setResultsPanelExpanded}
        onRun={runCode}
        onReset={resetCode}
        onBack={goBack}
        onNextChallenge={() => { setShowSuccessModal(false); startRandom(); }}
        onBackToList={() => { setShowSuccessModal(false); goBack(); }}
      />
    );
  }

  // ─── List view ────────────────────────────────────────────
  return (
    <AppLayout>
      <SEOHead
        title="Coding Challenges | DevPrep"
        description="Practice coding interview problems with instant feedback"
      />
      <div className="min-h-screen bg-[var(--gh-canvas-subtle)]">

        {/* ── Hero Header ──────────────────────────────────── */}
        <div className="relative bg-[var(--gh-canvas)] border-b border-[var(--gh-border)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--gh-accent-subtle)]/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-[var(--gh-accent-fg)]/15 border border-[var(--gh-accent-fg)]/30 flex items-center justify-center">
                    <Code className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--gh-accent-fg)]">Coding Challenges</span>
                </div>
                <h1 className="text-3xl font-bold text-[var(--gh-fg)]">Practice. Build. Ship.</h1>
                <p className="text-[var(--gh-fg-muted)] max-w-lg">
                  Solve real interview problems with instant test execution in JavaScript and Python.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => startRandom('easy')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold transition-all active:scale-95"
                  data-testid="button-quick-start"
                >
                  <Play className="w-4 h-4" /> Quick Start (Easy)
                </button>
                <button
                  onClick={() => startRandom()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--gh-border)] text-sm font-semibold text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-subtle)] transition-all"
                  data-testid="button-random-challenge"
                >
                  <Zap className="w-4 h-4 text-amber-400" /> Random
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Solved', value: solvedIds.size, total: challenges.length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Attempted', value: stats.totalAttempts, icon: Target, color: 'text-[var(--gh-accent-fg)]', bg: 'bg-[var(--gh-accent-subtle)]/30' },
                { label: 'Avg Time', value: `${Math.floor(stats.averageTime / 60)}m`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Total', value: challenges.length, icon: BarChart2, color: 'text-[var(--gh-fg-muted)]', bg: 'bg-[var(--gh-canvas-subtle)]' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-[var(--gh-border)] bg-[var(--gh-canvas)] p-4 flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border border-[var(--gh-border)]', s.bg)}>
                    <s.icon className={cn('w-5 h-5', s.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--gh-fg)]">{s.value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gh-fg-muted)]">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            {challenges.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-[var(--gh-fg-muted)] mb-2">
                  <span>Overall progress</span>
                  <span className="font-semibold">{solvedIds.size}/{challenges.length} solved ({Math.round((solvedIds.size / challenges.length) * 100)}%)</span>
                </div>
                <div className="h-2 bg-[var(--gh-canvas-subtle)] rounded-full overflow-hidden border border-[var(--gh-border)]">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(solvedIds.size / challenges.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Filter & Search ──────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gh-fg-muted)] pointer-events-none" />
              <Input
                placeholder="Search challenges…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-challenges"
              />
            </div>

            {/* Difficulty filter */}
            <div className="flex items-center gap-1 p-1 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-lg">
              {(['all', 'easy', 'medium'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDiffFilter(d)}
                  data-testid={`filter-difficulty-${d}`}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all',
                    diffFilter === d
                      ? d === 'easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : d === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-[var(--gh-accent-fg)]/15 text-[var(--gh-accent-fg)] border border-[var(--gh-accent-fg)]/30'
                      : 'text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-subtle)]'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <Filter className="w-3.5 h-3.5 mr-2 text-[var(--gh-fg-muted)]" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4 text-sm text-[var(--gh-fg-muted)]">
            <span>
              {isLoading ? 'Loading…' : `${filtered.length} challenge${filtered.length !== 1 ? 's' : ''}`}
              {(searchQuery || diffFilter !== 'all' || categoryFilter !== 'all') && ' matching filters'}
            </span>
            {(searchQuery || diffFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setDiffFilter('all'); setCategoryFilter('all'); }}
                className="text-xs text-[var(--gh-accent-fg)] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-44 rounded-xl border border-[var(--gh-border)] bg-[var(--gh-canvas)] animate-pulse" />
                ))
              : filtered.length > 0
                ? filtered.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <ChallengeCard
                        challenge={c}
                        solved={solvedIds.has(c.id)}
                        onClick={() => openChallenge(c)}
                      />
                    </motion.div>
                  ))
                : (
                  <div className="col-span-full py-20 flex flex-col items-center text-[var(--gh-fg-muted)] bg-[var(--gh-canvas)] border border-dashed border-[var(--gh-border)] rounded-xl">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <h3 className="text-lg font-bold mb-1">No challenges found</h3>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                    <button
                      className="mt-4 text-sm text-[var(--gh-accent-fg)] hover:underline"
                      onClick={() => { setSearchQuery(''); setDiffFilter('all'); setCategoryFilter('all'); }}
                    >
                      Clear all filters
                    </button>
                  </div>
                )
            }
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
