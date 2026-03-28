/**
 * Channels Page - DevPrep Design System
 * Dark theme with cyan/purple/pink accents
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { allChannelsConfig } from '../lib/channels-config';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useChannelStats } from '../hooks/use-stats';
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

// Dark theme category colors using design system
const categoryColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  'frontend': { 
    bg: 'bg-pink-500/10', 
    border: 'border-pink-500/30', 
    text: 'text-pink-400', 
    accent: 'hsl(330, 100%, 65%)'
  },
  'backend': { 
    bg: 'bg-cyan-500/10', 
    border: 'border-cyan-500/30', 
    text: 'text-cyan-400', 
    accent: 'hsl(190, 100%, 50%)'
  },
  'devops': { 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/30', 
    text: 'text-amber-400', 
    accent: 'hsl(38, 92%, 50%)'
  },
  'database': { 
    bg: 'bg-purple-500/10', 
    border: 'border-purple-500/30', 
    text: 'text-purple-400', 
    accent: 'hsl(270, 100%, 65%)'
  },
  'mobile': { 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/30', 
    text: 'text-emerald-400', 
    accent: 'hsl(142, 76%, 36%)'
  },
  'security': { 
    bg: 'bg-red-500/10', 
    border: 'border-red-500/30', 
    text: 'text-red-400', 
    accent: 'hsl(0, 84%, 60%)'
  },
  'ai-ml': { 
    bg: 'bg-cyan-500/10', 
    border: 'border-cyan-500/30', 
    text: 'text-cyan-400', 
    accent: 'hsl(190, 100%, 50%)'
  },
  'system-design': { 
    bg: 'bg-violet-500/10', 
    border: 'border-violet-500/30', 
    text: 'text-violet-400', 
    accent: 'hsl(270, 100%, 65%)'
  },
  'general': { 
    bg: 'bg-gray-500/10', 
    border: 'border-gray-500/30', 
    text: 'text-gray-400', 
    accent: 'hsl(0, 0%, 75%)'
  },
  'algorithms': { 
    bg: 'bg-lime-500/10', 
    border: 'border-lime-500/30', 
    text: 'text-lime-400', 
    accent: 'hsl(82, 76%, 55%)'
  },
  'behavioral': { 
    bg: 'bg-indigo-500/10', 
    border: 'border-indigo-500/30', 
    text: 'text-indigo-400', 
    accent: 'hsl(239, 84%, 67%)'
  },
  'ui-ux': { 
    bg: 'bg-fuchsia-500/10', 
    border: 'border-fuchsia-500/30', 
    text: 'text-fuchsia-400', 
    accent: 'hsl(291, 84%, 65%)'
  },
};

const difficultyConfig = {
  beginner: { 
    label: 'Beginner', 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/30',
    accent: 'hsl(142, 76%, 46%)'
  },
  intermediate: { 
    label: 'Intermediate', 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/30',
    accent: 'hsl(38, 92%, 50%)'
  },
  advanced: { 
    label: 'Advanced', 
    color: 'text-red-400', 
    bg: 'bg-red-500/10', 
    border: 'border-red-500/30',
    accent: 'hsl(0, 84%, 60%)'
  },
};

function AnimatedGradientHeader() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] mb-10">
      {/* Dark base with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-base-dark)] via-[var(--color-base-card)] to-[var(--color-base-darker)]" />
      
      {/* Animated gradient orbs using design system colors */}
      <div className="absolute inset-0 opacity-30">
        <motion.div 
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 -left-20 w-96 h-96 rounded-full blur-3xl" 
          style={{ background: 'rgba(6, 182, 212, 0.3)' }}
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full blur-3xl" 
          style={{ background: 'rgba(139, 92, 246, 0.2)' }}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl" 
          style={{ background: 'rgba(236, 72, 153, 0.2)' }}
        />
      </div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      
      {/* Glass morphism card layer */}
      <div className="absolute inset-4 rounded-[2.5rem] bg-card/50 backdrop-blur-sm border border-border" />
      
      <div className="relative px-10 py-14">
        <div className="flex items-center justify-between">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <span 
                className="px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(190, 100%, 50%, 0.2) 0%, hsl(270, 100%, 65%, 0.2) 100%)',
                  border: '1px solid hsl(190, 100%, 50%, 0.3)',
                  color: 'hsl(190, 100%, 60%)'
                }}
              >
                <Crown className="w-4 h-4" />
                PRO MAX
              </span>
              <span 
                className="px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'hsl(0, 0%, 75%)'
                }}
              >
                <Sparkles className="w-4 h-4" />
                Learning Platform
              </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-4"
              style={{ color: 'hsl(0, 0%, 98%)' }}
            >
              Explore Channels
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl max-w-xl leading-relaxed"
              style={{ color: 'hsl(0, 0%, 75%)' }}
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
              {/* Multiple shadow layers using design system */}
              <div className="absolute inset-0 rounded-[2.5rem] blur-xl" style={{ background: 'hsl(190, 100%, 50%, 0.2)' }} />
              <div className="absolute inset-0 rounded-[2.5rem)]" style={{ background: 'linear-gradient(135deg, hsl(190, 100%, 50%, 0.1) 0%, hsl(330, 100%, 65%, 0.1) 100%)' }} />
              <div 
                className="relative w-40 h-40 rounded-[2.5rem] backdrop-blur-xl flex items-center justify-center border"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(190, 100%, 50%, 0.15) 0%, hsl(270, 100%, 65%, 0.15) 100%)',
                  borderColor: 'hsl(190, 100%, 50%, 0.3)',
                  boxShadow: '0 0 40px hsl(190, 100%, 50%, 0.2)'
                }}
              >
                <Rocket className="w-20 h-20" style={{ color: 'hsl(190, 100%, 60%)' }} />
              </div>
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -right-3 w-14 h-14 rounded-2xl flex items-center justify-center border-2"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(330, 100%, 65%) 0%, hsl(270, 100%, 65%) 100%)',
                  borderColor: 'white',
                  boxShadow: '0 0 20px hsl(330, 100%, 65%, 0.5)'
                }}
              >
                <Star className="w-6 h-6 text-foreground fill-foreground" />
              </motion.div>
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
      className="relative mb-10"
      animate={{ scale: isFocused ? 1.01 : 1 }}
    >
      {/* Glow effect using design system colors */}
      <div 
        className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
          isFocused ? 'blur-2xl scale-105' : 'blur-xl'
        }`}
        style={{ 
          background: isFocused 
            ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)'
            : 'linear-gradient(135deg, hsl(0, 0%, 12%) 0%, hsl(0, 0%, 8%) 100%)'
        }}
      />
      
      {/* Search Bar Container */}
      <div className="relative flex items-center gap-4">
        <div 
          className={`flex-1 relative rounded-2xl transition-all duration-300`}
          style={{ 
            boxShadow: isFocused ? '0 0 0 4px rgba(6, 182, 212, 0.2)' : 'none'
          }}
        >
          {/* Inner shadow */}
          <div 
            className="absolute inset-0 rounded-2xl"
            style={{ 
              background: 'hsl(0, 0%, 8%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
            }} 
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
            <Search 
              className="w-5 h-5 transition-colors" 
              style={{ color: isFocused ? 'hsl(190, 100%, 50%)' : 'hsl(0, 0%, 53%)' }} 
            />
          </div>
          <input
            type="text"
            placeholder="Search channels, topics, or skills..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="relative w-full pl-14 pr-4 py-5 rounded-2xl text-base focus:outline-none transition-all"
            style={{ 
              background: 'hsl(0, 0%, 6.5%)',
              border: '1px solid hsl(0, 0%, 12%)',
              color: 'hsl(0, 0%, 98%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors z-10"
              style={{ background: 'hsl(0, 0%, 12%)' }}
            >
              <X className="w-4 h-4" style={{ color: 'hsl(0, 0%, 53%)' }} />
            </button>
          )}
        </div>
        
        {/* Voice Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onVoiceClick}
          className="p-5 rounded-2xl border transition-all"
          style={{ 
            background: voiceActive 
              ? 'linear-gradient(135deg, hsl(330, 100%, 65%) 0%, hsl(270, 100%, 65%) 100%)'
              : 'hsl(0, 0%, 8%)',
            borderColor: voiceActive ? 'hsl(330, 100%, 65%)' : 'hsl(0, 0%, 18%)',
            boxShadow: voiceActive ? '0 0 20px hsl(330, 100%, 65%, 0.3)' : '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <Mic 
            className="w-5 h-5 transition-colors" 
            style={{ color: voiceActive ? 'white' : 'hsl(0, 0%, 75%)' }} 
          />
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
    <div className="flex gap-3 mb-10 overflow-x-auto pb-3 scrollbar-hide">
      {tabItems.map((tab) => {
        const isSelected = selected === tab.id;
        const count = tab.id ? counts[tab.id] : Object.values(counts).reduce((a, b) => a + b, 0);
        const colors = tab.id ? categoryColors[tab.id] : null;
        
        return (
          <motion.button
            key={tab.id || 'all'}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(tab.id)}
            className="relative px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all"
            style={{ 
              background: isSelected 
                ? 'linear-gradient(135deg, hsl(190, 100%, 50%) 0%, hsl(270, 100%, 65%) 100%)'
                : 'hsl(0, 0%, 8%)',
              border: `1px solid ${isSelected ? 'hsl(190, 100%, 50%, 0.5)' : 'hsl(0, 0%, 18%)'}`,
              color: isSelected ? 'var(--foreground)' : 'hsl(0, 0%, 75%)',
              boxShadow: isSelected ? '0 0 20px hsl(190, 100%, 50%, 0.3)' : '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <span className="flex items-center gap-2.5">
              <tab.icon 
                className="w-4 h-4" 
                style={{ color: isSelected ? 'var(--foreground)' : (colors?.text || 'hsl(0, 0%, 53%)') }} 
              />
              {tab.name}
              <span 
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ 
                  background: isSelected ? 'rgba(255,255,255,0.2)' : 'hsl(0, 0%, 12%)',
                  color: isSelected ? 'var(--foreground)' : 'hsl(0, 0%, 53%)'
                }}
              >
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Card Base - Dark theme */}
      <div 
        className="absolute inset-0 rounded-[2rem]"
        style={{ 
          background: 'hsl(0, 0%, 6.5%)',
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)',
          border: '1px solid hsl(0, 0%, 12%)'
        }}
      />
      
      {/* Hover glow effect */}
      <motion.div 
        className="absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-500"
        style={{ 
          background: `linear-gradient(135deg, ${colors.accent}10 0%, transparent 100%)`,
          boxShadow: `0 0 40px ${colors.accent}20`
        }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
        }}
      />
      
      {/* Animated border glow on hover */}
      <div 
        className="absolute inset-0 rounded-[2rem] p-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${colors.accent}50 0%, ${colors.accent}20 50%, ${colors.accent}50 100%)`
        }}
      >
        <div className="absolute inset-0 rounded-[2rem]" />
      </div>

      {/* Inner highlight */}
      <div 
        className="absolute inset-x-4 top-4 h-1/3 rounded-[2rem] opacity-30" 
        style={{ 
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)'
        }}
      />

      <div className="relative p-7 space-y-5">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Icon Container with gradient */}
            <motion.div 
              className="w-18 h-18 p-1 rounded-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${colors.accent} 0%, hsl(270, 100%, 65%) 100%)`
              }}
              animate={{ 
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? [0, 3, -3, 0] : 0,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div 
                className="w-full h-full rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <IconComponent 
                  className="w-9 h-9 text-foreground drop-shadow-md" 
                  strokeWidth={1.5} 
                />
              </div>
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 
                  className="text-xl font-bold truncate transition-colors"
                  style={{ 
                    color: isHovered ? colors.accent : 'hsl(0, 0%, 98%)'
                  }}
                >
                  {channel.name}
                </h3>
                {channel.isPremium && (
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"
                    style={{ 
                      background: 'linear-gradient(135deg, hsl(330, 100%, 65%) 0%, hsl(270, 100%, 65%) 100%)',
                      color: 'var(--foreground)',
                      boxShadow: '0 0 15px hsl(330, 100%, 65%, 0.4)'
                    }}
                  >
                    <Crown className="w-3 h-3" />
                    PRO
                  </span>
                )}
              </div>
              <p 
                className="text-sm line-clamp-2 leading-relaxed"
                style={{ color: 'hsl(0, 0%, 53%)' }}
              >
                {channel.description}
              </p>
            </div>
          </div>
          
          {/* Lock Icon for Unsubscribed */}
          {!isSubscribed && (
            <div 
              className="p-2.5 rounded-xl"
              style={{ background: 'hsl(0, 0%, 12%)' }}
            >
              <Lock className="w-4 h-4" style={{ color: 'hsl(0, 0%, 35%)' }} />
            </div>
          )}
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2">
          <span 
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${colors.bg} ${colors.border} ${colors.text} border`}
            style={{ borderColor: colors.accent }}
          >
            {channel.category}
          </span>
          <span 
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${difficulty.bg} ${difficulty.border} ${difficulty.color}`}
            style={{ borderColor: difficulty.accent }}
          >
            <Target className="w-3 h-3" />
            {difficulty.label}
          </span>
          <span 
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
            style={{ 
              background: 'hsl(0, 0%, 12%)',
              border: '1px solid hsl(0, 0%, 18%)',
              color: 'hsl(0, 0%, 53%)'
            }}
          >
            <BookOpen className="w-3 h-3" />
            {questionCount} Qs
          </span>
        </div>

        {/* Progress Visualization */}
        {isSubscribed && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span 
                className="flex items-center gap-2 font-medium"
                style={{ color: 'hsl(0, 0%, 53%)' }}
              >
                <TrendingUp className="w-4 h-4" style={{ color: 'hsl(142, 76%, 46%)' }} />
                Progress
              </span>
              <span 
                className="font-bold"
                style={{ color: 'hsl(0, 0%, 98%)' }}
              >
                {progress}%
              </span>
            </div>
            {/* Progress Bar */}
            <div 
              className="relative h-4 rounded-full overflow-hidden"
              style={{ 
                background: 'hsl(0, 0%, 12%)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(190, 100%, 50%) 0%, hsl(270, 100%, 65%) 50%, hsl(330, 100%, 65%) 100%)'
                }}
              />
              {/* Shine effect */}
              <div 
                className="absolute inset-0 animate-shimmer"
                style={{ 
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)'
                }}
              />
            </div>
            <div 
              className="flex items-center justify-between text-xs font-medium"
              style={{ color: 'hsl(0, 0%, 35%)' }}
            >
              <span>{completed.length} completed</span>
              <span>{questionCount - completed.length} remaining</span>
            </div>
          </div>
        )}

        {/* Stats for Unsubscribed */}
        {!isSubscribed && (
          <div 
            className="flex items-center gap-5 py-4 px-5 rounded-2xl"
            style={{ 
              background: 'hsl(0, 0%, 8%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" style={{ color: 'hsl(330, 100%, 65%)' }} />
              <span 
                className="text-sm font-medium"
                style={{ color: 'hsl(0, 0%, 53%)' }}
              >
                {Math.floor(Math.random() * 50 + 20)}% complete
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: 'hsl(190, 100%, 50%)' }} />
              <span 
                className="text-sm font-medium"
                style={{ color: 'hsl(0, 0%, 53%)' }}
              >
                {Math.floor(Math.random() * 500 + 100)} learning
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleSubscribe}
            className="flex-1 px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            style={{ 
              background: isSubscribed 
                ? 'hsl(0, 0%, 12%)'
                : 'linear-gradient(135deg, hsl(190, 100%, 50%) 0%, hsl(270, 100%, 65%) 100%)',
              border: `2px solid ${isSubscribed ? 'hsl(0, 0%, 18%)' : 'hsl(190, 100%, 50%, 0.5)'}`,
              color: isSubscribed ? 'hsl(0, 0%, 75%)' : 'var(--foreground)',
              boxShadow: isSubscribed ? 'none' : '0 0 20px hsl(190, 100%, 50%, 0.3)'
            }}
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
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNavigate}
              className="p-4 rounded-2xl border-2 transition-all"
              style={{ 
                background: 'linear-gradient(135deg, hsl(190, 100%, 50%, 0.1) 0%, hsl(270, 100%, 65%, 0.1) 100%)',
                borderColor: 'hsl(190, 100%, 50%, 0.3)',
                boxShadow: '0 0 15px hsl(190, 100%, 50%, 0.2)'
              }}
            >
              <ChevronRight className="w-5 h-5" style={{ color: 'hsl(190, 100%, 50%)' }} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.08, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 rounded-2xl border-2 transition-all"
              style={{ 
                background: 'hsl(0, 0%, 8%)',
                borderColor: 'hsl(0, 0%, 18%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'hsl(330, 100%, 65%)' }} />
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
      <div 
        className="relative overflow-hidden rounded-[2rem] p-14 text-center"
        style={{ 
          background: 'hsl(0, 0%, 6.5%)',
          border: '1px solid hsl(0, 0%, 12%)',
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)'
        }}
      >
        {/* Gradient background effects */}
        <div 
          className="absolute inset-0 opacity-30" 
          style={{ 
            background: 'linear-gradient(135deg, hsl(190, 100%, 50%, 0.1) 0%, hsl(270, 100%, 65%, 0.1) 100%)'
          }} 
        />
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" 
          style={{ background: 'hsl(190, 100%, 50%, 0.1)' }} 
        />
        <div 
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl" 
          style={{ background: 'hsl(270, 100%, 65%, 0.1)' }} 
        />
        
        <div className="relative">
          <div 
            className="w-28 h-28 mx-auto mb-6 rounded-[2rem] flex items-center justify-center border"
            style={{ 
              background: 'linear-gradient(135deg, hsl(190, 100%, 50%, 0.1) 0%, hsl(270, 100%, 65%, 0.1) 100%)',
              borderColor: 'hsl(190, 100%, 50%, 0.3)',
              boxShadow: '0 0 30px hsl(190, 100%, 50%, 0.2)'
            }}
          >
            <Search className="w-12 h-12" style={{ color: 'hsl(190, 100%, 50%)' }} />
          </div>
          <h3 
            className="text-3xl font-bold mb-3"
            style={{ color: 'hsl(0, 0%, 98%)' }}
          >
            No channels found
          </h3>
          <p 
            className="mb-8 max-w-md mx-auto text-lg leading-relaxed"
            style={{ color: 'hsl(0, 0%, 53%)' }}
          >
            Try adjusting your search or filters to discover amazing learning channels
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all"
            style={{ 
              background: 'linear-gradient(135deg, hsl(190, 100%, 50%) 0%, hsl(270, 100%, 65%) 100%)',
              color: 'white',
              boxShadow: '0 0 20px hsl(190, 100%, 50%, 0.3)'
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Clear Filters
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AllChannelsGenZ() {
  const [, navigate] = useLocation();
  const { isSubscribed, toggleSubscription } = useUserPreferences();
  const { stats } = useChannelStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);

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
        title="Browse Channels - DevPrep Pro Max"
        description="Explore all topics and start learning with DevPrep."
        canonical="https://open-interview.github.io/channels"
      />

      <AppLayout>
        <div 
          className="min-h-screen"
          style={{ 
            background: 'linear-gradient(180deg, hsl(0, 0%, 0%) 0%, hsl(0, 0%, 8%) 100%)'
          }}
        >
          <div className="max-w-7xl mx-auto pb-16 px-5 pt-6">
            {/* Breadcrumb */}
            <div 
              className="flex items-center gap-2.5 text-sm mb-8 font-medium"
              style={{ color: 'hsl(0, 0%, 53%)' }}
            >
              <button 
                onClick={() => navigate('/')} 
                className="hover:underline transition-colors"
                style={{ color: 'hsl(190, 100%, 50%)' }}
              >
                Home
              </button>
              <span>/</span>
              <span 
                className="font-bold"
                style={{ color: 'hsl(0, 0%, 98%)' }}
              >
                Channels
              </span>
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
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: 'hsl(0, 0%, 98%)' }}
                >
                  {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Channels` : 'All Channels'}
                </h2>
                <span 
                  className="px-4 py-1.5 rounded-full text-sm font-bold"
                  style={{ 
                    background: 'hsl(190, 100%, 50%, 0.1)',
                    border: '1px solid hsl(190, 100%, 50%, 0.3)',
                    color: 'hsl(190, 100%, 50%)'
                  }}
                >
                  {filteredChannels.length}
                </span>
              </div>
              {subscribedCount > 0 && (
                <div 
                  className="flex items-center gap-2.5 text-sm font-medium"
                  style={{ color: 'hsl(0, 0%, 53%)' }}
                >
                  <CheckCircle className="w-5 h-5" style={{ color: 'hsl(142, 76%, 46%)' }} />
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
                className="mb-8 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                style={{ 
                  background: 'hsl(0, 0%, 8%)',
                  border: '1px solid hsl(0, 0%, 18%)',
                  color: 'hsl(0, 0%, 53%)'
                }}
              >
                <X className="w-4 h-4" />
                Clear all filters
              </motion.button>
            )}

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
        
        /* Enhanced focus states */
        input:focus, button:focus {
          outline: none;
        }
        
        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
