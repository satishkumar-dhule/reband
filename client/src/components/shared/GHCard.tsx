/**
 * GHCard — GitHub-themed card used by VoiceSession and VoicePractice.
 * Single source of truth extracted from duplicated page-level definitions.
 */
import { cn } from '../../lib/utils';

interface GHCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function GHCard({
  children,
  className = '',
  title,
  subtitle,
  footer,
  headerRight,
}: GHCardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md overflow-hidden',
        className,
      )}
    >
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] flex items-center justify-between">
          <div>
            {title && (
              <h3 className="font-semibold text-[var(--gh-fg)]">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--gh-fg-muted)] mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerRight}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-[var(--gh-border-muted)] bg-[var(--gh-canvas-subtle)]">
          {footer}
        </div>
      )}
    </div>
  );
}
