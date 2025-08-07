import React from 'react';
import { Link } from 'react-router-dom';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section';
  href?: string;
  onClick?: () => void;
  interactive?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  as: Component = 'div',
  href,
  onClick,
  interactive = false,
  elevation = 'md',
  ...props
}) => {
  const baseClasses = 'card bg-surface-elevated border border-neutral-200 overflow-hidden';
  
  const elevationClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const interactiveClasses = interactive || href || onClick 
    ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2' 
    : '';

  const classes = `${baseClasses} ${elevationClasses[elevation]} ${interactiveClasses} ${className}`;

  if (href) {
    return (
      <Link to={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Component 
      className={classes}
      onClick={onClick}
      tabIndex={interactive || onClick ? 0 : undefined}
      role={interactive || onClick ? 'button' : undefined}
      onKeyDown={(e) => {
        if ((interactive || onClick) && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-neutral-200 ${className}`}>
    {children}
  </div>
);

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`p-6 border-t border-neutral-200 bg-neutral-50 ${className}`}>
    {children}
  </div>
);

export interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}

export const CardImage: React.FC<CardImageProps> = ({ 
  src, 
  alt, 
  className = '',
  aspectRatio = 'video'
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]',
  };

  const aspectStyles = {
    square: { aspectRatio: '1 / 1' },
    video: { aspectRatio: '16 / 9' },
    wide: { aspectRatio: '16 / 9' },
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={aspectStyles[aspectRatio]}>
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </div>
  );
};

export default Card;
