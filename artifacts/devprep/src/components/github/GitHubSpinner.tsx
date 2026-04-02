'use client';

/**
 * GitHub-style Spinner Component for DevPrep
 * Animated loading spinner with GitHub aesthetics
 */

import React from 'react';

interface GitHubSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  trackColor?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const GitHubSpinner: React.FC<GitHubSpinnerProps> = ({
  size = 'md',
  color = '#0969da',
  trackColor = '#30363d',
  label = 'Loading',
  className = '',
  style,
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const strokeWidthMap = {
    sm: 2,
    md: 2.5,
    lg: 3,
    xl: 3,
  };

  const actualSize = sizeMap[size];
  const strokeWidth = strokeWidthMap[size];
  const radius = (actualSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * 0.25;

  return (
    <div
      className={`gh-spinner-container ${className}`}
      role="status"
      aria-label={label}
      style={style}
    >
      <svg
        className="gh-spinner"
        width={actualSize}
        height={actualSize}
        viewBox={`0 0 ${actualSize} ${actualSize}`}
        style={{ animation: 'gh-spinner-rotate 0.7s linear infinite' }}
      >
        <style>{`
          @keyframes gh-spinner-rotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
        
        {/* Background track */}
        <circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Spinning arc */}
        <circle
          className="gh-spinner-arc"
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          style={{
            transformOrigin: 'center',
            animation: 'gh-spinner-dash 1.4s ease-in-out infinite',
          }}
        />
      </svg>
      
      {label && (
        <span className="gh-spinner-label">{label}</span>
      )}

      <style>{`
        .gh-spinner-container {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .gh-spinner-arc {
          transform-origin: center;
        }

        @keyframes gh-spinner-dash {
          0% {
            stroke-dashoffset: ${circumference * 0.75};
          }
          50% {
            stroke-dashoffset: ${circumference * 0.25};
          }
          100% {
            stroke-dashoffset: ${circumference * 0.75};
          }
        }

        .gh-spinner-label {
          font-size: 13px;
          color: #8b949e;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }
      `}</style>
    </div>
  );
};

// Simple dot spinner (like GitHub's inline loading)
export const GitHubSpinnerDot: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}> = ({
  size = 'md',
  color = '#8b949e',
}) => {
  const dotSize = size === 'sm' ? 8 : size === 'lg' ? 14 : 10;

  return (
    <div
      className="gh-spinner-dot"
      style={{
        width: dotSize,
        height: dotSize,
        backgroundColor: color,
        borderRadius: '50%',
        animation: 'gh-spinner-dot-bounce 0.8s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes gh-spinner-dot-bounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// Multi-dot spinner (like GitHub's page loading)
export const GitHubSpinnerDots: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  count?: number;
}> = ({
  size = 'md',
  color = '#8b949e',
  count = 3,
}) => {
  const dotSize = size === 'sm' ? 6 : size === 'lg' ? 12 : 8;
  const gap = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;

  return (
    <div
      className="gh-spinner-dots"
      style={{
        display: 'flex',
        gap: gap,
        alignItems: 'center',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="gh-spinner-dot-item"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: '50%',
            animation: `gh-spinner-dots-bounce 0.8s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes gh-spinner-dots-bounce {
          0%, 80%, 100% {
            transform: scale(0.7);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default GitHubSpinner;
