'use client';

import React from 'react';

type InputSize = 'sm' | 'md';

interface GitHubInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: InputSize;
  validation?: 'default' | 'error';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

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

const baseStyles: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  outline: 'none',
  backgroundColor: '#fff',
  color: '#24292f',
  width: '100%',
  boxSizing: 'border-box',
};

export const GitHubInput = React.forwardRef<HTMLInputElement, GitHubInputProps>(
  ({ 
    size = 'md', 
    validation = 'default', 
    leftIcon, 
    rightIcon,
    style,
    ...props 
  }, ref) => {
    const validationStyles = validation === 'error' 
      ? { borderColor: '#cf222e', boxShadow: '0 0 0 3px rgba(207, 34, 46, 0.15)' }
      : {};

    const containerStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      width: props.type === 'checkbox' || props.type === 'radio' ? 'auto' : '100%',
    };

    const inputStyle: React.CSSProperties = {
      ...baseStyles,
      ...sizeStyles[size],
      ...validationStyles,
      paddingLeft: leftIcon ? '36px' : sizeStyles[size].padding,
      paddingRight: rightIcon ? '36px' : sizeStyles[size].padding,
      ...style,
    };

    return (
      <div style={containerStyle}>
        {leftIcon && (
          <span style={{
            position: 'absolute',
            left: '12px',
            color: '#57606a',
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
          {...props}
        />
        {rightIcon && (
          <span style={{
            position: 'absolute',
            right: '12px',
            color: '#57606a',
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
