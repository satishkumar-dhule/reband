import { memo, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Unified timer display component — Issue #102.
 *
 * Replaces the ad-hoc ExamTimer (count-down only) in CertificationExam.tsx
 * and the RecordingTimer (count-up only) in TrainingMode.tsx with a single
 * component that supports both directions, a configurable warning threshold,
 * and a consistent visual treatment across all timed study modes.
 *
 * Props:
 *  - direction: "down" | "up"
 *      "down" → starts at `initialTime`, ticks toward 0, fires `onTimeUp` at 0.
 *      "up"   → starts at 0, ticks upward, no `onTimeUp` fired.
 *  - initialTime: starting seconds (for "down") or 0 (for "up").
 *  - isActive: pause/resume the tick without unmounting.
 *  - warningThreshold: seconds at which the timer turns red (only used for "down").
 *  - onTimeUp: callback fired when a "down" timer reaches 0.
 *  - className: extra class names for the wrapping span.
 */
interface TimerDisplayProps {
  direction?: "down" | "up";
  initialTime?: number;
  isActive?: boolean;
  warningThreshold?: number;
  onTimeUp?: () => void;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const TimerDisplay = memo(function TimerDisplay({
  direction = "down",
  initialTime = 0,
  isActive = true,
  warningThreshold = 60,
  onTimeUp,
  className,
}: TimerDisplayProps) {
  const [elapsed, setElapsed] = useState(direction === "down" ? initialTime : 0);

  useEffect(() => {
    setElapsed(direction === "down" ? initialTime : 0);
  }, [initialTime, direction]);

  useEffect(() => {
    if (!isActive) return;

    if (direction === "down" && elapsed <= 0) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (direction === "down") {
          if (prev <= 1) {
            clearInterval(interval);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, direction, onTimeUp]);

  const isWarning = direction === "down" && elapsed <= warningThreshold;

  return (
    <span
      className={cn(
        "font-mono text-sm tabular-nums",
        isWarning
          ? "text-[var(--gh-danger-fg)] animate-pulse"
          : "text-muted-foreground",
        className
      )}
      aria-live="off"
      aria-label={`${direction === "down" ? "Time remaining" : "Time elapsed"}: ${formatTime(elapsed)}`}
    >
      {formatTime(elapsed)}
    </span>
  );
});

export { formatTime };
