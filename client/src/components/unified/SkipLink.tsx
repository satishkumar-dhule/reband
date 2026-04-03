/**
 * SkipLink Component - WCAG 2.1 Level AA Compliance
 * Allows keyboard users to skip navigation and jump to main content.
 */
import { ReactNode } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  /** The target element ID to skip to */
  targetId?: string;
  /** Additional CSS classes */
  className?: string;
}

export function SkipLink({ targetId = "main-content", className }: SkipLinkProps) {
  return (
    <Link
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
        "z-50 px-4 py-2 bg-[var(--gh-btn-bg)] text-[var(--gh-btn-fg)]",
        "border border-[var(--gh-border)] rounded-md font-medium",
        "focus:outline-none focus:ring-2 focus:ring-[var(--gh-accent-fg)] focus:ring-offset-2",
        "transition-colors hover:bg-[var(--gh-btn-hover-bg)]",
        className
      )}
      onClick={(e) => {
        // Prevent default and manually focus the target
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
          target.tabIndex = -1;
          target.focus();
          // Announce to screen readers
          target.setAttribute("role", "main");
        }
      }}
    >
      Skip to main content
    </Link>
  );
}

interface SkipLinkWrapperProps {
  children: ReactNode;
  /** ID for the main content area */
  mainId?: string;
}

export function SkipLinkWrapper({ children, mainId = "main-content" }: SkipLinkWrapperProps) {
  return (
    <>
      <SkipLink targetId={mainId} />
      <main id={mainId} tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
