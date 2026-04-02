'use client';

import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  Badge as MuiBadge,
  Typography,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';

// Animations
const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const colors = {
  light: {
    bg: '#ffffff',
    bgSecondary: '#f6f8fa',
    border: '#d0d7de',
    textPrimary: '#1f2328',
    textSecondary: '#656d76',
    textMuted: '#8b949e',
    accent: '#0969da',
    accentBg: 'rgba(9, 105, 218, 0.1)',
    hoverBg: '#f6f8fa',
  },
  dark: {
    bg: '#0d1117',
    bgSecondary: '#161b22',
    border: '#30363d',
    textPrimary: '#f0f6fc',
    textSecondary: '#8b949e',
    textMuted: '#6e7681',
    accent: '#58a6ff',
    accentBg: 'rgba(88, 166, 255, 0.15)',
    hoverBg: '#161b22',
  },
};

// Nav Item Component
export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  badgeColor?: 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  external?: boolean;
}

export interface GitHubNavItemProps {
  item: NavItem;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

const NavItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => !['isActive', 'isCollapsed'].includes(prop as string),
})<{ isActive?: boolean; isCollapsed?: boolean }>(({ theme, isActive, isCollapsed }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;
  
  return {
    borderRadius: 6,
    padding: '8px 12px',
    margin: '2px 8px',
    width: isCollapsed ? 'calc(100% - 16px)' : 'auto',
    minHeight: 36,
    color: isActive ? c.textPrimary : c.textSecondary,
    backgroundColor: isActive ? c.accentBg : 'transparent',
    fontWeight: isActive ? 600 : 400,
    fontSize: '14px',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&:hover': {
      backgroundColor: isActive ? c.accentBg : c.hoverBg,
      color: c.textPrimary,
    },
    
    '&.Mui-disabled': {
      opacity: 0.5,
      pointerEvents: 'none',
    },
    
    '& .MuiListItemIcon-root': {
      color: isActive ? c.accent : c.textMuted,
      minWidth: isCollapsed ? 'auto' : 20,
      marginRight: isCollapsed ? 0 : 12,
    },
  };
});

const NavItemLabel = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: 1.5,
}));

const NavBadge = styled(MuiBadge)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  
  return {
    '& .MuiBadge-badge': {
      fontSize: '11px',
      fontWeight: 600,
      padding: '0 6px',
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: isDark ? '#30363d' : '#eaeef2',
      color: isDark ? '#f0f6fc' : '#1f2328',
    },
  };
});

export const GitHubNavItem: React.FC<GitHubNavItemProps> = ({
  item,
  active = false,
  collapsed = false,
  onClick,
}) => {
  const content = (
    <NavItemButton
      isActive={active}
      isCollapsed={collapsed}
      selected={active}
      disabled={item.disabled}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      {item.icon && (
        <ListItemIcon>
          {item.icon}
        </ListItemIcon>
      )}
      {!collapsed && (
        <ListItemText 
          primary={item.label} 
          primaryTypographyProps={{ 
            component: NavItemLabel,
            noWrap: true,
          }} 
        />
      )}
      {item.badge !== undefined && !collapsed && (
        <NavBadge 
          badgeContent={item.badge} 
          color={item.badgeColor || 'default'}
          max={99}
        />
      )}
    </NavItemButton>
  );
  
  if (collapsed) {
    return (
      <Tooltip title={item.label} placement="right" arrow>
        {content}
      </Tooltip>
    );
  }
  
  return content;
};

// Navigation Group Component
export interface NavGroup {
  id: string;
  label?: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface GitHubNavGroupProps {
  group: NavGroup;
  activeId?: string;
  collapsed?: boolean;
  onItemClick?: (item: NavItem) => void;
}

const GroupHeader = styled(Typography)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  
  return {
    padding: '16px 16px 8px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: isDark ? '#8b949e' : '#656d76',
    display: collapsed ? 'none' : 'block',
  };
});

export const GitHubNavGroup: React.FC<GitHubNavGroupProps> = ({
  group,
  activeId,
  collapsed,
  onItemClick,
}) => {
  const [expanded, setExpanded] = React.useState(group.defaultExpanded !== false);
  
  return (
    <Box>
      {group.label && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            px: 2,
            pt: 2,
            pb: 0.5,
            cursor: group.collapsible ? 'pointer' : 'default',
          }}
          onClick={() => group.collapsible && setExpanded(!expanded)}
        >
          <GroupHeader sx={{ p: 0 }}>
            {group.label}
          </GroupHeader>
          {group.collapsible && !collapsed && (
            <Box
              component="span"
              sx={{
                fontSize: '10px',
                color: 'text.muted',
                transition: 'transform 150ms',
                transform: expanded ? 'rotate(0)' : 'rotate(-90deg)',
              }}
            >
              ▾
            </Box>
          )}
        </Box>
      )}
      <List disablePadding>
        {expanded && group.items.map((item) => (
          <ListItem key={item.id} disablePadding>
            <GitHubNavItem
              item={item}
              active={activeId === item.id}
              collapsed={collapsed}
              onClick={() => onItemClick?.(item)}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

// Main Navigation Component
export interface GitHubNavigationProps {
  groups: NavGroup[];
  activeId?: string;
  collapsed?: boolean;
  onItemClick?: (item: NavItem) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const NavigationRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCollapsed',
})<{ isCollapsed?: boolean }>(({ theme, isCollapsed }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;
  
  return {
    width: isCollapsed ? 56 : 240,
    minWidth: isCollapsed ? 56 : 240,
    height: '100%',
    backgroundColor: c.bg,
    borderRight: `1px solid ${c.border}`,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 150ms cubic-bezier(0.4, 0, 0.2, 1), min-width 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  };
});

const NavHeader = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;
  
  return {
    padding: '12px 16px',
    borderBottom: `1px solid ${c.border}`,
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
  };
});

const NavContent = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  paddingBottom: 16,
});

const NavFooter = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const c = isDark ? colors.dark : colors.light;
  
  return {
    padding: '12px 16px',
    borderTop: `1px solid ${c.border}`,
    backgroundColor: c.bgSecondary,
  };
});

export const GitHubNavigation: React.FC<GitHubNavigationProps> = ({
  groups,
  activeId,
  collapsed = false,
  onItemClick,
  header,
  footer,
}) => {
  return (
    <NavigationRoot isCollapsed={collapsed}>
      {header && <NavHeader>{header}</NavHeader>}
      <NavContent>
        {groups.map((group) => (
          <GitHubNavGroup
            key={group.id}
            group={group}
            activeId={activeId}
            collapsed={collapsed}
            onItemClick={onItemClick}
          />
        ))}
      </NavContent>
      {footer && <NavFooter>{footer}</NavFooter>}
    </NavigationRoot>
  );
};

export default GitHubNavigation;
