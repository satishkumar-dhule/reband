'use client';

import React from 'react';

type BadgeColor = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
type BadgeSize = 'sm' | 'md';

interface GitHubBadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  outline?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const colorStyles: Record<BadgeColor, { bg: string; color: string; border: string }> = {
  blue: {
    bg: '#ddf4ff',
    color: '#0969da',
    border: '#0969da',
  },
  green: {
    bg: '#dafbe1',
    color: '#1a7f37',
    border: '#1a7f37',
  },
  red: {
    bg: '#ffebe9',
    color: '#cf222e',
    border: '#cf222e',
  },
  orange: {
    bg: '#fff1e5',
    color: '#bc4c00',
    border: '#bc4c00',
  },
  purple: {
    bg: '#fbefff',
    color: '#8250df',
    border: '#8250df',
  },
  gray: {
    bg: '#eaeef2',
    color: '#57606a',
    border: '#57606a',
  },
};

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: {
    padding: '0 7px',
    fontSize: '11px',
    lineHeight: '18px',
    fontWeight: 600,
  },
  md: {
    padding: '2px 10px',
    fontSize: '12px',
    lineHeight: '22px',
    fontWeight: 500,
  },
};

export const GitHubBadge: React.FC<GitHubBadgeProps> = ({
  children,
  color = 'gray',
  size = 'md',
  outline = false,
  style,
  className,
}) => {
  const colors = colorStyles[color];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        border: outline ? `1px solid ${colors.border}` : 'none',
        backgroundColor: outline ? 'transparent' : colors.bg,
        color: colors.color,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        ...sizeStyles[size],
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
};

export default GitHubBadge;
