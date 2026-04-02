/**
 * GitHub-style Card Component for DevPrep
 * Border-based design with 6px border radius
 */

import React from 'react';
import { GitHubButton } from './GitHubButton';

interface CardHeaderAction {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

interface GitHubCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string | React.ReactNode;
  headerActions?: CardHeaderAction[];
  footer?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'default' | 'bordered' | 'filled' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function GitHubCard({
  title,
  subtitle,
  description,
  icon,
  badge,
  headerActions = [],
  footer,
  children,
  variant = 'bordered',
  padding = 'md',
  className = '',
  onClick,
  href,
}: GitHubCardProps) {
  const isClickable = onClick || href;

  const cardContent = (
    <div className={`gh-card gh-card-${variant} gh-card-padding-${padding} ${isClickable ? 'gh-card-clickable' : ''} ${className}`}>
      {/* Header */}
      {(title || subtitle || headerActions.length > 0) && (
        <div className="gh-card-header">
          <div className="gh-card-header-main">
            {icon && <div className="gh-card-icon">{icon}</div>}
            <div className="gh-card-header-text">
              {title && <h3 className="gh-card-title">{title}</h3>}
              {subtitle && <p className="gh-card-subtitle">{subtitle}</p>}
            </div>
            {badge && <div className="gh-card-badge">{badge}</div>}
          </div>
          {headerActions.length > 0 && (
            <div className="gh-card-header-actions">
              {headerActions.map((action, index) => (
                <GitHubButton
                  key={index}
                  variant={action.variant || 'secondary'}
                  size="sm"
                  onClick={action.onClick}
                  icon={action.icon}
                >
                  {action.label}
                </GitHubButton>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="gh-card-description">{description}</p>
      )}

      {/* Body content */}
      {children && (
        <div className="gh-card-body">{children}</div>
      )}

      {/* Footer */}
      {footer && (
        <div className="gh-card-footer">{footer}</div>
      )}

      <style>{`
        .gh-card {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          overflow: hidden;
        }

        /* Variants */
        .gh-card-default {
          background: transparent;
          border: none;
        }

        .gh-card-bordered {
          background: #161b22;
          border: 1px solid #30363d;
        }

        .gh-card-filled {
          background: #21262d;
          border: 1px solid #30363d;
        }

        .gh-card-elevated {
          background: #161b22;
          border: 1px solid #30363d;
          box-shadow: 0 8px 24px rgba(1, 4, 9, 0.4);
        }

        /* Padding */
        .gh-card-padding-none {
          padding: 0;
        }

        .gh-card-padding-none .gh-card-header,
        .gh-card-padding-none .gh-card-footer {
          padding: 16px;
        }

        .gh-card-padding-none .gh-card-body {
          padding: 0 16px 16px;
        }

        .gh-card-padding-sm {
          padding: 12px;
        }

        .gh-card-padding-md {
          padding: 16px;
        }

        .gh-card-padding-lg {
          padding: 24px;
        }

        /* Clickable */
        .gh-card-clickable {
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .gh-card-clickable:hover {
          border-color: #8b949e;
        }

        .gh-card-clickable:active {
          transform: scale(0.99);
        }

        /* Header */
        .gh-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .gh-card-header-main {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .gh-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #21262d;
          border-radius: 8px;
          color: #58a6ff;
          flex-shrink: 0;
        }

        .gh-card-icon svg {
          width: 20px;
          height: 20px;
        }

        .gh-card-header-text {
          flex: 1;
          min-width: 0;
        }

        .gh-card-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #c9d1d9;
          line-height: 1.3;
        }

        .gh-card-subtitle {
          margin: 2px 0 0;
          font-size: 13px;
          color: #8b949e;
          line-height: 1.4;
        }

        .gh-card-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 500;
          color: #c9d1d9;
          background: #21262d;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .gh-card-header-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        /* Description */
        .gh-card-description {
          margin: 12px 0 0;
          font-size: 14px;
          color: #8b949e;
          line-height: 1.5;
        }

        /* Body */
        .gh-card-body {
          margin-top: 16px;
        }

        .gh-card-padding-none .gh-card-body {
          margin-top: 0;
        }

        /* Footer */
        .gh-card-footer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #21262d;
        }

        .gh-card-padding-none .gh-card-footer {
          margin-top: 0;
        }

        /* Animation */
        .gh-card {
          animation: gh-card-enter 0.3s ease;
        }

        @keyframes gh-card-enter {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="gh-card-link">
        {cardContent}
        <style>{`
          .gh-card-link {
            display: block;
            text-decoration: none;
            color: inherit;
          }
        `}</style>
      </a>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
        {cardContent}
      </div>
    );
  }

  return cardContent;
}

// Stat card variant
interface GitHubStatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  href?: string;
}

export function GitHubStatCard({ label, value, change, icon, href }: GitHubStatCardProps) {
  const content = (
    <div className="gh-stat-card">
      <div className="gh-stat-header">
        {icon && <div className="gh-stat-icon">{icon}</div>}
        <span className="gh-stat-label">{label}</span>
      </div>
      <div className="gh-stat-value">{value}</div>
      {change && (
        <div className={`gh-stat-change ${change.isPositive ? 'positive' : 'negative'}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            {change.isPositive ? (
              <path d="M6 2.5L10.5 7.5H1.5L6 2.5Z" />
            ) : (
              <path d="M6 9.5L1.5 4.5H10.5L6 9.5Z" />
            )}
          </svg>
          <span>{Math.abs(change.value)}%</span>
        </div>
      )}
      <style>{`
        .gh-stat-card {
          padding: 16px;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
        }

        .gh-stat-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .gh-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #21262d;
          border-radius: 6px;
          color: #8b949e;
        }

        .gh-stat-icon svg {
          width: 16px;
          height: 16px;
        }

        .gh-stat-label {
          font-size: 13px;
          color: #8b949e;
        }

        .gh-stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #c9d1d9;
          line-height: 1.2;
        }

        .gh-stat-change {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          font-size: 12px;
          font-weight: 500;
        }

        .gh-stat-change.positive {
          color: #3fb950;
        }

        .gh-stat-change.negative {
          color: #f85149;
        }
      `}</style>
    </div>
  );

  if (href) {
    return <a href={href} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</a>;
  }

  return content;
}

// List card variant
interface GitHubListCardProps {
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    badge?: string;
    icon?: React.ReactNode;
    href?: string;
  }>;
  onItemClick?: (id: string) => void;
  emptyMessage?: string;
}

export function GitHubListCard({ items, onItemClick, emptyMessage = 'No items' }: GitHubListCardProps) {
  return (
    <div className="gh-list-card">
      {items.length === 0 ? (
        <div className="gh-list-empty">{emptyMessage}</div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="gh-list-item"
            onClick={() => onItemClick?.(item.id)}
            role={onItemClick ? 'button' : undefined}
            tabIndex={onItemClick ? 0 : undefined}
            onKeyDown={(e) => e.key === 'Enter' && onItemClick?.(item.id)}
          >
            {item.icon && <div className="gh-list-item-icon">{item.icon}</div>}
            <div className="gh-list-item-content">
              <span className="gh-list-item-title">{item.title}</span>
              {item.subtitle && <span className="gh-list-item-subtitle">{item.subtitle}</span>}
            </div>
            {item.badge && <span className="gh-list-item-badge">{item.badge}</span>}
            <svg className="gh-list-item-arrow" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </div>
        ))
      )}
      <style>{`
        .gh-list-card {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          overflow: hidden;
        }

        .gh-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .gh-list-item:not(:last-child) {
          border-bottom: 1px solid #21262d;
        }

        .gh-list-item:hover {
          background: #21262d;
        }

        .gh-list-item[role="button"] {
          cursor: pointer;
        }

        .gh-list-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #21262d;
          border-radius: 6px;
          color: #8b949e;
          flex-shrink: 0;
        }

        .gh-list-item-icon svg {
          width: 16px;
          height: 16px;
        }

        .gh-list-item-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .gh-list-item-title {
          font-size: 14px;
          font-weight: 500;
          color: #c9d1d9;
        }

        .gh-list-item-subtitle {
          font-size: 12px;
          color: #8b949e;
        }

        .gh-list-item-badge {
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 500;
          color: #c9d1d9;
          background: #21262d;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .gh-list-item-arrow {
          color: #8b949e;
          flex-shrink: 0;
        }

        .gh-list-empty {
          padding: 32px 16px;
          text-align: center;
          color: #8b949e;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export default GitHubCard;
