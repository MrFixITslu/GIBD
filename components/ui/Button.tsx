import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

type ButtonAsButton = BaseButtonProps & 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
  as?: 'button';
  to?: never;
};

type ButtonAsLink = BaseButtonProps & 
  Omit<LinkProps, keyof BaseButtonProps | 'to'> & {
  as: 'link';
  to: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const Button: React.FC<ButtonProps> = (props) => {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    as = 'button',
    children,
    className = '',
    ...restProps
  } = props;

  const baseClasses = 'btn inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'btn-primary bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
    secondary: 'btn-secondary bg-neutral-100 text-neutral-900 border border-neutral-300 hover:bg-neutral-200 focus-visible:ring-neutral-500',
    ghost: 'btn-ghost text-neutral-700 hover:bg-neutral-100 focus-visible:ring-neutral-500',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500',
    success: 'bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && icon}
    </>
  );

  if (as === 'link') {
    const { to, ...linkProps } = restProps as ButtonAsLink;
    return (
      <Link to={to} className={classes} {...linkProps}>
        {content}
      </Link>
    );
  }

  const { disabled, ...buttonProps } = restProps as ButtonAsButton;
  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      {...buttonProps}
    >
      {content}
    </button>
  );
};

export default Button;