// Core types and interfaces for channels
// Keep this file lean - only types needed at build time

export interface ChannelConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'engineering' | 'data' | 'cloud' | 'security' | 'management' | 'mobile' | 'ai' | 'testing' | 'fundamentals' | 'certification';
  roles: string[];
  isCertification?: boolean;
}

export interface RoleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
}
