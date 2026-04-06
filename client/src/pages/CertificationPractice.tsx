/**
 * Certification Practice - Gen Z Edition
 * Pure black, neon accents, immersive learning experience
 * Includes embedded mini-tests with glassmorphism effects
 */

import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useLocation, useRoute } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getCertificationById, 
  getPrerequisiteCertifications,
} from '../lib/certifications-config';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/lib/ui';
import { Button, IconButton } from '@/lib/ui';
import { useCredits } from '../context/CreditsContext';
import { SEOHead } from '@/lib/ui';
import { QuestionPanel } from '@/lib/ui';
import { ComingSoon } from '@/lib/ui';
import { trackQuestionView } from '../hooks/use-analytics';
import { useUnifiedToast } from '../hooks/use-unified-toast';
import { useSwipe } from '../hooks/use-swipe';
import { ChannelService } from '../services/api.service';
import { loadTests, getSessionQuestions, TestQuestion, Test } from '../lib/tests';
import { generateProgressiveSequence } from '../lib/progressive-quiz';
import { spendCredits } from '../lib/credits';
import { getQuestionsForCertification } from '../lib/certification-questions';
import type { Question } from '../types';
import {
  ChevronLeft, ChevronRight, Award, ExternalLink,
  Check, ArrowLeft, Info, X, AlertTriangle, Coins, Zap,
  SkipForward, Lock, Unlock, CheckCircle, XCircle, RefreshCw,
  ChevronDown, ChevronUp, Lightbulb, BookOpen, Clock, Target,
  Sparkles, ListChecks, GraduationCap
} from 'lucide-react';

const GenZAnswerPanel = lazy(() =>
  import('../components/question/GenZAnswerPanel').then(m => ({ default: m.GenZAnswerPanel }))
);

const SKIP_TEST_PENALTY = 50;
const QUESTIONS_PER_TEST = 5;
const TEST_QUESTIONS_COUNT = 3;
const FEEDBACK_DELAY = 800; // ms before auto-advance

interface TestAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionId: string;
}

export default function CertificationPractice() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/certification/:id/:questionIndex?');
  const certificationId = params?.id;

  const certification = certificationId ? getCertificationById(certificationId) : null;
  const prerequisites = certification ? getPrerequisiteCertifications(certification.id) : [];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [mobileView, setMobileView] = useState<'question' | 'answer'>('question');
  const [showInfo, setShowInfo] = useState(false);
  const [mainView, setMainView] = useState<'overview' | 'practice'>('overview');
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Test state
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [showTest, setShowTest] = useState(false);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([]);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<TestAnswer | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [passedCheckpoints, setPassedCheckpoints] = useState<Set<number>>(new Set());
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  const { toast } = useUnifiedToast();
  const { onQuestionSwipe, onQuestionView, balance, formatCredits, refreshBalance } = useCredits();

  const progressKey = `cert-progress-${certificationId}`;
  const checkpointsKey = `cert-checkpoints-${certificationId}`;
  const sessionKey = `cert-session-${certificationId}`;
  
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(progressKey);
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  // Save session progress
  const saveSession = useCallback(() => {
    if (!certificationId || questions.length === 0) return;
    
    const sessionData = {
      certificationId,
      certificationName: certification?.name,
      questions,
      currentIndex,
      completedIds: Array.from(completedIds),
      passedCheckpoints: Array.from(passedCheckpoints),
      selectedDifficulty,
      lastAccessedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
  }, [certificationId, certification, questions, currentIndex, completedIds, passedCheckpoints, selectedDifficulty, sessionKey]);

  // Load session on mount
  useEffect(() => {
    if (!certificationId) return;
    
    try {
      const savedSession = localStorage.getItem(sessionKey);
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        if (sessionData.currentIndex !== undefined) {
          setCurrentIndex(sessionData.currentIndex);
        }
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
  }, [certificationId, sessionKey]);

  // Auto-save on progress
  useEffect(() => {
    if (questions.length > 0) {
      saveSession();
    }
  }, [currentIndex, completedIds, passedCheckpoints, saveSession, questions.length]);

  // Exit and save
  const exitSession = useCallback(() => {
    saveSession();
    setLocation(`/certification/${certificationId}`);
  }, [saveSession, certificationId, setLocation]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(checkpointsKey);
      if (saved) setPassedCheckpoints(new Set(JSON.parse(saved)));
    } catch (error) {
      console.warn('Failed to load checkpoints from localStorage:', error);
    }
  }, [checkpointsKey]);

  useEffect(() => {
    if (certificationId) {
      localStorage.setItem(progressKey, JSON.stringify(Array.from(completedIds)));
    }
  }, [completedIds, certificationId, progressKey]);

  useEffect(() => {
    if (certificationId) {
      localStorage.setItem(checkpointsKey, JSON.stringify(Array.from(passedCheckpoints)));
    }
  }, [passedCheckpoints, certificationId, checkpointsKey]);

  // Fetch questions and tests
  useEffect(() => {
    if (!certification) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const allQuestions: Question[] = [];
        const channelIds: string[] = [];
        
        for (const mapping of certification.channelMappings) {
          try {
            const data = await ChannelService.getData(mapping.channelId);
            let channelQuestions = data.questions || [];
            channelIds.push(mapping.channelId);
            
            if (mapping.subChannels && mapping.subChannels.length > 0) {
              channelQuestions = channelQuestions.filter((q: Question) => 
                mapping.subChannels!.includes(q.subChannel)
              );
            }
            
            const count = Math.ceil(channelQuestions.length * (mapping.weight / 100));
            allQuestions.push(...channelQuestions.slice(0, count));
          } catch (err) {
            console.error(`Failed to load channel ${mapping.channelId}:`, err);
          }
        }

        const allTests = await loadTests();
        setAvailableTests(allTests.filter(t => channelIds.includes(t.channelId)));

        // Also load certification-specific MCQ questions
        const certSpecificRaw = getQuestionsForCertification(certificationId!);
        const certSpecificQuestions: Question[] = certSpecificRaw.map(cq => {
          const correctOption = cq.options.find(o => o.isCorrect);
          return {
            id: `cert-${cq.id}`,
            question: cq.question,
            answer: correctOption ? correctOption.text : '',
            explanation: cq.explanation,
            tags: cq.tags,
            difficulty: cq.difficulty,
            channel: certificationId!,
            subChannel: cq.domain,
            options: cq.options,
          } as Question;
        });

        // Merge: use channel questions first, then add cert-specific ones not already present
        const existingIds = new Set(allQuestions.map(q => q.id));
        const newCertQuestions = certSpecificQuestions.filter(q => !existingIds.has(q.id));
        const merged = [...allQuestions, ...newCertQuestions];

        const uniqueQuestions = Array.from(new Map(merged.map(q => [q.id, q])).values());
        const seed = sessionStorage.getItem(`cert-seed-${certificationId}`) || Date.now().toString();
        sessionStorage.setItem(`cert-seed-${certificationId}`, seed);
        
        // Use progressive RAG-based selection instead of random shuffle
        const progressiveQuestions = generateProgressiveSequence(uniqueQuestions, uniqueQuestions.length);
        setQuestions(progressiveQuestions);
        
        if (progressiveQuestions.length === 0) {
          console.warn(`No questions found for ${certification.name}`);
        }
      } catch (err) {
        console.error('Failed to load certification questions:', err);
        setError('Failed to load certification questions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [certification, certificationId]);

  const filteredQuestions = useMemo(() => {
    if (selectedDifficulty === 'all') return questions;
    return questions.filter(q => q.difficulty === selectedDifficulty);
  }, [questions, selectedDifficulty]);

  const currentQuestion = filteredQuestions[currentIndex];
  const totalQuestions = filteredQuestions.length;

  const isTestCheckpoint = useCallback((index: number) => index > 0 && index % QUESTIONS_PER_TEST === 0, []);
  const isCheckpointPassed = useCallback((index: number) => passedCheckpoints.has(index), [passedCheckpoints]);

  const getTestForCheckpoint = useCallback(() => {
    if (availableTests.length === 0) return [];
    const randomTest = availableTests[Math.floor(Math.random() * availableTests.length)];
    return getSessionQuestions(randomTest, TEST_QUESTIONS_COUNT);
  }, [availableTests]);

  const startTest = useCallback(() => {
    const qs = getTestForCheckpoint();
    if (qs.length > 0) {
      setTestQuestions(qs);
      setCurrentTestIndex(0);
      setTestAnswers([]);
      setShowingFeedback(false);
      setLastAnswer(null);
      setShowResults(false);
      setExpandedResults(new Set());
      setShowTest(true);
    } else {
      setPassedCheckpoints(prev => new Set(Array.from(prev).concat(currentIndex)));
      toast({ title: 'Checkpoint passed!' });
    }
  }, [getTestForCheckpoint, currentIndex, toast]);

  // ONE-CLICK: Select answer = submit immediately, show feedback, auto-advance
  const handleAnswerClick = useCallback((optionId: string) => {
    if (showingFeedback) return;
    
    const currentQ = testQuestions[currentTestIndex];
    const correctOption = currentQ.options.find(o => o.isCorrect);
    const isCorrect = optionId === correctOption?.id;
    
    const answer: TestAnswer = {
      questionId: currentQ.id,
      selectedOptionId: optionId,
      isCorrect,
      correctOptionId: correctOption?.id || ''
    };
    
    setTestAnswers(prev => [...prev, answer]);
    setLastAnswer(answer);
    setShowingFeedback(true);
    
    // Auto-advance after brief feedback
    setTimeout(() => {
      setShowingFeedback(false);
      setLastAnswer(null);
      
      if (currentTestIndex < testQuestions.length - 1) {
        setCurrentTestIndex(prev => prev + 1);
      } else {
        setShowResults(true);
      }
    }, FEEDBACK_DELAY);
  }, [showingFeedback, testQuestions, currentTestIndex]);

  const testResults = useMemo(() => {
    const correct = testAnswers.filter(a => a.isCorrect).length;
    return { correct, total: testQuestions.length, passed: correct === testQuestions.length };
  }, [testAnswers, testQuestions.length]);

  const retryTest = useCallback(() => {
    const qs = getTestForCheckpoint();
    setTestQuestions(qs);
    setCurrentTestIndex(0);
    setTestAnswers([]);
    setShowingFeedback(false);
    setLastAnswer(null);
    setShowResults(false);
    setExpandedResults(new Set());
  }, [getTestForCheckpoint]);

  const skipTestWithPenalty = useCallback(() => {
    const result = spendCredits(SKIP_TEST_PENALTY, `Skipped checkpoint test`);
    if (result.success) {
      setPassedCheckpoints(prev => new Set(Array.from(prev).concat(currentIndex)));
      setShowTest(false);
      setShowSkipConfirm(false);
      refreshBalance();
      toast({ title: 'Test Skipped', description: `-${SKIP_TEST_PENALTY} credits` });
    } else {
      toast({ title: 'Insufficient Credits', description: `Need ${SKIP_TEST_PENALTY} credits` });
    }
  }, [currentIndex, refreshBalance, toast]);

  const closeTestAndContinue = useCallback(() => {
    if (testResults.passed) {
      setPassedCheckpoints(prev => new Set(Array.from(prev).concat(currentIndex)));
    }
    setShowTest(false);
  }, [testResults.passed, currentIndex]);

  const toggleResultExpand = (index: number) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  // Navigation
  const goToNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      const nextIndex = currentIndex + 1;
      if (isTestCheckpoint(nextIndex) && !isCheckpointPassed(nextIndex)) {
        setCurrentIndex(nextIndex);
        startTest();
        return;
      }
      setCurrentIndex(nextIndex);
      setMobileView('question');
      onQuestionSwipe?.();
    }
  }, [currentIndex, totalQuestions, isTestCheckpoint, isCheckpointPassed, startTest, onQuestionSwipe]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setMobileView('question');
    }
  }, [currentIndex]);

  const markCompleted = () => {
    if (currentQuestion) {
      setCompletedIds(prev => new Set(Array.from(prev).concat(currentQuestion.id)));
      onQuestionView?.();
    }
  };

  const toggleMark = () => {
    if (currentQuestion) {
      setMarkedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.has(currentQuestion.id) ? newSet.delete(currentQuestion.id) : newSet.add(currentQuestion.id);
        return newSet;
      });
    }
  };

  const swipeHandlers = useSwipe({ onSwipeLeft: goToNext, onSwipeRight: goToPrev });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showTest) return;
      if (e.key === 'ArrowRight' || e.key === 'j') goToNext();
      if (e.key === 'ArrowLeft' || e.key === 'k') goToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTest, goToNext]);

  useEffect(() => {
    if (currentQuestion && !showTest) {
      trackQuestionView(currentQuestion.id, currentQuestion.channel, currentQuestion.difficulty);
    }
  }, [currentQuestion, showTest]);

  useEffect(() => {
    if (isTestCheckpoint(currentIndex) && !isCheckpointPassed(currentIndex) && !showTest && !loading) {
      startTest();
    }
  }, [currentIndex, isTestCheckpoint, isCheckpointPassed, showTest, loading, startTest]);

  // Handle no questions case - show toast
  useEffect(() => {
    if (!loading && certification && questions.length === 0 && !error) {
      toast({
        title: "No questions available",
        description: `Questions for "${certification.name}" are not yet available.`,
        variant: "warning",
      });
      setShouldRedirect(true);
    }
  }, [loading, certification, questions.length, error]);

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

  const progress = totalQuestions > 0 ? Math.round((completedIds.size / totalQuestions) * 100) : 0;
  const isCompleted = currentQuestion ? completedIds.has(currentQuestion.id) : false;
  const isMarked = currentQuestion ? markedQuestions.has(currentQuestion.id) : false;
  const currentTestQuestion = testQuestions[currentTestIndex];

  // Streamlined Test Modal - One click to answer, auto-advance
  const TestModal = () => {
    if (!showTest) return null;

    return (
      <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 pb-safe">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-muted/50 border border-border rounded-2xl w-full max-w-2xl max-h-[90dvh] max-h-[90svh] overflow-hidden flex flex-col pb-safe"
        >
          {/* Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  showResults ? (testResults.passed ? 'bg-green-500/20' : 'bg-red-500/20') : 'bg-amber-500/20'
                }`}>
                  {showResults ? (
                    testResults.passed ? <Unlock className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-red-500" />
                  ) : (
                    <Zap className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold">
                    {showResults ? (testResults.passed ? '🎉 Passed!' : '❌ Failed') : 'Checkpoint Test'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {showResults ? `${testResults.correct}/${testResults.total} correct` : `Q${currentTestIndex + 1}/${testQuestions.length} • Tap answer to submit`}
                  </p>
                </div>
              </div>
              
              {!showResults && (
                <div className="flex items-center gap-1">
                  {testQuestions.map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${
                      i < testAnswers.length
                        ? testAnswers[i]?.isCorrect ? 'bg-green-500' : 'bg-red-500'
                        : i === currentTestIndex ? 'bg-gradient-to-r from-primary to-cyan-500' : 'bg-muted'
                    }`} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {showResults ? (
              // Results - expandable review
              <div className="space-y-3">
                {!testResults.passed && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm">
                    <span className="font-medium text-red-500">Need 100% to proceed.</span>
                    <span className="text-muted-foreground ml-1">Review below, then retry or skip.</span>
                  </div>
                )}

                  {testQuestions.map((q, index) => {
                  const answer = testAnswers[index];
                  const isExpanded = expandedResults.has(index);
                  const correctOption = q.options.find(o => o.isCorrect);
                  const selectedOption = q.options.find(o => o.id === answer?.selectedOptionId);

                  return (
                    <div key={q.id} className={`border rounded-xl overflow-hidden ${
                      answer?.isCorrect ? 'border-green-500/30' : 'border-red-500/30'
                    }`}>
                      <Button
                        variant="ghost"
                        onClick={() => toggleResultExpand(index)}
                        className="w-full justify-start gap-3 text-left"
                      >
                        {answer?.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        )}
                        <span className="flex-1 text-sm line-clamp-1">{q.question}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-border/50"
                          >
                            <div className="p-3 space-y-2 text-sm">
                              <div className={`p-2 rounded ${answer?.isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                <span className="text-xs text-muted-foreground">Your answer: </span>
                                <span className={answer?.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{selectedOption?.text}</span>
                              </div>
                              {!answer?.isCorrect && (
                                <div className="p-2 rounded bg-green-500/10">
                                  <span className="text-xs text-muted-foreground">Correct: </span>
                                  <span className="text-green-600 dark:text-green-400">{correctOption?.text}</span>
                                </div>
                              )}
                              {q.explanation && (
                                <div className="p-2 rounded bg-blue-500/10 flex gap-2">
                                  <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground">{q.explanation}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Question - tap to answer (no submit button)
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    currentTestQuestion?.difficulty === 'beginner' ? 'bg-green-500/10 text-green-500' :
                    currentTestQuestion?.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {currentTestQuestion?.difficulty}
                  </span>
                </div>
                
                <h4 className="font-medium mb-5">{currentTestQuestion?.question}</h4>
                
                <div className="space-y-2">
                  {currentTestQuestion?.options.map((option) => {
                    const isSelected = lastAnswer?.selectedOptionId === option.id;
                    const isCorrect = option.isCorrect;
                    const showResult = showingFeedback && (isSelected || isCorrect);
                    
                    return (
                    <Button
                      variant={showingFeedback ? (isCorrect ? 'success' : (isSelected ? 'danger' : 'outline')) : (isSelected ? 'primary' : 'outline')}
                      onClick={() => handleAnswerClick(option.id)}
                      disabled={showingFeedback}
                      className="w-full justify-start p-4 h-auto"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          showingFeedback && isCorrect ? 'border-green-500 bg-green-500' :
                          showingFeedback && isSelected && !isCorrect ? 'border-red-500 bg-red-500' :
                          isSelected ? 'border-primary bg-primary' :
                          'border-muted-foreground/30'
                        }`}>
                          {showingFeedback && isCorrect && <Check className="w-3 h-3 text-foreground" />}
                          {showingFeedback && isSelected && !isCorrect && <X className="w-3 h-3 text-foreground" />}
                        </div>
                        <span className="text-sm">{option.text}</span>
                      </div>
                    </Button>
                    );
                  })}
                </div>

                {showingFeedback && lastAnswer && !lastAnswer.isCorrect && currentTestQuestion?.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm flex gap-2"
                  >
                    <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{currentTestQuestion.explanation}</span>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/30">
            {showResults ? (
              <div className="flex gap-3">
                {testResults.passed ? (
                  <Button onClick={closeTestAndContinue} variant="success" fullWidth>
                    <Unlock className="w-5 h-5" /> Continue
                  </Button>
                ) : (
                  <>
                    <Button onClick={retryTest} variant="primary" fullWidth icon={<RefreshCw className="w-4 h-4" />}>
                      Retry
                    </Button>
                    <Button onClick={() => setShowSkipConfirm(true)} variant="secondary" fullWidth icon={<SkipForward className="w-4 h-4" />}>
                      Skip (-{SKIP_TEST_PENALTY})
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <Button variant="ghost" size="sm" onClick={() => setShowSkipConfirm(true)} className="flex items-center gap-1">
                  <SkipForward className="w-4 h-4" /> Skip (-{SKIP_TEST_PENALTY})
                </Button>
                <span>Tap an answer to submit</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  // Skip Confirmation
  const SkipConfirmModal = () => (
    <AnimatePresence>
      {showSkipConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/80 flex items-center justify-center p-4 pb-safe"
          onClick={() => setShowSkipConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-muted/50 border border-border rounded-2xl w-full max-w-sm max-h-[90dvh] max-h-[90svh] p-5 overflow-y-auto pb-safe"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
              <h3 className="font-bold mb-2">Skip Test?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cost: <span className="text-red-500 font-bold">{SKIP_TEST_PENALTY} credits</span>
              </p>
              <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg text-sm">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Balance: <b>{formatCredits(balance)}</b></span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowSkipConfirm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={skipTestWithPenalty}
                  disabled={balance < SKIP_TEST_PENALTY}
                  variant="danger"
                  className="flex-1"
                >
                  Skip
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <SEOHead title={`${certification.name} Practice`} description={certification.description} />
      <TestModal />
      <SkipConfirmModal />

      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-3 pt-3">
          <Breadcrumb>
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
        </div>

        {/* Compact Header - Single row with integrated progress */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-7xl mx-auto px-3 py-2">
            {/* Main row: Back, Title, Progress, Credits */}
            <div className="flex items-center gap-2">
              <IconButton onClick={exitSession} aria-label="Exit and save progress" variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} className="p-1.5 shrink-0" />
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-semibold text-sm leading-tight">{certification.name}</h1>
                  <span className="text-[10px] text-muted-foreground shrink-0">{certification.provider}</span>
                </div>
                {/* Inline progress bar */}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground tabular-nums">Q{currentIndex + 1}/{totalQuestions}</span>
                  <div className="relative flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[200px]">
                    <div className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} />
                    {Array.from({ length: Math.floor(totalQuestions / QUESTIONS_PER_TEST) }).map((_, i) => {
                      const idx = (i + 1) * QUESTIONS_PER_TEST;
                      const pos = (idx / totalQuestions) * 100;
                      const passed = passedCheckpoints.has(idx);
                      return (
                        <div key={i} className={`absolute top-1/2 w-1.5 h-1.5 rounded-full ${passed ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ left: `${pos}%`, transform: 'translate(-50%, -50%)' }} />
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-primary font-medium tabular-nums">{progress}%</span>
                </div>
              </div>

              {/* Right side: Difficulty pills + Credits */}
              <div className="flex items-center gap-1 shrink-0">
                {['all', 'beginner', 'intermediate', 'advanced'].map(diff => {
                  const variant: 'primary' | 'secondary' | 'ghost' = selectedDifficulty === diff ? 'primary' : 'ghost';
                  const diffColor = diff === 'beginner' ? 'text-green-500' : diff === 'intermediate' ? 'text-yellow-500' : diff === 'advanced' ? 'text-red-500' : '';
                  return (
                    <Button 
                      key={diff} 
                      onClick={() => { setSelectedDifficulty(diff); setCurrentIndex(0); }}
                      variant={variant}
                      size="sm"
                      className={`px-2 py-0.5 text-[10px] rounded-md capitalize hidden sm:block ${selectedDifficulty === diff ? '' : diffColor}`}
                    >
                      {diff === 'all' ? 'All' : diff === 'beginner' ? 'Easy' : diff === 'intermediate' ? 'Med' : 'Hard'}
                    </Button>
                  );
                })}
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md ml-1">
                  <Coins className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-500 tabular-nums">{formatCredits(balance)}</span>
                </div>
                <IconButton onClick={() => setShowInfo(!showInfo)} aria-label="Show info" variant="ghost" size="sm" icon={<Info className="w-3.5 h-3.5" />} className="p-1" />
              </div>
            </div>

            {/* Mobile difficulty filter - only on small screens */}
            <div className="flex items-center gap-1 mt-1.5 sm:hidden overflow-x-auto no-scrollbar">
              {['all', 'beginner', 'intermediate', 'advanced'].map(diff => {
                const variant: 'primary' | 'secondary' | 'ghost' = selectedDifficulty === diff ? 'primary' : 'ghost';
                const diffColor = diff === 'beginner' ? 'text-green-500' : diff === 'intermediate' ? 'text-yellow-500' : diff === 'advanced' ? 'text-red-500' : '';
                return (
                  <Button 
                    key={diff} 
                    onClick={() => { setSelectedDifficulty(diff); setCurrentIndex(0); }}
                    variant={variant}
                    size="sm"
                    className={`px-2 py-0.5 text-[10px] rounded-md capitalize shrink-0 ${selectedDifficulty === diff ? '' : diffColor}`}
                  >
                    {diff === 'all' ? 'All' : diff === 'beginner' ? 'Easy' : diff === 'intermediate' ? 'Medium' : 'Hard'}
                  </Button>
                );
              })}
            </div>
          </div>
        </header>

        {/* View Tabs */}
        <div className="border-b border-border bg-background">
          <div className="max-w-7xl mx-auto px-3 flex items-center gap-1">
            <button
              onClick={() => setMainView('overview')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                mainView === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5" /> Overview</span>
            </button>
            <button
              onClick={() => setMainView('practice')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                mainView === 'practice'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Practice{totalQuestions > 0 ? ` (${totalQuestions})` : ''}</span>
            </button>
            <button
              onClick={() => setLocation(`/certification/${certificationId}/exam`)}
              className="px-3 py-2 text-xs font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Mock Exam</span>
            </button>
          </div>
        </div>

        {/* Overview Panel */}
        {mainView === 'overview' && (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {/* Cert summary */}
            <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
              <Award className="w-8 h-8 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h2 className="font-semibold text-base">{certification.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{certification.provider}{certification.examCode ? ` · ${certification.examCode}` : ''}</p>
                <p className="text-sm text-muted-foreground mt-2">{certification.description}</p>
              </div>
            </div>

            {/* Exam stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: Sparkles, label: 'Questions', value: totalQuestions > 0 ? String(totalQuestions) : 'Soon' },
                { icon: Clock, label: 'Study Time', value: `${certification.estimatedHours}h` },
                { icon: Target, label: 'Difficulty', value: certification.difficulty },
                { icon: GraduationCap, label: 'Category', value: certification.category },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-3 bg-card border border-border rounded-lg text-center">
                  <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold capitalize">{value}</p>
                </div>
              ))}
            </div>

            {/* Domain / Topic Breakdown */}
            {certification.channelMappings && certification.channelMappings.length > 0 && (
              <div className="p-4 bg-card border border-border rounded-xl">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-primary" /> Exam Topic Breakdown
                </h3>
                <div className="space-y-2.5">
                  {certification.channelMappings.map((mapping) => (
                    <div key={mapping.channelId} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground capitalize w-28 shrink-0 truncate">
                        {mapping.channelId.replace(/-/g, ' ')}
                      </span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${mapping.weight}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground w-8 text-right shrink-0">
                        {mapping.weight}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <div className="p-4 bg-card border border-border rounded-xl">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-primary" /> Prerequisites
                </h3>
                <div className="space-y-2">
                  {prerequisites.map((prereq) => (
                    <div key={prereq.id} className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{prereq.name}</span>
                      <span className="text-xs text-muted-foreground">({prereq.provider})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study Resources */}
            <div className="p-4 bg-card border border-border rounded-xl">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" /> Study Resources
              </h3>
              <div className="space-y-2">
                {certification.officialUrl && (
                  <a
                    href={certification.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    Official {certification.provider} Exam Page
                  </a>
                )}
                <a
                  href={`https://www.reddit.com/search/?q=${encodeURIComponent(certification.name + ' study guide')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  Community Study Discussions
                </a>
                <a
                  href={`https://github.com/search?q=${encodeURIComponent(certification.name + ' study')}&type=repositories`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  GitHub Study Repos &amp; Notes
                </a>
                {certification.examCode && (
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(certification.examCode + ' free study guide')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    Free Study Guides for {certification.examCode}
                  </a>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => setMainView('practice')}
                disabled={totalQuestions === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BookOpen className="w-4 h-4" />
                {totalQuestions > 0 ? `Start Practice (${totalQuestions} questions)` : 'No Questions Available'}
              </button>
              <button
                onClick={() => setLocation(`/certification/${certificationId}/exam`)}
                disabled={totalQuestions === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                Mock Exam
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Info - More compact */}
        {mainView === 'practice' && showInfo && (
          <div className="bg-muted/30 border-b border-border px-3 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-4">
                <span><span className="text-muted-foreground">Level:</span> <span className="font-medium capitalize">{certification.difficulty}</span></span>
                <span><span className="text-muted-foreground">Time:</span> <span className="font-medium">{certification.estimatedHours}h</span></span>
                <span><span className="text-muted-foreground">Done:</span> <span className="font-medium">{completedIds.size}/{totalQuestions}</span></span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Test every {QUESTIONS_PER_TEST}Q • Skip: {SKIP_TEST_PENALTY}cr</span>
              </div>
            </div>
          </div>
        )}

        {/* Content - only shown in practice view */}
        {mainView === 'practice' && loading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : mainView === 'practice' && error ? (
          <div className="flex items-center justify-center h-[60vh] text-center">
            <div><p className="text-red-500 mb-2">{error}</p><Button variant="primary" size="sm" onClick={() => window.location.reload()}>Retry</Button></div>
          </div>
        ) : mainView === 'practice' && totalQuestions === 0 ? (
          <ComingSoon 
            type="certification"
            name={certification.name}
            redirectTo="/certifications"
            redirectDelay={5000}
          />
        ) : mainView === 'practice' ? (
          <>
            {/* Desktop - Resizable split layout */}
            <div className="hidden lg:flex h-[calc(100vh-100px)]">
              <PanelGroup direction="horizontal" autoSaveId={`cert-practice-panels-${certificationId}`} className="w-full">
                <Panel defaultSize={40} minSize={25} maxSize={65}>
                  <div className="h-full overflow-y-auto momentum-scroll border-r border-border">
                    {currentQuestion && <QuestionPanel question={currentQuestion} questionNumber={currentIndex + 1} totalQuestions={totalQuestions} isMarked={isMarked} isCompleted={isCompleted} onToggleMark={toggleMark} timerEnabled={false} timeLeft={0} />}
                  </div>
                </Panel>
                <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/40 active:bg-primary/60 transition-colors cursor-col-resize" />
                <Panel defaultSize={60} minSize={30}>
                  <div className="h-full overflow-y-auto momentum-scroll p-4">
                    {currentQuestion && (
                      <Suspense fallback={<div className="animate-pulse space-y-3"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-4 bg-muted rounded w-full" /><div className="h-4 bg-muted rounded w-5/6" /></div>}>
                        <GenZAnswerPanel question={currentQuestion} isCompleted={isCompleted} />
                      </Suspense>
                    )}
                  </div>
                </Panel>
              </PanelGroup>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex flex-col h-[calc(100vh-140px)]">
              <div className="flex border-b border-border">
                <Button variant={mobileView === 'question' ? 'primary' : 'ghost'} size="sm" onClick={() => setMobileView('question')} className="flex-1 rounded-none py-2 text-sm font-medium">
                  Question
                </Button>
                <Button variant={mobileView === 'answer' ? 'primary' : 'ghost'} size="sm" onClick={() => setMobileView('answer')} className="flex-1 rounded-none py-2 text-sm font-medium">
                  Answer
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto pb-14 momentum-scroll touch-pan-y" onTouchStart={swipeHandlers.onTouchStart} onTouchMove={swipeHandlers.onTouchMove} onTouchEnd={swipeHandlers.onTouchEnd}>
                {mobileView === 'question' ? (
                  currentQuestion && <QuestionPanel question={currentQuestion} questionNumber={currentIndex + 1} totalQuestions={totalQuestions} isMarked={isMarked} isCompleted={isCompleted} onToggleMark={toggleMark} onTapQuestion={() => setMobileView('answer')} timerEnabled={false} timeLeft={0} />
                ) : (
                  currentQuestion && (
                    <Suspense fallback={<div className="animate-pulse space-y-3 p-4"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-4 bg-muted rounded w-full" /><div className="h-4 bg-muted rounded w-5/6" /></div>}>
                      <GenZAnswerPanel question={currentQuestion} isCompleted={isCompleted} />
                    </Suspense>
                  )
                )}
              </div>
            </div>

            {/* Nav - Minimal */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border py-1.5 px-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                <Button variant="secondary" size="sm" onClick={goToPrev} disabled={currentIndex === 0} className="flex items-center gap-1 px-2.5 py-1.5 text-xs">
                  <ChevronLeft className="w-4 h-4" />Prev
                </Button>
                <Button variant={isCompleted ? 'success' : 'primary'} size="sm" onClick={markCompleted} disabled={isCompleted} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium">
                  <Check className="w-3.5 h-3.5" />{isCompleted ? 'Done' : 'Mark Done'}
                </Button>
                <Button variant="secondary" size="sm" onClick={goToNext} disabled={currentIndex === totalQuestions - 1} className="flex items-center gap-1 px-2.5 py-1.5 text-xs">
                  Next<ChevronRight className="w-4 h-4" />
                  {isTestCheckpoint(currentIndex + 1) && !isCheckpointPassed(currentIndex + 1) && <Lock className="w-3 h-3 text-amber-500" />}
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let s = seed;
  const rand = () => { const x = Math.sin(s++) * 10000; return x - Math.floor(x); };
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
