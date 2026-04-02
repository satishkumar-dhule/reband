'use client';

import React, { ReactNode } from 'react';

export interface GitHubFormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * GitHub-style form wrapper component
 * Provides semantic form element with consistent styling
 */
export const GitHubForm: React.FC<GitHubFormProps> = ({
  children,
  onSubmit,
  className,
  style,
}) => {
  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    ...style,
  };

  return (
    <form
      onSubmit={onSubmit}
      className={className}
      style={formStyle}
      noValidate
    >
      {children}
    </form>
  );
};

export default GitHubForm;
