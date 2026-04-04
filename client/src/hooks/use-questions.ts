import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  getQuestions,
  getQuestionById,
  getSubChannels,
  getCompaniesForChannel,
  getCompaniesWithCounts,
  loadChannelQuestions,
  api,
} from '../lib/questions-loader';
import type { Question } from '../types';

// Seeded random for consistent shuffle per session
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Shuffle array with seed for consistency
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get or create a stable session seed for a channel
function getSessionSeed(channelId: string): number {
  const key = `shuffle-seed-${channelId}`;
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      return parseInt(stored, 10);
    }
    const seed = Date.now();
    sessionStorage.setItem(key, seed.toString());
    return seed;
  } catch (error) {
    console.warn('Failed to access sessionStorage:', error);
    return Date.now();
  }
}

// Get completed question IDs for a channel
function getCompletedIds(channelId: string): Set<string> {
  try {
    const stored = localStorage.getItem(`progress-${channelId}`);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

// Hook to get questions for a channel with filters
export function useQuestions(
  channelId: string,
  subChannel: string = 'all',
  difficulty: string = 'all',
  company: string = 'all',
  shuffle: boolean = true,
  prioritizeUnvisited: boolean = true
) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track the current request ID to detect stale responses
  const requestIdRef = useRef(0);
  
  // Use refs for values accessed in async callbacks to avoid stale closures
  const filtersRef = useRef({ channelId, subChannel, difficulty, company, shuffle, prioritizeUnvisited });

  // Get stable session seed for this channel
  const sessionSeed = useMemo(() => channelId ? getSessionSeed(channelId) : 0, [channelId]);

  useEffect(() => {
    if (!channelId) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    // Increment request ID to track this specific request
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    // Update ref with current filter values
    filtersRef.current = { channelId, subChannel, difficulty, company, shuffle, prioritizeUnvisited };

    // Try to get from cache first
    let cached = getQuestions(channelId, subChannel, difficulty, company);
    if (cached.length > 0) {
      const processed = processQuestions(cached, channelId, shuffle, prioritizeUnvisited, sessionSeed);
      // Check if this response is still relevant (not superseded by a newer request)
      if (currentRequestId === requestIdRef.current) {
        setQuestions(processed);
        setLoading(false);
      }
      return;
    }

    // Load from API with abort controller
    const controller = new AbortController();

    loadChannelQuestions(channelId)
      .then(() => {
        // Capture filter values at promise resolution time
        const { channelId: cId, subChannel: sc, difficulty: diff, company: comp, shuffle: shuf, prioritizeUnvisited: prio } = filtersRef.current;
        const filtered = getQuestions(cId, sc, diff, comp);
        const processed = processQuestions(filtered, cId, shuf, prio, sessionSeed);
        
        // Check if this response is still relevant (not superseded by a newer request)
        if (currentRequestId === requestIdRef.current) {
          setQuestions(processed);
        }
      })
      .catch((err: Error) => {
        // Ignore abort errors - they're expected when component unmounts or request is superseded
        if (err.name === 'AbortError') return;
        // Only update state if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          setError(err);
          setQuestions([]);
        }
      })
      .finally(() => {
        // Only update loading state if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      });

    // Cleanup - abort the request if component unmounts or dependencies change
    return () => {
      controller.abort();
    };
  }, [channelId, subChannel, difficulty, company, shuffle, prioritizeUnvisited, sessionSeed]);

  const questionIds = useMemo(() => questions.map(q => q.id), [questions]);

  return {
    questions,
    questionIds,
    totalQuestions: questions.length,
    loading,
    error,
  };
}

// Process questions: shuffle and prioritize unvisited
function processQuestions(
  questions: Question[],
  channelId: string,
  shuffle: boolean,
  prioritizeUnvisited: boolean,
  seed: number
): Question[] {
  let result = [...questions];
  
  if (shuffle) {
    result = shuffleArray(result, seed);
  }
  
  if (prioritizeUnvisited) {
    const completedIds = getCompletedIds(channelId);
    const unvisited = result.filter(q => !completedIds.has(q.id));
    const visited = result.filter(q => completedIds.has(q.id));
    result = [...unvisited, ...visited];
  }
  
  return result;
}

// Hook to get companies for a channel (simple list)
export function useCompanies(channelId: string) {
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!channelId) {
      setCompanies([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    // Try cache first
    const cached = getCompaniesForChannel(channelId);
    if (cached.length > 0) {
      setCompanies(cached);
      setLoading(false);
      return;
    }

    // Load from API with abort controller
    setLoading(true);
    api.channels.getCompanies(channelId)
      .then((result) => {
        if (!controller.signal.aborted) {
          setCompanies(result);
        }
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setError(err);
          setCompanies([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [channelId]);

  return {
    companies,
    loading,
    error,
  };
}

// Hook to get companies with counts (respects current filters)
export function useCompaniesWithCounts(
  channelId: string,
  subChannel: string = 'all',
  difficulty: string = 'all'
) {
  const companiesWithCounts = useMemo(() => {
    if (!channelId) return [];
    return getCompaniesWithCounts(channelId, subChannel, difficulty);
  }, [channelId, subChannel, difficulty]);

  return {
    companiesWithCounts,
    loading: false,
    error: null,
  };
}

// Hook to get a single question by ID with proper request cancellation
export function useQuestion(questionId: string | undefined) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track the current request ID to detect stale responses
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!questionId) {
      setQuestion(null);
      setLoading(false);
      return;
    }

    // Increment request ID to track this specific request
    const currentRequestId = ++requestIdRef.current;

    // Try cache first (synchronous, always safe)
    const cached = getQuestionById(questionId);
    if (cached) {
      // Still use request ID check in case cache was populated by a newer request
      if (currentRequestId === requestIdRef.current) {
        setQuestion(cached);
        setLoading(false);
      }
      return;
    }

    // Load from API with abort controller for proper cancellation
    const controller = new AbortController();
    setLoading(true);

    api.questions.getById(questionId)
      .then((result) => {
        // Check if this response is still relevant
        if (currentRequestId === requestIdRef.current) {
          setQuestion(result);
          setError(null);
        }
      })
      .catch((err: Error) => {
        // Ignore abort errors - they're expected when component unmounts or request is superseded
        if (err.name === 'AbortError') {
          return;
        }
        // Only update state if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          setError(err);
          setQuestion(null);
        }
      })
      .finally(() => {
        // Only update loading state if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      });

    // Cleanup function - abort the request if component unmounts or dependencies change
    return () => {
      controller.abort();
    };
  }, [questionId]);

  return { 
    question, 
    loading, 
    error 
  };
}

// Combined hook for question navigation with current question
export function useQuestionsWithPrefetch(
  channelId: string,
  currentIndex: number,
  subChannel: string = 'all',
  difficulty: string = 'all',
  company: string = 'all',
  shuffle: boolean = true,
  prioritizeUnvisited: boolean = true
) {
  const { questions, questionIds, totalQuestions, loading, error } = useQuestions(
    channelId,
    subChannel,
    difficulty,
    company,
    shuffle,
    prioritizeUnvisited
  );

  const currentQuestion = useMemo(() => {
    if (currentIndex >= 0 && currentIndex < questions.length) {
      return questions[currentIndex];
    }
    return null;
  }, [questions, currentIndex]);

  return {
    question: currentQuestion,
    questions,
    questionIds,
    totalQuestions,
    loading,
    error
  };
}

// Hook to get subchannels for a channel with proper request cancellation
export function useSubChannels(channelId: string) {
  const [subChannels, setSubChannels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track the current request ID to detect stale responses
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!channelId) {
      setSubChannels([]);
      setLoading(false);
      return;
    }

    // Increment request ID to track this specific request
    const currentRequestId = ++requestIdRef.current;

    // Try cache first (synchronous, always safe)
    const cached = getSubChannels(channelId);
    if (cached.length > 0) {
      if (currentRequestId === requestIdRef.current) {
        setSubChannels(cached);
        setLoading(false);
      }
      return;
    }

    // Load from API with abort controller
    const controller = new AbortController();
    
    api.channels.getSubChannels(channelId)
      .then((result) => {
        if (currentRequestId === requestIdRef.current) {
          setSubChannels(result);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        if (currentRequestId === requestIdRef.current) {
          setError(err);
          setSubChannels([]);
        }
      })
      .finally(() => {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [channelId]);

  return { 
    subChannels, 
    loading, 
    error 
  };
}
