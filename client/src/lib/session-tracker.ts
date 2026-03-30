/**
 * Session Tracker - Utilities for tracking active sessions
 * Updates lastAccessedAt timestamps for resume functionality
 */

const STORAGE_AVAILABLE = (() => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
})();

function isQuotaExceededError(e: unknown): boolean {
  return e instanceof DOMException && (
    e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22
  );
}

function safeSetItem(key: string, value: string): boolean {
  if (!STORAGE_AVAILABLE) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (isQuotaExceededError(e)) {
      console.warn('localStorage quota exceeded, session may not persist');
    }
    return false;
  }
}

function safeGetItem(key: string): string | null {
  if (!STORAGE_AVAILABLE) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export interface TestSession {
  channelId: string;
  channelName: string;
  questions: unknown[];
  currentQuestionIndex: number;
  answers: Record<string, string[]>;
  lastAccessedAt: string;
  startedAt: string;
}

export interface CertificationSession {
  certificationId: string;
  certificationName: string;
  questions: unknown[];
  currentQuestionIndex: number;
  answers: Record<string, string[]>;
  lastAccessedAt: string;
  startedAt: string;
}

export function isStorageAvailable(): boolean {
  return STORAGE_AVAILABLE;
}

export function getTestSession(channelId: string): TestSession | null {
  const data = safeGetItem(`test-session-${channelId}`);
  if (!data) return null;
  try {
    return JSON.parse(data) as TestSession;
  } catch {
    return null;
  }
}

export function getCertificationSession(certificationId: string): CertificationSession | null {
  const data = safeGetItem(`certification-session-${certificationId}`);
  if (!data) return null;
  try {
    return JSON.parse(data) as CertificationSession;
  } catch {
    return null;
  }
}

export function updateSessionTimestamp(sessionKey: string, additionalData?: Record<string, unknown>): boolean {
  const existing = safeGetItem(sessionKey);
  if (!existing) return false;
  
  try {
    const data = JSON.parse(existing);
    const updated = {
      ...data,
      ...additionalData,
      lastAccessedAt: new Date().toISOString()
    };
    
    return safeSetItem(sessionKey, JSON.stringify(updated));
  } catch {
    return false;
  }
}

export function saveTestSession(
  channelId: string,
  channelName: string,
  questions: unknown[],
  currentQuestionIndex: number,
  answers: Record<string, string[]>
): boolean {
  const sessionKey = `test-session-${channelId}`;
  const sessionData = {
    channelId,
    channelName,
    questions,
    currentQuestionIndex,
    answers,
    lastAccessedAt: new Date().toISOString(),
    startedAt: new Date().toISOString()
  };
  
  return safeSetItem(sessionKey, JSON.stringify(sessionData));
}

export function updateTestSession(
  channelId: string,
  currentQuestionIndex: number,
  answers: Record<string, string[]>
): boolean {
  const sessionKey = `test-session-${channelId}`;
  const existing = safeGetItem(sessionKey);
  if (!existing) return false;
  
  try {
    const data = JSON.parse(existing);
    const updated = {
      ...data,
      currentQuestionIndex,
      answers,
      lastAccessedAt: new Date().toISOString()
    };
    
    return safeSetItem(sessionKey, JSON.stringify(updated));
  } catch {
    return false;
  }
}

export function saveCertificationSession(
  certificationId: string,
  certificationName: string,
  questions: unknown[],
  currentQuestionIndex: number,
  answers: Record<string, string[]>
): boolean {
  const sessionKey = `certification-session-${certificationId}`;
  const sessionData = {
    certificationId,
    certificationName,
    questions,
    currentQuestionIndex,
    answers,
    lastAccessedAt: new Date().toISOString(),
    startedAt: new Date().toISOString()
  };
  
  return safeSetItem(sessionKey, JSON.stringify(sessionData));
}

export function updateCertificationSession(
  certificationId: string,
  currentQuestionIndex: number,
  answers: Record<string, string[]>
): boolean {
  const sessionKey = `certification-session-${certificationId}`;
  const existing = safeGetItem(sessionKey);
  if (!existing) return false;
  
  try {
    const data = JSON.parse(existing);
    const updated = {
      ...data,
      currentQuestionIndex,
      answers,
      lastAccessedAt: new Date().toISOString()
    };
    
    return safeSetItem(sessionKey, JSON.stringify(updated));
  } catch {
    return false;
  }
}

export function clearSession(sessionKey: string): void {
  if (!STORAGE_AVAILABLE) return;
  try {
    localStorage.removeItem(sessionKey);
  } catch {
    // Silent fail for clear operations
  }
}
