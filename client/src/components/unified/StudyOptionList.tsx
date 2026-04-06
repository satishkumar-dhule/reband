/**
 * Shared StudyOptionList — Issue #101
 *
 * Single source of truth for MCQ answer-option rendering across all study
 * modes. Replaces the near-identical inline implementations in TestSession,
 * CertificationExam, and any future mode.
 *
 * Visual states (driven by props only — no internal logic):
 *   none       — unanswered, options are selectable
 *   revealing  — answer revealed; correct = green, wrong-selected = red
 */

import { memo } from 'react';
import { Check, X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './Button';

export interface StudyOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type StudyFeedbackState = 'none' | 'revealing';

export interface StudyOptionListProps {
  options: StudyOption[];
  /** IDs of options the user has selected */
  selectedIds: string[];
  feedbackState: StudyFeedbackState;
  isMultiple?: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
  className?: string;
}

export const StudyOptionList = memo(function StudyOptionList({
  options,
  selectedIds,
  feedbackState,
  isMultiple = false,
  disabled = false,
  onSelect,
  className = '',
}: StudyOptionListProps) {
  const isRevealing = feedbackState === 'revealing';

  return (
    <div className={`space-y-2 ${className}`} role="group" aria-label="Answer options">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        const showCorrect = isRevealing && option.isCorrect;
        const showWrong = isRevealing && isSelected && !option.isCorrect;

        let variant: React.ComponentProps<typeof Button>['variant'] =
          isSelected ? 'outline' : 'ghost';
        if (showCorrect) variant = 'success';
        else if (showWrong) variant = 'danger';

        return (
          <Button
            key={option.id}
            variant={variant}
            onClick={() => !disabled && !isRevealing && onSelect(option.id)}
            disabled={disabled || isRevealing}
            fullWidth
            className={[
              'justify-start p-3 md:p-4 h-auto text-left min-h-[44px]',
              showCorrect
                ? 'border-[var(--gh-success-fg)] bg-[var(--gh-success-fg)]/10'
                : showWrong
                ? 'border-[var(--gh-danger-fg)] bg-[var(--gh-danger-fg)]/10'
                : isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50',
              isRevealing ? 'cursor-default' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={isSelected}
            aria-label={`${option.text}${showCorrect ? ' — correct' : showWrong ? ' — incorrect' : ''}`}
          >
            <div className="flex items-start gap-3">
              {/* Option indicator */}
              <div
                className={[
                  'flex-shrink-0 flex items-center justify-center',
                  isMultiple ? 'w-5 h-5 rounded-md border-2 mt-0.5' : 'w-5 h-5 rounded-full border-2 mt-0.5',
                  showCorrect
                    ? 'border-[var(--gh-success-fg)] bg-[var(--gh-success-fg)]'
                    : showWrong
                    ? 'border-[var(--gh-danger-fg)] bg-[var(--gh-danger-fg)]'
                    : isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              >
                {showCorrect && (isMultiple ? <Check className="w-3 h-3 text-white" /> : <CheckCircle className="w-3 h-3 text-white" />)}
                {showWrong && (isMultiple ? <X className="w-3 h-3 text-white" /> : <XCircle className="w-3 h-3 text-white" />)}
                {!isRevealing && isSelected && (
                  isMultiple
                    ? <Check className="w-3 h-3 text-white" />
                    : <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>

              <span className="text-sm leading-relaxed">{option.text}</span>
            </div>
          </Button>
        );
      })}

      {isMultiple && !isRevealing && (
        <p className="text-xs text-muted-foreground text-center pt-1">
          Select all correct answers, then confirm to continue
        </p>
      )}
    </div>
  );
});
