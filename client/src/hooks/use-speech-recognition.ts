/**
 * Speech Recognition Hook
 * 
 * Provides a clean, reusable interface for Web Speech API recognition.
 * Used across:
 * - VoiceSession
 * - VoicePractice
 * - VoiceSessionGenZ
 * - VoicePracticeGenZ
 * - VoiceInterview
 * - AICompanion
 * 
 * Features:
 * - Continuous or single-utterance mode
 * - Interim and final transcript handling
 * - Auto-restart on recognition end
 * - Error handling
 * - Language support
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  autoRestart?: boolean;
  maxAlternatives?: number;
  onResult?: (result: SpeechRecognitionResult) => void;
  onInterim?: (transcript: string) => void;
  onFinal?: (transcript: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export interface SpeechRecognitionControls {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  reset: () => void;
  recognition: any; // Expose for advanced use cases
}

// Check for browser support
export const isSpeechRecognitionSupported = typeof window !== 'undefined' && 
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): SpeechRecognitionControls {
  const {
    continuous = true,
    interimResults = true,
    lang = 'en-US',
    autoRestart = false,
    maxAlternatives = 1,
    onResult,
    onInterim,
    onFinal,
    onStart,
    onEnd,
    onError
  } = options;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  const onFinalRef = useRef(onFinal);
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
    onInterimRef.current = onInterim;
    onFinalRef.current = onFinal;
    onStartRef.current = onStart;
    onEndRef.current = onEnd;
    onErrorRef.current = onError;
  }, [onResult, onInterim, onFinal, onStart, onEnd, onError]);

  // Initialize recognition
  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;
    recognition.maxAlternatives = maxAlternatives;

    recognition.onstart = () => {
      setIsListening(true);
      onStartRef.current?.();
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript || '';
        const confidence = result[0]?.confidence ?? 0;

        if (result.isFinal) {
          final += text + ' ';
          onResultRef.current?.({ transcript: text, isFinal: true, confidence });
          onFinalRef.current?.(text);
        } else {
          interim += text;
          onResultRef.current?.({ transcript: text, isFinal: false, confidence });
          onInterimRef.current?.(text);
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (final) {
        finalTranscriptRef.current = (finalTranscriptRef.current + final).trim();
        setTranscript(finalTranscriptRef.current);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      onErrorRef.current?.(event.error);

      if (event.error === 'not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      onEndRef.current?.();

      // Auto-restart if enabled
      if (autoRestart) {
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.warn('Auto-restart failed:', e);
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      try {
        recognition.stop();
      } catch (e) {
        // Already stopped
      }
    };
  }, [continuous, interimResults, lang, maxAlternatives, autoRestart]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Recognition already started:', e);
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.warn('Recognition already stopped:', e);
    }
  }, []);

  const abort = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.abort();
    } catch (e) {
      console.warn('Recognition abort failed:', e);
    }
  }, []);

  const reset = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported: isSpeechRecognitionSupported,
    start,
    stop,
    abort,
    reset,
    recognition: recognitionRef.current
  };
}

// Extended hook with single utterance mode (for PTT)
export function useSpeechRecognitionPTT(options: Omit<SpeechRecognitionOptions, 'continuous' | 'autoRestart'> = {}) {
  return useSpeechRecognition({
    ...options,
    continuous: false,
    autoRestart: false
  });
}

// Extended hook with continuous mode (for voice sessions)
export function useSpeechRecognitionContinuous(options: Omit<SpeechRecognitionOptions, 'continuous' | 'autoRestart'> = {}) {
  return useSpeechRecognition({
    ...options,
    continuous: true,
    autoRestart: true
  });
}
