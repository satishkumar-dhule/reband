'use client';

import React from 'react';

export interface GitHubFormErrorProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

/**
 * GitHub-style error message component
 * Displays validation errors below form fields
 */
export const GitHubFormError: React.FC<GitHubFormErrorProps> = ({
  children,
  className,
  style,
  id,
}) => {
  const errorStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--gh-danger, #cf222e)',
    marginTop: '6px',
    fontFamily: 'var(--gh-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
    lineHeight: '1.5',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    ...style,
  };

  // Generate a unique ID if not provided, for aria-describedby
  const errorId = id || `error-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <span
      role="alert"
      id={errorId}
      style={errorStyle}
      className={className}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="currentColor"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path d="M6 0C2.7 0 0 2.7 0 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm-.5 2.5h1v5h-1V2.5zm0 6.5h1v1h-1V9z" />
      </svg>
      {children}
    </span>
  );
};

export default GitHubFormError;
