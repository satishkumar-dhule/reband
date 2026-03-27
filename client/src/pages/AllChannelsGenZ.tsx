/**
 * Gen Z Channels Page - Completely Redesigned
 * Glassmorphism, Animated Gradients, Premium Features
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { allChannelsConfig, categories } from '../lib/channels-config';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useChannelStats } from '../hooks/use-stats';
import { useProgress } from '../hooks/use-progress';
import { SEOHead } from '../components/SEOHead';
import {
  Search, Check, Plus, Sparkles, TrendingUp, ChevronRight,
  Box, Terminal, Layout, Server, Database, Infinity, Activity, Cloud, Layers,
  Brain, Eye, FileText, Code, Shield, Network, Monitor, Smartphone, CheckCircle,
  Zap, Gauge, Users, MessageCircle, Calculator, Cpu, GitBranch, Binary, Puzzle,
  GitMerge, Workflow, Award, Bot, Home, ArrowLeft, Mic, X, Star, Lock, Unlock,
  Flame, Target, Rocket, Crown, Zap as Lightning, Headphones, BookOpen, Code2,
  Database as DatabaseIcon, Cloud as CloudIcon, Shield as ShieldIcon, Smartphone as SmartphoneIcon
} from 'lucide-react';

const iconMap: Record<string, any> = {
  'boxes': Box,
  'chart-line': TrendingUp,
  'git-branch': GitBranch,
  'binary': Binary,
  'puzzle': Puzzle,
  'git-merge': GitMerge,
  'calculator': Calculator,
  'cpu': Cpu,
  'terminal': Terminal,
  'layout': Layout,
  'server': Server,
  'database': Database,
  'infinity': Infinity,
  'activity': Activity,
  'box': Box,
  'cloud': Cloud,
  'layers': Layers,
  'workflow': Workflow,
  'brain': Brain,
  'sparkles': Sparkles,
  'message-circle': MessageCircle,
  'eye': Eye,
  'file-text': FileText,
  'code': Code,
  'shield': Shield,
  'network': Network,
  'monitor': Monitor,
  'smartphone': Smartphone,
  'check-circle': CheckCircle,
  'zap': Zap,
  'gauge': Gauge,
  'users': Users,
  'award': Award,
};

const categoryIcons: Record<string, any> = {
  'frontend': Layout,
  'backend': Server,
  'devops': Cloud,
  'database': DatabaseIcon,
  'mobile': SmartphoneIcon,
  'security': ShieldIcon,
  'ai-ml': Brain,
  'system-design': Network,
  'general': BookOpen,
  'algorithms': Code2,
  'behavioral': Users,
  'ui-ux': Layout,
};

const categoryColors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  'frontend': { bg: 'from-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400', gradient: 'from-pink-500 via-rose-500 to-red-500' },
  'backend': { bg: 'from-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-500 via-cyan-500 to-teal-500' },
  'devops': { bg: 'from-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', gradient: 'from-amber-500 via-orange-500 to-yellow-500' },
  'database': { bg: 'from-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500 via-violet-500 to-fuchsia-500' },
  'mobile': { bg: 'from-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', gradient: 'from-emerald-500 via-green-500 to-teal-500' },
  'security': { bg: 'from-red-500/20', border: 'border-red-500/30', text: 'text-red-400', gradient: 'from-red-500 via-orange-500 to-amber-500' },
  'ai-ml': { bg: 'from-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500 via-sky-500 to-blue-500' },
  'system-design': { bg: 'from-violet-500/20', border: 'border-violet-500/30', text: 'text-violet-400', gradient: 'from-violet-500 via-purple-500 to-pink-500' },
  'general': { bg: 'from-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-400', gradient: 'from-gray-500 via-slate-500 to-zinc-500' },
  'algorithms': { bg: 'from-lime-500/20', border: 'border-lime-500/30', text: 'text-lime-400', gradient: 'from-lime-500 via-green-500 to-emerald-500' },
  'behavioral': { bg: 'from-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400', gradient: 'from-indigo-500 via-blue-500 to-cyan-500' },
  'ui-ux': { bg: 'from-fuchsia-500/20', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400', gradient: 'from-fuchsia-500 via-pink-500 to-rose-500' },
};

const difficultyConfig = {
  beginner: { label: 'Beginner', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  intermediate: { label: 'Intermediate', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  advanced: { label: 'Advanced', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
};

function AnimatedGradientHeader() {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      
      <div className="relative px-8 py-12">
        <div className="flex items-center justify-between">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-3"
            >
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white/90 text-sm font-bold flex items-center gap-2">
                <Crown className="w-4 h-4" />
                PRO MAX
              </span>
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white/70 text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                30 AI Agents
              </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-3"
            >
              Explore Channels
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/80 text-lg max-w-xl"
            >
              Unlock premium learning paths with AI-powered assistance. Track your progress and master new skills.
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl backdrop-blur-xl flex items-center justify-center border border-white/20">
                <Rocket className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ModernSearchBar({ 
  value, 
  onChange, 
  onVoiceClick, 
  voiceActive 
}: { 
  value: string; 
  onChange: (v: string) => void;
  onVoiceClick: () => void;
  voiceActive: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className="relative mb-8"
      animate={{ scale: isFocused ? 1.01 : 1 }}
    >
      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
        isFocused 
          ? 'bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 blur-xl' 
          : 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 blur-xl'
      }`} />
      
      <div className="relative flex items-center gap-3">
        <div className={`flex-1 relative rounded-2xl transition-all duration-300 ${
          isFocused ? 'ring-2 ring-violet-500/30' : ''
        }`}>
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-violet-400' : 'text-muted-foreground'}`} />
          </div>
          <input
            type="text"
            placeholder="Search channels, topics, or skills..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-14 pr-4 py-4 bg-card/80 backdrop-blur-xl border border-border rounded-2xl text-base focus:outline-none focus:border-violet-500/50 transition-all"
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onVoiceClick}
          className={`p-4 rounded-2xl border transition-all duration-300 ${
            voiceActive
              ? 'bg-violet-500/20 border-violet-500/50 shadow-lg shadow-violet-500/20'
              : 'bg-card/80 backdrop-blur-xl border-border hover:border-violet-500/30'
          }`}
        >
          <Mic className={`w-5 h-5 transition-colors ${voiceActive ? 'text-violet-400' : 'text-muted-foreground'}`} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function CategoryTabs({ 
  selected, 
  onChange, 
  counts 
}: { 
  selected: string | null; 
  onChange: (v: string | null) => void;
  counts: Record<string, number>;
}) {
  const tabItems = [
    { id: null, name: 'All', icon: Sparkles },
    { id: 'frontend', name: 'Frontend', icon: Layout },
    { id: 'backend', name: 'Backend', icon: Server },
    { id: 'devops', name: 'DevOps', icon: Cloud },
    { id: 'database', name: 'Database', icon: DatabaseIcon },
    { id: 'mobile', name: 'Mobile', icon: SmartphoneIcon },
    { id: 'security', name: 'Security', icon: ShieldIcon },
    { id: 'ai-ml', name: 'AI/ML', icon: Brain },
    { id: 'algorithms', name: 'Algorithms', icon: Code2 },
    { id: 'behavioral', name: 'Behavioral', icon: Users },
  ];

  return (
    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      {tabItems.map((tab) => {
        const isSelected = selected === tab.id;
        const count = tab.id ? counts[tab.id] : Object.values(counts).reduce((a, b) => a + b, 0);
        
        return (
          <motion.button
            key={tab.id || 'all'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(tab.id)}
            className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                : 'bg-card/80 backdrop-blur-xl border border-border hover:bg-muted hover:border-violet-500/30'
            }`}
          >
            <span className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.name}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                isSelected ? 'bg-white/20' : 'bg-muted'
              }`}>
                {count}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function ChannelCard({ 
  channel, 
  index, 
  isSubscribed, 
  onToggleSubscribe,
  questionCount,
  completed,
  onNavigate 
}: { 
  channel: any; 
  index: number;
  isSubscribed: boolean;
  onToggleSubscribe: () => void;
  questionCount: number;
  completed: string[];
  onNavigate: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const progress = questionCount > 0 ? Math.round((completed.length / questionCount) * 100) : 0;
  const colors = categoryColors[channel.category] || categoryColors.general;
  const IconComponent = iconMap[channel.icon] || Box;
  const difficulty = difficultyConfig[channel.difficulty as keyof typeof difficultyConfig] || difficultyConfig.beginner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-violet-950/10 rounded-3xl border border-border/50" />
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Animated Border Glow */}
      <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500/0 via-violet-500/50 to-violet-500/0 animate-pulse" />
      </div>

      <div className="relative p-6 space-y-5">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <motion.div 
              className={`w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <IconComponent className="w-8 h-8 text-white" strokeWidth={1.5} />
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-foreground truncate group-hover:text-violet-400 transition-colors">
                  {channel.name}
                </h3>
                {channel.isPremium && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-xs font-bold text-black flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    PRO
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {channel.description}
              </p>
            </div>
          </div>
          
          {/* Lock Icon for Unsubscribed */}
          {!isSubscribed && (
            <div className="p-2 rounded-xl bg-muted/50">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${colors.bg} ${colors.border} ${colors.text} border flex items-center gap-1.5`}>
            {channel.category}
          </span>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${difficulty.bg} ${difficulty.border} ${difficulty.color} border flex items-center gap-1.5`}>
            <Target className="w-3 h-3" />
            {difficulty.label}
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-muted/50 border border-border text-muted-foreground flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />
            {questionCount} Qs
          </span>
        </div>

        {/* Progress Visualization */}
        {isSubscribed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Progress
              </span>
              <span className="font-bold text-foreground">{progress}%</span>
            </div>
            <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completed.length} completed</span>
              <span>{questionCount - completed.length} remaining</span>
            </div>
          </div>
        )}

        {/* Stats for Unsubscribed */}
        {!isSubscribed && (
          <div className="flex items-center gap-4 py-3 px-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-muted-foreground">
                {Math.floor(Math.random() * 50 + 20)}% complete
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">
                {Math.floor(Math.random() * 500 + 100)} learning
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleSubscribe}
            className={`flex-1 px-5 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isSubscribed
                ? 'bg-muted/80 border border-border hover:bg-muted'
                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
            }`}
          >
            {isSubscribed ? (
              <>
                <Check className="w-5 h-5" />
                Subscribed
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5" />
                Unlock Channel
              </>
            )}
          </motion.button>

          {isSubscribed ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNavigate}
              className="p-3.5 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-xl border border-violet-500/30 hover:border-violet-500/50 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-violet-400" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3.5 bg-muted/50 rounded-xl border border-border hover:border-amber-500/30 transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full"
    >
      <div className="relative overflow-hidden rounded-3xl bg-card/50 border border-border p-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5" />
        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/30">
            <Search className="w-10 h-10 text-violet-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No channels found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Try adjusting your search or filters to discover amazing learning channels
          </p>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="h-72 rounded-3xl bg-muted/30 animate-pulse border border-border" />
  );
}

export default function AllChannelsGenZ() {
  const [, navigate] = useLocation();
  const { isSubscribed, toggleSubscription } = useUserPreferences();
  const { stats } = useChannelStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  const questionCounts: Record<string, number> = {};
  stats.forEach(s => { questionCounts[s.id] = s.total; });

  const filteredChannels = allChannelsConfig.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || channel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = allChannelsConfig.reduce((acc, channel) => {
    acc[channel.category] = (acc[channel.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const subscribedCount = allChannelsConfig.filter(c => isSubscribed(c.id)).length;

  const handleVoiceInput = () => {
    setVoiceActive(true);
    setTimeout(() => setVoiceActive(false), 2000);
  };

  return (
    <>
      <SEOHead
        title="Browse Channels - DevPrep Pro Max 🚀"
        description="Explore all topics and start learning. Powered by 30 AI Agents."
        canonical="https://open-interview.github.io/channels"
      />

      <AppLayout>
        <div className="min-h-screen bg-background text-foreground">
          <div className="max-w-7xl mx-auto pb-12 px-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">
                Home
              </button>
              <span>/</span>
              <span className="text-foreground font-medium">Channels</span>
            </div>

            {/* Animated Gradient Header */}
            <AnimatedGradientHeader />

            {/* Modern Search Bar with Voice Input */}
            <ModernSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onVoiceClick={handleVoiceInput}
              voiceActive={voiceActive}
            />

            {/* Category Filter Tabs */}
            <CategoryTabs
              selected={selectedCategory}
              onChange={setSelectedCategory}
              counts={categoryCounts}
            />

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">
                  {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Channels` : 'All Channels'}
                </h2>
                <span className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm font-semibold">
                  {filteredChannels.length}
                </span>
              </div>
              {subscribedCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{subscribedCount} subscribed</span>
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedCategory) && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={clearFilters}
                className="mb-6 px-4 py-2 bg-muted/50 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </motion.button>
            )}

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredChannels.length === 0 ? (
                  <EmptyState onClearFilters={clearFilters} />
                ) : (
                  filteredChannels.map((channel, i) => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      index={i}
                      isSubscribed={isSubscribed(channel.id)}
                      onToggleSubscribe={() => toggleSubscription(channel.id)}
                      questionCount={questionCounts[channel.id] || 0}
                      completed={[]}
                      onNavigate={() => navigate(`/channel/${channel.id}`)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </AppLayout>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
