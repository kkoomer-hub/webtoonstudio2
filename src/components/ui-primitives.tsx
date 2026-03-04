'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// =========================================================
// Badge 컴포넌트
// =========================================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'up' | 'new' | 'completed' | 'hot' | 'draft' | 'pro';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'new',
  className,
}) => {
  const variantStyles = {
    up: 'bg-red-500 text-white',
    new: 'bg-amber-400 text-white',
    completed: 'bg-gray-700 text-white',
    hot: 'bg-orange-500 text-white',
    draft: 'bg-gray-200 text-gray-600',
    pro: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

// =========================================================
// Button 컴포넌트
// =========================================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';

  const variantStyles = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300',
    secondary:
      'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    outline:
      'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-7 text-base',
    icon: 'h-9 w-9',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
    >
      {loading ? (
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
};

// =========================================================
// Avatar 컴포넌트
// =========================================================
interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
}) => {
  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center font-bold ring-2 ring-white',
        sizeStyles[size],
        !src && 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white',
        className
      )}
    >
      {src ? (
        <Image 
          src={src} 
          alt={name || 'Avatar'} 
          fill 
          unoptimized 
          className="object-cover" 
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

// =========================================================
// Input 컴포넌트
// =========================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftElement,
  rightElement,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftElement && (
          <div className="absolute left-3 text-gray-400">{leftElement}</div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full h-10 rounded-xl border bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200',
            'border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
            leftElement ? 'pl-9' : 'pl-3',
            rightElement ? 'pr-9' : 'pr-3',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 text-gray-400">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// =========================================================
// Card 컴포넌트
// =========================================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
  onClick,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        hover &&
          'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 cursor-pointer',
        paddingStyles[padding],
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

// =========================================================
// Spinner 컴포넌트
// =========================================================
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  };

  return (
    <div
      className={cn(
        'rounded-full border-indigo-200 border-t-indigo-600 animate-spin',
        sizeStyles[size],
        className
      )}
    />
  );
};

// =========================================================
// Skeleton 컴포넌트
// =========================================================
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        variant === 'text' && 'h-4 rounded',
        variant === 'rect' && 'rounded-xl',
        variant === 'circle' && 'rounded-full',
        className
      )}
    />
  );
};

// =========================================================
// Divider 컴포넌트
// =========================================================
interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className }) => {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    );
  }

  return <div className={cn('h-px bg-gray-100', className)} />;
};

// =========================================================
// Tooltip 컴포넌트 (간단한 CSS 기반)
// =========================================================
interface TooltipProps {
  children: React.ReactNode;
  label: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  label,
  position = 'top',
}) => {
  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group">
      {children}
      <div
        className={cn(
          'absolute z-50 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg font-medium whitespace-nowrap',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none',
          positionStyles[position]
        )}
      >
        {label}
      </div>
    </div>
  );
};

// =========================================================
// Progress Bar 컴포넌트
// =========================================================
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'indigo' | 'violet' | 'green' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'indigo',
  size = 'md',
  showLabel = false,
  className,
}) => {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  const colorStyles = {
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-400',
    red: 'bg-red-500',
  };

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn('w-full bg-gray-100 rounded-full overflow-hidden', sizeStyles[size])}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorStyles[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 mt-1">{percent}%</span>
      )}
    </div>
  );
};

// =========================================================
// Tag 컴포넌트
// =========================================================
interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  color?: 'gray' | 'indigo' | 'violet' | 'green' | 'amber';
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  onRemove,
  color = 'gray',
  className,
}) => {
  const colorStyles = {
    gray: 'bg-gray-100 text-gray-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
        colorStyles[color],
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </span>
  );
};

// =========================================================
// Empty State 컴포넌트
// =========================================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-4',
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-gray-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>
      )}
      {action}
    </div>
  );
};
