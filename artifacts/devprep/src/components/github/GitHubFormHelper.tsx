'use client';

import React from 'react';

export interface GitHubFormHelperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * GitHub-style helper text component
 * Provides contextual guidance below form fields
 */
export const GitHubFormHelper: React.FC<GitHubFormHelperProps> = ({
  children,
  className,
  style,
}) => {
  const helperStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--gh-text-muted, #8b949e)',
    marginTop: '6px',
    fontFamily: 'var(--gh-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
    lineHeight: '1.5',
    ...style,
  };

  return (
    <span
      style={helperStyle}
      className={className}
      id={`helper-${Math.random().toString(36).substr(2, 9)}`}
    >
      {children}
    </span>
  );
};

export default GitHubFormHelper;
