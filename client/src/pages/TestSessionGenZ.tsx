/**
 * Test Session GenZ - Gen Z themed quiz interface
 * Pure black background, neon accents, glassmorphism
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Trophy,
  Home, Check, X, Zap
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { DesktopSidebarWrapper } from '../components/layout/DesktopSidebarWrapper';
import { GenZCard, GenZButton, GenZProgress, GenZTimer } from '../components/genz';
import {
  Test, TestQuestion, getTestForChannel, getSessionQuestions,
  calculateScore, saveTestAttempt, TestAttempt, getTestProgress,
  getChannelTheme, checkTestExpiration
} from '../lib/tests';
import { mascotEvents } from '../components/PixelMascot';

type SessionState = 'loading' | 'ready' | 'in-progress' | 'review' | 'completed';

export default function TestSessionGenZ() {
  const { channelId } = useParams<{ channelId: string }>();
  const [_, setLocation] = useLocation();
  
  const [test, setTest] = useState<Test | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [result, setResult] = useState<{ score: number; correct: number; total: number; passed: boolean } | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    if (!channelId) return;
    
    getTestForChannel(channelId).then(t => {
      if (t) {
        setTest(t);
        setSessionState('ready');
      } else {
        setSessionState('loading');
      }
    });
  }, [channelId]);

  const currentQuestion = questions[currentIndex];
  const progress = getTestProgress(test?.id || '');
  const theme = test ? getChannelTheme(test.channelId) : getChannelTheme('default');
  const isExpired = test && progress ? checkTestExpiration(test, progress) : false;

  const startTest = useCallback(() => {
    if (!test) return;
    
    const sessionQuestions = getSessionQuestions(test, 15);
    setQuestions(sessionQuestions);
    setAnswers({});
    setCurrentIndex(0);
    setStartTime(Date.now());
    setResult(null);
    setSessionState('in-progress');
  }, [test]);

  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return;
    
    if (currentQuestion.type === 'single') {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: [optionId] }));
      
      const correctOption = currentQuestion.options.find(o => o.isCorrect);
      const isCorrect = correctOption?.id === optionId;
      setShowFeedback(isCorrect ? 'correct' : 'incorrect');
      
      setTimeout(() => {
        setShowFeedback(null);
        setCurrentIndex(prev => {
          if (prev < questions.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 600);
    } else {
      setAnswers(prev => {
        const current = prev[currentQuestion.id] || [];
        if (current.includes(optionId)) {
          return { ...prev, [currentQuestion.id]: current.filter(id => id !== optionId) };
        } else {
          return { ...prev, [currentQuestion.id]: [...current, optionId] };
        }
      });
    }
  };

  const confirmMultipleChoice = useCallback(() => {
    if (!currentQuestion || currentQuestion.type !== 'multiple') return;
    
    setAnswers(prev => {
      const userAnswers = prev[currentQuestion.id] || [];
      if (userAnswers.length === 0) return prev;
      
      const correctIds = currentQuestion.options.filter(o => o.isCorrect).map(o => o.id);
      const allCorrectSelected = correctIds.every(id => userAnswers.includes(id));
      const noIncorrectSelected = userAnswers.every(id => correctIds.includes(id));
      const isCorrect = allCorrectSelected && noIncorrectSelected;
      
      return prev;
    });
    
    const userAnswers = answers[currentQuestion.id] || [];
    if (userAnswers.length === 0) return;
    
    const correctIds = currentQuestion.options.filter(o => o.isCorrect).map(o => o.id);
    const allCorrectSelected = correctIds.every(id => userAnswers.includes(id));
    const noIncorrectSelected = userAnswers.every(id => correctIds.includes(id));
    const isCorrect = allCorrectSelected && noIncorrectSelected;
    
    setShowFeedback(isCorrect ? 'correct' : 'incorrect');
    
    setTimeout(() => {
      setShowFeedback(null);
      setCurrentIndex(idx => {
        if (idx < questions.length - 1) {
          return idx + 1;
        }
        return idx;
      });
    }, 800);
  }, [currentQuestion, answers, questions.length]);

  const goNext = () => {
    setCurrentIndex(prev => {
      if (prev < questions.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  };

  const goPrev = () => {
    setCurrentIndex(prev => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  };

  const submitTest = () => {
    if (!test) return;
    
    const calcResult = calculateScore({ ...test, questions }, answers);
    setResult(calcResult);
    
    const attempt: TestAttempt = {
      testId: test.id,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      answers,
      score: calcResult.score,
      passed: calcResult.passed,
    };
    
    saveTestAttempt(test.id, test.channelId, attempt, test.version);
    setSessionState('review');
    
    if (calcResult.passed) {
      mascotEvents.celebrate();
    } else {
      mascotEvents.disappointed();
    }
  };

  const answeredCount = Object.keys(answers).length;

  if (sessionState === 'loading' || !test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">
            {!test ? 'No test available for this channel yet' : 'Loading test...'}
          </p>
          <GenZButton onClick={() => setLocation('/')} className="mt-4">
            Go back home
          </GenZButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${test.title} | Code Reels`}
        description={test.description}
        canonical={`https://open-interview.github.io/test/${channelId}`}
      />

      <DesktopSidebarWrapper>
      <div className="min-h-screen bg-background text-foreground">
        {sessionState === 'ready' && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full"
            >
              <GenZCard className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{theme.icon}</span>
                  </div>
                  <h1 className="text-xl font-bold mb-2 text-foreground">{test.title}</h1>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                </div>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Questions</span>
                    <span className="font-bold">15 (random from {test.questions.length})</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Passing Score</span>
                    <span className="font-bold">{test.passingScore}%</span>
                  </div>
                  {progress && !isExpired && (
                    <div className="flex justify-between p-2 bg-primary/10 rounded border border-primary/30">
                      <span className="text-muted-foreground">Your Best</span>
                      <span className="font-bold text-primary">{progress.bestScore}%</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <GenZButton onClick={startTest} className="w-full">
                    <Zap className="w-5 h-5 mr-2" /> Start Test
                  </GenZButton>
                  <GenZButton
                    variant="secondary"
                    onClick={() => setLocation(`/channel/${channelId}`)}
                    className="w-full"
                  >
                    Back to Channel
                  </GenZButton>
                </div>
              </GenZCard>
            </motion.div>
          </div>
        )}

        {sessionState === 'in-progress' && currentQuestion && (
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-border p-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLocation('/')}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1}/{questions.length}
                </span>
                <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <span className="text-xs text-muted-foreground">
                {answeredCount}/{questions.length}
              </span>
            </header>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 text-xs uppercase rounded ${
                        currentQuestion.type === 'multiple' 
                          ? 'bg-destructive/20 text-destructive' 
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {currentQuestion.type === 'multiple' ? 'Select all that apply' : 'Single choice'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs uppercase rounded ${
                        currentQuestion.difficulty === 'beginner' ? 'bg-primary/20 text-primary' :
                        currentQuestion.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {currentQuestion.difficulty}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold mb-6">{currentQuestion.question}</h2>

                    <div className="space-y-2">
                      {currentQuestion.options.map((option) => {
                        const isSelected = (answers[currentQuestion.id] || []).includes(option.id);
                        const showCorrect = showFeedback && option.isCorrect;
                        const showWrong = showFeedback === 'incorrect' && isSelected && !option.isCorrect;
                        const isMultiple = currentQuestion.type === 'multiple';
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            disabled={showFeedback !== null}
                            className={`w-full p-3 md:p-4 text-left border rounded-lg transition-all min-h-[44px] ${
                              showCorrect
                                ? 'border-primary bg-primary/20'
                                : showWrong
                                ? 'border-destructive bg-destructive/20'
                                : isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            } ${showFeedback ? 'cursor-default' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 ${isMultiple ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center flex-shrink-0 ${
                                showCorrect
                                  ? 'border-primary bg-primary'
                                  : showWrong
                                  ? 'border-destructive bg-destructive'
                                  : isSelected 
                                  ? 'border-primary bg-primary' 
                                  : 'border-border'
                              }`}>
                                {showCorrect && <Check className="w-4 h-4 text-black" />}
                                {showWrong && <X className="w-4 h-4 text-foreground" />}
                                {!showFeedback && isSelected && <Check className="w-4 h-4 text-black" />}
                              </div>
                              <span className="text-sm">{option.text}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {currentQuestion.type === 'multiple' && !showFeedback && (
                      <p className="mt-3 text-xs text-muted-foreground text-center">
                        Select all correct answers, then click "Confirm" to continue
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <footer className="border-t border-border p-2 pb-safe">
              <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
                <GenZButton
                  size="sm"
                  variant="secondary"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Prev
                </GenZButton>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{currentIndex + 1}</span>
                  <span>/</span>
                  <span>{questions.length}</span>
                </div>

                {currentIndex === questions.length - 1 ? (
                  currentQuestion?.type === 'multiple' ? (
                    <GenZButton
                      size="sm"
                      onClick={confirmMultipleChoice}
                      disabled={(answers[currentQuestion.id] || []).length === 0 || showFeedback !== null}
                    >
                      Submit
                    </GenZButton>
                  ) : (
                    <GenZButton size="sm" onClick={submitTest}>
                      Submit
                    </GenZButton>
                  )
                ) : (
                  currentQuestion?.type === 'multiple' ? (
                    <GenZButton
                      size="sm"
                      onClick={confirmMultipleChoice}
                      disabled={(answers[currentQuestion.id] || []).length === 0 || showFeedback !== null}
                    >
                      Confirm
                    </GenZButton>
                  ) : (
                    <GenZButton
                      size="sm"
                      variant="secondary"
                      onClick={goNext}
                      disabled={currentIndex >= questions.length - 1}
                    >
                      Next
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </GenZButton>
                  )
                )}
              </div>
            </footer>
          </div>
        )}

        {sessionState === 'review' && result && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full"
            >
              <GenZCard className="p-8">
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                    result.passed ? 'bg-primary/20' : 'bg-destructive/20'
                  }`}>
                    {result.passed ? (
                      <Trophy className="w-12 h-12 text-primary" />
                    ) : (
                      <XCircle className="w-12 h-12 text-destructive" />
                    )}
                  </div>
                  
                  <div className="text-6xl font-black text-foreground mb-2">{result.score}%</div>
                  <p className={`text-xl font-semibold mb-8 ${result.passed ? 'text-primary' : 'text-destructive'}`}>
                    {result.passed ? 'Passed!' : 'Not Passed'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-background/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-primary">{result.correct}</div>
                      <div className="text-xs text-muted-foreground">Correct</div>
                    </div>
                    <div className="bg-background/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-destructive">{result.total - result.correct}</div>
                      <div className="text-xs text-muted-foreground">Incorrect</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {!result.passed && (
                      <GenZButton onClick={startTest} className="w-full">
                        Try Again
                      </GenZButton>
                    )}
                    <GenZButton
                      variant="secondary"
                      onClick={() => setLocation(`/channel/${channelId}`)}
                      className="w-full"
                    >
                      Back to Channel
                    </GenZButton>
                  </div>
                </div>
              </GenZCard>
            </motion.div>
          </div>
        )}
      </div>
      </DesktopSidebarWrapper>
    </>
  );
}
