'use client';

import React, { ReactNode } from 'react';

export interface GitHubFormGroupProps {
  children: ReactNode;
  htmlFor?: string;
  label?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * GitHub-style form field group component
 * Provides label with required indicator and wraps form fields
 */
export const GitHubFormGroup: React.FC<GitHubFormGroupProps> = ({
  children,
  htmlFor,
  label,
  required = false,
  className,
  style,
}) => {
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--gh-text-primary, #1f2328)',
    marginBottom: '6px',
    fontFamily: 'var(--gh-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    ...style,
  };

  // If no label text is provided, still render children (e.g., for checkbox groups)
  const renderLabel = label && (
    <label htmlFor={htmlFor} style={labelStyle} className={className}>
      {label}
      {required && (
        <span
          style={{
            color: 'var(--gh-danger, #cf222e)',
            marginLeft: '4px',
          }}
          aria-hidden="true"
        >
          *
        </span>
      )}
    </label>
  );

  // If children is a checkbox/radio, we might not want a label wrapper
  const needsLabelWrapper = label && children;

  if (!needsLabelWrapper) {
    return (
      <div style={containerStyle}>
        {children}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {renderLabel}
      {children}
    </div>
  );
};

export default GitHubFormGroup;
