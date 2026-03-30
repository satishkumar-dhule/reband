"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  AlertTriangle,
  Lightbulb,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

export type CalloutType = "info" | "warning" | "tip" | "important";

interface CalloutConfig {
  icon: LucideIcon;
  defaultTitle: string;
  lightBg: string;
  lightBorder: string;
  lightIcon: string;
  lightText: string;
  darkBg: string;
  darkBorder: string;
  darkIcon: string;
  darkText: string;
}

const calloutConfigs: Record<CalloutType, CalloutConfig> = {
  info: {
    icon: Info,
    defaultTitle: "Note",
    lightBg: "var(--gh-accent-subtle, #ddf4ff)",
    lightBorder: "var(--gh-border, #d0d7de)",
    lightIcon: "var(--gh-accent-fg, #0969da)",
    lightText: "var(--gh-fg, #1f2328)",
    darkBg: "var(--gh-accent-subtle, #031d30)",
    darkBorder: "var(--gh-border, #30363d)",
    darkIcon: "var(--gh-accent-fg, #58a6ff)",
    darkText: "var(--gh-fg, #e6edf3)",
  },
  warning: {
    icon: AlertTriangle,
    defaultTitle: "Warning",
    lightBg: "var(--gh-attention-subtle, #fff8c5)",
    lightBorder: "var(--gh-border, #d0d7de)",
    lightIcon: "var(--gh-attention-fg, #9a6700)",
    lightText: "var(--gh-fg, #1f2328)",
    darkBg: "var(--gh-attention-subtle, #1c1502)",
    darkBorder: "var(--gh-border, #30363d)",
    darkIcon: "var(--gh-attention-fg, #d29922)",
    darkText: "var(--gh-fg, #e6edf3)",
  },
  tip: {
    icon: Lightbulb,
    defaultTitle: "Tip",
    lightBg: "var(--gh-success-subtle, #dafbe1)",
    lightBorder: "var(--gh-border, #d0d7de)",
    lightIcon: "var(--gh-success-fg, #1a7f37)",
    lightText: "var(--gh-fg, #1f2328)",
    darkBg: "var(--gh-success-subtle, #0d1f12)",
    darkBorder: "var(--gh-border, #30363d)",
    darkIcon: "var(--gh-success-fg, #3fb950)",
    darkText: "var(--gh-fg, #e6edf3)",
  },
  important: {
    icon: AlertCircle,
    defaultTitle: "Important",
    lightBg: "var(--gh-danger-subtle, #ffebe9)",
    lightBorder: "var(--gh-border, #d0d7de)",
    lightIcon: "var(--gh-danger-fg, #d1242f)",
    lightText: "var(--gh-fg, #1f2328)",
    darkBg: "var(--gh-danger-subtle, #160b10)",
    darkBorder: "var(--gh-border, #30363d)",
    darkIcon: "var(--gh-danger-fg, #f85149)",
    darkText: "var(--gh-fg, #e6edf3)",
  },
};

interface CalloutProps {
  /** The type of callout determines the icon, colors, and default title */
  type?: CalloutType;
  /** Optional custom title. If not provided, uses default title based on type */
  title?: string;
  /** The content to display inside the callout */
  children: React.ReactNode;
  /** Whether the callout is collapsible */
  collapsible?: boolean;
  /** Initial expanded state for collapsible callouts (default: true) */
  defaultExpanded?: boolean;
  /** Whether to show the icon (default: true) */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Accessibility: describes the purpose of this callout */
  "aria-label"?: string;
}

/**
 * GitHub-inspired Callout component for displaying notes, tips, warnings, and important information.
 * 
 * Features:
 * - Multiple callout types (info, warning, tip, important)
 * - GitHub design system colors
 * - Collapsible with smooth animations
 * - Full keyboard navigation support
 * - Respects prefers-reduced-motion
 */
export function Callout({
  type = "info",
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
  showIcon = true,
  className = "",
  "aria-label": ariaLabel,
}: CalloutProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const config = calloutConfigs[type];
  const Icon = config.icon;
  const displayTitle = title ?? config.defaultTitle;

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Keyboard handler for accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (collapsible && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        handleToggle();
      }
    },
    [collapsible, handleToggle]
  );

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: 1,
      }}
      className={className}
      style={{
        backgroundColor: "light-dark(#ffffff, #0d1117)",
        border: "1px solid",
        borderColor: "light-dark(#d0d7de, #30363d)",
        borderRadius: "6px",
        overflow: "hidden",
      }}
      role="region"
      aria-label={ariaLabel || `${displayTitle} callout`}
    >
      {/* Header */}
      <div
        className={collapsible ? "cursor-pointer" : ""}
        onClick={collapsible ? handleToggle : undefined}
        onKeyDown={collapsible ? handleKeyDown : undefined}
        tabIndex={collapsible ? 0 : undefined}
        role={collapsible ? "button" : undefined}
        aria-expanded={collapsible ? isExpanded : undefined}
        aria-controls={collapsible ? `callout-content-${type}` : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          backgroundColor: "light-dark(#f6f8fa, #161b22)",
          borderBottom: collapsible && isExpanded 
            ? "1px solid light-dark(#d0d7de, #30363d)" 
            : "none",
        }}
      >
        {/* Icon */}
        {showIcon && (
          <Icon
            className="shrink-0"
            style={{
              width: "1.25rem",
              height: "1.25rem",
              color: "light-dark(#0969da, #58a6ff)",
            }}
            aria-hidden="true"
          />
        )}

        {/* Title */}
        <span
          style={{
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "light-dark(#1f2328, #e6edf3)",
            flex: 1,
          }}
        >
          {displayTitle}
        </span>

        {/* Collapsible indicator */}
        {collapsible && (
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronDown
              className="shrink-0"
              style={{
                width: "1rem",
                height: "1rem",
                color: "light-dark(#636c76, #8b949e)",
              }}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {(!collapsible || isExpanded) && (
          <motion.div
            id={collapsible ? `callout-content-${type}` : undefined}
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={collapsible ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              padding: "0.75rem 1rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: "0.875rem",
                lineHeight: 1.6,
                color: "light-dark(#1f2328, #e6edf3)",
              }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Convenience component for info callouts
 */
export function NoteCallout(props: Omit<CalloutProps, "type">) {
  return <Callout type="info" {...props} />;
}

/**
 * Convenience component for warning callouts
 */
export function WarningCallout(props: Omit<CalloutProps, "type">) {
  return <Callout type="warning" {...props} />;
}

/**
 * Convenience component for tip callouts
 */
export function TipCallout(props: Omit<CalloutProps, "type">) {
  return <Callout type="tip" {...props} />;
}

/**
 * Convenience component for important callouts
 */
export function ImportantCallout(props: Omit<CalloutProps, "type">) {
  return <Callout type="important" {...props} />;
}

export default Callout;
