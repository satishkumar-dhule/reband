/**
 * GitHub-style Sidebar Component for DevPrep
 * 240px width with collapsible sections and active state indicators
 */

import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  Code2,
  Layers,
  Bookmark,
  GraduationCap,
  GitBranch,
  Users,
  Trophy,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronDown,
  Plus,
  Star,
  Eye,
  FolderKanban,
  Inbox,
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  count?: number | string;
  badge?: string;
}

interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
  defaultOpen?: boolean;
}

const mainSections: SidebarSection[] = [
  {
    id: 'navigation',
    title: '',
    defaultOpen: true,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" />, href: '/dashboard' },
      { id: 'inbox', label: 'Inbox', icon: <Inbox className="w-4 h-4" />, href: '/inbox', count: 5 },
    ],
  },
  {
    id: 'learning',
    title: 'Learning',
    defaultOpen: true,
    items: [
      { id: 'paths', label: 'Learning Paths', icon: <GraduationCap className="w-4 h-4" />, href: '/paths' },
      { id: 'practice', label: 'Code Practice', icon: <Code2 className="w-4 h-4" />, href: '/practice' },
      { id: 'challenges', label: 'Challenges', icon: <Layers className="w-4 h-4" />, href: '/challenges' },
      { id: 'flashcards', label: 'Flashcards', icon: <Bookmark className="w-4 h-4" />, href: '/flashcards' },
      { id: 'questions', label: 'Questions', icon: <BookOpen className="w-4 h-4" />, href: '/questions' },
    ],
  },
  {
    id: 'progress',
    title: 'Progress',
    defaultOpen: true,
    items: [
      { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, href: '/analytics' },
      { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" />, href: '/achievements', badge: '12' },
    ],
  },
];

interface Repository {
  id: string;
  name: string;
  isPrivate: boolean;
  isStarred?: boolean;
}

const repositories: Repository[] = [
  { id: '1', name: 'system-design-notes', isPrivate: false, isStarred: true },
  { id: '2', name: 'algorithm-cheatsheet', isPrivate: false, isStarred: true },
  { id: '3', name: 'frontend-interview-prep', isPrivate: false },
  { id: '4', name: 'aws-solutions-architect', isPrivate: true },
  { id: '5', name: 'kubernetes-deep-dive', isPrivate: true },
];

interface GitHubSidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function GitHubSidebar({
  activeItem = 'dashboard',
  onItemClick,
  collapsed = false,
  onCollapsedChange,
}: GitHubSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    navigation: true,
    learning: true,
    progress: true,
    repositories: true,
  });

  const [repositoriesExpanded, setRepositoriesExpanded] = useState(true);
  const [filter, setFilter] = useState('');

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const filteredRepos = repositories.filter((repo) =>
    repo.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (collapsed) {
    return (
      <aside className="gh-sidebar gh-sidebar-collapsed">
        <button
          className="gh-sidebar-collapse-btn"
          onClick={() => onCollapsedChange?.(false)}
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="gh-sidebar-collapsed-nav">
          {mainSections.map((section) =>
            section.items.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`gh-sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => onItemClick?.(item.id)}
                aria-label={item.label}
              >
                {item.icon}
                {item.count && <span className="gh-sidebar-count">{item.count}</span>}
              </a>
            ))
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="gh-sidebar">
      {/* Collapse button */}
      <button
        className="gh-sidebar-collapse-btn right"
        onClick={() => onCollapsedChange?.(true)}
        aria-label="Collapse sidebar"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Main navigation sections */}
      <nav className="gh-sidebar-nav">
        {mainSections.map((section) => (
          <div key={section.id} className="gh-sidebar-section">
            {section.title && (
              <button
                className="gh-sidebar-section-header"
                onClick={() => toggleSection(section.id)}
              >
                <span className="gh-sidebar-section-title">{section.title}</span>
                {openSections[section.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            {openSections[section.id] && (
              <div className="gh-sidebar-section-content">
                {section.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.href || '#'}
                    className={`gh-sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => onItemClick?.(item.id)}
                  >
                    {item.icon}
                    <span className="gh-sidebar-item-label">{item.label}</span>
                    {item.count && (
                      <span className="gh-sidebar-count">{item.count}</span>
                    )}
                    {item.badge && (
                      <span className="gh-sidebar-badge">{item.badge}</span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Repositories section */}
        <div className="gh-sidebar-section repositories">
          <div className="gh-sidebar-section-header">
            <button
              className="gh-sidebar-section-toggle"
              onClick={() => setRepositoriesExpanded(!repositoriesExpanded)}
            >
              {repositoriesExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span>Your repositories</span>
            </button>
            <button className="gh-sidebar-add-btn" aria-label="New repository">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {repositoriesExpanded && (
            <>
              <div className="gh-sidebar-repo-filter">
                <input
                  type="text"
                  placeholder="Filter repositories..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="gh-sidebar-filter-input"
                />
              </div>
              <div className="gh-sidebar-section-content">
                {filteredRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={`/repos/${repo.name}`}
                    className="gh-sidebar-repo-item"
                  >
                    <div className="gh-sidebar-repo-icon">
                      {repo.isPrivate ? (
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h7A2.5 2.5 0 0 1 14 2.5v9.047a.5.5 0 0 1-.757.434L10 10.414l-3.243 2.113a.5.5 0 0 1-.757-.434V2.5Z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h7A2.5 2.5 0 0 1 14 2.5v11a.5.5 0 0 1-.81.33l-3.5-2.5a.5.5 0 0 1 0-.66l3.5-2.5a.5.5 0 0 1 .81.33v1.066a1.75 1.75 0 0 0 0 .464V14a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 1 14V7.464a1.75 1.75 0 0 0 0-.464V2.5Z" />
                        </svg>
                      )}
                    </div>
                    <span className="gh-sidebar-repo-name">{repo.name}</span>
                    {repo.isStarred && (
                      <Star className="w-3 h-3 gh-sidebar-star" fill="currentColor" />
                    )}
                  </a>
                ))}
                {filteredRepos.length === 0 && (
                  <div className="gh-sidebar-empty">No repositories found</div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Settings link */}
      <div className="gh-sidebar-footer">
        <a href="/settings" className="gh-sidebar-settings">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </a>
      </div>

      <style>{`
        .gh-sidebar {
          position: fixed;
          top: 64px;
          left: 0;
          width: 240px;
          height: calc(100vh - 64px);
          background: #0d1117;
          border-right: 1px solid #30363d;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 50;
        }

        .gh-sidebar-collapsed {
          width: 56px;
          align-items: center;
          padding-top: 16px;
        }

        .gh-sidebar-collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          margin-bottom: 16px;
          color: #8b949e;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .gh-sidebar-collapse-btn:hover {
          color: #c9d1d9;
          background: #161b22;
        }

        .gh-sidebar-collapse-btn.right {
          transform: rotate(180deg);
        }

        .gh-sidebar-collapsed-nav {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 100%;
        }

        .gh-sidebar-nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 16px 12px;
        }

        .gh-sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }

        .gh-sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .gh-sidebar-nav::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 3px;
        }

        .gh-sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }

        .gh-sidebar-section {
          margin-bottom: 16px;
        }

        .gh-sidebar-section.repositories {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #21262d;
        }

        .gh-sidebar-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 6px 8px;
          font-size: 12px;
          font-weight: 600;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .gh-sidebar-section-header:hover {
          color: #c9d1d9;
          background: #161b22;
        }

        .gh-sidebar-section-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .gh-sidebar-section-toggle:hover {
          color: #c9d1d9;
        }

        .gh-sidebar-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: #8b949e;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .gh-sidebar-add-btn:hover {
          color: #c9d1d9;
          background: #21262d;
        }

        .gh-sidebar-section-title {
          flex: 1;
          text-align: left;
        }

        .gh-sidebar-section-content {
          margin-top: 4px;
        }

        .gh-sidebar-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          color: #8b949e;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.15s ease;
          position: relative;
        }

        .gh-sidebar-collapsed .gh-sidebar-item {
          justify-content: center;
          padding: 8px;
        }

        .gh-sidebar-item:hover {
          color: #c9d1d9;
          background: #161b22;
        }

        .gh-sidebar-item.active {
          color: #c9d1d9;
          background: #161b22;
        }

        .gh-sidebar-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 16px;
          background: #0969da;
          border-radius: 0 2px 2px 0;
        }

        .gh-sidebar-item-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gh-sidebar-count {
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          font-size: 12px;
          font-weight: 500;
          line-height: 20px;
          color: #8b949e;
          text-align: center;
          background: #21262d;
          border-radius: 10px;
        }

        .gh-sidebar-badge {
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          font-size: 11px;
          font-weight: 600;
          line-height: 18px;
          color: #ffffff;
          text-align: center;
          background: #0969da;
          border-radius: 9px;
        }

        .gh-sidebar-collapsed .gh-sidebar-count,
        .gh-sidebar-collapsed .gh-sidebar-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          font-size: 10px;
          line-height: 16px;
        }

        .gh-sidebar-repo-filter {
          padding: 8px 12px;
        }

        .gh-sidebar-filter-input {
          width: 100%;
          height: 32px;
          padding: 0 12px;
          font-family: inherit;
          font-size: 12px;
          color: #c9d1d9;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          outline: none;
          transition: all 0.15s ease;
        }

        .gh-sidebar-filter-input::placeholder {
          color: #484f58;
        }

        .gh-sidebar-filter-input:focus {
          border-color: #58a6ff;
          box-shadow: 0 0 0 3px rgba(56, 139, 253, 0.15);
        }

        .gh-sidebar-repo-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          font-size: 13px;
          color: #8b949e;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .gh-sidebar-repo-item:hover {
          color: #c9d1d9;
          background: #161b22;
        }

        .gh-sidebar-repo-icon {
          color: #8b949e;
          flex-shrink: 0;
        }

        .gh-sidebar-repo-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gh-sidebar-star {
          color: #e3b341;
          flex-shrink: 0;
        }

        .gh-sidebar-empty {
          padding: 16px 12px;
          font-size: 12px;
          color: #484f58;
          text-align: center;
        }

        .gh-sidebar-footer {
          padding: 12px;
          border-top: 1px solid #21262d;
        }

        .gh-sidebar-settings {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          color: #8b949e;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .gh-sidebar-settings:hover {
          color: #c9d1d9;
          background: #161b22;
        }

        .gh-sidebar-collapsed .gh-sidebar-footer {
          display: none;
        }

        @media (max-width: 1024px) {
          .gh-sidebar {
            transform: translateX(-100%);
            transition: transform 0.2s ease;
          }

          .gh-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}

export default GitHubSidebar;
