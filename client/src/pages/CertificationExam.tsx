/**
 * Certification Exam Practice - Gen Z Edition
 * Pure black, neon accents, immersive exam experience
 * Features: Timer, domain tracking, exam simulation mode
 */

import { useState, useEffect, useMemo, useCallback, useReducer, memo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getCertificationById,
  CertificationConfig 
} from '../lib/certifications-config';
import {
  getQuestionsForCertification,
  getExamConfig,
  generatePracticeSession,
  CertificationQuestion,
  CertificationDomain,
  CertificationExamConfig,
} from '../lib/certification-questions';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { useCredits } from '../context/CreditsContext';
import { SEOHead } from '../components/SEOHead';
import { Button, IconButton } from '@/components/unified/Button';
import {
  ArrowLeft, Award, Target, CheckCircle, XCircle,
  ChevronRight, ChevronLeft, Lightbulb, BarChart3,
  RotateCcw, Flag, BookOpen, Zap, Trophy, AlertCircle, Home, Clock,
  ChevronsLeft, ChevronsRight, LayoutList
} from 'lucide-react';
import { useUnifiedToast } from '../hooks/use-unified-toast';

type ExamMode = 'practice' | 'timed' | 'review';
type SessionState = 'setup' | 'active' | 'results';

interface AnswerRecord {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpent: number;
}

// ============================================
// EXAM STATE REDUCER - Batch updates for performance
// ============================================

interface ExamState {
  currentIndex: number;
  answers: AnswerRecord[];
  flaggedQuestions: Set<number>;
}

type ExamAction =
  | { type: 'SET_ANSWER'; payload: AnswerRecord }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'TOGGLE_FLAG'; payload: number }
  | { type: 'SET_QUESTIONS'; payload: CertificationQuestion[] }
  | { type: 'RESET' };

function examReducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case 'SET_ANSWER':
      return {
        ...state,
        answers: [...state.answers, action.payload],
      };
    case 'SET_CURRENT_INDEX':
      return {
        ...state,
        currentIndex: action.payload,
      };
    case 'TOGGLE_FLAG': {
      const newFlagged = new Set(state.flaggedQuestions);
      if (newFlagged.has(action.payload)) {
        newFlagged.delete(action.payload);
      } else {
        newFlagged.add(action.payload);
      }
      return {
        ...state,
        flaggedQuestions: newFlagged,
      };
    }
    case 'SET_QUESTIONS':
      return { ...state, answers: [], currentIndex: 0, flaggedQuestions: new Set() };
    case 'RESET':
      return { currentIndex: 0, answers: [], flaggedQuestions: new Set() };
    default:
      return state;
  }
}

// ============================================
// EXAM TIMER - Isolated Timer Component
// ============================================

interface ExamTimerProps {
  isActive: boolean;
  initialTime: number; // in seconds
  onTimeUp: () => void;
}

const ExamTimer = memo(function ExamTimer({ isActive, initialTime, onTimeUp }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Reset timer when initialTime changes
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  // Timer effect - only depends on isActive and onTimeUp to avoid unnecessary restarts
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const isLowTime = timeLeft <= 60;

  return (
    <span className={`font-mono text-sm ${isLowTime ? 'text-[var(--gh-danger-fg)] animate-pulse' : 'text-muted-foreground'}`}>
      {formatTime(timeLeft)}
    </span>
  );
});

// ============================================
// EXAM SIDEBAR - Memoized Question List
// ============================================

interface ExamSidebarProps {
  questions: CertificationQuestion[];
  currentIndex: number;
  answers: AnswerRecord[];
  flaggedQuestions: Set<number>;
  onGoToQuestion: (index: number) => void;
}

const ExamSidebar = memo(function ExamSidebar({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onGoToQuestion,
}: ExamSidebarProps) {
  return (
    <div className="space-y-2">
      {questions.map((_, i) => {
        const answer = answers.find(a => a.questionId === questions[i]?.id);
        const isCurrent = i === currentIndex;
        const isFlag = flaggedQuestions.has(i);

        let variant: 'primary' | 'secondary' | 'success' | 'danger' = 'secondary';
        if (isCurrent) variant = 'primary';
        else if (answer) variant = answer.isCorrect ? 'success' : 'danger';

        return (
          <button
            key={i}
            onClick={() => onGoToQuestion(i)}
            className={`w-full p-2 rounded-lg text-sm font-medium transition-all ${
              variant === 'primary' ? 'bg-primary text-primary-foreground' :
              variant === 'success' ? 'bg-[var(--gh-success-fg)]/10 text-[var(--gh-success-fg)]' :
              variant === 'danger' ? 'bg-[var(--gh-danger-fg)]/10 text-[var(--gh-danger-fg)]' :
              'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {i + 1}
            {isFlag && <Flag className="inline w-3 h-3 ml-1 text-yellow-500" />}
          </button>
        );
      })}
    </div>
  );
});

interface AnswerRecord {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpent: number;
}

export default function CertificationExam() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/certification/:id/exam');
  const certificationId = params?.id;

  const certification = certificationId ? getCertificationById(certificationId) : undefined;
  const examConfig = certificationId ? getExamConfig(certificationId) : undefined;
  const allQuestions = certificationId ? getQuestionsForCertification(certificationId) : [];

  // Session state
  const [sessionState, setSessionState] = useState<SessionState>('setup');
  const [examMode, setExamMode] = useState<ExamMode>('practice');
  const [questionCount, setQuestionCount] = useState(10);
  const [sessionId, setSessionId] = useState<string>(`certification-session-${certificationId}`);
  const [isGeneratingSession, setIsGeneratingSession] = useState(false);
  
  // Active session - using useReducer for batched updates
  const [questions, setQuestions] = useState<CertificationQuestion[]>([]);
  const [examState, dispatch] = useReducer(examReducer, {
    currentIndex: 0,
    answers: [],
    flaggedQuestions: new Set<number>(),
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const { toast } = useUnifiedToast();

  // Redirect to home when certification not found
  useEffect(() => {
    if (!certification && certificationId) {
      toast({
        title: "Certification not found",
        description: "Redirecting to home page...",
        variant: "warning",
      });
      const timer = setTimeout(() => {
        setLocation('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [certification, certificationId, toast, setLocation]);



  // Derived values from examState
  const currentIndex = examState.currentIndex;
  const answers = examState.answers;
  const flaggedQuestions = examState.flaggedQuestions;

  const currentQuestion = questions[currentIndex] ?? null;
  const isAnswered = currentQuestion ? answers.some(a => a.questionId === currentQuestion.id) : false;
  const currentAnswer = currentQuestion ? answers.find(a => a.questionId === currentQuestion.id) : undefined;

  // Start exam session - async to avoid blocking UI
  const startSession = useCallback(() => {
    setIsGeneratingSession(true);
    // Use setTimeout to defer execution and not block first paint
    setTimeout(() => {
      const sessionQuestions = generatePracticeSession(certificationId!, questionCount);
      setQuestions(sessionQuestions);
      dispatch({ type: 'SET_QUESTIONS', payload: sessionQuestions });
      setSelectedOption(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
      setSessionState('active');
      setIsGeneratingSession(false);
    }, 0);
  }, [certificationId, questionCount]);

  // Save session progress
  const saveSessionProgress = useCallback(() => {
    if (!certificationId || questions.length === 0) return;
    
    const sessionData = {
      certificationId,
      certificationName: certification?.name,
      questions,
      currentIndex,
      answers,
      examMode,
      questionCount,
      lastAccessedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(sessionId, JSON.stringify(sessionData));
  }, [certificationId, certification, questions, currentIndex, answers, examMode, questionCount, sessionId]);

  // Load saved session on mount
  useEffect(() => {
    if (!certificationId) return;
    
    const savedData = localStorage.getItem(sessionId);
    if (savedData) {
      try {
        const sessionData = JSON.parse(savedData);
        if (sessionData.questions && sessionData.questions.length > 0) {
          // Session exists - could auto-resume or show option
          // For now, we'll just keep it in localStorage for resume service
        }
      } catch (e) {
        console.error('Invalid session data:', e);
        localStorage.removeItem(sessionId);
      }
    }
  }, [certificationId, sessionId]);

  // Submit answer
  const submitAnswer = useCallback((optionId: string) => {
    if (!currentQuestion || isAnswered) return;

    const correctOption = currentQuestion.options.find(o => o.isCorrect);
    const isCorrect = optionId === correctOption?.id;
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      isCorrect,
      timeSpent,
    };

    dispatch({ type: 'SET_ANSWER', payload: record });
    setSelectedOption(optionId);
    
    if (examMode === 'practice') {
      setShowExplanation(true);
    }
  }, [currentQuestion, isAnswered, questionStartTime, examMode]);

  // Navigation
  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: currentIndex + 1 });
      setSelectedOption(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
      saveSessionProgress();
    }
  }, [currentIndex, questions.length, saveSessionProgress]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: currentIndex - 1 });
      const prevAnswer = answers.find(a => a.questionId === questions[currentIndex - 1]?.id);
      setSelectedOption(prevAnswer?.selectedOptionId || null);
      setShowExplanation(false);
      saveSessionProgress();
    }
  }, [currentIndex, answers, questions, saveSessionProgress]);

  const goToQuestion = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
    const answer = answers.find(a => a.questionId === questions[index]?.id);
    setSelectedOption(answer?.selectedOptionId || null);
    setShowExplanation(false);
    setQuestionStartTime(Date.now());
    saveSessionProgress();
  }, [answers, questions, saveSessionProgress]);

  const toggleFlag = useCallback(() => {
    dispatch({ type: 'TOGGLE_FLAG', payload: currentIndex });
    saveSessionProgress();
  }, [currentIndex, saveSessionProgress]);

  const finishExam = useCallback(() => {
    setSessionState('results');
    // Clear session when exam is completed
    localStorage.removeItem(sessionId);
  }, [sessionId]);

  const exitExam = useCallback(() => {
    saveSessionProgress();
    setLocation(`/certification/${certificationId}`);
  }, [saveSessionProgress, certificationId, setLocation]);

  // Results calculations
  const results = useMemo(() => {
    const correct = answers.filter(a => a.isCorrect).length;
    const total = questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = examConfig ? percentage >= examConfig.passingScore : percentage >= 70;
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    const avgTime = answers.length > 0 ? Math.round(totalTime / answers.length) : 0;

    // Domain breakdown
    const domainResults: Record<string, { correct: number; total: number; percentage: number }> = {};
    if (examConfig) {
      examConfig.domains.forEach(domain => {
        const domainQuestions = questions.filter(q => q.domain === domain.id);
        const domainAnswers = answers.filter(a => 
          domainQuestions.some(q => q.id === a.questionId)
        );
        const domainCorrect = domainAnswers.filter(a => a.isCorrect).length;
        domainResults[domain.id] = {
          correct: domainCorrect,
          total: domainQuestions.length,
          percentage: domainQuestions.length > 0 ? Math.round((domainCorrect / domainQuestions.length) * 100) : 0,
        };
      });
    }

    return { correct, total, percentage, passed, totalTime, avgTime, domainResults };
  }, [answers, questions, examConfig]);



  if (!certification) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-semibold mb-2">Certification not found</h2>
          <p className="text-muted-foreground text-sm">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-semibold mb-2">Questions Coming Soon</h2>
          <p className="text-muted-foreground mb-4">
            We're preparing certification-specific questions for {certification.name}. 
            In the meantime, try the general practice mode.
          </p>
          <Button onClick={() => setLocation(`/certification/${certificationId}`)}>
            Go to Practice Mode
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${certification.name} Exam Practice`} 
        description={`Practice exam for ${certification.name} certification`} 
      />

      <div className="min-h-screen bg-background">
        {/* Setup Screen */}
        {sessionState === 'setup' && (
          <SetupScreen
            certification={certification}
            examConfig={examConfig}
            totalQuestions={allQuestions.length}
            examMode={examMode}
            setExamMode={setExamMode}
            questionCount={questionCount}
            setQuestionCount={setQuestionCount}
            onStart={startSession}
            onBack={() => setLocation(`/certification/${certificationId}`)}
          />
        )}

        {/* Active Exam */}
        {sessionState === 'active' && currentQuestion && (
          <ActiveExam
            certification={certification}
            examMode={examMode}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            currentQuestion={currentQuestion}
            selectedOption={selectedOption}
            isAnswered={isAnswered}
            currentAnswer={currentAnswer}
            showExplanation={showExplanation}
            flaggedQuestions={flaggedQuestions}
            answers={answers}
            questions={questions}
            onSelectOption={submitAnswer}
            onNext={goToNext}
            onPrev={goToPrev}
            onGoToQuestion={goToQuestion}
            onToggleFlag={toggleFlag}
            onFinish={finishExam}
            onExit={exitExam}
          />
        )}

        {/* Results Screen */}
        {sessionState === 'results' && (
          <ResultsScreen
            certification={certification}
            examConfig={examConfig}
            results={results}
            questions={questions}
            answers={answers}
            onRetry={() => {
              setSessionState('setup');
            }}
            onReview={() => {
              setExamMode('review');
              dispatch({ type: 'SET_CURRENT_INDEX', payload: 0 });
              setSessionState('active');
            }}
            onBack={() => setLocation(`/certification/${certificationId}`)}
          />
        )}
      </div>
    </>
  );
}


// ============================================
// SETUP SCREEN
// ============================================

interface SetupScreenProps {
  certification: CertificationConfig;
  examConfig: CertificationExamConfig | undefined;
  totalQuestions: number;
  examMode: ExamMode;
  setExamMode: (mode: ExamMode) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  onStart: () => void;
  onBack: () => void;
}

function SetupScreen({
  certification,
  examConfig,
  totalQuestions,
  examMode,
  setExamMode,
  questionCount,
  setQuestionCount,
  onStart,
  onBack,
}: SetupScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Breadcrumb className="justify-center mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/certifications">Certifications</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{certification.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to certification
          </Button>
          
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Award className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{certification.name}</h1>
          <p className="text-muted-foreground">{certification.provider}</p>
        </div>

        {/* Exam Info */}
        {examConfig && (
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Exam Details
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Questions</div>
                <div className="font-semibold">{examConfig.totalQuestions}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Time Limit</div>
                <div className="font-semibold">{examConfig.timeLimit} min</div>
              </div>
              <div>
                <div className="text-muted-foreground">Passing</div>
                <div className="font-semibold">{examConfig.passingScore}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Mode Selection */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold">Practice Mode</h3>
          
          <Button
            variant={examMode === 'practice' ? 'primary' : 'outline'}
            onClick={() => setExamMode('practice')}
            className="w-full justify-start p-4 h-auto"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                examMode === 'practice' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium">Learning Mode</div>
                <div className="text-sm text-muted-foreground">See explanations after each answer</div>
              </div>
            </div>
          </Button>

          <Button
            variant={examMode === 'timed' ? 'primary' : 'outline'}
            onClick={() => setExamMode('timed')}
            className="w-full justify-start p-4 h-auto"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                examMode === 'timed' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium">Exam Simulation</div>
                <div className="text-sm text-muted-foreground">Timed test, results at the end</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Question Count */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3">Questions ({totalQuestions} available)</h3>
          <div className="flex gap-2">
            {[5, 10, 15, 20].filter(n => n <= totalQuestions).map(count => (
              <Button
                key={count}
                variant={questionCount === count ? 'primary' : 'secondary'}
                onClick={() => setQuestionCount(count)}
                className="flex-1"
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button onClick={onStart} size="lg" fullWidth icon={<Zap className="w-5 h-5" />}>
          Start Practice
        </Button>
      </motion.div>
    </div>
  );
}

// ============================================
// ACTIVE EXAM
// ============================================

interface ActiveExamProps {
  certification: CertificationConfig;
  examMode: ExamMode;
  currentIndex: number;
  totalQuestions: number;
  currentQuestion: CertificationQuestion;
  selectedOption: string | null;
  isAnswered: boolean;
  currentAnswer: AnswerRecord | undefined;
  showExplanation: boolean;
  flaggedQuestions: Set<number>;
  answers: AnswerRecord[];
  questions: CertificationQuestion[];
  onSelectOption: (optionId: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onGoToQuestion: (index: number) => void;
  onToggleFlag: () => void;
  onFinish: () => void;
  onExit: () => void;
}

function ActiveExam({
  certification,
  examMode,
  currentIndex,
  totalQuestions,
  currentQuestion,
  selectedOption,
  isAnswered,
  currentAnswer,
  showExplanation,
  flaggedQuestions,
  answers,
  questions,
  onSelectOption,
  onNext,
  onPrev,
  onGoToQuestion,
  onToggleFlag,
  onFinish,
  onExit,
}: ActiveExamProps) {
  const [showNav, setShowNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('exam-sidebar-collapsed') === 'true'; } catch { return false; }
  });
  const isFlagged = flaggedQuestions.has(currentIndex);
  const correctOption = currentQuestion.options.find(o => o.isCorrect);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('exam-sidebar-collapsed', String(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconButton
                onClick={onExit}
                icon={<Home className="w-4 h-4" />}
                aria-label="Exit exam"
                variant="ghost"
                size="sm"
              />
              {/* Sidebar toggle — desktop only */}
              <IconButton
                onClick={toggleSidebar}
                icon={sidebarCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                variant="ghost"
                size="sm"
                className="hidden lg:flex"
              />
              <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                {certification.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowNav(!showNav)}
              >
                <LayoutList className="w-3.5 h-3.5 mr-1" />
                {currentIndex + 1}/{totalQuestions}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question Navigator Overlay */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNav(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-3" />
                <h3 className="font-semibold">Question Navigator</h3>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {questions.map((_, i) => {
                  const answer = answers.find(a => a.questionId === questions[i].id);
                  const isCurrent = i === currentIndex;
                  const isFlag = flaggedQuestions.has(i);
                  
                  let variant: 'primary' | 'secondary' | 'success' | 'danger' = 'secondary';
                  if (isCurrent) variant = 'primary';
                  else if (answer) variant = answer.isCorrect ? 'success' : 'danger';
                  
                  return (
                    <Button
                      key={i}
                      variant={variant}
                      size="sm"
                      onClick={() => {
                        onGoToQuestion(i);
                        setShowNav(false);
                      }}
                      className="relative aspect-square"
                    >
                      {i + 1}
                      {isFlag && (
                        <Flag className="absolute top-0.5 right-0.5 w-3 h-3 text-yellow-500" />
                      )}
                    </Button>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-4 text-xs text-muted-foreground justify-center">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-[var(--gh-success-fg)]/20" /> Correct
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-[var(--gh-danger-fg)]/20" /> Wrong
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-muted" /> Unanswered
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body: sidebar + main */}
      <div className="flex flex-1">

        {/* Desktop collapsible sidebar */}
        <aside className={`hidden lg:flex flex-col border-r border-border bg-muted/20 transition-all duration-200 overflow-hidden shrink-0 ${sidebarCollapsed ? 'w-10' : 'w-52'}`}>
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <span className="text-[10px] font-bold text-muted-foreground">{currentIndex + 1}</span>
              <div className="w-0.5 h-full max-h-24 bg-border mx-auto" />
              <span className="text-[10px] text-muted-foreground">{totalQuestions}</span>
            </div>
          ) : (
            <div className="p-3 overflow-y-auto flex-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <LayoutList className="w-3 h-3" /> Questions
              </p>
              <ExamSidebar
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                flaggedQuestions={flaggedQuestions}
                onGoToQuestion={onGoToQuestion}
              />
            </div>
          )}
        </aside>

        {/* Question Content */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {/* Domain & Difficulty */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
            {currentQuestion.domain.replace(/-/g, ' ')}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            currentQuestion.difficulty === 'beginner' ? 'bg-[var(--gh-success-fg)]/10 text-[var(--gh-success-fg)]' :
            currentQuestion.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
            'bg-[var(--gh-danger-fg)]/10 text-[var(--gh-danger-fg)]'
          }`}>
            {currentQuestion.difficulty}
          </span>
          <IconButton
            onClick={onToggleFlag}
            icon={<Flag className="w-4 h-4" />}
            aria-label="Flag question"
            variant={isFlagged ? 'danger' : 'ghost'}
            size="sm"
          />
        </div>

        {/* Question */}
        <h2 className="text-lg font-medium mb-6 leading-relaxed">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const showResult = isAnswered && (examMode === 'practice' || examMode === 'review');
            const isCorrect = option.isCorrect;
            
            let variant: 'primary' | 'outline' | 'success' | 'danger' = 'outline';
            if (showResult) {
              variant = isCorrect ? 'success' : isSelected ? 'danger' : 'outline';
            } else if (isSelected) {
              variant = 'primary';
            }
            
            return (
              <Button
                key={option.id}
                variant={variant}
                onClick={() => !isAnswered && onSelectOption(option.id)}
                disabled={isAnswered && examMode !== 'review'}
                className="w-full justify-start p-4 h-auto"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    showResult && isCorrect ? 'border-[var(--gh-success-fg)] bg-[var(--gh-success-fg)]' :
                    showResult && isSelected && !isCorrect ? 'border-[var(--gh-danger-fg)] bg-[var(--gh-danger-fg)]' :
                    isSelected ? 'border-primary bg-primary' :
                    'border-muted-foreground/30'
                  }`}>
                    {showResult && isCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-white" />}
                    {!showResult && isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm leading-relaxed">{option.text}</span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-500 mb-1">Explanation</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>{/* end flex-1 sidebar+main wrapper */}

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 z-40 bg-card/95 backdrop-blur border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={onPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {currentIndex === totalQuestions - 1 ? (
            <Button
              variant="success"
              onClick={onFinish}
              icon={<Trophy className="w-5 h-5" />}
            >
              Finish
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!isAnswered && examMode === 'practice'}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}


// ============================================
// RESULTS SCREEN
// ============================================

interface ResultsScreenProps {
  certification: CertificationConfig;
  examConfig: CertificationExamConfig | undefined;
  results: {
    correct: number;
    total: number;
    percentage: number;
    passed: boolean;
    totalTime: number;
    avgTime: number;
    domainResults: Record<string, { correct: number; total: number; percentage: number }>;
  };
  questions: CertificationQuestion[];
  answers: AnswerRecord[];
  onRetry: () => void;
  onReview: () => void;
  onBack: () => void;
}

function ResultsScreen({
  certification,
  examConfig,
  results,
  questions,
  answers,
  onRetry,
  onReview,
  onBack,
}: ResultsScreenProps) {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Result Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
            results.passed 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          }`}>
            {results.passed ? (
              <Trophy className="w-12 h-12 text-foreground" />
            ) : (
              <RotateCcw className="w-12 h-12 text-foreground" />
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {results.passed ? '🎉 Congratulations!' : 'Keep Practicing!'}
          </h1>
          
          <p className="text-muted-foreground mb-4">
            {results.passed 
              ? `You passed the ${certification.name} practice exam!`
              : `You need ${examConfig?.passingScore || 70}% to pass. Keep studying!`
            }
          </p>

          {/* Score Circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${results.percentage * 3.52} 352`}
                className={results.passed ? 'text-[var(--gh-success-fg)]' : 'text-[var(--gh-danger-fg)]'}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{results.percentage}%</span>
              <span className="text-xs text-muted-foreground">
                {results.correct}/{results.total}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Target className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{results.correct}</div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Trophy className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{results.avgTime}s</div>
            <div className="text-xs text-muted-foreground">Avg Time</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <BarChart3 className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{examConfig?.passingScore || 70}%</div>
            <div className="text-xs text-muted-foreground">Pass Mark</div>
          </div>
        </div>

        {/* Domain Breakdown */}
        {examConfig && Object.keys(results.domainResults).length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Domain Performance
            </h3>
            <div className="space-y-3">
              {examConfig.domains.map(domain => {
                const domainResult = results.domainResults[domain.id];
                if (!domainResult || domainResult.total === 0) return null;
                
                return (
                  <div key={domain.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{domain.name}</span>
                      <span className={`font-medium ${
                        domainResult.percentage >= 70 ? 'text-[var(--gh-success-fg)]' : 'text-[var(--gh-danger-fg)]'
                      }`}>
                        {domainResult.correct}/{domainResult.total} ({domainResult.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          domainResult.percentage >= 70 ? 'bg-[var(--gh-success-fg)]' : 'bg-[var(--gh-danger-fg)]'
                        }`}
                        style={{ width: `${domainResult.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onReview}
            size="lg"
            fullWidth
            icon={<BookOpen className="w-5 h-5" />}
          >
            Review Answers
          </Button>
          
          <Button
            variant="secondary"
            onClick={onRetry}
            size="lg"
            fullWidth
            icon={<RotateCcw className="w-5 h-5" />}
          >
            Try Again
          </Button>
          
          <Button
            variant="ghost"
            onClick={onBack}
            fullWidth
          >
            Back to Certification
          </Button>
        </div>
      </div>
    </div>
  );
}
