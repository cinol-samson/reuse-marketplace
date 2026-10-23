import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padding = 'md',
  as: Component = 'div',
  className = '',
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  const hoverStyle = hoverable
    ? 'hover:shadow-card-hover hover:border-stone-200 transition-all duration-200 cursor-pointer'
    : '';

  return (
    <Component
      className={`bg-ivory-50 border border-beige-200 rounded-md shadow-card ${paddings[padding]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
