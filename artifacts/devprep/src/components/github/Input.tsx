'use client';

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

// Color tokens
const colors = {
  light: {
    bg: '#ffffff',
    bgSecondary: '#f6f8fa',
    border: '#d0d7de',
    textPrimary: '#1f2328',
    textSecondary: '#656d76',
    textMuted: '#8b949e',
    accent: '#0969da',
    placeholder: '#8b949e',
  },
  dark: {
    bg: '#0d1117',
    bgSecondary: '#161b22',
    border: '#30363d',
    textPrimary: '#f0f6fc',
    textSecondary: '#8b949e',
    textMuted: '#6e7681',
    accent: '#58a6ff',
    placeholder: '#484f58',
  },
};

export type InputSize = 'small' | 'medium' | 'large';

export interface GitHubInputProps extends Omit<TextFieldProps, 'size'> {
  size?: InputSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  errorMessage?: string;
  hint?: string;
}

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => 
    !['inputSize', 'hasLeadingIcon', 'hasTrailingIcon'].includes(prop as string),
})<{
  inputSize: InputSize;
  hasLeadingIcon?: boolean;
  hasTrailingIcon?: boolean;
}>(({ inputSize, hasLeadingIcon, hasTrailingIcon, theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;
  
  const sizeStyles = {
    small: { height: 28, fontSize: '12px', padding: '0 8px' },
    medium: { height: 32, fontSize: '14px', padding: '0 12px' },
    large: { height: 40, fontSize: '14px', padding: '0 12px' },
  };
  
  const size = sizeStyles[inputSize];
  
  return {
    width: '100%',
    
    '& .MuiInputBase-root': {
      backgroundColor: isDark ? colors.dark.bgSecondary : colors.light.bgSecondary,
      border: `1px solid ${c.border}`,
      borderRadius: 6,
      height: size.height,
      fontSize: size.fontSize,
      padding: size.padding,
      paddingLeft: hasLeadingIcon ? '36px' : size.padding,
      paddingRight: hasTrailingIcon ? '36px' : size.padding,
      transition: 'all 150ms ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      
      '&:hover': {
        borderColor: c.textMuted,
      },
      
      '&.Mui-focused': {
        borderColor: c.accent,
        boxShadow: `0 0 0 3px ${c.accent}25`,
        
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent',
        },
      },
      
      '&.Mui-error': {
        borderColor: isDark ? '#f85149' : '#cf222e',
        
        '&:focus-within': {
          boxShadow: `0 0 0 3px ${isDark ? '#f8514925' : '#cf222e25'}`,
        },
      },
      
      '&.Mui-disabled': {
        backgroundColor: isDark ? '#161b22' : '#f6f8fa',
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      
      '& .MuiInputBase-input': {
        padding: 0,
        fontSize: 'inherit',
        fontFamily: 'inherit',
        color: c.textPrimary,
        
        '&::placeholder': {
          color: c.placeholder,
          opacity: 1,
        },
      },
      
      '& .MuiInputBase-inputMultiline': {
        padding: '8px 12px',
        minHeight: size.height,
      },
    },
    
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },
    
    '& .MuiFormHelperText-root': {
      fontSize: '12px',
      marginTop: '6px',
      marginLeft: '0',
      color: c.textSecondary,
      
      '&.Mui-error': {
        color: isDark ? '#f85149' : '#cf222e',
      },
    },
    
    '& .MuiFormLabel-root': {
      fontSize: '14px',
      fontWeight: 500,
      color: c.textPrimary,
      
      '&.Mui-focused': {
        color: c.accent,
      },
    },
  };
});

const InputWrapper = styled('div', {
  shouldForwardProp: (prop) => !['hasLeadingIcon', 'hasTrailingIcon'].includes(prop as string),
})<{
  hasLeadingIcon?: boolean;
  hasTrailingIcon?: boolean;
}>(({ hasLeadingIcon, hasTrailingIcon }) => ({
  position: 'relative',
  width: '100%',
  
  '& .leading-icon': {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'inherit',
    pointerEvents: 'none',
    display: 'flex',
    zIndex: 1,
  },
  
  '& .trailing-icon': {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'inherit',
    pointerEvents: 'none',
    display: 'flex',
    zIndex: 1,
  },
}));

export const GitHubInput = React.forwardRef<HTMLInputElement, GitHubInputProps>(
  (
    {
      size = 'medium',
      leadingIcon,
      trailingIcon,
      errorMessage,
      hint,
      error,
      helperText,
      InputProps,
      ...props
    },
    ref
  ) => {
    const hasLeadingIcon = Boolean(leadingIcon);
    const hasTrailingIcon = Boolean(trailingIcon) || Boolean(error);
    
    return (
      <InputWrapper hasLeadingIcon={hasLeadingIcon} hasTrailingIcon={hasTrailingIcon}>
        {leadingIcon && (
          <span className="leading-icon">
            {leadingIcon}
          </span>
        )}
        
        <StyledTextField
          ref={ref}
          inputSize={size}
          hasLeadingIcon={hasLeadingIcon}
          hasTrailingIcon={hasTrailingIcon}
          error={error}
          helperText={errorMessage || hint || helperText}
          InputProps={{
            ...InputProps,
            endAdornment: trailingIcon,
          }}
          {...props}
        />
        
        {trailingIcon && (
          <span className="trailing-icon">
            {trailingIcon}
          </span>
        )}
      </InputWrapper>
    );
  }
);

GitHubInput.displayName = 'GitHubInput';

export default GitHubInput;
