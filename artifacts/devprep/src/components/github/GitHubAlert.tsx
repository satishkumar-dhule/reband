'use client';

import React, { useState } from 'react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface GitHubAlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}

const alertStyles: Record<AlertType, { bg: string; border: string; icon: string; title: string }> = {
  info: {
    bg: '#ddf4ff',
    border: '#54aeff',
    icon: 'ℹ️',
    title: '#0969da',
  },
  success: {
    bg: '#dafbe1',
    border: '#54c754',
    icon: '✓',
    title: '#1a7f37',
  },
  warning: {
    bg: '#fff8c5',
    border: '#d4a72c',
    icon: '⚠',
    title: '#9a6700',
  },
  error: {
    bg: '#ffebe9',
    border: '#ff818266',
    icon: '✕',
    title: '#cf222e',
  },
};

const IconSVGs: Record<AlertType, React.ReactNode> = {
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M0 8a8 8 0 1116 0A8 8 0 010 8zm8-6a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0V2zm2 8a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h6.25A.75.75 0 0110 16z"/>
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM8 3.25a.75.75 0 01.75.75v3.25a.75.75 0 01-1.5 0V4a.75.75 0 01.75-.75zm3 0a.75.75 0 01.75.75v3.25a.75.75 0 01-1.5 0V4a.75.75 0 01.75-.75z"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
    </svg>
  ),
};

export const GitHubAlert: React.FC<GitHubAlertProps> = ({
  type = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  style,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const styles = alertStyles[type];

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: '6px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        ...style,
      }}
    >
      <span style={{ color: styles.title, flexShrink: 0, display: 'flex', alignItems: 'flex-start', paddingTop: '2px' }}>
        {IconSVGs[type]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{
            fontWeight: 600,
            color: styles.title,
            marginBottom: '4px',
            fontSize: '14px',
          }}>
            {title}
          </div>
        )}
        <div style={{
          fontSize: '14px',
          color: '#24292f',
          lineHeight: '1.5',
        }}>
          {children}
        </div>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: styles.title,
            padding: '0',
            display: 'flex',
            alignItems: 'flex-start',
            opacity: 0.7,
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default GitHubAlert;
