'use client';

/**
 * GitHub-style Progress Bar Component for DevPrep
 * 8px height, rounded ends, blue fill (#0969da), animated
 */

import React from 'react';

interface GitHubProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const GitHubProgress: React.FC<GitHubProgressProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  color = '#0969da',
  animated = true,
  striped = false,
  className = '',
  style,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const heightMap = {
    sm: 4,
    md: 8,
    lg: 12,
  };
  
  const barHeight = heightMap[size];

  return (
    <div className={`gh-progress-container ${className}`} style={style}>
      {showLabel && (
        <div className="gh-progress-header">
          <span className="gh-progress-label">Progress</span>
          <span className="gh-progress-value">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className="gh-progress-track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        style={{
          height: barHeight,
        }}
      >
        <div
          className={`gh-progress-fill ${animated ? 'gh-progress-animated' : ''} ${striped ? 'gh-progress-striped' : ''}`}
          style={{
            width: `${percentage}%`,
            height: barHeight,
            backgroundColor: color,
          }}
        />
      </div>

      <style>{`
        .gh-progress-container {
          width: 100%;
        }

        .gh-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .gh-progress-label {
          font-size: 13px;
          font-weight: 400;
          color: #8b949e;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }

        .gh-progress-value {
          font-size: 13px;
          font-weight: 600;
          color: #c9d1d9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }

        .gh-progress-track {
          width: 100%;
          background-color: #21262d;
          border-radius: calc(var(--bar-height, 8px) / 2);
          overflow: hidden;
          position: relative;
        }

        .gh-progress-fill {
          border-radius: inherit;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .gh-progress-animated::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: gh-progress-shimmer 1.5s infinite;
        }

        .gh-progress-striped {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.1) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.1) 75%,
            transparent 75%,
            transparent
          );
          background-size: var(--bar-height, 8px) var(--bar-height, 8px);
        }

        @keyframes gh-progress-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

// Compact inline progress bar (like GitHub inline commits)
export const GitHubProgressInline: React.FC<{
  value: number;
  max?: number;
  size?: 'sm' | 'md';
  color?: string;
}> = ({
  value,
  max = 100,
  size = 'sm',
  color = '#0969da',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const barHeight = size === 'sm' ? 6 : 8;

  return (
    <div
      className="gh-progress-inline"
      style={{
        height: barHeight,
        backgroundColor: '#21262d',
        borderRadius: barHeight / 2,
        overflow: 'hidden',
        flex: 1,
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: barHeight / 2,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
};

export default GitHubProgress;
