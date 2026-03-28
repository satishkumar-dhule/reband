'use client';

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// Color tokens
const colors = {
  light: {
    default: { bg: '#eaeef2', text: '#24292f' },
    primary: { bg: '#ddf4ff', text: '#0969da' },
    success: { bg: '#dafbe1', text: '#1a7f37' },
    warning: { bg: '#fff8c5', text: '#9a6700' },
    danger: { bg: '#ffebe9', text: '#cf222e' },
    info: { bg: '#ddf4ff', text: '#0550ae' },
    outline: { bg: 'transparent', text: '#24292f' },
  },
  dark: {
    default: { bg: '#30363d', text: '#e6edf3' },
    primary: { bg: '#388bfd33', text: '#58a6ff' },
    success: { bg: '#23863626', text: '#3fb950' },
    warning: { bg: '#9e6a0326', text: '#d29922' },
    danger: { bg: '#da363326', text: '#f85149' },
    info: { bg: '#1f6feb26', text: '#58a6ff' },
    outline: { bg: 'transparent', text: '#e6edf3' },
  },
};

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
export type BadgeSize = 'small' | 'medium';

export interface GitHubBadgeProps extends Omit<ChipProps, 'variant' | 'size'> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  outline?: boolean;
  pill?: boolean;
  count?: number;
  maxCount?: number;
}

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => 
    !['badgeVariant', 'badgeSize', 'isPill'].includes(prop as string),
})<{
  badgeVariant: BadgeVariant;
  badgeSize: BadgeSize;
  isPill?: boolean;
}>(({ theme, badgeVariant, badgeSize, isPill }) => {
  const isDark = theme.palette.mode === 'dark';
  const variant = badgeVariant === 'outline' ? 'outline' : badgeVariant;
  const c = isDark ? colors.dark[variant] : colors.light[variant];
  const outlineBorder = isDark ? '#30363d' : '#d0d7de';
  
  return {
    height: badgeSize === 'small' ? 22 : 24,
    fontSize: badgeSize === 'small' ? '11px' : '12px',
    fontWeight: 600,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    borderRadius: isPill ? 9999 : badgeSize === 'small' ? 4 : 6,
    padding: badgeSize === 'small' ? '0 6px' : '0 8px',
    minWidth: badgeSize === 'small' ? 18 : 20,
    
    // Background and text color based on variant
    ...(badgeVariant === 'outline' 
      ? {
          backgroundColor: 'transparent',
          color: isDark ? '#e6edf3' : '#24292f',
          border: `1px solid ${outlineBorder}`,
          '& .MuiChip-deleteIcon': {
            color: isDark ? '#8b949e' : '#656d76',
            fontSize: 12,
            marginLeft: 4,
            marginRight: -4,
            '&:hover': {
              color: isDark ? '#f85149' : '#cf222e',
            },
          },
        }
      : {
          backgroundColor: c.bg,
          color: c.text,
          border: '1px solid transparent',
          '& .MuiChip-deleteIcon': {
            color: c.text,
            opacity: 0.7,
            fontSize: 12,
            marginLeft: 4,
            marginRight: -4,
            '&:hover': {
              opacity: 1,
            },
          },
        }
    ),
    
    '&:hover': {
      backgroundColor: badgeVariant === 'outline' 
        ? (isDark ? '#30363d20' : '#f6f8fa')
        : (isDark ? alpha(c.bg, 0.8) : alpha(c.bg, 0.8)),
    },
    
    '& .MuiChip-label': {
      padding: 0,
    },
    
    '& .MuiChip-icon': {
      marginLeft: 0,
      marginRight: 4,
      fontSize: badgeSize === 'small' ? 12 : 14,
    },
  };
});

export const GitHubBadge: React.FC<GitHubBadgeProps> = ({
  variant = 'default',
  size = 'medium',
  outline = false,
  pill = false,
  count,
  maxCount = 99,
  label,
  onDelete,
  deleteIcon,
  icon,
  sx,
  ...props
}) => {
  // Determine the actual variant
  const actualVariant = outline ? 'outline' : variant;
  
  // Calculate display label
  let displayLabel = label;
  if (count !== undefined) {
    displayLabel = count > maxCount ? `${maxCount}+` : String(count);
  }
  
  return (
    <StyledChip
      badgeVariant={actualVariant}
      badgeSize={size}
      isPill={pill}
      label={displayLabel}
      onDelete={onDelete}
      deleteIcon={deleteIcon}
      icon={icon}
      sx={{
        ...(pill && {
          borderRadius: 9999,
        }),
        ...sx,
      }}
      {...props}
    />
  );
};

// Specialized Label component (GitHub-style)
export interface GitHubLabelProps extends Omit<GitHubBadgeProps, 'size'> {
  size?: 'small' | 'medium';
 hue?: string | number; // For custom colors (hsl hue)
saturation?: number;
lightness?: number;
}

const LabelSpan = styled('span', {
  shouldForwardProp: (prop) => !['labelHue', 'labelSaturation', 'labelLightness'].includes(prop as string),
})<{
  labelHue?: string | number;
  labelSaturation?: number;
  labelLightness?: number;
}>(({ labelHue, labelSaturation, labelLightness }) => {
  // Custom color mode
  if (labelHue !== undefined) {
    const bg = `hsl(${labelHue}, ${labelSaturation || 65}%, ${labelLightness || 90}%)`;
    const text = `hsl(${labelHue}, ${labelSaturation || 65}%, ${labelLightness || 35}%)`;
    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0 7px',
      fontSize: '12px',
      fontWeight: 500,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      lineHeight: '18px',
      borderRadius: 9999,
      backgroundColor: bg,
      color: text,
      whiteSpace: 'nowrap',
    };
  }
  
  return {};
});

export const GitHubLabel: React.FC<GitHubLabelProps> = ({
  hue,
  saturation,
  lightness,
  children,
  ...props
}) => {
  if (hue !== undefined) {
    return (
      <LabelSpan 
        labelHue={hue} 
        labelSaturation={saturation} 
        labelLightness={lightness}
        {...props}
      >
        {children}
      </LabelSpan>
    );
  }
  
  return (
    <GitHubBadge size="small" {...props}>
      {children}
    </GitHubBadge>
  );
};

// Count badge (notification-style)
export interface GitHubCountProps {
  count?: number;
  max?: number;
  status?: 'default' | 'secondary';
}

const CountSpan = styled('span')<{ countStatus?: string }>(({ theme, countStatus }) => {
  const isDark = theme.palette.mode === 'dark';
  
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    padding: '0 6px',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    lineHeight: 1,
    borderRadius: 9999,
    backgroundColor: countStatus === 'secondary' 
      ? 'transparent' 
      : (isDark ? '#30363d' : '#eaeef2'),
    color: countStatus === 'secondary'
      ? (isDark ? '#8b949e' : '#656d76')
      : (isDark ? '#f0f6fc' : '#24292f'),
  };
});

export const GitHubCount: React.FC<GitHubCountProps> = ({
  count,
  max = 99,
  status = 'default',
}) => {
  if (count === undefined || count === 0) return null;
  
  const displayCount = count > max ? `${max}+` : String(count);
  
  return (
    <CountSpan countStatus={status} aria-label={`${count} notifications`}>
      {displayCount}
    </CountSpan>
  );
};

export default GitHubBadge;
