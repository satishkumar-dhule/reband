'use client';

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';

// CSS variable injection for GitHub theme
const cssVariables = `
  :root {
    --gh-btn-primary-bg: #2da44e;
    --gh-btn-primary-border: rgba(27, 31, 35, 0.15);
    --gh-btn-primary-text: #ffffff;
    --gh-btn-primary-hover-bg: #2c974b;
    --gh-btn-primary-hover-border: rgba(27, 31, 35, 0.15);
    --gh-btn-primary-hover-text: #ffffff;
    
    --gh-btn-secondary-bg: #f6f8fa;
    --gh-btn-secondary-border: rgba(27, 31, 35, 0.15);
    --gh-btn-secondary-text: #24292f;
    --gh-btn-secondary-hover-bg: #f3f4f6;
    --gh-btn-secondary-hover-border: rgba(27, 31, 35, 0.15);
    
    --gh-btn-outline-bg: transparent;
    --gh-btn-outline-border: rgba(27, 31, 35, 0.15);
    --gh-btn-outline-text: #24292f;
    --gh-btn-outline-hover-bg: #f6f8fa;
    --gh-btn-outline-hover-border: rgba(27, 31, 35, 0.2);
    
    --gh-btn-danger-bg: #d1242f;
    --gh-btn-danger-border: rgba(27, 31, 35, 0.15);
    --gh-btn-danger-text: #ffffff;
    --gh-btn-danger-hover-bg: #cf222e;
    --gh-btn-danger-hover-border: rgba(27, 31, 35, 0.15);
    --gh-btn-danger-hover-text: #ffffff;
    
    --gh-btn-focus-ring: rgba(9, 105, 218, 0.4);
  }
`;

// Animation keyframes
const pressEffect = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(1px); }
  100% { transform: translateY(0); }
`;

const loadingSpinner = keyframes`
  to { transform: rotate(360deg); }
`;

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface GitHubButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => 
    !['ghVariant', 'ghSize', 'isLoading'].includes(prop as string),
})<{
  ghVariant: ButtonVariant;
  ghSize: ButtonSize;
  isLoading?: boolean;
}>(({ ghVariant, ghSize, isLoading }) => ({
  // Base styles
  borderRadius: 6,
  fontWeight: 500,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: isLoading ? 'wait' : 'pointer',
  position: 'relative',
  
  // Size variants
  ...(ghSize === 'small' && {
    padding: '3px 12px',
    fontSize: '12px',
    height: '28px',
    minWidth: 'auto',
  }),
  ...(ghSize === 'medium' && {
    padding: '5px 16px',
    fontSize: '14px',
    height: '36px',
    minWidth: 'auto',
  }),
  ...(ghSize === 'large' && {
    padding: '9px 20px',
    fontSize: '16px',
    height: '44px',
    minWidth: 'auto',
  }),
  
  // Variant styles
  ...(ghVariant === 'primary' && {
    backgroundColor: '#2da44e',
    borderColor: 'rgba(27, 31, 35, 0.15)',
    color: '#ffffff',
    boxShadow: '0 1px 0 rgba(27, 31, 35, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
    '&:hover': {
      backgroundColor: '#2c974b',
      borderColor: 'rgba(27, 31, 35, 0.15)',
      color: '#ffffff',
    },
    '&:active': {
      backgroundColor: '#29873e',
      boxShadow: 'inset 0 1px 0 rgba(27, 31, 35, 0.1)',
    },
  }),
  ...(ghVariant === 'secondary' && {
    backgroundColor: '#f6f8fa',
    borderColor: 'rgba(27, 31, 35, 0.15)',
    color: '#24292f',
    '&:hover': {
      backgroundColor: '#f3f4f6',
      borderColor: 'rgba(27, 31, 35, 0.15)',
      color: '#24292f',
    },
    '&:active': {
      backgroundColor: '#edeff2',
      boxShadow: 'inset 0 1px 0 rgba(27, 31, 35, 0.1)',
    },
  }),
  ...(ghVariant === 'outline' && {
    backgroundColor: 'transparent',
    borderColor: 'rgba(27, 31, 35, 0.15)',
    color: '#24292f',
    '&:hover': {
      backgroundColor: '#f6f8fa',
      borderColor: 'rgba(27, 31, 35, 0.2)',
      color: '#24292f',
    },
    '&:active': {
      backgroundColor: '#edeff2',
      boxShadow: 'inset 0 1px 0 rgba(27, 31, 35, 0.1)',
    },
  }),
  ...(ghVariant === 'danger' && {
    backgroundColor: '#d1242f',
    borderColor: 'rgba(27, 31, 35, 0.15)',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#cf222e',
      borderColor: 'rgba(27, 31, 35, 0.15)',
      color: '#ffffff',
    },
    '&:active': {
      backgroundColor: '#a40e26',
      boxShadow: 'inset 0 1px 0 rgba(27, 31, 35, 0.1)',
    },
  }),
  ...(ghVariant === 'ghost' && {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: '#24292f',
    '&:hover': {
      backgroundColor: '#f6f8fa',
      borderColor: 'transparent',
      color: '#24292f',
    },
    '&:active': {
      backgroundColor: '#edeff2',
      boxShadow: 'inset 0 1px 0 rgba(27, 31, 35, 0.1)',
    },
  }),
  
  // Focus state
  '&:focus-visible': {
    outline: '2px solid #0969da',
    outlineOffset: '2px',
    boxShadow: '0 0 0 3px rgba(9, 105, 218, 0.3)',
  },
  
  // Disabled state
  '&.Mui-disabled': {
    backgroundColor: ghVariant === 'primary' || ghVariant === 'danger' 
      ? 'rgba(27, 31, 35, 0.12)' 
      : 'rgba(27, 31, 35, 0.08)',
    borderColor: 'rgba(27, 31, 35, 0.15)',
    color: '#8b949e',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
}));

// Loading spinner component
const LoadingSpinner = styled('span')({
  display: 'inline-block',
  width: '1em',
  height: '1em',
  border: '2px solid currentColor',
  borderRightColor: 'transparent',
  borderRadius: '50%',
  animation: `${loadingSpinner} 0.75s linear infinite`,
  marginRight: '6px',
});

export const GitHubButton = React.forwardRef<HTMLButtonElement, GitHubButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'medium',
      loading = false,
      disabled,
      leadingIcon,
      trailingIcon,
      children,
      startIcon,
      endIcon,
      sx,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    
    return (
      <>
        <style>{cssVariables}</style>
        <StyledButton
          ref={ref}
          ghVariant={variant}
          ghSize={size}
          isLoading={loading}
          disabled={isDisabled}
          startIcon={loading ? undefined : leadingIcon || startIcon}
          endIcon={trailingIcon || endIcon}
          sx={{
            gap: 0.5,
            '& .MuiButton-icon': {
              marginLeft: 0,
              marginRight: 0,
            },
            ...sx,
          }}
          {...props}
        >
          {loading && <LoadingSpinner aria-hidden="true" />}
          {children}
        </StyledButton>
      </>
    );
  }
);

GitHubButton.displayName = 'GitHubButton';

export default GitHubButton;
