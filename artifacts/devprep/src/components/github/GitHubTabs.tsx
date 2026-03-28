'use client';

import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export interface GitHubTabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  style?: React.CSSProperties;
}

export const GitHubTabs: React.FC<GitHubTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  style,
}) => {
  const [selectedTab, setSelectedTab] = useState(activeTab || tabs[0]?.id);

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setSelectedTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div
      style={{
        borderBottom: '1px solid #d0d7de',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        ...style,
      }}
    >
      <div style={{
        display: 'flex',
        gap: '0',
        marginBottom: '-1px',
      }}>
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              disabled={tab.disabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #fd8c73' : '2px solid transparent',
                color: isActive ? '#24292f' : '#57606a',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                opacity: tab.disabled ? 0.5 : 1,
                transition: 'color 0.2s ease, border-color 0.2s ease',
                marginBottom: '-1px',
              }}
              onMouseEnter={(e) => {
                if (!isActive && !tab.disabled) {
                  e.currentTarget.style.color = '#24292f';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !tab.disabled) {
                  e.currentTarget.style.color = '#57606a';
                }
              }}
            >
              {tab.icon && (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '20px',
                    height: '20px',
                    padding: '0 6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '9999px',
                    backgroundColor: isActive ? '#24292f' : '#57606a',
                    color: '#fff',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GitHubTabs;
