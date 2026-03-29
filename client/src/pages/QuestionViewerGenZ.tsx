import { useState, useEffect } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { getChannel } from '../lib/data';
import { useQuestionsWithPrefetch, useSubChannels, useCompaniesWithCounts } from '../hooks/use-questions';
import { useProgress, trackActivity } from '../hooks/use-progress';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useCredits } from '../context/CreditsContext';
import { useAchievementContext } from '../context/AchievementContext';
import { SEOHead } from '../components/SEOHead';
import { UnifiedSearch } from '../components/UnifiedSearch';
import { VoiceReminder } from '../components/VoiceReminder';
import { GenZAnswerPanel } from '../components/question/GenZAnswerPanel';
import { AICompanion } from '../components/AICompanion';
import { Haptics } from '../lib/haptics';
import { trackQuestionView } from '../hooks/use-analytics';
import { useUnifiedToast } from '../hooks/use-unified-toast';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/unified/Button';
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
import { cn } from '../lib/utils';

export default function QuestionViewerGenZ() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/channel/:id/:questionId?');
  const channelId = params?.id;
  const questionIdFromUrl = params?.questionId;
  
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
    const saved = localStorage.getItem(`marked-${channelId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [srsCard, setSrsCard] = useState<ReviewCard | null>(null);
  const [showRatingButtons, setShowRatingButtons] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  
  const { preferences, isSubscribed, subscribeChannel } = useUserPreferences();
  const shuffleEnabled = preferences.shuffleQuestions !== false;
  const prioritizeUnvisited = preferences.prioritizeUnvisited !== false;

  const { onQuestionSwipe, onQuestionView } = useCredits();
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
      if (foundIndex >= 0 && foundIndex !== currentIndex) {
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
  }, [targetQuestionId, questions.length, channelId, loading, questionIdFromSearch]);

  useEffect(() => {
    if (channelId && channel && !isSubscribed(channelId) && !loading && totalQuestions > 0 && questions.length > 0) {
      subscribeChannel(channelId);
      toast({
        title: "Channel added",
        description: `${channel.name} added to your channels`,
      });
    }
  }, [channelId, channel, loading, totalQuestions, questions.length]);

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
  }, [currentIndex, isInitialized]);

  useEffect(() => {
    if (currentQuestion) {
      trackQuestionView(currentQuestion.id, currentQuestion.channel, currentQuestion.difficulty);
      markCompleted(currentQuestion.id);
      trackActivity();
      
      trackEvent({
        type: 'question_completed',
        timestamp: new Date().toISOString(),
        data: {
          questionId: currentQuestion.id,
          difficulty: currentQuestion.difficulty,
          channel: currentQuestion.channel,
        },
      });
    }
  }, [currentQuestion?.id]);

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
        nextQuestion();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevQuestion();
      } else if (e.key === 'Escape') {
        setLocation('/channels');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, showSearchModal]);

  const nextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      onQuestionSwipe();
      onQuestionView();
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

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
    
    trackEvent({
      type: 'srs_review',
      timestamp: new Date().toISOString(),
      data: { rating },
    });

    toast({
      title: "Review recorded",
      description: `Mastery: ${getMasteryLabel(updatedCard.masteryLevel)}`,
    });
  };

  if (loading && !currentQuestion) {
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

  const difficultyColor = {
    beginner: 'gh-label-green',
    intermediate: 'gh-label-yellow',
    advanced: 'gh-label-red'
  }[currentQuestion?.difficulty || 'beginner'];

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

        <div className="max-w-7xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6">
          {/* Main Content (Left) */}
          <div className="flex-1 min-w-0 space-y-6">
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
                  <button 
                    onClick={toggleMark}
                    className={cn(
                      "p-1.5 rounded-md border transition-colors",
                      markedQuestions.includes(currentQuestion?.id || '')
                        ? "bg-amber-50 border-amber-400 text-amber-600"
                        : "border-[var(--gh-border)] text-[var(--gh-fg-muted)] hover:bg-[var(--gh-canvas-subtle)]"
                    )}
                    aria-label="Bookmark"
                  >
                    <Bookmark className={cn("w-4 h-4", markedQuestions.includes(currentQuestion?.id || '') && "fill-current")} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-1.5 rounded-md border border-[var(--gh-border)] text-[var(--gh-fg-muted)] hover:bg-[var(--gh-canvas-subtle)]"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
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
                      style={{ width: `${(completed.length / totalQuestions) * 100}%` }} 
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
                  <select 
                    id="sub-topic-select"
                    value={selectedSubChannel}
                    onChange={(e) => setSelectedSubChannel(e.target.value)}
                    className="w-full bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-[var(--gh-accent-emphasis)] outline-none"
                  >
                    {channel.subChannels.map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="difficulty-select" className="text-xs font-medium text-[var(--gh-fg-muted)] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Difficulty
                  </label>
                  <select 
                    id="difficulty-select"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-[var(--gh-accent-emphasis)] outline-none"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {companiesWithCounts && companiesWithCounts.length > 0 && (
                  <div className="space-y-2">
                    <label htmlFor="company-select" className="text-xs font-medium text-[var(--gh-fg-muted)] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Company
                    </label>
                    <select 
                      id="company-select"
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-[var(--gh-accent-emphasis)] outline-none"
                    >
                      <option value="all">All Companies</option>
                      {companiesWithCounts.map(c => (
                        <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* AI Companion / Related */}
            <div className="space-y-4">
              {currentQuestion && (
                <AICompanion 
                  pageContent={{
                    type: 'question',
                    title: channel.name,
                    question: currentQuestion.question,
                    answer: currentQuestion.answer,
                    explanation: currentQuestion.explanation,
                    tags: currentQuestion.tags,
                    difficulty: currentQuestion.difficulty,
                  }}
                  onNavigate={(path) => setLocation(path)}
                />
              )}
              <VoiceReminder />
            </div>
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
