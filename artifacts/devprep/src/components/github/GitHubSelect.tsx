'use client';

import React from 'react';

type SelectSize = 'sm' | 'md';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface GitHubSelectProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  size?: SelectSize;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const sizeStyles: Record<SelectSize, React.CSSProperties> = {
  sm: {
    padding: '5px 32px 5px 12px',
    fontSize: '12px',
    lineHeight: '20px',
    minHeight: '28px',
  },
  md: {
    padding: '8px 36px 8px 16px',
    fontSize: '14px',
    lineHeight: '20px',
    minHeight: '36px',
  },
};

const baseStyles: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  outline: 'none',
  backgroundColor: '#fff',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4.427 5.427a.75.75 0 011.06-.053L8 7.939l2.513-2.565a.75.75 0 11.974 1.132l-3 3.063a.75.75 0 01-1.008 0l-3-3.063a.75.75 0 01-.044-1.079z' fill='%23546064'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
  color: '#24292f',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

export const GitHubSelect: React.FC<GitHubSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  size = 'md',
  disabled = false,
  style,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        style={{
          ...baseStyles,
          ...sizeStyles[size],
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...style,
        }}
        className={className}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GitHubSelect;
