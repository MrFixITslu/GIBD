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

  const baseClasses = 'btn';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const content = (
    <>
      {loading && (
        <span className="spinner"></span>
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