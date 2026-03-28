import React, { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import { Sun, Moon } from 'lucide-react';

// GitHub color tokens matching theme.ts
const githubColors = {
  light: {
    bg: '#ffffff',
    bgSecondary: '#f6f8fa',
    border: '#d0d7de',
    textPrimary: '#1f2328',
    textSecondary: '#656d76',
    iconColor: '#656d76',
    hoverBg: '#f3f4f6',
  },
  dark: {
    bg: '#0d1117',
    bgSecondary: '#161b22',
    border: '#30363d',
    textPrimary: '#f0f6fc',
    textSecondary: '#8b949e',
    iconColor: '#c9d1d9',
    hoverBg: '#21262d',
  },
};

export type ThemeMode = 'light' | 'dark';

interface GitHubThemeToggleProps {
  onToggle?: (mode: ThemeMode) => void;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  variant?: 'icon' | 'button' | 'switch';
}

export const GitHubThemeToggle: React.FC<GitHubThemeToggleProps> = ({
  onToggle,
  size = 'medium',
  showLabel = false,
  variant = 'button',
}) => {
  const muiTheme = useMuiTheme();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme to document
  useEffect(() => {
    const colors = isDark ? githubColors.dark : githubColors.light;
    
    // Set CSS custom properties for theme
    document.documentElement.style.setProperty('--theme-toggle-bg', colors.bgSecondary);
    document.documentElement.style.setProperty('--theme-toggle-border', colors.border);
    document.documentElement.style.setProperty('--theme-toggle-text', colors.textPrimary);
    document.documentElement.style.setProperty('--theme-toggle-icon', colors.iconColor);
    document.documentElement.style.setProperty('--theme-toggle-hover', colors.hoverBg);
    
    // Persist to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update document class for potential CSS-based theming
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(isDark ? 'dark' : 'light');
    
    // Update MUI theme attribute for Emotion
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    onToggle?.(isDark ? 'dark' : 'light');
  }, [isDark, onToggle]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if no manual preference is saved
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  // Size configurations
  const sizeConfig = {
    small: { button: { px: 1.5, py: 0.5 }, icon: 14, font: '0.75rem' },
    medium: { button: { px: 2, py: 1 }, icon: 18, font: '0.875rem' },
    large: { button: { px: 3, py: 1.5 }, icon: 22, font: '1rem' },
  };

  const colors = isDark ? githubColors.dark : githubColors.light;
  const config = sizeConfig[size];

  // Icon-only variant (circular button)
  if (variant === 'icon') {
    return (
      <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} arrow>
        <IconButton
          onClick={toggleTheme}
          size={size}
          sx={{
            color: colors.iconColor,
            backgroundColor: colors.bgSecondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '50%',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: colors.hoverBg,
              transform: 'rotate(15deg)',
            },
          }}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun 
              size={config.icon} 
              style={{ 
                transition: 'transform 0.3s ease',
                animation: 'sunrise 0.4s ease-out'
              }} 
            />
          ) : (
            <Moon 
              size={config.icon}
              style={{ 
                transition: 'transform 0.3s ease',
                animation: 'rise 0.4s ease-out'
              }} 
            />
          )}
        </IconButton>
      </Tooltip>
    );
  }

  // Switch variant (toggle pill)
  if (variant === 'switch') {
    return (
      <Box
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && toggleTheme()}
        sx={{
          width: 44,
          height: 24,
          borderRadius: '12px',
          backgroundColor: isDark ? '#58a6ff' : '#d0d7de',
          border: `1px solid ${isDark ? '#58a6ff' : '#d0d7de'}`,
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
          '&:hover': {
            transform: 'scale(1.02)',
          },
          '&:focus-visible': {
            outline: '2px solid #58a6ff',
            outlineOffset: '2px',
          },
        }}
      >
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: isDark ? '#0d1117' : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            transform: isDark ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDark ? (
            <Sun size={10} color="#58a6ff" />
          ) : (
            <Moon size={10} color="#656d76" />
          )}
        </Box>
      </Box>
    );
  }

  // Default button variant
  return (
    <Box
      component="button"
      onClick={toggleTheme}
      onKeyDown={(e) => e.key === 'Enter' && toggleTheme()}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: colors.bgSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        padding: config.button.py,
        paddingLeft: config.button.px,
        paddingRight: config.button.px,
        cursor: 'pointer',
        color: colors.textPrimary,
        fontSize: config.font,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        fontWeight: 500,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        '&:hover': {
          backgroundColor: colors.hoverBg,
          borderColor: isDark ? '#484f58' : '#afb8c1',
        },
        '&:focus-visible': {
          boxShadow: `0 0 0 3px ${isDark ? 'rgba(88, 166, 255, 0.4)' : 'rgba(9, 105, 218, 0.3)'}`,
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Box
        component="span"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          animation: isDark ? 'sunRise 0.4s ease-out' : 'moonRise 0.4s ease-out',
        }}
      >
        {isDark ? (
          <Sun 
            size={config.icon} 
            color={colors.iconColor}
            strokeWidth={2.5}
          />
        ) : (
          <Moon 
            size={config.icon}
            color={colors.iconColor}
            strokeWidth={2.5}
          />
        )}
      </Box>
      {showLabel && (
        <Box
          component="span"
          sx={{
            transition: 'opacity 0.2s ease',
          }}
        >
          {isDark ? 'Dark' : 'Light'}
        </Box>
      )}
    </Box>
  );
};

// Hook for consuming theme state in other components
export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    if (saved) return saved as ThemeMode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newMode);
      return newMode;
    });
  }, []);

  return { mode, toggleMode, isDark: mode === 'dark' };
};

export default GitHubThemeToggle;
