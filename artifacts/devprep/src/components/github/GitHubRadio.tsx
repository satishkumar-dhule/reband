'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import { FormControlLabel, Radio as MuiRadio, RadioProps } from '@mui/material';

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

export interface GitHubRadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  hint?: string;
}

export interface GitHubRadioProps extends Omit<RadioProps, 'size'> {
  label?: React.ReactNode;
  size?: 'small' | 'medium';
  hint?: string;
}

export interface GitHubRadioGroupProps {
  options: GitHubRadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  direction?: 'vertical' | 'horizontal';
}

const StyledRadio = styled(MuiRadio, {
  shouldForwardProp: (prop) => !['radioSize'].includes(prop as string),
})<{ radioSize: 'small' | 'medium' }>(({ radioSize, theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;

  const size = radioSize === 'small' ? 16 : 20;

  return {
    padding: 0,
    width: size,
    height: size,

    '& .MuiSvgIcon-root': {
      fontSize: size,
      color: isDark ? '#6e7681' : '#8b949e',
      borderRadius: '50%',
      border: `1px solid ${isDark ? '#30363d' : '#d0d7de'}`,
      backgroundColor: isDark ? '#0d1117' : '#ffffff',
      transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',

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
        color: c.accent,
        borderColor: c.accent,

        '& .MuiSvgIcon-fontSizeSmall': {
          color: c.accent,
        },

        '&:before': {
          content: '""',
          display: 'block',
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: '50%',
          backgroundColor: c.accent,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
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

const RadioWrapper = styled('div', {
  shouldForwardProp: () => false,
})({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const OptionWrapper = styled('div', {
  shouldForwardProp: () => false,
})({
  display: 'flex',
  alignItems: 'flex-start',
});

export const GitHubRadio: React.FC<GitHubRadioProps> = ({
  label,
  size = 'medium',
  hint,
  disabled,
  className,
  ...props
}) => {
  const radio = (
    <StyledRadio
      radioSize={size}
      disabled={disabled}
      className={className}
      {...props}
    />
  );

  if (label || hint) {
    return (
      <RadioWrapper>
        <FormControlLabel
          control={radio}
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
      </RadioWrapper>
    );
  }

  return radio;
};

export const GitHubRadioGroup: React.FC<GitHubRadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  disabled = false,
  size = 'medium',
  direction = 'vertical',
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        gap: direction === 'horizontal' ? '24px' : '8px',
      }}
    >
      {options.map((option) => (
        <OptionWrapper key={option.value}>
          <StyledRadio
            radioSize={size}
            checked={value === option.value}
            onChange={handleChange}
            value={option.value}
            name={name}
            disabled={disabled || option.disabled}
            inputProps={{
              'aria-label': option.label?.toString(),
            }}
          />
          <LabelWrapper size={size}>
            {option.label}
            {option.hint && <HintText>{option.hint}</HintText>}
          </LabelWrapper>
        </OptionWrapper>
      ))}
    </div>
  );
};

export default GitHubRadio;
