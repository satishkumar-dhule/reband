/**
 * GitHub-style Tooltip Component for DevPrep
 * Dark background (#1f2328), white text, 12px font, 6px radius
 * Arrow pointer, 400ms delay, multi-position support
 */

import React, { useState, useRef, useEffect } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface GitHubTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
}

export function GitHubTooltip({
  content,
  children,
  position = 'top',
  delay = 400,
  disabled = false,
}: GitHubTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        
        let x = 0;
        let y = 0;
        
        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2 + scrollX;
            y = rect.top + scrollY;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2 + scrollX;
            y = rect.bottom + scrollY;
            break;
          case 'left':
            x = rect.left + scrollX;
            y = rect.top + rect.height / 2 + scrollY;
            break;
          case 'right':
            x = rect.right + scrollX;
            y = rect.top + rect.height / 2 + scrollY;
            break;
        }
        
        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowStyle = (): React.CSSProperties => {
    switch (position) {
      case 'top':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '6px 6px 0 6px',
          borderTopColor: '#1f2328',
        };
      case 'bottom':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 6px 6px 6px',
          borderBottomColor: '#1f2328',
        };
      case 'left':
        return {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 0 6px 6px',
          borderLeftColor: '#1f2328',
        };
      case 'right':
        return {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 6px 6px 0',
          borderRightColor: '#1f2328',
        };
    }
  };

  const getTooltipStyle = (): React.CSSProperties => {
    const tooltipWidth = 200; // default max width
    const tooltipHeight = 40; // estimated height
    const offset = 8;

    switch (position) {
      case 'top':
        return {
          left: coords.x,
          top: coords.y - offset,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          left: coords.x,
          top: coords.y + offset,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          left: coords.x - offset,
          top: coords.y,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          left: coords.x + offset,
          top: coords.y,
          transform: 'translate(0, -50%)',
        };
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="gh-tooltip-trigger"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`gh-tooltip gh-tooltip-${position}`}
          style={getTooltipStyle()}
          role="tooltip"
        >
          <div className="gh-tooltip-content">{content}</div>
          <div className="gh-tooltip-arrow" style={getArrowStyle()} />
          
          <style>{`
            .gh-tooltip-trigger {
              display: inline-flex;
              cursor: pointer;
            }

            .gh-tooltip {
              position: absolute;
              z-index: 9999;
              pointer-events: none;
              animation: gh-tooltip-fade-in 0.15s ease-out;
            }

            @keyframes gh-tooltip-fade-in {
              from {
                opacity: 0;
                transform: translate(-50%, -100%) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -100%) scale(1);
              }
            }

            .gh-tooltip-top {
              animation-name: gh-tooltip-fade-in-top;
            }

            .gh-tooltip-bottom {
              animation-name: gh-tooltip-fade-in-bottom;
            }

            .gh-tooltip-left {
              animation-name: gh-tooltip-fade-in-left;
            }

            .gh-tooltip-right {
              animation-name: gh-tooltip-fade-in-right;
            }

            @keyframes gh-tooltip-fade-in-top {
              from {
                opacity: 0;
                transform: translate(-50%, -100%) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -100%) scale(1);
              }
            }

            @keyframes gh-tooltip-fade-in-bottom {
              from {
                opacity: 0;
                transform: translate(-50%, 0) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translate(-50%, 0) scale(1);
              }
            }

            @keyframes gh-tooltip-fade-in-left {
              from {
                opacity: 0;
                transform: translate(-100%, -50%) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translate(-100%, -50%) scale(1);
              }
            }

            @keyframes gh-tooltip-fade-in-right {
              from {
                opacity: 0;
                transform: translate(0, -50%) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translate(0, -50%) scale(1);
              }
            }

            .gh-tooltip-content {
              background-color: #1f2328;
              color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              padding: 6px 10px;
              border-radius: 6px;
              white-space: nowrap;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
              border: 1px solid rgba(255, 255, 255, 0.1);
              max-width: 250px;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .gh-tooltip-content a {
              color: #58a6ff;
              text-decoration: none;
            }

            .gh-tooltip-content a:hover {
              text-decoration: underline;
            }

            .gh-tooltip-arrow {
              position: absolute;
              width: 0;
              height: 0;
              border-style: solid;
            }
          `}</style>
        </div>
      )}
    </>
  );
}

// Multi-line tooltip variant
interface GitHubTooltipMultilineProps {
  content: string;
  children: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  maxWidth?: number;
}

export function GitHubTooltipMultiline({
  content,
  children,
  position = 'top',
  delay = 400,
  maxWidth = 250,
}: GitHubTooltipMultilineProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        
        let x = 0;
        let y = 0;
        
        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2 + scrollX;
            y = rect.top + scrollY;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2 + scrollX;
            y = rect.bottom + scrollY;
            break;
          case 'left':
            x = rect.left + scrollX;
            y = rect.top + rect.height / 2 + scrollY;
            break;
          case 'right':
            x = rect.right + scrollX;
            y = rect.top + rect.height / 2 + scrollY;
            break;
        }
        
        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowStyle = (): React.CSSProperties => {
    switch (position) {
      case 'top':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '6px 6px 0 6px',
          borderTopColor: '#1f2328',
        };
      case 'bottom':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 6px 6px 6px',
          borderBottomColor: '#1f2328',
        };
      case 'left':
        return {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 0 6px 6px',
          borderLeftColor: '#1f2328',
        };
      case 'right':
        return {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 6px 6px 0',
          borderRightColor: '#1f2328',
        };
    }
  };

  const getTooltipStyle = (): React.CSSProperties => {
    switch (position) {
      case 'top':
        return {
          left: coords.x,
          top: coords.y - 8,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          left: coords.x,
          top: coords.y + 8,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          left: coords.x - 8,
          top: coords.y,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          left: coords.x + 8,
          top: coords.y,
          transform: 'translate(0, -50%)',
        };
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="gh-tooltip-trigger"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`gh-tooltip gh-tooltip-${position}`}
          style={getTooltipStyle()}
          role="tooltip"
        >
          <div className="gh-tooltip-content" style={{ maxWidth, whiteSpace: 'normal' }}>
            {content}
          </div>
          <div className="gh-tooltip-arrow" style={getArrowStyle()} />
          
          <style>{`
            .gh-tooltip-trigger {
              display: inline-flex;
              cursor: pointer;
            }

            .gh-tooltip {
              position: absolute;
              z-index: 9999;
              pointer-events: none;
              animation: gh-tooltip-fade-in 0.15s ease-out;
            }

            @keyframes gh-tooltip-fade-in {
              from {
                opacity: 0;
                transform: translate(-50%, -100%) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -100%) scale(1);
              }
            }

            .gh-tooltip-top {
              animation-name: gh-tooltip-fade-in-top;
            }

            .gh-tooltip-bottom {
              animation-name: gh-tooltip-fade-in-bottom;
            }

            .gh-tooltip-left {
              animation-name: gh-tooltip-fade-in-left;
            }

            .gh-tooltip-right {
              animation-name: gh-tooltip-fade-in-right;
            }

            @keyframes gh-tooltip-fade-in-top {
              from {
                opacity: 0;
                transform: translate(-50%, -100%) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -100%) scale(1);
              }
            }

            @keyframes gh-tooltip-fade-in-bottom {
              from {
                opacity: 0;
                transform: translate(-50%, 0) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translate(-50%, 0) scale(1);
              }
            }

            @keyframes gh-tooltip-fade-in-left {
              from {
                opacity: 0;
                transform: translate(-100%, -50%) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translate(-100%, -50%) scale(1);
              }
            }

            @keyframes gh-tooltip-fade-in-right {
              from {
                opacity: 0;
                transform: translate(0, -50%) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translate(0, -50%) scale(1);
              }
            }

            .gh-tooltip-content {
              background-color: #1f2328;
              color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              padding: 6px 10px;
              border-radius: 6px;
              white-space: nowrap;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .gh-tooltip-arrow {
              position: absolute;
              width: 0;
              height: 0;
              border-style: solid;
            }
          `}</style>
        </div>
      )}
    </>
  );
}

export default GitHubTooltip;
