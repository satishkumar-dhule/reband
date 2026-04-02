/**
 * Reading Progress Hook
 * Tracks scroll position, section visibility, and reading progress for long-form content
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ReadingProgress {
  questionId: string;
  scrollProgress: number; // 0-100
  sectionsRead: string[];
  estimatedTimeRemaining: number; // seconds
  isFullyRead: boolean;
  lastReadAt: number;
}

interface UseReadingProgressOptions {
  questionId: string;
  sections?: string[]; // Section IDs to track
  wordsPerMinute?: number;
  onFullyRead?: () => void;
}

interface UseReadingProgressReturn {
  scrollProgress: number;
  sectionsRead: string[];
  estimatedTimeRemaining: number;
  isFullyRead: boolean;
  showScrollToTop: boolean;
  scrollToTop: () => void;
  progressBarRef: React.RefObject<HTMLDivElement | null>;
}

// Words per minute for estimation (average adult reading speed)
const DEFAULT_WPM = 238;

function calculateReadingTime(wordCount: number, wpm: number = DEFAULT_WPM): number {
  return Math.ceil(wordCount / wpm) * 60; // Return seconds
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function getStorageKey(questionId: string): string {
  return `reading-progress-${questionId}`;
}

function loadProgress(questionId: string): Partial<ReadingProgress> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(getStorageKey(questionId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Failed to load reading progress for ${questionId}:`, error);
  }
  return {};
}

function saveProgress(progress: ReadingProgress): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getStorageKey(progress.questionId), JSON.stringify(progress));
  } catch (error) {
    console.error(`Failed to save reading progress:`, error);
  }
}

export function useReadingProgress({
  questionId,
  sections = [],
  wordsPerMinute = DEFAULT_WPM,
  onFullyRead,
}: UseReadingProgressOptions): UseReadingProgressReturn {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [sectionsRead, setSectionsRead] = useState<string[]>([]);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  const [isFullyRead, setIsFullyRead] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const lastScrollUpdate = useRef(0);
  const fullyReadFired = useRef(false);
  
  // Initialize from storage on mount
  useEffect(() => {
    const stored = loadProgress(questionId);
    if (stored.scrollProgress !== undefined) {
      setScrollProgress(stored.scrollProgress);
    }
    if (stored.sectionsRead) {
      setSectionsRead(stored.sectionsRead);
    }
    if (stored.isFullyRead) {
      setIsFullyRead(true);
      fullyReadFired.current = true;
    }
  }, [questionId]);
  
  // Calculate total words from sections
  useEffect(() => {
    if (sections.length > 0) {
      let words = 0;
      sections.forEach(sectionId => {
        const element = sectionRefs.current.get(sectionId);
        if (element) {
          words += countWords(element.textContent || '');
        }
      });
      setTotalWords(words);
      setEstimatedTimeRemaining(calculateReadingTime(words, wordsPerMinute));
    }
  }, [sections, wordsPerMinute]);
  
  // Track scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const now = Date.now();
      // Throttle updates to 100ms
      if (now - lastScrollUpdate.current < 100) return;
      lastScrollUpdate.current = now;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      
      if (maxScroll <= 0) {
        setScrollProgress(100);
        return;
      }
      
      const progress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
      setScrollProgress(progress);
      
      // Show/hide scroll to top button
      setShowScrollToTop(scrollTop > 300);
      
      // Update estimated time remaining based on progress
      if (totalWords > 0) {
        const wordsRemaining = Math.ceil(totalWords * (1 - progress / 100));
        setEstimatedTimeRemaining(calculateReadingTime(wordsRemaining, wordsPerMinute));
      }
      
      // Check which sections have been scrolled past
      const updatedSectionsRead = new Set<string>(sectionsRead);
      sections.forEach(sectionId => {
        const element = sectionRefs.current.get(sectionId);
        if (element && !updatedSectionsRead.has(sectionId)) {
          const rect = element.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          // Section is "read" when its top is above the viewport center
          if (rect.top < containerRect.top + containerRect.height * 0.3) {
            updatedSectionsRead.add(sectionId);
          }
        }
      });
      
      if (updatedSectionsRead.size !== sectionsRead.length) {
        setSectionsRead(Array.from(updatedSectionsRead));
      }
      
      // Check for fully read
      const wasFullyRead = isFullyRead;
      const nowFullyRead = progress >= 90 && sections.length > 0 
        ? sections.every(s => updatedSectionsRead.has(s))
        : progress >= 90;
      
      if (nowFullyRead && !wasFullyRead) {
        setIsFullyRead(true);
        if (!fullyReadFired.current) {
          fullyReadFired.current = true;
          onFullyRead?.();
        }
      }
    };
    
    // Listen for scroll on the container
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also observe section visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId && !sectionsRead.includes(sectionId)) {
              setSectionsRead(prev => {
                if (!prev.includes(sectionId)) {
                  return [...prev, sectionId];
                }
                return prev;
              });
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.3,
      }
    );
    
    // Observe all registered sections
    sectionRefs.current.forEach((element) => {
      observer.observe(element);
    });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [questionId, sections, sectionsRead, isFullyRead, totalWords, wordsPerMinute, onFullyRead]);
  
  // Persist progress to storage
  useEffect(() => {
    const progress: ReadingProgress = {
      questionId,
      scrollProgress,
      sectionsRead,
      estimatedTimeRemaining,
      isFullyRead,
      lastReadAt: Date.now(),
    };
    saveProgress(progress);
  }, [questionId, scrollProgress, sectionsRead, estimatedTimeRemaining, isFullyRead]);
  
  // Scroll to top function
  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);
  
  return {
    scrollProgress,
    sectionsRead,
    estimatedTimeRemaining,
    isFullyRead,
    showScrollToTop,
    scrollToTop,
    progressBarRef,
  };
}

/**
 * Register a section element for tracking
 */
export function registerSection(sectionId: string, element: HTMLElement | null, sectionRefs: React.MutableRefObject<Map<string, HTMLElement>>) {
  if (element) {
    sectionRefs.current.set(sectionId, element);
  } else {
    sectionRefs.current.delete(sectionId);
  }
}

/**
 * Clear reading progress for a specific question
 */
export function clearReadingProgress(questionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getStorageKey(questionId));
}

/**
 * Get all saved reading progress
 */
export function getAllReadingProgress(): ReadingProgress[] {
  if (typeof window === 'undefined') return [];
  
  const progress: ReadingProgress[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('reading-progress-')) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          progress.push(JSON.parse(stored));
        }
      } catch (error) {
        console.error(`Failed to parse reading progress:`, error);
      }
    }
  }
  return progress;
}
