/**
 * Coding Challenge GenZ - Premium Claymorphism + Glassmorphism UI
 * Premium Pro Max design with smooth code editor, clay cards, and glass effects
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, RotateCcw, Eye, EyeOff, Clock, CheckCircle, XCircle,
  Code, Lightbulb, ChevronRight, Zap, Trophy, AlertCircle, Copy, Check,
  TrendingUp, Sparkles, Brain, Flame, Target, Award, Cpu, Terminal,
  Layers, GitBranch, Bug, Zap as FastIcon, Infinity, Hash
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { AppLayout } from '../components/layout/AppLayout';
import { CodeEditor, CodeDisplay } from '../components/CodeEditor';
import {
  CodingChallenge as Challenge, Language, TestResult,
  getAllChallengesAsync, getChallengeById, getRandomChallenge,
  runTestsAsync, saveChallengeAttempt, analyzeCodeComplexity,
  getCodingStats, getSolvedChallengeIds, ComplexityAnalysis,
} from '../lib/coding-challenges';
import { useCredits } from '../context/CreditsContext';

type ViewState = 'list' | 'challenge';

const CODING_LANGUAGE_KEY = 'coding-preferred-language';
const CODING_PROGRESS_PREFIX = 'coding-progress-';

// Design System - Use CSS variables from design-system.css / genz-design-system.css
// Primary accent: var(--color-accent-cyan)
// Secondary accent: var(--color-accent-purple)
// Tertiary accent: var(--color-accent-pink)
// Success: var(--color-success)
// Warning: var(--color-warning)
// Error: var(--color-error)

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
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userComplexity, setUserComplexity] = useState<ComplexityAnalysis | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => getSolvedChallengeIds());
  const [startTime, setStartTime] = useState<number>(Date.now());

  const stats = getCodingStats();
  const { balance, formatCredits } = useCredits();

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
        setShowSolution(false);
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
    setShowSolution(false);
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
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  }, [code, currentChallenge, language]);

  const resetCode = useCallback(() => {
    if (currentChallenge) {
      setCode(currentChallenge.starterCode[language]);
      setTestResults([]);
      setShowSolution(false);
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

  const allPassed = testResults.length > 0 && testResults.every((r) => r.passed);
  const someTests = testResults.length > 0;
  const passedCount = testResults.filter((r) => r.passed).length;

  const easyChallenges = challenges.filter(c => c.difficulty === 'easy');
  const mediumChallenges = challenges.filter(c => c.difficulty === 'medium');

  return (
    <>
      <SEOHead
        title="Coding Challenges | Code Reels"
        description="Practice coding interview problems with instant feedback"
        canonical="https://open-interview.github.io/coding"
      />

      <AppLayout fullWidth hideNav>
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-base-black)] via-[var(--color-base-dark)] to-[var(--color-base-black)] text-[var(--color-text-primary)] overflow-x-hidden">
          <style>{`
            @keyframes gradient-shift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes clay-float {
              0%, 100% { transform: translateY(0) rotateX(0) rotateY(0); }
              50% { transform: translateY(-5px) rotateX(2deg) rotateY(-2deg); }
            }
            @keyframes gradient-orb {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(30px, -30px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
            }
            .animate-gradient {
              background-size: 200% 200%;
              animation: gradient-shift 8s ease infinite;
            }
            .animate-float {
              animation: float 6s ease-in-out infinite;
            }
            .animate-clay-float {
              animation: clay-float 8s ease-in-out infinite;
            }
            .animate-orb {
              animation: gradient-orb 20s ease-in-out infinite;
            }
            /* Claymorphism Base - Design System */
            .clay {
              background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
              backdrop-filter: blur(20px);
              border-radius: 24px;
              border: 1px solid rgba(255, 255, 255, 0.08);
              box-shadow: 
                8px 8px 16px rgba(0, 0, 0, 0.4),
                -4px -4px 12px rgba(255, 255, 255, 0.03),
                inset 0 1px 0 rgba(255, 255, 255, 0.06);
            }
            .clay-sm {
              background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01));
              backdrop-filter: blur(16px);
              border-radius: 16px;
              border: 1px solid rgba(255, 255, 255, 0.06);
              box-shadow: 
                4px 4px 12px rgba(0, 0, 0, 0.3),
                -2px -4px 8px rgba(255, 255, 255, 0.02),
                inset 0 1px 0 rgba(255, 255, 255, 0.04);
            }
            .clay-inset {
              background: linear-gradient(145deg, rgba(0,0,0,0.25), rgba(0,0,0,0.15));
              border-radius: 16px;
              box-shadow: 
                inset 4px 4px 8px rgba(0, 0, 0, 0.35),
                inset -2px -2px 6px rgba(255, 255, 255, 0.03);
            }
            /* Glassmorphism - Design System */
            .glass {
              background: rgba(255, 255, 255, 0.04);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.06);
            }
            .glass-strong {
              background: rgba(255, 255, 255, 0.06);
              backdrop-filter: blur(30px);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            /* Primary Button - Cyan/Purple Gradient - Design System */
            .clay-btn-primary {
              background: linear-gradient(135deg, var(--color-accent-cyan) 0%, var(--color-accent-purple) 100%);
              border-radius: 16px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 
                0 4px 20px var(--glow-cyan),
                inset 0 1px 0 rgba(255, 255, 255, 0.3),
                inset 0 -2px 0 rgba(0, 0, 0, 0.1);
              transition: all 0.3s ease;
            }
            .clay-btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 
                0 8px 30px var(--glow-cyan),
                0 0 40px var(--glow-purple),
                inset 0 1px 0 rgba(255, 255, 255, 0.35),
                inset 0 -2px 0 rgba(0, 0, 0, 0.1);
            }
            .clay-btn-primary:active {
              transform: translateY(0);
              box-shadow: 
                0 2px 10px var(--glow-cyan),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            /* Code Font */
            .code-font {
              font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;
            }
            /* Shimmer Text - Cyan/Purple/Pink - Design System */
            .shimmer-text {
              background: linear-gradient(90deg, var(--color-accent-cyan), var(--color-accent-purple), var(--color-accent-pink), var(--color-accent-cyan));
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: shimmer 3s linear infinite;
            }
            /* Gradient Border - Design System */
            .gradient-border {
              position: relative;
            }
            .gradient-border::before {
              content: '';
              position: absolute;
              inset: 0;
              border-radius: inherit;
              padding: 1px;
              background: linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple), var(--color-accent-pink));
              -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
              background-size: 200% auto;
              animation: shimmer 3s linear infinite;
            }
            /* Clay Card Hover - Design System */
            .clay-card {
              transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .clay-card:hover {
              transform: translateY(-8px) scale(1.02);
              box-shadow: 
                12px 12px 24px rgba(0, 0, 0, 0.4),
                -6px -6px 16px rgba(255, 255, 255, 0.05),
                0 0 30px var(--glow-cyan);
            }
            /* Status Badge - Design System */
            .status-solved {
              background: linear-gradient(145deg, var(--color-success) 0.15, var(--color-success) 0.05);
              border: 1px solid var(--color-success);
              box-shadow: 0 0 15px var(--glow-success);
            }
            .status-unsolved {
              background: linear-gradient(145deg, var(--color-accent-cyan) 0.08, var(--color-accent-cyan) 0.02);
              border: 1px solid var(--color-accent-cyan);
            }
            /* Difficulty Badges - Design System */
            .badge-easy {
              background: linear-gradient(145deg, var(--color-success) 0.15, var(--color-success) 0.05);
              border: 1px solid var(--color-success);
              color: var(--color-success-light);
            }
            .badge-medium {
              background: linear-gradient(145deg, var(--color-accent-purple) 0.15, var(--color-accent-purple) 0.05);
              border: 1px solid var(--color-accent-purple);
              color: var(--color-accent-purple-light);
            }
            /* Scrollbar - Design System */
            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            ::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.03);
              border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb {
              background: var(--color-accent-cyan);
              opacity: 0.2;
              border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: var(--color-accent-cyan);
              opacity: 0.35;
            }
          `}</style>

          {/* Animated Background with Orbs - Design System Colors */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-base-black)] via-[var(--color-base-dark)] to-[var(--color-base-black)]" />
            
            {/* Floating Orbs - Cyan/Purple/Pink */}
            <div className="absolute top-20 left-20 w-[400px] h-[400px] rounded-full animate-orb"
                 style={{ 
                   background: 'radial-gradient(circle, var(--glow-cyan))',
                   filter: 'blur(60px)'
                 }} 
            />
            <div className="absolute bottom-40 right-20 w-[350px] h-[350px] rounded-full animate-orb"
                 style={{ 
                   background: 'radial-gradient(circle, var(--glow-purple))',
                   filter: 'blur(50px)',
                   animationDelay: '-5s'
                 }} 
            />
            <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full animate-orb"
                 style={{ 
                   background: 'radial-gradient(circle, var(--glow-pink))',
                   filter: 'blur(40px)',
                   animationDelay: '-10s'
                 }} 
            />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0" 
                 style={{ 
                   backgroundImage: `radial-gradient(var(--color-accent-cyan) 1px, transparent 1px)`, 
                   backgroundSize: '50px 50px',
                   opacity: 0.05
                 }} 
            />
            
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px]"
                 style={{
                   background: 'radial-gradient(ellipse, var(--glow-cyan))',
                   filter: 'blur(40px)'
                 }}
            />
          </div>

          {/* List View */}
          {viewState === 'list' && (
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-semibold">HOME</span>
                </button>

                {/* Hero Card with Claymorphism - Design System */}
                <div className="relative rounded-[32px] overflow-hidden mb-8">
                  {/* Background gradient - Dark with accent glows */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-base-dark)] via-[var(--color-base-darker)] to-[var(--color-base-black)] animate-gradient" />
                  
                  {/* Decorative orbs inside card - Cyan/Purple */}
                  <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full animate-float"
                       style={{ background: 'radial-gradient(circle, var(--color-accent-cyan) 0%, transparent 70%)' }}
                  />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full animate-float"
                       style={{ 
                         background: 'radial-gradient(circle, var(--color-accent-purple) 0%, transparent 70%)',
                         animationDelay: '-2s'
                       }}
                  />
                  
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
                  
                  <div className="relative p-8 md:p-12">
                    {/* PRO Badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/30">
                        <span className="text-sm">⚡</span> PRO MAX
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-6 mb-4">
                      {/* Clay Icon - Cyan accent */}
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-[24px] clay flex items-center justify-center animate-clay-float"
                           style={{ boxShadow: '0 8px 32px var(--glow-cyan)' }}>
                        <Terminal className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" />
                      </div>
                      <div>
                        <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tight">
                          <span className="shimmer-text">CODE</span> ARENA
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl font-medium">Master algorithms & crush your interviews</p>
                      </div>
                    </div>
                    
                    {/* Feature Pills - Design System */}
                    <div className="flex flex-wrap gap-3 mt-8">
                      <div className="clay-sm px-5 py-2.5 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-semibold text-foreground/80">AI-Powered</span>
                      </div>
                      <div className="clay-sm px-5 py-2.5 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-semibold text-foreground/80">Instant Feedback</span>
                      </div>
                      <div className="clay-sm px-5 py-2.5 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-foreground/80">Earn Badges</span>
                      </div>
                      <div className="clay-sm px-5 py-2.5 flex items-center gap-2">
                        <Infinity className="w-4 h-4 text-pink-400" />
                        <span className="text-sm font-semibold text-foreground/80">Unlimited Practice</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats Grid - Clay Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12"
              >
                {/* Solved */}
                <div className="clay p-6 gradient-border">
                  <div className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-4"
                       style={{ 
background: 'linear-gradient(145deg, var(--color-success), var(--color-success-light))',
                          boxShadow: '0 4px 15px var(--glow-success)'
                       }}>
                    <Trophy className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-4xl font-black mb-1 shimmer-text">{stats.passedChallenges}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Solved</div>
                </div>
                
                {/* Attempts */}
                <div className="clay p-6">
                  <div className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-4"
                       style={{ 
background: 'linear-gradient(145deg, var(--color-info), var(--color-info-light))',
                          boxShadow: '0 4px 15px var(--glow-cyan)'
                       }}>
                    <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-4xl font-black mb-1">{stats.totalAttempts}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Attempts</div>
                </div>
                
                {/* Challenges */}
                <div className="clay p-6">
                  <div className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-4"
                       style={{ 
background: 'linear-gradient(145deg, var(--color-accent-purple), var(--color-accent-purple-light))',
                          boxShadow: '0 4px 15px var(--glow-purple)'
                       }}>
                    <Flame className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-4xl font-black mb-1">{challenges.length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Challenges</div>
                </div>
                
                {/* Credits */}
                <div className="clay p-6 gradient-border">
                  <div className="w-12 h-12 rounded-[16px] flex items-center justify-center mb-4"
                       style={{ 
background: 'linear-gradient(145deg, var(--color-warning), var(--color-warning-light))',
                          boxShadow: '0 4px 15px var(--glow-warning)'
                       }}>
                    <Award className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-4xl font-black mb-1">{formatCredits(balance)}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Credits</div>
                </div>
              </motion.div>

              {/* Quick Start - Clay Button Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                  <FastIcon className="w-5 h-5" style={{ color: 'var(--color-accent-cyan)' }} />
                  <span className="shimmer-text">QUICK START</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Random Button - Cyan/Purple */}
                  <motion.button
                    onClick={() => startRandom()}
                    whileHover={{ scale: 1.03, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="clay-card relative p-7 rounded-[28px] text-left group overflow-hidden"
                    style={{ background: 'linear-gradient(145deg, var(--color-accent-cyan), var(--color-accent-purple))', opacity: 0.1 }}
                  >
                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                         style={{ 
                           background: 'radial-gradient(circle, var(--color-accent-cyan) 0%, transparent 70%)',
                           filter: 'blur(20px)'
                         }}
                    />
                    <div className="relative">
                      <div className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                           style={{ 
                             background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))',
                             boxShadow: '0 6px 20px var(--glow-cyan)'
                           }}>
                        <Sparkles className="w-7 h-7 text-foreground" />
                      </div>
                      <div className="text-xl font-black mb-1">Random</div>
                      <div className="text-sm text-muted-foreground font-medium">Surprise me!</div>
                    </div>
                  </motion.button>
                  
                  {/* Easy Button */}
                  <motion.button
                    onClick={() => startRandom('easy')}
                    whileHover={{ scale: 1.03, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="clay-card relative p-7 rounded-[28px] text-left group"
                    style={{ background: 'linear-gradient(145deg, var(--color-success), transparent)', opacity: 0.1 }}
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                           style={{ 
                             background: 'linear-gradient(145deg, var(--color-success), var(--color-success-light))',
                             boxShadow: '0 6px 20px var(--glow-success)'
                           }}>
                        <span className="text-foreground font-black text-2xl">E</span>
                      </div>
                      <div className="text-xl font-black mb-1">Easy</div>
                      <div className="text-sm text-muted-foreground font-medium">{easyChallenges.length} challenges</div>
                    </div>
                  </motion.button>
                  
                  {/* Medium Button */}
                  <motion.button
                    onClick={() => startRandom('medium')}
                    whileHover={{ scale: 1.03, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="clay-card relative p-7 rounded-[28px] text-left group"
                    style={{ background: 'linear-gradient(145deg, var(--color-warning), transparent)', opacity: 0.1 }}
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                           style={{ 
                             background: 'linear-gradient(145deg, var(--color-warning), var(--color-warning-light))',
                             boxShadow: '0 6px 20px var(--glow-warning)'
                           }}>
                        <span className="text-foreground font-black text-2xl">M</span>
                      </div>
                      <div className="text-xl font-black mb-1">Medium</div>
                      <div className="text-sm text-muted-foreground font-medium">{mediumChallenges.length} challenges</div>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Challenge List - Clay Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                  <Layers className="w-5 h-5 text-purple-400" />
                  ALL CHALLENGES
                </h2>
                <div className="space-y-4">
                  {challenges.map((challenge, idx) => {
                    const isSolved = solvedIds.has(challenge.id);
                    return (
                      <motion.button
                        key={challenge.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        onClick={() => startChallenge(challenge)}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full p-5 clay rounded-[24px] text-left group transition-all ${
                          isSolved 
                            ? 'status-solved' 
                            : 'status-unsolved hover:border-cyan-400/30'
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          {/* Icon */}
                          <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0 ${
                            isSolved 
                              ? '' 
                              : 'clay-sm'
                          }`}
                          style={isSolved ? {
                            background: 'linear-gradient(145deg, var(--color-success), var(--color-success-light))',
                            boxShadow: '0 4px 15px var(--glow-success)'
                          } : {}}
                          >
                            {isSolved ? (
                              <CheckCircle className="w-7 h-7 text-emerald-400" />
                            ) : (
                              <Code className="w-7 h-7 text-muted-foreground" />
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg mb-1.5 group-hover:text-cyan-300 transition-colors truncate">
                              {challenge.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{challenge.description}</p>
                          </div>
                          
                          {/* Right Side */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className={`px-4 py-2 rounded-xl text-xs font-bold ${
                              challenge.difficulty === 'easy'
                                ? 'badge-easy'
                                : 'badge-medium'
                            }`}>
                              {challenge.difficulty.toUpperCase()}
                            </span>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-card/50 group-hover:bg-cyan-500/20 transition-colors">
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}

          {/* Challenge View */}
          {viewState === 'challenge' && currentChallenge && (
            <div className="h-screen flex flex-col relative z-10">
              {/* Header - Design System */}
              <header className="border-b border-border bg-[var(--color-base-dark)]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <button
                      onClick={goBack}
                      className="p-3 clay-sm hover:bg-card/50 rounded-xl transition-colors flex-shrink-0"
                    >
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="font-black text-lg truncate">{currentChallenge.title}</h2>
                        <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold rounded-full flex-shrink-0 shadow-lg shadow-amber-500/20">
                          PRO
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                          currentChallenge.difficulty === 'easy'
                            ? 'badge-easy'
                            : 'badge-medium'
                        }`}>
                          {currentChallenge.difficulty.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground truncate flex items-center gap-2">
                          <Hash className="w-3 h-3" />
                          {currentChallenge.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="clay-sm px-4 py-2">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="bg-transparent border-none text-sm font-semibold text-foreground cursor-pointer focus:outline-none"
                      >
                        <option value="javascript" className="bg-[var(--color-base-dark)]">JavaScript</option>
                        <option value="python" className="bg-[var(--color-base-dark)]">Python</option>
                      </select>
                    </div>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Panel - Problem Description */}
                <div className="md:w-[450px] border-b md:border-b-0 md:border-r border-border flex flex-col overflow-hidden max-h-[40vh] md:max-h-none">
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                    {/* Description - Clay Card */}
                    <div className="clay p-5 rounded-[20px]">
                      <h3 className="text-xs font-bold mb-4 uppercase tracking-wider flex items-center gap-2"
                          style={{ color: 'var(--color-accent-cyan)' }}>
                        <Bug className="w-4 h-4" />
                        Problem
                      </h3>
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {currentChallenge.description}
                      </p>
                    </div>

                    {/* Examples - Clay Cards */}
                    <div>
                      <h3 className="text-xs font-bold mb-4 uppercase tracking-wider flex items-center gap-2 text-cyan-400">
                        <Terminal className="w-4 h-4" />
                        Examples
                      </h3>
                      <div className="space-y-3">
                        {currentChallenge.testCases.slice(0, 2).map((tc, idx) => (
                          <div key={tc.id} className="clay-sm rounded-[16px] p-4">
                            <div className="text-xs text-muted-foreground mb-3 font-semibold">Example {idx + 1}</div>
                            <div className="font-mono text-xs space-y-2">
                              <div className="flex gap-2">
                                <span className="text-cyan-400 font-bold">Input:</span>
                                <span className="text-foreground">{tc.input}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-emerald-400 font-bold">Output:</span>
                                <span className="text-foreground font-bold">{tc.expectedOutput}</span>
                              </div>
                              {tc.description && (
                                <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                                  {tc.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hints - Clay Cards */}
                    <div>
                      <button
                        onClick={() => setShowHints(!showHints)}
                        className="flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity mb-4"
                        style={{ color: 'var(--color-warning)' }}
                      >
                        <Lightbulb className="w-5 h-5" />
                        {showHints ? 'Hide Hints' : `Show Hints (${currentChallenge.hints.length})`}
                      </button>
                      <AnimatePresence>
                        {showHints && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                          >
                            {currentChallenge.hints.slice(0, hintIndex + 1).map((hint, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="clay-sm rounded-[16px] p-4"
                                style={{ 
background: 'linear-gradient(145deg, var(--color-warning), transparent)',
                                   border: '1px solid var(--color-warning)'
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning-light)' }} />
                                  <div>
                                    <div className="text-xs font-bold mb-1" style={{ color: 'var(--color-warning)' }}>Hint {i + 1}</div>
                                    <div className="text-sm text-foreground/80">{hint}</div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            {hintIndex < currentChallenge.hints.length - 1 && (
                              <button
                                onClick={() => setHintIndex(hintIndex + 1)}
                                className="text-sm font-semibold hover:underline"
                                style={{ color: 'var(--color-warning)' }}
                              >
                                Show next hint →
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Complexity Analysis - Clay Card */}
                    {userComplexity && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <h3 className="text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2 text-pink-400">
                          <Brain className="w-4 h-4" />
                          Your Code Analysis
                        </h3>
                        <div className="clay-sm rounded-[16px] p-5"
                             style={{ 
                               background: 'linear-gradient(145deg, var(--color-accent-pink), transparent)',
                               border: '1px solid var(--color-accent-pink)'
                             }}>
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-muted-foreground">Time Complexity:</span>
                            <span className="font-mono font-bold text-pink-400">{userComplexity.time}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-4">
                            <span className="text-muted-foreground">Space Complexity:</span>
                            <span className="font-mono font-bold text-pink-400">{userComplexity.space}</span>
                          </div>
                          <div className="text-xs text-muted-foreground pt-3 border-t border-pink-500/20">
                            {userComplexity.explanation}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Optimal Complexity */}
                    {showSolution && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <h3 className="text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2 text-emerald-400">
                          <Sparkles className="w-4 h-4" />
                          Optimal Solution
                        </h3>
                        <div className="clay-sm rounded-[16px] p-5"
                             style={{ 
background: 'linear-gradient(145deg, var(--color-success), transparent)',
                                border: '1px solid var(--color-success)'
                             }}>
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-mono font-bold text-emerald-400">{currentChallenge.complexity.time}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-4">
                            <span className="text-muted-foreground">Space:</span>
                            <span className="font-mono font-bold text-emerald-400">{currentChallenge.complexity.space}</span>
                          </div>
                          <div className="text-xs text-muted-foreground pt-3 border-t border-emerald-500/20">
                            {currentChallenge.complexity.explanation}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Right Panel - Code Editor */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  {/* Editor Header - Clay Style */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border clay-sm mx-4 mt-4 rounded-[16px]">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50" />
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {language === 'javascript' ? 'solution.js' : 'solution.py'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyCode}
                        className="p-2.5 hover:bg-card/50 rounded-xl transition-colors"
                        title="Copy code"
                        aria-label="Copy code"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={resetCode}
                        className="p-2.5 hover:bg-card/50 rounded-xl transition-colors"
                        title="Reset code"
                        aria-label="Reset code"
                      >
                        <RotateCcw className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Monaco Editor */}
                  <div className="flex-1 overflow-hidden mx-4 my-3">
                    <div className="h-full rounded-[20px] overflow-hidden clay-inset border border-border">
                      <CodeEditor
                        value={code}
                        onChange={setCode}
                        language={language}
                        height="100%"
                      />
                    </div>
                  </div>

                  {/* Test Results - Clay Card */}
                  {someTests && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t border-border p-5 max-h-52 md:max-h-64 overflow-y-auto mx-4 mb-4 rounded-[20px] clay"
                    >
                      <div className="flex items-center gap-4 mb-5">
                        {allPassed ? (
                          <>
                            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                                 style={{ 
background: 'linear-gradient(145deg, var(--color-success), var(--color-success-light))',
                                    boxShadow: '0 4px 15px var(--glow-success)'
                                 }}>
                              <CheckCircle className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                              <div className="font-black text-emerald-400 text-lg">All Tests Passed!</div>
                              <div className="text-xs text-muted-foreground">{testResults.length} test cases</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                                 style={{ 
background: 'linear-gradient(145deg, var(--color-error), var(--color-error-light))',
                                    boxShadow: '0 4px 15px var(--glow-error)'
                                 }}>
                              <XCircle className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                              <div className="font-black text-red-400 text-lg">
                                {passedCount}/{testResults.length} Tests Passed
                              </div>
                              <div className="text-xs text-muted-foreground">Keep trying!</div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="space-y-2.5">
                        {testResults.map((result, i) => {
                          const tc = currentChallenge.testCases[i];
                          return (
                            <div
                              key={result.testCaseId}
                              className={`p-4 rounded-[14px] border`}
                              style={result.passed ? {
background: 'linear-gradient(145deg, var(--color-success), transparent)',
                                 border: '1px solid var(--color-success)'
                              } : {
background: 'linear-gradient(145deg, var(--color-error), transparent)',
                                 border: '1px solid var(--color-error)'
                              }}
                            >
                              <div className="flex items-center gap-2.5 mb-2">
                                {result.passed ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                )}
                                <span className="font-mono font-bold text-xs">Test {i + 1}</span>
                                {result.executionTime !== undefined && (
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {result.executionTime.toFixed(2)}ms
                                  </span>
                                )}
                              </div>
                              {!result.passed && (
                                <div className="pl-7 text-xs font-mono space-y-1">
                                  {result.error ? (
                                    <div className="text-red-400 break-words">{result.error}</div>
                                  ) : (
                                    <>
                                      <div className="break-words"><span className="text-cyan-400">Input:</span> {tc?.input}</div>
                                      <div className="break-words"><span className="text-emerald-400">Expected:</span> {tc?.expectedOutput}</div>
                                      <div className="break-words"><span className="text-red-400">Got:</span> {result.actualOutput}</div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Action Bar - Clay Style */}
                  <div className="border-t border-border p-5 flex items-center justify-between">
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="flex items-center gap-2.5 px-5 py-3 clay-sm rounded-[14px] text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-cyan-400/30 transition-colors"
                    >
                      {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showSolution ? 'Hide Solution' : 'Show Solution'}</span>
                    </button>
                    <motion.button
                      onClick={runCode}
                      disabled={isRunning}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="clay-btn-primary flex items-center gap-2.5 px-8 py-3.5 text-foreground font-black text-sm rounded-[16px]"
                    >
                      {isRunning ? (
                        <>
                          <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                          <span>{language === 'python' ? 'Loading Python...' : 'Running...'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Run Tests</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Solution Modal */}
          <AnimatePresence>
            {showSolution && currentChallenge && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
                onClick={() => setShowSolution(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[var(--color-base-dark)] border border-border rounded-[28px] max-w-3xl w-full max-h-[85vh] md:max-h-[80vh] overflow-hidden clay"
                >
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="font-black text-xl flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      Sample Solution
                    </h2>
                    <button
                      onClick={() => setShowSolution(false)}
                      className="p-2.5 hover:bg-card/50 rounded-xl transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] md:max-h-[60vh]">
                    <div className="rounded-[16px] overflow-hidden clay-inset border border-border">
                      <CodeDisplay
                        code={currentChallenge.sampleSolution[language]}
                        language={language}
                        height="300px"
                      />
                    </div>
                    <div className="mt-6 p-6 rounded-[20px]"
                         style={{ 
background: 'linear-gradient(145deg, var(--color-success), transparent)',
                            border: '1px solid var(--color-success)'
                         }}>
                      <h3 className="text-sm font-bold mb-5 uppercase tracking-wider flex items-center gap-2 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                        Complexity Analysis
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Time Complexity:</span>
                          <span className="font-mono font-bold text-foreground">{currentChallenge.complexity.time}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Space Complexity:</span>
                          <span className="font-mono font-bold text-foreground">{currentChallenge.complexity.space}</span>
                        </div>
                        <div className="text-sm text-muted-foreground pt-4 border-t border-emerald-500/20">
                          {currentChallenge.complexity.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Modal */}
          <AnimatePresence>
            {showSuccessModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-[var(--color-base-dark)] border border-[var(--color-success)]/30 rounded-[28px] max-w-md w-full p-8 text-center"
                  style={{ boxShadow: '0 0 60px var(--glow-success)' }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-[24px] flex items-center justify-center mx-auto mb-6"
                    style={{ 
                      background: 'var(--gradient-primary)',
                      boxShadow: '0 8px 32px var(--glow-cyan)'
                    }}
                  >
                    <Trophy className="w-12 h-12 text-black" />
                  </motion.div>
                  <h2 className="text-3xl font-black mb-2 shimmer-text">Challenge Complete!</h2>
                  <p className="text-muted-foreground mb-8 font-medium">
                    Amazing work! You've solved this challenge.
                  </p>

                  {userComplexity && (
                    <div className="clay-sm rounded-[16px] p-5 mb-6 text-left">
                      <div className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">
                        Your Solution
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-mono font-bold text-foreground">{userComplexity.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Space:</span>
                        <span className="font-mono font-bold text-foreground">{userComplexity.space}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <motion.button
                      onClick={() => {
                        setShowSuccessModal(false);
                        setTestResults([]);
                        startRandom();
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="clay-btn-primary w-full py-4 text-foreground font-black rounded-[16px]"
                    >
                      Next Challenge →
                    </motion.button>
                    <button
                      onClick={() => {
                        setShowSuccessModal(false);
                        setTestResults([]);
                        setViewState('list');
                        setLocation('/coding');
                      }}
                      className="w-full py-4 border border-border rounded-[16px] hover:bg-card/50 transition-colors font-semibold"
                    >
                      Back to List
                    </button>
                  </div>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Review Problem
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AppLayout>
    </>
  );
}
