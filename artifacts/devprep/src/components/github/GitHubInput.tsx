'use client';

import React, { useEffect, useState } from 'react';

type InputSize = 'sm' | 'md';

interface GitHubInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  inputSize?: InputSize;
  validation?: 'default' | 'error';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Theme-aware colors
const inputColors = {
  light: {
    border: '#d0d7de',
    bg: '#ffffff',
    text: '#24292f',
    icon: '#57606a',
    placeholder: '#8c959f',
    focus: 'rgba(9, 105, 218, 0.3)',
    errorBorder: '#cf222e',
    errorFocus: 'rgba(207, 34, 46, 0.15)',
  },
  dark: {
    border: '#30363d',
    bg: '#0d1117',
    text: '#e6edf3',
    icon: '#8b949e',
    placeholder: '#6e7681',
    focus: 'rgba(88, 166, 255, 0.3)',
    errorBorder: '#f85149',
    errorFocus: 'rgba(248, 81, 73, 0.15)',
  },
};

const sizeStyles: Record<InputSize, React.CSSProperties> = {
  sm: {
    padding: '5px 12px',
    fontSize: '12px',
    lineHeight: '20px',
  },
  md: {
    padding: '8px 16px',
    fontSize: '14px',
    lineHeight: '20px',
  },
};

export const GitHubInput = React.forwardRef<HTMLInputElement, GitHubInputProps>(
  ({ 
    inputSize = 'md', 
    validation = 'default', 
    leftIcon, 
    rightIcon,
    style,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Detect dark mode
    useEffect(() => {
      const checkDarkMode = () => {
        const isDark = document.documentElement.classList.contains('dark') || 
                       document.documentElement.getAttribute('data-theme') === 'dark' ||
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(isDark);
      };
      
      checkDarkMode();
      
      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class', 'data-theme'] 
      });
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', checkDarkMode);
      
      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener('change', checkDarkMode);
      };
    }, []);

    const colors = isDarkMode ? inputColors.dark : inputColors.light;
    
    const baseStyles: React.CSSProperties = {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      border: `1px solid ${colors.border}`,
      borderRadius: '6px',
      outline: 'none',
      backgroundColor: colors.bg,
      color: colors.text,
      width: '100%',
      boxSizing: 'border-box',
      transition: 'box-shadow 0.2s ease',
    };

    const focusStyles: React.CSSProperties = {
      boxShadow: `0 0 0 3px ${colors.focus}`,
    };

    const validationStyles = validation === 'error' 
      ? { borderColor: colors.errorBorder, boxShadow: `0 0 0 3px ${colors.errorFocus}` }
      : {};

    const containerStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      width: props.type === 'checkbox' || props.type === 'radio' ? 'auto' : '100%',
    };

    const inputStyle: React.CSSProperties = {
      ...baseStyles,
      ...(isFocused ? focusStyles : {}),
      ...sizeStyles[inputSize],
      ...validationStyles,
      paddingLeft: leftIcon ? '36px' : sizeStyles[inputSize].padding,
      paddingRight: rightIcon ? '36px' : sizeStyles[inputSize].padding,
      ...style,
    };

    return (
      <div style={containerStyle}>
        {leftIcon && (
          <span style={{
            position: 'absolute',
            left: '12px',
            color: colors.icon,
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}>
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          style={inputStyle}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && (
          <span style={{
            position: 'absolute',
            right: '12px',
            color: colors.icon,
            display: 'flex',
            alignItems: 'center',
          }}>
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);

GitHubInput.displayName = 'GitHubInput';

export default GitHubInput;
