/**
 * Page-level layout primitives
 *
 * PageContainer  — outer wrapper: full-height GitHub-canvas bg + centred content
 * PageHeader     — h1 title + optional subtitle (used once per page)
 * SectionHeader  — h2 with optional icon and trailing actions
 * LoadingSpinner — standardised inline / full-page spinner
 * SearchInput    — search field with magnifier icon
 */

import { ReactNode, InputHTMLAttributes, forwardRef } from 'react';
import { Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── PageContainer ────────────────────────────────────────────────────────────

interface PageContainerProps {
  children: ReactNode;
  /** Max width variant — defaults to '5xl' */
  maxWidth?: '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
  /** Set an id on the inner element for skip-link targets */
  id?: string;
  /** Extra vertical padding (defaults to py-6) */
  py?: 'py-4' | 'py-6' | 'py-8' | 'py-12';
}

const maxWidthMap: Record<NonNullable<PageContainerProps['maxWidth']>, string> = {
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full:  'max-w-full',
};

export function PageContainer({
  children,
  maxWidth = '5xl',
  className,
  id,
  py = 'py-6',
}: PageContainerProps) {
  return (
    <div className="bg-[var(--gh-canvas-subtle)] min-h-screen">
      <div
        id={id}
        className={cn(
          maxWidthMap[maxWidth],
          'mx-auto px-4 lg:px-8',
          py,
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8 flex flex-wrap items-start justify-between gap-4', className)}>
      <div>
        <h1 className="text-2xl font-semibold text-[var(--gh-fg)]">{title}</h1>
        {subtitle && (
          <p className="text-[var(--gh-fg-muted)] mt-1 text-sm">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Heading level — defaults to h2 */
  as?: 'h2' | 'h3';
}

export function SectionHeader({
  title,
  icon,
  actions,
  className,
  as: Tag = 'h2',
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-2 mb-4', className)}>
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-[var(--gh-fg-muted)] flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {icon}
          </span>
        )}
        <Tag className="text-lg font-semibold text-[var(--gh-fg)]">{title}</Tag>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── LoadingSpinner ───────────────────────────────────────────────────────────

interface LoadingSpinnerProps {
  /** Visual size */
  size?: 'sm' | 'md' | 'lg';
  /** When true, centres the spinner in a py-16 flex container */
  fullPage?: boolean;
  /** Optional label shown below the spinner */
  label?: string;
  className?: string;
}

const spinnerSizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
};

export function LoadingSpinner({
  size = 'md',
  fullPage = false,
  label,
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-[var(--gh-accent-emphasis)] border-t-transparent animate-spin',
          spinnerSizeMap[size],
        )}
        role="status"
        aria-label={label ?? 'Loading'}
      />
      {label && (
        <p className="text-sm text-[var(--gh-fg-muted)]">{label}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex justify-center items-center py-20">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// ─── SearchInput ──────────────────────────────────────────────────────────────

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ containerClassName, className, ...props }, ref) => (
    <div className={cn('relative', containerClassName)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <input
        ref={ref}
        type="search"
        className={cn(
          'w-full pl-9 pr-3 py-2 text-sm rounded-md',
          'bg-[var(--gh-canvas)] border border-[var(--gh-border)]',
          'text-[var(--gh-fg)] placeholder:text-[var(--gh-fg-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--gh-accent-fg)]/40 focus:border-[var(--gh-accent-fg)]',
          'transition-colors',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
SearchInput.displayName = 'SearchInput';

// ─── GhStatCard ───────────────────────────────────────────────────────────────

interface GhStatCardProps {
  label: string;
  value: ReactNode;
  /** Sub-label shown after the value on the same line */
  valueSuffix?: string;
  icon?: ReactNode;
  'data-testid'?: string;
  className?: string;
}

export function GhStatCard({
  label,
  value,
  valueSuffix,
  icon,
  'data-testid': testId,
  className,
}: GhStatCardProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md p-4',
        'shadow-sm hover-elevate cursor-default',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-[var(--gh-fg-muted)] mb-2">
        {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[var(--gh-fg)]">{value}</span>
        {valueSuffix && (
          <span className="text-sm text-[var(--gh-fg-muted)]">{valueSuffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── IconLabel ────────────────────────────────────────────────────────────────

interface IconLabelProps {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Small inline label with a leading icon — e.g. "★ 42" or "↑ Trending" */
export function IconLabel({ icon, children, className }: IconLabelProps) {
  return (
    <span className={cn('flex items-center gap-1', className)}>
      <span className="w-3 h-3 flex-shrink-0">{icon}</span>
      {children}
    </span>
  );
}
