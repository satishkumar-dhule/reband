/**
 * Unified Recording Controls Component
 * 
 * Provides consistent recording control buttons
 * Used across: TrainingMode, VoiceSession, VoiceInterview
 */

import { Mic, Square, RotateCcw, CheckCircle, Play, Pause } from 'lucide-react';

interface RecordingControlsProps {
  state: 'idle' | 'recording' | 'recorded' | 'playing';
  onStart: () => void;
  onStop: () => void;
  onReset?: () => void;
  onSubmit?: () => void;
  onPlay?: () => void;
  onStopPlayback?: () => void;
  disabled?: boolean;
  submitLabel?: string;
  className?: string;
}

export function RecordingControls({
  state,
  onStart,
  onStop,
  onReset,
  onSubmit,
  onPlay,
  onStopPlayback,
  disabled = false,
  submitLabel = 'Submit Answer',
  className = ''
}: RecordingControlsProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {/* Idle State - Show Start Button */}
      {state === 'idle' && (
        <button
          onClick={onStart}
          disabled={disabled}
          className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] min-w-[44px] bg-[var(--gh-danger-fg)] hover:bg-[var(--gh-danger-hover)] active:bg-[var(--gh-danger-fg)] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mic className="w-5 h-5" />
          Start Recording
        </button>
      )}

      {/* Recording State - Show Stop Button */}
      {state === 'recording' && (
        <button
          onClick={onStop}
          className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] min-w-[44px] bg-[var(--gh-danger-fg)] hover:bg-[var(--gh-danger-hover)] active:bg-[var(--gh-danger-fg)] text-white rounded-lg font-semibold transition-colors animate-pulse motion-reduce:animate-none"
        >
          <Square className="w-5 h-5" />
          Stop Recording
        </button>
      )}

      {/* Recorded State - Show Play, Reset, Submit */}
      {state === 'recorded' && (
        <>
          {onPlay && (
            <button
              onClick={onPlay}
              className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] min-w-[44px] bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground rounded-lg font-semibold transition-colors"
            >
              <Play className="w-5 h-5" />
              Play
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] min-w-[44px] bg-muted hover:bg-muted/80 active:bg-muted/70 rounded-lg font-semibold transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Re-record
            </button>
          )}
          {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={disabled}
              className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] min-w-[44px] bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              {submitLabel}
            </button>
          )}
        </>
      )}

      {/* Playing State - Show Stop Playback */}
      {state === 'playing' && onStopPlayback && (
        <button
          onClick={onStopPlayback}
          className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] min-w-[44px] bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground rounded-lg font-semibold transition-colors"
        >
          <Pause className="w-5 h-5" />
          Stop Playback
        </button>
      )}
    </div>
  );
}
