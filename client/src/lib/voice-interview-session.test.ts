import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  startSession,
  beginSession,
  submitAnswer,
  completeSession,
  saveSessionState,
  loadSessionState,
  clearSessionState,
  saveSessionToHistory,
  getSessionHistory,
  clearSessionHistory,
  getHistoryCount,
  type VoiceSession,
  type SessionQuestion,
  type SessionState,
} from './voice-interview-session';

const mockSession: VoiceSession = {
  id: 'session-1',
  topic: 'Load Balancers',
  description: 'Practice load balancer concepts',
  channel: 'system-design',
  difficulty: 'intermediate',
  questionIds: ['q1', 'q2', 'q3'],
  totalQuestions: 3,
  estimatedMinutes: 6,
};

const mockQuestions: SessionQuestion[] = [
  {
    id: 'q1',
    question: 'What is a load balancer?',
    criticalPoints: [
      { phrase: 'traffic distribution', weight: 3, alternatives: ['distribute traffic'] },
      { phrase: 'multiple servers', weight: 2, alternatives: ['server pool'] },
    ],
    idealAnswer: 'A load balancer distributes traffic across multiple servers.',
    difficulty: 'beginner',
    order: 1,
  },
  {
    id: 'q2',
    question: 'What are the types of load balancing?',
    criticalPoints: [
      { phrase: 'Layer 4', weight: 3, alternatives: ['network layer'] },
      { phrase: 'Layer 7', weight: 3, alternatives: ['application layer'] },
    ],
    idealAnswer: 'Layer 4 (transport) and Layer 7 (application) load balancing.',
    difficulty: 'intermediate',
    order: 2,
  },
  {
    id: 'q3',
    question: 'What is sticky sessions?',
    criticalPoints: [
      { phrase: 'same server', weight: 3, alternatives: ['consistent server'] },
      { phrase: 'session affinity', weight: 2, alternatives: ['session persistence'] },
    ],
    idealAnswer: 'Sticky sessions route requests from the same client to the same server.',
    difficulty: 'intermediate',
    order: 3,
  },
];

describe('Voice Interview Session Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Session State - Resume on Refresh', () => {
    it('should save session state and retrieve it', () => {
      const state = startSession(mockSession, mockQuestions);
      const inProgressState = beginSession(state);

      saveSessionState(inProgressState);

      const retrieved = loadSessionState();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.session.id).toBe(mockSession.id);
      expect(retrieved?.currentQuestionIndex).toBe(0);
      expect(retrieved?.answers).toEqual([]);
    });

    it('should resume voice session after simulated refresh', () => {
      const state = startSession(mockSession, mockQuestions);
      const inProgress = beginSession(state);
      inProgress.answers = [
        {
          questionId: 'q1',
          userAnswer: 'A load balancer distributes traffic',
          score: 80,
          pointsCovered: [{ phrase: 'traffic distribution', weight: 3 }],
          pointsMissed: [],
          weightedScore: 3,
          maxPossibleScore: 5,
          isCorrect: true,
          feedback: 'Good!',
        },
      ];
      inProgress.currentQuestionIndex = 1;

      saveSessionState(inProgress);

      const stored = localStorage.getItem('voice-session-state');
      localStorage.clear();
      if (stored) {
        localStorage.setItem('voice-session-state', stored);
      }

      const resumed = loadSessionState();
      expect(resumed).not.toBeNull();
      expect(resumed?.session.id).toBe(mockSession.id);
      expect(resumed?.currentQuestionIndex).toBe(1);
      expect(resumed?.answers).toHaveLength(1);
    });

    it('should clear session state', () => {
      const state = startSession(mockSession, mockQuestions);
      saveSessionState(state);

      clearSessionState();

      const retrieved = loadSessionState();
      expect(retrieved).toBeNull();
    });
  });

  describe('Session History - Persistence', () => {
    it('should save completed session to history', () => {
      const state = startSession(mockSession, mockQuestions);
      const completed = beginSession(state);
      
      const withAnswers = submitAnswer(completed, 'A load balancer distributes traffic across servers');
      const finished = submitAnswer(withAnswers, 'Layer 4 and Layer 7');
      const final = submitAnswer(finished, 'Sticky sessions route to same server');

      const result = completeSession(final);

      saveSessionToHistory(result);

      const history = getSessionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].sessionId).toBe(mockSession.id);
    });

    it('should persist history after simulated refresh', () => {
      const state = startSession(mockSession, mockQuestions);
      const completed = beginSession(state);
      const final = submitAnswer(submitAnswer(submitAnswer(completed, 'answer'), 'answer'), 'answer');
      const result = completeSession(final);

      saveSessionToHistory(result);

      const stored = localStorage.getItem('voice-session-history');
      localStorage.clear();
      if (stored) {
        localStorage.setItem('voice-session-history', stored);
      }

      const history = getSessionHistory();
      expect(history).toHaveLength(1);
    });
  });

  describe('Session History - Max 20 Limit', () => {
    it('should enforce max 20 history limit', () => {
      clearSessionHistory();

      for (let i = 0; i < 25; i++) {
        const session: VoiceSession = { ...mockSession, id: `session-${i}` };
        const state = startSession(session, mockQuestions);
        const completed = beginSession(state);
        const final = submitAnswer(
          submitAnswer(submitAnswer(completed, 'a'), 'a'), 'a'
        );
        const result = completeSession(final);
        saveSessionToHistory(result);
      }

      const history = getSessionHistory();
      expect(history).toHaveLength(20);
    });

    it('should keep most recent sessions when limit exceeded', () => {
      clearSessionHistory();

      for (let i = 0; i < 22; i++) {
        const session: VoiceSession = { ...mockSession, id: `session-${i}`, topic: `Topic ${i}` };
        const state = startSession(session, mockQuestions);
        const completed = beginSession(state);
        const final = submitAnswer(
          submitAnswer(submitAnswer(completed, 'a'), 'a'), 'a'
        );
        const result = completeSession(final);
        saveSessionToHistory(result);
      }

      const history = getSessionHistory();
      expect(history[0].sessionId).toBe('session-21');
      expect(history[history.length - 1].sessionId).toBe('session-2');
    });

    it('should not add duplicate sessions to history', () => {
      const state = startSession(mockSession, mockQuestions);
      const completed = beginSession(state);
      const final = submitAnswer(
        submitAnswer(submitAnswer(completed, 'a'), 'a'), 'a'
      );
      const result = completeSession(final);

      saveSessionToHistory(result);
      saveSessionToHistory(result);
      saveSessionToHistory(result);

      const history = getSessionHistory();
      expect(history).toHaveLength(1);
    });

    it('should return correct history count', () => {
      expect(getHistoryCount()).toBe(0);

      const state = startSession(mockSession, mockQuestions);
      const completed = beginSession(state);
      const final = submitAnswer(
        submitAnswer(submitAnswer(completed, 'a'), 'a'), 'a'
      );
      const result = completeSession(final);

      saveSessionToHistory(result);
      expect(getHistoryCount()).toBe(1);

      const session2: VoiceSession = { ...mockSession, id: 'session-2' };
      const state2 = startSession(session2, mockQuestions);
      const result2 = completeSession(beginSession(state2));
      saveSessionToHistory(result2);

      expect(getHistoryCount()).toBe(2);
    });

    it('should clear session history', () => {
      const state = startSession(mockSession, mockQuestions);
      const completed = beginSession(state);
      const final = submitAnswer(
        submitAnswer(submitAnswer(completed, 'a'), 'a'), 'a'
      );
      const result = completeSession(final);

      saveSessionToHistory(result);
      expect(getHistoryCount()).toBe(1);

      clearSessionHistory();
      expect(getHistoryCount()).toBe(0);
    });
  });

  describe('Session Expiry', () => {
    it('should expire session after 24 hours', () => {
      const state = startSession(mockSession, mockQuestions);
      const inProgress = beginSession(state);
      
      const expiredState = {
        ...inProgress,
        lastAccessedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      };
      localStorage.setItem('voice-session-state', JSON.stringify(expiredState));

      const loaded = loadSessionState();
      expect(loaded).toBeNull();
    });

    it('should not expire fresh session', () => {
      const state = startSession(mockSession, mockQuestions);
      const inProgress = beginSession(state);
      
      const freshState = {
        ...inProgress,
        lastAccessedAt: new Date().toISOString(),
      };
      localStorage.setItem('voice-session-state', JSON.stringify(freshState));

      const loaded = loadSessionState();
      expect(loaded).not.toBeNull();
    });
  });
});
