'use client';

import React, { useEffect, useRef } from 'react';

export interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  style?: React.CSSProperties;
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { maxWidth: '400px' },
  md: { maxWidth: '560px' },
  lg: { maxWidth: '720px' },
};

export const GitHubModal: React.FC<GitHubModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  style,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #d0d7de',
          boxShadow: '0 16px 32px rgba(27, 31, 36, 0.12), 0 8px 24px rgba(27, 31, 36, 0.08)',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          ...sizeStyles[size],
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #d0d7de',
        }}>
          {title && (
            <h2
              id="modal-title"
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: '#24292f',
              }}
            >
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#57606a',
              padding: '4px',
              marginLeft: title ? '0' : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#eaeef2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
          </button>
        </div>

        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          fontSize: '14px',
          lineHeight: 1.6,
          color: '#24292f',
        }}>
          {children}
        </div>

        {footer && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid #d0d7de',
            backgroundColor: '#f6f8fa',
            borderRadius: '0 0 8px 8px',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubModal;
