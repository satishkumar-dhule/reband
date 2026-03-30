/**
 * Code Copy Hook
 * Handles all code copy functionality with preferences persistence
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export interface CopyPreferences {
  includeLineNumbers: boolean;
  showToast: boolean;
}

const DEFAULT_PREFERENCES: CopyPreferences = {
  includeLineNumbers: false,
  showToast: true,
};

const STORAGE_KEY = 'devprep-code-copy-prefs';

function loadPreferences(): CopyPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch {
    // Silently fail
  }
  return DEFAULT_PREFERENCES;
}

function savePreferences(prefs: CopyPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Silently fail
  }
}

export function useCodeCopy() {
  const [preferences, setPreferences] = useState<CopyPreferences>(() => loadPreferences());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<CopyPreferences>) => {
    setPreferences(prev => {
      const next = { ...prev, ...updates };
      savePreferences(next);
      return next;
    });
  }, []);

  // Toggle line numbers preference
  const toggleLineNumbers = useCallback(() => {
    updatePreferences({ includeLineNumbers: !preferences.includeLineNumbers });
  }, [preferences.includeLineNumbers, updatePreferences]);

  // Copy code with optional line numbers
  const copyCode = useCallback(async (
    code: string,
    language: string,
    codeId: string,
    options?: { includeLineNumbers?: boolean; copyLink?: boolean }
  ) => {
    try {
      let textToCopy = code;

      // Add line numbers if requested
      if (options?.includeLineNumbers ?? preferences.includeLineNumbers) {
        const lines = code.split('\n');
        textToCopy = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
      }

      // Copy as link if requested (copies a permalink)
      if (options?.copyLink) {
        const baseUrl = window.location.origin;
        const hash = `#code-${codeId}`;
        textToCopy = `${baseUrl}${window.location.pathname}${hash}`;
      }

      await navigator.clipboard.writeText(textToCopy);
      
      setCopiedId(codeId);
      setMenuOpen(null);

      // Show toast if enabled
      if (preferences.showToast) {
        toast({
          title: 'Copied to clipboard',
          description: options?.copyLink 
            ? 'Link copied' 
            : options?.includeLineNumbers ?? preferences.includeLineNumbers
              ? 'Code with line numbers copied'
              : 'Code copied',
          variant: 'success',
          duration: 2000,
        });
      }

      // Reset copied state after delay
      setTimeout(() => setCopiedId(null), 2000);

      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
        duration: 3000,
      });
      return false;
    }
  }, [preferences]);

  // Copy with keyboard shortcut handling
  const handleKeyDown = useCallback((
    e: React.KeyboardEvent,
    code: string,
    codeId: string
  ) => {
    const isMod = e.metaKey || e.ctrlKey;
    
    if (isMod && e.key === 'c') {
      e.preventDefault();
      copyCode(code, '', codeId);
    }
  }, [copyCode]);

  return {
    preferences,
    copiedId,
    menuOpen,
    menuRef,
    copyCode,
    toggleLineNumbers,
    updatePreferences,
    handleKeyDown,
    setMenuOpen,
  };
}

// Utility: Format code with line numbers
export function formatCodeWithLineNumbers(code: string): string {
  return code.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
}

// Utility: Generate code permalink
export function generateCodePermalink(codeId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}${window.location.pathname}#code-${codeId}`;
}
