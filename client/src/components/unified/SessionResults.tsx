/**
 * Shared SessionResults component — Issue #103
 *
 * Provides a single consistent result screen across all study modes:
 * TestSession, CertificationExam, CertificationPractice, TrainingMode.
 *
 * Visual language: score circle, pass/fail banner, stat chips, action CTA.
 */
import { memo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { MOTION } from '@/lib/motion';

export interface DomainResult {
  label: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface SessionResultsProps {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  passingScore?: number;
  elapsedSeconds?: number;
  domainResults?: DomainResult[];
  title?: string;
  subtitle?: string;
  actions: ReactNode;
  className?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const SessionResults = memo(function SessionResults({
  score,
  correct,
  total,
  passed,
  passingScore = 70,
  elapsedSeconds,
  domainResults,
  title,
  subtitle,
  actions,
  className = '',
}: SessionResultsProps) {
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={MOTION.default}
      className={`min-h-screen flex items-center justify-center p-4 ${className}`}
    >
      <div className="max-w-md w-full space-y-6">

        {/* Score header */}
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            passed
              ? 'bg-[var(--gh-success-subtle)]'
              : 'bg-[var(--gh-danger-subtle)]'
          }`}>
            {passed
              ? <Trophy className="w-10 h-10 text-[var(--gh-success-fg)]" />
              : <RotateCcw className="w-10 h-10 text-[var(--gh-danger-fg)]" />
            }
          </div>

          <h2 className="text-2xl font-bold mb-1">
            {title ?? (passed ? 'Passed!' : 'Keep Practising')}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {!subtitle && (
            <p className="text-sm text-muted-foreground">
              {passed
                ? 'Great work — you hit the passing score.'
                : `You need ${passingScore}% to pass. You got ${score}%.`}
            </p>
          )}
        </div>

        {/* Score circle */}
        <div className="relative w-32 h-32 mx-auto" aria-label={`Score: ${score}%`}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              strokeWidth="8"
              className="stroke-muted"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className={passed ? 'stroke-[var(--gh-success-fg)]' : 'stroke-[var(--gh-danger-fg)]'}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums">{score}%</span>
            <span className="text-xs text-muted-foreground">{correct}/{total}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className={`grid gap-3 ${elapsedSeconds !== undefined ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <CheckCircle className="w-4 h-4 mx-auto mb-1 text-[var(--gh-success-fg)]" />
            <div className="text-xl font-bold">{correct}</div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <XCircle className="w-4 h-4 mx-auto mb-1 text-[var(--gh-danger-fg)]" />
            <div className="text-xl font-bold">{total - correct}</div>
            <div className="text-xs text-muted-foreground">Incorrect</div>
          </div>
          {elapsedSeconds !== undefined && (
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xl font-bold font-mono tabular-nums">{formatTime(elapsedSeconds)}</div>
              <div className="text-xs text-muted-foreground">Time</div>
            </div>
          )}
        </div>

        {/* Domain breakdown (optional) */}
        {domainResults && domainResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              By Domain
            </h3>
            {domainResults.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{d.label}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      d.percentage >= passingScore
                        ? 'bg-[var(--gh-success-fg)]'
                        : 'bg-[var(--gh-danger-fg)]'
                    }`}
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-mono tabular-nums w-10 text-right">
                  {d.percentage}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">{actions}</div>
      </div>
    </motion.div>
  );
});
