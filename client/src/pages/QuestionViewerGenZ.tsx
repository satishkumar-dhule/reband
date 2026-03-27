/**
 * Gen Z Question Viewer - Premium Pro Max Edition
 * Claymorphism + Glassmorphism with stunning animations
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { getChannel } from '../lib/data';
import { useQuestionsWithPrefetch, useSubChannels, useCompaniesWithCounts } from '../hooks/use-questions';
import { useProgress, trackActivity } from '../hooks/use-progress';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useCredits } from '../context/CreditsContext';
import { useAchievementContext } from '../context/AchievementContext';
import { useTheme } from '../context/ThemeContext';
import { SEOHead } from '../components/SEOHead';
import { UnifiedSearch } from '../components/UnifiedSearch';
import { VoiceReminder } from '../components/VoiceReminder';
import { GenZAnswerPanel } from '../components/question/GenZAnswerPanel';
import { QuestionFeedback } from '../components/QuestionFeedback';
import { AICompanion } from '../components/AICompanion';
import { FloatingButton } from '../components/mobile';
import { Haptics } from '../lib/haptics';
import { trackQuestionView } from '../hooks/use-analytics';
import { trackSwipeNavigation, trackHapticFeedback } from '../lib/analytics';
import { useUnifiedToast } from '../hooks/use-unified-toast';
import {
  getCard, recordReview, addToSRS,
  getMasteryLabel, getMasteryColor,
  type ReviewCard, type ConfidenceRating
} from '../lib/spaced-repetition';
import {
  ChevronLeft, ChevronRight, Search, X, Bookmark, Share2,
  Filter, Brain, RotateCcw, Check, Zap, ArrowRight, Sparkles, Layers
} from 'lucide-react';

// Premium Styles - Design System Theme (Cyan/Purple/Pink)
const premiumStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

  :root {
    /* Design System Colors */
    --color-accent-cyan: hsl(190, 100%, 50%);
    --color-accent-cyan-light: hsl(190, 100%, 60%);
    --color-accent-cyan-dark: hsl(190, 100%, 40%);
    --color-accent-purple: hsl(270, 100%, 65%);
    --color-accent-purple-light: hsl(270, 100%, 75%);
    --color-accent-pink: hsl(330, 100%, 65%);
    --color-accent-pink-light: hsl(330, 100%, 75%);
    
    /* Primary - Cyan */
    --primary: var(--color-accent-cyan);
    --primary-light: var(--color-accent-cyan-light);
    --primary-glow: hsla(190, 100%, 50%, 0.4);
    --secondary-glow: hsla(270, 100%, 65%, 0.3);
    --tertiary-glow: hsla(330, 100%, 65%, 0.3);
    
    /* Glass - from design system */
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-highlight: rgba(255, 255, 255, 0.15);
    --glass-strong-bg: rgba(255, 255, 255, 0.08);
    --glass-strong-border: rgba(255, 255, 255, 0.15);
    
    /* Clay shadows */
    --clay-shadow-light: rgba(255, 255, 255, 0.2);
    --clay-shadow-dark: rgba(0, 0, 0, 0.35);
    --clay-shadow-primary: hsla(190, 100%, 50%, 0.25);
    --clay-shadow-purple: hsla(270, 100%, 65%, 0.25);
    --clay-shadow-pink: hsla(330, 100%, 65%, 0.25);
    
    /* Semantic */
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    --surface-elevated: hsl(0, 0%, 8%);
  }

  .font-display { font-family: 'Outfit', sans-serif; }
  .font-body { font-family: 'DM Sans', sans-serif; }

  /* Premium Glass Card - Design System */
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 var(--glass-highlight),
      inset 0 -1px 0 rgba(255, 255, 255, 0.05);
  }

  .glass-card-strong {
    background: var(--glass-strong-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--glass-strong-border);
    border-radius: 24px;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 var(--glass-highlight);
  }

  /* Claymorphism Card */
  .clay-card {
    background: linear-gradient(145deg, hsl(0, 0%, 8%), hsl(0, 0%, 6.5%));
    border-radius: 28px;
    box-shadow: 
      12px 12px 24px var(--clay-shadow-dark),
      -8px -8px 20px var(--clay-shadow-light),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* Claymorphism Button */
  .clay-button {
    background: linear-gradient(145deg, hsl(0, 0%, 10%), hsl(0, 0%, 7%));
    border-radius: 16px;
    box-shadow: 
      6px 6px 12px var(--clay-shadow-dark),
      -4px -4px 10px var(--clay-shadow-light),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .clay-button:hover {
    transform: translateY(-2px);
    box-shadow: 
      8px 8px 16px var(--clay-shadow-dark),
      -5px -5px 12px var(--clay-shadow-light),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .clay-button:active {
    transform: translateY(0);
    box-shadow: 
      3px 3px 6px var(--clay-shadow-dark),
      -2px -2px 5px var(--clay-shadow-light),
      inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* Primary Clay Button - Cyan/Purple Gradient */
  .clay-button-primary {
    background: linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple));
    border-radius: 16px;
    box-shadow: 
      6px 6px 12px var(--clay-shadow-dark),
      -4px -4px 10px var(--clay-shadow-light),
      0 0 20px var(--clay-shadow-primary),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .clay-button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 
      8px 8px 16px var(--clay-shadow-dark),
      -5px -5px 12px var(--clay-shadow-light),
      0 0 30px var(--clay-shadow-primary),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  /* Premium Progress Bar - Cyan/Purple/Pink */
  .progress-glow {
    background: linear-gradient(90deg, var(--color-accent-cyan), var(--color-accent-purple), var(--color-accent-pink));
    background-size: 200% 100%;
    animation: shimmer 2s infinite linear;
    box-shadow: 0 0 10px var(--primary-glow), 0 0 20px var(--secondary-glow);
  }

  @keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }

  /* Animated Background - Design System Theme */
  .animated-bg {
    background: 
      radial-gradient(ellipse at 20% 20%, hsla(190, 100%, 50%, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, hsla(270, 100%, 65%, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, hsl(0, 0%, 4%) 0%, hsl(0, 0%, 2%) 100%);
  }

  /* Floating Orbs - Cyan/Purple/Pink */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    animation: float 20s infinite ease-in-out;
  }

  .orb-1 {
    width: 400px;
    height: 400px;
    background: hsla(190, 100%, 50%, 0.12);
    top: -100px;
    right: -100px;
    animation-delay: 0s;
  }

  .orb-2 {
    width: 300px;
    height: 300px;
    background: hsla(270, 100%, 65%, 0.1);
    bottom: -50px;
    left: -50px;
    animation-delay: -10s;
  }

  .orb-3 {
    width: 250px;
    height: 250px;
    background: hsla(330, 100%, 65%, 0.08);
    bottom: 20%;
    right: 10%;
    animation-delay: -5s;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(30px, -30px) scale(1.05); }
    50% { transform: translate(-20px, 20px) scale(0.95); }
    75% { transform: translate(20px, 30px) scale(1.02); }
  }

  /* Question Card Entrance */
  .question-card-enter {
    animation: cardEntrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes cardEntrance {
    0% { 
      opacity: 0; 
      transform: translateX(40px) scale(0.95); 
    }
    100% { 
      opacity: 1; 
      transform: translateX(0) scale(1); 
    }
  }

  /* Badge Styles - Design System */
  .badge-premium {
    background: linear-gradient(135deg, hsla(190, 100%, 50%, 0.15), hsla(270, 100%, 65%, 0.15));
    border: 1px solid hsla(190, 100%, 50%, 0.3);
    box-shadow: 0 0 15px hsla(190, 100%, 50%, 0.15);
    color: var(--color-accent-cyan);
  }

  /* Premium Input */
  .premium-input {
    background: hsl(0, 0%, 8%);
    border: 1px solid hsl(0, 0%, 12%);
    border-radius: 14px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

  .premium-input:focus {
    border-color: var(--color-accent-cyan);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 3px hsla(190, 100%, 50%, 0.15);
  }

  /* Rating Buttons */
  .rating-btn {
    background: linear-gradient(145deg, hsl(0, 0%, 10%), hsl(0, 0%, 7%));
    border: 1px solid hsl(0, 0%, 12%);
    box-shadow: 
      4px 4px 8px var(--clay-shadow-dark),
      -3px -3px 6px var(--clay-shadow-light);
    transition: all 0.2s ease;
  }

  .rating-btn:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      6px 6px 12px var(--clay-shadow-dark),
      -4px -4px 8px var(--clay-shadow-light);
  }

  /* Swipe Indicator - Cyan/Purple */
  .swipe-indicator {
    background: linear-gradient(135deg, hsla(190, 100%, 50%, 0.2), hsla(270, 100%, 65%, 0.2));
    backdrop-filter: blur(10px);
    border: 1px solid hsla(190, 100%, 50%, 0.3);
    box-shadow: 0 0 30px hsla(190, 100%, 50%, 0.2);
  }

  /* Scrollbar - Design System */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: hsl(0, 0%, 6%);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--color-accent-purple), var(--color-accent-cyan));
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--color-accent-pink), var(--color-accent-purple));
  }
`;

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
  const [showFilters, setShowFilters] = useState(false);
  const [mobileView, setMobileView] = useState<'question' | 'answer'>('question');
  const [markedQuestions, setMarkedQuestions] = useState<string[]>(() => {
    const saved = localStorage.getItem(`marked-${channelId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [srsCard, setSrsCard] = useState<ReviewCard | null>(null);
  const [showRatingButtons, setShowRatingButtons] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Swipe gesture state
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // Get current theme from context
  const { theme } = useTheme();
  const isLightMode = theme === 'genz-light';

  const { companiesWithCounts } = useCompaniesWithCounts(
    channelId || '',
    selectedSubChannel,
    selectedDifficulty
  );

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

  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check if current question has an SRS card
  useEffect(() => {
    if (!currentQuestion) return;
    const card = getCard(currentQuestion.id, currentQuestion.channel, currentQuestion.difficulty);
    setSrsCard(card);
    setShowRatingButtons(false);
    setHasRated(false);
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

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextQuestion();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
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
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setMobileView('question');
        onQuestionSwipe();
        onQuestionView();
        setIsTransitioning(false);
      }, 150);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setMobileView('question');
        setIsTransitioning(false);
      }, 150);
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
    
    // Track achievement
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

  // Handle swipe gesture for navigation
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const page = window.location.pathname;
    
    // Swipe left (next question)
    if (info.offset.x < -threshold || velocity < -500) {
      setSwipeDirection('left');
      Haptics.medium();
      trackHapticFeedback('medium', 'swipe_navigation_left');
      trackSwipeNavigation(
        page, 
        'left', 
        currentQuestion?.id, 
        questions[currentIndex + 1]?.id,
        Math.abs(velocity)
      );
      setTimeout(() => {
        nextQuestion();
        setSwipeDirection(null);
        x.set(0);
      }, 150);
    }
    // Swipe right (previous question)
    else if (info.offset.x > threshold || velocity > 500) {
      setSwipeDirection('right');
      Haptics.medium();
      trackHapticFeedback('medium', 'swipe_navigation_right');
      trackSwipeNavigation(
        page, 
        'right', 
        currentQuestion?.id, 
        questions[currentIndex - 1]?.id,
        Math.abs(velocity)
      );
      setTimeout(() => {
        prevQuestion();
        setSwipeDirection(null);
        x.set(0);
      }, 150);
    }
    // Snap back
    else {
      x.set(0);
    }
  };

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      },
    },
  };

  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center pt-safe pb-safe relative overflow-hidden">
        <style>{premiumStyles}</style>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="text-center px-4">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="w-20 h-20 mx-auto mb-6 rounded-full"
            style={{
              background: 'linear-gradient(135deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))',
              boxShadow: '0 0 40px hsla(190, 100%, 50%, 0.5), inset 0 2px 0 rgba(255,255,255,0.2)'
            }}
          >
            <Layers className="w-10 h-10 mx-auto mt-5 text-white" />
          </motion.div>
          <p className="text-white/70 font-body text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center pt-safe pb-safe relative overflow-hidden">
        <style>{premiumStyles}</style>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="text-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 max-w-md"
          >
            <h2 className="text-3xl font-display font-bold text-white mb-3">Channel not found</h2>
            <p className="text-white/60 font-body mb-6">The channel "{channelId}" doesn't exist.</p>
            <motion.button
              onClick={() => setLocation('/channels')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="clay-button-primary px-8 py-4 text-white font-display font-bold"
            >
              Go to Channels
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!loading && (!currentQuestion || totalQuestions === 0)) {
    const hasFilters = selectedSubChannel !== 'all' || selectedDifficulty !== 'all' || selectedCompany !== 'all';
    
    return (
      <div className="min-h-screen animated-bg flex flex-col pt-safe relative overflow-hidden">
        <style>{premiumStyles}</style>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <Header
          channel={channel}
          onBack={() => setLocation('/channels')}
          onSearch={() => setShowSearchModal(true)}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
        />
        <div className="flex-1 flex items-center justify-center pb-safe">
          <div className="text-center px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-8 max-w-md"
            >
              <div className="text-7xl mb-4">📝</div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">No questions found</h2>
              <p className="text-white/60 font-body mb-6">
                {hasFilters ? 'Try adjusting your filters.' : 'Check back soon for new content!'}
              </p>
              {hasFilters && (
                <motion.button
                  onClick={() => {
                    setSelectedSubChannel('all');
                    setSelectedDifficulty('all');
                    setSelectedCompany('all');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="clay-button-primary px-6 py-3 text-white font-display font-bold"
                >
                  Reset Filters
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isMarked = markedQuestions.includes(currentQuestion.id);
  const isCompleted = completed.includes(currentQuestion.id);
  const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <>
      <style>{premiumStyles}</style>
      <SEOHead
        title={`${channel.name} - ${currentQuestion.question.substring(0, 60)}...`}
        description={currentQuestion.question}
        canonical={`https://open-interview.github.io/channel/${channelId}/${currentQuestion.id}`}
      />

      <div className="min-h-screen animated-bg flex flex-col pt-safe relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Header */}
        <Header
          channel={channel}
          onBack={() => setLocation('/channels')}
          onSearch={() => setShowSearchModal(true)}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          progress={progress}
          onToggleFilters={() => setShowFilters(!showFilters)}
          hasFilters={selectedSubChannel !== 'all' || selectedDifficulty !== 'all' || selectedCompany !== 'all'}
        />

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <FiltersPanel
              channel={channel}
              selectedSubChannel={selectedSubChannel}
              selectedDifficulty={selectedDifficulty}
              selectedCompany={selectedCompany}
              companiesWithCounts={companiesWithCounts}
              onSubChannelChange={(val: string) => {
                setSelectedSubChannel(val);
                setCurrentIndex(0);
              }}
              onDifficultyChange={(val: string) => {
                setSelectedDifficulty(val);
                setCurrentIndex(0);
              }}
              onCompanyChange={(val: string) => {
                setSelectedCompany(val);
                setCurrentIndex(0);
              }}
              onClose={() => setShowFilters(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Split View */}
          <div className="hidden lg:flex flex-1 overflow-hidden">
            {/* Question Panel */}
            <motion.div 
              className="w-1/2 border-r border-white/5 overflow-y-auto p-6 md:p-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`${isTransitioning ? 'question-card-enter' : ''}`}
              >
                <QuestionContent
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                  totalQuestions={totalQuestions}
                  isMarked={isMarked}
                  isCompleted={isCompleted}
                  srsCard={srsCard}
                  showRatingButtons={showRatingButtons}
                  hasRated={hasRated}
                  onAddToSRS={handleAddToSRS}
                  onSRSRating={handleSRSRating}
                  onToggleMark={toggleMark}
                />
              </motion.div>
            </motion.div>
            
            {/* Answer Panel */}
            <motion.div 
              className="w-1/2 overflow-y-auto p-6 md:p-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                backgroundColor: isLightMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.2)',
              }}
            >
              <GenZAnswerPanel 
                question={currentQuestion} 
                isCompleted={isCompleted}
              />
            </motion.div>
          </div>

          {/* Mobile Tab View */}
          <div className="flex-1 flex flex-col lg:hidden overflow-hidden">
            {/* Mobile Tabs - Premium Glass Style */}
            <div className="flex border-b border-white/5 bg-black/20 backdrop-blur-xl">
              <motion.button
                onClick={() => setMobileView('question')}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 py-4 font-display font-semibold transition-all relative ${
                  mobileView === 'question'
                    ? 'text-white'
                    : 'text-white/50'
                }`}
              >
                <span className="relative z-10">Question</span>
                {mobileView === 'question' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: 'linear-gradient(90deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))',
                      boxShadow: '0 0 10px hsla(190, 100%, 50%, 0.5)',
                    }}
                  />
                )}
              </motion.button>
              <motion.button
                onClick={() => setMobileView('answer')}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 py-4 font-display font-semibold transition-all relative ${
                  mobileView === 'answer'
                    ? 'text-white'
                    : 'text-white/50'
                }`}
              >
                <span className="relative z-10">Answer</span>
                {mobileView === 'answer' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: 'linear-gradient(90deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))',
                      boxShadow: '0 0 10px hsla(190, 100%, 50%, 0.5)',
                    }}
                  />
                )}
              </motion.button>
            </div>
            
            {/* Mobile Content with Swipe Gestures */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              style={{ x, opacity }}
              onDragEnd={handleDragEnd}
              className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 relative"
            >
              {/* Swipe Indicators */}
              <AnimatePresence>
                {swipeDirection === 'left' && (
                  <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.8 }}
                    className="swipe-indicator absolute top-1/2 right-4 -translate-y-1/2 z-10 rounded-full p-4"
                  >
                    <ChevronRight className="w-8 h-8" style={{ color: 'hsl(190, 100%, 60%)' }} />
                  </motion.div>
                )}
                {swipeDirection === 'right' && (
                  <motion.div
                    initial={{ opacity: 0, x: -50, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.8 }}
                    className="swipe-indicator absolute top-1/2 left-4 -translate-y-1/2 z-10 rounded-full p-4"
                  >
                    <ChevronLeft className="w-8 h-8" style={{ color: 'hsl(190, 100%, 60%)' }} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {mobileView === 'question' ? (
                <motion.div
                  key={`question-${currentQuestion.id}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={`${isTransitioning ? 'question-card-enter' : ''}`}
                >
                  <QuestionContent
                    question={currentQuestion}
                    questionNumber={currentIndex + 1}
                    totalQuestions={totalQuestions}
                    isMarked={isMarked}
                    isCompleted={isCompleted}
                    srsCard={srsCard}
                    showRatingButtons={showRatingButtons}
                    hasRated={hasRated}
                    onAddToSRS={handleAddToSRS}
                    onSRSRating={handleSRSRating}
                    onToggleMark={toggleMark}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`answer-${currentQuestion.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <GenZAnswerPanel 
                    question={currentQuestion} 
                    isCompleted={isCompleted}
                  />
                </motion.div>
              )}
            </motion.div>
            
            {/* Floating Action Button - Next Question */}
            {currentIndex < totalQuestions - 1 && (
              <FloatingButton
                icon={<ArrowRight className="w-6 h-6" />}
                onClick={nextQuestion}
                position="bottom-right"
                hideOnScroll={false}
                className="lg:hidden"
              />
            )}
          </div>
        </div>

        {/* Navigation Footer - Premium Claymorphism */}
        <motion.div 
          className="border-t border-white/5 bg-black/30 backdrop-blur-2xl p-3 md:p-4 pb-safe"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
            {/* Previous */}
            <motion.button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 md:p-4 clay-button disabled:opacity-25 disabled:cursor-not-allowed disabled:transform-none flex-shrink-0`}
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white/80" />
            </motion.button>

            {/* Progress */}
            <div className="flex-1 max-w-md min-w-0">
              <div className="flex items-center gap-3 md:gap-4 mb-3">
                <span className="text-sm md:text-base font-display font-bold whitespace-nowrap" style={{ color: 'hsl(190, 100%, 60%)' }}>
                  {currentIndex + 1} / {totalQuestions}
                </span>
                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden min-w-0 relative">
                  {/* Glow effect behind progress */}
                  <div 
                    className="absolute inset-0 blur-md"
                    style={{
                      background: 'linear-gradient(90deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))',
                      opacity: 0.5,
                    }}
                  />
                  <motion.div
                    className="h-full progress-glow rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm md:text-base font-display font-bold text-white/70 whitespace-nowrap">{progress}%</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <motion.button
                onClick={toggleMark}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 md:p-4 clay-button transition-all ${
                  isMarked
                    ? 'text-yellow-400'
                    : 'text-white/60 hover:text-yellow-300'
                }`}
              >
                <Bookmark className="w-5 h-5 md:w-6 md:h-6" fill={isMarked ? 'currentColor' : 'none'} />
              </motion.button>
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block p-3 md:p-4 clay-button text-white/60 hover:text-white"
              >
                <Share2 className="w-5 h-5 md:w-6 md:h-6" />
              </motion.button>
            </div>

            {/* Next */}
            <motion.button
              onClick={nextQuestion}
              disabled={currentIndex === totalQuestions - 1}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 md:p-4 clay-button-primary text-white font-display font-bold flex-shrink-0 disabled:opacity-25 disabled:cursor-not-allowed disabled:transform-none"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      <UnifiedSearch isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
      <VoiceReminder />
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
        onAction={(action, data) => {
          switch (action) {
            case 'nextQuestion':
              nextQuestion();
              break;
            case 'previousQuestion':
              prevQuestion();
              break;
            case 'showAnswer':
              setMobileView('answer');
              break;
            case 'hideAnswer':
              setMobileView('question');
              break;
            case 'bookmark':
              toggleMark();
              break;
            case 'addToSRS':
              handleAddToSRS();
              break;
            case 'share':
              handleShare();
              break;
            case 'showSearch':
              setShowSearchModal(true);
              break;
            case 'filterByDifficulty':
              if (data?.difficulty) {
                setSelectedDifficulty(data.difficulty);
              }
              break;
            case 'filterBySubChannel':
              if (data?.subChannel) {
                setSelectedSubChannel(data.subChannel);
              }
              break;
            case 'clearFilters':
              setSelectedDifficulty('all');
              setSelectedSubChannel('all');
              setSelectedCompany('all');
              break;
          }
        }}
        availableActions={[
          'nextQuestion',
          'previousQuestion',
          'showAnswer',
          'hideAnswer',
          'bookmark',
          'addToSRS',
          'share',
          'showSearch',
          'filterByDifficulty',
          'filterBySubChannel',
          'clearFilters',
        ]}
      />
    </>
  );
}

// Header Component - Premium Design
function Header({ channel, onBack, onSearch, currentIndex, totalQuestions, progress, onToggleFilters, hasFilters }: any) {
  return (
    <motion.header 
      className="border-b border-white/5 bg-black/20 backdrop-blur-xl"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Left */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 md:p-3 clay-button flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white/80" />
            </motion.button>
            <div className="min-w-0 flex-1">
              <h1 className="font-display font-bold text-lg md:text-xl text-white truncate">
                {channel.name}
              </h1>
              {totalQuestions > 0 && (
                <p className="text-xs md:text-sm text-white/50 font-body truncate">
                  Question {currentIndex + 1} of {totalQuestions}
                </p>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Progress Ring */}
            {progress !== undefined && (
              <div className="relative w-10 h-10 md:w-12 md:h-12 hidden sm:block">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="url(#progressGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progress / 100 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(190, 100%, 50%)" />
                      <stop offset="100%" stopColor="hsl(270, 100%, 65%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-display font-bold text-white">
                  {progress}%
                </span>
              </div>
            )}
            
            {onToggleFilters && (
              <motion.button
                onClick={onToggleFilters}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 md:p-3 transition-all ${
                  hasFilters
                    ? 'clay-button-primary'
                    : 'clay-button text-white/70 hover:text-white'
                }`}
              >
                <Filter className="w-5 h-5 md:w-6 md:h-6" />
              </motion.button>
            )}
            <motion.button
              onClick={onSearch}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 md:p-3 clay-button text-white/70 hover:text-white"
            >
              <Search className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

// Filters Panel - Premium Glassmorphism
function FiltersPanel({ channel, selectedSubChannel, selectedDifficulty, selectedCompany, companiesWithCounts, onSubChannelChange, onDifficultyChange, onCompanyChange, onClose }: any) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="border-b border-white/5 bg-black/30 backdrop-blur-2xl overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-5 md:py-7">
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-4 md:mb-6"
        >
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: 'hsl(190, 100%, 60%)' }} />
            Filters
          </h3>
          <motion.button 
            onClick={onClose} 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 clay-button text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Sub-channels */}
          {channel.subChannels && channel.subChannels.length > 1 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label className="text-xs md:text-sm font-display font-semibold text-white/60 mb-3 block">Topic</label>
              <select
                value={selectedSubChannel}
                onChange={(e) => onSubChannelChange(e.target.value)}
                className="w-full px-4 py-3 premium-input text-white font-body text-sm md:text-base focus:outline-none"
              >
                {channel.subChannels.map((sc: any) => (
                  <option key={sc.id} value={sc.id} className="bg-gray-900">{sc.name}</option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Difficulty */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <label className="text-xs md:text-sm font-display font-semibold text-white/60 mb-3 block">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="w-full px-4 py-3 premium-input text-white font-body text-sm md:text-base focus:outline-none"
            >
              <option value="all" className="bg-gray-900">All Levels</option>
              <option value="beginner" className="bg-gray-900">Beginner</option>
              <option value="intermediate" className="bg-gray-900">Intermediate</option>
              <option value="advanced" className="bg-gray-900">Advanced</option>
            </select>
          </motion.div>

          {/* Company */}
          {companiesWithCounts.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="text-xs md:text-sm font-display font-semibold text-white/60 mb-3 block">Company</label>
              <select
                value={selectedCompany}
                onChange={(e) => onCompanyChange(e.target.value)}
                className="w-full px-4 py-3 premium-input text-white font-body text-sm md:text-base focus:outline-none"
              >
                <option value="all" className="bg-gray-900">All Companies</option>
                {companiesWithCounts.map((c: any) => (
                  <option key={c.company} value={c.company} className="bg-gray-900">
                    {c.company} ({c.count})
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Question Content - Premium Claymorphism Cards
function QuestionContent({ question, questionNumber, totalQuestions, isMarked, isCompleted, srsCard, showRatingButtons, hasRated, onAddToSRS, onSRSRating, onToggleMark }: any) {
  // Local animation variants for this component
  const contentContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const contentItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      },
    },
  };

  return (
    <motion.div 
      variants={contentContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 md:space-y-7"
    >
      {/* Meta */}
      <motion.div 
        variants={contentContainerVariants}
        className="flex items-center gap-2 md:gap-3 flex-wrap"
      >
        <motion.span 
          variants={contentItemVariants}
          className="badge-premium px-3 md:px-4 py-1.5 rounded-full text-xs font-display font-bold"
        >
          {question.difficulty}
        </motion.span>
        {question.company && (
          <motion.span 
            variants={contentItemVariants}
            className="px-3 md:px-4 py-1.5 glass-card rounded-full text-xs font-display font-bold text-white/70"
          >
            {question.company}
          </motion.span>
        )}
        {isCompleted && (
          <motion.span 
            variants={contentItemVariants}
            className="px-3 md:px-4 py-1.5 rounded-full text-xs font-display font-bold text-emerald-400 flex items-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)',
            }}
          >
            <Check className="w-3 h-3" />
            Completed
          </motion.span>
        )}
        
        {/* SRS Status Badge */}
        {srsCard && !showRatingButtons && !hasRated && (
          <motion.span 
            variants={contentItemVariants}
            className={`px-3 md:px-4 py-1.5 rounded-full text-xs font-display font-bold border ${
              getMasteryColor(srsCard.easeFactor)
            }`}
          >
            {getMasteryLabel(srsCard.easeFactor)}
          </motion.span>
        )}
      </motion.div>

      {/* Question */}
      <motion.div variants={contentItemVariants}>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-white leading-tight">
          {question.question}
        </h2>
      </motion.div>

      {/* Action Buttons Row */}
      <motion.div 
        variants={contentContainerVariants}
        className="flex items-center gap-3 md:gap-4 flex-wrap"
      >
        {/* Bookmark Button */}
        <motion.button
          variants={contentItemVariants}
          onClick={onToggleMark}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 md:px-5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all flex items-center gap-2 ${
            isMarked
              ? 'text-yellow-400'
              : 'glass-card text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Bookmark className={`w-4 h-4 md:w-5 md:h-4 ${isMarked ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">{isMarked ? 'Bookmarked' : 'Bookmark'}</span>
        </motion.button>

        {/* SRS Button or Rating Buttons */}
        {hasRated ? (
          <motion.span 
            variants={contentItemVariants}
            className="px-4 md:px-5 py-2.5 rounded-xl text-sm font-display font-semibold text-emerald-400 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Review Recorded</span>
          </motion.span>
        ) : showRatingButtons && srsCard ? (
          <motion.div 
            variants={contentItemVariants}
            className="flex items-center gap-2 flex-wrap"
          >
            <span className="text-xs text-white/50 font-body mr-2 hidden sm:inline">Rate your confidence:</span>
            {[
              { rating: 'again', color: 'red', icon: RotateCcw },
              { rating: 'hard', color: 'orange', icon: Brain },
              { rating: 'good', color: 'green', icon: Check },
              { rating: 'easy', color: 'cyan', icon: Zap },
            ].map(({ rating, color, icon: Icon }) => (
              <motion.button
                key={rating}
                onClick={() => onSRSRating(rating as ConfidenceRating)}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`rating-btn px-3 md:px-4 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 ${
                  color === 'red' ? 'text-red-400' :
                  color === 'orange' ? 'text-orange-400' :
                  color === 'green' ? 'text-green-400' : ''
                }`}
                style={color === 'cyan' ? { color: 'hsl(190, 100%, 60%)' } : undefined}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline capitalize">{rating}</span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.button
            variants={contentItemVariants}
            onClick={onAddToSRS}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 md:px-5 py-2.5 rounded-xl font-display font-semibold text-sm flex items-center gap-2"
            style={{
              color: 'hsl(270, 100%, 75%)',
              background: 'linear-gradient(135deg, hsla(270, 100%, 65%, 0.15), hsla(270, 100%, 55%, 0.1))',
              border: '1px solid hsla(270, 100%, 65%, 0.25)',
              boxShadow: '0 0 20px hsla(270, 100%, 65%, 0.1)',
            }}
          >
            <Brain className="w-4 h-4 md:w-5 md:h-4" />
            <span className="hidden sm:inline">Add to SRS</span>
          </motion.button>
        )}

        {/* Flagging Button */}
        <motion.div variants={contentItemVariants}>
          <QuestionFeedback questionId={question.id} />
        </motion.div>
      </motion.div>

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <motion.div 
          variants={contentContainerVariants}
          className="flex flex-wrap gap-2"
        >
          {question.tags.map((tag: string, index: number) => (
            <motion.span
              key={tag}
              variants={contentItemVariants}
              className="px-3 md:px-4 py-1.5 glass-card rounded-full text-xs text-white/50 font-body"
            >
              #{tag}
            </motion.span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
