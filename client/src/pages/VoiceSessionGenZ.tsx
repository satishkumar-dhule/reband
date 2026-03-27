/**
 * Voice Session GenZ - Gen Z themed voice interview sessions
 * Redesigned with animated gradient, glassmorphism, real-time feedback
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Target, Play, CheckCircle, XCircle, AlertCircle,
  Loader2, RotateCcw, ArrowRight, Mic, Zap, Crown, Star,
  Clock, TrendingUp, Award, Lock, ChevronLeft, Volume2, Trophy
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { getAllQuestionsAsync } from '../lib/questions-loader';
import { useCredits } from '../context/CreditsContext';
import { useAchievementContext } from '../context/AchievementContext';
import { useUserPreferences } from '../hooks/use-user-preferences';
import { CreditsDisplay } from '../components/CreditsDisplay';
import { AppLayout } from '../components/layout/AppLayout';
import { GenZCard, GenZButton, GenZMicrophone, GenZProgress } from '../components/genz';
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

type PageState = 'loading' | 'select' | 'intro' | 'recording' | 'editing' | 'feedback' | 'results';

const isSpeechSupported = typeof window !== 'undefined' && 
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

function AnimatedGradientHero() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-conic from-primary/20 via-transparent to-cyan-500/20 animate-spin-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-conic from-pink-500/20 via-transparent to-amber-400/20 animate-spin-slow-reverse" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,background_70%)]" />
    </div>
  );
}

function LiveAudioVisualizer({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-20">
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-gradient-to-t from-primary to-cyan-400 rounded-full"
          animate={isActive ? {
            height: [8, Math.random() * 50 + 20, 8],
          } : { height: 8 }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            delay: i * 0.04,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

function PremiumProCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-primary/10 border border-amber-500/30 p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-primary/5" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
        
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-black text-amber-400">PRO FEATURES</h3>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">VIP</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Unlock AI-powered feedback, detailed analytics, and custom session creation.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>AI Feedback</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Custom Sessions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Priority Support</span>
              </div>
            </div>
            <GenZButton className="w-full bg-gradient-to-r from-amber-400 to-pink-500 border-0 text-black hover:opacity-90">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to PRO
            </GenZButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SessionCard({ session, onClick }: { session: VoiceSession; onClick: () => void }) {
  return (
    <motion.button
      key={session.id}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl text-left hover:border-primary/50 hover:bg-primary/10 transition-all group backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {session.topic}
              </h3>
              <p className="text-sm text-muted-foreground">{session.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
              session.difficulty === 'beginner' ? 'bg-emerald-500/20 text-primary border border-primary/30' :
              session.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-pink-500/20 text-pink-500 border border-pink-500/30'
            }`}>
              {session.difficulty.toUpperCase()}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="w-3 h-3" />
              {session.totalQuestions} questions
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              ~{session.estimatedMinutes} min
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all rotate-180" />
        </div>
      </div>
    </motion.button>
  );
}

export default function VoiceSessionGenZ() {
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
  const [liveWPM, setLiveWPM] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { onVoiceInterview } = useCredits();
  const { trackEvent } = useAchievementContext();

  const currentQuestion = sessionState ? getCurrentQuestion(sessionState) : null;

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

  useEffect(() => {
    if (!isSpeechSupported) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setTranscript(prev => prev + final);
        const words = (transcript + final).trim().split(/\s+/).length;
        const elapsed = sessionDuration / 60;
        if (elapsed > 0) setLiveWPM(Math.round(words / elapsed));
      }
      setInterimTranscript(interim);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied.');
        setPageState('editing');
      }
    };
    
    recognition.onend = () => {
      if (pageState === 'recording') {
        try { recognition.start(); } catch (e) { }
      }
    };
    
    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch (e) { } };
  }, [pageState, transcript, sessionDuration]);

  useEffect(() => {
    if (pageState === 'recording') {
      sessionTimerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    }
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
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
    setSessionDuration(0);
    setPageState('intro');
  }, [allQuestions]);

  const beginQuestions = useCallback(() => {
    if (!sessionState) return;
    const updated = beginSession(sessionState);
    setSessionState(updated);
    saveSessionState(updated);
    setTranscript('');
    setInterimTranscript('');
    setLiveWPM(0);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setPageState('recording');
      } catch (err) {
        setError('Failed to start recording.');
        setPageState('editing');
      }
    }
  }, [sessionState]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setPageState('editing');
  }, []);

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
      trackEvent({ type: 'voice_interview_completed', timestamp: new Date().toISOString() });
      setPageState('results');
    } else {
      const updated = nextQuestion(sessionState);
      setSessionState(updated);
      saveSessionState(updated);
      setTranscript('');
      setInterimTranscript('');
      setLiveWPM(0);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setPageState('recording');
        } catch (err) {
          setPageState('editing');
        }
      }
    }
  }, [sessionState, onVoiceInterview, trackEvent]);

  const retryQuestion = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setLiveWPM(0);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setPageState('recording');
      } catch (err) {
        setPageState('editing');
      }
    }
  }, []);

  const exitSession = useCallback(() => {
    clearSessionState();
    setSessionState(null);
    setSessionResult(null);
    setPageState('select');
  }, []);

  if (!isSpeechSupported) {
    return (
      <AppLayout fullWidth hideNav>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Browser Not Supported</h1>
            <p className="text-muted-foreground mb-6">Voice sessions require the Web Speech API. Use Chrome, Edge, or Safari.</p>
            <GenZButton onClick={() => setLocation('/')}>Go Home</GenZButton>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (pageState === 'loading') {
    return (
      <AppLayout fullWidth hideNav>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
            <p className="text-muted-foreground">Loading sessions…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (pageState === 'select') {
    const byChannel: Record<string, VoiceSession[]> = {};
    for (const session of availableSessions) {
      if (!byChannel[session.channel]) byChannel[session.channel] = [];
      byChannel[session.channel].push(session);
    }

    return (
      <>
        <SEOHead title="Voice Sessions | Code Reels" description="Practice interview topics with focused question sessions" />
        <AppLayout fullWidth hideNav>
          <div className="min-h-screen bg-background text-foreground">
            {/* Header with Animated Gradient */}
            <header className="relative border-b border-border/50">
              <AnimatedGradientHero />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <div className="relative max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setLocation('/')} aria-label="Go to home" className="p-2 hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm">
                      <Home className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25">
                        <Mic className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-black text-foreground">Voice Sessions</h1>
                        <p className="text-sm text-muted-foreground">{availableSessions.length} sessions available</p>
                      </div>
                    </div>
                  </div>
                  <CreditsDisplay compact onClick={() => setLocation('/profile')} />
                </div>
              </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
              {availableSessions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">No Sessions Available</h2>
                  <p className="text-muted-foreground mb-6">Subscribe to channels to unlock voice sessions.</p>
                  <GenZButton onClick={() => setLocation('/channels')}>
                    Subscribe to Channels
                  </GenZButton>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(byChannel).map(([channel, sessions]) => (
                    <motion.div
                      key={channel}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-cyan-500" />
                        {channel.replace(/-/g, ' ')}
                      </h2>
                      <div className="space-y-3">
                        {sessions.map((session) => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            onClick={() => startNewSession(session)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Premium PRO Features */}
              <PremiumProCard />
            </main>
          </div>
        </AppLayout>
      </>
    );
  }

  if (pageState === 'intro' && sessionState) {
    return (
      <>
        <SEOHead title={`${sessionState.session.topic} | Voice Session`} description="Voice interview session practice" />
        <AppLayout fullWidth hideNav>
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg w-full"
            >
              <GenZCard className="p-8 text-center relative overflow-hidden" neonBorder>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
                    <Target className="w-10 h-10 text-black" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">{sessionState.session.topic}</h1>
                  <p className="text-muted-foreground mb-6">
                    {sessionState.questions.length} questions • ~{sessionState.session.estimatedMinutes} min
                  </p>
                  
                  <div className="bg-background/50 rounded-xl p-4 mb-6 text-left border border-border">
                    <p className="text-sm text-muted-foreground">{sessionState.session.description}</p>
                  </div>
                  
                  {/* Session Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <Target className="w-5 h-5 text-primary mx-auto mb-2" />
                      <div className="text-lg font-black text-foreground">{sessionState.session.totalQuestions}</div>
                      <div className="text-xs text-muted-foreground">Questions</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                      <div className="text-lg font-black text-foreground">~{sessionState.session.estimatedMinutes}</div>
                      <div className="text-xs text-muted-foreground">Minutes</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                      <div className="text-lg font-black text-foreground">{sessionState.session.difficulty}</div>
                      <div className="text-xs text-muted-foreground">Level</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <GenZButton variant="secondary" onClick={exitSession} className="flex-1 backdrop-blur-sm">
                      Back
                    </GenZButton>
                    <GenZButton variant="primary" onClick={beginQuestions} className="flex-1">
                      <Play className="w-5 h-5 mr-2" />
                      Start Session
                    </GenZButton>
                  </div>
                </div>
              </GenZCard>
            </motion.div>
          </div>
        </AppLayout>
      </>
    );
  }

  if ((pageState === 'recording' || pageState === 'editing') && sessionState && currentQuestion) {
    const progress = ((sessionState.currentQuestionIndex + 1) / sessionState.questions.length) * 100;
    
    return (
      <>
        <SEOHead title={`Q${sessionState.currentQuestionIndex + 1} | ${sessionState.session.topic}`} description="Answer the interview question" />
        <AppLayout fullWidth hideNav>
          <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
              <div className="max-w-4xl mx-auto px-4">
                <div className="h-16 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={exitSession} aria-label="Go to home" className="p-2 hover:bg-muted rounded-xl transition-colors">
                      <Home className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                      <h1 className="font-semibold text-foreground text-sm">{sessionState.session.topic}</h1>
                      <p className="text-xs text-muted-foreground">Question {sessionState.currentQuestionIndex + 1} of {sessionState.questions.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-mono text-cyan-400">{sessionDuration}s</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                      <Mic className="w-4 h-4 text-primary" />
                      <span className="text-sm font-mono text-primary">{liveWPM} WPM</span>
                    </div>
                  </div>
                </div>
                <div className="pb-3">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary via-cyan-400 to-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
              <GenZCard className="p-6 mb-6 relative overflow-hidden" neonBorder>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded-lg">
                      Q{sessionState.currentQuestionIndex + 1}
                    </span>
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                      currentQuestion.difficulty === 'beginner' ? 'bg-emerald-500/20 text-primary' :
                      currentQuestion.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-pink-500/20 text-pink-500'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                  <h2 className="text-lg font-medium text-foreground leading-relaxed">{currentQuestion.question}</h2>
                  {error && (
                    <div className="mt-4 p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl text-pink-500 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </GenZCard>

              <GenZCard className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-pink-500/5" />
                
                <div className="relative flex flex-col items-center gap-6">
                  {/* Live Audio Visualizer */}
                  <LiveAudioVisualizer isActive={pageState === 'recording'} />

                  {/* Real-time Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-foreground">{transcript.trim().split(/\s+/).filter(w => w).length}</div>
                      <div className="text-xs text-muted-foreground">Words</div>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div className="text-center">
                      <div className="text-2xl font-black text-cyan-400">{liveWPM}</div>
                      <div className="text-xs text-muted-foreground">WPM</div>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div className="text-center">
                      <div className="text-2xl font-black text-primary">{sessionDuration}s</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                  </div>

                  <GenZMicrophone
                    isRecording={pageState === 'recording'}
                    onStart={() => {}}
                    onStop={stopRecording}
                  />

                  <div className="w-full">
                    {pageState === 'editing' ? (
                      <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        className="w-full p-4 bg-background/50 border border-border rounded-xl min-h-[120px] text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm"
                        placeholder="Edit your answer..."
                        aria-label="Your answer"
                      />
                    ) : (
                      <div className="p-4 bg-background/50 rounded-xl min-h-[100px] border border-border backdrop-blur-sm">
                        {transcript || interimTranscript ? (
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {transcript}
                            <span className="text-muted-foreground">{interimTranscript}</span>
                          </p>
                        ) : (
                          <div className="flex items-center justify-center h-full min-h-[60px]">
                            <p className="text-sm text-muted-foreground italic text-center">
                              🎤 Start speaking... Your words will appear here in real-time.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 w-full">
                    {pageState === 'editing' && (
                      <>
                        <GenZButton variant="secondary" onClick={retryQuestion} className="flex-1">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Re-record
                        </GenZButton>
                        <GenZButton variant="primary" onClick={submitCurrentAnswer} disabled={!transcript.trim()} className="flex-1">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Submit
                        </GenZButton>
                      </>
                    )}
                  </div>
                </div>
              </GenZCard>
            </main>
          </div>
        </AppLayout>
      </>
    );
  }

  if (pageState === 'feedback' && sessionState) {
    const lastAnswer = sessionState.answers[sessionState.answers.length - 1];
    const isLastQuestion = sessionState.currentQuestionIndex >= sessionState.questions.length - 1;
    
    return (
      <>
        <SEOHead title="Feedback | Voice Session" description="Review your answer feedback" />
        <AppLayout fullWidth hideNav>
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg w-full"
            >
              <GenZCard className="p-8 relative overflow-hidden" neonBorder>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5" />
                
                <div className="relative text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      lastAnswer.isCorrect ? 'bg-gradient-to-br from-primary to-cyan-500' : 'bg-gradient-to-br from-pink-500 to-amber-400'
                    }`}>
                    {lastAnswer.isCorrect 
                      ? <CheckCircle className="w-12 h-12 text-black" /> 
                      : <XCircle className="w-12 h-12 text-black" />
                    }
                  </motion.div>
                  
                  <div className="text-5xl font-black text-foreground mb-2">{lastAnswer.score}%</div>
                  <p className={`text-lg font-semibold mb-6 ${
                    lastAnswer.isCorrect ? 'text-primary' : 'text-pink-500'
                  }`}>
                    {lastAnswer.isCorrect ? 'Great answer!' : 'Needs improvement'}
                  </p>
                </div>

                <div className="mt-6 bg-background/50 rounded-xl p-4 border border-border">
                  <p className="text-sm text-muted-foreground">{lastAnswer.feedback}</p>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Session Progress</span>
                    <span className="text-foreground font-semibold">{sessionState.currentQuestionIndex + 1}/{sessionState.questions.length}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${((sessionState.currentQuestionIndex + 1) / sessionState.questions.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <GenZButton variant="primary" onClick={goToNextQuestion} className="w-full">
                    {isLastQuestion ? 'View Results' : 'Next Question'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GenZButton>
                </div>
              </GenZCard>
            </motion.div>
          </div>
        </AppLayout>
      </>
    );
  }

  if (pageState === 'results' && sessionResult) {
    return (
      <>
        <SEOHead title="Session Complete | Voice Session" description="View your session results" />
        <AppLayout fullWidth hideNav>
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg w-full"
            >
              <GenZCard className="p-8 relative overflow-hidden" neonBorder>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-amber-500/10" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
                
                <div className="relative text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/25"
                  >
                    <Trophy className="w-12 h-12 text-black" />
                  </motion.div>
                  
                  <div className="text-6xl font-black bg-gradient-to-r from-primary via-cyan-400 to-amber-400 bg-clip-text text-transparent mb-2">
                    {sessionResult.overallScore}%
                  </div>
                  <p className="text-xl font-semibold text-muted-foreground mb-8">Session Complete!</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-xl border border-primary/30">
                      <div className="text-3xl font-black text-primary">{sessionResult.answers.filter(a => a.isCorrect).length}</div>
                      <div className="text-sm text-muted-foreground">Correct</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-pink-500/20 to-amber-500/20 rounded-xl border border-pink-500/30">
                      <div className="text-3xl font-black text-pink-500">{sessionResult.answers.filter(a => !a.isCorrect).length}</div>
                      <div className="text-sm text-muted-foreground">To Improve</div>
                    </div>
                  </div>

                  {/* Session Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <Target className="w-5 h-5 text-primary mx-auto mb-2" />
                      <div className="text-lg font-black text-foreground">{sessionResult.answers.length}</div>
                      <div className="text-xs text-muted-foreground">Questions</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                      <div className="text-lg font-black text-foreground">{Math.floor(0 / 60)}:{(0 % 60).toString().padStart(2, '0')}</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                      <div className="text-lg font-black text-foreground">{Math.round(0)}%</div>
                      <div className="text-xs text-muted-foreground">Avg Score</div>
                    </div>
                  </div>

                  <GenZButton variant="primary" onClick={() => setLocation('/')} className="w-full">
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
                  </GenZButton>
                </div>
              </GenZCard>
            </motion.div>
          </div>
        </AppLayout>
      </>
    );
  }

  return null;
}
