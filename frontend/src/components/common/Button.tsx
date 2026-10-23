import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-clay-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'text-caption px-3 py-1.5 rounded-sm gap-1.5',
    md: 'text-body-sm px-4 py-2 rounded-md gap-2',
    lg: 'text-body px-5 py-2.5 rounded-md gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-clay-300 hover:bg-clay-400 text-ivory border border-clay-400 shadow-paper hover:shadow-card active:translate-y-px',
    secondary:
      'bg-ivory hover:bg-beige-50 text-earth border border-beige-200 shadow-paper hover:border-stone-200 active:translate-y-px',
    quiet:
      'bg-transparent hover:bg-beige-100/60 text-earth-200 hover:text-earth border border-transparent',
    danger:
      'bg-error-light hover:bg-error/15 text-error-text border border-error/30 active:translate-y-px',
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
