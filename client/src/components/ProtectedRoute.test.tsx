import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setAuthToken, getAuthToken, isAuthenticated, clearAuthToken } from './ProtectedRoute';

class MockStorage implements Storage {
  private store: Record<string, string> = {};
  
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  
  removeItem(key: string): void {
    delete this.store[key];
  }
  
  clear(): void {
    this.store = {};
  }
  
  get length(): number {
    return Object.keys(this.store).length;
  }
  
  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

const mockLocalStorage = new MockStorage();

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('ProtectedRoute Auth Token Persistence', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('setAuthToken', () => {
    it('should set auth token and expiry in localStorage', () => {
      setAuthToken('test-token-123');
      
      expect(mockLocalStorage.getItem('devprep-auth-token')).toBe('test-token-123');
      expect(mockLocalStorage.getItem('devprep-auth-expiry')).not.toBeNull();
    });
  });

  describe('Test Case 1: Token persistence after refresh', () => {
    it('should persist token in localStorage across refresh simulation', () => {
      setAuthToken('persistent-token');
      
      const storedToken = mockLocalStorage.getItem('devprep-auth-token');
      expect(storedToken).toBe('persistent-token');
      
      const expiry = mockLocalStorage.getItem('devprep-auth-expiry');
      expect(expiry).not.toBeNull();
      
      const expiryTime = parseInt(expiry!, 10);
      expect(expiryTime).toBeGreaterThan(Date.now());
    });
  });

  describe('Test Case 2: Expired token validation', () => {
    it('should return null for expired token', () => {
      mockLocalStorage.setItem('devprep-auth-token', 'expired-token');
      mockLocalStorage.setItem('devprep-auth-expiry', String(Date.now() - 1000));
      
      expect(getAuthToken()).toBeNull();
    });

    it('should return false from isAuthenticated() for expired token', () => {
      mockLocalStorage.setItem('devprep-auth-token', 'expired-token');
      mockLocalStorage.setItem('devprep-auth-expiry', String(Date.now() - 1000));
      
      expect(isAuthenticated()).toBe(false);
    });

    it('should return null when no token exists', () => {
      expect(getAuthToken()).toBeNull();
      expect(isAuthenticated()).toBe(false);
    });

    it('should return null when only token exists without expiry', () => {
      mockLocalStorage.setItem('devprep-auth-token', 'token-without-expiry');
      
      expect(getAuthToken()).toBeNull();
    });

    it('Test Case 4: should return true from isAuthenticated() with valid non-expired token', () => {
      setAuthToken('valid-token');
      
      expect(isAuthenticated()).toBe(true);
      expect(getAuthToken()).toBe('valid-token');
    });
  });

  describe('Test Case 3 & 4: ProtectedRoute behavior', () => {
    it('should export isAuthenticated function', () => {
      expect(typeof isAuthenticated).toBe('function');
    });

    it('should export setAuthToken function', () => {
      expect(typeof setAuthToken).toBe('function');
    });

    it('should export clearAuthToken function', () => {
      expect(typeof clearAuthToken).toBe('function');
    });
  });

  describe('clearAuthToken', () => {
    it('should remove token and expiry from localStorage', () => {
      setAuthToken('test-token');
      clearAuthToken();
      
      expect(mockLocalStorage.getItem('devprep-auth-token')).toBeNull();
      expect(mockLocalStorage.getItem('devprep-auth-expiry')).toBeNull();
    });
  });
});
