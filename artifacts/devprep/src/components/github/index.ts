// GitHub-style components for DevPrep
// Re-exports for easy importing

// GitHub-prefixed standalone components (with inline styles)
export { GitHubButton, GitHubIconButton, GitHubButtonGroup, GitHubLinkButton } from './GitHubButton';

export { GitHubCard, GitHubStatCard, GitHubListCard } from './GitHubCard';

export { GitHubBadge } from './GitHubBadge';

export { GitHubInput } from './GitHubInput';

export { GitHubAlert } from './GitHubAlert';

// MUI-based components
export { GitHubButton as Button } from './Button';
export type { GitHubButtonProps as ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { GitHubCard as Card, GitHubCardSection } from './Card';
export type { GitHubCardProps as CardProps, CardVariant } from './Card';
export type { GitHubCardSectionProps } from './Card';

export { GitHubNavigation, GitHubNavItem, GitHubNavGroup } from './Navigation';
export type { 
  GitHubNavigationProps, 
  GitHubNavItemProps, 
  GitHubNavGroupProps,
  NavItem,
  NavGroup,
} from './Navigation';

export { GitHubBadge as Badge } from './Badge';
export type { 
  GitHubBadgeProps as BadgeProps, 
  GitHubLabelProps, 
  GitHubCountProps,
  BadgeVariant,
  BadgeSize,
} from './Badge';

export { GitHubInput as Input } from './Input';
export type { GitHubInputProps as InputProps, InputSize } from './Input';

export { GitHubTabs } from './GitHubTabs';
export type { GitHubTabsProps, Tab } from './GitHubTabs';

export { GitHubDropdown } from './GitHubDropdown';
export type { GitHubDropdownProps, DropdownItem } from './GitHubDropdown';

export { GitHubModal } from './GitHubModal';
export type { GitHubModalProps } from './GitHubModal';

export { GitHubTable } from './GitHubTable';
export type { GitHubTableProps, Column } from './GitHubTable';

// Form Components
export { GitHubForm } from './GitHubForm';
export type { GitHubFormProps } from './GitHubForm';

export { GitHubFormGroup } from './GitHubFormGroup';
export type { GitHubFormGroupProps } from './GitHubFormGroup';

export { GitHubFormHelper } from './GitHubFormHelper';
export type { GitHubFormHelperProps } from './GitHubFormHelper';

export { GitHubFormError } from './GitHubFormError';
export type { GitHubFormErrorProps } from './GitHubFormError';

// Tooltip
export { GitHubTooltip, GitHubTooltipMultiline } from './GitHubTooltip';
export type { GitHubTooltipProps, TooltipPosition } from './GitHubTooltip';

// Form Components - Select, Checkbox, Radio, Textarea
export { GitHubSelect } from './GitHubSelect';

export { GitHubCheckbox } from './GitHubCheckbox';
export type { GitHubCheckboxProps } from './GitHubCheckbox';

export { GitHubRadio, GitHubRadioGroup } from './GitHubRadio';
export type { GitHubRadioProps, GitHubRadioOption, GitHubRadioGroupProps } from './GitHubRadio';

export { GitHubTextarea } from './GitHubTextarea';
export type { GitHubTextareaProps, TextareaSize } from './GitHubTextarea';

// Avatar Components
export { GitHubAvatar, GitHubAvatarGroup, GitHubAvatarSkeleton } from './GitHubAvatar';

// Skeleton Components
export { 
  GitHubSkeleton, 
  GitHubSkeletonAvatar, 
  GitHubSkeletonText, 
  GitHubSkeletonCard, 
  GitHubSkeletonTable, 
  GitHubSkeletonList 
} from './GitHubSkeleton';

// Progress Components
export { GitHubProgress, GitHubProgressInline } from './GitHubProgress';

// Spinner Components
export { GitHubSpinner, GitHubSpinnerDot, GitHubSpinnerDots } from './GitHubSpinner';

// Theme Toggle
export { GitHubThemeToggle, useTheme } from './GitHubThemeToggle';
export type { ThemeMode } from './GitHubThemeToggle';
