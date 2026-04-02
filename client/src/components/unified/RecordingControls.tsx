/**
 * Unified Recording Controls Component
 * 
 * Provides consistent recording control buttons
 * Used across: TrainingMode, VoiceSession, VoiceInterview
 */

import { Mic, Square, RotateCcw, CheckCircle, Play, Pause } from 'lucide-react';
import { Button } from './Button';

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
        <Button
          variant="danger"
          size="lg"
          onClick={onStart}
          disabled={disabled}
          icon={<Mic className="w-5 h-5" />}
        >
          Start Recording
        </Button>
      )}

      {/* Recording State - Show Stop Button */}
      {state === 'recording' && (
        <Button
          variant="danger"
          size="lg"
          onClick={onStop}
          icon={<Square className="w-5 h-5" />}
          className="animate-pulse"
        >
          Stop Recording
        </Button>
      )}

      {/* Recorded State - Show Play, Reset, Submit */}
      {state === 'recorded' && (
        <>
          {onPlay && (
            <Button
              variant="primary"
              size="md"
              onClick={onPlay}
              icon={<Play className="w-5 h-5" />}
            >
              Play
            </Button>
          )}
          {onReset && (
            <Button
              variant="ghost"
              size="md"
              onClick={onReset}
              icon={<RotateCcw className="w-5 h-5" />}
            >
              Re-record
            </Button>
          )}
          {onSubmit && (
            <Button
              variant="primary"
              size="lg"
              onClick={onSubmit}
              disabled={disabled}
              icon={<CheckCircle className="w-5 h-5" />}
            >
              {submitLabel}
            </Button>
          )}
        </>
      )}

      {/* Playing State - Show Stop Playback */}
      {state === 'playing' && onStopPlayback && (
        <Button
          variant="primary"
          size="md"
          onClick={onStopPlayback}
          icon={<Pause className="w-5 h-5" />}
        >
          Stop Playback
        </Button>
      )}
    </div>
  );
}
