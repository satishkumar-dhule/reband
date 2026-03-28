'use client';

/**
 * GitHub-style Skeleton Loader Component for DevPrep
 * Animated placeholder content with shimmer effect
 */

import React from 'react';

interface GitHubSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const GitHubSkeleton: React.FC<GitHubSkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height,
  className = '',
  style,
}) => {
  const defaultHeights = {
    text: 16,
    circular: 40,
    rectangular: 100,
    rounded: 8,
  };

  const actualHeight = height ?? defaultHeights[variant];

  const borderRadiusMap = {
    text: 4,
    circular: '50%',
    rectangular: 0,
    rounded: 6,
  };

  return (
    <div
      className={`gh-skeleton gh-skeleton-${variant} ${className}`}
      style={{
        width,
        height: actualHeight,
        borderRadius: borderRadiusMap[variant],
        ...style,
      }}
    >
      <style>{`
        .gh-skeleton {
          background: linear-gradient(
            90deg,
            #21262d 0%,
            #30363d 50%,
            #21262d 100%
          );
          background-size: 200% 100%;
          animation: gh-skeleton-shimmer 1.5s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }

        .gh-skeleton::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.05),
            transparent
          );
          transform: translateX(-100%);
          animation: gh-skeleton-shine 1.5s ease-in-out infinite;
        }

        @keyframes gh-skeleton-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes gh-skeleton-shine {
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

// Skeleton for avatar placeholder
export const GitHubSkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg';
}> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 64,
  };

  return (
    <GitHubSkeleton
      variant="circular"
      width={sizeMap[size]}
      height={sizeMap[size]}
    />
  );
};

// Skeleton for text lines
export const GitHubSkeletonText: React.FC<{
  lines?: number;
  spacing?: 'sm' | 'md' | 'lg';
  lastLineWidth?: string;
}> = ({
  lines = 3,
  spacing = 'md',
  lastLineWidth = '60%',
}) => {
  const spacingMap = {
    sm: 8,
    md: 12,
    lg: 16,
  };

  const spacingValue = spacingMap[spacing];

  return (
    <div
      className="gh-skeleton-text"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacingValue,
      }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <GitHubSkeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height={14}
        />
      ))}
    </div>
  );
};

// Skeleton for card placeholder
export const GitHubSkeletonCard: React.FC<{
  showHeader?: boolean;
  showFooter?: boolean;
  children?: React.ReactNode;
}> = ({
  showHeader = true,
  showFooter = false,
  children,
}) => {
  return (
    <div className="gh-skeleton-card">
      {showHeader && (
        <div className="gh-skeleton-card-header">
          <GitHubSkeletonAvatar size="md" />
          <div className="gh-skeleton-card-header-text">
            <GitHubSkeleton variant="text" width={120} height={16} />
            <GitHubSkeleton variant="text" width={80} height={12} />
          </div>
        </div>
      )}
      
      <div className="gh-skeleton-card-body">
        {children || <GitHubSkeletonText lines={3} />}
      </div>

      {showFooter && (
        <div className="gh-skeleton-card-footer">
          <GitHubSkeleton variant="rounded" width={60} height={28} />
          <GitHubSkeleton variant="rounded" width={60} height={28} />
        </div>
      )}

      <style>{`
        .gh-skeleton-card {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          padding: 16px;
        }

        .gh-skeleton-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .gh-skeleton-card-header-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gh-skeleton-card-body {
          margin-bottom: 16px;
        }

        .gh-skeleton-card-footer {
          display: flex;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid #21262d;
        }
      `}</style>
    </div>
  );
};

// Skeleton for table rows
export const GitHubSkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
}> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="gh-skeleton-table">
      <div className="gh-skeleton-table-header">
        {Array.from({ length: columns }).map((_, i) => (
          <GitHubSkeleton key={i} variant="text" width="100%" height={14} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="gh-skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <GitHubSkeleton
              key={colIndex}
              variant="text"
              width="100%"
              height={14}
            />
          ))}
        </div>
      ))}

      <style>{`
        .gh-skeleton-table {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          overflow: hidden;
        }

        .gh-skeleton-table-header {
          display: grid;
          grid-template-columns: repeat(${columns}, 1fr);
          gap: 16px;
          padding: 12px 16px;
          background: #21262d;
          border-bottom: 1px solid #30363d;
        }

        .gh-skeleton-table-row {
          display: grid;
          grid-template-columns: repeat(${columns}, 1fr);
          gap: 16px;
          padding: 12px 16px;
          border-bottom: 1px solid #21262d;
        }

        .gh-skeleton-table-row:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

// Skeleton for list items
export const GitHubSkeletonList: React.FC<{
  items?: number;
  avatar?: boolean;
}> = ({
  items = 5,
  avatar = true,
}) => {
  return (
    <div className="gh-skeleton-list">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="gh-skeleton-list-item">
          {avatar && <GitHubSkeletonAvatar size="sm" />}
          <div className="gh-skeleton-list-item-content">
            <GitHubSkeleton variant="text" width="70%" height={14} />
            <GitHubSkeleton variant="text" width="40%" height={12} />
          </div>
        </div>
      ))}

      <style>{`
        .gh-skeleton-list {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          overflow: hidden;
        }

        .gh-skeleton-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #21262d;
        }

        .gh-skeleton-list-item:last-child {
          border-bottom: none;
        }

        .gh-skeleton-list-item-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
      `}</style>
    </div>
  );
};

export default GitHubSkeleton;
