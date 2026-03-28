/**
 * Voice Practice GenZ - Premium Pro Max UI/UX
 * Claymorphism + Glassmorphism Design with Premium Microphone UI
 * Uses Design System: Dark theme with cyan/purple/pink accents
 * CSS Variables: --color-accent-cyan, --color-accent-purple, --color-accent-pink
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Eye, EyeOff, Volume2, Trophy, RotateCcw, 
  ChevronRight, Sparkles, BookOpen, Mic, Zap,
  Target, Clock, TrendingUp, Star, Crown, Lock, Play,
  MessageSquare, Brain, BarChart3, Flame, Waves
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { AppLayout } from '../components/layout/AppLayout';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { ChannelService } from '../services/api.service';
import { GenZCard, GenZButton, GenZMicrophone, GenZProgress } from '../components/genz';
import type { Question } from '../types';

const isSpeechSupported = typeof window !== 'undefined' && 
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

type PracticeMode = 'training' | 'interview';
type RecordingState = 'idle' | 'recording' | 'recorded';

interface FeedbackResult {
  wordsSpoken: number;
  targetWords: number;
  duration: number;
  message: string;
  score: number;
  clarity: number;
  fluency: number;
  pace: number;
}

// Claymorphism + Glassmorphism Card Component
function ClayGlassCard({ 
  children, 
  className = '',
  glowColor = 'hsl(190, 100%, 50%)', // cyan accent from design system
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  glowColor?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative ${className}`}
    >
      {/* Claymorphism base with glass effect */}
      <div 
        className="relative overflow-hidden rounded-[28px] bg-card/30 backdrop-blur-xl saturate-[180%] border border-border shadow-xl"
      >
        {/* Subtle glow */}
        <div 
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30"
          style={{ background: glowColor }}
        />
        
        {/* Inner claymorphism depth */}
        <div 
          className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-foreground/5 to-background/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.08),inset_0_-2px_4px_rgba(0,0,0,0.08)]"
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

// Premium Microphone Button with Claymorphism
function PremiumMicButton({ 
  isRecording, 
  onStart, 
  onStop, 
  disabled 
}: { 
  isRecording: boolean; 
  onStart: () => void; 
  onStop: () => void; 
  disabled?: boolean;
}) {
  return (
    <motion.div 
      className="relative flex flex-col items-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
    >
      {/* Outer glow ring */}
      {isRecording && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%), hsl(190, 100%, 50%))', // cyan to purple gradient
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
      
      {/* Recording pulse rings */}
      {isRecording && (
        <>
          <motion.div
            className="absolute rounded-full border-2 border-cyan-500/50"
            initial={{ width: 140, height: 140, opacity: 0.8 }}
            animate={{ 
              width: [140, 200, 220],
              height: [140, 200, 220],
              opacity: [0.6, 0.3, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          <motion.div
            className="absolute rounded-full border-2 border-purple-500/40"
            initial={{ width: 140, height: 140, opacity: 0.6 }}
            animate={{ 
              width: [140, 180, 200],
              height: [140, 180, 200],
              opacity: [0.5, 0.2, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5
            }}
          />
        </>
      )}
      
      {/* Main claymorphism button */}
      <motion.button
        onClick={isRecording ? onStop : onStart}
        disabled={disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative w-36 h-36 rounded-[40px] flex items-center justify-center
          transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{
          background: isRecording 
            ? 'linear-gradient(145deg, hsl(0, 84%, 60%) 0%, hsl(330, 100%, 65%) 50%, hsl(270, 100%, 65%) 100%)' // pink to purple for recording
            : 'linear-gradient(145deg, hsl(190, 100%, 50%) 0%, hsl(270, 100%, 65%) 50%, hsl(330, 100%, 65%) 100%)', // cyan to purple to pink
          boxShadow: `
            0 12px 40px hsla(190, 100%, 50%, 0.4),
            0 8px 20px hsla(270, 100%, 65%, 0.3),
            inset 0 2px 4px rgba(255,255,255,0.3),
            inset 0 -2px 4px rgba(0,0,0,0.2)
          `,
          border: '1px solid rgba(255,255,255,0.25)'
        }}
      >
        {/* Inner highlight */}
        <div 
          className="absolute top-2 left-4 right-4 h-8 rounded-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)'
          }}
        />
        
        {/* Mic icon container */}
        <div 
          className="relative w-20 h-20 rounded-[24px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, hsl(215, 50%, 20%) 0%, hsl(215, 40%, 10%) 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {isRecording ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <div className="w-4 h-4 bg-foreground rounded-sm" />
              </div>
            </motion.div>
          ) : (
            <Mic className="w-12 h-12 text-foreground drop-shadow-lg" />
          )}
        </div>
        
        {/* Recording indicator */}
        {isRecording && (
          <motion.div
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(145deg, hsl(0, 84%, 60%), hsl(330, 100%, 65%))', // red to pink
              boxShadow: '0 4px 20px hsla(0, 84%, 60%, 0.5)'
            }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-foreground"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-foreground text-sm font-bold">Recording...</span>
            </div>
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  );
}

// Live Audio Visualizer with waves
interface LiveAudioVisualizerProps {
  isActive: boolean;
}

function LiveAudioVisualizer({ isActive }: LiveAudioVisualizerProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-24">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{
            background: isActive 
              ? `linear-gradient(to top, hsl(190, 100%, 50%), hsl(270, 100%, 65%), hsl(330, 100%, 65%))` // cyan to purple to pink
              : 'rgba(148, 163, 184, 0.5)'
          }}
          animate={isActive ? {
            height: [16, Math.random() * 60 + 30, 16],
          } : { height: 16 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.03,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Animated Background with floating orbs
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient - using design system colors */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(0, 0%, 2%) 0%, hsl(0, 0%, 6.5%) 50%, hsl(0, 0%, 2%) 100%)'
        }}
      />
      
      {/* Floating orbs - cyan/purple/pink from design system */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, hsla(190, 100%, 50%, 0.4) 0%, transparent 70%)' }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, hsla(270, 100%, 65%, 0.35) 0%, transparent 70%)' }}
        animate={{
          x: [0, -40, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-[80px]"
        style={{ background: 'radial-gradient(circle, hsla(330, 100%, 65%, 0.25) 0%, transparent 70%)' }}
        animate={{
          x: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      {/* Subtle grid pattern - cyan accent */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(hsla(190, 100%, 50%, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsla(190, 100%, 50%, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Top gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-hsl(0, 0%, 2%) via-transparent to-hsl(0, 0%, 2%)" />
    </div>
  );
}

// Question Card with claymorphism
function QuestionCard({ question, index, showAnswer, mode, targetWords }: {
  question: Question;
  index: number;
  showAnswer: boolean;
  mode: PracticeMode;
  targetWords: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -30, rotateX: 10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <ClayGlassCard glowColor="hsl(190, 100%, 50%)">
        <div className="p-8">
          {/* Header */}
          <motion.div 
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.span 
              className="flex items-center justify-center w-12 h-12 rounded-2xl"
              whileHover={{ scale: 1.1, rotate: 3 }}
              style={{
                background: 'linear-gradient(145deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))',
                boxShadow: '0 4px 15px hsla(190, 100%, 50%, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <span className="text-foreground font-black text-lg">{index + 1}</span>
            </motion.span>
            <div className="flex items-center gap-2">
              <span 
                className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                style={{
                  background: question.difficulty === 'beginner' 
                    ? 'rgba(34,197,94,0.2)' 
                    : question.difficulty === 'intermediate'
                    ? 'rgba(234,179,8,0.2)'
                    : 'rgba(239,68,68,0.2)',
                  color: question.difficulty === 'beginner' 
                    ? '#22c55e' 
                    : question.difficulty === 'intermediate'
                    ? '#eab308'
                    : '#ef4444'
                }}
              >
                {question.difficulty}
              </span>
              <span className="text-muted-foreground text-sm">{question.channel}</span>
            </div>
          </motion.div>

          {/* Question */}
          <motion.h2 
            className="text-2xl font-bold text-foreground mb-3 leading-snug"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {question.question}
          </motion.h2>

            {/* Meta */}
          <motion.div 
            className="flex items-center gap-4 text-sm text-muted-foreground mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-400" />
              {targetWords} target words
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              ~{Math.ceil(targetWords / 2.5)}min
            </span>
          </motion.div>

          {/* Answer */}
          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="relative overflow-hidden rounded-2xl bg-card/50 border border-border"
                >
                  <div 
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{
                      background: 'linear-gradient(180deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))'
                    }}
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                          {mode === 'training' ? 'Answer to Read' : 'Ideal Answer'}
                        </span>
                      </div>
                      <span 
                        className="text-xs text-muted-foreground px-3 py-1 rounded-lg bg-muted/30"
                      >
                        {targetWords} words
                      </span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      <p className="text-muted-foreground text-[15px] leading-[1.8] whitespace-pre-wrap">
                        {question.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ClayGlassCard>
    </motion.div>
  );
}

// AI Feedback Visualization with claymorphism
function AIFeedbackVisualization({ feedback }: { feedback: FeedbackResult }) {
  const metrics = [
    { label: 'Score', value: feedback.score, color: 'from-yellow-500 to-cyan-500' },
    { label: 'Clarity', value: feedback.clarity, color: 'from-cyan-500 to-green-500' },
    { label: 'Fluency', value: feedback.fluency, color: 'from-cyan-500 to-purple-500' },
    { label: 'Pace', value: feedback.pace, color: 'from-red-500 to-yellow-500' },
  ];

  return (
    <ClayGlassCard glowColor="hsl(270, 100%, 65%)" delay={0.1}>
      <div className="p-8">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 3 }}
              style={{
                background: 'linear-gradient(145deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))',
                boxShadow: '0 6px 20px hsla(190, 100%, 50%, 0.4)'
              }}
            >
              <Brain className="w-7 h-7 text-foreground" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-foreground">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">Real-time feedback</p>
            </div>
          </div>
          
            <motion.div 
              className="flex items-center gap-2 px-5 py-3 rounded-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              style={{
                background: 'linear-gradient(145deg, hsla(38, 92%, 50%, 0.2), hsla(190, 100%, 50%, 0.2))',
                border: '1px solid hsla(38, 92%, 50%, 0.3)'
              }}
            >
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-3xl font-black text-yellow-500">{feedback.score}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </motion.div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-4 rounded-2xl bg-card/50 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <span className="text-xl font-black text-foreground">{metric.value}</span>
              </div>
              <div 
                className="h-2 rounded-full overflow-hidden bg-muted/30"
              >
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feedback message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-5 rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, hsla(190, 100%, 50%, 0.15), hsla(270, 100%, 65%, 0.1))',
            border: '1px solid hsla(190, 100%, 50%, 0.3)'
          }}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-primary font-semibold mb-1">Feedback</p>
              <p className="text-muted-foreground">{feedback.message}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div 
          className="flex items-center gap-6 mt-6 pt-6 border-t border-border"
        >
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            {feedback.wordsSpoken}/{feedback.targetWords} words
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {feedback.duration}s
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            {feedback.duration > 0 ? Math.round(feedback.wordsSpoken / (feedback.duration / 60)) : 0} WPM
          </span>
        </div>
      </div>
    </ClayGlassCard>
  );
}

// Progress Tracker with claymorphism
function ProgressTracker({ 
  currentIndex, 
  total, 
  totalTime 
}: { 
  currentIndex: number; 
  total: number; 
  totalTime: number;
}) {
  const progress = ((currentIndex + 1) / total) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[24px]"
    >
      <div 
        className="relative p-6 bg-card/50 backdrop-blur-xl border border-border shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 3 }}
              style={{
                background: 'linear-gradient(145deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))',
                boxShadow: '0 4px 15px hsla(190, 100%, 50%, 0.4)'
              }}
            >
              <Flame className="w-6 h-6 text-foreground" />
            </motion.div>
            <div>
              <p className="text-sm text-muted-foreground">Session Progress</p>
              <p className="text-lg font-bold text-foreground">Question {currentIndex + 1} of {total}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-foreground">{Math.round(progress)}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div 
          className="h-3 rounded-full overflow-hidden mb-4 bg-muted/30"
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%), hsl(330, 100%, 65%))'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {Array.from({ length: Math.min(total, 10) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="w-3 h-3 rounded-full"
                style={{
                  background: i < currentIndex 
                    ? 'hsl(142, 76%, 46%)' // green for completed
                    : i === currentIndex 
                    ? 'hsl(190, 100%, 50%)' // cyan for current
                    : 'rgb(148, 163, 184)' // slate-400 for pending
                }}
              />
            ))}
            {total > 10 && <span className="text-xs text-muted-foreground ml-1">+{total - 10}</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{Math.floor(totalTime / 60)}m {totalTime % 60}s total</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Premium Pro Section
function PremiumProSection() {
  const [isPro] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <ClayGlassCard glowColor="hsl(38, 92%, 50%)">
        <div className="p-8 flex items-start gap-6">
          <motion.div 
            className="w-18 h-18 rounded-2xl flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.08, rotate: 5 }}
            style={{
              background: 'linear-gradient(145deg, hsl(38, 92%, 50%), hsl(38, 92%, 60%))',
              boxShadow: '0 8px 25px hsla(38, 92%, 50%, 0.5)'
            }}
          >
            <Crown className="w-9 h-9 text-foreground" />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-black text-yellow-500">PRO FEATURES</h3>
              <span 
                className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'hsla(38, 92%, 50%, 0.2)', color: 'hsl(38, 92%, 50%)' }}
              >
                VIP
              </span>
            </div>
            <p className="text-muted-foreground mb-6">
              Unlock AI-powered speech analysis, pronunciation scoring, and unlimited practice sessions.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { icon: Zap, text: 'AI Speech Analysis' },
                { icon: TrendingUp, text: 'Pronunciation Score' },
                { icon: Star, text: 'Unlimited Sessions' },
                { icon: Target, text: 'Custom Topics' },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <item.icon className="w-4 h-4 text-yellow-500" />
                  <span className="text-muted-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>
            <button 
              className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(145deg, hsl(38, 92%, 50%), hsl(38, 92%, 60%))',
                boxShadow: '0 4px 20px hsla(38, 92%, 50%, 0.4)'
              }}
            >
              <Crown className="w-5 h-5" />
              Upgrade to PRO
            </button>
          </div>
        </div>
      </ClayGlassCard>
    </motion.div>
  );
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function calculateFeedback(transcript: string, targetAnswer: string, duration: number): FeedbackResult {
  const wordsSpoken = countWords(transcript);
  const targetWords = countWords(targetAnswer);
  
  let message: string;
  let score: number;
  let clarity: number;
  let fluency: number;
  let pace: number;
  
  const ratio = wordsSpoken / targetWords;
  
  if (ratio >= 0.8 && ratio <= 1.2) {
    message = "Perfect! Your answer length is spot on! 🌟";
    score = 95;
    clarity = 92;
    fluency = 90;
    pace = 88;
  } else if (ratio >= 0.5 && ratio < 0.8) {
    message = "Good effort! Try to elaborate more details. 💪";
    score = 75;
    clarity = 78;
    fluency = 72;
    pace = 80;
  } else if (ratio > 1.2 && ratio <= 1.5) {
    message = "Great depth! Try to be more concise. 🎯";
    score = 80;
    clarity = 85;
    fluency = 82;
    pace = 75;
  } else if (wordsSpoken > 0) {
    message = "Keep practicing! Try to match the target length. 📚";
    score = 50;
    clarity = 55;
    fluency = 48;
    pace = 52;
  } else {
    message = "Start speaking to practice! 🎤";
    score = 0;
    clarity = 0;
    fluency = 0;
    pace = 0;
  }
  
  return { wordsSpoken, targetWords, duration, message, score, clarity, fluency, pace };
}

export default function VoicePracticeGenZ() {
  const [, setLocation] = useLocation();
  const { getSubscribedChannels } = useUserPreferences();
  
  const [mode, setMode] = useState<PracticeMode>('interview');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [liveWPM, setLiveWPM] = useState(0);
  const [totalPracticeTime, setTotalPracticeTime] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const recordingStateRef = useRef<RecordingState>('idle');
  const [recognitionReady, setRecognitionReady] = useState(false);
  
  const currentQuestion = questions[currentIndex];
  const targetWords = currentQuestion?.answer ? countWords(currentQuestion.answer) : 0;

  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      const subscribedChannels = getSubscribedChannels();
      
      if (subscribedChannels.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const allQuestions: Question[] = [];
        
        for (const channel of subscribedChannels) {
          try {
            const data = await ChannelService.getData(channel.id);
            const suitable = data.questions.filter((q: Question) => 
              q.voiceSuitable !== false && q.answer && q.answer.length > 100
            );
            allQuestions.push(...suitable);
          } catch (e) {
            console.error(`Failed to load ${channel.id}`, e);
          }
        }
        
        if (allQuestions.length > 0) {
          const shuffled = allQuestions.sort(() => Math.random() - 0.5);
          setQuestions(shuffled.slice(0, 15));
        }
      } catch (e) {
        console.error('Failed to load questions', e);
      }
      
      setLoading(false);
    }

    loadQuestions();
  }, [getSubscribedChannels]);

  useEffect(() => {
    if (!isSpeechSupported) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setTranscript(prev => (prev + final).trim());
        const words = countWords(transcript + final);
        const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
        if (elapsed > 0) setLiveWPM(Math.round(words / elapsed));
      }
      setInterimTranscript(interim);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
    
    recognition.onend = () => {
      if (recordingStateRef.current === 'recording') {
        try { recognition.start(); } catch (e) { }
      }
    };
    
    recognitionRef.current = recognition;
    setRecognitionReady(true);
    
    return () => { try { recognition.stop(); } catch (e) { } };
  }, [transcript]);

  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setTranscript('');
    setInterimTranscript('');
    setFeedback(null);
    setDuration(0);
    setLiveWPM(0);
    startTimeRef.current = Date.now();
    
    try {
      recognitionRef.current.start();
      setRecordingState('recording');
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (e) { }
    
    setRecordingState('recorded');
    setTotalPracticeTime(prev => prev + duration);
    
    if (currentQuestion) {
      const result = calculateFeedback(transcript, currentQuestion.answer, duration);
      setFeedback(result);
      
      if (mode === 'interview') {
        setShowAnswer(true);
      }
    }
  }, [transcript, currentQuestion, duration, mode]);

  const resetForNewQuestion = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFeedback(null);
    setDuration(0);
    setRecordingState('idle');
    setShowAnswer(mode === 'training');
    setLiveWPM(0);
  }, [mode]);

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetForNewQuestion();
    } else {
      setLocation('/');
    }
  }, [currentIndex, questions.length, resetForNewQuestion, setLocation]);

  const tryAgain = useCallback(() => {
    resetForNewQuestion();
  }, [resetForNewQuestion]);

  const toggleMode = useCallback(() => {
    const newMode = mode === 'training' ? 'interview' : 'training';
    setMode(newMode);
    setShowAnswer(newMode === 'training');
  }, [mode]);

  useEffect(() => {
    setShowAnswer(mode === 'training');
  }, [mode, currentIndex]);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'linear-gradient(145deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))',
                boxShadow: '0 12px 40px hsla(190, 100%, 50%, 0.4)'
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Mic className="w-12 h-12 text-foreground" />
            </motion.div>
            <p className="text-muted-foreground text-lg">Loading questions...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <ClayGlassCard>
              <div className="p-10 text-center">
                <div 
                  className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-card border border-border"
                >
                  <BookOpen className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">No Questions Available</h2>
                <p className="text-muted-foreground mb-6">Subscribe to channels to access practice questions</p>
                <button
                  onClick={() => setLocation('/channels')}
                  className="px-8 py-3 rounded-2xl font-bold transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(145deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))',
                    boxShadow: '0 4px 20px hsla(190, 100%, 50%, 0.4)'
                  }}
                >
                  Browse Channels
                </button>
              </div>
            </ClayGlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!isSpeechSupported) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md text-center"
          >
            <ClayGlassCard>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-3">Browser Not Supported</h2>
                <p className="text-muted-foreground mb-6">
                  Voice practice requires the Web Speech API. Please use Chrome, Edge, or Safari.
                </p>
                <button
                  onClick={() => setLocation('/')}
                  className="px-8 py-3 rounded-2xl font-bold transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(145deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))',
                    boxShadow: '0 4px 20px hsla(190, 100%, 50%, 0.4)'
                  }}
                >
                  Go Home
                </button>
              </div>
            </ClayGlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Voice Practice | Code Reels"
        description="Practice answering interview questions with voice recording and feedback"
        canonical="https://open-interview.github.io/voice-practice"
      />

      <AppLayout fullWidth hideNav>
        <div className="min-h-screen relative overflow-hidden">
          <AnimatedBackground />
          
          <div className="relative z-10 min-h-screen">
            {/* Header */}
            <header className="pt-8 pb-4">
              <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <motion.div 
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <motion.button
                      onClick={() => setLocation('/')}
                      className="p-3 rounded-2xl transition-colors bg-muted/20 backdrop-blur-sm border border-border"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                    <div>
                      <h1 className="text-3xl font-black text-foreground">Voice Practice</h1>
                      <p className="text-muted-foreground">Master your interview skills</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div 
                      className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl"
                      style={{
                        background: 'hsla(190, 100%, 50%, 0.15)',
                        border: '1px solid hsla(190, 100%, 50%, 0.3)'
                      }}
                    >
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-mono text-primary">{duration}s</span>
                    </div>
                    <motion.button
                      onClick={toggleMode}
                      className="px-5 py-2.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 border border-border"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: mode === 'interview'
                          ? 'linear-gradient(145deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))'
                          : 'rgba(255,255,255,0.08)'
                      }}
                    >
                      <span className="flex items-center gap-1.5">
                        {mode === 'interview' ? (
                          <><EyeOff className="w-3.5 h-3.5" /> Interview</>
                        ) : (
                          <><Eye className="w-3.5 h-3.5" /> Training</>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </div>
                
                <ProgressTracker 
                  currentIndex={currentIndex} 
                  total={questions.length} 
                  totalTime={totalPracticeTime}
                />
              </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 pb-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  className="space-y-8"
                >
                  <QuestionCard 
                    question={currentQuestion}
                    index={currentIndex}
                    showAnswer={showAnswer}
                    mode={mode}
                    targetWords={targetWords}
                  />

                  {/* Recording Section */}
                  <ClayGlassCard glowColor="hsl(270, 100%, 65%)" delay={0.15}>
                    <div className="p-8 flex flex-col items-center gap-6">
                      {/* Audio Visualizer */}
                      <LiveAudioVisualizer isActive={recordingState === 'recording'} />
                      
                      {/* Stats */}
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-3xl font-black text-foreground">{countWords(transcript)}</div>
                          <div className="text-xs text-muted-foreground mt-1">Words</div>
                        </div>
                        <div className="w-px h-12 bg-border" />
                        <div className="text-center">
                          <div className="text-3xl font-black text-primary">{liveWPM}</div>
                          <div className="text-xs text-muted-foreground mt-1">WPM</div>
                        </div>
                        <div className="w-px h-12 bg-border" />
                        <div className="text-center">
                          <div className="text-3xl font-black text-purple-400">{duration}s</div>
                          <div className="text-xs text-muted-foreground mt-1">Duration</div>
                        </div>
                      </div>

                      {/* Progress to target */}
                      {targetWords > 0 && (
                        <div className="w-full max-w-md">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Word Progress</span>
                            <span className="text-foreground font-semibold">{countWords(transcript)}/{targetWords}</span>
                          </div>
                          <div 
                            className="h-3 rounded-full overflow-hidden bg-muted/30"
                          >
                            <motion.div 
                              className="h-full rounded-full"
                              style={{
                                background: 'linear-gradient(90deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))'
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((countWords(transcript) / targetWords) * 100, 100)}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Mic Button */}
                      <PremiumMicButton
                        isRecording={recordingState === 'recording'}
                        onStart={startRecording}
                        onStop={stopRecording}
                        disabled={!recognitionReady}
                      />

                      {/* Transcript Display */}
                      <div className="w-full max-w-lg">
                        <div 
                          className="p-5 rounded-2xl min-h-[80px] bg-card/50 border border-border"
                        >
                          {transcript || interimTranscript ? (
                            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                              {transcript}
                              <span className="text-muted-foreground/60">{interimTranscript}</span>
                            </p>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-muted-foreground/60 text-sm italic text-center">
                                {recordingState === 'recording' 
                                  ? '🎤 Listening... Start speaking'
                                  : 'Tap the microphone to start practicing'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Feedback */}
                      <AnimatePresence>
                        {feedback && (
                          <AIFeedbackVisualization feedback={feedback} />
                        )}
                      </AnimatePresence>

                      {/* Action Buttons */}
                      <motion.div 
                        className="flex gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {recordingState === 'recorded' && (
                          <>
                            <motion.button
                              onClick={tryAgain}
                              className="px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all hover:opacity-90 bg-muted/20 border border-border"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <RotateCcw className="w-4 h-4" />
                              Try Again
                            </motion.button>
                            <motion.button
                              onClick={goToNext}
                              className="px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all hover:opacity-90"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              style={{
                                background: 'linear-gradient(145deg, hsl(190, 100%, 50%), hsl(270, 100%, 65%))',
                                boxShadow: '0 4px 20px hsla(190, 100%, 50%, 0.4)'
                              }}
                            >
                              Next Question
                              <ChevronRight className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                      </motion.div>
                    </div>
                  </ClayGlassCard>

                  <PremiumProSection />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
