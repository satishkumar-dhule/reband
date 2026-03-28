/**
 * GitHub-style Button Component for DevPrep
 * Primary: Blue fill (#0969da), Secondary: Outline, Danger: Red (#cf222e)
 * Sizes: sm, md, lg with icon support
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GitHubButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function GitHubButton({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: GitHubButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`gh-button gh-button-${variant} gh-button-${size} ${fullWidth ? 'gh-button-full' : ''} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="gh-button-spinner" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="gh-button-icon">{icon}</span>}
          {children && <span className="gh-button-text">{children}</span>}
          {icon && iconPosition === 'right' && <span className="gh-button-icon">{icon}</span>}
        </>
      )}
      {loading && <span className="gh-button-loading-text">{children}</span>}

      <style>{`
        .gh-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          font-weight: 500;
          text-decoration: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          border: 1px solid transparent;
        }

        .gh-button:focus {
          outline: none;
        }

        .gh-button:focus-visible {
          outline: 2px solid #58a6ff;
          outline-offset: 2px;
        }

        .gh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Sizes */
        .gh-button-sm {
          height: 28px;
          padding: 0 12px;
          font-size: 12px;
        }

        .gh-button-sm .gh-button-icon {
          width: 14px;
          height: 14px;
        }

        .gh-button-md {
          height: 36px;
          padding: 0 16px;
          font-size: 14px;
        }

        .gh-button-md .gh-button-icon {
          width: 16px;
          height: 16px;
        }

        .gh-button-lg {
          height: 44px;
          padding: 0 20px;
          font-size: 16px;
        }

        .gh-button-lg .gh-button-icon {
          width: 18px;
          height: 18px;
        }

        /* Variants */
        .gh-button-primary {
          color: #ffffff;
          background-color: #0969da;
          border-color: rgba(240, 246, 252, 0.1);
        }

        .gh-button-primary:hover:not(:disabled) {
          background-color: #0860ca;
        }

        .gh-button-primary:active:not(:disabled) {
          background-color: #0757ba;
        }

        /* Secondary - light filled style */
        .gh-button-secondary {
          color: #24292f;
          background-color: #f6f8fa;
          border-color: rgba(27, 31, 35, 0.15);
        }

        .gh-button-secondary:hover:not(:disabled) {
          background-color: #f3f4f6;
          border-color: rgba(27, 31, 35, 0.15);
        }

        .gh-button-secondary:active:not(:disabled) {
          background-color: #edeff2;
        }

        /* Outline - transparent with border */
        .gh-button-outline {
          color: #24292f;
          background-color: transparent;
          border-color: rgba(27, 31, 35, 0.15);
        }

        .gh-button-outline:hover:not(:disabled) {
          background-color: #f6f8fa;
          border-color: rgba(27, 31, 35, 0.2);
        }

        .gh-button-outline:active:not(:disabled) {
          background-color: #edeff2;
        }

        .gh-button-danger {
          color: #ffffff;
          background-color: #cf222e;
          border-color: rgba(240, 246, 252, 0.1);
        }

        .gh-button-danger:hover:not(:disabled) {
          background-color: #bc1c23;
        }

        .gh-button-danger:active:not(:disabled) {
          background-color: #a11917;
        }

        .gh-button-ghost {
          color: #24292f;
          background-color: transparent;
          border-color: transparent;
        }

        .gh-button-ghost:hover:not(:disabled) {
          background-color: #f6f8fa;
          border-color: transparent;
        }

        .gh-button-ghost:active:not(:disabled) {
          background-color: #edeff2;
        }

        /* Full width */
        .gh-button-full {
          width: 100%;
        }

        /* Icon only button */
        .gh-button-icon-only {
          padding: 0;
          aspect-ratio: 1;
        }

        .gh-button-sm.gh-button-icon-only {
          width: 28px;
        }

        .gh-button-md.gh-button-icon-only {
          width: 36px;
        }

        .gh-button-lg.gh-button-icon-only {
          width: 44px;
        }

        /* Icon */
        .gh-button-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gh-button-text {
          flex: 1;
        }

        /* Loading state */
        .gh-button-spinner {
          width: 16px;
          height: 16px;
          animation: gh-button-spin 1s linear infinite;
        }

        @keyframes gh-button-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .gh-button-loading-text {
          display: none;
        }

        .gh-button:has(.gh-button-spinner) .gh-button-text,
        .gh-button:has(.gh-button-spinner) .gh-button-icon {
          display: none;
        }
      `}</style>
    </button>
  );
}

// Icon-only button variant
export function GitHubIconButton({
  variant = 'ghost',
  size = 'md',
  icon,
  label,
  ...props
}: Omit<GitHubButtonProps, 'icon' | 'iconPosition' | 'children'> & {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <GitHubButton
      variant={variant}
      size={size}
      icon={icon}
      aria-label={label}
      className="gh-button-icon-only"
      {...props}
    >
      {undefined}
    </GitHubButton>
  );
}

// Button group component
export function GitHubButtonGroup({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`gh-button-group ${className}`}>
      {React.Children.map(children, (child, index) => (
        <>
          {index > 0 && <div className="gh-button-group-divider" />}
          {child}
        </>
      ))}
      <style>{`
        .gh-button-group {
          display: inline-flex;
          border-radius: 6px;
          overflow: hidden;
        }

        .gh-button-group > * {
          border-radius: 0 !important;
        }

        .gh-button-group > *:first-child {
          border-radius: 6px 0 0 6px !important;
        }

        .gh-button-group > *:last-child {
          border-radius: 0 6px 6px 0 !important;
        }

        .gh-button-group-divider {
          width: 1px;
          background: rgba(240, 246, 252, 0.1);
        }
      `}</style>
    </div>
  );
}

// Link-style button
export function GitHubLinkButton({
  children,
  href,
  variant = 'primary',
  size = 'md',
  external = false,
  icon,
  iconPosition = 'right',
}: {
  children: React.ReactNode;
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  external?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}) {
  return (
    <a
      href={href}
      className={`gh-button gh-button-${variant} gh-button-${size}`}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {icon && iconPosition === 'left' && <span className="gh-button-icon">{icon}</span>}
      <span className="gh-button-text">{children}</span>
      {icon && iconPosition === 'right' && <span className="gh-button-icon">{icon}</span>}
      <style>{`
        .gh-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          font-weight: 500;
          text-decoration: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          border: 1px solid transparent;
        }
      `}</style>
    </a>
  );
}

export default GitHubButton;
