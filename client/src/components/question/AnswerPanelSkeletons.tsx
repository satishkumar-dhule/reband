/**
 * Skeleton Components for ExtremeAnswerPanel
 * Progressive loading states with shimmer animation
 * Dark/light mode support via CSS custom properties
 */

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// ============================================================================
// BASE SKELETON COMPONENTS
// ============================================================================

interface SkeletonProps {
  className?: string;
  delayIndex?: number;
}

/**
 * Base Skeleton with shimmer animation
 * Uses CSS custom properties for dark/light mode support
 */
export function Skeleton({ className, delayIndex = 0 }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading content"
      className={cn(
        'rounded-md bg-[var(--gh-skeleton-bg,var(--gh-neutral-muted))] dark:bg-[var(--gh-skeleton-bg-dark,#30363d)]',
        'animate-shimmer',
        className
      )}
      style={delayIndex > 0 ? { animationDelay: `${delayIndex * 100}ms` } : undefined}
    />
  );
}

/**
 * Skeleton for TL;DR / Quick Answer content
 */
export function AnswerSkeleton() {
  return (
    <div className="flex items-start gap-4">
      <Skeleton className="w-6 h-6 shrink-0 mt-1" delayIndex={0} />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-full" delayIndex={1} />
        <Skeleton className="h-4 w-5/6" delayIndex={2} />
        <Skeleton className="h-4 w-4/5" delayIndex={3} />
        <Skeleton className="h-4 w-3/4" delayIndex={4} />
      </div>
    </div>
  );
}

/**
 * Skeleton for Mermaid Diagram area
 */
export function DiagramSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-5 h-5" delayIndex={0} />
        <Skeleton className="h-4 w-24" delayIndex={1} />
      </div>
      {/* Diagram container */}
      <div className="rounded-xl border border-border bg-muted/20 p-8 min-h-[200px] flex items-center justify-center">
        <div className="space-y-3 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" delayIndex={2} />
          <div className="flex justify-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" delayIndex={3} />
            <Skeleton className="h-6 w-20 rounded-full" delayIndex={4} />
            <Skeleton className="h-6 w-20 rounded-full" delayIndex={5} />
          </div>
          <Skeleton className="h-4 w-full" delayIndex={6} />
          <Skeleton className="h-4 w-5/6 mx-auto" delayIndex={7} />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Video Thumbnails (YouTube)
 */
export function VideoSkeleton() {
  return (
    <div className="space-y-4">
      {/* Video tabs */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28 rounded-lg" delayIndex={0} />
        <Skeleton className="h-10 w-32 rounded-lg" delayIndex={1} />
      </div>
      {/* Video thumbnail */}
      <div className="relative rounded-xl overflow-hidden border border-border" style={{ aspectRatio: '16/9' }}>
        <Skeleton className="absolute inset-0" delayIndex={2} />
        {/* Play button placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <Skeleton className="w-8 h-8 rounded-full" delayIndex={3} />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-3 right-3">
          <Skeleton className="h-6 w-12 rounded" delayIndex={4} />
        </div>
      </div>
      {/* Video info */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" delayIndex={5} />
        <Skeleton className="h-3 w-1/2" delayIndex={6} />
      </div>
    </div>
  );
}

/**
 * Skeleton for ELI5 (Explain Like I'm 5) content
 */
export function Eli5Skeleton() {
  return (
    <div className="space-y-4">
      {/* ELI5 header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Skeleton className="w-6 h-6 rounded-full" delayIndex={0} />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" delayIndex={1} />
          <Skeleton className="h-3 w-16" delayIndex={2} />
        </div>
      </div>
      {/* ELI5 content - simplified blocks */}
      <div className="pl-4 border-l-2 border-primary/30 space-y-3">
        <Skeleton className="h-4 w-full" delayIndex={3} />
        <Skeleton className="h-4 w-11/12" delayIndex={4} />
        <Skeleton className="h-4 w-full" delayIndex={5} />
        <Skeleton className="h-4 w-4/5" delayIndex={6} />
        {/* Metaphor block */}
        <div className="bg-primary/5 rounded-lg p-4 mt-4 space-y-2">
          <Skeleton className="h-5 w-32" delayIndex={7} />
          <Skeleton className="h-4 w-full" delayIndex={8} />
          <Skeleton className="h-4 w-3/4" delayIndex={9} />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Full Explanation (Deep Dive) section
 */
export function ExplanationSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 shrink-0 mt-1" delayIndex={0} />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-4 w-full" delayIndex={1} />
          <Skeleton className="h-4 w-full" delayIndex={2} />
          <Skeleton className="h-4 w-5/6" delayIndex={3} />
          {/* Code block skeleton */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-16" delayIndex={4} />
            <Skeleton className="h-4 w-full" delayIndex={5} />
            <Skeleton className="h-4 w-4/5" delayIndex={6} />
            <Skeleton className="h-4 w-full" delayIndex={7} />
          </div>
          <Skeleton className="h-4 w-full" delayIndex={8} />
          <Skeleton className="h-4 w-3/4" delayIndex={9} />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Tags section
 */
export function TagsSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="w-4 h-4 shrink-0 mt-1" delayIndex={0} />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-lg" delayIndex={1} />
        <Skeleton className="h-6 w-20 rounded-lg" delayIndex={2} />
        <Skeleton className="h-6 w-14 rounded-lg" delayIndex={3} />
        <Skeleton className="h-6 w-18 rounded-lg" delayIndex={4} />
      </div>
    </div>
  );
}

/**
 * Combined loading skeleton for TabbedMediaPanel
 * Shows progressive loading for each tab type
 */
export function TabbedMediaSkeleton({ activeTab = 'tldr' }: { activeTab?: 'tldr' | 'diagram' | 'eli5' | 'video' }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card backdrop-blur-xl overflow-hidden shadow-xl"
    >
      {/* Tab Headers skeleton */}
      <div className="flex border-b border-border bg-muted/30">
        {['tldr', 'diagram', 'eli5', 'video'].map((tab, i) => (
          <div key={tab} className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-4">
            <Skeleton 
              className={cn(
                "h-4 w-4 rounded",
                tab === activeTab ? 'bg-primary/30' : ''
              )} 
              delayIndex={i} 
            />
            <Skeleton className="h-4 w-16 hidden sm:block" delayIndex={i + 4} />
          </div>
        ))}
      </div>
      
      {/* Tab Content skeleton - varies by active tab */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'tldr' && <AnswerSkeleton />}
            {activeTab === 'diagram' && <DiagramSkeleton />}
            {activeTab === 'eli5' && <Eli5Skeleton />}
            {activeTab === 'video' && <VideoSkeleton />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * Full Answer Panel Skeleton - Progressive loading state
 */
export function AnswerPanelSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full overflow-y-auto overflow-x-hidden bg-gradient-to-br from-background via-muted/10 to-background"
    >
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 pb-32 space-y-6">
        {/* Tabbed Media Panel Skeleton */}
        <div className="rounded-2xl border border-border bg-card backdrop-blur-xl overflow-hidden shadow-xl">
          {/* Tab Headers skeleton */}
          <div className="flex border-b border-border bg-muted/30">
            {['tldr', 'diagram', 'eli5', 'video'].map((tab, i) => (
              <div key={tab} className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-4">
                <Skeleton className="h-4 w-4 rounded" delayIndex={i} />
                <Skeleton className="h-4 w-16 hidden sm:block" delayIndex={i + 4} />
              </div>
            ))}
          </div>
          {/* Content skeleton */}
          <div className="p-4 sm:p-6">
            <AnswerSkeleton />
          </div>
        </div>
        
        {/* Deep Dive Explanation Skeleton */}
        <div className="rounded-2xl border border-border bg-card backdrop-blur-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5" delayIndex={0} />
              <Skeleton className="h-5 w-40" delayIndex={1} />
            </div>
            <Skeleton className="w-5 h-5 rounded" delayIndex={2} />
          </div>
          <div className="px-5 pb-5">
            <ExplanationSkeleton />
          </div>
        </div>
        
        {/* Tags Skeleton */}
        <TagsSkeleton />
        
        {/* References Skeleton */}
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" delayIndex={0} />
          <Skeleton className="h-10 w-28 rounded-xl" delayIndex={1} />
        </div>
      </div>
    </motion.div>
  );
}
