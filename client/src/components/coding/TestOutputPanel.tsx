import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Terminal, ChevronDown, ChevronUp, Play, Sparkles,
} from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';
import type { TestResult } from '../../lib/coding-challenges';

export interface TestOutputPanelProps {
  results: TestResult[];
  isExpanded: boolean;
  onToggle: () => void;
  testCases: any[];
  allPassed: boolean;
  complexity?: { time: string; space: string } | null;
  isRunning: boolean;
  isPythonLoading?: boolean;
}

export const TestOutputPanel = React.memo(function TestOutputPanel({
  results, isExpanded, onToggle, testCases, allPassed, complexity, isRunning, isPythonLoading,
}: TestOutputPanelProps) {
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  return (
    <div className={cn(
      'border-t border-[var(--gh-border)] flex flex-col bg-[var(--gh-canvas)] transition-all duration-300 shrink-0',
      isExpanded ? 'h-[38vh] min-h-[160px] max-h-[55vh]' : 'h-11'
    )}>
      <div
        className="h-11 flex items-center justify-between px-4 cursor-pointer shrink-0 hover:bg-[var(--gh-canvas-subtle)] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[var(--gh-fg-muted)]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gh-fg-muted)]">Test Results</span>
          {total > 0 && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold border',
              allPassed ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/30' : 'bg-red-500/12 text-red-400 border-red-500/30'
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
                      result.passed ? 'border-emerald-500/25 bg-emerald-500/6' : 'border-red-500/25 bg-red-500/6'
                    )}
                  >
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
