/**
 * Sidebar Context
 * Manages sidebar collapsed state with localStorage persistence
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [isCollapsed]);

  const toggleSidebar = useCallback(() => setIsCollapsed(prev => !prev), []);
  const setCollapsed = useCallback((collapsed: boolean) => setIsCollapsed(collapsed), []);

  const value = useMemo(() => ({
    isCollapsed,
    toggleSidebar,
    setCollapsed,
  }), [isCollapsed, toggleSidebar, setCollapsed]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
