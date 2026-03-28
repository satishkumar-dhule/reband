'use client';

import React from 'react';
import { Box, Card as MuiCard, CardContent, CardProps } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// Color tokens (will use CSS variables in production)
const colors = {
  light: {
    border: '#d0d7de',
    bg: '#ffffff',
    bgSecondary: '#f6f8fa',
    accent: '#0969da',
    textPrimary: '#1f2328',
    textSecondary: '#656d76',
  },
  dark: {
    border: '#30363d',
    bg: '#0d1117',
    bgSecondary: '#161b22',
    accent: '#58a6ff',
    textPrimary: '#f0f6fc',
    textSecondary: '#8b949e',
  },
};

export type CardVariant = 'default' | 'bordered' | 'elevated' | 'accent';

export interface GitHubCardProps extends Omit<CardProps, 'variant'> {
  variant?: CardVariant;
  noPadding?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => 
    !['cardVariant', 'noPadding'].includes(prop as string),
})<{
  cardVariant: CardVariant;
  noPadding?: boolean;
}>(({ theme, cardVariant, noPadding }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;
  
  return {
    backgroundColor: c.bg,
    borderRadius: 6,
    border: cardVariant === 'bordered' || cardVariant === 'accent' 
      ? `1px solid ${c.border}` 
      : '1px solid transparent',
    boxShadow: 'none',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    
    ...(cardVariant === 'elevated' && {
      boxShadow: isDark 
        ? '0 8px 24px rgba(1, 4, 9, 0.4)' 
        : '0 3px 6px rgba(140, 149, 159, 0.15)',
      border: 'none',
    }),
    
    ...(cardVariant === 'accent' && {
      borderLeft: `3px solid ${c.accent}`,
    }),
    
    '&:hover': {
      borderColor: cardVariant === 'bordered' 
        ? (isDark ? '#484f58' : '#81898f') 
        : undefined,
    },
    
    ...(noPadding && {
      '& .MuiCardContent-root': {
        padding: 0,
      },
    }),
  };
});

const CardHeader = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;
  
  return {
    padding: '12px 16px',
    borderBottom: `1px solid ${c.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: 600,
    color: c.textPrimary,
  };
});

const CardFooter = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;
  
  return {
    padding: '12px 16px',
    borderTop: `1px solid ${c.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    backgroundColor: c.bgSecondary,
    borderRadius: '0 0 6px 6px',
  };
});

export const GitHubCard: React.FC<GitHubCardProps> = ({
  variant = 'bordered',
  noPadding = false,
  header,
  footer,
  children,
  sx,
  ...props
}) => {
  return (
    <StyledCard 
      cardVariant={variant} 
      noPadding={noPadding}
      sx={{ overflow: 'hidden', ...sx }}
      {...props}
    >
      {header && <CardHeader>{header}</CardHeader>}
      <CardContent sx={{ 
        padding: noPadding ? 0 : '16px',
        '&:last-child': { paddingBottom: noPadding ? 0 : '16px' }
      }}>
        {children}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </StyledCard>
  );
};

// Sub-component for card sections
export interface GitHubCardSectionProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const GitHubCardSection: React.FC<GitHubCardSectionProps> = ({ title, description, icon, children, action }) => {
  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
      {(title || description || action) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            {title && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {icon}
                <Box component="h4" sx={{ m: 0, fontSize: '14px', fontWeight: 600 }}>
                  {title}
                </Box>
              </Box>
            )}
            {description && (
              <Box sx={{ fontSize: '12px', color: 'text.secondary', pl: icon ? 3.75 : 0 }}>
                {description}
              </Box>
            )}
          </Box>
          {action}
        </Box>
      )}
      {children}
    </Box>
  );
};

export default GitHubCard;
