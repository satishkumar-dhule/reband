/**
 * GitHub-style Main Layout Component for DevPrep
 * Combines header + sidebar with responsive design
 */

import React, { useState, useEffect } from 'react';
import { GitHubHeader } from './GitHubHeader';
import { GitHubSidebar } from './GitHubSidebar';

interface GitHubLayoutProps {
  children: React.ReactNode;
  activeItem?: string;
  onItemClick?: (id: string) => void;
  showSidebar?: boolean;
  maxWidth?: number;
  contentPadding?: number;
}

export function GitHubLayout({
  children,
  activeItem = 'dashboard',
  onItemClick,
  showSidebar = true,
  maxWidth = 1280,
  contentPadding = 32,
}: GitHubLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  const sidebarWidth = sidebarCollapsed ? 56 : 240;

  return (
    <div className="gh-layout">
      <GitHubHeader />

      {showSidebar && (
        <>
          {/* Mobile sidebar overlay */}
          {isMobile && mobileSidebarOpen && (
            <div
              className="gh-sidebar-overlay"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`gh-sidebar-wrapper ${mobileSidebarOpen ? 'mobile-open' : ''} ${isMobile ? 'mobile' : ''}`}
            style={{
              width: isMobile ? 240 : sidebarWidth,
            }}
          >
            <GitHubSidebar
              activeItem={activeItem}
              onItemClick={onItemClick}
              collapsed={!isMobile && sidebarCollapsed}
              onCollapsedChange={setSidebarCollapsed}
            />
          </div>
        </>
      )}

      {/* Main content area */}
      <main
        className={`gh-main-content ${showSidebar ? 'with-sidebar' : 'full-width'}`}
        style={{
          '--sidebar-width': `${sidebarWidth}px`,
          '--content-padding': `${contentPadding}px`,
          '--max-width': `${maxWidth}px`,
        } as React.CSSProperties}
      >
        <div className="gh-content-wrapper">
          <div className="gh-content-container">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile sidebar toggle button */}
      {showSidebar && isMobile && (
        <button
          className="gh-mobile-sidebar-toggle"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zm0 5A.75.75 0 012.75 14h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 14z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      <style>{`
        .gh-layout {
          min-height: 100vh;
          background: #0d1117;
        }

        .gh-sidebar-wrapper {
          position: fixed;
          top: 64px;
          left: 0;
          height: calc(100vh - 64px);
          z-index: 50;
          transition: width 0.2s ease, transform 0.2s ease;
        }

        .gh-sidebar-wrapper.mobile {
          transform: translateX(-100%);
        }

        .gh-sidebar-wrapper.mobile-open {
          transform: translateX(0);
        }

        .gh-sidebar-overlay {
          position: fixed;
          top: 64px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 40;
          animation: gh-fade-in 0.2s ease;
        }

        @keyframes gh-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .gh-main-content {
          min-height: calc(100vh - 64px);
          transition: margin-left 0.2s ease;
        }

        .gh-main-content.with-sidebar {
          margin-left: var(--sidebar-width);
        }

        .gh-main-content.full-width {
          margin-left: 0;
        }

        .gh-content-wrapper {
          display: flex;
          justify-content: center;
          padding: var(--content-padding);
        }

        .gh-content-container {
          width: 100%;
          max-width: var(--max-width);
        }

        .gh-mobile-sidebar-toggle {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          display: none;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          background: #0969da;
          border: none;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(9, 105, 218, 0.4);
          cursor: pointer;
          z-index: 30;
          transition: all 0.15s ease;
        }

        .gh-mobile-sidebar-toggle:hover {
          background: #0860ca;
          transform: scale(1.05);
        }

        .gh-mobile-sidebar-toggle:active {
          transform: scale(0.95);
        }

        @media (max-width: 1024px) {
          .gh-main-content.with-sidebar {
            margin-left: 0;
          }

          .gh-mobile-sidebar-toggle {
            display: flex;
          }

          .gh-content-wrapper {
            padding: 24px 16px;
          }
        }

        @media (max-width: 640px) {
          .gh-content-wrapper {
            padding: 16px 12px;
          }
        }

        /* Animation for page content */
        .gh-main-content > * {
          animation: gh-content-enter 0.3s ease;
        }

        @keyframes gh-content-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Convenience wrapper for pages without sidebar
export function GitHubPageLayout({ children, maxWidth = 1280 }: { children: React.ReactNode; maxWidth?: number }) {
  return (
    <div className="gh-page-layout">
      <div className="gh-page-content" style={{ maxWidth }}>
        {children}
      </div>
      <style>{`
        .gh-page-layout {
          min-height: calc(100vh - 64px);
          padding: 32px 24px;
          display: flex;
          justify-content: center;
        }

        .gh-page-content {
          width: 100%;
        }

        @media (max-width: 768px) {
          .gh-page-layout {
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  );
}

// Two-column layout
export function GitHubTwoColumnLayout({
  children,
  sidebar,
  mainWidth = 2,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  mainWidth?: number;
}) {
  return (
    <div className="gh-two-column-layout">
      <aside className="gh-two-column-sidebar">{sidebar}</aside>
      <main className="gh-two-column-main">{children}</main>
      <style>{`
        .gh-two-column-layout {
          display: flex;
          gap: 24px;
        }

        .gh-two-column-sidebar {
          width: 280px;
          flex-shrink: 0;
        }

        .gh-two-column-main {
          flex: 1;
          min-width: 0;
        }

        @media (max-width: 1024px) {
          .gh-two-column-layout {
            flex-direction: column;
          }

          .gh-two-column-sidebar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default GitHubLayout;
