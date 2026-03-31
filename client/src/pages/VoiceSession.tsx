/**
 * Voice Interview Session Page - Redesigned
 * Modern GitHub-inspired dark theme with polished UI
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Mic, Square, RotateCcw, Home, ChevronRight,
  CheckCircle, XCircle, AlertCircle, Loader2,
  Target, MessageSquare, Edit3,
  BarChart3, Sparkles, Play, ArrowRight, BookOpen, Volume2,
  Zap, Award, Trophy
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Textarea } from '@/components/ui/textarea';
import { Button, IconButton, ButtonGroup } from '@/components/unified/Button';
import { getAllQuestionsAsync } from '../lib/questions-loader';
import { useCredits } from '../context/CreditsContext';
import { useAchievementContext } from '../context/AchievementContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useSpeechRecognition, isSpeechRecognitionSupported } from '../hooks/use-speech-recognition';
import { CreditsDisplay } from '../components/CreditsDisplay';
import { ListenButton } from '../components/ListenButton';
import { DesktopSidebarWrapper } from '../components/layout/DesktopSidebarWrapper';
import { QuestionHistoryIcon } from '../components/unified/QuestionHistory';
import {
  type VoiceSession,
  type SessionState,
  type SessionResult,
  loadVoiceSessions,
  generateSessionsFromQuestions,
  buildSessionQuestions,
  startSession,
  beginSession,
  submitAnswer,
  nextQuestion,
  getCurrentQuestion,
  completeSession,
  saveSessionState,
  loadSessionState,
  clearSessionState,
  saveSessionToHistory
} from '../lib/voice-interview-session';
import type { Question } from '../types';

type PageState = 'loading' | 'select' | 'intro' | 'recording' | 'editing' | 'feedback' | 'practice' | 'results';

export default function VoiceSession() {
  const shouldReduceMotion = useReducedMotion();
  const [, setLocation] = useLocation();
  const { preferences } = useUserPreferences();
  
  const [pageState, setPageState] = useState<PageState>('loading');
  const [availableSessions, setAvailableSessions] = useState<VoiceSession[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [practiceTranscript, setPracticeTranscript] = useState('');
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { onVoiceInterview } = useCredits();
  const { trackEvent } = useAchievementContext();

  const currentQuestion = sessionState ? getCurrentQuestion(sessionState) : null;

  // Load sessions and questions
  useEffect(() => {
    async function loadData() {
      try {
        const questions = await getAllQuestionsAsync();
        setAllQuestions(questions);
        
        let sessions = await loadVoiceSessions();
        if (sessions.length === 0) {
          sessions = generateSessionsFromQuestions(questions);
        }
        
        const subscribedChannels = preferences.subscribedChannels;
        const filteredSessions = sessions.filter(s => subscribedChannels.includes(s.channel));
        setAvailableSessions(filteredSessions);
        
        const saved = loadSessionState();
        if (saved && saved.status !== 'completed') {
          setSessionState(saved);
          setPageState('intro');
          return;
        }
        
        setPageState('select');
      } catch (err) {
        setError('Failed to load sessions');
        console.error(err);
      }
    }
    loadData();
  }, [preferences.subscribedChannels]);

  // Use speech recognition hook
  const {
    transcript: hookTranscript,
    interimTranscript: hookInterim,
    isListening,
    start: startRecognition,
    stop: stopRecognition,
    reset: resetRecognition
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    lang: 'en-US',
    autoRestart: true,
    onFinal: (text) => {
      if (pageState === 'practice') {
        setPracticeTranscript(prev => prev + text + ' ');
      } else {
        setTranscript(prev => prev + text + ' ');
      }
    },
    onInterim: (text) => setInterimTranscript(text),
    onError: (error) => {
      if (error === 'not-allowed') {
        setError('Microphone access denied.');
        setPageState('select');
      } else if (error !== 'no-speech') {
        setError(`Speech recognition error: ${error}`);
      }
    }
  });

  // Recording timer removed - keeping only recording indicator
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pageState]);

  const startNewSession = useCallback((session: VoiceSession) => {
    const sessionQuestions = buildSessionQuestions(session, allQuestions);
    if (sessionQuestions.length < 3) {
      setError('Not enough questions available for this session');
      return;
    }
    const newState = startSession(session, sessionQuestions);
    setSessionState(newState);
    saveSessionState(newState);
    setPageState('intro');
  }, [allQuestions]);

  const beginQuestions = useCallback(() => {
    if (!sessionState) return;
    const updated = beginSession(sessionState);
    setSessionState(updated);
    saveSessionState(updated);
    setTranscript('');
    setInterimTranscript('');
    
    try {
      startRecognition();
      setPageState('recording');
    } catch (err) {
      setError('Failed to start recording.');
      setPageState('editing');
    }
  }, [sessionState, startRecognition]);

  const stopRecording = useCallback(() => {
    stopRecognition();
    setPageState('editing');
  }, [stopRecognition]);

  const submitCurrentAnswer = useCallback(() => {
    if (!sessionState || !transcript.trim()) {
      setError('Please provide an answer.');
      return;
    }
    const updated = submitAnswer(sessionState, transcript.trim());
    setSessionState(updated);
    saveSessionState(updated);
    setPageState('feedback');
  }, [sessionState, transcript]);

  const goToNextQuestion = useCallback(() => {
    if (!sessionState) return;
    
    if (sessionState.currentQuestionIndex >= sessionState.questions.length - 1) {
      const result = completeSession(sessionState);
      setSessionResult(result);
      saveSessionToHistory(result);
      clearSessionState();
      
      const verdict = result.overallScore >= 60 ? 'hire' : 'no-hire';
      onVoiceInterview(verdict);
      trackEvent('voice_interview_completed');
      setPageState('results');
    } else {
      const updated = nextQuestion(sessionState);
      setSessionState(updated);
      saveSessionState(updated);
      setTranscript('');
      setInterimTranscript('');
      
      try {
        startRecognition();
        setPageState('recording');
      } catch (err) {
        setPageState('editing');
      }
    }
  }, [sessionState, onVoiceInterview, trackEvent, startRecognition]);

  const retryQuestion = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    try {
      startRecognition();
      setPageState('recording');
    } catch (err) {
      setPageState('editing');
    }
  }, [startRecognition]);

  const exitSession = useCallback(() => {
    stopRecognition();
    clearSessionState();
    setSessionState(null);
    setSessionResult(null);
    setPageState('select');
  }, []);



  // Unsupported browser
  if (!isSpeechRecognitionSupported) {
    return (
      <div className="min-h-screen bg-[var(--gh-canvas)] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-[var(--gh-attention-fg)]/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-[var(--gh-attention-fg)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--gh-fg)] mb-3">Browser Not Supported</h1>
          <p className="text-[var(--gh-fg-muted)] mb-6">Voice sessions require the Web Speech API. Use Chrome, Edge, or Safari.</p>
          <Button onClick={() => setLocation('/')} variant="primary">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Loading
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--gh-canvas)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--gh-accent-fg)]/20 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--gh-accent-fg)]" />
          </div>
          <p className="text-[var(--gh-fg-muted)]">Loading sessions...</p>
        </div>
      </div>
    );
  }

  // Session selection
  if (pageState === 'select') {
    const byChannel: Record<string, VoiceSession[]> = {};
    for (const session of availableSessions) {
      if (!byChannel[session.channel]) byChannel[session.channel] = [];
      byChannel[session.channel].push(session);
    }

    return (
      <>
        <SEOHead title="Voice Sessions | Code Reels" description="Practice interview topics with focused question sessions" />
        <div className="min-h-screen bg-[var(--gh-canvas)] text-[var(--gh-fg)]">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-[var(--gh-border)] bg-[var(--gh-canvas)]/95 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <IconButton icon={<Home />} onClick={() => setLocation('/')} aria-label="Go home" size="sm" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gh-done-fg)] to-[var(--gh-danger-fg)] flex items-center justify-center">
                    <Target className="w-5 h-5 text-[var(--gh-fg-on-emphasis)]" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-[var(--gh-fg)]">Voice Sessions</h1>
                    <p className="text-xs text-[var(--gh-fg-muted)]">{availableSessions.length} sessions available</p>
                  </div>
                </div>
              </div>
              <CreditsDisplay compact onClick={() => setLocation('/profile')} />
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 py-6">
            {availableSessions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-[var(--gh-canvas-subtle)] flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-[var(--gh-fg-subtle)]" />
                </div>
                <h2 className="text-xl font-semibold text-[var(--gh-fg)] mb-2">No Sessions Available</h2>
                <p className="text-[var(--gh-fg-muted)] mb-6">Subscribe to channels to unlock voice sessions.</p>
                <Button onClick={() => setLocation('/channels')} variant="primary">
                  Subscribe to Channels
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(byChannel).map(([channel, sessions]) => (
                  <div key={channel}>
                    <h2 className="text-xs font-semibold text-[var(--gh-fg-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--gh-accent-fg)]" />
                      {channel.replace(/-/g, ' ')}
                    </h2>
                    <div className="grid gap-3">
                      {sessions.map((session) => (
                        <motion.button
                          key={session.id}
                          onClick={() => startNewSession(session)}
                          whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
                          whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
                          className="p-5 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-2xl text-left hover:border-[var(--gh-accent-fg)]/50 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-[var(--gh-fg)] group-hover:text-[var(--gh-accent-fg)] transition-colors mb-1">
                                {session.topic}
                              </h3>
                              <p className="text-sm text-[var(--gh-fg-muted)] mb-3">{session.description}</p>
                              <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                                  session.difficulty === 'beginner' ? 'bg-[var(--gh-success-fg)]/20 text-[var(--gh-success-fg)]' :
                                  session.difficulty === 'intermediate' ? 'bg-[var(--gh-attention-fg)]/20 text-[var(--gh-attention-fg)]' :
                                  'bg-[var(--gh-danger-fg)]/20 text-[var(--gh-danger-fg)]'
                                }`}>
                                  {session.difficulty}
                                </span>
                                <span className="text-xs text-[var(--gh-fg-subtle)] flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  {session.totalQuestions} questions
                                </span>
                                <span className="text-xs text-[var(--gh-fg-subtle)]">
                                  ~{session.estimatedMinutes} min
                                </span>
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-[var(--gh-canvas-subtle)] group-hover:bg-[var(--gh-accent-fg)]/20 transition-colors">
                              <ChevronRight className="w-5 h-5 text-[var(--gh-fg-subtle)] group-hover:text-[var(--gh-accent-fg)]" />
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </>
    );
  }


  // Session intro
  if (pageState === 'intro' && sessionState) {
    return (
      <>
        <SEOHead title={`${sessionState.session.topic} | Voice Session`} description="Voice interview session practice" />
        <div className="min-h-screen bg-[var(--gh-canvas)] text-[var(--gh-fg)] flex items-center justify-center p-4">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className="max-w-lg w-full"
          >
            <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--gh-done-fg)] to-[var(--gh-danger-fg)] flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-[var(--gh-fg-on-emphasis)]" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--gh-fg)] mb-2">{sessionState.session.topic}</h1>
                <p className="text-[var(--gh-fg-muted)] mb-6">
                  {sessionState.questions.length} questions • ~{sessionState.session.estimatedMinutes} min
                </p>
                
                <div className="bg-[var(--gh-canvas)] rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-[var(--gh-fg-muted)]">{sessionState.session.description}</p>
                </div>

                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3 text-sm text-[var(--gh-fg-muted)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--gh-success-fg)]/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-[var(--gh-success-fg)]" />
                    </div>
                    <span>Answer each question in 1-2 sentences</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--gh-fg-muted)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--gh-accent-fg)]/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                    </div>
                    <span>Use specific technical terms</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--gh-fg-muted)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--gh-done-fg)]/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[var(--gh-done-fg)]" />
                    </div>
                    <span>Get instant feedback after each answer</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[var(--gh-canvas)] border-t border-[var(--gh-border)] flex gap-3">
                <Button onClick={exitSession} variant="outline" fullWidth>
                  Back
                </Button>
                <Button onClick={beginQuestions} variant="success" fullWidth icon={<Play className="w-5 h-5" />}>
                  Start Session
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // Recording/Editing
  if ((pageState === 'recording' || pageState === 'editing') && sessionState && currentQuestion) {
    const progress = ((sessionState.currentQuestionIndex + 1) / sessionState.questions.length) * 100;
    
    return (
      <>
        <SEOHead title={`Q${sessionState.currentQuestionIndex + 1} | ${sessionState.session.topic}`} description="Answer the interview question" />
        <div className="min-h-screen bg-[var(--gh-canvas)] text-[var(--gh-fg)]">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-[var(--gh-border)] bg-[var(--gh-canvas)]/95 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4">
              <div className="h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <IconButton icon={<Home />} onClick={exitSession} aria-label="Exit session" size="sm" />
                  <div>
                    <h1 className="font-semibold text-[var(--gh-fg)] text-sm">{sessionState.session.topic}</h1>
                    <p className="text-xs text-[var(--gh-fg-muted)]">Question {sessionState.currentQuestionIndex + 1} of {sessionState.questions.length}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                  currentQuestion.difficulty === 'beginner' ? 'bg-[var(--gh-success-fg)]/20 text-[var(--gh-success-fg)]' :
                  currentQuestion.difficulty === 'intermediate' ? 'bg-[var(--gh-attention-fg)]/20 text-[var(--gh-attention-fg)]' :
                  'bg-[var(--gh-danger-fg)]/20 text-[var(--gh-danger-fg)]'
                }`}>
                  {currentQuestion.difficulty}
                </span>
                <QuestionHistoryIcon 
                  questionId={currentQuestion.id} 
                  questionType="question"
                  size="sm"
                />
              </div>
              <div className="pb-3">
                <div className="h-1.5 bg-[var(--gh-canvas-inset)] rounded-full overflow-hidden">
                  <motion.div
                    initial={shouldReduceMotion ? { width: `${progress}%` } : { width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-[var(--gh-done-fg)] to-[var(--gh-danger-fg)] rounded-full"
                  />
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 py-6">
            {/* Question */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] p-6 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[var(--gh-accent-fg)]/10 flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-[var(--gh-accent-fg)]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-[var(--gh-fg)] leading-relaxed">{currentQuestion.question}</h2>
                  <div className="flex items-center gap-3 mt-4">
                    <ListenButton text={currentQuestion.question} label="Listen" size="sm" />
                    <span className="text-xs text-[var(--gh-fg-subtle)]">{currentQuestion.criticalPoints.length} key points</span>
                  </div>
                </div>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-[var(--gh-danger-fg)]/10 border border-[var(--gh-danger-fg)]/30 rounded-xl text-[var(--gh-danger-fg)] text-sm">
                  {error}
                </div>
              )}
            </motion.div>

            {/* Recording Interface */}
            <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] p-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                {pageState === 'recording' && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-[var(--gh-danger-fg)]/10 border border-[var(--gh-danger-fg)]/30 rounded-full">
                    <span className="w-3 h-3 bg-[var(--gh-danger-fg)] rounded-full animate-pulse" />
                    <span className="text-sm text-[var(--gh-danger-fg)]">Recording</span>
                  </div>
                )}
                {pageState === 'editing' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--gh-attention-fg)]/10 border border-[var(--gh-attention-fg)]/30 rounded-full">
                    <Edit3 className="w-4 h-4 text-[var(--gh-attention-fg)]" />
                    <span className="text-sm text-[var(--gh-attention-fg)]">Edit, then submit</span>
                  </div>
                )}
              </div>

              {/* Transcript */}
              <div className="mb-6">
                {pageState === 'editing' ? (
                  <>
                    <label htmlFor="transcript" className="sr-only">
                      Edit your transcript
                    </label>
                    <textarea
                      id="transcript"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="w-full p-4 bg-[var(--gh-canvas)] border border-[var(--gh-attention-fg)]/30 rounded-md min-h-[100px] text-sm text-[var(--gh-fg)] resize-y focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gh-attention-fg)]/50"
                      placeholder="Edit your answer..."
                    />
                  </>
                ) : (
                  <div className="p-4 bg-[var(--gh-canvas)] rounded-xl min-h-[80px] border border-[var(--gh-border)]">
                    {transcript || interimTranscript ? (
                      <p className="text-sm text-[var(--gh-fg)] whitespace-pre-wrap">
                        {transcript}
                        <span className="text-[var(--gh-fg-subtle)]">{interimTranscript}</span>
                        {pageState === 'recording' && <span className="animate-pulse text-[var(--gh-accent-fg)]">|</span>}
                      </p>
                    ) : (
                      <p className="text-sm text-[var(--gh-fg-subtle)] italic">
                        {pageState === 'recording' 
                          ? 'Start speaking... Your words will appear here.'
                          : 'No transcript yet'}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-[var(--gh-fg-subtle)] mt-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[var(--gh-attention-fg)]" />
                  Keep it brief: 1-2 sentences with key terms
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {pageState === 'recording' && (
                  <Button onClick={stopRecording} variant="danger" size="lg" icon={<Square className="w-5 h-5" />}>
                    Stop
                  </Button>
                )}
                {pageState === 'editing' && (
                  <div className="flex gap-3">
                    <Button onClick={retryQuestion} variant="outline" icon={<RotateCcw className="w-4 h-4" />}>
                      Re-record
                    </Button>
                    <Button
                      onClick={submitCurrentAnswer}
                      disabled={!transcript.trim()}
                      variant="success"
                      icon={<CheckCircle className="w-5 h-5" />}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }


  // Feedback after answering
  if (pageState === 'feedback' && sessionState) {
    const lastAnswer = sessionState.answers[sessionState.answers.length - 1];
    const answeredQuestion = sessionState.questions[sessionState.currentQuestionIndex];
    const isLastQuestion = sessionState.currentQuestionIndex >= sessionState.questions.length - 1;
    
    const startPracticeMode = () => {
      setPracticeTranscript('');
      setInterimTranscript('');
      setPageState('practice');
      try { startRecognition(); } catch (e) { /* ignore */ }
    };
    
    return (
      <>
        <SEOHead title="Feedback | Voice Session" description="Review your answer feedback" />
        <div className="min-h-screen bg-[var(--gh-canvas)] text-[var(--gh-fg)] flex items-center justify-center p-4">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className="max-w-lg w-full"
          >
            <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] overflow-hidden">
              {/* Score Header */}
              <div className="p-8 text-center">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  lastAnswer.isCorrect ? 'bg-[var(--gh-success-fg)]/20' : 'bg-[var(--gh-danger-fg)]/20'
                }`}>
                  {lastAnswer.isCorrect 
                    ? <CheckCircle className="w-12 h-12 text-[var(--gh-done-fg)]" /> 
                    : <XCircle className="w-12 h-12 text-[var(--gh-danger-fg)]" />
                  }
                </div>
                <div className="text-4xl font-bold text-[var(--gh-fg)] mb-2">{lastAnswer.score}%</div>
                <p className={`text-sm font-medium ${lastAnswer.isCorrect ? 'text-[var(--gh-done-fg)]' : 'text-[var(--gh-danger-fg)]'}`}>
                  {lastAnswer.isCorrect ? 'Good answer!' : 'Needs improvement'}
                </p>
              </div>

              {/* Feedback Content */}
              <div className="px-6 pb-6 space-y-4">
                <div className="bg-[var(--gh-canvas)] rounded-xl p-4">
                  <p className="text-sm text-[var(--gh-fg-muted)]">{lastAnswer.feedback}</p>
                  <div className="mt-2 text-xs text-[var(--gh-fg-subtle)]">
                    Score: {lastAnswer.weightedScore}/{lastAnswer.maxPossibleScore} weighted points
                  </div>
                </div>

                {/* Critical Points */}
                <div className="space-y-3">
                  {lastAnswer.pointsCovered.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-[var(--gh-done-fg)] mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Covered
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {lastAnswer.pointsCovered.map((point, i) => (
                          <span key={i} className="px-2.5 py-1 text-xs bg-[var(--gh-success-fg)]/20 text-[var(--gh-done-fg)] rounded-lg font-medium flex items-center gap-1">
                            {point.phrase}
                            <span className="opacity-60">×{point.weight}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {lastAnswer.pointsMissed.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-[var(--gh-danger-fg)] mb-2 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Missed
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {lastAnswer.pointsMissed.map((point, i) => (
                          <span key={i} className="px-2.5 py-1 text-xs bg-[var(--gh-danger-fg)]/20 text-[var(--gh-danger-fg)] rounded-lg font-medium flex items-center gap-1">
                            {point.phrase}
                            <span className="opacity-60">×{point.weight}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Practice Mode CTA */}
                {answeredQuestion.idealAnswer && (
                  <div className="bg-[var(--gh-accent-fg)]/10 border border-[var(--gh-accent-fg)]/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[var(--gh-accent-fg)]/20">
                        <BookOpen className="w-5 h-5 text-[var(--gh-accent-fg)]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-[var(--gh-accent-fg)] mb-1">Practice the Ideal Answer</h4>
                        <p className="text-xs text-[var(--gh-fg-muted)] mb-3">
                          Read aloud to practice pronunciation and memorize key terms.
                        </p>
                        <Button onClick={startPracticeMode} variant="primary" size="sm" icon={<Mic className="w-3.5 h-3.5" />}>
                          Practice Reading Aloud
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 bg-[var(--gh-canvas)] border-t border-[var(--gh-border)] flex gap-3">
                <Button onClick={retryQuestion} variant="outline" fullWidth icon={<RotateCcw className="w-4 h-4" />}>
                  Retry
                </Button>
                <Button onClick={goToNextQuestion} variant="success" fullWidth icon={isLastQuestion ? <BarChart3 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />} iconPosition="right">
                  {isLastQuestion ? 'Results' : 'Next'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // Practice Mode
  if (pageState === 'practice' && sessionState) {
    const answeredQuestion = sessionState.questions[sessionState.currentQuestionIndex];
    const isLastQuestion = sessionState.currentQuestionIndex >= sessionState.questions.length - 1;
    
    const stopPractice = () => {
      stopRecognition();
      setPageState('feedback');
    };
    
    const finishPractice = () => {
      stopRecognition();
      setPracticeTranscript('');
      setInterimTranscript('');
      goToNextQuestion();
    };
    
    return (
      <>
        <SEOHead title="Practice Mode | Voice Session" description="Practice reading the ideal answer" />
        <div className="min-h-screen bg-[var(--gh-canvas)] text-[var(--gh-fg)]">
          <header className="sticky top-0 z-50 border-b border-[var(--gh-border)] bg-[var(--gh-canvas)]/95 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <IconButton onClick={stopPractice} icon={<ArrowRight className="w-5 h-5 rotate-180" />} aria-label="Go back" size="sm" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--gh-accent-fg)]/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[var(--gh-accent-fg)]" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-[var(--gh-fg)] text-sm">Practice Mode</h1>
                    <p className="text-xs text-[var(--gh-fg-muted)]">Read the ideal answer aloud</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-[var(--gh-danger-fg)]/10 border border-[var(--gh-danger-fg)]/30 rounded-full">
                <span className="w-3 h-3 bg-[var(--gh-danger-fg)] rounded-full animate-pulse" />
                <span className="text-sm text-[var(--gh-danger-fg)]">Recording</span>
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 py-6">
            {/* Ideal Answer */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className="rounded-2xl bg-[var(--gh-accent-fg)]/10 border border-[var(--gh-accent-fg)]/30 p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-[var(--gh-accent-fg)] flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Read This Aloud
                </h2>
                <ListenButton text={answeredQuestion.idealAnswer} label="Listen" size="sm" />
              </div>
              <p className="text-lg text-[var(--gh-fg)] leading-relaxed">{answeredQuestion.idealAnswer}</p>
              
              <div className="mt-4 pt-4 border-t border-[var(--gh-accent-fg)]/20">
                <p className="text-xs text-[var(--gh-fg-muted)] mb-2">Key points to emphasize:</p>
                <div className="flex flex-wrap gap-1.5">
                  {answeredQuestion.criticalPoints.map((point, i) => (
                    <span key={i} className={`px-2.5 py-1 text-xs rounded-lg font-medium flex items-center gap-1 ${
                      point.weight === 3 ? 'bg-[var(--gh-accent-fg)]/30 text-[var(--gh-accent-fg)]' :
                      point.weight === 2 ? 'bg-[var(--gh-accent-fg)]/20 text-[var(--gh-accent-fg)]' :
                      'bg-[var(--gh-accent-fg)]/10 text-[var(--gh-accent-fg)]/80'
                    }`}>
                      {point.phrase}
                      {point.weight > 1 && <span className="opacity-60">×{point.weight}</span>}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Your Recording */}
            <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] p-6 mb-6">
              <h3 className="text-sm font-medium text-[var(--gh-fg)] mb-4 flex items-center gap-2">
                <Mic className="w-4 h-4 text-[var(--gh-danger-fg)]" />
                Your Recording
              </h3>
              <div className="p-4 bg-[var(--gh-canvas)] rounded-xl min-h-[100px] border border-[var(--gh-border)]">
                <p className="text-sm text-[var(--gh-fg)] whitespace-pre-wrap">
                  {practiceTranscript}
                  <span className="text-[var(--gh-fg-subtle)]">{interimTranscript}</span>
                  <span className="animate-pulse text-[var(--gh-accent-fg)]">|</span>
                </p>
                {!practiceTranscript && !interimTranscript && (
                  <p className="text-[var(--gh-fg-subtle)] text-sm">Start reading the answer above...</p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <Button onClick={stopPractice} variant="outline" fullWidth icon={<Square className="w-4 h-4" />}>
                Back to Feedback
              </Button>
              <Button onClick={finishPractice} variant="success" fullWidth icon={isLastQuestion ? <BarChart3 className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}>
                {isLastQuestion ? 'Finish Session' : 'Done, Next Question'}
              </Button>
            </div>
          </main>
        </div>
      </>
    );
  }

  // Final results
  if (pageState === 'results' && sessionResult) {
    const getVerdictStyle = (verdict: string) => {
      switch (verdict) {
        case 'excellent': return { bg: 'bg-[var(--gh-success-fg)]/20', text: 'text-[var(--gh-done-fg)]', icon: '🌟' };
        case 'good': return { bg: 'bg-[var(--gh-accent-fg)]/20', text: 'text-[var(--gh-accent-fg)]', icon: '👍' };
        case 'needs-work': return { bg: 'bg-[var(--gh-attention-fg)]/20', text: 'text-[var(--gh-attention-fg)]', icon: '📚' };
        default: return { bg: 'bg-[var(--gh-danger-fg)]/20', text: 'text-[var(--gh-danger-fg)]', icon: '🔄' };
      }
    };
    
    const verdictStyle = getVerdictStyle(sessionResult.verdict);
    
    return (
      <>
        <SEOHead title="Results | Voice Session" description="Your session results and score" />
        <div className="min-h-screen bg-[var(--gh-canvas)] text-[var(--gh-fg)]">
          <header className="sticky top-0 z-50 border-b border-[var(--gh-border)] bg-[var(--gh-canvas)]/95 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--gh-attention-fg)]/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[var(--gh-attention-fg)]" />
                </div>
                <h1 className="font-semibold text-[var(--gh-fg)]">Session Complete</h1>
              </div>
              <CreditsDisplay compact onClick={() => setLocation('/profile')} />
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 py-6">
            {/* Overall Score */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : undefined}
              className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] p-8 mb-6 text-center"
            >
              <div className={`w-28 h-28 rounded-2xl ${verdictStyle.bg} flex items-center justify-center mx-auto mb-6`}>
                <span className={`text-5xl font-bold ${verdictStyle.text}`}>{sessionResult.overallScore}%</span>
              </div>
              
              <h2 className="text-2xl font-bold text-[var(--gh-fg)] mb-2">{sessionResult.topic}</h2>
              <p className={`text-lg font-medium ${verdictStyle.text} mb-4`}>
                {verdictStyle.icon} {sessionResult.verdict === 'excellent' ? 'Excellent!' :
                 sessionResult.verdict === 'good' ? 'Good Job!' :
                 sessionResult.verdict === 'needs-work' ? 'Keep Practicing' : 'Review Topic'}
              </p>
              <p className="text-sm text-[var(--gh-fg-muted)] max-w-md mx-auto">{sessionResult.summary}</p>
            </motion.div>

            {/* Question Breakdown */}
            <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] p-6 mb-6">
              <h3 className="font-semibold text-[var(--gh-fg)] mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--gh-accent-fg)]" />
                Question Breakdown
              </h3>
              <div className="space-y-3">
                {sessionResult.answers.map((answer, index) => (
                  <div key={answer.questionId} className="flex items-center justify-between p-4 bg-[var(--gh-canvas)] rounded-xl border border-[var(--gh-border)]">
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                        answer.isCorrect ? 'bg-[var(--gh-success-fg)]/20 text-[var(--gh-done-fg)]' : 'bg-[var(--gh-danger-fg)]/20 text-[var(--gh-danger-fg)]'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm text-[var(--gh-fg-muted)]">Question {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${answer.score >= 60 ? 'text-[var(--gh-done-fg)]' : 'text-[var(--gh-danger-fg)]'}`}>
                        {answer.score}%
                      </span>
                      {answer.isCorrect 
                        ? <CheckCircle className="w-5 h-5 text-[var(--gh-done-fg)]" /> 
                        : <XCircle className="w-5 h-5 text-[var(--gh-danger-fg)]" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {sessionResult.strengths.length > 0 && (
                <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] p-5">
                  <h4 className="font-semibold text-[var(--gh-done-fg)] mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {sessionResult.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-[var(--gh-fg-muted)] flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[var(--gh-done-fg)] flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {sessionResult.areasToImprove.length > 0 && (
                <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] p-5">
                  <h4 className="font-semibold text-[var(--gh-attention-fg)] mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" /> To Improve
                  </h4>
                  <ul className="space-y-2">
                    {sessionResult.areasToImprove.map((a, i) => (
                      <li key={i} className="text-sm text-[var(--gh-fg-muted)] flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-[var(--gh-attention-fg)] flex-shrink-0 mt-0.5" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={() => setLocation('/')} variant="outline" fullWidth icon={<Home className="w-4 h-4" />}>
                Home
              </Button>
              <Button onClick={exitSession} variant="success" fullWidth icon={<Target className="w-4 h-4" />}>
                New Session
              </Button>
            </div>
          </main>
        </div>
      </>
    );
  }

  return null;
}
