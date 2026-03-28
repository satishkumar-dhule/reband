'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface GitHubDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: string | number;
  style?: React.CSSProperties;
}

export const GitHubDropdown: React.FC<GitHubDropdownProps> = ({
  trigger,
  items,
  align = 'left',
  width = 180,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled || item.divider) return;
    item.onClick?.();
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: '100%',
            [align === 'left' ? 'left' : 'right']: 0,
            marginTop: '4px',
            minWidth: typeof width === 'number' ? `${width}px` : width,
            padding: '4px 0',
            backgroundColor: '#fff',
            border: '1px solid #d0d7de',
            borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(27, 31, 36, 0.12), 0 2px 8px rgba(27, 31, 36, 0.08)',
            zIndex: 1000,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          }}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  style={{
                    height: '1px',
                    backgroundColor: '#d0d7de',
                    margin: '4px 0',
                  }}
                />
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                role="menuitem"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '14px',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  color: item.danger ? '#cf222e' : item.disabled ? '#8c959f' : '#24292f',
                  opacity: item.disabled ? 0.5 : 1,
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.backgroundColor = '#f6f8fa';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon && (
                  <span style={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GitHubDropdown;
