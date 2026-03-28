'use client';

import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { TextField, TextFieldProps } from '@mui/material';

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
    focusRing: 'rgba(9, 105, 218, 0.3)',
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
    focusRing: 'rgba(88, 166, 255, 0.3)',
  },
};

export type TextareaSize = 'small' | 'medium' | 'large';

export interface GitHubTextareaProps extends Omit<TextFieldProps, 'size'> {
  size?: TextareaSize;
  showCount?: boolean;
  maxLength?: number;
}

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) =>
    !['textareaSize', 'showCount'].includes(prop as string),
})<{
  textareaSize: TextareaSize;
  showCount?: boolean;
}>(({ textareaSize, showCount, theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;

  const sizeStyles = {
    small: {
      minHeight: 64,
      fontSize: '12px',
      padding: '8px 12px',
    },
    medium: {
      minHeight: 96,
      fontSize: '14px',
      padding: '8px 12px',
    },
    large: {
      minHeight: 160,
      fontSize: '14px',
      padding: '12px 16px',
    },
  };

  const size = sizeStyles[textareaSize];

  return {
    width: '100%',

    '& .MuiInputBase-root': {
      backgroundColor: isDark ? colors.dark.bgSecondary : colors.light.bgSecondary,
      border: `1px solid ${c.border}`,
      borderRadius: '6px',
      minHeight: size.minHeight,
      fontSize: size.fontSize,
      padding: showCount ? '8px 12px 24px 12px' : size.padding,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',

      '&:hover': {
        borderColor: isDark ? '#8b949e' : '#656d76',
      },

      '&.Mui-focused': {
        borderColor: c.accent,
        boxShadow: `0 0 0 3px ${c.focusRing}`,

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
        lineHeight: '20px',

        '&::placeholder': {
          color: c.placeholder,
          opacity: 1,
        },
      },

      '& .MuiInputBase-inputMultiline': {
        padding: 0,
        resize: 'vertical',
        minHeight: 'inherit',
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
      position: 'absolute',
      bottom: showCount ? '4px' : 'auto',
      right: showCount ? '8px' : 'auto',
      left: 'auto',
      backgroundColor: 'transparent',

      '&.Mui-error': {
        color: isDark ? '#f85149' : '#cf222e',
      },
    },

    '& .MuiFormLabel-root': {
      fontSize: '14px',
      fontWeight: 500,
      color: c.textPrimary,
      marginBottom: '4px',

      '&.Mui-focused': {
        color: c.accent,
      },

      '&.Mui-error': {
        color: isDark ? '#f85149' : '#cf222e',
      },
    },
  };
});

const TextareaContainer = styled('div', {
  shouldForwardProp: () => false,
})({
  position: 'relative',
  width: '100%',
});

export const GitHubTextarea = React.forwardRef<
  HTMLTextAreaElement,
  GitHubTextareaProps
>(
  (
    {
      size = 'medium',
      showCount = false,
      maxLength,
      value,
      helperText,
      error,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const c = isDark ? colors.dark : colors.light;

    const characterCount =
      showCount && typeof value === 'string'
        ? `${value.length}${maxLength ? ` / ${maxLength}` : ''}`
        : null;

    return (
      <div>
        <StyledTextField
          ref={ref}
          textareaSize={size}
          showCount={showCount}
          value={value}
          error={error}
          helperText={
            showCount ? (
              <span style={{ color: c.textMuted, fontSize: '12px' }}>
                {characterCount}
              </span>
            ) : (
              helperText
            )
          }
          multiline
          fullWidth
          inputProps={{
            maxLength,
          }}
          FormHelperTextProps={{
            component: 'div',
          }}
          {...props}
        />
      </div>
    );
  }
);

GitHubTextarea.displayName = 'GitHubTextarea';

export default GitHubTextarea;
