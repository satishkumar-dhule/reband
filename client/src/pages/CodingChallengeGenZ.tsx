import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  ArrowLeft, Play, RotateCcw, Eye, CheckCircle, XCircle,
  Code, Lightbulb, ChevronRight, Zap, Trophy, AlertCircle, Copy, Check,
  Sparkles, Brain, Flame, Target, Terminal, ChevronDown,
  ChevronUp, Search, BookOpen, Clock
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { AppLayout } from '../components/layout/AppLayout';
import { CodeEditor } from '../components/CodeEditor';
import {
  CodingChallenge as Challenge, Language, TestResult,
  getAllChallengesAsync, getChallengeById, getRandomChallenge,
  runTestsAsync, saveChallengeAttempt, analyzeCodeComplexity,
  getCodingStats, getSolvedChallengeIds, ComplexityAnalysis,
} from '../lib/coding-challenges';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';

type ViewState = 'list' | 'challenge';

const CODING_LANGUAGE_KEY = 'coding-preferred-language';
const CODING_PROGRESS_PREFIX = 'coding-progress-';

function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(CODING_LANGUAGE_KEY);
    if (stored === 'javascript' || stored === 'python') return stored;
  } catch {}
  return 'javascript';
}

function getStoredCode(challengeId: string, language: Language): string | null {
  try {
    const key = `${CODING_PROGRESS_PREFIX}${challengeId}-${language}`;
    return localStorage.getItem(key);
  } catch {}
  return null;
}

function saveCodeProgress(challengeId: string, language: Language, code: string): void {
  try {
    const key = `${CODING_PROGRESS_PREFIX}${challengeId}-${language}`;
    localStorage.setItem(key, code);
  } catch {}
}

export default function CodingChallengeGenZ() {
  const { id } = useParams<{ id?: string }>();
  const [_, setLocation] = useLocation();

  const [viewState, setViewState] = useState<ViewState>(id ? 'challenge' : 'list');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [language, setLanguage] = useState<Language>(getStoredLanguage);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userComplexity, setUserComplexity] = useState<ComplexityAnalysis | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => getSolvedChallengeIds());
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [resultsExpanded, setResultsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium'>('all');

  const stats = getCodingStats();

  useEffect(() => {
    async function loadChallenges() {
      try {
        const loaded = await getAllChallengesAsync();
        setChallenges(loaded);
      } catch (error) {
        console.error('Failed to load challenges:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadChallenges();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CODING_LANGUAGE_KEY, language);
    } catch {}
  }, [language]);

  useEffect(() => {
    if (!currentChallenge || !code) return;
    const timer = setTimeout(() => {
      saveCodeProgress(currentChallenge.id, language, code);
    }, 500);
    return () => clearTimeout(timer);
  }, [code, currentChallenge, language]);

  useEffect(() => {
    if (id && !isLoading) {
      const challenge = getChallengeById(id) || challenges.find(c => c.id === id);
      if (challenge) {
        setCurrentChallenge(challenge);
        const savedCode = getStoredCode(challenge.id, language);
        setCode(savedCode || challenge.starterCode[language]);
        setViewState('challenge');
        setStartTime(Date.now());
        setTestResults([]);
        setShowHints(false);
        setHintIndex(0);
        setUserComplexity(null);
        setShowSuccessModal(false);
      }
    }
  }, [id, isLoading, challenges, language]);

  useEffect(() => {
    if (currentChallenge) {
      const savedCode = getStoredCode(currentChallenge.id, language);
      setCode(savedCode || currentChallenge.starterCode[language]);
      setTestResults([]);
    }
  }, [language, currentChallenge]);

  useEffect(() => {
    if (!code || code === currentChallenge?.starterCode[language]) {
      setUserComplexity(null);
      return;
    }
    const timer = setTimeout(() => {
      const analysis = analyzeCodeComplexity(code);
      setUserComplexity(analysis);
    }, 500);
    return () => clearTimeout(timer);
  }, [code, currentChallenge, language]);

  const startChallenge = useCallback((challenge: Challenge) => {
    setCurrentChallenge(challenge);
    setCode(challenge.starterCode[language]);
    setTestResults([]);
    setShowHints(false);
    setHintIndex(0);
    setUserComplexity(null);
    setShowSuccessModal(false);
    setViewState('challenge');
    setLocation(`/coding/${challenge.id}`);
  }, [language, setLocation]);

  const startRandom = useCallback((difficulty?: 'easy' | 'medium') => {
    const challenge = getRandomChallenge(difficulty);
    startChallenge(challenge);
  }, [startChallenge]);

  const runCode = useCallback(async () => {
    if (!currentChallenge) return;
    setIsRunning(true);
    setShowSuccessModal(false);
    setResultsExpanded(true);

    try {
      const results = await runTestsAsync(code, currentChallenge, language);
      setTestResults(results);

      const allPassed = results.every((r) => r.passed);
      if (allPassed) {
        saveChallengeAttempt({
          challengeId: currentChallenge.id,
          code,
          language,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          passed: true,
          testResults: results,
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
        });
        setShowSuccessModal(true);
        setSolvedIds(prev => new Set([...Array.from(prev), currentChallenge.id]));
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  }, [code, currentChallenge, language, startTime]);

  const resetCode = useCallback(() => {
    if (currentChallenge) {
      setCode(currentChallenge.starterCode[language]);
      setTestResults([]);
      setUserComplexity(null);
      try {
        const key = `${CODING_PROGRESS_PREFIX}${currentChallenge.id}-${language}`;
        localStorage.removeItem(key);
      } catch {}
    }
  }, [currentChallenge, language]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const goBack = () => {
    if (viewState === 'challenge') {
      setViewState('list');
      setLocation('/coding');
    } else {
      setLocation('/');
    }
  };

  const filteredChallenges = challenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || c.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (viewState === 'challenge' && currentChallenge) {
    return (
      <AppLayout fullWidth hideNav>
        <SEOHead
          title={`${currentChallenge.title} | Coding Challenge`}
          description={currentChallenge.description}
        />
        <div className="flex flex-col h-screen bg-[var(--gh-canvas-subtle)]">
          {/* Top Bar */}
          <header className="h-14 border-b bg-[var(--gh-canvas)] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-[var(--gh-fg)]">{currentChallenge.title}</h1>
                <Badge variant="outline" className={
                  currentChallenge.difficulty === 'easy' 
                    ? "bg-[var(--gh-success-subtle)] text-[var(--gh-success-fg)] border-[var(--gh-success-fg)]/20"
                    : "bg-[var(--gh-attention-subtle)] text-[var(--gh-attention-fg)] border-[var(--gh-attention-fg)]/20"
                }>
                  {currentChallenge.difficulty}
                </Badge>
                <Badge variant="outline" className="bg-[var(--gh-canvas-inset)] text-[var(--gh-fg-muted)]">
                  {currentChallenge.category}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gh-accent-fg)]"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>

              <Button
                variant="default"
                size="sm"
                className="bg-[var(--gh-success-emphasis)] hover:bg-[var(--gh-success-emphasis)]/80 text-white gap-2 h-8"
                onClick={runCode}
                disabled={isRunning}
              >
                {isRunning ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Tests
              </Button>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex border-b bg-[var(--gh-canvas)]">
              <button
                onClick={() => setResultsExpanded(true)}
                className={`flex-1 py-2 px-4 text-xs font-medium ${resultsExpanded ? 'bg-[var(--gh-canvas-subtle)] border-b-2 border-[var(--gh-accent-fg)]' : ''}`}
              >
                Description
              </button>
              <button
                onClick={() => setResultsExpanded(false)}
                className={`flex-1 py-2 px-4 text-xs font-medium ${!resultsExpanded ? 'bg-[var(--gh-canvas-subtle)] border-b-2 border-[var(--gh-accent-fg)]' : ''}`}
              >
                Code Editor
              </button>
            </div>

            {/* Left Pane - Problem Description (full-width on mobile, 1/3 on desktop) */}
            <div className={`lg:w-1/3 lg:border-r bg-[var(--gh-canvas)] flex flex-col ${resultsExpanded ? 'flex' : 'hidden lg:flex'} min-w-0`}>
              <ScrollArea className="flex-1 p-4 lg:p-6">
                <div className="prose prose-sm max-w-none">
                  <h2 className="text-lg font-bold text-[var(--gh-fg)] mb-4">Description</h2>
                  <p className="text-[var(--gh-fg-muted)] mb-6 whitespace-pre-wrap leading-relaxed">
                    {currentChallenge.description}
                  </p>

                  {currentChallenge.testCases && currentChallenge.testCases.filter(tc => !tc.isHidden).length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-md font-bold text-[var(--gh-fg)]">Examples</h3>
                      {currentChallenge.testCases.filter(tc => !tc.isHidden).map((example, idx) => (
                        <div key={example.id} className="bg-[var(--gh-canvas-inset)] rounded-md border p-4 space-y-2">
                          <p className="font-mono text-xs font-semibold text-[var(--gh-fg-muted)] uppercase tracking-wider">Example {idx + 1}</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-semibold text-[var(--gh-fg-muted)]">Input:</span>{" "}
                              <code className="bg-transparent p-0 text-[var(--gh-fg)]">{example.input}</code>
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold text-[var(--gh-fg-muted)]">Output:</span>{" "}
                              <code className="bg-transparent p-0 text-[var(--gh-fg)]">{example.expectedOutput}</code>
                            </p>
                            {example.description && (
                              <p className="text-sm mt-2 text-[var(--gh-fg-muted)] italic">
                                <span className="font-semibold not-italic">Note:</span> {example.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => setShowHints(!showHints)}
                    >
                      <span className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-[var(--gh-attention-fg)]" />
                        {showHints ? "Hide Hints" : "Need a hint?"}
                      </span>
                      {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>

                    {showHints && currentChallenge.hints && (
                      <div className="mt-4 p-4 bg-[var(--gh-attention-subtle)] border border-[var(--gh-attention-fg)]/20 rounded-md">
                        <p className="text-sm text-[var(--gh-attention-fg)]">
                          {currentChallenge.hints[hintIndex]}
                        </p>
                        {currentChallenge.hints.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-xs h-7 text-[var(--gh-attention-fg)] hover:bg-[var(--gh-attention-fg)]/10"
                            onClick={() => setHintIndex((hintIndex + 1) % currentChallenge.hints.length)}
                          >
                            Next Hint
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Right Pane - Editor & Results (full-width on mobile, flex-1 on desktop) */}
            <div className={`flex-1 flex flex-col min-w-0 bg-[var(--gh-canvas)] ${!resultsExpanded ? 'flex' : 'hidden lg:flex'}`}>
              {/* Editor Toolbar */}
              <div className="h-10 border-b bg-[var(--gh-canvas-subtle)] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                  <span className="text-xs font-medium text-[var(--gh-fg-muted)] uppercase tracking-wider">Code Editor</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={copyCode}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[var(--gh-danger-fg)] hover:bg-[var(--gh-danger-subtle)]" onClick={resetCode}>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 relative overflow-hidden">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  height="100%"
                />
              </div>

              {/* Bottom Results Panel */}
              <div className={`border-t flex flex-col bg-[var(--gh-canvas)] transition-all duration-300 ${resultsExpanded ? 'h-1/3 min-h-[200px]' : 'h-10'}`}>
                <div
                  className="h-10 border-b bg-[var(--gh-canvas-subtle)] flex items-center justify-between px-4 cursor-pointer shrink-0"
                  onClick={() => setResultsExpanded(!resultsExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                    <span className="text-xs font-medium text-[var(--gh-fg-muted)] uppercase tracking-wider">Test Results</span>
                    {testResults.length > 0 && (
                      <Badge variant="outline" className={`ml-2 h-5 px-1.5 text-[10px] ${
                        testResults.every(r => r.passed) ? "bg-[var(--gh-success-subtle)] text-[var(--gh-success-fg)] border-[var(--gh-success-fg)]/30" : "bg-[var(--gh-danger-subtle)] text-[var(--gh-danger-fg)] border-[var(--gh-danger-fg)]/30"
                      }`}>
                        {testResults.filter(r => r.passed).length}/{testResults.length} Passed
                      </Badge>
                    )}
                  </div>
                  {resultsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>

                {resultsExpanded && (
                  <ScrollArea className="flex-1 p-4">
                    {testResults.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-[var(--gh-fg-muted)] space-y-2 opacity-60">
                        <Play className="w-8 h-8" />
                        <p className="text-sm">Run your code to see test results</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {testResults.map((result, idx) => {
                          const testCase = currentChallenge.testCases.find(tc => tc.id === result.testCaseId);
                          return (
                            <div key={result.testCaseId} className={`rounded-md border p-3 ${result.passed ? 'bg-[var(--gh-success-subtle)] border-[var(--gh-success-fg)]/30' : 'bg-[var(--gh-danger-subtle)] border-[var(--gh-danger-fg)]/30'}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {result.passed ? (
                                    <CheckCircle className="w-4 h-4 text-[var(--gh-success-fg)]" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-[var(--gh-danger-fg)]" />
                                  )}
                                  <span className={`text-sm font-semibold ${result.passed ? 'text-[var(--gh-success-fg)]' : 'text-[var(--gh-danger-fg)]'}`}>
                                    Test Case {idx + 1}: {result.passed ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                                <div className="bg-[var(--gh-canvas-inset)] p-2 rounded border">
                                  <p className="text-[var(--gh-fg-muted)] mb-1 uppercase text-[9px] font-bold">Input</p>
                                  <p className="text-[var(--gh-fg)]">{testCase?.input || 'N/A'}</p>
                                </div>
                                <div className="bg-[var(--gh-canvas-inset)] p-2 rounded border">
                                  <p className="text-[var(--gh-fg-muted)] mb-1 uppercase text-[9px] font-bold">Expected</p>
                                  <p className="text-[var(--gh-fg)]">{testCase?.expectedOutput || 'N/A'}</p>
                                </div>
                                <div className={`col-span-full p-2 rounded border ${result.passed ? 'bg-[var(--gh-success-subtle)]/30' : 'bg-[var(--gh-danger-subtle)]/30 border-[var(--gh-danger-fg)]/30'}`}>
                                  <p className="text-[var(--gh-fg-muted)] mb-1 uppercase text-[9px] font-bold">Actual Output</p>
                                  <p className={result.passed ? 'text-[var(--gh-success-fg)]' : 'text-[var(--gh-danger-fg)]'}>{result.actualOutput}</p>
                                </div>
                              </div>
                              {!result.passed && result.error && (
                                <div className="mt-3 p-2 bg-[var(--gh-danger-subtle)]/30 border border-[var(--gh-danger-fg)]/30 rounded text-[11px] font-mono text-[var(--gh-danger-fg)]">
                                  <p className="font-bold mb-1 uppercase text-[9px]">Error Message</p>
                                  {result.error}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {testResults.every(r => r.passed) && currentChallenge.complexity && (
                          <div className="mt-6 p-4 bg-[var(--gh-accent-subtle)]/30 border border-[var(--gh-accent-fg)]/30 rounded-md">
                            <h4 className="text-sm font-bold text-[var(--gh-accent-fg)] mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Complexity Analysis
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-[10px] text-[var(--gh-accent-fg)] uppercase font-bold">Time Complexity</p>
                                <p className="text-sm font-mono text-[var(--gh-fg)]">{currentChallenge.complexity.time}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-[var(--gh-accent-fg)] uppercase font-bold">Space Complexity</p>
                                <p className="text-sm font-mono text-[var(--gh-fg)]">{currentChallenge.complexity.space}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEOHead
        title="Coding Challenges | Code Reels"
        description="Practice coding interview problems with instant feedback"
      />
      
      <div className="bg-[var(--gh-canvas-subtle)] min-h-screen">
        {/* Page Header */}
        <div className="bg-[var(--gh-canvas)] border-b px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-[var(--gh-fg)]">Coding Challenges</h1>
                <p className="text-[var(--gh-fg-muted)]">Master algorithms and technical interviews with instant code execution.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => startRandom()}
                  variant="outline"
                  className="bg-[var(--gh-canvas)] border-[var(--gh-border)] text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-subtle)]"
                >
                  <Zap className="w-4 h-4 mr-2 text-[var(--gh-attention-fg)]" />
                  Random Challenge
                </Button>
                <Button
                  onClick={() => startRandom('easy')}
                  className="bg-[var(--gh-success-emphasis)] hover:bg-[var(--gh-success-emphasis)]/80 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Quick Start
                </Button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Challenges Attempted', value: stats.totalAttempts, icon: Target, color: 'text-[var(--gh-accent-fg)]' },
                { label: 'Challenges Passed', value: stats.passedChallenges, icon: CheckCircle, color: 'text-[var(--gh-success-fg)]' },
                { label: 'Average Time', value: `${Math.floor(stats.averageTime / 60)}m`, icon: Clock, color: 'text-[var(--gh-attention-fg)]' },
                { label: 'Total Solved', value: solvedIds.size, icon: Trophy, color: 'text-[var(--gh-attention-fg)]' },
              ].map((stat, i) => (
                <Card key={i} className="bg-[var(--gh-canvas-subtle)] border-[var(--gh-border)]/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`p-2 rounded-md bg-[var(--gh-canvas)] border ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--gh-fg-muted)] uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-bold text-[var(--gh-fg)]">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Challenge List Filter & Search */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gh-fg-subtle)]" />
              <input
                type="text"
                placeholder="Search challenges..."
                className="w-full bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gh-accent-fg)]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex p-1 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md">
                {(['all', 'easy', 'medium'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-sm capitalize transition-all ${
                      difficultyFilter === diff 
                        ? 'bg-[var(--gh-accent-fg)] text-white' 
                        : 'text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] animate-pulse" />
              ))
            ) : filteredChallenges.length > 0 ? (
              filteredChallenges.map((challenge) => (
                <Card 
                  key={challenge.id} 
                  className={`group cursor-pointer border-[var(--gh-border)] hover:border-[var(--gh-accent-fg)] transition-all bg-[var(--gh-canvas)] ${
                    solvedIds.has(challenge.id) ? 'bg-[var(--gh-success-subtle)]/30' : ''
                  }`}
                  onClick={() => startChallenge(challenge)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {solvedIds.has(challenge.id) ? (
                          <CheckCircle className="w-4 h-4 text-[var(--gh-success-fg)]" />
                        ) : (
                          <Terminal className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                        )}
                        <span className="text-xs font-semibold text-[var(--gh-fg-muted)] uppercase tracking-wider">
                          {challenge.category}
                        </span>
                      </div>
                      <Badge variant="outline" className={
                        challenge.difficulty === 'easy' 
                          ? "bg-[var(--gh-success-subtle)] text-[var(--gh-success-fg)] border-[var(--gh-success-fg)]/20"
                          : "bg-[var(--gh-attention-subtle)] text-[var(--gh-attention-fg)] border-[var(--gh-attention-fg)]/20"
                      }>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-[var(--gh-accent-fg)] transition-colors mb-2">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-[var(--gh-fg-muted)] line-clamp-2 mb-4 h-10">
                      {challenge.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--gh-border)]/50">
                      <div className="flex items-center gap-4 text-xs font-medium text-[var(--gh-fg-muted)]">
                        <span className="flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" />
                          {challenge.tags[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {challenge.timeLimit}m
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 group-hover:bg-[var(--gh-accent-fg)] group-hover:text-white transition-all">
                        Solve <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-[var(--gh-fg-muted)] bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md border-dashed">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-lg font-bold">No challenges found</h3>
                <p className="text-sm">Try adjusting your search or filters.</p>
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => { setSearchQuery(''); setDifficultyFilter('all'); }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
