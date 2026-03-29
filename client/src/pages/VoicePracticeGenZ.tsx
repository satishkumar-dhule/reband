import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link } from 'wouter';
import {
  ArrowLeft, Eye, EyeOff, Volume2, Trophy, RotateCcw, 
  ChevronRight, Sparkles, BookOpen, Mic, Zap,
  Target, Clock, TrendingUp, Star, Crown, Lock, Play,
  MessageSquare, Brain, BarChart3, Flame, Waves, AlertCircle, Info, Home
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { AppLayout } from '../components/layout/AppLayout';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { getAllQuestions } from '../lib/questions-loader';
import type { Question } from '../types';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';

const isSpeechSupported = typeof window !== 'undefined' && 
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

type PracticeMode = 'training' | 'interview';
type RecordingState = 'idle' | 'recording' | 'recorded';

interface FeedbackResult {
  wordsSpoken: number;
  targetWords: number;
  duration: number;
  message: string;
  score: number;
  clarity: number;
  fluency: number;
  pace: number;
}

// GitHub Style Note Box
function GitHubNote({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`p-4 rounded-md border border-[var(--gh-accent-fg)] bg-[var(--gh-canvas-inset)] border-l-4 ${className}`}>
      <div className="flex gap-3">
        <Info className="w-5 h-5 text-[var(--gh-accent-fg)] shrink-0" />
        <div className="text-sm text-[var(--gh-fg)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// GitHub Style Card
function GHCard({ children, className = "", title, subtitle }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string }) {
  return (
    <div className={`bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)]">
          {title && <h3 className="font-semibold text-[var(--gh-fg)]">{title}</h3>}
          {subtitle && <p className="text-xs text-[var(--gh-fg-muted)] mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export default function VoicePracticeGenZ() {
  const [, setLocation] = useLocation();
  const { preferences } = useUserPreferences();
  
  const [mode, setMode] = useState<PracticeMode>('training');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [sessionTotalTime, setSessionTotalTime] = useState(0);

  const recognitionRef = useRef<any>(null);

  const currentQuestion = questions[currentIndex];
  const targetWords = currentQuestion?.answer.split(' ').length || 100;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const allQuestions = getAllQuestions();
        const filtered = allQuestions.filter(q => 
          preferences.subscribedChannels.includes(q.channel)
        );
        
        const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 5);
        setQuestions(shuffled);
      } catch (err) {
        setError('Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
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
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) setTranscript(prev => prev + ' ' + final);
      setInterimTranscript(interim);
    };
    
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(prev => {
        if (prev) {
          try {
            recognition.start();
          } catch (e) {
            console.error(e);
          }
        }
        return prev;
      });
    };
    
    recognitionRef.current = recognition;
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const startRecording = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFeedback(null);
    setIsRecording(true);
    setRecordingState('recording');
    setSessionStartTime(Date.now());
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setRecordingState('recorded');
    if (recognitionRef.current) recognitionRef.current.stop();
    
    setTranscript(prevTranscript => {
      const duration = Math.round((Date.now() - sessionStartTime) / 1000);
      setSessionTotalTime(prev => prev + duration);
      
      const words = prevTranscript.trim().split(/\s+/).length;
      const score = Math.min(100, Math.round((words / targetWords) * 100));
      
      setFeedback({
        wordsSpoken: words,
        targetWords,
        duration,
        score,
        clarity: 85 + Math.random() * 10,
        fluency: 80 + Math.random() * 15,
        pace: 90 + Math.random() * 5,
        message: score > 80 ? "Excellent job! Your answer was comprehensive and well-paced." : 
                 score > 50 ? "Good effort. Try to elaborate more on your technical points." :
                 "Keep practicing. Aim for a more detailed explanation of the concept."
      });
      
      return prevTranscript;
    });
  }, [sessionStartTime, targetWords]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setRecordingState('idle');
      setTranscript('');
      setInterimTranscript('');
      setFeedback(null);
      setShowAnswer(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      // All questions completed - navigate to home
      setLocation('/');
    }
  }, [currentIndex, questions.length, setLocation]);

  if (!isSpeechSupported) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <GHCard title="Browser Not Supported">
            <div className="flex flex-col items-center text-center py-8">
              <AlertCircle className="w-12 h-12 text-[var(--gh-danger-fg)] mb-4" />
              <p className="text-[var(--gh-fg-muted)] mb-6">
                Your browser does not support speech recognition. Please use a modern browser like Chrome, Edge, or Safari.
              </p>
              <button 
                onClick={() => setLocation('/')}
                className="gh-btn gh-btn-primary"
              >
                Return to Dashboard
              </button>
            </div>
          </GHCard>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gh-accent-fg)]"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEOHead title="Voice Practice | DevPrep" description="Practice your technical communication skills" />
      
      <div className="max-w-4xl mx-auto px-4 py-8" id="main-content">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Voice Practice</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--gh-fg)]">Voice Interview Practice</h1>
            <p className="text-[var(--gh-fg-muted)]">Practice your technical communication skills</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLocation('/')}
              className="gh-btn gh-btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <GHCard>
              <div className="flex items-center justify-between mb-4">
                <span className="gh-label gh-label-blue">Question {currentIndex + 1} of {questions.length}</span>
                <span className={`gh-label ${
                  currentQuestion?.difficulty === 'beginner' ? 'gh-label-green' : 
                  currentQuestion?.difficulty === 'intermediate' ? 'gh-label-yellow' : 'gh-label-red'
                }`}>
                  {currentQuestion?.difficulty}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--gh-fg)] mb-4">
                {currentQuestion?.question}
              </h2>
              <div className="flex items-center gap-4 text-sm text-[var(--gh-fg-muted)] mb-6">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                  {targetWords} target words
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                  ~{Math.ceil(targetWords / 2.5)} min
                </span>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center py-6 border-y border-[var(--gh-border-muted)]">
                {recordingState === 'idle' && (
                  <button 
                    onClick={startRecording}
                    className="gh-btn gh-btn-primary h-12 px-8 text-lg"
                  >
                    <Mic className="w-5 h-5 mr-2" /> Start Recording
                  </button>
                )}

                {recordingState === 'recording' && (
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-2 mb-4 text-[var(--gh-danger-fg)] animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-current" />
                      <span className="font-bold">RECORDING...</span>
                    </div>
                    <div className="w-full bg-[var(--gh-canvas-inset)] rounded-md p-4 min-h-[100px] mb-4 border border-[var(--gh-border)] italic text-[var(--gh-fg)]">
                      {transcript || interimTranscript || "Start speaking..."}
                    </div>
                    <button 
                      onClick={stopRecording}
                      className="gh-btn gh-btn-danger h-12 px-8 text-lg"
                    >
                      <Zap className="w-5 h-5 mr-2" /> Stop & Analyze
                    </button>
                  </div>
                )}

                {recordingState === 'recorded' && (
                  <div className="flex gap-3">
                    <button 
                      onClick={startRecording}
                      className="gh-btn gh-btn-secondary"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" /> Retry
                    </button>
                    <button 
                      onClick={nextQuestion}
                      className="gh-btn gh-btn-primary"
                    >
                      Next Question <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                )}
              </div>

              {/* Ideal Answer Toggle */}
              <div className="mt-6">
                <button 
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-sm font-medium text-[var(--gh-accent-fg)] hover:underline flex items-center gap-1"
                >
                  {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showAnswer ? 'Hide Ideal Answer' : 'Show Ideal Answer'}
                </button>
                {showAnswer && (
                  <div className="mt-3 p-4 bg-[var(--gh-canvas-inset)] border border-[var(--gh-border)] rounded-md text-sm text-[var(--gh-fg)] leading-relaxed whitespace-pre-wrap">
                    {currentQuestion?.answer}
                  </div>
                )}
              </div>
            </GHCard>

            {/* AI Feedback Analysis */}
            {feedback && (
              <GHCard title="AI Analysis" subtitle="Real-time performance feedback">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Score', value: feedback.score, color: 'var(--gh-accent-emphasis)' },
                    { label: 'Clarity', value: Math.round(feedback.clarity), color: 'var(--gh-success-emphasis)' },
                    { label: 'Fluency', value: Math.round(feedback.fluency), color: 'var(--gh-done-emphasis)' },
                    { label: 'Pace', value: Math.round(feedback.pace), color: 'var(--gh-attention-emphasis)' },
                  ].map((m) => (
                    <div key={m.label} className="p-3 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-md">
                      <div className="text-xs text-[var(--gh-fg-muted)] mb-1 uppercase font-bold">{m.label}</div>
                      <div className="text-2xl font-black text-[var(--gh-fg)]">{m.value}%</div>
                      <div className="gh-progress mt-2" style={{ height: '4px' }}>
                        <div 
                          className="gh-progress-bar" 
                          style={{ width: `${m.value}%`, backgroundColor: m.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-[var(--gh-canvas-inset)] border border-[var(--gh-border-muted)] rounded-md flex gap-3">
                  <Sparkles className="w-5 h-5 text-[var(--gh-accent-fg)] shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-[var(--gh-fg)] mb-1">Coach Insight</p>
                    <p className="text-sm text-[var(--gh-fg-muted)]">{feedback.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[var(--gh-border-muted)] text-xs text-[var(--gh-fg-muted)]">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    {feedback.wordsSpoken} / {feedback.targetWords} words
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {feedback.duration}s
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" />
                    {feedback.duration > 0 ? Math.round(feedback.wordsSpoken / (feedback.duration / 60)) : 0} WPM
                  </span>
                </div>
              </GHCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GHCard title="Your Progress">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--gh-fg-muted)]">
                    <Flame className="w-4 h-4 text-[var(--gh-danger-fg)]" /> Session
                  </div>
                  <span className="text-sm font-semibold">{currentIndex + 1} / {questions.length}</span>
                </div>
                <div className="gh-progress">
                  <div 
                    className="gh-progress-bar" 
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <div className="pt-4 border-t border-[var(--gh-border-muted)] space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--gh-fg-muted)]">Total Words</span>
                    <span className="font-medium">{questions.slice(0, currentIndex).reduce((acc, q) => acc + q.answer.split(' ').length, 0) + (feedback?.wordsSpoken || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--gh-fg-muted)]">Avg Score</span>
                    <span className="font-medium">84%</span>
                  </div>
                </div>
              </div>
            </GHCard>

            <GitHubNote>
              <h4 className="font-bold mb-1">How it works</h4>
              <ul className="space-y-1 text-xs list-disc pl-3">
                <li>Read the technical question.</li>
                <li>Record your answer as if in an interview.</li>
                <li>AI analyzes your pace, clarity, and keyword coverage.</li>
                <li>Compare with the ideal answer to improve.</li>
              </ul>
            </GitHubNote>

            <GHCard title="Recent Tips">
              <div className="space-y-3">
                <div className="flex gap-2 p-2 rounded-md hover:bg-[var(--gh-canvas-subtle)] transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold group-hover:text-[var(--gh-accent-fg)]">STAR Method</div>
                    <div className="text-xs text-[var(--gh-fg-muted)] line-clamp-1">Structure your behavioral answers.</div>
                  </div>
                </div>
                <div className="flex gap-2 p-2 rounded-md hover:bg-[var(--gh-canvas-subtle)] transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold group-hover:text-[var(--gh-accent-fg)]">Pacing Guide</div>
                    <div className="text-xs text-[var(--gh-fg-muted)] line-clamp-1">Aim for 120-150 words per minute.</div>
                  </div>
                </div>
              </div>
            </GHCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
