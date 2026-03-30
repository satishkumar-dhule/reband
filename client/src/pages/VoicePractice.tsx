/**
 * Unified Voice Practice Component
 * 
 * Combines Training Mode and Interview Mode with a simple toggle
 * - Training Mode: Answer visible for reading practice
 * - Interview Mode: Answer hidden until after recording
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mic, Square, Eye, EyeOff, Volume2,
  Trophy, RotateCcw, ChevronRight, Sparkles, BookOpen
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { DesktopSidebarWrapper } from '../components/layout/DesktopSidebarWrapper';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { ChannelService } from '../services/api.service';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition, isSpeechRecognitionSupported } from '../hooks/use-speech-recognition';
import type { Question } from '../types';

type PracticeMode = 'training' | 'interview';
type RecordingState = 'idle' | 'recording' | 'recorded';

interface FeedbackResult {
  wordsSpoken: number;
  targetWords: number;
  duration: number;
  message: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function calculateFeedback(transcript: string, targetAnswer: string, duration: number): FeedbackResult {
  const wordsSpoken = countWords(transcript);
  const targetWords = countWords(targetAnswer);
  
  let message: string;
  const ratio = wordsSpoken / targetWords;
  
  if (ratio >= 0.8 && ratio <= 1.2) {
    message = "Great job! Your answer length is perfect! 🌟";
  } else if (ratio >= 0.5) {
    message = `Good effort! Try to cover more details. 💪`;
  } else if (wordsSpoken > 0) {
    message = "Keep practicing! Try to elaborate more. 📚";
  } else {
    message = "Start speaking to practice! 🎤";
  }
  
  return { wordsSpoken, targetWords, duration, message };
}

export default function VoicePractice() {
  const [, setLocation] = useLocation();
  const { getSubscribedChannels } = useUserPreferences();
  const { toast } = useToast();
  
  // Core state
  const [mode, setMode] = useState<PracticeMode>('interview');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Feedback state
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Refs
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const recordingStateRef = useRef<RecordingState>('idle');
  const [recognitionReady, setRecognitionReady] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  
  const currentQuestion = questions[currentIndex];
  const targetWords = currentQuestion?.answer ? countWords(currentQuestion.answer) : 0;

  // Keep recording state ref in sync
  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Load questions
  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      const subscribedChannels = getSubscribedChannels();
      
      if (subscribedChannels.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const allQuestions: Question[] = [];
        
        for (const channel of subscribedChannels) {
          try {
            const data = await ChannelService.getData(channel.id);
            // Filter for voice-suitable questions
            const suitable = (data.questions || []).filter((q: Question) => 
              q.voiceSuitable !== false && q.answer && q.answer.length > 100
            );
            allQuestions.push(...suitable);
          } catch (e) {
            console.error(`Failed to load ${channel.id}`, e);
          }
        }
        
        if (allQuestions.length > 0) {
          const shuffled = allQuestions.sort(() => Math.random() - 0.5);
          setQuestions(shuffled.slice(0, 15));
        }
      } catch (e) {
        console.error('Failed to load questions', e);
      }
      
      setLoading(false);
    }

    loadQuestions();
  }, [getSubscribedChannels]);

  // Use speech recognition hook
  const {
    transcript: hookTranscript,
    interimTranscript: hookInterim,
    start: startRecognition,
    stop: stopRecognition,
    isListening
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    lang: 'en-US',
    autoRestart: true,
    onFinal: (text) => {
      setTranscript(prev => (prev + ' ' + text).trim());
    },
    onInterim: (text) => setInterimTranscript(text),
    onError: (error) => {
      console.error('Speech recognition error:', error);
      if (error === 'not-allowed' || error === 'permission-denied') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access in your browser settings and refresh the page.",
          variant: "destructive",
        });
      } else if (error === 'network') {
        toast({
          title: "Network Error",
          description: "Speech recognition requires an active internet connection.",
          variant: "destructive",
        });
      }
    },
    onStart: () => {
      console.log('Speech recognition started');
      setRecognitionReady(true);
    }
  });

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support the Web Speech API. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
    }
  }, []);

  // Timer
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  // Start recording
  const startRecording = useCallback(() => {
    console.log('=== START RECORDING CLICKED ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // Check microphone permissions first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('🎤 Checking microphone permissions...');
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log('✅ Microphone access granted');
          
          // Start MediaRecorder for audio playback
          try {
            audioChunksRef.current = [];
            const mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
              }
            };
            
            mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              setAudioBlob(audioBlob);
              console.log('✅ Audio recorded:', audioBlob.size, 'bytes');
              
              // Stop all tracks
              stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            console.log('✅ MediaRecorder started');
          } catch (err) {
            console.error('❌ MediaRecorder error:', err);
          }
          
          // Now start speech recognition
          console.log('🎤 Starting speech recognition...');
          setTranscript('');
          setInterimTranscript('');
          setFeedback(null);
          setDuration(0);
          setAudioBlob(null);
          startTimeRef.current = Date.now();
          
          try {
            startRecognition();
            console.log('✅ recognition.start() called');
            setRecordingState('recording');
            console.log('✅ Recording state set to "recording"');
          } catch (err: any) {
            console.error('❌ Failed to start recognition:', err);
            if (err.message && err.message.includes('already started')) {
              console.log('⚠️ Recognition already running, stopping first...');
              try {
                stopRecognition();
                setTimeout(() => {
                  try {
                    startRecognition();
                    setRecordingState('recording');
                    console.log('✅ Recognition restarted successfully');
                  } catch (e) {
                    console.error('❌ Failed to restart:', e);
                    toast({
                      title: "Failed to Start Recording",
                      description: "Please refresh the page and try again.",
                      variant: "destructive",
                    });
                  }
                }, 100);
              } catch (e) {
                console.error('❌ Failed to stop/restart:', e);
              }
            } else {
              toast({
                title: "Failed to Start Recording",
                description: err.message || "Unknown error",
                variant: "destructive",
              });
            }
          }
        })
        .catch(err => {
          console.error('❌ Microphone access denied:', err);
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access in your browser settings.",
            variant: "destructive",
          });
        });
    } else {
      console.error('❌ getUserMedia not supported');
      toast({
        title: "Microphone Access Not Supported",
        description: "Your browser does not support microphone access. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    try {
      stopRecognition();
    } catch (e) {
      console.warn('Speech recognition stop failed:', e);
    }
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        console.log('✅ MediaRecorder stopped');
      } catch (e) {
        console.error('❌ Failed to stop MediaRecorder:', e);
      }
    }
    
    setRecordingState('recorded');
    
    // Calculate feedback
    if (currentQuestion) {
      const result = calculateFeedback(transcript, currentQuestion.answer, duration);
      setFeedback(result);
      
      // In interview mode, reveal answer after recording
      if (mode === 'interview') {
        setShowAnswer(true);
      }
    }
  }, [transcript, currentQuestion, duration, mode]);

  // Reset for new question
  const resetForNewQuestion = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFeedback(null);
    setDuration(0);
    setRecordingState('idle');
    setShowAnswer(mode === 'training'); // Show answer in training mode
    setAudioBlob(null);
    setIsPlayingAudio(false);
  }, [mode]);

  // Play recorded audio
  const playRecording = useCallback(() => {
    if (!audioBlob) return;
    
    try {
      // Stop any currently playing audio and clean up previous URL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => {
        setIsPlayingAudio(true);
        console.log('🔊 Playing recorded audio');
      };
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        console.log('✅ Audio playback finished');
      };
      
      audio.onerror = (e) => {
        setIsPlayingAudio(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        console.error('❌ Audio playback error:', e);
        toast({
          title: "Playback Error",
          description: "Failed to play recording",
          variant: "destructive",
        });
      };
      
      audio.play().catch(err => {
        setIsPlayingAudio(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        console.error('❌ Audio play() rejected:', err);
        toast({
          title: "Playback Error",
          description: "Failed to play recording",
          variant: "destructive",
        });
      });
    } catch (err) {
      console.error('❌ Failed to play audio:', err);
      toast({
        title: "Playback Error",
        description: "Failed to play recording",
        variant: "destructive",
      });
    }
  }, [audioBlob]);

  // Stop audio playback
  const stopAudioPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  }, []);

  // Navigate to next question
  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetForNewQuestion();
    } else {
      setLocation('/');
    }
  }, [currentIndex, questions.length, resetForNewQuestion, setLocation]);

  // Navigate to previous question
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      resetForNewQuestion();
    }
  }, [currentIndex, resetForNewQuestion]);

  // Try again
  const tryAgain = useCallback(() => {
    resetForNewQuestion();
  }, [resetForNewQuestion]);

  // Toggle mode
  const toggleMode = useCallback(() => {
    const newMode = mode === 'training' ? 'interview' : 'training';
    setMode(newMode);
    setShowAnswer(newMode === 'training');
  }, [mode]);

  // Set initial answer visibility based on mode
  useEffect(() => {
    setShowAnswer(mode === 'training');
  }, [mode, currentIndex]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--gh-canvas)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--gh-accent-fg)]/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-3 border-[var(--gh-accent-fg)] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[var(--gh-fg-muted)]">Loading questions...</p>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--gh-canvas)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-[var(--gh-canvas-inset)] flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-[var(--gh-fg-subtle)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--gh-fg)] mb-2">No Questions Available</h2>
          <p className="text-[var(--gh-fg-muted)] mb-6">Subscribe to channels to access practice questions</p>
          <button
            onClick={() => setLocation('/channels')}
            className="px-6 py-3 bg-[var(--gh-success-emphasis)] text-[var(--gh-fg-on-emphasis)] rounded-xl font-semibold hover:bg-[var(--gh-success-fg)] transition-colors"
          >
            Browse Channels
          </button>
        </div>
      </div>
    );
  }

  // Browser not supported
  if (!isSpeechRecognitionSupported) {
    return (
      <div className="min-h-screen bg-[var(--gh-canvas)] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-[var(--gh-fg)] mb-3">Browser Not Supported</h1>
          <p className="text-[var(--gh-fg-muted)] mb-6">
            Voice practice requires the Web Speech API. Please use Chrome, Edge, or Safari.
          </p>
          <button
            onClick={() => setLocation('/')}
            className="px-6 py-3 bg-[var(--gh-success-emphasis)] text-[var(--gh-fg-on-emphasis)] font-medium rounded-xl hover:bg-[var(--gh-success-fg)] transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <>
      <SEOHead
        title="Voice Practice | Code Reels"
        description="Practice answering interview questions with voice recording and feedback"
        canonical="https://open-interview.github.io/voice-practice"
      />

      <DesktopSidebarWrapper>
        <div className="min-h-screen bg-[var(--gh-canvas)] text-[var(--gh-fg)]">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-[var(--gh-border)] bg-[var(--gh-canvas)]/95 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLocation('/')}
                  className="p-1.5 hover:bg-[var(--gh-canvas-subtle)] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--gh-danger-emphasis)] to-[var(--gh-danger-fg)] flex items-center justify-center">
                    <Mic className="w-4 h-4 text-[var(--gh-fg-on-emphasis)]" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-[var(--gh-fg)] text-sm">Voice Practice</h1>
                    <p className="text-[10px] text-[var(--gh-fg-muted)]">
                      Q{currentIndex + 1}/{questions.length}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mode Toggle */}
              <button
                onClick={toggleMode}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'interview'
                    ? 'bg-[var(--gh-danger-fg)]/20 text-[var(--gh-danger-fg)] border border-[var(--gh-danger-fg)]/30'
                    : 'bg-[var(--gh-success-fg)]/20 text-[var(--gh-success-fg)] border border-[var(--gh-success-fg)]/30'
                }`}
              >
                {mode === 'interview' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {mode === 'interview' ? 'Interview Mode' : 'Training Mode'}
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="max-w-4xl mx-auto px-4 pb-2">
              <div className="h-1 bg-[var(--gh-canvas-inset)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[var(--gh-accent-fg)] to-[var(--gh-done-fg)] rounded-full"
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 py-6">
            {/* Debug Info Panel */}
            <div className="mb-4 p-4 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl">🔍</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[var(--gh-fg)] mb-2">System Status</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[var(--gh-fg-muted)]">
                    <div>Speech API: <span className={isSpeechRecognitionSupported ? 'text-[var(--gh-success-fg)]' : 'text-[var(--gh-danger-fg)]'}>{isSpeechRecognitionSupported ? '✓ Available' : '✗ Not Available'}</span></div>
                    <div>Recognition: <span className={recognitionReady ? 'text-[var(--gh-success-fg)]' : 'text-[var(--gh-attention-fg)]'}>{recognitionReady ? '✓ Ready' : '⏳ Initializing...'}</span></div>
                    <div>Protocol: <span className="text-[var(--gh-fg)]">{typeof window !== 'undefined' ? window.location.protocol : 'unknown'}</span></div>
                    <div>Recording: <span className="text-[var(--gh-fg)]">{recordingState}</span></div>
                  </div>
                </div>
              </div>
              
              {!isSpeechRecognitionSupported && (
                <div className="p-3 bg-[var(--gh-danger-fg)]/10 border border-[var(--gh-danger-fg)]/30 rounded-lg text-sm">
                  <div className="font-semibold text-[var(--gh-danger-fg)] mb-1">⚠️ Browser Not Supported</div>
                  <div className="text-[var(--gh-fg-muted)]">
                    Please use Chrome, Edge, or Safari. Firefox is not supported.
                  </div>
                </div>
              )}
              
              {isSpeechRecognitionSupported && !recognitionReady && (
                <div className="p-3 bg-[var(--gh-attention-fg)]/10 border border-[var(--gh-attention-fg)]/30 rounded-lg text-sm">
                  <div className="font-semibold text-[var(--gh-attention-fg)] mb-1">⏳ Initializing...</div>
                  <div className="text-[var(--gh-fg-muted)]">
                    Setting up speech recognition. If this takes too long, check console (F12).
                  </div>
                </div>
              )}
              
              {isSpeechRecognitionSupported && recognitionReady && (
                <div className="p-3 bg-[var(--gh-success-fg)]/10 border border-[var(--gh-success-fg)]/30 rounded-lg text-sm">
                  <div className="font-semibold text-[var(--gh-success-fg)] mb-1">✓ Ready to Record</div>
                  <div className="text-[var(--gh-fg-muted)]">
                    Click "Start Recording" and allow microphone access when prompted.
                  </div>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-[var(--gh-border)] text-xs text-[var(--gh-fg-subtle)]">
                💡 <strong>Troubleshooting:</strong> Open browser console (F12) to see detailed logs. 
                <a 
                  href="/test-speech-recognition.html" 
                  target="_blank"
                  className="ml-2 text-[var(--gh-accent-fg)] hover:underline"
                >
                  Run diagnostic test →
                </a>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Question Card */}
                <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2.5 rounded-xl bg-[var(--gh-accent-fg)]/10 flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-[var(--gh-accent-fg)]" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-[var(--gh-fg)] mb-2">{currentQuestion.question}</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          currentQuestion.difficulty === 'beginner' ? 'bg-[var(--gh-success-fg)]/20 text-[var(--gh-success-fg)]' :
                          currentQuestion.difficulty === 'intermediate' ? 'bg-[var(--gh-attention-fg)]/20 text-[var(--gh-attention-fg)]' :
                          'bg-[var(--gh-danger-fg)]/20 text-[var(--gh-danger-fg)]'
                        }`}>
                          {currentQuestion.difficulty}
                        </span>
                        <span className="text-[var(--gh-fg-subtle)]">•</span>
                        <span className="text-[var(--gh-fg-muted)]">{currentQuestion.channel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Answer Display */}
                  {showAnswer ? (
                    <div className="bg-[var(--gh-canvas)] rounded-xl p-5 border border-[var(--gh-border)]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-[var(--gh-success-fg)]" />
                          <span className="text-sm font-semibold text-[var(--gh-fg)]">
                            {mode === 'training' ? 'Answer to Read' : 'Ideal Answer'}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--gh-fg-subtle)] px-2 py-1 bg-[var(--gh-canvas-inset)] rounded-lg">
                          {targetWords} words
                        </span>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto momentum-scroll custom-scrollbar pr-2">
                        <p className="text-[var(--gh-fg)] text-[15px] leading-[1.7] whitespace-pre-wrap">
                          {currentQuestion.answer}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[var(--gh-canvas)] rounded-xl p-5 border border-[var(--gh-border)]">
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-2xl bg-[var(--gh-danger-fg)]/10 flex items-center justify-center mx-auto mb-4">
                            <EyeOff className="w-8 h-8 text-[var(--gh-danger-fg)]" />
                          </div>
                          <h3 className="text-lg font-semibold text-[var(--gh-fg)] mb-2">Answer Hidden</h3>
                          <p className="text-sm text-[var(--gh-fg-muted)] max-w-md">
                            Record your answer first. The ideal answer will be revealed after you finish.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recording Panel */}
                <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] p-6">
                  {/* Recording Status */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Mic className="w-5 h-5 text-[var(--gh-accent-fg)]" />
                      Record Your Answer
                    </h3>
                    {recordingState === 'recording' && (
                      <div className="flex items-center gap-2 text-sm text-[var(--gh-danger-fg)]">
                        <span className="w-2 h-2 bg-[var(--gh-danger-fg)] rounded-full animate-pulse" />
                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  {/* Transcript Display */}
                  {(recordingState !== 'idle' || transcript) && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[var(--gh-fg-muted)]">Your Response</span>
                        {audioBlob && recordingState === 'recorded' && (
                          <button
                            onClick={isPlayingAudio ? stopAudioPlayback : playRecording}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--gh-success-emphasis)] hover:bg-[var(--gh-success-fg)] text-[var(--gh-fg-on-emphasis)] rounded-lg transition-colors"
                          >
                            {isPlayingAudio ? (
                              <>
                                <Square className="w-3.5 h-3.5" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                Replay
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="p-4 bg-[var(--gh-canvas)] rounded-xl max-h-[300px] overflow-y-auto momentum-scroll custom-scrollbar border border-[var(--gh-border)]">
                        {transcript || interimTranscript ? (
                          <p className="text-sm text-[var(--gh-fg)] leading-relaxed whitespace-pre-wrap break-words">
                            {transcript}
                            <span className="text-[var(--gh-fg-subtle)]">{interimTranscript}</span>
                            {recordingState === 'recording' && <span className="animate-pulse text-[var(--gh-accent-fg)]">|</span>}
                          </p>
                        ) : (
                          <p className="text-sm text-[var(--gh-fg-subtle)] italic">
                            Start speaking... Your words will appear here.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Word Count */}
                  {transcript && (
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <span className="text-[var(--gh-fg-muted)]">Words spoken:</span>
                      <span className="font-semibold text-[var(--gh-fg)]">
                        {countWords(transcript)} / {targetWords}
                      </span>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-3">
                    {recordingState === 'idle' && (
                      <>
                        <button
                          onClick={startRecording}
                          disabled={!recognitionReady}
                          className="flex items-center gap-2 px-6 py-3 bg-[var(--gh-danger-emphasis)] text-[var(--gh-fg-on-emphasis)] font-semibold rounded-xl hover:bg-[var(--gh-danger-fg)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Mic className="w-5 h-5" />
                          Start Recording
                        </button>
                        {!recognitionReady && (
                          <span className="text-xs text-[var(--gh-fg-subtle)]">Initializing microphone...</span>
                        )}
                      </>
                    )}
                    
                    {recordingState === 'recording' && (
                      <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--gh-danger-emphasis)] text-[var(--gh-fg-on-emphasis)] font-semibold rounded-xl hover:bg-[var(--gh-danger-fg)] transition-all"
                      >
                        <Square className="w-5 h-5" />
                        Stop Recording
                      </button>
                    )}
                    
                    {recordingState === 'recorded' && (
                      <button
                        onClick={tryAgain}
                        className="flex items-center gap-2 px-5 py-3 border border-[var(--gh-border)] text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:border-[var(--gh-fg-muted)] rounded-xl transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                      </button>
                    )}
                  </div>
                </div>

                {/* Feedback */}
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--gh-success-fg)]/20 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-[var(--gh-success-fg)]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--gh-fg)]">{feedback.message}</h3>
                        <p className="text-sm text-[var(--gh-fg-muted)]">Recording completed</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-[var(--gh-canvas)] rounded-xl">
                        <div className="text-xs text-[var(--gh-fg-muted)] mb-1">Words</div>
                        <div className="text-lg font-bold text-[var(--gh-fg)]">
                          {feedback.wordsSpoken}
                          <span className="text-sm text-[var(--gh-fg-subtle)]">/{feedback.targetWords}</span>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-[var(--gh-canvas)] rounded-xl">
                        <div className="text-xs text-[var(--gh-fg-muted)] mb-1">Duration</div>
                        <div className="text-lg font-bold text-[var(--gh-fg)]">
                          {Math.floor(feedback.duration / 60)}:{(feedback.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-[var(--gh-canvas)] rounded-xl">
                        <div className="text-xs text-[var(--gh-fg-muted)] mb-1">Coverage</div>
                        <div className="text-lg font-bold text-[var(--gh-fg)]">
                          {Math.round((feedback.wordsSpoken / feedback.targetWords) * 100)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="flex gap-3">
                  <button
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    className="px-6 py-3 bg-[var(--gh-canvas-subtle)] hover:bg-[var(--gh-border)] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] border border-[var(--gh-border)]"
                  >
                    Previous
                  </button>
                  <button
                    onClick={goToNext}
                    className="flex-1 px-6 py-3 bg-[var(--gh-success-emphasis)] hover:bg-[var(--gh-success-fg)] text-[var(--gh-fg-on-emphasis)] rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </DesktopSidebarWrapper>
    </>
  );
}
