'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import { FormControlLabel, Checkbox as MuiCheckbox, CheckboxProps } from '@mui/material';

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
    focusRing: 'rgba(88, 166, 255, 0.3)',
  },
};

export interface GitHubCheckboxProps extends Omit<CheckboxProps, 'size'> {
  label?: React.ReactNode;
  size?: 'small' | 'medium';
  hint?: string;
}

const StyledCheckbox = styled(MuiCheckbox, {
  shouldForwardProp: (prop) => !['checkboxSize'].includes(prop as string),
})<{ checkboxSize: 'small' | 'medium' }>(({ checkboxSize, theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;

  const size = checkboxSize === 'small' ? 16 : 20;

  return {
    padding: 0,
    width: size,
    height: size,

    '& .MuiSvgIcon-root': {
      fontSize: size,
      color: isDark ? '#6e7681' : '#8b949e',
      borderRadius: 4,
      border: `1px solid ${isDark ? '#30363d' : '#d0d7de'}`,
      backgroundColor: isDark ? '#0d1117' : '#ffffff',

      '&:hover': {
        borderColor: isDark ? '#8b949e' : '#656d76',
      },
    },

    '&.Mui-focusVisible': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${c.focusRing}`,

      '& .MuiSvgIcon-root': {
        borderColor: c.accent,
      },
    },

    '&.Mui-checked': {
      '& .MuiSvgIcon-root': {
        color: '#ffffff',
        backgroundColor: c.accent,
        borderColor: c.accent,
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='white' d='M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z'/%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '12px',
      },
    },

    '&.Mui-disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',

      '& .MuiSvgIcon-root': {
        backgroundColor: isDark ? '#161b22' : '#f6f8fa',
      },
    },
  };
});

const LabelWrapper = styled('span', {
  shouldForwardProp: (prop) => !['size'].includes(prop as string),
})<{ size: 'small' | 'medium' }>(({ size, theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;

  return {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fontSize: size === 'small' ? '12px' : '14px',
    lineHeight: size === 'small' ? '18px' : '20px',
    color: c.textPrimary,
    cursor: 'pointer',
  };
});

const HintText = styled('span', {
  shouldForwardProp: () => false,
})(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;

  return {
    display: 'block',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fontSize: '12px',
    lineHeight: '18px',
    color: c.textSecondary,
    marginTop: '2px',
    marginLeft: (theme as any).spacing ? '26px' : '26px',
  };
});

const CheckboxWrapper = styled('div', {
  shouldForwardProp: () => false,
})({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const GitHubCheckbox: React.FC<GitHubCheckboxProps> = ({
  label,
  size = 'medium',
  hint,
  disabled,
  className,
  ...props
}) => {
  const checkbox = (
    <StyledCheckbox
      checkboxSize={size}
      disabled={disabled}
      className={className}
      {...props}
    />
  );

  if (label || hint) {
    return (
      <CheckboxWrapper>
        <FormControlLabel
          control={checkbox}
          label={label && <LabelWrapper size={size}>{label}</LabelWrapper>}
          sx={{
            marginLeft: 0,
            marginRight: 0,
            '& .MuiFormControlLabel-label': {
              flex: 1,
            },
          }}
        />
        {hint && <HintText>{hint}</HintText>}
      </CheckboxWrapper>
    );
  }

  return checkbox;
};

export default GitHubCheckbox;
