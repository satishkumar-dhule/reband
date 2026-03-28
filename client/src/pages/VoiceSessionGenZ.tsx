import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  Home, Target, Play, CheckCircle, XCircle, AlertCircle,
  Loader2, RotateCcw, ArrowRight, Mic, Zap, Crown, Star,
  Clock, TrendingUp, Award, Lock, ChevronLeft, Volume2, Trophy,
  Info, MessageSquare, Brain, BarChart3, ChevronRight, Share2, Bookmark
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { getAllQuestionsAsync } from '../lib/questions-loader';
import { useCredits } from '../context/CreditsContext';
import { useAchievementContext } from '../context/AchievementContext';
import { useUserPreferences } from '../hooks/use-user-preferences';
import { CreditsDisplay } from '../components/CreditsDisplay';
import { AppLayout } from '../components/layout/AppLayout';
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

// GitHub Style Card
function GHCard({ children, className = "", title, subtitle, footer }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, footer?: React.ReactNode }) {
  return (
    <div className={`bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-[var(--gh-fg)]">{title}</h3>}
            {subtitle && <p className="text-xs text-[var(--gh-fg-muted)] mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-[var(--gh-border-muted)] bg-[var(--gh-canvas-subtle)]">
          {footer}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, onClick }: { session: VoiceSession; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 border border-[var(--gh-border)] rounded-md hover:border-[var(--gh-accent-fg)] hover:bg-[var(--gh-canvas-subtle)] transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-[var(--gh-fg)] group-hover:text-[var(--gh-accent-fg)]">
              {session.topic}
            </h3>
            <span className={`gh-label ${
              session.difficulty === 'beginner' ? 'gh-label-green' : 
              session.difficulty === 'intermediate' ? 'gh-label-yellow' : 'gh-label-red'
            }`}>
              {session.difficulty}
            </span>
          </div>
          <p className="text-sm text-[var(--gh-fg-muted)] mb-3">{session.description}</p>
          <div className="flex items-center gap-4 text-xs text-[var(--gh-fg-subtle)]">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              {session.totalQuestions} questions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{session.estimatedMinutes} min
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[var(--gh-fg-subtle)] group-hover:text-[var(--gh-accent-fg)]" />
      </div>
    </div>
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

  const exitSession = useCallback(() => {
    clearSessionState();
    setSessionState(null);
    setSessionResult(null);
    setPageState('select');
  }, []);

  if (!isSpeechSupported) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto py-16 px-4 text-center">
          <GHCard title="Browser Not Supported">
            <div className="flex flex-col items-center py-8">
              <AlertCircle className="w-12 h-12 text-[var(--gh-danger-fg)] mb-4" />
              <p className="text-[var(--gh-fg-muted)] mb-6">Voice sessions require the Web Speech API. Please use Chrome, Edge, or Safari.</p>
              <button onClick={() => setLocation('/')} className="gh-btn gh-btn-primary">Return Home</button>
            </div>
          </GHCard>
        </div>
      </AppLayout>
    );
  }

  if (pageState === 'loading') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--gh-accent-fg)]" />
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
      <AppLayout>
        <SEOHead title="Voice Sessions | DevPrep" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-[var(--gh-accent-fg)] flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--gh-fg)]">Voice Sessions</h1>
                <p className="text-sm text-[var(--gh-fg-muted)]">{availableSessions.length} interview sessions available</p>
              </div>
            </div>
            <CreditsDisplay compact onClick={() => setLocation('/profile')} />
          </div>

          <div className="space-y-10">
            {availableSessions.length === 0 ? (
              <GHCard>
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-[var(--gh-fg-muted)] mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Sessions Available</h2>
                  <p className="text-[var(--gh-fg-muted)] mb-6">Subscribe to more channels to unlock focused voice sessions.</p>
                  <button onClick={() => setLocation('/channels')} className="gh-btn gh-btn-primary">Explore Channels</button>
                </div>
              </GHCard>
            ) : (
              Object.entries(byChannel).map(([channel, sessions]) => (
                <div key={channel}>
                  <h2 className="text-xs font-bold text-[var(--gh-fg-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--gh-accent-fg)]" />
                    {channel.replace(/-/g, ' ')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.map((session) => (
                      <SessionCard key={session.id} session={session} onClick={() => startNewSession(session)} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (pageState === 'intro' && sessionState) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <GHCard 
            title={sessionState.session.topic}
            subtitle={`${sessionState.questions.length} questions • ~${sessionState.session.estimatedMinutes} min`}
          >
            <div className="py-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--gh-canvas-inset)] border border-[var(--gh-border)] flex items-center justify-center mb-6">
                <Target className="w-10 h-10 text-[var(--gh-accent-fg)]" />
              </div>
              <p className="text-[var(--gh-fg-muted)] mb-8 leading-relaxed">
                {sessionState.session.description}
              </p>
              <div className="grid grid-cols-3 gap-4 w-full mb-8">
                <div className="p-4 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-md">
                  <div className="text-2xl font-bold">{sessionState.questions.length}</div>
                  <div className="text-xs text-[var(--gh-fg-muted)]">Tasks</div>
                </div>
                <div className="p-4 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-md">
                  <div className="text-2xl font-bold">{sessionState.session.estimatedMinutes}m</div>
                  <div className="text-xs text-[var(--gh-fg-muted)]">Time</div>
                </div>
                <div className="p-4 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-md">
                  <div className="text-2xl font-bold capitalize">{sessionState.session.difficulty[0]}</div>
                  <div className="text-xs text-[var(--gh-fg-muted)]">Level</div>
                </div>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={exitSession} className="gh-btn gh-btn-secondary flex-1 h-12">Cancel</button>
                <button onClick={beginQuestions} className="gh-btn gh-btn-primary flex-1 h-12">Start Interview</button>
              </div>
            </div>
          </GHCard>
        </div>
      </AppLayout>
    );
  }

  if ((pageState === 'recording' || pageState === 'editing') && currentQuestion) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <span className="gh-label gh-label-blue">Question {sessionState!.currentQuestionIndex + 1} / {sessionState!.questions.length}</span>
            <div className="text-sm font-mono text-[var(--gh-fg-muted)] flex items-center gap-2">
              <Clock className="w-4 h-4" /> {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <GHCard>
            <div className="py-6">
              <h2 className="text-2xl font-bold text-[var(--gh-fg)] mb-8 text-center leading-tight">
                {currentQuestion.question}
              </h2>

              <div className="flex flex-col items-center">
                {pageState === 'recording' ? (
                  <>
                    <div className="w-24 h-24 rounded-full bg-[var(--gh-danger-subtle)] border-4 border-[var(--gh-danger-emphasis)] flex items-center justify-center animate-pulse mb-8">
                      <Mic className="w-10 h-10 text-[var(--gh-danger-emphasis)]" />
                    </div>
                    <div className="w-full bg-[var(--gh-canvas-inset)] rounded-md p-6 min-h-[150px] mb-8 border border-[var(--gh-border)] text-lg text-[var(--gh-fg)] leading-relaxed italic text-center">
                      {transcript || interimTranscript || "Start speaking your answer..."}
                    </div>
                    <button 
                      onClick={stopRecording}
                      className="gh-btn gh-btn-danger h-14 px-10 text-xl font-bold"
                    >
                      <Zap className="w-5 h-5 mr-2" /> Stop Recording
                    </button>
                  </>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--gh-fg-muted)]">Your Transcript</h4>
                      <span className="text-xs text-[var(--gh-fg-subtle)]">{transcript.split(/\s+/).length} words</span>
                    </div>
                    <textarea 
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="w-full bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md p-4 min-h-[200px] text-[var(--gh-fg)] focus:outline-none focus:border-[var(--gh-accent-fg)] focus:ring-1 focus:ring-[var(--gh-accent-fg)] mb-8"
                    />
                    <div className="flex gap-4">
                      <button onClick={beginQuestions} className="gh-btn gh-btn-secondary flex-1 h-12">
                        <RotateCcw className="w-4 h-4 mr-2" /> Redo Recording
                      </button>
                      <button onClick={submitCurrentAnswer} className="gh-btn gh-btn-primary flex-1 h-12">
                        Submit Answer <ChevronRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GHCard>
        </div>
      </AppLayout>
    );
  }

  if (pageState === 'feedback' && currentQuestion) {
    const feedback = sessionState?.answers[sessionState.currentQuestionIndex]?.feedback;
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">Question Analysis</h1>
            <div className="flex gap-2">
              <button onClick={() => setLocation('/')} className="gh-btn gh-btn-secondary"><Share2 className="w-4 h-4 mr-1" /> Share</button>
              <button className="gh-btn gh-btn-secondary"><Bookmark className="w-4 h-4 mr-1" /> Save</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <GHCard title="Your Answer">
                <div className="p-4 bg-[var(--gh-canvas-inset)] rounded-md border border-[var(--gh-border-muted)] text-[var(--gh-fg)] italic leading-relaxed">
                  "{transcript}"
                </div>
              </GHCard>

              <GHCard title="Ideal Technical Answer">
                <div className="p-4 bg-[var(--gh-canvas-inset)] rounded-md border border-[var(--gh-border-muted)] text-[var(--gh-fg)] leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.answer}
                </div>
              </GHCard>
            </div>

            <div className="space-y-6">
              <GHCard title="AI Score">
                <div className="text-center py-4">
                  <div className="text-5xl font-black text-[var(--gh-success-fg)] mb-2">82%</div>
                  <div className="text-sm font-semibold uppercase tracking-widest text-[var(--gh-fg-muted)]">Pass Standard</div>
                </div>
                <div className="space-y-4 pt-4 border-t border-[var(--gh-border-muted)]">
                  {[
                    { label: 'Clarity', val: 88, color: 'var(--gh-success-emphasis)' },
                    { label: 'Keywords', val: 75, color: 'var(--gh-accent-emphasis)' },
                    { label: 'Tone', val: 92, color: 'var(--gh-done-emphasis)' },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>{m.label}</span>
                        <span>{m.val}%</span>
                      </div>
                      <div className="gh-progress h-2">
                        <div className="gh-progress-bar" style={{ width: `${m.val}%`, backgroundColor: m.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </GHCard>

              <button 
                onClick={goToNextQuestion}
                className="gh-btn gh-btn-primary w-full h-14 text-lg font-bold"
              >
                Continue to Next <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (pageState === 'results' && sessionResult) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <GHCard>
            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-full bg-[var(--gh-success-subtle)] border-4 border-[var(--gh-success-emphasis)] flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-[var(--gh-success-emphasis)]" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
              <p className="text-[var(--gh-fg-muted)] mb-10">You've successfully finished the focused session.</p>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="p-6 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-md">
                  <div className="text-4xl font-black text-[var(--gh-accent-fg)]">{sessionResult.overallScore}%</div>
                  <div className="text-xs font-bold text-[var(--gh-fg-muted)] uppercase tracking-wider mt-1">Average Score</div>
                </div>
                <div className="p-6 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-md">
                  <div className="text-4xl font-black text-[var(--gh-success-fg)]">{sessionResult.totalQuestions}</div>
                  <div className="text-xs font-bold text-[var(--gh-fg-muted)] uppercase tracking-wider mt-1">Answered</div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={exitSession} className="gh-btn gh-btn-secondary flex-1 h-12">Done</button>
                <button onClick={() => setLocation('/stats')} className="gh-btn gh-btn-primary flex-1 h-12">View Detailed Stats</button>
              </div>
            </div>
          </GHCard>
        </div>
      </AppLayout>
    );
  }

  return null;
}
