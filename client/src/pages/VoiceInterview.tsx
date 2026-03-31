/**
 * Voice Interview Practice Page - Redesigned
 * Modern GitHub-inspired dark theme with polished UI
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Play, Square, RotateCcw, Home, ChevronRight,
  CheckCircle, XCircle, AlertCircle, Volume2, Loader2, Sparkles,
  ThumbsUp, ThumbsDown, Minus, Target, MessageSquare, Coins, Edit3,
  SkipForward, ExternalLink, Shuffle, ChevronLeft, MoreHorizontal, User,
  BarChart3, Brain, Lightbulb, Zap, Award
} from 'lucide-react';
import { Button, IconButton } from '@/components/unified/Button';
import { Textarea } from '@/components/ui/textarea';
import { SEOHead } from '../components/SEOHead';
import { getAllQuestionsAsync } from '../lib/questions-loader';
import { useCredits } from '../context/CreditsContext';
import { useAchievementContext } from '../context/AchievementContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { CreditsDisplay } from '../components/CreditsDisplay';
import { ListenButton } from '../components/ListenButton';
import { evaluateVoiceAnswer, type EvaluationResult } from '../lib/voice-evaluation';
import { DesktopSidebarWrapper } from '../components/layout/DesktopSidebarWrapper';
import { QuestionHistoryIcon } from '../components/unified/QuestionHistory';
import { useSpeechRecognition, isSpeechRecognitionSupported } from '../hooks/use-speech-recognition';
import type { Question } from '../types';

interface InterviewerComments {
  skip: string[];
  shuffle: string[];
  quick_answer: string[];
  long_pause: string[];
  retry: string[];
  good_score: string[];
  bad_score: string[];
  first_question: string[];
  last_question: string[];
  idle: string[];
}

type InterviewState = 'loading' | 'ready' | 'recording' | 'editing' | 'processing' | 'evaluated';

function getRandomComment(comments: string[]): string {
  if (!comments || comments.length === 0) return '';
  return comments[Math.floor(Math.random() * comments.length)];
}

function getQuestionType(channel: string): 'technical' | 'behavioral' | 'system-design' {
  if (channel === 'behavioral' || channel === 'engineering-management') return 'behavioral';
  if (channel === 'system-design') return 'system-design';
  return 'technical';
}

export default function VoiceInterview() {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<InterviewState>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [earnedCredits, setEarnedCredits] = useState<{ total: number; bonus: number } | null>(null);
  const [interviewerComment, setInterviewerComment] = useState<string | null>(null);
  const [comments, setComments] = useState<InterviewerComments | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [sessionId, setSessionId] = useState<string>('voice-session-state');
  const [showAnswer, setShowAnswer] = useState(false); // Hide answer until after recording
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { onVoiceInterview, config } = useCredits();
  const { trackEvent } = useAchievementContext();
  const { preferences } = useUserPreferences();

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    fetch('/data/interviewer-comments.json')
      .then(res => res.ok ? res.json() : null)
      .then(data => setComments(data))
      .catch(() => setComments(null));
  }, []);

  const showComment = useCallback((category: keyof InterviewerComments) => {
    if (!comments || !comments[category]) return;
    if (commentTimeoutRef.current) clearTimeout(commentTimeoutRef.current);
    const comment = getRandomComment(comments[category]);
    setInterviewerComment(comment);
    commentTimeoutRef.current = setTimeout(() => setInterviewerComment(null), 4000);
  }, [comments]);

  useEffect(() => {
    async function loadQuestions() {
      try {
        // Check for saved session first
        const savedData = localStorage.getItem(sessionId);
        if (savedData) {
          try {
            const sessionData = JSON.parse(savedData);
            if (sessionData.questions && sessionData.questions.length > 0) {
              setQuestions(sessionData.questions);
              setCurrentIndex(sessionData.currentIndex || 0);
              setState('ready');
              return;
            }
          } catch (e) {
            console.error('Invalid session data:', e);
            localStorage.removeItem(sessionId);
          }
        }

        // Load new questions
        const allQuestions = await getAllQuestionsAsync();
        const subscribedChannelIds = preferences.subscribedChannels;
        const suitable = allQuestions.filter((q: Question) => {
          if (!subscribedChannelIds.includes(q.channel)) return false;
          if (q.voiceSuitable === false) return false;
          if (q.voiceSuitable === true && q.voiceKeywords && q.voiceKeywords.length > 0) return true;
          return ['behavioral', 'system-design', 'sre', 'devops'].includes(q.channel) &&
            q.answer && q.answer.length > 100;
        });
        const shuffled = suitable.sort(() => Math.random() - 0.5).slice(0, 10);
        setQuestions(shuffled);
        setState('ready');
      } catch (err) {
        setError('Failed to load interview questions');
        console.error(err);
      }
    }
    loadQuestions();
  }, [preferences.subscribedChannels, sessionId]);

  useEffect(() => {
    if (state === 'ready' && currentIndex === 0 && questions.length > 0 && comments) {
      const timer = setTimeout(() => showComment('first_question'), 500);
      return () => clearTimeout(timer);
    }
  }, [state, currentIndex, questions.length, comments, showComment]);

  const {
    transcript: speechTranscript,
    interimTranscript: speechInterim,
    isListening: speechIsListening,
    start: startRecognition,
    stop: stopRecognition,
    reset: resetRecognition,
    isSupported: speechSupported
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    lang: 'en-US',
    autoRestart: true,
    onError: (error) => {
      console.error('Speech recognition error:', error);
      if (error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access and try again.');
        setState('ready');
      } else if (error === 'no-speech') {
        console.log('No speech detected, continuing...');
      } else {
        setError(`Speech recognition error: ${error}`);
      }
    }
  });

  // Sync hook transcript with local state
  useEffect(() => {
    if (speechTranscript) {
      setTranscript(speechTranscript);
    }
  }, [speechTranscript]);

  useEffect(() => {
    if (speechInterim) {
      setInterimTranscript(speechInterim);
    }
  }, [speechInterim]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (commentTimeoutRef.current) clearTimeout(commentTimeoutRef.current);
    };
  }, [state]);

  const startRecording = useCallback(() => {
    if (!speechSupported) return;
    resetRecognition();
    setEvaluation(null);
    setError(null);
    try {
      startRecognition();
      setState('recording');
    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.');
    }
  }, [speechSupported, resetRecognition, startRecognition]);

  const stopRecording = useCallback(() => {
    if (!speechSupported) return;
    stopRecognition();
    setState('editing');
  }, [speechSupported, stopRecognition]);

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || !transcript.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }
    setState('processing');
    setTimeout(() => {
      const questionType = getQuestionType(currentQuestion.channel);
      const result = evaluateVoiceAnswer(transcript, currentQuestion.answer, currentQuestion.voiceKeywords, questionType);
      setEvaluation(result);
      const credits = onVoiceInterview(result.verdict);
      setEarnedCredits({ total: credits.totalCredits, bonus: credits.bonusCredits });
      trackEvent('voice_interview_completed');
      if (result.score >= 60) showComment('good_score');
      else showComment('bad_score');
      setShowAnswer(true); // Reveal answer after evaluation
      setState('evaluated');
    }, 800);
  }, [transcript, currentQuestion, onVoiceInterview, showComment, trackEvent]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTranscript('');
      setInterimTranscript('');
      setEvaluation(null);
      setEarnedCredits(null);
      setShowAnswer(false); // Hide answer for next question
      setState('ready');
      saveSessionProgress();
    } else {
      // Clear session when completed
      localStorage.removeItem(sessionId);
    }
  }, [currentIndex, questions.length, sessionId]);

  const previousQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setTranscript('');
      setInterimTranscript('');
      setEvaluation(null);
      setEarnedCredits(null);
      setShowAnswer(false); // Hide answer for previous question
      setState('ready');
      setShowActions(false);
      saveSessionProgress();
    }
  }, [currentIndex]);

  const skipQuestion = useCallback(() => {
    if (state === 'recording') stopRecognition();
    if (currentIndex < questions.length - 1) {
      showComment('skip');
      setCurrentIndex(prev => prev + 1);
      setTranscript('');
      setInterimTranscript('');
      setEvaluation(null);
      setEarnedCredits(null);
      setShowAnswer(false); // Hide answer for skipped question
      setEarnedCredits(null);
      setState('ready');
      setShowActions(false);
      saveSessionProgress();
    }
  }, [currentIndex, questions.length, state, showComment, stopRecognition]);

  const saveSessionProgress = useCallback(() => {
    if (questions.length === 0) return;
    
    const sessionData = {
      questions,
      currentIndex,
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(sessionId, JSON.stringify(sessionData));
  }, [questions, currentIndex, sessionId]);

  const exitInterview = useCallback(() => {
    saveSessionProgress();
    setLocation('/');
  }, [saveSessionProgress, setLocation]);

  const goToOriginalQuestion = useCallback(() => {
    if (currentQuestion) setLocation(`/channel/${currentQuestion.channel}/${currentQuestion.id}`);
  }, [currentQuestion, setLocation]);

  const shuffleQuestions = useCallback(() => {
    showComment('shuffle');
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setTranscript('');
    setInterimTranscript('');
    setEvaluation(null);
    setEarnedCredits(null);
    setState('ready');
    setShowActions(false);
  }, [questions, showComment]);

  const retryQuestion = useCallback(() => {
    showComment('retry');
    setTranscript('');
    setInterimTranscript('');
    setEvaluation(null);
    setShowAnswer(false); // Hide answer when retrying
    setState('ready');
  }, [showComment]);



  // Unsupported browser
  if (!isSpeechRecognitionSupported) {
    return (
      <div className="min-h-screen bg-[var(--gh-canvas)] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-[var(--gh-attention-fg)]/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-[var(--gh-attention-fg)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--gh-fg)] mb-3">Browser Not Supported</h1>
          <p className="text-[var(--gh-fg-muted)] mb-6">
            Voice interview requires the Web Speech API. Please use Chrome, Edge, or Safari.
          </p>
          <Button variant="success" size="lg" onClick={() => setLocation('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Loading
  if (state === 'loading') {
    return (
      <div 
        className="min-h-screen bg-[var(--gh-canvas)] flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--gh-accent-fg)]/20 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--gh-accent-fg)]" />
          </div>
          <p className="text-[var(--gh-fg-muted)]">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--gh-canvas)] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-[var(--gh-fg-muted)]/20 flex items-center justify-center mx-auto mb-6">
            <MicOff className="w-10 h-10 text-[var(--gh-fg-muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--gh-fg)] mb-3">No questions available</h1>
          <p className="text-[var(--gh-fg-muted)] mb-6">We don't have any voice interview questions for this channel yet.</p>
          <Button variant="success" size="lg" onClick={() => setLocation('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentQuestion) {
    return (
      <div className="min-h-screen bg-[var(--gh-canvas)] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-[var(--gh-danger-fg)]/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-[var(--gh-danger-fg)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--gh-fg)] mb-3">Error</h1>
          <p className="text-[var(--gh-fg-muted)] mb-6">{error}</p>
          <Button variant="success" size="lg" onClick={() => setLocation('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <>
      <SEOHead
        title="Voice Interview Practice | Code Reels"
        description="Practice answering interview questions out loud with AI-powered feedback"
        canonical="https://open-interview.github.io/voice-interview"
      />

      <DesktopSidebarWrapper>
      {/* iPhone 13 FIX: Ensure content fits within viewport with safe areas */}
      <div className="min-h-screen bg-[var(--gh-canvas)] text-[var(--gh-fg)] overflow-x-hidden w-full">
        {/* Header - COMPACT */}
        <header className="sticky top-0 z-50 border-b border-[var(--gh-border)] bg-[var(--gh-canvas)]/95 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-3 h-14 flex items-center justify-between w-full" style={{ maxWidth: '100vw' }}>
            <div className="flex items-center gap-3">
              <IconButton
                icon={<Home className="w-4 h-4" />}
                onClick={exitInterview}
                aria-label="Exit and save progress"
                variant="ghost"
                size="sm"
              />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--gh-danger-emphasis)] to-[var(--gh-danger-fg)] flex items-center justify-center">
                  <Mic className="w-4 h-4 text-[var(--gh-fg-on-emphasis)]" />
                </div>
                <div>
                  <h1 className="font-semibold text-[var(--gh-fg)] text-sm">Voice Interview</h1>
                  <p className="text-[10px] text-[var(--gh-fg-muted)]">
                    Q{currentIndex + 1}/{questions.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Target className="w-3.5 h-3.5" />}
                onClick={() => setLocation('/voice-session')}
                className="hidden sm:flex"
              >
                Sessions
              </Button>
              <CreditsDisplay compact onClick={() => setLocation('/profile')} />
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-lg ${
                currentQuestion?.difficulty === 'beginner' ? 'bg-[var(--gh-success-fg)]/20 text-[var(--gh-success-fg)]' :
                currentQuestion?.difficulty === 'intermediate' ? 'bg-[var(--gh-attention-fg)]/20 text-[var(--gh-attention-fg)]' :
                'bg-[var(--gh-danger-fg)]/20 text-[var(--gh-danger-fg)]'
              }`}>
                {currentQuestion?.difficulty}
              </span>
              {currentQuestion?.id && (
                <QuestionHistoryIcon 
                  questionId={currentQuestion.id} 
                  questionType="question"
                  size="sm"
                />
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="max-w-4xl mx-auto px-3 pb-2 w-full" style={{ maxWidth: '100vw' }}>
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
        <main className="max-w-4xl mx-auto px-4 py-6 w-full overflow-x-hidden" style={{ maxWidth: '100vw' }}>

          {/* Question Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden mb-6 w-full"
            style={{ maxWidth: '100%' }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 rounded-xl bg-[var(--primary)]/10 flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <h2 className="text-lg font-medium text-[var(--foreground)] leading-relaxed">{currentQuestion?.question}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={goToOriginalQuestion}
                  className="flex-shrink-0 hidden sm:inline-flex"
                >
                  View Details
                </Button>
              </div>
              
              {/* Question Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted-foreground)] font-mono">Q{currentIndex + 1}/{questions.length}</span>
                  
                  {/* Actions Dropdown */}
                  <div className="relative">
                    <IconButton
                      icon={<MoreHorizontal className="w-4 h-4" />}
                      onClick={() => setShowActions(!showActions)}
                      aria-label="More actions"
                      variant="ghost"
                      size="sm"
                    />
                    
                    <AnimatePresence>
                      {showActions && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 top-full mt-1 bg-[var(--popover)] border border-[var(--border)] rounded-xl shadow-xl py-1 z-10 min-w-[160px]"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<ChevronLeft className="w-4 h-4" />}
                            onClick={previousQuestion}
                            disabled={currentIndex === 0}
                            className="w-full justify-start rounded-none"
                          >
                            Previous
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<SkipForward className="w-4 h-4" />}
                            onClick={skipQuestion}
                            disabled={currentIndex >= questions.length - 1}
                            className="w-full justify-start rounded-none"
                          >
                            Skip Question
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Shuffle className="w-4 h-4" />}
                            onClick={shuffleQuestions}
                            className="w-full justify-start rounded-none"
                          >
                            Shuffle All
                          </Button>
                          <div className="border-t border-[var(--gh-border)] my-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<ExternalLink className="w-4 h-4" />}
                            onClick={goToOriginalQuestion}
                            className="w-full justify-start rounded-none"
                          >
                            View Full Question
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <ListenButton text={currentQuestion?.question || ''} label="Listen" size="sm" />
                  {currentQuestion?.voiceKeywords && currentQuestion.voiceKeywords.length > 0 && (
                    <span className="text-xs text-[var(--gh-fg-subtle)]">
                      {currentQuestion.voiceKeywords.length} key terms
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mx-6 mb-6 p-4 bg-[var(--gh-danger-fg)]/10 border border-[var(--gh-danger-fg)]/30 rounded-xl text-[var(--gh-danger-fg)] text-sm">
                {error}
              </div>
            )}
          </motion.div>

          {/* Interviewer Comment */}
          <AnimatePresence>
            {interviewerComment && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mb-6 flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gh-done-fg)] to-[var(--gh-pink-emphasis)] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 p-4 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-2xl rounded-tl-none">
                  <p className="text-sm italic text-[var(--gh-fg-muted)]">"{interviewerComment}"</p>
                  <p className="text-[10px] text-[var(--gh-fg-subtle)] mt-2">— Your Interviewer</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recording Interface */}
          <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-overlay)] p-6 mb-6 w-full overflow-hidden" style={{ maxWidth: '100%' }}>
            {/* Recording Status */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {state === 'recording' && (
                <div className="flex items-center gap-3 px-4 py-2 bg-[var(--gh-danger-fg)]/10 border border-[var(--gh-danger-fg)]/30 rounded-full">
                  <span className="w-3 h-3 bg-[var(--gh-danger-fg)] rounded-full animate-pulse" />
                  <span className="text-sm text-[var(--gh-danger-fg)]">Recording</span>
                  {!transcript && !interimTranscript && (
                    <span className="text-xs text-[var(--gh-fg-subtle)]">(Listening...)</span>
                  )}
                </div>
              )}
              
              {state === 'editing' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--gh-attention-fg)]/10 border border-[var(--gh-attention-fg)]/30 rounded-full">
                  <Edit3 className="w-4 h-4 text-[var(--gh-attention-fg)]" />
                  <span className="text-sm text-[var(--gh-attention-fg)]">Edit your answer, then submit</span>
                </div>
              )}
              
              {state === 'processing' && (
                <div className="flex items-center gap-3 px-4 py-2 bg-[var(--gh-accent-fg)]/10 border border-[var(--gh-accent-fg)]/30 rounded-full">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--gh-accent-fg)]" />
                  <span className="text-sm text-[var(--gh-accent-fg)]">Analyzing your answer...</span>
                </div>
              )}
            </div>

            {/* Transcript Display */}
            {(state === 'recording' || state === 'editing' || transcript) && state !== 'evaluated' && (
              <div className="mb-6">
                {state === 'editing' ? (
                  <Textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Edit your transcribed answer here..."
                    className="min-h-[150px] max-h-[300px]"
                  />
                ) : (
                  <div className="p-4 bg-[var(--gh-canvas)] rounded-xl min-h-[120px] max-h-[200px] overflow-y-auto border border-[var(--gh-border)]">
                    {transcript || interimTranscript ? (
                      <p className="text-sm text-[var(--gh-fg)] whitespace-pre-wrap leading-relaxed">
                        {transcript}
                        <span className="text-[var(--gh-fg-subtle)]">{interimTranscript}</span>
                        {state === 'recording' && <span className="animate-pulse text-[var(--gh-accent-fg)]">|</span>}
                      </p>
                    ) : (
                      <p className="text-sm text-[var(--gh-fg-subtle)] italic">
                        {state === 'recording' 
                          ? 'Start speaking... Your words will appear here.'
                          : 'No transcript yet'}
                      </p>
                    )}
                  </div>
                )}
                {state === 'editing' && (
                  <p className="text-xs text-[var(--gh-fg-subtle)] mt-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[var(--gh-attention-fg)]" />
                    Fix any transcription errors before submitting
                  </p>
                )}
              </div>
            )}

            {/* Recording Controls */}
            <div className="flex items-center justify-center gap-4">
              {state === 'ready' && (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Mic className="w-5 h-5" />}
                  onClick={startRecording}
                  className="min-w-[200px]"
                >
                  Start Recording
                </Button>
              )}
              
              {state === 'recording' && (
                <Button
                  variant="danger"
                  size="lg"
                  icon={<Square className="w-5 h-5" />}
                  onClick={stopRecording}
                  className="min-w-[200px]"
                >
                  Stop Recording
                </Button>
              )}
              
              {state === 'editing' && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    icon={<RotateCcw className="w-4 h-4" />}
                    onClick={retryQuestion}
                  >
                    Re-record
                  </Button>
                  <Button
                    variant="success"
                    size="md"
                    icon={<CheckCircle className="w-5 h-5" />}
                    onClick={submitAnswer}
                    disabled={!transcript.trim()}
                  >
                    Submit Answer
                  </Button>
                </div>
              )}
              
              {state === 'evaluated' && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    icon={<RotateCcw className="w-4 h-4" />}
                    onClick={retryQuestion}
                  >
                    Try Again
                  </Button>
                  {currentIndex < questions.length - 1 && (
                    <Button
                      variant="success"
                      size="md"
                      icon={<ChevronRight className="w-4 h-4" />}
                      onClick={nextQuestion}
                    >
                      Next Question
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Evaluation Results */}
          <AnimatePresence>
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Credits Earned Banner */}
                {earnedCredits && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-gradient-to-r from-[var(--gh-attention-fg)]/20 to-[var(--gh-attention-fg)]/20 border border-[var(--gh-attention-fg)]/30 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--gh-attention-fg)]/20 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-[var(--gh-attention-fg)]" />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--gh-attention-fg)] text-lg">+{earnedCredits.total} Credits Earned!</div>
                        <div className="text-xs text-[var(--gh-fg-muted)]">
                          {earnedCredits.bonus > 0 
                            ? `${config.VOICE_ATTEMPT} base + ${earnedCredits.bonus} success bonus`
                            : 'Thanks for practicing!'}
                        </div>
                      </div>
                    </div>
                    <Award className="w-8 h-8 text-[var(--gh-attention-fg)]/50" />
                  </motion.div>
                )}

                {/* Verdict Card */}
                <div className={`p-6 rounded-2xl border ${getVerdictStyle(evaluation.verdict)}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getVerdictBgStyle(evaluation.verdict)}`}>
                        {getVerdictIcon(evaluation.verdict)}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-white">{getVerdictLabel(evaluation.verdict)}</h3>
                        <p className="text-sm text-[var(--gh-fg-muted)]">Interview Assessment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-white">{evaluation.score}%</div>
                      <div className="text-xs text-[var(--gh-fg-subtle)]">Overall Score</div>
                    </div>
                  </div>
                  
                  {/* Score Bar */}
                  <div className="h-2 bg-[var(--gh-canvas-subtle)] rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${evaluation.score}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${getScoreBarColor(evaluation.score)}`}
                    />
                  </div>
                  
                  <p className="text-sm text-[var(--gh-fg-muted)] leading-relaxed">{evaluation.feedback}</p>
                </div>

                {/* Multi-Dimensional Scores */}
                {evaluation.scores && (
                  <div className="p-6 rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-overlay)]">
                    <h4 className="font-semibold text-white flex items-center gap-2 mb-5">
                      <BarChart3 className="w-5 h-5 text-[var(--gh-accent-fg)]" />
                      Detailed Analysis
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <ScoreDimension 
                        label="Technical" 
                        score={evaluation.scores.technical} 
                        icon={<Brain className="w-4 h-4" />}
                        description="Accuracy & depth"
                      />
                      <ScoreDimension 
                        label="Completeness" 
                        score={evaluation.scores.completeness} 
                        icon={<Target className="w-4 h-4" />}
                        description="Coverage of concepts"
                      />
                      <ScoreDimension 
                        label="Structure" 
                        score={evaluation.scores.structure} 
                        icon={<Lightbulb className="w-4 h-4" />}
                        description="Organization"
                      />
                      <ScoreDimension 
                        label="Communication" 
                        score={evaluation.scores.communication} 
                        icon={<MessageSquare className="w-4 h-4" />}
                        description="Clarity & fluency"
                      />
                    </div>
                    
                    {/* Structure Analysis */}
                    {evaluation.structureAnalysis && (
                      <div className="mt-5 pt-5 border-t border-[var(--gh-border)]">
                        <div className="flex flex-wrap gap-2">
                          {evaluation.structureAnalysis.hasIntroduction && (
                            <span className="px-3 py-1.5 text-xs bg-[var(--gh-success-emphasis)]/20 text-[var(--gh-success-fg)] rounded-lg font-medium">✓ Introduction</span>
                          )}
                          {evaluation.structureAnalysis.hasExamples && (
                            <span className="px-3 py-1.5 text-xs bg-[var(--gh-success-emphasis)]/20 text-[var(--gh-success-fg)] rounded-lg font-medium">✓ Examples</span>
                          )}
                          {evaluation.structureAnalysis.hasConclusion && (
                            <span className="px-3 py-1.5 text-xs bg-[var(--gh-success-emphasis)]/20 text-[var(--gh-success-fg)] rounded-lg font-medium">✓ Conclusion</span>
                          )}
                          {evaluation.structureAnalysis.usesSTAR && (
                            <span className="px-3 py-1.5 text-xs bg-[var(--gh-done-fg)]/20 text-[var(--gh-done-fg)] rounded-lg font-medium">⭐ STAR Method</span>
                          )}
                          {evaluation.fluencyMetrics && evaluation.fluencyMetrics.fillerWordCount > 3 && (
                            <span className="px-3 py-1.5 text-xs bg-[var(--gh-attention-fg)]/20 text-[var(--gh-attention-fg)] rounded-lg font-medium">
                              ⚠ {evaluation.fluencyMetrics.fillerWordCount} filler words
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Key Points */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Covered Points */}
                  <div className="p-5 rounded-2xl bg-[var(--gh-success-emphasis)]/10 border border-[var(--gh-success-emphasis)]/30">
                    <h4 className="font-semibold text-[var(--gh-success-fg)] flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5" />
                      Concepts Covered ({evaluation.keyPointsCovered.length})
                    </h4>
                    <ul className="space-y-2">
                      {evaluation.keyPointsCovered.map((point, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-[var(--gh-fg-muted)]">
                          <span className="text-[var(--gh-success-fg)] mt-0.5">✓</span>
                          <span>
                            {typeof point === 'object' && 'concept' in point 
                              ? `${point.concept}${point.confidence !== 'exact' ? ` (as "${point.matchedAs}")` : ''}`
                              : point}
                          </span>
                        </li>
                      ))}
                      {evaluation.keyPointsCovered.length === 0 && (
                        <li className="text-sm text-[var(--gh-fg-subtle)]">No key concepts identified</li>
                      )}
                    </ul>
                  </div>

                  {/* Missed Points */}
                  <div className="p-5 rounded-2xl bg-[var(--gh-danger-fg)]/10 border border-[var(--gh-danger-fg)]/30">
                    <h4 className="font-semibold text-[var(--gh-danger-fg)] flex items-center gap-2 mb-4">
                      <XCircle className="w-5 h-5" />
                      Concepts to Include ({evaluation.keyPointsMissed.length})
                    </h4>
                    <ul className="space-y-2">
                      {evaluation.keyPointsMissed.map((point, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-[var(--gh-fg-muted)]">
                          <span className="text-[var(--gh-danger-fg)] mt-0.5">✗</span>
                          <span>{point}</span>
                        </li>
                      ))}
                      {evaluation.keyPointsMissed.length === 0 && (
                        <li className="text-sm text-[var(--gh-fg-subtle)]">Great job covering all concepts!</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-overlay)]">
                    <h4 className="font-semibold text-white flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-[var(--gh-attention-fg)]" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-[var(--gh-fg-muted)] flex items-start gap-2">
                          <Zap className="w-4 h-4 text-[var(--gh-attention-fg)] flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-overlay)]">
                    <h4 className="font-semibold text-white flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-[var(--gh-accent-fg)]" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {evaluation.improvements.map((s, i) => (
                        <li key={i} className="text-sm text-[var(--gh-fg-muted)] flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-[var(--gh-accent-fg)] flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Ideal Answer Reference - Only show after answer is revealed */}
                {showAnswer && (
                  <details className="p-5 rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-canvas-overlay)] group">
                    <summary className="cursor-pointer font-semibold text-white flex items-center gap-2 list-none">
                      <Volume2 className="w-5 h-5 text-[var(--gh-done-fg)]" />
                      View Ideal Answer
                      <ChevronRight className="w-4 h-4 text-[var(--gh-fg-subtle)] ml-auto transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="mt-4 pt-4 border-t border-[var(--gh-border)] space-y-3">
                      <div className="flex justify-end">
                        <ListenButton text={currentQuestion?.answer || ''} label="Listen to Answer" size="sm" />
                      </div>
                      <div className="text-sm text-[var(--gh-fg-muted)] whitespace-pre-wrap leading-relaxed bg-[var(--gh-canvas)] p-4 rounded-xl">
                        {currentQuestion?.answer}
                      </div>
                    </div>
                  </details>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      </DesktopSidebarWrapper>
    </>
  );
}

// Score dimension component
function ScoreDimension({ label, score, icon, description }: { 
  label: string; score: number; icon: React.ReactNode; description: string;
}) {
  const getColor = (s: number) => {
    if (s >= 70) return 'text-[var(--gh-success-fg)]';
    if (s >= 50) return 'text-[var(--gh-attention-fg)]';
    if (s >= 30) return 'text-[var(--gh-attention-fg)]';
    return 'text-[var(--gh-danger-fg)]';
  };
  
  const getBgColor = (s: number) => {
    if (s >= 70) return 'bg-[var(--gh-success-emphasis)]';
    if (s >= 50) return 'bg-[var(--gh-attention-fg)]';
    if (s >= 30) return 'bg-[var(--gh-attention-fg)]';
    return 'bg-[var(--gh-danger-fg)]';
  };
  
  return (
    <div className="text-center p-4 rounded-xl bg-[var(--gh-canvas)] border border-[var(--gh-border)]">
      <div className={`flex items-center justify-center gap-1.5 mb-2 ${getColor(score)}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{score}%</div>
      <div className="h-1.5 bg-[var(--gh-canvas-subtle)] rounded-full overflow-hidden mt-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`h-full ${getBgColor(score)}`}
        />
      </div>
      <div className="text-[10px] text-[var(--gh-fg-subtle)] mt-2">{description}</div>
    </div>
  );
}

// Helper functions
function getVerdictStyle(verdict: EvaluationResult['verdict']): string {
  switch (verdict) {
    case 'strong-hire': return 'bg-[var(--gh-success-emphasis)]/20 border-[var(--gh-success-emphasis)]/50';
    case 'hire': return 'bg-[var(--gh-success-fg)]/20 border-[var(--gh-success-fg)]/50';
    case 'lean-hire': return 'bg-[var(--gh-attention-fg)]/20 border-[var(--gh-attention-fg)]/50';
    case 'lean-no-hire': return 'bg-[var(--gh-attention-fg)]/20 border-[#f0883e]/50';
    case 'no-hire': return 'bg-[var(--gh-danger-fg)]/20 border-[var(--gh-danger-fg)]/50';
  }
}

function getVerdictBgStyle(verdict: EvaluationResult['verdict']): string {
  switch (verdict) {
    case 'strong-hire':
    case 'hire': return 'bg-[var(--gh-success-emphasis)]/30';
    case 'lean-hire': return 'bg-[var(--gh-attention-fg)]/30';
    case 'lean-no-hire':
    case 'no-hire': return 'bg-[var(--gh-danger-fg)]/30';
  }
}

function getVerdictIcon(verdict: EvaluationResult['verdict']) {
  switch (verdict) {
    case 'strong-hire':
    case 'hire': return <ThumbsUp className="w-7 h-7 text-[var(--gh-success-fg)]" />;
    case 'lean-hire': return <Minus className="w-7 h-7 text-[var(--gh-attention-fg)]" />;
    case 'lean-no-hire':
    case 'no-hire': return <ThumbsDown className="w-7 h-7 text-[var(--gh-danger-fg)]" />;
  }
}

function getVerdictLabel(verdict: EvaluationResult['verdict']): string {
  switch (verdict) {
    case 'strong-hire': return 'Strong Hire';
    case 'hire': return 'Hire';
    case 'lean-hire': return 'Lean Hire';
    case 'lean-no-hire': return 'Lean No Hire';
    case 'no-hire': return 'No Hire';
  }
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-gradient-to-r from-[var(--gh-success-emphasis)] to-[var(--gh-success-fg)]';
  if (score >= 55) return 'bg-gradient-to-r from-[var(--gh-success-fg)] to-[var(--gh-attention-fg)]';
  if (score >= 40) return 'bg-gradient-to-r from-[var(--gh-attention-fg)] to-[var(--gh-attention-fg)]';
  if (score >= 25) return 'bg-gradient-to-r from-[var(--gh-attention-fg)] to-[var(--gh-danger-fg)]';
  return 'bg-[var(--gh-danger-fg)]';
}
