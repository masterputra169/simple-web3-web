import React, { memo } from 'react';

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
  outline: 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10',
  ghost: 'text-white/70 hover:text-white hover:bg-white/10',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseStyles = `
    font-semibold rounded-xl transition-all duration-200
    flex items-center justify-center gap-2
    focus:outline-none focus:ring-2 focus:ring-blue-500/50
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default memo(Button);