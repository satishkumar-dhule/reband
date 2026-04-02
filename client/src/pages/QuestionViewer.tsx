import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { getChannel } from '../lib/data';
import { useQuestionsWithPrefetch, useSubChannels, useCompaniesWithCounts } from '../hooks/use-questions';
import { useProgress, trackActivity } from '../hooks/use-progress';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useAchievementContext } from '../context/AchievementContext';
import { SEOHead } from '../components/SEOHead';
import { UnifiedSearch } from '../components/UnifiedSearch';
import { VoiceReminder } from '../components/VoiceReminder';
import { GenZAnswerPanel } from '../components/question/GenZAnswerPanel';
import { FlashcardsTab } from '../components/FlashcardsTab';
import { Haptics } from '../lib/haptics';
import { trackQuestionView } from '../hooks/use-analytics';
import { useUnifiedToast } from '../hooks/use-unified-toast';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, IconButton } from '@/components/unified/Button';
import {
  getCard, recordReview, addToSRS,
  getMasteryLabel, getMasteryColor,
  type ReviewCard, type ConfidenceRating
} from '../lib/spaced-repetition';
import {
  ChevronLeft, ChevronRight, Bookmark, Share2,
  Brain, RotateCcw, Check, Zap, Sparkles, Layers,
  Home, Filter, Calendar, Building2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '../lib/utils';

export default function QuestionViewer() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/channel/:id/:questionId?');
  const channelId = params?.id;
  const questionIdFromUrl = params?.questionId;
  
  console.log('[QuestionViewer] Rendering:', { channelId, params, location: location.substring(0, 50) });
  
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const questionIdFromSearch = searchParams.get('q');
  const targetQuestionId = questionIdFromSearch || questionIdFromUrl;

  const staticChannel = getChannel(channelId || '');
  const { subChannels: apiSubChannels } = useSubChannels(channelId || '');

  const channel = staticChannel ? {
    ...staticChannel,
    subChannels: [
      { id: 'all', name: 'All Topics' },
      ...apiSubChannels.map(sc => ({
        id: sc,
        name: sc.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      }))
    ]
  } : null;

  const [selectedSubChannel, setSelectedSubChannel] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`marked-${channelId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [srsCard, setSrsCard] = useState<ReviewCard | null>(null);
  const [showRatingButtons, setShowRatingButtons] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  type MainViewTab = 'questions' | 'flashcards' | 'voice';
  const [activeMainTab, setActiveMainTab] = useState<MainViewTab>('questions');

  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  
  const { preferences, isSubscribed, subscribeChannel } = useUserPreferences();
  const shuffleEnabled = preferences.shuffleQuestions !== false;
  const prioritizeUnvisited = preferences.prioritizeUnvisited !== false;

  const { trackEvent } = useAchievementContext();
  const { completed, markCompleted, saveLastVisitedIndex } = useProgress(channelId || '');
  const { toast } = useUnifiedToast();

  const { question: currentQuestion, questions, totalQuestions, loading, error } = useQuestionsWithPrefetch(
    channelId || '',
    currentIndex,
    selectedSubChannel,
    selectedDifficulty,
    selectedCompany,
    shuffleEnabled,
    prioritizeUnvisited
  );

  const { companiesWithCounts } = useCompaniesWithCounts(
    channelId || '',
    selectedSubChannel,
    selectedDifficulty
  );

  const [isInitialized, setIsInitialized] = useState(false);

  const nextQuestionRef = useRef<() => void>(() => {});
  const prevQuestionRef = useRef<() => void>(() => {});
  
  useEffect(() => {
    if (!currentQuestion) return;
    const card = getCard(currentQuestion.id, currentQuestion.channel, currentQuestion.difficulty);
    setSrsCard(card);
    setShowRatingButtons(false);
    setHasRated(false);
    setIsAnswerRevealed(false);
  }, [currentQuestion]);
  
  useEffect(() => {
    if (loading || questions.length === 0) return;
    
    if (targetQuestionId) {
      const foundIndex = questions.findIndex(q => q.id === targetQuestionId);
      if (foundIndex === -1) {
        // Question not found - show error and redirect to first question
        toast({
          title: "Question not found",
          description: "The requested question could not be found in this channel",
        });
        if (questions[0]) {
          setLocation(`/channel/${channelId}/${questions[0].id}`, { replace: true });
        }
      } else if (foundIndex !== currentIndex) {
        setCurrentIndex(foundIndex);
      }
      if (questionIdFromSearch) {
        setLocation(`/channel/${channelId}/${targetQuestionId}`, { replace: true });
      }
      setIsInitialized(true);
    } else if (questions[0] && !isInitialized) {
      setLocation(`/channel/${channelId}/${questions[0].id}`, { replace: true });
      setIsInitialized(true);
    }
    // Intentionally omit currentIndex, isInitialized from deps - this effect initializes state, not reacts to it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetQuestionId, questions.length, channelId, loading, questionIdFromSearch]);

  useEffect(() => {
    if (channelId && channel && !isSubscribed(channelId) && !loading && totalQuestions > 0 && questions.length > 0) {
      subscribeChannel(channelId);
      toast({
        title: "Channel added",
        description: `${channel.name} added to your channels`,
      });
    }
  }, [channelId, channel, loading, totalQuestions, questions.length, isSubscribed, subscribeChannel, toast]);

  useEffect(() => {
    if (totalQuestions > 0 && currentIndex >= totalQuestions) {
      setCurrentIndex(0);
    }
  }, [totalQuestions, currentIndex]);

  useEffect(() => {
    if (!isInitialized || loading || !channelId || !currentQuestion) return;
    
    if (currentQuestion.id !== targetQuestionId) {
      setLocation(`/channel/${channelId}/${currentQuestion.id}`, { replace: true });
    }
    saveLastVisitedIndex(currentIndex);
  }, [currentIndex, isInitialized, loading, channelId, currentQuestion, targetQuestionId, setLocation, saveLastVisitedIndex]);

  useEffect(() => {
    if (currentQuestion) {
      trackQuestionView(currentQuestion.id, currentQuestion.channel, currentQuestion.difficulty);
      markCompleted(currentQuestion.id);
      trackActivity();
      
      trackEvent('question_completed', {
        questionId: currentQuestion.id,
        difficulty: currentQuestion.difficulty,
        channel: currentQuestion.channel,
      });
    }
  }, [currentQuestion, trackEvent, markCompleted]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Use refs to avoid stale closure issues with keyboard navigation
  useEffect(() => {
    nextQuestionRef.current = nextQuestion;
  });

  useEffect(() => {
    prevQuestionRef.current = prevQuestion;
  });
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
        return;
      }
      if (showSearchModal) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextQuestionRef.current();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevQuestionRef.current();
      } else if (e.key === 'Escape') {
        setLocation('/channels');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearchModal, setLocation]);

  useEffect(() => {
    if (!channelId) return;
    setFlashcardsLoading(true);
    fetch(`/api/flashcards/${channelId}`)
      .then(res => {
        if (!res.ok) throw new Error('No flashcards');
        return res.json();
      })
      .then(data => {
        setFlashcards(data);
        setFlashcardsLoading(false);
      })
      .catch(() => {
        setFlashcards([]);
        setFlashcardsLoading(false);
      });
  }, [channelId]);

  const toggleMark = () => {
    if (!currentQuestion) return;
    setMarkedQuestions(prev => {
      const newMarked = prev.includes(currentQuestion.id)
        ? prev.filter(id => id !== currentQuestion.id)
        : [...prev, currentQuestion.id];
      localStorage.setItem(`marked-${channelId}`, JSON.stringify(newMarked));
      return newMarked;
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Question link copied to clipboard",
      });
    } catch {
      toast({
        title: "Share",
        description: window.location.href,
      });
    }
  };

  const handleAddToSRS = () => {
    if (!currentQuestion) return;
    const card = addToSRS(currentQuestion.id, currentQuestion.channel, currentQuestion.difficulty);
    setSrsCard(card);
    setShowRatingButtons(true);
    toast({
      title: "Added to SRS",
      description: "Question added to spaced repetition system",
    });
  };

  const handleSRSRating = (rating: ConfidenceRating) => {
    if (!srsCard || !currentQuestion) return;
    const updatedCard = recordReview(currentQuestion.id, currentQuestion.channel, currentQuestion.difficulty, rating);
    setSrsCard(updatedCard);
    setHasRated(true);
    setShowRatingButtons(false);
    
    trackEvent('srs_review', { rating });

    toast({
      title: "Review recorded",
      description: `Mastery: ${getMasteryLabel(updatedCard.masteryLevel)}`,
    });
  };

  // ALL hooks must be declared before any early returns
  const difficultyColor = useMemo(() => ({
    beginner: 'gh-label-green',
    intermediate: 'gh-label-yellow',
    advanced: 'gh-label-red'
  })[currentQuestion?.difficulty || 'beginner'], [currentQuestion?.difficulty]);

  const markedSet = useMemo(() => new Set(markedQuestions), [markedQuestions]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[var(--gh-accent-emphasis)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--gh-fg-muted)]">Loading questions...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !channel) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-[var(--gh-danger-subtle)] border border-[var(--gh-danger-fg)]/20 text-[var(--gh-danger-fg)] p-6 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-2">Error loading channel</h2>
            <p>{error?.message || "Channel not found"}</p>
          </div>
          <Link href="/channels">
            <Button variant="secondary" size="sm">Back to Topics</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Check for empty questions array (channel has no questions)
  if (questions.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] p-6 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-2 text-[var(--gh-fg)]">No questions in this channel</h2>
            <p className="text-[var(--gh-fg-muted)]">This channel doesn't have any questions yet. Check back later or try a different topic.</p>
          </div>
          <Link href="/channels">
            <Button variant="secondary" size="sm">Back to Topics</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEOHead 
        title={`${currentQuestion?.question || 'Question'} | DevPrep`}
        description={currentQuestion?.question || 'Interview practice'}
      />

      <div className="flex flex-col min-h-screen bg-[var(--gh-canvas-subtle)]">
        {/* Top Breadcrumb & Nav Bar */}
        <div className="sticky top-12 z-20 bg-[var(--gh-canvas)] border-b border-[var(--gh-border)] px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Link href="/" className="text-[var(--gh-accent-fg)] hover:underline whitespace-nowrap flex items-center gap-1 text-sm">
                <Home className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <span className="text-[var(--gh-fg-muted)] text-sm">/</span>
              <Link href="/channels" className="text-[var(--gh-accent-fg)] hover:underline whitespace-nowrap text-sm">
                Topics
              </Link>
              <span className="text-[var(--gh-fg-muted)] text-sm">/</span>
              <span className="text-[var(--gh-fg)] font-medium text-sm truncate">
                {channel.name}
              </span>
              <span className="gh-label gh-label-gray ml-2 whitespace-nowrap">
                {currentIndex + 1} of {totalQuestions}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                variant="secondary"
                size="sm"
                aria-label="Previous question"
                icon={<ChevronLeft className="w-4 h-4" />}
              />
              <Button 
                onClick={nextQuestion}
                disabled={currentIndex === totalQuestions - 1}
                variant="secondary"
                size="sm"
                aria-label="Next question"
                icon={<ChevronRight className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[var(--gh-border)] bg-[var(--gh-canvas)]">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-1 -mb-px" aria-label="Main view">
              <Button
                onClick={() => setActiveMainTab('questions')}
                variant={activeMainTab === 'questions' ? 'primary' : 'ghost'}
                size="md"
                className="rounded-none border-b-2"
              >
                Questions
              </Button>
              <Button
                onClick={() => setActiveMainTab('flashcards')}
                variant={activeMainTab === 'flashcards' ? 'primary' : 'ghost'}
                size="md"
                className="rounded-none border-b-2"
              >
                Flashcards
                {flashcards.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-[var(--gh-accent-fg)]/10 rounded-full">
                    {flashcards.length}
                  </span>
                )}
              </Button>
              <Button
                onClick={() => setActiveMainTab('voice')}
                variant={activeMainTab === 'voice' ? 'primary' : 'ghost'}
                size="md"
                className="rounded-none border-b-2"
              >
                Voice
              </Button>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6">
          {/* Main Content (Left) */}
          <div className="flex-1 min-w-0 space-y-6">
            {activeMainTab === 'questions' && (
              <>
            {/* Question Card */}
            <div className="gh-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  <span className={cn("gh-label capitalize", difficultyColor)}>
                    {currentQuestion?.difficulty}
                  </span>
                  {currentQuestion?.subChannel && (
                    <span className="gh-label gh-label-gray">
                      {currentQuestion.subChannel.replace(/-/g, ' ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <IconButton
                    onClick={toggleMark}
                    variant={markedSet.has(currentQuestion?.id || '') ? 'secondary' : 'ghost'}
                    size="sm"
                    aria-label="Bookmark"
                    icon={<Bookmark className={cn("w-4 h-4", markedSet.has(currentQuestion?.id || '') && "fill-current")} />}
                  />
                  <IconButton
                    onClick={handleShare}
                    variant="ghost"
                    size="sm"
                    aria-label="Share"
                    icon={<Share2 className="w-4 h-4" />}
                  />
                </div>
              </div>

              <h1 className="text-xl font-semibold text-[var(--gh-fg)] mb-4 leading-tight">
                {currentQuestion?.question}
              </h1>

              {currentQuestion?.tags && currentQuestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentQuestion.tags.map(tag => (
                    <span key={tag} className="text-xs text-[var(--gh-fg-muted)] bg-[var(--gh-canvas-subtle)] px-2 py-0.5 rounded-full border border-[var(--gh-border)]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Section */}
            {!isAnswerRevealed ? (
              <div className="flex flex-col items-center py-8">
                <Button 
                  onClick={() => {
                    setIsAnswerRevealed(true);
                    Haptics.light();
                  }}
                  variant="primary"
                  size="md"
                  icon={<Brain className="w-5 h-5" />}
                >
                  Show Answer
                </Button>
                <p className="mt-4 text-sm text-[var(--gh-fg-muted)]">
                  Take a moment to think about your answer.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="gh-card overflow-hidden">
                  <div className="bg-[var(--gh-canvas-subtle)] px-4 py-2 border-b border-[var(--gh-border)] flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--gh-fg)] flex items-center gap-2">
                      <Check className="w-4 h-4 text-[var(--gh-success-fg)]" />
                      Sample Answer
                    </span>
                  </div>
                  <div className="p-6 prose prose-slate max-w-none">
                    {currentQuestion && (
                      <GenZAnswerPanel 
                        question={currentQuestion}
                        isCompleted={completed.includes(currentQuestion.id)}
                      />
                    )}
                  </div>
                </div>

                {/* Feedback & SRS Controls */}
                <div className="gh-card p-6 bg-[var(--gh-canvas-inset)] border-dashed">
                  <h3 className="text-sm font-semibold text-[var(--gh-fg)] mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    How well did you know this?
                  </h3>
                  
                  {showRatingButtons || srsCard ? (
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        onClick={() => handleSRSRating('again')}
                        variant="secondary"
                        size="sm"
                      >
                        Again
                      </Button>
                      <Button 
                        onClick={() => handleSRSRating('hard')}
                        variant="secondary"
                        size="sm"
                      >
                        Hard
                      </Button>
                      <Button 
                        onClick={() => handleSRSRating('good')}
                        variant="secondary"
                        size="sm"
                      >
                        Good
                      </Button>
                      <Button 
                        onClick={() => handleSRSRating('easy')}
                        variant="secondary"
                        size="sm"
                      >
                        Easy
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleAddToSRS}
                      variant="secondary"
                      icon={<RotateCcw className="w-4 h-4" />}
                    >
                      Add to SRS Review
                    </Button>
                  )}
                  
                  {srsCard && (
                    <div className="mt-4 flex items-center gap-4 text-xs text-[var(--gh-fg-muted)]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Next review: {srsCard.nextReview}
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Mastery: <span className={cn("font-medium", getMasteryColor(srsCard.masteryLevel))}>
                          {getMasteryLabel(srsCard.masteryLevel)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button 
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                    variant="secondary"
                    icon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={nextQuestion}
                    variant="primary"
                    icon={<ChevronRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Next Question
                  </Button>
                </div>
              </div>
            )}
            </>
            )}

            {activeMainTab === 'flashcards' && (
              <div className="gh-card p-6">
                {flashcardsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[var(--gh-accent-emphasis)] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[var(--gh-fg-muted)]">Loading flashcards...</p>
                  </div>
                ) : flashcards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-[var(--gh-fg-muted)] mb-4">No flashcards available for this channel.</p>
                    <Button variant="secondary" size="sm" onClick={() => setActiveMainTab('questions')}>
                      Go to Questions
                    </Button>
                  </div>
                ) : (
                  <FlashcardsTab channelId={channelId || ''} flashcards={flashcards} />
                )}
              </div>
            )}

            {activeMainTab === 'voice' && (
              <div className="gh-card p-6 text-center">
                <p className="text-[var(--gh-fg-muted)] mb-4">Practice answering questions with voice recording.</p>
                <Button variant="primary" onClick={() => window.location.href = '/voice-interview'}>
                  Start Voice Practice
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar (Right) */}
          <aside className="w-full lg:w-80 space-y-6">
            {/* Channel Info */}
            <div className="gh-card overflow-hidden">
              <div className="bg-[var(--gh-canvas-subtle)] px-4 py-3 border-b border-[var(--gh-border)]">
                <h2 className="text-sm font-semibold text-[var(--gh-fg)]">Topic Info</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--gh-fg)]">{channel.name}</h3>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[var(--gh-border)]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--gh-fg-muted)] flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Progress
                    </span>
                    <span className="font-medium text-[var(--gh-fg)]">{completed.length} / {totalQuestions}</span>
                  </div>
                  <div className="gh-progress">
                    <div 
                      className="gh-progress-bar" 
                      style={{ width: `${totalQuestions > 0 ? (completed.length / totalQuestions) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="gh-card">
              <div className="bg-[var(--gh-canvas-subtle)] px-4 py-3 border-b border-[var(--gh-border)]">
                <h2 className="text-sm font-semibold text-[var(--gh-fg)]">Quick Filters</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="sub-topic-select" className="text-xs font-medium text-[var(--gh-fg-muted)] flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5" />
                    Sub-topic
                  </label>
                  <Select value={selectedSubChannel} onValueChange={setSelectedSubChannel}>
                    <SelectTrigger id="sub-topic-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {channel.subChannels.map(sc => (
                        <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="difficulty-select" className="text-xs font-medium text-[var(--gh-fg-muted)] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Difficulty
                  </label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger id="difficulty-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {companiesWithCounts && companiesWithCounts.length > 0 && (
                  <div className="space-y-2">
                    <label htmlFor="company-select" className="text-xs font-medium text-[var(--gh-fg-muted)] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Company
                    </label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger id="company-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        {companiesWithCounts.map(c => (
                          <SelectItem key={c.name} value={c.name}>{c.name} ({c.count})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <VoiceReminder />
          </aside>
        </div>
      </div>
      
      <UnifiedSearch 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
    </AppLayout>
  );
}
