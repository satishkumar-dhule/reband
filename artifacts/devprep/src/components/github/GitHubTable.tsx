'use client';

import React, { useEffect, useState } from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
}

export interface GitHubTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  size?: 'sm' | 'md';
  hoverable?: boolean;
  striped?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  style?: React.CSSProperties;
}

// Theme-aware colors
const tableColors = {
  light: {
    cell: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontSize: '14px',
      color: '#24292f',
      padding: '12px 16px',
      borderBottom: '1px solid #d0d7de',
    },
    header: {
      fontWeight: 600,
      backgroundColor: '#f6f8fa',
      fontSize: '12px',
      color: '#57606a',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    pagination: {
      borderTop: '1px solid #d0d7de',
      backgroundColor: '#f6f8fa',
      textColor: '#57606a',
      buttonBorder: '#d0d7de',
      buttonBg: '#fff',
      buttonText: '#24292f',
      buttonDisabled: '#8c959f',
      activeButtonBg: '#0969da',
      activeButtonText: '#fff',
    },
    empty: '#57606a',
    striped: '#f6f8fa',
    hover: '#eaeef2',
  },
  dark: {
    cell: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontSize: '14px',
      color: '#e6edf3',
      padding: '12px 16px',
      borderBottom: '1px solid #30363d',
    },
    header: {
      fontWeight: 600,
      backgroundColor: '#161b22',
      fontSize: '12px',
      color: '#8b949e',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    pagination: {
      borderTop: '1px solid #30363d',
      backgroundColor: '#161b22',
      textColor: '#8b949e',
      buttonBorder: '#30363d',
      buttonBg: '#21262d',
      buttonText: '#c9d1d9',
      buttonDisabled: '#484f58',
      activeButtonBg: '#238636',
      activeButtonText: '#ffffff',
    },
    empty: '#8b949e',
    striped: '#161b22',
    hover: '#21262d',
  },
};

export function GitHubTable<T extends Record<string, unknown>>({
  columns,
  data,
  size = 'md',
  hoverable = true,
  striped = false,
  pagination,
  emptyMessage = 'No data available',
  style,
}: GitHubTableProps<T>) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const rowPadding = size === 'sm' ? '8px 16px' : '12px 16px';
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     document.documentElement.getAttribute('data-theme') === 'dark' ||
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class', 'data-theme'] 
    });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  const colors = isDarkMode ? tableColors.dark : tableColors.light;
  const cellStyles = { ...colors.cell };
  const headerStyles = { ...colors.header };

  const renderPagination = () => {
    if (!pagination) return null;

    const { page, pageSize, total, onPageChange } = pagination;
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);
    const p = colors.pagination;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderTop: p.borderTop,
        backgroundColor: p.backgroundColor,
      }}>
        <span style={{
          fontSize: '14px',
          color: p.textColor,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}>
          {startItem}–{endItem} of {total} results
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            style={{
              padding: '6px 12px',
              border: `1px solid ${p.buttonBorder}`,
              borderRadius: '6px',
              backgroundColor: p.buttonBg,
              color: page === 1 ? p.buttonDisabled : p.buttonText,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              opacity: page === 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5) {
              if (page > 3) {
                pageNum = page - 2 + i;
              }
              if (page > totalPages - 2) {
                pageNum = totalPages - 4 + i;
              }
            }
            if (pageNum > totalPages) return null;
            const isActive = page === pageNum;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${p.buttonBorder}`,
                  borderRadius: '6px',
                  backgroundColor: isActive ? p.activeButtonBg : p.buttonBg,
                  color: isActive ? p.activeButtonText : p.buttonText,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            style={{
              padding: '6px 12px',
              border: `1px solid ${p.buttonBorder}`,
              borderRadius: '6px',
              backgroundColor: p.buttonBg,
              color: page === totalPages ? p.buttonDisabled : p.buttonText,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              opacity: page === totalPages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ border: `1px solid ${isDarkMode ? '#30363d' : '#d0d7de'}`, borderRadius: '6px', overflow: 'hidden', ...style }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={String(col.key) + i}
                  style={{
                    ...headerStyles,
                    textAlign: col.align || 'left',
                    width: col.width ? (typeof col.width === 'number' ? `${col.width}px` : col.width) : undefined,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    ...cellStyles,
                    textAlign: 'center',
                    color: colors.empty,
                    padding: '32px 16px',
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={{
                    backgroundColor: striped && rowIndex % 2 === 1 ? colors.striped : 'transparent',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (hoverable) {
                      e.currentTarget.style.backgroundColor = colors.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hoverable) {
                      e.currentTarget.style.backgroundColor = striped && rowIndex % 2 === 1 ? colors.striped : 'transparent';
                    }
                  }}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={String(col.key) + colIndex}
                      style={{
                        ...cellStyles,
                        padding: rowPadding,
                        textAlign: col.align || 'left',
                      }}
                    >
                      {col.render
                        ? col.render(row, rowIndex)
                        : String(row[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}

export default GitHubTable;
