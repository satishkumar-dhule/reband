/**
 * GitHub-style Header Component for DevPrep
 * Implements GitHub's dark theme with #0d1117, #161b22 colors
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Settings,
  User,
  LogOut,
  BookOpen,
  Code2,
  Layers,
  GraduationCap,
  Home,
  GitBranch,
  Bookmark,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
  { label: 'Learning Paths', href: '/paths', icon: <GraduationCap className="w-4 h-4" /> },
  { label: 'Code Practice', href: '/practice', icon: <Code2 className="w-4 h-4" /> },
  { label: 'Challenges', href: '/challenges', icon: <Layers className="w-4 h-4" /> },
  { label: 'Flashcards', href: '/flashcards', icon: <Bookmark className="w-4 h-4" /> },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Branches', href: '/branches', icon: <GitBranch className="w-4 h-4" /> },
  { label: 'Docs', href: '/docs', icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Help', href: '/help', icon: <HelpCircle className="w-4 h-4" /> },
];

interface GitHubHeaderProps {
  user?: {
    name: string;
    avatar: string;
    username: string;
  };
  onSearch?: (query: string) => void;
  notificationCount?: number;
}

export function GitHubHeader({
  user = {
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    username: 'alexchen',
  },
  onSearch,
  notificationCount = 3,
}: GitHubHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchFocused && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        document.getElementById('header-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchFocused]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    onSearch?.(query);
  };

  return (
    <header className="gh-header">
      {/* Logo & Primary Nav */}
      <div className="gh-header-left">
        {/* Mobile menu button */}
        <button className="gh-mobile-menu" aria-label="Menu">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2.75a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75Zm0 5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 12.75Z" />
          </svg>
        </button>

        {/* Logo */}
        <a href="/" className="gh-logo" aria-label="DevPrep Home">
          <svg height="32" viewBox="0 0 24 24" fill="none" className="gh-logo-icon">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="gh-logo-text">DevPrep</span>
        </a>

        {/* Main Navigation */}
        <nav className="gh-nav" aria-label="Main navigation">
          {mainNavItems.map((item) => (
            <a key={item.href} href={item.href} className="gh-nav-item">
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Search & Actions */}
      <div className="gh-header-right">
        {/* Search */}
        <form className="gh-search-form" onSubmit={handleSearch}>
          <div className={`gh-search-container ${searchFocused ? 'focused' : ''}`}>
            <Search className="gh-search-icon" />
            <input
              id="header-search"
              name="search"
              type="search"
              placeholder="Type / to search..."
              className="gh-search-input"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Search"
            />
            {!searchFocused && (
              <kbd className="gh-search-kbd">/</kbd>
            )}
          </div>
        </form>

        {/* New button */}
        <button className="gh-btn gh-btn-icon" aria-label="Create new">
          <Plus className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <div className="gh-notifications" ref={notificationsRef}>
          <button
            className="gh-btn gh-btn-icon"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label={`${notificationCount} notifications`}
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="gh-notification-badge">{notificationCount}</span>
            )}
          </button>

          {notificationsOpen && (
            <div className="gh-dropdown gh-notifications-dropdown">
              <div className="gh-dropdown-header">
                <span>Notifications</span>
                <button className="gh-btn-link">Mark all as read</button>
              </div>
              <div className="gh-notification-list">
                <div className="gh-notification-item unread">
                  <div className="gh-notification-dot"></div>
                  <div className="gh-notification-content">
                    <p><strong>system-design</strong> channel has new questions</p>
                    <span className="gh-notification-time">2 minutes ago</span>
                  </div>
                </div>
                <div className="gh-notification-item unread">
                  <div className="gh-notification-dot"></div>
                  <div className="gh-notification-content">
                    <p>You earned the <strong>Week Warrior</strong> badge</p>
                    <span className="gh-notification-time">1 hour ago</span>
                  </div>
                </div>
                <div className="gh-notification-item">
                  <div className="gh-notification-content">
                    <p>Daily streak: <strong>7 days</strong> 🔥</p>
                    <span className="gh-notification-time">3 hours ago</span>
                  </div>
                </div>
              </div>
              <div className="gh-dropdown-footer">
                <a href="/notifications">View all notifications</a>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="gh-user-menu" ref={userMenuRef}>
          <button
            className="gh-user-button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-label="User menu"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="gh-user-avatar"
            />
            <ChevronDown className={`w-3 h-3 gh-chevron ${userMenuOpen ? 'open' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="gh-dropdown gh-user-dropdown">
              <div className="gh-dropdown-header user">
                <img src={user.avatar} alt="" className="gh-dropdown-avatar" />
                <div className="gh-dropdown-user-info">
                  <span className="gh-dropdown-name">{user.name}</span>
                  <span className="gh-dropdown-username">@{user.username}</span>
                </div>
              </div>
              <div className="gh-dropdown-divider"></div>
              <a href="/profile" className="gh-dropdown-item">
                <User className="w-4 h-4" />
                <span>Your profile</span>
              </a>
              <a href="/settings" className="gh-dropdown-item">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </a>
              <div className="gh-dropdown-divider"></div>
              <button className="gh-dropdown-item danger">
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .gh-header {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          padding: 0 24px;
          background: #0d1117;
          border-bottom: 1px solid #30363d;
        }

        .gh-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .gh-mobile-menu {
          display: none;
          padding: 8px;
          color: #8b949e;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .gh-mobile-menu:hover {
          background: #161b22;
          color: #c9d1d9;
        }

        @media (max-width: 768px) {
          .gh-mobile-menu {
            display: flex;
          }
        }

        .gh-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #c9d1d9;
        }

        .gh-logo:hover {
          color: #ffffff;
        }

        .gh-logo-icon {
          width: 32px;
          height: 32px;
          color: #58a6ff;
        }

        .gh-logo-text {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.5px;
        }

        .gh-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 1024px) {
          .gh-nav span {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .gh-nav {
            display: none;
          }
        }

        .gh-nav-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 500;
          color: #8b949e;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .gh-nav-item:hover {
          color: #c9d1d9;
          background: #161b22;
        }

        .gh-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .gh-search-form {
          display: flex;
        }

        .gh-search-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .gh-search-icon {
          position: absolute;
          left: 12px;
          width: 16px;
          height: 16px;
          color: #8b949e;
          pointer-events: none;
        }

        .gh-search-input {
          width: 240px;
          height: 36px;
          padding: 0 12px 0 36px;
          font-family: inherit;
          font-size: 14px;
          color: #c9d1d9;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          outline: none;
          transition: all 0.15s ease;
        }

        .gh-search-input::placeholder {
          color: #484f58;
        }

        .gh-search-input:focus {
          width: 320px;
          border-color: #58a6ff;
          box-shadow: 0 0 0 3px rgba(56, 139, 253, 0.15);
        }

        @media (max-width: 768px) {
          .gh-search-input {
            width: 180px;
          }
          .gh-search-input:focus {
            width: 200px;
          }
        }

        .gh-search-kbd {
          position: absolute;
          right: 8px;
          padding: 2px 6px;
          font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
          font-size: 11px;
          color: #484f58;
          background: #21262d;
          border: 1px solid #30363d;
          border-radius: 4px;
        }

        .gh-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px 12px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          color: #c9d1d9;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .gh-btn:hover {
          background: #161b22;
        }

        .gh-btn-icon {
          padding: 6px;
          position: relative;
        }

        .gh-notifications {
          position: relative;
        }

        .gh-notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          font-size: 10px;
          font-weight: 600;
          line-height: 16px;
          color: #ffffff;
          text-align: center;
          background: #0969da;
          border-radius: 8px;
        }

        .gh-user-menu {
          position: relative;
        }

        .gh-user-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .gh-user-button:hover {
          background: #161b22;
        }

        .gh-user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid #30363d;
        }

        .gh-chevron {
          color: #8b949e;
          transition: transform 0.15s ease;
        }

        .gh-chevron.open {
          transform: rotate(180deg);
        }

        .gh-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          min-width: 240px;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          box-shadow: 0 8px 24px rgba(1, 4, 9, 0.4);
          overflow: hidden;
          animation: gh-dropdown-enter 0.15s ease;
        }

        @keyframes gh-dropdown-enter {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gh-user-dropdown {
          right: 0;
        }

        .gh-notifications-dropdown {
          right: -100px;
          width: 360px;
        }

        @media (max-width: 768px) {
          .gh-notifications-dropdown {
            right: -80px;
            width: 320px;
          }
        }

        .gh-dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #30363d;
        }

        .gh-dropdown-header.user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          text-transform: none;
        }

        .gh-dropdown-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .gh-dropdown-user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .gh-dropdown-name {
          font-size: 14px;
          font-weight: 600;
          color: #c9d1d9;
        }

        .gh-dropdown-username {
          font-size: 12px;
          color: #8b949e;
        }

        .gh-dropdown-divider {
          height: 1px;
          margin: 4px 0;
          background: #30363d;
        }

        .gh-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 8px 16px;
          font-family: inherit;
          font-size: 14px;
          color: #c9d1d9;
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .gh-dropdown-item:hover {
          background: #21262d;
        }

        .gh-dropdown-item.danger {
          color: #f85149;
        }

        .gh-dropdown-item.danger:hover {
          background: rgba(248, 81, 73, 0.1);
        }

        .gh-dropdown-footer {
          padding: 8px 16px;
          border-top: 1px solid #30363d;
        }

        .gh-dropdown-footer a {
          font-size: 12px;
          color: #58a6ff;
          text-decoration: none;
        }

        .gh-dropdown-footer a:hover {
          text-decoration: underline;
        }

        .gh-btn-link {
          font-family: inherit;
          font-size: 12px;
          color: #58a6ff;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .gh-btn-link:hover {
          text-decoration: underline;
        }

        .gh-notification-list {
          max-height: 320px;
          overflow-y: auto;
        }

        .gh-notification-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #21262d;
          transition: background 0.15s ease;
        }

        .gh-notification-item:hover {
          background: #21262d;
        }

        .gh-notification-item.unread {
          background: rgba(56, 139, 253, 0.05);
        }

        .gh-notification-dot {
          width: 8px;
          height: 8px;
          margin-top: 6px;
          background: #0969da;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .gh-notification-content {
          flex: 1;
        }

        .gh-notification-content p {
          margin: 0;
          font-size: 13px;
          color: #c9d1d9;
          line-height: 1.4;
        }

        .gh-notification-content strong {
          font-weight: 600;
        }

        .gh-notification-time {
          font-size: 11px;
          color: #8b949e;
        }
      `}</style>
    </header>
  );
}

export default GitHubHeader;
