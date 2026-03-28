'use client';

import React, { useState } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface GitHubAvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
  bordered?: boolean;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 64,
};

// GitHub-style avatar colors for fallback
const avatarColors = [
  '#0969da', // blue
  '#8250df', // purple
  '#bc4c00', // orange
  '#116329', // green
  '#0550ae', // deep blue
  '#6639ba', // violet
  '#8a6334', // brown
  '#0a3069', // navy
];

// Get consistent color based on string hash
const getColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

// Single Avatar Component
export const GitHubAvatar: React.FC<GitHubAvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  bordered = false,
  className = '',
  onClick,
  tabIndex,
}) => {
  const [imageError, setImageError] = useState(false);
  const dimension = sizeMap[size];
  
  const getFallbackInitials = () => {
    if (fallback) {
      return fallback.charAt(0).toUpperCase();
    }
    return alt.charAt(0).toUpperCase() || '?';
  };

  const backgroundColor = fallback 
    ? getColorFromString(fallback) 
    : '#57606a';

  const isInteractive = !!onClick;

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
      onClick={onClick}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: imageError || !src ? backgroundColor : 'transparent',
        border: bordered 
          ? '2px solid var(--gh-bg-primary, #fff)' 
          : '1px solid var(--gh-border-default, rgba(27, 31, 36, 0.12))',
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow: 'none',
      }}
      className={`gh-avatar ${className}`}
      aria-label={alt}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          width={dimension}
          height={dimension}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <span
          style={{
            fontSize: dimension * 0.4,
            fontWeight: 600,
            color: '#fff',
            fontFamily: 'var(--gh-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif)',
            userSelect: 'none',
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          {getFallbackInitials()}
        </span>
      )}
      <style>{`
        .gh-avatar:hover {
          transform: scale(1.05);
        }
        .gh-avatar:focus-visible {
          outline: 2px solid var(--gh-focus-ring, rgba(9, 105, 218, 0.4));
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .gh-avatar {
            transition: none;
          }
          .gh-avatar:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

// Avatar Group Props
interface GitHubAvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  showCount?: boolean;
  countSize?: AvatarSize;
  className?: string;
}

// Avatar Group Component for multiple avatars
export const GitHubAvatarGroup: React.FC<GitHubAvatarGroupProps> = ({
  children,
  max = 4,
  size = 'md',
  showCount = true,
  countSize,
  className = '',
}) => {
  const childArray = React.Children.toArray(children);
  const visibleAvatars = childArray.slice(0, max);
  const remainingCount = childArray.length - max;
  
  const countSizeMap: Record<AvatarSize, number> = {
    xs: 16,
    sm: 18,
    md: 20,
    lg: 24,
    xl: 32,
  };
  
  const countFontSize = countSize ? countSizeMap[countSize] : countSizeMap[size];
  const dimension = sizeMap[size];

  return (
    <div
      role="group"
      aria-label={`${childArray.length} avatars`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
      className={`gh-avatar-group ${className}`}
    >
      {visibleAvatars.map((child, index) => (
        <div
          key={index}
          style={{
            marginLeft: index === 0 ? 0 : -dimension * 0.3,
            zIndex: visibleAvatars.length - index,
            position: 'relative',
          }}
        >
          {React.isValidElement<GitHubAvatarProps>(child) 
            ? React.cloneElement(child, { size })
            : child
          }
        </div>
      ))}
      
      {showCount && remainingCount > 0 && (
        <div
          style={{
            marginLeft: -dimension * 0.3,
            zIndex: 0,
            position: 'relative',
            width: dimension,
            height: dimension,
            borderRadius: '50%',
            backgroundColor: 'var(--gh-bg-tertiary, #eaeef2)',
            border: '1px solid var(--gh-border-default, rgba(27, 31, 36, 0.12))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gh-text-secondary, #656d76)',
            fontSize: countFontSize * 0.5,
            fontWeight: 600,
            fontFamily: 'var(--gh-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif)',
          }}
          aria-label={`and ${remainingCount} more`}
        >
          +{remainingCount}
        </div>
      )}
      
      <style>{`
        .gh-avatar-group {
          gap: 0;
        }
        .gh-avatar-group > div > * {
          transition: transform 0.15s ease;
        }
        .gh-avatar-group:hover > div > *:not(:last-child) {
          transform: translateX(4px);
        }
        @media (prefers-reduced-motion: reduce) {
          .gh-avatar-group > div > * {
            transition: none;
          }
          .gh-avatar-group:hover > div > *:not(:last-child) {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

// Skeleton loading state
interface GitHubAvatarSkeletonProps {
  size?: AvatarSize;
  className?: string;
}

export const GitHubAvatarSkeleton: React.FC<GitHubAvatarSkeletonProps> = ({
  size = 'md',
  className = '',
}) => {
  const dimension = sizeMap[size];
  
  return (
    <div
      style={{
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        backgroundColor: 'var(--gh-bg-tertiary, #eaeef2)',
        animation: 'gh-avatar-skeleton-pulse 1.5s ease-in-out infinite',
      }}
      className={`gh-avatar-skeleton ${className}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes gh-avatar-skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default GitHubAvatar;
